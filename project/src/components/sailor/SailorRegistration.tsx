// src/components/sailor/SailorRegistration.tsx
import { useState, useRef, useEffect } from 'react';
import { Hash, CheckCircle2 } from 'lucide-react';

import { Step1DadosPessoais } from './steps/Step1DadosPessoais';
import { Step2Documentos }    from './steps/Step2Documentos';
import { Step3STCW }          from './steps/Step3STCW';
import { Step4Medico }        from './steps/Step4Medico';
import { SailorStepper }      from './SailorStepper';
import { TermosModal }        from '../modals/TermosModal';

import { COUNTRIES, STCW_CERTS, type Country } from '../../constants/sailorConstants';
import { saveSailor, checkDuplicates, formatProfileNumber } from '../../lib/localStore';
import { uploadDoc } from '../../lib/storage';
import type { DocTypeValue } from '../../lib/localStore';

type TabN = 1 | 2 | 3 | 4;

interface Form1 {
  nomeCompleto: string; email: string; idioma: string; username: string;
  cpfNif: string; endereco: string; funcao: string[]; funcaoOutro: string; cadernetaNumero: string;
}
interface Form2 {
  docNumero: string; docEmissao: string; docValidade: string;
  cartaNumero: string; cartaEmissao: string; cartaValidade: string;
  caderneta_possui: boolean; caderneta_numero: string;
}
interface Form4 { medicoNumero: string; medicoEmissao: string; medicoValidade: string; }
interface Experiencia { empresa: string; funcao: string; periodo_inicio: string; periodo_fim: string; }

const BLANK_EXP: Experiencia = { empresa: '', funcao: '', periodo_inicio: '', periodo_fim: '' };

// Returns local datetime string for datetime-local input: "YYYY-MM-DDTHH:mm"
function nowDatetimeLocal() {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

export function SailorRegistration({ onClose }: { onClose?: () => void }) {
  const bodyRef = useRef<HTMLDivElement>(null);

  const [tab,      setTab]      = useState<TabN>(1);
  const [doneTabs, setDoneTabs] = useState<Set<number>>(new Set());
  const [error,    setError]    = useState<string | null>(null);
  const [loading,  setLoading]  = useState(false);
  const [submitted,     setSubmitted]     = useState(false);
  const [profileNumber, setProfileNumber] = useState<string | null>(null);
  const [termosOpen,    setTermosOpen]    = useState(false);

  // Step 1
  const [country,      setCountry]      = useState<Country>(COUNTRIES[1]);
  const [phoneCountry, setPhoneCountry] = useState<Country>(COUNTRIES[1]);
  const [phoneRaw,     setPhoneRaw]     = useState('');
  const [form1, setForm1] = useState<Form1>({
    nomeCompleto: '', email: '', idioma: 'pt-PT', username: '',
    cpfNif: '', endereco: '', funcao: [], funcaoOutro: '', cadernetaNumero: '',
  });
  const [birthDay,   setBirthDay]   = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthYear,  setBirthYear]  = useState('');
  // Caderneta upload (step 1)
  const [cadernetaValidade, setCadernetaValidade] = useState('');
  const [cadernetaFile, setCadernetaFile] = useState<File | null>(null);
  const [cadernetaPrev, setCadernetaPrev] = useState<string | null>(null);
  // Comprovante de endereço (step 1)
  const [comprovanteFile, setComprovanteFile] = useState<File | null>(null);
  const [comprovantePrev, setComprovantePrev] = useState<string | null>(null);

  // Step 2
  const [docIdType,      setDocIdType]      = useState<DocTypeValue>('passport');
  const [docIdFrontFile, setDocIdFrontFile] = useState<File | null>(null);
  const [docIdFrontPrev, setDocIdFrontPrev] = useState<string | null>(null);
  const [docIdBackFile,  setDocIdBackFile]  = useState<File | null>(null);
  const [docIdBackPrev,  setDocIdBackPrev]  = useState<string | null>(null);
  const [cartaType]                         = useState<DocTypeValue>('habilitacao_nau');
  const [cartaFrontFile, setCartaFrontFile] = useState<File | null>(null);
  const [cartaFrontPrev, setCartaFrontPrev] = useState<string | null>(null);
  const [cartaBackFile,  setCartaBackFile]  = useState<File | null>(null);
  const [cartaBackPrev,  setCartaBackPrev]  = useState<string | null>(null);
  const [form2, setForm2] = useState<Form2>({
    docNumero: '', docEmissao: '', docValidade: '',
    cartaNumero: '', cartaEmissao: '', cartaValidade: '',
    caderneta_possui: false, caderneta_numero: '',
  });

  // Step 3
  const [stcw, setStcw] = useState<Record<string, boolean>>(
    Object.fromEntries(STCW_CERTS.map(c => [c.id, false]))
  );
  const [stcwValidades, setStcwValidades] = useState<Record<string, string>>({});
  const [experienciaEmbarcado, setExperienciaEmbarcado] = useState<boolean | null>(null);
  const [experiencias, setExperiencias] = useState<Experiencia[]>([{ ...BLANK_EXP }]);
  const [cursosRelevantes, setCursosRelevantes] = useState('');
  const [possuiOffshore, setPossuiOffshore] = useState<boolean | null>(null);
  const [idiomas, setIdiomas] = useState<string[]>([]);
  const [idiomaOutro, setIdiomaOutro] = useState('');
  const [idiomaNivel, setIdiomaNivel] = useState('');

  // Step 4
  const [possuiMedico,  setPossuiMedico]  = useState(true); // default Sim
  const [form4,         setForm4]         = useState<Form4>({ medicoNumero: '', medicoEmissao: '', medicoValidade: '' });
  const [medicoFile,    setMedicoFile]    = useState<File | null>(null);
  const [medicoPreview, setMedicoPreview] = useState<string | null>(null);
  const [disponivelImediato,      setDisponivelImediato]      = useState<boolean | null>(null);
  const [disponivelInternacional, setDisponivelInternacional] = useState<boolean | null>(null);
  const [tempoEmbarque,    setTempoEmbarque]    = useState('');
  const [restricaoMedica,  setRestricaoMedica]  = useState('');
  const [outrasInformacoes, setOutrasInformacoes] = useState('');
  const [declaracaoData,   setDeclaracaoData]   = useState('');
  const [aceitouTermos,    setAceitouTermos]    = useState(false);

  // Auto-fill declaracao date when entering step 4
  useEffect(() => {
    if (tab === 4 && !declaracaoData) {
      setDeclaracaoData(nowDatetimeLocal());
    }
  }, [tab]); // eslint-disable-line

  // Nav helpers
  const scrollTop = () => { try { bodyRef.current?.scrollTo({ top: 0, behavior: 'smooth' }); } catch {} };
  const showErr   = (msg: string) => { setError(msg); scrollTop(); };
  const goTo      = (n: TabN) => { setError(null); setTab(n); setTimeout(scrollTop, 50); };
  const advance   = (from: TabN, to: TabN) => { setDoneTabs(p => new Set([...p, from])); goTo(to); };

  const handleNext1 = async () => {
    if (!form1.nomeCompleto.trim()) { showErr('Preencha o nome completo.'); return; }
    if (!form1.username.trim() || form1.username.length < 3) { showErr('Defina um @ com pelo menos 3 caracteres.'); return; }
    if (!phoneRaw.trim())           { showErr('Preencha o WhatsApp.'); return; }
    if (!form1.email.trim())        { showErr('Preencha o e-mail.'); return; }
    if (!birthDay || !birthMonth || !birthYear) { showErr('Informe a data de nascimento.'); return; }
    const y = parseInt(birthYear, 10);
    if (y < 1900 || y > new Date().getFullYear() - 16) { showErr('Ano inválido (mínimo 16 anos).'); return; }
    if (!form1.funcao.length) { showErr('Selecione pelo menos uma função pretendida.'); return; }
    if (!cadernetaValidade) { showErr('Preencha a validade da caderneta marítima.'); return; }
    const dup = await checkDuplicates({ email: form1.email });
    if (dup) { showErr(dup.message); return; }
    advance(1, 2);
  };

  const handleNext2 = async () => {
    if (form2.docNumero) {
      const dup = await checkDuplicates({ docNumero: form2.docNumero });
      if (dup) { showErr(dup.message); return; }
    }
    advance(2, 3);
  };

  const handleNext3 = () => advance(3, 4);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (possuiMedico && !form4.medicoValidade) {
      showErr('Preencha a data de validade do certificado médico.'); return;
    }
    if (!declaracaoData) { showErr('Preencha a data da declaração.'); return; }
    if (!aceitouTermos)  { showErr('É necessário aceitar os termos e condições.'); return; }
    setLoading(true);
    try {
      const [cadernetaUrl, comprovanteUrl, docFrontUrl, docBackUrl, cartaFrontUrl, cartaBackUrl, medicoUrl] = await Promise.all([
        uploadDoc(cadernetaFile,   'sailors', 'caderneta'),
        uploadDoc(comprovanteFile, 'sailors', 'comprovante-endereco'),
        uploadDoc(docIdFrontFile,  'sailors', 'id-front'),
        uploadDoc(docIdBackFile,   'sailors', 'id-back'),
        uploadDoc(cartaFrontFile,  'sailors', 'carta-front'),
        uploadDoc(cartaBackFile,   'sailors', 'carta-back'),
        uploadDoc(medicoFile,      'sailors', 'medico'),
      ]);

      const fullPhone = `${phoneCountry.ddi} ${phoneRaw}`;

      const sailor = await saveSailor({
        username:      form1.username || undefined,
        name:          form1.nomeCompleto,
        phone:         fullPhone,
        email:         form1.email,
        language:      form1.idioma,
        timezone:      country.tz,
        nacionalidade: country.name,
        birth_date:    `${birthDay.padStart(2,'0')}/${birthMonth.padStart(2,'0')}/${birthYear}`,
        cpf_nif:       form1.cpfNif || undefined,
        endereco:      form1.endereco || undefined,
        funcao:        Array.isArray(form1.funcao) ? form1.funcao.join(', ') : form1.funcao,
        funcao_outro:  form1.funcaoOutro || undefined,
        caderneta_maritima: {
          possui: !!cadernetaFile || !!form1.cadernetaNumero,
          numero: form1.cadernetaNumero || undefined,
          validade: cadernetaValidade || undefined,
          doc_url: cadernetaUrl ?? undefined,
        } as any,
        comprovante_endereco_url: comprovanteUrl ?? undefined,
        passaporte: {
          tipo: docIdType, numero: form2.docNumero,
          emissao: form2.docEmissao, validade: form2.docValidade,
          doc_url: docFrontUrl, doc_back_url: docBackUrl,
        },
        cartahabitacao: {
          tipo: cartaType, numero: form2.cartaNumero,
          emissao: form2.cartaEmissao, validade: form2.cartaValidade,
          doc_url: cartaFrontUrl, doc_back_url: cartaBackUrl,
        },
        stcw,
        stcw_validades: stcwValidades,
        medico: possuiMedico
          ? { numero: form4.medicoNumero || undefined, emissao: form4.medicoEmissao, validade: form4.medicoValidade, doc_url: medicoUrl }
          : { numero: undefined, emissao: undefined, validade: undefined, doc_url: null },
        possui_medico:            possuiMedico,
        experiencia_embarcado:    experienciaEmbarcado ?? undefined,
        experiencias:             experienciaEmbarcado ? experiencias.filter(e => e.empresa || e.funcao) : undefined,
        cursos_relevantes:        cursosRelevantes || undefined,
        possui_offshore:          possuiOffshore ?? undefined,
        idiomas:                  idiomas.length ? idiomas : undefined,
        idioma_nivel:             idiomaNivel || undefined,
        idioma_outro:             idiomaOutro || undefined,
        disponivel_imediato:      disponivelImediato ?? undefined,
        disponivel_internacional: disponivelInternacional ?? undefined,
        tempo_embarque:           tempoEmbarque || undefined,
        restricao_medica:         restricaoMedica || undefined,
        outras_informacoes:       outrasInformacoes || undefined,
        declaracao_data:          declaracaoData,
        aceitou_termos:           aceitouTermos,
      } as any);

      setProfileNumber(sailor.profile_number);
      setSubmitted(true);

    } catch (err: any) {
      if (err.message === 'DUPLICATE_EMAIL')         { showErr('Este e-mail já está cadastrado.'); goTo(1); }
      else if (err.message === 'DUPLICATE_DOCUMENT') { showErr('Este documento já está cadastrado.'); goTo(2); }
      else if (err.name === 'QuotaExceededError' || err.code === 22) {
        try {
          const fullPhone = `${phoneCountry.ddi} ${phoneRaw}`;
          const sailor = await saveSailor({
            name: form1.nomeCompleto, phone: fullPhone, email: form1.email,
            language: form1.idioma, timezone: country.tz, nacionalidade: country.name,
            funcao: Array.isArray(form1.funcao) ? form1.funcao.join(', ') : form1.funcao,
            passaporte:     { tipo: docIdType, numero: form2.docNumero, emissao: form2.docEmissao, validade: form2.docValidade, doc_url: null, doc_back_url: null },
            cartahabitacao: { tipo: cartaType, numero: form2.cartaNumero, emissao: form2.cartaEmissao, validade: form2.cartaValidade, doc_url: null, doc_back_url: null },
            stcw,
            medico: { emissao: form4.medicoEmissao, validade: form4.medicoValidade, doc_url: null },
            declaracao_data: declaracaoData, aceitou_termos: aceitouTermos,
          } as any);
          setProfileNumber(sailor.profile_number);
          setSubmitted(true);
        } catch (e2: any) {
          showErr(e2.message === 'DUPLICATE_EMAIL' ? 'E-mail já cadastrado.' : 'Armazenamento local cheio.');
        }
      } else {
        showErr(`Erro ao enviar: ${err?.message || 'Erro desconhecido'}.`);
      }
    } finally { setLoading(false); }
  };

  // ── Ecrã de sucesso ─────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white p-12 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a96e]/60 to-transparent" />
          <div className="w-20 h-20 bg-[#c9a96e]/15 border border-[#c9a96e]/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-[#c9a96e]" />
          </div>
          <h2 className="font-['Playfair_Display'] font-bold italic text-2xl text-[#1a2b4a] mb-3">Candidatura Enviada!</h2>
          {profileNumber && (
            <div className="bg-[#0a1628] px-6 py-4 mb-5 inline-flex items-center gap-3 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a96e]/60 to-transparent" />
              <Hash className="w-5 h-5 text-[#c9a96e] flex-shrink-0" />
              <div className="text-left">
                <p className="text-[#c9a96e]/70 text-[10px] font-semibold uppercase tracking-[0.15em]">Nº de Perfil</p>
                <p className="text-white font-['Playfair_Display'] font-bold text-2xl tracking-widest">#{formatProfileNumber(profileNumber)}</p>
              </div>
            </div>
          )}
          <p className="text-gray-500 font-medium text-sm leading-relaxed mb-4">
            A nossa equipa analisará os seus documentos e entrará em contacto via WhatsApp em breve.
          </p>
          <div className="bg-amber-50 border border-amber-200 px-5 py-3 mb-8 flex items-center gap-3">
            <span className="text-xl">⏳</span>
            <p className="text-xs font-semibold text-amber-700 text-left">Verificação pendente — prazo habitual de 48 horas úteis.</p>
          </div>
          <button onClick={() => onClose ? onClose() : window.location.reload()}
            className="w-full bg-[#0a1628] text-white py-4 font-semibold uppercase tracking-wider hover:bg-[#1a2b4a] transition-all">
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  // ── Layout principal ─────────────────────────────────────────────────────────
  return (
    <>
      {termosOpen && (
        <TermosModal
          onClose={() => setTermosOpen(false)}
        />
      )}

      <div className="w-full max-w-md mx-auto bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex-shrink-0 bg-[#0a1628] px-5 pt-6 pb-4 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: 'repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 0,transparent 60px),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 0,transparent 60px)' }} />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a96e]/40 to-transparent" />
          <p className="text-[10px] font-semibold text-[#c9a96e]/70 uppercase tracking-[0.15em] mb-1 relative">Registo de Marinheiro</p>
          <h2 className="font-['Playfair_Display'] font-bold italic text-xl text-white mb-4 relative">⚓ Candidatura</h2>
          <SailorStepper current={tab} done={doneTabs} />
        </div>

        <div ref={bodyRef} className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 px-4 py-3 flex items-start gap-3">
              <span className="text-red-400 text-lg flex-shrink-0">⚠️</span>
              <p className="text-sm font-medium text-red-700">{error}</p>
            </div>
          )}

          {tab === 1 && (
            <Step1DadosPessoais
              country={country} phoneCountry={phoneCountry} phoneRaw={phoneRaw} form1={form1}
              birthDay={birthDay} birthMonth={birthMonth} birthYear={birthYear}
              cadernetaValidade={cadernetaValidade}
              cadernetaFile={cadernetaFile} cadernetaPrev={cadernetaPrev}
              comprovanteFile={comprovanteFile} comprovantePrev={comprovantePrev}
              onCountryChange={c => { setCountry(c); setPhoneCountry(c); setPhoneRaw(''); }}
              onPhoneCountryChange={c => { setPhoneCountry(c); setPhoneRaw(''); }}
              onPhoneRawChange={setPhoneRaw}
              onForm1Change={patch => setForm1(p => ({ ...p, ...(patch as any) }))}
              onBirthDayChange={setBirthDay} onBirthMonthChange={setBirthMonth} onBirthYearChange={setBirthYear}
              onCadernetaValidadeChange={setCadernetaValidade}
              onCadernetaSelect={(f, p) => { setCadernetaFile(f); setCadernetaPrev(p); }}
              onCadernetaClear={() => { setCadernetaFile(null); setCadernetaPrev(null); }}
              onComprovanteSelect={(f, p) => { setComprovanteFile(f); setComprovantePrev(p); }}
              onComprovanteClear={() => { setComprovanteFile(null); setComprovantePrev(null); }}
              onNext={handleNext1}
            />
          )}

          {tab === 2 && (
            <Step2Documentos
              country={country} phoneCountry={phoneCountry} phoneRaw={phoneRaw}
              nomeCompleto={form1.nomeCompleto}
              docIdType={docIdType}
              docIdFrontFile={docIdFrontFile} docIdFrontPrev={docIdFrontPrev}
              docIdBackFile={docIdBackFile}   docIdBackPrev={docIdBackPrev}
              cartaType={cartaType}
              cartaFrontFile={cartaFrontFile} cartaFrontPrev={cartaFrontPrev}
              cartaBackFile={cartaBackFile}   cartaBackPrev={cartaBackPrev}
              form2={form2}
              onCountryChange={setCountry}
              onDocIdTypeChange={setDocIdType}
              onDocIdFront={(f,p)    => { setDocIdFrontFile(f); setDocIdFrontPrev(p); }}
              onDocIdFrontClear={() => { setDocIdFrontFile(null); setDocIdFrontPrev(null); }}
              onDocIdBack={(f,p)     => { setDocIdBackFile(f);  setDocIdBackPrev(p); }}
              onDocIdBackClear={() =>  { setDocIdBackFile(null); setDocIdBackPrev(null); }}
              onCartaFront={(f,p)    => { setCartaFrontFile(f); setCartaFrontPrev(p); }}
              onCartaFrontClear={() => { setCartaFrontFile(null); setCartaFrontPrev(null); }}
              onCartaBack={(f,p)     => { setCartaBackFile(f);  setCartaBackPrev(p); }}
              onCartaBackClear={() =>  { setCartaBackFile(null); setCartaBackPrev(null); }}
              onForm2Change={patch => setForm2(p => ({ ...p, ...patch }))}
              onBack={() => goTo(1)} onNext={handleNext2}
            />
          )}

          {tab === 3 && (
            <Step3STCW
              stcw={stcw} stcwValidades={stcwValidades}
              experienciaEmbarcado={experienciaEmbarcado} experiencias={experiencias}
              cursosRelevantes={cursosRelevantes} possuiOffshore={possuiOffshore}
              idiomas={idiomas} idiomaOutro={idiomaOutro} idiomaNivel={idiomaNivel}
              onStcwChange={(cert, checked) => setStcw(p => ({ ...p, [cert]: checked }))}
              onStcwValidade={(cert, val) => setStcwValidades(p => ({ ...p, [cert]: val }))}
              onExperienciaEmbarcado={setExperienciaEmbarcado}
              onAddExperiencia={() => setExperiencias(p => [...p, { ...BLANK_EXP }])}
              onRemoveExperiencia={i => setExperiencias(p => p.filter((_, idx) => idx !== i))}
              onExperienciaChange={(i, patch) => setExperiencias(p => p.map((e, idx) => idx === i ? { ...e, ...patch } : e))}
              onCursosChange={setCursosRelevantes}
              onOffshoreChange={setPossuiOffshore}
              onIdiomasChange={(idioma, checked) => setIdiomas(p => checked ? [...p, idioma] : p.filter(x => x !== idioma))}
              onIdiomaOutroChange={setIdiomaOutro}
              onIdiomaNivelChange={setIdiomaNivel}
              onBack={() => goTo(2)} onNext={handleNext3}
            />
          )}

          {tab === 4 && (
            <Step4Medico
              form1={form1} phoneCountry={phoneCountry} phoneRaw={phoneRaw}
              country={country} docIdType={docIdType} form2={form2} stcw={stcw}
              possuiMedico={possuiMedico}
              form4={form4} medicoFile={medicoFile} medicoPreview={medicoPreview}
              disponivelImediato={disponivelImediato}
              disponivelInternacional={disponivelInternacional}
              tempoEmbarque={tempoEmbarque}
              restricaoMedica={restricaoMedica}
              outrasInformacoes={outrasInformacoes}
              declaracaoData={declaracaoData}
              aceitouTermos={aceitouTermos}
              loading={loading}
              onPossuiMedicoChange={v => { setPossuiMedico(v); if (!v) setForm4({ medicoNumero: '', medicoEmissao: '', medicoValidade: '' }); }}
              onForm4Change={patch => setForm4(p => ({ ...p, ...patch }))}
              onMedicoSelect={(f,p) => { setMedicoFile(f); setMedicoPreview(p); }}
              onMedicoClear={() =>    { setMedicoFile(null); setMedicoPreview(null); }}
              onDispImediatoChange={setDisponivelImediato}
              onDispInternacionalChange={setDisponivelInternacional}
              onTempoEmbarqueChange={setTempoEmbarque}
              onRestricaoChange={setRestricaoMedica}
              onOutrasInfoChange={setOutrasInformacoes}
              onDeclaracaoDataChange={setDeclaracaoData}
              onAceitouTermosChange={setAceitouTermos}
              onOpenTermos={() => setTermosOpen(true)}
              onBack={() => goTo(3)} onSubmit={handleSubmit}
            />
          )}
        </div>

        <div className="flex-shrink-0 bg-blue-900/5 border-t-2 border-gray-100 py-3 flex items-center justify-center gap-2">
          {([1,2,3,4] as TabN[]).map(n => (
            <div key={n} className={`h-1.5 rounded-full transition-all duration-300
              ${n === tab ? 'w-8 bg-blue-900' : doneTabs.has(n) ? 'w-4 bg-blue-300' : 'w-4 bg-gray-200'}`} />
          ))}
        </div>
      </div>
    </>
  );
}