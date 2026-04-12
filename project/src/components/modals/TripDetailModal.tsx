// src/components/modals/TripDetailModal.tsx
import { useState, useEffect } from 'react';
import {
  X, ShieldCheck, MapPin, Users, ChevronLeft, ChevronRight,
  ChevronDown, CalendarDays, ArrowRight,
} from 'lucide-react';
import type { CatalogBoat } from '../services/catalog';
import { formatPrice, parseLocation, buildScheduleFromBookings } from '../../utils/catalogUtils';
import { getBookings } from '../../lib/localStore';

interface TripDetailModalProps {
  boat:    CatalogBoat;
  onClose: () => void;
  onBook:  (boat: CatalogBoat, date?: string, slot?: string) => void;
}

export function TripDetailModal({ boat, onClose, onBook }: TripDetailModalProps) {
  const { from, to } = parseLocation(boat.marina_location);
  const validPhoto   = (p: string) => p && (p.startsWith('data:image') || p.startsWith('https'));
  const allPhotos    = (boat.photos || []).filter(validPhoto);
  if (validPhoto(boat.photo_url) && !allPhotos.includes(boat.photo_url)) allPhotos.unshift(boat.photo_url);

  const [photoIdx,  setPhotoIdx]  = useState(0);
  const [showAll,   setShowAll]   = useState(false);
  const [selDate,   setSelDate]   = useState<string | null>(null);
  const [selSlot,   setSelSlot]   = useState<string | null>(null);
  const [schedule,  setSchedule]  = useState<any[]>([]);

  const visible  = showAll ? schedule : schedule.slice(0, 4);
  const hasSlots = schedule.some((e: any) => e.time_slots.length > 0);
  const canBook  = selDate !== null && selSlot !== null;

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    // Calcula schedule sincronamente a partir do cache de bookings
    const bookings = getBookings();
    setSchedule(buildScheduleFromBookings(boat, bookings));
    return () => { document.body.style.overflow = ''; };
  }, [boat]);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-2xl max-h-[90vh] rounded-[32px] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Galeria de fotos */}
        <div className="relative flex-shrink-0" style={{ height: 280 }}>
          {allPhotos.length > 0
            ? <img src={allPhotos[photoIdx]} alt={boat.name} className="w-full h-full object-cover" />
            : <div className="w-full h-full bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center"><span className="text-7xl opacity-20">⛵</span></div>
          }
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <button onClick={onClose} className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2.5 rounded-full transition-all z-10">
            <X className="w-4 h-4" />
          </button>
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
                {allPhotos.map((_, i) => (
                  <button key={i} onClick={() => setPhotoIdx(i)}
                    className={`rounded-full transition-all ${i === photoIdx ? 'w-5 h-2 bg-white' : 'w-2 h-2 bg-white/40 hover:bg-white/70'}`} />
                ))}
              </div>
            </>
          )}
          <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md z-10">
            {boat.sailor.verified && <ShieldCheck className="w-3 h-3 text-blue-900" />}
            <span className="font-black text-blue-900 text-[10px] uppercase">{boat.sailor.name}</span>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="p-6 space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black text-blue-900 uppercase italic leading-tight">{boat.name}</h2>
              {(boat.city || boat.country_name) && (
                <p className="text-sm text-gray-400 font-bold mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {[boat.city, boat.country_name].filter(Boolean).join(', ')}
                </p>
              )}
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-[10px] font-black text-gray-400 uppercase">Por pessoa</p>
              <p className="text-xl font-black text-blue-900">{formatPrice(boat.price_per_hour, boat)}</p>
            </div>
          </div>

          {/* Rota */}
          <div className="bg-blue-900 rounded-[20px] px-5 py-4">
            <p className="text-blue-400 text-[9px] font-black uppercase tracking-widest mb-3">Rota do passeio</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-[9px] text-blue-400 font-black uppercase mb-0.5">⚓ Embarque</p>
                <p className="font-black text-white text-sm uppercase italic leading-tight">{from}</p>
              </div>
              <div className="flex flex-col items-center flex-shrink-0 px-2">
                <div className="h-px w-6 bg-blue-500" />
                {boat.duracao && <span className="text-[8px] font-black text-blue-300 bg-blue-800 px-2 py-0.5 rounded-full my-1">⏱ {boat.duracao}</span>}
                <div className="h-px w-6 bg-blue-500" />
              </div>
              <div className="flex-1 min-w-0 text-right">
                <p className="text-[9px] text-blue-400 font-black uppercase mb-0.5">🏁 Desembarque</p>
                <p className="font-black text-blue-200 text-sm uppercase italic leading-tight">{to && to !== from ? to : from}</p>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            <span className="bg-gray-50 rounded-full px-4 py-2 text-xs font-black text-gray-600 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-gray-400" /> Até {boat.capacity} pessoas
            </span>
            {(boat.minimo_tripulantes ?? 0) > 1 && (
              <span className="bg-amber-50 border border-amber-200 rounded-full px-4 py-2 text-[10px] font-black text-amber-700">
                ⚠️ Mín. {boat.minimo_tripulantes} confirmados
              </span>
            )}
            {boat.bebidas === 'inclusas' && (
              <span className="bg-emerald-50 border border-emerald-200 rounded-full px-4 py-2 text-[10px] font-black text-emerald-700">
                🍾 Bebidas inclusas
              </span>
            )}
            {boat.comida === 'inclusa' && (
              <span className="bg-emerald-50 border border-emerald-200 rounded-full px-4 py-2 text-[10px] font-black text-emerald-700">
                🍽️ Comida inclusa
              </span>
            )}
            {boat.bar === 'tem' && (
              <span className="bg-blue-50 border border-blue-200 rounded-full px-4 py-2 text-[10px] font-black text-blue-700">
                🍹 Bar a bordo
              </span>
            )}
          </div>

          {boat.descricao && (
            <p className="text-sm text-gray-500 font-bold leading-relaxed">{boat.descricao}</p>
          )}

          {/* Datas disponíveis */}
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <CalendarDays className="w-3.5 h-3.5" /> Datas e horários disponíveis
            </p>
            {schedule.length === 0 ? (
              <div className="bg-gray-50 rounded-[16px] p-6 text-center">
                <p className="text-gray-300 font-black text-xs uppercase italic">Sem datas disponíveis no momento</p>
              </div>
            ) : (
              <div className="space-y-2">
                {visible.map((entry, i) => {
                  const [ey, em, ed] = entry.date.split('-');
                  const badge = entry.spotsLeft > 3
                    ? 'bg-green-100 text-green-700 border-green-200'
                    : 'bg-amber-100 text-amber-700 border-amber-200';
                  return (
                    <div key={i} className="bg-blue-50 border border-blue-100 rounded-[14px] px-4 py-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-blue-900">{ed}/{em}/{ey}</span>
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${badge}`}>
                          {entry.spotsLeft} vaga{entry.spotsLeft !== 1 ? 's' : ''}
                        </span>
                      </div>
                      {entry.time_slots.length > 0 ? (
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
                                    ? 'bg-white border-blue-200 text-blue-900 hover:border-blue-900 hover:bg-blue-50'
                                    : 'bg-gray-50 border-gray-200 text-gray-400 opacity-50 cursor-not-allowed'
                                }`}>
                                {isSel ? '✓ ' : ''}{slot} · {ok ? `${sv} vaga${sv !== 1 ? 's' : ''}` : 'esgotado'}
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <button onClick={() => onBook(boat, entry.date)}
                          className="text-xs font-black text-blue-600 hover:text-blue-900 transition-colors">
                          Reservar esta data →
                        </button>
                      )}
                    </div>
                  );
                })}
                {schedule.length > 4 && (
                  <button onClick={() => setShowAll(v => !v)}
                    className="w-full text-center text-[11px] font-black text-blue-500 hover:text-blue-900 transition-colors py-2 flex items-center justify-center gap-1.5">
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAll ? 'rotate-180' : ''}`} />
                    {showAll ? 'Mostrar menos' : `+${schedule.length - 4} datas disponíveis`}
                  </button>
                )}
              </div>
            )}
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