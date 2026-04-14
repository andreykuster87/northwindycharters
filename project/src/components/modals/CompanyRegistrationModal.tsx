// src/components/modals/CompanyRegistrationModal.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Cadastro de Empresa — 4 steps + termos. Persiste no Supabase.
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useRef, useEffect } from 'react';
import { X, AlertCircle, ChevronRight, ChevronLeft, Check, ChevronDown } from 'lucide-react';
import { saveCompany } from '../../lib/localStore';
import { type Form, EMPTY, STEPS_META, fiscalLabel } from './CompanyRegShared';
import { CompanyRegStep1 } from './CompanyRegStep1';
import { CompanyRegStep2 } from './CompanyRegStep2';
import { CompanyRegStep3 } from './CompanyRegStep3';
import { CompanyRegStep4 } from './CompanyRegStep4';


interface Props {
  onClose:    () => void;
  onSuccess?: () => void;
}

// ── Componente principal ──────────────────────────────────────────────────────

export function CompanyRegistrationModal({ onClose, onSuccess }: Props) {
  const [step,         setStep]         = useState<1|2|3|4>(1);
  const [form,         setForm]         = useState<Form>(EMPTY);
  const [error,        setError]        = useState<string | null>(null);
  const [loading,      setLoading]      = useState(false);
  const [done,         setDone]         = useState(false);
  const [hasMoreBelow, setHasMoreBelow] = useState(true);
  const topRef    = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  function handleScroll(e: React.UIEvent<HTMLDivElement>) {
    const el = e.currentTarget;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 24;
    setHasMoreBelow(!atBottom);
  }

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    setHasMoreBelow(el.scrollHeight > el.clientHeight + 24);
  }, [step]);

  const f = (k: keyof Form, v: string | boolean) =>
    setForm(p => ({ ...p, [k]: v }));

  function scrollTop() {
    setTimeout(() => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  }

  // ── Validações por step ──────────────────────────────────────────────────

  function validateStep(): string | null {
    if (step === 1) {
      if (!form.razao_social.trim()) return 'Razão Social é obrigatória.';
      if (!form.nome_fantasia.trim()) return 'Nome Fantasia é obrigatório.';
      if (!form.username.trim() || form.username.length < 3) return 'Defina um @ com pelo menos 3 caracteres.';
      if (!form.setores.length) return 'Selecione pelo menos um setor da empresa.';
      if (form.setores.includes('Outro') && !form.setor_outro.trim()) return 'Descreva o setor.';
      if (!form.pais) return 'Selecione o país.';
      if (!form.cidade.trim()) return 'Cidade é obrigatória.';
      if (!form.endereco.trim()) return 'Endereço é obrigatório.';
    }
    if (step === 2) {
      if (!form.numero_registro.trim()) return 'Número de Registro é obrigatório.';
      if (!form.numero_fiscal.trim()) return `${fiscalLabel(form.pais_fiscal)} é obrigatório.`;
    }
    if (step === 3) {
      if (!form.telefone.trim()) return 'Telefone é obrigatório.';
      if (!form.email.trim()) return 'E-mail é obrigatório.';
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
      if (!emailOk) return 'E-mail inválido.';
    }
    if (step === 4) {
      if (!form.resp_nome.trim()) return 'Nome do responsável é obrigatório.';
      if (!form.resp_cargo.trim()) return 'Cargo é obrigatório.';
      if (!form.resp_email.trim()) return 'E-mail do responsável é obrigatório.';
      if (!form.declarou_veracidade) return 'Confirme a veracidade dos dados.';
      if (!form.aceitou_termos) return 'Aceite os termos para continuar.';
    }
    return null;
  }

  function next() {
    const err = validateStep();
    if (err) { setError(err); scrollTop(); return; }
    setError(null);
    if (step < 4) { setStep(s => (s + 1) as 1|2|3|4); scrollTop(); }
    else handleSubmit();
  }

  function back() {
    setError(null);
    if (step > 1) setStep(s => (s - 1) as 1|2|3|4);
  }

  async function handleSubmit() {
    setLoading(true);
    try {
      const setor = form.setores.includes('Outro')
        ? [...form.setores.filter(s => s !== 'Outro'), form.setor_outro].join(', ')
        : form.setores.join(', ');
      saveCompany({
        username:       form.username.trim() || undefined,
        razao_social:   form.razao_social.trim(),
        nome_fantasia:  form.nome_fantasia.trim(),
        setor,
        descricao:      form.descricao.trim() || undefined,
        pais:           form.pais,
        pais_nome:      form.pais_nome,
        estado:         form.estado.trim(),
        cidade:         form.cidade.trim(),
        endereco:       form.endereco.trim(),
        codigo_postal:  form.codigo_postal.trim(),
        numero_registro: form.numero_registro.trim(),
        numero_fiscal:  form.numero_fiscal.trim(),
        pais_fiscal:    form.pais_fiscal,
        telefone:       `${form.ddi} ${form.telefone}`.trim(),
        email:          form.email.trim(),
        website:        form.website.trim() || undefined,
        instagram:      form.instagram.trim() || undefined,
        linkedin:       form.linkedin.trim() || undefined,
        facebook:       form.facebook.trim() || undefined,
        outras_redes:   form.outras_redes.trim() || undefined,
        resp_nome:      form.resp_nome.trim(),
        resp_cargo:     form.resp_cargo.trim(),
        resp_email:     form.resp_email.trim(),
        resp_telefone:  `${form.resp_ddi} ${form.resp_telefone}`.trim(),
        declarou_veracidade: form.declarou_veracidade,
        aceitou_termos:      form.aceitou_termos,
        status: 'pending',
      });
      setDone(true);
      onSuccess?.();
    } catch {
      setError('Erro ao salvar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  // ── Tela de sucesso ──────────────────────────────────────────────────────

  if (done) {
    return (
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-4" style={{ background: 'rgba(4,10,24,0.88)', backdropFilter: 'blur(8px)' }}>
        <div className="bg-white w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
          <div className="bg-[#0a1628] px-8 py-10 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.04]"
              style={{ backgroundImage: 'repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 0,transparent 60px),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 0,transparent 60px)' }} />
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a96e]/40 to-transparent" />
            <div className="w-16 h-16 bg-[#c9a96e]/20 border border-[#c9a96e]/40 flex items-center justify-center mx-auto mb-4 relative">
              <Check className="w-8 h-8 text-[#c9a96e]" />
            </div>
            <h3 className="font-['Playfair_Display'] font-bold italic text-xl text-white">Cadastro enviado!</h3>
            <p className="text-[#c9a96e]/70 text-sm font-medium mt-2">Sua empresa está em análise.</p>
          </div>
          <div className="px-8 py-6 space-y-4 text-center">
            <div className="bg-amber-50 border border-amber-200 px-5 py-4">
              <p className="text-sm font-semibold text-amber-800">⏳ Aguardando verificação</p>
              <p className="text-xs text-amber-600 font-medium mt-1">
                A equipa NorthWindy irá rever os seus dados e entrar em contacto.
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-full bg-[#0a1628] hover:bg-[#1a2b4a] text-white py-4 font-semibold text-sm uppercase tracking-widest transition-all">
              Fechar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Layout principal ─────────────────────────────────────────────────────

  const StepIcon = STEPS_META[step - 1].icon;

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center p-4"
      style={{ background: 'rgba(4,10,24,0.88)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="bg-[#0a1628] px-8 py-6 flex-shrink-0 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: 'repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 0,transparent 60px),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 0,transparent 60px)' }} />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a96e]/40 to-transparent" />
          <div className="flex items-start justify-between mb-4 relative">
            {/* Stepper visual */}
            <div className="flex items-center gap-1.5">
              {STEPS_META.map((sm, i) => {
                const n = i + 1;
                const isDone = n < step;
                const active = n === step;
                return (
                  <div key={n} className="flex items-center gap-1.5">
                    <div className={`w-7 h-7 flex items-center justify-center text-[11px] font-semibold border transition-all ${
                      isDone ? 'bg-[#c9a96e] border-[#c9a96e] text-[#0a1628]' :
                      active ? 'bg-white border-white text-[#0a1628]' :
                               'bg-transparent border-white/20 text-white/30'
                    }`}>
                      {isDone ? <Check className="w-3.5 h-3.5" /> : n}
                    </div>
                    {i < STEPS_META.length - 1 && (
                      <div className={`w-5 h-px transition-all ${isDone ? 'bg-[#c9a96e]' : 'bg-white/20'}`} />
                    )}
                  </div>
                );
              })}
            </div>
            <button onClick={onClose} className="bg-white/5 hover:bg-white/10 text-white p-2.5 transition-all relative">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-3 relative">
            <div className="bg-[#c9a96e]/15 border border-[#c9a96e]/30 p-2.5">
              <StepIcon className="w-5 h-5 text-[#c9a96e]" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-[#c9a96e]/70 uppercase tracking-[0.15em]">
                Cadastro de Empresa · Passo {step}/4
              </p>
              <h2 className="font-['Playfair_Display'] font-bold italic text-lg text-white">
                {STEPS_META[step - 1].label}
              </h2>
              <p className="text-white/50 text-xs font-medium">{STEPS_META[step - 1].sub}</p>
            </div>
          </div>
        </div>

        {/* ── Conteúdo scrollável ── */}
        <div className="flex-1 min-h-0 relative flex flex-col">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto overscroll-contain px-8 py-6 space-y-4">
          <div ref={topRef} />

          {error && (
            <div className="bg-red-50 border border-red-200 px-5 py-3 flex items-center gap-3">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-red-700 font-medium text-sm">{error}</p>
            </div>
          )}

          {step === 1 && <CompanyRegStep1 form={form} setForm={setForm} />}
          {step === 2 && <CompanyRegStep2 form={form} setForm={setForm} />}
          {step === 3 && <CompanyRegStep3 form={form} setForm={setForm} />}
          {step === 4 && <CompanyRegStep4 form={form} setForm={setForm} />}
        </div>

        {/* ── Indicador de scroll ── */}
        {hasMoreBelow && (
          <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none flex flex-col items-center justify-end pb-2"
            style={{ background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.95))' }}>
            <div className="animate-bounce flex flex-col items-center gap-0.5">
              <ChevronDown className="w-4 h-4 text-[#c9a96e]" />
              <ChevronDown className="w-3 h-3 text-[#c9a96e]/50 -mt-2" />
            </div>
          </div>
        )}
        </div>

        {/* ── Footer com navegação ── */}
        <div className="px-8 py-5 border-t border-gray-100 flex gap-3 flex-shrink-0 bg-white">
          {step > 1 && (
            <button
              onClick={back}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-4 border border-gray-200 text-gray-500 hover:border-[#1a2b4a] hover:text-[#1a2b4a] font-semibold text-sm transition-all">
              <ChevronLeft className="w-4 h-4" /> Voltar
            </button>
          )}
          <button
            onClick={next}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 bg-[#0a1628] hover:bg-[#1a2b4a] disabled:opacity-50 text-white py-4 font-semibold text-sm uppercase tracking-widest transition-all">
            {loading ? (
              <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
            ) : step === 4 ? (
              <><Check className="w-4 h-4 text-[#c9a96e]" /> Enviar Cadastro</>
            ) : (
              <>Próximo <ChevronRight className="w-4 h-4" /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}