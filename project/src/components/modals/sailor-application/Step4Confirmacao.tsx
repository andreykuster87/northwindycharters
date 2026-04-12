// src/components/modals/sailor-application/Step4Confirmacao.tsx
import { CheckCircle2, ExternalLink } from 'lucide-react';
import { DocUploadSlot } from '../../sailor/SailorSharedComponents';

const LABEL = 'text-[10px] font-black text-blue-900 uppercase tracking-wider ml-1 mb-1.5 flex items-center gap-1';

interface Props {
  clientName: string;
  funcoes: string[];
  cadernetaNumero: string;
  stcw: Record<string, boolean>;
  declaracaoData: string;
  antecedentesFile: File | null;
  antecedentesPrev: string | null;
  setAntecedentesFile: (f: File | null) => void;
  setAntecedentesPrev: (p: string | null) => void;
  declaraVerdade: boolean;
  setDeclaraVerdade: (v: boolean) => void;
  aceitaTermos: boolean;
  setAceitaTermos: (v: boolean) => void;
  onOpenTermos: () => void;
}

export function Step4Confirmacao({
  clientName, funcoes, cadernetaNumero, stcw, declaracaoData,
  antecedentesFile, antecedentesPrev, setAntecedentesFile, setAntecedentesPrev,
  declaraVerdade, setDeclaraVerdade,
  aceitaTermos, setAceitaTermos,
  onOpenTermos,
}: Props) {
  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">

      {/* Antecedentes criminais */}
      <div className="bg-gray-50 border-2 border-gray-100 rounded-[22px] p-5 space-y-3">
        <div>
          <p className="text-[11px] font-black text-blue-900 uppercase tracking-widest">⚖️ Antecedentes Criminais</p>
          <p className="text-[10px] text-gray-400 font-bold mt-1">Certidão negativa — máximo 3 meses de emissão</p>
        </div>
        <DocUploadSlot label="Upload da Certidão" file={antecedentesFile} preview={antecedentesPrev}
          onSelect={(f, p) => { setAntecedentesFile(f); setAntecedentesPrev(p); }}
          onClear={() => { setAntecedentesFile(null); setAntecedentesPrev(null); }} />
      </div>

      {/* Resumo */}
      <div className="bg-blue-50 border-2 border-blue-100 rounded-[22px] p-5 space-y-2">
        <p className="text-[11px] font-black text-blue-900 uppercase tracking-widest">📋 Resumo da Candidatura</p>
        <div className="space-y-1.5 mt-2">
          {[
            ['Nome',     clientName],
            ['Funções',  funcoes.join(', ') || '—'],
            ['Caderneta',cadernetaNumero || '—'],
            ['STCW',     `${Object.values(stcw).filter(Boolean).length} cert.`],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between text-xs">
              <span className="text-gray-400 font-bold">{label}</span>
              <span className="font-black text-blue-900 text-right max-w-[60%]">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Data */}
      <div className="bg-gray-50 border-2 border-gray-100 rounded-[18px] p-4 space-y-2">
        <p className={LABEL}>📅 Data da Candidatura</p>
        <div className="w-full bg-white border-2 border-gray-100 rounded-[15px] py-3.5 px-4 text-sm font-bold text-blue-900">
          {declaracaoData ? new Date(declaracaoData).toLocaleString('pt-BR') : '—'}
        </div>
      </div>

      {/* Confirmações */}
      <div className="space-y-3">
        <label className="flex items-start gap-3 cursor-pointer bg-gray-50 border-2 border-gray-100 rounded-[18px] p-4">
          <div className={`w-5 h-5 rounded-[6px] border-2 flex items-center justify-center mt-0.5 flex-shrink-0 transition-all ${
            declaraVerdade ? 'bg-blue-900 border-blue-900' : 'border-gray-200 bg-white'
          }`} onClick={() => setDeclaraVerdade(!declaraVerdade)}>
            {declaraVerdade && <CheckCircle2 className="w-3 h-3 text-white" />}
          </div>
          <p className="text-xs font-bold text-blue-900 leading-relaxed">
            <strong>Declaro que as informações e documentos acima são verdadeiros</strong> e estou ciente de que informações falsas podem resultar em cancelamento da conta.
          </p>
        </label>

        <div
          className={`flex items-start gap-3 p-4 rounded-[18px] border-2 cursor-pointer transition-all select-none
            ${aceitaTermos ? 'border-blue-900 bg-blue-50' : 'border-red-200 bg-red-50 hover:border-blue-300 hover:bg-blue-50'}`}
          onClick={() => setAceitaTermos(!aceitaTermos)}>
          <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all
            ${aceitaTermos ? 'bg-blue-900 border-blue-900' : 'border-red-300 bg-white'}`}>
            {aceitaTermos && (
              <svg viewBox="0 0 12 10" className="w-3.5 h-3.5 fill-none stroke-white stroke-[2.5] stroke-round">
                <polyline points="1,5 4.5,8.5 11,1" />
              </svg>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-gray-800 leading-relaxed">
              Li e aceito os{' '}
              <span
                role="button"
                onClick={e => { e.stopPropagation(); onOpenTermos(); }}
                className="text-blue-700 hover:text-blue-900 font-black underline underline-offset-2 transition-colors inline-flex items-center gap-0.5 cursor-pointer">
                Termos e Condições de Uso
                <ExternalLink className="w-3 h-3 inline" />
              </span>
              {' '}da plataforma NorthWindy Charters, incluindo a Política de Privacidade e as normas de conduta marítima aplicáveis.
              <span className="text-red-500 font-black"> *</span>
            </p>
          </div>
        </div>
      </div>

      {(!declaraVerdade || !aceitaTermos) && (
        <p className="text-[10px] text-red-400 font-bold ml-1">Você deve confirmar ambas as declarações para prosseguir.</p>
      )}

    </div>
  );
}
