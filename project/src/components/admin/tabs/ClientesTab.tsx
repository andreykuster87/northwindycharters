// src/components/AdminDashboard/tabs/ClientesTab.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Aba de usuários NorthWindy (só admin) — lista de clientes verificados.
// ─────────────────────────────────────────────────────────────────────────────
import { type Client } from '../../../lib/localStore';

// ── Props ─────────────────────────────────────────────────────────────────────

interface ClientesTabProps {
  activeClients:  Client[];
  pendingClients: Client[];
  /** Navega para a sub-aba de usuários em Solicitações */
  onGoToSolicitacoes: () => void;
  onOpenDossier: (client: Client) => void;
}

// ── Componente ────────────────────────────────────────────────────────────────

export function ClientesTab({
  activeClients,
  pendingClients,
  onGoToSolicitacoes,
  onOpenDossier,
}: ClientesTabProps) {
  const sorted = [...activeClients].sort((a, b) => a.name.localeCompare(b.name, 'pt'));

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div>
        <h2 className="text-3xl font-black text-blue-900 uppercase italic">Usuários NorthWindy</h2>
      </div>

      {/* Banner de pendentes */}
      {pendingClients.length > 0 && (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-[20px] px-5 py-3 flex items-center justify-between">
          <p className="text-sm font-black text-amber-700">
            ⏳ {pendingClients.length} usuário(s) aguardando verificação
          </p>
          <button
            onClick={onGoToSolicitacoes}
            className="text-xs font-black text-blue-900 underline"
          >
            Ver solicitações →
          </button>
        </div>
      )}

      {/* Lista */}
      {sorted.length === 0 ? (
        <div className="bg-white rounded-[40px] p-16 text-center border-2 border-dashed border-gray-200 flex flex-col items-center justify-center min-h-[320px]">
          <div className="text-5xl mb-6">👤</div>
          <p className="text-gray-400 font-black uppercase italic text-lg">
            Nenhum usuário verificado ainda
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-[40px] border-2 border-blue-100 overflow-hidden shadow-sm">
          <div className="divide-y divide-gray-50">
            {sorted.map(c => (
              <div
                key={c.id}
                onClick={() => onOpenDossier(c)}
                className="flex items-center gap-4 px-6 py-4 hover:bg-blue-50/40 cursor-pointer transition-colors group"
              >
                <div className="w-11 h-11 bg-blue-900 text-white rounded-full flex items-center justify-center font-black text-sm flex-shrink-0">
                  {c.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-black text-blue-900 uppercase italic">{c.name}</p>
                  </div>
                  <p className="text-xs font-bold text-gray-400 truncate">
                    {c.email} · {c.country_name}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {(c as any).profile_number && (
                    <span className="bg-blue-100 text-blue-700 text-[9px] font-black px-2 py-0.5 rounded-full">
                      #{String(parseInt((c as any).profile_number, 10))}
                    </span>
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
        </div>
      )}
    </div>
  );
}