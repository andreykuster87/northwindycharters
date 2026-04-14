// src/components/sailor/steps/Step1DadosPessoais.tsx
import { User, Mail, Languages, ChevronDown, MapPin, Hash, Calendar } from 'lucide-react';
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
    username:        string;
    cpfNif:          string;
    funcao:          string | string[];
    funcaoOutro:     string;
    cadernetaNumero: string;
  };
  birthDay:  string;
  birthMonth: string;
  birthYear:  string;
  cadernetaValidade: string;
  // Endereço estruturado
  addressCountry:     Country;
  addressState:       string;
  addressCity:        string;
  addressZip:         string;
  addressRua:         string;
  addressNumero:      string;
  addressComplemento: string;
  // Caderneta
  cadernetaFile: File | null;
  cadernetaPrev: string | null;
  cadernetaBackFile: File | null;
  cadernetaBackPrev: string | null;
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
  // Endereço handlers
  onAddressCountryChange:     (c: Country) => void;
  onAddressStateChange:       (v: string) => void;
  onAddressCityChange:        (v: string) => void;
  onAddressZipChange:         (v: string) => void;
  onAddressRuaChange:         (v: string) => void;
  onAddressNumeroChange:      (v: string) => void;
  onAddressComplementoChange: (v: string) => void;
  onCadernetaSelect:        (f: File, p: string | null) => void;
  onCadernetaClear:         () => void;
  onCadernetaBackSelect:    (f: File, p: string | null) => void;
  onCadernetaBackClear:     () => void;
  onComprovanteSelect:  (f: File, p: string | null) => void;
  onComprovanteClear:   () => void;
  onNext: () => void;
}

const INPUT = 'w-full bg-gray-50 border border-gray-200 py-3.5 px-4 font-medium text-[#1a2b4a] focus:border-[#c9a96e] outline-none transition-all text-sm';
const LABEL = 'text-[10px] font-semibold text-[#1a2b4a] uppercase tracking-[0.12em] ml-1 mb-1.5 flex items-center gap-1.5';

export function Step1DadosPessoais({
  country, phoneCountry, phoneRaw, form1,
  birthDay, birthMonth, birthYear,
  cadernetaValidade, cadernetaFile, cadernetaPrev, cadernetaBackFile, cadernetaBackPrev,
  comprovanteFile, comprovantePrev,
  addressCountry, addressState, addressCity, addressZip,
  addressRua, addressNumero, addressComplemento,
  onCountryChange, onPhoneCountryChange, onPhoneRawChange,
  onForm1Change, onBirthDayChange, onBirthMonthChange, onBirthYearChange,
  onCadernetaValidadeChange, onCadernetaSelect, onCadernetaClear, onCadernetaBackSelect, onCadernetaBackClear,
  onComprovanteSelect, onComprovanteClear,
  onAddressCountryChange, onAddressStateChange, onAddressCityChange,
  onAddressZipChange, onAddressRuaChange, onAddressNumeroChange, onAddressComplementoChange,
  onNext,
}: Props) {
  const phoneDisplay = applyMask(phoneRaw, phoneCountry.mask);

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">

      {/* ── Identificação ── */}
      <div className="bg-gray-50 border border-gray-100 p-5 space-y-4">
        <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em] border-b border-gray-100 pb-3">
          👤 Identificação
        </p>

        <div>
          <label className={LABEL}><User className="w-3 h-3 text-[#c9a96e]" /> Nome Completo *</label>
          <input value={form1.nomeCompleto}
            onChange={e => onForm1Change({ nomeCompleto: e.target.value })}
            placeholder="Como aparece no documento"
            className={INPUT + ' uppercase italic'} />
        </div>

        <div>
          <label className={LABEL}>
            <Hash className="w-3 h-3 text-[#c9a96e]" /> @ na plataforma * <span className="text-gray-400 normal-case font-medium ml-1">como será chamado(a)</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#c9a96e] font-medium text-sm select-none">@</span>
            <input value={form1.username}
              onChange={e => onForm1Change({ username: e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, '').slice(0, 20) })}
              placeholder="seu_usuario"
              className={INPUT + ' pl-8'} />
          </div>
          {form1.username && (
            <p className="text-[10px] font-medium text-[#c9a96e] ml-1 mt-1">@{form1.username}</p>
          )}
          <p className="text-[10px] font-medium text-gray-400 ml-1 mt-0.5">3–20 caracteres · apenas letras, números, _ e .</p>
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
      <div className="bg-gray-50 border border-gray-100 p-5 space-y-4">
        <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em] border-b border-gray-100 pb-3">
          🪪 Documento Fiscal
        </p>
        <div>
          <label className={LABEL}><Hash className="w-3 h-3 text-[#c9a96e]" /> CPF / Nº Fiscal / NIF</label>
          <input value={form1.cpfNif}
            onChange={e => onForm1Change({ cpfNif: e.target.value })}
            placeholder="Ex: 000.000.000-00 ou PT123456789"
            className={INPUT} />
        </div>
      </div>

      {/* ── Caderneta Marítima ── */}
      <div className="bg-gray-50 border border-gray-100 p-5 space-y-4">
        <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em] border-b border-gray-100 pb-3">
          ⚓ Caderneta Marítima (CIR / Seafarer's Book)
        </p>
        <div>
          <label className={LABEL}><Hash className="w-3 h-3 text-[#c9a96e]" /> Nº da Caderneta</label>
          <input value={form1.cadernetaNumero}
            onChange={e => onForm1Change({ cadernetaNumero: e.target.value.toUpperCase() })}
            placeholder="Ex: BR-12345-6"
            className={INPUT + ' uppercase tracking-widest'} />
        </div>
        <div>
          <label className={LABEL}><Calendar className="w-3 h-3 text-[#c9a96e]" /> Validade da Caderneta *</label>
          <input type="text" inputMode="numeric" value={cadernetaValidade}
            onChange={e => onCadernetaValidadeChange(applyDateMask(e.target.value))}
            placeholder="dd/mm/aaaa" maxLength={10}
            className={INPUT} />
        </div>
        <div className="space-y-3">
          <DocUploadSlot
            label="Frente da Caderneta *"
            sublabel="Página com foto e dados de identificação"
            required={true}
            file={cadernetaFile}
            preview={cadernetaPrev}
            onSelect={onCadernetaSelect}
            onClear={onCadernetaClear}
          />
          <DocUploadSlot
            label="Verso da Caderneta"
            sublabel="Para cartões com QR Code"
            required={false}
            file={cadernetaBackFile}
            preview={cadernetaBackPrev}
            onSelect={onCadernetaBackSelect}
            onClear={onCadernetaBackClear}
          />
        </div>
      </div>

      {/* ── Contacto ── */}
      <div className="bg-gray-50 border border-gray-100 p-5 space-y-4">
        <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em] border-b border-gray-100 pb-3">
          📞 Contacto
        </p>

        <div>
          <label className={LABEL}>WhatsApp *</label>
          <div className="flex items-center gap-3 bg-white border border-gray-200 py-3.5 px-4 focus-within:border-[#c9a96e] transition-all">
            <PhonePrefixDropdown value={phoneCountry.code}
              onChange={c => { onPhoneCountryChange(c); onPhoneRawChange(''); }} />
            <div className="w-px h-5 bg-gray-200 flex-shrink-0" />
            <span className="text-lg flex-shrink-0">💬</span>
            <input value={phoneDisplay}
              onChange={e => onPhoneRawChange(e.target.value.replace(/\D/g, ''))}
              placeholder={phoneCountry.mask.replace(/#/g, '0')}
              className="w-full font-medium outline-none bg-transparent text-sm text-[#1a2b4a]" />
          </div>
        </div>

        <div>
          <label className={LABEL}><Mail className="w-3 h-3 text-[#c9a96e]" /> E-mail *</label>
          <div className="flex items-center gap-3 bg-white border border-gray-200 py-3.5 px-4 focus-within:border-[#c9a96e] transition-all">
            <Mail className="w-4 h-4 text-[#c9a96e] flex-shrink-0" />
            <input type="email" value={form1.email}
              onChange={e => onForm1Change({ email: e.target.value })}
              placeholder="email@profissional.com"
              className="w-full font-medium outline-none bg-transparent text-sm text-[#1a2b4a]" />
          </div>
        </div>
      </div>

      {/* ── Endereço Completo ── */}
      <div className="bg-gray-50 border border-gray-100 p-5 space-y-4">
        <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em] border-b border-gray-100 pb-3">
          <MapPin className="inline w-3.5 h-3.5 mr-1" />📍 Endereço Completo
        </p>

        <CountryDropdown
          value={addressCountry.code}
          onChange={onAddressCountryChange}
          label="País *" />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={LABEL}>Estado / Região *</label>
            <input value={addressState}
              onChange={e => onAddressStateChange(e.target.value)}
              placeholder="Ex: São Paulo"
              className={INPUT} />
          </div>
          <div>
            <label className={LABEL}>Cidade *</label>
            <input value={addressCity}
              onChange={e => onAddressCityChange(e.target.value)}
              placeholder="Ex: Santos"
              className={INPUT} />
          </div>
        </div>

        <div>
          <label className={LABEL}>CEP / Código Postal *</label>
          <input value={addressZip}
            onChange={e => onAddressZipChange(e.target.value)}
            placeholder="Ex: 00000-000"
            className={INPUT} />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <label className={LABEL}>Rua / Avenida *</label>
            <input value={addressRua}
              onChange={e => onAddressRuaChange(e.target.value)}
              placeholder="Nome da rua"
              className={INPUT} />
          </div>
          <div>
            <label className={LABEL}>Nº *</label>
            <input value={addressNumero}
              onChange={e => onAddressNumeroChange(e.target.value)}
              placeholder="Ex: 42"
              className={INPUT} />
          </div>
        </div>

        <div>
          <label className={LABEL}>Complemento</label>
          <input value={addressComplemento}
            onChange={e => onAddressComplementoChange(e.target.value)}
            placeholder="Apto, Bloco, etc. (opcional)"
            className={INPUT} />
        </div>

        <DocUploadSlot
          label="Comprovante de Endereço *"
          sublabel="Conta de água, luz, telefone, extrato bancário ou atestado de morada"
          required={true}
          file={comprovanteFile}
          preview={comprovantePrev}
          onSelect={onComprovanteSelect}
          onClear={onComprovanteClear}
        />
        <p className="text-[10px] text-gray-400 font-medium -mt-2 ml-1">
          Aceites: conta de água, luz, telefone, extrato bancário ou atestado de morada
        </p>
      </div>

      {/* ── Função Pretendida ── */}
      <div className="bg-gray-50 border border-gray-100 p-5 space-y-3">
        <div className="border-b border-gray-100 pb-3">
          <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em]">⚓ Função Pretendida *</p>
          <p className="text-[10px] font-medium text-gray-400 mt-0.5">Pode selecionar mais de uma função</p>
        </div>
        <div className="space-y-2">
          {(FUNCOES_MARITIMAS as readonly string[]).map(f => {
            const selected = Array.isArray(form1.funcao) ? form1.funcao : (form1.funcao ? [form1.funcao] : []);
            const checked  = selected.includes(f);
            return (
              <label key={f}
                className={`flex items-center gap-3 p-3.5 border cursor-pointer transition-all
                  ${checked ? 'bg-[#0a1628] border-[#0a1628]' : 'bg-white border-gray-100 hover:border-[#c9a96e]/30'}`}>
                <div className={`w-5 h-5 border-2 flex items-center justify-center flex-shrink-0 transition-all
                  ${checked ? 'border-white bg-white/20' : 'border-gray-200'}`}>
                  {checked && <span className="text-white font-semibold text-[11px] leading-none">✓</span>}
                </div>
                <span className={`font-medium text-sm ${checked ? 'text-white' : 'text-[#1a2b4a]'}`}>{f}</span>
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
      <div className="bg-gray-50 border border-gray-100 p-5 space-y-4">
        <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em] border-b border-gray-100 pb-3">
          🌐 Preferências
        </p>
        <div>
          <label className={LABEL}><Languages className="w-3 h-3 text-[#c9a96e]" /> Idioma Preferido</label>
          <div className="relative">
            <select value={form1.idioma}
              onChange={e => onForm1Change({ idioma: e.target.value })}
              className="w-full bg-white border border-gray-200 py-3.5 px-4 font-medium text-[#1a2b4a] outline-none appearance-none focus:border-[#c9a96e] transition-all text-sm cursor-pointer">
              {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <button type="button" onClick={onNext}
        className="w-full bg-[#0a1628] text-white py-4 font-semibold uppercase tracking-widest text-sm hover:bg-[#1a2b4a] transition-all">
        Próximo → Documentos
      </button>
    </div>
  );
}
