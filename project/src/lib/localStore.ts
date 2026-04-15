// src/lib/localStore.ts — CAMADA DE COMPATIBILIDADE SUPABASE + CACHE
// ─────────────────────────────────────────────────────────────────────────────
// Estratégia: mantém cache em memória sincronizado com o Supabase.
// Os componentes continuam chamando getSailors(), getClients() etc. de forma
// síncrona — leem do cache. O cache é atualizado via refreshAll() e pelas
// funções de escrita (save*, approve*, update*, delete*).
// ─────────────────────────────────────────────────────────────────────────────

import { supabase } from './supabase';

// ── Re-exporta tipos ──────────────────────────────────────────────────────────
export type {
  DocTypeValue, DocInfo,
  Sailor, Client, Boat, Trip, TripScheduleEntry,
  Booking, BookingGuest,
  Message, MessageType,
} from './store/core';

export { DOC_TYPES, formatProfileNumber, resolveDocUrl } from './store/core';

// ── Tipos locais ──────────────────────────────────────────────────────────────
export interface DuplicateCheckResult {
  field:   'email' | 'phone' | 'document';
  message: string;
}

import type {
  Sailor, Client, Boat, Trip, Booking, BookingGuest, Message,
} from './store/core';
import type { Company }      from './store/companies';
import type { NauticEvent, JobOffer, EventBooking, EventGuest } from './store/events';
import type { SailorApplication } from './store/sailor-applications';

export type { SailorApplication } from './store/sailor-applications';
export { APP_REJECT_REASONS, FUNCOES_MARITIMAS } from './store/sailor-applications';
export type { NauticEvent, JobOffer, EventBooking, EventGuest } from './store/events';

// ── Cache em memória ──────────────────────────────────────────────────────────
const cache = {
  sailors:            [] as Sailor[],
  clients:            [] as Client[],
  companies:          [] as Company[],
  boats:              [] as Boat[],
  trips:              [] as Trip[],
  bookings:           [] as Booking[],
  messages:           {} as Record<string, Message[]>,
  events:             [] as NauticEvent[],
  jobs:               [] as JobOffer[],
  eventBookings:      [] as EventBooking[],
  sailorApplications: [] as SailorApplication[],
};

let _initialized = false;

/** Verdadeiro logo que o primeiro refreshAll() termina. */
export function isInitialized() { return _initialized; }

// ── Inicialização / Refresh ───────────────────────────────────────────────────
export async function refreshAll(): Promise<void> {
  try {
    // Todas as 10 queries correm em paralelo — um único round-trip HTTP/2
    const results = await Promise.allSettled([
      supabase.from('sailors').select('*').order('created_at', { ascending: false }).limit(500),
      supabase.from('clients').select('*').order('created_at', { ascending: false }).limit(1000),
      supabase.from('companies').select('*').order('created_at', { ascending: false }).limit(500),
      supabase.from('boats').select('*').order('created_at', { ascending: false }).limit(500),
      supabase.from('trips').select('*').order('created_at', { ascending: false }).limit(500),
      // Sem JOIN: apenas campos essenciais de bookings para não duplicar trip data
      supabase.from('bookings').select('id,booking_number,trip_id,sailor_id,client_id,customer_name,customer_phone,booking_date,time_slot,passengers,notes,total_price,status,guests,guests_obs,created_at,cancelled_at').order('created_at', { ascending: false }).limit(1000),
      supabase.from('events').select('*').order('created_at', { ascending: false }).limit(300),
      supabase.from('job_offers').select('*').order('created_at', { ascending: false }).limit(300),
      supabase.from('event_bookings').select('*').order('created_at', { ascending: false }).limit(500),
      // sailor_applications agora em paralelo com as demais (antes era sequencial — +1 round trip)
      supabase.from('sailor_applications').select('*').order('created_at', { ascending: false }).limit(500),
    ]);

    const get = (i: number) => results[i].status === 'fulfilled' ? (results[i] as any).value.data ?? [] : [];

    cache.sailors       = get(0).map((r: any) => mapSailor(r));

    // ── Heal legado: promoções antigas criavam sailor com UUID/profile_number novos ──
    // Cruzamos sailors e clients por email para detectar e corrigir dois problemas:
    //   1. client.role não marcado como 'converted_to_sailor'
    //   2. sailor.profile_number diferente do client.profile_number original
    // Ambas as correcções são aplicadas em memória (imediato) e persistidas no Supabase (background).

    // Mapa email → { sailor_id, sailor_profile_number }
    const sailorByEmail = new Map(
      cache.sailors.map(s => [s.email.toLowerCase(), { id: s.id, profile_number: s.profile_number }])
    );
    // Mapa email → client_profile_number (para corrigir o sailor)
    const rawClients: any[] = get(1);
    const clientProfileByEmail = new Map(
      rawClients.map((c: any) => [c.email?.toLowerCase(), c.profile_number])
    );

    // 1. Corrigir clients legados (role não actualizado)
    const staleClientIds: string[] = [];
    cache.clients = rawClients.map((c: any) => {
      if (c.role !== 'converted_to_sailor' && sailorByEmail.has(c.email?.toLowerCase())) {
        staleClientIds.push(c.id);
        return { ...c, role: 'converted_to_sailor' };
      }
      return c;
    });
    if (staleClientIds.length > 0) {
      supabase.from('clients')
        .update({ role: 'converted_to_sailor' })
        .in('id', staleClientIds)
        .then(() => {});
    }

    // 2. Corrigir sailors legados (profile_number diferente do client original)
    const staleSailorFixes: { id: string; profile_number: string }[] = [];
    cache.sailors = cache.sailors.map(s => {
      const clientProfileNum = clientProfileByEmail.get(s.email.toLowerCase());
      if (clientProfileNum && clientProfileNum !== s.profile_number) {
        staleSailorFixes.push({ id: s.id, profile_number: clientProfileNum });
        return { ...s, profile_number: clientProfileNum };
      }
      return s;
    });
    if (staleSailorFixes.length > 0) {
      staleSailorFixes.forEach(fix => {
        supabase.from('sailors')
          .update({ profile_number: fix.profile_number })
          .eq('id', fix.id)
          .then(() => {});
      });
    }

    cache.companies     = get(2);
    cache.boats         = get(3).map((r: any) => ({ ...r, photos: r.photos ?? [], crew: r.crew ?? [] }));
    cache.trips         = get(4).map((r: any) => ({ ...r, photos: r.photos ?? [], schedule: r.schedule ?? [] }));
    // JOIN removido da query — enriquece bookings com trip do cache (sem transferência duplicada)
    const tripsById = Object.fromEntries(cache.trips.map(t => [t.id, t]));
    cache.bookings      = get(5).map((r: any) => ({ ...r, guests: r.guests ?? [], trip: tripsById[r.trip_id] ?? null }));
    cache.events        = get(6).map((r: any) => ({ ...r, photos: r.photos ?? [] }));
    cache.jobs          = get(7);
    cache.eventBookings = get(8).map((r: any) => ({ ...r, guests: r.guests ?? [] }));
    cache.sailorApplications = get(9).map((r: any) => ({
      ...r,
      funcoes:        r.funcoes        ?? [],
      stcw:           r.stcw           ?? {},
      stcw_validades: r.stcw_validades ?? {},
      experiencias:   r.experiencias   ?? [],
      idiomas:        r.idiomas        ?? [],
      reject_reason:  r.reject_reason  ?? [],
    }));

    _initialized = true;
  } catch (err) {
    console.error('[NorthWindy] refreshAll error:', err);
    _initialized = true;
  }
}

export async function refreshMessages(clientId: string): Promise<void> {
  const { data } = await supabase
    .from('messages').select('*').eq('client_id', clientId)
    .order('created_at', { ascending: false });
  cache.messages[clientId] = (data ?? []).map(r => ({ ...r, meta: r.meta ?? {} }));
}

// ── Mapper sailor row → Sailor ────────────────────────────────────────────────
function mapSailor(r: any): Sailor {
  return {
    id: r.id, profile_number: r.profile_number, name: r.name, phone: r.phone,
    email: r.email, language: r.language ?? 'pt', timezone: r.timezone ?? 'Europe/Lisbon',
    nacionalidade: r.nacionalidade, birth_date: r.birth_date, cpf_nif: r.cpf_nif,
    rg_doc: r.rg_doc, passaporte_num: r.passaporte_num, endereco: r.endereco,
    funcao: r.funcao, funcao_outro: r.funcao_outro,
    passaporte: { numero: r.passaporte_numero, tipo: r.passaporte_tipo,
      emissao: r.passaporte_emissao, validade: r.passaporte_validade,
      doc_url: r.passaporte_doc_url, doc_back_url: r.passaporte_doc_back_url },
    cartahabitacao: { numero: r.cartahabitacao_numero, tipo: r.cartahabitacao_tipo,
      emissao: r.cartahabitacao_emissao, validade: r.cartahabitacao_validade,
      doc_url: r.cartahabitacao_doc_url, doc_back_url: r.cartahabitacao_doc_back_url },
    caderneta_maritima: { possui: r.caderneta_possui ?? false, numero: r.caderneta_numero, validade: r.caderneta_validade, doc_url: r.caderneta_doc_url, doc_back_url: r.caderneta_doc_back_url },
    comprovante_endereco_url: r.comprovante_endereco_url,
    stcw: r.stcw ?? {}, stcw_validades: r.stcw_validades ?? {},
    medico: { numero: r.medico_numero, emissao: r.medico_emissao, validade: r.medico_validade, doc_url: r.medico_doc_url },
    experiencia_embarcado: r.experiencia_embarcado, experiencias: r.experiencias ?? [],
    cursos_relevantes: r.cursos_relevantes, possui_offshore: r.possui_offshore,
    idiomas: r.idiomas ?? [], idioma_nivel: r.idioma_nivel, idioma_outro: r.idioma_outro,
    disponivel_imediato: r.disponivel_imediato, disponivel_internacional: r.disponivel_internacional,
    tempo_embarque: r.tempo_embarque, restricao_medica: r.restricao_medica,
    outras_informacoes: r.outras_informacoes, declaracao_data: r.declaracao_data,
    aceitou_termos: r.aceitou_termos, declarou_verdadeira: r.declarou_verdadeira, status: r.status, verified: r.verified,
    verified_at: r.verified_at, blocked: r.blocked, block_reason: r.block_reason,
    created_at: r.created_at, profile_photo: r.profile_photo ?? null,
    username: r.username ?? undefined,
    pending_docs: r.pending_docs ?? null,
    album: r.album ?? [],
    disponibilidade: r.disponibilidade ?? [],
  };
}

// Converte dd/mm/yyyy → yyyy-mm-dd para o Supabase (tipo date). Retorna null se inválido.
function toIsoDate(v?: string | null): string | null {
  if (!v) return null;
  const parts = v.split('/');
  if (parts.length === 3 && parts[2].length === 4) return `${parts[2]}-${parts[1]}-${parts[0]}`;
  if (/^\d{4}-\d{2}-\d{2}/.test(v)) return v.slice(0, 10); // já ISO
  return null;
}

function sailorToRow(data: Partial<Sailor>): any {
  const row: any = { ...data };
  if (data.passaporte) {
    row.passaporte_numero = data.passaporte.numero || null;
    row.passaporte_tipo = data.passaporte.tipo ?? null;
    row.passaporte_emissao = toIsoDate(data.passaporte.emissao);
    row.passaporte_validade = toIsoDate(data.passaporte.validade);
    row.passaporte_doc_url = data.passaporte.doc_url ?? null;
    row.passaporte_doc_back_url = data.passaporte.doc_back_url ?? null;
    delete row.passaporte;
  }
  if (data.cartahabitacao) {
    row.cartahabitacao_numero = data.cartahabitacao.numero || null;
    row.cartahabitacao_tipo = data.cartahabitacao.tipo ?? null;
    row.cartahabitacao_emissao = toIsoDate(data.cartahabitacao.emissao);
    row.cartahabitacao_validade = toIsoDate(data.cartahabitacao.validade);
    row.cartahabitacao_doc_url = data.cartahabitacao.doc_url ?? null;
    row.cartahabitacao_doc_back_url = data.cartahabitacao.doc_back_url ?? null;
    delete row.cartahabitacao;
  }
  if (data.medico) {
    row.medico_numero   = data.medico.numero   ?? null;
    row.medico_emissao  = toIsoDate(data.medico.emissao);
    row.medico_validade = toIsoDate(data.medico.validade);
    row.medico_doc_url  = data.medico.doc_url  ?? null;
    delete row.medico;
  }
  if (data.caderneta_maritima) {
    row.caderneta_possui = data.caderneta_maritima.possui;
    row.caderneta_numero = data.caderneta_maritima.numero || null;
    row.caderneta_validade = toIsoDate((data.caderneta_maritima as any).validade);
    row.caderneta_doc_url = (data.caderneta_maritima as any).doc_url ?? null;
    row.caderneta_doc_back_url = (data.caderneta_maritima as any).doc_back_url ?? null;
    delete row.caderneta_maritima;
  }
  if (data.birth_date) row.birth_date = toIsoDate(data.birth_date);
  delete row.id;
  return row;
}

// ═══════════════════════════════════════════════════════════════════════════════
// LEITURAS SÍNCRONAS — leem do cache
// ═══════════════════════════════════════════════════════════════════════════════

export function getSailors(sailorId?: string): Sailor[] {
  return sailorId ? cache.sailors.filter(s => s.id === sailorId) : cache.sailors;
}
export function getClients(): Client[] { return cache.clients; }
export function getCompanies(): Company[] { return cache.companies; }
export function getBoats(sailorId?: string): Boat[] {
  const all = cache.boats.filter(b => b.status === 'active');
  return sailorId ? all.filter(b => b.sailor_id === sailorId) : all;
}
export function getAllBoats(sailorId?: string): Boat[] {
  return sailorId ? cache.boats.filter(b => b.sailor_id === sailorId) : cache.boats;
}
export function getPendingBoats(): Boat[] { return cache.boats.filter(b => b.status === 'pending'); }
export function getTrips(sailorId?: string): Trip[] {
  const all = cache.trips.filter(t => t.status === 'active');
  return sailorId ? all.filter(t => t.sailor_id === sailorId) : all;
}
export function getAllTrips(sailorId?: string): Trip[] {
  return sailorId ? cache.trips.filter(t => t.sailor_id === sailorId) : cache.trips;
}
export function getBookings(sailorId?: string, clientId?: string): Booking[] {
  let list = cache.bookings;
  if (sailorId) list = list.filter(b => b.sailor_id === sailorId);
  if (clientId) list = list.filter(b => b.client_id === clientId);
  return list;
}
export function getMessages(clientId: string): Message[] {
  return cache.messages[clientId] ?? [];
}
export function getAllMessages(): Message[] {
  return Object.values(cache.messages).flat();
}
export function getEvents(): NauticEvent[] { return cache.events; }
export function getPublicEvents(): NauticEvent[] {
  const today = new Date().toISOString().split('T')[0];
  return cache.events.filter(e => e.status === 'approved' && e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));
}
export function getPendingEvents(): NauticEvent[] {
  return cache.events.filter(e => e.status === 'pending' || e.status === 'analysis');
}
export function getEventsByCompany(companyId: string): NauticEvent[] {
  return cache.events.filter(e => e.company_id === companyId);
}
export function getJobs(): JobOffer[] { return cache.jobs; }
export function getOpenJobs(): JobOffer[] {
  const today = new Date().toISOString().split('T')[0];
  return cache.jobs.filter(j => j.status === 'open' && (!j.expires_at || j.expires_at >= today));
}
export function getJobsByCompany(companyId: string): JobOffer[] {
  return cache.jobs.filter(j => j.company_id === companyId);
}
export function getEventBookings(): EventBooking[] { return cache.eventBookings; }
export function getEventBookingsByClient(clientId: string): EventBooking[] {
  return cache.eventBookings.filter(b => b.client_id === clientId);
}
export function getEventBookingsByCompany(companyId: string): EventBooking[] {
  return cache.eventBookings.filter(b => b.company_id === companyId);
}
export function getEventBookingsByEventId(eventId: string): EventBooking[] {
  return cache.eventBookings.filter(b => b.event_id === eventId);
}
export function getPendingCompanies(): Company[] {
  return cache.companies.filter(c => c.status === 'pending');
}

// ═══════════════════════════════════════════════════════════════════════════════
// ESCRITAS ASSÍNCRONAS — gravam no Supabase e atualizam cache
// ═══════════════════════════════════════════════════════════════════════════════

// ── Sailors ───────────────────────────────────────────────────────────────────
export async function saveSailor(
  data: Omit<Sailor, 'id' | 'profile_number' | 'created_at' | 'status' | 'verified'>
): Promise<Sailor> {
  const { data: cnt } = await supabase.rpc('next_counter', { counter_key: 'profile_counter' });
  const row = { ...sailorToRow(data as any), profile_number: String(cnt).padStart(5, '0'), status: 'pending', verified: false };
  const { data: r, error } = await supabase.from('sailors').insert(row).select().single();
  if (error) {
    if (error.code === '23505') throw new Error(error.message.includes('email') ? 'DUPLICATE_EMAIL' : 'DUPLICATE_DOCUMENT');
    throw error;
  }
  const sailor = mapSailor(r);
  cache.sailors = [sailor, ...cache.sailors];
  return sailor;
}

export async function approveSailor(id: string): Promise<Sailor[]> {
  const patch = { status: 'approved', verified: true, verified_at: new Date().toISOString() };
  const { error } = await supabase.from('sailors').update(patch).eq('id', id);
  if (error) throw error;
  cache.sailors = cache.sailors.map(s => s.id === id ? { ...s, ...patch } : s);
  return cache.sailors;
}

export async function updateSailor(id: string, patch: Partial<Sailor>): Promise<Sailor[]> {
  const { error } = await supabase.from('sailors').update(sailorToRow(patch)).eq('id', id);
  if (error) throw error;
  cache.sailors = cache.sailors.map(s => s.id === id ? { ...s, ...patch } : s);
  return cache.sailors;
}

export async function deleteSailor(id: string): Promise<void> {
  await supabase.from('sailors').delete().eq('id', id);
  cache.sailors = cache.sailors.filter(s => s.id !== id);
}

export function sailorLogin(login: string, password: string): Sailor | null {
  return cache.sailors.find(s =>
    s.status === 'approved' && s.verified &&
    (s as any).sailor_login === login && (s as any).sailor_password === password
  ) ?? null;
}

// ── Clients ───────────────────────────────────────────────────────────────────
export async function saveClient(
  data: Omit<Client, 'id' | 'profile_number' | 'created_at' | 'status' | 'role'>
): Promise<Client> {
  const { data: cnt } = await supabase.rpc('next_counter', { counter_key: 'profile_counter' });
  const { data: r, error } = await supabase.from('clients').insert({
    ...data, profile_number: String(cnt).padStart(5, '0'), status: 'pending_verification', role: 'client',
  }).select().single();
  if (error) {
    if (error.code === '23505') throw new Error(error.message.includes('email') ? 'DUPLICATE_EMAIL' : 'DUPLICATE_DOCUMENT');
    throw error;
  }
  cache.clients = [r, ...cache.clients];
  return r;
}

export async function approveClient(id: string): Promise<Client[]> {
  await supabase.from('clients').update({ status: 'active' }).eq('id', id);
  cache.clients = cache.clients.map(c => c.id === id ? { ...c, status: 'active' as const } : c);
  return cache.clients;
}

export async function updateClient(id: string, patch: Partial<Client>): Promise<Client[]> {
  await supabase.from('clients').update(patch).eq('id', id);
  cache.clients = cache.clients.map(c => c.id === id ? { ...c, ...patch } : c);
  return cache.clients;
}

export async function deleteClient(id: string): Promise<void> {
  await supabase.from('messages').delete().eq('client_id', id);
  await supabase.from('clients').delete().eq('id', id);
  cache.clients = cache.clients.filter(c => c.id !== id);
  delete cache.messages[id];
}

// ── Companies ─────────────────────────────────────────────────────────────────
export async function saveCompany(
  data: Omit<Company, 'id' | 'profile_number' | 'created_at' | 'updated_at'>
): Promise<Company> {
  const { data: cnt } = await supabase.rpc('next_counter', { counter_key: 'profile_counter' });
  const profile_number = `EMP-${String(Number(cnt)).padStart(5, '0')}`;
  const { data: r, error } = await supabase.from('companies').insert({ ...data, profile_number }).select().single();
  if (error) throw error;
  cache.companies = [r, ...cache.companies];
  return r;
}

export async function approveCompany(id: string): Promise<void> {
  const company = cache.companies.find(c => c.id === id);
  if (!company) return;
  const seq = parseInt(company.profile_number.replace('EMP-', ''), 10) || 1;
  const loginSlug = company.nome_fantasia.split(' ')[0].toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
  const login = `${loginSlug}#${seq}`;
  const password = Math.random().toString(36).substring(2, 8).toUpperCase();
  const patch = { status: 'active' as const, company_login: login, company_password: password };
  await supabase.from('companies').update(patch).eq('id', id);
  cache.companies = cache.companies.map(c => c.id === id ? { ...c, ...patch } : c);
}

export async function rejectCompany(id: string): Promise<void> {
  await supabase.from('companies').delete().eq('id', id);
  cache.companies = cache.companies.filter(c => c.id !== id);
}

export async function updateCompany(id: string, patch: Partial<Company>): Promise<void> {
  await supabase.from('companies').update(patch).eq('id', id);
  cache.companies = cache.companies.map(c => c.id === id ? { ...c, ...patch } : c);
}

export async function deleteCompany(id: string): Promise<void> {
  await supabase.from('companies').delete().eq('id', id);
  cache.companies = cache.companies.filter(c => c.id !== id);
}

export function companyLogin(loginInput: string, password: string): { ok: true; company: Company } | { ok: false; reason: string } {
  const input = loginInput.trim().toLowerCase();
  const found = cache.companies.find(c =>
    (c.company_login ?? '').toLowerCase() === input ||
    (c.email ?? '').toLowerCase() === input
  );
  if (!found)                       return { ok: false, reason: 'not_found' };
  if (found.blocked)                return { ok: false, reason: 'blocked' };
  if (found.status !== 'active')    return { ok: false, reason: 'not_active' };
  if (found.company_password !== password) return { ok: false, reason: 'wrong_password' };
  return { ok: true, company: found };
}

// ── Boats ─────────────────────────────────────────────────────────────────────
export async function saveBoat(data: Omit<Boat, 'id' | 'created_at'>): Promise<Boat> {
  const { data: r, error } = await supabase.from('boats').insert(data).select().single();
  if (error) throw error;
  const boat = { ...r, photos: r.photos ?? [], crew: r.crew ?? [] };
  cache.boats = [boat, ...cache.boats];
  return boat;
}

export async function updateBoat(id: string, patch: Partial<Boat>): Promise<Boat[]> {
  await supabase.from('boats').update(patch).eq('id', id);
  cache.boats = cache.boats.map(b => b.id === id ? { ...b, ...patch } : b);
  return cache.boats;
}

export async function approveBoat(id: string): Promise<Boat[]> {
  const count = cache.boats.filter(b => b.status === 'active').length;
  const boat_number = `E${count + 1}`;
  const patch = { status: 'active', boat_number, docs_metadata: { docs_verified: true, docs_verified_at: new Date().toISOString() } };
  await supabase.from('boats').update(patch).eq('id', id);
  cache.boats = cache.boats.map(b => b.id === id ? { ...b, ...patch } : b);
  const boat = cache.boats.find(b => b.id === id);
  if (boat?.sailor_id) await sendSystemMessage({ client_id: boat.sailor_id, type: 'info',
    title: `✅ Embarcação Aprovada — ${boat.name}`,
    body: `A sua embarcação *${boat.name}* foi aprovada! Número de frota: *${boat_number}*`, meta: {} });
  return cache.boats;
}

export async function rejectBoat(id: string, reason?: string): Promise<Boat[]> {
  await supabase.from('boats').update({ status: 'rejected' }).eq('id', id);
  const boat = cache.boats.find(b => b.id === id);
  cache.boats = cache.boats.map(b => b.id === id ? { ...b, status: 'rejected' } : b);
  if (boat?.sailor_id) await sendSystemMessage({ client_id: boat.sailor_id, type: 'info',
    title: `❌ Embarcação Reprovada — ${boat.name}`,
    body: `A sua embarcação *${boat.name}* não foi aprovada.${reason ? '\n📋 Motivo: ' + reason : ''}`, meta: {} });
  return cache.boats;
}

export async function deleteBoat(id: string): Promise<void> {
  await supabase.from('boats').delete().eq('id', id);
  cache.boats = cache.boats.filter(b => b.id !== id);
}

// ── Trips ─────────────────────────────────────────────────────────────────────
export async function saveTrip(data: Omit<Trip, 'id' | 'created_at'>): Promise<Trip> {
  const { data: r, error } = await supabase.from('trips').insert(data).select().single();
  if (error) throw error;
  const trip = { ...r, photos: r.photos ?? [], schedule: r.schedule ?? [] };
  cache.trips = [trip, ...cache.trips];
  return trip;
}

export async function updateTrip(id: string, patch: Partial<Trip>): Promise<Trip[]> {
  await supabase.from('trips').update(patch).eq('id', id);
  cache.trips = cache.trips.map(t => t.id === id ? { ...t, ...patch } : t);
  return cache.trips;
}

export async function cancelTrip(id: string): Promise<void> {
  await supabase.from('trips').update({ status: 'cancelled' }).eq('id', id);
  cache.trips = cache.trips.map(t => t.id === id ? { ...t, status: 'cancelled' } : t);
}

export async function deleteTrip(id: string): Promise<void> {
  await supabase.from('trips').delete().eq('id', id);
  cache.trips = cache.trips.filter(t => t.id !== id);
}

// ── Bookings ──────────────────────────────────────────────────────────────────
export async function saveBooking(
  data: Omit<Booking, 'id' | 'booking_number' | 'created_at' | 'trip'>
): Promise<Booking> {
  const { data: cnt } = await supabase.rpc('next_counter', { counter_key: 'booking_counter' });
  const { data: r, error } = await supabase.from('bookings')
    .insert({ ...data, booking_number: Number(cnt), guests: data.guests ?? [] }).select().single();
  if (error) throw error;

  // Fetch with trip join so b.trip is available immediately
  const { data: withTrip } = await supabase
    .from('bookings').select('*, trip:trips(*)').eq('id', r.id).single();
  const booking = { ...(withTrip || r), guests: (withTrip || r).guests ?? [] };
  cache.bookings = [booking, ...cache.bookings];
  return booking;
}

export async function updateBookingGuests(id: string, guests: BookingGuest[], obs?: string): Promise<void> {
  await supabase.from('bookings').update({ guests, guests_obs: obs || '', status: 'pending' }).eq('id', id);
  cache.bookings = cache.bookings.map(b => b.id === id ? { ...b, guests, guests_obs: obs || '', status: 'pending' } : b);
}

export async function updateBookingStatus(id: string, status: string): Promise<void> {
  const patch: any = { status };
  if (status === 'cancelado' || status === 'cancelled') patch.cancelled_at = new Date().toISOString();
  await supabase.from('bookings').update(patch).eq('id', id);
  cache.bookings = cache.bookings.map(b => b.id === id ? { ...b, ...patch } : b);
}

export async function deleteBooking(id: string): Promise<void> {
  await supabase.from('bookings').delete().eq('id', id);
  cache.bookings = cache.bookings.filter(b => b.id !== id);
}

// ── Messages ──────────────────────────────────────────────────────────────────
export async function sendSystemMessage(msg: Omit<Message, 'id' | 'created_at' | 'read'>): Promise<Message> {
  const { data: r, error } = await supabase.from('messages').insert({ ...msg, read: false }).select().single();
  if (error) throw error;
  if (!cache.messages[msg.client_id]) cache.messages[msg.client_id] = [];
  cache.messages[msg.client_id] = [r, ...cache.messages[msg.client_id]];
  return r;
}

export async function markMessageRead(id: string): Promise<void> {
  await supabase.from('messages').update({ read: true }).eq('id', id);
  for (const key of Object.keys(cache.messages)) {
    cache.messages[key] = cache.messages[key].map(m => m.id === id ? { ...m, read: true } : m);
  }
}

export async function markAllMessagesRead(clientId: string): Promise<void> {
  await supabase.from('messages').update({ read: true }).eq('client_id', clientId);
  cache.messages[clientId] = (cache.messages[clientId] ?? []).map(m => ({ ...m, read: true }));
}

export function countUnreadMessages(clientId: string): number {
  return (cache.messages[clientId] ?? []).filter(m => !m.read).length;
}

export async function notifyBookingStatusChange(opts: {
  clientId: string; bookingId: string; tripName: string;
  bookingDate: string; timeSlot?: string; passengers: number; newStatus: string;
}): Promise<void> {
  const { clientId, bookingId, tripName, bookingDate, timeSlot, passengers, newStatus } = opts;
  const meta = { booking_id: bookingId, trip_name: tripName, booking_date: bookingDate, time_slot: timeSlot, passengers };
  const d = new Date(bookingDate + 'T12:00').toLocaleDateString('pt-BR');
  const map: Record<string, any> = {
    confirmed: { type: 'booking_confirmed', title: '✅ Reserva Confirmada!',
      body: `A sua reserva para *${tripName}* no dia ${d}${timeSlot ? ' às ' + timeSlot : ''} foi confirmada. ⛵` },
    pending:   { type: 'booking_pending',   title: '⏳ Reserva em Análise',
      body: `A sua reserva para *${tripName}* está aguardando confirmação.` },
    cancelado: { type: 'booking_cancelled', title: '❌ Reserva Cancelada',
      body: `A sua reserva para *${tripName}* no dia ${d} foi cancelada.` },
    cancelled: { type: 'booking_cancelled', title: '❌ Reserva Cancelada',
      body: `A sua reserva para *${tripName}* no dia ${d} foi cancelada.` },
    completed: { type: 'booking_completed', title: '🌊 Passeio Concluído!',
      body: `Obrigado por navegar connosco em *${tripName}*! ⚓` },
    concluido: { type: 'booking_completed', title: '🌊 Passeio Concluído!',
      body: `Obrigado por navegar connosco em *${tripName}*! ⚓` },
  };
  const template = map[newStatus];
  if (!template || !clientId) return;
  await sendSystemMessage({ client_id: clientId, ...template, meta });
}

// ── Profiles ──────────────────────────────────────────────────────────────────
export async function blockProfile(id: string, role: 'sailor' | 'client', reason: string): Promise<void> {
  const table = role === 'sailor' ? 'sailors' : 'clients';
  await supabase.from(table).update({ blocked: true, block_reason: reason }).eq('id', id);
  if (role === 'sailor') cache.sailors = cache.sailors.map(s => s.id === id ? { ...s, blocked: true, block_reason: reason } : s);
  else cache.clients = cache.clients.map(c => c.id === id ? { ...c, blocked: true, block_reason: reason } : c);
  await sendSystemMessage({ client_id: id, type: 'account_blocked',
    title: '🚫 Conta Temporariamente Bloqueada',
    body: `A sua conta foi bloqueada: ${reason}. Regularize a documentação e contacte o suporte.`, meta: {} });
}

export async function unblockProfile(id: string, role: 'sailor' | 'client'): Promise<void> {
  const table = role === 'sailor' ? 'sailors' : 'clients';
  await supabase.from(table).update({ blocked: false, block_reason: null }).eq('id', id);
  if (role === 'sailor') cache.sailors = cache.sailors.map(s => s.id === id ? { ...s, blocked: false, block_reason: undefined } : s);
  else cache.clients = cache.clients.map(c => c.id === id ? { ...c, blocked: false, block_reason: undefined } : c);
  await sendSystemMessage({ client_id: id, type: 'account_unblocked',
    title: '✅ Conta Reactivada',
    body: 'A sua conta foi reactivada. Pode voltar a realizar reservas normalmente. ⛵', meta: {} });
}

export async function sendWelcomeMessage(id: string, name: string, role: 'sailor' | 'client'): Promise<void> {
  await sendSystemMessage({ client_id: id, type: 'welcome',
    title: `👋 Bem-vindo(a) à NorthWindy, ${name.split(' ')[0]}!`,
    body: role === 'sailor'
      ? 'A sua candidatura foi aprovada! Já pode criar passeios e receber reservas. ⚓'
      : 'A sua conta foi verificada. Explore os passeios disponíveis. ⛵',
    meta: {} });
}

// ── Events ────────────────────────────────────────────────────────────────────
export async function saveEvent(data: Omit<NauticEvent, 'id' | 'created_at' | 'status'>): Promise<NauticEvent> {
  const { data: r, error } = await supabase.from('events').insert({ ...data, status: 'pending' }).select().single();
  if (error) throw error;
  cache.events = [r, ...cache.events];
  return r;
}

export async function updateEvent(id: string, patch: Partial<NauticEvent>): Promise<void> {
  await supabase.from('events').update(patch).eq('id', id);
  cache.events = cache.events.map(e => e.id === id ? { ...e, ...patch } : e);
}

export async function deleteEvent(id: string): Promise<void> {
  await supabase.from('events').delete().eq('id', id);
  cache.events = cache.events.filter(e => e.id !== id);
}

export async function approveEvent(id: string): Promise<void> {
  const ev = cache.events.find(e => e.id === id);
  const patch = { status: 'approved' as const, approved_at: new Date().toISOString() };
  await supabase.from('events').update(patch).eq('id', id);
  cache.events = cache.events.map(e => e.id === id ? { ...e, ...patch } : e);
  if (ev) await sendSystemMessage({ client_id: ev.company_id, type: 'info',
    title: `✅ Evento Aprovado: ${ev.title}`,
    body: `O seu evento *${ev.title}* foi aprovado e está visível no Mural! 🎉`, meta: {} });
}

export async function setEventAnalysis(id: string, notes?: string): Promise<void> {
  const ev = cache.events.find(e => e.id === id);
  await supabase.from('events').update({ status: 'analysis', admin_notes: notes }).eq('id', id);
  cache.events = cache.events.map(e => e.id === id ? { ...e, status: 'analysis' as const, admin_notes: notes } : e);
  if (ev) await sendSystemMessage({ client_id: ev.company_id, type: 'info',
    title: `⏳ Evento em Análise: ${ev.title}`,
    body: `O seu evento está em análise.${notes ? '\n💬 ' + notes : ''}`, meta: {} });
}

export async function rejectEvent(id: string, reason: string): Promise<void> {
  const ev = cache.events.find(e => e.id === id);
  await supabase.from('events').update({ status: 'rejected', reject_reason: reason }).eq('id', id);
  cache.events = cache.events.map(e => e.id === id ? { ...e, status: 'rejected' as const, reject_reason: reason } : e);
  if (ev) await sendSystemMessage({ client_id: ev.company_id, type: 'info',
    title: `❌ Evento Reprovado: ${ev.title}`,
    body: `O seu evento não foi aprovado.\n📋 Motivo: ${reason}`, meta: {} });
}

export async function saveEventBooking(
  data: Omit<EventBooking, 'id' | 'booking_number' | 'created_at'>
): Promise<EventBooking> {
  const { data: cnt } = await supabase.rpc('next_counter', { counter_key: 'event_booking_counter' });
  const booking_number = `EVT-${String(Number(cnt)).padStart(4, '0')}`;
  const { data: r, error } = await supabase.from('event_bookings')
    .insert({ ...data, booking_number, guests: data.guests ?? [] }).select().single();
  if (error) throw error;
  cache.eventBookings = [r, ...cache.eventBookings];
  return r;
}

export async function updateEventBookingGuests(bookingId: string, guests: EventGuest[]): Promise<void> {
  await supabase.from('event_bookings').update({ guests }).eq('id', bookingId);
  cache.eventBookings = cache.eventBookings.map(b => b.id === bookingId ? { ...b, guests } : b);
}

// ── Jobs ──────────────────────────────────────────────────────────────────────
export async function saveJob(data: Omit<JobOffer, 'id' | 'created_at' | 'status'>): Promise<JobOffer> {
  const { data: r, error } = await supabase.from('job_offers').insert({ ...data, status: 'open' }).select().single();
  if (error) throw error;
  cache.jobs = [r, ...cache.jobs];
  return r;
}

export async function updateJob(id: string, patch: Partial<JobOffer>): Promise<void> {
  await supabase.from('job_offers').update(patch).eq('id', id);
  cache.jobs = cache.jobs.map(j => j.id === id ? { ...j, ...patch } : j);
}

export async function deleteJob(id: string): Promise<void> {
  await supabase.from('job_offers').delete().eq('id', id);
  cache.jobs = cache.jobs.filter(j => j.id !== id);
}

// ── Sailor Applications ────────────────────────────────────────────────────────

export function getSailorApplications(status?: string): SailorApplication[] {
  return status
    ? cache.sailorApplications.filter(a => a.status === status)
    : cache.sailorApplications;
}

export function getSailorApplicationsByClient(clientId: string): SailorApplication[] {
  return cache.sailorApplications.filter(a => a.client_id === clientId);
}

export async function saveSailorApplication(
  data: Omit<SailorApplication, 'id' | 'created_at' | 'status' | 'reject_reason' | 'approved_at' | 'approved_by'>
): Promise<SailorApplication> {
  const { data: r, error } = await supabase
    .from('sailor_applications')
    .insert({ ...data, status: 'pending' })
    .select()
    .single();
  if (error) throw error;
  const app: SailorApplication = {
    ...r,
    funcoes:      r.funcoes ?? [],
    stcw:         r.stcw ?? {},
    stcw_validades: r.stcw_validades ?? {},
    experiencias: r.experiencias ?? [],
    idiomas:      r.idiomas ?? [],
    reject_reason: r.reject_reason ?? [],
  };
  cache.sailorApplications = [app, ...cache.sailorApplications];
  return app;
}

export async function approveSailorApplication(
  applicationId: string
): Promise<{ sailor: Sailor; login: string; password: string }> {
  const app = cache.sailorApplications.find(a => a.id === applicationId);
  if (!app) throw new Error('Application not found');

  // 1. Buscar o client original para reutilizar id e profile_number
  const client = cache.clients.find(c => c.id === app.client_id);
  if (!client) throw new Error('Client not found — cannot transform profile');

  // Usa o profile_number do client (não gera um novo)
  const profileNum = client.profile_number;
  const login    = app.name.split(' ')[0].toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '') + '#' + String(parseInt(profileNum, 10));
  const password = Math.random().toString(36).substring(2, 8).toUpperCase();

  // 2. Transformar o perfil: inserir na tabela sailors com o mesmo id do client
  // Isso preserva o id único e o profile_number — sem criar novo perfil duplicado.
  const sailorRow: any = {
    id:                       app.client_id,   // mesmo id do client
    profile_number:           profileNum,       // mesmo profile_number
    name:                     app.name,
    email:                    app.email,
    phone:                    app.phone,
    birth_date:               app.birth_date ?? null,
    nacionalidade:            app.nacionalidade ?? null,
    funcao:                   app.funcoes.join(', '),
    language:                 client.language ?? 'pt-PT',
    timezone:                 client.timezone ?? 'Europe/Lisbon',
    // Caderneta
    caderneta_possui:         true,
    caderneta_numero:         app.caderneta_maritima_numero,
    caderneta_validade:       toIsoDate(app.caderneta_maritima_validade),
    caderneta_doc_url:        app.caderneta_doc_url ?? null,
    // Doc ID — aproveita o do cadastro de passageiro se existir
    passaporte_numero:        app.doc_id_numero ?? client.passport_number ?? null,
    passaporte_tipo:          app.doc_id_tipo ?? client.doc_type ?? null,
    passaporte_validade:      toIsoDate(app.doc_id_validade) ?? toIsoDate(client.passport_expires) ?? null,
    passaporte_doc_url:       app.doc_id_url ?? client.doc_url ?? null,
    passaporte_doc_back_url:  app.doc_id_back_url ?? client.doc_back_url ?? null,
    // Carta
    cartahabitacao_numero:    app.carta_habilitacao_numero ?? null,
    cartahabitacao_validade:  toIsoDate(app.carta_habilitacao_validade),
    cartahabitacao_doc_url:   app.carta_habilitacao_url ?? null,
    cartahabitacao_doc_back_url: app.carta_habilitacao_back_url ?? null,
    // STCW
    stcw:                     app.stcw ?? {},
    stcw_validades:           app.stcw_validades ?? {},
    // Médico
    medico_numero:            app.medico_numero ?? null,
    medico_validade:          toIsoDate(app.medico_validade),
    medico_doc_url:           app.medico_url ?? null,
    // Experiência
    experiencia_embarcado:    app.experiencia_embarcado ?? false,
    experiencias:             app.experiencias ?? [],
    cursos_relevantes:        app.cursos_relevantes ?? null,
    idiomas:                  app.idiomas ?? [],
    // Status
    status:                   'approved',
    verified:                 true,
    verified_at:              new Date().toISOString(),
    sailor_login:             login,
    sailor_password:          password,
    // Rastreabilidade
    converted_from_client_id: app.client_id,
    application_id:           app.id,
  };

  const { data: sailorRow2, error: sailorErr } = await supabase
    .from('sailors').insert(sailorRow).select().single();
  if (sailorErr) throw sailorErr;
  const sailor = mapSailor(sailorRow2);
  cache.sailors = [sailor, ...cache.sailors];

  // 3. Marcar o client original como convertido (não exclui — preserva histórico de reservas etc.)
  await supabase.from('clients').update({ role: 'converted_to_sailor' }).eq('id', app.client_id);
  cache.clients = cache.clients.map(c =>
    c.id === app.client_id ? { ...c, role: 'converted_to_sailor' } : c
  );

  // 4. Update application status
  const patch = { status: 'approved', approved_at: new Date().toISOString() };
  await supabase.from('sailor_applications').update(patch).eq('id', applicationId);
  cache.sailorApplications = cache.sailorApplications.map(a =>
    a.id === applicationId ? { ...a, ...patch } : a
  );

  // 5. Send welcome message
  await sendSystemMessage({
    client_id: app.client_id,
    type: 'welcome',
    title: '⚓ Candidatura Aprovada — Bem-vindo(a) à Tripulação!',
    body: `Parabéns, ${app.name.split(' ')[0]}! O seu perfil de passageiro foi promovido a tripulante.\n\n🔑 *Credenciais de Acesso:*\nLogin: ${login}\nSenha: ${password}\n\nAcesse com as credenciais acima na área do profissional.\n\nO seu número de perfil permanece o mesmo: #${profileNum}`,
    meta: {},
  });

  return { sailor, login, password };
}

export async function rejectSailorApplication(
  applicationId: string,
  reasons: string[]
): Promise<void> {
  const app = cache.sailorApplications.find(a => a.id === applicationId);
  const patch = { status: 'rejected', reject_reason: reasons };
  await supabase.from('sailor_applications').update(patch).eq('id', applicationId);
  cache.sailorApplications = cache.sailorApplications.map(a =>
    a.id === applicationId ? { ...a, ...patch } : a
  );
  if (app) {
    await sendSystemMessage({
      client_id: app.client_id,
      type: 'info',
      title: '❌ Candidatura a Tripulante — Não Aprovada',
      body: `A sua candidatura não foi aprovada neste momento.\n📋 Motivo(s): ${reasons.join(', ')}\n\nPode corrigir a documentação e tentar novamente.`,
      meta: {},
    });
  }
}

// ── checkDuplicates ───────────────────────────────────────────────────────────
export async function checkDuplicates(opts: {
  email?: string; docNumero?: string; excludeId?: string;
}): Promise<DuplicateCheckResult | null> {
  const { email, docNumero, excludeId } = opts;
  const norm = (d: string) => d.replace(/[\s.\-/]/g, '').toUpperCase();
  if (email) {
    const e = email.toLowerCase().trim();
    const found =
      cache.sailors.find(s => s.id !== excludeId && s.email.toLowerCase() === e) ||
      cache.clients.find(c => c.id !== excludeId && c.email.toLowerCase() === e);
    if (found) return { field: 'email', message: 'Este e-mail já está cadastrado na plataforma.' };
  }
  if (docNumero && norm(docNumero).length >= 4) {
    const n = norm(docNumero);
    const sf = cache.sailors.find(s => s.id !== excludeId && (
      norm(s.passaporte?.numero || '') === n || norm(s.cartahabitacao?.numero || '') === n));
    const cf = cache.clients.find(c => c.id !== excludeId && norm((c as any).passport_number || '') === n);
    if (sf || cf) return { field: 'document', message: 'Este número de documento já está cadastrado na plataforma.' };
  }
  return null;
}

// ── generateProfileNumber — compatibilidade ───────────────────────────────────
export async function generateProfileNumber(_role?: 'client' | 'sailor'): Promise<string> {
  const { data } = await supabase.rpc('next_counter', { counter_key: 'profile_counter' });
  return String(data ?? 0).padStart(5, '0');
}

// ── Document Expiry Check ─────────────────────────────────────────────────────
export { runDocumentExpiryCheck } from './store/docExpiry';