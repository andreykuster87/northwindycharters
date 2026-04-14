// src/components/sailor/steps/Step2Documentos.tsx
import { Calendar, Hash, CreditCard } from 'lucide-react';
import { type Country } from '../../../constants/sailorConstants';
import { DocTypeDropdown, DocUploadSlot } from '../SailorSharedComponents';
import { DOC_TYPES } from '../../../lib/localStore';
import type { DocTypeValue } from '../../../lib/localStore';
import { applyMask, applyDateMask } from '../../../utils/sailorHelpers';

interface Props {
  phoneCountry:   Country;
  phoneRaw:       string;
  nomeCompleto:   string;
  docIdType:      DocTypeValue;
  docIdFrontFile: File | null;
  docIdFrontPrev: string | null;
  docIdBackFile:  File | null;
  docIdBackPrev:  string | null;
  cartaType:      DocTypeValue;
  cartaFrontFile: File | null;
  cartaFrontPrev: string | null;
  cartaBackFile:  File | null;
  cartaBackPrev:  string | null;
  form2: {
    docNumero: string; docEmissao: string; docValidade: string;
    cartaNumero: string; cartaEmissao: string; cartaValidade: string;
    caderneta_possui: boolean; caderneta_numero: string;
  };
  onDocIdTypeChange:   (v: DocTypeValue) => void;
  onDocIdFront:        (f: File, p: string | null) => void;
  onDocIdFrontClear:   () => void;
  onDocIdBack:         (f: File, p: string | null) => void;
  onDocIdBackClear:    () => void;
  onCartaFront:        (f: File, p: string | null) => void;
  onCartaFrontClear:   () => void;
  onCartaBack:         (f: File, p: string | null) => void;
  onCartaBackClear:    () => void;
  onForm2Change:       (patch: Partial<Props['form2']>) => void;
  onBack:  () => void;
  onNext:  () => void;
}

const LABEL = 'text-[10px] font-semibold text-[#1a2b4a] uppercase tracking-[0.12em] ml-1 mb-1.5 flex items-center gap-1';

export function Step2Documentos({
  phoneCountry, phoneRaw, nomeCompleto,
  docIdType, docIdFrontFile, docIdFrontPrev, docIdBackFile, docIdBackPrev,
  cartaType, cartaFrontFile, cartaFrontPrev, cartaBackFile, cartaBackPrev,
  form2,
  onDocIdTypeChange,
  onDocIdFront, onDocIdFrontClear, onDocIdBack, onDocIdBackClear,
  onCartaFront, onCartaFrontClear, onCartaBack, onCartaBackClear,
  onForm2Change, onBack, onNext,
}: Props) {
  const docIdInfo = DOC_TYPES.find(d => d.value === docIdType) || DOC_TYPES[0];
  const cartaInfo = DOC_TYPES.find(d => d.value === cartaType) || DOC_TYPES[0];
  const phoneDisplay = applyMask(phoneRaw, phoneCountry.mask);

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">

      {/* Preview do nome */}
      <div className="bg-[#0a1628]/5 border border-[#c9a96e]/20 p-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-[#0a1628] text-[#c9a96e] flex items-center justify-center font-semibold text-sm flex-shrink-0">
          {nomeCompleto.substring(0, 2).toUpperCase() || 'NA'}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-[#1a2b4a] uppercase italic text-sm truncate">{nomeCompleto}</p>
          <p className="text-[10px] text-[#c9a96e]/70 font-medium">{phoneCountry.ddi} {phoneDisplay}</p>
        </div>
      </div>

      {/* ── Documento de Identificação ── */}
      <div className="bg-gray-50 border border-gray-100 p-5 space-y-4">
        <div className="border-b border-gray-100 pb-3">
          <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em]">🪪 Documento de Identificação</p>
          <p className="text-[10px] text-gray-400 font-medium mt-0.5">Passaporte, RG, BI ou outro</p>
        </div>

        <DocTypeDropdown value={docIdType} label="Tipo de Documento"
          onChange={v => {
            onDocIdTypeChange(v);
            const info = DOC_TYPES.find(d => d.value === v);
            if (!info?.hasBack) { onDocIdBackClear(); }
          }} />

        <div>
          <label className={LABEL}><Hash className="w-3 h-3 text-[#c9a96e]" /> Número</label>
          <input value={form2.docNumero}
            onChange={e => onForm2Change({ docNumero: e.target.value.toUpperCase() })}
            placeholder="Número do documento"
            className="w-full bg-white border border-gray-200 py-3 px-4 font-semibold text-[#1a2b4a] uppercase outline-none text-sm tracking-widest focus:border-[#c9a96e] transition-all" />
        </div>

        <div>
          <label className={LABEL}><Calendar className="w-3 h-3 text-[#c9a96e]" /> Validade</label>
          <input type="text" inputMode="numeric" value={form2.docValidade}
            onChange={e => onForm2Change({ docValidade: applyDateMask(e.target.value) })}
            placeholder="dd/mm/aaaa" maxLength={10}
            className="w-full bg-white border border-gray-200 py-3 px-4 font-medium text-[#1a2b4a] outline-none text-sm focus:border-[#c9a96e] transition-all" />
        </div>

        <div className="space-y-3">
          <DocUploadSlot label="Frente *" sublabel="Lado com foto e nome" required
            file={docIdFrontFile} preview={docIdFrontPrev}
            onSelect={onDocIdFront} onClear={onDocIdFrontClear} />
          {docIdInfo.hasBack && (
            <DocUploadSlot label="Verso *" sublabel="Código de barras ou dados adicionais" required
              file={docIdBackFile} preview={docIdBackPrev}
              onSelect={onDocIdBack} onClear={onDocIdBackClear} />
          )}
        </div>
      </div>

      {/* ── Carta de Habilitação Náutica ── */}
      <div className="bg-gray-50 border border-gray-100 p-5 space-y-4">
        <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em] border-b border-gray-100 pb-3">
          ⚓ Carta de Habilitação Náutica
        </p>

        <div>
          <label className={LABEL}><CreditCard className="w-3 h-3 text-[#c9a96e]" /> Tipo de Habilitação</label>
          <div className="w-full bg-gray-50 border border-[#c9a96e]/40 py-3 px-4 font-semibold text-[#1a2b4a] text-sm flex items-center gap-2">
            <span>⚓</span> Habilitação Náutica
          </div>
        </div>

        <div>
          <label className={LABEL}><Hash className="w-3 h-3 text-[#c9a96e]" /> Nº da Habilitação</label>
          <input value={form2.cartaNumero}
            onChange={e => onForm2Change({ cartaNumero: e.target.value.toUpperCase() })}
            placeholder="Número da carta de habilitação"
            className="w-full bg-white border border-gray-200 py-3 px-4 font-semibold text-[#1a2b4a] uppercase outline-none text-sm focus:border-[#c9a96e] transition-all" />
        </div>

        <div>
          <label className={LABEL}><Calendar className="w-3 h-3 text-[#c9a96e]" /> Validade</label>
          <input type="text" inputMode="numeric" value={form2.cartaValidade}
            onChange={e => onForm2Change({ cartaValidade: applyDateMask(e.target.value) })}
            placeholder="dd/mm/aaaa" maxLength={10}
            className="w-full bg-white border border-gray-200 py-3 px-4 font-medium text-[#1a2b4a] outline-none text-sm focus:border-[#c9a96e] transition-all" />
        </div>

        <div className="space-y-3">
          <DocUploadSlot label="Frente da Carta" sublabel="Lado principal (opcional)" required={false}
            file={cartaFrontFile} preview={cartaFrontPrev}
            onSelect={onCartaFront} onClear={onCartaFrontClear} />
          {cartaInfo.hasBack && (
            <DocUploadSlot label="Verso da Carta" sublabel="(opcional)" required={false}
              file={cartaBackFile} preview={cartaBackPrev}
              onSelect={onCartaBack} onClear={onCartaBackClear} />
          )}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onBack}
          className="px-6 py-4 border border-gray-200 text-gray-400 font-semibold text-sm uppercase hover:border-[#c9a96e] hover:text-[#1a2b4a] transition-all">
          ← Voltar
        </button>
        <button type="button" onClick={onNext}
          className="flex-1 bg-[#0a1628] text-white py-4 font-semibold uppercase tracking-widest text-sm hover:bg-[#1a2b4a] transition-all">
          Próximo → Certificados STCW
        </button>
      </div>
    </div>
  );
}
