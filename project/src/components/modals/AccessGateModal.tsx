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
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-blue-900/70 backdrop-blur-md">
      <div className="bg-white w-full max-w-sm rounded-[40px] shadow-2xl border-4 border-blue-900 animate-in zoom-in-95 duration-300 overflow-hidden">
        <div className="bg-blue-900 px-8 py-7 text-center">
          <div className="text-4xl mb-3">⛵</div>
          <h2 className="text-2xl font-black text-white uppercase italic leading-tight">
            Para reservar<br />é necessário acesso
          </h2>
          <p className="text-blue-300 text-xs font-bold mt-2 uppercase tracking-widest">{boat.name}</p>
        </div>
        <div className="p-8 space-y-4">
          <p className="text-gray-400 font-bold text-sm text-center leading-relaxed">
            Faça login ou cadastre-se para continuar.
          </p>
          <button
            onClick={onLogin}
            className="w-full bg-blue-900 hover:bg-blue-800 text-white py-4 rounded-[25px] font-black uppercase text-sm transition-all flex items-center justify-center gap-3"
          >
            <Lock className="w-4 h-4" />
            Área de Usuário
          </button>
          <button
            onClick={onRegister}
            className="w-full border-2 border-blue-900 text-blue-900 hover:bg-blue-50 py-4 rounded-[25px] font-black uppercase text-sm transition-all flex items-center justify-center gap-3"
          >
            <User className="w-4 h-4" />
            Cadastre-se
          </button>
          <button
            onClick={onClose}
            className="w-full text-gray-400 hover:text-blue-900 py-3 font-black text-xs uppercase transition-all"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}