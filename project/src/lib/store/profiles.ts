// src/lib/store/profiles.ts — MIGRADO PARA SUPABASE
import { supabase } from '../supabase';
import { sendSystemMessage } from './messages';

export async function blockProfile(id: string, role: 'sailor' | 'client', reason: string): Promise<void> {
  const table = role === 'sailor' ? 'sailors' : 'clients';
  const { error } = await supabase
    .from(table).update({ blocked: true, block_reason: reason }).eq('id', id);
  if (error) throw error;
  await sendSystemMessage({
    client_id: id,
    type:      'account_blocked',
    title:     '🚫 Conta Temporariamente Bloqueada',
    body:      `A sua conta foi bloqueada: ${reason}. Regularize a documentação e contacte o suporte.`,
    meta:      {},
  });
}

export async function unblockProfile(id: string, role: 'sailor' | 'client'): Promise<void> {
  const table = role === 'sailor' ? 'sailors' : 'clients';
  const { error } = await supabase
    .from(table).update({ blocked: false, block_reason: null }).eq('id', id);
  if (error) throw error;
  await sendSystemMessage({
    client_id: id,
    type:      'account_unblocked',
    title:     '✅ Conta Reactivada',
    body:      'A sua conta foi reactivada. Pode voltar a realizar reservas normalmente. Bem-vindo(a) de volta! ⛵',
    meta:      {},
  });
}

export async function sendWelcomeMessage(id: string, name: string, role: 'sailor' | 'client'): Promise<void> {
  const isSailor = role === 'sailor';
  await sendSystemMessage({
    client_id: id,
    type:      'welcome',
    title:     `👋 Bem-vindo(a) à NorthWindy, ${name.split(' ')[0]}!`,
    body:      isSailor
      ? 'A sua candidatura foi aprovada! Já pode criar passeios, gerir a sua frota e receber reservas. Boas navegações! ⚓'
      : 'A sua conta foi verificada e está activa. Explore os passeios disponíveis e faça a sua primeira reserva. ⛵',
    meta:      {},
  });
}