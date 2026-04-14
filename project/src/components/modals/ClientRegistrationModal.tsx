// src/components/modals/ClientRegistrationModal.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Modal de registo de cliente — 2 steps.
// Widgets extraídos para src/components/client/ClientRegWidgets.tsx
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useRef } from 'react';
import { X, User, Hash, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import { saveClient, checkDuplicates, DOC_TYPES, formatProfileNumber } from '../../lib/localStore';
import type { DocTypeValue } from '../../lib/localStore';
import { uploadDoc } from '../../lib/storage';

import {
  COUNTRIES, type Country,
  applyMask,
  BirthDatePicker,
  CountryDropdown,
  PhonePrefixDropdown,
  DocTypeDropdown,
  DocUploadSlot,
} from '../client/ClientRegWidgets';

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  onClose:   () => void;
  onSuccess: (client: any) => void;
}

// ── Componente ────────────────────────────────────────────────────────────────

export function ClientRegistrationModal({ onClose, onSuccess }: Props) {
  const [step,    setStep]    = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const topRef                = useRef<HTMLDivElement>(null);

  // Step 1
  const [country,      setCountry]      = useState<Country>(COUNTRIES[0]);
  const [phoneCountry, setPhoneCountry] = useState<Country>(COUNTRIES[0]);
  const [phoneRaw,     setPhoneRaw]     = useState('');
  const [birthDay,     setBirthDay]     = useState('');
  const [birthMonth,   setBirthMonth]   = useState('');
  const [birthYear,    setBirthYear]    = useState('');
  const [form, setForm] = useState({
    nomeCompleto: '', email: '', idioma: 'pt-BR', timezone: 'America/Sao_Paulo',
    documento: '', docEmissao: '', docValidade: '', username: '',
  });

  // Step 2
  const [docType,      setDocType]      = useState<DocTypeValue>('passport');
  const [frontFile,    setFrontFile]    = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backFile,     setBackFile]     = useState<File | null>(null);
  const [backPreview,  setBackPreview]  = useState<string | null>(null);

  const phoneDisplay = applyMask(phoneRaw, phoneCountry.mask);
  const selectedDoc  = DOC_TYPES.find(d => d.value === docType) || DOC_TYPES[0];
  const docHasBack   = selectedDoc.hasBack;
  const fullPhone    = `${phoneCountry.ddi} ${phoneDisplay}`;

  const f       = (field: string, val: string) => setForm(p => ({ ...p, [field]: val }));
  const showErr = (msg: string) => {
    setError(msg);
    setTimeout(() => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  // ── Validação step 1 ─────────────────────────────────────────────────────
  const handleNext = async () => {
    if (!form.nomeCompleto.trim())                    { showErr('Informe seu nome completo.'); return; }
    if (!form.username.trim() || form.username.length < 3) { showErr('Defina um @ com pelo menos 3 caracteres.'); return; }
    if (!form.email.trim() || !form.email.includes('@')) { showErr('Informe um e-mail válido.'); return; }
    if (!phoneRaw.trim())                             { showErr('Informe seu telefone / WhatsApp.'); return; }
    if (!birthDay || !birthMonth || !birthYear)       { showErr('Informe sua data de nascimento.'); return; }
    const y = parseInt(birthYear, 10);
    if (y < 1900 || y > new Date().getFullYear() - 5) { showErr('Informe um ano de nascimento válido.'); return; }
    const dup = await checkDuplicates({ email: form.email });
    if (dup) { showErr(dup.message); return; }
    setError(null);
    setStep(2);
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.documento.trim())       { showErr('Informe o número do documento.'); return; }
    if (!form.docValidade)            { showErr('Informe a data de validade.'); return; }
    if (!frontFile)                   { showErr('Envie a frente do documento para verificação.'); return; }
    if (docHasBack && !backFile)      { showErr('Envie o verso do documento para verificação.'); return; }

    const dup = await checkDuplicates({ docNumero: form.documento });
    if (dup) { showErr(dup.message); return; }

    setLoading(true);
    try {
      const doc_url      = await uploadDoc(frontFile, 'clients', 'doc-front');
      const doc_back_url = await uploadDoc(backFile, 'clients', 'doc-back');

      const client = await saveClient({
        username:         form.username || undefined,
        name:             form.nomeCompleto,
        email:            form.email,
        phone:            fullPhone,
        country_code:     country.code,
        country_name:     country.name,
        timezone:         form.timezone || country.tz,
        language:         form.idioma,
        birth_date:       `${birthDay.padStart(2,'0')}/${birthMonth.padStart(2,'0')}/${birthYear}`,
        doc_type:         docType,
        passport_number:  form.documento,
        passport_issued:  form.docEmissao || null,
        passport_expires: form.docValidade,
        doc_url,
        doc_back_url,
      });

      onSuccess(client);
    } catch (err: any) {
      if (err.message === 'DUPLICATE_EMAIL')         { showErr('Este e-mail já está cadastrado.'); setStep(1); }
      else if (err.message === 'DUPLICATE_DOCUMENT') { showErr('Este número de documento já está cadastrado.'); }
      else { showErr('Erro ao salvar. Tente novamente.'); }
    } finally {
      setLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4" style={{ background: 'rgba(4,10,24,0.88)', backdropFilter: 'blur(8px)' }}>
      <div className="bg-white w-full max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-300">

        {/* Header */}
        <div className="sticky top-0 bg-[#0a1628] px-8 py-6 flex justify-between items-center z-10 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: 'repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 0,transparent 60px),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 0,transparent 60px)' }} />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a96e]/40 to-transparent" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              {[1, 2].map(s => (
                <div key={s} className="flex items-center gap-2">
                  {s > 1 && <div className={`h-px w-8 transition-all ${step >= s ? 'bg-[#c9a96e]' : 'bg-white/20'}`} />}
                  <div className={`w-7 h-7 flex items-center justify-center text-xs font-semibold transition-all
                    ${step >= s ? 'bg-[#c9a96e] text-[#0a1628]' : 'bg-white/10 text-white/40 border border-white/20'}`}>
                    {s}
                  </div>
                </div>
              ))}
            </div>
            <h2 className="font-['Playfair_Display'] font-bold italic text-xl text-white">
              {step === 1 ? 'Dados Pessoais' : 'Documentação'}
            </h2>
            <p className="text-[#c9a96e]/70 text-[10px] font-semibold uppercase tracking-[0.15em] mt-0.5">
              {step === 1 ? 'Identificação e contato' : 'Documento e verificação'}
            </p>
          </div>
          <button onClick={onClose} className="relative bg-white/5 hover:bg-white/10 text-white p-2.5 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 space-y-5">
          <div ref={topRef} />

          {error && (
            <div className="bg-red-50 border border-red-200 px-5 py-3 flex items-center gap-3 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-red-700 font-medium text-sm">{error}</p>
            </div>
          )}

          {/* ── Step 1: Dados Pessoais ── */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <label className="text-[10px] font-semibold text-[#1a2b4a] uppercase tracking-wider ml-1 mb-1.5 flex items-center gap-1.5">
                  <User className="w-3 h-3 text-[#c9a96e]" /> Nome Completo *
                </label>
                <input value={form.nomeCompleto} onChange={e => f('nomeCompleto', e.target.value)}
                  placeholder="Seu nome completo"
                  className="w-full bg-gray-50 border border-gray-200 py-4 px-5 font-medium text-[#1a2b4a] focus:border-[#c9a96e] outline-none transition-all text-sm placeholder:text-gray-300" />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-[#1a2b4a] uppercase tracking-wider ml-1 mb-1.5 flex items-center gap-1.5">
                  <Hash className="w-3 h-3 text-[#c9a96e]" /> @ na plataforma * <span className="text-gray-400 normal-case font-medium">como será chamado(a)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[#c9a96e] font-semibold text-sm select-none">@</span>
                  <input value={form.username}
                    onChange={e => f('username', e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, '').slice(0, 20))}
                    placeholder="seu_usuario"
                    className="w-full bg-gray-50 border border-gray-200 py-4 pl-9 pr-5 font-medium text-[#1a2b4a] focus:border-[#c9a96e] outline-none transition-all text-sm placeholder:text-gray-300" />
                </div>
                {form.username && (
                  <p className="text-[10px] font-semibold text-[#c9a96e] ml-1 mt-1">@{form.username}</p>
                )}
                <p className="text-[10px] font-medium text-gray-400 ml-1 mt-0.5">3–20 caracteres · apenas letras, números, _ e .</p>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-[#1a2b4a] uppercase tracking-wider ml-1 mb-1.5 block">E-mail *</label>
                <input type="email" value={form.email} onChange={e => f('email', e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full bg-gray-50 border border-gray-200 py-4 px-5 font-medium text-[#1a2b4a] focus:border-[#c9a96e] outline-none transition-all text-sm placeholder:text-gray-300" />
              </div>

              <CountryDropdown value={country.code} label="País de Origem *"
                onChange={c => setCountry(c)} />

              <div>
                <label className="text-[10px] font-semibold text-[#1a2b4a] uppercase tracking-wider ml-1 mb-1.5 block">WhatsApp *</label>
                <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 py-4 px-5 focus-within:border-[#c9a96e] transition-all">
                  <PhonePrefixDropdown value={phoneCountry.code}
                    onChange={c => { setPhoneCountry(c); setPhoneRaw(''); }} />
                  <div className="w-px h-5 bg-gray-200 flex-shrink-0" />
                  <span className="text-lg flex-shrink-0">💬</span>
                  <input value={phoneDisplay}
                    onChange={e => setPhoneRaw(e.target.value.replace(/\D/g, ''))}
                    placeholder={phoneCountry.mask.replace(/#/g, '0')}
                    className="w-full font-medium outline-none bg-transparent text-sm text-[#1a2b4a] placeholder:text-gray-300" />
                </div>
              </div>

              <BirthDatePicker
                day={birthDay} month={birthMonth} year={birthYear}
                onDay={setBirthDay} onMonth={setBirthMonth} onYear={setBirthYear}
              />

              <button type="button" onClick={handleNext}
                className="w-full bg-[#0a1628] text-white py-4 font-semibold uppercase tracking-widest text-sm hover:bg-[#1a2b4a] transition-all mt-2">
                Próximo → Documentação
              </button>
            </div>
          )}

          {/* ── Step 2: Documentação ── */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">

              {/* Preview do perfil */}
              <div className="bg-[#0a1628] p-4 flex items-center gap-4 relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.04]"
                  style={{ backgroundImage: 'repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 0,transparent 60px),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 0,transparent 60px)' }} />
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a96e]/60 to-transparent" />
                <div className="bg-[#c9a96e]/15 border border-[#c9a96e]/30 text-[#c9a96e] w-12 h-12 flex items-center justify-center font-bold text-lg uppercase flex-shrink-0 relative">
                  {form.nomeCompleto.substring(0, 2).toUpperCase()}
                </div>
                <div className="relative">
                  <p className="font-['Playfair_Display'] font-bold text-white">{form.nomeCompleto}</p>
                  <p className="text-xs text-[#c9a96e]/70 font-medium">{form.email} · {country.flag} {country.ddi} {phoneDisplay}</p>
                </div>
              </div>

              <DocTypeDropdown value={docType} onChange={v => {
                setDocType(v);
                const newDoc = DOC_TYPES.find(d => d.value === v);
                if (!newDoc?.hasBack) { setBackFile(null); setBackPreview(null); }
              }} />

              <div>
                <label className="text-[10px] font-semibold text-[#1a2b4a] uppercase tracking-wider ml-1 mb-1.5 flex items-center gap-1.5">
                  <Hash className="w-3 h-3 text-[#c9a96e]" /> Número do Documento *
                </label>
                <input value={form.documento} onChange={e => f('documento', e.target.value.toUpperCase())}
                  placeholder={`Nº ${selectedDoc.label.replace(/[^a-zA-Z\s]/g, '').trim()}`}
                  className="w-full bg-gray-50 border border-gray-200 py-4 px-5 font-medium text-[#1a2b4a] focus:border-[#c9a96e] outline-none transition-all text-sm uppercase tracking-widest placeholder:text-gray-300 placeholder:normal-case placeholder:tracking-normal" />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-[#1a2b4a] uppercase tracking-wider ml-1 mb-1.5 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#c9a96e]" /> Validade *
                </label>
                <input type="text" inputMode="numeric" value={form.docValidade}
                  onChange={e => f('docValidade', applyMask(e.target.value, '##/##/####'))}
                  placeholder="dd/mm/aaaa" maxLength={10}
                  className="w-full bg-gray-50 border border-gray-200 py-4 px-4 font-medium text-[#1a2b4a] focus:border-[#c9a96e] outline-none transition-all text-sm" />
              </div>

              <DocUploadSlot
                label="Frente do Documento"
                sublabel={docHasBack ? 'Lado com foto e nome' : undefined}
                required
                file={frontFile} preview={frontPreview}
                onSelect={(f, p) => { setFrontFile(f); setFrontPreview(p); }}
                onClear={() => { setFrontFile(null); setFrontPreview(null); }}
              />

              {docHasBack && (
                <DocUploadSlot
                  label="Verso do Documento"
                  sublabel="Lado com código de barras ou dados adicionais"
                  required
                  file={backFile} preview={backPreview}
                  onSelect={(f, p) => { setBackFile(f); setBackPreview(p); }}
                  onClear={() => { setBackFile(null); setBackPreview(null); }}
                />
              )}

              <div className="bg-amber-50 border border-amber-200 px-5 py-4 flex items-start gap-3">
                <span className="text-lg flex-shrink-0">⏳</span>
                <div>
                  <p className="font-semibold text-amber-800 text-sm">Verificação pendente</p>
                  <p className="text-xs text-amber-600 font-medium mt-0.5">
                    Após o cadastro, sua conta ficará em análise. Você receberá login e senha via WhatsApp.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setStep(1); setError(null); }}
                  className="px-6 py-4 border border-gray-200 text-gray-400 font-semibold text-sm uppercase tracking-wide hover:border-[#1a2b4a] hover:text-[#1a2b4a] transition-all">
                  ← Voltar
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 bg-[#0a1628] text-white py-4 font-semibold uppercase tracking-widest text-sm hover:bg-[#1a2b4a] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {loading
                    ? <span className="animate-pulse">Enviando...</span>
                    : <><CheckCircle2 className="w-5 h-5 text-[#c9a96e]" /> Criar Minha Conta</>}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}