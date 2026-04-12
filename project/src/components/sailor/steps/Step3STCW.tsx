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

const LABEL = 'text-[10px] font-black text-blue-900 uppercase tracking-wider ml-1 mb-1.5 flex items-center gap-1';
const INPUT = 'w-full bg-white border-2 border-gray-100 rounded-[15px] py-3 px-4 font-bold text-blue-900 outline-none text-sm focus:border-blue-900 transition-all';

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
      <div className="bg-gray-50 border-2 border-gray-100 rounded-[22px] p-5 space-y-3">
        <div className="border-b-2 border-gray-100 pb-3">
          <p className="text-[11px] font-black text-blue-900 uppercase tracking-widest">⚡ Certificados STCW</p>
          <p className="text-[10px] text-gray-400 font-bold mt-1">Assinale os que possui e indique a validade</p>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-[14px] px-4 py-3 flex items-start gap-2">
          <span className="text-sm flex-shrink-0">⚠️</span>
          <p className="text-[10px] font-bold text-blue-700 leading-relaxed">
            Se o certificado vencer, não pode embarcar legalmente. A atualização é obrigatória para manter a certificação ativa segundo padrões internacionais.
          </p>
        </div>

        {STCW_CERTS.map(cert => {
          const checked = stcw[cert.id] ?? false;
          return (
            <div key={cert.id} className={`rounded-[18px] border-2 overflow-hidden transition-all ${checked ? 'border-blue-900' : 'border-gray-100'}`}>
              <label className={`flex items-center justify-between p-4 cursor-pointer transition-all ${checked ? 'bg-blue-900' : 'bg-white hover:bg-gray-50'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${checked ? 'border-white' : 'border-gray-200'}`}>
                    {checked && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                  </div>
                  <span className={`font-black text-sm ${checked ? 'text-white' : 'text-blue-900'}`}>{cert.label}</span>
                </div>
                <input type="checkbox" checked={checked} className="hidden"
                  onChange={e => onStcwChange(cert.id, e.target.checked)} />
              </label>
              {checked && (
                <div className="bg-blue-50 px-4 pb-3 pt-2 flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                  <label className="text-[10px] font-black text-blue-700 uppercase tracking-wider flex-shrink-0">Validade:</label>
                  <input type="text" inputMode="numeric" value={stcwValidades[cert.id] ?? ''}
                    onChange={e => onStcwValidade(cert.id, applyDateMask(e.target.value))}
                    placeholder="dd/mm/aaaa" maxLength={10}
                    className="flex-1 bg-white border border-blue-200 rounded-[10px] py-1.5 px-3 font-bold text-blue-900 outline-none text-sm focus:border-blue-900 transition-all" />
                </div>
              )}
            </div>
          );
        })}

        <div className="bg-amber-50 border border-amber-100 rounded-[14px] px-4 py-3 flex items-center gap-2">
          <span className="text-sm flex-shrink-0">💡</span>
          <p className="text-[10px] font-bold text-amber-700">Não possui nenhum? Pode continuar — o certificado pode ser obtido após a aprovação.</p>
        </div>
      </div>

      {/* ── Experiência Profissional ── */}
      <div className="bg-gray-50 border-2 border-gray-100 rounded-[22px] p-5 space-y-4">
        <p className="text-[11px] font-black text-blue-900 uppercase tracking-widest border-b-2 border-gray-100 pb-3">
          🚢 Experiência Profissional
        </p>

        <div>
          <p className={LABEL}>Já trabalhou embarcado?</p>
          <div className="flex gap-3">
            {[true, false].map(v => (
              <label key={String(v)}
                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-[14px] border-2 cursor-pointer font-black text-sm transition-all
                  ${experienciaEmbarcado === v ? 'bg-blue-900 border-blue-900 text-white' : 'bg-white border-gray-100 text-blue-900 hover:border-blue-200'}`}>
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
              <div key={i} className="bg-white border-2 border-blue-100 rounded-[18px] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black text-blue-900 uppercase tracking-wider">Experiência {i + 1}</p>
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
                    <label className={LABEL}><Calendar className="w-3 h-3" /> Início</label>
                    <input type="text" inputMode="numeric" value={exp.periodo_inicio}
                      onChange={e => onExperienciaChange(i, { periodo_inicio: applyDateMask(e.target.value) })}
                      placeholder="dd/mm/aaaa" maxLength={10}
                      className={INPUT} />
                  </div>
                  <div>
                    <label className={LABEL}><Calendar className="w-3 h-3" /> Fim</label>
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
                className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-blue-200 text-blue-700 hover:border-blue-900 hover:text-blue-900 rounded-[18px] py-3 font-black text-sm transition-all">
                <Plus className="w-4 h-4" /> Adicionar experiência
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Cursos e Qualificações ── */}
      <div className="bg-gray-50 border-2 border-gray-100 rounded-[22px] p-5 space-y-4">
        <p className="text-[11px] font-black text-blue-900 uppercase tracking-widest border-b-2 border-gray-100 pb-3">
          🎓 Cursos e Qualificações
        </p>

        <div>
          <label className={LABEL}>Cursos relevantes</label>
          <textarea value={cursosRelevantes}
            onChange={e => onCursosChange(e.target.value)}
            placeholder="Liste os cursos realizados (ex: Manutenção de Motores, Rádio VHF...)"
            rows={3}
            className="w-full bg-white border-2 border-gray-100 rounded-[15px] py-3 px-4 font-bold text-blue-900 outline-none text-sm focus:border-blue-900 transition-all resize-none" />
        </div>

        <div>
          <p className={LABEL}>Possui cursos offshore? (ex: HUET)</p>
          <div className="flex gap-3">
            {[true, false].map(v => (
              <label key={String(v)}
                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-[14px] border-2 cursor-pointer font-black text-sm transition-all
                  ${possuiOffshore === v ? 'bg-blue-900 border-blue-900 text-white' : 'bg-white border-gray-100 text-blue-900 hover:border-blue-200'}`}>
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
                  className={`flex items-center gap-3 p-3 rounded-[14px] border-2 cursor-pointer transition-all
                    ${checked ? 'bg-blue-900 border-blue-900' : 'bg-white border-gray-100 hover:border-blue-200'}`}>
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${checked ? 'bg-white border-white' : 'border-gray-200'}`}>
                    {checked && <div className="w-2.5 h-2.5 bg-blue-900 rounded-sm" />}
                  </div>
                  <span className={`font-black text-sm ${checked ? 'text-white' : 'text-blue-900'}`}>{idioma}</span>
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
                className={`flex-1 flex items-center justify-center p-3 rounded-[14px] border-2 cursor-pointer font-black text-[11px] transition-all
                  ${idiomaNivel === n ? 'bg-blue-900 border-blue-900 text-white' : 'bg-white border-gray-100 text-blue-900 hover:border-blue-200'}`}>
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
          className="px-6 py-5 border-2 border-gray-100 text-gray-400 rounded-[30px] font-black text-sm uppercase hover:border-blue-900 hover:text-blue-900 transition-all">
          ← Voltar
        </button>
        <button type="button" onClick={onNext}
          className="flex-1 bg-blue-900 text-white py-5 rounded-[30px] font-black uppercase tracking-widest text-sm hover:bg-blue-800 shadow-xl transition-all">
          Próximo → Aptidão Médica
        </button>
      </div>
    </div>
  );
}