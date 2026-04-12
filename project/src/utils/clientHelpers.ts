// src/components/ClientArea/components/clientHelpers.ts
// ─────────────────────────────────────────────────────────────────────────────
// Tipos, funções puras e constantes partilhadas dentro do ClientArea.
// ─────────────────────────────────────────────────────────────────────────────
import { getTrips, getSailors, getBookings } from '../lib/localStore';
import type { ScheduleData } from '../components/modals/TimeSlotsModal';

// ── Tipos ─────────────────────────────────────────────────────────────────────

export interface ScheduleEntry {
  date: string;
  time_slots: string[];
  spots: number;
}

export interface CatalogBoat {
  id: string;
  name: string;
  photo_url: string;
  photos: string[];
  capacity: number;
  price_per_hour: number;
  marina_location: string;
  duracao?: string;
  descricao?: string;
  country_flag?: string;
  country_name?: string;
  state_name?: string;
  city?: string;
  marina_saida?: string;
  currency?: string;
  currency_symbol?: string;
  currency_locale?: string;
  minimo_tripulantes?: number;
  bebidas?: 'inclusas' | 'nao_inclusas' | 'traga';
  comida?:  'inclusa'  | 'nao_inclusa';
  bar?:     'tem'      | 'nao_tem';
  meeting_point?:    string;
  meeting_sector?:   string;
  meeting_gate?:     string;
  meeting_ref?:      string;
  meeting_maps_url?: string;
  schedule?: ScheduleEntry[];
  sailor: { name: string; verified: boolean; phone?: string };
}

// ── Formatação ────────────────────────────────────────────────────────────────

export function formatPrice(value: number, boat?: CatalogBoat): string {
  try {
    if (boat?.currency && boat?.currency_locale) {
      return new Intl.NumberFormat(boat.currency_locale, {
        style: 'currency',
        currency: boat.currency,
        minimumFractionDigits: boat.currency === 'JPY' ? 0 : 2,
      }).format(value);
    }
  } catch {}
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export function fmtBRL(v: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
}

export function parseLocation(loc: string): { from: string; to: string } {
  const arrow = loc.split('→');
  if (arrow.length >= 2) return { from: arrow[0].trim(), to: arrow[1].split('·')[0].trim() };
  return { from: loc, to: '' };
}

export function normalizeLogin(name: string, profileNumber?: string): string {
  const base = name.split(' ')[0].toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
  const num = profileNumber ? String(parseInt(profileNumber, 10)) : '';
  return num ? `${base}#${num}` : base;
}

// ── Schedule com vagas reais ──────────────────────────────────────────────────

export function buildSchedule(trip: CatalogBoat): ScheduleData[] {
  const today    = new Date().toISOString().split('T')[0];
  const bookings = getBookings();

  // Reservas pendentes e confirmadas ambas ocupam vagas
  const active = bookings.filter(
    b =>
      b.trip_id === trip.id &&
      ['confirmed', 'completed', 'concluido', 'pending', 'aguardando'].includes(b.status),
  );

  return (trip.schedule || []).filter(e => e.date >= today).map(e => {
    const slotSpots: Record<string, number> = {};

    if (e.time_slots.length > 0) {
      // Cada slot tem vagas independentes
      e.time_slots.forEach(slot => {
        const paxSlot = active
          .filter(b => b.booking_date === e.date && b.time_slot === slot)
          .reduce((s, b) => s + (b.passengers || 0), 0);
        slotSpots[slot] = Math.max(0, e.spots - paxSlot);
      });

      // Total do dia = soma das vagas de todos os slots
      const totalDaySpots = e.spots * e.time_slots.length;
      const paxDay = active
        .filter(b => b.booking_date === e.date)
        .reduce((s, b) => s + (b.passengers || 0), 0);

      return { ...e, spotsLeft: Math.max(0, totalDaySpots - paxDay), slotSpots };
    }

    // Sem slots: vagas directas do dia
    const paxDay = active
      .filter(b => b.booking_date === e.date)
      .reduce((s, b) => s + (b.passengers || 0), 0);

    return { ...e, spotsLeft: Math.max(0, e.spots - paxDay), slotSpots };
  });
}

// ── Carregamento de viagens ───────────────────────────────────────────────────

export function loadTrips(): CatalogBoat[] {
  const trips   = getTrips();
  const sailors = getSailors();
  return trips.map(t => {
    const sailor = sailors.find(s => s.id === t.sailor_id);
    const allPhotos: string[] = [];
    if (t.cover_photo) allPhotos.push(t.cover_photo);
    (t.photos || []).forEach((p: string) => {
      if (p && p !== t.cover_photo) allPhotos.push(p);
    });
    return {
      id:              t.id,
      name:            t.boat_name,
      photo_url:       allPhotos[0] || '',
      photos:          allPhotos,
      capacity:        t.capacity,
      price_per_hour:  t.valor_por_pessoa,
      marina_location: `${t.marina_saida} → ${t.marina_chegada} · ${t.duracao}`,
      marina_saida:    t.marina_saida,
      duracao:         t.duracao,
      descricao:       t.descricao,
      country_flag:    (t as any).country_flag,
      country_name:    (t as any).country_name,
      country_code:    (t as any).country_code,
      state_name:      (t as any).state_name,
      state_code:      (t as any).state_code,
      city:            (t as any).city,
      currency:        (t as any).currency,
      currency_symbol: (t as any).currency_symbol,
      currency_locale: (t as any).currency_locale,
      minimo_tripulantes: (t as any).minimo_tripulantes,
      bebidas:         (t as any).bebidas,
      comida:          (t as any).comida,
      bar:             (t as any).bar,
      meeting_point:    (t as any).meeting_point,
      meeting_sector:   (t as any).meeting_sector,
      meeting_gate:     (t as any).meeting_gate,
      meeting_ref:      (t as any).meeting_ref,
      meeting_maps_url: (t as any).meeting_maps_url,
      schedule:        t.schedule || [],
      sailor: {
        name:     sailor?.name     || t.sailor_name || 'Comandante',
        verified: sailor?.verified ?? true,
        phone:    sailor?.phone    || '',
      },
    };
  });
}

// ── Constantes de mensagens ───────────────────────────────────────────────────

export const MSG_ICONS: Record<string, string> = {
  booking_confirmed:  '✅',
  booking_pending:    '⏳',
  booking_cancelled:  '❌',
  booking_completed:  '🌊',
  welcome:            '👋',
  info:               'ℹ️',
  doc_expired:        '🚫',
  doc_expiring_soon:  '⚠️',
  account_blocked:    '🔒',
  account_unblocked:  '🔓',
};

export const MSG_COLORS: Record<string, string> = {
  booking_confirmed:  'border-l-green-500 bg-green-50/40',
  booking_pending:    'border-l-amber-400 bg-amber-50/40',
  booking_cancelled:  'border-l-red-400 bg-red-50/40',
  booking_completed:  'border-l-blue-500 bg-blue-50/40',
  welcome:            'border-l-blue-900 bg-blue-50/40',
  info:               'border-l-gray-400 bg-gray-50/40',
  doc_expired:        'border-l-red-600 bg-red-50/60',
  doc_expiring_soon:  'border-l-orange-400 bg-orange-50/40',
  account_blocked:    'border-l-red-700 bg-red-100/60',
  account_unblocked:  'border-l-green-600 bg-green-50/40',
};