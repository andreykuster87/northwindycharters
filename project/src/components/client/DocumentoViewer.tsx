// src/components/client/DocumentoViewer.tsx
import { useState } from 'react';
import { X, RotateCcw, FileX } from 'lucide-react';

export interface DocumentoDisplayItem {
  id: string;
  tipo: string;
  numero?: string;
  emissao?: string;
  validade?: string;
  status: 'valid' | 'expiring' | 'expired' | 'unknown';
  imagem?: string | null;
  imagemVerso?: string | null;
}

interface Props {
  documento: DocumentoDisplayItem;
  onClose: () => void;
}

export function DocumentoViewer({ documento, onClose }: Props) {
  const [lado, setLado] = useState<'frente' | 'verso'>('frente');

  const temVerso = !!documento.imagemVerso;
  const imagemAtual = lado === 'frente' ? documento.imagem : documento.imagemVerso;

  const statusLabel = {
    valid:    { text: 'Válido',     cls: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' },
    expiring: { text: 'A Expirar',  cls: 'bg-amber-500/20 border-amber-500/40 text-amber-300' },
    expired:  { text: 'Expirado',   cls: 'bg-red-500/20 border-red-500/40 text-red-300' },
    unknown:  { text: 'Sem Validade', cls: 'bg-slate-500/20 border-slate-500/40 text-slate-400' },
  }[documento.status];

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.92)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-[#060f1e] border border-[#c9a96e]/30 overflow-hidden"
        style={{ boxShadow: '0 0 60px rgba(201,169,110,0.15)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Linha dourada topo */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a96e]/70 to-transparent" />

        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-[#c9a96e]/20">
          <div>
            <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em] mb-1">
              Documento de Identidade
            </p>
            <h2 className="font-['Playfair_Display'] font-bold text-white text-xl leading-tight">
              {documento.tipo}
            </h2>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {documento.numero && (
                <span className="text-xs text-white/60">
                  Nº <span className="font-semibold text-white">{documento.numero}</span>
                </span>
              )}
              {documento.validade && (
                <span className="text-xs text-white/60">
                  Val. <span className="font-semibold text-white">
                    {new Date(documento.validade).toLocaleDateString('pt-PT')}
                  </span>
                </span>
              )}
              <span className={`text-[10px] font-semibold px-2.5 py-0.5 border ${statusLabel.cls}`}>
                {statusLabel.text}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Imagem */}
        <div className="bg-[#020810] p-5 flex items-center justify-center min-h-[280px]">
          {imagemAtual ? (
            <img
              src={imagemAtual}
              alt={`${documento.tipo} — ${lado}`}
              className="max-w-full max-h-[55vh] object-contain rounded"
              style={{ imageRendering: 'auto' }}
            />
          ) : (
            <div className="flex flex-col items-center gap-3 text-white/30">
              <FileX className="w-12 h-12" />
              <p className="text-sm font-medium">
                {lado === 'frente' ? 'Imagem não disponível' : 'Verso não disponível'}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-[#c9a96e]/15">
          <div className="flex items-center gap-2">
            {temVerso && (
              <button
                onClick={() => setLado(l => l === 'frente' ? 'verso' : 'frente')}
                className="flex items-center gap-1.5 text-[11px] font-semibold text-[#c9a96e] hover:text-[#dab97e] border border-[#c9a96e]/40 hover:border-[#c9a96e]/70 px-3 py-1.5 transition-all"
              >
                <RotateCcw className="w-3 h-3" />
                Ver {lado === 'frente' ? 'Verso' : 'Frente'}
              </button>
            )}
            {temVerso && (
              <div className="flex gap-1">
                <button
                  onClick={() => setLado('frente')}
                  className={`text-[10px] font-semibold px-2.5 py-1 transition-all ${
                    lado === 'frente'
                      ? 'bg-[#c9a96e] text-[#060f1e]'
                      : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  Frente
                </button>
                <button
                  onClick={() => setLado('verso')}
                  className={`text-[10px] font-semibold px-2.5 py-1 transition-all ${
                    lado === 'verso'
                      ? 'bg-[#c9a96e] text-[#060f1e]'
                      : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  Verso
                </button>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-[11px] font-semibold text-white/50 hover:text-white transition-colors uppercase tracking-wider"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
