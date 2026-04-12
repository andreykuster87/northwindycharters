// src/lib/catalogUtils.ts — MIGRADO PARA SUPABASE
import { supabase }      from '../lib/supabase';
import type { CatalogBoat } from './catalog';
import type { ScheduleData } from '../components/modals/TimeSlotsModal';

// ── Formatação de preço ───────────────────────────────────────────────────────

export function formatPrice(value: number, boat?: CatalogBoat): string {
  try {
    if (boat?.currency && boat?.currency_locale) {
      return new Intl.NumberFormat(boat.currency_locale, {
        style:                 'currency',
        currency:              boat.currency,
        minimumFractionDigits: boat.currency === 'JPY' ? 0 : 2,
      }).format(value);
    }
  } catch {}
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export function fmtBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

// ── Localização ───────────────────────────────────────────────────────────────

export function parseLocation(loc: string): { from: string; to: string } {
  const arrow = loc.split('→');
  if (arrow.length >= 2) return { from: arrow[0].trim(), to: arrow[1].split('·')[0].trim() };
  return { from: loc, to: '' };
}

export function getBoatCity(boat: CatalogBoat): string {
  return (
    boat.city?.trim() ||
    boat.marina_saida?.trim() ||
    parseLocation(boat.marina_location).from ||
    ''
  );
}

// ── Normalização de login ─────────────────────────────────────────────────────

export function normalizeLogin(name: string, profileNumber?: string): string {
  const base = name
    .split(' ')[0].toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
  const num = profileNumber ? String(parseInt(profileNumber, 10)) : '';
  return num ? `${base}#${num}` : base;
}

// ── Agenda com vagas reais (async — lê do Supabase) ──────────────────────────

export async function buildSchedule(trip: CatalogBoat): Promise<ScheduleData[]> {
  const today = new Date().toISOString().split('T')[0];

  const { data: bookings } = await supabase
    .from('bookings')
    .select('booking_date, time_slot, passengers, status')
    .eq('trip_id', trip.id)
    .in('status', ['confirmed', 'completed', 'concluido', 'pending', 'aguardando']);

  const active = bookings ?? [];

  return (trip.schedule || [])
    .filter(e => e.date >= today)
    .map(e => {
      const slotSpots: Record<string, number> = {};

      if (e.time_slots.length > 0) {
        e.time_slots.forEach(slot => {
          const paxSlot = active
            .filter(b => b.booking_date === e.date && b.time_slot === slot)
            .reduce((s, b) => s + (b.passengers || 0), 0);
          slotSpots[slot] = Math.max(0, e.spots - paxSlot);
        });

        const totalDaySpots = e.spots * e.time_slots.length;
        const paxDay = active
          .filter(b => b.booking_date === e.date)
          .reduce((s, b) => s + (b.passengers || 0), 0);

        return { ...e, spotsLeft: Math.max(0, totalDaySpots - paxDay), slotSpots };
      }

      const paxDay = active
        .filter(b => b.booking_date === e.date)
        .reduce((s, b) => s + (b.passengers || 0), 0);

      return { ...e, spotsLeft: Math.max(0, e.spots - paxDay), slotSpots };
    });
}

/**
 * Versão síncrona — recebe bookings já carregados externamente.
 * Usar quando o componente pai já fez o fetch (evita dupla chamada).
 */
export function buildScheduleFromBookings(
  trip:     CatalogBoat,
  bookings: Array<{ booking_date: string; time_slot: string; passengers: number; status: string; trip_id: string }>,
): ScheduleData[] {
  const today  = new Date().toISOString().split('T')[0];
  const active = bookings.filter(
    b => b.trip_id === trip.id &&
    ['confirmed', 'completed', 'concluido', 'pending', 'aguardando'].includes(b.status),
  );

  return (trip.schedule || [])
    .filter(e => e.date >= today)
    .map(e => {
      const slotSpots: Record<string, number> = {};

      if (e.time_slots.length > 0) {
        e.time_slots.forEach(slot => {
          const paxSlot = active
            .filter(b => b.booking_date === e.date && b.time_slot === slot)
            .reduce((s, b) => s + (b.passengers || 0), 0);
          slotSpots[slot] = Math.max(0, e.spots - paxSlot);
        });
        const totalDaySpots = e.spots * e.time_slots.length;
        const paxDay = active
          .filter(b => b.booking_date === e.date)
          .reduce((s, b) => s + (b.passengers || 0), 0);
        return { ...e, spotsLeft: Math.max(0, totalDaySpots - paxDay), slotSpots };
      }

      const paxDay = active
        .filter(b => b.booking_date === e.date)
        .reduce((s, b) => s + (b.passengers || 0), 0);
      return { ...e, spotsLeft: Math.max(0, e.spots - paxDay), slotSpots };
    });
}