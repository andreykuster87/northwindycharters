// src/components/shared/Pagination.tsx
// Componente de paginação reutilizável — design NorthWindy.
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  page:       number;
  totalPages: number;
  totalItems: number;
  from:       number;
  to:         number;
  hasPrev:    boolean;
  hasNext:    boolean;
  onPrev:     () => void;
  onNext:     () => void;
  onPage:     (p: number) => void;
}

export function Pagination({ page, totalPages, totalItems, from, to, hasPrev, hasNext, onPrev, onNext, onPage }: Props) {
  if (totalPages <= 1) return null;

  // Gera janela de páginas visíveis (max 5)
  const pages: (number | '…')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3)           pages.push('…');
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push('…');
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-white">
      {/* Contador */}
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
        {from}–{to} de <span className="text-[#1a2b4a]">{totalItems}</span>
      </p>

      {/* Controlos */}
      <div className="flex items-center gap-1">
        <button
          onClick={onPrev} disabled={!hasPrev}
          className="w-7 h-7 flex items-center justify-center border border-gray-200 text-gray-400 hover:border-[#c9a96e] hover:text-[#1a2b4a] disabled:opacity-30 disabled:cursor-not-allowed transition-all">
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        {pages.map((p, i) =>
          p === '…' ? (
            <span key={`e${i}`} className="w-7 h-7 flex items-center justify-center text-[10px] text-gray-300">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPage(p as number)}
              className={`w-7 h-7 flex items-center justify-center text-[10px] font-bold border transition-all
                ${page === p
                  ? 'bg-[#0a1628] text-white border-[#0a1628]'
                  : 'border-gray-200 text-gray-500 hover:border-[#c9a96e] hover:text-[#1a2b4a]'
                }`}>
              {p}
            </button>
          )
        )}

        <button
          onClick={onNext} disabled={!hasNext}
          className="w-7 h-7 flex items-center justify-center border border-gray-200 text-gray-400 hover:border-[#c9a96e] hover:text-[#1a2b4a] disabled:opacity-30 disabled:cursor-not-allowed transition-all">
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
