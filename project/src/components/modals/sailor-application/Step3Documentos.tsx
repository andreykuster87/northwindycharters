// src/components/modals/sailor-application/Step3Documentos.tsx
import { CheckCircle2, Plus, Trash2 } from 'lucide-react';
import { DocUploadSlot, DocTypeDropdown } from '../../sailor/SailorSharedComponents';
import { STCW_CERTS, IDIOMAS_DISPONIVEIS } from '../../../constants/sailorConstants';
import { DOC_TYPES } from '../../../lib/localStore';
import type { DocTypeValue, Client } from '../../../lib/localStore';
import { applyDateMask } from './utils';
import type { Experiencia } from './utils';

const LABEL = 'text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em] ml-1 mb-1.5 flex items-center gap-1';

interface Props {
  client: Client;
  hasPassport: boolean;
  isChef: boolean;

  docIdType: DocTypeValue;
  setDocIdType: (v: DocTypeValue) => void;
  docIdNumero: string;
  setDocIdNumero: (v: string) => void;
  docIdValidade: string;
  setDocIdValidade: (v: string) => void;
  docIdFile: File | null;
  docIdPrev: string | null;
  setDocIdFile: (f: File | null) => void;
  setDocIdPrev: (p: string | null) => void;
  docIdBackFile: File | null;
  docIdBackPrev: string | null;
  setDocIdBackFile: (f: File | null) => void;
  setDocIdBackPrev: (p: string | null) => void;

  cartaNumero: string;
  setCartaNumero: (v: string) => void;
  cartaValidade: string;
  setCartaValidade: (v: string) => void;
  cartaFile: File | null;
  cartaPrev: string | null;
  setCartaFile: (f: File | null) => void;
  setCartaPrev: (p: string | null) => void;
  cartaBackFile: File | null;
  cartaBackPrev: string | null;
  setCartaBackFile: (f: File | null) => void;
  setCartaBackPrev: (p: string | null) => void;

  stcw: Record<string, boolean>;
  setStcw: (v: Record<string, boolean>) => void;
  stcwValidades: Record<string, string>;
  setStcwValidades: (v: Record<string, string>) => void;

  medicoNumero: string;
  setMedicoNumero: (v: string) => void;
  medicoValidade: string;
  setMedicoValidade: (v: string) => void;
  medicoFile: File | null;
  medicoPrev: string | null;
  setMedicoFile: (f: File | null) => void;
  setMedicoPrev: (p: string | null) => void;

  chefCatering: boolean;
  setChefCatering: (v: boolean) => void;
  chefCertificacoes: string;
  setChefCertificacoes: (v: string) => void;
  chefFile: File | null;
  chefPrev: string | null;
  setChefFile: (f: File | null) => void;
  setChefPrev: (p: string | null) => void;

  experienciaEmbarcado: boolean | null;
  setExperienciaEmbarcado: (v: boolean | null) => void;
  experiencias: Experiencia[];
  setExperiencias: (v: Experiencia[]) => void;

  cursosRelevantes: string;
  setCursosRelevantes: (v: string) => void;
  idiomas: string[];
  setIdiomas: (v: string[]) => void;
}

export function Step3Documentos({
  client, hasPassport, isChef,
  docIdType, setDocIdType,
  docIdNumero, setDocIdNumero,
  docIdValidade, setDocIdValidade,
  docIdFile, docIdPrev, setDocIdFile, setDocIdPrev,
  docIdBackFile, docIdBackPrev, setDocIdBackFile, setDocIdBackPrev,
  cartaNumero, setCartaNumero,
  cartaValidade, setCartaValidade,
  cartaFile, cartaPrev, setCartaFile, setCartaPrev,
  cartaBackFile, cartaBackPrev, setCartaBackFile, setCartaBackPrev,
  stcw, setStcw,
  stcwValidades, setStcwValidades,
  medicoNumero, setMedicoNumero,
  medicoValidade, setMedicoValidade,
  medicoFile, medicoPrev, setMedicoFile, setMedicoPrev,
  chefCatering, setChefCatering,
  chefCertificacoes, setChefCertificacoes,
  chefFile, chefPrev, setChefFile, setChefPrev,
  experienciaEmbarcado, setExperienciaEmbarcado,
  experiencias, setExperiencias,
  cursosRelevantes, setCursosRelevantes,
  idiomas, setIdiomas,
}: Props) {
  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">

      {/* Documento de Identificação */}
      <div className="bg-gray-50 border border-gray-200 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em]">🪪 Documento de Identificação</p>
          {hasPassport
            ? <span className="text-[9px] text-green-700 font-bold bg-green-100 px-2 py-0.5">JÁ CADASTRADO</span>
            : <span className="text-[9px] text-red-500 font-bold bg-red-50 px-2 py-0.5">OBRIGATÓRIO</span>
          }
        </div>
        {hasPassport ? (
          <div className="bg-green-50 border border-green-100 p-4 space-y-2">
            <p className="text-[10px] font-semibold text-green-700 uppercase tracking-[0.15em] flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3" /> Passaporte já registado no seu perfil
            </p>
            {[
              ['Tipo',     client.doc_type || 'passport'],
              ['Número',   client.passport_number],
              ['Validade', client.passport_expires
                ? new Date(client.passport_expires).toLocaleDateString('pt-PT')
                : '—'],
            ].map(([l, v]) => (
              <div key={l} className="flex justify-between items-center">
                <span className="text-[10px] font-semibold text-green-500 uppercase">{l}</span>
                <span className="text-xs font-bold text-green-900">{v}</span>
              </div>
            ))}
          </div>
        ) : (
          <>
            <DocTypeDropdown value={docIdType} onChange={setDocIdType} label="Tipo de Documento" />
            <div>
              <label className={LABEL}>Número <span className="text-red-400">*</span></label>
              <input
                value={docIdNumero}
                onChange={e => setDocIdNumero(e.target.value.toUpperCase())}
                placeholder="Número do documento"
                className="w-full bg-white border border-gray-200 py-3.5 px-4 text-sm font-bold text-[#1a2b4a] outline-none focus:border-[#c9a96e]"
              />
            </div>
            <div>
              <label className={LABEL}>Validade <span className="text-red-400">*</span></label>
              <input
                value={docIdValidade}
                onChange={e => setDocIdValidade(applyDateMask(e.target.value))}
                placeholder="dd/mm/aaaa"
                maxLength={10}
                className="w-full bg-white border border-gray-200 py-3.5 px-4 text-sm font-bold text-[#1a2b4a] outline-none focus:border-[#c9a96e]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <DocUploadSlot label="Frente" required file={docIdFile} preview={docIdPrev}
                onSelect={(f, p) => { setDocIdFile(f); setDocIdPrev(p); }}
                onClear={() => { setDocIdFile(null); setDocIdPrev(null); }} />
              {DOC_TYPES.find(d => d.value === docIdType)?.hasBack && (
                <DocUploadSlot label="Verso" file={docIdBackFile} preview={docIdBackPrev}
                  onSelect={(f, p) => { setDocIdBackFile(f); setDocIdBackPrev(p); }}
                  onClear={() => { setDocIdBackFile(null); setDocIdBackPrev(null); }} />
              )}
            </div>
          </>
        )}
      </div>

      {/* STCW */}
      <div className="bg-gray-50 border border-gray-200 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em]">📋 Certificados STCW</p>
          <span className="text-[9px] text-red-500 font-bold bg-red-50 px-2 py-0.5">OBRIGATÓRIO</span>
        </div>
        <p className="text-[10px] text-gray-500 font-bold -mt-2">Selecione ao menos um certificado.</p>
        {STCW_CERTS.map(cert => (
          <div key={cert.id}>
            <label className="flex items-center gap-3 cursor-pointer">
              <div className={`w-5 h-5 border-2 flex items-center justify-center transition-all ${
                stcw[cert.id] ? 'bg-[#0a1628] border-[#0a1628]' : 'border-gray-200 bg-white'
              }`} onClick={() => setStcw({ ...stcw, [cert.id]: !stcw[cert.id] })}>
                {stcw[cert.id] && <CheckCircle2 className="w-3 h-3 text-white" />}
              </div>
              <span className="text-xs font-bold text-[#1a2b4a]">{cert.label}</span>
            </label>
            {stcw[cert.id] && (
              <input
                value={stcwValidades[cert.id] || ''}
                onChange={e => setStcwValidades({ ...stcwValidades, [cert.id]: applyDateMask(e.target.value) })}
                placeholder="Validade dd/mm/aaaa"
                maxLength={10}
                className="mt-1.5 ml-8 w-40 bg-white border border-gray-200 py-2 px-3 text-xs font-bold text-[#1a2b4a] outline-none focus:border-[#c9a96e]"
              />
            )}
          </div>
        ))}
        {!Object.values(stcw).some(Boolean) && (
          <p className="text-[10px] text-red-400 font-bold ml-1">Selecione ao menos um certificado STCW</p>
        )}
      </div>

      {/* Certificado Médico */}
      <div className="bg-gray-50 border border-gray-200 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em]">🩺 Certificado Médico Marítimo</p>
          <span className="text-[9px] text-red-500 font-bold bg-red-50 px-2 py-0.5">OBRIGATÓRIO</span>
        </div>
        <div>
          <label className={LABEL}>Número <span className="text-red-400">*</span></label>
          <input
            value={medicoNumero}
            onChange={e => setMedicoNumero(e.target.value.toUpperCase())}
            placeholder="Nº do certificado médico"
            className="w-full bg-white border border-gray-200 py-3.5 px-4 text-sm font-bold text-[#1a2b4a] outline-none focus:border-[#c9a96e]"
          />
        </div>
        <div>
          <label className={LABEL}>Validade <span className="text-red-400">*</span></label>
          <input
            value={medicoValidade}
            onChange={e => setMedicoValidade(applyDateMask(e.target.value))}
            placeholder="dd/mm/aaaa"
            maxLength={10}
            className="w-full bg-white border border-gray-200 py-3.5 px-4 text-sm font-bold text-[#1a2b4a] outline-none focus:border-[#c9a96e]"
          />
        </div>
        <DocUploadSlot label="Upload do Certificado" required file={medicoFile} preview={medicoPrev}
          onSelect={(f, p) => { setMedicoFile(f); setMedicoPrev(p); }}
          onClear={() => { setMedicoFile(null); setMedicoPrev(null); }} />
      </div>

      {/* Documentos de Cozinheiro — só aparece se função selecionada */}
      {isChef && (
        <div className="bg-[#c9a96e]/5 border border-[#c9a96e]/20 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold text-[#1a2b4a] uppercase tracking-[0.15em]">🍳 Certificado de Cozinheiro</p>
            <span className="text-[9px] text-gray-400 font-bold bg-gray-200 px-2 py-0.5">OPCIONAL</span>
          </div>
          <p className="text-[10px] text-[#1a2b4a]/70 font-bold -mt-2">HACCP, Manipulação de Alimentos ou equivalente.</p>
          <label className="flex items-start gap-3 cursor-pointer">
            <div className={`w-5 h-5 border-2 flex items-center justify-center mt-0.5 transition-all flex-shrink-0 ${
              chefCatering ? 'bg-[#c9a96e] border-[#c9a96e]' : 'border-gray-200 bg-white'
            }`} onClick={() => setChefCatering(!chefCatering)}>
              {chefCatering && <CheckCircle2 className="w-3 h-3 text-white" />}
            </div>
            <span className="text-xs font-bold text-[#1a2b4a]">Tenho experiência em catering / serviço de bordo</span>
          </label>
          {chefCatering && (
            <div className="space-y-3">
              <textarea
                value={chefCertificacoes}
                onChange={e => setChefCertificacoes(e.target.value)}
                placeholder="Ex: Curso HACCP, Manipulação de Alimentos, Coprocultura..."
                rows={2}
                className="w-full bg-white border border-[#c9a96e]/20 py-3 px-4 text-xs font-bold text-[#1a2b4a] outline-none focus:border-[#c9a96e] resize-none"
              />
              <DocUploadSlot label="Upload do Certificado" file={chefFile} preview={chefPrev}
                onSelect={(f, p) => { setChefFile(f); setChefPrev(p); }}
                onClear={() => { setChefFile(null); setChefPrev(null); }} />
            </div>
          )}
        </div>
      )}

      {/* Carta de Habilitação Náutica */}
      <div className="bg-gray-50 border border-gray-200 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em]">⚓ Carta de Habilitação Náutica</p>
          <span className="text-[9px] text-gray-400 font-bold bg-gray-200 px-2 py-0.5">OPCIONAL</span>
        </div>
        <div>
          <label className={LABEL}>Nº da Habilitação</label>
          <input
            value={cartaNumero}
            onChange={e => setCartaNumero(e.target.value.toUpperCase())}
            placeholder="Número da habilitação"
            className="w-full bg-white border border-gray-200 py-3.5 px-4 text-sm font-bold text-[#1a2b4a] outline-none focus:border-[#c9a96e]"
          />
        </div>
        <div>
          <label className={LABEL}>Validade</label>
          <input
            value={cartaValidade}
            onChange={e => setCartaValidade(applyDateMask(e.target.value))}
            placeholder="dd/mm/aaaa"
            maxLength={10}
            className="w-full bg-white border border-gray-200 py-3.5 px-4 text-sm font-bold text-[#1a2b4a] outline-none focus:border-[#c9a96e]"
          />
        </div>
        {cartaNumero && (
          <div className="grid grid-cols-2 gap-3">
            <DocUploadSlot label="Frente" file={cartaFile} preview={cartaPrev}
              onSelect={(f, p) => { setCartaFile(f); setCartaPrev(p); }}
              onClear={() => { setCartaFile(null); setCartaPrev(null); }} />
            <DocUploadSlot label="Verso" file={cartaBackFile} preview={cartaBackPrev}
              onSelect={(f, p) => { setCartaBackFile(f); setCartaBackPrev(p); }}
              onClear={() => { setCartaBackFile(null); setCartaBackPrev(null); }} />
          </div>
        )}
      </div>

      {/* Experiência */}
      <div className="bg-gray-50 border border-gray-200 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em]">💼 Experiência a Bordo</p>
          <span className="text-[9px] text-gray-400 font-bold bg-gray-200 px-2 py-0.5">OPCIONAL</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[true, false].map(v => (
            <button key={String(v)} type="button"
              onClick={() => setExperienciaEmbarcado(v)}
              className={`py-2.5 font-semibold text-xs transition-all border ${
                experienciaEmbarcado === v
                  ? 'bg-[#0a1628] text-white border-[#0a1628]'
                  : 'bg-white text-[#1a2b4a] border-gray-200 hover:border-[#c9a96e]/30'
              }`}>
              {v ? '✅ Sim' : '❌ Não'}
            </button>
          ))}
        </div>
        {experienciaEmbarcado && (
          <div className="space-y-3">
            {experiencias.map((exp, i) => (
              <div key={i} className="bg-white border border-gray-200 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em]">Experiência {i + 1}</p>
                  {experiencias.length > 1 && (
                    <button type="button"
                      onClick={() => setExperiencias(experiencias.filter((_, j) => j !== i))}
                      className="w-6 h-6 bg-red-100 flex items-center justify-center hover:bg-red-200 transition-colors">
                      <Trash2 className="w-3 h-3 text-red-500" />
                    </button>
                  )}
                </div>
                <input value={exp.empresa}
                  onChange={e => setExperiencias(experiencias.map((x, j) => j === i ? { ...x, empresa: e.target.value } : x))}
                  placeholder="Empresa / Embarcação"
                  className="w-full bg-gray-50 border border-gray-200 py-2.5 px-3 text-xs font-bold text-[#1a2b4a] outline-none focus:border-[#c9a96e]" />
                <input value={exp.funcao}
                  onChange={e => setExperiencias(experiencias.map((x, j) => j === i ? { ...x, funcao: e.target.value } : x))}
                  placeholder="Função exercida"
                  className="w-full bg-gray-50 border border-gray-200 py-2.5 px-3 text-xs font-bold text-[#1a2b4a] outline-none focus:border-[#c9a96e]" />
                <div className="grid grid-cols-2 gap-2">
                  <input value={exp.periodo_inicio}
                    onChange={e => setExperiencias(experiencias.map((x, j) => j === i ? { ...x, periodo_inicio: applyDateMask(e.target.value) } : x))}
                    placeholder="Início" maxLength={10}
                    className="bg-gray-50 border border-gray-200 py-2.5 px-3 text-xs font-bold text-[#1a2b4a] outline-none focus:border-[#c9a96e]" />
                  <input value={exp.periodo_fim}
                    onChange={e => setExperiencias(experiencias.map((x, j) => j === i ? { ...x, periodo_fim: applyDateMask(e.target.value) } : x))}
                    placeholder="Fim" maxLength={10}
                    className="bg-gray-50 border border-gray-200 py-2.5 px-3 text-xs font-bold text-[#1a2b4a] outline-none focus:border-[#c9a96e]" />
                </div>
              </div>
            ))}
            <button type="button"
              onClick={() => setExperiencias([...experiencias, { empresa: '', funcao: '', periodo_inicio: '', periodo_fim: '' }])}
              className="w-full border border-dashed border-[#c9a96e]/30 py-2.5 flex items-center justify-center gap-2 text-xs font-bold text-[#c9a96e] hover:border-[#c9a96e] hover:text-[#1a2b4a] transition-all">
              <Plus className="w-3 h-3" /> Adicionar outra experiência
            </button>
          </div>
        )}
      </div>

      {/* Idiomas */}
      <div className="bg-gray-50 border border-gray-200 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em]">🌐 Idiomas</p>
          <span className="text-[9px] text-gray-400 font-bold bg-gray-200 px-2 py-0.5">OPCIONAL</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {IDIOMAS_DISPONIVEIS.map(lang => {
            const sel = idiomas.includes(lang);
            return (
              <button key={lang} type="button"
                onClick={() => setIdiomas(sel ? idiomas.filter(x => x !== lang) : [...idiomas, lang])}
                className={`px-3 py-2 text-xs font-bold border transition-all ${
                  sel ? 'bg-[#0a1628] text-white border-[#0a1628]' : 'bg-white text-[#1a2b4a] border-gray-200 hover:border-[#c9a96e]/30'
                }`}>
                {lang}
              </button>
            );
          })}
        </div>
      </div>

      {/* Cursos */}
      <div className="bg-gray-50 border border-gray-200 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em]">📚 Cursos Relevantes</p>
          <span className="text-[9px] text-gray-400 font-bold bg-gray-200 px-2 py-0.5">OPCIONAL</span>
        </div>
        <textarea
          value={cursosRelevantes}
          onChange={e => setCursosRelevantes(e.target.value)}
          placeholder="Descreva cursos, especializações ou treinamentos relevantes..."
          rows={3}
          className="w-full bg-white border border-gray-200 py-3 px-4 text-xs font-bold text-[#1a2b4a] outline-none focus:border-[#c9a96e] resize-none"
        />
      </div>

    </div>
  );
}
