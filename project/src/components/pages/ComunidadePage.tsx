// src/components/pages/ComunidadePage.tsx
import { useEffect, useState } from 'react';
import {
  ArrowLeft, Anchor, Users, Ship, Briefcase, MapPin, Shield,
  MessageSquare, Calendar, TrendingUp, UserCheck, Star,
  ArrowRight, LogIn, ChevronDown, Waves, Search, Wrench,
  FileText, Award, Globe
} from 'lucide-react';
import { LOGO_SRC } from '../../assets';

interface ComunidadePageProps {
  onBack: () => void;
  onSailorLogin: () => void;
  onCompanyLogin: () => void;
}

export function ComunidadePage({ onBack, onSailorLogin, onCompanyLogin }: ComunidadePageProps) {
  useEffect(() => {
    document.title = 'Comunidade | NorthWindy Charters';
    return () => { document.title = 'NorthWindy Charters'; };
  }, []);

  const [activeRole, setActiveRole] = useState<'tripulante' | 'empresa'>('tripulante');

  const stats = [
    { value: '320+', label: 'Tripulantes activos' },
    { value: '85+',  label: 'Empresas parceiras' },
    { value: '12',   label: 'Portos e marinas' },
    { value: '100%', label: 'Verificados' },
  ];

  const allServices = [
    { icon: <Users className="w-5 h-5" />,        title: 'Perfis verificados',         desc: 'Tripulantes e empresas com credenciais autenticadas pela equipa NorthWindy.' },
    { icon: <Search className="w-5 h-5" />,        title: 'Localização de parceiros',   desc: 'Encontre marinas, seguradoras, prestadores de suporte e serviços náuticos.' },
    { icon: <Ship className="w-5 h-5" />,          title: 'Catálogo de passeios',       desc: 'Oferta de passeios exclusivos disponibilizados diretamente pelas empresas.' },
    { icon: <Briefcase className="w-5 h-5" />,     title: 'Mercado de trabalho',        desc: 'Ofertas e procura de trabalho a bordo publicadas no catálogo da comunidade.' },
    { icon: <Anchor className="w-5 h-5" />,        title: 'Compra e venda de barcos',   desc: 'Anúncios de embarcações verificadas disponíveis para aquisição.' },
    { icon: <Calendar className="w-5 h-5" />,      title: 'Eventos exclusivos',         desc: 'Acesso prioritário a eventos, regatas e encontros náuticos da comunidade.' },
    { icon: <MessageSquare className="w-5 h-5" />, title: 'Fórum náutico',              desc: 'Debate rotas, equipamentos, regulamentos e dicas com outros profissionais.' },
    { icon: <TrendingUp className="w-5 h-5" />,    title: 'Painel financeiro',          desc: 'Controlo das suas operações, receitas e despesas num único painel.' },
    { icon: <UserCheck className="w-5 h-5" />,     title: 'Sistema de RH',              desc: 'Gestão de equipas, turnos, férias e documentação dos tripulantes.' },
    { icon: <Shield className="w-5 h-5" />,        title: 'Seguradoras parceiras',      desc: 'Acesso directo às melhores apólices marítimas negociadas para membros.' },
    { icon: <MapPin className="w-5 h-5" />,        title: 'Rede de marinas',            desc: 'Parcerias com marinas em todo o território para facilitar operações.' },
    { icon: <Wrench className="w-5 h-5" />,        title: 'Suporte técnico',            desc: 'Acesso a prestadores de manutenção e reparação certificados.' },
  ];

  const tripulanteFeatures = [
    { icon: <FileText className="w-5 h-5" />,  title: 'Perfil profissional',    desc: 'Mostre as suas certificações, experiência e disponibilidade.' },
    { icon: <Briefcase className="w-5 h-5" />, title: 'Ofertas de emprego',     desc: 'Receba propostas das melhores empresas náuticas.' },
    { icon: <Award className="w-5 h-5" />,     title: 'Certificações STCW',     desc: 'Gestão centralizada dos seus documentos e validades.' },
    { icon: <Globe className="w-5 h-5" />,     title: 'Rotas internacionais',   desc: 'Acesso a missões nacionais e internacionais.' },
    { icon: <TrendingUp className="w-5 h-5" />,title: 'Controlo financeiro',    desc: 'Registo de taxas, recibos e histórico de serviços.' },
    { icon: <Ship className="w-5 h-5" />,      title: 'Gestão de frota própria', desc: 'Gira as suas embarcações mesmo sem ser empresa — registe, controle e alugue.' },
    { icon: <MessageSquare className="w-5 h-5" />, title: 'Comunidade activa', desc: 'Fórum, eventos e rede de contactos profissionais.' },
  ];

  const empresaFeatures = [
    { icon: <UserCheck className="w-5 h-5" />, title: 'Sistema de RH',          desc: 'Gestão completa da sua equipa a bordo.' },
    { icon: <Ship className="w-5 h-5" />,      title: 'Gestão de frota',        desc: 'Registo e controlo de todas as embarcações.' },
    { icon: <TrendingUp className="w-5 h-5" />,title: 'Painel financeiro',      desc: 'Controlo de reservas, receitas e comissões.' },
    { icon: <Users className="w-5 h-5" />,     title: 'Recrutamento',           desc: 'Publique vagas e encontre tripulantes verificados.' },
    { icon: <Calendar className="w-5 h-5" />,  title: 'Gestão de eventos',      desc: 'Organize e venda bilhetes para eventos exclusivos.' },
    { icon: <Anchor className="w-5 h-5" />,    title: 'Catálogo de passeios',   desc: 'Publique e gira os seus passeios no marketplace.' },
  ];

  const partners = [
    { category: 'Marinas', icon: <MapPin className="w-4 h-4" />,    count: '12 parceiros', color: 'from-blue-600 to-blue-800' },
    { category: 'Seguros', icon: <Shield className="w-4 h-4" />,    count: '8 parceiros',  color: 'from-slate-600 to-slate-800' },
    { category: 'Suporte', icon: <Wrench className="w-4 h-4" />,    count: '24 parceiros', color: 'from-cyan-700 to-cyan-900' },
    { category: 'Serviços',icon: <Star className="w-4 h-4" />,      count: '41 parceiros', color: 'from-amber-700 to-amber-900' },
  ];

  const testimonials = [
    { name: 'Ricardo M.', role: 'Patrão de Alto Mar', text: 'A comunidade NorthWindy transformou a forma como encontro trabalho. Em 3 semanas recebi 5 propostas qualificadas.', city: 'Lisboa' },
    { name: 'Oceanus Charters', role: 'Empresa Parceira', text: 'O sistema de RH e financeiro poupou-nos horas de trabalho por semana. Altamente recomendado para qualquer empresa náutica.', city: 'Cascais' },
    { name: 'Sofia A.', role: 'Chef de Bordo', text: 'Finalmente uma plataforma pensada para nós. Os perfis verificados deram credibilidade ao meu trabalho.', city: 'Porto' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <style>{`
        * { scrollbar-width: none; -ms-overflow-style: none; }
        *::-webkit-scrollbar { display: none; }
      `}</style>

      {/* ── Header ─────────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-[#0B1F3A]/95 backdrop-blur-md border-b border-white/10 px-6 md:px-16 py-3 flex items-center justify-between">
        <button onClick={onBack}
          className="flex items-center gap-2 text-blue-200 hover:text-white font-black uppercase text-xs tracking-widest transition-all hover:gap-3">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>
        <img src={LOGO_SRC} alt="NorthWindy" style={{ height: '96px', width: 'auto', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
        <div className="flex items-center gap-2">
          <button onClick={onSailorLogin}
            className="hidden sm:flex items-center gap-1.5 text-blue-200 hover:text-white border border-white/20 hover:border-white/40 px-3 py-1.5 rounded-full font-black text-[10px] uppercase tracking-wider transition-all">
            <LogIn className="w-3 h-3" /> Tripulante
          </button>
          <button onClick={onCompanyLogin}
            className="hidden sm:flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-white px-3 py-1.5 rounded-full font-black text-[10px] uppercase tracking-wider transition-all">
            <Briefcase className="w-3 h-3" /> Empresa
          </button>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#0B1F3A] text-white">
        {/* Decorative grid */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 0,transparent 60px),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 0,transparent 60px)' }} />
        {/* Gradient accent */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-6 md:px-8 pt-20 pb-24 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/30 px-4 py-1.5 rounded-full mb-8">
            <Anchor className="w-3 h-3 text-amber-400" />
            <span className="text-amber-300 text-[10px] font-black uppercase tracking-widest">Acesso exclusivo · Tripulantes &amp; Empresas</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase leading-none tracking-tight mb-6">
            Faça parte da{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-300">
              comunidade
            </span>
          </h1>
          <p className="text-blue-200/70 text-base md:text-lg font-medium leading-relaxed max-w-2xl mx-auto mb-12">
            A plataforma que une tripulantes e empresas náuticas — com ferramentas profissionais,
            rede de parceiros e uma comunidade activa que cresce todos os dias.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-2xl mx-auto mb-14">
            {stats.map((s, i) => (
              <div key={i} className="text-center">
                <p className="text-2xl md:text-3xl font-black text-amber-300">{s.value}</p>
                <p className="text-blue-200/60 text-[11px] font-bold uppercase tracking-wider mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Login CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={onSailorLogin}
              className="group flex items-center gap-3 bg-white hover:bg-blue-50 text-[#0B1F3A] px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-wide transition-all shadow-2xl shadow-black/20 hover:shadow-white/10 hover:scale-105">
              <div className="w-8 h-8 bg-[#0B1F3A] rounded-[10px] flex items-center justify-center group-hover:bg-blue-900 transition-all">
                <Anchor className="w-4 h-4 text-white" />
              </div>
              Entrar como Tripulante
              <ArrowRight className="w-4 h-4 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </button>
            <button onClick={onCompanyLogin}
              className="group flex items-center gap-3 bg-amber-400 hover:bg-amber-300 text-[#0B1F3A] px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-wide transition-all shadow-2xl shadow-amber-500/20 hover:scale-105">
              <div className="w-8 h-8 bg-[#0B1F3A]/20 rounded-[10px] flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-[#0B1F3A]" />
              </div>
              Entrar como Empresa
              <ArrowRight className="w-4 h-4 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </button>
          </div>

          {/* Scroll hint */}
          <div className="flex flex-col items-center gap-2 mt-16 text-blue-200/30">
            <span className="text-[10px] font-black uppercase tracking-widest">Descubra o que oferecemos</span>
            <ChevronDown className="w-4 h-4 animate-bounce" />
          </div>
        </div>
      </section>

      {/* ── All Services Grid ──────────────────────────────────────────────────── */}
      <section className="py-20 px-6 md:px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-amber-500 text-[10px] font-black uppercase tracking-widest">Plataforma completa</span>
            <h2 className="text-2xl md:text-4xl font-black text-[#0B1F3A] uppercase mt-2 mb-4 leading-tight">
              Tudo o que precisa,<br />num só lugar
            </h2>
            <p className="text-gray-500 font-medium max-w-xl mx-auto">
              Uma ecosistema completo para profissionais e empresas do sector náutico.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {allServices.map((s, i) => (
              <div key={i}
                className="group flex gap-4 bg-white border-2 border-gray-100 hover:border-blue-100 hover:bg-blue-50/30 rounded-2xl p-5 transition-all duration-200">
                <div className="w-10 h-10 flex-shrink-0 rounded-xl bg-[#0B1F3A]/5 group-hover:bg-[#0B1F3A] flex items-center justify-center text-[#0B1F3A] group-hover:text-white transition-all duration-200">
                  {s.icon}
                </div>
                <div>
                  <p className="font-black text-[#0B1F3A] text-sm mb-1">{s.title}</p>
                  <p className="text-gray-500 text-xs font-medium leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Role Switcher ──────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 md:px-8 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-amber-500 text-[10px] font-black uppercase tracking-widest">Área exclusiva</span>
            <h2 className="text-2xl md:text-4xl font-black text-[#0B1F3A] uppercase mt-2 leading-tight">
              O que inclui a sua conta
            </h2>
          </div>

          {/* Toggle */}
          <div className="flex items-center justify-center mb-10">
            <div className="flex gap-1 p-1 bg-[#0B1F3A]/10 rounded-2xl">
              <button
                onClick={() => setActiveRole('tripulante')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm uppercase tracking-wide transition-all ${activeRole === 'tripulante' ? 'bg-[#0B1F3A] text-white shadow-lg' : 'text-[#0B1F3A]/60 hover:text-[#0B1F3A]'}`}>
                <Anchor className="w-4 h-4" /> Tripulante
              </button>
              <button
                onClick={() => setActiveRole('empresa')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm uppercase tracking-wide transition-all ${activeRole === 'empresa' ? 'bg-amber-400 text-[#0B1F3A] shadow-lg' : 'text-[#0B1F3A]/60 hover:text-[#0B1F3A]'}`}>
                <Briefcase className="w-4 h-4" /> Empresa
              </button>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(activeRole === 'tripulante' ? tripulanteFeatures : empresaFeatures).map((f, i) => (
              <div key={i}
                className={`flex gap-4 rounded-2xl p-5 border-2 transition-all ${activeRole === 'tripulante' ? 'bg-white border-blue-100 hover:border-blue-200' : 'bg-white border-amber-100 hover:border-amber-200'}`}>
                <div className={`w-10 h-10 flex-shrink-0 rounded-xl flex items-center justify-center ${activeRole === 'tripulante' ? 'bg-[#0B1F3A] text-white' : 'bg-amber-400 text-[#0B1F3A]'}`}>
                  {f.icon}
                </div>
                <div>
                  <p className="font-black text-[#0B1F3A] text-sm mb-1">{f.title}</p>
                  <p className="text-gray-500 text-xs font-medium leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA for role */}
          <div className="text-center mt-10">
            <button
              onClick={activeRole === 'tripulante' ? onSailorLogin : onCompanyLogin}
              className={`inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-wide transition-all hover:scale-105 shadow-lg ${activeRole === 'tripulante' ? 'bg-[#0B1F3A] text-white hover:bg-[#0d2647] shadow-blue-900/20' : 'bg-amber-400 text-[#0B1F3A] hover:bg-amber-300 shadow-amber-400/30'}`}>
              <LogIn className="w-4 h-4" />
              {activeRole === 'tripulante' ? 'Aceder à Área de Tripulante' : 'Aceder à Área de Empresa'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ── Partner Network ────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 md:px-8 bg-[#0B1F3A] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 40px)' }} />
        <div className="relative max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-amber-400 text-[10px] font-black uppercase tracking-widest">Rede de parceiros</span>
            <h2 className="text-2xl md:text-4xl font-black uppercase mt-2 mb-4 leading-tight">
              Encontre quem precisa,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500">rapidamente</span>
            </h2>
            <p className="text-blue-200/60 font-medium max-w-xl mx-auto">
              Acesso exclusivo a uma rede curada de parceiros verificados em todo o território.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {partners.map((p, i) => (
              <div key={i}
                className="group bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-400/30 rounded-2xl p-6 text-center transition-all duration-200 cursor-default">
                <div className={`w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center text-white`}>
                  {p.icon}
                </div>
                <p className="font-black text-white text-sm uppercase tracking-wide">{p.category}</p>
                <p className="text-blue-200/50 text-xs font-bold mt-1">{p.count}</p>
              </div>
            ))}
          </div>

          {/* Forum teaser */}
          <div className="mt-14 bg-white/5 border border-white/10 rounded-3xl p-8 md:p-10">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="w-14 h-14 bg-amber-400/20 border border-amber-400/30 rounded-2xl flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-6 h-6 text-amber-400" />
              </div>
              <div className="flex-1">
                <p className="font-black text-lg uppercase tracking-wide mb-2">Fórum da Comunidade</p>
                <p className="text-blue-200/60 font-medium text-sm leading-relaxed">
                  Debate rotas, partilhe dicas de segurança, discuta regulamentos e conecte-se com outros profissionais do mar. Um espaço exclusivo para membros verificados.
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {['Rotas e destinos', 'Segurança a bordo', 'Equipamentos', 'Regulamentação', 'Eventos'].map(tag => (
                    <span key={tag} className="text-[10px] font-black uppercase tracking-wider bg-white/10 border border-white/15 px-3 py-1 rounded-full text-blue-200">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <button onClick={onSailorLogin}
                className="flex-shrink-0 flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-[#0B1F3A] px-5 py-3 rounded-xl font-black text-xs uppercase tracking-wide transition-all">
                Aceder <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 md:px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-amber-500 text-[10px] font-black uppercase tracking-widest">Testemunhos</span>
            <h2 className="text-2xl md:text-4xl font-black text-[#0B1F3A] uppercase mt-2 leading-tight">
              Quem já faz parte
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i}
                className="border-2 border-gray-100 hover:border-blue-100 rounded-3xl p-7 transition-all group hover:shadow-lg hover:shadow-blue-900/5">
                <div className="flex gap-0.5 mb-5">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm font-medium leading-relaxed mb-6 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#0B1F3A] rounded-full flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="font-black text-[#0B1F3A] text-sm">{t.name}</p>
                    <p className="text-gray-400 text-xs font-bold">{t.role} · {t.city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 md:px-8 bg-gradient-to-br from-[#0B1F3A] to-[#0d2a50] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle,#fff 1px,transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />
        <div className="relative max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/30 px-4 py-1.5 rounded-full mb-8">
            <Waves className="w-3 h-3 text-amber-400" />
            <span className="text-amber-300 text-[10px] font-black uppercase tracking-widest">Junte-se a nós</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black uppercase leading-none mb-6">
            Pronto para fazer<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-400">parte do mar?</span>
          </h2>
          <p className="text-blue-200/60 font-medium mb-12 text-base leading-relaxed">
            Aceda ao seu painel exclusivo e ligue-se à maior comunidade náutica profissional de Portugal.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={onSailorLogin}
              className="group w-full sm:w-auto flex items-center justify-center gap-3 bg-white hover:bg-blue-50 text-[#0B1F3A] px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-wide transition-all hover:scale-105 shadow-2xl shadow-black/30">
              <Anchor className="w-4 h-4" />
              Entrar como Tripulante
            </button>
            <button onClick={onCompanyLogin}
              className="group w-full sm:w-auto flex items-center justify-center gap-3 bg-amber-400 hover:bg-amber-300 text-[#0B1F3A] px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-wide transition-all hover:scale-105 shadow-2xl shadow-amber-500/30">
              <Briefcase className="w-4 h-4" />
              Entrar como Empresa
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 text-center text-xs text-gray-400 font-bold uppercase tracking-widest">
        © {new Date().getFullYear()} NorthWindy Charters · Todos os direitos reservados
      </footer>
    </div>
  );
}
