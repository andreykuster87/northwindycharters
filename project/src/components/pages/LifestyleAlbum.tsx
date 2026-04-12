import { useState, useEffect, useCallback } from 'react';
import { Camera, Compass, Waves, Sun, Anchor, Wind } from 'lucide-react';

/**
 * Lifestyle slides — cada um com gradiente atmosférico único,
 * ícone temático e frase curta. Funciona sem imagens externas.
 * Quando imagens reais de barcos estiverem disponíveis, basta
 * trocar o campo `bg` por uma url de imagem.
 */
const SLIDES = [
  {
    gradient: 'from-sky-400 via-cyan-500 to-blue-700',
    icon: <Sun className="w-7 h-7" />,
    label: 'Família no mar',
    phrase: 'Crie memórias que duram para sempre',
  },
  {
    gradient: 'from-teal-400 via-emerald-500 to-cyan-700',
    icon: <Waves className="w-7 h-7" />,
    label: 'Stand-up Paddle',
    phrase: 'Equilíbrio, paz e horizonte infinito',
  },
  {
    gradient: 'from-blue-500 via-indigo-500 to-blue-900',
    icon: <Compass className="w-7 h-7" />,
    label: 'Mergulho',
    phrase: 'Descubra o mundo abaixo da superfície',
  },
  {
    gradient: 'from-amber-400 via-orange-500 to-rose-600',
    icon: <Camera className="w-7 h-7" />,
    label: 'Momentos únicos',
    phrase: 'Cada segundo é uma foto perfeita',
  },
  {
    gradient: 'from-slate-600 via-blue-800 to-indigo-900',
    icon: <Anchor className="w-7 h-7" />,
    label: 'Pescaria',
    phrase: 'Paciência recompensada no alto mar',
  },
  {
    gradient: 'from-orange-400 via-pink-500 to-purple-600',
    icon: <Wind className="w-7 h-7" />,
    label: 'Entardecer a bordo',
    phrase: 'O pôr do sol visto de onde ele é mais bonito',
  },
];

export function LifestyleAlbum() {
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(1);

  const next = useCallback(() => {
    setDirection(1);
    setActive(i => (i + 1) % SLIDES.length);
  }, []);

  useEffect(() => {
    const id = setInterval(next, 4000);
    return () => clearInterval(id);
  }, [next]);

  const goTo = (i: number) => {
    setDirection(i > active ? 1 : -1);
    setActive(i);
  };

  return (
    <div className="relative z-20 w-full max-w-2xl mx-auto px-4 my-2">
      <div
        className="relative w-full overflow-hidden rounded-2xl"
        style={{ height: '100px' }}
      >
        {SLIDES.map((slide, i) => {
          const isActive = i === active;
          return (
            <div
              key={i}
              className={`absolute inset-0 flex items-center transition-all duration-[800ms] ease-out ${
                isActive
                  ? 'opacity-100 scale-100 translate-x-0'
                  : 'opacity-0 scale-105 translate-x-4'
              }`}
              style={{ pointerEvents: isActive ? 'auto' : 'none' }}
            >
              {/* Gradient background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient}`} />

              {/* Noise texture overlay */}
              <div
                className="absolute inset-0 opacity-[0.08] mix-blend-overlay"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                }}
              />

              {/* Decorative circles */}
              <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/10 blur-xl" />
              <div className="absolute -left-4 -bottom-4 w-16 h-16 rounded-full bg-white/10 blur-lg" />

              {/* Content */}
              <div className="relative z-10 flex items-center gap-4 px-5 w-full">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white flex-shrink-0 shadow-lg">
                  {slide.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white/70 text-[10px] font-black uppercase tracking-[0.2em]">
                    {slide.label}
                  </p>
                  <p className="text-white font-black text-sm md:text-base leading-tight mt-0.5 truncate">
                    {slide.phrase}
                  </p>
                </div>
              </div>
            </div>
          );
        })}

        {/* Progress dots */}
        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-20">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className="group relative p-0.5"
            >
              <span
                className={`block rounded-full transition-all duration-500 ${
                  i === active
                    ? 'bg-white w-5 h-1.5 shadow-md shadow-white/30'
                    : 'bg-white/40 w-1.5 h-1.5 group-hover:bg-white/70'
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
