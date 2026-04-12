// src/components/pages/hero/HeroComunidade.tsx
import { Anchor, Briefcase, Users, Ship, CalendarDays, ArrowRight } from 'lucide-react';
import { NavigateFunction } from 'react-router-dom';

export function HeroComunidade({ navigate }: { navigate: NavigateFunction }) {
  return (
    <div className="relative z-20 flex-1 flex flex-col items-center justify-center px-4 md:px-8">

      <div className="text-center max-w-2xl mx-auto mb-8 md:mb-10">
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-4 py-1.5 mb-5">
          <Anchor className="w-3.5 h-3.5 text-blue-300" />
          <span className="text-blue-200 text-[11px] font-black uppercase tracking-widest">Soluções Corporativas</span>
        </div>

        <h1 className="text-white font-black text-2xl md:text-4xl lg:text-5xl leading-[1.1] tracking-tight mb-4">
          Experiências náuticas
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-300">para a sua empresa</span>
        </h1>

        <p className="text-blue-200/70 text-sm md:text-base font-medium leading-relaxed max-w-lg mx-auto">
          Eventos corporativos, team building, confraternizações e celebrações
          com a exclusividade e segurança que a sua empresa merece.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 w-full max-w-3xl">
        {[
          { icon: <Briefcase className="w-5 h-5" />, title: 'Eventos Corporativos', desc: 'Reuniões e conferências a bordo' },
          { icon: <Users className="w-5 h-5" />,     title: 'Team Building',         desc: 'Fortaleça laços da equipa' },
          { icon: <Ship className="w-5 h-5" />,      title: 'Fretamento Exclusivo',  desc: 'Embarcação privativa' },
          { icon: <CalendarDays className="w-5 h-5" />, title: 'Confraternizações', desc: 'Celebre datas especiais' },
        ].map((item, i) => (
          <div key={i}
            className="group bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 hover:border-blue-400/30 rounded-2xl p-4 md:p-5 text-center transition-all duration-300 cursor-pointer backdrop-blur-sm"
            style={{ animationDelay: `${i * 100}ms` }}>
            <div className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-400/20 flex items-center justify-center text-blue-300 group-hover:text-blue-200 group-hover:scale-110 transition-all duration-300">
              {item.icon}
            </div>
            <p className="text-white font-black text-xs md:text-sm mb-1">{item.title}</p>
            <p className="text-blue-200/50 text-[10px] md:text-xs font-bold">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3 mt-8">
        <button
          onClick={() => navigate('/comunidade')}
          className="flex items-center gap-2 bg-white text-blue-900 px-6 py-3 rounded-full font-black text-sm uppercase tracking-wide hover:bg-blue-50 transition-all shadow-lg shadow-white/10 hover:scale-105">
          Saber mais <ArrowRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => { window.location.href = 'mailto:geral@northwindy.com'; }}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white border border-white/20 px-6 py-3 rounded-full font-black text-sm uppercase tracking-wide transition-all hover:scale-105 backdrop-blur-sm">
          Contactar-nos
        </button>
      </div>
    </div>
  );
}
