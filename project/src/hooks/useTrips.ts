// src/hooks/useTrips.ts — MIGRADO PARA SUPABASE
import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { getTrips, getSailors } from '../lib/localStore';
import type { CatalogBoat } from '../lib/catalog';

function tripToBoat(t: any, sailorsMap: Map<string, any>): CatalogBoat {
  const sailor = sailorsMap.get(t.sailor_id);

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
    duracao:         t.duracao,
    descricao:       t.descricao,
    // Localização
    country_code:    t.country_code,
    country_flag:    t.country_flag,
    country_name:    t.country_name,
    currency:        t.currency,
    currency_symbol: t.currency_symbol,
    currency_locale: t.currency_locale,
    state_code:      t.state_code,
    state_name:      t.state_name,
    city:            t.city,
    // Tipo e origem
    boat_type:    t.boat_type,
    marina_saida: t.marina_saida,
    // Extras
    minimo_tripulantes: t.minimo_tripulantes,
    length_ft:          t.length_ft,
    bebidas:            t.bebidas,
    comida:             t.comida,
    bar:                t.bar,
    // Ponto de encontro
    meeting_point:    t.meeting_point,
    meeting_sector:   t.meeting_sector,
    meeting_gate:     t.meeting_gate,
    meeting_ref:      t.meeting_ref,
    meeting_maps_url: t.meeting_maps_url,
    // Agenda
    schedule: t.schedule || [],
    sailor: {
      name:     sailor?.name     || t.sailor_name || 'Comandante',
      verified: sailor?.verified ?? true,
      phone:    sailor?.phone    || '',
    },
  };
}

export function useTrips() {
  const [catalogBoats, setCatalogBoats] = useState<CatalogBoat[]>([]);

  // Popula o catálogo a partir do cache do refreshAll (sem queries extras ao Supabase)
  const loadFromCache = useCallback(() => {
    const trips = getTrips(); // já filtra status=active
    const sailors = getSailors().filter(s => s.status === 'approved');
    const sailorsMap = new Map(sailors.map(s => [s.id, s]));
    setCatalogBoats(trips.map(t => tripToBoat(t, sailorsMap)));
  }, []);

  // Busca direto do Supabase (usado quando o cache ainda não foi populado)
  const loadPublicTrips = useCallback(async () => {
    const [{ data: trips }, { data: sailors }] = await Promise.all([
      supabase.from('trips').select('*').eq('status', 'active').order('created_at', { ascending: false }),
      supabase.from('sailors').select('id, name, verified, phone').eq('status', 'approved'),
    ]);

    const sailorsMap = new Map((sailors ?? []).map(s => [s.id, s]));
    setCatalogBoats((trips ?? []).map(t => tripToBoat(t, sailorsMap)));
  }, []);

  return { catalogBoats, loadFromCache, loadPublicTrips };
}