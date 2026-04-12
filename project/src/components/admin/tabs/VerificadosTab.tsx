// src/components/AdminDashboard/tabs/VerificadosTab.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Aba de profissionais verificados (só admin) — lista ordenada com dossiê.
// ─────────────────────────────────────────────────────────────────────────────
import { type Sailor } from '../../../lib/localStore';

// ── Props ─────────────────────────────────────────────────────────────────────

interface VerificadosTabProps {
  verified: Sailor[];
  onOpenDossier: (sailor: Sailor) => void;
}

// ── Componente ────────────────────────────────────────────────────────────────

export function VerificadosTab({ verified, onOpenDossier }: VerificadosTabProps) {
  const sorted = [...verified].sort((a, b) => a.name.localeCompare(b.name, 'pt'));

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-black text-blue-900 uppercase italic">
        Profissionais Verificados
      </h2>

      {sorted.length === 0 ? (
        <div className="bg-white rounded-[40px] p-16 text-center border-2 border-dashed border-gray-200">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-gray-400 font-black uppercase italic">
            Nenhum profissional verificado ainda
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-[40px] border-2 border-green-100 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-gray-50">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
              {sorted.length} profissional(is)
            </p>
          </div>
          <div className="divide-y divide-gray-50">
            {sorted.map(s => (
              <div
                key={s.id}
                onClick={() => onOpenDossier(s)}
                className="flex items-center gap-4 px-6 py-4 hover:bg-green-50 cursor-pointer transition-colors group"
              >
                <div className="w-11 h-11 bg-green-100 rounded-full flex items-center justify-center font-black text-green-700 text-sm flex-shrink-0">
                  {s.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-black text-blue-900 uppercase italic">{s.name}</p>
                  </div>
                  <p className="text-xs font-bold text-gray-400 truncate">
                    {s.email} · {s.phone || '—'}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {(s as any).profile_number && (
                    <span className="bg-blue-100 text-blue-700 text-[9px] font-black px-2 py-0.5 rounded-full">
                      #{String(parseInt((s as any).profile_number, 10))}
                    </span>
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
        </div>
      )}
    </div>
  );
}