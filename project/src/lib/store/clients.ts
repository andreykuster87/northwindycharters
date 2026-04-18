// src/lib/store/clients.ts — MIGRADO PARA SUPABASE
import { supabase } from '../supabase';
import type { Client } from './core';

export async function getClients(): Promise<Client[]> {
  const { data, error } = await supabase
    .from('clients').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function saveClient(
  data: Omit<Client, 'id' | 'profile_number' | 'created_at' | 'status' | 'role'>
): Promise<Client> {
  const { data: cnt, error: cntErr } = await supabase.rpc('next_counter', { counter_key: 'profile_counter' });
  if (cntErr) throw cntErr;
  const profile_number = String(cnt).padStart(5, '0');

  const { data: inserted, error } = await supabase
    .from('clients').insert({ ...data, profile_number, status: 'pending_verification', role: 'client' })
    .select().single();
  if (error) {
    if (error.code === '23505') {
      const msg = error.message || '';
      if (msg.includes('email'))           throw new Error('DUPLICATE_EMAIL');
      if (msg.includes('client_login'))    throw new Error('DUPLICATE_LOGIN');
      if (msg.includes('passport_number')) throw new Error('DUPLICATE_DOCUMENT');
      if (msg.includes('profile_number'))  throw new Error('DUPLICATE_PROFILE_NUMBER');
      throw new Error('DUPLICATE_DOCUMENT');
    }
    throw error;
  }
  return inserted;
}

export async function approveClient(id: string): Promise<void> {
  const { error } = await supabase.from('clients').update({ status: 'active' }).eq('id', id);
  if (error) throw error;
}

export async function updateClient(id: string, patch: Partial<Client>): Promise<void> {
  const { error } = await supabase.from('clients').update(patch).eq('id', id);
  if (error) throw error;
}

export async function deleteClient(id: string): Promise<void> {
  await supabase.from('messages').delete().eq('client_id', id);
  const { error } = await supabase.from('clients').delete().eq('id', id);
  if (error) throw error;
}