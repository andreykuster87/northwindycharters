// src/components/admin/AdminDashboard.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Painel Admin / Sailor — orquestra tabs, dados e modais globais.
// Layout (navbar, sidebar, bottom bar) extraído para sub-componentes.
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect, useState } from 'react';
import {
  Users, Ship, Compass, ShieldCheck, XCircle,
  UserCheck, Bell, DollarSign, Building2,
  CalendarDays,
} from 'lucide-react';
import { EmpresaFuncionarioTab } from '../company/EmpresaFuncionarioTab';
import { loadEmpresaUnread } from '../../lib/rh';
import {
  getSailors, getClients, getBoats, getTrips, getBookings,
  getPendingBoats, approveBoat, rejectBoat,
  approveSailor, approveClient, updateSailor, updateClient, updateBookingStatus,
  getMessages, markAllMessagesRead,
  notifyBookingStatusChange, runDocumentExpiryCheck,
  sendWelcomeMessage, getCompanies, refreshAll,
  getSailorApplications,
  type Sailor, type Client, type Boat, type Trip, type Booking, type Message,
} from '../../lib/localStore';

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
import { KpiCard, DevResetBanner, type Auth, type TabKey, type TabDef } from './AdminDashboardShared';

// Modais globais
import { DossierSailor }    from '../shared/DossierSailor';
import { DossierClient }    from '../shared/DossierClient';
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
  const [solInitialSub, setSolInitialSub] = useState<'profissionais'|'usuarios'|'embarcacoes'|'empresas'|'tripulacao'>('profissionais');
  const [trips,         setTrips]         = useState<Trip[]>([]);
  const [bookings,      setBookings]      = useState<Booking[]>([]);
  const [sailorMsgs,    setSailorMsgs]    = useState<Message[]>([]);
  const [sailorPhoto,   setSailorPhoto]   = useState<string>('');

  // Modais de criação
  const [showBoatModal, setShowBoatModal] = useState(false);
  const [showTripModal, setShowTripModal] = useState(false);
  const [tripBoat,      setTripBoat]      = useState<Boat | null>(null);
  const [showSettings,  setShowSettings]  = useState(false);

  // Modais shared
  const [dossierSailor,  setDossierSailor]  = useState<Sailor | null>(null);
  const [dossierClient,  setDossierClient]  = useState<Client | null>(null);
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
  const convertedClientIds    = new Set(getSailorApplications('approved').map(a => a.client_id));
  const isConverted           = (c: { id: string; role?: string }) => (c as any).role === 'converted_to_sailor' || convertedClientIds.has(c.id);
  const pendingClients        = clients.filter(c => c.status === 'pending_verification' && !isConverted(c));
  const activeClients         = clients.filter(c => c.status === 'active' && !isConverted(c));
  const pendingCompaniesCount = getCompanies().filter(c => c.status === 'pending').length;
  const activeCompaniesCount  = getCompanies().filter(c => c.status === 'active').length;
  const unreadMsgs            = isSailor && auth.sailorId ? sailorMsgs.filter(m => !m.read).length : 0;
  const [empresaUnread, setEmpresaUnread] = useState(0);

  useEffect(() => { loadData(); }, [auth]); // eslint-disable-line
  useEffect(() => { setSailorPhoto(sailorData?.profile_photo || ''); }, [sailorData?.profile_photo]); // eslint-disable-line

  async function loadData() {
    await refreshAll();
    await runDocumentExpiryCheck();
    setSailors(getSailors());
    setClients(getClients());
    setBookings(getBookings(isSailor ? auth?.sailorId : undefined));
    if (isSailor && auth?.sailorId) {
      setBoats(getBoats(auth.sailorId));
      setTrips(getTrips(auth.sailorId));
      setSailorMsgs(getMessages(auth.sailorId));
      loadEmpresaUnread(auth.sailorId).then(setEmpresaUnread);
    } else {
      setBoats(getBoats());
      setTrips(getTrips());
    }
    setPendingBoats(getPendingBoats());
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
    setTab('verificados');
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

  function handleSailorPhoto(file: File) {
    if (file.size > 4 * 1024 * 1024) { alert('Máximo 4MB'); return; }
    const reader = new FileReader();
    reader.onload = async ev => {
      const url = ev.target?.result as string;
      setSailorPhoto(url);
      if (auth?.sailorId) {
        await updateSailor(auth.sailorId, { profile_photo: url } as any);
        setSailors(getSailors());
      }
    };
    reader.readAsDataURL(file);
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
    { key: 'reservas',      icon: Users,        label: 'Reservas',      short: 'Reservas' },
    { key: 'sol',           icon: UserCheck,    label: 'Solicitações',  short: 'Solicit.', badge: solBadge > 0 ? solBadge : undefined },
    { key: 'passeios',      icon: Compass,      label: 'Passeios',      short: 'Passeios' },
    { key: 'frota',         icon: Ship,         label: 'Frota',         short: 'Frota' },
    { key: 'clientes',      icon: Users,        label: 'Usuários',      short: 'Usuários' },
    { key: 'verificados',   icon: ShieldCheck,  label: 'Verificados',   short: 'Verif.' },
    { key: 'empresas',      icon: Building2,    label: 'Empresas',      short: 'Empresas' },
    { key: 'eventos',       icon: CalendarDays, label: 'Eventos',       short: 'Eventos' },
    { key: 'financeiro',    icon: DollarSign,   label: 'Financeiro',    short: 'Finanças' },
    { key: 'cancelamentos', icon: XCircle,      label: 'Cancelamentos', short: 'Cancels.' },
    { key: 'mensagens',     icon: Bell,         label: 'Mensagens',     short: 'Msgs' },
  ];

  const SAILOR_TABS: TabDef[] = [
    { key: 'reservas',      icon: Users,        label: 'Reservas',      short: 'Reservas' },
    { key: 'frota',         icon: Ship,         label: 'Minha Frota',   short: 'Frota' },
    { key: 'passeios',      icon: Compass,      label: 'Meus Passeios', short: 'Passeios' },
    { key: 'eventos',       icon: CalendarDays, label: 'Eventos',       short: 'Eventos' },
    { key: 'empresa',       icon: Building2,    label: 'Empresa',       short: 'Empresa', badge: empresaUnread > 0 ? empresaUnread : undefined },
    { key: 'cancelamentos', icon: XCircle,      label: 'Cancelamentos', short: 'Cancels.' },
    { key: 'mensagens',     icon: Bell,         label: 'Mensagens',     short: 'Msgs', badge: unreadMsgs > 0 ? unreadMsgs : undefined },
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
        onLogout={onLogout}
        onSettings={() => setShowSettings(true)}
        onGoToMessages={() => handleTabChange('mensagens')}
        onGoToSol={() => handleTabChange('sol')}
      />

      <div className="flex flex-1 max-w-7xl mx-auto w-full">

        <AdminDashboardSidebar
          isAdmin={isAdmin} isSailor={isSailor}
          sailorData={sailorData} sailorPhoto={sailorPhoto}
          tabs={ALL_TABS} activeTab={tab}
          onTabChange={handleTabChange}
          onPhotoChange={handleSailorPhoto}
        />

        {/* ── MAIN CONTENT ── */}
        <main className="flex-1 min-w-0 px-4 py-4 pb-24 md:pb-6 md:py-6 overflow-hidden">

          {/* KPIs admin */}
          {isAdmin && (
            <div className="mb-6 space-y-4">
              <h1 className="text-2xl font-black text-blue-900 uppercase italic">Controlo NorthWindy</h1>
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
              <DevResetBanner onReset={loadData} />
            </div>
          )}

          {/* Conteúdo das tabs */}
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
          {tab === 'verificados' && isAdmin && (
            <VerificadosTab verified={verified} onOpenDossier={setDossierSailor} />
          )}
          {tab === 'clientes' && isAdmin && (
            <ClientesTab activeClients={activeClients} pendingClients={pendingClients}
              onGoToSolicitacoes={() => setTab('sol')} onOpenDossier={setDossierClient} />
          )}
          {tab === 'empresas' && isAdmin && (
            <EmpresasTab onGoToSolicitacoes={() => { setSolInitialSub('empresas'); setTab('sol'); }} />
          )}
          {tab === 'financeiro' && isAdmin && (
            <FinanceiroTab bookings={bookings} sailors={sailors} trips={trips} boats={boats} role={auth?.role ?? null} />
          )}
          {tab === 'eventos' && (
            <EventosAdminTab role={auth?.role ?? null} />
          )}
          {tab === 'empresa' && isSailor && auth?.sailorId && (
            <EmpresaFuncionarioTab
              sailorId={auth.sailorId}
              sailorName={auth.userName ?? sailorData?.name ?? 'Funcionário'}
              onUnreadChange={setEmpresaUnread}
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
    </div>
  );
}
