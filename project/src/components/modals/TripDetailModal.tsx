// src/components/modals/TripDetailModal.tsx
import { useState, useEffect } from 'react';
import {
  X, ShieldCheck, MapPin, Users, ChevronLeft, ChevronRight,
  ChevronDown, CalendarDays, ArrowRight, Clock, Anchor,
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

  const [photoIdx, setPhotoIdx] = useState(0);
  const [showAll,  setShowAll]  = useState(false);
  const [selDate,  setSelDate]  = useState<string | null>(null);
  const [selSlot,  setSelSlot]  = useState<string | null>(null);
  const [schedule, setSchedule] = useState<any[]>([]);

  const visible  = showAll ? schedule : schedule.slice(0, 4);
  const hasSlots = schedule.some((e: any) => e.time_slots.length > 0);
  const canBook  = selDate !== null && selSlot !== null;

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    setSchedule(buildScheduleFromBookings(boat, getBookings()));
    return () => { document.body.style.overflow = ''; };
  }, [boat]);

  const prevPhoto = () => setPhotoIdx(i => (i - 1 + allPhotos.length) % allPhotos.length);
  const nextPhoto = () => setPhotoIdx(i => (i + 1) % allPhotos.length);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6"
      style={{ background: 'rgba(4,10,24,0.92)', backdropFilter: 'blur(10px)' }}
      onClick={onClose}
    >
      <div
        className="bg-white w-full shadow-2xl border border-[#c9a96e]/20 flex flex-col lg:flex-row overflow-hidden"
        style={{ maxWidth: 1100, maxHeight: '92vh' }}
        onClick={e => e.stopPropagation()}
      >

        {/* ── Coluna esquerda: galeria full ──────────────────────────── */}
        <div className="relative bg-[#060e1e] lg:w-[55%] flex-shrink-0 flex flex-col" style={{ minHeight: 340 }}>

          {/* Foto principal */}
          <div className="flex-1 flex items-center justify-center overflow-hidden" style={{ minHeight: 340 }}>
            {allPhotos.length > 0
              ? <img
                  key={photoIdx}
                  src={allPhotos[photoIdx]}
                  alt={boat.name}
                  className="w-full h-full object-contain"
                  style={{ maxHeight: '80vh', display: 'block' }}
                />
              : <div className="flex flex-col items-center justify-center h-full gap-4 opacity-20">
                  <Anchor className="w-20 h-20 text-white" />
                  <span className="text-white text-sm font-semibold uppercase tracking-widest">Sem fotos</span>
                </div>
            }
          </div>

          {/* Overlay gradiente inferior */}
          <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />

          {/* Setas de navegação */}
          {allPhotos.length > 1 && (
            <>
              <button onClick={prevPhoto}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-[#c9a96e] text-white p-3 transition-all z-10">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={nextPhoto}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-[#c9a96e] text-white p-3 transition-all z-10">
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Thumbnails */}
          {allPhotos.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {allPhotos.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setPhotoIdx(i)}
                  className={`w-12 h-8 overflow-hidden border-2 transition-all flex-shrink-0 ${
                    i === photoIdx ? 'border-[#c9a96e] opacity-100' : 'border-white/20 opacity-50 hover:opacity-80'
                  }`}
                >
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Contador */}
          {allPhotos.length > 1 && (
            <div className="absolute top-4 left-4 bg-black/50 text-white text-[10px] font-semibold px-2.5 py-1 uppercase tracking-wider z-10">
              {photoIdx + 1} / {allPhotos.length}
            </div>
          )}

          {/* Marinheiro badge */}
          <div className="absolute top-4 right-12 bg-white/95 px-3 py-1.5 flex items-center gap-1.5 shadow-md z-10">
            {boat.sailor.verified && <ShieldCheck className="w-3 h-3 text-[#c9a96e]" />}
            <span className="font-semibold text-[#1a2b4a] text-[10px] uppercase tracking-wide">{boat.sailor.name}</span>
          </div>

          {/* Fechar */}
          <button onClick={onClose}
            className="absolute top-4 right-4 bg-black/50 hover:bg-[#c9a96e] text-white p-2 transition-all z-10">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Coluna direita: info + booking ────────────────────────── */}
        <div className="flex-1 flex flex-col overflow-y-auto" style={{ scrollbarWidth: 'none' }}>

          {/* Header do conteúdo */}
          <div className="px-7 pt-7 pb-5 border-b border-gray-100">
            <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.2em] mb-2">
              {boat.boat_type || 'Passeio'}
            </p>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-['Playfair_Display'] font-bold text-[#1a2b4a] leading-tight"
                  style={{ fontSize: 'clamp(22px, 2vw, 30px)' }}>
                  {boat.name}
                </h2>
                {(boat.city || boat.country_name) && (
                  <p className="text-sm text-gray-400 mt-1.5 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#c9a96e]" />
                    {[boat.city, boat.country_name].filter(Boolean).join(', ')}
                    {boat.country_flag && <span className="ml-1">{boat.country_flag}</span>}
                  </p>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-[0.15em]">Por pessoa</p>
                <p className="font-['Playfair_Display'] font-bold text-[#1a2b4a] text-2xl mt-0.5">
                  {formatPrice(boat.price_per_hour, boat)}
                </p>
              </div>
            </div>
          </div>

          {/* Conteúdo scrollável */}
          <div className="px-7 py-5 space-y-5 flex-1">

            {/* Rota */}
            <div className="bg-[#0a1628] px-5 py-4 relative overflow-hidden">
              <div className="absolute inset-0 opacity-[0.04]"
                style={{ backgroundImage: 'repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 0,transparent 40px),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 0,transparent 40px)' }} />
              <p className="text-[#c9a96e] text-[9px] font-semibold uppercase tracking-[0.2em] mb-3 relative z-10">Rota do passeio</p>
              <div className="flex items-center gap-4 relative z-10">
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] text-[#c9a96e]/70 font-semibold uppercase mb-1">⚓ Embarque</p>
                  <p className="font-semibold text-white text-sm leading-tight">{from}</p>
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
                  <p className="text-[9px] text-[#c9a96e]/70 font-semibold uppercase mb-1">🏁 Desembarque</p>
                  <p className="font-semibold text-white/80 text-sm leading-tight">{to && to !== from ? to : from}</p>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              <span className="bg-gray-50 border border-gray-100 px-4 py-2 text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#c9a96e]" /> Até {boat.capacity} pessoas
              </span>
              {(boat.minimo_tripulantes ?? 0) > 1 && (
                <span className="bg-amber-50 border border-amber-200 px-4 py-2 text-[10px] font-semibold text-amber-700">
                  ⚠️ Mín. {boat.minimo_tripulantes} confirmados
                </span>
              )}
              {boat.bebidas === 'inclusas' && (
                <span className="bg-emerald-50 border border-emerald-200 px-4 py-2 text-[10px] font-semibold text-emerald-700">
                  🍾 Bebidas inclusas
                </span>
              )}
              {boat.comida === 'inclusa' && (
                <span className="bg-emerald-50 border border-emerald-200 px-4 py-2 text-[10px] font-semibold text-emerald-700">
                  🍽️ Comida inclusa
                </span>
              )}
              {boat.bar === 'tem' && (
                <span className="bg-[#0a1628]/5 border border-[#c9a96e]/20 px-4 py-2 text-[10px] font-semibold text-[#1a2b4a]">
                  🍹 Bar a bordo
                </span>
              )}
            </div>

            {boat.descricao && (
              <p className="text-sm text-gray-500 leading-relaxed border-l-2 border-[#c9a96e]/30 pl-4">
                {boat.descricao}
              </p>
            )}

            {/* Datas */}
            <div>
              <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em] mb-3 flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5" /> Datas e horários disponíveis
              </p>
              {schedule.length === 0 ? (
                <div className="bg-gray-50 border border-gray-100 p-6 text-center">
                  <p className="text-gray-300 font-semibold text-xs uppercase tracking-widest">Sem datas disponíveis no momento</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {visible.map((entry, i) => {
                    const [ey, em, ed] = entry.date.split('-');
                    const badge = entry.spotsLeft > 3
                      ? 'bg-green-100 text-green-700 border-green-200'
                      : 'bg-amber-100 text-amber-700 border-amber-200';
                    return (
                      <div key={i} className="bg-[#0a1628]/5 border border-[#c9a96e]/20 px-4 py-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-[#1a2b4a] text-sm">{ed}/{em}/{ey}</span>
                          <span className={`text-[10px] font-semibold px-2.5 py-0.5 border ${badge}`}>
                            {entry.spotsLeft} vaga{entry.spotsLeft !== 1 ? 's' : ''}
                          </span>
                        </div>
                        {entry.time_slots.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {entry.time_slots.map((slot: string, si: number) => {
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
                                  className={`px-3 py-1.5 border text-[11px] font-semibold transition-all ${
                                    isSel
                                      ? 'bg-[#0a1628] border-[#0a1628] text-white'
                                      : ok
                                      ? 'bg-white border-[#c9a96e]/30 text-[#1a2b4a] hover:border-[#c9a96e]'
                                      : 'bg-gray-50 border-gray-200 text-gray-400 opacity-50 cursor-not-allowed'
                                  }`}>
                                  {isSel ? '✓ ' : ''}{slot} · {ok ? `${sv} vaga${sv !== 1 ? 's' : ''}` : 'esgotado'}
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <button onClick={() => onBook(boat, entry.date)}
                            className="text-xs font-semibold text-[#c9a96e] hover:text-[#1a2b4a] transition-colors">
                            Reservar esta data →
                          </button>
                        )}
                      </div>
                    );
                  })}
                  {schedule.length > 4 && (
                    <button onClick={() => setShowAll(v => !v)}
                      className="w-full text-center text-[11px] font-semibold text-[#c9a96e] hover:text-[#1a2b4a] py-2 flex items-center justify-center gap-1.5 transition-colors">
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAll ? 'rotate-180' : ''}`} />
                      {showAll ? 'Mostrar menos' : `+${schedule.length - 4} datas disponíveis`}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer fixo com CTA */}
          <div className="px-7 pb-7 pt-4 border-t border-gray-100 bg-white flex-shrink-0">
            {hasSlots && !canBook && (
              <div className="flex items-center gap-2 bg-[#0a1628]/5 border border-[#c9a96e]/20 px-4 py-3 mb-4">
                <span className="text-[#c9a96e]">👆</span>
                <p className="text-[11px] font-semibold text-[#1a2b4a]">Selecione um horário acima para continuar</p>
              </div>
            )}
            <button
              disabled={hasSlots && !canBook}
              onClick={() => {
                if (canBook) { onBook(boat, selDate!, selSlot!); }
                else if (!hasSlots) { onBook(boat); }
              }}
              className={`w-full py-4 font-semibold uppercase tracking-[0.2em] text-sm transition-all flex items-center justify-center gap-2 ${
                hasSlots && !canBook
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-[#0a1628] hover:bg-[#1a2b4a] text-white'
              }`}>
              {canBook ? `Confirmar · ${selSlot}` : 'Reservar este Passeio'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
