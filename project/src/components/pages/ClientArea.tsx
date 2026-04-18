// src/components/pages/ClientArea.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Área do passageiro — mesmo layout e DNA visual da CompanyArea.
// Sidebar no desktop | Bottom tab bar no mobile | Foto de perfil editável
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect, useRef } from 'react';
import {
  Waves, LogOut, Settings, Camera,
  User, BookOpen, MessageSquare,
  ChevronRight,
  Users,
  CheckCircle2, Clock, XCircle,
  Store,
} from 'lucide-react';
import { SailorApplicationModal } from '../modals/SailorApplicationModal';
import { useFriendships } from '../shared/FriendComponents';
import {
  getClients, getBookings, getTrips, saveBooking,
  notifyBookingStatusChange, refreshAll, updateClient, getCompanies,
  getSailors, getSailorApplicationsByClient,
} from '../../lib/localStore';
import type { Company } from '../../lib/store/companies';
import type { Sailor, Client }  from '../../lib/store/core';
import { getEventBookingsByClient, type EventBooking } from '../../lib/store/events';
import { BookingModal, type BookingData } from '../modals/BookingModal';
import type { AuthState } from '../../hooks/useAuth';
import { loadTrips, parseLocation, type CatalogBoat } from '../../utils/clientHelpers';
import { MensagensBox }       from '../shared/MensagensBox';
import { CompanyProfileView } from './CompanyProfileView';
import { SailorProfileView }  from './SailorProfileView';
import { ClientProfileView }  from './ClientProfileView';
import { ComunidadeTab }      from '../client/ComunidadeTab';
import { ConfiguracoesTab }   from '../client/ConfiguracoesTab';
import { ReservasTab }        from '../client/ReservasTab';
import { PerfilTab }          from '../client/PerfilTab';
import { MarketplaceTab }     from '../shared/MarketplaceTab';
import { ProfileSearch }      from '../admin/ProfileSearch';
import { useAdvancedSearch }  from '../shared/AdvancedSearchPanel';

// ── Tipos de abas ─────────────────────────────────────────────────────────────

type TabKey = 'perfil' | 'reservas' | 'marketplace' | 'mensagens' | 'configuracoes' | 'comunidade';

const TABS: { key: TabKey; icon: React.ElementType; label: string; short: string }[] = [
  { key: 'perfil',        icon: User,          label: 'Perfil',                      short: 'Perfil'     },
  { key: 'marketplace',   icon: Store,         label: 'Marketplace',                 short: 'Market'     },
  { key: 'reservas',      icon: BookOpen,      label: 'Reservas e Cancelamentos',    short: 'Reservas'   },
  { key: 'comunidade',    icon: Users,         label: 'Faça parte da comunidade',    short: 'Comunidade' },
];

// ══ COMPONENTE PRINCIPAL ═══════════════════════════════════════════════════════

export function ClientArea({ auth, onLogout }: { auth: AuthState; onLogout: () => void }) {
  const [tab,          setTab]          = useState<TabKey>('perfil');
  const { friendships, loadFriendships, pendingCount: friendPendingCount } = useFriendships(auth.clientId);
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
  const [appModalOpen, setAppModalOpen] = useState(false);

  // Candidatura existente deste client
  const existingApp = auth.clientId
    ? getSailorApplicationsByClient(auth.clientId).sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0]
    : null;

  // ── Busca (navbar) — profile views abertos a partir dos resultados ──
  const [viewingSailor,  setViewingSailor]  = useState<Sailor | null>(null);
  const [viewingClient,  setViewingClient]  = useState<Client | null>(null);
  const [viewingCompany, setViewingCompany] = useState<Company | null>(null);

  const { toggleButton: searchToggleButton, panel: searchPanel, closePanelAndClear } = useAdvancedSearch({
    onOpenSailor:  s => setViewingSailor(s),
    onOpenClient:  c => setViewingClient(c),
    onOpenCompany: c => setViewingCompany(c),
    maxWidthClass: 'max-w-6xl',
  });

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

  const BOTTOM_TABS = TABS;

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
    setTab(key);
  }

  // Se clicou numa empresa nos resultados, mostra o perfil completo
  if (viewingCompany) {
    return <CompanyProfileView company={viewingCompany} onBack={() => { setViewingCompany(null); closePanelAndClear(); }} currentUserId={auth.clientId} currentUserType="client" />;
  }

  // Se clicou num tripulante nos resultados, mostra o perfil completo
  if (viewingSailor) {
    return <SailorProfileView sailor={viewingSailor} onBack={() => { setViewingSailor(null); closePanelAndClear(); }} currentUserId={auth.clientId} currentUserType="client" />;
  }

  // Se clicou num amigo-passageiro, mostra o perfil público
  if (viewingClient) {
    return <ClientProfileView client={viewingClient} onBack={() => setViewingClient(null)} currentUserId={auth.clientId ?? undefined} currentUserType="client" />;
  }

  function handleOpenFriendProfile(otherId: string, otherType: 'sailor' | 'client' | 'company') {
    if (otherType === 'sailor') {
      const s = getSailors().find(x => x.id === otherId);
      if (s) setViewingSailor(s);
    } else if (otherType === 'client') {
      const c = getClients().find(x => x.id === otherId);
      if (c) setViewingClient(c);
    } else if (otherType === 'company') {
      const c = getCompanies().find(x => x.id === otherId);
      if (c) setViewingCompany(c);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* ── NAVBAR ── */}
      <nav className="bg-[#0a1628] text-white px-4 py-3 sticky top-0 z-40 shadow-xl border-b border-[#c9a96e]/10">
        <div className="flex items-center gap-3 max-w-6xl mx-auto">
          {/* Logo + role + avatar */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Waves className="w-5 h-5 text-[#c9a96e]/60 flex-shrink-0" />
            <span className="font-['Playfair_Display'] font-bold italic text-base hidden sm:inline flex-shrink-0">NorthWindy</span>
            <span className="bg-[#c9a96e]/15 text-[#c9a96e] text-[9px] font-semibold uppercase px-2 py-0.5 tracking-wider flex-shrink-0">
              Passageiro
            </span>
            <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 border-2 border-white/20">
              {profilePhoto
                ? <img src={profilePhoto} alt="" className="w-full h-full object-cover" />
                : <div className="w-full h-full bg-white/20 flex items-center justify-center font-black text-[10px]">
                    {(auth.userName || 'U').substring(0, 2).toUpperCase()}
                  </div>
              }
            </div>
          </div>

          {/* Busca global de perfis — centralizada + botão filtros avançados */}
          <div className="flex-1 flex justify-center min-w-0">
            <div className="flex items-center gap-1.5 w-full max-w-xs">
              <ProfileSearch
                onOpenSailor={s => setViewingSailor(s)}
                onOpenClient={c => setViewingClient(c)}
                onOpenCompany={c => setViewingCompany(c)}
              />
              {searchToggleButton}
            </div>
          </div>

          {/* Ações */}
          <div className="flex items-center gap-1.5 flex-shrink-0 flex-1 justify-end">
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
        {searchPanel}
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
            const badge  = t.key === 'perfil' && friendPendingCount > 0 ? friendPendingCount : 0;
            return (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex items-center gap-2.5 px-4 py-3 text-xs font-semibold uppercase tracking-wide transition-all border-l-2 ${
                  active
                    ? 'bg-[#0a1628] text-white border-[#c9a96e]'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-[#1a2b4a] border-transparent'
                }`}>
                <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${active ? 'text-[#c9a96e]' : ''}`} />
                {t.label}
                {badge > 0 && (
                  <span className="ml-auto w-4 h-4 bg-red-500 text-white text-[8px] font-bold flex items-center justify-center flex-shrink-0">
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
                {active && !badge && <ChevronRight className="w-3 h-3 ml-auto text-[#c9a96e]" />}
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
            <PerfilTab
              client={client}
              profilePhoto={profilePhoto}
              onPhotoChange={p => {
                setProfilePhoto(p);
                if (auth.clientId) updateClient(auth.clientId, { profile_photo: p });
              }}
              onGoToComunidade={() => handleTabChange('comunidade')}
              onOpenApplication={() => setAppModalOpen(true)}
              clientId={auth.clientId}
              friendships={friendships}
              onRefreshFriends={loadFriendships}
              album={client?.album || []}
              onAlbumChange={next => {
                setClientData((p: any) => ({ ...p, album: next }));
                if (auth.clientId) updateClient(auth.clientId, { album: next });
              }}
              onOpenFriendProfile={handleOpenFriendProfile}
            />
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
        <div className="flex items-stretch h-16">
          {BOTTOM_TABS.map(t => {
            const Icon   = t.icon;
            const active = tab === t.key;
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