// src/components/sailor/steps/Step2Documentos.tsx
import { Calendar, Hash, CreditCard } from 'lucide-react';
import { type Country } from '../../../constants/sailorConstants';
import { CountryDropdown, DocTypeDropdown, DocUploadSlot } from '../SailorSharedComponents';
import { DOC_TYPES } from '../../../lib/localStore';
import type { DocTypeValue } from '../../../lib/localStore';
import { applyMask, applyDateMask } from '../../../utils/sailorHelpers';

interface Props {
  country:        Country;
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
  onCountryChange:     (c: Country) => void;
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

const LABEL = 'text-[10px] font-black text-blue-900 uppercase tracking-wider ml-1 mb-1.5 flex items-center gap-1';

export function Step2Documentos({
  country, phoneCountry, phoneRaw, nomeCompleto,
  docIdType, docIdFrontFile, docIdFrontPrev, docIdBackFile, docIdBackPrev,
  cartaType, cartaFrontFile, cartaFrontPrev, cartaBackFile, cartaBackPrev,
  form2,
  onCountryChange, onDocIdTypeChange,
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
      <div className="bg-blue-50 border-2 border-blue-100 rounded-[20px] p-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-900 text-white rounded-full flex items-center justify-center font-black text-sm flex-shrink-0">
          {nomeCompleto.substring(0, 2).toUpperCase() || 'NA'}
        </div>
        <div className="min-w-0">
          <p className="font-black text-blue-900 uppercase italic text-sm truncate">{nomeCompleto}</p>
          <p className="text-[10px] text-blue-400 font-bold">{phoneCountry.ddi} {phoneDisplay}</p>
        </div>
      </div>

      <CountryDropdown value={country.code} onChange={onCountryChange} label="Nacionalidade" />

      {/* ── Documento de Identificação ── */}
      <div className="bg-gray-50 border-2 border-gray-100 rounded-[22px] p-5 space-y-4">
        <div className="border-b-2 border-gray-100 pb-3">
          <p className="text-[11px] font-black text-blue-900 uppercase tracking-widest">🪪 Documento de Identificação</p>
          <p className="text-[10px] text-gray-400 font-bold mt-0.5">Passaporte, RG, BI ou outro</p>
        </div>

        <DocTypeDropdown value={docIdType} label="Tipo de Documento"
          onChange={v => {
            onDocIdTypeChange(v);
            const info = DOC_TYPES.find(d => d.value === v);
            if (!info?.hasBack) { onDocIdBackClear(); }
          }} />

        <div>
          <label className={LABEL}><Hash className="w-3 h-3" /> Número</label>
          <input value={form2.docNumero}
            onChange={e => onForm2Change({ docNumero: e.target.value.toUpperCase() })}
            placeholder="Número do documento"
            className="w-full bg-white border-2 border-gray-100 rounded-[15px] py-3 px-4 font-black text-blue-900 uppercase outline-none text-sm tracking-widest focus:border-blue-900 transition-all" />
        </div>

        <div>
          <label className={LABEL}><Calendar className="w-3 h-3" /> Validade</label>
          <input type="text" inputMode="numeric" value={form2.docValidade}
            onChange={e => onForm2Change({ docValidade: applyDateMask(e.target.value) })}
            placeholder="dd/mm/aaaa" maxLength={10}
            className="w-full bg-white border-2 border-gray-100 rounded-[15px] py-3 px-4 font-bold text-blue-900 outline-none text-sm focus:border-blue-900 transition-all" />
        </div>

        <div className="space-y-3">
          <DocUploadSlot label="Frente" sublabel="Lado com foto e nome" required
            file={docIdFrontFile} preview={docIdFrontPrev}
            onSelect={onDocIdFront} onClear={onDocIdFrontClear} />
          {docIdInfo.hasBack && (
            <DocUploadSlot label="Verso" sublabel="Código de barras ou dados adicionais" required
              file={docIdBackFile} preview={docIdBackPrev}
              onSelect={onDocIdBack} onClear={onDocIdBackClear} />
          )}
        </div>
      </div>

      {/* ── Carta de Habilitação Náutica ── */}
      <div className="bg-gray-50 border-2 border-gray-100 rounded-[22px] p-5 space-y-4">
        <p className="text-[11px] font-black text-blue-900 uppercase tracking-widest border-b-2 border-gray-100 pb-3">
          ⚓ Carta de Habilitação Náutica
        </p>

        <div>
          <label className={LABEL}><CreditCard className="w-3 h-3" /> Tipo de Habilitação</label>
          <div className="w-full bg-gray-50 border-2 border-blue-900 rounded-[15px] py-3 px-4 font-black text-blue-900 text-sm flex items-center gap-2">
            <span>⚓</span> Habilitação Náutica
          </div>
        </div>

        <div>
          <label className={LABEL}><Hash className="w-3 h-3" /> Nº da Habilitação</label>
          <input value={form2.cartaNumero}
            onChange={e => onForm2Change({ cartaNumero: e.target.value.toUpperCase() })}
            placeholder="Número da carta de habilitação"
            className="w-full bg-white border-2 border-gray-100 rounded-[15px] py-3 px-4 font-black text-blue-900 uppercase outline-none text-sm focus:border-blue-900 transition-all" />
        </div>

        <div>
          <label className={LABEL}><Calendar className="w-3 h-3" /> Validade</label>
          <input type="text" inputMode="numeric" value={form2.cartaValidade}
            onChange={e => onForm2Change({ cartaValidade: applyDateMask(e.target.value) })}
            placeholder="dd/mm/aaaa" maxLength={10}
            className="w-full bg-white border-2 border-gray-100 rounded-[15px] py-3 px-4 font-bold text-blue-900 outline-none text-sm focus:border-blue-900 transition-all" />
        </div>

        <div className="space-y-3">
          <DocUploadSlot label="Frente da Carta" sublabel="Lado principal" required={false}
            file={cartaFrontFile} preview={cartaFrontPrev}
            onSelect={onCartaFront} onClear={onCartaFrontClear} />
          {cartaInfo.hasBack && (
            <DocUploadSlot label="Verso da Carta" required={false}
              file={cartaBackFile} preview={cartaBackPrev}
              onSelect={onCartaBack} onClear={onCartaBackClear} />
          )}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onBack}
          className="px-6 py-5 border-2 border-gray-100 text-gray-400 rounded-[30px] font-black text-sm uppercase hover:border-blue-900 hover:text-blue-900 transition-all">
          ← Voltar
        </button>
        <button type="button" onClick={onNext}
          className="flex-1 bg-blue-900 text-white py-5 rounded-[30px] font-black uppercase tracking-widest text-sm hover:bg-blue-800 shadow-xl transition-all">
          Próximo → Certificados STCW
        </button>
      </div>
    </div>
  );
}