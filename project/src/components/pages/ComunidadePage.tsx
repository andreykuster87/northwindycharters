// src/components/pages/ComunidadePage.tsx
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Anchor, Users, Ship, Briefcase, MapPin, Shield,
  MessageSquare, Calendar, TrendingUp, UserCheck, Star,
  ArrowRight, ChevronDown, Waves, Search, Wrench,
  FileText, Award, Globe, UserPlus, Building2, Sun,
} from 'lucide-react';
import { HeroNavbar } from './hero/HeroNavbar';
import { SiteFooter } from './SiteFooter';

interface ComunidadePageProps {
  onBack: () => void;
  onSailorLogin:  () => void;
  onCompanyLogin: () => void;
  onSailorReg:    () => void;
  onCompanyReg:   () => void;
  onAdminClick:   () => void;
}

/* ─────────────────────────── static data ─────────────────────────── */

const STATS = [
  { value: '320+', label: 'Tripulantes activos' },
  { value: '85+',  label: 'Empresas parceiras'  },
  { value: '12',   label: 'Portos e marinas'     },
  { value: '100%', label: 'Verificados'          },
];

const SERVICES = [
  { key: 'perfis',     label: 'Perfis verificados',       desc: 'Tripulantes e empresas com credenciais autenticadas pela equipa NorthWindy.' },
  { key: 'parceiros',  label: 'Localização de parceiros', desc: 'Encontre marinas, seguradoras, prestadores de suporte e serviços náuticos.' },
  { key: 'passeios',   label: 'Catálogo de passeios',     desc: 'Oferta de passeios exclusivos disponibilizados directamente pelas empresas.' },
  { key: 'emprego',    label: 'Mercado de trabalho',      desc: 'Ofertas e procura de trabalho a bordo publicadas no catálogo da comunidade.' },
  { key: 'barcos',     label: 'Compra e venda de barcos', desc: 'Anúncios de embarcações verificadas disponíveis para aquisição.' },
  { key: 'eventos',    label: 'Eventos exclusivos',       desc: 'Acesso prioritário a eventos, regatas e encontros náuticos da comunidade.' },
  { key: 'forum',      label: 'Fórum náutico',            desc: 'Debate rotas, equipamentos, regulamentos e dicas com outros profissionais.' },
  { key: 'financeiro', label: 'Painel financeiro',        desc: 'Controlo das suas operações, receitas e despesas num único painel.' },
  { key: 'rh',         label: 'Sistema de RH',            desc: 'Gestão de equipas, turnos, férias e documentação dos tripulantes.' },
  { key: 'seguros',    label: 'Seguradoras parceiras',    desc: 'Acesso directo às melhores apólices marítimas negociadas para membros.' },
  { key: 'marinas',    label: 'Rede de marinas',          desc: 'Parcerias com marinas em todo o território para facilitar operações.' },
  { key: 'suporte',    label: 'Suporte técnico',          desc: 'Acesso a prestadores de manutenção e reparação certificados.' },
];

const TRIPULANTE_FEATURES = [
  { key: 'tp1', label: 'Perfil profissional',     desc: 'Mostre as suas certificações, experiência e disponibilidade.' },
  { key: 'tp2', label: 'Ofertas de emprego',       desc: 'Receba propostas das melhores empresas náuticas.' },
  { key: 'tp3', label: 'Certificações STCW',       desc: 'Gestão centralizada dos seus documentos e validades.' },
  { key: 'tp4', label: 'Rotas internacionais',     desc: 'Acesso a missões nacionais e internacionais.' },
  { key: 'tp5', label: 'Controlo financeiro',      desc: 'Registo de taxas, recibos e histórico de serviços.' },
  { key: 'tp6', label: 'Gestão de frota própria',  desc: 'Gira as suas embarcações mesmo sem ser empresa — registe, controle e alugue.' },
  { key: 'tp7', label: 'Comunidade activa',         desc: 'Fórum, eventos e rede de contactos profissionais.' },
];

const EMPRESA_FEATURES = [
  { key: 'em1', label: 'Sistema de RH',              desc: 'Gestão completa da sua equipa a bordo.' },
  { key: 'em2', label: 'Gestão de frota',             desc: 'Registo e controlo de todas as embarcações.' },
  { key: 'em3', label: 'Painel financeiro',           desc: 'Controlo de reservas, receitas e comissões.' },
  { key: 'em4', label: 'Recrutamento',                desc: 'Publique vagas e encontre tripulantes verificados.' },
  { key: 'em5', label: 'Gestão de eventos',           desc: 'Organize e venda bilhetes para eventos exclusivos.' },
  { key: 'em6', label: 'Catálogo de passeios',        desc: 'Publique e gira os seus passeios no marketplace.' },
  { key: 'em7', label: 'Perfil público de serviços',  desc: 'Disponibilize no seu perfil público os serviços que a sua empresa oferece — visível para toda a comunidade.' },
];

const PARTNER_CATS = [
  { label: 'Marinas',  count: '12 parceiros', color: 'from-blue-600  to-blue-800'  },
  { label: 'Seguros',  count: '8 parceiros',  color: 'from-slate-600 to-slate-800' },
  { label: 'Suporte',  count: '24 parceiros', color: 'from-cyan-700  to-cyan-900'  },
  { label: 'Servicos', count: '41 parceiros', color: 'from-amber-700 to-amber-900' },
];

const TESTIMONIALS = [
  { name: 'Ricardo M.',       role: 'Patrão de Alto Mar',  city: 'Lisboa',  text: 'A comunidade NorthWindy transformou a forma como encontro trabalho. Em 3 semanas recebi 5 propostas qualificadas.' },
  { name: 'Oceanus Charters', role: 'Empresa Parceira',    city: 'Cascais', text: 'O sistema de RH e financeiro poupou-nos horas de trabalho por semana. Altamente recomendado para qualquer empresa náutica.' },
  { name: 'Sofia A.',         role: 'Chef de Bordo',       city: 'Porto',   text: 'Finalmente uma plataforma pensada para nós. Os perfis verificados deram credibilidade ao meu trabalho.' },
];

const PHOTOS = [
  { src: 'https://images.unsplash.com/photo-1500514966906-fe245eea9344?w=900&auto=format&fit=crop&q=80', alt: 'Tripulantes a bordo',   label: 'Tripulantes',        span: 'col-span-7 row-span-2' },
  { src: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=700&auto=format&fit=crop&q=80', alt: 'Empresa náutica',       label: 'Empresas parceiras', span: 'col-span-5 row-span-1' },
  { src: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=700&auto=format&fit=crop&q=80',    alt: 'Evento náutico',        label: 'Eventos exclusivos', span: 'col-span-5 row-span-1' },
];

const PHOTOS_ROW2 = [
  { src: 'https://images.unsplash.com/photo-1471922694854-ff1b63b20054?w=500&auto=format&fit=crop&q=80', alt: 'Marina parceira',  label: 'Marinas parceiras' },
  { src: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&auto=format&fit=crop&q=80',    alt: 'Vida a bordo',     label: 'Vida a bordo'     },
  { src: 'https://images.unsplash.com/photo-1519895709485-40d04abeeae3?w=500&auto=format&fit=crop&q=80', alt: 'Passeios em grupo', label: 'Passeios em grupo' },
];

/* ─────────────────────────── icon map ────────────────────────────── */

function ServiceIcon({ k }: { k: string }) {
  const cls = 'w-5 h-5';
  switch (k) {
    case 'perfis':     return <Users         className={cls} />;
    case 'parceiros':  return <Search        className={cls} />;
    case 'passeios':   return <Ship          className={cls} />;
    case 'emprego':    return <Briefcase     className={cls} />;
    case 'barcos':     return <Anchor        className={cls} />;
    case 'eventos':    return <Calendar      className={cls} />;
    case 'forum':      return <MessageSquare className={cls} />;
    case 'financeiro': return <TrendingUp    className={cls} />;
    case 'rh':         return <UserCheck     className={cls} />;
    case 'seguros':    return <Shield        className={cls} />;
    case 'marinas':    return <MapPin        className={cls} />;
    case 'suporte':    return <Wrench        className={cls} />;
    default:           return <Anchor        className={cls} />;
  }
}

function FeatureIcon({ k }: { k: string }) {
  const cls = 'w-5 h-5';
  switch (k) {
    case 'tp1': return <FileText     className={cls} />;
    case 'tp2': return <Briefcase    className={cls} />;
    case 'tp3': return <Award        className={cls} />;
    case 'tp4': return <Globe        className={cls} />;
    case 'tp5': return <TrendingUp   className={cls} />;
    case 'tp6': return <Ship         className={cls} />;
    case 'tp7': return <MessageSquare className={cls} />;
    case 'em1': return <UserCheck    className={cls} />;
    case 'em2': return <Ship         className={cls} />;
    case 'em3': return <TrendingUp   className={cls} />;
    case 'em4': return <Users        className={cls} />;
    case 'em5': return <Calendar     className={cls} />;
    case 'em6': return <Anchor       className={cls} />;
    case 'em7': return <Globe        className={cls} />;
    default:    return <Star         className={cls} />;
  }
}

function PartnerIcon({ label }: { label: string }) {
  const cls = 'w-4 h-4';
  switch (label) {
    case 'Marinas':  return <MapPin   className={cls} />;
    case 'Seguros':  return <Shield   className={cls} />;
    case 'Suporte':  return <Wrench   className={cls} />;
    default:         return <Star     className={cls} />;
  }
}

/* ─────────────────────────── component ───────────────────────────── */

export function ComunidadePage({
  onBack, onSailorLogin, onCompanyLogin,
  onSailorReg, onCompanyReg, onAdminClick,
}: ComunidadePageProps) {

  const navigate       = useNavigate();
  const [scrolled,     setScrolled]     = useState(false);
  const [menuOpen,     setMenuOpen]     = useState(false);
  const [activeRole,   setActiveRole]   = useState<'tripulante' | 'empresa'>('tripulante');
  const accessRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = 'Comunidade | NorthWindy Charters';
    return () => { document.title = 'NorthWindy Charters'; };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // "Acesse" opens the sailor/company selection — reuse adminPortal via onSailorLogin
  // We'll show a floating panel anchored to the button using a portal-free approach
  const [accessOpen, setAccessOpen] = useState(false);

  function handleAccessClick() { setAccessOpen(v => !v); }

  // Close dropdown on outside click
  useEffect(() => {
    if (!accessOpen) return;
    function handler(e: MouseEvent) {
      if (accessRef.current && !accessRef.current.contains(e.target as Node)) {
        setAccessOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [accessOpen]);

  const navWhite = !scrolled;

  return (
    <div className="min-h-screen bg-white font-body">
      <style>{`
        * { scrollbar-width: none; -ms-overflow-style: none; } *::-webkit-scrollbar { display: none; }
        @keyframes gold-shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        .gold-shimmer {
          background: linear-gradient(90deg,
            #a07830 0%,
            #c9a96e 25%,
            #f5e0a8 50%,
            #c9a96e 75%,
            #a07830 100%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: gold-shimmer 3.5s linear infinite;
        }
      `}</style>

      {/* ── Access dropdown overlay (anchored to Acesse button) ─── */}
      {accessOpen && (
        <div ref={accessRef} className="fixed top-14 right-4 md:right-6 z-[200] w-56 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden">
          <div className="px-4 pt-3 pb-2 border-b border-gray-50">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Acesso exclusivo</p>
          </div>
          <button
            onClick={() => { setAccessOpen(false); onSailorLogin(); }}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors text-left cursor-pointer">
            <div className="w-8 h-8 bg-[#0B1F3A] rounded-xl flex items-center justify-center flex-shrink-0">
              <Anchor className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <p className="font-black text-blue-900 text-xs">Tripulante</p>
              <p className="text-gray-400 text-[10px] font-bold">Entrar na minha conta</p>
            </div>
          </button>
          <button
            onClick={() => { setAccessOpen(false); onCompanyLogin(); }}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-amber-50 transition-colors text-left border-t border-gray-50 cursor-pointer">
            <div className="w-8 h-8 bg-amber-400 rounded-xl flex items-center justify-center flex-shrink-0">
              <Briefcase className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <p className="font-black text-blue-900 text-xs">Empresa</p>
              <p className="text-gray-400 text-[10px] font-bold">Entrar na minha conta</p>
            </div>
          </button>
        </div>
      )}

      {/* ── Navbar ─────────────────────────────────────────────── */}
      <HeroNavbar
        scrolled={scrolled}
        navWhite={navWhite}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        navigate={navigate}
        onOpenAccess={handleAccessClick}
        onOpenAbout={onBack}
      />

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#0B1F3A] text-white pt-14">

        {/* ── Tab Switcher (inline, não fixo) ── */}
        <div className="relative z-30 flex justify-center pt-3 md:pt-4 pb-1">
          <div className="flex rounded-full p-1 bg-white/10 backdrop-blur-md border border-white/15">
            <button
              onClick={() => navigate('/')}
              className="relative flex items-center gap-2 px-5 md:px-7 py-2 md:py-2.5 rounded-full font-heading font-semibold text-xs md:text-sm uppercase tracking-wide transition-all duration-300 text-white/60 hover:text-white/90">
              <Sun className="w-3.5 h-3.5 md:w-4 md:h-4" />
              Passageiros
            </button>
            <button
              className="relative flex items-center gap-2 px-5 md:px-7 py-2 md:py-2.5 rounded-full font-heading font-semibold text-xs md:text-sm uppercase tracking-wide transition-all duration-300 bg-gradient-to-r from-blue-900 to-blue-700 text-white shadow-lg shadow-blue-900/40 scale-105 cursor-default">
              <Briefcase className="w-3.5 h-3.5 md:w-4 md:h-4" />
              Comunidade
            </button>
          </div>
        </div>

        {/* Grid texture */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 0,transparent 60px),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 0,transparent 60px)' }}
        />
        {/* Glow blobs */}
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />

        <div className="relative max-w-5xl mx-auto px-6 md:px-8 pt-20 pb-24 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full mb-8">
            <Anchor className="w-3 h-3 text-blue-300" />
            <span className="text-blue-300/80 text-[11px] font-semibold tracking-widest uppercase">
              Tripulantes &amp; Empresas Náuticas
            </span>
          </div>

          <h1 className="font-['Playfair_Display'] font-bold text-[32px] md:text-[44px] lg:text-[52px] leading-[1.2] mb-5">
            Faça parte da{' '}
            <span className="gold-shimmer">
              comunidade
            </span>
          </h1>
          <p className="font-body text-blue-200/60 text-sm md:text-base font-normal leading-relaxed max-w-xl mx-auto mb-12">
            A plataforma que une tripulantes e empresas náuticas — com ferramentas profissionais,
            rede de parceiros e uma comunidade activa que cresce todos os dias.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-2xl mx-auto mb-14">
            {STATS.map(s => (
              <div key={s.label} className="text-center">
                <p className="font-heading font-semibold text-2xl md:text-3xl text-white">{s.value}</p>
                <p className="font-body text-blue-300/50 text-[10px] font-medium uppercase tracking-widest mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Hero CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onSailorLogin}
              className="group flex items-center gap-3 bg-white hover:bg-blue-50 text-[#0B1F3A] px-7 py-3.5 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-black/15 hover:scale-[1.03]">
              <div className="w-7 h-7 bg-[#0B1F3A] rounded-lg flex items-center justify-center group-hover:bg-blue-900 transition-all">
                <Anchor className="w-3.5 h-3.5 text-white" />
              </div>
              Entrar como Tripulante
              <ArrowRight className="w-4 h-4 opacity-40 group-hover:opacity-80 group-hover:translate-x-0.5 transition-all" />
            </button>
            <button
              onClick={onCompanyLogin}
              className="group flex items-center gap-3 bg-white/10 hover:bg-white/15 text-white border border-white/15 px-7 py-3.5 rounded-xl font-semibold text-sm transition-all hover:scale-[1.03] backdrop-blur-sm">
              <div className="w-7 h-7 bg-white/15 rounded-lg flex items-center justify-center">
                <Briefcase className="w-3.5 h-3.5 text-white" />
              </div>
              Entrar como Empresa
              <ArrowRight className="w-4 h-4 opacity-40 group-hover:opacity-80 group-hover:translate-x-0.5 transition-all" />
            </button>
          </div>

          {/* Scroll hint */}
          <div className="flex flex-col items-center gap-2 mt-16 text-blue-200/30">
            <span className="font-body text-[10px] font-medium uppercase tracking-widest">Descubra o que oferecemos</span>
            <ChevronDown className="w-4 h-4 animate-bounce" />
          </div>
        </div>
      </section>

      {/* ── Photo Gallery ──────────────────────────────────────── */}
      <section className="py-20 px-6 md:px-8 bg-white overflow-hidden">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="font-body text-[#c9a96e] text-[10px] font-semibold uppercase tracking-[0.15em]">A nossa gente</span>
            <h2 className="font-['Playfair_Display'] font-bold text-[28px] md:text-[38px] text-[#0B1F3A] mt-2 mb-4 leading-snug">
              Viver o mar em comunidade
            </h2>
            <p className="font-body text-gray-500 font-normal max-w-xl mx-auto text-sm leading-relaxed">
              Tripulantes experientes, empresas de referência e parceiros de confiança —
              todos unidos pela mesma paixão.
            </p>
          </div>

          {/* Main mosaic */}
          <div className="grid grid-cols-12 grid-rows-2 gap-3" style={{ height: '520px' }}>
            {PHOTOS.map(p => (
              <div key={p.alt} className={`${p.span} rounded-3xl overflow-hidden relative group cursor-default`}>
                <img
                  src={p.src}
                  alt={p.alt}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F3A]/70 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <span className="font-body inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm border border-white/25 text-white text-[9px] font-medium uppercase tracking-widest px-2.5 py-1 rounded-full">
                    <Anchor className="w-2.5 h-2.5" /> {p.label}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Second row */}
          <div className="grid grid-cols-3 gap-3 mt-3" style={{ height: '200px' }}>
            {PHOTOS_ROW2.map(p => (
              <div key={p.alt} className="rounded-3xl overflow-hidden relative group cursor-default">
                <img
                  src={p.src}
                  alt={p.alt}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F3A]/70 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3">
                  <p className="font-body text-white font-semibold text-xs">{p.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── All Services ───────────────────────────────────────── */}
      <section className="py-20 px-6 md:px-8 bg-gray-50/60">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="font-body text-[#c9a96e] text-[10px] font-semibold uppercase tracking-[0.15em]">Plataforma completa</span>
            <h2 className="font-['Playfair_Display'] font-bold text-[28px] md:text-[38px] text-[#0B1F3A] mt-2 mb-4 leading-snug">
              Tudo o que precisa,<br />num só lugar
            </h2>
            <p className="font-body text-gray-500 font-normal max-w-xl mx-auto">
              Um ecossistema completo para profissionais e empresas do sector náutico.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SERVICES.map(s => (
              <div key={s.key}
                className="group flex gap-4 bg-white border-2 border-gray-100 hover:border-blue-100 hover:bg-blue-50/30 rounded-2xl p-5 transition-all duration-200">
                <div className="w-10 h-10 flex-shrink-0 rounded-xl bg-[#0B1F3A]/5 group-hover:bg-[#0B1F3A] flex items-center justify-center text-[#0B1F3A] group-hover:text-white transition-all duration-200">
                  <ServiceIcon k={s.key} />
                </div>
                <div>
                  <p className="font-heading font-semibold text-[#0B1F3A] text-sm mb-1">{s.label}</p>
                  <p className="font-body text-gray-500 text-xs font-normal leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Role Toggle ────────────────────────────────────────── */}
      <section className="py-20 px-6 md:px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="font-body text-[#c9a96e] text-[10px] font-semibold uppercase tracking-[0.15em]">Área exclusiva</span>
            <h2 className="font-['Playfair_Display'] font-bold text-[28px] md:text-[38px] text-[#0B1F3A] mt-2 leading-snug">
              O que inclui a sua conta
            </h2>
          </div>

          {/* Toggle */}
          <div className="flex justify-center mb-10">
            <div className="flex gap-1 p-1 bg-[#0B1F3A]/8 rounded-2xl">
              <button
                onClick={() => setActiveRole('tripulante')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-heading font-semibold text-sm transition-all ${activeRole === 'tripulante' ? 'bg-[#0B1F3A] text-white shadow-lg' : 'text-[#0B1F3A]/60 hover:text-[#0B1F3A]'}`}>
                <Anchor className="w-4 h-4" /> Tripulante
              </button>
              <button
                onClick={() => setActiveRole('empresa')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-heading font-semibold text-sm transition-all ${activeRole === 'empresa' ? 'bg-amber-400 text-[#0B1F3A] shadow-lg' : 'text-[#0B1F3A]/60 hover:text-[#0B1F3A]'}`}>
                <Briefcase className="w-4 h-4" /> Empresa
              </button>
            </div>
          </div>

          {/* Feature grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(activeRole === 'tripulante' ? TRIPULANTE_FEATURES : EMPRESA_FEATURES).map(f => (
              <div key={f.key}
                className={`flex gap-4 rounded-2xl p-5 border-2 transition-all ${activeRole === 'tripulante' ? 'bg-white border-blue-100 hover:border-blue-200' : 'bg-white border-amber-100 hover:border-amber-200'}`}>
                <div className={`w-10 h-10 flex-shrink-0 rounded-xl flex items-center justify-center ${activeRole === 'tripulante' ? 'bg-[#0B1F3A] text-white' : 'bg-amber-400 text-[#0B1F3A]'}`}>
                  <FeatureIcon k={f.key} />
                </div>
                <div>
                  <p className="font-heading font-semibold text-[#0B1F3A] text-sm mb-1">{f.label}</p>
                  <p className="font-body text-gray-500 text-xs font-normal leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <button
              onClick={activeRole === 'tripulante' ? onSailorLogin : onCompanyLogin}
              className={`inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-heading font-semibold text-sm transition-all hover:scale-[1.03] shadow-lg ${activeRole === 'tripulante' ? 'bg-[#0B1F3A] text-white hover:bg-[#0d2647] shadow-blue-900/20' : 'bg-amber-400 text-[#0B1F3A] hover:bg-amber-300 shadow-amber-400/30'}`}>
              <ArrowRight className="w-4 h-4" />
              {activeRole === 'tripulante' ? 'Aceder a Area de Tripulante' : 'Aceder a Area de Empresa'}
            </button>
          </div>
        </div>
      </section>

      {/* ── Partner Network + Forum ─────────────────────────────── */}
      <section className="py-20 px-6 md:px-8 bg-[#0B1F3A] text-white relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 40px)' }}
        />
        <div className="relative max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="font-body text-[#c9a96e] text-[10px] font-semibold uppercase tracking-[0.15em]">Rede de parceiros</span>
            <h2 className="font-['Playfair_Display'] font-bold text-[28px] md:text-[38px] mt-2 mb-4 leading-snug">
              Encontre quem precisa,{' '}
              <span className="gold-shimmer">
                rapidamente
              </span>
            </h2>
            <p className="font-body text-blue-200/60 font-normal max-w-xl mx-auto">
              Acesso exclusivo a uma rede curada de parceiros verificados em todo o territorio.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14">
            {PARTNER_CATS.map(p => (
              <div key={p.label}
                className="group bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-400/30 rounded-2xl p-6 text-center transition-all duration-200">
                <div className={`w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center text-white`}>
                  <PartnerIcon label={p.label} />
                </div>
                <p className="font-heading font-semibold text-white text-sm">{p.label}</p>
                <p className="font-body text-blue-200/50 text-xs font-normal mt-1">{p.count}</p>
              </div>
            ))}
          </div>

          {/* Forum teaser */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-10">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="w-14 h-14 bg-amber-400/20 border border-amber-400/30 rounded-2xl flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-6 h-6 text-amber-400" />
              </div>
              <div className="flex-1">
                <p className="font-heading font-semibold text-lg mb-2">Fórum da Comunidade</p>
                <p className="font-body text-blue-200/60 font-normal text-sm leading-relaxed">
                  Debate rotas, partilhe dicas de seguranca, discuta regulamentos e conecte-se com outros profissionais do mar.
                  Um espaco exclusivo para membros verificados.
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {['Rotas e destinos', 'Seguranca a bordo', 'Equipamentos', 'Regulamentacao', 'Eventos'].map(tag => (
                    <span key={tag} className="font-body text-[10px] font-medium uppercase tracking-wider bg-white/10 border border-white/15 px-3 py-1 rounded-full text-blue-200">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={onSailorLogin}
                className="flex-shrink-0 flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-[#0B1F3A] px-5 py-3 rounded-xl font-heading font-semibold text-xs transition-all">
                Aceder <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ───────────────────────────────────────── */}
      <section className="py-20 px-6 md:px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="font-body text-[#c9a96e] text-[10px] font-semibold uppercase tracking-[0.15em]">Testemunhos</span>
            <h2 className="font-['Playfair_Display'] font-bold text-[28px] md:text-[38px] text-[#0B1F3A] mt-2 leading-snug">
              Quem já faz parte
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(t => (
              <div key={t.name}
                className="border-2 border-gray-100 hover:border-blue-100 rounded-3xl p-7 transition-all hover:shadow-lg hover:shadow-blue-900/5">
                <div className="flex gap-0.5 mb-5">
                  {[0,1,2,3,4].map(i => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="font-body text-gray-600 text-sm font-normal leading-relaxed mb-6 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#0B1F3A] rounded-full flex items-center justify-center text-white font-heading font-semibold text-sm flex-shrink-0">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="font-heading font-semibold text-[#0B1F3A] text-sm">{t.name}</p>
                    <p className="font-body text-gray-400 text-xs font-normal">{t.role} · {t.city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA: Crie a sua conta ───────────────────────────────── */}
      <section className="py-24 px-6 md:px-8 bg-gradient-to-br from-[#0B1F3A] to-[#0d2a50] text-white relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle,#fff 1px,transparent 1px)', backgroundSize: '32px 32px' }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />
        <div className="relative max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/30 px-4 py-1.5 rounded-full mb-8">
            <Waves className="w-3 h-3 text-amber-400" />
            <span className="font-body text-amber-300 text-[10px] font-medium uppercase tracking-widest">Novo membro</span>
          </div>
          <h2 className="font-heading font-semibold text-[28px] md:text-[42px] leading-snug mb-4">
            Crie a sua conta agora
          </h2>
          <p className="font-body text-blue-200/60 font-normal mb-12 text-base leading-relaxed">
            Junte-se a centenas de profissionais e empresas que ja fazem parte da maior
            comunidade nautica profissional de Portugal.
          </p>

          {/* Register buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <button
              onClick={onSailorReg}
              className="group w-full sm:w-auto flex items-center justify-center gap-3 bg-white hover:bg-blue-50 text-[#0B1F3A] px-8 py-4 rounded-2xl font-heading font-semibold text-sm transition-all hover:scale-[1.03] shadow-xl shadow-black/20">
              <UserPlus className="w-4 h-4" />
              Registar como Tripulante
            </button>
            <button
              onClick={onCompanyReg}
              className="group w-full sm:w-auto flex items-center justify-center gap-3 bg-amber-400 hover:bg-amber-300 text-[#0B1F3A] px-8 py-4 rounded-2xl font-heading font-semibold text-sm transition-all hover:scale-[1.03] shadow-xl shadow-amber-500/20">
              <Building2 className="w-4 h-4" />
              Registar como Empresa
            </button>
          </div>

          {/* Already have an account */}
          <p className="font-body text-blue-200/40 text-sm font-normal">
            Já tem conta?{' '}
            <button onClick={onSailorLogin} className="text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-2 transition-colors">
              Entrar como Tripulante
            </button>
            {' '}ou{' '}
            <button onClick={onCompanyLogin} className="text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-2 transition-colors">
              Empresa
            </button>
          </p>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <SiteFooter onAdminClick={onAdminClick} />
    </div>
  );
}
