// src/components/BoatCatalog.tsx
import { useState, useEffect, useRef } from 'react';
import {
  Users, ShieldCheck, CalendarDays, ChevronDown, ChevronRight,
  Filter, MapPin, Check, X, ArrowRight, Clock,
} from 'lucide-react';
import { TimeSlotsModal, type ScheduleData } from '../modals/TimeSlotsModal';
import type { CatalogBoat } from '../../services/catalog';
import { formatPrice, parseLocation, buildSchedule, getBoatCity } from '../../utils/catalogUtils';

export type { CatalogBoat } from '../services/catalog';

interface BoatCatalogProps {
  boats:        CatalogBoat[];
  onSelectBoat: (boat: CatalogBoat, date?: string, slot?: string) => void;
}

// ── CityFilter ────────────────────────────────────────────────────────────────
function CityFilter({ boats, activeCity, onChange }: {
  boats:      CatalogBoat[];
  activeCity: string | null;
  onChange:   (city: string | null) => void;
}) {
  const [open, setOpen] = useState(false);

  const cityCounts = boats.reduce<Record<string, number>>((acc, b) => {
    const city = getBoatCity(b);
    if (city) acc[city] = (acc[city] || 0) + 1;
    return acc;
  }, {});

  const grouped = Object.entries(cityCounts)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);

  if (grouped.length <= 1) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-full border-2 font-black text-xs uppercase transition-all
          ${activeCity ? 'bg-blue-900 text-white border-blue-900' : 'bg-white text-blue-900 border-blue-200 hover:border-blue-900'}`}
      >
        <Filter className="w-3.5 h-3.5" />
        {activeCity || 'Filtrar cidade'}
        {activeCity && (
          <span onClick={e => { e.stopPropagation(); onChange(null); setOpen(false); }}
            className="ml-1 hover:text-red-300 transition-colors">
            <X className="w-3 h-3" />
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 bg-white rounded-[20px] shadow-2xl border-2 border-blue-100 z-50 min-w-[200px] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="p-2">
            <button
              onClick={() => { onChange(null); setOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-[14px] text-sm font-black transition-all
                ${!activeCity ? 'bg-blue-900 text-white' : 'hover:bg-gray-50 text-gray-600'}`}
            >
              <span>Todas as cidades</span>
              <span className={`text-[11px] font-black px-2 py-0.5 rounded-full
                ${!activeCity ? 'bg-blue-700 text-blue-200' : 'bg-gray-100 text-gray-500'}`}>
                {boats.length}
              </span>
            </button>
            <div className="h-px bg-gray-100 mx-2 my-1" />
            {grouped.map(city => {
              const isCityActive = activeCity === city.label;
              return (
                <button
                  key={city.label}
                  onClick={() => { onChange(city.label); setOpen(false); }}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-[14px] text-sm transition-all
                    ${isCityActive ? 'bg-blue-50 text-blue-900' : 'hover:bg-gray-50 text-gray-600'}`}
                >
                  <span className={`font-black ${isCityActive ? 'text-blue-900' : 'text-gray-600'}`}>{city.label}</span>
                  <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full flex-shrink-0
                    ${isCityActive ? 'bg-blue-900 text-white' : 'bg-white text-blue-600 border border-blue-200'}`}>
                    {city.count} passeio{city.count !== 1 ? 's' : ''}
                  </span>
                  {isCityActive && <Check className="w-3.5 h-3.5 text-blue-900 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Extras badges ─────────────────────────────────────────────────────────────
function BadgeExtras({ boat }: { boat: CatalogBoat }) {
  const items: { icon: string; label: string; color: string }[] = [];
  if (boat.bebidas === 'inclusas')     items.push({ icon:'🍾', label:'Bebidas inclusas', color:'bg-emerald-50 text-emerald-700 border-emerald-200' });
  if (boat.bebidas === 'traga')        items.push({ icon:'🎒', label:'Traga sua bebida', color:'bg-amber-50 text-amber-700 border-amber-200' });
  if (boat.bebidas === 'nao_inclusas') items.push({ icon:'🚫', label:'Sem bebidas',      color:'bg-gray-50 text-gray-500 border-gray-200' });
  if (boat.comida  === 'inclusa')      items.push({ icon:'🍽️', label:'Comida inclusa',  color:'bg-emerald-50 text-emerald-700 border-emerald-200' });
  if (boat.comida  === 'nao_inclusa')  items.push({ icon:'🚫', label:'Sem comida',       color:'bg-gray-50 text-gray-500 border-gray-200' });
  if (boat.bar     === 'tem')          items.push({ icon:'🍹', label:'Bar a bordo',      color:'bg-blue-50 text-blue-700 border-blue-200' });
  if (!items.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((it, i) => (
        <span key={i} className={`inline-flex items-center gap-1 text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${it.color}`}>
          <span>{it.icon}</span>{it.label}
        </span>
      ))}
    </div>
  );
}

// ── SpotlightCard ─────────────────────────────────────────────────────────────
function SpotlightCard({ boat, onClick }: { boat: CatalogBoat; onClick: () => void }) {
  const validPhoto = (p: string) => p && (p.startsWith('data:image') || p.startsWith('https'));
  const photo      = (boat.photos || []).find(validPhoto) || (validPhoto(boat.photo_url) ? boat.photo_url : '');
  const { from, to } = parseLocation(boat.marina_location);
  const schedule   = buildSchedule(boat).filter(e => e.spotsLeft > 0);
  const hasAvail   = schedule.length > 0;
  const nextDate   = schedule[0];
  const [, em, ed] = nextDate ? nextDate.date.split('-') : [];

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex-shrink-0 overflow-hidden rounded-[28px] text-left shadow-xl border-2 border-white/10 hover:border-blue-400 transition-all duration-300 hover:shadow-[0_20px_50px_rgba(0,60,180,0.25)] hover:scale-[1.03]"
      style={{ width: 280, height: 360 }}
    >
      {photo
        ? <img src={photo} alt={boat.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
        : <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center"><span className="text-7xl opacity-20">⛵</span></div>
      }
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className={`absolute top-4 right-4 text-[10px] font-black uppercase px-3 py-1.5 rounded-full shadow-lg z-10 ${hasAvail ? 'bg-green-500 text-white' : 'bg-red-500/90 text-white'}`}>
        {hasAvail ? '● Disponível' : 'Esgotado'}
      </div>
      <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5 z-10">
        {boat.sailor.verified && <ShieldCheck className="w-3 h-3 text-green-400 flex-shrink-0" />}
        <span className="text-white text-[10px] font-black truncate max-w-[130px]">{boat.sailor.name}</span>
      </div>
      {nextDate && (
        <div className="absolute top-12 right-4 mt-2 bg-blue-900/80 backdrop-blur-sm px-2.5 py-1 rounded-full z-10">
          <span className="text-[10px] font-black text-white">{ed}/{em}</span>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
        {boat.boat_type && <p className="text-blue-300 text-[9px] font-black uppercase tracking-widest mb-1">{boat.boat_type}</p>}
        <h3 className="font-black text-white text-xl uppercase italic leading-tight mb-1 drop-shadow-lg line-clamp-2">{boat.name}</h3>
        {boat.city && (
          <p className="flex items-center gap-1 text-white/60 text-[11px] font-bold mb-3">
            <MapPin className="w-3 h-3 text-blue-300" />{boat.city}{boat.country_flag && ` ${boat.country_flag}`}
          </p>
        )}
        <div className="bg-white/10 backdrop-blur-sm rounded-[14px] px-3 py-2.5 flex items-center gap-2 mb-3">
          <span className="text-white text-[11px] font-black truncate flex-1">{from}</span>
          <ArrowRight className="w-3 h-3 text-blue-300 flex-shrink-0" />
          <span className="text-blue-200 text-[11px] font-black truncate flex-1 text-right">{to && to !== from ? to : from}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {boat.duracao && <span className="flex items-center gap-1 text-white/60 text-[11px] font-bold"><Clock className="w-3 h-3 text-blue-300" />{boat.duracao}</span>}
            <span className="flex items-center gap-1 text-white/60 text-[11px] font-bold"><Users className="w-3 h-3 text-blue-300" />até {boat.capacity}</span>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-black text-white/50 uppercase">Por pessoa</p>
            <p className="font-black text-white text-lg leading-none">{boat.price_per_hour > 0 ? formatPrice(boat.price_per_hour, boat) : 'Consultar'}</p>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
        <div className="bg-white text-blue-900 font-black text-xs uppercase px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-2 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
          Ver detalhes <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </button>
  );
}

// ── BoatDrawer ────────────────────────────────────────────────────────────────
function BoatDrawer({ boat, onClose, onSelectBoat }: {
  boat:         CatalogBoat;
  onClose:      () => void;
  onSelectBoat: (b: CatalogBoat, date?: string, slot?: string) => void;
}) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div className="fixed inset-0 z-[300] flex items-end md:items-center justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full md:w-[480px] h-[92vh] md:h-full bg-white md:rounded-l-[40px] rounded-t-[32px] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom md:slide-in-from-right duration-300"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 z-10 bg-gray-100 hover:bg-gray-200 text-gray-600 p-2.5 rounded-full transition-all">
          <X className="w-4 h-4" />
        </button>
        <div className="md:hidden absolute top-3 left-1/2 -translate-x-1/2 w-10 h-1 bg-gray-200 rounded-full" />
        <BoatCard boat={boat} onSelectBoat={(b, date, slot) => { onClose(); onSelectBoat(b, date, slot); }} />
      </div>
    </div>
  );
}

// ── BoatCard ──────────────────────────────────────────────────────────────────
function BoatCard({ boat, onSelectBoat }: {
  boat:         CatalogBoat;
  onSelectBoat: (b: CatalogBoat, date?: string, slot?: string) => void;
}) {
  const [showAll,     setShowAll]     = useState(false);
  const [activeEntry, setActiveEntry] = useState<ScheduleData | null>(null);
  const [photoIdx,    setPhotoIdx]    = useState(0);

  const { from, to } = parseLocation(boat.marina_location);
  const validPhoto   = (p: string) => p && (p.startsWith('data:image') || p.startsWith('https'));
  const hasPhoto     = validPhoto(boat.photo_url);
  const allPhotos    = (boat.photos || []).filter(validPhoto).length > 0
    ? (boat.photos || []).filter(validPhoto)
    : hasPhoto ? [boat.photo_url] : [];
  const currentPhoto = allPhotos[photoIdx] || '';
  const rawSchedule  = buildSchedule(boat);
  const schedule     = rawSchedule.filter(e => e.spotsLeft > 0);
  const visible      = showAll ? schedule : schedule.slice(0, 3);
  const hidden       = schedule.length - 3;
  const hasAvail     = schedule.length > 0;

  return (
    <>
      <div className="bg-white rounded-[35px] overflow-hidden shadow-sm border-2 border-transparent hover:border-blue-900 hover:shadow-xl transition-all duration-300 group flex flex-col h-full">
        <div className="relative overflow-hidden flex-shrink-0" style={{ height: 240 }}>
          {currentPhoto
            ? <img src={currentPhoto} alt={boat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            : <div className="w-full h-full bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center"><span className="text-6xl opacity-30">⛵</span></div>
          }
          {allPhotos.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {allPhotos.map((p, i) => (
                <button key={i} onClick={() => setPhotoIdx(i)}
                  className={`rounded-md overflow-hidden border-2 transition-all ${i === photoIdx ? 'border-white w-14 h-10' : 'border-white/30 w-10 h-7 opacity-60 hover:opacity-100'}`}>
                  <img src={p} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md z-10">
            {boat.sailor.verified && <ShieldCheck className="w-3 h-3 text-blue-900 flex-shrink-0" />}
            <span className="font-black text-blue-900 text-[10px] uppercase">{boat.sailor.name}</span>
          </div>
          {boat.country_flag && <span className="absolute top-3 right-3 text-3xl drop-shadow-lg select-none z-10">{boat.country_flag}</span>}
          {allPhotos.length > 1 && (
            <div className="absolute bg-black/50 text-white text-[9px] font-black px-2 py-0.5 rounded-full z-10"
              style={{ top: boat.country_flag ? '4.5rem' : '3rem', right: '0.75rem' }}>
              {photoIdx + 1}/{allPhotos.length}
            </div>
          )}
          <div className={`absolute bottom-3 right-3 text-[10px] font-black uppercase px-3 py-1.5 rounded-full shadow-md z-10 ${hasAvail ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
            {hasAvail ? '● Disponível' : '🚫 Sold Out'}
          </div>
        </div>

        <div className="p-6 flex flex-col gap-4 flex-1">
          <div>
            {boat.boat_type && <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-0.5">{boat.boat_type}</p>}
            <h3 className="font-black text-blue-900 text-2xl uppercase italic leading-tight">{boat.name}</h3>
          </div>
          {(boat.city || boat.country_name) && (
            <div className="flex items-center gap-1.5">
              <span className="text-base">{boat.country_flag || '🌍'}</span>
              <span className="text-xs font-bold text-gray-400">{[boat.city, boat.state_name, boat.country_name].filter(Boolean).join(', ')}</span>
            </div>
          )}
          <div className="bg-blue-900 rounded-[20px] px-5 py-4">
            <p className="text-blue-400 text-[9px] font-black uppercase tracking-widest mb-3">Rota do passeio</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest mb-0.5">⚓ Embarque</p>
                <p className="font-black text-white text-sm uppercase italic leading-tight" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>{from}</p>
              </div>
              <div className="flex flex-col items-center gap-1 flex-shrink-0 px-1">
                <div className="h-px w-5 bg-blue-500" />
                {boat.duracao && <span className="text-[8px] font-black text-blue-300 uppercase whitespace-nowrap bg-blue-800 px-2 py-0.5 rounded-full">⏱ {boat.duracao}</span>}
                <div className="h-px w-5 bg-blue-500" />
              </div>
              <div className="flex-1 min-w-0 text-right">
                <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest mb-0.5">🏁 Desembarque</p>
                <p className="font-black text-blue-200 text-sm uppercase italic leading-tight" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>{to && to !== from ? to : from}</p>
              </div>
            </div>
            <p className="text-blue-400 text-[10px] font-bold mt-3 italic">Confira as datas disponíveis ↓</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="bg-gray-50 rounded-full px-4 py-2 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs font-black text-gray-600">Até {boat.capacity} pessoas</span>
            </div>
            {boat.length_ft && (
              <div className="bg-gray-50 rounded-full px-4 py-2 flex items-center gap-1.5">
                <span className="text-[11px]">📏</span>
                <span className="text-xs font-black text-gray-600">{boat.length_ft} pés</span>
              </div>
            )}
            {(boat.minimo_tripulantes ?? 0) > 1 && (
              <div className="bg-amber-50 border border-amber-200 rounded-full px-4 py-2">
                <span className="text-[10px] font-black text-amber-700">⚠️ Mín. {boat.minimo_tripulantes} confirmados</span>
              </div>
            )}
          </div>
          {schedule.length > 0 && (
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <CalendarDays className="w-3 h-3" /> Próximas datas
              </p>
              <div className="space-y-1.5">
                {visible.map((entry, i) => {
                  const [ey, em, ed] = entry.date.split('-');
                  const allSlots   = entry.time_slots;
                  const vagasBadge = entry.spotsLeft > 3 ? 'bg-green-100 text-green-700 border-green-200' : 'bg-amber-100 text-amber-700 border-amber-200';
                  return (
                    <div key={i} className="bg-blue-50 border border-blue-100 rounded-[12px] px-3 py-2.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-sm text-blue-900">{ed}/{em}/{ey}</span>
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full flex-shrink-0 border ${vagasBadge}`}>
                          {entry.spotsLeft} vaga{entry.spotsLeft !== 1 ? 's' : ''}
                        </span>
                      </div>
                      {allSlots.length > 0 && (
                        <div className="flex gap-1.5 overflow-x-auto pb-0.5" style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
                          {allSlots.map((slot, si) => {
                            const slotLeft  = entry.slotSpots[slot] ?? 0;
                            const isSoldOut = slotLeft === 0;
                            const isLast    = slotLeft <= 2 && slotLeft > 0;
                            return (
                              <button key={si} type="button" disabled={isSoldOut}
                                onClick={() => !isSoldOut && onSelectBoat(boat, entry.date, slot)}
                                className={`flex-shrink-0 flex flex-col items-center px-3 py-1.5 rounded-full border-2 transition-all
                                  ${isSoldOut ? 'bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed'
                                    : isLast ? 'bg-amber-50 border-amber-300 hover:bg-amber-100 cursor-pointer'
                                    : 'bg-white border-blue-200 hover:border-blue-900 hover:bg-blue-50 cursor-pointer'}`}>
                                <span className={`text-[11px] font-black leading-none ${isSoldOut ? 'text-gray-400' : isLast ? 'text-amber-700' : 'text-blue-900'}`}>
                                  {isSoldOut ? '🚫' : ''}{slot}
                                </span>
                                <span className={`text-[9px] font-bold leading-none ${isSoldOut ? 'text-red-400' : isLast ? 'opacity-70' : 'text-blue-400'}`}>
                                  {isSoldOut ? 'esgotado' : isLast ? `só ${slotLeft} vaga${slotLeft !== 1 ? 's' : ''}` : `${slotLeft} vaga${slotLeft !== 1 ? 's' : ''}`}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                      {allSlots.length === 0 && (
                        <button type="button" onClick={() => setActiveEntry(entry)}
                          className="text-[10px] font-black text-blue-600 hover:text-blue-900 transition-colors">
                          Ver horários →
                        </button>
                      )}
                    </div>
                  );
                })}
                {schedule.length > 3 && (
                  <button type="button" onClick={() => setShowAll(v => !v)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 text-[11px] font-black text-blue-500 hover:text-blue-900 transition-colors">
                    {showAll
                      ? <><ChevronDown className="w-3.5 h-3.5 rotate-180" /> Mostrar menos</>
                      : <><ChevronDown className="w-3.5 h-3.5" /> +{hidden} data{hidden !== 1 ? 's' : ''} disponíve{hidden !== 1 ? 'is' : 'l'}</>}
                  </button>
                )}
              </div>
            </div>
          )}
          <BadgeExtras boat={boat} />
          {boat.descricao && <p className="text-xs text-gray-400 font-bold leading-relaxed line-clamp-2">{boat.descricao}</p>}
          <div className="border-t border-gray-50 pt-4 flex items-center justify-between mt-auto">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase">Valor por pessoa</p>
              <p className="font-black text-blue-900 text-2xl">
                {boat.price_per_hour > 0 ? formatPrice(boat.price_per_hour, boat) : <span className="text-gray-300 text-lg">A consultar</span>}
              </p>
            </div>
            <button onClick={() => onSelectBoat(boat)}
              className="bg-blue-900 text-white px-6 py-3.5 rounded-full font-black text-xs uppercase hover:bg-blue-800 transition-all shadow-md hover:shadow-lg flex items-center gap-1.5">
              Reservar <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
      {activeEntry && (
        <TimeSlotsModal
          entry={activeEntry}
          boatName={boat.name}
          onClose={() => setActiveEntry(null)}
          onBook={(date, slot) => { setActiveEntry(null); onSelectBoat(boat, date, slot); }}
        />
      )}
    </>
  );
}

// ── DragCarousel — auto-scroll + drag/swipe livre com inércia ─────────────────
function DragCarousel({ boats, onSelect }: { boats: CatalogBoat[]; onSelect: (b: CatalogBoat) => void }) {
  const trackRef  = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const velRef    = useRef(0);
  const rafRef    = useRef(0);
  const dragging  = useRef(false);
  const startX    = useRef(0);
  const lastX     = useRef(0);
  const lastT     = useRef(0);
  const moved     = useRef(false);

  const CARD_W         = 280;
  const GAP            = 20;
  const AUTO           = 0.5;
  const FRICTION       = 0.93;
  const MIN_VEL        = 0.2;
  const DRAG_THRESHOLD = 6;

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
  }, [halfW]);

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
    if (Math.abs(x - startX.current) > DRAG_THRESHOLD) moved.current = true;
    offsetRef.current += dx;
    clamp();
    render();
    velRef.current = dt > 0 ? (dx / dt) * 16 : 0;
    lastX.current  = x;
    lastT.current  = performance.now();
  };

  const onEnd = () => { dragging.current = false; };

  const track = [...boats, ...boats];

  return (
    <div
      className="overflow-hidden w-full select-none"
      style={{
        maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)',
        WebkitMaskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)',
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
        className="flex py-6"
        style={{ gap: GAP, width: 'max-content', willChange: 'transform' }}
      >
        {track.map((boat, i) => (
          <SpotlightCard
            key={`${boat.id}-${i}`}
            boat={boat}
            onClick={() => { if (!moved.current) onSelect(boat); }}
          />
        ))}
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export function BoatCatalog({ boats, onSelectBoat }: BoatCatalogProps) {
  const [activeCity,   setActiveCity]   = useState<string | null>(null);
  const [selectedBoat, setSelectedBoat] = useState<CatalogBoat | null>(null);

  const filtered = activeCity ? boats.filter(b => getBoatCity(b) === activeCity) : boats;

  if (boats.length === 0) {
    return (
      <section id="catalog" className="py-24 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-5xl font-black text-blue-900 uppercase italic mb-4">Passeios Disponíveis</h2>
          <div className="bg-white rounded-[40px] border-2 border-dashed border-gray-200 p-20 flex flex-col items-center justify-center max-w-lg mx-auto">
            <div className="text-6xl mb-6">⛵</div>
            <p className="font-black text-gray-300 text-xl uppercase italic">Em breve novos passeios</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section id="catalog" className="py-12 md:py-20 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto">

          <div className="px-4 mb-8 flex items-center justify-between gap-4">
            <div>
              <p className="text-blue-400 font-bold text-[10px] uppercase tracking-[0.2em] mb-1 flex items-center gap-1.5">
                <span className="inline-block w-4 h-px bg-blue-400" />
                disponível agora
              </p>
              <h2 className="text-2xl md:text-3xl font-black text-blue-900 uppercase italic leading-tight tracking-tight">
                Passeios <span className="text-blue-400">Disponíveis</span>
              </h2>
            </div>
            <div className="flex-shrink-0">
              <CityFilter boats={boats} activeCity={activeCity} onChange={setActiveCity} />
            </div>
          </div>

          {activeCity && (
            <div className="px-4 mb-4 flex items-center gap-2">
              <span className="text-xs font-black text-blue-400 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <MapPin className="w-3 h-3" /> {activeCity}
              </span>
              <span className="text-xs text-gray-400 font-bold">{filtered.length} passeio{filtered.length !== 1 ? 's' : ''}</span>
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="mx-4 bg-white rounded-[40px] border-2 border-dashed border-gray-200 p-16 text-center">
              <div className="text-5xl mb-4">🔍</div>
              <p className="font-black text-gray-300 uppercase italic text-lg">Nenhum passeio nesta região</p>
              <button onClick={() => setActiveCity(null)}
                className="mt-4 text-blue-600 font-black text-sm underline hover:text-blue-900 transition-colors">
                Ver todos os passeios
              </button>
            </div>
          ) : (
            <DragCarousel boats={filtered} onSelect={setSelectedBoat} />
          )}
        </div>
      </section>

      {selectedBoat && (
        <BoatDrawer
          boat={selectedBoat}
          onClose={() => setSelectedBoat(null)}
          onSelectBoat={onSelectBoat}
        />
      )}
    </>
  );
}