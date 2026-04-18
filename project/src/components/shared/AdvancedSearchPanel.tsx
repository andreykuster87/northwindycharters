// src/components/shared/AdvancedSearchPanel.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Painel de busca avançada reutilizável para todos os navbars das áreas
// (Admin, Tripulante, Empresa, Passageiro).
//
// Uso:
//   const { toggleButton, panel, viewing, clearViewing } =
//     useAdvancedSearch({ onOpenSailor, onOpenClient, onOpenCompany });
//
//   // Renderizar {toggleButton} ao lado do <ProfileSearch /> no navbar,
//   // e {panel} como filho de <nav> (fora do flex row) para ocupar toda a largura.
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useMemo } from 'react';
import {
  SlidersHorizontal, ChevronUp, ChevronDown, Search, X,
  Building2, User, CheckCircle2,
} from 'lucide-react';
import { getSailors, getCompanies } from '../../lib/localStore';
import type { Sailor, Client } from '../../lib/store/core';
import type { Company } from '../../lib/store/companies';

// ── Props ─────────────────────────────────────────────────────────────────────

interface Options {
  onOpenSailor:  (s: Sailor)  => void;
  onOpenClient:  (c: Client)  => void;
  onOpenCompany: (c: Company) => void;
  /** Largura máxima do conteúdo (alinha com o container do navbar). Default: max-w-6xl */
  maxWidthClass?: string;
}

// ── Disponibilidades (opções fixas) ───────────────────────────────────────────

const DISP_OPTIONS_SEARCH = [
  { id: 'indisponivel',   label: 'Indisponível'           },
  { id: 'disponivel',     label: 'Disponível'             },
  { id: 'imediato',       label: 'Embarque Imediato'      },
  { id: 'trajeto_curto',  label: 'Trajeto Curto'          },
  { id: 'nacionais',      label: 'Viagens Nacionais'      },
  { id: 'internacionais', label: 'Viagens Internacionais' },
  { id: 'meio_periodo',   label: 'Meio Período'           },
  { id: 'sob_demanda',    label: 'Sob Demanda'            },
  { id: 'ferias',         label: 'Férias'                 },
];

// ── Hook principal ────────────────────────────────────────────────────────────

export function useAdvancedSearch({
  onOpenSailor, onOpenClient, onOpenCompany,
  maxWidthClass = 'max-w-6xl',
}: Options) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTab,  setSearchTab]  = useState<'empresas' | 'tripulantes'>('empresas');

  // ── Busca de empresas ──
  const [companySearchNome,   setCompanySearchNome]   = useState('');
  const [companySearchPais,   setCompanySearchPais]   = useState('');
  const [companySearchEstado, setCompanySearchEstado] = useState('');
  const [companySearchCidade, setCompanySearchCidade] = useState('');
  const [companySearchPerfil, setCompanySearchPerfil] = useState('');
  const [companySearchEmail,  setCompanySearchEmail]  = useState('');
  const [companySearchSetor,  setCompanySearchSetor]  = useState('');
  const [companyResults,      setCompanyResults]      = useState<Company[] | null>(null);

  function handleCompanySearch() {
    const all = getCompanies().filter(c => c.status === 'active');
    const r = all.filter(c => {
      const matchNome   = !companySearchNome   || c.nome_fantasia.toLowerCase().includes(companySearchNome.toLowerCase());
      const matchPais   = !companySearchPais   || (c.pais_nome || '').toLowerCase().includes(companySearchPais.toLowerCase());
      const matchEstado = !companySearchEstado || (c.estado || '').toLowerCase().includes(companySearchEstado.toLowerCase());
      const matchCidade = !companySearchCidade || (c.cidade || '').toLowerCase().includes(companySearchCidade.toLowerCase());
      const matchPerfil = !companySearchPerfil || (c.profile_number || '').toLowerCase().includes(companySearchPerfil.toLowerCase());
      const matchEmail  = !companySearchEmail  || c.email.toLowerCase().includes(companySearchEmail.toLowerCase());
      const matchSetor  = !companySearchSetor  || c.setor.toLowerCase().includes(companySearchSetor.toLowerCase());
      return matchNome && matchPais && matchEstado && matchCidade && matchPerfil && matchEmail && matchSetor;
    });
    setCompanyResults(r);
  }

  function clearCompanySearch() {
    setCompanyResults(null);
    setCompanySearchNome(''); setCompanySearchPais(''); setCompanySearchEstado('');
    setCompanySearchCidade(''); setCompanySearchPerfil(''); setCompanySearchEmail(''); setCompanySearchSetor('');
  }

  const hasCompanyFilters = companySearchNome || companySearchPais || companySearchEstado ||
    companySearchCidade || companySearchPerfil || companySearchEmail || companySearchSetor;

  // ── Busca de tripulantes ──
  const [sailorSearchQuery,  setSailorSearchQuery]  = useState('');
  const [sailorSearchNac,    setSailorSearchNac]    = useState('');
  const [sailorSearchPerfil, setSailorSearchPerfil] = useState('');
  const [sailorSearchFuncao, setSailorSearchFuncao] = useState('');
  const [sailorSearchDisp,   setSailorSearchDisp]   = useState('');
  const [showSailorAdvanced, setShowSailorAdvanced] = useState(false);

  const hasSailorAdvanced = sailorSearchNac || sailorSearchPerfil || sailorSearchFuncao || sailorSearchDisp;

  const sailorResults = useMemo(() => {
    if (!sailorSearchQuery && !hasSailorAdvanced) return null;
    const all = getSailors().filter(s => s.status === 'approved');
    return all.filter(s => {
      const q = sailorSearchQuery.toLowerCase();
      const matchQuery = !sailorSearchQuery || [s.name, s.funcao, s.nacionalidade, s.profile_number, ...(s.idiomas ?? [])]
        .some(v => v?.toLowerCase().includes(q));
      const matchNac   = !sailorSearchNac    || (s.nacionalidade || '').toLowerCase().includes(sailorSearchNac.toLowerCase());
      const matchPerf  = !sailorSearchPerfil || (s.profile_number || '').toLowerCase().includes(sailorSearchPerfil.toLowerCase());
      const matchFunc  = !sailorSearchFuncao || (s.funcao || '').toLowerCase().includes(sailorSearchFuncao.toLowerCase());
      const matchDisp  = !sailorSearchDisp   || (s.disponibilidade ?? []).includes(sailorSearchDisp);
      return matchQuery && matchNac && matchPerf && matchFunc && matchDisp;
    });
  }, [sailorSearchQuery, sailorSearchNac, sailorSearchPerfil, sailorSearchFuncao, sailorSearchDisp, hasSailorAdvanced]);

  const sailorFuncoes = useMemo(() => {
    if (!showSailorAdvanced) return [];
    const all = getSailors().filter(s => s.status === 'approved');
    return Array.from(new Set(all.flatMap(s => (s.funcao || '').split(',').map(f => f.trim()).filter(Boolean)))).sort();
  }, [showSailorAdvanced]);

  const sailorDisps = useMemo(() => {
    if (!showSailorAdvanced) return [];
    const all = getSailors().filter(s => s.status === 'approved');
    const ids = new Set(all.flatMap(s => s.disponibilidade ?? []));
    return DISP_OPTIONS_SEARCH.filter(o => ids.has(o.id));
  }, [showSailorAdvanced]);

  function clearSailorSearch() {
    setSailorSearchQuery(''); setSailorSearchNac(''); setSailorSearchPerfil('');
    setSailorSearchFuncao(''); setSailorSearchDisp(''); setShowSailorAdvanced(false);
  }

  const hasSailorFilters = sailorSearchQuery || hasSailorAdvanced;

  // ── Viewing (para parent saber se precisa renderizar profile view) ──
  // Quem usa o hook pode navegar pelo callback; o hook só expõe o "close" para limpar.
  function closePanelAndClear() {
    setSearchOpen(false);
    clearCompanySearch();
    clearSailorSearch();
  }

  // ── Wrapper para clicks de resultado: fecha o painel e chama o callback pai ──
  function handleOpenSailor(s: Sailor)   { closePanelAndClear(); onOpenSailor(s); }
  function handleOpenCompany(c: Company) { closePanelAndClear(); onOpenCompany(c); }
  // Para clientes, mantemos assinatura mas não é usado no painel (só pela busca global)
  void onOpenClient;

  // ── JSX: Toggle Button (fica ao lado do ProfileSearch) ──
  const toggleButton = (
    <button
      onClick={() => { if (searchOpen) closePanelAndClear(); else setSearchOpen(true); }}
      title="Filtros avançados"
      className={`flex-shrink-0 p-2 border transition-all ${
        searchOpen
          ? 'bg-[#c9a96e] text-[#0a1628] border-[#c9a96e]'
          : 'bg-white/20 border-white/30 text-white hover:border-[#c9a96e]/70'
      }`}
    >
      <SlidersHorizontal className="w-4 h-4" />
    </button>
  );

  // ── JSX: Panel (fica abaixo do flex row dentro do <nav>) ──
  const panel = searchOpen ? (
    <div className="border-t border-[#c9a96e]/10 bg-[#060e1e] px-4 py-4">
      <div className={`${maxWidthClass} mx-auto`}>

        {/* Tabs Empresas / Tripulantes */}
        <div className="flex gap-2 mb-4">
          <button onClick={() => setSearchTab('empresas')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider border transition-all ${
              searchTab === 'empresas'
                ? 'bg-[#c9a96e] text-[#0a1628] border-[#c9a96e]'
                : 'bg-white/5 text-white/60 border-white/10 hover:border-[#c9a96e]/40 hover:text-white'
            }`}>
            <Building2 className="w-3.5 h-3.5" /> Empresas
          </button>
          <button onClick={() => setSearchTab('tripulantes')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider border transition-all ${
              searchTab === 'tripulantes'
                ? 'bg-[#c9a96e] text-[#0a1628] border-[#c9a96e]'
                : 'bg-white/5 text-white/60 border-white/10 hover:border-[#c9a96e]/40 hover:text-white'
            }`}>
            <User className="w-3.5 h-3.5" /> Tripulantes
          </button>
        </div>

        {/* ══ ABA EMPRESAS ══ */}
        {searchTab === 'empresas' && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 mb-2">
              {([
                { placeholder: 'Nome',      value: companySearchNome,   set: setCompanySearchNome   },
                { placeholder: 'País',      value: companySearchPais,   set: setCompanySearchPais   },
                { placeholder: 'Estado',    value: companySearchEstado, set: setCompanySearchEstado },
                { placeholder: 'Cidade',    value: companySearchCidade, set: setCompanySearchCidade },
                { placeholder: 'Nº Perfil', value: companySearchPerfil, set: setCompanySearchPerfil },
                { placeholder: 'Email',     value: companySearchEmail,  set: setCompanySearchEmail  },
              ] as const).map(({ placeholder, value, set }) => (
                <input key={placeholder} value={value}
                  onChange={e => set(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCompanySearch()}
                  placeholder={placeholder}
                  className="bg-white/20 border border-white/30 px-3 py-2 text-xs font-medium text-white placeholder:text-white/70 focus:border-[#c9a96e] outline-none transition-colors" />
              ))}
            </div>
            <div className="flex gap-2">
              <input value={companySearchSetor} onChange={e => setCompanySearchSetor(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCompanySearch()}
                placeholder="Setor de negócio"
                className="flex-1 bg-white/20 border border-white/30 px-3 py-2 text-xs font-medium text-white placeholder:text-white/70 focus:border-[#c9a96e] outline-none transition-colors" />
              <button onClick={handleCompanySearch}
                className="border border-[#c9a96e] text-[#c9a96e] hover:bg-[#c9a96e] hover:text-[#0a1628] px-5 py-2 font-semibold text-xs uppercase tracking-wide transition-all flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5" /> Pesquisar
              </button>
              {(companyResults !== null || hasCompanyFilters) && (
                <button onClick={clearCompanySearch}
                  className="px-3 border border-white/20 text-white/50 hover:border-red-400 hover:text-red-300 font-semibold text-xs transition-all">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {companyResults !== null && (
              <div className="mt-3 space-y-1.5 max-h-60 overflow-y-auto">
                {companyResults.length === 0 ? (
                  <p className="text-center text-xs font-medium text-white/40 py-4">Nenhuma empresa encontrada</p>
                ) : (
                  companyResults.map(c => (
                    <button key={c.id} onClick={() => handleOpenCompany(c)}
                      className="w-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#c9a96e]/40 px-3 py-2.5 flex items-center gap-3 transition-all text-left">
                      <div className="w-8 h-8 overflow-hidden bg-[#1a2b4a] flex items-center justify-center flex-shrink-0">
                        {(c as any).profile_photo
                          ? <img src={(c as any).profile_photo} alt={c.nome_fantasia} className="w-full h-full object-cover" />
                          : <Building2 className="w-4 h-4 text-[#c9a96e]" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-['Playfair_Display'] font-bold text-white text-xs truncate">{c.nome_fantasia}</p>
                        <p className="text-[10px] font-medium text-[#c9a96e]/70 truncate">{c.cidade} · {c.setor.split(',')[0]}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </>
        )}

        {/* ══ ABA TRIPULANTES ══ */}
        {searchTab === 'tripulantes' && (
          <>
            {/* Live search + botão filtros avançados */}
            <div className="flex gap-2 mb-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/70" />
                <input
                  value={sailorSearchQuery}
                  onChange={e => setSailorSearchQuery(e.target.value)}
                  placeholder="Buscar por nome, função, nacionalidade, idioma…"
                  className="w-full bg-white/20 border border-white/30 py-2.5 pl-9 pr-3 text-xs font-medium text-white placeholder:text-white/70 focus:border-[#c9a96e] outline-none transition-colors"
                  autoFocus
                />
              </div>
              <button
                onClick={() => setShowSailorAdvanced(v => !v)}
                title="Filtros avançados"
                className={`flex items-center gap-1.5 px-3 border font-semibold text-xs transition-all flex-shrink-0 ${
                  showSailorAdvanced || hasSailorAdvanced
                    ? 'bg-[#c9a96e] text-[#0a1628] border-[#c9a96e]'
                    : 'bg-white/5 border-white/10 text-white/50 hover:border-[#c9a96e]/40'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                {showSailorAdvanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
              {hasSailorFilters && (
                <button onClick={clearSailorSearch}
                  className="px-3 border border-white/20 text-white/50 hover:border-red-400 hover:text-red-300 font-semibold text-xs transition-all flex-shrink-0">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filtros avançados — colapsável */}
            {showSailorAdvanced && (
              <div className="bg-white/5 border border-white/10 p-3 space-y-3 mb-2">
                <div>
                  <p className="text-[9px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em] mb-1.5">Filtros por campo</p>
                  <div className="grid grid-cols-2 gap-2">
                    <input value={sailorSearchNac} onChange={e => setSailorSearchNac(e.target.value)}
                      placeholder="Nacionalidade"
                      className="bg-white/20 border border-white/30 px-3 py-2 text-xs font-medium text-white placeholder:text-white/70 focus:border-[#c9a96e] outline-none transition-colors" />
                    <input value={sailorSearchPerfil} onChange={e => setSailorSearchPerfil(e.target.value)}
                      placeholder="Nº Perfil"
                      className="bg-white/20 border border-white/30 px-3 py-2 text-xs font-medium text-white placeholder:text-white/70 focus:border-[#c9a96e] outline-none transition-colors" />
                  </div>
                </div>

                {sailorFuncoes.length > 0 && (
                  <div>
                    <p className="text-[9px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Função</p>
                    <div className="flex flex-wrap gap-1.5">
                      <button onClick={() => setSailorSearchFuncao('')}
                        className={`px-2.5 py-1 text-[10px] font-semibold border transition-all ${sailorSearchFuncao === '' ? 'bg-[#c9a96e] text-[#0a1628] border-[#c9a96e]' : 'bg-white/5 border-white/10 text-white/50 hover:border-[#c9a96e]/40'}`}>
                        Todas
                      </button>
                      {sailorFuncoes.map(f => (
                        <button key={f} onClick={() => setSailorSearchFuncao(sailorSearchFuncao === f ? '' : f)}
                          className={`px-2.5 py-1 text-[10px] font-semibold border transition-all ${sailorSearchFuncao === f ? 'bg-[#c9a96e] text-[#0a1628] border-[#c9a96e]' : 'bg-white/5 border-white/10 text-white/50 hover:border-[#c9a96e]/40'}`}>
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {sailorDisps.length > 0 && (
                  <div>
                    <p className="text-[9px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Disponibilidade</p>
                    <div className="flex flex-wrap gap-1.5">
                      <button onClick={() => setSailorSearchDisp('')}
                        className={`px-2.5 py-1 text-[10px] font-semibold border transition-all ${sailorSearchDisp === '' ? 'bg-[#c9a96e] text-[#0a1628] border-[#c9a96e]' : 'bg-white/5 border-white/10 text-white/50 hover:border-[#c9a96e]/40'}`}>
                        Todas
                      </button>
                      {sailorDisps.map(d => (
                        <button key={d.id} onClick={() => setSailorSearchDisp(sailorSearchDisp === d.id ? '' : d.id)}
                          className={`px-2.5 py-1 text-[10px] font-semibold border transition-all ${sailorSearchDisp === d.id ? 'bg-[#c9a96e] text-[#0a1628] border-[#c9a96e]' : 'bg-white/5 border-white/10 text-white/50 hover:border-[#c9a96e]/40'}`}>
                          {d.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Resultados tripulantes — live */}
            {sailorResults !== null && (
              <div className="space-y-1.5 max-h-60 overflow-y-auto">
                {sailorResults.length === 0 ? (
                  <p className="text-center text-xs font-medium text-white/40 py-4">Nenhum tripulante encontrado</p>
                ) : (
                  sailorResults.map(s => {
                    const funcao = s.funcao ? s.funcao.split(',')[0].trim() : '';
                    return (
                      <button key={s.id} onClick={() => handleOpenSailor(s)}
                        className="w-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#c9a96e]/40 px-3 py-2.5 flex items-center gap-3 transition-all text-left">
                        <div className="w-8 h-8 overflow-hidden bg-[#1a2b4a] flex items-center justify-center flex-shrink-0">
                          {s.profile_photo
                            ? <img src={s.profile_photo} alt={s.name} className="w-full h-full object-cover" />
                            : <User className="w-4 h-4 text-[#c9a96e]" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-['Playfair_Display'] font-bold text-white text-xs truncate flex items-center gap-1.5">
                            {s.name}
                            {s.verified && <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />}
                          </p>
                          <p className="text-[10px] font-medium text-[#c9a96e]/70 truncate">
                            {[funcao, s.nacionalidade].filter(Boolean).join(' · ')}
                          </p>
                        </div>
                        <span className="text-[9px] font-semibold text-white/40 bg-white/5 px-2 py-0.5 flex-shrink-0">{s.profile_number}</span>
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  ) : null;

  return { toggleButton, panel, closePanelAndClear };
}
