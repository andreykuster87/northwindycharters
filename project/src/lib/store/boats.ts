// src/lib/store/boats.ts — MIGRADO PARA SUPABASE
import { supabase } from '../supabase';
import type { Boat } from './core';
import { sendSystemMessage } from './messages';

function normalize(r: any): Boat {
  return { ...r, photos: r.photos ?? [], crew: r.crew ?? [] };
}

export async function getBoats(sailorId?: string): Promise<Boat[]> {
  let q = supabase.from('boats').select('*').eq('status', 'active');
  if (sailorId) q = q.eq('sailor_id', sailorId);
  const { data, error } = await q.order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(normalize);
}

export async function getAllBoats(sailorId?: string): Promise<Boat[]> {
  let q = supabase.from('boats').select('*');
  if (sailorId) q = q.eq('sailor_id', sailorId);
  const { data, error } = await q.order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(normalize);
}

export async function getPendingBoats(): Promise<Boat[]> {
  const { data, error } = await supabase
    .from('boats').select('*').eq('status', 'pending').order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(normalize);
}

export async function saveBoat(data: Omit<Boat, 'id' | 'created_at'>): Promise<Boat> {
  const { data: inserted, error } = await supabase
    .from('boats').insert(data).select().single();
  if (error) {
    if (error.code === '23505' && (error.message || '').includes('matricula')) {
      throw new Error('DUPLICATE_REGISTRY');
    }
    throw error;
  }
  return normalize(inserted);
}

export async function updateBoat(id: string, patch: Partial<Boat>): Promise<void> {
  const { error } = await supabase.from('boats').update(patch).eq('id', id);
  if (error) throw error;
}

export async function approveBoat(id: string): Promise<void> {
  // Busca a embarcação antes de aprovar (para notificar)
  const { data: boat } = await supabase.from('boats').select('*').eq('id', id).single();

  // Conta quantas embarcações ativas já existem para gerar número de frota
  const { count } = await supabase
    .from('boats').select('*', { count: 'exact', head: true }).eq('status', 'active');
  const boat_number = `E${(count ?? 0) + 1}`;

  const { error } = await supabase.from('boats').update({
    status:       'active',
    boat_number,
    docs_metadata: {
      docs_verified:         true,
      docs_verified_at:      new Date().toISOString(),
      docs_review_requested: false,
    },
  }).eq('id', id);
  if (error) throw error;

  if (boat?.sailor_id) {
    await sendSystemMessage({
      client_id: boat.sailor_id,
      type:      'info',
      title:     `✅ Embarcação Aprovada — ${boat.name}`,
      body:      `A sua embarcação *${boat.name}* foi aprovada pela equipa NorthWindy! 🚢\n\nNúmero de frota: *${boat_number}*\n\nA embarcação está agora disponível na sua frota.`,
      meta:      {},
    });
  }
}

export async function rejectBoat(id: string, reason?: string): Promise<void> {
  const { data: boat } = await supabase.from('boats').select('*').eq('id', id).single();
  const { error } = await supabase.from('boats').update({ status: 'rejected' }).eq('id', id);
  if (error) throw error;

  if (boat?.sailor_id) {
    await sendSystemMessage({
      client_id: boat.sailor_id,
      type:      'info',
      title:     `❌ Embarcação Reprovada — ${boat.name}`,
      body:      `A sua embarcação *${boat.name}* não foi aprovada.${reason ? '\n\n📋 Motivo: ' + reason : ''}\n\nCorrija a documentação e reenvie.`,
      meta:      {},
    });
  }
}

export async function deleteBoat(id: string): Promise<void> {
  const { error } = await supabase.from('boats').delete().eq('id', id);
  if (error) throw error;
}