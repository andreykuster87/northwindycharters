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
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#0a1628]/60 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border-4 border-[#0a1628] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        onClick={e => e.stopPropagation()}
      >
        {/* ── Cabeçalho ── */}
        <div className="bg-[#0a1628] px-8 py-6 flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 text-white rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[#c9a96e] text-[10px] font-semibold uppercase tracking-[0.15em]">{subtitle}</p>
            <h3 className="text-2xl font-['Playfair_Display'] font-bold text-white truncate">{name}</h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">{badges}</div>
          </div>
          <button
            onClick={onClose}
            className="bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-full flex-shrink-0"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {/* ── Corpo ── */}
        <div className="p-8 space-y-5">
          {children}
          <button
            onClick={onClose}
            className="w-full border-2 border-gray-100 text-gray-400 py-4 font-semibold uppercase text-sm hover:border-[#0a1628] hover:text-[#1a2b4a] transition-all"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
