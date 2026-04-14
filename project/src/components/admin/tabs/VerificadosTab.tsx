// src/components/AdminDashboard/tabs/VerificadosTab.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Aba de profissionais verificados (só admin) — lista ordenada com dossiê.
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from 'react';
import { Search, ExternalLink } from 'lucide-react';
import { type Sailor } from '../../../lib/localStore';
import { usePagination } from '../../../hooks/usePagination';
import { Pagination }    from '../../shared/Pagination';

// ── Props ─────────────────────────────────────────────────────────────────────

interface VerificadosTabProps {
  verified: Sailor[];
  onOpenDossier:  (sailor: Sailor) => void;
  onViewProfile?: (sailor: Sailor) => void;
}

// ── Componente ────────────────────────────────────────────────────────────────

export function VerificadosTab({ verified, onOpenDossier, onViewProfile }: VerificadosTabProps) {
  const [search, setSearch] = useState('');

  const sorted = [...verified]
    .filter(s => !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name, 'pt'));

  const pg = usePagination(sorted, 25);

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 className="font-['Playfair_Display'] font-bold text-3xl text-[#1a2b4a]">Profissionais Verificados</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Pesquisar nome ou email…"
            className="pl-9 pr-4 py-2 border border-gray-200 text-xs font-medium text-[#1a2b4a] outline-none focus:border-[#c9a96e] w-64 transition-all" />
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="bg-white p-16 text-center border-2 border-dashed border-gray-200">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-gray-400 font-semibold uppercase">
            {search ? 'Nenhum resultado encontrado' : 'Nenhum profissional verificado ainda'}
          </p>
        </div>
      ) : (
        <div className="bg-white border-2 border-green-100 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-gray-50">
            <p className="text-xs font-semibold text-[#c9a96e] uppercase tracking-[0.15em]">
              {sorted.length} profissional(is)
            </p>
          </div>
          <div className="divide-y divide-gray-50">
            {pg.paged.map(s => (
              <div
                key={s.id}
                onClick={() => onOpenDossier(s)}
                className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors group"
              >
                <div className="w-11 h-11 bg-green-100 flex items-center justify-center font-bold text-green-700 text-sm flex-shrink-0">
                  {s.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-[#1a2b4a] uppercase">{s.name}</p>
                  </div>
                  <p className="text-xs font-bold text-gray-400 truncate">
                    {s.email} · {s.phone || '—'}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {(s as any).profile_number && (
                    <span className="bg-[#c9a96e]/15 text-[#c9a96e] text-[9px] font-semibold px-2 py-0.5">
                      #{String(parseInt((s as any).profile_number, 10))}
                    </span>
                  )}
                  {onViewProfile && (
                    <button
                      onClick={e => { e.stopPropagation(); onViewProfile(s); }}
                      title="Ver perfil público"
                      className="flex items-center gap-1 text-[9px] font-semibold uppercase px-2 py-1 bg-[#0a1628]/5 text-[#1a2b4a] hover:bg-[#c9a96e]/15 hover:text-[#c9a96e] transition-colors border border-[#0a1628]/10">
                      <ExternalLink className="w-3 h-3" /> Perfil
                    </button>
                  )}
                  {(s as any).blocked ? (
                    <span className="text-red-500 text-lg">🚫</span>
                  ) : (
                    <span className="text-green-500 text-lg" title="Verificado">✔</span>
                  )}
                </div>
              </div>
            ))}
          </div>
          <Pagination {...pg} onPrev={pg.prev} onNext={pg.next} onPage={pg.setPage} />
        </div>
      )}
    </div>
  );
}
