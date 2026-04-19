// src/components/pages/CompanyProfileView.tsx
// Perfil público read-only de uma empresa — design NorthWindy.
import { useState, useMemo } from 'react';
import {
  ArrowLeft, Star, CalendarDays, Building2, MapPin, Phone,
  Mail, Globe, Waves, Instagram, Linkedin, Facebook, ExternalLink,
  ChevronRight, CalendarX, Users, Clock, ChevronDown, ChevronUp,
  ShoppingBag, Briefcase, Image as ImageIcon,
} from 'lucide-react';
import { getPublicEvents, getJobsByCompany, type NauticEvent, type JobOffer } from '../../lib/localStore';
import type { Company } from '../../lib/store/companies';
import { FriendButton, useFriendships } from '../shared/FriendComponents';
import type { FriendProfileType } from '../shared/FriendComponents';

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Date(iso + 'T12:00').toLocaleDateString('pt-PT', {
    weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
  });
}

function currency(v: number) {
  return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(v);
}

const TIPO_EMOJI: Record<string, string> = {
  Regata: '🏁', Passeio: '⛵', Formação: '🎓', Desportivo: '🏊',
  Tour: '🗺️', Festa: '🎉', Outro: '🌊',
};

const AGENDA_STRIPE: Record<string, string> = {
  Regata: '#3b82f6', Passeio: '#c9a96e', Festa: '#a855f7',
  Workshop: '#22c55e', Travessia: '#14b8a6', Pesca: '#f97316', Outro: '#9ca3af',
};

const WEEKDAYS_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS_SHORT   = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

function agendaFmtDate(str: string) {
  try {
    const d = new Date(str + 'T12:00:00');
    return `${String(d.getDate()).padStart(2, '0')} ${MONTHS_SHORT[d.getMonth()]}`;
  } catch { return str; }
}
function agendaFmtDay(str: string) {
  try {
    return WEEKDAYS_SHORT[new Date(str + 'T12:00:00').getDay()];
  } catch { return ''; }
}

// ── Section label ─────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em] mb-3 flex items-center gap-1.5">
      {children}
    </p>
  );
}

// ── Tab: Perfil Público ───────────────────────────────────────────────────────

function PerfilPublicoTab({ company }: { company: Company }) {
  const profilePhoto = (company as any).profile_photo as string | null ?? null;
  const album: string[] = (company as any).album ?? [];

  const companyEvents = useMemo(
    () => getPublicEvents().filter(e => e.company_id === company.id),
    [company.id]
  );

  const socials = [
    { icon: Instagram, href: company.instagram, label: 'Instagram', color: 'hover:border-pink-300 hover:text-pink-700' },
    { icon: Linkedin,  href: company.linkedin,  label: 'LinkedIn',  color: 'hover:border-blue-300 hover:text-blue-700' },
    { icon: Facebook,  href: company.facebook,  label: 'Facebook',  color: 'hover:border-indigo-300 hover:text-indigo-700' },
    { icon: Globe,     href: company.website,   label: 'Website',   color: 'hover:border-[#c9a96e] hover:text-[#1a2b4a]' },
  ].filter(s => s.href);

  const waPhone = company.telefone?.replace(/\D/g, '');
  const waLink  = waPhone ? `https://wa.me/${waPhone}` : null;

  return (
    <div className="space-y-6">

      {/* Banner hero */}
      <div className="bg-[#0a1628] p-6 flex items-center gap-2 flex-wrap">
        {company.setor.split(',').slice(0, 2).map(s => (
          <span key={s} className="bg-[#c9a96e]/15 text-[#c9a96e] text-[9px] font-semibold uppercase px-2 py-0.5 tracking-wide">
            {s.trim()}
          </span>
        ))}
        <span className="bg-white/10 text-white/60 text-[9px] font-semibold px-2 py-0.5 flex items-center gap-1">
          <MapPin className="w-2.5 h-2.5" /> {company.cidade}
        </span>
      </div>

      {/* Sobre */}
      {company.descricao && (
        <div className="bg-white border-2 border-[#0a1628]/5 p-5">
          <SectionLabel>📋 Sobre a Empresa</SectionLabel>
          <p className="text-sm text-gray-600 font-semibold leading-relaxed">{company.descricao}</p>
        </div>
      )}

      {/* Passeios e Eventos */}
      {companyEvents.length > 0 && (
        <div className="bg-white border-2 border-[#0a1628]/5 overflow-hidden">
          <div className="px-5 pt-5 pb-3 border-b-2 border-[#0a1628]/5">
            <SectionLabel><CalendarDays className="w-3.5 h-3.5" /> Passeios e Eventos</SectionLabel>
          </div>
          <div className="divide-y divide-gray-100">
            {companyEvents.map(ev => {
              const color = AGENDA_STRIPE[ev.tipo] ?? '#c9a96e';
              const emoji = ev.cover_emoji || TIPO_EMOJI[ev.tipo] || '📌';
              return (
                <div key={ev.id} className="flex items-stretch hover:bg-gray-50 transition-colors">
                  <div className="w-[3px] flex-shrink-0" style={{ backgroundColor: color }} />
                  <div className="w-9 flex items-center justify-center py-3 flex-shrink-0">
                    <span className="text-sm leading-none">{emoji}</span>
                  </div>
                  <div className="flex-1 min-w-0 py-3 pr-1">
                    <p className="font-bold text-[12px] text-[#1a2b4a] leading-snug truncate uppercase">
                      {ev.title}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <MapPin className="w-2 h-2 text-gray-300 flex-shrink-0" />
                      <span className="text-[10px] text-gray-400 truncate">{ev.local}</span>
                    </div>
                  </div>
                  <div className="flex-shrink-0 flex flex-col items-end justify-center px-3 py-3 text-right">
                    <span className="text-[8px] font-semibold text-gray-400 uppercase leading-none">
                      {agendaFmtDay(ev.date)}
                    </span>
                    <span className="text-[13px] font-['Playfair_Display'] font-bold leading-tight" style={{ color }}>
                      {agendaFmtDate(ev.date)}
                    </span>
                    {ev.time && <span className="text-[9px] text-gray-400 mt-0.5">{ev.time}</span>}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="px-5 py-2.5 border-t border-gray-100 flex items-center justify-between">
            <span className="text-[9px] text-gray-300 uppercase tracking-wider">
              {companyEvents.length} evento{companyEvents.length > 1 ? 's' : ''} publicado{companyEvents.length > 1 ? 's' : ''}
            </span>
            <CalendarDays className="w-3 h-3 text-gray-200" />
          </div>
        </div>
      )}

      {/* Galeria */}
      {album.length > 0 && (
        <div className="bg-white border-2 border-[#0a1628]/5 p-5">
          <SectionLabel><ImageIcon className="w-3.5 h-3.5" /> Galeria</SectionLabel>
          <div className="grid grid-cols-3 gap-2">
            {album.slice(0, 9).map((url, i) => (
              <div key={i} className="overflow-hidden aspect-square border border-gray-100">
                <img src={url} alt={`Foto ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contacto */}
      <div className="bg-white border-2 border-[#0a1628]/5 p-5">
        <SectionLabel>📞 Contacto</SectionLabel>
        <div className="space-y-3">
          {[
            { icon: MapPin, label: 'Localização', value: [company.cidade, company.pais_nome].filter(Boolean).join(', ') },
            { icon: Phone,  label: 'Telefone',    value: company.telefone },
            { icon: Mail,   label: 'Email',        value: company.email },
            { icon: Globe,  label: 'Website',      value: company.website || null },
          ].filter(r => r.value).map(r => (
            <div key={r.label} className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#0a1628]/5 flex items-center justify-center flex-shrink-0">
                <r.icon className="w-3.5 h-3.5 text-[#c9a96e]" />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">{r.label}</p>
                <p className="text-sm font-bold text-[#1a2b4a] truncate">{r.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* WhatsApp */}
        {waLink && (
          <a href={waLink} target="_blank" rel="noopener noreferrer"
            className="mt-4 w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white py-3 font-semibold text-xs uppercase tracking-widest transition-all">
            💬 Contactar via WhatsApp
          </a>
        )}
      </div>

      {/* Redes sociais */}
      {socials.length > 0 && (
        <div className="bg-white border-2 border-[#0a1628]/5 p-5">
          <SectionLabel>🔗 Redes Sociais</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {socials.map(s => (
              <a key={s.label} href={s.href!} target="_blank" rel="noopener noreferrer"
                className={`flex items-center gap-1.5 px-3 py-2 border-2 border-gray-100 text-gray-500 transition-all ${s.color}`}>
                <s.icon className="w-3.5 h-3.5" />
                <span className="text-xs font-semibold">{s.label}</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-50" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Evento Card ───────────────────────────────────────────────────────────────

function EventoCard({ ev }: { ev: NauticEvent }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white border-2 border-[#0a1628]/5 overflow-hidden hover:border-[#c9a96e]/30 transition-all">
      <button className="w-full px-5 py-4 flex items-center gap-4 text-left" onClick={() => setExpanded(v => !v)}>
        <div className="w-10 h-10 bg-[#0a1628] flex items-center justify-center flex-shrink-0 text-lg">
          {ev.cover_emoji || TIPO_EMOJI[ev.tipo] || '📌'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-[#1a2b4a] text-sm truncate uppercase">{ev.title}</p>
          <p className="text-xs font-semibold text-gray-400 mt-0.5">{fmtDate(ev.date)} · {ev.local}</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-xs font-bold text-[#c9a96e]">
            {ev.preco > 0 ? currency(ev.preco) : 'Grátis'}
          </span>
          {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t-2 border-[#0a1628]/5 bg-gray-50/50 px-5 pb-4 space-y-3 pt-3">
          {ev.description && (
            <p className="text-sm text-gray-600 font-semibold leading-relaxed">{ev.description}</p>
          )}
          {ev.photos && ev.photos.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {ev.photos.slice(0, 6).map((url, i) => (
                <div key={i} className="aspect-square overflow-hidden border border-gray-100">
                  <img src={url} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <span className="flex items-center gap-1 bg-[#0a1628]/5 text-[#1a2b4a] font-semibold text-xs px-2.5 py-1">
              <Clock className="w-3 h-3" /> {ev.time}
            </span>
            <span className="flex items-center gap-1 bg-[#0a1628]/5 text-[#1a2b4a] font-semibold text-xs px-2.5 py-1">
              <Users className="w-3 h-3" /> {ev.vagas} vagas
            </span>
            <span className="flex items-center gap-1 bg-[#0a1628]/5 text-[#1a2b4a] font-semibold text-xs px-2.5 py-1">
              <MapPin className="w-3 h-3" /> {ev.cidade}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Tab: Mural ────────────────────────────────────────────────────────────────

function MuralTab({ company }: { company: Company }) {
  const events = useMemo(
    () => getPublicEvents().filter(e => e.company_id === company.id),
    [company.id]
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-['Playfair_Display'] font-bold text-2xl text-[#1a2b4a]">Mural</h2>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-0.5">Eventos públicos da empresa</p>
      </div>

      {events.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-gray-200 py-16 text-center">
          <CalendarX className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="font-bold text-gray-300 uppercase text-sm">Sem eventos publicados</p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map(ev => <EventoCard key={ev.id} ev={ev} />)}
        </div>
      )}
    </div>
  );
}

// ── Tab: Lojas ────────────────────────────────────────────────────────────────

function LojasTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-['Playfair_Display'] font-bold text-2xl text-[#1a2b4a]">Lojas</h2>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-0.5">Produtos e serviços da empresa</p>
      </div>
      <div className="bg-white border-2 border-dashed border-gray-200 py-20 text-center">
        <ShoppingBag className="w-10 h-10 text-gray-200 mx-auto mb-3" />
        <p className="font-bold text-gray-300 uppercase text-sm">Em breve</p>
        <p className="text-xs font-semibold text-gray-300 mt-1">A loja estará disponível em breve.</p>
      </div>
    </div>
  );
}

// ── Vaga Card ─────────────────────────────────────────────────────────────────

const TIPO_CORES: Record<string, string> = {
  Skipper:    'bg-[#0a1628] text-white',
  Tripulante: 'bg-[#1a2b4a] text-white',
  Docente:    'bg-[#c9a96e]/20 text-[#c9a96e]',
  Mecânico:   'bg-amber-100 text-amber-800',
  Outro:      'bg-gray-100 text-gray-600',
};

function JobCard({ job }: { job: JobOffer }) {
  const [expanded, setExpanded] = useState(false);
  const tipoCls = TIPO_CORES[job.tipo] || TIPO_CORES.Outro;
  const waMsg   = `Olá! Vi a oferta *${job.title}* na NorthWindy e tenho interesse em candidatar-me. Poderia dar mais informações? 🌊`;
  const waLink  = job.contact_phone
    ? `https://wa.me/${job.contact_phone.replace(/\D/g, '')}?text=${encodeURIComponent(waMsg)}`
    : null;
  const mailLink = job.contact_email
    ? `mailto:${job.contact_email}?subject=${encodeURIComponent(`Candidatura: ${job.title}`)}`
    : null;

  return (
    <div className="bg-white border-2 border-[#0a1628]/5 overflow-hidden hover:border-[#c9a96e]/30 transition-all">
      <button className="w-full px-5 py-4 flex items-center gap-4 text-left" onClick={() => setExpanded(v => !v)}>
        <div className="w-10 h-10 bg-[#0a1628]/5 flex items-center justify-center flex-shrink-0">
          <Briefcase className="w-4 h-4 text-[#c9a96e]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-[#1a2b4a] text-sm truncate uppercase">{job.title}</p>
          <p className="text-xs font-semibold text-gray-400">{job.local} · {job.cidade}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`text-[9px] font-semibold uppercase px-2 py-0.5 ${tipoCls}`}>{job.tipo}</span>
          {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t-2 border-[#0a1628]/5 bg-gray-50/50 px-5 pb-4 pt-3 space-y-3">
          {job.description && (
            <p className="text-sm text-gray-600 font-semibold leading-relaxed">{job.description}</p>
          )}
          <div className="flex flex-wrap gap-2">
            {job.contrato && (
              <span className="flex items-center gap-1 bg-[#0a1628]/5 text-[#1a2b4a] font-semibold text-xs px-2.5 py-1">
                <Clock className="w-3 h-3" /> {job.contrato}
              </span>
            )}
            {job.regime && (
              <span className="flex items-center gap-1 bg-[#0a1628]/5 text-[#1a2b4a] font-semibold text-xs px-2.5 py-1">
                <Briefcase className="w-3 h-3" /> {job.regime}
              </span>
            )}
            {job.remuneracao && (
              <span className="flex items-center gap-1 bg-green-50 text-green-700 font-semibold text-xs px-2.5 py-1 border border-green-100">
                💰 {job.remuneracao}
              </span>
            )}
          </div>
          {job.requisitos && (
            <div className="bg-white border-2 border-[#0a1628]/5 px-4 py-3">
              <p className="text-[9px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em] mb-1">Requisitos</p>
              <p className="text-xs font-semibold text-gray-600 leading-relaxed">{job.requisitos}</p>
            </div>
          )}
          {(waLink || mailLink) && (
            <div className="flex gap-2 pt-1">
              {waLink && (
                <a href={waLink} target="_blank" rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-500 text-white py-2.5 font-semibold text-xs uppercase tracking-widest transition-all">
                  💬 WhatsApp
                </a>
              )}
              {mailLink && (
                <a href={mailLink}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-[#0a1628] hover:bg-[#1a2b4a] text-white py-2.5 font-semibold text-xs uppercase tracking-widest transition-all">
                  <Mail className="w-3.5 h-3.5" /> Email
                </a>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TrabalheTab({ company }: { company: Company }) {
  const jobs = useMemo(
    () => getJobsByCompany(company.id).filter(j => j.status === 'open'),
    [company.id]
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-['Playfair_Display'] font-bold text-2xl text-[#1a2b4a]">Trabalhe Conosco</h2>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-0.5">Vagas de emprego abertas</p>
      </div>
      {jobs.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-gray-200 py-16 text-center">
          <Briefcase className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="font-bold text-gray-300 uppercase text-sm">Sem vagas abertas</p>
          <p className="text-xs font-semibold text-gray-300 mt-1">Esta empresa não tem vagas disponíveis no momento.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map(j => <JobCard key={j.id} job={j} />)}
        </div>
      )}
    </div>
  );
}

// ── Componente Principal ──────────────────────────────────────────────────────

type ViewTab = 'perfil' | 'mural' | 'lojas' | 'trabalhe';

const VIEW_TABS: { key: ViewTab; icon: React.ElementType; label: string; short: string }[] = [
  { key: 'perfil',   icon: Star,         label: 'Perfil Público',   short: 'Perfil'  },
  { key: 'mural',    icon: CalendarDays, label: 'Mural',            short: 'Mural'   },
  { key: 'lojas',    icon: ShoppingBag,  label: 'Lojas',            short: 'Lojas'   },
  { key: 'trabalhe', icon: Briefcase,    label: 'Trabalhe Conosco', short: 'Vagas'   },
];

interface CompanyProfileViewProps {
  company:          Company;
  onBack:           () => void;
  currentUserId?:   string;
  currentUserType?: FriendProfileType;
}

export function CompanyProfileView({ company, onBack, currentUserId, currentUserType }: CompanyProfileViewProps) {
  const [tab, setTab] = useState<ViewTab>('perfil');
  const { friendships, loadFriendships } = useFriendships(currentUserId);
  const canAddFriend = !!currentUserId && !!currentUserType && currentUserId !== company.id;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* ── NAVBAR ── */}
      <nav className="bg-[#0a1628] text-white px-4 py-3 sticky top-0 z-40 shadow-xl border-b border-[#c9a96e]/10">
        <div className="flex items-center gap-3 max-w-6xl mx-auto">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Waves className="w-5 h-5 text-[#c9a96e]" />
            <span className="font-['Playfair_Display'] font-bold italic text-base hidden sm:inline text-white">NorthWindy</span>
          </div>
          <div className="flex-1" />
          {canAddFriend && (
            <FriendButton
              myId={currentUserId!} myType={currentUserType!}
              theirId={company.id} theirType="company"
              friendships={friendships} onAction={loadFriendships} compact
            />
          )}
          <button onClick={onBack}
            className="bg-white/5 hover:bg-red-600/80 px-4 py-2 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-all flex-shrink-0 border border-white/10">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Voltar</span>
          </button>
        </div>
      </nav>

      {/* ── CONTENT AREA ── */}
      <div className="flex flex-1 max-w-6xl mx-auto w-full px-4">

        {/* ── SIDEBAR (desktop) ── */}
        <aside className="hidden md:flex flex-col w-56 flex-shrink-0 py-6 pr-3 gap-0">
          {/* Mini card removido — apenas botão de amizade */}
          {canAddFriend && (
            <div className="bg-white border-2 border-[#0a1628]/5 p-4 mb-4 shadow-sm">
              <FriendButton
                myId={currentUserId!} myType={currentUserType!}
                theirId={company.id} theirType="company"
                friendships={friendships} onAction={loadFriendships}
              />
            </div>
          )}

          {/* Nav items */}
          <div className="bg-white border-2 border-[#0a1628]/5 overflow-hidden shadow-sm">
            {VIEW_TABS.map((t, i) => {
              const Icon   = t.icon;
              const active = tab === t.key;
              return (
                <button key={t.key} onClick={() => setTab(t.key)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-xs font-semibold uppercase tracking-wider transition-all border-b border-[#0a1628]/5 last:border-0 ${
                    active
                      ? 'bg-[#0a1628] text-white'
                      : 'text-gray-500 hover:bg-[#0a1628]/5 hover:text-[#1a2b4a]'
                  }`}>
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="flex-1 text-left">{t.label}</span>
                  {active && <ChevronRight className="w-3 h-3 text-[#c9a96e]" />}
                </button>
              );
            })}
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main className="flex-1 min-w-0 md:pl-3 py-6 pb-24 md:pb-6 overflow-hidden">
          {tab === 'perfil'   && <PerfilPublicoTab company={company} />}
          {tab === 'mural'    && <MuralTab company={company} />}
          {tab === 'lojas'    && <LojasTab />}
          {tab === 'trabalhe' && <TrabalheTab company={company} />}
        </main>
      </div>

      {/* ── BOTTOM TAB BAR (mobile) ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0a1628] border-t border-[#c9a96e]/10 shadow-2xl">
        <div className="flex items-stretch h-16">
          {VIEW_TABS.map(t => {
            const Icon   = t.icon;
            const active = tab === t.key;
            return (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-all relative ${
                  active ? 'text-[#c9a96e]' : 'text-white/40'
                }`}>
                <Icon className={`w-5 h-5 transition-all ${active ? 'scale-110' : ''}`} />
                <span className="text-[9px] font-semibold uppercase tracking-wide">{t.short}</span>
                {active && <div className="absolute bottom-0 h-0.5 w-8 bg-[#c9a96e]" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
