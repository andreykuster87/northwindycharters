// src/components/company/FrotaTab.tsx
import { useState } from 'react';
import { Plus, Anchor, AlertCircle } from 'lucide-react';
import { getAllBoats } from '../../lib/localStore';
import { BoatRegistrationModal } from '../modals/BoatRegistrationModal';

const FLEET_STATUS: Record<string, string> = {
  active:     'bg-green-100 text-green-700',
  ativo:      'bg-green-100 text-green-700',
  pending:    'bg-purple-100 text-purple-700',
  pendente:   'bg-purple-100 text-purple-700',
  manutenção: 'bg-amber-100 text-amber-700',
  reservado:  'bg-[#0a1628]/10 text-[#1a2b4a]',
  inativo:    'bg-gray-100 text-gray-500',
  inactive:   'bg-gray-100 text-gray-500',
};

interface Props {
  companyId: string;
  onToast:   (msg: string) => void;
}

export function FrotaTab({ companyId, onToast }: Props) {
  const [showBoatReg, setShowBoatReg] = useState(false);
  const [renderKey,   setRenderKey]   = useState(0);

  const allBoats = getAllBoats().filter(b => {
    if (b.sailor_id === companyId) return true;
    try { return JSON.parse((b as any).metadata || '{}').company_id === companyId; }
    catch { return false; }
  });

  function reload() { setRenderKey(k => k + 1); }

  function handleBoatSuccess(_boat: any) {
    reload();
    setShowBoatReg(false);
    onToast('🚢 Embarcação enviada para aprovação!');
  }

  return (
    <div className="space-y-4" key={renderKey}>
      <div>
        <h2 className="text-lg font-['Playfair_Display'] font-bold text-[#1a2b4a] uppercase italic">Frota</h2>
        <p className="text-xs text-gray-400 font-semibold">Embarcações da empresa</p>
      </div>

      {allBoats.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-gray-200 py-14 text-center">
          <Anchor className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="font-semibold text-gray-300 uppercase italic text-sm">Nenhuma embarcação</p>
          <p className="text-xs text-gray-400 font-semibold mt-1">Adicione a primeira embarcação da empresa.</p>
          <button
            onClick={() => setShowBoatReg(true)}
            className="mt-4 bg-[#0a1628] hover:bg-[#1a2b4a] text-white px-5 py-2.5 font-semibold text-xs uppercase transition-all flex items-center gap-2 mx-auto">
            <Plus className="w-3.5 h-3.5" /> Adicionar Embarcação
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {allBoats.map(b => {
            const isPending = b.status === 'pending';
            const statusKey = b.status === 'active' ? 'ativo' : isPending ? 'pendente' : b.status;
            const statusCls = FLEET_STATUS[statusKey] || FLEET_STATUS[b.status] || 'bg-gray-100 text-gray-500';
            const statusLabel = b.status === 'active' ? 'Activa' : isPending ? 'Pendente' : b.status;

            return (
              <div key={b.id} className={`relative border overflow-hidden transition-all ${
                isPending
                  ? 'opacity-60 border-purple-100 bg-white'
                  : 'bg-white border-gray-100 hover:border-[#c9a96e]/30'
              }`}>

                {/* Overlay "Aguardando aprovação" */}
                {isPending && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-white/50 backdrop-blur-[1px]">
                    <AlertCircle className="w-7 h-7 text-orange-400" />
                    <p className="text-xs font-bold text-orange-600 uppercase tracking-wider">Aguardando aprovação</p>
                    <p className="text-[10px] font-semibold text-orange-400 px-4 text-center">
                      Em análise pela equipa NorthWindy
                    </p>
                  </div>
                )}

                <div className="bg-gradient-to-r from-[#0a1628] to-[#1a2b4a] px-4 py-3 flex items-center gap-3">
                  {b.cover_photo ? (
                    <div className="w-10 h-10 overflow-hidden flex-shrink-0">
                      <img src={b.cover_photo} alt="" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 bg-white/20 flex items-center justify-center flex-shrink-0">
                      <Anchor className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white uppercase italic text-sm truncate">{b.name}</p>
                    <p className="text-[#c9a96e] text-xs font-semibold">{b.type} · {b.capacity} pax</p>
                  </div>
                  <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 flex-shrink-0 ${statusCls}`}>
                    {statusLabel}
                  </span>
                </div>

                <div className="px-4 py-3 grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-[9px] font-semibold text-gray-400 uppercase">Matrícula</p>
                    <p className="text-sm font-semibold text-[#1a2b4a]">{b.matricula || b.bie_number || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-semibold text-gray-400 uppercase">Porto Base</p>
                    <p className="text-sm font-semibold text-[#1a2b4a]">{b.porto || '—'}</p>
                  </div>
                  {b.boat_number && (
                    <div>
                      <p className="text-[9px] font-semibold text-gray-400 uppercase">Nº Frota</p>
                      <p className="text-sm font-semibold text-[#1a2b4a]">{b.boat_number}</p>
                    </div>
                  )}
                  {b.comprimento && (
                    <div>
                      <p className="text-[9px] font-semibold text-gray-400 uppercase">Comprimento</p>
                      <p className="text-sm font-semibold text-[#1a2b4a]">{b.comprimento} m</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Botão adicionar centrado abaixo da lista */}
          <div className="pt-2 flex justify-center">
            <button
              onClick={() => setShowBoatReg(true)}
              className="bg-[#0a1628] hover:bg-[#1a2b4a] text-white px-6 py-2.5 font-semibold text-xs uppercase flex items-center gap-2 transition-all">
              <Plus className="w-3.5 h-3.5" /> Adicionar Embarcação
            </button>
          </div>
        </div>
      )}

      {showBoatReg && (
        <BoatRegistrationModal
          onClose={() => setShowBoatReg(false)}
          onSuccess={handleBoatSuccess}
          companyId={companyId}
        />
      )}
    </div>
  );
}
