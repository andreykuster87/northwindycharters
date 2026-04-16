// src/components/company/NovoEventoOverlay.tsx
import { X } from 'lucide-react';
import type { Company } from '../../lib/localStore';
import { NovoEventoForm } from './EventosEmpresaTab';

interface Props {
  company:   Company;
  onSuccess: () => void;
  onClose:   () => void;
}

export function NovoEventoOverlay({ company, onSuccess, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-[150] flex items-end md:items-center justify-center"
      style={{ background: 'rgba(4,10,24,0.85)', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white w-full md:max-w-xl max-h-[92vh] overflow-y-auto shadow-2xl border-t-2 border-[#c9a96e]/40 md:border-2 md:border-[#c9a96e]/20">
        <div className="sticky top-0 bg-[#0a1628] px-5 py-4 flex items-center justify-between z-10 border-b border-[#c9a96e]/20">
          <div>
            <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em]">Novo Evento</p>
            <p className="text-white font-bold text-sm font-['Playfair_Display'] italic uppercase">{company.nome_fantasia}</p>
          </div>
          <button onClick={onClose} className="bg-white/10 hover:bg-white/20 text-white p-2 transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4">
          <NovoEventoForm company={company} onSuccess={onSuccess} onCancel={onClose} />
        </div>
      </div>
    </div>
  );
}
