// src/components/pages/CompanyProfileView.tsx
// Página de perfil público read-only de uma empresa — aberta ao clicar numa
// empresa nos resultados de busca. Mostra apenas 4 tabs: Perfil Público, Mural, Lojas e Trabalhe Conosco.
import { useState, useMemo } from 'react';
import {
  ArrowLeft, Star, CalendarDays, Building2, MapPin, Phone,
  Mail, Globe, Waves, Instagram, Linkedin, Facebook, ExternalLink,
  ChevronRight, Image, CalendarX, Users, Clock, ChevronDown, ChevronUp,
  ShoppingBag, Briefcase,
} from 'lucide-react';
import { getPublicEvents, getJobsByCompany, type NauticEvent, type JobOffer } from '../../lib/localStore';
import type { Company } from '../../lib/store/companies';

// ── Helpers ─────────────────────────────────────────────────────────────────

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

// ── Tab: Perfil Público (read-only) ─────────────────────────────────────────

function PerfilPublicoTab({ company }: { company: Company }) {
  const profilePhoto = (company as any).profile_photo as string | null ?? null;
  const album: string[] = (company as any).album ?? [];

  const socials = [
    { icon: Instagram, href: company.instagram, label: 'Instagram' },
    { icon: Linkedin,  href: company.linkedin,  label: 'LinkedIn'  },
    { icon: Facebook,  href: company.facebook,  label: 'Facebook'  },
    { icon: Globe,     href: company.website,   label: 'Website'   },
  ].filter(s => s.href);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-black text-blue-900 uppercase italic">Perfil Público</h2>
        <p className="text-xs text-gray-400 font-bold">Perfil público da empresa</p>
      </div>

      {/* Banner */}
      <div className="bg-gradient-to-br from-blue-900 to-blue-700 rounded-[22px] p-5 text-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-[16px] overflow-hidden border-2 border-white/30 flex-shrink-0 bg-white/20">
            {profilePhoto
              ? <img src={profilePhoto} alt={company.nome_fantasia} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center"><Building2 className="w-8 h-8 text-white" /></div>
            }
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-300">{company.profile_number}</p>
            <h3 className="text-lg font-black uppercase italic leading-tight truncate">{company.nome_fantasia}</h3>
            <p className="text-blue-300 text-xs font-bold truncate">{company.razao_social}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {company.setor.split(',').slice(0, 2).map(s => (
                <span key={s} className="bg-white/20 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full">{s.trim()}</span>
              ))}
              <span className="bg-white/20 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <MapPin className="w-2.5 h-2.5" /> {company.cidade}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Álbum de fotos (somente visualização) */}
      {album.length > 0 && (
        <div className="bg-white border-2 border-gray-100 rounded-[20px] p-4 space-y-3">
          <p className="text-xs font-black text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
            <Image className="w-3.5 h-3.5" /> Galeria
          </p>
          <div className="grid grid-cols-3 gap-2">
            {album.slice(0, 8).map((url, i) => (
              <div key={i} className="rounded-[12px] overflow-hidden aspect-square">
                <img src={url} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Descrição */}
      {company.descricao && (
        <div className="bg-white border-2 border-gray-100 rounded-[20px] p-4">
          <p className="text-xs font-black text-blue-900 uppercase tracking-wider mb-3">Sobre a Empresa</p>
          <p className="text-sm text-gray-600 font-bold leading-relaxed">{company.descricao}</p>
        </div>
      )}

      {/* Contacto */}
      <div className="bg-white border-2 border-gray-100 rounded-[20px] p-4 space-y-3">
        <p className="text-xs font-black text-blue-900 uppercase tracking-wider">Contacto</p>
        {[
          { icon: Phone,  label: 'Telefone',    value: company.telefone },
          { icon: Mail,   label: 'Email',        value: company.email },
          { icon: Globe,  label: 'Website',      value: company.website || null },
          { icon: MapPin, label: 'Localização',  value: `${company.cidade}, ${company.pais_nome}` },
        ].filter(r => r.value).map(r => (
          <div key={r.label} className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
              <r.icon className="w-3.5 h-3.5 text-blue-500" />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-black text-gray-400 uppercase">{r.label}</p>
              <p className="text-sm font-bold text-blue-900 truncate">{r.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Redes sociais */}
      {socials.length > 0 && (
        <div className="bg-white border-2 border-gray-100 rounded-[20px] p-4">
          <p className="text-xs font-black text-blue-900 uppercase tracking-wider mb-3">Redes</p>
          <div className="flex flex-wrap gap-2">
            {socials.map(s => (
              <a key={s.label} href={s.href!} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 border-2 border-gray-100 hover:border-blue-200 hover:bg-blue-50 rounded-[12px] transition-all">
                <s.icon className="w-3.5 h-3.5 text-blue-700" />
                <span className="text-xs font-black text-blue-900">{s.label}</span>
                <ExternalLink className="w-2.5 h-2.5 text-gray-400" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Evento Card (somente visualização) ───────────────────────────────────────

function EventoCard({ ev }: { ev: NauticEvent }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white border-2 border-gray-100 rounded-[20px] overflow-hidden hover:border-blue-200 transition-all">
      <button className="w-full px-4 py-4 flex items-center gap-3 text-left" onClick={() => setExpanded(v => !v)}>
        <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0 text-xl">
          {ev.cover_emoji || TIPO_EMOJI[ev.tipo] || '📌'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-black text-blue-900 text-sm truncate">{ev.title}</p>
          <p className="text-xs font-bold text-gray-400">{fmtDate(ev.date)} · {ev.local}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs font-black text-blue-700">{ev.preco > 0 ? currency(ev.preco) : 'Grátis'}</span>
          {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-100 px-4 pb-4 space-y-3">
          {ev.description && (
            <p className="text-sm text-gray-600 font-bold leading-relaxed pt-3">{ev.description}</p>
          )}

          {ev.photos && ev.photos.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {ev.photos.slice(0, 6).map((url, i) => (
                <div key={i} className="aspect-square rounded-[10px] overflow-hidden">
                  <img src={url} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-2 text-xs">
            <span className="flex items-center gap-1 bg-blue-50 text-blue-700 font-black px-2.5 py-1 rounded-full">
              <Clock className="w-3 h-3" /> {ev.time}
            </span>
            <span className="flex items-center gap-1 bg-gray-50 text-gray-600 font-black px-2.5 py-1 rounded-full">
              <Users className="w-3 h-3" /> {ev.vagas} vagas
            </span>
            <span className="flex items-center gap-1 bg-gray-50 text-gray-600 font-black px-2.5 py-1 rounded-full">
              <MapPin className="w-3 h-3" /> {ev.cidade}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Tab: Mural ───────────────────────────────────────────────────────────────

function MuralTab({ company }: { company: Company }) {
  const events = useMemo(
    () => getPublicEvents().filter(e => e.company_id === company.id),
    [company.id]
  );

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-black text-blue-900 uppercase italic">Mural</h2>
        <p className="text-xs text-gray-400 font-bold">Eventos públicos da empresa</p>
      </div>

      {events.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-gray-200 rounded-[24px] py-14 text-center">
          <CalendarX className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="font-black text-gray-300 uppercase italic text-sm">Sem eventos publicados</p>
          <p className="text-xs text-gray-400 font-bold mt-1">Esta empresa não tem eventos aprovados no mural.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map(ev => (
            <EventoCard key={ev.id} ev={ev} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Tab: Lojas ───────────────────────────────────────────────────────────────

function LojasTab() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-black text-blue-900 uppercase italic">Lojas</h2>
        <p className="text-xs text-gray-400 font-bold">Produtos e serviços da empresa</p>
      </div>
      <div className="bg-white border-2 border-dashed border-gray-200 rounded-[24px] py-16 text-center">
        <ShoppingBag className="w-10 h-10 text-gray-200 mx-auto mb-3" />
        <p className="font-black text-gray-300 uppercase italic text-sm">Em breve</p>
        <p className="text-xs text-gray-400 font-bold mt-1">A loja desta empresa estará disponível em breve.</p>
      </div>
    </div>
  );
}

// ── Tab: Trabalhe Conosco ────────────────────────────────────────────────────

const TIPO_CORES: Record<string, string> = {
  Skipper:    'bg-blue-50 text-blue-700 border-blue-100',
  Tripulante: 'bg-teal-50 text-teal-700 border-teal-100',
  Docente:    'bg-purple-50 text-purple-700 border-purple-100',
  Mecânico:   'bg-orange-50 text-orange-700 border-orange-100',
  Outro:      'bg-gray-50 text-gray-600 border-gray-100',
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
    <div className="bg-white border-2 border-gray-100 rounded-[22px] overflow-hidden hover:border-blue-200 transition-all">
      <button className="w-full px-5 py-4 flex items-center gap-3 text-left" onClick={() => setExpanded(v => !v)}>
        <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
          <Briefcase className="w-4 h-4 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-black text-blue-900 text-sm truncate">{job.title}</p>
          <p className="text-xs font-bold text-gray-400">{job.local} · {job.cidade}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border-2 ${tipoCls}`}>{job.tipo}</span>
          {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-100 px-5 pb-4 space-y-3">
          {job.description && (
            <p className="text-sm text-gray-600 font-bold leading-relaxed pt-3">{job.description}</p>
          )}
          <div className="flex flex-wrap gap-2 text-xs">
            {job.contrato && (
              <span className="flex items-center gap-1 bg-gray-50 text-gray-600 font-black px-2.5 py-1 rounded-full border border-gray-100">
                <Clock className="w-3 h-3" /> {job.contrato}
              </span>
            )}
            {job.regime && (
              <span className="flex items-center gap-1 bg-gray-50 text-gray-600 font-black px-2.5 py-1 rounded-full border border-gray-100">
                <Briefcase className="w-3 h-3" /> {job.regime}
              </span>
            )}
            {job.remuneracao && (
              <span className="flex items-center gap-1 bg-green-50 text-green-700 font-black px-2.5 py-1 rounded-full border border-green-100">
                {job.remuneracao}
              </span>
            )}
          </div>
          {job.requisitos && (
            <div className="bg-gray-50 rounded-[12px] px-3 py-2">
              <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Requisitos</p>
              <p className="text-xs font-bold text-gray-600 leading-relaxed">{job.requisitos}</p>
            </div>
          )}
          {(waLink || mailLink) && (
            <div className="flex gap-2">
              {waLink && (
                <a href={waLink} target="_blank" rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-500 text-white py-2.5 rounded-[12px] font-black text-xs uppercase tracking-wide transition-all">
                  <ExternalLink className="w-3.5 h-3.5" /> WhatsApp
                </a>
              )}
              {mailLink && (
                <a href={mailLink}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-blue-900 hover:bg-blue-800 text-white py-2.5 rounded-[12px] font-black text-xs uppercase tracking-wide transition-all">
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
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-black text-blue-900 uppercase italic">Trabalhe Conosco</h2>
        <p className="text-xs text-gray-400 font-bold">Vagas de emprego abertas</p>
      </div>
      {jobs.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-gray-200 rounded-[24px] py-14 text-center">
          <Briefcase className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="font-black text-gray-300 uppercase italic text-sm">Sem vagas abertas</p>
          <p className="text-xs text-gray-400 font-bold mt-1">Esta empresa não tem vagas disponíveis no momento.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map(j => <JobCard key={j.id} job={j} />)}
        </div>
      )}
    </div>
  );
}

// ── Componente Principal ─────────────────────────────────────────────────────

type ViewTab = 'perfil' | 'mural' | 'lojas' | 'trabalhe';

const VIEW_TABS: { key: ViewTab; icon: React.ElementType; label: string; short: string }[] = [
  { key: 'perfil',   icon: Star,         label: 'Perfil Público',   short: 'Perfil'    },
  { key: 'mural',    icon: CalendarDays, label: 'Mural',            short: 'Mural'     },
  { key: 'lojas',    icon: ShoppingBag,  label: 'Lojas',            short: 'Lojas'     },
  { key: 'trabalhe', icon: Briefcase,    label: 'Trabalhe Conosco', short: 'Vagas'     },
];

interface CompanyProfileViewProps {
  company: Company;
  onBack:  () => void;
}

export function CompanyProfileView({ company, onBack }: CompanyProfileViewProps) {
  const [tab, setTab] = useState<ViewTab>('perfil');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* ── NAVBAR ── */}
      <nav className="bg-blue-900 text-white px-4 py-3 sticky top-0 z-40 shadow-xl">
        <div className="flex items-center gap-3 max-w-6xl mx-auto">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Waves className="w-5 h-5 text-blue-300" />
            <span className="font-black text-base italic hidden sm:inline">NorthWindy</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-black text-white text-sm truncate">{company.nome_fantasia}</p>
            <p className="text-blue-300 text-[10px] font-bold truncate hidden sm:block">
              {company.profile_number} · {company.setor.split(',')[0]}
            </p>
          </div>
          <button onClick={onBack}
            className="bg-blue-800 hover:bg-red-600 px-3 py-2 rounded-full text-xs font-black uppercase flex items-center gap-1 transition-all flex-shrink-0">
            <ArrowLeft className="w-3 h-3" />
            <span className="hidden sm:inline">Voltar</span>
          </button>
        </div>
      </nav>

      {/* ── CONTENT AREA ── */}
      <div className="flex flex-1 max-w-6xl mx-auto w-full">

        {/* ── SIDEBAR (desktop ≥ md) ── */}
        <aside className="hidden md:flex flex-col gap-1 w-52 flex-shrink-0 py-6 pl-4 pr-2">
          <div className="bg-white border-2 border-gray-100 rounded-[22px] p-4 mb-3">
            <div className="w-12 h-12 bg-blue-50 border-2 border-blue-100 rounded-[12px] flex items-center justify-center mx-auto mb-2 overflow-hidden">
              {(company as any).profile_photo
                ? <img src={(company as any).profile_photo} alt={company.nome_fantasia} className="w-full h-full object-cover" />
                : <Building2 className="w-6 h-6 text-blue-500" />
              }
            </div>
            <p className="font-black text-blue-900 text-xs text-center uppercase italic leading-tight">{company.nome_fantasia}</p>
            <p className="text-[10px] font-bold text-gray-400 text-center mt-0.5">{company.profile_number}</p>
            <p className="text-[10px] font-bold text-gray-400 text-center mt-1 truncate">{company.cidade}, {company.pais_nome}</p>
          </div>

          {VIEW_TABS.map(t => {
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
          {tab === 'perfil'   && <PerfilPublicoTab company={company} />}
          {tab === 'mural'    && <MuralTab company={company} />}
          {tab === 'lojas'    && <LojasTab />}
          {tab === 'trabalhe' && <TrabalheTab company={company} />}
        </main>
      </div>

      {/* ── BOTTOM TAB BAR (mobile) ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-gray-100 shadow-2xl">
        <div className="flex items-stretch h-16">
          {VIEW_TABS.map(t => {
            const Icon   = t.icon;
            const active = tab === t.key;
            return (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-all relative ${
                  active ? 'text-blue-900' : 'text-gray-400'
                }`}>
                <Icon className={`w-5 h-5 transition-all ${active ? 'scale-110' : ''}`} />
                <span className="text-[9px] font-black uppercase tracking-wide">{t.short}</span>
                {active && <div className="absolute bottom-0 h-0.5 w-8 bg-blue-900 rounded-full" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
