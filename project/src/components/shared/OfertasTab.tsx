// src/components/shared/OfertasTab.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Aba de Ofertas de Trabalho:
//   • Empresa:    criar e gerir as suas ofertas
//   • Tripulante: ver ofertas e candidatar-se via WhatsApp
//   • Admin:      ver todas + fechar/remover
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useMemo } from 'react';
import {
  Briefcase, MapPin, Clock, Users, Plus,
  ChevronDown, ChevronUp, ExternalLink,
  AlertCircle, XCircle, CheckCircle2, Anchor,
} from 'lucide-react';
import {
  getOpenJobs, getJobs, getJobsByCompany,
  saveJob, updateJob, deleteJob,
  type JobOffer,
} from '../../lib/localStore';
import type { Company } from '../../lib/localStore';

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-PT', { day:'2-digit', month:'short', year:'numeric' });
}

const TIPO_CORES: Record<string, string> = {
  Skipper:    'bg-blue-50 text-blue-700 border-blue-100',
  Tripulante: 'bg-teal-50 text-teal-700 border-teal-100',
  Docente:    'bg-purple-50 text-purple-700 border-purple-100',
  Mecânico:   'bg-orange-50 text-orange-700 border-orange-100',
  Outro:      'bg-gray-50 text-gray-600 border-gray-100',
};

const CONTRATO_ICONS: Record<string, string> = {
  CLT: '📄', Freelance: '🤝', Temporário: '📅', Estágio: '🎓', Voluntário: '💙',
};

// ── JobCard (visão pública — para sailors e visitantes) ───────────────────────

function JobCard({ job }: { job: JobOffer }) {
  const [expanded, setExpanded] = useState(false);
  const tipoCls = TIPO_CORES[job.tipo] || TIPO_CORES.Outro;
  const daysLeft = job.expires_at
    ? Math.ceil((new Date(job.expires_at).getTime() - Date.now()) / 86400000)
    : null;

  const waMsg = `Olá! Vi a oferta *${job.title}* (${job.company_name}) na NorthWindy e tenho interesse em candidatar-me. Poderia dar mais informações? 🌊`;
  const waLink = job.contact_phone
    ? `https://wa.me/${job.contact_phone.replace(/\D/g,'')}?text=${encodeURIComponent(waMsg)}`
    : null;
  const mailLink = job.contact_email
    ? `mailto:${job.contact_email}?subject=${encodeURIComponent(`Candidatura: ${job.title}`)}&body=${encodeURIComponent(waMsg)}`
    : null;

  return (
    <div className="bg-white border-2 border-gray-100 rounded-[22px] overflow-hidden hover:border-blue-200 transition-all">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 px-5 py-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-[12px] flex items-center justify-center flex-shrink-0">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${tipoCls}`}>{job.tipo}</span>
              <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {CONTRATO_ICONS[job.contrato] || ''} {job.contrato}
              </span>
              {daysLeft !== null && daysLeft <= 7 && (
                <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-2 py-0.5 rounded-full">
                  ⏳ Expira em {daysLeft}d
                </span>
              )}
            </div>
            <p className="font-black text-white text-sm leading-tight">{job.title}</p>
            <p className="text-blue-300 text-[11px] font-bold mt-0.5 truncate">{job.company_name}</p>
          </div>
        </div>
      </div>

      {/* Corpo */}
      <div className="px-5 py-4 space-y-3">
        {/* Info rápida */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
            <MapPin className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
            <span className="truncate">{job.local} — {job.cidade}</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
            <Clock className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
            <span>{job.regime}</span>
          </div>
          {job.remuneracao && (
            <div className="flex items-center gap-2 text-xs font-bold text-green-600">
              <span className="text-base">💰</span>
              <span>{job.remuneracao}</span>
            </div>
          )}
        </div>

        {/* Descrição expansível */}
        <button onClick={() => setExpanded(v => !v)}
          className="flex items-center gap-1 text-[11px] font-black text-blue-600 hover:text-blue-900 transition-colors">
          {expanded ? <><ChevronUp className="w-3 h-3" /> Ocultar</> : <><ChevronDown className="w-3 h-3" /> Ver detalhes</>}
        </button>

        {expanded && (
          <div className="space-y-2 animate-in fade-in duration-150">
            <div className="bg-gray-50 rounded-[12px] px-3 py-2.5">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-1">Descrição</p>
              <p className="text-xs font-bold text-gray-700 leading-relaxed whitespace-pre-line">{job.description}</p>
            </div>
            {job.requisitos && (
              <div className="bg-blue-50 rounded-[12px] px-3 py-2.5">
                <p className="text-[9px] font-black text-blue-500 uppercase tracking-wider mb-1">Requisitos</p>
                <p className="text-xs font-bold text-blue-900 leading-relaxed whitespace-pre-line">{job.requisitos}</p>
              </div>
            )}
            <p className="text-[10px] font-bold text-gray-400">📅 Publicado em {fmtDate(job.created_at)}</p>
          </div>
        )}

        {/* CTAs */}
        <div className="flex gap-2">
          {waLink && (
            <a href={waLink} target="_blank" rel="noopener noreferrer"
              className="flex-1 bg-green-500 hover:bg-green-400 text-white py-3 rounded-[12px] font-black text-xs uppercase transition-all flex items-center justify-center gap-1.5">
              📲 Candidatar via WhatsApp
            </a>
          )}
          {mailLink && !waLink && (
            <a href={mailLink}
              className="flex-1 bg-blue-700 hover:bg-blue-600 text-white py-3 rounded-[12px] font-black text-xs uppercase transition-all flex items-center justify-center gap-1.5">
              📧 Candidatar por E-mail
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Formulário de criação de oferta ──────────────────────────────────────────

interface JobForm {
  title: string; description: string; tipo: string; local: string; cidade: string;
  contrato: string; regime: string; remuneracao: string; requisitos: string;
  contact_email: string; contact_phone: string; expires_at: string;
}
const EMPTY_JOB: JobForm = {
  title:'', description:'', tipo:'Tripulante', local:'', cidade:'',
  contrato:'Freelance', regime:'Por viagem', remuneracao:'', requisitos:'',
  contact_email:'', contact_phone:'', expires_at:'',
};

function NovaOfertaForm({ company, onSuccess, onCancel }: {
  company: Company; onSuccess: () => void; onCancel: () => void;
}) {
  const [form,    setForm]    = useState<JobForm>(EMPTY_JOB);
  const [error,   setError]   = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const f = (k: keyof JobForm, v: string) => setForm(p => ({...p,[k]:v}));
  const inputCls = "w-full bg-gray-50 border-2 border-gray-100 rounded-[14px] py-3 px-4 font-bold text-blue-900 focus:border-blue-900 outline-none text-sm placeholder:text-gray-300";
  const lbl      = "text-[10px] font-black text-blue-900 uppercase tracking-wider ml-1 mb-1.5 block";

  function validate(): string | null {
    if (!form.title.trim())         return 'Título é obrigatório.';
    if (!form.local.trim())         return 'Local é obrigatório.';
    if (!form.cidade.trim())        return 'Cidade é obrigatória.';
    if (!form.description.trim())   return 'Descrição é obrigatória.';
    if (!form.contact_email && !form.contact_phone) return 'Informe email ou telefone para contacto.';
    return null;
  }

  function handleSubmit() {
    const err = validate();
    if (err) { setError(err); return; }
    setLoading(true);
    try {
      saveJob({
        company_id:    company.id,
        company_name:  company.nome_fantasia,
        company_phone: company.telefone,
        title:         form.title.trim(),
        description:   form.description.trim(),
        tipo:          form.tipo,
        local:         form.local.trim(),
        cidade:        form.cidade.trim(),
        contrato:      form.contrato,
        regime:        form.regime,
        remuneracao:   form.remuneracao.trim() || undefined,
        requisitos:    form.requisitos.trim(),
        contact_email: form.contact_email.trim(),
        contact_phone: form.contact_phone.trim() || undefined,
        expires_at:    form.expires_at || undefined,
      });
      onSuccess();
    } catch { setError('Erro ao criar oferta.'); }
    finally { setLoading(false); }
  }

  return (
    <div className="bg-white border-2 border-blue-100 rounded-[22px] p-5 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-black text-blue-900 uppercase tracking-wider">Nova Oferta de Trabalho</p>
        <button onClick={onCancel} className="text-gray-400 hover:text-red-500 text-xs font-black">✕ Cancelar</button>
      </div>
      {error && (
        <div className="bg-red-50 border-2 border-red-100 rounded-[12px] px-4 py-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-red-700 font-bold text-xs">{error}</p>
        </div>
      )}

      <div>
        <label className={lbl}>Cargo / Título *</label>
        <input value={form.title} onChange={e => f('title', e.target.value)}
          placeholder="Ex: Skipper para veleiro de 40 pés" className={inputCls} />
      </div>

      {/* Tipo */}
      <div>
        <label className={lbl}>Tipo de Profissional *</label>
        <div className="flex flex-wrap gap-2">
          {['Skipper','Tripulante','Docente','Mecânico','Outro'].map(t => (
            <button key={t} onClick={() => f('tipo', t)}
              className={`px-3 py-2 rounded-[12px] text-xs font-black border-2 transition-all ${
                form.tipo === t ? 'bg-blue-900 text-white border-blue-900' : 'bg-gray-50 text-gray-500 border-gray-100 hover:border-blue-300'
              }`}>{t}</button>
          ))}
        </div>
      </div>

      {/* Local + Cidade */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={lbl}>Local / Porto *</label>
          <input value={form.local} onChange={e => f('local', e.target.value)} placeholder="Ex: Marina de Cascais" className={inputCls} />
        </div>
        <div>
          <label className={lbl}>Cidade *</label>
          <input value={form.cidade} onChange={e => f('cidade', e.target.value)} placeholder="Ex: Cascais" className={inputCls} />
        </div>
      </div>

      {/* Contrato + Regime */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={lbl}>Contrato</label>
          <select value={form.contrato} onChange={e => f('contrato', e.target.value)}
            className="w-full bg-gray-50 border-2 border-gray-100 rounded-[14px] py-3 px-4 text-sm font-black text-blue-900 focus:border-blue-900 outline-none">
            {['CLT','Freelance','Temporário','Estágio','Voluntário'].map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className={lbl}>Regime</label>
          <select value={form.regime} onChange={e => f('regime', e.target.value)}
            className="w-full bg-gray-50 border-2 border-gray-100 rounded-[14px] py-3 px-4 text-sm font-black text-blue-900 focus:border-blue-900 outline-none">
            {['Full-time','Part-time','Por viagem','Temporário','À chamada'].map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className={lbl}>Remuneração (opcional)</label>
        <input value={form.remuneracao} onChange={e => f('remuneracao', e.target.value)}
          placeholder="Ex: €50/hora · €1.200/mês · Combinável" className={inputCls} />
      </div>

      <div>
        <label className={lbl}>Descrição da Função *</label>
        <textarea value={form.description} onChange={e => f('description', e.target.value)} rows={3}
          placeholder="Descreva as responsabilidades, tipo de embarcação, rotas…"
          className="w-full bg-gray-50 border-2 border-gray-100 rounded-[14px] py-3 px-4 font-bold text-blue-900 focus:border-blue-900 outline-none text-sm placeholder:text-gray-300 resize-none" />
      </div>

      <div>
        <label className={lbl}>Requisitos</label>
        <textarea value={form.requisitos} onChange={e => f('requisitos', e.target.value)} rows={3}
          placeholder="Ex: PCA-II, STCW, experiência em veleiro…"
          className="w-full bg-gray-50 border-2 border-gray-100 rounded-[14px] py-3 px-4 font-bold text-blue-900 focus:border-blue-900 outline-none text-sm placeholder:text-gray-300 resize-none" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={lbl}>E-mail de Contacto</label>
          <input type="email" value={form.contact_email} onChange={e => f('contact_email', e.target.value)}
            placeholder="rh@empresa.com" className={inputCls} />
        </div>
        <div>
          <label className={lbl}>WhatsApp de Contacto</label>
          <input value={form.contact_phone} onChange={e => f('contact_phone', e.target.value)}
            placeholder="+351 912 345 678" className={inputCls} />
        </div>
      </div>

      <div>
        <label className={lbl}>Data de Expiração (opcional)</label>
        <input type="date" value={form.expires_at} min={new Date().toISOString().split('T')[0]}
          onChange={e => f('expires_at', e.target.value)} className={inputCls} />
      </div>

      <button onClick={handleSubmit} disabled={loading}
        className="w-full bg-blue-900 hover:bg-blue-800 disabled:opacity-50 text-white py-4 rounded-[16px] font-black text-sm uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2">
        {loading
          ? <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
          : <><Plus className="w-4 h-4" /> Publicar Oferta</>
        }
      </button>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

interface Props {
  role:     'admin' | 'sailor' | 'company' | null;
  company?: Company;            // para role=company
  sailorId?: string;            // para role=sailor (futuro: candidaturas)
}

export function OfertasTab({ role, company, sailorId }: Props) {
  const [subTab,    setSubTab]    = useState<'lista' | 'minhas' | 'nova'>('lista');
  const [search,    setSearch]    = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  const [renderKey, setRenderKey] = useState(0);

  function reload() { setRenderKey(k => k + 1); }

  const publicJobs  = getOpenJobs();
  const companyJobs = company ? getJobsByCompany(company.id) : [];
  const allJobs     = role === 'admin' ? getJobs() : publicJobs;

  const tipos = Array.from(new Set(allJobs.map(j => j.tipo))).sort();

  const filtered = useMemo(() => {
    let list = role === 'company' ? publicJobs : allJobs;
    if (filterTipo) list = list.filter(j => j.tipo === filterTipo);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(j =>
        j.title.toLowerCase().includes(q) ||
        j.company_name.toLowerCase().includes(q) ||
        j.cidade.toLowerCase().includes(q) ||
        j.tipo.toLowerCase().includes(q)
      );
    }
    return list;
  }, [allJobs, publicJobs, filterTipo, search, role]);

  return (
    <div className="space-y-4" key={renderKey}>
      {/* Sub-tabs — só para empresa */}
      {role === 'company' && company && (
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { key: 'lista' as const,  label: 'Ofertas Abertas',  icon: '🔍' },
            { key: 'minhas' as const, label: 'Minhas Ofertas',   icon: '📋' },
            { key: 'nova' as const,   label: 'Nova Oferta',      icon: '➕' },
          ].map(t => (
            <button key={t.key} onClick={() => setSubTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-[14px] font-black text-xs uppercase transition-all ${
                subTab === t.key ? 'bg-blue-900 text-white shadow-md' : 'bg-white border-2 border-gray-100 text-gray-500 hover:border-blue-200'
              }`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      )}

      {/* Nova oferta */}
      {role === 'company' && company && subTab === 'nova' && (
        <NovaOfertaForm
          company={company}
          onSuccess={() => { reload(); setSubTab('minhas'); }}
          onCancel={() => setSubTab('lista')}
        />
      )}

      {/* Minhas ofertas (empresa) */}
      {role === 'company' && subTab === 'minhas' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-blue-900 uppercase italic">Minhas Ofertas</h2>
              <p className="text-xs text-gray-400 font-bold mt-0.5">{companyJobs.length} oferta{companyJobs.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          {companyJobs.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-gray-200 rounded-[24px] py-12 text-center">
              <div className="text-4xl mb-3">💼</div>
              <p className="font-black text-gray-300 uppercase italic text-sm">Nenhuma oferta criada</p>
              <button onClick={() => setSubTab('nova')}
                className="mt-3 bg-blue-900 text-white px-5 py-2.5 rounded-[12px] font-black text-xs uppercase hover:bg-blue-800 transition-all">
                Criar Oferta
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {companyJobs.map(job => (
                <div key={job.id} className="bg-white border-2 border-gray-100 rounded-[18px] px-4 py-3 flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-blue-900 text-sm truncate">{job.title}</p>
                    <p className="text-xs font-bold text-gray-500">{job.tipo} · {job.cidade} · {job.regime}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${job.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {job.status === 'open' ? 'Aberta' : 'Fechada'}
                    </span>
                    <button onClick={() => updateJob(job.id, { status: job.status === 'open' ? 'closed' : 'open' }); reload()}
                      className="text-[9px] font-black text-blue-600 hover:text-blue-900 underline transition-colors">
                      {job.status === 'open' ? 'Fechar' : 'Reabrir'}
                    </button>
                    <button onClick={() => { deleteJob(job.id); reload(); }}
                      className="text-[9px] font-black text-red-400 hover:text-red-600 underline transition-colors">
                      Remover
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Lista de ofertas (todos os roles no modo lista) */}
      {(role !== 'company' || subTab === 'lista') && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-black text-blue-900 uppercase italic">
              {role === 'admin' ? 'Todas as Ofertas' : 'Ofertas de Trabalho'}
            </h2>
            <p className="text-xs text-gray-400 font-bold mt-0.5">
              {filtered.length} oferta{filtered.length !== 1 ? 's' : ''} disponível{filtered.length !== 1 ? 'is' : ''}
            </p>
          </div>

          {/* Filtros */}
          <div className="bg-white border-2 border-gray-100 rounded-[18px] p-3 space-y-2">
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por cargo, empresa, cidade…"
              className="w-full bg-gray-50 border-2 border-gray-100 rounded-[14px] py-2.5 px-4 font-bold text-blue-900 focus:border-blue-900 outline-none text-sm placeholder:text-gray-300" />
            {tipos.length > 1 && (
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setFilterTipo('')}
                  className={`px-3 py-1.5 rounded-[12px] text-xs font-black border-2 transition-all ${!filterTipo ? 'bg-blue-900 text-white border-blue-900' : 'bg-gray-50 text-gray-500 border-gray-100 hover:border-blue-300'}`}>
                  Todos
                </button>
                {tipos.map(t => (
                  <button key={t} onClick={() => setFilterTipo(filterTipo === t ? '' : t)}
                    className={`px-3 py-1.5 rounded-[12px] text-xs font-black border-2 transition-all ${filterTipo === t ? 'bg-blue-900 text-white border-blue-900' : 'bg-gray-50 text-gray-500 border-gray-100 hover:border-blue-300'}`}>
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-gray-200 rounded-[24px] py-14 text-center">
              <div className="text-4xl mb-3">💼</div>
              <p className="font-black text-gray-300 uppercase italic text-sm">
                {allJobs.length === 0 ? 'Nenhuma oferta de trabalho disponível' : 'Nenhuma oferta corresponde à busca'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map(job => <JobCard key={job.id} job={job} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}