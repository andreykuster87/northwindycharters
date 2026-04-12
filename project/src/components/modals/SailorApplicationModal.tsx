// src/components/modals/SailorApplicationModal.tsx
// Formulário de candidatura a tripulante — passageiro envia documentos
// para análise admin. Reutiliza dados do client. 4 steps.

import { useState, useRef, useEffect } from 'react';
import {
  X, Anchor, ChevronRight, ChevronLeft, CheckCircle2, AlertCircle,
} from 'lucide-react';
import { STCW_CERTS } from '../../constants/sailorConstants';
import { saveSailorApplication } from '../../lib/localStore';
import { uploadDoc } from '../../lib/storage';
import type { DocTypeValue, Client } from '../../lib/localStore';
import { TermosModal } from './TermosModal';
import { Step1Perfil }      from './sailor-application/Step1Perfil';
import { Step2Funcao }      from './sailor-application/Step2Funcao';
import { Step3Documentos }  from './sailor-application/Step3Documentos';
import { Step4Confirmacao } from './sailor-application/Step4Confirmacao';
import { nowDatetimeLocal, BLANK_EXP } from './sailor-application/utils';
import type { Experiencia } from './sailor-application/utils';

type AppStep = 1 | 2 | 3 | 4;

const STEP_LABELS = [
  { n: 1 as const, icon: '👤', short: 'Perfil',    label: 'Seus Dados'         },
  { n: 2 as const, icon: '⚓', short: 'Função',    label: 'Função & Caderneta' },
  { n: 3 as const, icon: '🪪', short: 'Docs',      label: 'Documentos'         },
  { n: 4 as const, icon: '✅', short: 'Confirmar', label: 'Confirmação'        },
];

function StepIndicator({ current, done }: { current: AppStep; done: Set<number> }) {
  return (
    <div className="flex items-center px-1 py-2">
      {STEP_LABELS.map((tab, i) => {
        const isActive = tab.n === current;
        const isDone   = done.has(tab.n);
        return (
          <div key={tab.n} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-300 text-sm
                ${isActive ? 'bg-white border-white shadow-lg scale-110'
                  : isDone  ? 'bg-green-400 border-green-400'
                  : 'bg-white/10 border-white/20'}`}>
                {isDone
                  ? <CheckCircle2 className="w-4 h-4 text-green-900" />
                  : <span className={isActive ? 'text-blue-900' : 'text-white/40'}>{tab.icon}</span>
                }
              </div>
              <span className={`text-[9px] font-black uppercase tracking-wider transition-all
                ${isActive ? 'text-white' : isDone ? 'text-green-300' : 'text-white/30'}`}>
                {tab.short}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div className={`h-0.5 flex-1 mx-1 mb-4 rounded-full transition-all duration-300 ${isDone ? 'bg-green-400' : 'bg-white/15'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function SailorApplicationModal({
  client,
  onClose,
}: {
  client: Client;
  onClose: () => void;
}) {
  const bodyRef = useRef<HTMLDivElement>(null);

  const [step,      setStep]      = useState<AppStep>(1);
  const [done,      setDone]      = useState<Set<number>>(new Set());
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [termosOpen,setTermosOpen]= useState(false);

  // Step 2 — Função & Caderneta
  const [funcoes,            setFuncoes]            = useState<string[]>([]);
  const [outroFuncao,        setOutroFuncao]        = useState('');
  const [cadernetaNumero,    setCadernetaNumero]    = useState('');
  const [cadernetaValidade,  setCadernetaValidade]  = useState('');
  const [cadernetaFile,      setCadernetaFile]      = useState<File | null>(null);
  const [cadernetaPrev,      setCadernetaPrev]      = useState<string | null>(null);
  const [cadernetaBackFile,  setCadernetaBackFile]  = useState<File | null>(null);
  const [cadernetaBackPrev,  setCadernetaBackPrev]  = useState<string | null>(null);

  // Step 3 — Documentos
  const [docIdType,      setDocIdType]      = useState<DocTypeValue>('passport');
  const [docIdNumero,    setDocIdNumero]    = useState('');
  const [docIdValidade,  setDocIdValidade]  = useState('');
  const [docIdFile,      setDocIdFile]      = useState<File | null>(null);
  const [docIdPrev,      setDocIdPrev]      = useState<string | null>(null);
  const [docIdBackFile,  setDocIdBackFile]  = useState<File | null>(null);
  const [docIdBackPrev,  setDocIdBackPrev]  = useState<string | null>(null);

  const [cartaNumero,    setCartaNumero]    = useState('');
  const [cartaValidade,  setCartaValidade]  = useState('');
  const [cartaFile,      setCartaFile]      = useState<File | null>(null);
  const [cartaPrev,      setCartaPrev]      = useState<string | null>(null);
  const [cartaBackFile,  setCartaBackFile]  = useState<File | null>(null);
  const [cartaBackPrev,  setCartaBackPrev]  = useState<string | null>(null);

  const [stcw,           setStcw]           = useState<Record<string, boolean>>(
    Object.fromEntries(STCW_CERTS.map(c => [c.id, false]))
  );
  const [stcwValidades,  setStcwValidades]  = useState<Record<string, string>>({});

  const [medicoNumero,   setMedicoNumero]   = useState('');
  const [medicoValidade, setMedicoValidade] = useState('');
  const [medicoFile,     setMedicoFile]     = useState<File | null>(null);
  const [medicoPrev,     setMedicoPrev]     = useState<string | null>(null);

  const [chefCatering,      setChefCatering]      = useState(false);
  const [chefCertificacoes, setChefCertificacoes] = useState('');
  const [chefFile,          setChefFile]          = useState<File | null>(null);
  const [chefPrev,          setChefPrev]          = useState<string | null>(null);

  const [experienciaEmbarcado, setExperienciaEmbarcado] = useState<boolean | null>(null);
  const [experiencias,         setExperiencias]         = useState<Experiencia[]>([{ ...BLANK_EXP }]);
  const [cursosRelevantes,     setCursosRelevantes]     = useState('');
  const [idiomas,              setIdiomas]              = useState<string[]>([]);

  // Step 4 — Confirmação
  const [antecedentesFile, setAntecedentesFile] = useState<File | null>(null);
  const [antecedentesPrev, setAntecedentesPrev] = useState<string | null>(null);
  const [declaraVerdade,   setDeclaraVerdade]   = useState(false);
  const [aceitaTermos,     setAceitaTermos]     = useState(false);
  const [declaracaoData,   setDeclaracaoData]   = useState('');

  useEffect(() => {
    if (step === 4 && !declaracaoData) setDeclaracaoData(nowDatetimeLocal());
  }, [step]); // eslint-disable-line

  const isChef      = funcoes.some(f => f.toLowerCase().includes('cozinheiro') || f.toLowerCase().includes('taifeiro'));
  const hasPassport = !!client.passport_number;

  function scrollTop() { bodyRef.current?.scrollTo({ top: 0, behavior: 'smooth' }); }
  function markDone(n: number) { setDone(prev => { const s = new Set(prev); s.add(n); return s; }); }

  function canGoNext(): boolean {
    if (step === 2) {
      const funcaoOk = funcoes.length > 0 && (!funcoes.includes('Outro') || outroFuncao.trim().length > 0);
      return funcaoOk && cadernetaNumero.trim().length > 0 && cadernetaValidade.length === 10 && !!cadernetaFile;
    }
    if (step === 3) {
      const docOk    = hasPassport || (docIdNumero.trim().length > 0 && !!docIdFile);
      const stcwOk   = Object.values(stcw).some(Boolean);
      const medicoOk = medicoNumero.trim().length > 0 && medicoValidade.length === 10 && !!medicoFile;
      return docOk && stcwOk && medicoOk;
    }
    if (step === 4) return declaraVerdade && aceitaTermos;
    return true;
  }

  function goNext() {
    if (!canGoNext()) return;
    markDone(step);
    setStep((step + 1) as AppStep);
    scrollTop();
    setError(null);
  }
  function goBack() {
    setStep((step - 1) as AppStep);
    scrollTop();
    setError(null);
  }

  async function handleSubmit() {
    if (!canGoNext()) return;
    setLoading(true);
    setError(null);
    try {
      const [
        cadernetaUrl, cadernetaBackUrl,
        docIdUrl, docIdBackUrl,
        cartaUrl, cartaBackUrl,
        medicoUrl, chefUrl, antecedentesUrl,
      ] = await Promise.all([
        cadernetaFile     ? uploadDoc(cadernetaFile,     'sailor-apps', `caderneta-${client.id}`)      : Promise.resolve(null),
        cadernetaBackFile ? uploadDoc(cadernetaBackFile, 'sailor-apps', `caderneta-back-${client.id}`) : Promise.resolve(null),
        docIdFile         ? uploadDoc(docIdFile,         'sailor-apps', `docid-${client.id}`)          : Promise.resolve(null),
        docIdBackFile     ? uploadDoc(docIdBackFile,     'sailor-apps', `docid-back-${client.id}`)     : Promise.resolve(null),
        cartaFile         ? uploadDoc(cartaFile,         'sailor-apps', `carta-${client.id}`)          : Promise.resolve(null),
        cartaBackFile     ? uploadDoc(cartaBackFile,     'sailor-apps', `carta-back-${client.id}`)     : Promise.resolve(null),
        medicoFile        ? uploadDoc(medicoFile,        'sailor-apps', `medico-${client.id}`)         : Promise.resolve(null),
        chefFile          ? uploadDoc(chefFile,          'sailor-apps', `chef-${client.id}`)           : Promise.resolve(null),
        antecedentesFile  ? uploadDoc(antecedentesFile,  'sailor-apps', `antecedentes-${client.id}`)   : Promise.resolve(null),
      ]);

      await saveSailorApplication({
        client_id:    client.id,
        name:         client.name,
        email:        client.email,
        phone:        client.phone,
        birth_date:   client.birth_date ?? undefined,
        nacionalidade:client.country_name,

        funcoes: funcoes.map(f => f === 'Outro' ? outroFuncao.trim() : f),
        caderneta_maritima_numero:   cadernetaNumero,
        caderneta_maritima_validade: cadernetaValidade,
        caderneta_doc_url:           cadernetaUrl,
        caderneta_doc_back_url:      cadernetaBackUrl,

        doc_id_tipo:     hasPassport ? (client.doc_type as DocTypeValue || 'passport') : (docIdNumero ? docIdType : null),
        doc_id_numero:   hasPassport ? client.passport_number : (docIdNumero || null),
        doc_id_validade: hasPassport ? (client.passport_expires || null) : (docIdValidade || null),
        doc_id_url:      hasPassport ? (client.doc_url ?? null) : docIdUrl,
        doc_id_back_url: hasPassport ? (client.doc_back_url ?? null) : docIdBackUrl,

        carta_habilitacao_numero:   cartaNumero || null,
        carta_habilitacao_validade: cartaValidade || null,
        carta_habilitacao_url:      cartaUrl,
        carta_habilitacao_back_url: cartaBackUrl,

        stcw,
        stcw_validades: stcwValidades,
        medico_numero:   medicoNumero || null,
        medico_validade: medicoValidade || null,
        medico_url:      medicoUrl,

        experiencia_embarcado: experienciaEmbarcado ?? false,
        experiencias: experienciaEmbarcado ? experiencias.filter(e => e.empresa.trim()) : [],
        cursos_relevantes: cursosRelevantes || undefined,
        idiomas,

        chef_experiencia_catering: chefCatering,
        chef_certificacoes:        chefCertificacoes || undefined,
        chef_certificacoes_url:    chefUrl,
        antecedentes_criminais:    undefined,
        antecedentes_criminais_url:antecedentesUrl,
        declara_verdade:  declaraVerdade,
        aceita_termos:    aceitaTermos,
        declaracao_data:  declaracaoData || new Date().toISOString(),
      });

      setSubmitted(true);
    } catch (e: any) {
      setError(e.message || 'Erro ao enviar candidatura. Tente novamente.');
      scrollTop();
    } finally {
      setLoading(false);
    }
  }

  // ── Submitted screen ─────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <div className="bg-white rounded-[30px] w-full max-w-sm p-8 text-center space-y-5 shadow-2xl">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>
          <div>
            <h2 className="font-black text-blue-900 text-xl uppercase italic">Candidatura Enviada!</h2>
            <p className="text-sm text-gray-500 font-bold mt-2">
              A sua candidatura a tripulante está em análise. Em breve receberá uma mensagem com o resultado.
            </p>
          </div>
          <div className="bg-blue-50 rounded-[18px] p-4 text-left space-y-2">
            <p className="text-[10px] font-black text-blue-900 uppercase tracking-wide">Próximos passos</p>
            <p className="text-xs text-blue-700 font-bold">1. Admin analisa a documentação</p>
            <p className="text-xs text-blue-700 font-bold">2. Se aprovado, recebe credenciais de acesso</p>
            <p className="text-xs text-blue-700 font-bold">3. Acessa a área do tripulante</p>
          </div>
          <button onClick={onClose}
            className="w-full bg-blue-900 text-white rounded-[15px] py-3.5 font-black text-sm uppercase tracking-wider hover:bg-blue-800 transition-colors">
            Entendido, obrigado!
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {termosOpen && <TermosModal onClose={() => setTermosOpen(false)} />}
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className="bg-white w-full sm:max-w-lg sm:rounded-[30px] rounded-t-[30px] overflow-hidden shadow-2xl max-h-[92vh] sm:max-h-[90vh] flex flex-col">

          {/* Header */}
          <div className="bg-gradient-to-br from-blue-900 to-blue-700 px-5 pt-5 pb-3 flex-shrink-0">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded-[10px] flex items-center justify-center">
                  <Anchor className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-black text-white text-sm uppercase tracking-wide leading-tight">Candidatura a Tripulante</p>
                  <p className="text-blue-200 text-[10px] font-bold">{STEP_LABELS[step - 1].label}</p>
                </div>
              </div>
              <button onClick={onClose} className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
            <StepIndicator current={step} done={done} />
          </div>

          {/* Body */}
          <div ref={bodyRef} className="flex-1 overflow-y-auto p-5 space-y-5">
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-[15px] p-3 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs font-bold text-red-700">{error}</p>
              </div>
            )}

            {step === 1 && <Step1Perfil client={client} />}

            {step === 2 && (
              <Step2Funcao
                funcoes={funcoes} setFuncoes={setFuncoes}
                outroFuncao={outroFuncao} setOutroFuncao={setOutroFuncao}
                cadernetaNumero={cadernetaNumero} setCadernetaNumero={setCadernetaNumero}
                cadernetaValidade={cadernetaValidade} setCadernetaValidade={setCadernetaValidade}
                cadernetaFile={cadernetaFile} cadernetaPrev={cadernetaPrev}
                setCadernetaFile={setCadernetaFile} setCadernetaPrev={setCadernetaPrev}
                cadernetaBackFile={cadernetaBackFile} cadernetaBackPrev={cadernetaBackPrev}
                setCadernetaBackFile={setCadernetaBackFile} setCadernetaBackPrev={setCadernetaBackPrev}
              />
            )}

            {step === 3 && (
              <Step3Documentos
                client={client} hasPassport={hasPassport} isChef={isChef}
                docIdType={docIdType} setDocIdType={setDocIdType}
                docIdNumero={docIdNumero} setDocIdNumero={setDocIdNumero}
                docIdValidade={docIdValidade} setDocIdValidade={setDocIdValidade}
                docIdFile={docIdFile} docIdPrev={docIdPrev}
                setDocIdFile={setDocIdFile} setDocIdPrev={setDocIdPrev}
                docIdBackFile={docIdBackFile} docIdBackPrev={docIdBackPrev}
                setDocIdBackFile={setDocIdBackFile} setDocIdBackPrev={setDocIdBackPrev}
                cartaNumero={cartaNumero} setCartaNumero={setCartaNumero}
                cartaValidade={cartaValidade} setCartaValidade={setCartaValidade}
                cartaFile={cartaFile} cartaPrev={cartaPrev}
                setCartaFile={setCartaFile} setCartaPrev={setCartaPrev}
                cartaBackFile={cartaBackFile} cartaBackPrev={cartaBackPrev}
                setCartaBackFile={setCartaBackFile} setCartaBackPrev={setCartaBackPrev}
                stcw={stcw} setStcw={setStcw}
                stcwValidades={stcwValidades} setStcwValidades={setStcwValidades}
                medicoNumero={medicoNumero} setMedicoNumero={setMedicoNumero}
                medicoValidade={medicoValidade} setMedicoValidade={setMedicoValidade}
                medicoFile={medicoFile} medicoPrev={medicoPrev}
                setMedicoFile={setMedicoFile} setMedicoPrev={setMedicoPrev}
                chefCatering={chefCatering} setChefCatering={setChefCatering}
                chefCertificacoes={chefCertificacoes} setChefCertificacoes={setChefCertificacoes}
                chefFile={chefFile} chefPrev={chefPrev}
                setChefFile={setChefFile} setChefPrev={setChefPrev}
                experienciaEmbarcado={experienciaEmbarcado} setExperienciaEmbarcado={setExperienciaEmbarcado}
                experiencias={experiencias} setExperiencias={setExperiencias}
                cursosRelevantes={cursosRelevantes} setCursosRelevantes={setCursosRelevantes}
                idiomas={idiomas} setIdiomas={setIdiomas}
              />
            )}

            {step === 4 && (
              <Step4Confirmacao
                clientName={client.name}
                funcoes={funcoes}
                cadernetaNumero={cadernetaNumero}
                stcw={stcw}
                declaracaoData={declaracaoData}
                antecedentesFile={antecedentesFile} antecedentesPrev={antecedentesPrev}
                setAntecedentesFile={setAntecedentesFile} setAntecedentesPrev={setAntecedentesPrev}
                declaraVerdade={declaraVerdade} setDeclaraVerdade={setDeclaraVerdade}
                aceitaTermos={aceitaTermos} setAceitaTermos={setAceitaTermos}
                onOpenTermos={() => setTermosOpen(true)}
              />
            )}
          </div>

          {/* Footer */}
          <div className="px-5 pb-5 pt-3 border-t border-gray-100 flex-shrink-0 flex gap-3">
            {step > 1 ? (
              <button onClick={goBack} disabled={loading}
                className="flex items-center gap-1.5 px-4 py-3 border-2 border-gray-100 rounded-[15px] font-black text-xs text-blue-900 uppercase hover:border-blue-300 transition-all disabled:opacity-50">
                <ChevronLeft className="w-4 h-4" /> Voltar
              </button>
            ) : (
              <button onClick={onClose} disabled={loading}
                className="flex items-center gap-1.5 px-4 py-3 border-2 border-gray-100 rounded-[15px] font-black text-xs text-blue-900 uppercase hover:border-blue-300 transition-all">
                <X className="w-3 h-3" /> Cancelar
              </button>
            )}
            <button
              onClick={step === 4 ? handleSubmit : goNext}
              disabled={loading || !canGoNext()}
              className="flex-1 bg-blue-900 hover:bg-blue-800 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-[15px] py-3 font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2">
              {loading ? (
                <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
              ) : step === 4 ? (
                <><Anchor className="w-3.5 h-3.5" /> Enviar Candidatura</>
              ) : (
                <>Continuar <ChevronRight className="w-4 h-4" /></>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
