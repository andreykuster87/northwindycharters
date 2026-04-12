// src/components/sailor/steps/Step4Medico.tsx
import { Calendar, CheckCircle2, ExternalLink, Shield } from 'lucide-react';
import { applyDateMask } from '../../../utils/sailorHelpers';
import { type Country } from '../../../constants/sailorConstants';
import { DocUploadSlot } from '../SailorSharedComponents';

interface Props {
  form1: { nomeCompleto: string; email: string; idioma: string; cpfNif: string; endereco: string; funcao: string | string[]; funcaoOutro: string; };
  phoneCountry: Country;
  phoneRaw:     string;
  country:      Country;
  docIdType:    string;
  form2: {
    docNumero: string; docEmissao: string; docValidade: string;
    cartaNumero: string; cartaEmissao: string; cartaValidade: string;
    caderneta_possui: boolean; caderneta_numero: string;
  };
  stcw:            Record<string, boolean>;
  // Médico
  possuiMedico:    boolean;
  form4:           { medicoEmissao: string; medicoValidade: string };
  medicoFile:      File | null;
  medicoPreview:   string | null;
  // Disponibilidade
  disponivelImediato:      boolean | null;
  disponivelInternacional: boolean | null;
  tempoEmbarque:           string;
  // Extras
  restricaoMedica:   string;
  outrasInformacoes: string;
  // Declaração
  declaracaoData:  string;
  aceitouTermos:   boolean;
  loading:         boolean;
  onPossuiMedicoChange:   (v: boolean) => void;
  onForm4Change:          (patch: Partial<{ medicoEmissao: string; medicoValidade: string }>) => void;
  onMedicoSelect:         (f: File, p: string | null) => void;
  onMedicoClear:          () => void;
  onDispImediatoChange:      (v: boolean) => void;
  onDispInternacionalChange: (v: boolean) => void;
  onTempoEmbarqueChange:     (v: string) => void;
  onRestricaoChange:         (v: string) => void;
  onOutrasInfoChange:        (v: string) => void;
  onDeclaracaoDataChange:    (v: string) => void;
  onAceitouTermosChange:     (v: boolean) => void;
  onOpenTermos:              () => void;
  onBack:   () => void;
  onSubmit: (e: React.FormEvent) => void;
}

const LABEL = 'text-[10px] font-black text-blue-900 uppercase tracking-wider ml-1 mb-1.5 flex items-center gap-1';
const INPUT = 'w-full bg-white border-2 border-gray-100 rounded-[15px] py-3 px-4 font-bold text-blue-900 outline-none text-sm focus:border-blue-900 transition-all';
const YN = (active: boolean) =>
  `flex-1 flex items-center justify-center gap-2 p-3 rounded-[14px] border-2 cursor-pointer font-black text-sm transition-all ${
    active ? 'bg-blue-900 border-blue-900 text-white' : 'bg-white border-gray-100 text-blue-900 hover:border-blue-200'
  }`;

export function Step4Medico({
  form1, phoneCountry, phoneRaw, country, docIdType, form2, stcw,
  possuiMedico, form4, medicoFile, medicoPreview,
  disponivelImediato, disponivelInternacional, tempoEmbarque,
  restricaoMedica, outrasInformacoes,
  declaracaoData, aceitouTermos, loading,
  onPossuiMedicoChange, onForm4Change, onMedicoSelect, onMedicoClear,
  onDispImediatoChange, onDispInternacionalChange, onTempoEmbarqueChange,
  onRestricaoChange, onOutrasInfoChange,
  onDeclaracaoDataChange, onAceitouTermosChange, onOpenTermos,
  onBack, onSubmit,
}: Props) {
  const stcwList = Object.entries(stcw).filter(([, v]) => v).map(([k]) => k).join(', ') || 'Nenhum';
  const funcaoDisplay = (() => {
    const f = form1.funcao;
    if (Array.isArray(f)) {
      const list = f.includes('Outro') && form1.funcaoOutro
        ? [...f.filter(x => x !== 'Outro'), form1.funcaoOutro]
        : f;
      return list.join(' · ') || '—';
    }
    return f === 'Outro' ? (form1.funcaoOutro || 'Outro') : (f || '—');
  })();

  return (
    <form onSubmit={onSubmit} className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">

      {/* ── Certificado Médico ── */}
      <div className="bg-gray-50 border-2 border-gray-100 rounded-[22px] p-5 space-y-4">
        <p className="text-[11px] font-black text-blue-900 uppercase tracking-widest border-b-2 border-gray-100 pb-3">
          🩺 Certificado Médico Marítimo
        </p>

        <div className="bg-amber-50 border border-amber-100 rounded-[14px] px-4 py-3 flex items-start gap-2">
          <span className="text-sm flex-shrink-0">⚠️</span>
          <div className="text-[10px] font-bold text-amber-700 space-y-0.5">
            <p>Se o certificado vencer, não pode embarcar legalmente.</p>
            <p>A atualização é obrigatória para manter a certificação ativa (padrões internacionais).</p>
          </div>
        </div>

        {/* Toggle Sim / Não — default Sim */}
        <div>
          <p className={LABEL}>Possui certificado médico válido?</p>
          <div className="flex gap-3">
            <button type="button" onClick={() => onPossuiMedicoChange(true)}
              className={YN(possuiMedico)}>
              ✓ Sim
            </button>
            <button type="button" onClick={() => onPossuiMedicoChange(false)}
              className={YN(!possuiMedico)}>
              ✗ Não
            </button>
          </div>
        </div>

        {/* Datas e upload — visíveis apenas se possuiMedico=true */}
        {possuiMedico && (
          <>
            <div>
              <label className={LABEL}><Calendar className="w-3 h-3" /> Validade *</label>
              <input type="text" inputMode="numeric" value={form4.medicoValidade}
                onChange={e => onForm4Change({ medicoValidade: applyDateMask(e.target.value) })}
                placeholder="dd/mm/aaaa" maxLength={10}
                className={INPUT}
                required={possuiMedico} />
            </div>
            <DocUploadSlot label="Certificado Médico" required={false}
              file={medicoFile} preview={medicoPreview}
              onSelect={onMedicoSelect} onClear={onMedicoClear} />
          </>
        )}
      </div>

      {/* ── Disponibilidade ── */}
      <div className="bg-gray-50 border-2 border-gray-100 rounded-[22px] p-5 space-y-4">
        <p className="text-[11px] font-black text-blue-900 uppercase tracking-widest border-b-2 border-gray-100 pb-3">
          📅 Disponibilidade
        </p>

        <div>
          <p className={LABEL}>Disponível para embarque imediato?</p>
          <div className="flex gap-3">
            <button type="button" onClick={() => onDispImediatoChange(true)} className={YN(disponivelImediato === true)}>✓ Sim</button>
            <button type="button" onClick={() => onDispImediatoChange(false)} className={YN(disponivelImediato === false)}>✗ Não</button>
          </div>
        </div>

        <div>
          <p className={LABEL}>Disponível para viagens internacionais?</p>
          <div className="flex gap-3">
            <button type="button" onClick={() => onDispInternacionalChange(true)} className={YN(disponivelInternacional === true)}>✓ Sim</button>
            <button type="button" onClick={() => onDispInternacionalChange(false)} className={YN(disponivelInternacional === false)}>✗ Não</button>
          </div>
        </div>

        <div>
          <label className={LABEL}>Tempo máximo de embarque</label>
          <input value={tempoEmbarque}
            onChange={e => onTempoEmbarqueChange(e.target.value)}
            placeholder="Ex: 3 meses, 6 meses, indefinido..."
            className={INPUT} />
        </div>
      </div>

      {/* ── Informações Adicionais ── */}
      <div className="bg-gray-50 border-2 border-gray-100 rounded-[22px] p-5 space-y-4">
        <p className="text-[11px] font-black text-blue-900 uppercase tracking-widest border-b-2 border-gray-100 pb-3">
          📝 Informações Adicionais
        </p>
        <div>
          <label className={LABEL}>Possui alguma restrição médica?</label>
          <textarea value={restricaoMedica}
            onChange={e => onRestricaoChange(e.target.value)}
            placeholder="Descreva se houver (ex: alergia, limitação física...)"
            rows={2}
            className="w-full bg-white border-2 border-gray-100 rounded-[15px] py-3 px-4 font-bold text-blue-900 outline-none text-sm focus:border-blue-900 transition-all resize-none" />
        </div>
        <div>
          <label className={LABEL}>Outras informações relevantes</label>
          <textarea value={outrasInformacoes}
            onChange={e => onOutrasInfoChange(e.target.value)}
            placeholder="Qualquer informação adicional que considere importante..."
            rows={2}
            className="w-full bg-white border-2 border-gray-100 rounded-[15px] py-3 px-4 font-bold text-blue-900 outline-none text-sm focus:border-blue-900 transition-all resize-none" />
        </div>
      </div>

      {/* ── Resumo ── */}
      <div className="bg-blue-50 border-2 border-blue-100 rounded-[22px] p-5">
        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4">📋 Resumo da Candidatura</p>
        <div className="space-y-2.5">
          {([
            ['👤 Nome',      form1.nomeCompleto || '—'],
            ['⚓ Função',    funcaoDisplay || '—'],
            ['🌍 País',      country.flag + ' ' + country.name],
            ['🪪 Nº Doc.',   form2.docNumero || '—'],
            ['⚡ STCW',      stcwList],
            ['🩺 Cert. Méd.', possuiMedico ? 'Sim' : 'Não'],
            ['📅 Imediato',  disponivelImediato === true ? 'Sim' : disponivelImediato === false ? 'Não' : '—'],
            ['🌐 Internac.', disponivelInternacional === true ? 'Sim' : disponivelInternacional === false ? 'Não' : '—'],
          ] as [string, string][]).map(([l, v]) => (
            <div key={l} className="flex items-start justify-between gap-3">
              <span className="text-[10px] font-black text-blue-400 uppercase flex-shrink-0">{l}</span>
              <span className="text-[10px] font-black text-blue-900 text-right break-words max-w-[55%]">{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Declaração e Termos ── */}
      <div className="bg-white border-2 border-blue-100 rounded-[22px] p-5 space-y-4">
        <div className="flex items-center gap-2 border-b-2 border-gray-100 pb-3">
          <Shield className="w-4 h-4 text-blue-900" />
          <p className="text-[11px] font-black text-blue-900 uppercase tracking-widest">Declaração e Termos</p>
        </div>

        {/* Data automática — somente leitura */}
        <div>
          <p className={LABEL}><Calendar className="w-3 h-3" /> Data e Hora da Declaração</p>
          <div className="flex items-center gap-3 bg-blue-50 border-2 border-blue-100 rounded-[15px] py-3 px-4">
            <Calendar className="w-4 h-4 text-blue-400 flex-shrink-0" />
            <span className="font-black text-blue-900 text-sm tracking-wide">
              {declaracaoData
                ? new Date(declaracaoData).toLocaleString('pt-PT', {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })
                : '—'}
            </span>
            <span className="ml-auto text-[10px] font-bold text-blue-400">Automático</span>
          </div>
        </div>

        {/* Declaração de veracidade — sempre visível, não interativa */}
        <div className="flex items-start gap-3 p-4 rounded-[16px] border-2 border-blue-100 bg-blue-50">
          <CheckCircle2 className="w-5 h-5 text-blue-900 flex-shrink-0 mt-0.5" />
          <p className="text-xs font-bold text-blue-800 leading-relaxed">
            Declaro que as informações acima são verdadeiras e estou ciente das normas de segurança, exigências legais e responsabilidades envolvidas no trabalho embarcado.
          </p>
        </div>

        {/* Termos e Condições — checkbox com UX corrigido */}
        <div
          className={`flex items-start gap-3 p-4 rounded-[16px] border-2 cursor-pointer transition-all select-none
            ${aceitouTermos ? 'border-blue-900 bg-blue-50' : 'border-red-200 bg-red-50 hover:border-blue-300 hover:bg-blue-50'}`}
          onClick={() => onAceitouTermosChange(!aceitouTermos)}>
          {/* Checkbox visual */}
          <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all
            ${aceitouTermos ? 'bg-blue-900 border-blue-900' : 'border-red-300 bg-white'}`}>
            {aceitouTermos && (
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

        {/* Mensagem de erro quando não aceite */}
        {!aceitouTermos && (
          <div className="flex items-center gap-2.5 bg-red-50 border-2 border-red-200 rounded-[14px] px-4 py-3">
            <span className="text-red-500 text-base flex-shrink-0">⛔</span>
            <p className="text-xs font-black text-red-600 leading-snug">
              Para finalizar o cadastro, é obrigatório ler e aceitar os Termos e Condições. Clique na caixa acima para confirmar.
            </p>
          </div>
        )}
      </div>

      <div className="bg-amber-50 border-2 border-amber-100 rounded-[18px] px-5 py-4 flex items-start gap-3">
        <span className="text-lg flex-shrink-0">⏳</span>
        <p className="text-xs font-black text-amber-700">
          Após o envio, a sua candidatura ficará em análise. Será notificado via WhatsApp em até 48h úteis.
        </p>
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={onBack}
          className="px-6 py-5 border-2 border-gray-100 text-gray-400 rounded-[30px] font-black text-sm uppercase hover:border-blue-900 hover:text-blue-900 transition-all">
          ← Voltar
        </button>
        <button type="submit" disabled={loading || !aceitouTermos || !declaracaoData}
          className="flex-1 bg-blue-900 text-white py-5 rounded-[30px] font-black uppercase tracking-widest text-sm hover:bg-blue-800 shadow-xl transition-all disabled:opacity-40 flex items-center justify-center gap-2">
          {loading
            ? <span className="animate-pulse">Enviando...</span>
            : <><CheckCircle2 className="w-5 h-5 text-green-400" /> Finalizar Cadastro</>
          }
        </button>
      </div>
    </form>
  );
}