import React, { useRef, useState, useMemo } from 'react';
import {
  ChevronLeft, ChevronRight, CalendarDays,
  MapPin, Users, ShieldCheck, Expand,
} from 'lucide-react';
import { Lightbox } from '../shared/EventosLightbox';
import type { CatalogBoat } from '../../services/catalog';
import type { ScheduleData } from '../modals/TimeSlotsModal';
import {
  formatPrice,
  parseLocation,
  buildScheduleFromBookings,
} from '../../utils/catalogUtils';
import { getBookings, getPublicEvents, type NauticEvent } from '../../lib/localStore';
import { TripDetailModal } from '../modals/TripDetailModal';
import { TIPO_EMOJI } from '../shared/EventosMuralShared';
import { useNavigate } from 'react-router-dom';

/* ─────────────────── Agenda helpers ─────────────────── */

const WEEKDAYS_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS_SHORT   = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

function agendaParseDate(str: string): Date | null {
  try { return new Date(str + 'T12:00:00'); } catch { return null; }
}
function agendaFmtDate(str: string) {
  const d = agendaParseDate(str);
  if (!d) return str;
  return `${String(d.getDate()).padStart(2, '0')} ${MONTHS_SHORT[d.getMonth()]}`;
}
function agendaFmtDay(str: string) {
  const d = agendaParseDate(str);
  return d ? WEEKDAYS_SHORT[d.getDay()] : '';
}
function agendaWithinDays(str: string, days: number) {
  const d = agendaParseDate(str);
  if (!d) return false;
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const end = new Date(now); end.setDate(end.getDate() + days);
  return d >= now && d <= end;
}

const AGENDA_STRIPE: Record<string, string> = {
  Regata: '#3b82f6', Passeio: '#c9a96e', Festa: '#a855f7',
  Workshop: '#22c55e', Travessia: '#14b8a6', Pesca: '#f97316', Outro: '#9ca3af',
};

function AgendaPanel() {
  const navigate = useNavigate();
  const events = useMemo(() => {
    return getPublicEvents()
      .filter(ev => agendaWithinDays(ev.date, 14))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 5);
  }, []);

  const today = new Date().getDay();

  return (
    <div className="flex flex-col bg-white border border-gray-100 overflow-hidden flex-shrink-0 w-full lg:w-[320px] xl:w-[380px]"
      style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>

      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-100 flex items-end justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <CalendarDays className="w-3 h-3 text-[#c9a96e]" />
            <p className="text-[9px] font-semibold text-[#c9a96e] uppercase tracking-[0.18em]">Próximos eventos</p>
          </div>
          <h3 className="font-['Playfair_Display'] font-bold text-[#1a2b4a] text-sm leading-tight">
            Agenda da Semana
          </h3>
        </div>
        <button
          onClick={() => navigate('/passeios')}
          className="text-[9px] font-semibold text-[#c9a96e] uppercase tracking-wider hover:text-[#1a2b4a] transition-colors flex items-center gap-0.5 flex-shrink-0 group"
        >
          Ver tudo
          <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Days strip */}
      <div className="flex border-b border-gray-100">
        {WEEKDAYS_SHORT.map((d, i) => (
          <div key={d} className={`flex-1 py-1.5 text-center ${i === today ? 'bg-[#0a1628]' : 'bg-gray-50/70'}`}>
            <span className={`text-[8px] font-semibold uppercase tracking-wider ${i === today ? 'text-[#c9a96e]' : 'text-gray-300'}`}>
              {d}
            </span>
          </div>
        ))}
      </div>

      {/* Events */}
      <div className="flex-1 divide-y divide-gray-100">
        {events.length > 0
          ? events.map(ev => {
              const color = AGENDA_STRIPE[ev.tipo] ?? '#c9a96e';
              const emoji = ev.cover_emoji || TIPO_EMOJI[ev.tipo] || '📌';
              return (
                <div key={ev.id} className="flex items-stretch group hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="w-[3px] flex-shrink-0" style={{ backgroundColor: color }} />
                  <div className="w-9 flex items-center justify-center py-2.5 flex-shrink-0">
                    <span className="text-sm leading-none">{emoji}</span>
                  </div>
                  <div className="flex-1 min-w-0 py-2.5 pr-1">
                    <p className="font-semibold text-[11px] text-[#1a2b4a] leading-snug truncate group-hover:text-[#c9a96e] transition-colors">
                      {ev.title}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <MapPin className="w-2 h-2 text-gray-300 flex-shrink-0" />
                      <span className="text-[9px] text-gray-400 truncate">{ev.local}</span>
                    </div>
                  </div>
                  <div className="flex-shrink-0 flex flex-col items-end justify-center px-2.5 py-2.5 text-right">
                    <span className="text-[8px] font-semibold text-gray-400 uppercase leading-none">
                      {agendaFmtDay(ev.date)}
                    </span>
                    <span className="text-[12px] font-['Playfair_Display'] font-bold leading-tight" style={{ color }}>
                      {agendaFmtDate(ev.date)}
                    </span>
                    {ev.time && <span className="text-[8px] text-gray-400 mt-0.5">{ev.time}</span>}
                  </div>
                </div>
              );
            })
          : (
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
              <CalendarDays className="w-7 h-7 text-gray-200 mb-2" />
              <p className="text-[11px] font-semibold text-gray-400 mb-0.5">Sem eventos esta semana</p>
              <p className="text-[10px] text-gray-300">Novos eventos em breve.</p>
            </div>
          )
        }
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-gray-100 flex items-center justify-between">
        <span className="text-[9px] text-gray-300 uppercase tracking-wider">
          {events.length > 0 ? `${events.length} evento${events.length > 1 ? 's' : ''} · 14 dias` : 'Fique atento'}
        </span>
        <CalendarDays className="w-3 h-3 text-gray-200" />
      </div>
    </div>
  );
}

/* ─────────────────────── Props ─────────────────────── */

interface FeaturedCarouselsProps {
  boats: CatalogBoat[];
  onSelectBoat?: (boat: CatalogBoat, date?: string, slot?: string) => void;
}

/* ─────────────────── TripCard (yacht-listing style) ─────────────────── */

interface TripCardProps {
  boat: CatalogBoat;
  schedule: ScheduleData[];
  onClick: () => void;
}

const TripCard = React.memo(function TripCard({ boat, schedule, onClick }: TripCardProps) {
  const { from, to } = parseLocation(boat.marina_location);
  const validPhoto = (p: string) => p && (p.startsWith('data:image') || p.startsWith('https'));
  const allPhotos = (boat.photos || []).filter(validPhoto);
  if (validPhoto(boat.photo_url) && !allPhotos.includes(boat.photo_url)) allPhotos.unshift(boat.photo_url);
  const [photoIdx,    setPhotoIdx]    = useState(0);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  return (
    <>
      {lightboxIdx !== null && allPhotos.length > 0 && (
        <Lightbox photos={allPhotos} index={lightboxIdx} onClose={() => setLightboxIdx(null)} />
      )}

      <div
        onClick={onClick}
        className="group cursor-pointer bg-white overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
        style={{ width: '100%', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}
      >
        {/* ── Foto ─────────────────────────────────────── */}
        <div className="relative overflow-hidden" style={{ height: '260px' }}>
          {allPhotos.length > 0
            ? <img src={allPhotos[photoIdx]} alt={boat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            : <div className="w-full h-full bg-gradient-to-br from-[#0a1628] to-[#1a2b4a] flex items-center justify-center"><span className="text-5xl opacity-20">⛵</span></div>
          }
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

          {/* Expandir lightbox */}
          {allPhotos.length > 0 && (
            <button
              type="button"
              onClick={e => { e.stopPropagation(); setLightboxIdx(photoIdx); }}
              className="absolute top-3 right-3 bg-black/40 hover:bg-[#c9a96e] text-white p-2 opacity-0 group-hover:opacity-100 transition-all z-10"
            >
              <Expand className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Setas de navegação */}
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

          {/* Preço */}
          <div className="absolute bottom-3 right-3 bg-white/95 px-2.5 py-1 text-[11px] font-bold text-[#1a2b4a]">
            {formatPrice(boat.price_per_hour, boat)}
          </div>

          {/* Verificado */}
          {boat.sailor.verified && (
            <div className="absolute top-3 left-3 bg-[#c9a96e] w-7 h-7 flex items-center justify-center">
              <ShieldCheck className="w-3.5 h-3.5 text-white" />
            </div>
          )}

          {/* Contador */}
          {allPhotos.length > 1 && (
            <div className="absolute bottom-3 left-3 bg-black/50 text-white text-[9px] font-semibold px-2 py-0.5 uppercase tracking-wider">
              {photoIdx + 1}/{allPhotos.length}
            </div>
          )}
        </div>

        {/* ── Info ─────────────────────────────────────── */}
        <div className="p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#c9a96e] mb-1.5">
            {boat.boat_type || 'Passeio'}{boat.city ? ` · ${boat.city}` : ''}
          </p>
          <h3 className="font-['Playfair_Display'] font-bold text-[15px] text-[#1a2b4a] leading-tight mb-2 truncate">
            {boat.name}
          </h3>
          <div className="flex items-center gap-3 text-[11px] text-gray-400">
            <span className="flex items-center gap-1"><Users className="w-3 h-3" />{boat.capacity} pessoas</span>
            {boat.duracao && <span>{boat.duracao}</span>}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-[#c9a96e] flex items-center gap-1">
              VER PASSEIO <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>
    </>
  );
});

/* ─────────────────── Horizontal Carousel ─────────────────── */

function HorizontalCarousel({
  boats,
  schedulesMap,
  onClickBoat,
}: {
  boats: CatalogBoat[];
  schedulesMap: Map<string, ScheduleData[]>;
  onClickBoat: (boat: CatalogBoat) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollStart = useRef(0);
  const hasMoved = useRef(false);

  const onDown = (x: number) => {
    isDragging.current = true;
    hasMoved.current = false;
    startX.current = x;
    scrollStart.current = trackRef.current?.scrollLeft ?? 0;
  };
  const onMove = (x: number) => {
    if (!isDragging.current || !trackRef.current) return;
    const dx = x - startX.current;
    if (Math.abs(dx) > 4) hasMoved.current = true;
    trackRef.current.scrollLeft = scrollStart.current - dx;
  };
  const onUp = () => { isDragging.current = false; };

  const scrollBy = (dir: number) => {
    trackRef.current?.scrollBy({ left: dir * 300, behavior: 'smooth' });
  };

  if (boats.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-300 text-sm">Nenhum passeio disponível nesta categoria</p>
      </div>
    );
  }

  return (
    <div className="relative group/car">
      <button
        onClick={() => scrollBy(-1)}
        className="absolute -left-2 md:-left-5 top-[90px] -translate-y-1/2 z-10 w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center text-[#1a2b4a] hover:bg-[#1a2b4a] hover:text-white hover:border-[#1a2b4a] transition-all duration-300 opacity-0 group-hover/car:opacity-100 shadow-sm"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <div
        ref={trackRef}
        className="flex gap-6 overflow-x-auto px-1 py-2 select-none"
        style={{
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          cursor: 'grab',
        }}
        onMouseDown={e => onDown(e.clientX)}
        onMouseMove={e => onMove(e.clientX)}
        onMouseUp={onUp}
        onMouseLeave={onUp}
        onTouchStart={e => onDown(e.touches[0].clientX)}
        onTouchMove={e => onMove(e.touches[0].clientX)}
        onTouchEnd={onUp}
      >
        {boats.map(boat => (
          <div key={boat.id} className="flex-shrink-0 w-[260px] md:w-[280px]" style={{ scrollSnapAlign: 'start' }}>
            <TripCard
              boat={boat}
              schedule={schedulesMap.get(boat.id) || []}
              onClick={() => { if (!hasMoved.current) onClickBoat(boat); }}
            />
          </div>
        ))}
        <div className="flex-shrink-0 w-4" />
      </div>

      <button
        onClick={() => scrollBy(1)}
        className="absolute -right-2 md:-right-5 top-[90px] -translate-y-1/2 z-10 w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center text-[#1a2b4a] hover:bg-[#1a2b4a] hover:text-white hover:border-[#1a2b4a] transition-all duration-300 opacity-0 group-hover/car:opacity-100 shadow-sm"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

/* ─────────────────── Section Header ─────────────────── */

interface SectionProps {
  title: string;
  subtitle: string;
  boats: CatalogBoat[];
  schedulesMap: Map<string, ScheduleData[]>;
  onClickBoat: (boat: CatalogBoat) => void;
}

function CarouselSection({ title, subtitle, boats, schedulesMap, onClickBoat }: SectionProps) {
  return (
    <section className="py-10 md:py-14">
      <div className="mb-8">
        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#c9a96e] mb-3">LINHA D'ÁGUA</p>
        <h2 className="font-['Playfair_Display'] text-3xl md:text-4xl font-bold text-[#1a2b4a] mb-3">{title}</h2>
        <div className="flex items-center gap-3">
          <div className="w-8 h-px bg-[#c9a96e]" />
          <p className="text-gray-400 text-sm">{subtitle}</p>
        </div>
      </div>
      <HorizontalCarousel boats={boats} schedulesMap={schedulesMap} onClickBoat={onClickBoat} />
    </section>
  );
}

/* ─────────────────── Main Export ─────────────────── */

export function FeaturedCarousels({ boats, onSelectBoat }: FeaturedCarouselsProps) {
  const [selectedBoat, setSelectedBoat] = useState<CatalogBoat | null>(null);

  const allBookings = useMemo(() => {
    return getBookings().filter(b => ['confirmed', 'completed', 'concluido'].includes(b.status));
  }, []);

  const schedulesMap = useMemo(() => {
    const map = new Map<string, ScheduleData[]>();
    boats.forEach(b => map.set(b.id, buildScheduleFromBookings(b, allBookings)));
    return map;
  }, [boats, allBookings]);

  const destaques = boats;
  const eventos = boats.filter(b =>
    b.descricao?.toLowerCase().includes('evento') ||
    b.boat_type?.toLowerCase().includes('event') ||
    false
  );
  const pescaria = boats.filter(b =>
    b.descricao?.toLowerCase().includes('pesca') ||
    b.boat_type?.toLowerCase().includes('fish') ||
    b.name?.toLowerCase().includes('pesca') ||
    false
  );

  function handleClickBoat(boat: CatalogBoat) {
    setSelectedBoat(boat);
  }

  function handleBook(boat: CatalogBoat, date?: string, slot?: string) {
    setSelectedBoat(null);
    if (onSelectBoat) onSelectBoat(boat, date, slot);
  }

  return (
    <div className="relative bg-white overflow-hidden">
      <div className="relative max-w-[1400px] mx-auto px-5 md:px-10 xl:px-16">

        {/* Destaques + Agenda lateral */}
        <section className="py-10 md:py-14">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Carousel */}
            <div className="flex-1 min-w-0">
              <div className="mb-8">
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#c9a96e] mb-3">LINHA D'ÁGUA</p>
                <h2 className="font-['Playfair_Display'] text-3xl md:text-4xl font-bold text-[#1a2b4a] mb-3">Passeios em Destaque</h2>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-px bg-[#c9a96e]" />
                  <p className="text-gray-400 text-sm">Os passeios mais populares</p>
                </div>
              </div>
              <HorizontalCarousel boats={destaques} schedulesMap={schedulesMap} onClickBoat={handleClickBoat} />
            </div>
            {/* Agenda */}
            <AgendaPanel />
          </div>
        </section>

      </div>

      {/* Trip Detail Modal */}
      {selectedBoat && (
        <TripDetailModal boat={selectedBoat} onClose={() => setSelectedBoat(null)} onBook={handleBook} />
      )}
    </div>
  );
}
