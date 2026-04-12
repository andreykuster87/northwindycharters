// src/lib/store/events.ts — MIGRADO PARA SUPABASE
import { supabase } from '../supabase';
import { sendSystemMessage } from './messages';

// ── Tipos ─────────────────────────────────────────────────────────────────────

export type EventStatus = 'pending' | 'approved' | 'rejected' | 'analysis';

export interface NauticEvent {
  id:            string;
  company_id:    string;
  company_name:  string;
  company_phone?: string;
  title:         string;
  description:   string;
  tipo:          string;
  date:          string;
  time:          string;
  local:         string;
  cidade:        string;
  vagas:         number;
  preco?:        number;
  status:        EventStatus;
  reject_reason?: string;
  admin_notes?:  string;
  created_at:    string;
  approved_at?:  string;
  cover_emoji?:  string;
  photos?:       string[];
}

export type JobStatus = 'open' | 'closed' | 'expired';

export interface JobOffer {
  id:             string;
  company_id:     string;
  company_name:   string;
  company_phone?: string;
  title:          string;
  description:    string;
  tipo:           string;
  local:          string;
  cidade:         string;
  contrato:       string;
  regime:         string;
  remuneracao?:   string;
  requisitos:     string;
  contact_email:  string;
  contact_phone?: string;
  status:         JobStatus;
  created_at:     string;
  expires_at?:    string;
}

export interface EventGuest {
  name:  string;
  doc?:  string;
}

export interface EventBooking {
  id:             string;
  booking_number: string;
  event_id:       string;
  event_title:    string;
  event_date:     string;
  event_time:     string;
  event_local:    string;
  event_city?:    string;
  company_id?:    string;
  company_name?:  string;
  client_id?:     string;
  customer_name:  string;
  customer_phone: string;
  tickets:        number;
  total_price:    number;
  guests:         EventGuest[];
  status:         'confirmed' | 'cancelled';
  created_at:     string;
}

// ── Eventos ───────────────────────────────────────────────────────────────────

export async function getEvents(): Promise<NauticEvent[]> {
  const { data, error } = await supabase
    .from('events').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(r => ({ ...r, photos: r.photos ?? [] }));
}

export async function getPublicEvents(): Promise<NauticEvent[]> {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('events').select('*')
    .eq('status', 'approved').gte('date', today)
    .order('date', { ascending: true });
  if (error) throw error;
  return (data ?? []).map(r => ({ ...r, photos: r.photos ?? [] }));
}

export async function getPendingEvents(): Promise<NauticEvent[]> {
  const { data, error } = await supabase
    .from('events').select('*').in('status', ['pending', 'analysis']);
  if (error) throw error;
  return data ?? [];
}

export async function getEventsByCompany(companyId: string): Promise<NauticEvent[]> {
  const { data, error } = await supabase
    .from('events').select('*').eq('company_id', companyId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function saveEvent(
  data: Omit<NauticEvent, 'id' | 'created_at' | 'status'>
): Promise<NauticEvent> {
  const { data: inserted, error } = await supabase
    .from('events').insert({ ...data, status: 'pending' }).select().single();
  if (error) throw error;
  return inserted;
}

export async function updateEvent(id: string, patch: Partial<NauticEvent>): Promise<void> {
  const { error } = await supabase.from('events').update(patch).eq('id', id);
  if (error) throw error;
}

export async function deleteEvent(id: string): Promise<void> {
  const { error } = await supabase.from('events').delete().eq('id', id);
  if (error) throw error;
}

export async function approveEvent(id: string): Promise<void> {
  const { data: ev } = await supabase.from('events').select('*').eq('id', id).single();
  const { error } = await supabase.from('events')
    .update({ status: 'approved', approved_at: new Date().toISOString() }).eq('id', id);
  if (error) throw error;
  if (ev) await sendSystemMessage({
    client_id: ev.company_id, type: 'info',
    title: `✅ Evento Aprovado: ${ev.title}`,
    body:  `O seu evento *${ev.title}* foi aprovado e está agora visível no Mural de Eventos! 🎉\n\n📅 ${ev.date} às ${ev.time}\n📍 ${ev.local}`,
    meta:  {},
  });
}

export async function setEventAnalysis(id: string, notes?: string): Promise<void> {
  const { data: ev } = await supabase.from('events').select('*').eq('id', id).single();
  const { error } = await supabase.from('events')
    .update({ status: 'analysis', admin_notes: notes }).eq('id', id);
  if (error) throw error;
  if (ev) await sendSystemMessage({
    client_id: ev.company_id, type: 'info',
    title: `⏳ Evento em Análise: ${ev.title}`,
    body:  `O seu evento *${ev.title}* está em análise.${notes ? '\n\n💬 Nota: ' + notes : ''}`,
    meta:  {},
  });
}

export async function rejectEvent(id: string, reason: string): Promise<void> {
  const { data: ev } = await supabase.from('events').select('*').eq('id', id).single();
  const { error } = await supabase.from('events')
    .update({ status: 'rejected', reject_reason: reason }).eq('id', id);
  if (error) throw error;
  if (ev) await sendSystemMessage({
    client_id: ev.company_id, type: 'info',
    title: `❌ Evento Reprovado: ${ev.title}`,
    body:  `O seu evento *${ev.title}* não foi aprovado.\n\n📋 Motivo: ${reason}\n\nPode corrigir e reenviar.`,
    meta:  {},
  });
}

// ── Reservas de Eventos ───────────────────────────────────────────────────────

export async function getEventBookings(): Promise<EventBooking[]> {
  const { data, error } = await supabase
    .from('event_bookings').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(r => ({ ...r, guests: r.guests ?? [] }));
}

export async function getEventBookingsByClient(clientId: string): Promise<EventBooking[]> {
  const { data, error } = await supabase
    .from('event_bookings').select('*').eq('client_id', clientId).order('event_date');
  if (error) throw error;
  return (data ?? []).map(r => ({ ...r, guests: r.guests ?? [] }));
}

export async function getEventBookingsByCompany(companyId: string): Promise<EventBooking[]> {
  const { data, error } = await supabase
    .from('event_bookings').select('*').eq('company_id', companyId).order('event_date');
  if (error) throw error;
  return (data ?? []).map(r => ({ ...r, guests: r.guests ?? [] }));
}

export async function getEventBookingsByEventId(eventId: string): Promise<EventBooking[]> {
  const { data, error } = await supabase
    .from('event_bookings').select('*').eq('event_id', eventId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(r => ({ ...r, guests: r.guests ?? [] }));
}

export async function saveEventBooking(
  data: Omit<EventBooking, 'id' | 'booking_number' | 'created_at'>
): Promise<EventBooking> {
  const { data: cnt, error: cntErr } = await supabase.rpc('next_counter', { counter_key: 'event_booking_counter' });
  if (cntErr) throw cntErr;
  const booking_number = `EVT-${String(Number(cnt)).padStart(4, '0')}`;

  const { data: inserted, error } = await supabase
    .from('event_bookings')
    .insert({ ...data, booking_number, guests: data.guests ?? [] })
    .select().single();
  if (error) throw error;
  return inserted;
}

export async function updateEventBookingGuests(bookingId: string, guests: EventGuest[]): Promise<void> {
  const { error } = await supabase.from('event_bookings').update({ guests }).eq('id', bookingId);
  if (error) throw error;
}

// ── Ofertas de Trabalho ───────────────────────────────────────────────────────

export async function getJobs(): Promise<JobOffer[]> {
  const { data, error } = await supabase
    .from('job_offers').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getOpenJobs(): Promise<JobOffer[]> {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('job_offers').select('*')
    .eq('status', 'open')
    .or(`expires_at.is.null,expires_at.gte.${today}`)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getJobsByCompany(companyId: string): Promise<JobOffer[]> {
  const { data, error } = await supabase
    .from('job_offers').select('*').eq('company_id', companyId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function saveJob(
  data: Omit<JobOffer, 'id' | 'created_at' | 'status'>
): Promise<JobOffer> {
  const { data: inserted, error } = await supabase
    .from('job_offers').insert({ ...data, status: 'open' }).select().single();
  if (error) throw error;
  return inserted;
}

export async function updateJob(id: string, patch: Partial<JobOffer>): Promise<void> {
  const { error } = await supabase.from('job_offers').update(patch).eq('id', id);
  if (error) throw error;
}

export async function deleteJob(id: string): Promise<void> {
  const { error } = await supabase.from('job_offers').delete().eq('id', id);
  if (error) throw error;
}