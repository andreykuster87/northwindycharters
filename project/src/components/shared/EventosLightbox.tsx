// src/components/shared/EventosLightbox.tsx
import { useState } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

// ── Lightbox ──────────────────────────────────────────────────────────────────

export function Lightbox({ photos, index, onClose }: { photos: string[]; index: number; onClose: () => void }) {
  const [cur, setCur] = useState(index);

  function prev() { setCur(i => (i - 1 + photos.length) % photos.length); }
  function next() { setCur(i => (i + 1) % photos.length); }

  return (
    <div
      className="fixed inset-0 z-[300] bg-black/95 flex items-center justify-center"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-all z-10"
      >
        <X className="w-5 h-5" />
      </button>

      {photos.length > 1 && (
        <>
          <button
            onClick={e => { e.stopPropagation(); prev(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-all z-10"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={e => { e.stopPropagation(); next(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-all z-10"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      <img
        src={photos[cur]}
        alt={`Foto ${cur + 1}`}
        className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
        onClick={e => e.stopPropagation()}
      />

      {photos.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5">
          {photos.map((_, i) => (
            <button key={i} onClick={e => { e.stopPropagation(); setCur(i); }}
              className={`w-2 h-2 rounded-full transition-all ${i === cur ? 'bg-white w-5' : 'bg-white/40'}`}
            />
          ))}
        </div>
      )}

      <p className="absolute bottom-6 right-6 text-white/50 text-xs font-bold">
        {cur + 1} / {photos.length}
      </p>
    </div>
  );
}

// ── PhotoAlbum ────────────────────────────────────────────────────────────────

export function PhotoAlbum({ photos, emoji }: { photos: string[]; emoji: string }) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  if (!photos || photos.length === 0) {
    return (
      <div className="w-full h-36 bg-gradient-to-br from-blue-900 to-blue-700 rounded-[16px] flex items-center justify-center text-5xl">
        {emoji}
      </div>
    );
  }

  if (photos.length === 1) {
    return (
      <>
        <div
          className="relative w-full h-48 rounded-[16px] overflow-hidden cursor-zoom-in group"
          onClick={() => setLightboxIdx(0)}
        >
          <img src={photos[0]} alt="Foto" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
            <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
          </div>
        </div>
        {lightboxIdx !== null && <Lightbox photos={photos} index={lightboxIdx} onClose={() => setLightboxIdx(null)} />}
      </>
    );
  }

  if (photos.length === 2) {
    return (
      <>
        <div className="grid grid-cols-2 gap-1.5 rounded-[16px] overflow-hidden h-40">
          {photos.map((p, i) => (
            <div key={i} className="relative cursor-zoom-in group overflow-hidden"
              onClick={() => setLightboxIdx(i)}>
              <img src={p} alt={`Foto ${i+1}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                <ZoomIn className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          ))}
        </div>
        {lightboxIdx !== null && <Lightbox photos={photos} index={lightboxIdx} onClose={() => setLightboxIdx(null)} />}
      </>
    );
  }

  // 3+ fotos: destaque + grid
  return (
    <>
      <div className="grid grid-cols-3 gap-1.5 rounded-[16px] overflow-hidden h-44">
        <div
          className="col-span-2 row-span-2 relative cursor-zoom-in group overflow-hidden rounded-tl-[16px] rounded-bl-[16px]"
          onClick={() => setLightboxIdx(0)}
        >
          <img src={photos[0]} alt="Foto principal" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
            <ZoomIn className="w-7 h-7 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
          </div>
        </div>
        {photos.slice(1, 3).map((p, i) => (
          <div
            key={i}
            className={`relative cursor-zoom-in group overflow-hidden ${i === 0 ? 'rounded-tr-[16px]' : 'rounded-br-[16px]'}`}
            onClick={() => setLightboxIdx(i + 1)}
          >
            <img src={p} alt={`Foto ${i+2}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
            {i === 1 && photos.length > 3 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white font-black text-lg">+{photos.length - 3}</span>
              </div>
            )}
            {!(i === 1 && photos.length > 3) && (
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                <ZoomIn className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            )}
          </div>
        ))}
      </div>
      {lightboxIdx !== null && <Lightbox photos={photos} index={lightboxIdx} onClose={() => setLightboxIdx(null)} />}
    </>
  );
}
