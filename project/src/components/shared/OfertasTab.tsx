// src/components/shared/OfertasTab.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Aba de Ofertas de Trabalho:
//   • Todos os roles: criar ofertas e ver ofertas
//   • Empresa:    gerir as suas ofertas (fechar/reabrir)
//   • Admin:      ver todas + fechar/remover
//   • Candidatura via WhatsApp/Email sempre visível no card
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useMemo } from 'react';
import {
  Briefcase, MapPin, Plus,
  ChevronRight,
  AlertCircle, X, ImagePlus, Send,
} from 'lucide-react';
import {
  getOpenJobs, getJobs, getJobsByCompany,
  saveJob, updateJob, deleteJob,
  type JobOffer,
} from '../../lib/localStore';
import type { Company } from '../../lib/localStore';
import { ProductDetailModal } from './ProductDetailModal';

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

// ── JobCard ──────────────────────────────────────────────────────────────────

function JobCard({ job, onVerDetalhes }: { job: JobOffer; onVerDetalhes: () => void }) {
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
    <div className="group bg-white overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
      {/* Foto / gradient header */}
      <div className="relative overflow-hidden" style={{ height: 200 }}>
        {job.foto ? (
          <img src={job.foto} alt={job.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        ) : (
          <div className="absolute inset-0 bg-[#0a1628] flex items-center justify-center">
            <Briefcase className="w-16 h-16 text-white/10" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        {/* badges */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className={`text-[9px] font-semibold uppercase px-2 py-0.5 tracking-wider border ${tipoCls}`}>{job.tipo}</span>
          {daysLeft !== null && daysLeft <= 7 && (
            <span className="text-[9px] font-semibold uppercase bg-amber-400 text-amber-900 px-2 py-0.5 tracking-wider">
              Expira em {daysLeft}d
            </span>
          )}
        </div>
        {/* company + title overlay */}
        <div className="absolute bottom-3 left-4 right-4">
          <p className="text-[10px] font-bold text-white/60 uppercase tracking-wider mb-0.5">{job.company_name}</p>
          <h3 className="text-lg font-bold text-white leading-snug line-clamp-2"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            {job.title}
          </h3>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 border-b border-gray-100">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#c9a96e] mb-3">
          {job.contrato} · {job.regime}
        </p>

        <div className="space-y-1.5 mb-4">
          <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            {job.cidade}{job.local ? ` — ${job.local}` : ''}
          </div>
          {job.remuneracao && (
            <div className="flex items-center gap-2 text-xs text-emerald-600 font-bold">
              <span>💰</span> {job.remuneracao}
            </div>
          )}
        </div>

        {job.requisitos && (
          <p className="text-xs text-gray-500 leading-relaxed mb-4 line-clamp-2">{job.requisitos}</p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button onClick={onVerDetalhes}
            className="flex items-center gap-2 text-[#0a1628] font-bold text-xs uppercase tracking-widest hover:gap-3 transition-all group/cta">
            Ver Detalhes
            <ChevronRight className="w-3.5 h-3.5 text-[#c9a96e] group-hover/cta:translate-x-0.5 transition-transform" />
          </button>
          {waLink && (
            <a href={waLink} target="_blank" rel="noopener noreferrer"
              className="ml-auto flex items-center gap-1 bg-green-500 hover:bg-green-400 text-white text-[10px] font-semibold uppercase px-3 py-2 transition-all">
              <Send className="w-3 h-3" /> WhatsApp
            </a>
          )}
          {mailLink && !waLink && (
            <a href={mailLink}
              className="ml-auto flex items-center gap-1 bg-[#0a1628] hover:bg-[#0a1628]/90 text-white text-[10px] font-semibold uppercase px-3 py-2 transition-all">
              <Send className="w-3 h-3" /> Email
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Formulário de criação de oferta — disponível para TODOS os roles ─────────

interface JobForm {
  title: string; description: string; tipo: string;
  pais: string; estado: string; cidade: string;
  contrato: string; regime: string; remuneracao: string; requisitos: string;
  contact_email: string; contact_phone: string; expires_at: string;
  company_name: string; foto: string | null;
}
const EMPTY_JOB: JobForm = {
  title:'', description:'', tipo:'Tripulante', pais:'', estado:'', cidade:'',
  contrato:'Freelance', regime:'Por viagem', remuneracao:'', requisitos:'',
  contact_email:'', contact_phone:'', expires_at:'', company_name:'', foto: null,
};

function NovaOfertaForm({ company, onSuccess, onCancel }: {
  company?: Company; onSuccess: () => void; onCancel: () => void;
}) {
  const [form,    setForm]    = useState<JobForm>({ ...EMPTY_JOB, company_name: company?.nome_fantasia || '' });
  const [error,   setError]   = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const f = (k: keyof JobForm, v: any) => setForm(p => ({...p,[k]:v}));
  const inputCls = "w-full bg-gray-50 border-2 border-gray-100 py-3 px-4 font-bold text-[#1a2b4a] focus:border-[#c9a96e] outline-none text-sm placeholder:text-gray-300";
  const lbl      = "text-[10px] font-semibold text-[#1a2b4a] uppercase tracking-[0.15em] ml-1 mb-1.5 block";

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) { setError('Máximo 4MB.'); return; }
    const reader = new FileReader();
    reader.onload = ev => f('foto', ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  function validate(): string | null {
    if (!form.title.trim())         return 'Título é obrigatório.';
    if (!form.pais.trim())          return 'País é obrigatório.';
    if (!form.cidade.trim())        return 'Cidade é obrigatória.';
    if (!form.description.trim())   return 'Descrição é obrigatória.';
    if (!form.remuneracao.trim())   return 'Valor a ser pago é obrigatório.';
    if (!form.contact_email && !form.contact_phone) return 'Informe email ou telefone para contacto.';
    if (!form.company_name.trim())  return 'Nome da empresa/pessoa é obrigatório.';
    return null;
  }

  function handleSubmit() {
    const err = validate();
    if (err) { setError(err); return; }
    setLoading(true);
    const localStr = [form.estado.trim(), form.pais.trim()].filter(Boolean).join(', ');
    try {
      saveJob({
        company_id:    company?.id || 'user_' + Date.now(),
        company_name:  form.company_name.trim(),
        company_phone: company?.telefone || form.contact_phone.trim(),
        title:         form.title.trim(),
        description:   form.description.trim(),
        tipo:          form.tipo,
        local:         localStr,
        cidade:        form.cidade.trim(),
        contrato:      form.contrato,
        regime:        form.regime,
        remuneracao:   form.remuneracao.trim(),
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
    <div className="bg-white border-2 border-[#c9a96e]/20 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-[#1a2b4a] uppercase tracking-[0.15em]">Ofertar Vaga de Trabalho</p>
        <button onClick={onCancel} className="text-gray-400 hover:text-red-500 text-xs font-semibold">✕ Cancelar</button>
      </div>
      {error && (
        <div className="bg-red-50 border-2 border-red-100 px-4 py-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-red-700 font-bold text-xs">{error}</p>
        </div>
      )}

      {/* Foto opcional */}
      <div>
        <label className={lbl}>Foto (opcional)</label>
        {form.foto ? (
          <div className="relative">
            <img src={form.foto} alt="" className="w-full h-32 object-cover border-2 border-gray-100" />
            <button onClick={() => f('foto', null)} className="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center"><X className="w-3 h-3" /></button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-gray-200 cursor-pointer hover:border-[#c9a96e]/30 transition-colors">
            <ImagePlus className="w-6 h-6 text-gray-300 mb-1" />
            <span className="text-xs font-bold text-gray-400">Adicionar foto</span>
            <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
          </label>
        )}
      </div>

      {/* Nome da empresa/pessoa */}
      <div>
        <label className={lbl}>Empresa / Nome *</label>
        <input value={form.company_name} onChange={e => f('company_name', e.target.value)}
          placeholder="Ex: NorthWindy Lda." className={inputCls} disabled={!!company} />
      </div>

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
              className={`px-3 py-2 text-xs font-semibold border-2 transition-all ${
                form.tipo === t ? 'bg-[#0a1628] text-white border-[#0a1628]' : 'bg-gray-50 text-gray-500 border-gray-100 hover:border-[#c9a96e]/30'
              }`}>{t}</button>
          ))}
        </div>
      </div>

      {/* Localização */}
      <div className="grid grid-cols-3 gap-3">
        <div><label className={lbl}>País *</label><input value={form.pais} onChange={e => f('pais', e.target.value)} placeholder="Portugal" className={inputCls} /></div>
        <div><label className={lbl}>Estado / Região</label><input value={form.estado} onChange={e => f('estado', e.target.value)} placeholder="Lisboa" className={inputCls} /></div>
        <div><label className={lbl}>Cidade *</label><input value={form.cidade} onChange={e => f('cidade', e.target.value)} placeholder="Cascais" className={inputCls} /></div>
      </div>

      {/* Contrato + Regime */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={lbl}>Contrato</label>
          <select value={form.contrato} onChange={e => f('contrato', e.target.value)}
            className="w-full bg-gray-50 border-2 border-gray-100 py-3 px-4 text-sm font-semibold text-[#1a2b4a] focus:border-[#c9a96e] outline-none">
            {['CLT','Freelance','Temporário','Estágio','Voluntário'].map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className={lbl}>Regime</label>
          <select value={form.regime} onChange={e => f('regime', e.target.value)}
            className="w-full bg-gray-50 border-2 border-gray-100 py-3 px-4 text-sm font-semibold text-[#1a2b4a] focus:border-[#c9a96e] outline-none">
            {['Full-time','Part-time','Por viagem','Temporário','À chamada'].map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className={lbl}>Valor a Pagar / Remuneração *</label>
        <input value={form.remuneracao} onChange={e => f('remuneracao', e.target.value)}
          placeholder="Ex: €50/hora · €1.200/mês · Combinável" className={inputCls} />
      </div>

      <div>
        <label className={lbl}>Descrição da Função *</label>
        <textarea value={form.description} onChange={e => f('description', e.target.value)} rows={3}
          placeholder="Descreva as responsabilidades, tipo de embarcação, rotas…"
          className="w-full bg-gray-50 border-2 border-gray-100 py-3 px-4 font-bold text-[#1a2b4a] focus:border-[#c9a96e] outline-none text-sm placeholder:text-gray-300 resize-none" />
      </div>

      <div>
        <label className={lbl}>Requisitos Mínimos *</label>
        <textarea value={form.requisitos} onChange={e => f('requisitos', e.target.value)} rows={3}
          placeholder="Ex: PCA-II, STCW, experiência em veleiro, 2 anos de mar…"
          className="w-full bg-gray-50 border-2 border-gray-100 py-3 px-4 font-bold text-[#1a2b4a] focus:border-[#c9a96e] outline-none text-sm placeholder:text-gray-300 resize-none" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div><label className={lbl}>E-mail de Contacto</label><input type="email" value={form.contact_email} onChange={e => f('contact_email', e.target.value)} placeholder="rh@empresa.com" className={inputCls} /></div>
        <div><label className={lbl}>WhatsApp</label><input value={form.contact_phone} onChange={e => f('contact_phone', e.target.value)} placeholder="+351 912 345 678" className={inputCls} /></div>
      </div>

      <div>
        <label className={lbl}>Data de Expiração (opcional)</label>
        <input type="date" value={form.expires_at} min={new Date().toISOString().split('T')[0]}
          onChange={e => f('expires_at', e.target.value)} className={inputCls} />
      </div>

      <button onClick={handleSubmit} disabled={loading}
        className="w-full bg-[#0a1628] hover:bg-[#0a1628]/90 disabled:opacity-50 text-white py-4 font-semibold text-sm uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2">
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
  company?: Company;
  sailorId?: string;
}

export function OfertasTab({ role, company, sailorId }: Props) {
  const [subTab,    setSubTab]    = useState<'lista' | 'minhas' | 'nova'>('lista');
  const [search,    setSearch]    = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  const [renderKey, setRenderKey] = useState(0);
  const [selected,  setSelected]  = useState<JobOffer | null>(null);

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

      {/* Botão "Ofertar Vaga" — TOPO, disponível para TODOS os roles */}
      {subTab !== 'nova' && (
        <button onClick={() => setSubTab('nova')}
          className="w-full bg-[#0a1628] hover:bg-[#0a1628]/90 text-white py-4 font-semibold text-sm uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" /> Ofertar Vaga de Trabalho
        </button>
      )}

      {/* Sub-tabs — para empresa (minhas ofertas) */}
      {role === 'company' && company && (
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { key: 'lista' as const,  label: 'Ofertas Abertas',  icon: '🔍' },
            { key: 'minhas' as const, label: 'Minhas Ofertas',   icon: '📋' },
          ].map(t => (
            <button key={t.key} onClick={() => setSubTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2.5 font-semibold text-xs uppercase transition-all ${
                subTab === t.key ? 'bg-[#0a1628] text-white shadow-md' : 'bg-white border-2 border-gray-100 text-gray-500 hover:border-[#c9a96e]/30'
              }`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      )}

      {/* Nova oferta */}
      {subTab === 'nova' && (
        <NovaOfertaForm
          company={company}
          onSuccess={() => { reload(); setSubTab(role === 'company' ? 'minhas' : 'lista'); }}
          onCancel={() => setSubTab('lista')}
        />
      )}

      {/* Minhas ofertas (empresa) */}
      {role === 'company' && subTab === 'minhas' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-['Playfair_Display'] font-bold text-[#1a2b4a]">Minhas Ofertas</h2>
              <p className="text-xs text-gray-400 font-bold mt-0.5">{companyJobs.length} oferta{companyJobs.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          {companyJobs.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-gray-200 py-12 text-center">
              <div className="text-4xl mb-3">💼</div>
              <p className="font-semibold text-gray-300 uppercase italic text-sm">Nenhuma oferta criada</p>
              <button onClick={() => setSubTab('nova')}
                className="mt-3 bg-[#0a1628] text-white px-5 py-2.5 font-semibold text-xs uppercase hover:bg-[#0a1628]/90 transition-all">
                Criar Oferta
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {companyJobs.map(job => (
                <div key={job.id} className="bg-white border-2 border-gray-100 px-4 py-3 flex items-center gap-3">
                  <div className="w-9 h-9 bg-[#0a1628] flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-4 h-4 text-[#c9a96e]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#1a2b4a] text-sm truncate">{job.title}</p>
                    <p className="text-xs font-bold text-gray-500">{job.tipo} · {job.cidade} · {job.regime}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 ${job.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {job.status === 'open' ? 'Aberta' : 'Fechada'}
                    </span>
                    <button onClick={() => { updateJob(job.id, { status: job.status === 'open' ? 'closed' : 'open' }); reload(); }}
                      className="text-[9px] font-semibold text-[#c9a96e] hover:text-[#1a2b4a] underline transition-colors">
                      {job.status === 'open' ? 'Fechar' : 'Reabrir'}
                    </button>
                    <button onClick={() => { deleteJob(job.id); reload(); }}
                      className="text-[9px] font-semibold text-red-400 hover:text-red-600 underline transition-colors">
                      Remover
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Lista de ofertas */}
      {subTab === 'lista' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-['Playfair_Display'] font-bold text-[#1a2b4a]">
              {role === 'admin' ? 'Todas as Ofertas' : 'Ofertas de Trabalho'}
            </h2>
            <p className="text-xs text-gray-400 font-bold mt-0.5">
              {filtered.length} oferta{filtered.length !== 1 ? 's' : ''} disponível{filtered.length !== 1 ? 'is' : ''}
            </p>
          </div>

          {/* Filtros */}
          <div className="bg-white border-2 border-gray-100 p-3 space-y-2">
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por cargo, empresa, cidade…"
              className="w-full bg-gray-50 border-2 border-gray-100 py-2.5 px-4 font-bold text-[#1a2b4a] focus:border-[#c9a96e] outline-none text-sm placeholder:text-gray-300" />
            {tipos.length > 1 && (
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setFilterTipo('')}
                  className={`px-3 py-1.5 text-xs font-semibold border-2 transition-all ${!filterTipo ? 'bg-[#0a1628] text-white border-[#0a1628]' : 'bg-gray-50 text-gray-500 border-gray-100 hover:border-[#c9a96e]/30'}`}>
                  Todos
                </button>
                {tipos.map(t => (
                  <button key={t} onClick={() => setFilterTipo(filterTipo === t ? '' : t)}
                    className={`px-3 py-1.5 text-xs font-semibold border-2 transition-all ${filterTipo === t ? 'bg-[#0a1628] text-white border-[#0a1628]' : 'bg-gray-50 text-gray-500 border-gray-100 hover:border-[#c9a96e]/30'}`}>
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-gray-200 py-14 text-center">
              <div className="text-4xl mb-3">💼</div>
              <p className="font-semibold text-gray-300 uppercase italic text-sm">
                {allJobs.length === 0 ? 'Nenhuma oferta de trabalho disponível' : 'Nenhuma oferta corresponde à busca'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(job => <JobCard key={job.id} job={job} onVerDetalhes={() => setSelected(job)} />)}
            </div>
          )}
        </div>
      )}

      {/* Modal de detalhes da oferta */}
      {selected && (() => {
        const waMsg = `Olá! Vi a oferta *${selected.title}* (${selected.company_name}) na NorthWindy e tenho interesse em candidatar-me. 🌊`;
        const waLink = selected.contact_phone
          ? `https://wa.me/${selected.contact_phone.replace(/\D/g,'')}?text=${encodeURIComponent(waMsg)}`
          : null;
        const mailLink = selected.contact_email
          ? `mailto:${selected.contact_email}?subject=${encodeURIComponent(`Candidatura: ${selected.title}`)}&body=${encodeURIComponent(waMsg)}`
          : null;
        return (
          <ProductDetailModal
            title={selected.title}
            subtitle={`${selected.company_name} · ${selected.tipo}`}
            fotos={selected.foto ? [selected.foto] : []}
            location={`${selected.cidade}${selected.local ? ` — ${selected.local}` : ''}`}
            badge={selected.contrato}
            specs={[
              { label: 'Tipo', value: selected.tipo },
              { label: 'Regime', value: selected.regime },
              { label: 'Contrato', value: selected.contrato },
              { label: 'Remuneração', value: selected.remuneracao || '—' },
            ]}
            sections={[
              ...(selected.requisitos ? [{ title: 'Requisitos Mínimos', content: selected.requisitos }] : []),
              { title: 'Descrição da Função', content: selected.description },
              { title: 'Publicado em', content: fmtDate(selected.created_at) },
            ]}
            footerActions={
              <div className="flex gap-2">
                {waLink && (
                  <a href={waLink} target="_blank" rel="noopener noreferrer"
                    className="flex-1 bg-green-500 hover:bg-green-400 text-white py-3 font-semibold text-xs uppercase transition-all flex items-center justify-center gap-2 shadow-md shadow-green-500/20">
                    <Send className="w-3.5 h-3.5" /> Candidatar via WhatsApp
                  </a>
                )}
                {mailLink && !waLink && (
                  <a href={mailLink}
                    className="flex-1 bg-[#0a1628] hover:bg-[#0a1628]/90 text-white py-3 font-semibold text-xs uppercase transition-all flex items-center justify-center gap-2">
                    <Send className="w-3.5 h-3.5" /> Candidatar por E-mail
                  </a>
                )}
              </div>
            }
            onClose={() => setSelected(null)}
          />
        );
      })()}
    </div>
  );
}
