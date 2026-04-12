// src/components/modals/EditTripModalShared.tsx
// Helpers e sub-componentes partilhados pelo EditTripModal.
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { TIME_OPTIONS, type ScheduleEntry } from '../../constants/constants';

// ── helpers ───────────────────────────────────────────────────────────────────

export function duracaoToHours(dur: string): number {
  if (!dur) return 0;
  if (dur === 'Dia completo')  return 12;
  if (dur === 'Fim de semana') return 24;
  const m = dur.match(/^(\d+)h$/);
  return m ? parseInt(m[1], 10) : 0;
}

export function getBlockedSlots(start: string, hours: number): Set<string> {
  const blocked = new Set<string>();
  if (!start || hours <= 0) return blocked;
  const [sh] = start.split(':').map(Number);
  const startMin = sh * 60;
  const endMin   = startMin + hours * 60;
  TIME_OPTIONS.forEach(s => {
    const [h] = s.split(':').map(Number);
    const sm  = h * 60;
    if (sm > startMin && sm < endMin) blocked.add(s);
  });
  return blocked;
}

export function entryBlocked(entry: ScheduleEntry, duracao: string): Set<string> {
  const hours = duracaoToHours(duracao);
  const b = new Set<string>();
  entry.time_slots.forEach(s => getBlockedSlots(s, hours).forEach(x => b.add(x)));
  return b;
}

export const fmt = (d: string) => {
  if (!d) return '—';
  const [y, m, dd] = d.split('-');
  return `${dd}/${m}/${y}`;
};

export const DURACOES = ['2h','4h','6h','8h','Dia completo','Fim de semana'];

// ── CarouselPreview ───────────────────────────────────────────────────────────

export function CarouselPreview({ photos, cover }: { photos: string[]; cover: string }) {
  const [idx, setIdx] = useState(0);
  const current = photos[idx] || '';
  const canPrev = idx > 0;
  const canNext = idx < photos.length - 1;

  return (
    <div className="relative rounded-[20px] overflow-hidden bg-blue-900" style={{ aspectRatio: '16/7' }}>
      <img
        key={current}
        src={current}
        alt=""
        className="w-full h-full object-cover transition-all duration-500"
      />

      {/* Badge CAPA */}
      {current === cover && (
        <div className="absolute top-3 left-3 bg-blue-900/90 text-white text-[9px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 backdrop-blur-sm">
          ⭐ CAPA
        </div>
      )}

      {/* Contador */}
      <div className="absolute top-3 right-3 bg-black/50 text-white text-[9px] font-black px-2 py-1 rounded-full backdrop-blur-sm">
        {idx + 1} / {photos.length}
      </div>

      {/* Setas */}
      {canPrev && (
        <button type="button"
          onClick={() => setIdx(i => i - 1)}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white w-9 h-9 rounded-full flex items-center justify-center transition-all backdrop-blur-sm">
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}
      {canNext && (
        <button type="button"
          onClick={() => setIdx(i => i + 1)}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white w-9 h-9 rounded-full flex items-center justify-center transition-all backdrop-blur-sm">
          <ChevronRight className="w-5 h-5" />
        </button>
      )}

      {/* Dots */}
      {photos.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {photos.map((_, i) => (
            <button key={i} type="button"
              onClick={() => setIdx(i)}
              className={`rounded-full transition-all ${i === idx ? 'w-5 h-2 bg-white' : 'w-2 h-2 bg-white/50 hover:bg-white/80'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
