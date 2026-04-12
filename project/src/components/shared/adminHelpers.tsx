// src/components/AdminDashboard/shared/adminHelpers.ts
// ─────────────────────────────────────────────────────────────────────────────
// Helpers, constantes e micro-componentes partilhados por todas as tabs
// e modais do AdminDashboard.
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from 'react';
import { Check, Copy, X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

// ── LightboxViewer — galeria com setas, fundo blur, sem preto ─────────────────
interface LightboxProps {
  images: string[];        // lista de URLs
  startIndex?: number;     // índice inicial
  labels?: string[];       // label opcional por imagem
  onClose: () => void;
}

export function LightboxViewer({ images, startIndex = 0, labels, onClose }: LightboxProps) {
  const [idx, setIdx] = useState(startIndex);
  const total = images.length;
  const prev = (e: React.MouseEvent) => { e.stopPropagation(); setIdx(i => (i - 1 + total) % total); };
  const next = (e: React.MouseEvent) => { e.stopPropagation(); setIdx(i => (i + 1) % total); };

  // fechar com ESC
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft')  setIdx(i => (i - 1 + total) % total);
    if (e.key === 'ArrowRight') setIdx(i => (i + 1) % total);
  };

  return (
    <div
      className="fixed inset-0 z-[500] flex items-center justify-center"
      style={{ backdropFilter: 'blur(20px)', background: 'rgba(15,23,60,0.75)' }}
      onClick={onClose}
      onKeyDown={onKey}
      tabIndex={0}
      autoFocus
    >
      {/* Imagem central */}
      <div className="relative flex items-center justify-center w-full h-full p-6"
        onClick={e => e.stopPropagation()}>

        <img
          src={images[idx]}
          alt={labels?.[idx] || `foto ${idx + 1}`}
          className="max-w-full max-h-[85vh] rounded-[24px] object-contain shadow-2xl border-4 border-white/20"
          style={{ userSelect: 'none' }}
        />

        {/* Label */}
        {labels?.[idx] && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full">
            <p className="text-white text-xs font-black uppercase tracking-widest">{labels[idx]}</p>
          </div>
        )}

        {/* Contador */}
        {total > 1 && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full">
            <p className="text-white text-[10px] font-black">{idx + 1} / {total}</p>
          </div>
        )}

        {/* Seta esquerda */}
        {total > 1 && (
          <button onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/15 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all shadow-xl border border-white/20">
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Seta direita */}
        {total > 1 && (
          <button onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/15 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all shadow-xl border border-white/20">
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        {/* Fechar */}
        <button onClick={onClose}
          className="absolute top-4 right-4 bg-white/15 hover:bg-white/30 backdrop-blur-sm text-white p-2.5 rounded-full transition-all border border-white/20">
          <X className="w-5 h-5" />
        </button>

        {/* Thumbnails */}
        {total > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button key={i} onClick={e => { e.stopPropagation(); setIdx(i); }}
                className={`w-2 h-2 rounded-full transition-all ${i === idx ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/70'}`} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Hook auxiliar para lightbox de doc (frente + verso) ───────────────────────
// Usado pelo DocImage para abrir frente/verso como galeria navegável

// ── Formatação de moeda ───────────────────────────────────────────────────────

/** Formata valor em BRL (fallback global) */
export const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

/**
 * Formata valor usando a moeda da viagem, com fallback para BRL.
 * `t` deve ter as propriedades `currency` e `currency_locale`.
 */
export function fmtTrip(value: number, t: any): string {
  try {
    if (t.currency && t.currency_locale) {
      return new Intl.NumberFormat(t.currency_locale, {
        style: 'currency',
        currency: t.currency,
        minimumFractionDigits: t.currency === 'JPY' ? 0 : 2,
      }).format(value);
    }
  } catch {}
  return fmt(value);
}

// ── Constantes ────────────────────────────────────────────────────────────────

export const DOC_TYPE_LABELS: Record<string, string> = {
  passport:        'Passaporte',
  rg:              'RG — Registro Geral',
  bi:              'BI — Bilhete de Identidade',
  cc:              'CC — Cartão de Cidadão',
  cnh:             'CNH — Carteira de Habilitação',
  habilitacao_nau: 'Habilitação Náutica',
  nif:             'NIF / NIT',
  other:           'Outro',
};

export const todayStr = new Date().toISOString().split('T')[0];

// ── Helpers de UI ─────────────────────────────────────────────────────────────

export function isImg(url: string): boolean {
  return /\.(jpg|jpeg|png|webp|gif)/i.test(url) || url.startsWith('data:image');
}

export function stripNonDigits(s: string): string {
  return s.replace(/\D/g, '');
}

// ── Micro-componentes (sem ficheiro próprio — demasiado pequenos) ─────────────

/** Botão de copiar texto para clipboard */
export function CopyBtn({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setDone(true);
        setTimeout(() => setDone(false), 2000);
      }}
      className="ml-2 p-1 rounded hover:bg-blue-100 transition-colors inline-flex"
    >
      {done
        ? <Check className="w-3 h-3 text-green-600" />
        : <Copy className="w-3 h-3 text-blue-400" />
      }
    </button>
  );
}

/** Imagem ou link de documento */
export function DocImage({ url, label, allImages, allLabels }: {
  url: string; label: string;
  allImages?: string[];  // conjunto de imagens para navegar (ex: frente+verso)
  allLabels?: string[];
}) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  if (!url) return null;

  const imgs   = allImages || [url];
  const labels = allLabels || [label];
  const myIdx  = imgs.indexOf(url);

  return (
    <div className="mt-2">
      <p className="text-[9px] font-black text-gray-400 uppercase mb-1.5">📎 {label}</p>
      {isImg(url) ? (
        <>
          <div onClick={() => setLightboxIdx(myIdx >= 0 ? myIdx : 0)}
            className="cursor-zoom-in relative group">
            <img
              src={url}
              alt={label}
              className="w-full max-h-48 object-contain rounded-[14px] border-2 border-blue-100 bg-gray-50 hover:border-blue-900 transition-all"
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all rounded-[14px] bg-blue-900/10">
              <div className="bg-blue-900/80 text-white px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <ZoomIn className="w-3.5 h-3.5" />
                <span className="text-[10px] font-black uppercase">Ver</span>
              </div>
            </div>
          </div>
          {lightboxIdx !== null && (
            <LightboxViewer
              images={imgs}
              labels={labels}
              startIndex={lightboxIdx}
              onClose={() => setLightboxIdx(null)}
            />
          )}
        </>
      ) : (
        <a href={url} target="_blank" rel="noreferrer"
          className="flex items-center gap-3 bg-blue-50 border-2 border-blue-100 rounded-[14px] px-4 py-3 hover:border-blue-900 transition-all">
          <span className="text-xl">📄</span>
          <div>
            <p className="font-black text-blue-900 text-xs">Ver documento</p>
            <p className="text-[10px] text-blue-400 font-bold">Clique para abrir</p>
          </div>
        </a>
      )}
    </div>
  );
}

/** Campo de label + valor para dossiês */
export function DossierField({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-[15px] p-3.5">
      <p className="text-[9px] font-black text-gray-400 uppercase">{label}</p>
      <p className="font-black text-blue-900 text-sm mt-0.5 break-all">{value || '—'}</p>
    </div>
  );
}