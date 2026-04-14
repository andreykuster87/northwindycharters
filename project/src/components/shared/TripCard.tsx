// src/components/ClientArea/components/TripCard.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Cards idênticos à Hero + carrossel infinito com drag/inércia
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft, ChevronRight, Users, ShieldCheck,
  CalendarDays, MapPin, Clock, ArrowRight, X,
} from 'lucide-react';
import { TimeSlotsModal } from '../modals/TimeSlotsModal';
import type { ScheduleData } from '../modals/TimeSlotsModal';
import { type CatalogBoat, formatPrice, parseLocation, buildSchedule } from '../../utils/clientHelpers';

// ── TripDetailModal ────────────────────────────────────────────────────────────
function TripDetailModal({ boat, onClose, onBook }: {
  boat:    CatalogBoat;
  onClose: () => void;
  onBook:  (boat: CatalogBoat, date?: string, slot?: string) => void;
}) {
  const { from, to } = parseLocation(boat.marina_location);
  const schedule     = buildSchedule(boat).filter(e => e.spotsLeft > 0);

  const validPhoto = (p: string) => p && (p.startsWith('data:image') || p.startsWith('https'));
  const allPhotos  = (boat.photos || []).filter(validPhoto);
  if (validPhoto(boat.photo_url) && !allPhotos.includes(boat.photo_url)) allPhotos.unshift(boat.photo_url);

  const [photoIdx, setPhotoIdx]         = useState(0);
  const [showAll,  setShowAll]           = useState(false);
  const [selDate,  setSelDate]           = useState<string | null>(null);
  const [selSlot,  setSelSlot]           = useState<string | null>(null);
  const visible = showAll ? schedule : schedule.slice(0, 4);

  const hasSlots = schedule.some(e => e.time_slots.length > 0);
  const canBook  = selDate !== null && selSlot !== null;

  function handleSlotClick(date: string, slot: string, ok: boolean) {
    if (!ok) return;
    if (selDate === date && selSlot === slot) {
      setSelDate(null); setSelSlot(null);
    } else {
      setSelDate(date); setSelSlot(slot);
    }
  }

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>

        {/* Photo with album nav */}
        <div className="relative flex-shrink-0" style={{ height: 280 }}>
          {allPhotos.length > 0
            ? <img src={allPhotos[photoIdx]} alt={boat.name} className="w-full h-full object-cover" />
            : <div className="w-full h-full bg-gradient-to-br from-[#0a1628] to-[#1a2b4a] flex items-center justify-center"><span className="text-7xl opacity-20">⛵</span></div>
          }
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <button onClick={onClose} className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2.5 rounded-full z-10"><X className="w-4 h-4" /></button>

          {allPhotos.length > 1 && (
            <>
              <button onClick={() => setPhotoIdx(i => (i - 1 + allPhotos.length) % allPhotos.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full z-10 transition-all">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setPhotoIdx(i => (i + 1) % allPhotos.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full z-10 transition-all">
                <ChevronRight className="w-4 h-4" />
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                {allPhotos.map((_, i) => <button key={i} onClick={() => setPhotoIdx(i)} className={`rounded-full transition-all ${i === photoIdx ? 'w-5 h-2 bg-white' : 'w-2 h-2 bg-white/40 hover:bg-white/70'}`} />)}
              </div>
              <div className="absolute top-4 left-4 bg-black/60 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full z-10">
                {photoIdx + 1}/{allPhotos.length}
              </div>
            </>
          )}

          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md z-10"
            style={allPhotos.length > 1 ? {} : {}}>
            {boat.sailor.verified && <ShieldCheck className="w-3 h-3 text-[#1a2b4a]" />}
            <span className="font-semibold text-[#1a2b4a] text-[10px] uppercase">{boat.sailor.name}</span>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-[#1a2b4a] uppercase italic leading-tight">{boat.name}</h2>
              {(boat.city || boat.country_name) && (
                <p className="text-sm text-gray-400 font-bold mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />{[boat.city, boat.country_name].filter(Boolean).join(', ')}
                </p>
              )}
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-[10px] font-semibold text-gray-400 uppercase">Por pessoa</p>
              <p className="text-xl font-bold text-[#1a2b4a]">{formatPrice(boat.price_per_hour, boat)}</p>
            </div>
          </div>

          {/* Rota */}
          <div className="bg-[#0a1628] px-5 py-4">
            <p className="text-[#c9a96e] text-[9px] font-semibold uppercase tracking-[0.15em] mb-3">Rota do passeio</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-[9px] text-[#c9a96e] font-semibold uppercase mb-0.5">⚓ Embarque</p>
                <p className="font-bold text-white text-sm uppercase italic leading-tight">{from}</p>
              </div>
              <div className="flex flex-col items-center flex-shrink-0 px-2">
                <div className="h-px w-6 bg-white/30" />
                {boat.duracao && <span className="text-[8px] font-semibold text-[#c9a96e] bg-white/10 px-2 py-0.5 rounded-full my-1">⏱ {boat.duracao}</span>}
                <div className="h-px w-6 bg-white/30" />
              </div>
              <div className="flex-1 min-w-0 text-right">
                <p className="text-[9px] text-[#c9a96e] font-semibold uppercase mb-0.5">🏁 Desembarque</p>
                <p className="font-bold text-gray-300 text-sm uppercase italic leading-tight">{to && to !== from ? to : from}</p>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            <span className="bg-gray-50 rounded-full px-4 py-2 text-xs font-semibold text-gray-600 flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-gray-400" /> Até {boat.capacity} pessoas</span>
            {(boat.minimo_tripulantes ?? 0) > 1 && <span className="bg-amber-50 border border-amber-200 rounded-full px-4 py-2 text-[10px] font-semibold text-amber-700">⚠️ Mín. {boat.minimo_tripulantes} confirmados</span>}
            {(boat as any).bebidas === 'inclusas' && <span className="bg-emerald-50 border border-emerald-200 rounded-full px-4 py-2 text-[10px] font-semibold text-emerald-700">🍾 Bebidas inclusas</span>}
            {(boat as any).comida  === 'inclusa'  && <span className="bg-emerald-50 border border-emerald-200 rounded-full px-4 py-2 text-[10px] font-semibold text-emerald-700">🍽️ Comida inclusa</span>}
            {(boat as any).bar    === 'tem'       && <span className="bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-[10px] font-semibold text-gray-600">🍹 Bar a bordo</span>}
          </div>

          {boat.descricao && <p className="text-sm text-gray-500 font-bold leading-relaxed">{boat.descricao}</p>}

          {/* Datas */}
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.15em] mb-3 flex items-center gap-1.5">
              <CalendarDays className="w-3.5 h-3.5" /> Datas e horários disponíveis
            </p>
            {schedule.length === 0 ? (
              <div className="bg-gray-50 p-6 text-center"><p className="text-gray-300 font-semibold text-xs uppercase italic">Sem datas disponíveis no momento</p></div>
            ) : (
              <div className="space-y-2">
                {visible.map((entry, i) => {
                  const [ey, em, ed] = entry.date.split('-');
                  const badge = entry.spotsLeft > 3 ? 'bg-green-100 text-green-700 border-green-200' : 'bg-amber-100 text-amber-700 border-amber-200';
                  return (
                    <div key={i} className="bg-[#0a1628]/5 border border-[#0a1628]/10 px-4 py-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[#1a2b4a]">{ed}/{em}/{ey}</span>
                        <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${badge}`}>{entry.spotsLeft} vaga{entry.spotsLeft !== 1 ? 's' : ''}</span>
                      </div>
                      {entry.time_slots.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {entry.time_slots.map((slot, si) => {
                            const sv = entry.slotSpots?.[slot] ?? 0;
                            const ok = sv > 0;
                            const isSelected = selDate === entry.date && selSlot === slot;
                            return (
                              <button key={si} type="button" disabled={!ok}
                                onClick={() => handleSlotClick(entry.date, slot, ok)}
                                className={`px-3 py-1.5 rounded-full border-2 text-[11px] font-semibold transition-all ${
                                  isSelected
                                    ? 'bg-[#0a1628] border-[#0a1628] text-white shadow-md scale-105'
                                    : ok
                                    ? 'bg-white border-[#c9a96e]/30 text-[#1a2b4a] hover:border-[#0a1628] hover:bg-gray-50'
                                    : 'bg-gray-50 border-gray-200 text-gray-400 opacity-50 cursor-not-allowed'
                                }`}>
                                {isSelected && '✓ '}{slot} · {ok ? `${sv} vaga${sv !== 1 ? 's' : ''}` : 'esgotado'}
                              </button>
                            );
                          })}
                        </div>
                      )}
                      {entry.time_slots.length === 0 && (
                        <button onClick={() => onBook(boat, entry.date)} className="text-xs font-semibold text-[#1a2b4a] hover:text-[#0a1628] transition-colors">
                          Reservar esta data →
                        </button>
                      )}
                    </div>
                  );
                })}
                {schedule.length > 4 && (
                  <button onClick={() => setShowAll(v => !v)} className="w-full text-center text-[11px] font-semibold text-[#c9a96e] hover:text-[#1a2b4a] transition-colors py-2 flex items-center justify-center gap-1.5">
                    <ChevronLeft className={`w-3.5 h-3.5 transition-transform ${showAll ? 'rotate-90' : '-rotate-90'}`} />
                    {showAll ? 'Mostrar menos' : `+${schedule.length - 4} datas disponíveis`}
                  </button>
                )}
              </div>
            )}
          </div>

          {hasSlots && !canBook && (
            <div className="flex items-center gap-2 bg-[#0a1628]/5 border border-[#0a1628]/10 px-4 py-3">
              <span className="text-[#c9a96e] text-sm flex-shrink-0">👆</span>
              <p className="text-[11px] font-semibold text-[#1a2b4a]">Selecione um horário acima para continuar</p>
            </div>
          )}

          <button
            disabled={hasSlots && !canBook}
            onClick={() => canBook ? onBook(boat, selDate!, selSlot!) : !hasSlots ? onBook(boat) : undefined}
            className={`w-full py-4 font-semibold uppercase tracking-widest text-sm shadow-lg transition-all flex items-center justify-center gap-2 ${
              hasSlots && !canBook
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                : 'bg-[#0a1628] hover:bg-[#0a1628]/90 text-white'
            }`}>
            {canBook
              ? <>Confirmar · {selSlot} <ArrowRight className="w-4 h-4" /></>
              : <>Reservar este Passeio <ArrowRight className="w-4 h-4" /></>
            }
          </button>
        </div>
      </div>
    </div>
  );
}

// ── HeroStyleCard — idêntico ao TripPreviewCard da Hero ──────────────────────
const HeroStyleCard = React.memo(function HeroStyleCard({ boat, schedule, onClick }: {
  boat:     CatalogBoat;
  schedule: ScheduleData[];
  onClick:  () => void;
}) {
  const { from, to } = parseLocation(boat.marina_location);
  const validPhoto   = (p: string) => p && (p.startsWith('data:image') || p.startsWith('https'));
  const allPhotos    = (boat.photos || []).filter(validPhoto);
  if (validPhoto(boat.photo_url) && !allPhotos.includes(boat.photo_url)) allPhotos.unshift(boat.photo_url);

  const [photoIdx, setPhotoIdx] = useState(0);
  const hasAvail  = schedule.length > 0;
  const nextDate  = schedule[0];

  return (
    <div
      className="overflow-hidden shadow-2xl hover:shadow-[0_24px_64px_rgba(0,0,0,0.35)] transition-all duration-300 group bg-black w-full"
      style={{ minWidth: 0 }}>

      {/* Photo */}
      <div className="relative overflow-hidden" style={{ height: 190 }}>
        {allPhotos.length > 0
          ? <img src={allPhotos[photoIdx]} alt={boat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          : <div className="w-full h-full bg-gradient-to-br from-[#0a1628] to-[#1a2b4a] flex items-center justify-center"><span className="text-5xl opacity-30">⛵</span></div>
        }
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

        {/* Album nav arrows */}
        {allPhotos.length > 1 && (
          <>
            <button
              type="button"
              onClick={e => { e.stopPropagation(); setPhotoIdx(i => (i - 1 + allPhotos.length) % allPhotos.length); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-full transition-all opacity-0 group-hover:opacity-100 z-10">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={e => { e.stopPropagation(); setPhotoIdx(i => (i + 1) % allPhotos.length); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-full transition-all opacity-0 group-hover:opacity-100 z-10">
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="absolute top-3 right-3 bg-black/60 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full z-10">
              {photoIdx + 1}/{allPhotos.length}
            </div>
          </>
        )}

        <div className={`absolute top-3 left-3 text-[10px] font-semibold uppercase px-2.5 py-1 rounded-full z-10 ${hasAvail ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
          {hasAvail ? '● Disponível' : 'Esgotado'}
        </div>
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-full z-10">
          {boat.sailor.verified && <ShieldCheck className="w-3 h-3 text-green-400 flex-shrink-0" />}
          <span className="text-white text-[11px] font-semibold truncate max-w-[150px]">{boat.sailor.name}</span>
        </div>
        {nextDate && (
          <div className="absolute bottom-3 right-3 text-[11px] font-semibold text-white bg-[#0a1628]/90 px-2 py-0.5 rounded-full backdrop-blur-sm z-10">
            {nextDate.date.split('-').reverse().slice(0, 2).join('/')}
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="bg-[#0a1628] backdrop-blur-sm px-4 pt-3.5 pb-4 space-y-2.5 cursor-pointer" onClick={onClick}>
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3 h-3 text-[#c9a96e] flex-shrink-0" />
          <span className="text-[#c9a96e] text-[11px] font-bold truncate">
            {boat.city}{boat.country_flag ? ` ${boat.country_flag}` : ''}
          </span>
        </div>
        <p className="font-bold text-white text-base uppercase italic leading-tight truncate">{boat.name}</p>

        {/* Route */}
        <div className="flex items-center gap-0 text-[11px] font-semibold">
          <span className="text-white/90 truncate flex-1 text-left">{from}</span>
          <div className="flex flex-col items-center px-2 flex-shrink-0">
            {boat.duracao
              ? <span className="text-[#c9a96e] text-[9px] font-semibold bg-white/10 px-1.5 py-0.5 rounded-full whitespace-nowrap">⏱ {boat.duracao}</span>
              : <ArrowRight className="w-3 h-3 text-[#c9a96e]" />
            }
          </div>
          <span className="text-gray-300 truncate flex-1 text-right">{to && to !== from ? to : from}</span>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <span className="flex items-center gap-1.5 text-white/50 text-[11px] font-bold">
            <Users className="w-3.5 h-3.5" /> Até {boat.capacity}
          </span>
          <div className="text-right">
            <span className="text-[9px] text-[#c9a96e] font-semibold uppercase block">Por pessoa</span>
            <span className="font-bold text-white text-lg leading-none">{formatPrice(boat.price_per_hour, boat)}</span>
          </div>
        </div>
      </div>
    </div>
  );
});

// ── TripCarousel — carrossel infinito com drag/inércia ────────────────────────
export function TripCarousel({ boats, client, onSelect }: {
  boats:    CatalogBoat[];
  client:   any;
  onSelect: (boat: CatalogBoat, date?: string, slot?: string) => void;
}) {
  const trackRef  = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const velRef    = useRef(0);
  const rafRef    = useRef(0);
  const dragging  = useRef(false);
  const startX    = useRef(0);
  const lastX     = useRef(0);
  const lastT     = useRef(0);
  const moved     = useRef(false);

  const [selectedBoat, setSelectedBoat] = useState<CatalogBoat | null>(null);

  // Build schedule map from bookings
  const schedulesMap = React.useMemo(() => {
    const map = new Map<string, ScheduleData[]>();
    boats.forEach(b => map.set(b.id, buildSchedule(b).filter(e => e.spotsLeft > 0)));
    return map;
  }, [boats]);

  const CARD_W   = 300;
  const GAP      = 16;
  const AUTO     = 0.5;          // px/frame auto-scroll
  const FRICTION = 0.93;
  const MIN_VEL  = 0.2;
  const DRAG_T   = 6;

  const track = [...boats, ...boats];
  const halfW = (CARD_W + GAP) * boats.length;

  const clamp = () => {
    let o = offsetRef.current;
    if (o < -halfW) o += halfW;
    if (o > 0)      o -= halfW;
    offsetRef.current = o;
  };

  const render = () => {
    if (trackRef.current)
      trackRef.current.style.transform = `translateX(${offsetRef.current}px)`;
  };

  const tick = () => {
    if (!dragging.current) {
      if (Math.abs(velRef.current) > MIN_VEL) {
        velRef.current    *= FRICTION;
        offsetRef.current += velRef.current;
      } else {
        velRef.current     = 0;
        offsetRef.current -= AUTO;
      }
      clamp();
      render();
    }
    rafRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [halfW]); // eslint-disable-line

  const onStart = (x: number) => {
    dragging.current = true;
    moved.current    = false;
    startX.current   = x;
    lastX.current    = x;
    lastT.current    = performance.now();
    velRef.current   = 0;
  };

  const onMove = (x: number) => {
    if (!dragging.current) return;
    const dx = x - lastX.current;
    const dt = performance.now() - lastT.current;
    if (Math.abs(x - startX.current) > DRAG_T) moved.current = true;
    offsetRef.current += dx;
    clamp();
    render();
    velRef.current = dt > 0 ? (dx / dt) * 16 : 0;
    lastX.current  = x;
    lastT.current  = performance.now();
  };

  const onEnd = () => { dragging.current = false; };

  function handleBook(boat: CatalogBoat, date?: string, slot?: string) {
    setSelectedBoat(null);
    onSelect(boat, date, slot);
  }

  if (!boats.length) return (
    <div className="bg-white border-2 border-dashed border-gray-200 p-10 text-center">
      <div className="text-4xl mb-3">🔍</div>
      <p className="font-semibold text-gray-300 uppercase italic">Nenhum passeio nesta região</p>
    </div>
  );

  return (
    <>
      <div className="space-y-2">
        <p className="text-xs font-semibold text-gray-400 uppercase px-1">
          {boats.length} passeio{boats.length !== 1 ? 's' : ''} encontrado{boats.length !== 1 ? 's' : ''}
        </p>

        <div
          className="overflow-hidden w-full select-none"
          style={{
            maskImage: 'linear-gradient(to right, transparent, black 4%, black 96%, transparent)',
            WebkitMaskImage: 'linear-gradient(to right, transparent, black 4%, black 96%, transparent)',
            cursor: 'grab',
          }}
          onMouseDown={e => onStart(e.clientX)}
          onMouseMove={e => { if (dragging.current) onMove(e.clientX); }}
          onMouseUp={onEnd}
          onMouseLeave={onEnd}
          onTouchStart={e => onStart(e.touches[0].clientX)}
          onTouchMove={e => { e.preventDefault(); onMove(e.touches[0].clientX); }}
          onTouchEnd={onEnd}
        >
          <div
            ref={trackRef}
            className="flex py-4"
            style={{ gap: GAP, width: 'max-content', willChange: 'transform' }}
          >
            {track.map((boat, i) => (
              <div
                key={`${boat.id}-${i}`}
                style={{ flexShrink: 0 }}
                onClick={() => { if (!moved.current) setSelectedBoat(boat); }}
              >
                <HeroStyleCard
                  boat={boat}
                  schedule={schedulesMap.get(boat.id) || []}
                  onClick={() => { if (!moved.current) setSelectedBoat(boat); }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedBoat && (
        <TripDetailModal
          boat={selectedBoat}
          onClose={() => setSelectedBoat(null)}
          onBook={handleBook}
        />
      )}
    </>
  );
}

// ── TripGrid — grid estático sem carrossel (padrão das outras abas) ───────────
export function TripGrid({ boats, onSelect }: {
  boats:    CatalogBoat[];
  onSelect: (boat: CatalogBoat, date?: string, slot?: string) => void;
}) {
  const [selectedBoat, setSelectedBoat] = useState<CatalogBoat | null>(null);

  const schedulesMap = React.useMemo(() => {
    const map = new Map<string, ScheduleData[]>();
    boats.forEach(b => map.set(b.id, buildSchedule(b).filter(e => e.spotsLeft > 0)));
    return map;
  }, [boats]);

  if (!boats.length) return (
    <div className="bg-white border-2 border-dashed border-gray-200 p-10 text-center">
      <div className="text-4xl mb-3">🔍</div>
      <p className="font-semibold text-gray-300 text-sm uppercase">Nenhum passeio nesta região</p>
    </div>
  );

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {boats.map(boat => (
          <HeroStyleCard
            key={boat.id}
            boat={boat}
            schedule={schedulesMap.get(boat.id) || []}
            onClick={() => setSelectedBoat(boat)}
          />
        ))}
      </div>

      {selectedBoat && (
        <TripDetailModal
          boat={selectedBoat}
          onClose={() => setSelectedBoat(null)}
          onBook={(b, date, slot) => { setSelectedBoat(null); onSelect(b, date, slot); }}
        />
      )}
    </>
  );
}

// ── TripCard legado — mantido para compatibilidade com qualquer uso directo ───
export function TripCard({ boat, client, onSelect }: {
  boat:     CatalogBoat;
  client:   any;
  onSelect: (boat: CatalogBoat, date?: string, slot?: string) => void;
}) {
  const [selectedBoat, setSelectedBoat] = useState<CatalogBoat | null>(null);
  const schedule = buildSchedule(boat).filter(e => e.spotsLeft > 0);

  return (
    <>
      <HeroStyleCard
        boat={boat}
        schedule={schedule}
        onClick={() => setSelectedBoat(boat)}
      />
      {selectedBoat && (
        <TripDetailModal
          boat={selectedBoat}
          onClose={() => setSelectedBoat(null)}
          onBook={(b, date, slot) => { setSelectedBoat(null); onSelect(b, date, slot); }}
        />
      )}
    </>
  );
}
