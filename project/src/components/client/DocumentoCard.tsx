// src/components/client/DocumentoCard.tsx
import { ChevronRight, Image } from 'lucide-react';
import type { DocumentoDisplayItem } from './DocumentoViewer';

interface Props {
  doc: DocumentoDisplayItem;
  onClick: () => void;
}

const STATUS_CONFIG = {
  valid:    { label: 'Válido',     cls: 'bg-emerald-500/15 border-emerald-500/35 text-emerald-400' },
  expiring: { label: 'A Expirar',  cls: 'bg-amber-500/15 border-amber-500/35 text-amber-400' },
  expired:  { label: 'Expirado',   cls: 'bg-red-500/15 border-red-500/35 text-red-400' },
  unknown:  { label: '—',          cls: 'bg-slate-700/30 border-slate-600/30 text-slate-500' },
};

export function DocumentoCard({ doc, onClick }: Props) {
  const status = STATUS_CONFIG[doc.status];
  const temImagem = !!(doc.imagem || doc.imagemVerso);

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white border border-gray-100 p-4 relative group transition-all hover:border-[#c9a96e]/40 hover:shadow-sm"
      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
    >
      {/* Linha dourada topo no hover */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a96e]/0 group-hover:via-[#c9a96e]/40 to-transparent transition-all" />

      <div className="flex items-center gap-3">
        {/* Ícone de imagem */}
        <div className={`w-10 h-10 flex-shrink-0 flex items-center justify-center ${
          temImagem
            ? 'bg-[#0a1628] text-[#c9a96e]'
            : 'bg-gray-100 text-gray-400'
        }`}>
          <Image className="w-4.5 h-4.5 w-[18px] h-[18px]" />
        </div>

        {/* Dados */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-['Playfair_Display'] font-bold text-[#1a2b4a] leading-tight">
              {doc.tipo}
            </p>
            <span className={`text-[10px] font-semibold px-2 py-0.5 border ${status.cls}`}>
              {status.label}
            </span>
          </div>

          <div className="flex items-center gap-3 mt-1 flex-wrap">
            {doc.numero && (
              <span className="text-xs text-gray-500">
                Nº <span className="font-semibold text-gray-700">{doc.numero}</span>
              </span>
            )}
            {doc.validade && (
              <span className="text-xs text-gray-500">
                Val. <span className="font-semibold text-gray-700">
                  {new Date(doc.validade).toLocaleDateString('pt-PT')}
                </span>
              </span>
            )}
          </div>

          {temImagem && (
            <p className="text-[10px] text-[#c9a96e] font-medium mt-1 flex items-center gap-1">
              <Image className="w-3 h-3" />
              {doc.imagemVerso ? 'Frente e verso disponíveis' : 'Imagem disponível'}
            </p>
          )}
        </div>

        {/* Seta */}
        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#c9a96e] flex-shrink-0 transition-colors" />
      </div>
    </button>
  );
}
