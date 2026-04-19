// src/App.tsx
import { lazy, Suspense, useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';

// Hooks
import { useAuth }        from './hooks/useAuth';
import { useTrips }       from './hooks/useTrips';
import { useBooking }     from './hooks/useBooking';
import { usePendingBoat } from './hooks/usePendingBoat';
import { useModals }      from './hooks/useModals';

// Componentes carregados imediatamente (acima da dobra / críticos)
import { Hero }            from './components/pages/Hero';
import { FeaturedCarousels } from './components/pages/FeaturedCarousels';
import { AgendaSemanalMarketplace } from './components/pages/AgendaSemanalMarketplace';
import { SiteFooter }      from './components/pages/SiteFooter';

// Áreas autenticadas — carregadas sob demanda
const AdminDashboard          = lazy(() => import('./components/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const ClientArea              = lazy(() => import('./components/pages/ClientArea').then(m => ({ default: m.ClientArea })));
const CompanyArea             = lazy(() => import('./components/pages/CompanyArea').then(m => ({ default: m.CompanyArea })));

// Páginas de rota — carregadas sob demanda
const AboutPage               = lazy(() => import('./components/pages/AboutPage').then(m => ({ default: m.AboutPage })));
const AllTripsPage            = lazy(() => import('./components/pages/AllTripsPage').then(m => ({ default: m.AllTripsPage })));
const ParceirosPage           = lazy(() => import('./components/pages/ParceirosPage').then(m => ({ default: m.ParceirosPage })));
const ComunidadePage          = lazy(() => import('./components/pages/ComunidadePage').then(m => ({ default: m.ComunidadePage })));
const TermosPage              = lazy(() => import('./components/pages/TermosPage').then(m => ({ default: m.TermosPage })));
const FAQPage                 = lazy(() => import('./components/pages/FAQPage').then(m => ({ default: m.FAQPage })));
const OfertasTrabalhoPage     = lazy(() => import('./components/pages/OfertasTrabalhoPage').then(m => ({ default: m.OfertasTrabalhoPage })));
const NegocieEmbarcacoesPage  = lazy(() => import('./components/pages/NegocieEmbarcacoesPage').then(m => ({ default: m.NegocieEmbarcacoesPage })));
const MarketplacePage         = lazy(() => import('./components/pages/MarketplacePage').then(m => ({ default: m.MarketplacePage })));

// Modais — carregados sob demanda
const BookingModal            = lazy(() => import('./components/modals/BookingModal').then(m => ({ default: m.BookingModal })));
const ClientRegistrationModal = lazy(() => import('./components/modals/ClientRegistrationModal').then(m => ({ default: m.ClientRegistrationModal })));
const SailorRegistration      = lazy(() => import('./components/sailor/SailorRegistration').then(m => ({ default: m.SailorRegistration })));
const SailorLoginModal        = lazy(() => import('./components/modals/SailorLoginModal').then(m => ({ default: m.SailorLoginModal })));
const ClientLoginModal        = lazy(() => import('./components/modals/ClientLoginModal').then(m => ({ default: m.ClientLoginModal })));
const CompanyLoginModal       = lazy(() => import('./components/modals/CompanyLoginModal').then(m => ({ default: m.CompanyLoginModal })));
const AdminPortalModal        = lazy(() => import('./components/modals/AdminPortalModal').then(m => ({ default: m.AdminPortalModal })));
const AccessGateModal         = lazy(() => import('./components/modals/AccessGateModal').then(m => ({ default: m.AccessGateModal })));
const AdminLoginModal         = lazy(() => import('./components/modals/AdminLoginModal').then(m => ({ default: m.AdminLoginModal })));
const ClientSuccessModal      = lazy(() => import('./components/modals/ClientSuccessModal').then(m => ({ default: m.ClientSuccessModal })));
const CompanyRegistrationModal = lazy(() => import('./components/modals/CompanyRegistrationModal').then(m => ({ default: m.CompanyRegistrationModal })));

import type { CatalogBoat } from './hooks/useTrips';
import { refreshAll } from './lib/localStore';

function App() {
  const navigate = useNavigate();
  const { auth, loginAsAdmin, loginAsSailor, loginAsClient, loginAsCompany, logout } = useAuth();
  const { catalogBoats, loadFromCache, loadPublicTrips }             = useTrips();
  const { selectedBoat, preDate, preSlot, selectBoat, clearBoat, confirmPublicBooking } = useBooking();
  const { pendingBoat, holdForLogin, flushToSession, clear: clearPending } = usePendingBoat();
  const { modals, open, close, switchTo } = useModals();

  const [clientSuccess,  setClientSuccess]  = useState<{ name: string; profile_number?: string } | null>(null);
  const [adminLoginOpen, setAdminLoginOpen] = useState(false);

  useEffect(() => {
    refreshAll()
      .then(() => loadFromCache())
      .catch((err) => {
        console.error('[NorthWindy] Supabase refreshAll falhou:', err);
        loadPublicTrips(); // fallback: busca direto se o cache falhou
      });
  }, []); // eslint-disable-line

  // ── preload de chunks autenticados ──────────────────────────────────────────
  const preloadAdmin   = () => import('./components/admin/AdminDashboard');
  const preloadClient  = () => import('./components/pages/ClientArea');
  const preloadCompany = () => import('./components/pages/CompanyArea');

  // ── handlers ────────────────────────────────────────────────────────────────
  function handleLoginAsSailor(name: string, id: string) {
    preloadAdmin();
    loginAsSailor(name, id);
    close('sailorLogin');
    close('adminPortal');
  }

  function handleLoginAsClient(name: string, id: string) {
    preloadClient();
    flushToSession();
    loginAsClient(name, id);
    close('clientLogin');
    close('adminPortal');
  }

  function handleLoginAsCompany(name: string, id: string) {
    preloadCompany();
    loginAsCompany(name, id);
    close('companyLogin');
    close('adminPortal');
  }

  function handleSelectBoat(boat: CatalogBoat, date?: string, slot?: string) {
    if (auth.isAuthenticated && auth.role === 'client') {
      selectBoat(boat, date, slot);
    } else {
      holdForLogin(boat);
      open('accessGate');
    }
  }

  const handleExplore = () => navigate('/passeios');

  // ── rotas autenticadas ───────────────────────────────────────────────────────
  const areaFallback = (
    <div className="min-h-screen flex items-center justify-center bg-[#0a1628]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-white/60 text-sm tracking-wide">Carregando…</span>
      </div>
    </div>
  );

  if (auth.isAuthenticated && auth.role === 'client')
    return <Suspense fallback={areaFallback}><ClientArea auth={auth} onLogout={() => { logout(); loadPublicTrips(); }} onSelectBoat={handleSelectBoat} /></Suspense>;
  if (auth.isAuthenticated && auth.role === 'company')
    return <Suspense fallback={areaFallback}><CompanyArea auth={auth} onLogout={() => { logout(); loadPublicTrips(); }} /></Suspense>;
  if (auth.isAuthenticated && (auth.role === 'admin' || auth.role === 'sailor'))
    return <Suspense fallback={areaFallback}><AdminDashboard auth={auth} onLogout={() => { logout(); loadPublicTrips(); }} /></Suspense>;

  // ── site público ─────────────────────────────────────────────────────────────
  return (
    <Suspense fallback={null}>
    <Routes>
      <Route path="/quem-somos" element={<AboutPage onBack={() => navigate('/')} />} />
      <Route path="/passeios" element={
        <AllTripsPage
          boats={catalogBoats}
          onBack={() => navigate('/')}
          onSelectBoat={(boat, date, slot) => {
            navigate('/');
            setTimeout(() => handleSelectBoat(boat, date, slot), 100);
          }}
        />
      } />
      <Route path="/parceiros"  element={<ParceirosPage  onBack={() => navigate('/')} onOpenAccess={() => { navigate('/'); setTimeout(() => open('companyLogin'), 100); }} onCompanyReg={() => { navigate('/'); setTimeout(() => open('companyReg'), 100); }} />} />
      <Route path="/comunidade" element={
        <ComunidadePage
          onBack={() => navigate('/')}
          onSailorLogin={() => { navigate('/'); setTimeout(() => open('sailorLogin'), 100); }}
          onCompanyLogin={() => { navigate('/'); setTimeout(() => open('companyLogin'), 100); }}
          onSailorReg={() => { navigate('/'); setTimeout(() => open('sailorReg'), 100); }}
          onCompanyReg={() => { navigate('/'); setTimeout(() => open('companyReg'), 100); }}
          onAdminClick={() => { navigate('/'); setTimeout(() => setAdminLoginOpen(true), 100); }}
        />
      } />
      <Route path="/termos"     element={<TermosPage     onBack={() => navigate('/')} />} />
      <Route path="/faq"        element={<FAQPage        onBack={() => navigate('/')} />} />
      <Route path="/ofertas-de-trabalho"  element={<OfertasTrabalhoPage    onBack={() => navigate('/')} />} />
      <Route path="/negocie-embarcacoes"  element={<NegocieEmbarcacoesPage onBack={() => navigate('/')} />} />
      <Route path="/marketplace"          element={<MarketplacePage         onBack={() => navigate('/')} onSelectBoat={(boat, date, slot) => { navigate('/'); setTimeout(() => handleSelectBoat(boat, date, slot), 100); }} />} />
      <Route path="*" element={
        <div className="min-h-screen bg-white">
          <style>{`
            * { scrollbar-width: none; -ms-overflow-style: none; }
            *::-webkit-scrollbar { display: none; }
          `}</style>

          {modals.sailorReg && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-blue-900/60 backdrop-blur-md p-4">
              <div className="relative w-full max-w-lg">
                <button onClick={() => close('sailorReg')}
                  className="absolute -top-4 -right-4 bg-white text-blue-900 p-3 rounded-full shadow-2xl hover:text-red-600 z-[110] font-black">
                  <X className="w-6 h-6" />
                </button>
                <SailorRegistration onClose={() => close('sailorReg')} />
              </div>
            </div>
          )}

          {modals.sailorLogin && (
            <SailorLoginModal onLogin={handleLoginAsSailor} onClose={() => close('sailorLogin')} />
          )}

          {modals.clientLogin && (
            <ClientLoginModal
              onLogin={handleLoginAsClient}
              onClose={() => close('clientLogin')}
              onRegister={() => switchTo('clientLogin', 'clientReg')}
            />
          )}

          {modals.companyLogin && (
            <CompanyLoginModal
              onLogin={handleLoginAsCompany}
              onClose={() => close('companyLogin')}
              onRegister={() => switchTo('companyLogin', 'companyReg')}
            />
          )}

          {modals.adminPortal && (
            <AdminPortalModal
              onSailorLogin={() => switchTo('adminPortal', 'sailorLogin')}
              onClientLogin={() => switchTo('adminPortal', 'clientLogin')}
              onClientReg={() => switchTo('adminPortal', 'clientReg')}
              onSailorReg={() => { close('adminPortal'); open('sailorReg'); }}
              onCompanyLogin={() => switchTo('adminPortal', 'companyLogin')}
              onCompanyReg={() => { close('adminPortal'); open('companyReg'); }}
              onClose={() => close('adminPortal')}
            />
          )}

          {modals.companyReg && (
            <CompanyRegistrationModal
              onClose={() => close('companyReg')}
            />
          )}

          {modals.clientReg && (
            <ClientRegistrationModal
              onClose={() => close('clientReg')}
              onSuccess={client => {
                close('clientReg');
                setClientSuccess({ name: client.name, profile_number: client.profile_number });
              }}
            />
          )}

          {clientSuccess && (
            <ClientSuccessModal
              name={clientSuccess.name}
              profile_number={clientSuccess.profile_number}
              onClose={() => setClientSuccess(null)}
            />
          )}

          {selectedBoat && (
            <BookingModal
              boat={selectedBoat}
              preselectedDate={preDate}
              preselectedTimeSlot={preSlot}
              onClose={clearBoat}
              onConfirm={confirmPublicBooking}
            />
          )}

          {modals.accessGate && pendingBoat && (
            <AccessGateModal
              boat={pendingBoat}
              onLogin={() => switchTo('accessGate', 'clientLogin')}
              onRegister={() => switchTo('accessGate', 'clientReg')}
              onClose={() => { close('accessGate'); clearPending(); }}
            />
          )}

          {adminLoginOpen && (
            <AdminLoginModal
              onSuccess={() => { preloadAdmin(); setAdminLoginOpen(false); loginAsAdmin(); }}
              onClose={() => setAdminLoginOpen(false)}
            />
          )}

          <Hero
            onExplore={handleExplore}
            onBeSailor={() => open('sailorReg')}
            boats={catalogBoats}
            onSelectBoat={handleSelectBoat}
            onOpenAccess={() => open('adminPortal')}
            onOpenClientReg={() => open('clientReg')}
            onOpenSailorReg={() => open('sailorReg')}
            onScrollToAbout={() => document.getElementById('value-prop')?.scrollIntoView({ behavior: 'smooth' })}
            onOpenAbout={() => navigate('/quem-somos')}
          />

          <AgendaSemanalMarketplace />
          <FeaturedCarousels boats={catalogBoats} onSelectBoat={handleSelectBoat} />
          <SiteFooter onAdminClick={() => setAdminLoginOpen(true)} />
        </div>
      } />
    </Routes>
    </Suspense>
  );
}

export default App;