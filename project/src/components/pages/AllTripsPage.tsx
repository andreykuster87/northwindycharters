// src/components/AllTripsPage.tsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ArrowLeft, MapPin, Search, X, ChevronDown, Users,
  CalendarDays, ShieldCheck, ArrowRight, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { getBookings } from '../../lib/localStore';
import type { CatalogBoat } from '../../services/catalog';
import {
  formatPrice, parseLocation, getBoatCity, buildScheduleFromBookings,
} from '../../utils/catalogUtils';
import type { ScheduleData } from '../modals/TimeSlotsModal';

import { LOGO_SRC } from '../../assets';

interface Props {
  boats:         CatalogBoat[];
  onBack:        () => void;
  onSelectBoat?: (boat: CatalogBoat, date?: string, slot?: string) => void;
}

// ── TripDetailModal ────────────────────────────────────────────────────────────
function TripDetailModal({ boat, onClose, onBook }: {
  boat:    CatalogBoat;
  onClose: () => void;
  onBook:  (boat: CatalogBoat, date?: string, slot?: string) => void;
}) {
  const { from, to } = parseLocation(boat.marina_location);
  const schedule     = buildScheduleFromBookings(boat, getBookings());
  const validPhoto   = (p: string) => p && (p.startsWith('data:image') || p.startsWith('https'));
  const allPhotos    = (boat.photos || []).filter(validPhoto);
  if (validPhoto(boat.photo_url) && !allPhotos.includes(boat.photo_url)) allPhotos.unshift(boat.photo_url);
  const [photoIdx, setPhotoIdx] = useState(0);
  const [showAll,  setShowAll]  = useState(false);
  const [selDate,  setSelDate]  = useState<string | null>(null);
  const [selSlot,  setSelSlot]  = useState<string | null>(null);
  const visible = showAll ? schedule : schedule.slice(0, 4);
  const hasSlots = schedule.some(function(e) { return e.time_slots.length > 0; });
  const canBook  = selDate !== null && selSlot !== null;

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-[32px] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="relative flex-shrink-0" style={{ height: 280 }}>
          {allPhotos.length > 0
            ? <img src={allPhotos[photoIdx]} alt={boat.name} className="w-full h-full object-cover" />
            : <div className="w-full h-full bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center"><span className="text-7xl opacity-20">⛵</span></div>
          }
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <button onClick={onClose} className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2.5 rounded-full z-10"><X className="w-4 h-4" /></button>
          {allPhotos.length > 1 && (
            <>
              <button onClick={() => setPhotoIdx(i => (i - 1 + allPhotos.length) % allPhotos.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full z-10"><ChevronLeft className="w-4 h-4" /></button>
              <button onClick={() => setPhotoIdx(i => (i + 1) % allPhotos.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full z-10"><ChevronRight className="w-4 h-4" /></button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                {allPhotos.map((_, i) => <button key={i} onClick={() => setPhotoIdx(i)} className={`rounded-full transition-all ${i === photoIdx ? 'w-5 h-2 bg-white' : 'w-2 h-2 bg-white/40'}`} />)}
              </div>
            </>
          )}
          <div className="absolute top-4 left-4 bg-white/95 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md z-10">
            {boat.sailor.verified && <ShieldCheck className="w-3 h-3 text-blue-900" />}
            <span className="font-black text-blue-900 text-[10px] uppercase">{boat.sailor.name}</span>
          </div>
        </div>
        <div className="p-6 space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black text-blue-900 uppercase italic">{boat.name}</h2>
              {(boat.city || boat.country_name) && (
                <p className="text-sm text-gray-400 font-bold mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />{[boat.city, boat.country_name].filter(Boolean).join(', ')}
                </p>
              )}
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-[10px] font-black text-gray-400 uppercase">Por pessoa</p>
              <p className="text-xl font-black text-blue-900">{formatPrice(boat.price_per_hour, boat)}</p>
            </div>
          </div>
          <div className="bg-blue-900 rounded-[20px] px-5 py-4">
            <p className="text-blue-400 text-[9px] font-black uppercase tracking-widest mb-3">Rota do passeio</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-[9px] text-blue-400 font-black uppercase mb-0.5">⚓ Embarque</p>
                <p className="font-black text-white text-sm uppercase italic">{from}</p>
              </div>
              <div className="flex flex-col items-center px-2 flex-shrink-0">
                <div className="h-px w-6 bg-blue-500" />
                {boat.duracao && <span className="text-[8px] font-black text-blue-300 bg-blue-800 px-2 py-0.5 rounded-full my-1">⏱ {boat.duracao}</span>}
                <div className="h-px w-6 bg-blue-500" />
              </div>
              <div className="flex-1 min-w-0 text-right">
                <p className="text-[9px] text-blue-400 font-black uppercase mb-0.5">🏁 Desembarque</p>
                <p className="font-black text-blue-200 text-sm uppercase italic">{to && to !== from ? to : from}</p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="bg-gray-50 rounded-full px-4 py-2 text-xs font-black text-gray-600 flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-gray-400" /> Até {boat.capacity} pessoas</span>
            {(boat.minimo_tripulantes ?? 0) > 1 && <span className="bg-amber-50 border border-amber-200 rounded-full px-4 py-2 text-[10px] font-black text-amber-700">⚠️ Mín. {boat.minimo_tripulantes}</span>}
            {(boat as any).bebidas === 'inclusas' && <span className="bg-emerald-50 border border-emerald-200 rounded-full px-4 py-2 text-[10px] font-black text-emerald-700">🍾 Bebidas inclusas</span>}
            {(boat as any).comida  === 'inclusa'  && <span className="bg-emerald-50 border border-emerald-200 rounded-full px-4 py-2 text-[10px] font-black text-emerald-700">🍽️ Comida inclusa</span>}
            {(boat as any).bar    === 'tem'       && <span className="bg-blue-50 border border-blue-200 rounded-full px-4 py-2 text-[10px] font-black text-blue-700">🍹 Bar a bordo</span>}
          </div>
          {boat.descricao && <p className="text-sm text-gray-500 font-bold leading-relaxed">{boat.descricao}</p>}
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5" /> Datas e horários disponíveis</p>
            {schedule.length === 0
              ? <div className="bg-gray-50 rounded-[16px] p-6 text-center"><p className="text-gray-300 font-black text-xs uppercase italic">Sem datas disponíveis no momento</p></div>
              : <div className="space-y-2">
                  {visible.map((entry, i) => {
                    const [ey, em, ed] = entry.date.split('-');
                    const badge = entry.spotsLeft > 3 ? 'bg-green-100 text-green-700 border-green-200' : 'bg-amber-100 text-amber-700 border-amber-200';
                    return (
                      <div key={i} className="bg-blue-50 border border-blue-100 rounded-[14px] px-4 py-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-blue-900">{ed}/{em}/{ey}</span>
                          <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${badge}`}>{entry.spotsLeft} vaga{entry.spotsLeft !== 1 ? 's' : ''}</span>
                        </div>
                        {entry.time_slots.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {entry.time_slots.map((slot, si) => {
                              const sv = (entry as any).slotSpots?.[slot] ?? 0;
                              const ok = sv > 0;
                              const isSel = selDate === entry.date && selSlot === slot;
                              return (
                                <button key={si} type="button" disabled={!ok}
                                  onClick={() => {
                                    if (!ok) return;
                                    if (isSel) { setSelDate(null); setSelSlot(null); }
                                    else { setSelDate(entry.date); setSelSlot(slot); }
                                  }}
                                  className={`px-3 py-1.5 rounded-full border-2 text-[11px] font-black transition-all ${
                                    isSel
                                      ? 'bg-blue-900 border-blue-900 text-white shadow-md'
                                      : ok
                                      ? 'bg-white border-blue-200 text-blue-900 hover:border-blue-900'
                                      : 'bg-gray-50 border-gray-200 text-gray-400 opacity-50 cursor-not-allowed'
                                  }`}>
                                  {isSel ? '✓ ' : ''}{slot} · {ok ? `${sv} vaga${sv !== 1 ? 's' : ''}` : 'esgotado'}
                                </button>
                              );
                            })}
                          </div>
                        )}
                        {entry.time_slots.length === 0 && (
                          <button onClick={() => onBook(boat, entry.date)} className="text-xs font-black text-blue-600 hover:text-blue-900 transition-colors">Reservar esta data →</button>
                        )}
                      </div>
                    );
                  })}
                  {schedule.length > 4 && (
                    <button onClick={() => setShowAll(v => !v)} className="w-full text-center text-[11px] font-black text-blue-500 hover:text-blue-900 py-2">
                      {showAll ? 'Mostrar menos' : `+${schedule.length - 4} datas`}
                    </button>
                  )}
                </div>
            }
          </div>
          {hasSlots && !canBook && (
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-[14px] px-4 py-3">
              <span className="text-blue-400 text-sm">👆</span>
              <p className="text-[11px] font-black text-blue-600">Selecione um horário acima para continuar</p>
            </div>
          )}
          <button
            disabled={hasSlots && !canBook}
            onClick={() => {
              if (canBook) { onBook(boat, selDate!, selSlot!); }
              else if (!hasSlots) { onBook(boat); }
            }}
            className={`w-full py-4 rounded-[25px] font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-2 ${
              hasSlots && !canBook
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-blue-900 hover:bg-blue-800 text-white shadow-lg'
            }`}>
            <span>{canBook ? `Confirmar · ${selSlot}` : 'Reservar este Passeio'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── CatalogCard ────────────────────────────────────────────────────────────────
function CatalogCard({ boat, schedule, onOpen }: {
  boat:     CatalogBoat;
  schedule: ScheduleData[];
  onOpen:   () => void;
}) {
  const { from, to } = parseLocation(boat.marina_location);
  const validPhoto   = (p: string) => p && (p.startsWith('data:image') || p.startsWith('https'));
  const allPhotos    = (boat.photos || []).filter(validPhoto);
  if (validPhoto(boat.photo_url) && !allPhotos.includes(boat.photo_url)) allPhotos.unshift(boat.photo_url);
  const [photoIdx, setPhotoIdx] = useState(0);
  const hasAvail = schedule.length > 0;
  const nextDate = schedule[0];

  return (
    <div onClick={onOpen} className="group cursor-pointer bg-white rounded-[24px] overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 hover:border-blue-200 transition-all duration-300">
      <div className="relative overflow-hidden" style={{ height: 200 }}>
        {allPhotos.length > 0
          ? <img src={allPhotos[photoIdx]} alt={boat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          : <div className="w-full h-full bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center"><span className="text-5xl opacity-20">⛵</span></div>
        }
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        {allPhotos.length > 1 && (
          <>
            <button type="button" onClick={e => { e.stopPropagation(); setPhotoIdx(i => (i - 1 + allPhotos.length) % allPhotos.length); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all z-10"><ChevronLeft className="w-3.5 h-3.5" /></button>
            <button type="button" onClick={e => { e.stopPropagation(); setPhotoIdx(i => (i + 1) % allPhotos.length); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all z-10"><ChevronRight className="w-3.5 h-3.5" /></button>
            <div className="absolute top-3 right-3 bg-black/50 text-white text-[9px] font-black px-2 py-0.5 rounded-full z-10">{photoIdx + 1}/{allPhotos.length}</div>
          </>
        )}
        <div className={`absolute top-3 left-3 text-[10px] font-black uppercase px-2.5 py-1 rounded-full z-10 ${hasAvail ? 'bg-green-500 text-white' : 'bg-red-400 text-white'}`}>
          {hasAvail ? '● Disponível' : 'Esgotado'}
        </div>
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-full z-10">
          {boat.sailor.verified && <ShieldCheck className="w-3 h-3 text-green-400" />}
          <span className="text-white text-[10px] font-black truncate max-w-[120px]">{boat.sailor.name}</span>
        </div>
        {nextDate && (
          <div className="absolute bottom-3 right-3 bg-blue-900/90 text-white text-[10px] font-black px-2 py-0.5 rounded-full z-10">
            {nextDate.date.split('-').reverse().slice(0, 2).join('/')}
          </div>
        )}
      </div>
      <div className="p-4 space-y-3">
        <div>
          <div className="flex items-center gap-1 mb-1">
            <MapPin className="w-3 h-3 text-blue-400 flex-shrink-0" />
            <span className="text-blue-400 text-[11px] font-bold truncate">{boat.city}{boat.country_flag ? ` ${boat.country_flag}` : ''}</span>
          </div>
          <h3 className="font-black text-blue-900 text-lg uppercase italic leading-tight truncate">{boat.name}</h3>
        </div>
        <div className="bg-blue-900 rounded-[14px] px-3.5 py-2.5">
          <div className="flex items-center gap-2">
            <span className="text-white/90 text-xs font-black truncate flex-1">{from}</span>
            <div className="flex-shrink-0 px-1">
              {boat.duracao
                ? <span className="text-blue-300 text-[9px] font-black bg-blue-800/60 px-1.5 py-0.5 rounded-full whitespace-nowrap">⏱ {boat.duracao}</span>
                : <ArrowRight className="w-3 h-3 text-blue-400" />}
            </div>
            <span className="text-blue-200 text-xs font-black truncate flex-1 text-right">{to && to !== from ? to : from}</span>
          </div>
        </div>
        <div className="flex items-center justify-between pt-1 border-t border-gray-100">
          <span className="flex items-center gap-1 text-gray-500 text-xs font-bold"><Users className="w-3.5 h-3.5 text-gray-400" /> Até {boat.capacity}</span>
          <div className="text-right">
            <span className="text-[9px] text-gray-400 font-black uppercase block">Por pessoa</span>
            <span className="font-black text-blue-900 text-lg leading-none">{formatPrice(boat.price_per_hour, boat)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── AllTripsPage ───────────────────────────────────────────────────────────────
export function AllTripsPage({ boats, onBack, onSelectBoat }: Props) {
  const [searchQuery,  setSearchQuery]  = useState('');
  const [activeCity,   setActiveCity]   = useState<string | null>(null);
  const [activeDate,   setActiveDate]   = useState<string>('');
  const [dateDisplay,  setDateDisplay]  = useState<string>('');
  const [activePeople, setActivePeople] = useState<number | null>(null);
  const [dropOpen,     setDropOpen]     = useState(false);
  const [selectedBoat, setSelectedBoat] = useState<CatalogBoat | null>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = 'Passeios Disponíveis | NorthWindy Charters';
    return () => { document.title = 'NorthWindy Charters'; };
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setDropOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const allBookings = useMemo(() =>
    getBookings().filter(b => ['confirmed', 'completed', 'concluido'].includes(b.status)),
  []);

  const schedulesMap = useMemo(() => {
    const map = new Map<string, ScheduleData[]>();
    boats.forEach(b => map.set(b.id, buildScheduleFromBookings(b, allBookings)));
    return map;
  }, [boats, allBookings]);

  const cityTotals = useMemo(() => {
    const map: Record<string, number> = {};
    boats.forEach(b => {
      const city = (getBoatCity(b) || 'Sem cidade').toLowerCase().trim();
      map[city] = (map[city] || 0) + 1;
    });
    return map;
  }, [boats]);

  const cityDisplayName = useMemo(() => {
    const map: Record<string, string> = {};
    boats.forEach(b => {
      const raw = getBoatCity(b) || 'Sem cidade';
      const key = raw.toLowerCase().trim();
      if (!map[key]) map[key] = raw;
    });
    return map;
  }, [boats]);

  const uniqueCities = useMemo(() =>
    Object.entries(cityTotals)
      .sort((a, b) => b[1] - a[1])
      .map(([key, count]) => ({ key, label: cityDisplayName[key] || key, count })),
  [cityTotals, cityDisplayName]);

  const q = searchQuery.toLowerCase().trim();
  const filteredCities = q ? uniqueCities.filter(c => c.label.toLowerCase().includes(q)) : uniqueCities;

  const filteredBoats = useMemo(() => boats.filter(b => {
    if (activeCity) {
      const boatCity = (getBoatCity(b) || '').toLowerCase().trim();
      if (boatCity !== activeCity) return false;
    }
    if (activePeople && b.capacity < activePeople) return false;
    if (activeDate) {
      const sched = schedulesMap.get(b.id) || [];
      if (!sched.some(s => s.date === activeDate)) return false;
    }
    return true;
  }), [boats, activeCity, activePeople, activeDate, schedulesMap]);

  function handleBook(boat: CatalogBoat, date?: string, slot?: string) {
    setSelectedBoat(null);
    if (onSelectBoat) onSelectBoat(boat, date, slot);
  }

  return (
    <div className="min-h-screen bg-white">
      <style>{`* { scrollbar-width: none; -ms-overflow-style: none; } *::-webkit-scrollbar { display: none; }`}</style>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 px-6 md:px-16 py-4 flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-blue-900 font-black uppercase text-xs tracking-widest hover:gap-3 transition-all">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>
        <img src={LOGO_SRC} alt="NorthWindy" style={{ height: '112px', width: 'auto', objectFit: 'contain' }} />
        <div className="w-20" />
      </header>

      {/* Hero */}
      <section className="bg-blue-900 px-6 md:px-16 py-16 md:py-24">
        <div className="max-w-5xl mx-auto">
          <p className="text-blue-400/60 text-[10px] font-black uppercase tracking-[0.4em] mb-4">Catálogo Completo</p>
          <h1 className="text-3xl md:text-5xl font-black text-white uppercase italic leading-tight mb-3">
            Todos os Passeios <span className="text-blue-400">Disponíveis</span>
          </h1>
          <p className="text-blue-300/70 text-sm font-bold">
            {boats.length} passeio{boats.length !== 1 ? 's' : ''} · Escolha o seu destino
          </p>
        </div>
      </section>

      {/* Filtros */}
      <section className="sticky top-[105px] z-40 bg-white border-b border-gray-100 shadow-sm px-6 md:px-16 py-4">
        <div className="max-w-5xl mx-auto flex flex-wrap gap-3 items-center">

          {/* Localização */}
          <div className="relative flex-1 min-w-[160px] max-w-xs" ref={dropRef}>
            <button type="button" onClick={() => setDropOpen(v => !v)}
              className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-[12px] border-2 font-bold text-sm transition-all text-left
                ${activeCity ? 'bg-blue-900 text-white border-blue-900' : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-blue-900'}`}>
              <MapPin className={`w-4 h-4 flex-shrink-0 ${activeCity ? 'text-white/70' : 'text-gray-400'}`} />
              <span className="flex-1 truncate">{activeCity ? cityDisplayName[activeCity] || activeCity : 'Localização'}</span>
              {activeCity
                ? <span onClick={e => { e.stopPropagation(); setActiveCity(null); }}
                    className="w-5 h-5 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center flex-shrink-0 cursor-pointer">
                    <X className="w-3 h-3 text-white" />
                  </span>
                : <ChevronDown className={`w-4 h-4 flex-shrink-0 text-gray-400 transition-transform ${dropOpen ? 'rotate-180' : ''}`} />
              }
            </button>
            {dropOpen && (
              <div className="absolute left-0 top-full mt-2 bg-white rounded-[16px] shadow-2xl border border-gray-100 w-full min-w-[240px] overflow-hidden" style={{ zIndex: 9999 }}>
                <div className="p-3 border-b border-gray-100">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input autoFocus type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Cidade ou país..."
                      className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-[10px] text-sm font-bold text-blue-900 outline-none focus:border-blue-900 placeholder:text-gray-300" />
                  </div>
                </div>
                <div className="overflow-y-auto" style={{ maxHeight: 240 }}>
                  <button onClick={() => { setActiveCity(null); setDropOpen(false); setSearchQuery(''); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold hover:bg-blue-50 text-left transition-colors ${!activeCity ? 'text-blue-900 font-black bg-blue-50' : 'text-gray-600'}`}>
                    <span>🌍</span><span className="flex-1">Todos os destinos</span>
                    <span className="text-[10px] font-black text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{boats.length}</span>
                  </button>
                  <div className="h-px bg-gray-100 mx-3" />
                  {filteredCities.length === 0
                    ? <p className="text-center py-6 text-xs text-gray-300 font-black uppercase italic">Nenhum destino encontrado</p>
                    : filteredCities.map(({ key, label, count }) => (
                      <button key={key} onClick={() => { setActiveCity(key); setDropOpen(false); setSearchQuery(''); }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-blue-50 text-left transition-colors ${activeCity === key ? 'text-blue-900 font-black bg-blue-50' : 'text-gray-700 font-bold'}`}>
                        <MapPin className="w-3 h-3 text-gray-300 flex-shrink-0" />
                        <span className="flex-1">{label}</span>
                        <span className="text-[10px] font-black text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{count}</span>
                      </button>
                    ))
                  }
                  <div className="h-2" />
                </div>
              </div>
            )}
          </div>

          {/* Data */}
          <div className="relative flex-shrink-0">
            <CalendarDays className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none z-10 ${activeDate ? 'text-white' : 'text-gray-400'}`} />
            <input
              type="text"
              inputMode="numeric"
              placeholder="dd/mm/aaaa"
              value={dateDisplay}
              onChange={e => {
                let raw = e.target.value.replace(/\D/g, '');
                if (raw.length > 8) raw = raw.slice(0, 8);
                let display = raw;
                if (raw.length >= 5) display = raw.slice(0, 2) + '/' + raw.slice(2, 4) + '/' + raw.slice(4);
                else if (raw.length >= 3) display = raw.slice(0, 2) + '/' + raw.slice(2);
                setDateDisplay(display);
                if (raw.length === 8) {
                  const dd = raw.slice(0, 2), mm = raw.slice(2, 4), yyyy = raw.slice(4, 8);
                  const d = parseInt(dd), m = parseInt(mm), y = parseInt(yyyy);
                  if (d >= 1 && d <= 31 && m >= 1 && m <= 12 && y >= 2024) setActiveDate(`${yyyy}-${mm}-${dd}`);
                  else setActiveDate('');
                } else { setActiveDate(''); }
              }}
              className={`pl-9 pr-9 py-2.5 rounded-[12px] border-2 font-bold text-sm transition-all outline-none appearance-none
                ${activeDate ? 'bg-blue-900 text-white border-blue-900 placeholder:text-white/40' : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-blue-900 placeholder:text-gray-300'}`}
              style={{ minWidth: 160 }}
            />
            {(activeDate || dateDisplay) && (
              <button type="button" onClick={() => { setActiveDate(''); setDateDisplay(''); }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 z-10 w-5 h-5 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center cursor-pointer">
                <X className="w-3 h-3 text-white" />
              </button>
            )}
          </div>

          {/* Pessoas */}
          <div className="relative flex-shrink-0">
            <Users className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none z-10 ${activePeople ? 'text-white' : 'text-gray-400'}`} />
            <input
              type="text"
              inputMode="numeric"
              placeholder="Pessoas"
              value={activePeople ? String(activePeople) : ''}
              onChange={e => {
                const raw = e.target.value.replace(/\D/g, '');
                const val = raw ? parseInt(raw, 10) : null;
                setActivePeople(val && val > 0 ? val : null);
              }}
              className={`w-28 pl-9 pr-8 py-2.5 rounded-[12px] border-2 font-bold text-sm transition-all outline-none
                ${activePeople ? 'bg-blue-900 text-white border-blue-900 placeholder:text-white/60' : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-blue-900 placeholder:text-gray-400'}
                [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
            />
            {activePeople && (
              <button type="button" onClick={() => setActivePeople(null)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 z-10 w-5 h-5 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center cursor-pointer">
                <X className="w-3 h-3 text-white" />
              </button>
            )}
          </div>

          <p className="text-gray-400 text-sm font-bold ml-auto">
            {filteredBoats.length} resultado{filteredBoats.length !== 1 ? 's' : ''}
          </p>
        </div>
      </section>

      {/* Grid */}
      <section className="px-6 md:px-16 py-12">
        <div className="max-w-5xl mx-auto">
          {filteredBoats.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-6xl mb-4">🔍</p>
              <p className="font-black text-gray-300 uppercase italic text-lg">Nenhum passeio encontrado</p>
              <button onClick={() => { setActiveCity(null); setActivePeople(null); setActiveDate(''); }}
                className="mt-4 text-blue-900 font-black text-sm hover:underline">Limpar filtros</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBoats.map(boat => (
                <CatalogCard
                  key={boat.id}
                  boat={boat}
                  schedule={schedulesMap.get(boat.id) || []}
                  onOpen={() => setSelectedBoat(boat)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <footer className="border-t border-gray-100 px-6 md:px-16 py-8 text-center">
        <p className="text-gray-300 text-xs font-bold uppercase tracking-widest">
          NorthWindy Charters · Todos os passeios disponíveis
        </p>
      </footer>

      {selectedBoat && (
        <TripDetailModal boat={selectedBoat} onClose={() => setSelectedBoat(null)} onBook={handleBook} />
      )}
    </div>
  );
}