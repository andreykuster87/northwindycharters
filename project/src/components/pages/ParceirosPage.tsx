// src/components/ParceirosPage.tsx
import { useEffect } from 'react';
import { ArrowLeft, Handshake, BarChart3, Globe, Anchor, ChevronRight, Lock } from 'lucide-react';
import { LOGO_SRC } from '../../assets';

interface ParceirosPageProps {
  onBack: () => void;
  onOpenAccess?: () => void;
  onCompanyReg?: () => void;
}

export function ParceirosPage({ onBack, onOpenAccess, onCompanyReg }: ParceirosPageProps) {
  useEffect(() => {
    document.title = 'Parceiros | NorthWindy Charters';
    return () => { document.title = 'NorthWindy Charters'; };
  }, []);

  const benefits = [
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: 'Visibilidade garantida',
      desc: 'A sua marca é apresentada a milhares de clientes apaixonados por náutica, todos os meses.',
    },
    {
      icon: <Handshake className="w-6 h-6" />,
      title: 'Parceria estratégica',
      desc: 'Planos flexíveis adaptados ao perfil e dimensão do seu negócio — marinas, fornecedores, escolas náuticas e mais.',
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: 'Alcance internacional',
      desc: 'Presença em múltiplos mercados europeus com uma plataforma totalmente bilingue.',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <style>{`
        * { scrollbar-width: none; -ms-overflow-style: none; }
        *::-webkit-scrollbar { display: none; }
        @keyframes parceiros-gold-shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        .parceiros-gold {
          background: linear-gradient(90deg,
            #a07830 0%, #c9a96e 25%, #f5e0a8 50%, #c9a96e 75%, #a07830 100%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: parceiros-gold-shimmer 3.5s linear infinite;
        }
      `}</style>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 px-6 md:px-16 py-4 flex items-center justify-between">
        <button onClick={onBack}
          className="flex items-center gap-2 text-[#1a2b4a] font-medium text-sm tracking-wide hover:gap-3 transition-all">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>
        <img src={LOGO_SRC} alt="NorthWindy" style={{ height: '112px', width: 'auto', objectFit: 'contain' }} />
        <div className="w-20" />
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-[#0a1628] text-white px-6 md:px-16 py-24 md:py-32 text-center">
        {/* grid texture */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 0,transparent 60px),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 0,transparent 60px)' }} />
        {/* glow */}
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-[#c9a96e]/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a96e]/40 to-transparent" />

        <div className="relative max-w-3xl mx-auto">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#c9a96e] mb-6">
            Parcerias · NorthWindy Charters
          </p>
          <h1 className="font-['Playfair_Display'] font-bold italic text-4xl md:text-5xl lg:text-6xl leading-[1.15] mb-6">
            Cresça <span className="parceiros-gold">connosco</span>
          </h1>
          <p className="text-white/60 text-base font-medium max-w-xl mx-auto leading-relaxed">
            Junte-se ao ecossistema NorthWindy e alcance quem verdadeiramente ama o mar.
          </p>
          <div className="flex items-center justify-center gap-4 mt-8">
            <div className="w-12 h-px bg-[#c9a96e]" />
            <div className="w-12 h-px bg-[#c9a96e]" />
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="max-w-5xl mx-auto px-6 md:px-8 py-20">
        <div className="text-center mb-12">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#c9a96e] mb-3">VANTAGENS</p>
          <h2 className="font-['Playfair_Display'] font-bold text-[#1a2b4a] text-3xl md:text-4xl mb-4">
            Por que ser parceiro?
          </h2>
          <div className="flex items-center justify-center gap-3">
            <div className="w-8 h-px bg-[#c9a96e]" />
            <div className="w-8 h-px bg-[#c9a96e]" />
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {benefits.map((b, i) => (
            <div key={i} className="group bg-white overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
              <div className="p-8">
                <div className="bg-gray-50 group-hover:bg-[#c9a96e] w-12 h-12 flex items-center justify-center text-[#1a2b4a] group-hover:text-white transition-all duration-300 mb-6">
                  {b.icon}
                </div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#c9a96e] mb-2">Benefício</p>
                <h3 className="font-['Playfair_Display'] font-bold text-[#1a2b4a] text-lg mb-3">{b.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed font-medium">{b.desc}</p>
                <div className="mt-5 pt-4 border-t border-gray-100">
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-[#c9a96e] flex items-center gap-1">
                    Saber mais <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative bg-[#0a1628] px-6 md:px-16 py-20 text-center overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 0,transparent 60px),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 0,transparent 60px)' }} />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a96e]/40 to-transparent" />
        <div className="relative max-w-xl mx-auto">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#c9a96e] mb-4">CONTACTO</p>
          <h2 className="font-['Playfair_Display'] font-bold italic text-white text-3xl md:text-4xl mb-4">Interessado?</h2>
          <div className="w-8 h-px bg-[#c9a96e] mx-auto mb-6" />
          <p className="text-white/50 font-medium mb-8 text-sm leading-relaxed">
            Entre em contacto com a nossa equipa e descubra o plano de parceria ideal para o seu negócio.
          </p>
          <a href="mailto:parcerias@northwindy.com"
            className="inline-flex items-center gap-2 border border-[#c9a96e] text-[#c9a96e] hover:bg-[#c9a96e] hover:text-[#0a1628] px-8 py-4 font-semibold uppercase text-xs tracking-widest transition-all">
            Falar com a equipa <ChevronRight className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* ── Acesso Empresa ── */}
      <section className="max-w-sm mx-auto px-6 py-16">
        <div className="bg-white overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
          {/* gold top line */}
          <div className="h-px bg-gradient-to-r from-[#c9a96e]/40 via-[#c9a96e] to-[#c9a96e]/40" />

          {/* Header */}
          <div className="relative bg-[#0a1628] px-8 pt-10 pb-10 text-center overflow-hidden">
            <div className="absolute inset-0 opacity-[0.04]"
              style={{ backgroundImage: 'repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 0,transparent 60px),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 0,transparent 60px)' }} />
            <p className="relative text-[10px] font-semibold uppercase tracking-[0.2em] text-[#c9a96e] mb-2">Área Exclusiva</p>
            <h3 className="relative font-['Playfair_Display'] font-bold italic text-white text-2xl">
              Acesso Empresa
            </h3>
            <div className="mt-3 flex justify-center">
              <div className="h-px w-12 bg-[#c9a96e]/60" />
            </div>
          </div>

          {/* Body */}
          <div className="px-8 py-8 space-y-5">
            <p className="text-center text-gray-400 text-[11px] font-medium leading-relaxed">
              Aceda à sua área exclusiva de empresa parceira NorthWindy.
            </p>

            <button
              onClick={onOpenAccess}
              className="w-full group flex items-center gap-4 bg-[#1a2b4a] hover:bg-[#0a1628] text-white px-6 py-[18px] font-semibold text-sm uppercase tracking-widest transition-all">
              <div className="bg-white/10 group-hover:bg-[#c9a96e]/20 p-2 transition-all">
                <Lock className="w-4 h-4" />
              </div>
              <span className="flex-1 text-left">Iniciar Sessão</span>
              <ChevronRight className="w-4 h-4 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </button>

            <p className="text-center text-gray-300 text-[10px] font-medium leading-relaxed pt-1">
              Acesso restrito a empresas aprovadas pela NorthWindy.
            </p>
          </div>
        </div>
      </section>

      {/* Footer mini */}
      <footer className="border-t border-gray-100 py-8 text-center text-xs text-gray-400 font-medium uppercase tracking-widest">
        © {new Date().getFullYear()} NorthWindy Charters · Todos os direitos reservados
      </footer>
    </div>
  );
}
