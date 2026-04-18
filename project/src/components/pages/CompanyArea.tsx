// src/components/pages/CompanyArea.tsx
// Mobile-first: bottom tab bar no mobile, sidebar no desktop.
import { useState, useEffect, useRef } from 'react';
import {
  CalendarDays, Star, Ship, ClipboardList, Users,
  DollarSign, Headphones, LogOut, Building2,
  MapPin, Phone, Mail, Globe, Bell,
  ChevronRight, XCircle,
  CheckCircle2, MessageSquare, Waves, Send,
  Plus, ChevronDown, ChevronUp, Search, X, Check, UserPlus,
  Inbox, BookOpen, AlertCircle, Camera, Image, Trash2, Briefcase, Store,
  Lock,
} from 'lucide-react';
import { getCompanies, updateCompany, refreshAll, getSailors, getClients, type Company } from '../../lib/localStore';
import { uploadDoc } from '../../lib/storage';
import { getMessages, markMessageRead, markAllMessagesRead, getAllBoats, type Message } from '../../lib/localStore';
import { getEventBookings, getEventBookingsByCompany, type EventBooking } from '../../lib/localStore';
import type { AuthState } from '../../hooks/useAuth';
import { BoatRegistrationModal } from '../modals/BoatRegistrationModal';
import { EventosEmpresaTab } from '../company/EventosEmpresaTab';
import { RHTab }             from '../company/RHTab';
import { DestaquesTab }      from '../company/DestaquesTab';
import { FrotaTab }          from '../company/FrotaTab';
import { ReservasTab }       from '../company/ReservasTab';
import { MensagensTab }      from '../company/MensagensTab';
import { FinanceiroTab }     from '../company/FinanceiroTab';
import { SuporteTab }        from '../company/SuporteTab';
import { CompanySearchCard } from '../shared/CompanySearchCard';
import { CompanyProfileView } from './CompanyProfileView';
import { SailorProfileView }  from './SailorProfileView';
import { MarketplaceTab }     from '../shared/MarketplaceTab';
import { ProfileSearch }      from '../admin/ProfileSearch';
import type { Sailor, Client } from '../../lib/localStore';

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' });
}
function currency(n: number) {
  return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(n);
}

// ── Toast simples ───────────────────────────────────────────────────────────────

function Toast({ msg, onClose }: { msg: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-[200] animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-blue-900 text-white px-6 py-3.5 rounded-[20px] shadow-2xl flex items-center gap-3 min-w-[240px] max-w-[90vw]">
        <div className="w-7 h-7 bg-green-400 rounded-full flex items-center justify-center flex-shrink-0">
          <Check className="w-4 h-4 text-white" />
        </div>
        <p className="font-black text-sm">{msg}</p>
        <button onClick={onClose} className="ml-auto text-white/60 hover:text-white transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ── Tab config ─────────────────────────────────────────────────────────────────

type TabKey = 'eventos' | 'destaques' | 'frota' | 'reservas' | 'funcionarios' | 'mensagens' | 'financeiro' | 'suporte' | 'marketplace';

const TABS: { key: TabKey; icon: React.ElementType; label: string; short: string }[] = [
  { key: 'destaques',    icon: Star,         label: 'Perfil Público',      short: 'Perfil'     },
  { key: 'eventos',      icon: CalendarDays, label: 'Mural',               short: 'Mural'      },
  { key: 'reservas',     icon: ClipboardList,label: 'Reservas',            short: 'Reservas'   },
  { key: 'frota',        icon: Ship,         label: 'Frota',               short: 'Frota'      },
  { key: 'funcionarios', icon: Briefcase,    label: 'RH',                  short: 'RH'         },
  { key: 'mensagens',    icon: MessageSquare,label: 'Mensagens',           short: 'Mensagens'  },
  { key: 'financeiro',   icon: DollarSign,   label: 'Financeiro',          short: 'Finanças'   },
  { key: 'suporte',      icon: Headphones,   label: 'Suporte',             short: 'Suporte'    },
  { key: 'marketplace',  icon: Store,        label: 'Marketplace',         short: 'Market'     },
];

// ══ COMPONENTE PRINCIPAL ═══════════════════════════════════════════════════════

export function CompanyArea({ auth, onLogout }: { auth: AuthState; onLogout: () => void }) {
  const [tab, setTab]           = useState<TabKey>('eventos');
  const [toast, setToast]       = useState<string | null>(null);
  const [company, setCompany]   = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [viewingCompany, setViewingCompany] = useState<Company | null>(null);
  const [viewingSailor,  setViewingSailor]  = useState<Sailor | null>(null);

  useEffect(() => {
    refreshAll().then(() => {
      setCompany(getCompanies().find(c => c.id === auth.companyId) ?? null);
      setIsLoading(false);
    });
  }, [auth.companyId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a1628]">
        <div className="flex flex-col items-center gap-6">
          <div className="relative flex items-center justify-center">
            <div className="absolute w-28 h-28 rounded-full border border-[#c9a96e]/20 animate-ping" />
            <div className="absolute w-24 h-24 rounded-full border-2 border-transparent border-t-[#c9a96e]/60 border-r-[#c9a96e]/30 animate-spin" />
            <div className="w-20 h-20 bg-[#1a2b4a] border border-[#c9a96e]/20 flex items-center justify-center shadow-2xl">
              <Waves className="w-9 h-9 text-[#c9a96e]/60 animate-pulse" />
            </div>
          </div>
          <div className="text-center space-y-1">
            <p className="font-['Playfair_Display'] font-bold italic text-white text-xl animate-pulse">NorthWindy</p>
            <p className="text-[#c9a96e]/50 text-xs font-medium uppercase tracking-widest">A carregar perfil…</p>
          </div>
          {/* Barra de progresso */}
          <div className="w-40 h-1 bg-blue-800 rounded-full overflow-hidden">
            <div className="h-full bg-blue-300 rounded-full animate-[loading_1.5s_ease-in-out_infinite]"
              style={{ animation: 'loading 1.5s ease-in-out infinite' }} />
          </div>
        </div>
        <style>{`
          @keyframes loading {
            0%   { width: 0%;   margin-left: 0%; }
            50%  { width: 70%;  margin-left: 15%; }
            100% { width: 0%;   margin-left: 100%; }
          }
        `}</style>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <Building2 className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <p className="font-black text-gray-400 uppercase italic">Empresa não encontrada.</p>
          <button onClick={onLogout} className="mt-4 text-blue-600 font-black text-sm underline">Sair</button>
        </div>
      </div>
    );
  }

  // Contador real de mensagens não lidas (sininho)
  const unread = getMessages(company.id).filter(m => !m.read).length;

  // Primeiras 5 tabs ficam na bottom bar, o resto vai num "Mais"
  const BOTTOM_TABS = TABS.slice(0, 5);
  const MORE_TABS   = TABS.slice(5);

  function handleTabChange(key: TabKey) {
    setTab(key);
    setMobileMenuOpen(false);
  }

  if (viewingSailor) {
    return (
      <SailorProfileView
        sailor={viewingSailor}
        onBack={() => setViewingSailor(null)}
        onOpenSailor={s => setViewingSailor(s)}
        onOpenClient={() => {}}
        onOpenCompany={c => setViewingCompany(c)}
      />
    );
  }

  // Se o utilizador clicou numa empresa nos resultados de busca, mostra o perfil dessa empresa
  if (viewingCompany) {
    return (
      <CompanyProfileView
        company={viewingCompany}
        onBack={() => setViewingCompany(null)}
        onOpenSailor={s => setViewingSailor(s)}
        onOpenClient={() => {}}
        onOpenCompany={c => setViewingCompany(c)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}

      {/* ── NAVBAR ── */}
      <nav className="bg-[#0a1628] text-white px-4 py-3 sticky top-0 z-40 shadow-xl border-b border-[#c9a96e]/10">
        <div className="flex items-center gap-3 max-w-6xl mx-auto">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Waves className="w-5 h-5 text-[#c9a96e]/60" />
            <span className="font-['Playfair_Display'] font-bold italic text-base hidden sm:inline">NorthWindy</span>
            <span className="bg-[#c9a96e]/15 text-[#c9a96e] text-[9px] font-semibold uppercase px-2 py-0.5 tracking-wider">Empresa</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-['Playfair_Display'] font-bold text-white text-sm truncate">{company.nome_fantasia}</p>
            <p className="text-white/40 text-[10px] font-medium truncate hidden sm:block">
              {company.profile_number} · {company.setor.split(',')[0]}
            </p>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <ProfileSearch
              onOpenSailor={s => setViewingSailor(s)}
              onOpenClient={() => {}}
              onOpenCompany={c => setViewingCompany(c)}
            />
            <button className="relative bg-white/5 hover:bg-white/10 p-2 transition-all" onClick={() => handleTabChange('mensagens')}>
              <Bell className="w-4 h-4 text-white" />
              {unread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#c9a96e] text-[#0a1628] text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                  {unread}
                </span>
              )}
            </button>
            <button onClick={onLogout}
              className="bg-white/5 hover:bg-red-600/80 px-3 py-2 text-xs font-medium uppercase flex items-center gap-1 transition-all">
              <LogOut className="w-3 h-3" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </nav>

      {/* ── CONTENT AREA ── */}
      <div className="flex flex-1 max-w-6xl mx-auto w-full">

        {/* ── SIDEBAR (desktop ≥ md) ── */}
        <aside className="hidden md:flex flex-col gap-1 w-52 flex-shrink-0 py-6 pl-4 pr-2">
          <div className="bg-white border border-gray-100 p-4 mb-3" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
            <div className="w-12 h-12 bg-[#0a1628] flex items-center justify-center mx-auto mb-3">
              <Building2 className="w-5 h-5 text-[#c9a96e]" />
            </div>
            <p className="font-['Playfair_Display'] font-bold text-[#1a2b4a] text-xs text-center leading-tight">{company.nome_fantasia}</p>
            <p className="text-[10px] font-medium text-gray-400 text-center mt-0.5">{company.profile_number}</p>
            <div className="mt-3 pt-2 border-t border-gray-50 flex items-center justify-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
              <p className="text-[9px] font-semibold text-green-600 uppercase tracking-wider">Activa</p>
            </div>
          </div>
          {TABS.map(t => {
            const Icon   = t.icon;
            const active = tab === t.key;
            return (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex items-center gap-2.5 px-4 py-3 text-xs font-semibold uppercase tracking-wide transition-all ${
                  active
                    ? 'bg-[#0a1628] text-white border-l-2 border-[#c9a96e]'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-[#1a2b4a] border-l-2 border-transparent'
                }`}>
                <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${active ? 'text-[#c9a96e]' : ''}`} />
                {t.label}
                {active && <ChevronRight className="w-3 h-3 ml-auto text-[#c9a96e]" />}
              </button>
            );
          })}
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main className="flex-1 min-w-0 px-4 py-4 pb-24 md:pb-6 md:pr-4 md:py-6 overflow-hidden">
          {tab === 'eventos'      && <EventosEmpresaTab company={company} />}
          {tab === 'destaques'    && <DestaquesTab    company={company} onViewCompany={setViewingCompany} />}
          {tab === 'frota'        && <FrotaTab        companyId={company.id} onToast={setToast} />}
          {tab === 'reservas'     && <ReservasTab companyId={company.id} />}
          {tab === 'funcionarios' && (
            <div className="relative">
              {/* Conteúdo do RH por baixo (desfocado) */}
              <div className="pointer-events-none select-none blur-sm opacity-40">
                <RHTab companyId={company.id} onToast={setToast} />
              </div>
              {/* Overlay de bloqueio */}
              <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-6">
                <div className="bg-[#0a1628] border border-[#c9a96e]/30 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
                  <div className="w-16 h-16 bg-[#c9a96e]/10 border border-[#c9a96e]/30 rounded-full flex items-center justify-center mx-auto mb-5">
                    <Lock className="w-7 h-7 text-[#c9a96e]" />
                  </div>
                  <h2 className="font-['Playfair_Display'] font-bold italic text-white text-xl mb-2">
                    Módulo RH
                  </h2>
                  <p className="text-[#c9a96e] text-xs font-semibold uppercase tracking-widest mb-4">
                    Em breve
                  </p>
                  <p className="text-white/50 text-sm leading-relaxed mb-6">
                    A gestão de recursos humanos estará disponível numa futura actualização da plataforma.
                  </p>
                  <div className="border-t border-[#c9a96e]/15 pt-5">
                    <p className="text-white/30 text-xs leading-relaxed">
                      Interesse em acesso antecipado?<br />
                      Contacte-nos através do <span className="text-[#c9a96e]/70 font-medium">Suporte</span>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          {tab === 'mensagens'    && <MensagensTab    companyId={company.id} />}
          {tab === 'financeiro'   && <FinanceiroTab companyId={company.id} />}
          {tab === 'suporte'      && <SuporteTab      company={company} />}
          {tab === 'marketplace'  && <MarketplaceTab role="company" company={company} />}
        </main>
      </div>

      {/* ── BOTTOM TAB BAR (mobile) ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-gray-100 shadow-2xl">
        {mobileMenuOpen && (
          <div className="absolute bottom-full left-0 right-0 bg-white border-t-2 border-gray-100 shadow-2xl rounded-t-[24px] p-4">
            <div className="grid grid-cols-2 gap-2">
              {MORE_TABS.map(t => {
                const Icon   = t.icon;
                const active = tab === t.key;
                return (
                  <button key={t.key} onClick={() => handleTabChange(t.key)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-[14px] font-black text-sm uppercase transition-all ${
                      active ? 'bg-[#0a1628] text-white border-l-2 border-[#c9a96e]' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                    }`}>
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {t.label}
                  </button>
                );
              })}
            </div>
            <button onClick={() => setMobileMenuOpen(false)}
              className="w-full mt-3 py-2.5 text-xs font-black text-gray-400 uppercase tracking-wider border-2 border-gray-100 rounded-[12px]">
              Fechar
            </button>
          </div>
        )}
        <div className="flex items-stretch h-16">
          {BOTTOM_TABS.map(t => {
            const Icon   = t.icon;
            const active = tab === t.key && !mobileMenuOpen;
            return (
              <button key={t.key} onClick={() => handleTabChange(t.key)}
                className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-all ${
                  active ? 'text-blue-900' : 'text-gray-400'
                }`}>
                <Icon className={`w-5 h-5 transition-all ${active ? 'scale-110' : ''}`} />
                <span className="text-[9px] font-black uppercase tracking-wide">{t.short}</span>
                {active && <div className="absolute bottom-0 h-0.5 w-8 bg-blue-900 rounded-full" />}
              </button>
            );
          })}
          <button
            onClick={() => setMobileMenuOpen(v => !v)}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-all ${
              mobileMenuOpen || MORE_TABS.some(t => t.key === tab) ? 'text-blue-900' : 'text-gray-400'
            }`}>
            {mobileMenuOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
            <span className="text-[9px] font-black uppercase tracking-wide">Mais</span>
          </button>
        </div>
      </div>
    </div>
  );
}