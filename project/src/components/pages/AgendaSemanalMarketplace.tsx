// src/components/pages/AgendaSemanalMarketplace.tsx
// Banner full-width dark do Marketplace — sem agenda (movida para FeaturedCarousels)
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Anchor, Sparkles } from 'lucide-react';

export function AgendaSemanalMarketplace() {
  const navigate = useNavigate();

  return (
    <section className="bg-[#0a1628] border-b border-white/[0.05]">
      <style>{`
        @keyframes goldShimmer {
          0%   { background-position: 0% 50%; box-shadow: 0 0 18px rgba(201,169,110,0.35), 0 0 6px rgba(201,169,110,0.2); }
          50%  { background-position: 100% 50%; box-shadow: 0 0 28px rgba(232,201,122,0.55), 0 0 10px rgba(201,169,110,0.35); }
          100% { background-position: 0% 50%; box-shadow: 0 0 18px rgba(201,169,110,0.35), 0 0 6px rgba(201,169,110,0.2); }
        }
      `}</style>
      <div className="relative overflow-hidden">

        {/* Grid texture */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 0,transparent 60px),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 0,transparent 60px)' }} />

        {/* Glow esquerdo */}
        <div className="absolute -left-32 top-1/2 -translate-y-1/2 w-[500px] h-[500px] pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(201,169,110,0.07) 0%, transparent 65%)' }} />

        {/* Glow direito */}
        <div className="absolute -right-32 top-1/2 -translate-y-1/2 w-[400px] h-[400px] pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(201,169,110,0.04) 0%, transparent 65%)' }} />

        {/* Gold top line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a96e]/60 to-transparent" />

        {/* Content */}
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 xl:px-20 py-11 flex flex-col lg:flex-row items-center lg:items-end justify-between gap-8">

          {/* Left — copy */}
          <div className="flex-1">
            {/* Eyebrow */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-px bg-[#c9a96e]/50" />
              <span className="text-[10px] font-semibold text-[#c9a96e]/70 uppercase tracking-[0.3em]">
                NorthWindy
              </span>
            </div>

            {/* Headline */}
            <div className="mb-6">
              <h2 className="font-['Playfair_Display'] font-bold text-white leading-[1.05]"
                style={{ fontSize: 'clamp(32px, 4vw, 52px)' }}>
                Marketplace
              </h2>
              <h2 className="font-['Playfair_Display'] font-bold italic leading-[1.05]"
                style={{ fontSize: 'clamp(32px, 4vw, 52px)', color: '#c9a96e' }}>
                Náutico
              </h2>
              <p className="text-white/40 text-sm font-medium mt-4 max-w-md leading-relaxed">
                Seu universo náutico em um só lugar — passeios, embarcações, vagas e muito mais.
              </p>
            </div>

            {/* CTA */}
            <button
              onClick={() => navigate('/marketplace')}
              className="group relative inline-flex items-center gap-3 text-[#0a1628] py-3.5 px-8 font-semibold uppercase tracking-widest text-[11px] transition-all overflow-hidden"
              style={{
                background: 'linear-gradient(90deg, #d4aa70 0%, #c9a96e 35%, #e8c97a 60%, #c9a96e 80%, #b8935a 100%)',
                backgroundSize: '200% 100%',
                animation: 'goldShimmer 3s ease infinite',
                boxShadow: '0 0 18px rgba(201,169,110,0.35), 0 0 6px rgba(201,169,110,0.2)',
              }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Explorar Marketplace
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Right — stats */}
          <div className="flex lg:flex-col items-center lg:items-end gap-8 lg:gap-6 flex-shrink-0">
            {[
              { n: '200+', l: 'Passeios disponíveis' },
              { n: '50+',  l: 'Embarcações à venda' },
              { n: '30+',  l: 'Vagas em aberto' },
            ].map(({ n, l }) => (
              <div key={l} className="text-center lg:text-right">
                <p className="font-['Playfair_Display'] font-bold text-[#c9a96e] leading-none"
                  style={{ fontSize: 'clamp(24px, 2.5vw, 36px)' }}>{n}</p>
                <p className="text-[10px] text-white/30 uppercase tracking-[0.15em] mt-1">{l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Decorative anchor */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-[0.025] pointer-events-none select-none hidden lg:block">
          <Anchor className="text-white" style={{ width: 260, height: 260 }} />
        </div>

        {/* Gold bottom line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a96e]/40 to-transparent" />
      </div>
    </section>
  );
}
