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
      `}</style>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 px-6 md:px-16 py-4 flex items-center justify-between">
        <button onClick={onBack}
          className="flex items-center gap-2 text-blue-900 font-black uppercase text-xs tracking-widest hover:gap-3 transition-all">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>
        <img src={LOGO_SRC} alt="NorthWindy" style={{ height: '112px', width: 'auto', objectFit: 'contain' }} />
        <div className="w-20" />
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-blue-900 text-white px-6 md:px-16 py-24 text-center">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)', backgroundSize: '24px 24px' }} />
        <div className="relative max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6">
            <Anchor className="w-3 h-3" /> Parcerias
          </span>
          <h1 className="text-4xl md:text-6xl font-black uppercase italic leading-none mb-6">
            Cresça connosco
          </h1>
          <p className="text-blue-200 text-lg font-bold max-w-xl mx-auto">
            Junte-se ao ecossistema NorthWindy e alcance quem verdadeiramente ama o mar.
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section className="max-w-5xl mx-auto px-6 md:px-8 py-20">
        <h2 className="text-2xl font-black text-blue-900 uppercase italic mb-10 text-center">Por que ser parceiro?</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {benefits.map((b, i) => (
            <div key={i} className="border-2 border-gray-100 rounded-[24px] p-8 hover:border-blue-900 transition-all group">
              <div className="bg-blue-50 w-12 h-12 rounded-2xl flex items-center justify-center text-blue-900 mb-5 group-hover:bg-blue-900 group-hover:text-white transition-all">
                {b.icon}
              </div>
              <h3 className="font-black text-blue-900 text-lg uppercase italic mb-2">{b.title}</h3>
              <p className="text-gray-500 font-bold text-sm leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-50 px-6 md:px-16 py-20 text-center">
        <h2 className="text-3xl font-black text-blue-900 uppercase italic mb-4">Interessado?</h2>
        <p className="text-gray-500 font-bold mb-8 max-w-lg mx-auto">
          Entre em contacto com a nossa equipa e descubra o plano de parceria ideal para o seu negócio.
        </p>
        <a href="mailto:parcerias@northwindy.com"
          className="inline-flex items-center gap-2 bg-blue-900 hover:bg-blue-800 text-white px-8 py-4 rounded-full font-black uppercase text-sm transition-all hover:scale-105 shadow-lg">
          Falar com a equipa <ChevronRight className="w-4 h-4" />
        </a>
      </section>

      {/* ── Acesso Empresa ── */}
      <section className="max-w-sm mx-auto px-6 py-16">
        <div className="relative bg-white rounded-[36px] shadow-2xl overflow-hidden border border-gray-100">

          {/* Subtle top accent line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-800 via-blue-500 to-amber-400" />

          {/* Header */}
          <div className="relative bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 px-8 pt-10 pb-10 text-center overflow-hidden">
            <div className="absolute inset-0 opacity-5"
              style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, #fff 1px, transparent 1px), radial-gradient(circle at 80% 20%, #fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
            <p className="relative text-[10px] font-black text-blue-300/80 uppercase tracking-[0.2em] mb-2">Área Exclusiva</p>
            <h3 className="relative text-[24px] font-black text-white uppercase italic tracking-tight leading-tight">
              Acesso Empresa
            </h3>
            <div className="mt-3 flex justify-center">
              <div className="h-px w-12 bg-amber-400/60" />
            </div>
          </div>

          {/* Body */}
          <div className="px-8 py-8 space-y-5">
            <p className="text-center text-gray-400 text-[11px] font-bold leading-relaxed">
              Aceda à sua área exclusiva de empresa parceira NorthWindy.
            </p>

            <button
              onClick={onOpenAccess}
              className="w-full group relative flex items-center gap-4 bg-blue-900 hover:bg-blue-800 active:scale-[0.98] text-white px-6 py-[18px] rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg shadow-blue-900/30 hover:shadow-blue-900/50 hover:shadow-xl">
              <div className="bg-white/15 group-hover:bg-white/20 p-2 rounded-xl transition-all">
                <Lock className="w-4 h-4" />
              </div>
              <span className="flex-1 text-left">Iniciar Sessão</span>
              <ChevronRight className="w-4 h-4 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </button>

            <p className="text-center text-gray-300 text-[10px] font-bold leading-relaxed pt-1">
              Acesso restrito a empresas aprovadas pela NorthWindy.
            </p>
          </div>
        </div>
      </section>

      {/* Footer mini */}
      <footer className="border-t border-gray-100 py-8 text-center text-xs text-gray-400 font-bold uppercase tracking-widest">
        © {new Date().getFullYear()} NorthWindy Charters · Todos os direitos reservados
      </footer>
    </div>
  );
}