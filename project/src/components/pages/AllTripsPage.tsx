// src/components/AllTripsPage.tsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ArrowLeft, MapPin, Search, X, ChevronDown, Users,
  CalendarDays, ShieldCheck, ArrowRight, ChevronLeft, ChevronRight,
  Clock, Anchor, SlidersHorizontal, Expand,
} from 'lucide-react';
import { Lightbox } from '../shared/EventosLightbox';
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
      <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="relative flex-shrink-0 bg-[#060e1e]" style={{ maxHeight: 420 }}>
          {allPhotos.length > 0
            ? <img src={allPhotos[photoIdx]} alt={boat.name} className="w-full object-contain" style={{ maxHeight: 420, display: 'block' }} />
            : <div className="w-full flex items-center justify-center" style={{ height: 300 }}><span className="text-7xl opacity-20">⛵</span></div>
          }
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
          <button onClick={onClose} className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 text-white p-2.5 rounded-full z-10 transition-colors"><X className="w-4 h-4" /></button>
          {allPhotos.length > 1 && (
            <>
              <button onClick={() => setPhotoIdx(i => (i - 1 + allPhotos.length) % allPhotos.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full z-10 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
              <button onClick={() => setPhotoIdx(i => (i + 1) % allPhotos.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full z-10 transition-colors"><ChevronRight className="w-4 h-4" /></button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                {allPhotos.map((_, i) => <button key={i} onClick={() => setPhotoIdx(i)} className={`rounded-full transition-all ${i === photoIdx ? 'w-5 h-2 bg-white' : 'w-2 h-2 bg-white/40'}`} />)}
              </div>
            </>
          )}
          <div className="absolute top-4 left-4 bg-white/95 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md z-10">
            {boat.sailor.verified && <ShieldCheck className="w-3 h-3 text-[#1a2b4a]" />}
            <span className="font-semibold text-[#1a2b4a] text-[10px] uppercase tracking-wide">{boat.sailor.name}</span>
          </div>
        </div>
        <div className="p-6 space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#1a2b4a] leading-tight">{boat.name}</h2>
              {(boat.city || boat.country_name) && (
                <p className="text-sm text-gray-400 mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />{[boat.city, boat.country_name].filter(Boolean).join(', ')}
                </p>
              )}
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-[10px] font-medium text-gray-400 uppercase">Por pessoa</p>
              <p className="text-xl font-bold text-[#1a2b4a]">{formatPrice(boat.price_per_hour, boat)}</p>
            </div>
          </div>

          {/* Rota */}
          <div className="bg-[#1a2b4a] rounded-xl px-5 py-4">
            <p className="text-blue-300/70 text-[9px] font-semibold uppercase tracking-widest mb-3">Rota do passeio</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-[9px] text-blue-300/60 font-semibold uppercase mb-0.5">Embarque</p>
                <p className="font-semibold text-white text-sm">{from}</p>
              </div>
              <div className="flex flex-col items-center flex-shrink-0 px-2">
                <div className="h-px w-12 bg-[#c9a96e]/40" />
                {boat.duracao && (
                  <div className="flex flex-col items-center my-2 bg-[#c9a96e]/10 border border-[#c9a96e]/30 px-3 py-1.5 gap-0.5">
                    <Clock className="w-4 h-4 text-[#c9a96e]" />
                    <span className="text-[13px] font-['Playfair_Display'] font-bold text-[#c9a96e] leading-none">
                      {boat.duracao}
                    </span>
                    <span className="text-[8px] font-semibold text-white/40 uppercase tracking-widest">duração</span>
                  </div>
                )}
                <div className="h-px w-12 bg-[#c9a96e]/40" />
              </div>
              <div className="flex-1 min-w-0 text-right">
                <p className="text-[9px] text-blue-300/60 font-semibold uppercase mb-0.5">Desembarque</p>
                <p className="font-semibold text-blue-100 text-sm">{to && to !== from ? to : from}</p>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            <span className="bg-gray-50 border border-gray-100 rounded-full px-4 py-2 text-xs font-medium text-gray-600 flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-gray-400" /> Até {boat.capacity} pessoas</span>
            {(boat.minimo_tripulantes ?? 0) > 1 && <span className="bg-amber-50 border border-amber-200 rounded-full px-4 py-2 text-[10px] font-medium text-amber-700">Min. {boat.minimo_tripulantes} confirmados</span>}
            {(boat as any).bebidas === 'inclusas' && <span className="bg-emerald-50 border border-emerald-200 rounded-full px-4 py-2 text-[10px] font-medium text-emerald-700">Bebidas inclusas</span>}
            {(boat as any).comida  === 'inclusa'  && <span className="bg-emerald-50 border border-emerald-200 rounded-full px-4 py-2 text-[10px] font-medium text-emerald-700">Comida inclusa</span>}
            {(boat as any).bar    === 'tem'       && <span className="bg-blue-50 border border-blue-200 rounded-full px-4 py-2 text-[10px] font-medium text-blue-700">Bar a bordo</span>}
          </div>

          {boat.descricao && <p className="text-sm text-gray-500 leading-relaxed">{boat.descricao}</p>}

          {/* Datas */}
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <CalendarDays className="w-3.5 h-3.5" /> Datas e horários disponíveis
            </p>
            {schedule.length === 0
              ? <div className="bg-gray-50 rounded-xl p-6 text-center"><p className="text-gray-300 font-medium text-xs uppercase">Sem datas disponíveis no momento</p></div>
              : <div className="space-y-2">
                  {visible.map((entry, i) => {
                    const [ey, em, ed] = entry.date.split('-');
                    const badge = entry.spotsLeft > 3 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200';
                    return (
                      <div key={i} className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-[#1a2b4a]">{ed}/{em}/{ey}</span>
                          <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${badge}`}>{entry.spotsLeft} vaga{entry.spotsLeft !== 1 ? 's' : ''}</span>
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
                                  className={`px-3 py-1.5 rounded-full border text-[11px] font-medium transition-all ${
                                    isSel
                                      ? 'bg-[#1a2b4a] border-[#1a2b4a] text-white shadow-md'
                                      : ok
                                      ? 'bg-white border-gray-200 text-[#1a2b4a] hover:border-[#1a2b4a]'
                                      : 'bg-gray-50 border-gray-200 text-gray-400 opacity-50 cursor-not-allowed'
                                  }`}>
                                  {isSel ? '✓ ' : ''}{slot} · {ok ? `${sv} vaga${sv !== 1 ? 's' : ''}` : 'esgotado'}
                                </button>
                              );
                            })}
                          </div>
                        )}
                        {entry.time_slots.length === 0 && (
                          <button onClick={() => onBook(boat, entry.date)} className="text-xs font-medium text-[#1a2b4a] hover:text-[#2a3f6a] transition-colors">Reservar esta data →</button>
                        )}
                      </div>
                    );
                  })}
                  {schedule.length > 4 && (
                    <button onClick={() => setShowAll(v => !v)} className="w-full text-center text-[11px] font-medium text-gray-500 hover:text-[#1a2b4a] py-2">
                      {showAll ? 'Mostrar menos' : `+${schedule.length - 4} datas`}
                    </button>
                  )}
                </div>
            }
          </div>
          {hasSlots && !canBook && (
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
              <span className="text-gray-400 text-sm">👆</span>
              <p className="text-[11px] font-medium text-gray-500">Selecione um horário acima para continuar</p>
            </div>
          )}
          <button
            disabled={hasSlots && !canBook}
            onClick={() => {
              if (canBook) { onBook(boat, selDate!, selSlot!); }
              else if (!hasSlots) { onBook(boat); }
            }}
            className={`w-full py-4 rounded-xl font-semibold uppercase tracking-wider text-sm transition-all flex items-center justify-center gap-2 ${
              hasSlots && !canBook
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-[#1a2b4a] hover:bg-[#243a5e] text-white shadow-lg'
            }`}>
            <span>{canBook ? `Confirmar · ${selSlot}` : 'Reservar este Passeio'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── FeaturedCard (yacht-style compact card for carousel) ──────────────────────
function FeaturedCard({ boat, schedule, onOpen }: {
  boat:     CatalogBoat;
  schedule: ScheduleData[];
  onOpen:   () => void;
}) {
  const { from, to } = parseLocation(boat.marina_location);
  const validPhoto   = (p: string) => p && (p.startsWith('data:image') || p.startsWith('https'));
  const allPhotos    = (boat.photos || []).filter(validPhoto);
  if (validPhoto(boat.photo_url) && !allPhotos.includes(boat.photo_url)) allPhotos.unshift(boat.photo_url);
  const hasAvail = schedule.length > 0;

  return (
    <div onClick={onOpen} className="group cursor-pointer flex-shrink-0 bg-white overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl" style={{ width: 290, boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
      {/* Photo */}
      <div className="relative overflow-hidden" style={{ height: 220 }}>
        {allPhotos.length > 0
          ? <img src={allPhotos[0]} alt={boat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          : <div className="w-full h-full bg-gradient-to-br from-[#0a1628] to-[#1a2b4a] flex items-center justify-center"><span className="text-5xl opacity-20">⛵</span></div>
        }
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
        {/* Price badge */}
        <div className="absolute bottom-3 right-3 bg-white/95 px-2.5 py-1 text-[11px] font-bold text-[#1a2b4a]">
          {formatPrice(boat.price_per_hour, boat)}
        </div>
        {boat.sailor.verified && (
          <div className="absolute top-3 left-3 bg-[#c9a96e] w-7 h-7 flex items-center justify-center">
            <ShieldCheck className="w-3.5 h-3.5 text-white" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#c9a96e] mb-1.5">
          {boat.boat_type || 'Passeio'}{boat.city ? ` · ${boat.city}` : ''}
        </p>
        <h3 className="font-['Playfair_Display'] font-bold text-[16px] text-[#1a2b4a] leading-tight mb-2 truncate">{boat.name}</h3>
        <div className="flex items-center gap-3 text-[11px] text-gray-400">
          <span className="flex items-center gap-1"><Users className="w-3 h-3" />{boat.capacity} pessoas</span>
          {boat.duracao && <span>{boat.duracao}</span>}
        </div>
        <div className="mt-3 pt-3 border-t border-gray-100">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-[#c9a96e] flex items-center gap-1">
            VER PASSEIO <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
}

// ── CatalogCard (yacht-style grid card) ───────────────────────────────────────
function CatalogCard({ boat, schedule, onOpen }: {
  boat:     CatalogBoat;
  schedule: ScheduleData[];
  onOpen:   () => void;
}) {
  const { from, to } = parseLocation(boat.marina_location);
  const validPhoto   = (p: string) => p && (p.startsWith('data:image') || p.startsWith('https'));
  const allPhotos    = (boat.photos || []).filter(validPhoto);
  if (validPhoto(boat.photo_url) && !allPhotos.includes(boat.photo_url)) allPhotos.unshift(boat.photo_url);
  const [photoIdx,    setPhotoIdx]    = useState(0);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  return (
    <>
      {lightboxIdx !== null && allPhotos.length > 0 && (
        <Lightbox photos={allPhotos} index={lightboxIdx} onClose={() => setLightboxIdx(null)} />
      )}

      <div onClick={onOpen} className="group cursor-pointer bg-white overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>

        {/* ── Foto full ─────────────────────────────────── */}
        <div className="relative overflow-hidden" style={{ height: 260 }}>
          {allPhotos.length > 0
            ? <img src={allPhotos[photoIdx]} alt={boat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            : <div className="w-full h-full bg-gradient-to-br from-[#0a1628] to-[#1a2b4a] flex items-center justify-center"><span className="text-6xl opacity-20">⛵</span></div>
          }

          {/* Gradiente base */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

          {/* Botão expandir lightbox */}
          {allPhotos.length > 0 && (
            <button
              type="button"
              onClick={e => { e.stopPropagation(); setLightboxIdx(photoIdx); }}
              className="absolute top-3 right-3 bg-black/40 hover:bg-[#c9a96e] text-white p-2 opacity-0 group-hover:opacity-100 transition-all z-10"
              title="Ver foto ampliada"
            >
              <Expand className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Setas de navegação entre fotos */}
          {allPhotos.length > 1 && (
            <>
              <button type="button" onClick={e => { e.stopPropagation(); setPhotoIdx(i => (i - 1 + allPhotos.length) % allPhotos.length); }}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white p-1.5 opacity-0 group-hover:opacity-100 transition-all z-10">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button type="button" onClick={e => { e.stopPropagation(); setPhotoIdx(i => (i + 1) % allPhotos.length); }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white p-1.5 opacity-0 group-hover:opacity-100 transition-all z-10">
                <ChevronRight className="w-4 h-4" />
              </button>
              {/* Dots */}
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                {allPhotos.map((_, i) => (
                  <button key={i} type="button" onClick={e => { e.stopPropagation(); setPhotoIdx(i); }}
                    className={`h-1 transition-all ${i === photoIdx ? 'w-4 bg-[#c9a96e]' : 'w-1.5 bg-white/40'}`} />
                ))}
              </div>
            </>
          )}

          {/* Badge preço */}
          <div className="absolute bottom-3 right-3 bg-white/95 px-3 py-1 text-[12px] font-bold text-[#1a2b4a]">
            {formatPrice(boat.price_per_hour, boat)}
          </div>

          {/* Verificado */}
          {boat.sailor.verified && (
            <div className="absolute top-3 left-3 bg-[#c9a96e] w-7 h-7 flex items-center justify-center z-10">
              <ShieldCheck className="w-3.5 h-3.5 text-white" />
            </div>
          )}

          {/* Contador de fotos */}
          {allPhotos.length > 1 && (
            <div className="absolute bottom-3 left-3 bg-black/50 text-white text-[9px] font-semibold px-2 py-0.5 uppercase tracking-wider">
              {photoIdx + 1}/{allPhotos.length}
            </div>
          )}
        </div>

        {/* ── Info ──────────────────────────────────────── */}
        <div className="p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#c9a96e] mb-2">
            {boat.boat_type || 'Passeio'}{boat.city ? ` · ${boat.city}` : ''}{boat.country_flag ? ` ${boat.country_flag}` : ''}
          </p>
          <h3 className="font-['Playfair_Display'] text-xl font-bold text-[#1a2b4a] leading-tight mb-3">{boat.name}</h3>
          <div className="flex flex-wrap gap-3 text-[11px] text-gray-400 mb-4">
            <span className="flex items-center gap-1"><Users className="w-3 h-3" />{boat.capacity} passageiros</span>
            {boat.duracao && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{boat.duracao}</span>}
            {from && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{from}{to && to !== from ? ` → ${to}` : ''}</span>}
          </div>
          <div className="pt-3 border-t border-gray-100">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-[#c9a96e] flex items-center gap-1.5">
              VER PASSEIO <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

// ── FilterPill ────────────────────────────────────────────────────────────────
function FilterPill({ label, active, onClick }: { label: string; active?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full border text-sm font-medium transition-all whitespace-nowrap ${
        active
          ? 'bg-[#1a2b4a] text-white border-[#1a2b4a]'
          : 'bg-white text-gray-600 border-gray-200 hover:border-[#1a2b4a] hover:text-[#1a2b4a]'
      }`}
    >
      {label}
    </button>
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
  const [sortBy,         setSortBy]         = useState<'price' | 'capacity' | 'name'>('price');
  const [sortOpen,       setSortOpen]       = useState(false);
  const [featuredIdx,    setFeaturedIdx]    = useState(0);
  const [activeFilter,   setActiveFilter]   = useState<string | null>(null);
  const [activeActivity,  setActiveActivity]  = useState<string | null>(null);
  const [activityOpen,    setActivityOpen]    = useState(false);
  const dropRef     = useRef<HTMLDivElement>(null);
  const sortRef     = useRef<HTMLDivElement>(null);
  const activityRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = 'Passeios Disponíveis | NorthWindy Charters';
    return () => { document.title = 'NorthWindy Charters'; };
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setDropOpen(false);
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false);
      if (activityRef.current && !activityRef.current.contains(e.target as Node)) setActivityOpen(false);
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

  const filteredBoats = useMemo(() => {
    let result = boats.filter(b => {
      if (activeCity) {
        const boatCity = (getBoatCity(b) || '').toLowerCase().trim();
        if (boatCity !== activeCity) return false;
      }
      if (activePeople && b.capacity < activePeople) return false;
      if (activeDate) {
        const sched = schedulesMap.get(b.id) || [];
        if (!sched.some(s => s.date === activeDate)) return false;
      }
      if (activeActivity) {
        const search = [b.name, b.descricao, b.boat_type, b.marina_location].filter(Boolean).join(' ').toLowerCase();
        if (!search.includes(activeActivity.toLowerCase())) return false;
      }
      return true;
    });

    result.sort((a, b) => {
      if (sortBy === 'price') return (a.price_per_hour || 0) - (b.price_per_hour || 0);
      if (sortBy === 'capacity') return (b.capacity || 0) - (a.capacity || 0);
      return a.name.localeCompare(b.name);
    });

    return result;
  }, [boats, activeCity, activePeople, activeDate, schedulesMap, sortBy]);

  // Featured boats = first 6 with photos
  const featuredBoats = useMemo(() =>
    boats.filter(b => {
      const validPhoto = (p: string) => p && (p.startsWith('data:image') || p.startsWith('https'));
      return validPhoto(b.photo_url) || (b.photos || []).some(validPhoto);
    }).slice(0, 8),
  [boats]);

  const CARDS_VISIBLE = 4;
  const maxFeaturedIdx = Math.max(0, featuredBoats.length - CARDS_VISIBLE);

  function handleBook(boat: CatalogBoat, date?: string, slot?: string) {
    setSelectedBoat(null);
    if (onSelectBoat) onSelectBoat(boat, date, slot);
  }

  const hasActiveFilters = activeCity || activePeople || activeDate || activeActivity;

  const sortLabels: Record<string, string> = { price: 'Por Preço', capacity: 'Por Capacidade', name: 'Por Nome' };

  return (
    <div className="min-h-screen bg-white">
      <style>{`* { scrollbar-width: none; -ms-overflow-style: none; } *::-webkit-scrollbar { display: none; }`}</style>

      {/* ─── Header ─── */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 px-6 md:px-16 py-3 flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-[#1a2b4a] font-medium text-sm tracking-wide hover:gap-3 transition-all">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>
        <img src={LOGO_SRC} alt="NorthWindy" style={{ height: '80px', width: 'auto', objectFit: 'contain' }} />
        <div className="w-20" />
      </header>

      {/* ─── Featured Section ─── */}
      {featuredBoats.length > 0 && (
        <section className="px-6 md:px-16 pt-12 pb-8">
          <div className="max-w-6xl mx-auto">
            {/* Title row with nav arrows */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#c9a96e] mb-2">LINHA D'ÁGUA</p>
                <h2 className="font-['Playfair_Display'] text-3xl md:text-4xl font-bold text-[#1a2b4a]">
                  Passeios em Destaque
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFeaturedIdx(i => Math.max(0, i - 1))}
                  disabled={featuredIdx === 0}
                  className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${
                    featuredIdx === 0
                      ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                      : 'border-[#1a2b4a] text-[#1a2b4a] hover:bg-[#1a2b4a] hover:text-white'
                  }`}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setFeaturedIdx(i => Math.min(maxFeaturedIdx, i + 1))}
                  disabled={featuredIdx >= maxFeaturedIdx}
                  className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${
                    featuredIdx >= maxFeaturedIdx
                      ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                      : 'border-[#1a2b4a] text-[#1a2b4a] hover:bg-[#1a2b4a] hover:text-white'
                  }`}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Carousel track */}
            <div className="overflow-hidden">
              <div
                className="flex gap-6 transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${featuredIdx * (290 + 24)}px)` }}
              >
                {featuredBoats.map(boat => (
                  <FeaturedCard
                    key={boat.id}
                    boat={boat}
                    schedule={schedulesMap.get(boat.id) || []}
                    onOpen={() => setSelectedBoat(boat)}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─── Filter Bar ─── */}
      <section className="sticky top-[89px] z-40 bg-white border-b border-gray-100 px-6 md:px-16 py-4">
        <div className="max-w-6xl mx-auto flex items-center gap-3 overflow-x-auto">
          {/* Location filter */}
          <div className="relative" ref={dropRef}>
            <FilterPill
              label={activeCity ? (cityDisplayName[activeCity] || activeCity) : 'Localização'}
              active={!!activeCity}
              onClick={() => { setDropOpen(v => !v); setActiveFilter(activeFilter === 'location' ? null : 'location'); }}
            />
            {dropOpen && (
              <div className="absolute left-0 top-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 w-64 overflow-hidden z-[100]">
                <div className="p-3 border-b border-gray-100">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input autoFocus type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Buscar cidade..."
                      className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-[#1a2b4a] outline-none focus:border-[#1a2b4a] placeholder:text-gray-300" />
                  </div>
                </div>
                <div className="overflow-y-auto" style={{ maxHeight: 240 }}>
                  <button onClick={() => { setActiveCity(null); setDropOpen(false); setSearchQuery(''); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50 text-left transition-colors ${!activeCity ? 'text-[#1a2b4a] font-semibold bg-gray-50' : 'text-gray-600'}`}>
                    <span className="flex-1">Todos os destinos</span>
                    <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{boats.length}</span>
                  </button>
                  <div className="h-px bg-gray-100 mx-3" />
                  {filteredCities.length === 0
                    ? <p className="text-center py-6 text-xs text-gray-300">Nenhum destino encontrado</p>
                    : filteredCities.map(({ key, label, count }) => (
                      <button key={key} onClick={() => { setActiveCity(key); setDropOpen(false); setSearchQuery(''); }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 text-left transition-colors ${activeCity === key ? 'text-[#1a2b4a] font-semibold bg-gray-50' : 'text-gray-600'}`}>
                        <MapPin className="w-3 h-3 text-gray-300 flex-shrink-0" />
                        <span className="flex-1">{label}</span>
                        <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{count}</span>
                      </button>
                    ))
                  }
                </div>
              </div>
            )}
          </div>

          {/* Activity filter */}
          <div className="relative flex-shrink-0" ref={activityRef}>
            <button
              onClick={() => setActivityOpen(v => !v)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all whitespace-nowrap ${
                activeActivity
                  ? 'bg-[#1a2b4a] text-white border-[#1a2b4a]'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-[#1a2b4a] hover:text-[#1a2b4a]'
              }`}
            >
              <span className="text-sm">🎯</span>
              <span>{activeActivity
                ? [
                    { key: 'orla', label: 'Passeio pela Orla' },
                    { key: 'sunset', label: 'Sunset' },
                    { key: 'pesca', label: 'Pescaria' },
                    { key: 'mergulho', label: 'Mergulho & Snorkel' },
                    { key: 'day use', label: 'Day Use com Almoço' },
                    { key: 'wakesurf', label: 'Wakesurf' },
                    { key: 'festa', label: 'Festa a Bordo' },
                    { key: 'veleiro', label: 'Passeio de Veleiro' },
                    { key: 'ilha', label: 'Tour pelas Ilhas' },
                  ].find(a => a.key === activeActivity)?.label || activeActivity
                : 'Atividade'}</span>
              {activeActivity
                ? <span onClick={e => { e.stopPropagation(); setActiveActivity(null); }}
                    className="w-4 h-4 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center cursor-pointer">
                    <X className="w-3 h-3" />
                  </span>
                : <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${activityOpen ? 'rotate-180' : ''}`} />
              }
            </button>
            {activityOpen && (
              <div className="absolute left-0 top-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 min-w-[220px] overflow-hidden z-[100]">
                <div className="overflow-y-auto" style={{ maxHeight: '280px' }}>
                  <button onClick={() => { setActiveActivity(null); setActivityOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50 text-left transition-colors ${!activeActivity ? 'text-[#1a2b4a] font-semibold bg-gray-50' : 'text-gray-600'}`}>
                    <span>🎯</span><span className="flex-1">Todas as atividades</span>
                  </button>
                  <div className="h-px bg-gray-100 mx-3" />
                  {[
                    { key: 'orla', label: 'Passeio pela Orla', icon: '🚤' },
                    { key: 'sunset', label: 'Sunset', icon: '🌅' },
                    { key: 'pesca', label: 'Pescaria', icon: '🎣' },
                    { key: 'mergulho', label: 'Mergulho & Snorkel', icon: '🤿' },
                    { key: 'day use', label: 'Day Use com Almoço', icon: '🍽️' },
                    { key: 'wakesurf', label: 'Wakesurf', icon: '🏄' },
                    { key: 'festa', label: 'Festa a Bordo', icon: '🎉' },
                    { key: 'veleiro', label: 'Passeio de Veleiro', icon: '⛵' },
                    { key: 'ilha', label: 'Tour pelas Ilhas', icon: '🏝️' },
                  ].map(act => (
                    <button key={act.key} onClick={() => { setActiveActivity(act.key); setActivityOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 text-left transition-colors ${activeActivity === act.key ? 'text-[#1a2b4a] font-semibold bg-gray-50' : 'text-gray-600'}`}>
                      <span>{act.icon}</span>
                      <span className="flex-1">{act.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <FilterPill label="Preço" active={false} onClick={() => {
            setSortBy('price');
          }} />

          {/* Capacity filter inline */}
          <div className="relative flex-shrink-0">
            <div className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-gray-200 bg-white hover:border-[#1a2b4a] transition-all">
              <Users className="w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                inputMode="numeric"
                placeholder="Capacidade"
                value={activePeople ? String(activePeople) : ''}
                onChange={e => {
                  const raw = e.target.value.replace(/\D/g, '');
                  const val = raw ? parseInt(raw, 10) : null;
                  setActivePeople(val && val > 0 ? val : null);
                }}
                className="w-20 text-sm font-medium text-gray-600 outline-none bg-transparent placeholder:text-gray-400
                  [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              {activePeople && (
                <button onClick={() => setActivePeople(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Date filter inline */}
          <div className="relative flex-shrink-0">
            <div className={`flex items-center gap-1.5 px-4 py-2 rounded-full border transition-all ${activeDate ? 'border-[#1a2b4a] bg-[#1a2b4a]' : 'border-gray-200 bg-white hover:border-[#1a2b4a]'}`}>
              <CalendarDays className={`w-3.5 h-3.5 ${activeDate ? 'text-white/70' : 'text-gray-400'}`} />
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
                className={`w-24 text-sm font-medium outline-none bg-transparent
                  ${activeDate ? 'text-white placeholder:text-white/40' : 'text-gray-600 placeholder:text-gray-400'}`}
              />
              {(activeDate || dateDisplay) && (
                <button onClick={() => { setActiveDate(''); setDateDisplay(''); }}
                  className={`${activeDate ? 'text-white/70 hover:text-white' : 'text-gray-400 hover:text-gray-600'}`}>
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Clear all */}
          {hasActiveFilters && (
            <button
              onClick={() => { setActiveCity(null); setActivePeople(null); setActiveDate(''); setDateDisplay(''); setActiveActivity(null); }}
              className="text-xs font-medium text-red-400 hover:text-red-600 whitespace-nowrap transition-colors"
            >
              Limpar filtros
            </button>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Sort dropdown */}
          <div className="relative flex-shrink-0" ref={sortRef}>
            <button
              onClick={() => setSortOpen(v => !v)}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-white hover:border-[#1a2b4a] text-sm font-medium text-gray-600 transition-all whitespace-nowrap"
            >
              <span className="text-[11px] text-gray-400">Sort</span>
              <span className="text-[#1a2b4a]">{sortLabels[sortBy]}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
            </button>
            {sortOpen && (
              <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-[100] min-w-[160px]">
                {(['price', 'capacity', 'name'] as const).map(key => (
                  <button key={key} onClick={() => { setSortBy(key); setSortOpen(false); }}
                    className={`w-full px-4 py-2.5 text-sm text-left hover:bg-gray-50 transition-colors ${sortBy === key ? 'text-[#1a2b4a] font-semibold bg-gray-50' : 'text-gray-600'}`}>
                    {sortLabels[key]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── Grid ─── */}
      <section className="px-6 md:px-16 py-12">
        <div className="max-w-6xl mx-auto">
          <p className="text-sm text-gray-400 mb-8">
            {filteredBoats.length} resultado{filteredBoats.length !== 1 ? 's' : ''}
          </p>

          {filteredBoats.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-5xl mb-4 opacity-30">⛵</p>
              <p className="font-serif text-xl text-gray-300">Nenhum passeio encontrado</p>
              <button onClick={() => { setActiveCity(null); setActivePeople(null); setActiveDate(''); setDateDisplay(''); setActiveActivity(null); }}
                className="mt-4 text-[#1a2b4a] font-medium text-sm hover:underline">Limpar filtros</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
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

      {/* ─── Footer ─── */}
      <footer className="border-t border-gray-100 px-6 md:px-16 py-8 text-center">
        <p className="text-gray-300 text-xs font-medium uppercase tracking-widest">
          NorthWindy Charters · Todos os passeios disponíveis
        </p>
      </footer>

      {selectedBoat && (
        <TripDetailModal boat={selectedBoat} onClose={() => setSelectedBoat(null)} onBook={handleBook} />
      )}
    </div>
  );
}
