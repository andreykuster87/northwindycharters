import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { BoatInput, DateInput, YesNo, SectionTitle } from '../shared/BoatFormWidgets';
import type { BoatForm } from './BoatStep1Embarcacao';

interface Props {
  f: BoatForm;
  fd: (k: string, v: string) => void;
  declaracao: boolean;
  setDeclaracao: (v: boolean) => void;
  loading: boolean;
  onBack: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function BoatStep4Operacional({
  f,
  fd,
  declaracao,
  setDeclaracao,
  loading,
  onBack,
  onSubmit,
}: Props) {
  const tipoAtividadeArray = Array.isArray(f.tipoAtividade)
  ? f.tipoAtividade
  : (f.tipoAtividade ? String(f.tipoAtividade).split('||').filter(Boolean) : []);

  const toggleAtividade = (v: string) => {
    const current = tipoAtividadeArray;
    const updated = current.includes(v)
      ? current.filter((x) => x !== v)
      : [...current, v];
    fd('tipoAtividade', updated.join('||'));
// mantém igual — o fd no BoatRegistrationModal já trata arrays
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <SectionTitle number="4" title="Características Operacionais" />
      <div className="grid grid-cols-2 gap-3">
        <BoatInput
          label="Capacidade máx. passageiros"
          value={f.capPassageiros}
          onChange={(v) => fd('capPassageiros', v)}
          type="number"
          required
          placeholder="EX: 12"
        />
        <BoatInput
          label="Nº de tripulantes"
          value={f.nrTripulantes}
          onChange={(v) => fd('nrTripulantes', v)}
          type="number"
          placeholder="EX: 2"
        />
      </div>
      <BoatInput
        label="Área de operação"
        value={f.areaOperacao}
        onChange={(v) => fd('areaOperacao', v)}
        placeholder="EX: ZONA COSTEIRA..."
      />
      <div>
        <label className="block text-xs font-semibold text-[#1a2b4a] uppercase mb-2">
          Tipo de atividade
        </label>
        <div className="grid grid-cols-2 gap-2">
          {['Passeios Turísticos', 'Eventos Privados', 'Travessias', 'Pesca', 'Outro'].map(
            (opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => toggleAtividade(opt)}
                className={`py-2.5 px-3 font-semibold text-xs uppercase border text-left transition-all ${
                  tipoAtividadeArray.includes(opt)
                    ? 'bg-[#0a1628] text-white border-[#0a1628]'
                    : 'bg-gray-50 text-gray-500 border-gray-100 hover:border-[#c9a96e]/30 hover:text-[#1a2b4a]'
                }`}
              >
                {opt}
              </button>
            )
          )}
        </div>
        {tipoAtividadeArray.includes('Outro') && (
          <input
            value={f.tipoAtividadeOutro}
            onChange={(e) => fd('tipoAtividadeOutro', e.target.value)}
            placeholder="ESPECIFIQUE..."
            className="w-full mt-2 bg-gray-50 border border-gray-200 py-3 px-4 font-bold text-[#1a2b4a] text-sm focus:border-[#c9a96e] outline-none transition-all placeholder:text-gray-300"
          />
        )}
      </div>

      <SectionTitle number="5" title="Equipamentos de Segurança" />
      <BoatInput
        label="Nº de coletes salva-vidas"
        value={f.nrColetes}
        onChange={(v) => fd('nrColetes', v)}
        type="number"
        placeholder="EX: 14"
      />
      <div className="grid grid-cols-2 gap-3">
        <YesNo
          label="Balsa salva-vidas"
          value={f.balsaSalvavidas}
          onChange={(v) => fd('balsaSalvavidas', v)}
        />
        <DateInput
          label="Última inspeção"
          value={f.balsaUltimaInsp}
          onChange={(v) => fd('balsaUltimaInsp', v)}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <BoatInput
          label="Extintores"
          value={f.extintores}
          onChange={(v) => fd('extintores', v)}
          placeholder="EX: 2X CO₂"
        />
        <DateInput
          label="Última inspeção"
          value={f.extintoresInsp}
          onChange={(v) => fd('extintoresInsp', v)}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <YesNo label="Rádio VHF" value={f.radioVHF} onChange={(v) => fd('radioVHF', v)} />
        <YesNo
          label="Kit primeiros socorros"
          value={f.primeirosSocorros}
          onChange={(v) => fd('primeirosSocorros', v)}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <YesNo
          label="Sinais de socorro"
          value={f.sinaisSocorro}
          onChange={(v) => fd('sinaisSocorro', v)}
        />
        <DateInput
          label="Validade sinais"
          value={f.sinaisVal}
          onChange={(v) => fd('sinaisVal', v)}
        />
      </div>

      <SectionTitle number="7" title="Manutenção e Inspeções" />
      <div className="grid grid-cols-2 gap-3">
        <DateInput
          label="Última inspeção geral"
          value={f.ultimaInsp}
          onChange={(v) => fd('ultimaInsp', v)}
        />
        <DateInput
          label="Próxima inspeção"
          value={f.proximaInsp}
          onChange={(v) => fd('proximaInsp', v)}
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-[#1a2b4a] uppercase mb-1.5">
          Histórico de manutenção
        </label>
        <textarea
          value={f.historicoManu}
          rows={3}
          onChange={(e) => fd('historicoManu', e.target.value)}
          placeholder="DESCREVA MANUTENÇÕES RELEVANTES..."
          className="w-full bg-gray-50 border border-gray-200 py-3 px-4 font-bold text-[#1a2b4a] text-sm focus:border-[#c9a96e] outline-none transition-all resize-none placeholder:text-gray-300 uppercase"
        />
      </div>

      <div className="bg-[#0a1628]/5 border border-[#c9a96e]/20 p-4">
        <p className="text-xs font-semibold text-[#c9a96e] uppercase tracking-[0.15em] mb-2">Declaração</p>
        <p className="text-xs text-gray-600 font-bold leading-relaxed mb-3">
          Declaro que as informações prestadas são verdadeiras e que a embarcação cumpre os
          requisitos legais e de segurança aplicáveis.
        </p>
        <button
          type="button"
          onClick={() => setDeclaracao(!declaracao)}
          className="flex items-center gap-3"
        >
          <div
            className={`w-5 h-5 border-2 flex items-center justify-center flex-shrink-0 transition-all ${
              declaracao ? 'bg-[#0a1628] border-[#0a1628]' : 'bg-white border-gray-300'
            }`}
          >
            {declaracao && <CheckCircle2 className="w-3 h-3 text-white" />}
          </div>
          <span className="text-xs font-bold text-[#1a2b4a]">Confirmo a declaração acima</span>
        </button>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-4 border border-gray-200 text-gray-400 font-semibold text-sm uppercase hover:border-[#0a1628] hover:text-[#1a2b4a] transition-all flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" /> Voltar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-[#0a1628] text-white py-4 font-semibold uppercase text-sm hover:bg-[#0a1628]/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            'A guardar...'
          ) : (
            <>
              Guardar <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
