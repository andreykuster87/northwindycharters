// src/components/sailor/steps/Step3STCW.tsx
import { Calendar, Plus, Trash2 } from 'lucide-react';
import { applyDateMask } from '../../../utils/sailorHelpers';
import { STCW_CERTS, IDIOMAS_DISPONIVEIS } from '../../../constants/sailorConstants';

interface Experiencia {
  empresa: string;
  funcao: string;
  periodo_inicio: string;
  periodo_fim: string;
}

interface Props {
  stcw:          Record<string, boolean>;
  stcwValidades: Record<string, string>;
  experienciaEmbarcado: boolean | null;
  experiencias:  Experiencia[];
  cursosRelevantes: string;
  possuiOffshore: boolean | null;
  idiomas:        string[];
  idiomaOutro:    string;
  idiomaNivel:    string;
  onStcwChange:      (cert: string, checked: boolean) => void;
  onStcwValidade:    (cert: string, val: string) => void;
  onExperienciaEmbarcado: (v: boolean) => void;
  onAddExperiencia:  () => void;
  onRemoveExperiencia: (i: number) => void;
  onExperienciaChange: (i: number, patch: Partial<Experiencia>) => void;
  onCursosChange:    (v: string) => void;
  onOffshoreChange:  (v: boolean) => void;
  onIdiomasChange:   (idioma: string, checked: boolean) => void;
  onIdiomaOutroChange: (v: string) => void;
  onIdiomaNivelChange: (v: string) => void;
  onBack: () => void;
  onNext: () => void;
}

const LABEL = 'text-[10px] font-semibold text-[#1a2b4a] uppercase tracking-[0.12em] ml-1 mb-1.5 flex items-center gap-1';
const INPUT = 'w-full bg-white border border-gray-200 py-3 px-4 font-medium text-[#1a2b4a] outline-none text-sm focus:border-[#c9a96e] transition-all';

export function Step3STCW({
  stcw, stcwValidades,
  experienciaEmbarcado, experiencias,
  cursosRelevantes, possuiOffshore,
  idiomas, idiomaOutro, idiomaNivel,
  onStcwChange, onStcwValidade,
  onExperienciaEmbarcado, onAddExperiencia, onRemoveExperiencia, onExperienciaChange,
  onCursosChange, onOffshoreChange,
  onIdiomasChange, onIdiomaOutroChange, onIdiomaNivelChange,
  onBack, onNext,
}: Props) {
  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">

      {/* ── STCW ── */}
      <div className="bg-gray-50 border border-gray-100 p-5 space-y-3">
        <div className="border-b border-gray-100 pb-3">
          <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em]">⚡ Certificados STCW</p>
          <p className="text-[10px] text-gray-400 font-medium mt-1">Assinale os que possui e indique a validade</p>
        </div>

        <div className="bg-[#0a1628]/5 border border-[#c9a96e]/20 px-4 py-3 flex items-start gap-2">
          <span className="text-sm flex-shrink-0">⚠️</span>
          <p className="text-[10px] font-medium text-[#1a2b4a] leading-relaxed">
            Se o certificado vencer, não pode embarcar legalmente. A atualização é obrigatória para manter a certificação ativa segundo padrões internacionais.
          </p>
        </div>

        {STCW_CERTS.map(cert => {
          const checked = stcw[cert.id] ?? false;
          return (
            <div key={cert.id} className={`border overflow-hidden transition-all ${checked ? 'border-[#0a1628]' : 'border-gray-100'}`}>
              <label className={`flex items-center justify-between p-4 cursor-pointer transition-all ${checked ? 'bg-[#0a1628]' : 'bg-white hover:bg-gray-50'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 border-2 flex items-center justify-center flex-shrink-0 ${checked ? 'border-white' : 'border-gray-200'}`}>
                    {checked && <div className="w-2.5 h-2.5 bg-[#c9a96e]" />}
                  </div>
                  <span className={`font-semibold text-sm ${checked ? 'text-white' : 'text-[#1a2b4a]'}`}>{cert.label}</span>
                </div>
                <input type="checkbox" checked={checked} className="hidden"
                  onChange={e => onStcwChange(cert.id, e.target.checked)} />
              </label>
              {checked && (
                <div className="bg-[#0a1628]/5 px-4 pb-3 pt-2 flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-[#c9a96e] flex-shrink-0" />
                  <label className="text-[10px] font-semibold text-[#1a2b4a] uppercase tracking-wider flex-shrink-0">Validade:</label>
                  <input type="text" inputMode="numeric" value={stcwValidades[cert.id] ?? ''}
                    onChange={e => onStcwValidade(cert.id, applyDateMask(e.target.value))}
                    placeholder="dd/mm/aaaa" maxLength={10}
                    className="flex-1 bg-white border border-gray-200 py-1.5 px-3 font-medium text-[#1a2b4a] outline-none text-sm focus:border-[#c9a96e] transition-all" />
                </div>
              )}
            </div>
          );
        })}

        <div className="bg-[#c9a96e]/5 border border-[#c9a96e]/20 px-4 py-3 flex items-center gap-2">
          <span className="text-sm flex-shrink-0">💡</span>
          <p className="text-[10px] font-medium text-[#1a2b4a]">Não possui nenhum? Pode continuar — o certificado pode ser obtido após a aprovação.</p>
        </div>
      </div>

      {/* ── Experiência Profissional ── */}
      <div className="bg-gray-50 border border-gray-100 p-5 space-y-4">
        <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em] border-b border-gray-100 pb-3">
          🚢 Experiência Profissional
        </p>

        <div>
          <p className={LABEL}>Já trabalhou embarcado?</p>
          <div className="flex gap-3">
            {[true, false].map(v => (
              <label key={String(v)}
                className={`flex-1 flex items-center justify-center gap-2 p-3 border cursor-pointer font-semibold text-sm transition-all
                  ${experienciaEmbarcado === v ? 'bg-[#0a1628] border-[#0a1628] text-white' : 'bg-white border-gray-100 text-[#1a2b4a] hover:border-[#c9a96e]/30'}`}>
                <input type="radio" name="embarcado" className="hidden"
                  checked={experienciaEmbarcado === v}
                  onChange={() => onExperienciaEmbarcado(v)} />
                {v ? '✓ Sim' : '✗ Não'}
              </label>
            ))}
          </div>
        </div>

        {experienciaEmbarcado && (
          <div className="space-y-3">
            {experiencias.map((exp, i) => (
              <div key={i} className="bg-white border border-gray-100 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-wider">Experiência {i + 1}</p>
                  {experiencias.length > 1 && (
                    <button type="button" onClick={() => onRemoveExperiencia(i)}
                      className="text-red-400 hover:text-red-600 transition-colors p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <input value={exp.empresa}
                  onChange={e => onExperienciaChange(i, { empresa: e.target.value })}
                  placeholder="Empresa / Nome da embarcação"
                  className={INPUT} />
                <input value={exp.funcao}
                  onChange={e => onExperienciaChange(i, { funcao: e.target.value })}
                  placeholder="Função exercida"
                  className={INPUT} />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={LABEL}><Calendar className="w-3 h-3 text-[#c9a96e]" /> Início</label>
                    <input type="text" inputMode="numeric" value={exp.periodo_inicio}
                      onChange={e => onExperienciaChange(i, { periodo_inicio: applyDateMask(e.target.value) })}
                      placeholder="dd/mm/aaaa" maxLength={10}
                      className={INPUT} />
                  </div>
                  <div>
                    <label className={LABEL}><Calendar className="w-3 h-3 text-[#c9a96e]" /> Fim</label>
                    <input type="text" inputMode="numeric" value={exp.periodo_fim}
                      onChange={e => onExperienciaChange(i, { periodo_fim: applyDateMask(e.target.value) })}
                      placeholder="dd/mm/aaaa" maxLength={10}
                      className={INPUT} />
                  </div>
                </div>
              </div>
            ))}
            {experiencias.length < 5 && (
              <button type="button" onClick={onAddExperiencia}
                className="w-full flex items-center justify-center gap-2 border border-dashed border-[#c9a96e]/30 text-[#1a2b4a] hover:border-[#c9a96e] hover:text-[#c9a96e] py-3 font-semibold text-sm transition-all">
                <Plus className="w-4 h-4" /> Adicionar experiência
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Cursos e Qualificações ── */}
      <div className="bg-gray-50 border border-gray-100 p-5 space-y-4">
        <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em] border-b border-gray-100 pb-3">
          🎓 Cursos e Qualificações
        </p>

        <div>
          <label className={LABEL}>Cursos relevantes</label>
          <textarea value={cursosRelevantes}
            onChange={e => onCursosChange(e.target.value)}
            placeholder="Liste os cursos realizados (ex: Manutenção de Motores, Rádio VHF...)"
            rows={3}
            className="w-full bg-white border border-gray-200 py-3 px-4 font-medium text-[#1a2b4a] outline-none text-sm focus:border-[#c9a96e] transition-all resize-none" />
        </div>

        <div>
          <p className={LABEL}>Possui cursos offshore? (ex: HUET)</p>
          <div className="flex gap-3">
            {[true, false].map(v => (
              <label key={String(v)}
                className={`flex-1 flex items-center justify-center gap-2 p-3 border cursor-pointer font-semibold text-sm transition-all
                  ${possuiOffshore === v ? 'bg-[#0a1628] border-[#0a1628] text-white' : 'bg-white border-gray-100 text-[#1a2b4a] hover:border-[#c9a96e]/30'}`}>
                <input type="radio" name="offshore" className="hidden"
                  checked={possuiOffshore === v}
                  onChange={() => onOffshoreChange(v)} />
                {v ? '✓ Sim' : '✗ Não'}
              </label>
            ))}
          </div>
        </div>

        <div>
          <p className={LABEL}>Idiomas</p>
          <div className="space-y-2">
            {IDIOMAS_DISPONIVEIS.map(idioma => {
              const checked = idiomas.includes(idioma);
              return (
                <label key={idioma}
                  className={`flex items-center gap-3 p-3 border cursor-pointer transition-all
                    ${checked ? 'bg-[#0a1628] border-[#0a1628]' : 'bg-white border-gray-100 hover:border-[#c9a96e]/30'}`}>
                  <div className={`w-5 h-5 border-2 flex items-center justify-center flex-shrink-0 ${checked ? 'bg-white border-white' : 'border-gray-200'}`}>
                    {checked && <div className="w-2.5 h-2.5 bg-[#c9a96e]" />}
                  </div>
                  <span className={`font-semibold text-sm ${checked ? 'text-white' : 'text-[#1a2b4a]'}`}>{idioma}</span>
                  <input type="checkbox" className="hidden" checked={checked}
                    onChange={e => onIdiomasChange(idioma, e.target.checked)} />
                </label>
              );
            })}
            <div>
              <label className={LABEL}>Outro idioma</label>
              <input value={idiomaOutro}
                onChange={e => onIdiomaOutroChange(e.target.value)}
                placeholder="Ex: Francês, Italiano..."
                className={INPUT} />
            </div>
          </div>
        </div>

        <div>
          <p className={LABEL}>Nível geral de idiomas</p>
          <div className="flex gap-2">
            {(['Básico', 'Intermediário', 'Avançado'] as const).map(n => (
              <label key={n}
                className={`flex-1 flex items-center justify-center p-3 border cursor-pointer font-semibold text-[11px] transition-all
                  ${idiomaNivel === n ? 'bg-[#0a1628] border-[#0a1628] text-white' : 'bg-white border-gray-100 text-[#1a2b4a] hover:border-[#c9a96e]/30'}`}>
                <input type="radio" name="nivel" className="hidden"
                  checked={idiomaNivel === n}
                  onChange={() => onIdiomaNivelChange(n)} />
                {n}
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onBack}
          className="px-6 py-4 border border-gray-200 text-gray-400 font-semibold text-sm uppercase hover:border-[#c9a96e] hover:text-[#1a2b4a] transition-all">
          ← Voltar
        </button>
        <button type="button" onClick={onNext}
          className="flex-1 bg-[#0a1628] text-white py-4 font-semibold uppercase tracking-widest text-sm hover:bg-[#1a2b4a] transition-all">
          Próximo → Aptidão Médica
        </button>
      </div>
    </div>
  );
}
