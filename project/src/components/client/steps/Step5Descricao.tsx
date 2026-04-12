// src/components/CreateTripModal/steps/Step5Descricao.tsx
import { CheckCircle2 } from 'lucide-react';
import { formatCurrency, type Country, type ScheduleEntry } from '../../../constants/constants';

interface Props {
  selectedCountry:   Country;
  selectedState:     string;
  cityInput:         string;
  marinaSaida:       string;
  marinaChegada:     string;
  meetingPoint:      string;
  duracao:           string;
  valorPorPessoa:    string;
  minimoTripulantes: number;
  bebidas:           string;
  schedule:          ScheduleEntry[];
  descricao:         string;
  loading:           boolean;
  onDescricaoChange: (v: string) => void;
  onBack:            () => void;
  onSubmit:          (e: React.FormEvent) => void;
}

export function Step5Descricao({
  selectedCountry, selectedState, cityInput,
  marinaSaida, marinaChegada, meetingPoint,
  duracao, valorPorPessoa, minimoTripulantes,
  bebidas, schedule, descricao, loading,
  onDescricaoChange, onBack, onSubmit,
}: Props) {
  return (
    <form onSubmit={onSubmit} className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">

      <div>
        <label className="text-xs font-black text-blue-900 uppercase mb-3 block">
          Descrição do Passeio{' '}
          <span className="text-gray-300 font-bold normal-case italic">(opcional)</span>
        </label>
        <textarea
          placeholder="Descreva a experiência que o cliente vai viver neste passeio..."
          value={descricao} rows={4}
          onChange={e => onDescricaoChange(e.target.value)}
          className="w-full bg-gray-50 border-2 border-gray-100 rounded-[18px] py-4 px-6 font-bold text-blue-900 focus:border-blue-900 outline-none transition-all resize-none text-sm placeholder:text-gray-300"
        />
      </div>

      {/* Resumo */}
      <div className="bg-blue-50 border-2 border-blue-100 rounded-[22px] p-5">
        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4">📋 Resumo do Passeio</p>
        <div className="space-y-2.5">
          {([
            ['📍 Localização', [selectedCountry.flag, cityInput, selectedState].filter(Boolean).join(' · ')],
            ['⛵ Rota',        `${marinaSaida} → ${marinaChegada}`],
            ['📍 Encontro',    meetingPoint || '—'],
            ['⏱ Duração',      duracao || '—'],
            ['💰 Valor/pessoa', valorPorPessoa ? formatCurrency(parseFloat(valorPorPessoa), selectedCountry) : '—'],
            ['👥 Mínimo',       `${minimoTripulantes} pessoa${minimoTripulantes > 1 ? 's' : ''}`],
            ['🍾 Bebidas',      bebidas.replace('_', ' ')],
            ['🗓 Datas',        `${schedule.length} data${schedule.length > 1 ? 's' : ''} · ${schedule.reduce((a, e) => a + e.time_slots.length, 0)} horários`],
          ] as [string, string][]).map(([l, v]) => (
            <div key={l} className="flex items-start justify-between gap-3">
              <span className="text-[10px] font-black text-blue-400 uppercase flex-shrink-0">{l}</span>
              <span className="text-[10px] font-black text-blue-900 text-right break-words max-w-[60%]">{v}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-amber-50 border-2 border-amber-100 rounded-[18px] px-5 py-4 flex items-start gap-3">
        <span className="text-lg flex-shrink-0">⚓</span>
        <p className="text-xs font-black text-amber-700">Após publicar, poderá adicionar fotos para atrair mais clientes.</p>
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={onBack}
          className="px-6 py-5 border-2 border-gray-100 text-gray-400 rounded-[30px] font-black text-sm uppercase hover:border-blue-900 hover:text-blue-900 transition-all">
          ← Voltar
        </button>
        <button type="submit" disabled={loading}
          className="flex-1 bg-blue-900 text-white py-5 rounded-[30px] font-black uppercase tracking-widest text-sm hover:bg-blue-800 shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2">
          {loading
            ? <span className="animate-pulse">Publicando passeio...</span>
            : <><CheckCircle2 className="w-5 h-5 text-green-400" /> Publicar Passeio</>
          }
        </button>
      </div>
    </form>
  );
}