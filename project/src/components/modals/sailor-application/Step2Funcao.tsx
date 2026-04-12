// src/components/modals/sailor-application/Step2Funcao.tsx
import { Ship } from 'lucide-react';
import { DocUploadSlot } from '../../sailor/SailorSharedComponents';
import { FUNCOES_MARITIMAS } from '../../../constants/sailorConstants';
import { applyDateMask } from './utils';

const LABEL = 'text-[10px] font-black text-blue-900 uppercase tracking-wider ml-1 mb-1.5 flex items-center gap-1';

interface Props {
  funcoes: string[];
  setFuncoes: (v: string[]) => void;
  outroFuncao: string;
  setOutroFuncao: (v: string) => void;
  cadernetaNumero: string;
  setCadernetaNumero: (v: string) => void;
  cadernetaValidade: string;
  setCadernetaValidade: (v: string) => void;
  cadernetaFile: File | null;
  cadernetaPrev: string | null;
  setCadernetaFile: (f: File | null) => void;
  setCadernetaPrev: (p: string | null) => void;
  cadernetaBackFile: File | null;
  cadernetaBackPrev: string | null;
  setCadernetaBackFile: (f: File | null) => void;
  setCadernetaBackPrev: (p: string | null) => void;
}

export function Step2Funcao({
  funcoes, setFuncoes,
  outroFuncao, setOutroFuncao,
  cadernetaNumero, setCadernetaNumero,
  cadernetaValidade, setCadernetaValidade,
  cadernetaFile, cadernetaPrev, setCadernetaFile, setCadernetaPrev,
  cadernetaBackFile, cadernetaBackPrev, setCadernetaBackFile, setCadernetaBackPrev,
}: Props) {
  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">

      {/* Funções */}
      <div>
        <p className={LABEL}><Ship className="w-3 h-3" /> Função(ões) Pretendida(s) <span className="text-red-400">*</span></p>
        <div className="grid grid-cols-2 gap-2">
          {FUNCOES_MARITIMAS.map(f => {
            const sel = funcoes.includes(f);
            return (
              <button key={f} type="button"
                onClick={() => setFuncoes(sel ? funcoes.filter(x => x !== f) : [...funcoes, f])}
                className={`text-left rounded-[14px] px-3 py-2.5 text-xs font-bold transition-all border-2 ${
                  sel ? 'bg-blue-900 text-white border-blue-900' : 'bg-gray-50 text-blue-900 border-gray-100 hover:border-blue-300'
                }`}>
                {f}
                {sel && <span className="ml-1 text-blue-300">✓</span>}
              </button>
            );
          })}
        </div>
        {funcoes.length === 0 && (
          <p className="text-[10px] text-red-400 font-bold mt-1 ml-1">Selecione pelo menos uma função</p>
        )}
        {funcoes.includes('Outro') && (
          <div className="mt-3">
            <label className={LABEL}>Qual é a sua função? <span className="text-red-400">*</span></label>
            <input
              value={outroFuncao}
              onChange={e => setOutroFuncao(e.target.value)}
              placeholder="Descreva sua função profissional"
              className="w-full bg-white border-2 border-gray-100 rounded-[15px] py-3.5 px-4 text-sm font-bold text-blue-900 outline-none focus:border-blue-500"
            />
            {outroFuncao.trim().length === 0 && (
              <p className="text-[10px] text-red-400 font-bold mt-1 ml-1">Descreva a sua função para continuar</p>
            )}
          </div>
        )}
      </div>

      {/* Caderneta Marítima */}
      <div className="bg-gray-50 border-2 border-gray-100 rounded-[22px] p-5 space-y-4">
        <p className="text-[11px] font-black text-blue-900 uppercase tracking-widest">⚓ Caderneta Marítima</p>

        <div>
          <label className={LABEL}>Número da Caderneta <span className="text-red-400">*</span></label>
          <input
            value={cadernetaNumero}
            onChange={e => setCadernetaNumero(e.target.value.toUpperCase())}
            placeholder="Ex: CM-123456"
            className="w-full bg-white border-2 border-gray-100 rounded-[15px] py-3.5 px-4 text-sm font-bold text-blue-900 outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className={LABEL}>Validade <span className="text-red-400">*</span></label>
          <input
            value={cadernetaValidade}
            onChange={e => setCadernetaValidade(applyDateMask(e.target.value))}
            placeholder="dd/mm/aaaa"
            maxLength={10}
            className="w-full bg-white border-2 border-gray-100 rounded-[15px] py-3.5 px-4 text-sm font-bold text-blue-900 outline-none focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <DocUploadSlot
            label="Frente" sublabel="Frente da caderneta" required
            file={cadernetaFile} preview={cadernetaPrev}
            onSelect={(f, p) => { setCadernetaFile(f); setCadernetaPrev(p); }}
            onClear={() => { setCadernetaFile(null); setCadernetaPrev(null); }}
          />
          <DocUploadSlot
            label="Verso" sublabel="Verso da caderneta"
            file={cadernetaBackFile} preview={cadernetaBackPrev}
            onSelect={(f, p) => { setCadernetaBackFile(f); setCadernetaBackPrev(p); }}
            onClear={() => { setCadernetaBackFile(null); setCadernetaBackPrev(null); }}
          />
        </div>
      </div>

    </div>
  );
}
