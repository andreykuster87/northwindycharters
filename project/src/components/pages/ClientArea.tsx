// src/components/pages/ClientArea.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Área do passageiro — mesmo layout e DNA visual da CompanyArea.
// Sidebar no desktop | Bottom tab bar no mobile | Foto de perfil editável
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Waves, LogOut, Bell, Settings, Camera,
  User, BookOpen, Ship, MessageSquare,
  ChevronRight, ChevronUp, ChevronDown,
  CalendarDays, Users, Search, X,
  CheckCircle2, Clock, XCircle,
  Building2,
} from 'lucide-react';
import { EventosMural } from '../shared/EventosMural';
import { SailorApplicationModal } from '../modals/SailorApplicationModal';
import {
  getClients, getBookings, getTrips, saveBooking,
  notifyBookingStatusChange, refreshAll, updateClient, getCompanies,
  getSailorApplicationsByClient,
} from '../../lib/localStore';
import type { Company } from '../../lib/store/companies';
import { getEventBookingsByClient, type EventBooking } from '../../lib/store/events';
import { BookingModal, type BookingData } from '../modals/BookingModal';
import type { AuthState } from '../../hooks/useAuth';
import { loadTrips, parseLocation, type CatalogBoat } from '../../utils/clientHelpers';
import { MensagensBox }       from '../shared/MensagensBox';
import { CompanyProfileView } from './CompanyProfileView';
import { ComunidadeTab }      from '../client/ComunidadeTab';
import { ConfiguracoesTab }   from '../client/ConfiguracoesTab';
import { PasseiosTab }        from '../client/PasseiosTab';
import { ReservasTab }        from '../client/ReservasTab';
import { PerfilTab }          from '../client/PerfilTab';

// ── Tipos de abas ─────────────────────────────────────────────────────────────

type TabKey = 'perfil' | 'reservas' | 'passeios' | 'eventos' | 'mensagens' | 'configuracoes' | 'comunidade';

const TABS: { key: TabKey; icon: React.ElementType; label: string; short: string }[] = [
  { key: 'perfil',        icon: User,          label: 'Perfil',                      short: 'Perfil'     },
  { key: 'reservas',      icon: BookOpen,      label: 'Reservas',                    short: 'Reservas'   },
  { key: 'passeios',      icon: Ship,          label: 'Passeios',                    short: 'Passeios'   },
  { key: 'eventos',       icon: CalendarDays,  label: 'Eventos',                     short: 'Eventos'    },
  { key: 'mensagens',     icon: MessageSquare, label: 'Mensagens',                   short: 'Mensagens'  },
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

  // ── Busca de empresas (navbar) ─────────────────────────────────────────────
  const [companySearchNome,   setCompanySearchNome]   = useState('');
  const [companySearchPais,   setCompanySearchPais]   = useState('');
  const [companySearchEstado, setCompanySearchEstado] = useState('');
  const [companySearchCidade, setCompanySearchCidade] = useState('');
  const [companySearchPerfil, setCompanySearchPerfil] = useState('');
  const [companySearchEmail,  setCompanySearchEmail]  = useState('');
  const [companySearchSetor,  setCompanySearchSetor]  = useState('');
  const [companyResults,      setCompanyResults]      = useState<Company[] | null>(null);
  const [viewingCompany,      setViewingCompany]      = useState<Company | null>(null);

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

  useEffect(() => {
    refreshAll().then(() => {
      const updated = getClients().find(c => c.id === auth.clientId);
      if (updated) setClientData(updated);
      setAllBoats(loadTrips());
      setMyBookings(getBookings(undefined, auth.clientId));
      if (auth.clientId) setMyEventBookings(getEventBookingsByClient(auth.clientId));
    });
  }, []); // eslint-disable-line

  const client   = clientData;
  const unreadMsgs = 0; // futuro: contar mensagens não lidas

  const BOTTOM_TABS = TABS.slice(0, 4);

  async function refreshBookings() {
    await refreshAll();
    setAllBoats(loadTrips());
    setMyBookings(getBookings(undefined, auth.clientId));
    if (auth.clientId) setMyEventBookings(getEventBookingsByClient(auth.clientId));
    setMsgKey(k => k + 1);
  }

  function handleSelect(boat: CatalogBoat, date?: string, slot?: string) {
    setSelectedBoat(boat); setPreDate(date); setPreSlot(slot);
  }

  function clearBoat() {
    setSelectedBoat(null); setPreDate(undefined); setPreSlot(undefined);
  }

  function handleClientBooking(data: BookingData) {
    const trip = getTrips().find(t => t.id === data.boat.id);
    saveBooking({
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
    refreshBookings();
    clearBoat();
  }

  function handleTabChange(key: TabKey) {
    setTab(key); setMoreOpen(false);
  }

  // Se clicou numa empresa nos resultados, mostra o perfil completo
  if (viewingCompany) {
    return <CompanyProfileView company={viewingCompany} onBack={() => { setViewingCompany(null); setSearchOpen(false); clearCompanySearch(); }} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* ── NAVBAR ── */}
      <nav className="bg-blue-900 text-white px-4 py-3 sticky top-0 z-40 shadow-xl">
        <div className="flex items-center gap-3 max-w-6xl mx-auto">
          {/* Logo */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Waves className="w-5 h-5 text-blue-300" />
            <span className="font-black text-base italic hidden sm:inline">NorthWindy</span>
            <span className="bg-blue-700 text-blue-200 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
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
            <button onClick={() => { setSearchOpen(v => !v); if (searchOpen) clearCompanySearch(); }}
              className={`flex items-center gap-2 px-3 py-2 rounded-[10px] transition-all ${searchOpen ? 'bg-white text-blue-900' : 'bg-blue-800 text-white hover:bg-blue-700'}`}>
              <Search className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs font-bold hidden sm:inline">Buscar perfil</span>
            </button>
            <button onClick={() => handleTabChange('mensagens')} className="relative bg-blue-800 hover:bg-blue-700 p-2 rounded-full transition-all">
              <MessageSquare className="w-4 h-4 text-white" />
            </button>
            <button onClick={() => handleTabChange('configuracoes')} className="bg-blue-800 hover:bg-blue-700 p-2 rounded-full transition-all">
              <Settings className="w-4 h-4 text-white" />
            </button>
            <button onClick={onLogout}
              className="bg-blue-800 hover:bg-red-600 px-3 py-2 rounded-full text-xs font-black uppercase flex items-center gap-1 transition-all">
              <LogOut className="w-3 h-3" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>

        {/* ── PAINEL DE BUSCA DE EMPRESAS ── */}
        {searchOpen && (
          <div className="border-t border-blue-800 bg-blue-950 px-4 py-4">
            <div className="max-w-6xl mx-auto">
              <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest mb-3">Procurar Empresas</p>
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
                    className="bg-blue-900/60 border-2 border-blue-800 rounded-[12px] px-3 py-2 text-xs font-bold text-white placeholder:text-blue-400 focus:border-blue-400 outline-none transition-colors" />
                ))}
              </div>
              <div className="flex gap-2">
                <input value={companySearchSetor} onChange={e => setCompanySearchSetor(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCompanySearch()}
                  placeholder="Setor de negócio"
                  className="flex-1 bg-blue-900/60 border-2 border-blue-800 rounded-[12px] px-3 py-2 text-xs font-bold text-white placeholder:text-blue-400 focus:border-blue-400 outline-none transition-colors" />
                <button onClick={handleCompanySearch}
                  className="bg-white text-blue-900 hover:bg-blue-50 px-5 py-2 rounded-[12px] font-black text-xs uppercase tracking-wide transition-all flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5" /> Pesquisar
                </button>
                {(companyResults !== null || hasCompanyFilters) && (
                  <button onClick={clearCompanySearch}
                    className="px-3 border-2 border-blue-700 text-blue-300 hover:border-red-400 hover:text-red-300 rounded-[12px] font-black text-xs transition-all">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              {companyResults !== null && (
                <div className="mt-3 space-y-1.5 max-h-60 overflow-y-auto">
                  {companyResults.length === 0 ? (
                    <p className="text-center text-xs font-bold text-blue-400 py-4">Nenhuma empresa encontrada</p>
                  ) : (
                    companyResults.map(c => (
                      <button key={c.id} onClick={() => setViewingCompany(c)}
                        className="w-full bg-blue-900/60 hover:bg-blue-800 border-2 border-transparent hover:border-blue-600 rounded-[14px] px-3 py-2.5 flex items-center gap-3 transition-all text-left">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-blue-800 flex items-center justify-center flex-shrink-0">
                          {(c as any).profile_photo
                            ? <img src={(c as any).profile_photo} alt={c.nome_fantasia} className="w-full h-full object-cover" />
                            : <Building2 className="w-4 h-4 text-blue-300" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-white text-xs truncate">{c.nome_fantasia}</p>
                          <p className="text-[10px] font-bold text-blue-300 truncate">{c.cidade} · {c.setor.split(',')[0]}</p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
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
          <div className="bg-white border-2 border-gray-100 rounded-[22px] p-4 mb-3">
            <div
              className="w-14 h-14 rounded-[14px] overflow-hidden border-2 border-gray-100 mx-auto mb-2 cursor-pointer group relative"
              onClick={() => document.getElementById('sidebar-photo-input')?.click()}
            >
              {profilePhoto
                ? <img src={profilePhoto} alt="" className="w-full h-full object-cover" />
                : <div className="w-full h-full bg-blue-900 text-white flex items-center justify-center font-black text-lg">
                    {(auth.userName || 'U').substring(0, 2).toUpperCase()}
                  </div>
              }
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-[12px]">
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
            <p className="font-black text-blue-900 text-xs text-center uppercase italic leading-tight truncate">{client?.name || auth.userName}</p>
            <p className="text-[10px] font-bold text-gray-400 text-center mt-0.5">{client?.profile_number}</p>
            <div className="mt-2 pt-2 border-t border-gray-50 flex items-center justify-center gap-1">
              <CheckCircle2 className="w-2.5 h-2.5 text-green-500" />
              <p className="text-[9px] font-black text-green-600 uppercase">Verificado</p>
            </div>
          </div>

          {TABS.map(t => {
            const Icon   = t.icon;
            const active = tab === t.key;
            return (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-[14px] text-xs font-black uppercase tracking-wide transition-all ${
                  active ? 'bg-blue-900 text-white shadow-lg' : 'text-gray-500 hover:bg-white hover:text-blue-900'
                }`}>
                <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                {t.label}
                {active && <ChevronRight className="w-3 h-3 ml-auto" />}
              </button>
            );
          })}
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main className="flex-1 min-w-0 px-4 py-4 pb-24 md:pb-6 md:py-6 overflow-hidden">
          {tab === 'passeios'      && (
            <PasseiosTab allBoats={allBoats} onSelect={handleSelect} />
          )}
          {tab === 'reservas'      && <ReservasTab bookings={myBookings} eventBookings={myEventBookings} onRefresh={refreshBookings} />}
          {tab === 'mensagens'     && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-black text-blue-900 uppercase italic">Mensagens</h2>
                <p className="text-xs text-gray-400 font-bold mt-0.5">Notificações e comunicações</p>
              </div>
              <MensagensBox key={msgKey} clientId={auth.clientId || ''} />
            </div>
          )}
          {tab === 'eventos' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-black text-blue-900 uppercase italic">Eventos</h2>
                <p className="text-xs text-gray-400 font-bold mt-0.5">Eventos náuticos da comunidade</p>
              </div>
              <EventosMural
                title=""
                subtitle=""
                emptyMessage="Nenhum evento disponível no momento. Fique atento às novidades!"
                clientId={auth.clientId}
                clientName={client?.name || auth.userName}
                clientPhone={client?.phone || ''}
              />
            </div>
          )}
          {tab === 'perfil'        && (
            <PerfilTab client={client} profilePhoto={profilePhoto} onPhotoChange={p => {
              setProfilePhoto(p);
              if (auth.clientId) updateClient(auth.clientId, { profile_photo: p });
            }} onGoToComunidade={() => handleTabChange('comunidade')}
            onOpenApplication={async () => {
              if (!client) {
                await refreshAll();
                const updated = getClients().find(c => c.id === auth.clientId);
                if (updated) setClientData(updated);
              }
              setAppModalOpen(true);
            }} />
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
              onOpenApplication={async () => {
                if (!client) {
                  await refreshAll();
                  const updated = getClients().find(c => c.id === auth.clientId);
                  if (updated) setClientData(updated);
                }
                setAppModalOpen(true);
              }}
              applicationStatus={existingApp?.status}
            />
          )}
        </main>
      </div>

      {/* ── BOTTOM TAB BAR (mobile) ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-gray-100 shadow-2xl">
        {/* Tabs adicionais no overlay (Mensagens, Comunidade) */}
        {moreOpen && (
          <div className="absolute bottom-full left-0 right-0 bg-white border-t-2 border-gray-100 shadow-2xl rounded-t-[24px] p-4">
            <div className="grid grid-cols-1 gap-2">
              {TABS.slice(4).map(t => {
                const Icon   = t.icon;
                const active = tab === t.key;
                return (
                  <button key={t.key} onClick={() => handleTabChange(t.key)}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-[14px] font-black text-sm uppercase transition-all ${
                      active ? 'bg-blue-900 text-white' : 'bg-gray-50 text-gray-500'
                    }`}>
                    <Icon className="w-5 h-5 flex-shrink-0" /> {t.label}
                  </button>
                );
              })}
            </div>
            <button onClick={() => setMoreOpen(false)}
              className="w-full mt-3 py-2.5 text-xs font-black text-gray-400 uppercase tracking-wider border-2 border-gray-100 rounded-[12px]">
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
                  active ? 'text-blue-900' : 'text-gray-400'
                }`}>
                <Icon className={`w-5 h-5 transition-all ${active ? 'scale-110' : ''}`} />
                <span className="text-[9px] font-black uppercase tracking-wide">{t.short}</span>
                {active && <div className="absolute bottom-0 h-0.5 w-8 bg-blue-900 rounded-full" />}
              </button>
            );
          })}
          {/* Botão "Mais" */}
          <button onClick={() => setMoreOpen(v => !v)}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-all ${
              moreOpen || tab === 'mensagens' || tab === 'comunidade' ? 'text-blue-900' : 'text-gray-400'
            }`}>
            {moreOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
            <span className="text-[9px] font-black uppercase tracking-wide">Mais</span>
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
            refreshAll().then(() => {});
          }}
        />
      )}
    </div>
  );
}