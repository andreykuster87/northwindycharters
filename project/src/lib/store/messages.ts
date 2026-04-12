// src/lib/store/messages.ts — MIGRADO PARA SUPABASE
import { supabase } from '../supabase';
import type { Message, MessageType } from './core';

export async function getMessages(clientId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages').select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(r => ({ ...r, meta: r.meta ?? {} }));
}

export async function sendSystemMessage(
  msg: Omit<Message, 'id' | 'created_at' | 'read'>
): Promise<Message> {
  const { data, error } = await supabase
    .from('messages').insert({ ...msg, read: false }).select().single();
  if (error) throw error;
  return data;
}

export async function markMessageRead(id: string): Promise<void> {
  const { error } = await supabase.from('messages').update({ read: true }).eq('id', id);
  if (error) throw error;
}

export async function markAllMessagesRead(clientId: string): Promise<void> {
  const { error } = await supabase
    .from('messages').update({ read: true }).eq('client_id', clientId);
  if (error) throw error;
}

export async function countUnreadMessages(clientId: string): Promise<number> {
  const { count, error } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('client_id', clientId)
    .eq('read', false);
  if (error) throw error;
  return count ?? 0;
}

export async function notifyBookingStatusChange(opts: {
  clientId:    string;
  bookingId:   string;
  tripName:    string;
  bookingDate: string;
  timeSlot?:   string;
  passengers:  number;
  newStatus:   string;
}): Promise<void> {
  const { clientId, bookingId, tripName, bookingDate, timeSlot, passengers, newStatus } = opts;
  const meta = { booking_id: bookingId, trip_name: tripName, booking_date: bookingDate, time_slot: timeSlot, passengers };
  const d    = new Date(bookingDate + 'T12:00').toLocaleDateString('pt-BR');

  const map: Record<string, { type: MessageType; title: string; body: string }> = {
    confirmed: {
      type:  'booking_confirmed',
      title: '✅ Reserva Confirmada!',
      body:  `A sua reserva para *${tripName}* no dia ${d}${timeSlot ? ' às ' + timeSlot : ''} foi confirmada pelo comandante. Até breve! ⛵`,
    },
    pending: {
      type:  'booking_pending',
      title: '⏳ Reserva em Análise',
      body:  `A sua reserva para *${tripName}* está a aguardar confirmação do comandante.`,
    },
    cancelado: {
      type:  'booking_cancelled',
      title: '❌ Reserva Cancelada',
      body:  `A sua reserva para *${tripName}* no dia ${d} foi cancelada.`,
    },
    cancelled: {
      type:  'booking_cancelled',
      title: '❌ Reserva Cancelada',
      body:  `A sua reserva para *${tripName}* no dia ${d} foi cancelada.`,
    },
    completed: {
      type:  'booking_completed',
      title: '🌊 Passeio Concluído!',
      body:  `Obrigado por navegar connosco em *${tripName}*! Esperamos tê-lo(a) a bordo novamente. ⚓`,
    },
    concluido: {
      type:  'booking_completed',
      title: '🌊 Passeio Concluído!',
      body:  `Obrigado por navegar connosco em *${tripName}*! Esperamos tê-lo(a) a bordo novamente. ⚓`,
    },
  };

  const template = map[newStatus];
  if (!template || !clientId) return;
  await sendSystemMessage({ client_id: clientId, ...template, meta });
}