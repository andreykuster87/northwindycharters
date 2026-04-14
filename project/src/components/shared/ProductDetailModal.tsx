// src/components/shared/ProductDetailModal.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Modal genérico de detalhes de produto — álbum de fotos com scroll horizontal,
// especificações organizadas em seções, botões de ação.
// Reutilizado por todas as sub-abas do Marketplace.
// ─────────────────────────────────────────────────────────────────────────────
import { useRef, useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, MapPin, Heart, Share2 } from 'lucide-react';

/* ── tipos ────────────────────────────────────────────────────────────────── */
export interface DetailSpec {
  label: string;
  value: string;
}

export interface DetailSection {
  title: string;
  content: React.ReactNode;
}

export interface ProductDetailProps {
  title: string;
  subtitle?: string;
  fotos: string[];
  price?: string;
  location?: string;
  badge?: string;
  badgeColor?: string;
  specs?: DetailSpec[];
  sections?: DetailSection[];
  footerActions?: React.ReactNode;
  onClose: () => void;
}

/* ── componente ───────────────────────────────────────────────────────────── */
export function ProductDetailModal({
  title,
  subtitle,
  fotos,
  price,
  location,
  badge,
  badgeColor = 'bg-[#0a1628]/5 text-[#1a2b4a]',
  specs,
  sections,
  footerActions,
  onClose,
}: ProductDetailProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [isFav, setIsFav] = useState(false);

  /* atualiza dot indicator ao scrollar */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handler = () => {
      const idx = Math.round(el.scrollLeft / el.clientWidth);
      setActiveIdx(idx);
    };
    el.addEventListener('scroll', handler, { passive: true });
    return () => el.removeEventListener('scroll', handler);
  }, []);

  const scrollTo = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const w = el.clientWidth;
    el.scrollBy({ left: dir === 'left' ? -w : w, behavior: 'smooth' });
  };

  /* fecha com ESC */
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm overflow-y-auto p-2 sm:p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white w-full max-w-2xl my-4 overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-200">

        {/* ── Álbum de fotos ─────────────────────────────────────────────── */}
        <div className="relative group">
          {fotos.length > 0 ? (
            <>
              <div ref={scrollRef}
                className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none"
                style={{ scrollSnapType: 'x mandatory' }}>
                {fotos.map((src, i) => (
                  <div key={i} className="w-full flex-shrink-0 snap-center">
                    <img src={src} alt={`${title} ${i + 1}`}
                      className="w-full h-56 sm:h-72 object-cover" />
                  </div>
                ))}
              </div>

              {/* setas */}
              {fotos.length > 1 && (
                <>
                  <button onClick={() => scrollTo('left')}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button onClick={() => scrollTo('right')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* dots */}
              {fotos.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {fotos.map((_, i) => (
                    <span key={i} className={`w-2 h-2 rounded-full transition-all ${
                      i === activeIdx ? 'bg-white scale-125 shadow' : 'bg-white/50'
                    }`} />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-48 bg-gradient-to-br from-[#0a1628] to-[#1a2b4a] flex items-center justify-center">
              <span className="text-white/30 text-5xl font-bold">?</span>
            </div>
          )}

          {/* botões overlay */}
          <div className="absolute top-3 right-3 flex gap-2">
            <button onClick={() => setIsFav(f => !f)}
              className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center transition-all hover:bg-black/60">
              <Heart className={`w-4 h-4 ${isFav ? 'fill-red-400 text-red-400' : 'text-white'}`} />
            </button>
            <button className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center transition-all hover:bg-black/60">
              <Share2 className="w-4 h-4 text-white" />
            </button>
          </div>
          <button onClick={onClose}
            className="absolute top-3 left-3 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center transition-all hover:bg-black/60">
            <X className="w-5 h-5 text-white" />
          </button>

          {/* contador de fotos */}
          {fotos.length > 1 && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-sm text-white text-[10px] font-semibold px-2.5 py-1">
              {activeIdx + 1} / {fotos.length}
            </div>
          )}
        </div>

        {/* ── Conteúdo ───────────────────────────────────────────────────── */}
        <div className="p-5 space-y-4">
          {/* título + badge */}
          <div>
            {badge && (
              <span className={`text-[9px] font-semibold uppercase px-2 py-0.5 ${badgeColor} mr-2`}>
                {badge}
              </span>
            )}
            <h2 className="font-bold text-[#1a2b4a] text-lg leading-snug mt-1" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>{title}</h2>
            {subtitle && <p className="text-xs text-gray-400 font-bold mt-0.5">{subtitle}</p>}
          </div>

          {/* local + preço */}
          {(location || price) && (
            <div className="flex items-center justify-between">
              {location && (
                <div className="flex items-center gap-1.5 text-xs text-gray-500 font-bold">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  {location}
                </div>
              )}
              {price && (
                <div className="text-right">
                  <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-[0.15em]">Preço</p>
                  <p className="font-bold text-[#1a2b4a] text-xl leading-none">{price}</p>
                </div>
              )}
            </div>
          )}

          {/* specs grid */}
          {specs && specs.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {specs.map(s => (
                <div key={s.label} className="bg-gray-50 px-3 py-2">
                  <p className="text-[9px] font-semibold text-gray-400 uppercase">{s.label}</p>
                  <p className="text-sm font-bold text-[#1a2b4a]">{s.value}</p>
                </div>
              ))}
            </div>
          )}

          {/* seções adicionais */}
          {sections && sections.map((sec, i) => (
            <div key={i}>
              <h3 className="text-xs font-semibold text-[#c9a96e] uppercase tracking-[0.15em] mb-2">{sec.title}</h3>
              <div className="text-xs text-gray-600 font-bold leading-relaxed">{sec.content}</div>
            </div>
          ))}

          {/* ações de rodapé */}
          {footerActions && (
            <div className="pt-3 border-t border-gray-100">
              {footerActions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
