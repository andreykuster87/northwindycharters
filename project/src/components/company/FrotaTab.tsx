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

  const allBoats = getAllBoats(companyId);

  function reload() { setRenderKey(k => k + 1); }

  function handleBoatSuccess(_boat: any) {
    reload();
    setShowBoatReg(false);
    onToast('🚢 Embarcação enviada para aprovação!');
  }

  return (
    <div className="space-y-4" key={renderKey}>
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-['Playfair_Display'] font-bold text-[#1a2b4a] uppercase italic">Frota</h2>
          <p className="text-xs text-gray-400 font-semibold">Embarcações da empresa</p>
        </div>
        <button
          onClick={() => setShowBoatReg(true)}
          className="bg-[#0a1628] hover:bg-[#1a2b4a] text-white px-4 py-2.5 font-semibold text-xs uppercase flex items-center gap-1.5 flex-shrink-0 transition-all">
          <Plus className="w-3.5 h-3.5" /> Barco
        </button>
      </div>

      {allBoats.some(b => b.status === 'pending') && (
        <div className="bg-purple-50 border border-purple-100 px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 bg-purple-100 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-4 h-4 text-purple-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-purple-800">Embarcação aguarda aprovação</p>
            <p className="text-[10px] font-semibold text-purple-600">Após aprovação pela equipa NorthWindy, ficará disponível para passeios.</p>
          </div>
        </div>
      )}

      {allBoats.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-gray-200 py-14 text-center">
          <Anchor className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="font-semibold text-gray-300 uppercase italic text-sm">Nenhuma embarcação</p>
          <p className="text-xs text-gray-400 font-semibold mt-1">Adicione a primeira embarcação da empresa.</p>
          <button
            onClick={() => setShowBoatReg(true)}
            className="mt-4 bg-[#0a1628] hover:bg-[#1a2b4a] text-white px-5 py-2.5 font-semibold text-xs uppercase transition-all">
            + Adicionar Embarcação
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {allBoats.map(b => {
            const statusKey = b.status === 'active' ? 'ativo' : b.status === 'pending' ? 'pendente' : b.status;
            const statusCls = FLEET_STATUS[statusKey] || FLEET_STATUS[b.status] || 'bg-gray-100 text-gray-500';
            const statusLabel = b.status === 'active' ? 'Activa' : b.status === 'pending' ? 'Pendente' : b.status;

            return (
              <div key={b.id} className="bg-white border border-gray-100 overflow-hidden hover:border-[#c9a96e]/30 transition-all">
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

                {b.status === 'pending' && (
                  <div className="mx-3 mb-3 bg-[#c9a96e]/5 border border-[#c9a96e]/20 px-3 py-2 flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 text-[#c9a96e] flex-shrink-0" />
                    <p className="text-[10px] font-semibold text-[#1a2b4a]">
                      Em análise pela equipa NorthWindy. Será notificado após aprovação.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showBoatReg && (
        <BoatRegistrationModal
          onClose={() => setShowBoatReg(false)}
          onSuccess={handleBoatSuccess}
          sailorId={companyId}
        />
      )}
    </div>
  );
}
