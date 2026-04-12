// src/lib/store/bookings.ts — MIGRADO PARA SUPABASE
import { supabase } from '../supabase';
import type { Booking, BookingGuest } from './core';

function normalize(r: any): Booking {
  return { ...r, guests: r.guests ?? [] };
}

export async function getBookings(sailorId?: string, clientId?: string): Promise<Booking[]> {
  let q = supabase.from('bookings').select('*, trip:trips(*)');
  if (sailorId) q = q.eq('sailor_id', sailorId);
  if (clientId) q = q.eq('client_id', clientId);
  const { data, error } = await q.order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(normalize);
}

export async function saveBooking(
  data: Omit<Booking, 'id' | 'booking_number' | 'created_at' | 'trip'>
): Promise<Booking> {
  const { data: cnt, error: cntErr } = await supabase.rpc('next_counter', { counter_key: 'booking_counter' });
  if (cntErr) throw cntErr;

  const { data: inserted, error } = await supabase
    .from('bookings')
    .insert({ ...data, booking_number: Number(cnt), guests: data.guests ?? [] })
    .select().single();
  if (error) throw error;
  return normalize(inserted);
}

export async function updateBookingGuests(
  id: string, guests: BookingGuest[], obs?: string
): Promise<void> {
  const { error } = await supabase.from('bookings').update({
    guests, guests_obs: obs || '', status: 'pending',
  }).eq('id', id);
  if (error) throw error;
}

export async function updateBookingStatus(id: string, status: string): Promise<void> {
  const patch: any = { status };
  if (status === 'cancelado' || status === 'cancelled') {
    patch.cancelled_at = new Date().toISOString();
  }
  const { error } = await supabase.from('bookings').update(patch).eq('id', id);
  if (error) throw error;
}

export async function deleteBooking(id: string): Promise<void> {
  const { error } = await supabase.from('bookings').delete().eq('id', id);
  if (error) throw error;
}