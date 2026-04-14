// src/components/pages/OfertasTrabalhoPage.tsx
import { useEffect, useState } from 'react';
import { ArrowLeft, MapPin, Clock, Anchor, Briefcase, ChevronRight, Star, Waves, Search, SlidersHorizontal } from 'lucide-react';
import { LOGO_SRC } from '../../assets';

interface OfertasTrabalhoPageProps {
  onBack: () => void;
}

const CATEGORIAS = ['Todos', 'Skipper', 'Marinheiro', 'Mecânico Naval', 'Hostess', 'Chef de Bordo', 'Pescador', 'Instrutor'];

const OFERTAS = [
  {
    id: 1,
    destaque: true,
    titulo: 'Skipper Experiente — Temporada Verão',
    empresa: 'Azul Marino Charters',
    local: 'Portimão, Portugal',
    bandeira: '🇵🇹',
    tipo: 'Sazonal',
    categoria: 'Skipper',
    experiencia: '5+ anos',
    salario: '€ 2.800 – 3.500 / mês',
    descricao: 'Liderança de rotas pelo Algarve e Ilhas Desertas. Embarcação Jeanneau 54. Tripulação de 3 elementos. Certificação RYA obrigatória.',
    tags: ['RYA Yachtmaster', 'VHF DSC', 'STCW'],
    cor: 'from-blue-900 to-blue-700',
  },
  {
    id: 2,
    destaque: false,
    titulo: 'Marinheiro de Convés',
    empresa: 'Estrela do Mar Lda.',
    local: 'Cascais, Portugal',
    bandeira: '🇵🇹',
    tipo: 'Tempo Inteiro',
    categoria: 'Marinheiro',
    experiencia: '2+ anos',
    salario: '€ 1.400 – 1.800 / mês',
    descricao: 'Manutenção de convés, limpeza e apoio a embarque/desembarque. Trabalho de sol a sol em temporada alta.',
    tags: ['STCW Basic', 'Vela', 'Cabotagem'],
    cor: 'from-cyan-800 to-cyan-600',
  },
  {
    id: 3,
    destaque: false,
    titulo: 'Mecânico Naval — Motores Diesel',
    empresa: 'Porto Seco Marina',
    local: 'Setúbal, Portugal',
    bandeira: '🇵🇹',
    tipo: 'Tempo Inteiro',
    categoria: 'Mecânico Naval',
    experiencia: '3+ anos',
    salario: '€ 1.900 – 2.400 / mês',
    descricao: 'Manutenção preventiva e corretiva de motores Volvo Penta e Yanmar. Diagnóstico eletrónico. Oficina própria.',
    tags: ['Volvo Penta', 'Yanmar', 'Elétrica Naval'],
    cor: 'from-slate-700 to-slate-500',
  },
  {
    id: 4,
    destaque: true,
    titulo: 'Chef de Bordo — Luxury Yacht',
    empresa: 'NorthWindy Concierge',
    local: 'Ilha do Mel, Brasil',
    bandeira: '🇧🇷',
    tipo: 'Sazonal',
    categoria: 'Chef de Bordo',
    experiencia: '3+ anos',
    salario: 'R$ 8.000 – 12.000 / mês',
    descricao: 'Elaboração de menus personalizados para grupos de até 12 pessoas. Embarcação de 65ft. Alojamento e alimentação incluídos.',
    tags: ['Gastronomia', 'Higiene Alimentar', 'Alta Cozinha'],
    cor: 'from-amber-700 to-amber-500',
  },
  {
    id: 5,
    destaque: false,
    titulo: 'Hostess / Stewarden',
    empresa: 'Blue Ocean Cruises',
    local: 'Tavira, Portugal',
    bandeira: '🇵🇹',
    tipo: 'Sazonal',
    categoria: 'Hostess',
    experiencia: '1+ anos',
    salario: '€ 1.200 – 1.600 / mês',
    descricao: 'Serviço de bordo, receção de clientes, limpeza de camarotes. Inglês e Espanhol obrigatórios. Regime de rotatividade.',
    tags: ['Serviço de Bordo', 'Inglês', 'Espanhol'],
    cor: 'from-rose-700 to-rose-500',
  },
  {
    id: 6,
    destaque: false,
    titulo: 'Instrutor de Vela — Escola Náutica',
    empresa: 'Vela Atlântico',
    local: 'Vilamoura, Portugal',
    bandeira: '🇵🇹',
    tipo: 'Part-Time',
    categoria: 'Instrutor',
    experiencia: '4+ anos',
    salario: '€ 20 – 30 / hora',
    descricao: 'Ensino de vela a iniciantes e intermédios. Laser e Optimist. Fins de semana e épocas escolares. Certificação FPN exigida.',
    tags: ['FPN', 'Pedagogia', 'Laser', 'Optimist'],
    cor: 'from-emerald-700 to-emerald-500',
  },
];

export function OfertasTrabalhoPage({ onBack }: OfertasTrabalhoPageProps) {
  const [catAtiva, setCatAtiva] = useState('Todos');
  const [busca, setBusca] = useState('');

  useEffect(() => {
    document.title = 'Ofertas de Trabalho | NorthWindy Charters';
    return () => { document.title = 'NorthWindy Charters'; };
  }, []);

  const filtradas = OFERTAS.filter(o => {
    const matchCat = catAtiva === 'Todos' || o.categoria === catAtiva;
    const matchBusca = busca === '' || o.titulo.toLowerCase().includes(busca.toLowerCase()) || o.empresa.toLowerCase().includes(busca.toLowerCase());
    return matchCat && matchBusca;
  });

  const destaques = filtradas.filter(o => o.destaque);
  const normais   = filtradas.filter(o => !o.destaque);

  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      <style>{`
        * { scrollbar-width: none; -ms-overflow-style: none; }
        *::-webkit-scrollbar { display: none; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fadeUp 0.5s ease forwards; }
      `}</style>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 px-6 md:px-16 py-4 flex items-center justify-between shadow-sm">
        <button onClick={onBack}
          className="flex items-center gap-2 text-blue-900 font-black uppercase text-xs tracking-widest hover:gap-3 transition-all">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>
        <img src={LOGO_SRC} alt="NorthWindy" style={{ height: '96px', width: 'auto', objectFit: 'contain' }} />
        <div className="w-20" />
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-blue-900 text-white px-6 md:px-16 pt-16 pb-24">
        {/* Geometric wave pattern */}
        <div className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Cpath d='M0 40 Q20 20 40 40 Q60 60 80 40' stroke='white' stroke-width='1.5' fill='none'/%3E%3Cpath d='M0 60 Q20 40 40 60 Q60 80 80 60' stroke='white' stroke-width='1.5' fill='none'/%3E%3C/svg%3E")`,
            backgroundSize: '80px 80px',
          }} />
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-[#f8f9fb]"
          style={{ clipPath: 'ellipse(60% 100% at 50% 100%)' }} />

        <div className="relative max-w-3xl mx-auto text-center fade-up">
          <span className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6">
            <Briefcase className="w-3 h-3" /> Carreiras Náuticas
          </span>
          <h1 className="text-4xl md:text-6xl font-black uppercase italic leading-none mb-5">
            Trabalha<br />no Mar
          </h1>
          <p className="text-blue-200 text-base font-bold max-w-xl mx-auto mb-10">
            As melhores oportunidades em iates, marinas e escolas náuticas — Portugal e Brasil.
          </p>

          {/* Search bar */}
          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cargo, empresa, localização…"
              value={busca}
              onChange={e => setBusca(e.target.value)}
              className="w-full pl-11 pr-4 py-4 rounded-2xl bg-white text-blue-900 font-bold text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-xl"
            />
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <div className="bg-white border-b border-gray-100 py-5 px-6 md:px-16">
        <div className="max-w-5xl mx-auto flex items-center justify-between flex-wrap gap-4">
          {[
            { label: 'Vagas Abertas',   val: `${filtradas.length}` },
            { label: 'Empresas',        val: '12+' },
            { label: 'Categorias',      val: '8' },
            { label: 'Países',          val: 'PT · BR' },
          ].map((s, i) => (
            <div key={i} className="text-center flex-1 min-w-[80px]">
              <p className="text-2xl font-black text-blue-900 italic">{s.val}</p>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Category filters */}
      <div className="px-6 md:px-16 py-6 max-w-5xl mx-auto">
        <div className="flex items-center gap-2 mb-5 flex-wrap">
          <SlidersHorizontal className="w-4 h-4 text-gray-400 mr-1" />
          {CATEGORIAS.map(cat => (
            <button
              key={cat}
              onClick={() => setCatAtiva(cat)}
              className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wide transition-all ${
                catAtiva === cat
                  ? 'bg-blue-900 text-white shadow-lg shadow-blue-900/20'
                  : 'bg-white text-gray-500 border border-gray-200 hover:border-blue-900 hover:text-blue-900'
              }`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Destaques */}
        {destaques.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Destaque</span>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {destaques.map((o, i) => (
                <OfertaCard key={o.id} oferta={o} delay={i * 80} destaque />
              ))}
            </div>
          </div>
        )}

        {/* Todas */}
        {normais.length > 0 && (
          <div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Todas as vagas</p>
            <div className="grid md:grid-cols-2 gap-4">
              {normais.map((o, i) => (
                <OfertaCard key={o.id} oferta={o} delay={i * 60} />
              ))}
            </div>
          </div>
        )}

        {filtradas.length === 0 && (
          <div className="text-center py-20">
            <Waves className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="font-black text-gray-300 text-lg uppercase italic">Nenhuma vaga encontrada</p>
            <p className="text-gray-400 text-sm font-bold mt-2">Tente outra categoria ou limpe a pesquisa</p>
          </div>
        )}
      </div>

      {/* CTA — Empresas */}
      <section className="relative overflow-hidden bg-blue-900 text-white px-6 md:px-16 py-20 mt-10">
        <div className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: 'repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)', backgroundSize: '20px 20px' }} />
        <div className="relative max-w-2xl mx-auto text-center">
          <Anchor className="w-10 h-10 mx-auto mb-5 text-blue-300" />
          <h2 className="text-3xl font-black uppercase italic mb-4">Tem uma vaga para publicar?</h2>
          <p className="text-blue-200 font-bold mb-8 max-w-md mx-auto">
            Conecte-se com os melhores profissionais náuticos de Portugal e Brasil.
          </p>
          <a href="mailto:trabalho@northwindy.com"
            className="inline-flex items-center gap-2 bg-white text-blue-900 px-8 py-4 rounded-full font-black uppercase text-sm transition-all hover:scale-105 shadow-xl">
            Publicar Vaga <ChevronRight className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 text-center text-xs text-gray-400 font-bold uppercase tracking-widest bg-white">
        © {new Date().getFullYear()} NorthWindy Charters · Todos os direitos reservados
      </footer>
    </div>
  );
}

function OfertaCard({ oferta, delay = 0, destaque = false }: { oferta: typeof OFERTAS[0]; delay?: number; destaque?: boolean }) {
  const tipoColor: Record<string, string> = {
    'Sazonal':       'bg-amber-100 text-amber-700',
    'Tempo Inteiro': 'bg-emerald-100 text-emerald-700',
    'Part-Time':     'bg-blue-100 text-blue-700',
  };

  return (
    <div
      className={`group relative bg-white rounded-[22px] overflow-hidden border-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
        destaque ? 'border-blue-900/20 shadow-lg shadow-blue-900/10' : 'border-gray-100 hover:border-blue-200'
      }`}
      style={{ animationDelay: `${delay}ms` }}>

      {destaque && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-900 via-blue-500 to-amber-400" />
      )}

      {/* Color top band */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${oferta.cor}`} />

      <div className="p-6">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1">
            {destaque && (
              <div className="flex items-center gap-1 mb-2">
                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Destaque</span>
              </div>
            )}
            <h3 className="font-black text-blue-900 text-base leading-snug group-hover:text-blue-700 transition-colors">
              {oferta.titulo}
            </h3>
            <p className="text-gray-500 font-bold text-xs mt-1">{oferta.empresa}</p>
          </div>
          <span className={`shrink-0 text-[10px] font-black uppercase tracking-wide px-3 py-1.5 rounded-full ${tipoColor[oferta.tipo] ?? 'bg-gray-100 text-gray-500'}`}>
            {oferta.tipo}
          </span>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap gap-3 mb-4 text-xs text-gray-400 font-bold">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" /> {oferta.local} {oferta.bandeira}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" /> {oferta.experiencia}
          </span>
        </div>

        {/* Description */}
        <p className="text-gray-500 text-xs font-bold leading-relaxed mb-4 line-clamp-2">{oferta.descricao}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {oferta.tags.map(tag => (
            <span key={tag} className="bg-gray-100 text-gray-500 text-[10px] font-black uppercase tracking-wide px-2.5 py-1 rounded-full">
              {tag}
            </span>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Remuneração</p>
            <p className="font-black text-blue-900 text-sm">{oferta.salario}</p>
          </div>
          <button className="flex items-center gap-1.5 bg-blue-900 hover:bg-blue-800 text-white text-xs font-black uppercase tracking-wide px-5 py-2.5 rounded-xl transition-all hover:scale-105 active:scale-95">
            Candidatar <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
