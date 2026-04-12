// src/lib/store/trips.ts — MIGRADO PARA SUPABASE
import { supabase } from '../supabase';
import type { Trip } from './core';

function normalize(r: any): Trip {
  return { ...r, photos: r.photos ?? [], schedule: r.schedule ?? [] };
}

export async function getTrips(sailorId?: string): Promise<Trip[]> {
  let q = supabase.from('trips').select('*').eq('status', 'active');
  if (sailorId) q = q.eq('sailor_id', sailorId);
  const { data, error } = await q.order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(normalize);
}

export async function getAllTrips(sailorId?: string): Promise<Trip[]> {
  let q = supabase.from('trips').select('*');
  if (sailorId) q = q.eq('sailor_id', sailorId);
  const { data, error } = await q.order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(normalize);
}

export async function saveTrip(data: Omit<Trip, 'id' | 'created_at'>): Promise<Trip> {
  const { data: inserted, error } = await supabase
    .from('trips').insert(data).select().single();
  if (error) throw error;
  return normalize(inserted);
}

export async function cancelTrip(id: string): Promise<void> {
  const { error } = await supabase.from('trips').update({ status: 'cancelled' }).eq('id', id);
  if (error) throw error;
}

export async function updateTrip(id: string, patch: Partial<Trip>): Promise<void> {
  const { error } = await supabase.from('trips').update(patch).eq('id', id);
  if (error) throw error;
}

export async function deleteTrip(id: string): Promise<void> {
  const { error } = await supabase.from('trips').delete().eq('id', id);
  if (error) throw error;
}