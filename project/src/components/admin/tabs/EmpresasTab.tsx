// src/components/admin/tabs/EmpresasTab.tsx
import { useState } from 'react';
import {
  Building2, Globe, Phone, Mail, MapPin, Search,
  ExternalLink, Instagram, Linkedin, Facebook,
  ShieldCheck, Filter, Copy, KeyRound, ChevronDown, ChevronUp, X, Star,
} from 'lucide-react';
import { usePagination } from '../../../hooks/usePagination';
import { Pagination }    from '../../shared/Pagination';
import {
  getCompanies, updateCompany, deleteCompany,
  type Company,
} from '../../../lib/localStore';

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="bg-[#1a2b4a] hover:bg-[#0a1628] text-white p-1 transition-all" title="Copiar">
      {copied ? <ShieldCheck className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
    </button>
  );
}

function StatusBadge({ status }: { status: Company['status'] }) {
  const map = {
    active:    { label: 'Ativa',    cls: 'bg-green-100 text-green-700' },
    inactive:  { label: 'Inativa',  cls: 'bg-gray-100 text-gray-500' },
    suspended: { label: 'Suspensa', cls: 'bg-red-100 text-red-600' },
    pending:   { label: 'Pendente', cls: 'bg-amber-100 text-amber-700' },
  };
  const { label, cls } = map[status] ?? map.pending;
  return <span className={`text-[10px] font-semibold uppercase px-2.5 py-1 ${cls}`}>{label}</span>;
}

function CompanyCard({ company, onStatusChange, onDelete, defaultExpanded = false }: {
  company: Company;
  onStatusChange: (id: string, status: Company['status']) => void;
  onDelete: (id: string) => void;
  defaultExpanded?: boolean;
}) {
  const [expanded,   setExpanded]   = useState(defaultExpanded);
  const [showCreds,  setShowCreds]  = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);

  const hasSocial      = company.instagram || company.linkedin || company.facebook || company.outras_redes;
  const hasCredentials = (company as any).company_login && (company as any).company_password;
  const waPhone        = company.telefone.replace(/\D/g, '');
  const waLink         = `https://wa.me/${waPhone}`;

  function buildCredentialsWaUrl() {
    const login    = (company as any).company_login    || '';
    const password = (company as any).company_password || '';
    const msg = [
      `🏢 *NorthWindy — Área da Empresa*`,
      ``,
      `Olá, ${company.nome_fantasia}! 🌊`,
      ``,
      `O seu acesso à plataforma NorthWindy foi activado.`,
      ``,
      `🔑 *Credenciais de Acesso*`,
      `*Login:* ${login}`,
      `*Senha:* ${password}`,
      ``,
      `Aceda em: https://northwindy.com → Área da Empresa`,
      ``,
      `Equipa NorthWindy ⚓`,
    ].join('\n');
    return `https://wa.me/${waPhone}?text=${encodeURIComponent(msg)}`;
  }

  return (
    <div className="bg-white overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-700 to-amber-500 px-6 py-4 flex items-center gap-4">
        <div className="w-12 h-12 bg-white/20 flex items-center justify-center flex-shrink-0">
          <Building2 className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-white uppercase truncate text-base">{company.nome_fantasia}</p>
          <p className="text-amber-200 text-[11px] font-bold truncate">{company.razao_social}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <StatusBadge status={company.status} />
          <span className="bg-white/20 text-white text-[9px] font-semibold px-2 py-0.5">{company.profile_number}</span>
        </div>
      </div>

      <div className="p-5 space-y-3">
        {/* Setores — múltiplos */}
        <div className="flex flex-wrap gap-1.5">
          {company.setor.split(',').map(s => (
            <span key={s} className="inline-flex items-center gap-1 bg-[#c9a96e]/5 border border-[#c9a96e]/20 text-[#1a2b4a] text-[11px] font-semibold px-2.5 py-1">
              🏭 {s.trim()}
            </span>
          ))}
        </div>

        {/* Localização + email */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
            <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <span className="truncate">{company.cidade}{company.estado ? `, ${company.estado}` : ''} · {company.pais_nome}</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
            <Mail className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <span className="truncate">{company.email}</span>
          </div>

          {/* Telefone → botão WhatsApp direto */}
          <a href={waLink} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs font-bold text-green-600 hover:text-green-500 transition-colors group w-full">
            <div className="w-5 h-5 bg-green-100 group-hover:bg-green-200 flex items-center justify-center flex-shrink-0 transition-colors">
              <Phone className="w-3 h-3 text-green-600" />
            </div>
            <span className="truncate flex-1">{company.telefone}</span>
            <span className="text-[10px] font-semibold bg-green-100 text-green-700 px-2 py-0.5 flex-shrink-0">WhatsApp ↗</span>
          </a>

          {company.website && (
            <div className="flex items-center gap-2 text-xs font-bold text-[#1a2b4a]">
              <Globe className="w-3.5 h-3.5 flex-shrink-0" />
              <a href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                target="_blank" rel="noreferrer"
                className="truncate hover:underline flex items-center gap-1">
                {company.website.replace(/^https?:\/\//, '')}
                <ExternalLink className="w-3 h-3 flex-shrink-0" />
              </a>
            </div>
          )}
        </div>

        {/* Credenciais colapsáveis */}
        {hasCredentials && (
          <div className="border-2 border-[#c9a96e]/20 overflow-hidden">
            <button
              onClick={() => setShowCreds(v => !v)}
              className={`w-full flex items-center justify-between px-4 py-3 text-xs font-semibold uppercase tracking-wide transition-all ${
                showCreds ? 'bg-[#0a1628] text-white' : 'bg-[#0a1628]/5 text-[#1a2b4a] hover:bg-[#0a1628]/10'
              }`}>
              <div className="flex items-center gap-2">
                <KeyRound className="w-3.5 h-3.5" />
                Credenciais de acesso
              </div>
              {showCreds ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showCreds && (
              <div className="bg-[#0a1628] px-4 pb-4 pt-3 space-y-2 animate-in fade-in duration-150">
                {([
                  ['Login', (company as any).company_login],
                  ['Senha', (company as any).company_password],
                ] as [string, string][]).map(([l, v]) => (
                  <div key={l} className="flex items-center justify-between bg-[#1a2b4a] px-4 py-2.5">
                    <span className="text-[#c9a96e] text-xs font-bold uppercase">{l}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold text-sm">{v}</span>
                      <CopyBtn text={v} />
                    </div>
                  </div>
                ))}
                <a href={buildCredentialsWaUrl()} target="_blank" rel="noopener noreferrer"
                  className="w-full bg-green-500 hover:bg-green-400 text-white py-3 font-semibold uppercase text-xs transition-all flex items-center justify-center gap-2 shadow-md">
                  📲 Enviar Credenciais via WhatsApp
                </a>
              </div>
            )}
          </div>
        )}

        {/* Toggle detalhes */}
        <button onClick={() => setExpanded(v => !v)}
          className="w-full text-center text-[11px] font-semibold text-[#1a2b4a] hover:text-[#c9a96e] transition-colors flex items-center justify-center gap-1 py-0.5">
          {expanded ? <><ChevronUp className="w-3.5 h-3.5" /> Ocultar detalhes</> : <><ChevronDown className="w-3.5 h-3.5" /> Ver mais detalhes</>}
        </button>

        {expanded && (
          <div className="space-y-3 border-t border-gray-100 pt-3">
            <div className="grid grid-cols-2 gap-2">
              {[
                ['Nº Fiscal',   `${company.numero_fiscal} (${company.pais_fiscal})`],
                ['Nº Registro', company.numero_registro],
                ['Endereço',    company.endereco],
                ['Cód. Postal', company.codigo_postal],
              ].filter(([, v]) => v).map(([l, v]) => (
                <div key={l} className="bg-gray-50 p-2.5">
                  <p className="text-[9px] font-semibold text-gray-400 uppercase">{l}</p>
                  <p className="font-bold text-[#1a2b4a] text-xs mt-0.5 truncate">{v}</p>
                </div>
              ))}
            </div>

            <div className="bg-[#0a1628]/5 p-3">
              <p className="text-[9px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em] mb-2">👤 Responsável</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  ['Nome',  company.resp_nome],
                  ['Cargo', company.resp_cargo],
                  ['Email', company.resp_email],
                  ['Tel.',  company.resp_telefone],
                ].filter(([, v]) => v).map(([l, v]) => (
                  <div key={l} className="bg-white p-2">
                    <p className="text-[9px] font-semibold text-gray-400 uppercase">{l}</p>
                    <p className="font-bold text-[#1a2b4a] text-[11px] mt-0.5 truncate">{v}</p>
                  </div>
                ))}
              </div>
            </div>

            {hasSocial && (
              <div className="flex flex-wrap gap-2">
                {company.instagram && (
                  <a href={company.instagram.startsWith('http') ? company.instagram : `https://www.instagram.com/${company.instagram.replace(/^@/,'')}`}
                    target="_blank" rel="noreferrer"
                    className="flex items-center gap-1.5 bg-pink-50 border border-pink-100 text-pink-700 text-[11px] font-semibold px-3 py-1.5 hover:bg-pink-100">
                    <Instagram className="w-3 h-3" /> Instagram
                  </a>
                )}
                {company.linkedin && (
                  <a href={company.linkedin.startsWith('http') ? company.linkedin : `https://${company.linkedin}`}
                    target="_blank" rel="noreferrer"
                    className="flex items-center gap-1.5 bg-[#0a1628]/5 border border-[#c9a96e]/20 text-[#1a2b4a] text-[11px] font-semibold px-3 py-1.5 hover:bg-[#0a1628]/10">
                    <Linkedin className="w-3 h-3" /> LinkedIn
                  </a>
                )}
                {company.facebook && (
                  <a href={company.facebook.startsWith('http') ? company.facebook : `https://www.facebook.com/${company.facebook}`}
                    target="_blank" rel="noreferrer"
                    className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 text-indigo-700 text-[11px] font-semibold px-3 py-1.5 hover:bg-indigo-100">
                    <Facebook className="w-3 h-3" /> Facebook
                  </a>
                )}
                {company.outras_redes && (
                  <span className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 text-gray-600 text-[11px] font-semibold px-3 py-1.5">
                    🔗 {company.outras_redes}
                  </span>
                )}
              </div>
            )}

            <div className="flex gap-2 flex-wrap text-[10px] font-bold text-gray-400">
              <span>📅 Cadastro: {new Date(company.created_at).toLocaleDateString('pt-PT')}</span>
              <span>· 🔄 Actualizado: {new Date(company.updated_at).toLocaleDateString('pt-PT')}</span>
            </div>

            <div className="border-t border-gray-100 pt-3">
              <p className="text-[10px] font-semibold text-gray-400 uppercase mb-2">Alterar status</p>
              <div className="flex gap-2 flex-wrap">
                {(['active','inactive','suspended'] as Company['status'][]).map(s => (
                  <button key={s} disabled={company.status === s} onClick={() => onStatusChange(company.id, s)}
                    className={`text-[10px] font-semibold uppercase px-3 py-1.5 border-2 transition-all ${
                      company.status === s ? 'border-[#0a1628] bg-[#0a1628] text-white cursor-default' : 'border-gray-200 text-gray-500 hover:border-[#c9a96e] hover:text-[#1a2b4a]'
                    }`}>
                    {s === 'active' ? '✅ Ativa' : s === 'inactive' ? '⏸ Inativa' : '🚫 Suspensa'}
                  </button>
                ))}
              </div>
            </div>

            {!confirmDel ? (
              <button onClick={() => setConfirmDel(true)}
                className="w-full border-2 border-red-100 text-red-400 hover:bg-red-50 hover:border-red-300 py-2.5 font-semibold text-xs uppercase transition-all">
                🗑 Remover empresa
              </button>
            ) : (
              <div className="bg-red-50 border-2 border-red-200 p-3 space-y-2">
                <p className="text-xs font-semibold text-red-700 text-center">Confirmar remoção permanente?</p>
                <div className="flex gap-2">
                  <button onClick={() => setConfirmDel(false)} className="flex-1 border-2 border-gray-200 text-gray-500 py-2 font-semibold text-xs uppercase">Cancelar</button>
                  <button onClick={() => onDelete(company.id)} className="flex-1 bg-red-500 hover:bg-red-400 text-white py-2 font-semibold text-xs uppercase transition-all">Remover</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Linha compacta na lista ───────────────────────────────────────────────────

function CompanyRow({ company, onClick, onViewProfile }: {
  company: Company;
  onClick: () => void;
  onViewProfile?: (company: Company) => void;
}) {
  const initials = company.nome_fantasia.substring(0, 2).toUpperCase();
  const rating   = (company as any).rating;

  return (
    <div
      onClick={onClick}
      className="flex items-center gap-4 px-5 py-4 hover:bg-amber-50/40 cursor-pointer border-b border-gray-100 transition-all group last:border-b-0"
    >
      <div className="w-11 h-11 bg-gradient-to-br from-amber-700 to-amber-500 flex items-center justify-center font-bold text-white text-sm flex-shrink-0">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-[#1a2b4a] uppercase text-sm truncate group-hover:text-amber-700 transition-colors">
          {company.nome_fantasia}
        </p>
        <p className="text-xs font-bold text-gray-400 truncate">
          {company.setor.split(',')[0].trim()} · {company.cidade}
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {rating != null && (
          <span className="flex items-center gap-0.5 text-[10px] font-bold text-amber-600">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            {Number(rating).toFixed(1)}
          </span>
        )}
        <span className="bg-[#c9a96e]/15 text-[#c9a96e] text-[9px] font-semibold px-2 py-0.5">
          #{company.profile_number}
        </span>
        {onViewProfile && (
          <button
            onClick={e => { e.stopPropagation(); onViewProfile(company); }}
            title="Ver perfil público"
            className="flex items-center gap-1 text-[9px] font-semibold uppercase px-2 py-1 bg-[#0a1628]/5 text-[#1a2b4a] hover:bg-[#c9a96e]/15 hover:text-[#c9a96e] transition-colors border border-[#0a1628]/10">
            <ExternalLink className="w-3 h-3" /> Perfil
          </button>
        )}
        <StatusBadge status={company.status} />
        <ChevronDown className="w-3.5 h-3.5 text-gray-300 group-hover:text-amber-500 transition-colors" />
      </div>
    </div>
  );
}

// ── Modal de detalhe ──────────────────────────────────────────────────────────

function CompanyDetailModal({ company, onClose, onStatusChange, onDelete }: {
  company: Company;
  onClose: () => void;
  onStatusChange: (id: string, status: Company['status']) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-4"
      style={{ background: 'rgba(4,10,24,0.88)', backdropFilter: 'blur(8px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-[#c9a96e]/30 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Detalhe da empresa</span>
          <button onClick={onClose} className="bg-gray-200 hover:bg-gray-300 p-1.5 transition-all">
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>
        <CompanyCard
          company={company}
          defaultExpanded={true}
          onStatusChange={(id, status) => { onStatusChange(id, status); }}
          onDelete={id => { onDelete(id); onClose(); }}
        />
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export function EmpresasTab({ onGoToSolicitacoes, onViewProfile }: {
  onGoToSolicitacoes: () => void;
  onViewProfile?: (company: Company) => void;
}) {
  const [search,          setSearch]          = useState('');
  const [filterSetor,     setFilterSetor]     = useState('');
  const [filterStatus,    setFilterStatus]    = useState('active');
  const [setoresOpen,     setSetoresOpen]     = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [renderKey,       setRenderKey]       = useState(0);

  const allCompanies = getCompanies().filter(c => c.status !== 'pending');
  const pendingCount = getCompanies().filter(c => c.status === 'pending').length;
  const setores      = Array.from(new Set(allCompanies.flatMap(c => c.setor.split(',').map(s => s.trim())))).sort();

  const filtered = allCompanies.filter(c => {
    const matchSearch = !search || [c.nome_fantasia, c.razao_social, c.email, c.cidade, c.setor]
      .some(v => v?.toLowerCase().includes(search.toLowerCase()));
    const matchSetor  = !filterSetor  || c.setor.includes(filterSetor);
    const matchStatus = !filterStatus || c.status === filterStatus;
    return matchSearch && matchSetor && matchStatus;
  });

  const sorted = [...filtered].sort((a, b) => a.nome_fantasia.localeCompare(b.nome_fantasia, 'pt'));
  const pg     = usePagination(sorted, 20);

  function handleStatusChange(id: string, status: Company['status']) {
    updateCompany(id, { status });
    setRenderKey(k => k + 1);
    if (selectedCompany?.id === id) {
      setSelectedCompany(prev => prev ? { ...prev, status } : null);
    }
  }

  function handleDelete(id: string) {
    deleteCompany(id);
    setRenderKey(k => k + 1);
    if (selectedCompany?.id === id) setSelectedCompany(null);
  }

  return (
    <div className="space-y-6" key={renderKey}>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-['Playfair_Display'] font-bold text-3xl text-[#1a2b4a]">Empresas Verificadas</h2>
          <p className="text-gray-400 font-bold text-sm uppercase mt-1">Parceiros e empresas do setor náutico</p>
        </div>
        {pendingCount > 0 && (
          <button onClick={onGoToSolicitacoes}
            className="flex items-center gap-2 bg-[#c9a96e]/5 border-2 border-[#c9a96e]/20 hover:border-[#c9a96e] text-[#1a2b4a] px-5 py-3 font-semibold text-sm transition-all">
            ⏳ {pendingCount} pendente{pendingCount !== 1 ? 's' : ''}
            <span className="text-[11px] underline">Ver solicitações →</span>
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="bg-white border-2 border-gray-100 p-4 space-y-3">
        <div className="flex items-center gap-2 text-[11px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em]">
          <Filter className="w-3.5 h-3.5" /> Filtros
        </div>

        {/* Busca — live por cada letra */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nome, cidade, e-mail…"
            className="w-full bg-gray-50 border-2 border-gray-100 py-3.5 pl-11 pr-5 font-bold text-[#1a2b4a] focus:border-[#c9a96e] outline-none text-sm placeholder:text-gray-300"
          />
        </div>

        {/* Filtros de status + setor na mesma linha */}
        <div className="relative flex flex-wrap gap-2 items-start">
          {/* Todas */}
          <button onClick={() => setFilterStatus('')}
            className={`px-3 py-2 text-xs font-semibold border-2 transition-all ${filterStatus === '' ? 'bg-[#0a1628] text-white border-[#0a1628]' : 'bg-gray-50 text-gray-500 border-gray-100 hover:border-[#c9a96e]/30'}`}>
            Todas
          </button>

          {/* Setor — colapsável, entre Todas e Ativas */}
          {setores.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setSetoresOpen(v => !v)}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold border-2 transition-all ${
                  filterSetor
                    ? 'bg-amber-700 text-white border-amber-700'
                    : setoresOpen
                      ? 'bg-[#0a1628] text-white border-[#0a1628]'
                      : 'bg-gray-50 text-gray-500 border-gray-100 hover:border-amber-400'
                }`}
              >
                🏭 {filterSetor || 'Setor'}
                {setoresOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>

              {setoresOpen && (
                <div className="absolute left-0 top-full mt-1 z-10 flex flex-wrap gap-2 border border-gray-100 p-3 bg-white shadow-lg min-w-[220px] animate-in fade-in duration-150">
                  <button
                    onClick={() => { setFilterSetor(''); setSetoresOpen(false); }}
                    className={`px-3 py-2 text-xs font-semibold border-2 transition-all ${
                      filterSetor === '' ? 'bg-amber-700 text-white border-amber-700' : 'bg-gray-50 text-gray-500 border-gray-100 hover:border-amber-400'
                    }`}
                  >
                    Todos
                  </button>
                  {setores.map(s => (
                    <button
                      key={s}
                      onClick={() => { setFilterSetor(filterSetor === s ? '' : s); setSetoresOpen(false); }}
                      className={`px-3 py-2 text-xs font-semibold border-2 transition-all ${
                        filterSetor === s ? 'bg-amber-700 text-white border-amber-700' : 'bg-gray-50 text-gray-500 border-gray-100 hover:border-amber-400'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Ativas / Inativas / Suspensas */}
          {[{v:'active',l:'✅ Ativas'},{v:'inactive',l:'⏸ Inativas'},{v:'suspended',l:'🚫 Suspensas'}].map(({v,l}) => (
            <button key={v} onClick={() => setFilterStatus(v)}
              className={`px-3 py-2 text-xs font-semibold border-2 transition-all ${filterStatus === v ? 'bg-[#0a1628] text-white border-[#0a1628]' : 'bg-gray-50 text-gray-500 border-gray-100 hover:border-[#c9a96e]/30'}`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Lista */}
      {sorted.length === 0 ? (
        <div className="bg-white p-16 text-center border-2 border-dashed border-gray-200">
          <div className="text-5xl mb-4">🏢</div>
          <p className="text-gray-400 font-semibold uppercase text-lg">
            {allCompanies.length === 0 ? 'Nenhuma empresa cadastrada ainda' : 'Nenhuma empresa corresponde aos filtros'}
          </p>
          {(search || filterSetor || filterStatus) && (
            <button
              onClick={() => { setSearch(''); setFilterSetor(''); setFilterStatus('active'); }}
              className="mt-4 text-[#1a2b4a] font-semibold text-sm underline"
            >
              Limpar filtros
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-0">
          <div className="bg-white border-2 border-gray-100 overflow-hidden">
            {/* Cabeçalho da tabela */}
            <div className="px-5 py-2.5 bg-[#0a1628]/5 border-b border-gray-100 flex items-center justify-between">
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                {sorted.length} empresa{sorted.length !== 1 ? 's' : ''}
              </span>
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                Nº Perfil · Status
              </span>
            </div>
            {pg.paged.map(c => (
              <CompanyRow
                key={c.id}
                company={c}
                onClick={() => setSelectedCompany(c)}
                onViewProfile={onViewProfile}
              />
            ))}
          </div>
          <div className="bg-white border-2 border-[#0a1628]/5 mt-0 border-t-0">
            <Pagination {...pg} onPrev={pg.prev} onNext={pg.next} onPage={pg.setPage} />
          </div>
        </div>
      )}

      {/* Modal de detalhe */}
      {selectedCompany && (
        <CompanyDetailModal
          company={selectedCompany}
          onClose={() => setSelectedCompany(null)}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
