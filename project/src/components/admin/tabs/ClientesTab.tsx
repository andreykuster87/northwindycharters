// src/components/AdminDashboard/tabs/ClientesTab.tsx
import { useState } from 'react';
import { Search, ExternalLink } from 'lucide-react';
import { type Client } from '../../../lib/localStore';
import { usePagination } from '../../../hooks/usePagination';
import { Pagination }    from '../../shared/Pagination';

// ── Props ─────────────────────────────────────────────────────────────────────

interface ClientesTabProps {
  activeClients:  Client[];
  pendingClients: Client[];
  /** Navega para a sub-aba de usuários em Solicitações */
  onGoToSolicitacoes: () => void;
  onOpenDossier: (client: Client) => void;
  onViewProfile?: (client: Client) => void;
}

// ── Componente ────────────────────────────────────────────────────────────────

export function ClientesTab({
  activeClients,
  pendingClients,
  onGoToSolicitacoes,
  onOpenDossier,
  onViewProfile,
}: ClientesTabProps) {
  const [search, setSearch] = useState('');

  const filtered = [...activeClients]
    .filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name, 'pt'));

  const pg = usePagination(filtered, 25);

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 className="font-['Playfair_Display'] font-bold text-3xl text-[#1a2b4a]">Usuários NorthWindy</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Pesquisar nome ou email…"
            className="pl-9 pr-4 py-2 border border-gray-200 text-xs font-medium text-[#1a2b4a] outline-none focus:border-[#c9a96e] w-64 transition-all" />
        </div>
      </div>

      {/* Banner de pendentes */}
      {pendingClients.length > 0 && (
        <div className="bg-[#c9a96e]/5 border-2 border-[#c9a96e]/20 px-5 py-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-[#1a2b4a]">
            ⏳ {pendingClients.length} usuário(s) aguardando verificação
          </p>
          <button
            onClick={onGoToSolicitacoes}
            className="text-xs font-semibold text-[#1a2b4a] underline"
          >
            Ver solicitações →
          </button>
        </div>
      )}

      {/* Lista */}
      {filtered.length === 0 ? (
        <div className="bg-white p-16 text-center border-2 border-dashed border-gray-200 flex flex-col items-center justify-center min-h-[320px]">
          <div className="text-5xl mb-6">👤</div>
          <p className="text-gray-400 font-semibold uppercase text-lg">
            {search ? 'Nenhum resultado encontrado' : 'Nenhum usuário verificado ainda'}
          </p>
        </div>
      ) : (
        <div className="bg-white border-2 border-[#0a1628]/5 overflow-hidden shadow-sm">
          <div className="divide-y divide-gray-50">
            {pg.paged.map(c => (
              <div
                key={c.id}
                onClick={() => onOpenDossier(c)}
                className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors group"
              >
                <div className="w-11 h-11 bg-[#0a1628] text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {c.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[#1a2b4a] uppercase">{c.name}</p>
                  <p className="text-xs font-bold text-gray-400 truncate">
                    {c.email} · {c.country_name}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {(c as any).profile_number && (
                    <span className="bg-[#c9a96e]/15 text-[#c9a96e] text-[9px] font-semibold px-2 py-0.5">
                      #{String(parseInt((c as any).profile_number, 10))}
                    </span>
                  )}
                  {onViewProfile && (
                    <button
                      onClick={e => { e.stopPropagation(); onViewProfile(c); }}
                      title="Ver perfil"
                      className="flex items-center gap-1 text-[9px] font-semibold uppercase px-2 py-1 bg-[#0a1628]/5 text-[#1a2b4a] hover:bg-[#c9a96e]/15 hover:text-[#c9a96e] transition-colors border border-[#0a1628]/10">
                      <ExternalLink className="w-3 h-3" /> Perfil
                    </button>
                  )}
                  {(c as any).blocked ? (
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
