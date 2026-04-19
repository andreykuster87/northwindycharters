// src/components/pages/MarketplacePage.tsx
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { LOGO_SRC } from '../../assets';
import { MarketplaceTab } from '../shared/MarketplaceTab';

import type { CatalogBoat } from '../../utils/clientHelpers';

interface Props {
  onBack:          () => void;
  onSelectBoat?:   (boat: CatalogBoat, date?: string, slot?: string) => void;
}

type SubTab = 'passeios' | 'eventos' | 'embarcacoes' | 'escolas' | 'ofertas' | 'acessorios' | 'pecas';

const CATEGORIES: {
  key: SubTab;
  title: string;
  subtitle: string;
  cta: string;
  image: string;
  span?: 'full' | 'half';
}[] = [
  {
    key: 'passeios',
    title: 'Passeios',
    subtitle: 'Descubra experiências náuticas únicas e reserve o seu próximo passeio.',
    cta: 'Ver Passeios',
    image: 'https://images.pexels.com/photos/1295036/pexels-photo-1295036.jpeg?auto=compress&cs=tinysrgb&w=900',
  },
  {
    key: 'eventos',
    title: 'Eventos',
    subtitle: 'Regatas, festivais e encontros náuticos para toda a comunidade.',
    cta: 'Ver Eventos',
    image: 'https://images.pexels.com/photos/1532771/pexels-photo-1532771.jpeg?auto=compress&cs=tinysrgb&w=900',
  },
  {
    key: 'embarcacoes',
    title: 'Embarcações',
    subtitle: 'Compre, venda ou encontre a embarcação perfeita para o seu estilo náutico.',
    cta: 'Explorar Embarcações',
    image: 'https://images.pexels.com/photos/163236/luxury-yacht-boat-speed-water-163236.jpeg?auto=compress&cs=tinysrgb&w=900',
  },
  {
    key: 'escolas',
    title: 'Escolas Náuticas',
    subtitle: 'Formação certificada com os melhores instrutores de Portugal e Brasil.',
    cta: 'Ver Escolas',
    image: 'https://images.pexels.com/photos/1007836/pexels-photo-1007836.jpeg?auto=compress&cs=tinysrgb&w=900',
  },
  {
    key: 'ofertas',
    title: 'Ofertas de Trabalho',
    subtitle: 'As melhores oportunidades em iates, marinas e escolas náuticas.',
    cta: 'Ver Vagas',
    image: 'https://images.pexels.com/photos/1430676/pexels-photo-1430676.jpeg?auto=compress&cs=tinysrgb&w=900',
  },
  {
    key: 'acessorios',
    title: 'Acessórios',
    subtitle: 'Equipamentos, vestuário e tudo o que o seu barco precisa.',
    cta: 'Descobrir',
    image: 'https://images.pexels.com/photos/3762940/pexels-photo-3762940.jpeg?auto=compress&cs=tinysrgb&w=900',
  },
  {
    key: 'pecas',
    title: 'Peças e Motores',
    subtitle: 'Peças náuticas e motores de todas as marcas, novos e usados.',
    cta: 'Ver Catálogo',
    image: 'https://images.pexels.com/photos/4792733/pexels-photo-4792733.jpeg?auto=compress&cs=tinysrgb&w=900',
  },
];

export function MarketplacePage({ onBack, onSelectBoat }: Props) {
  const [activeCategory, setActiveCategory] = useState<SubTab | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = 'Marketplace | NorthWindy Charters';
    return () => { document.title = 'NorthWindy Charters'; };
  }, []);

  function handleSelect(key: SubTab) {
    setActiveCategory(key);
    setTimeout(() => {
      contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  }

  const row1 = CATEGORIES.slice(0, 2); // Passeios + Eventos (featured)
  const row2 = CATEGORIES.slice(2, 5); // Embarcações + Escolas + Ofertas
  const row3 = CATEGORIES.slice(5);    // Acessórios + Peças

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Open Sans', sans-serif" }}>
      <style>{`
        * { scrollbar-width: none; -ms-overflow-style: none; }
        *::-webkit-scrollbar { display: none; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up   { animation: fadeUp 0.6s ease forwards; }
        .fade-up-1 { animation: fadeUp 0.6s 0.1s ease both; }
        .fade-up-2 { animation: fadeUp 0.6s 0.2s ease both; }
        .fade-up-3 { animation: fadeUp 0.6s 0.3s ease both; }

        .cat-card { overflow: hidden; position: relative; cursor: pointer; }
        .cat-card img {
          transition: transform 0.7s cubic-bezier(0.25,0.46,0.45,0.94);
        }
        .cat-card:hover img { transform: scale(1.07); }
        .cat-card .overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(10,22,40,0.82) 0%, rgba(10,22,40,0.18) 55%, transparent 100%);
          transition: opacity 0.4s ease;
        }
        .cat-card:hover .overlay { opacity: 0.95; }
        .cat-card .card-body {
          position: absolute; bottom: 0; left: 0; right: 0;
          padding: 28px 28px 28px;
          transform: translateY(0);
          transition: transform 0.4s ease;
        }
        .cat-card .card-desc {
          opacity: 0;
          max-height: 0;
          overflow: hidden;
          transition: opacity 0.35s ease 0.05s, max-height 0.4s ease;
        }
        .cat-card:hover .card-desc {
          opacity: 1;
          max-height: 80px;
        }
        .cat-card .cta-line {
          opacity: 0;
          transform: translateY(6px);
          transition: opacity 0.3s ease 0.1s, transform 0.3s ease 0.1s;
        }
        .cat-card:hover .cta-line {
          opacity: 1;
          transform: translateY(0);
        }
        .divider-line {
          width: 48px; height: 2px;
          background: #c9a96e;
          margin: 12px 0;
        }
      `}</style>

      {/* ── Header ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 md:px-12 h-16 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-[#1a2b4a] font-bold uppercase text-xs tracking-widest hover:gap-3 transition-all group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Voltar
          </button>
          <img src={LOGO_SRC} alt="NorthWindy" style={{ height: '88px', width: 'auto', objectFit: 'contain' }} />
          <div className="w-20" />
        </div>
      </header>

      {/* ── Intro ──────────────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-6 text-center pt-16 pb-12 fade-up">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#c9a96e] mb-4">
          NorthWindy · Marketplace
        </p>
        <h1
          className="text-5xl md:text-6xl font-bold leading-[1.05] text-[#0a1628] mb-6"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          O Seu Universo<br />Náutico, Aqui.
        </h1>
        <p className="text-gray-500 text-base leading-relaxed max-w-xl mx-auto">
          Passeios, eventos, embarcações, formação, emprego, acessórios e peças — tudo o que precisa
          para viver o mar com paixão e segurança.
        </p>
        <div className="divider-line mx-auto mt-8" />
      </section>

      {/* ── Category Grid — row 1: Passeios + Eventos (featured) ──── */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {row1.map((cat, i) => (
            <CategoryCard
              key={cat.key}
              cat={cat}
              height="440px"
              delay={i * 80}
              onSelect={handleSelect}
              active={activeCategory === cat.key}
            />
          ))}
        </div>
      </section>

      {/* ── Category Grid — row 2: Embarcações + Escolas + Ofertas ── */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {row2.map((cat, i) => (
            <CategoryCard
              key={cat.key}
              cat={cat}
              height="380px"
              delay={160 + i * 80}
              onSelect={handleSelect}
              active={activeCategory === cat.key}
            />
          ))}
        </div>
      </section>

      {/* ── Category Grid — row 3: Acessórios + Peças ──────────────── */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 pt-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {row3.map((cat, i) => (
            <CategoryCard
              key={cat.key}
              cat={cat}
              height="340px"
              delay={320 + i * 80}
              onSelect={handleSelect}
              active={activeCategory === cat.key}
            />
          ))}
        </div>
      </section>

      {/* ── Divider ────────────────────────────────────────────────── */}
      {activeCategory && (
        <div className="border-t-2 border-[#0a1628]" />
      )}

      {/* ── Marketplace Tab Content ─────────────────────────────────── */}
      {activeCategory && (
        <div ref={contentRef} className="bg-[#f8f9fb] min-h-[60vh]">
          <div className="max-w-6xl mx-auto px-6 md:px-12 py-10">
            {/* Back to categories */}
            <button
              onClick={() => setActiveCategory(null)}
              className="flex items-center gap-2 text-[#1a2b4a] font-bold uppercase text-xs tracking-widest mb-8 hover:gap-3 transition-all group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              Todas as categorias
            </button>
            <MarketplaceTab role={null} initialTab={activeCategory} onSelectBoat={onSelectBoat} />
          </div>
        </div>
      )}

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 py-10 bg-white">
        <p className="text-center text-xs text-gray-400 font-bold uppercase tracking-widest">
          © {new Date().getFullYear()} NorthWindy Charters · Todos os direitos reservados
        </p>
      </footer>
    </div>
  );
}

// ── CategoryCard ──────────────────────────────────────────────────────────────
function CategoryCard({
  cat, height, delay, onSelect, active,
}: {
  cat: typeof CATEGORIES[0];
  height: string;
  delay: number;
  onSelect: (k: SubTab) => void;
  active: boolean;
}) {
  return (
    <button
      className={`cat-card w-full text-left rounded-none transition-all duration-300 ${active ? 'ring-4 ring-[#c9a96e]' : ''}`}
      style={{ height, animationDelay: `${delay}ms` }}
      onClick={() => onSelect(cat.key)}>
      <img
        src={cat.image}
        alt={cat.title}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="overlay" />
      <div className="card-body">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c9a96e] mb-1">
          Marketplace
        </p>
        <h2
          className="text-2xl md:text-3xl font-bold text-white leading-tight"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          {cat.title}
        </h2>
        <div className="card-desc mt-3">
          <p className="text-white/75 text-sm leading-relaxed">{cat.subtitle}</p>
        </div>
        <div className="cta-line mt-4 flex items-center gap-2 text-[#c9a96e] font-bold text-xs uppercase tracking-widest">
          {cat.cta}
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </button>
  );
}
