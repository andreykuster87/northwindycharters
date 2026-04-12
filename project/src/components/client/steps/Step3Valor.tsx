// src/components/CreateTripModal/steps/Step3Valor.tsx
import { useState } from 'react';
import { Clock, DollarSign, Users } from 'lucide-react';
import { formatCurrency, type Country, type TripBoat } from '../../../constants/constants';

interface Props {
  boat:              TripBoat;
  selectedCountry:   Country;
  duracao:           string;
  valorPorPessoa:    string;
  minimoTripulantes: number;
  onDuracaoChange:   (d: string) => void;
  onValorChange:     (v: string) => void;
  onMinimoChange:    (m: number) => void;
  onBack:            () => void;
  onNext:            () => void;
}

// Opções de duração padrão (até 1 dia)
const DURACAO_OPTIONS = [
  '30min','1h','1h30min','2h','2h30min','3h','3h30min','4h',
  '4h30min','5h','5h30min','6h','7h','8h','10h','12h',
  'Dia completo',
];

export function Step3Valor({
  boat, selectedCountry, duracao, valorPorPessoa, minimoTripulantes,
  onDuracaoChange, onValorChange, onMinimoChange, onBack, onNext,
}: Props) {
  const [customDuracao, setCustomDuracao] = useState('');

  // Is the selected value one of the standard options?
  const isCustom = duracao !== '' && !DURACAO_OPTIONS.includes(duracao);

  function handleSelectOption(d: string) {
    setCustomDuracao('');
    onDuracaoChange(d);
  }

  function handleCustomChange(val: string) {
    setCustomDuracao(val);
    onDuracaoChange(val);
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">

      {/* ── Duração do passeio ── */}
      <div>
        <label className="flex items-center gap-2 text-xs font-black text-blue-900 uppercase mb-3">
          <Clock className="w-3.5 h-3.5" /> Duração do Passeio *
        </label>

        {/* Scroll list */}
        <div className="bg-gray-50 border-2 border-gray-100 rounded-[18px] overflow-hidden mb-3">
          <div className="overflow-y-auto" style={{ maxHeight: 220 }}>
            {DURACAO_OPTIONS.map(d => (
              <button key={d} type="button"
                onClick={() => handleSelectOption(d)}
                className={`w-full text-left px-5 py-3 font-bold text-sm transition-all border-b border-gray-100 last:border-b-0
                  ${duracao === d && !isCustom
                    ? 'bg-blue-900 text-white font-black'
                    : 'text-blue-900 hover:bg-blue-50'}`}>
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Separador + campo livre para mais de 1 dia */}
        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1 h-px bg-gray-100" />
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ou digite (ex: 2 dias, 3 dias)</span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        <input
          type="text"
          value={customDuracao}
          onChange={e => handleCustomChange(e.target.value)}
          placeholder="Ex: 2 dias, 72h, 3 dias e meio..."
          className={`w-full bg-gray-50 border-2 rounded-[18px] px-5 py-3 font-bold text-blue-900 text-sm outline-none transition-all
            ${isCustom ? 'border-blue-900' : 'border-gray-100 focus:border-blue-900'}`}
        />

        {duracao && (
          <div className="mt-2 flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-[12px] px-4 py-2">
            <Clock className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
            <span className="text-sm font-black text-blue-900">
              Duração selecionada: <span className="text-blue-600">{duracao}</span>
            </span>
          </div>
        )}
      </div>

      {/* ── Valor por pessoa ── */}
      <div>
        <label className="flex items-center gap-2 text-xs font-black text-blue-900 uppercase mb-3">
          <DollarSign className="w-3.5 h-3.5" /> Valor por Pessoa *
          <span className="ml-auto text-[10px] font-bold text-blue-400 normal-case">
            {selectedCountry.currency} · {selectedCountry.symbol}
          </span>
        </label>
        <div className="relative">
          <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-gray-500 text-lg pointer-events-none">
            {selectedCountry.symbol}
          </span>
          <input
            type="text"
            inputMode="decimal"
            placeholder="0.00"
            value={valorPorPessoa}
            onChange={e => onValorChange(e.target.value.replace(',', '.').replace(/[^0-9.]/g, ''))}
            className="w-full bg-gray-50 border-2 border-gray-100 rounded-[18px] py-4 pl-14 pr-6 font-black text-blue-900 text-2xl focus:border-blue-900 outline-none transition-all"
          />
        </div>
        {valorPorPessoa && parseFloat(valorPorPessoa) > 0 && (
          <p className="text-[10px] font-bold text-blue-400 ml-2 mt-1">
            Preview: {formatCurrency(parseFloat(valorPorPessoa), selectedCountry)} por pessoa
          </p>
        )}
      </div>

      {/* ── Mínimo de passageiros ── */}
      <div>
        <label className="flex items-center gap-2 text-xs font-black text-blue-900 uppercase mb-3">
          <Users className="w-3.5 h-3.5" /> Mínimo de Passageiros
        </label>
        <div className="bg-gray-50 border-2 border-gray-100 rounded-[18px] py-4 px-5 flex items-center justify-between">
          <p className="text-sm font-bold text-gray-500">Passeio só ocorre com no mínimo:</p>
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => onMinimoChange(Math.max(1, minimoTripulantes - 1))}
              className="w-9 h-9 rounded-full border-2 border-gray-200 font-black text-lg hover:border-blue-900 hover:text-blue-900 transition-all flex items-center justify-center">−</button>
            <span className="font-black text-blue-900 text-xl w-8 text-center">{minimoTripulantes}</span>
            <button type="button" onClick={() => onMinimoChange(Math.min(boat.capacity, minimoTripulantes + 1))}
              className="w-9 h-9 rounded-full border-2 border-gray-200 font-black text-lg hover:border-blue-900 hover:text-blue-900 transition-all flex items-center justify-center">+</button>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onBack}
          className="px-6 py-5 border-2 border-gray-100 text-gray-400 rounded-[30px] font-black text-sm uppercase hover:border-blue-900 hover:text-blue-900 transition-all">
          ← Voltar
        </button>
        <button type="button" onClick={onNext}
          className="flex-1 bg-blue-900 text-white py-5 rounded-[30px] font-black uppercase tracking-widest text-sm hover:bg-blue-800 shadow-xl transition-all">
          Próximo → Extras & Agenda
        </button>
      </div>
    </div>
  );
}