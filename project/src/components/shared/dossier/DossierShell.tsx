// src/components/shared/dossier/DossierShell.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Modal shell compartilhado pelos dossiês de Sailor e Client.
// Fornece: overlay backdrop, card scrollável, cabeçalho azul com avatar de
// iniciais, e botão "Fechar" no rodapé. O conteúdo específico vai em children.
// ─────────────────────────────────────────────────────────────────────────────
import { ReactNode } from 'react';
import { XCircle } from 'lucide-react';

interface Props {
  initials:  string;    // ex: "JO" (primeiras 2 letras do nome)
  subtitle:  string;    // ex: "Dossiê · Profissional Verificado"
  name:      string;
  badges:    ReactNode; // chips de estado (Verificado, Bloqueado, Perfil #N…)
  children:  ReactNode; // corpo do dossiê
  onClose:   () => void;
}

export function DossierShell({ initials, subtitle, name, badges, children, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-blue-900/60 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-[40px] shadow-2xl border-4 border-blue-900 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        onClick={e => e.stopPropagation()}
      >
        {/* ── Cabeçalho ── */}
        <div className="bg-blue-900 px-8 py-6 flex items-center gap-4 rounded-t-[36px]">
          <div className="w-14 h-14 bg-white/20 text-white rounded-full flex items-center justify-center font-black text-xl flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-blue-300 text-[10px] font-black uppercase tracking-widest">{subtitle}</p>
            <h3 className="text-2xl font-black text-white uppercase italic truncate">{name}</h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">{badges}</div>
          </div>
          <button
            onClick={onClose}
            className="bg-blue-800 hover:bg-blue-700 text-white p-2.5 rounded-full flex-shrink-0"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {/* ── Corpo ── */}
        <div className="p-8 space-y-5">
          {children}
          <button
            onClick={onClose}
            className="w-full border-2 border-gray-100 text-gray-400 py-4 rounded-[25px] font-black uppercase text-sm hover:border-blue-900 hover:text-blue-900 transition-all"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
