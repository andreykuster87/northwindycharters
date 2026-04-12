import React, { useRef, useState, useMemo } from 'react';
import {
  ChevronLeft, ChevronRight, Star, CalendarDays, Fish,
  MapPin, Clock, Users, ArrowRight, ShieldCheck,
} from 'lucide-react';
import type { CatalogBoat } from '../../services/catalog';
import type { ScheduleData } from '../modals/TimeSlotsModal';
import {
  formatPrice,
  parseLocation,
  getBoatCity,
  buildScheduleFromBookings,
} from '../../utils/catalogUtils';
import { getBookings } from '../../lib/localStore';
import { TripDetailModal } from '../modals/TripDetailModal';

/* ─────────────────────── Props ─────────────────────── */

interface FeaturedCarouselsProps {
  boats: CatalogBoat[];
  onSelectBoat?: (boat: CatalogBoat, date?: string, slot?: string) => void;
}

/* ─────────────────── TripCard (same style as Hero) ─────────────────── */

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
  const [photoIdx, setPhotoIdx] = useState(0);
  const hasAvail = schedule.length > 0;
  const nextDate = schedule[0];

  return (
    <div
      onClick={onClick}
      className="flex-shrink-0 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group rounded-[20px] bg-white border border-gray-100 hover:-translate-y-1 cursor-pointer"
      style={{ width: '100%' }}
    >
      {/* Photo */}
      <div className="relative overflow-hidden" style={{ height: '160px' }}>
        {allPhotos.length > 0
          ? <img src={allPhotos[photoIdx]} alt={boat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          : <div className="w-full h-full bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center"><span className="text-5xl opacity-30">⛵</span></div>
        }
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent" />

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
            <div className="absolute top-3 right-3 bg-black/60 text-white text-[10px] font-black px-2 py-0.5 rounded-full z-10">
              {photoIdx + 1}/{allPhotos.length}
            </div>
          </>
        )}

        <div className={`absolute top-3 left-3 text-[10px] font-black uppercase px-2.5 py-1 rounded-full z-10 ${hasAvail ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
          {hasAvail ? '● Disponível' : 'Esgotado'}
        </div>

        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-full z-10">
          {boat.sailor.verified && <ShieldCheck className="w-3 h-3 text-green-400 flex-shrink-0" />}
          <span className="text-white text-[11px] font-black truncate max-w-[150px]">{boat.sailor.name}</span>
        </div>

        {nextDate && (
          <div className="absolute bottom-3 right-3 text-[11px] font-black text-white bg-blue-900/90 px-2 py-0.5 rounded-full backdrop-blur-sm z-10">
            {nextDate.date.split('-').reverse().slice(0, 2).join('/')}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="px-3.5 pt-3 pb-3.5 space-y-2">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
          <span className="text-gray-500 text-[11px] font-bold truncate">
            {boat.city}{boat.country_flag ? ` ${boat.country_flag}` : ''}
          </span>
        </div>

        <p className="font-black text-blue-950 text-sm uppercase italic leading-tight truncate">{boat.name}</p>

        <div className="flex items-center text-[10px] font-black">
          <span className="text-gray-700 truncate flex-1 text-left">{from}</span>
          <div className="flex flex-col items-center px-1.5 flex-shrink-0">
            {boat.duracao
              ? <span className="text-gray-500 text-[8px] font-black bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded-full whitespace-nowrap">⏱ {boat.duracao}</span>
              : <ArrowRight className="w-3 h-3 text-gray-300" />
            }
          </div>
          <span className="text-gray-400 truncate flex-1 text-right">{to && to !== from ? to : from}</span>
        </div>

        <div className="flex items-center justify-between pt-1.5 border-t border-gray-100">
          <span className="flex items-center gap-1 text-gray-400 text-[10px] font-bold">
            <Users className="w-3 h-3" /> Até {boat.capacity}
          </span>
          <div className="text-right">
            <span className="text-[8px] text-gray-400 font-black uppercase block">Por pessoa</span>
            <span className="font-black text-blue-950 text-base leading-none">{formatPrice(boat.price_per_hour, boat)}</span>
          </div>
        </div>
      </div>
    </div>
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
    trackRef.current?.scrollBy({ left: dir * 290, behavior: 'smooth' });
  };

  if (boats.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-300 font-bold text-sm italic">Nenhum passeio disponível nesta categoria</p>
      </div>
    );
  }

  return (
    <div className="relative group/car">
      <button
        onClick={() => scrollBy(-1)}
        className="absolute -left-2 md:left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/95 backdrop-blur-sm rounded-full shadow-xl border border-gray-100 flex items-center justify-center text-blue-900 hover:bg-blue-900 hover:text-white transition-all duration-300 opacity-0 group-hover/car:opacity-100 hover:scale-110"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <div
        ref={trackRef}
        className="flex gap-4 overflow-x-auto px-1 py-3 select-none"
        style={{
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          cursor: 'grab',
          maskImage: 'linear-gradient(to right, transparent, black 2%, black 96%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 2%, black 96%, transparent)',
        }}
        onMouseDown={e => onDown(e.clientX)}
        onMouseMove={e => onMove(e.clientX)}
        onMouseUp={onUp}
        onMouseLeave={onUp}
        onTouchStart={e => onDown(e.touches[0].clientX)}
        onTouchMove={e => onMove(e.touches[0].clientX)}
        onTouchEnd={onUp}
      >
        <style>{`.featured-track::-webkit-scrollbar { display: none; }`}</style>
        {boats.map(boat => (
          <div key={boat.id} className="flex-shrink-0 w-[250px] md:w-[270px]" style={{ scrollSnapAlign: 'start' }}>
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
        className="absolute -right-2 md:right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/95 backdrop-blur-sm rounded-full shadow-xl border border-gray-100 flex items-center justify-center text-blue-900 hover:bg-blue-900 hover:text-white transition-all duration-300 opacity-0 group-hover/car:opacity-100 hover:scale-110"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

/* ─────────────────── Section Header ─────────────────── */

interface SectionProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  gradientFrom: string;
  gradientTo: string;
  boats: CatalogBoat[];
  schedulesMap: Map<string, ScheduleData[]>;
  onClickBoat: (boat: CatalogBoat) => void;
}

function CarouselSection({ icon, title, subtitle, gradientFrom, gradientTo, boats, schedulesMap, onClickBoat }: SectionProps) {
  return (
    <section className="py-10 md:py-14">
      <div className="flex items-start gap-4 mb-5">
        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradientFrom} ${gradientTo} flex items-center justify-center text-white shadow-lg flex-shrink-0`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h2 className="font-black text-blue-950 text-xl md:text-2xl tracking-tight leading-none">{title}</h2>
            <div className={`hidden md:block flex-1 h-[2px] rounded-full bg-gradient-to-r ${gradientFrom} ${gradientTo} opacity-20`} />
          </div>
          <p className="text-gray-400 text-xs md:text-sm font-semibold mt-1">{subtitle}</p>
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

  // Categorização: por enquanto distribui todos os boats
  // Quando trips tiverem campo "category", filtra aqui
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
    <div className="relative bg-gradient-to-b from-white via-gray-50/50 to-white overflow-hidden">
      {/* Subtle dot pattern */}
      <div className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: 'radial-gradient(circle at 25% 25%, #1e3a5f 1px, transparent 1px), radial-gradient(circle at 75% 75%, #1e3a5f 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative max-w-6xl mx-auto px-5 md:px-8">
        {/* Destaques — always shows all boats */}
        <CarouselSection
          icon={<Star className="w-5 h-5" />}
          title="Destaques"
          subtitle="Os passeios mais populares"
          gradientFrom="from-orange-500"
          gradientTo="to-amber-400"
          boats={destaques}
          schedulesMap={schedulesMap}
          onClickBoat={handleClickBoat}
        />

        <div className="relative h-px">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
        </div>

        {/* Eventos da Semana */}
        <CarouselSection
          icon={<CalendarDays className="w-5 h-5" />}
          title="Eventos da Semana"
          subtitle="Experiências especiais com data marcada"
          gradientFrom="from-blue-600"
          gradientTo="to-cyan-500"
          boats={eventos.length > 0 ? eventos : destaques}
          schedulesMap={schedulesMap}
          onClickBoat={handleClickBoat}
        />

        <div className="relative h-px">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
        </div>

        {/* Pescaria */}
        <CarouselSection
          icon={<Fish className="w-5 h-5" />}
          title="Pescaria"
          subtitle="Para os amantes da pesca desportiva"
          gradientFrom="from-emerald-600"
          gradientTo="to-teal-400"
          boats={pescaria.length > 0 ? pescaria : destaques}
          schedulesMap={schedulesMap}
          onClickBoat={handleClickBoat}
        />
      </div>

      {/* Trip Detail Modal */}
      {selectedBoat && (
        <TripDetailModal boat={selectedBoat} onClose={() => setSelectedBoat(null)} onBook={handleBook} />
      )}
    </div>
  );
}
