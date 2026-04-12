// src/components/AboutPage.tsx
import { useEffect } from 'react';
import { Compass, Anchor, ArrowLeft } from 'lucide-react';
import { LOGO_SRC } from '../../assets';

interface AboutPageProps {
  onBack: () => void;
}

export function AboutPage({ onBack }: AboutPageProps) {

  useEffect(() => {
    // ── SEO meta tags ──────────────────────────────────────────────
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

    // canonical
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
    canonical.href = 'https://northwindy.com/quem-somos';

    // ── cleanup ao sair da página ──────────────────────────────────
    return () => {
      document.title = 'NorthWindy Charters';
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">

      <style>{`
        * { scrollbar-width: none; -ms-overflow-style: none; }
        *::-webkit-scrollbar { display: none; }
      `}</style>

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 px-6 md:px-16 py-4 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-blue-900 font-black uppercase text-xs tracking-widest hover:gap-3 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>
        <img
          src={LOGO_SRC}
          alt="NorthWindy"
          style={{ height: '112px', width: 'auto', objectFit: 'contain' }}
        />
        <div className="w-20" />
      </header>

      {/* ── HERO ── */}
      <section className="bg-blue-900 px-6 md:px-16 py-20 md:py-28">
        <div className="max-w-4xl mx-auto">
          <p className="text-blue-400/50 text-[10px] font-semibold uppercase tracking-[0.4em] mb-6">
            Charters Certificados · Experiências Únicas
          </p>
          <h1 className="about-hero-title text-4xl md:text-5xl text-white leading-[1.15] mb-4 max-w-2xl">
            Não vendemos <span className="about-hero-shimmer">viagens</span>.<br />
            Conectamos o desejo com a experiência de <span className="about-hero-shimmer">navegar</span>.
          </h1>
          <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,400;1,500&display=swap');
            .about-hero-title {
              font-family: 'Playfair Display', Georgia, serif;
              font-style: italic;
              font-weight: 400;
              letter-spacing: -0.01em;
            }
            @keyframes about-hero-glow {
              0%, 100% { color: #93c5fd; }
              50%       { color: #60a5fa; }
            }
            .about-hero-shimmer { animation: about-hero-glow 3s ease-in-out infinite; }
          `}</style>
        </div>
      </section>

      {/* ── CONTEÚDO PRINCIPAL ── */}
      <section className="px-6 md:px-16 py-20">
        <div className="max-w-4xl mx-auto space-y-16">

          {/* Origem */}
          <p className="text-gray-500 font-bold text-base leading-relaxed">
            A NorthWindy Charters nasceu da vontade de um entusiasta de navegar que, ao buscar o mar,
            encontrou barreiras onde deveria haver liberdade. A dificuldade em localizar opções de qualidade
            e a ausência de um processo de contratação dinâmico e fácil foram o combustível para criar algo
            novo. Percebemos que o mercado náutico precisava de uma ponte: algo que unisse a paixão pelo
            oceano à agilidade do mundo moderno.
          </p>

          <div className="h-px bg-gray-100" />

          {/* Nossa Essência */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-sky-100 p-3 rounded-[14px]">
                <Compass className="w-6 h-6 text-sky-600" />
              </div>
              <h2 className="font-black text-blue-900 uppercase italic text-xl leading-tight">
                Nossa Essência
              </h2>
            </div>
            <p className="text-gray-500 font-bold text-base leading-relaxed">
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
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-amber-100 p-3 rounded-[14px]">
                <Anchor className="w-6 h-6 text-amber-600" />
              </div>
              <h2 className="font-black text-blue-900 uppercase italic text-xl leading-tight">
                O Que Nos Move
              </h2>
            </div>
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
                <div key={title} className={`flex items-start gap-4 border-2 rounded-[24px] px-6 py-5 ${bg}`}>
                  <span className="text-2xl flex-shrink-0 leading-none mt-0.5">{emoji}</span>
                  <div>
                    <p className="font-black text-blue-900 text-sm uppercase italic mb-2">{title}</p>
                    <p className="font-bold text-sm text-gray-500 leading-snug">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="h-px bg-gray-100" />

          {/* Por que navegar */}
          <div className="bg-blue-900 rounded-[32px] px-8 py-8">
            <p className="text-blue-300 font-black text-[10px] uppercase tracking-widest mb-3">
              Por que navegar com a NorthWindy?
            </p>
            <p className="text-white font-bold text-base leading-relaxed">
              Navegar conosco é ter a certeza de um atendimento personalizado e a infraestrutura de uma
              corporação que domina a complexidade do ambiente náutico global. Criamos a solução que nós
              mesmos, como entusiastas, queríamos encontrar: uma jornada segura, sofisticada e absolutamente
              inesquecível.
            </p>
            <p className="text-sky-400 font-black text-base italic mt-4">
              NorthWindy Charters — Onde o mundo encontra o mar.
            </p>
          </div>

          {/* Botão voltar */}
          <button
            onClick={onBack}
            className="w-full border-2 border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white py-4 rounded-[25px] font-black uppercase text-sm tracking-widest transition-all"
          >
            ← Voltar ao Site
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