// src/components/AboutPage.tsx
import { useEffect } from 'react';
import { Compass, Anchor, ArrowLeft, ChevronRight } from 'lucide-react';
import { LOGO_SRC } from '../../assets';

interface AboutPageProps {
  onBack: () => void;
}

export function AboutPage({ onBack }: AboutPageProps) {

  useEffect(() => {
    document.title = 'Quem Somos | NorthWindy Charters';

    const setMeta = (name: string, content: string, prop = false) => {
      const attr = prop ? 'property' : 'name';
      let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement;
      if (!el) { el = document.createElement('meta'); el.setAttribute(attr, name); document.head.appendChild(el); }
      el.setAttribute('content', content);
    };

    setMeta('description', 'Conheça a NorthWindy Charters — o marketplace de referência para passeios náuticos. A nossa história, missão e valores.');
    setMeta('keywords', 'NorthWindy, charters, passeios náuticos, barcos, Lisboa, Tejo, quem somos');
    setMeta('og:title', 'Quem Somos | NorthWindy Charters', true);
    setMeta('og:description', 'Nascemos da paixão por navegar. Conheça a nossa história e o que nos move.', true);
    setMeta('og:type', 'website', true);
    setMeta('og:url', 'https://northwindy.com/quem-somos', true);
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', 'Quem Somos | NorthWindy Charters');
    setMeta('twitter:description', 'Nascemos da paixão por navegar. Conheça a nossa história e o que nos move.');

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
    canonical.href = 'https://northwindy.com/quem-somos';

    return () => { document.title = 'NorthWindy Charters'; };
  }, []);

  return (
    <div className="min-h-screen bg-white">

      <style>{`
        * { scrollbar-width: none; -ms-overflow-style: none; }
        *::-webkit-scrollbar { display: none; }
        @keyframes about-gold-shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        .about-gold {
          background: linear-gradient(90deg,
            #a07830 0%, #c9a96e 25%, #f5e0a8 50%, #c9a96e 75%, #a07830 100%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: about-gold-shimmer 3.5s linear infinite;
        }
      `}</style>

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 px-6 md:px-16 py-4 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[#1a2b4a] font-medium text-sm tracking-wide hover:gap-3 transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>
        <img src={LOGO_SRC} alt="NorthWindy" style={{ height: '112px', width: 'auto', objectFit: 'contain' }} />
        <div className="w-20" />
      </header>

      {/* ── HERO ── */}
      <section className="relative bg-[#0a1628] px-6 md:px-16 py-24 md:py-32 overflow-hidden">
        {/* subtle grid */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 0,transparent 60px),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 0,transparent 60px)' }} />
        {/* glow */}
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-[#c9a96e]/5 blur-3xl pointer-events-none" />
        {/* gold line bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a96e]/40 to-transparent" />

        <div className="relative max-w-4xl mx-auto">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#c9a96e] mb-6">
            Charters Certificados · Experiências Únicas
          </p>
          <h1 className="font-['Playfair_Display'] font-bold italic text-4xl md:text-5xl lg:text-6xl text-white leading-[1.15] mb-6 max-w-3xl">
            Não vendemos <span className="about-gold">viagens</span>.<br />
            Conectamos o desejo com a experiência de <span className="about-gold">navegar</span>.
          </h1>
          <div className="flex items-center gap-4 mt-8">
            <div className="w-12 h-px bg-[#c9a96e]" />
            <p className="text-white/40 text-sm font-medium">Lisboa · Portugal · Est. 2026</p>
          </div>
        </div>
      </section>

      {/* ── CONTEÚDO PRINCIPAL ── */}
      <section className="px-6 md:px-16 py-20">
        <div className="max-w-4xl mx-auto space-y-16">

          {/* Origem */}
          <p className="text-gray-500 text-base leading-relaxed font-medium">
            A NorthWindy Charters nasceu da vontade de um entusiasta de navegar que, ao buscar o mar,
            encontrou barreiras onde deveria haver liberdade. A dificuldade em localizar opções de qualidade
            e a ausência de um processo de contratação dinâmico e fácil foram o combustível para criar algo
            novo. Percebemos que o mercado náutico precisava de uma ponte: algo que unisse a paixão pelo
            oceano à agilidade do mundo moderno.
          </p>

          <div className="h-px bg-gray-100" />

          {/* Nossa Essência */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#c9a96e] mb-3">A NOSSA IDENTIDADE</p>
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-sky-50 p-3 rounded-[14px]">
                <Compass className="w-6 h-6 text-sky-600" />
              </div>
              <h2 className="font-['Playfair_Display'] font-bold text-[#1a2b4a] text-2xl">
                Nossa Essência
              </h2>
            </div>
            <div className="w-8 h-px bg-[#c9a96e] mb-6" />
            <p className="text-gray-500 text-base leading-relaxed font-medium">
              Hoje, transformamos essa busca pessoal em uma operadora global de charters que conecta
              entusiastas às experiências mais exclusivas do planeta. Mais do que viabilizar passeios,
              entregamos curadoria de alto padrão. Nossa rede é composta exclusivamente por parceiros
              selecionados e embarcações que superam critérios rigorosos de qualidade, garantindo que a
              facilidade de reserva se traduza em uma experiência impecável no momento do embarque.
            </p>
          </div>

          <div className="h-px bg-gray-100" />

          {/* O Que Nos Move */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#c9a96e] mb-3">PROPÓSITO</p>
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-amber-50 p-3 rounded-[14px]">
                <Anchor className="w-6 h-6 text-amber-600" />
              </div>
              <h2 className="font-['Playfair_Display'] font-bold text-[#1a2b4a] text-2xl">
                O Que Nos Move
              </h2>
            </div>
            <div className="w-8 h-px bg-[#c9a96e] mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  emoji: '⚡',
                  title: 'Agilidade Digital, Experiência Real',
                  text: 'Nascemos para desburocratizar. Nossa plataforma foi desenhada para ser dinâmica, permitindo que a contratação do seu próximo passeio seja tão fluida quanto o próprio mar.',
                  bg: 'bg-blue-50 border-blue-100',
                },
                {
                  emoji: '🌍',
                  title: 'Excelência Global',
                  text: 'Operamos com uma visão cosmopolita, adaptando nossos serviços às demandas de clientes exigentes em qualquer latitude.',
                  bg: 'bg-indigo-50 border-indigo-100',
                },
                {
                  emoji: '🛡️',
                  title: 'Segurança como Prioridade',
                  text: 'No mar, a confiança é o nosso ativo mais valioso. Nossos protocolos operacionais e parcerias estratégicas garantem que sua única prioridade seja apreciar o horizonte.',
                  bg: 'bg-red-50 border-red-100',
                },
                {
                  emoji: '🌊',
                  title: 'Sustentabilidade Consciente',
                  text: 'O oceano é nosso escritório e nossa casa. Promovemos a navegação responsável, preservando o ecossistema para as futuras gerações.',
                  bg: 'bg-green-50 border-green-100',
                },
              ].map(({ emoji, title, text, bg }) => (
                <div key={title} className={`flex items-start gap-4 border-2 rounded-2xl px-6 py-5 ${bg} hover:border-[#c9a96e]/40 transition-colors`}>
                  <span className="text-2xl flex-shrink-0 leading-none mt-0.5">{emoji}</span>
                  <div>
                    <p className="font-['Playfair_Display'] font-bold text-[#1a2b4a] text-sm mb-2">{title}</p>
                    <p className="text-sm text-gray-500 leading-snug font-medium">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="h-px bg-gray-100" />

          {/* Por que navegar */}
          <div className="relative bg-[#0a1628] rounded-2xl px-8 py-10 overflow-hidden">
            <div className="absolute inset-0 opacity-[0.04]"
              style={{ backgroundImage: 'repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 0,transparent 60px),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 0,transparent 60px)' }} />
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a96e]/40 to-transparent" />
            <div className="relative">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#c9a96e] mb-4">
                Por que navegar com a NorthWindy?
              </p>
              <p className="text-white/80 text-base leading-relaxed font-medium">
                Navegar conosco é ter a certeza de um atendimento personalizado e a infraestrutura de uma
                corporação que domina a complexidade do ambiente náutico global. Criamos a solução que nós
                mesmos, como entusiastas, queríamos encontrar: uma jornada segura, sofisticada e absolutamente
                inesquecível.
              </p>
              <p className="font-['Playfair_Display'] font-bold italic text-[#c9a96e] text-lg mt-5">
                NorthWindy Charters — Onde o mundo encontra o mar.
              </p>
            </div>
          </div>

          {/* Botão voltar */}
          <button
            onClick={onBack}
            className="w-full flex items-center justify-center gap-2 border border-[#1a2b4a] text-[#1a2b4a] hover:bg-[#1a2b4a] hover:text-white py-4 rounded-xl font-semibold text-sm tracking-widest transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar ao Site
          </button>

        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#05112a] text-white py-8 px-6 md:px-16 text-center">
        <p className="text-blue-300/40 text-xs">
          © 2026 NorthWindy Charters. Todos os direitos reservados.
        </p>
      </footer>

    </div>
  );
}
