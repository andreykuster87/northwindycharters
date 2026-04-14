// src/components/AccessGateModal.tsx
import { Lock, User } from 'lucide-react';
import type { CatalogBoat } from '../services/catalog';

interface Props {
  boat:       CatalogBoat;
  onLogin:    () => void;
  onRegister: () => void;
  onClose:    () => void;
}

export function AccessGateModal({ boat, onLogin, onRegister, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center p-4"
      style={{ background: 'rgba(4,10,24,0.88)', backdropFilter: 'blur(8px)' }}
    >
      <div className="bg-white w-full max-w-sm shadow-2xl border border-[#c9a96e]/30 animate-in zoom-in-95 duration-300 overflow-hidden">
        {/* Header */}
        <div
          className="bg-[#0a1628] px-8 py-7 text-center relative"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 24px,rgba(201,169,110,0.04) 24px,rgba(201,169,110,0.04) 25px),repeating-linear-gradient(90deg,transparent,transparent 24px,rgba(201,169,110,0.04) 24px,rgba(201,169,110,0.04) 25px)',
          }}
        >
          <div className="text-4xl mb-3">⛵</div>
          <h2 className="text-2xl font-['Playfair_Display'] font-bold text-white uppercase leading-tight">
            Para reservar<br />é necessário acesso
          </h2>
          <p className="text-[#c9a96e] text-xs font-semibold mt-2 uppercase tracking-[0.15em]">{boat.name}</p>
          <div className="absolute bottom-0 left-0 right-0 h-px bg-[#c9a96e]/40" />
        </div>
        <div className="p-8 space-y-4">
          <p className="text-gray-400 font-bold text-sm text-center leading-relaxed">
            Faça login ou cadastre-se para continuar.
          </p>
          <button
            onClick={onLogin}
            className="w-full bg-[#0a1628] hover:bg-[#0a1628]/90 text-white py-4 font-semibold uppercase text-sm transition-all flex items-center justify-center gap-3"
          >
            <Lock className="w-4 h-4" />
            Área de Usuário
          </button>
          <button
            onClick={onRegister}
            className="w-full border border-[#0a1628] text-[#1a2b4a] hover:bg-gray-50 py-4 font-semibold uppercase text-sm transition-all flex items-center justify-center gap-3"
          >
            <User className="w-4 h-4" />
            Cadastre-se
          </button>
          <button
            onClick={onClose}
            className="w-full text-gray-400 hover:text-[#1a2b4a] py-3 font-semibold text-xs uppercase transition-all"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
