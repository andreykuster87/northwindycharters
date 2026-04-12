// src/components/admin/tabs/EmpresasTab.tsx
import { useState } from 'react';
import {
  Building2, Globe, Phone, Mail, MapPin, Search,
  ExternalLink, Instagram, Linkedin, Facebook,
  ShieldCheck, Filter, Copy, KeyRound, ChevronDown, ChevronUp,
} from 'lucide-react';
import {
  getCompanies, updateCompany, deleteCompany,
  type Company,
} from '../../../lib/localStore';

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="bg-blue-700 hover:bg-blue-600 text-white p-1 rounded-lg transition-all" title="Copiar">
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
  return <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${cls}`}>{label}</span>;
}

function CompanyCard({ company, onStatusChange, onDelete }: {
  company: Company;
  onStatusChange: (id: string, status: Company['status']) => void;
  onDelete: (id: string) => void;
}) {
  const [expanded,   setExpanded]   = useState(false);
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
    <div className="bg-white border-2 border-gray-100 rounded-[28px] overflow-hidden hover:border-blue-200 transition-all">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-700 to-amber-500 px-6 py-4 flex items-center gap-4">
        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
          <Building2 className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-black text-white uppercase italic truncate text-base">{company.nome_fantasia}</p>
          <p className="text-amber-200 text-[11px] font-bold truncate">{company.razao_social}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <StatusBadge status={company.status} />
          <span className="bg-white/20 text-white text-[9px] font-black px-2 py-0.5 rounded-full">{company.profile_number}</span>
        </div>
      </div>

      <div className="p-5 space-y-3">
        {/* Setores — múltiplos */}
        <div className="flex flex-wrap gap-1.5">
          {company.setor.split(',').map(s => (
            <span key={s} className="inline-flex items-center gap-1 bg-amber-50 border border-amber-100 text-amber-800 text-[11px] font-black px-2.5 py-1 rounded-full">
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
            className="flex items-center gap-2 text-xs font-black text-green-600 hover:text-green-500 transition-colors group w-full">
            <div className="w-5 h-5 bg-green-100 group-hover:bg-green-200 rounded-full flex items-center justify-center flex-shrink-0 transition-colors">
              <Phone className="w-3 h-3 text-green-600" />
            </div>
            <span className="truncate flex-1">{company.telefone}</span>
            <span className="text-[10px] font-black bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex-shrink-0">WhatsApp ↗</span>
          </a>

          {company.website && (
            <div className="flex items-center gap-2 text-xs font-bold text-blue-700">
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
          <div className="rounded-[18px] border-2 border-blue-100 overflow-hidden">
            <button
              onClick={() => setShowCreds(v => !v)}
              className={`w-full flex items-center justify-between px-4 py-3 text-xs font-black uppercase tracking-wide transition-all ${
                showCreds ? 'bg-blue-900 text-white' : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
              }`}>
              <div className="flex items-center gap-2">
                <KeyRound className="w-3.5 h-3.5" />
                Credenciais de acesso
              </div>
              {showCreds ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showCreds && (
              <div className="bg-blue-900 px-4 pb-4 pt-3 space-y-2 animate-in fade-in duration-150">
                {([
                  ['Login', (company as any).company_login],
                  ['Senha', (company as any).company_password],
                ] as [string, string][]).map(([l, v]) => (
                  <div key={l} className="flex items-center justify-between bg-blue-800 rounded-[12px] px-4 py-2.5">
                    <span className="text-blue-300 text-xs font-bold uppercase">{l}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-black text-sm">{v}</span>
                      <CopyBtn text={v} />
                    </div>
                  </div>
                ))}
                <a href={buildCredentialsWaUrl()} target="_blank" rel="noopener noreferrer"
                  className="w-full bg-green-500 hover:bg-green-400 text-white py-3 rounded-[12px] font-black uppercase text-xs transition-all flex items-center justify-center gap-2 shadow-md">
                  📲 Enviar Credenciais via WhatsApp
                </a>
              </div>
            )}
          </div>
        )}

        {/* Toggle detalhes */}
        <button onClick={() => setExpanded(v => !v)}
          className="w-full text-center text-[11px] font-black text-blue-900 hover:text-blue-700 transition-colors flex items-center justify-center gap-1 py-0.5">
          {expanded ? <><ChevronUp className="w-3.5 h-3.5" /> Ocultar detalhes</> : <><ChevronDown className="w-3.5 h-3.5" /> Ver mais detalhes</>}
        </button>

        {expanded && (
          <div className="space-y-3 border-t-2 border-gray-100 pt-3">
            <div className="grid grid-cols-2 gap-2">
              {[
                ['Nº Fiscal',   `${company.numero_fiscal} (${company.pais_fiscal})`],
                ['Nº Registro', company.numero_registro],
                ['Endereço',    company.endereco],
                ['Cód. Postal', company.codigo_postal],
              ].filter(([, v]) => v).map(([l, v]) => (
                <div key={l} className="bg-gray-50 rounded-xl p-2.5">
                  <p className="text-[9px] font-black text-gray-400 uppercase">{l}</p>
                  <p className="font-bold text-blue-900 text-xs mt-0.5 truncate">{v}</p>
                </div>
              ))}
            </div>

            <div className="bg-blue-50 rounded-[16px] p-3">
              <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-2">👤 Responsável</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  ['Nome',  company.resp_nome],
                  ['Cargo', company.resp_cargo],
                  ['Email', company.resp_email],
                  ['Tel.',  company.resp_telefone],
                ].filter(([, v]) => v).map(([l, v]) => (
                  <div key={l} className="bg-white rounded-lg p-2">
                    <p className="text-[9px] font-black text-gray-400 uppercase">{l}</p>
                    <p className="font-bold text-blue-900 text-[11px] mt-0.5 truncate">{v}</p>
                  </div>
                ))}
              </div>
            </div>

            {hasSocial && (
              <div className="flex flex-wrap gap-2">
                {company.instagram && (
                  <a href={company.instagram.startsWith('http') ? company.instagram : `https://www.instagram.com/${company.instagram.replace(/^@/,'')}`}
                    target="_blank" rel="noreferrer"
                    className="flex items-center gap-1.5 bg-pink-50 border border-pink-100 text-pink-700 text-[11px] font-black px-3 py-1.5 rounded-full hover:bg-pink-100">
                    <Instagram className="w-3 h-3" /> Instagram
                  </a>
                )}
                {company.linkedin && (
                  <a href={company.linkedin.startsWith('http') ? company.linkedin : `https://${company.linkedin}`}
                    target="_blank" rel="noreferrer"
                    className="flex items-center gap-1.5 bg-blue-50 border border-blue-100 text-blue-700 text-[11px] font-black px-3 py-1.5 rounded-full hover:bg-blue-100">
                    <Linkedin className="w-3 h-3" /> LinkedIn
                  </a>
                )}
                {company.facebook && (
                  <a href={company.facebook.startsWith('http') ? company.facebook : `https://www.facebook.com/${company.facebook}`}
                    target="_blank" rel="noreferrer"
                    className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 text-indigo-700 text-[11px] font-black px-3 py-1.5 rounded-full hover:bg-indigo-100">
                    <Facebook className="w-3 h-3" /> Facebook
                  </a>
                )}
                {company.outras_redes && (
                  <span className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 text-gray-600 text-[11px] font-black px-3 py-1.5 rounded-full">
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
              <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Alterar status</p>
              <div className="flex gap-2 flex-wrap">
                {(['active','inactive','suspended'] as Company['status'][]).map(s => (
                  <button key={s} disabled={company.status === s} onClick={() => onStatusChange(company.id, s)}
                    className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-full border-2 transition-all ${
                      company.status === s ? 'border-blue-900 bg-blue-900 text-white cursor-default' : 'border-gray-200 text-gray-500 hover:border-blue-900 hover:text-blue-900'
                    }`}>
                    {s === 'active' ? '✅ Ativa' : s === 'inactive' ? '⏸ Inativa' : '🚫 Suspensa'}
                  </button>
                ))}
              </div>
            </div>

            {!confirmDel ? (
              <button onClick={() => setConfirmDel(true)}
                className="w-full border-2 border-red-100 text-red-400 hover:bg-red-50 hover:border-red-300 py-2.5 rounded-[16px] font-black text-xs uppercase transition-all">
                🗑 Remover empresa
              </button>
            ) : (
              <div className="bg-red-50 border-2 border-red-200 rounded-[16px] p-3 space-y-2">
                <p className="text-xs font-black text-red-700 text-center">Confirmar remoção permanente?</p>
                <div className="flex gap-2">
                  <button onClick={() => setConfirmDel(false)} className="flex-1 border-2 border-gray-200 text-gray-500 py-2 rounded-xl font-black text-xs uppercase">Cancelar</button>
                  <button onClick={() => onDelete(company.id)} className="flex-1 bg-red-500 hover:bg-red-400 text-white py-2 rounded-xl font-black text-xs uppercase transition-all">Remover</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export function EmpresasTab({ onGoToSolicitacoes }: { onGoToSolicitacoes: () => void }) {
  const [search,       setSearch]       = useState('');
  const [filterSetor,  setFilterSetor]  = useState('');
  const [filterStatus, setFilterStatus] = useState('active');
  const [renderKey,    setRenderKey]    = useState(0);

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

  const totalAtivas    = allCompanies.filter(c => c.status === 'active').length;
  const totalInativas  = allCompanies.filter(c => c.status === 'inactive').length;
  const totalSuspensas = allCompanies.filter(c => c.status === 'suspended').length;

  return (
    <div className="space-y-6" key={renderKey}>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-3xl font-black text-blue-900 uppercase italic">Empresas Verificadas</h2>
          <p className="text-gray-400 font-bold text-sm uppercase mt-1">Parceiros e empresas do setor náutico</p>
        </div>
        {pendingCount > 0 && (
          <button onClick={onGoToSolicitacoes}
            className="flex items-center gap-2 bg-amber-50 border-2 border-amber-200 hover:border-amber-500 text-amber-700 px-5 py-3 rounded-[18px] font-black text-sm transition-all">
            ⏳ {pendingCount} pendente{pendingCount !== 1 ? 's' : ''}
            <span className="text-[11px] underline">Ver solicitações →</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total',     value: allCompanies.length, emoji: '🏢', cls: 'border-gray-100' },
          { label: 'Ativas',    value: totalAtivas,          emoji: '✅', cls: 'border-green-100' },
          { label: 'Inativas',  value: totalInativas,        emoji: '⏸',  cls: 'border-gray-100' },
          { label: 'Suspensas', value: totalSuspensas,       emoji: '🚫', cls: 'border-red-100' },
        ].map(s => (
          <div key={s.label} className={`bg-white rounded-[20px] border-2 ${s.cls} px-5 py-4 flex items-center gap-3 shadow-sm`}>
            <span className="text-2xl">{s.emoji}</span>
            <div>
              <p className="text-2xl font-black text-blue-900">{s.value}</p>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border-2 border-gray-100 rounded-[24px] p-4 space-y-3">
        <div className="flex items-center gap-2 text-[11px] font-black text-gray-400 uppercase tracking-widest">
          <Filter className="w-3.5 h-3.5" /> Filtros
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nome, cidade, e-mail…"
            className="w-full bg-gray-50 border-2 border-gray-100 rounded-[18px] py-3.5 pl-11 pr-5 font-bold text-blue-900 focus:border-blue-900 outline-none text-sm placeholder:text-gray-300" />
        </div>
        <div className="flex flex-wrap gap-2">
          {[{v:'',l:'Todas'},{v:'active',l:'✅ Ativas'},{v:'inactive',l:'⏸ Inativas'},{v:'suspended',l:'🚫 Suspensas'}].map(({v,l}) => (
            <button key={v} onClick={() => setFilterStatus(v)}
              className={`px-3 py-2 rounded-[14px] text-xs font-black border-2 transition-all ${filterStatus === v ? 'bg-blue-900 text-white border-blue-900' : 'bg-gray-50 text-gray-500 border-gray-100 hover:border-blue-300'}`}>
              {l}
            </button>
          ))}
        </div>
        {setores.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setFilterSetor('')}
              className={`px-3 py-2 rounded-[14px] text-xs font-black border-2 transition-all ${filterSetor === '' ? 'bg-amber-700 text-white border-amber-700' : 'bg-gray-50 text-gray-500 border-gray-100 hover:border-amber-400'}`}>
              🏭 Todos
            </button>
            {setores.map(s => (
              <button key={s} onClick={() => setFilterSetor(filterSetor === s ? '' : s)}
                className={`px-3 py-2 rounded-[14px] text-xs font-black border-2 transition-all ${filterSetor === s ? 'bg-amber-700 text-white border-amber-700' : 'bg-gray-50 text-gray-500 border-gray-100 hover:border-amber-400'}`}>
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {sorted.length === 0 ? (
        <div className="bg-white rounded-[40px] p-16 text-center border-2 border-dashed border-gray-200">
          <div className="text-5xl mb-4">🏢</div>
          <p className="text-gray-400 font-black uppercase italic text-lg">
            {allCompanies.length === 0 ? 'Nenhuma empresa cadastrada ainda' : 'Nenhuma empresa corresponde aos filtros'}
          </p>
          {(search || filterSetor || filterStatus) && (
            <button onClick={() => { setSearch(''); setFilterSetor(''); setFilterStatus('active'); }}
              className="mt-4 text-blue-700 font-black text-sm underline">Limpar filtros</button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {sorted.map(c => (
            <CompanyCard key={c.id} company={c}
              onStatusChange={(id, status) => { updateCompany(id, { status }); setRenderKey(k => k+1); }}
              onDelete={(id) => { deleteCompany(id); setRenderKey(k => k+1); }}
            />
          ))}
        </div>
      )}
    </div>
  );
}