// src/components/admin/AdminDashboard.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Painel Admin / Sailor — orquestra tabs, dados e modais globais.
// Layout (navbar, sidebar, bottom bar) extraído para sub-componentes.
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect, useRef, useState } from 'react';
import {
  Users, Ship, Compass, ShieldCheck, XCircle,
  UserCheck, Bell, DollarSign, Building2,
  CalendarDays, Store, User, Settings as SettingsIcon,
} from 'lucide-react';
import { MarketplaceTab } from '../shared/MarketplaceTab';
import { useFriendships } from '../shared/FriendComponents';
import { SailorPerfilTab } from '../sailor/SailorPerfilTab';
import { SailorConfiguracoesTab } from '../sailor/SailorConfiguracoesTab';
import { ClientProfileView } from '../pages/ClientProfileView';
import { EmpresaFuncionarioTab } from '../company/EmpresaFuncionarioTab';
import { loadEmpresaBell, markComunicadoSeen, type BellItem } from '../../lib/rh';
import type { Company } from '../../lib/store/companies';
import {
  getSailors, getClients, getBoats, getTrips, getBookings,
  getPendingBoats, approveBoat, rejectBoat,
  approveSailor, approveClient, updateSailor, updateClient, updateBookingStatus,
  getMessages, markAllMessagesRead,
  notifyBookingStatusChange,
  sendWelcomeMessage, getCompanies, refreshAll, isInitialized,
  getSailorApplications,
  type Sailor, type Client, type Boat, type Trip, type Booking, type Message,
} from '../../lib/localStore';
import { uploadDoc } from '../../lib/storage';

// Layout
import { AdminDashboardNavbar }   from './AdminDashboardNavbar';
import { AdminDashboardSidebar }  from './AdminDashboardSidebar';
import { AdminDashboardBottomBar } from './AdminDashboardBottomBar';

// Tabs
import { ReservasTab }      from './tabs/ReservasTab';
import { FrotaTab }         from './tabs/FrotaTab';
import { PasseiosTab }      from './tabs/PasseiosTab';
import { CancelamentosTab } from './tabs/CancelamentosTab';
import { SolicitacoesTab }  from './tabs/SolicitacoesTab';
import { VerificadosTab }   from './tabs/VerificadosTab';
import { ClientesTab }      from './tabs/ClientesTab';
import { MensagensTab }     from './tabs/MensagensTab';
import { FinanceiroTab }    from './tabs/FinanceiroTab';
import { EmpresasTab }      from './tabs/EmpresasTab';
import { EventosAdminTab }  from './tabs/EventosAdminTab';
import { KpiCard, type Auth, type TabKey, type TabDef, type ClientesSubTab } from './AdminDashboardShared';

// Modais globais
import { DossierSailor }       from '../shared/DossierSailor';
import { DossierClient }       from '../shared/DossierClient';
import { CompanyProfileView }  from '../pages/CompanyProfileView';
import { SailorProfileView } from '../pages/SailorProfileView';
import { CancelModal }      from '../modals/CancelModal';
import { DeleteConfirmModal, type DeleteTarget } from '../modals/DeleteConfirmModal';
import { BoatRegistrationModal } from '../modals/BoatRegistrationModal';
import { CreateTripModal }       from '../modals/CreateTripModal';
import { VerifyClientModal, ClientCredentialsModal } from './AdminVerifyClientModal';
import { SailorSettingsModal }   from './SailorSettingsModal';

// ── Componente principal ─────────────────────────────────────────────────────

export function AdminDashboard({ auth, onLogout }: { auth: Auth | null; onLogout: () => void }) {
  const isAdmin  = auth?.role === 'admin';
  const isSailor = auth?.role === 'sailor';

  const [tab,           setTab]           = useState<TabKey>('reservas');
  const [sailors,       setSailors]       = useState<Sailor[]>([]);
  const [clients,       setClients]       = useState<Client[]>([]);
  const [boats,         setBoats]         = useState<Boat[]>([]);
  const [pendingBoats,  setPendingBoats]  = useState<Boat[]>([]);
  const [solInitialSub, setSolInitialSub] = useState<'profissionais'|'usuarios'|'embarcacoes'|'empresas'|'tripulacao'|'documentos'>('profissionais');
  const [trips,         setTrips]         = useState<Trip[]>([]);
  const [bookings,      setBookings]      = useState<Booking[]>([]);
  const [sailorMsgs,    setSailorMsgs]    = useState<Message[]>([]);
  const [sailorPhoto,   setSailorPhoto]   = useState<string>('');

  // Sub-tab dentro de "Clientes" (admin)
  const [clientesSubTab, setClientesSubTab] = useState<ClientesSubTab>('usuarios');

  // Modais de criação
  const [showBoatModal, setShowBoatModal] = useState(false);
  const [showTripModal, setShowTripModal] = useState(false);
  const [tripBoat,      setTripBoat]      = useState<Boat | null>(null);
  const [showSettings,  setShowSettings]  = useState(false);

  // Modais shared
  const [dossierSailor,  setDossierSailor]  = useState<Sailor | null>(null);
  const [dossierClient,  setDossierClient]  = useState<Client | null>(null);
  const [viewingCompany, setViewingCompany] = useState<Company | null>(null);
  const [viewingSailorProfile, setViewingSailorProfile] = useState<Sailor | null>(null);
  const [viewingClientProfile, setViewingClientProfile] = useState<Client | null>(null);
  const [cancelConfirm,  setCancelConfirm]  = useState<string | null>(null);
  const [deleteConfirm,  setDeleteConfirm]  = useState<DeleteTarget | null>(null);
  const [verifyModal,    setVerifyModal]    = useState<Client | null>(null);
  const [verifiedModal,  setVerifiedModal]  = useState<any | null>(null);
  const [approveLoading, setApproveLoading] = useState(false);
  const [filterBoatId,   setFilterBoatId]   = useState<string | null>(null);

  // Dados derivados
  const sailorData            = isSailor && auth.sailorId ? sailors.find(s => s.id === auth.sailorId) ?? null : null;
  const pending               = sailors.filter(s => s.status === 'pending');
  const verified              = sailors.filter(s => s.status === 'approved' && s.verified);
  // Detecção de client convertido a tripulante — três verificações em cascata:
  // 1. role === 'converted_to_sailor' (código actual — definido no approveSailorApplication)
  // 2. mesmo UUID que um sailor (approveSailorApplication actual preserva o id do client)
  // 3. mesmo email que um sailor (cobre promoções antigas onde o UUID era diferente)
  // Usar as três garante que cadastros promovidos antes das correcções também são detectados.
  const sailorIdSet           = new Set(sailors.map(s => s.id));
  const sailorEmailSet        = new Set(sailors.map(s => s.email.toLowerCase()));
  const isConverted           = (c: Client) =>
    c.role === 'converted_to_sailor' ||
    sailorIdSet.has(c.id) ||
    sailorEmailSet.has(c.email.toLowerCase());
  const pendingClients        = clients.filter(c => c.status === 'pending_verification' && !isConverted(c));
  const activeClients         = clients.filter(c => c.status === 'active' && !isConverted(c));
  const pendingCompaniesCount = getCompanies().filter(c => c.status === 'pending').length;
  const activeCompaniesCount  = getCompanies().filter(c => c.status === 'active').length;
  const unreadMsgs            = isSailor && auth.sailorId ? sailorMsgs.filter(m => !m.read).length : 0;
  const [empresaUnread, setEmpresaUnread] = useState(0);
  const [bellItems,     setBellItems]     = useState<BellItem[]>([]);
  const { friendships, loadFriendships, pendingCount: friendPendingCount } = useFriendships(isSailor ? auth?.sailorId : undefined);

  useEffect(() => { loadData(); }, [auth]); // eslint-disable-line
  useEffect(() => { setSailorPhoto(sailorData?.profile_photo || ''); }, [sailorData?.profile_photo]); // eslint-disable-line

  /** Lê o cache em memória e sincroniza o estado React (síncrono, 0ms). */
  function syncFromCache() {
    setSailors(getSailors());
    setClients(getClients());
    setBookings(getBookings(isSailor ? auth?.sailorId : undefined));
    if (isSailor && auth?.sailorId) {
      setBoats(getBoats(auth.sailorId));
      setTrips(getTrips(auth.sailorId));
      setSailorMsgs(getMessages(auth.sailorId));
    } else {
      setBoats(getBoats());
      setTrips(getTrips());
    }
    setPendingBoats(getPendingBoats());
  }

  // Ticket de versão: garante que um refresh antigo (em flight) não sobrescreve
  // os dados de um refresh mais recente — evita race conditions pós-write.
  const refreshTicketRef = useRef(0);

  /** Carrega bell de empresa em paralelo (não bloqueia o render). */
  function loadBell() {
    if (isSailor && auth?.sailorId) {
      loadEmpresaBell(auth.sailorId).then(({ count, items }) => {
        setEmpresaUnread(count);
        setBellItems(items);
      });
    }
  }

  async function loadData() {
    // Stale-while-revalidate: se o cache já tem dados, renderiza imediatamente
    // e actualiza em background — sem delay percetível nas visitas seguintes.
    if (isInitialized()) {
      syncFromCache();                        // render instantâneo com dados anteriores
      loadBell();                             // bell em paralelo com refreshAll
      const ticket = ++refreshTicketRef.current;
      refreshAll().then(() => {
        // Só aplica se nenhum refresh mais recente foi iniciado depois
        if (ticket === refreshTicketRef.current) { syncFromCache(); loadBell(); }
      });
      return;
    }
    // Primeira carga: refreshAll + bell correm em paralelo
    const ticket = ++refreshTicketRef.current;
    const bellP = isSailor && auth?.sailorId
      ? loadEmpresaBell(auth.sailorId)
      : Promise.resolve(null);
    await Promise.all([refreshAll(), bellP.then(r => {
      if (r) { setEmpresaUnread(r.count); setBellItems(r.items); }
    })]);
    if (ticket === refreshTicketRef.current) syncFromCache();
  }

  // ── Handlers ──────────────────────────────────────────────────────────────

  async function handleApproveSailor(s: Sailor) {
    setApproveLoading(true);
    const pin        = Math.random().toString(36).substring(2, 8).toUpperCase();
    const profileNum = String(parseInt((s as any).profile_number || '1', 10));
    const login      = s.name.split(' ')[0].toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '') + '#' + profileNum;
    await approveSailor(s.id);
    await updateSailor(s.id, { sailor_login: login, sailor_password: pin } as any);
    await sendWelcomeMessage(s.id, s.name, 'sailor');
    setSailors(getSailors());
    setDossierSailor(null);
    setApproveLoading(false);
    setClientesSubTab('verificados');
    setTab('clientes');
  }

  async function handleRejectSailor(s: Sailor, reasons: string[]) {
    await updateSailor(s.id, { status: 'pending', block_reason: reasons.join(' · ') } as any);
    setSailors(getSailors());
    setDossierSailor(null);
  }

  async function handleVerifyClient() {
    if (!verifyModal) return;
    setApproveLoading(true);
    const pNum            = String(parseInt((verifyModal as any).profile_number || '1', 10));
    const client_login    = verifyModal.name.split(' ')[0].toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '') + '#' + pNum;
    const client_password = '0000';
    await approveClient(verifyModal.id);
    await updateClient(verifyModal.id, { client_login, client_password } as any);
    await sendWelcomeMessage(verifyModal.id, verifyModal.name, 'client');
    setClients(getClients());
    setVerifiedModal({ ...verifyModal, client_login, client_password });
    setVerifyModal(null);
    setApproveLoading(false);
  }

  async function handleCancelConfirm(bookingId: string, reason: string) {
    await updateBookingStatus(bookingId, 'cancelado');
    setCancelConfirm(null);
    loadData();
  }

  async function handleSailorPhoto(file: File) {
    if (file.size > 4 * 1024 * 1024) { alert('Máximo 4MB'); return; }
    if (!auth?.sailorId) return;
    try {
      const url = await uploadDoc(file, 'sailors', `profile-${auth.sailorId}`);
      if (!url) return;
      setSailorPhoto(url);
      await updateSailor(auth.sailorId, { profile_photo: url } as any);
      setSailors(getSailors());
    } catch (err) {
      console.error('[NorthWindy] Erro ao guardar foto de perfil:', err);
      alert('Erro ao guardar foto. Tente novamente.');
    }
  }

  function handleTabChange(key: TabKey) {
    setTab(key);
    if (key === 'mensagens' && isSailor && auth?.sailorId) {
      markAllMessagesRead(auth.sailorId);
    }
  }

  // ── Definição de tabs ─────────────────────────────────────────────────────

  const candidatosBadge = getSailorApplications('pending').length;
  const solBadge = pending.length + pendingClients.length + pendingBoats.length + pendingCompaniesCount + candidatosBadge;

  const ADMIN_TABS: TabDef[] = [
    { key: 'reservas',      icon: Users,        label: 'Reservas e Cancelamentos',      short: 'Res./Canc.' },
    { key: 'sol',           icon: UserCheck,    label: 'Solicitações',  short: 'Solicit.', badge: solBadge > 0 ? solBadge : undefined },
    { key: 'passeios',      icon: Compass,      label: 'Passeios',      short: 'Passeios' },
    { key: 'clientes',      icon: Users,        label: 'Clientes',      short: 'Clientes' },
    { key: 'eventos',       icon: CalendarDays, label: 'Eventos',       short: 'Eventos' },
    { key: 'financeiro',    icon: DollarSign,   label: 'Financeiro',    short: 'Finanças' },
    { key: 'cancelamentos', icon: XCircle,  label: 'Cancelamentos', short: 'Cancels.' },
    { key: 'mensagens',     icon: Bell,     label: 'Mensagens',     short: 'Msgs' },
    { key: 'marketplace',   icon: Store,    label: 'Marketplace',   short: 'Market' },
  ];

  const SAILOR_TABS: TabDef[] = [
    { key: 'perfil',        icon: User,           label: 'Perfil Público',      short: 'Perfil', badge: friendPendingCount > 0 ? friendPendingCount : undefined },
    { key: 'reservas',      icon: Users,          label: 'Reservas e Cancelamentos', short: 'Res./Canc.' },
    { key: 'frota',         icon: Ship,           label: 'Minha Frota',         short: 'Frota' },
    { key: 'eventos',       icon: CalendarDays,   label: 'Passeios e Eventos',  short: 'Pass./Ev.' },
    { key: 'empresa',       icon: Building2,      label: 'Empresa',             short: 'Empresa', badge: empresaUnread > 0 ? empresaUnread : undefined },
    { key: 'cancelamentos', icon: XCircle,  label: 'Cancelamentos', short: 'Cancels.' },
    { key: 'mensagens',     icon: Bell,     label: 'Mensagens',     short: 'Msgs', badge: unreadMsgs > 0 ? unreadMsgs : undefined },
    { key: 'marketplace',   icon: Store,    label: 'Marketplace',   short: 'Market' },
    { key: 'configuracoes', icon: SettingsIcon, label: 'Configurações', short: 'Config' },
  ];

  const ALL_TABS    = isAdmin ? ADMIN_TABS : SAILOR_TABS;
  const BOTTOM_TABS = ALL_TABS.slice(0, 5);
  const MORE_TABS   = ALL_TABS.slice(5);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      <AdminDashboardNavbar
        isAdmin={isAdmin} isSailor={isSailor} auth={auth}
        sailorData={sailorData} sailorPhoto={sailorPhoto}
        unreadMsgs={unreadMsgs} empresaUnread={empresaUnread} solBadge={solBadge}
        bellItems={bellItems}
        onLogout={onLogout}
        onSettings={() => setShowSettings(true)}
        onGoToMessages={() => handleTabChange('mensagens')}
        onGoToSol={() => handleTabChange('sol')}
        onGoToEmpresa={(itemId?: string) => {
          handleTabChange('empresa');
          if (itemId) {
            markComunicadoSeen(auth?.sailorId ?? '', itemId);
            setBellItems(prev => prev.filter(i => i.id !== itemId));
            setEmpresaUnread(prev => Math.max(0, prev - 1));
          }
        }}
        onOpenSailorDossier={s => setViewingSailorProfile(s)}
        onOpenClientDossier={c => isSailor ? setViewingClientProfile(c) : setDossierClient(c)}
        onOpenCompanyDossier={(c: Company) => setViewingCompany(c)}
      />

      <div className="flex flex-1 max-w-6xl mx-auto w-full">

        <AdminDashboardSidebar
          isAdmin={isAdmin} isSailor={isSailor}
          sailorData={sailorData} sailorPhoto={sailorPhoto}
          tabs={ALL_TABS} activeTab={tab}
          onTabChange={handleTabChange}
          onPhotoChange={handleSailorPhoto}
          clientesSubTab={clientesSubTab}
          onClientesSubTabChange={setClientesSubTab}
        />

        {/* ── MAIN CONTENT ── */}
        <main className="flex-1 min-w-0 px-4 py-4 pb-24 md:pb-6 md:py-6 overflow-hidden">

          {/* KPIs admin */}
          {isAdmin && (
            <div className="mb-6 space-y-4">
              <h1 className="font-['Playfair_Display'] font-bold italic text-2xl text-[#1a2b4a]">Controlo NorthWindy</h1>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {[
                  { emoji:'👤', label:'Usuários',      value: activeClients.length },
                  { emoji:'✔',  label:'Profissionais', value: verified.length },
                  { emoji:'⛵', label:'Embarcações',   value: boats.length },
                  { emoji:'🧭', label:'Passeios',      value: trips.length },
                  { emoji:'📋', label:'Reservas',      value: bookings.filter(b=>b.status!=='cancelado').length },
                  { emoji:'🏢', label:'Empresas',      value: activeCompaniesCount },
                ].map(s => <KpiCard key={s.label} {...s} />)}
              </div>

            </div>
          )}

          {/* Conteúdo das tabs */}
          {tab === 'perfil' && isSailor && sailorData && auth?.sailorId && (
            <SailorPerfilTab
              sailor={sailorData}
              profilePhoto={sailorPhoto || sailorData.profile_photo || null}
              onPhotoChange={async (p) => {
                if (!auth.sailorId) return;
                setSailorPhoto(p || '');
                await updateSailor(auth.sailorId, { profile_photo: p } as any);
                setSailors(getSailors());
              }}
              sailorId={auth.sailorId}
              friendships={friendships}
              onRefreshFriends={loadFriendships}
              album={sailorData.album || []}
              onAlbumChange={async (next) => {
                if (!auth.sailorId) return;
                await updateSailor(auth.sailorId, { album: next } as any);
                setSailors(getSailors());
              }}
              onOpenFriendProfile={(otherId, otherType) => {
                if (otherType === 'sailor') {
                  const s = sailors.find(x => x.id === otherId);
                  if (s) setViewingSailorProfile(s);
                } else if (otherType === 'client') {
                  const c = clients.find(x => x.id === otherId);
                  if (c) setViewingClientProfile(c);
                } else if (otherType === 'company') {
                  const co = getCompanies().find(x => x.id === otherId);
                  if (co) setViewingCompany(co);
                }
              }}
              onDocAdded={loadData}
            />
          )}
          {tab === 'configuracoes' && isSailor && sailorData && (
            <SailorConfiguracoesTab
              auth={auth!}
              sailor={sailorData}
              onLogout={onLogout}
              onSailorChange={() => { loadData(); }}
            />
          )}
          {tab === 'reservas' && (
            <ReservasTab bookings={bookings} boats={boats} trips={trips}
              role={auth?.role ?? null} filterBoatId={filterBoatId}
              onClearFilter={() => setFilterBoatId(null)}
              onCancelRequest={setCancelConfirm} onReload={loadData} />
          )}
          {tab === 'frota' && (
            <FrotaTab boats={boats} trips={trips} bookings={bookings} sailors={sailors}
              role={auth?.role ?? null}
              onAddBoat={() => setShowBoatModal(true)}
              onCreateTrip={boat => { setTripBoat(boat); setShowTripModal(true); }}
              onFilterByBoat={id => { setFilterBoatId(id); setTab('reservas'); }}
              onBoatsChange={setBoats}
              onSendToVerification={() => { loadData(); setSolInitialSub('embarcacoes'); setTab('sol'); }} />
          )}
          {tab === 'passeios' && (
            <PasseiosTab trips={trips} bookings={bookings}
              role={auth?.role ?? null} onGoToFrota={() => setTab('frota')} onTripsChange={setTrips} />
          )}
          {tab === 'cancelamentos' && (
            <CancelamentosTab bookings={bookings} role={auth?.role ?? null} onReload={loadData} />
          )}
          {tab === 'mensagens' && (
            <MensagensTab role={auth?.role ?? null} sailorMsgs={sailorMsgs} sailors={sailors} clients={clients} />
          )}
          {tab === 'sol' && isAdmin && (
            <SolicitacoesTab
              pendingSailors={pending} pendingClients={pendingClients} pendingBoats={pendingBoats}
              sailors={sailors} initialSub={solInitialSub}
              onOpenSailorDossier={setDossierSailor}
              onVerifyClient={setVerifyModal}
              onRejectSailor={handleRejectSailor}
              onApproveBoat={b => { approveBoat(b.id); setSolInitialSub('profissionais'); loadData(); }}
              onRejectBoat={b => { rejectBoat(b.id); setSolInitialSub('profissionais'); loadData(); }}
              onDataChange={loadData} />
          )}
          {tab === 'clientes' && isAdmin && (
            <div>
              {/* Sub-tabs mobile */}
              <div className="md:hidden flex flex-wrap gap-1 mb-5 bg-gray-100 p-1">
                {([
                  { key: 'usuarios'    as ClientesSubTab, label: 'Usuários',    icon: Users },
                  { key: 'verificados' as ClientesSubTab, label: 'Verificados', icon: ShieldCheck },
                  { key: 'empresas'    as ClientesSubTab, label: 'Empresas',    icon: Building2 },
                  { key: 'frota'       as ClientesSubTab, label: 'Frota',       icon: Ship },
                ] as const).map(t => {
                  const Icon = t.icon;
                  const active = clientesSubTab === t.key;
                  return (
                    <button key={t.key} onClick={() => setClientesSubTab(t.key)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[10px] font-semibold uppercase tracking-wide transition-all ${
                        active ? 'bg-[#0a1628] text-white shadow' : 'text-gray-500 hover:text-[#1a2b4a]'
                      }`}>
                      <Icon className="w-3.5 h-3.5" />
                      {t.label}
                    </button>
                  );
                })}
              </div>
              {clientesSubTab === 'usuarios' && (
                <ClientesTab activeClients={activeClients} pendingClients={pendingClients}
                  onGoToSolicitacoes={() => setTab('sol')} onOpenDossier={setDossierClient}
                  onViewProfile={setDossierClient} />
              )}
              {clientesSubTab === 'verificados' && (
                <VerificadosTab verified={verified} onOpenDossier={setDossierSailor} onViewProfile={setViewingSailorProfile} />
              )}
              {clientesSubTab === 'empresas' && (
                <EmpresasTab onGoToSolicitacoes={() => { setSolInitialSub('empresas'); setTab('sol'); }}
                  onViewProfile={setViewingCompany} />
              )}
              {clientesSubTab === 'frota' && (
                <FrotaTab boats={boats} trips={trips} bookings={bookings} sailors={sailors}
                  role={auth?.role ?? null}
                  onAddBoat={() => setShowBoatModal(true)}
                  onCreateTrip={boat => { setTripBoat(boat); setShowTripModal(true); }}
                  onFilterByBoat={id => { setFilterBoatId(id); setTab('reservas'); }}
                  onBoatsChange={setBoats}
                  onSendToVerification={() => { loadData(); setSolInitialSub('embarcacoes'); setTab('sol'); }} />
              )}
            </div>
          )}
          {tab === 'financeiro' && isAdmin && (
            <FinanceiroTab bookings={bookings} sailors={sailors} trips={trips} boats={boats} role={auth?.role ?? null} />
          )}
          {tab === 'eventos' && (
            <EventosAdminTab role={auth?.role ?? null} sailorId={auth?.sailorId} sailorName={sailorData?.name ?? auth?.userName} />
          )}
          {tab === 'empresa' && isSailor && auth?.sailorId && (
            <EmpresaFuncionarioTab
              sailorId={auth.sailorId}
              sailorName={auth.userName ?? sailorData?.name ?? 'Funcionário'}
              onUnreadChange={setEmpresaUnread}
            />
          )}
          {tab === 'marketplace' && (
            <MarketplaceTab
              role={isAdmin ? 'admin' : 'sailor'}
              sailorId={auth?.sailorId}
            />
          )}
        </main>
      </div>

      <AdminDashboardBottomBar
        bottomTabs={BOTTOM_TABS}
        moreTabs={MORE_TABS}
        activeTab={tab}
        onTabChange={handleTabChange}
      />

      {/* ══ MODAIS GLOBAIS ══ */}

      {dossierSailor && (
        <DossierSailor sailor={dossierSailor}
          mode={dossierSailor.status === 'pending' ? 'pending' : 'verified'}
          approveLoading={approveLoading}
          onClose={() => setDossierSailor(null)}
          onApprove={handleApproveSailor}
          onReject={s => handleRejectSailor(s, [])}
          onSailorsChange={setSailors}
          onDeleteRequest={(id, name) => setDeleteConfirm({ id, role: 'sailor', name })} />
      )}
      {dossierClient && (
        <DossierClient client={dossierClient}
          onClose={() => setDossierClient(null)}
          onClientsChange={setClients}
          onDeleteRequest={(id, name) => setDeleteConfirm({ id, role: 'client', name })} />
      )}
      {cancelConfirm && (
        <CancelModal bookingId={cancelConfirm} bookings={bookings}
          onClose={() => setCancelConfirm(null)} onConfirm={handleCancelConfirm} />
      )}
      {deleteConfirm && (
        <DeleteConfirmModal target={deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          onDeleted={(newSailors, newClients) => {
            setSailors(newSailors); setClients(newClients);
            setDossierSailor(null); setDossierClient(null); loadData();
          }} />
      )}
      {verifyModal && (
        <VerifyClientModal client={verifyModal} loading={approveLoading}
          onConfirm={handleVerifyClient} onClose={() => setVerifyModal(null)} />
      )}
      {verifiedModal && (
        <ClientCredentialsModal client={verifiedModal} onClose={() => setVerifiedModal(null)} />
      )}
      {showBoatModal && (
        <BoatRegistrationModal sailorName={auth?.userName} sailorId={auth?.sailorId}
          onClose={() => setShowBoatModal(false)}
          onSuccess={() => { loadData(); setShowBoatModal(false); setTab(isAdmin ? 'sol' : 'frota'); }} />
      )}
      {showTripModal && tripBoat && (
        <CreateTripModal boat={tripBoat} sailorId={auth?.sailorId} sailorName={auth?.userName}
          onClose={() => { setShowTripModal(false); setTripBoat(null); }}
          onSuccess={() => { setTrips(auth?.sailorId ? getTrips(auth.sailorId) : getTrips()); setShowTripModal(false); setTripBoat(null); }} />
      )}
      {showSettings && auth?.sailorId && (
        <SailorSettingsModal sailorId={auth.sailorId} onClose={() => setShowSettings(false)} />
      )}

      {/* ── Perfil público da empresa (overlay full-screen) ── */}
      {viewingCompany && (
        <div className="fixed inset-0 z-[200] overflow-y-auto bg-gray-50">
          <CompanyProfileView
            company={viewingCompany}
            onBack={() => setViewingCompany(null)}
          />
        </div>
      )}

      {/* ── Perfil público do tripulante (overlay full-screen) ── */}
      {viewingSailorProfile && (
        <div className="fixed inset-0 z-[200] overflow-y-auto bg-gray-50">
          <SailorProfileView
            sailor={viewingSailorProfile}
            onBack={() => setViewingSailorProfile(null)}
            currentUserId={auth?.sailorId}
            currentUserType={auth?.sailorId ? 'sailor' : undefined}
          />
        </div>
      )}

      {/* ── Perfil público do passageiro (overlay full-screen) ── */}
      {viewingClientProfile && (
        <div className="fixed inset-0 z-[200] overflow-y-auto bg-gray-50">
          <ClientProfileView
            client={viewingClientProfile}
            onBack={() => setViewingClientProfile(null)}
            currentUserId={auth?.sailorId}
            currentUserType={auth?.sailorId ? 'sailor' : undefined}
          />
        </div>
      )}
    </div>
  );
}
