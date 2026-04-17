// src/components/pages/ClientArea.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Área do passageiro — mesmo layout e DNA visual da CompanyArea.
// Sidebar no desktop | Bottom tab bar no mobile | Foto de perfil editável
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Waves, LogOut, Bell, Settings, Camera,
  User, BookOpen, MessageSquare,
  ChevronRight, ChevronUp, ChevronDown,
  Users, Search, X,
  CheckCircle2, Clock, XCircle,
  Building2, Store, SlidersHorizontal,
} from 'lucide-react';
import { SailorApplicationModal } from '../modals/SailorApplicationModal';
import {
  getClients, getBookings, getTrips, saveBooking,
  notifyBookingStatusChange, refreshAll, updateClient, getCompanies,
  getSailors, getSailorApplicationsByClient,
} from '../../lib/localStore';
import type { Company } from '../../lib/store/companies';
import type { Sailor }  from '../../lib/store/core';
import { getEventBookingsByClient, type EventBooking } from '../../lib/store/events';
import { BookingModal, type BookingData } from '../modals/BookingModal';
import type { AuthState } from '../../hooks/useAuth';
import { loadTrips, parseLocation, type CatalogBoat } from '../../utils/clientHelpers';
import { MensagensBox }       from '../shared/MensagensBox';
import { CompanyProfileView } from './CompanyProfileView';
import { SailorProfileView }  from './SailorProfileView';
import { ComunidadeTab }      from '../client/ComunidadeTab';
import { ConfiguracoesTab }   from '../client/ConfiguracoesTab';
import { ReservasTab }        from '../client/ReservasTab';
import { PerfilTab }          from '../client/PerfilTab';
import { MarketplaceTab }     from '../shared/MarketplaceTab';

// ── Tipos de abas ─────────────────────────────────────────────────────────────

type TabKey = 'perfil' | 'reservas' | 'marketplace' | 'mensagens' | 'configuracoes' | 'comunidade';

const TABS: { key: TabKey; icon: React.ElementType; label: string; short: string }[] = [
  { key: 'perfil',        icon: User,          label: 'Perfil',                      short: 'Perfil'     },
  { key: 'marketplace',   icon: Store,         label: 'Marketplace',                 short: 'Market'     },
  { key: 'reservas',      icon: BookOpen,      label: 'Reservas',                    short: 'Reservas'   },
  { key: 'mensagens',     icon: MessageSquare, label: 'Mensagens',                   short: 'Mensagens'  },
  { key: 'configuracoes', icon: Settings,      label: 'Configurações',               short: 'Config'     },
  { key: 'comunidade',    icon: Users,         label: 'Faça parte da comunidade',    short: 'Comunidade' },
];

// ══ COMPONENTE PRINCIPAL ═══════════════════════════════════════════════════════

export function ClientArea({ auth, onLogout }: { auth: AuthState; onLogout: () => void }) {
  const [tab,          setTab]          = useState<TabKey>('perfil');
  const [searchOpen,   setSearchOpen]   = useState(false);
  const [clientData,   setClientData]   = useState<any>(() => getClients().find(c => c.id === auth.clientId) || null);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(() => {
    return getClients().find(c => c.id === auth.clientId)?.profile_photo ?? null;
  });
  const [allBoats,     setAllBoats]     = useState<CatalogBoat[]>([]);
  const [myBookings,   setMyBookings]   = useState(() => getBookings(undefined, auth.clientId));
  const [myEventBookings, setMyEventBookings] = useState<any[]>([]);
  const [msgKey,       setMsgKey]       = useState(0);
  const [selectedBoat, setSelectedBoat] = useState<CatalogBoat | null>(() => {
    try {
      const p = sessionStorage.getItem('nw_pending_boat');
      if (p) { sessionStorage.removeItem('nw_pending_boat'); return JSON.parse(p); }
    } catch {}
    return null;
  });
  const [preDate, setPreDate] = useState<string | undefined>();
  const [preSlot, setPreSlot] = useState<string | undefined>();
  const [moreOpen, setMoreOpen] = useState(false);
  const [appModalOpen, setAppModalOpen] = useState(false);

  // Candidatura existente deste client
  const existingApp = auth.clientId
    ? getSailorApplicationsByClient(auth.clientId).sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0]
    : null;

  // ── Busca (navbar) — aba Empresas / Tripulantes ────────────────────────────
  const [searchTab, setSearchTab] = useState<'empresas' | 'tripulantes'>('empresas');

  // Empresas
  const [companySearchNome,   setCompanySearchNome]   = useState('');
  const [companySearchPais,   setCompanySearchPais]   = useState('');
  const [companySearchEstado, setCompanySearchEstado] = useState('');
  const [companySearchCidade, setCompanySearchCidade] = useState('');
  const [companySearchPerfil, setCompanySearchPerfil] = useState('');
  const [companySearchEmail,  setCompanySearchEmail]  = useState('');
  const [companySearchSetor,  setCompanySearchSetor]  = useState('');
  const [companyResults,      setCompanyResults]      = useState<Company[] | null>(null);
  const [viewingCompany,      setViewingCompany]      = useState<Company | null>(null);

  // Tripulantes
  const [sailorSearchQuery,  setSailorSearchQuery]  = useState('');
  const [sailorSearchNac,    setSailorSearchNac]    = useState('');
  const [sailorSearchPerfil, setSailorSearchPerfil] = useState('');
  const [sailorSearchFuncao, setSailorSearchFuncao] = useState('');
  const [sailorSearchDisp,   setSailorSearchDisp]   = useState('');
  const [showSailorAdvanced, setShowSailorAdvanced] = useState(false);
  const [viewingSailor,      setViewingSailor]       = useState<Sailor | null>(null);

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

  // ── Busca de tripulantes ──────────────────────────────────────────────────
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

  const hasSailorAdvanced = sailorSearchNac || sailorSearchPerfil || sailorSearchFuncao || sailorSearchDisp;

  // Lê fresh do cache a cada filtro (getSailors() é síncrono e lê do cache já populado)
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

  // Funções e disponibilidades para os chips (lê fresh quando o painel abre)
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

  useEffect(() => {
    refreshAll().then(async () => {
      const updated = getClients().find(c => c.id === auth.clientId);
      if (updated) setClientData(updated);
      setAllBoats(loadTrips());
      setMyBookings(getBookings(undefined, auth.clientId));
      if (auth.clientId) setMyEventBookings(await getEventBookingsByClient(auth.clientId));
    });
  }, []); // eslint-disable-line

  const client   = clientData;
  const unreadMsgs = 0; // futuro: contar mensagens não lidas

  const BOTTOM_TABS = TABS.slice(0, 4);

  async function refreshBookings() {
    await refreshAll();
    setAllBoats(loadTrips());
    setMyBookings(getBookings(undefined, auth.clientId));
    if (auth.clientId) setMyEventBookings(await getEventBookingsByClient(auth.clientId));
    setMsgKey(k => k + 1);
  }

  function handleSelect(boat: CatalogBoat, date?: string, slot?: string) {
    setSelectedBoat(boat); setPreDate(date); setPreSlot(slot);
  }

  function clearBoat() {
    setSelectedBoat(null); setPreDate(undefined); setPreSlot(undefined);
  }

  async function handleClientBooking(data: BookingData) {
    const trip = getTrips().find(t => t.id === data.boat.id);
    try {
      await saveBooking({
        trip_id:        data.boat.id,
        sailor_id:      trip?.sailor_id || '',
        client_id:      auth.clientId,
        customer_name:  data.customerName,
        customer_phone: data.customerPhone,
        booking_date:   data.date,
        time_slot:      data.timeSlot || '',
        passengers:     data.passengers,
        notes:          data.notes,
        total_price:    data.boat.price_per_hour * data.passengers,
        status:         'pending',
      });
    } catch (e: any) {
      await refreshBookings();
      if (e?.message === 'OVERBOOK') {
        alert(
          'Esta vaga acabou de ser preenchida enquanto confirmava a reserva. ' +
          'Escolha outro horário — a disponibilidade foi atualizada.'
        );
      } else {
        alert('Não foi possível concluir a reserva. Tente novamente.');
      }
      return;
    }
    notifyBookingStatusChange({
      clientId:    auth.clientId || '',
      bookingId:   '',
      tripName:    data.boat.name,
      bookingDate: data.date,
      timeSlot:    data.timeSlot || '',
      passengers:  data.passengers,
      newStatus:   'pending',
    });
    const ph  = data.customerPhone.replace(/\D/g, '');
    const msg = encodeURIComponent(
      `⚓ *NorthWindy* — Reserva Recebida!\n\nOlá *${data.customerName}*! 🌊\n\n` +
      `Reserva para *${data.boat.name}* registada ✅\n\n` +
      `📅 ${data.date}${data.timeSlot ? ' · 🕐 ' + data.timeSlot : ''}\n` +
      `👥 ${data.passengers} pessoa${data.passengers !== 1 ? 's' : ''}\n\nAguarde a confirmação! ⛵`
    );
    if (ph) window.open(`https://wa.me/${ph}?text=${msg}`, '_blank');
    await refreshBookings();
    clearBoat();
  }

  function handleTabChange(key: TabKey) {
    setTab(key); setMoreOpen(false);
  }

  // Se clicou numa empresa nos resultados, mostra o perfil completo
  if (viewingCompany) {
    return <CompanyProfileView company={viewingCompany} onBack={() => { setViewingCompany(null); setSearchOpen(false); clearCompanySearch(); }} />;
  }

  // Se clicou num tripulante nos resultados, mostra o perfil completo
  if (viewingSailor) {
    return <SailorProfileView sailor={viewingSailor} onBack={() => { setViewingSailor(null); setSearchOpen(false); clearSailorSearch(); }} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* ── NAVBAR ── */}
      <nav className="bg-[#0a1628] text-white px-4 py-3 sticky top-0 z-40 shadow-xl border-b border-[#c9a96e]/10">
        <div className="flex items-center gap-3 max-w-6xl mx-auto">
          {/* Logo */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Waves className="w-5 h-5 text-[#c9a96e]/60" />
            <span className="font-['Playfair_Display'] font-bold italic text-base hidden sm:inline">NorthWindy</span>
            <span className="bg-[#c9a96e]/15 text-[#c9a96e] text-[9px] font-semibold uppercase px-2 py-0.5 tracking-wider">
              Passageiro
            </span>
          </div>

          {/* Avatar + nome */}
          <div className="flex-1 min-w-0 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 border-2 border-white/20">
              {profilePhoto
                ? <img src={profilePhoto} alt="" className="w-full h-full object-cover" />
                : <div className="w-full h-full bg-white/20 flex items-center justify-center font-black text-[10px]">
                    {(auth.userName || 'U').substring(0, 2).toUpperCase()}
                  </div>
              }
            </div>
          </div>

          {/* Ações */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button onClick={() => { setSearchOpen(v => !v); if (searchOpen) { clearCompanySearch(); clearSailorSearch(); } }}
              className={`flex items-center gap-2 px-3 py-2 rounded-[10px] transition-all ${searchOpen ? 'bg-white text-blue-900' : 'bg-white/5 text-white hover:bg-white/10'}`}>
              <Search className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs font-bold hidden sm:inline">Buscar perfil</span>
            </button>
            <button onClick={() => handleTabChange('mensagens')} className="relative bg-white/5 hover:bg-white/10 p-2 transition-all">
              <MessageSquare className="w-4 h-4 text-white" />
            </button>
            <button onClick={() => handleTabChange('configuracoes')} className="bg-white/5 hover:bg-white/10 p-2 transition-all">
              <Settings className="w-4 h-4 text-white" />
            </button>
            <button onClick={onLogout}
              className="bg-white/5 hover:bg-red-600/80 px-3 py-2 text-xs font-medium uppercase flex items-center gap-1 transition-all">
              <LogOut className="w-3 h-3" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>

        {/* ── PAINEL DE BUSCA (Empresas / Tripulantes) ── */}
        {searchOpen && (
          <div className="border-t border-[#c9a96e]/10 bg-[#060e1e] px-4 py-4">
            <div className="max-w-6xl mx-auto">

              {/* ── Tabs Empresas / Tripulantes ── */}
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
                        className="bg-white/5 border border-white/10 px-3 py-2 text-xs font-medium text-white placeholder:text-white/30 focus:border-[#c9a96e]/60 outline-none transition-colors" />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input value={companySearchSetor} onChange={e => setCompanySearchSetor(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleCompanySearch()}
                      placeholder="Setor de negócio"
                      className="flex-1 bg-white/5 border border-white/10 px-3 py-2 text-xs font-medium text-white placeholder:text-white/30 focus:border-[#c9a96e]/60 outline-none transition-colors" />
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
                          <button key={c.id} onClick={() => setViewingCompany(c)}
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
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
                      <input
                        value={sailorSearchQuery}
                        onChange={e => setSailorSearchQuery(e.target.value)}
                        placeholder="Buscar por nome, função, nacionalidade, idioma…"
                        className="w-full bg-white/5 border border-white/10 py-2.5 pl-9 pr-3 text-xs font-medium text-white placeholder:text-white/30 focus:border-[#c9a96e]/60 outline-none transition-colors"
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
                      {/* Campos de texto */}
                      <div>
                        <p className="text-[9px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em] mb-1.5">Filtros por campo</p>
                        <div className="grid grid-cols-2 gap-2">
                          <input value={sailorSearchNac} onChange={e => setSailorSearchNac(e.target.value)}
                            placeholder="Nacionalidade"
                            className="bg-white/5 border border-white/10 px-3 py-2 text-xs font-medium text-white placeholder:text-white/30 focus:border-[#c9a96e]/60 outline-none transition-colors" />
                          <input value={sailorSearchPerfil} onChange={e => setSailorSearchPerfil(e.target.value)}
                            placeholder="Nº Perfil"
                            className="bg-white/5 border border-white/10 px-3 py-2 text-xs font-medium text-white placeholder:text-white/30 focus:border-[#c9a96e]/60 outline-none transition-colors" />
                        </div>
                      </div>

                      {/* Filtro por função — chips */}
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

                      {/* Filtro por disponibilidade — chips */}
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
                            <button key={s.id} onClick={() => setViewingSailor(s)}
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
        )}
      </nav>

      {/* ── CONTENT AREA ── */}
      <div className="flex flex-1 max-w-6xl mx-auto w-full">

        {/* ── SIDEBAR desktop (≥ md) ── */}
        <aside className="hidden md:flex flex-col gap-1 w-52 flex-shrink-0 py-6 pl-4 pr-2">
          {/* Mini perfil card */}
          <div className="bg-white border border-gray-100 p-4 mb-3 relative" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a96e]/40 to-transparent" />
            <div
              className="w-14 h-14 overflow-hidden border border-[#c9a96e]/30 mx-auto mb-2 cursor-pointer group relative"
              onClick={() => document.getElementById('sidebar-photo-input')?.click()}
            >
              {profilePhoto
                ? <img src={profilePhoto} alt="" className="w-full h-full object-cover" />
                : <div className="w-full h-full bg-[#0a1628] text-[#c9a96e] flex items-center justify-center font-bold text-lg">
                    {(auth.userName || 'U').substring(0, 2).toUpperCase()}
                  </div>
              }
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-4 h-4 text-white" />
              </div>
              <input id="sidebar-photo-input" type="file" accept="image/*" className="hidden"
                onChange={e => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  if (f.size > 4 * 1024 * 1024) { alert('Máximo 4MB'); return; }
                  const reader = new FileReader();
                  reader.onload = ev => {
                    const img = new Image();
                    img.onload = () => {
                      const MAX = 400; let { width, height } = img;
                      if (width > MAX || height > MAX) {
                        if (width > height) { height = Math.round(height*MAX/width); width = MAX; }
                        else { width = Math.round(width*MAX/height); height = MAX; }
                      }
                      const canvas = document.createElement('canvas');
                      canvas.width = width; canvas.height = height;
                      canvas.getContext('2d')?.drawImage(img, 0, 0, width, height);
                      const data = canvas.toDataURL('image/jpeg', 0.8);
                      setProfilePhoto(data);
                      if (auth.clientId) updateClient(auth.clientId, { profile_photo: data });
                    };
                    img.src = ev.target?.result as string;
                  };
                  reader.readAsDataURL(f);
                }}
              />
            </div>
            <p className="font-['Playfair_Display'] font-bold text-[#1a2b4a] text-xs text-center leading-tight truncate">{client?.name || auth.userName}</p>
            <p className="text-[10px] font-medium text-[#c9a96e] text-center mt-0.5 tracking-[0.1em] uppercase">{client?.profile_number}</p>
            <div className="mt-2 pt-2 border-t border-gray-50 flex items-center justify-center gap-1">
              <CheckCircle2 className="w-2.5 h-2.5 text-green-500" />
              <p className="text-[9px] font-semibold text-green-600 uppercase tracking-wide">Verificado</p>
            </div>
          </div>

          {TABS.map(t => {
            const Icon   = t.icon;
            const active = tab === t.key;
            return (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex items-center gap-2.5 px-4 py-3 text-xs font-semibold uppercase tracking-wide transition-all border-l-2 ${
                  active
                    ? 'bg-[#0a1628] text-white border-[#c9a96e]'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-[#1a2b4a] border-transparent'
                }`}>
                <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${active ? 'text-[#c9a96e]' : ''}`} />
                {t.label}
                {active && <ChevronRight className="w-3 h-3 ml-auto text-[#c9a96e]" />}
              </button>
            );
          })}
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main className="flex-1 min-w-0 px-4 py-4 pb-24 md:pb-6 md:py-6 overflow-hidden">
          {tab === 'reservas'      && <ReservasTab bookings={myBookings} eventBookings={myEventBookings} onRefresh={refreshBookings} />}
          {tab === 'mensagens'     && (
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em] mb-1">Comunicações</p>
                <h2 className="font-['Playfair_Display'] font-bold text-[#1a2b4a] text-xl">Mensagens</h2>
                <div className="w-8 h-px bg-[#c9a96e] mt-2" />
              </div>
              <MensagensBox key={msgKey} clientId={auth.clientId || ''} />
            </div>
          )}
          {tab === 'perfil'        && (
            <PerfilTab client={client} profilePhoto={profilePhoto} onPhotoChange={p => {
              setProfilePhoto(p);
              if (auth.clientId) updateClient(auth.clientId, { profile_photo: p });
            }} onGoToComunidade={() => handleTabChange('comunidade')}
            onOpenApplication={() => setAppModalOpen(true)} />
          )}
          {tab === 'configuracoes' && (
            <ConfiguracoesTab
              auth={auth}
              client={client}
              onLogout={onLogout}
              onClientChange={patch => setClientData((p: any) => ({ ...p, ...patch }))}
            />
          )}
          {tab === 'comunidade' && (
            <ComunidadeTab
              onGoToProfile={() => handleTabChange('perfil')}
              onOpenApplication={() => {
                setAppModalOpen(true);
              }}
              applicationStatus={existingApp?.status}
            />
          )}
          {tab === 'marketplace'  && <MarketplaceTab role="client" />}
        </main>
      </div>

      {/* ── BOTTOM TAB BAR (mobile) ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-gray-100 shadow-2xl">
        {/* Tabs adicionais no overlay (Mensagens, Comunidade) */}
        {moreOpen && (
          <div className="absolute bottom-full left-0 right-0 bg-white border-t border-gray-100 shadow-2xl p-4">
            <div className="grid grid-cols-1 gap-2">
              {TABS.slice(4).map(t => {
                const Icon   = t.icon;
                const active = tab === t.key;
                return (
                  <button key={t.key} onClick={() => handleTabChange(t.key)}
                    className={`flex items-center gap-3 px-4 py-3 font-semibold text-xs uppercase tracking-wide transition-all border-l-2 ${
                      active ? 'bg-[#0a1628] text-white border-[#c9a96e]' : 'bg-gray-50 text-gray-500 border-transparent'
                    }`}>
                    <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-[#c9a96e]' : ''}`} /> {t.label}
                  </button>
                );
              })}
            </div>
            <button onClick={() => setMoreOpen(false)}
              className="w-full mt-3 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wider border border-gray-100">
              Fechar
            </button>
          </div>
        )}

        <div className="flex items-stretch h-16">
          {BOTTOM_TABS.map(t => {
            const Icon   = t.icon;
            const active = tab === t.key && !moreOpen;
            return (
              <button key={t.key} onClick={() => handleTabChange(t.key)}
                className={`flex-1 flex flex-col items-center justify-center gap-0.5 relative transition-all ${
                  active ? 'text-[#c9a96e]' : 'text-gray-400'
                }`}>
                <Icon className={`w-5 h-5 transition-all ${active ? 'scale-110' : ''}`} />
                <span className="text-[9px] font-semibold uppercase tracking-wide">{t.short}</span>
                {active && <div className="absolute bottom-0 h-0.5 w-8 bg-[#c9a96e]" />}
              </button>
            );
          })}
          {/* Botão "Mais" */}
          <button onClick={() => setMoreOpen(v => !v)}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-all ${
              moreOpen || tab === 'configuracoes' || tab === 'comunidade' ? 'text-[#c9a96e]' : 'text-gray-400'
            }`}>
            {moreOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
            <span className="text-[9px] font-semibold uppercase tracking-wide">Mais</span>
          </button>
        </div>
      </div>

      {/* Modal de reserva */}
      {selectedBoat && (
        <BookingModal
          boat={selectedBoat}
          clientName={client?.name || auth.userName}
          clientPhone={client?.phone || ''}
          preselectedDate={preDate}
          preselectedTimeSlot={preSlot}
          onClose={clearBoat}
          onConfirm={handleClientBooking}
        />
      )}

      {/* Modal de candidatura a tripulante */}
      {appModalOpen && client && (
        <SailorApplicationModal
          client={client}
          onClose={() => {
            setAppModalOpen(false);
          }}
        />
      )}
    </div>
  );
}