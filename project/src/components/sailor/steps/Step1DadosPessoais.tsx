// src/components/sailor/steps/Step1DadosPessoais.tsx
import { User, Mail, Clock, Languages, ChevronDown, MapPin, Hash, Calendar } from 'lucide-react';
import { LANGUAGES, FUNCOES_MARITIMAS, type Country } from '../../../constants/sailorConstants';
import { CountryDropdown, PhonePrefixDropdown, DocUploadSlot } from '../SailorSharedComponents';
import { BirthDatePicker } from '../../shared/BirthDatePicker';
import { applyMask, applyDateMask } from '../../../utils/sailorHelpers';

interface Props {
  country:      Country;
  phoneCountry: Country;
  phoneRaw:     string;
  form1: {
    nomeCompleto:    string;
    email:           string;
    idioma:          string;
    cpfNif:          string;
    endereco:        string;
    funcao:          string | string[];
    funcaoOutro:     string;
    cadernetaNumero: string;
  };
  birthDay:  string;
  birthMonth: string;
  birthYear:  string;
  cadernetaValidade: string;
  // Caderneta
  cadernetaFile: File | null;
  cadernetaPrev: string | null;
  // Comprovante de endereço
  comprovanteFile: File | null;
  comprovantePrev: string | null;
  onCountryChange:      (c: Country) => void;
  onPhoneCountryChange: (c: Country) => void;
  onPhoneRawChange:     (v: string) => void;
  onForm1Change:        (patch: Partial<Props['form1']>) => void;
  onBirthDayChange:     (v: string) => void;
  onBirthMonthChange:   (v: string) => void;
  onBirthYearChange:    (v: string) => void;
  onCadernetaValidadeChange: (v: string) => void;
  onCadernetaSelect:    (f: File, p: string | null) => void;
  onCadernetaClear:     () => void;
  onComprovanteSelect:  (f: File, p: string | null) => void;
  onComprovanteClear:   () => void;
  onNext: () => void;
}

const INPUT = 'w-full bg-gray-50 border-2 border-gray-100 rounded-[18px] py-3.5 px-5 font-bold text-blue-900 focus:border-blue-900 outline-none transition-all text-sm';
const LABEL = 'text-[10px] font-black text-blue-900 uppercase tracking-wider ml-1 mb-1.5 flex items-center gap-1.5';

export function Step1DadosPessoais({
  country, phoneCountry, phoneRaw, form1,
  birthDay, birthMonth, birthYear,
  cadernetaValidade, cadernetaFile, cadernetaPrev,
  comprovanteFile, comprovantePrev,
  onCountryChange, onPhoneCountryChange, onPhoneRawChange,
  onForm1Change, onBirthDayChange, onBirthMonthChange, onBirthYearChange,
  onCadernetaValidadeChange, onCadernetaSelect, onCadernetaClear,
  onComprovanteSelect, onComprovanteClear,
  onNext,
}: Props) {
  const phoneDisplay = applyMask(phoneRaw, phoneCountry.mask);

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">

      {/* ── Identificação ── */}
      <div className="bg-gray-50 border-2 border-gray-100 rounded-[22px] p-5 space-y-4">
        <p className="text-[11px] font-black text-blue-900 uppercase tracking-widest border-b-2 border-gray-100 pb-3">
          👤 Identificação
        </p>

        <div>
          <label className={LABEL}><User className="w-3 h-3" /> Nome Completo *</label>
          <input value={form1.nomeCompleto}
            onChange={e => onForm1Change({ nomeCompleto: e.target.value })}
            placeholder="Como aparece no documento"
            className={INPUT + ' uppercase italic'} />
        </div>

        <BirthDatePicker
          day={birthDay} month={birthMonth} year={birthYear}
          onDay={onBirthDayChange} onMonth={onBirthMonthChange} onYear={onBirthYearChange}
        />

        <CountryDropdown value={country.code}
          onChange={c => { onCountryChange(c); onPhoneCountryChange(c); onPhoneRawChange(''); }}
          label="Nacionalidade" />
      </div>

      {/* ── Documento Fiscal ── */}
      <div className="bg-gray-50 border-2 border-gray-100 rounded-[22px] p-5 space-y-4">
        <p className="text-[11px] font-black text-blue-900 uppercase tracking-widest border-b-2 border-gray-100 pb-3">
          🪪 Documento Fiscal
        </p>
        <div>
          <label className={LABEL}><Hash className="w-3 h-3" /> CPF / Nº Fiscal / NIF</label>
          <input value={form1.cpfNif}
            onChange={e => onForm1Change({ cpfNif: e.target.value })}
            placeholder="Ex: 000.000.000-00 ou PT123456789"
            className={INPUT} />
        </div>
      </div>

      {/* ── Caderneta Marítima ── */}
      <div className="bg-gray-50 border-2 border-gray-100 rounded-[22px] p-5 space-y-4">
        <p className="text-[11px] font-black text-blue-900 uppercase tracking-widest border-b-2 border-gray-100 pb-3">
          ⚓ Caderneta Marítima (CIR / Seafarer's Book)
        </p>
        <div>
          <label className={LABEL}><Hash className="w-3 h-3" /> Nº da Caderneta</label>
          <input value={form1.cadernetaNumero}
            onChange={e => onForm1Change({ cadernetaNumero: e.target.value.toUpperCase() })}
            placeholder="Ex: BR-12345-6"
            className={INPUT + ' uppercase tracking-widest'} />
        </div>
        <div>
          <label className={LABEL}><Calendar className="w-3 h-3" /> Validade da Caderneta *</label>
          <input type="text" inputMode="numeric" value={cadernetaValidade}
            onChange={e => onCadernetaValidadeChange(applyDateMask(e.target.value))}
            placeholder="dd/mm/aaaa" maxLength={10}
            className={INPUT} />
        </div>
        <DocUploadSlot
          label="Foto / Digitalização da Caderneta"
          sublabel="Frente ou página de identificação"
          required={false}
          file={cadernetaFile}
          preview={cadernetaPrev}
          onSelect={onCadernetaSelect}
          onClear={onCadernetaClear}
        />
      </div>

      {/* ── Contacto ── */}
      <div className="bg-gray-50 border-2 border-gray-100 rounded-[22px] p-5 space-y-4">
        <p className="text-[11px] font-black text-blue-900 uppercase tracking-widest border-b-2 border-gray-100 pb-3">
          📞 Contacto
        </p>

        <div>
          <label className={LABEL}>WhatsApp *</label>
          <div className="flex items-center gap-3 bg-white border-2 border-gray-100 rounded-[18px] py-3.5 px-5 focus-within:border-blue-900 transition-all">
            <PhonePrefixDropdown value={phoneCountry.code}
              onChange={c => { onPhoneCountryChange(c); onPhoneRawChange(''); }} />
            <div className="w-px h-5 bg-gray-200 flex-shrink-0" />
            <span className="text-lg flex-shrink-0">💬</span>
            <input value={phoneDisplay}
              onChange={e => onPhoneRawChange(e.target.value.replace(/\D/g, ''))}
              placeholder={phoneCountry.mask.replace(/#/g, '0')}
              className="w-full font-bold outline-none bg-transparent text-sm text-blue-900" />
          </div>
        </div>

        <div>
          <label className={LABEL}><Mail className="w-3 h-3" /> E-mail *</label>
          <div className="flex items-center gap-3 bg-white border-2 border-gray-100 rounded-[18px] py-3.5 px-5 focus-within:border-blue-900 transition-all">
            <Mail className="w-4 h-4 text-blue-400 flex-shrink-0" />
            <input type="email" value={form1.email}
              onChange={e => onForm1Change({ email: e.target.value })}
              placeholder="email@profissional.com"
              className="w-full font-bold outline-none bg-transparent text-sm text-blue-900" />
          </div>
        </div>

        <div>
          <label className={LABEL}><MapPin className="w-3 h-3" /> Endereço completo conforme comprovante</label>
          <input value={form1.endereco}
            onChange={e => onForm1Change({ endereco: e.target.value })}
            placeholder="Rua, nº, cidade, país"
            className={INPUT} />
          <p className="text-[10px] text-gray-400 font-bold mt-1.5 ml-1">
            Aceites: conta de água, luz, telefone, extrato bancário ou atestado de morada
          </p>
        </div>
        <DocUploadSlot
          label="Comprovante de Endereço"
          sublabel="Conta de água, luz, telefone, extrato bancário ou atestado de morada"
          required={false}
          file={comprovanteFile}
          preview={comprovantePrev}
          onSelect={onComprovanteSelect}
          onClear={onComprovanteClear}
        />
      </div>

      {/* ── Função Pretendida ── */}
      <div className="bg-gray-50 border-2 border-gray-100 rounded-[22px] p-5 space-y-3">
        <div className="border-b-2 border-gray-100 pb-3">
          <p className="text-[11px] font-black text-blue-900 uppercase tracking-widest">⚓ Função Pretendida *</p>
          <p className="text-[10px] font-bold text-gray-400 mt-0.5">Pode selecionar mais de uma função</p>
        </div>
        <div className="space-y-2">
          {(FUNCOES_MARITIMAS as readonly string[]).map(f => {
            const selected = Array.isArray(form1.funcao) ? form1.funcao : (form1.funcao ? [form1.funcao] : []);
            const checked  = selected.includes(f);
            return (
              <label key={f}
                className={`flex items-center gap-3 p-3.5 rounded-[16px] border-2 cursor-pointer transition-all
                  ${checked ? 'bg-blue-900 border-blue-900' : 'bg-white border-gray-100 hover:border-blue-200'}`}>
                <div className={`w-5 h-5 rounded-[6px] border-2 flex items-center justify-center flex-shrink-0 transition-all
                  ${checked ? 'border-white bg-white/20' : 'border-gray-200'}`}>
                  {checked && <span className="text-white font-black text-[11px] leading-none">✓</span>}
                </div>
                <span className={`font-bold text-sm ${checked ? 'text-white' : 'text-blue-900'}`}>{f}</span>
                <input type="checkbox" value={f} checked={checked} className="hidden"
                  onChange={() => {
                    const prev = Array.isArray(form1.funcao) ? form1.funcao : (form1.funcao ? [form1.funcao] : []);
                    const next = prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f];
                    onForm1Change({ funcao: next, funcaoOutro: next.includes('Outro') ? form1.funcaoOutro : '' });
                  }} />
              </label>
            );
          })}
        </div>
        {(Array.isArray(form1.funcao) ? form1.funcao : [String(form1.funcao)]).includes('Outro') && (
          <input value={form1.funcaoOutro}
            onChange={e => onForm1Change({ funcaoOutro: e.target.value })}
            placeholder="Especifique a função"
            className={INPUT + ' mt-2'} />
        )}
      </div>

      {/* ── Preferências ── */}
      <div className="bg-gray-50 border-2 border-gray-100 rounded-[22px] p-5 space-y-4">
        <p className="text-[11px] font-black text-blue-900 uppercase tracking-widest border-b-2 border-gray-100 pb-3">
          🌐 Preferências
        </p>
        <div>
          <label className={LABEL}><Clock className="w-3 h-3" /> Fuso Horário (automático)</label>
          <div className="flex items-center gap-3 bg-white border-2 border-gray-100 rounded-[18px] py-3.5 px-5">
            <Clock className="w-4 h-4 text-blue-300 flex-shrink-0" />
            <span className="font-bold text-blue-900 text-sm">{country.tz}</span>
          </div>
        </div>
        <div>
          <label className={LABEL}><Languages className="w-3 h-3" /> Idioma Preferido</label>
          <div className="relative">
            <select value={form1.idioma}
              onChange={e => onForm1Change({ idioma: e.target.value })}
              className="w-full bg-white border-2 border-gray-100 rounded-[18px] py-3.5 px-5 font-bold text-blue-900 outline-none appearance-none focus:border-blue-900 transition-all text-sm cursor-pointer">
              {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <button type="button" onClick={onNext}
        className="w-full bg-blue-900 text-white py-5 rounded-[30px] font-black uppercase tracking-widest text-sm hover:bg-blue-800 shadow-xl transition-all">
        Próximo → Documentos
      </button>
    </div>
  );
}