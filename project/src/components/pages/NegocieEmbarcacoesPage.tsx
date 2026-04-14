// src/components/pages/NegocieEmbarcacoesPage.tsx
import { useEffect, useState } from 'react';
import { ArrowLeft, MapPin, Anchor, ChevronRight, Search, SlidersHorizontal, Ship, Waves, Tag, ArrowUpDown, Fuel, Zap, Heart, Share2 } from 'lucide-react';
import { LOGO_SRC } from '../../assets';

interface NegocieEmbarcacoesPageProps {
  onBack: () => void;
}

const TIPOS = ['Todos', 'Veleiro', 'Lancha', 'Catamarã', 'Zodíaco', 'Barco a Remos', 'Iate'];
const ORDENAR = ['Mais recentes', 'Menor preço', 'Maior preço', 'Menor comprimento'];

const EMBARCACOES = [
  {
    id: 1,
    nome: 'Jeanneau Sun Odyssey 440',
    tipo: 'Veleiro',
    ano: 2019,
    comprimento: '13.3 m',
    motor: 'Yanmar 40cv',
    propulsao: 'vela',
    local: 'Cascais, Portugal',
    bandeira: '🇵🇹',
    preco: '€ 189.000',
    precoNum: 189000,
    condicao: 'Excelente',
    vagas: 'Venda',
    cor: '#0B1F3A',
    desc: 'Embarcação de cruzeiro em estado impecável. Interior amplo, 3 camarotes, 2 casas de banho. Vela principal e genoa recentes. Toda a documentação em ordem.',
    specs: [
      { label: 'Banheiros', val: '2' },
      { label: 'Camarotes', val: '3' },
      { label: 'Motor', val: 'Yanmar 40cv' },
      { label: 'LOA', val: '13.3 m' },
    ],
    destaques: ['GPS Chartplotter', 'AIS', 'Autopiloto'],
    destaque: true,
  },
  {
    id: 2,
    nome: 'Regal 2600 Bowrider',
    tipo: 'Lancha',
    ano: 2021,
    comprimento: '7.9 m',
    motor: 'MerCruiser 300cv',
    propulsao: 'motor',
    local: 'Ilha do Mel, Brasil',
    bandeira: '🇧🇷',
    preco: 'R$ 320.000',
    precoNum: 320000,
    condicao: 'Seminova',
    vagas: 'Venda',
    cor: '#1d4ed8',
    desc: 'Lancha esportiva com lugar para 10 pessoas. Motor injetado revisado. Cobertura bimini, som Bluetooth e kit de mergulho incluso.',
    specs: [
      { label: 'Capacidade', val: '10 pax' },
      { label: 'Motor', val: 'MerCruiser 300cv' },
      { label: 'Combustível', val: 'Gasolina' },
      { label: 'LOA', val: '7.9 m' },
    ],
    destaques: ['Bimini', 'Som BT', 'Kit Mergulho'],
    destaque: true,
  },
  {
    id: 3,
    nome: 'Leopard 40 Catamarã',
    tipo: 'Catamarã',
    ano: 2017,
    comprimento: '12.2 m',
    motor: 'Yanmar 2× 29cv',
    propulsao: 'vela',
    local: 'Portimão, Portugal',
    bandeira: '🇵🇹',
    preco: '€ 245.000',
    precoNum: 245000,
    condicao: 'Bom estado',
    vagas: 'Venda',
    cor: '#0e7490',
    desc: 'Catamarã de cruzeiro estável e espaçoso. 4 camarotes, 4 casas de banho. Ideal para charter. Histórico de manutenção completo.',
    specs: [
      { label: 'Camarotes', val: '4' },
      { label: 'Banheiros', val: '4' },
      { label: 'Motores', val: '2× Yanmar 29cv' },
      { label: 'LOA', val: '12.2 m' },
    ],
    destaques: ['Charter Ready', 'Gerador', 'Watermaker'],
    destaque: false,
  },
  {
    id: 4,
    nome: 'Brig Eagle 780',
    tipo: 'Zodíaco',
    ano: 2022,
    comprimento: '7.8 m',
    motor: 'Suzuki DF250',
    propulsao: 'motor',
    local: 'Setúbal, Portugal',
    bandeira: '🇵🇹',
    preco: '€ 48.500',
    precoNum: 48500,
    condicao: 'Como nova',
    vagas: 'Venda',
    cor: '#b45309',
    desc: 'Semi-rígido premium para passeios costeiros rápidos. Casco alumínio, console central, GPS e VHF de série. Horas de uso mínimas.',
    specs: [
      { label: 'Capacidade', val: '8 pax' },
      { label: 'Motor', val: 'Suzuki 250cv' },
      { label: 'Casco', val: 'Alumínio' },
      { label: 'LOA', val: '7.8 m' },
    ],
    destaques: ['GPS Garmin', 'VHF', 'Âncora Elétrica'],
    destaque: false,
  },
  {
    id: 5,
    nome: 'Bavaria C45 Style',
    tipo: 'Veleiro',
    ano: 2020,
    comprimento: '13.7 m',
    motor: 'Volvo Penta 40cv',
    propulsao: 'vela',
    local: 'Vilamoura, Portugal',
    bandeira: '🇵🇹',
    preco: '€ 210.000',
    precoNum: 210000,
    condicao: 'Excelente',
    vagas: 'Venda',
    cor: '#4338ca',
    desc: 'Veleiro moderno com design contemporâneo e performance superior. Interior luminoso com grandes claraboias. Completo para cruzeiro oceânico.',
    specs: [
      { label: 'Camarotes', val: '3' },
      { label: 'Motor', val: 'Volvo Penta' },
      { label: 'Banheiros', val: '2' },
      { label: 'LOA', val: '13.7 m' },
    ],
    destaques: ['Furlex', 'Spinnaker', 'Chart Pilot'],
    destaque: false,
  },
  {
    id: 6,
    nome: 'Azimut 50 Iate a Motor',
    tipo: 'Iate',
    ano: 2015,
    comprimento: '15.2 m',
    motor: 'Volvo IPS 600',
    propulsao: 'motor',
    local: 'Lisboa, Portugal',
    bandeira: '🇵🇹',
    preco: '€ 380.000',
    precoNum: 380000,
    condicao: 'Bom estado',
    vagas: 'Venda',
    cor: '#7c3aed',
    desc: 'Iate de luxo com acabamentos premium. Salão amplo, cozinha completa, fly-bridge. Propulsão IPS altamente eficiente. Histórico Azimut Service.',
    specs: [
      { label: 'Camarotes', val: '3' },
      { label: 'Motores', val: 'Volvo IPS 600' },
      { label: 'Fly-Bridge', val: 'Sim' },
      { label: 'LOA', val: '15.2 m' },
    ],
    destaques: ['Bow Thruster', 'Joystick', 'Ar Condicionado'],
    destaque: false,
  },
];

const condicaoCor: Record<string, string> = {
  'Como nova':   'bg-emerald-100 text-emerald-700',
  'Excelente':   'bg-blue-100 text-blue-700',
  'Seminova':    'bg-cyan-100 text-cyan-700',
  'Bom estado':  'bg-amber-100 text-amber-700',
};

export function NegocieEmbarcacoesPage({ onBack }: NegocieEmbarcacoesPageProps) {
  const [tipoAtivo, setTipoAtivo] = useState('Todos');
  const [busca, setBusca]         = useState('');
  const [ordem, setOrdem]         = useState('Mais recentes');
  const [showOrdem, setShowOrdem] = useState(false);
  const [favoritos, setFavoritos] = useState<number[]>([]);

  useEffect(() => {
    document.title = 'Negocie Embarcações | NorthWindy Charters';
    return () => { document.title = 'NorthWindy Charters'; };
  }, []);

  const toggleFav = (id: number) =>
    setFavoritos(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);

  let lista = EMBARCACOES.filter(e => {
    const matchTipo  = tipoAtivo === 'Todos' || e.tipo === tipoAtivo;
    const matchBusca = busca === '' || e.nome.toLowerCase().includes(busca.toLowerCase()) || e.tipo.toLowerCase().includes(busca.toLowerCase());
    return matchTipo && matchBusca;
  });

  if (ordem === 'Menor preço')     lista = [...lista].sort((a, b) => a.precoNum - b.precoNum);
  if (ordem === 'Maior preço')     lista = [...lista].sort((a, b) => b.precoNum - a.precoNum);
  if (ordem === 'Menor comprimento') lista = [...lista].sort((a, b) => parseFloat(a.comprimento) - parseFloat(b.comprimento));

  const destaques = lista.filter(e => e.destaque);
  const normais   = lista.filter(e => !e.destaque);

  return (
    <div className="min-h-screen bg-[#f4f6f9]">
      <style>{`
        * { scrollbar-width: none; -ms-overflow-style: none; }
        *::-webkit-scrollbar { display: none; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fadeUp 0.45s ease forwards; }
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
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0B1F3A] via-[#0d2a50] to-[#1a4060] text-white px-6 md:px-16 pt-16 pb-28">
        {/* Diagonal line pattern */}
        <div className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: 'repeating-linear-gradient(-45deg, #fff 0px, #fff 1px, transparent 1px, transparent 12px)',
          }} />
        {/* Nautical compass decoration */}
        <div className="absolute right-10 top-1/2 -translate-y-1/2 opacity-[0.06] hidden md:block">
          <Anchor className="w-64 h-64 text-white" />
        </div>
        {/* White wave cutout at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-[#f4f6f9]"
          style={{ clipPath: 'ellipse(55% 100% at 50% 100%)' }} />

        <div className="relative max-w-3xl fade-up">
          <span className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6">
            <Ship className="w-3 h-3" /> Compra & Venda
          </span>
          <h1 className="text-4xl md:text-6xl font-black uppercase italic leading-none mb-5">
            Negocie<br />Embarcações
          </h1>
          <p className="text-blue-200 text-base font-bold max-w-xl mb-10">
            Encontre o iate ideal ou anuncie a sua embarcação para compradores qualificados em Portugal e Brasil.
          </p>

          {/* Search bar */}
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Nome, tipo de embarcação…"
              value={busca}
              onChange={e => setBusca(e.target.value)}
              className="w-full pl-11 pr-4 py-4 rounded-2xl bg-white text-blue-900 font-bold text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-xl"
            />
          </div>
        </div>
      </section>

      {/* Stats */}
      <div className="bg-white border-b border-gray-100 py-5 px-6 md:px-16">
        <div className="max-w-5xl mx-auto flex items-center justify-between flex-wrap gap-4">
          {[
            { label: 'Anúncios',   val: `${lista.length}` },
            { label: 'Tipos',      val: '6' },
            { label: 'Países',     val: 'PT · BR' },
            { label: 'Valor Total', val: '> 1M €' },
          ].map((s, i) => (
            <div key={i} className="text-center flex-1 min-w-[80px]">
              <p className="text-2xl font-black text-blue-900 italic">{s.val}</p>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filters + Sort */}
      <div className="px-6 md:px-16 py-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <SlidersHorizontal className="w-4 h-4 text-gray-400 mr-1 shrink-0" />
            {TIPOS.map(t => (
              <button
                key={t}
                onClick={() => setTipoAtivo(t)}
                className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wide transition-all ${
                  tipoAtivo === t
                    ? 'bg-blue-900 text-white shadow-lg shadow-blue-900/20'
                    : 'bg-white text-gray-500 border border-gray-200 hover:border-blue-900 hover:text-blue-900'
                }`}>
                {t}
              </button>
            ))}
          </div>

          {/* Sort dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowOrdem(!showOrdem)}
              className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-gray-500 bg-white border border-gray-200 px-4 py-2 rounded-full hover:border-blue-900 hover:text-blue-900 transition-all">
              <ArrowUpDown className="w-3.5 h-3.5" />
              {ordem}
            </button>
            {showOrdem && (
              <div className="absolute right-0 top-full mt-2 w-44 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden z-20">
                {ORDENAR.map(o => (
                  <button
                    key={o}
                    onClick={() => { setOrdem(o); setShowOrdem(false); }}
                    className={`w-full text-left px-4 py-3 text-xs font-black uppercase tracking-wide transition-colors ${
                      ordem === o ? 'bg-blue-50 text-blue-900' : 'text-gray-500 hover:bg-gray-50'
                    }`}>
                    {o}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Destaques */}
        {destaques.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <Tag className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Anúncios em Destaque</span>
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              {destaques.map((e, i) => (
                <EmbarcacaoCard key={e.id} emb={e} delay={i * 80} destaque
                  favorito={favoritos.includes(e.id)} onFav={toggleFav} />
              ))}
            </div>
          </div>
        )}

        {/* Lista normal */}
        {normais.length > 0 && (
          <div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Todos os anúncios</p>
            <div className="grid md:grid-cols-2 gap-5">
              {normais.map((e, i) => (
                <EmbarcacaoCard key={e.id} emb={e} delay={i * 60}
                  favorito={favoritos.includes(e.id)} onFav={toggleFav} />
              ))}
            </div>
          </div>
        )}

        {lista.length === 0 && (
          <div className="text-center py-20">
            <Waves className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="font-black text-gray-300 text-lg uppercase italic">Nenhuma embarcação encontrada</p>
            <p className="text-gray-400 text-sm font-bold mt-2">Tente outro tipo ou limpe a pesquisa</p>
          </div>
        )}
      </div>

      {/* CTA */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0B1F3A] to-[#1a4060] text-white px-6 md:px-16 py-20 mt-10">
        <div className="absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: 'repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 20px)' }} />
        <div className="relative max-w-2xl mx-auto text-center">
          <Ship className="w-10 h-10 mx-auto mb-5 text-blue-300" />
          <h2 className="text-3xl font-black uppercase italic mb-4">Quer anunciar a sua embarcação?</h2>
          <p className="text-blue-200 font-bold mb-8 max-w-md mx-auto">
            Chegue a compradores qualificados em Portugal e Brasil. Publicação simples e rápida.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="mailto:anuncio@northwindy.com"
              className="inline-flex items-center justify-center gap-2 bg-white text-blue-900 px-8 py-4 rounded-full font-black uppercase text-sm transition-all hover:scale-105 shadow-xl">
              Publicar Anúncio <ChevronRight className="w-4 h-4" />
            </a>
            <a href="mailto:anuncio@northwindy.com"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-8 py-4 rounded-full font-black uppercase text-sm transition-all">
              Avaliação Gratuita
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 text-center text-xs text-gray-400 font-bold uppercase tracking-widest bg-white">
        © {new Date().getFullYear()} NorthWindy Charters · Todos os direitos reservados
      </footer>
    </div>
  );
}

function EmbarcacaoCard({
  emb, delay = 0, destaque = false, favorito, onFav,
}: {
  emb: typeof EMBARCACOES[0];
  delay?: number;
  destaque?: boolean;
  favorito: boolean;
  onFav: (id: number) => void;
}) {
  return (
    <div
      className={`group relative bg-white rounded-[24px] overflow-hidden border-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
        destaque ? 'border-blue-900/20 shadow-lg shadow-blue-900/10' : 'border-gray-100 hover:border-blue-200'
      }`}
      style={{ animationDelay: `${delay}ms` }}>

      {destaque && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-900 via-blue-500 to-amber-400 z-10" />
      )}

      {/* Visual top band with price overlay */}
      <div className="relative h-24 flex items-center justify-center overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${emb.cor}ee, ${emb.cor}99)` }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'repeating-linear-gradient(-45deg, #fff 0, #fff 1px, transparent 0, transparent 10px)' }} />

        {/* Propulsion icon */}
        <div className="relative opacity-20">
          {emb.propulsao === 'vela'
            ? <Anchor className="w-20 h-20 text-white" />
            : <Fuel className="w-16 h-16 text-white" />}
        </div>

        {/* Actions */}
        <div className="absolute top-3 right-3 flex gap-2">
          <button
            onClick={() => onFav(emb.id)}
            className="w-8 h-8 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center transition-all hover:scale-110">
            <Heart className={`w-4 h-4 ${favorito ? 'fill-red-400 text-red-400' : 'text-white'}`} />
          </button>
          <button className="w-8 h-8 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center transition-all hover:scale-110">
            <Share2 className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Condition badge */}
        <div className="absolute bottom-3 left-3">
          <span className={`text-[10px] font-black uppercase tracking-wide px-2.5 py-1 rounded-full ${condicaoCor[emb.condicao] ?? 'bg-white/20 text-white'}`}>
            {emb.condicao}
          </span>
        </div>

        {destaque && (
          <div className="absolute bottom-3 right-3">
            <span className="text-[10px] font-black uppercase tracking-wide bg-amber-400 text-amber-900 px-2.5 py-1 rounded-full">
              Destaque
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full">
                {emb.tipo}
              </span>
              <span className="text-[10px] text-gray-400 font-bold">{emb.ano}</span>
            </div>
            <h3 className="font-black text-blue-900 text-base leading-snug group-hover:text-blue-700 transition-colors">
              {emb.nome}
            </h3>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1 text-xs text-gray-400 font-bold mb-4">
          <MapPin className="w-3 h-3" /> {emb.local} {emb.bandeira}
        </div>

        {/* Specs grid */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {emb.specs.map(s => (
            <div key={s.label} className="bg-gray-50 rounded-xl px-3 py-2">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{s.label}</p>
              <p className="text-xs font-black text-blue-900">{s.val}</p>
            </div>
          ))}
        </div>

        {/* Description */}
        <p className="text-gray-500 text-xs font-bold leading-relaxed mb-4 line-clamp-2">{emb.desc}</p>

        {/* Extras chips */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {emb.destaques.map(d => (
            <span key={d} className="flex items-center gap-1 bg-gray-100 text-gray-500 text-[10px] font-black uppercase tracking-wide px-2.5 py-1 rounded-full">
              <Zap className="w-2.5 h-2.5" /> {d}
            </span>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Preço</p>
            <p className="font-black text-blue-900 text-lg leading-none">{emb.preco}</p>
          </div>
          <button className="flex items-center gap-1.5 bg-blue-900 hover:bg-blue-800 text-white text-xs font-black uppercase tracking-wide px-5 py-2.5 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-md shadow-blue-900/20">
            Ver Detalhes <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
