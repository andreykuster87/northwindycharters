// src/components/pages/CompanyArea.tsx
// Mobile-first: bottom tab bar no mobile, sidebar no desktop.
import { useState, useEffect, useRef } from 'react';
import {
  CalendarDays, Star, Ship, ClipboardList, Users,
  DollarSign, Headphones, LogOut, Building2,
  MapPin, Phone, Mail, Globe, Bell,
  ChevronRight, XCircle,
  CheckCircle2, MessageSquare, Anchor, Waves, LifeBuoy, Send,
  Plus, ChevronDown, ChevronUp, Search, X, Check, UserPlus,
  Inbox, BookOpen, AlertCircle, Camera, Image, Trash2, Briefcase,
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

type TabKey = 'eventos' | 'destaques' | 'frota' | 'reservas' | 'funcionarios' | 'mensagens' | 'financeiro' | 'suporte';

const TABS: { key: TabKey; icon: React.ElementType; label: string; short: string }[] = [
  { key: 'destaques',    icon: Star,         label: 'Perfil Público', short: 'Perfil'     },
  { key: 'eventos',      icon: CalendarDays, label: 'Mural',          short: 'Mural'      },
  { key: 'reservas',     icon: ClipboardList,label: 'Reservas',       short: 'Reservas'   },
  { key: 'frota',        icon: Ship,         label: 'Frota',          short: 'Frota'      },
  { key: 'funcionarios', icon: Briefcase,    label: 'RH',             short: 'RH'         },
  { key: 'mensagens',    icon: MessageSquare,label: 'Mensagens',      short: 'Mensagens'  },
  { key: 'financeiro',   icon: DollarSign,   label: 'Financeiro',     short: 'Finanças'   },
  { key: 'suporte',      icon: Headphones,   label: 'Suporte',        short: 'Suporte'    },
];

// ══ COMPONENTE PRINCIPAL ═══════════════════════════════════════════════════════

export function CompanyArea({ auth, onLogout }: { auth: AuthState; onLogout: () => void }) {
  const [tab, setTab]           = useState<TabKey>('eventos');
  const [toast, setToast]       = useState<string | null>(null);
  const [company, setCompany]   = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [viewingCompany, setViewingCompany] = useState<Company | null>(null);

  useEffect(() => {
    refreshAll().then(() => {
      setCompany(getCompanies().find(c => c.id === auth.companyId) ?? null);
      setIsLoading(false);
    });
  }, [auth.companyId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-900">
        <div className="flex flex-col items-center gap-6">
          {/* Logo animada */}
          <div className="relative flex items-center justify-center">
            {/* Anel pulsante externo */}
            <div className="absolute w-28 h-28 rounded-full border-4 border-blue-400/30 animate-ping" />
            {/* Anel giratório */}
            <div className="absolute w-24 h-24 rounded-full border-4 border-transparent border-t-blue-300 border-r-blue-400 animate-spin" />
            {/* Círculo central */}
            <div className="w-20 h-20 rounded-full bg-blue-800 border-2 border-blue-600 flex items-center justify-center shadow-2xl">
              <Waves className="w-9 h-9 text-blue-200 animate-pulse" />
            </div>
          </div>
          {/* Nome */}
          <div className="text-center space-y-1">
            <p className="font-black text-white text-xl italic tracking-wider animate-pulse">NorthWindy</p>
            <p className="text-blue-400 text-xs font-bold uppercase tracking-widest">A carregar perfil…</p>
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

  // Se o utilizador clicou numa empresa nos resultados de busca, mostra o perfil dessa empresa
  if (viewingCompany) {
    return (
      <CompanyProfileView
        company={viewingCompany}
        onBack={() => setViewingCompany(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}

      {/* ── NAVBAR ── */}
      <nav className="bg-blue-900 text-white px-4 py-3 sticky top-0 z-40 shadow-xl">
        <div className="flex items-center gap-3 max-w-6xl mx-auto">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Waves className="w-5 h-5 text-blue-300" />
            <span className="font-black text-base italic hidden sm:inline">NorthWindy</span>
            <span className="bg-amber-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full">Empresa</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-black text-white text-sm truncate">{company.nome_fantasia}</p>
            <p className="text-blue-300 text-[10px] font-bold truncate hidden sm:block">
              {company.profile_number} · {company.setor.split(',')[0]}
            </p>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button className="relative bg-blue-800 p-2 rounded-full" onClick={() => handleTabChange('mensagens')}>
              <Bell className="w-4 h-4 text-white" />
              {unread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-amber-400 text-blue-900 text-[8px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center">
                  {unread}
                </span>
              )}
            </button>
            <button onClick={onLogout}
              className="bg-blue-800 hover:bg-red-600 px-3 py-2 rounded-full text-xs font-black uppercase flex items-center gap-1 transition-all">
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
          <div className="bg-white border-2 border-gray-100 rounded-[22px] p-4 mb-3">
            <div className="w-12 h-12 bg-amber-50 border-2 border-amber-100 rounded-[12px] flex items-center justify-center mx-auto mb-2">
              <Building2 className="w-6 h-6 text-amber-500" />
            </div>
            <p className="font-black text-blue-900 text-xs text-center uppercase italic leading-tight">{company.nome_fantasia}</p>
            <p className="text-[10px] font-bold text-gray-400 text-center mt-0.5">{company.profile_number}</p>
            <div className="mt-2 pt-2 border-t border-gray-50 flex items-center justify-center gap-1">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
              <p className="text-[9px] font-black text-green-600 uppercase">Activa</p>
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
        <main className="flex-1 min-w-0 px-4 py-4 pb-24 md:pb-6 md:pr-4 md:py-6 overflow-hidden">
          {tab === 'eventos'      && <EventosEmpresaTab company={company} />}
          {tab === 'destaques'    && <DestaquesTab    company={company} onViewCompany={setViewingCompany} />}
          {tab === 'frota'        && <FrotaTab        companyId={company.id} onToast={setToast} />}
          {tab === 'reservas'     && <ReservasTab companyId={company.id} />}
          {tab === 'funcionarios' && <RHTab companyId={company.id} onToast={setToast} />}
          {tab === 'mensagens'    && <MensagensTab    companyId={company.id} />}
          {tab === 'financeiro'   && <FinanceiroTab companyId={company.id} />}
          {tab === 'suporte'      && <SuporteTab      company={company} />}
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
                      active ? 'bg-blue-900 text-white' : 'bg-gray-50 text-gray-500 hover:bg-blue-50'
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