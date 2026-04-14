// src/components/shared/AcessoriosTab.tsx
import { useState } from 'react';
import {
  Search, SlidersHorizontal, ShoppingBag, ChevronRight, Heart,
  MapPin, Star, Tag, ImagePlus, X, Plus,
} from 'lucide-react';
import type { MarketplaceRole } from './MarketplaceTab';
import { ProductDetailModal } from './ProductDetailModal';

/* ── tipos ────────────────────────────────────────────────────────────────── */
interface Acessorio {
  id: number;
  destaque: boolean;
  nome: string;
  categoria: string;
  marca: string;
  preco: string;
  precoNum: number;
  condicao: string;
  pais: string;
  estado: string;
  cidade: string;
  bandeira: string;
  descricao: string;
  avaliacao: number;
  cor: string;
  tag: string | null;
  fotos: string[];
}

/* ── dados de exemplo ─────────────────────────────────────────────────────── */
const CATEGORIAS = ['Todos', 'Segurança', 'Navegação', 'Vestuário', 'Eletrónica', 'Âncoras e Cabos', 'Limpeza'];

const ACESSORIOS: Acessorio[] = [
  {
    id: 1, destaque: true,
    nome: 'Colete Salva-Vidas Automático 150N',
    categoria: 'Segurança', marca: 'Plastimo',
    preco: '€ 89,90', precoNum: 89.9, condicao: 'Novo',
    pais: 'Portugal', estado: 'Lisboa', cidade: 'Lisboa', bandeira: '🇵🇹',
    descricao: 'Colete inflável automático 150N certificado ISO 12402-3. Homologado para uso offshore. Inclui luz e apito de sinalização.',
    avaliacao: 4.8, cor: '#dc2626', tag: 'Mais vendido',
    fotos: [
      'https://images.unsplash.com/photo-1564415051543-cb73836d5be2?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=500&fit=crop',
    ],
  },
  {
    id: 2, destaque: true,
    nome: 'GPS Chartplotter Garmin GPSMAP 943',
    categoria: 'Navegação', marca: 'Garmin',
    preco: '€ 1.249,00', precoNum: 1249, condicao: 'Novo',
    pais: 'Portugal', estado: 'Porto', cidade: 'Porto', bandeira: '🇵🇹',
    descricao: 'Ecrã de 9" com cartas Navionics+ incluídas. Wi-Fi, NMEA 2000, sonar integrado. Compatível com radar e câmeras.',
    avaliacao: 4.9, cor: '#1d4ed8', tag: 'Premium',
    fotos: [
      'https://images.unsplash.com/photo-1551524559-8af4e6624178?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1530982011887-3cc11cc85693?w=800&h=500&fit=crop',
    ],
  },
  {
    id: 3, destaque: false,
    nome: 'Fato de Oleado Henri Lloyd Force 6',
    categoria: 'Vestuário', marca: 'Henri Lloyd',
    preco: '€ 349,00', precoNum: 349, condicao: 'Novo',
    pais: 'Portugal', estado: 'Lisboa', cidade: 'Cascais', bandeira: '🇵🇹',
    descricao: 'Fato de chuva 3 camadas para offshore. Costuras soldadas, capuz ajustável. Reflectores de alta visibilidade.',
    avaliacao: 4.7, cor: '#0e7490', tag: null,
    fotos: [
      'https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=500&fit=crop',
    ],
  },
  {
    id: 4, destaque: false,
    nome: 'VHF Portátil Standard Horizon HX210',
    categoria: 'Eletrónica', marca: 'Standard Horizon',
    preco: '€ 139,00', precoNum: 139, condicao: 'Novo',
    pais: 'Brasil', estado: 'São Paulo', cidade: 'Santos', bandeira: '🇧🇷',
    descricao: 'Rádio VHF portátil 6W flutuante com GPS integrado. Resistente à água IPX8. Bateria de longa duração.',
    avaliacao: 4.6, cor: '#0B1F3A', tag: null,
    fotos: [
      'https://images.unsplash.com/photo-1530982011887-3cc11cc85693?w=800&h=500&fit=crop',
    ],
  },
  {
    id: 5, destaque: false,
    nome: 'Âncora Delta 10kg Inox',
    categoria: 'Âncoras e Cabos', marca: 'Lewmar',
    preco: '€ 215,00', precoNum: 215, condicao: 'Novo',
    pais: 'Portugal', estado: 'Setúbal', cidade: 'Setúbal', bandeira: '🇵🇹',
    descricao: 'Âncora Delta em aço inoxidável para embarcações de 8-12m. Alta resistência de garrar. Acompanha 5m de corrente inox.',
    avaliacao: 4.5, cor: '#6b7280', tag: null,
    fotos: [
      'https://images.unsplash.com/photo-1534224039826-c7a0eda0e6b3?w=800&h=500&fit=crop',
    ],
  },
  {
    id: 6, destaque: false,
    nome: 'Kit de Limpeza Naval Star Brite',
    categoria: 'Limpeza', marca: 'Star Brite',
    preco: 'R$ 189,90', precoNum: 189.9, condicao: 'Novo',
    pais: 'Brasil', estado: 'Rio de Janeiro', cidade: 'Rio de Janeiro', bandeira: '🇧🇷',
    descricao: 'Kit completo com shampoo marinho, polish para fibra, cera protetora e removedor de manchas. Rende até 50 lavagens.',
    avaliacao: 4.4, cor: '#059669', tag: 'Kit',
    fotos: [
      'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=500&fit=crop',
    ],
  },
];

const condicaoCor: Record<string, string> = {
  'Novo':            'bg-emerald-100 text-emerald-700',
  'Usado':           'bg-amber-100 text-amber-700',
  'Recondicionado':  'bg-blue-100 text-blue-700',
};

/* ── formulário de publicação ─────────────────────────────────────────────── */
function NovoAcessorioForm({ onClose }: { onClose: () => void }) {
  const [fotos, setFotos]         = useState<string[]>([]);
  const [nome, setNome]           = useState('');
  const [categoria, setCategoria] = useState('Segurança');
  const [marca, setMarca]         = useState('');
  const [preco, setPreco]         = useState('');
  const [condicao, setCondicao]   = useState('Novo');
  const [pais, setPais]           = useState('');
  const [estado, setEstado]       = useState('');
  const [cidade, setCidade]       = useState('');
  const [descricao, setDescricao] = useState('');

  const handleFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) { alert('Foto deve ter no máximo 4 MB'); return; }
    if (fotos.length >= 5) { alert('Máximo de 5 fotos'); return; }
    const reader = new FileReader();
    reader.onload = () => setFotos(f => [...f, reader.result as string]);
    reader.readAsDataURL(file);
  };

  const removeFoto = (i: number) => setFotos(f => f.filter((_, j) => j !== i));

  const valid = nome && marca && preco && pais && cidade && descricao;

  return (
    <div className="bg-white border-2 border-[#c9a96e]/30 p-5 space-y-4 shadow-lg shadow-[#0a1628]/5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-[#1a2b4a] text-sm uppercase tracking-[0.15em]">Novo Acessório</h3>
        <button onClick={onClose} className="w-7 h-7 bg-gray-100 flex items-center justify-center hover:bg-gray-200">
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* fotos */}
      <div>
        <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-2">
          Fotos ({fotos.length}/5)
        </label>
        <div className="flex gap-2 flex-wrap">
          {fotos.map((src, i) => (
            <div key={i} className="relative w-20 h-20 overflow-hidden">
              <img src={src} className="w-full h-full object-cover" alt="" />
              <button onClick={() => removeFoto(i)}
                className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 flex items-center justify-center">
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          ))}
          {fotos.length < 5 && (
            <label className="w-20 h-20 flex flex-col items-center justify-center gap-1 border-2 border-dashed border-gray-200 cursor-pointer hover:border-[#c9a96e]/30 transition-colors">
              <ImagePlus className="w-5 h-5 text-gray-300" />
              <span className="text-[9px] text-gray-400 font-bold">Adicionar</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleFoto} />
            </label>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Nome *</label>
          <input value={nome} onChange={e => setNome(e.target.value)}
            className="w-full px-3 py-2 border-2 border-gray-100 text-sm font-bold text-[#1a2b4a] focus:outline-none focus:border-[#c9a96e]" />
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Marca *</label>
          <input value={marca} onChange={e => setMarca(e.target.value)}
            className="w-full px-3 py-2 border-2 border-gray-100 text-sm font-bold text-[#1a2b4a] focus:outline-none focus:border-[#c9a96e]" />
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Categoria</label>
          <select value={categoria} onChange={e => setCategoria(e.target.value)}
            className="w-full px-3 py-2 border-2 border-gray-100 text-sm font-bold text-[#1a2b4a] focus:outline-none focus:border-[#c9a96e]">
            {CATEGORIAS.filter(c => c !== 'Todos').map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Condição</label>
          <select value={condicao} onChange={e => setCondicao(e.target.value)}
            className="w-full px-3 py-2 border-2 border-gray-100 text-sm font-bold text-[#1a2b4a] focus:outline-none focus:border-[#c9a96e]">
            <option>Novo</option><option>Usado</option><option>Recondicionado</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Preço *</label>
          <input value={preco} onChange={e => setPreco(e.target.value)} placeholder="€ 0,00"
            className="w-full px-3 py-2 border-2 border-gray-100 text-sm font-bold text-[#1a2b4a] focus:outline-none focus:border-[#c9a96e]" />
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">País *</label>
          <input value={pais} onChange={e => setPais(e.target.value)} placeholder="Ex: Portugal"
            className="w-full px-3 py-2 border-2 border-gray-100 text-sm font-bold text-[#1a2b4a] focus:outline-none focus:border-[#c9a96e]" />
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Estado / Região</label>
          <input value={estado} onChange={e => setEstado(e.target.value)} placeholder="Ex: Lisboa"
            className="w-full px-3 py-2 border-2 border-gray-100 text-sm font-bold text-[#1a2b4a] focus:outline-none focus:border-[#c9a96e]" />
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Cidade *</label>
          <input value={cidade} onChange={e => setCidade(e.target.value)} placeholder="Ex: Cascais"
            className="w-full px-3 py-2 border-2 border-gray-100 text-sm font-bold text-[#1a2b4a] focus:outline-none focus:border-[#c9a96e]" />
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Descrição *</label>
        <textarea value={descricao} onChange={e => setDescricao(e.target.value)} rows={3}
          className="w-full px-3 py-2 border-2 border-gray-100 text-sm font-bold text-[#1a2b4a] focus:outline-none focus:border-[#c9a96e] resize-none" />
      </div>

      <button disabled={!valid}
        className="w-full py-3 font-semibold text-sm uppercase text-white bg-[#0a1628] shadow-lg shadow-[#0a1628]/20 disabled:opacity-40 transition-all hover:scale-[1.01]">
        Publicar Acessório
      </button>
    </div>
  );
}

/* ── componente principal ─────────────────────────────────────────────────── */
export function AcessoriosTab({ role }: { role?: MarketplaceRole }) {
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todos');
  const [busca, setBusca]                   = useState('');
  const [favs, setFavs]                     = useState<number[]>([]);
  const [showForm, setShowForm]             = useState(false);
  const [selected, setSelected]             = useState<Acessorio | null>(null);

  const lista = ACESSORIOS.filter(a => {
    const matchCat   = categoriaAtiva === 'Todos' || a.categoria === categoriaAtiva;
    const matchBusca = busca === '' || a.nome.toLowerCase().includes(busca.toLowerCase()) || a.marca.toLowerCase().includes(busca.toLowerCase());
    return matchCat && matchBusca;
  });

  const toggleFav = (id: number) =>
    setFavs(p => p.includes(id) ? p.filter(f => f !== id) : [...p, id]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-lg font-['Playfair_Display'] font-bold text-[#1a2b4a]">Acessórios Náuticos</h2>
        <p className="text-xs text-gray-400 font-bold mt-0.5">Equipamentos e acessórios para a sua embarcação</p>
      </div>

      {/* CTA Publicar */}
      {role && (
        <button onClick={() => setShowForm(f => !f)}
          className="w-full flex items-center justify-center gap-2 py-3.5 font-semibold text-sm uppercase text-white bg-[#0a1628] shadow-lg shadow-[#0a1628]/20 transition-all hover:scale-[1.01]">
          <Plus className="w-4 h-4" />
          {showForm ? 'Fechar Formulário' : 'Publicar Acessório'}
        </button>
      )}
      {showForm && <NovoAcessorioForm onClose={() => setShowForm(false)} />}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" placeholder="Nome ou marca…" value={busca}
          onChange={e => setBusca(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-white border-2 border-gray-100 text-[#1a2b4a] font-bold text-sm placeholder-gray-400 focus:outline-none focus:border-[#c9a96e]" />
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-2 flex-wrap">
        <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400" />
        {CATEGORIAS.map(c => (
          <button key={c} onClick={() => setCategoriaAtiva(c)}
            className={`px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide transition-all ${
              categoriaAtiva === c
                ? 'bg-[#0a1628] text-white shadow-md shadow-[#0a1628]/20'
                : 'bg-white text-gray-500 border border-gray-200 hover:border-[#c9a96e]/30 hover:text-[#1a2b4a]'
            }`}>
            {c}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="flex gap-3">
        <div className="bg-[#0a1628]/5 px-4 py-2 text-center">
          <p className="text-xl font-bold text-[#1a2b4a] italic">{lista.length}</p>
          <p className="text-[9px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em]">Produtos</p>
        </div>
        <div className="bg-rose-50 px-4 py-2 text-center">
          <p className="text-xl font-bold text-rose-700 italic">{favs.length}</p>
          <p className="text-[9px] font-semibold text-rose-400 uppercase tracking-[0.15em]">Favoritos</p>
        </div>
      </div>

      {/* Cards */}
      {lista.length === 0 ? (
        <div className="text-center py-16 bg-white border border-gray-100">
          <ShoppingBag className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="font-semibold text-gray-300 uppercase italic">Nenhum acessório encontrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lista.map(a => (
            <div key={a.id}
              className="group bg-white overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
              {/* Foto */}
              <div className="relative overflow-hidden" style={{ height: 240 }}>
                {a.fotos[0] ? (
                  <img src={a.fotos[0]} alt={a.nome}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center"
                    style={{ background: `linear-gradient(135deg, ${a.cor}cc, ${a.cor}55)` }}>
                    <ShoppingBag className="w-16 h-16 text-white/20" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  {a.destaque && <span className="text-[9px] font-semibold uppercase bg-[#c9a96e] text-white px-2 py-0.5 tracking-wider">Destaque</span>}
                  {a.tag && <span className="text-[9px] font-semibold uppercase bg-white text-[#0a1628] px-2 py-0.5 tracking-wider">{a.tag}</span>}
                </div>
                <button onClick={() => toggleFav(a.id)}
                  className="absolute top-3 right-3 w-8 h-8 bg-black/30 backdrop-blur-sm flex items-center justify-center transition-all hover:scale-110">
                  <Heart className={`w-4 h-4 ${favs.includes(a.id) ? 'fill-red-400 text-red-400' : 'text-white'}`} />
                </button>
                <div className="absolute bottom-3 right-3">
                  <span className="bg-white text-[#0a1628] font-bold text-sm px-3 py-1 tracking-wide">{a.preco}</span>
                </div>
              </div>
              {/* Body */}
              <div className="p-5 border-b border-gray-100">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#c9a96e] mb-2">
                  {a.categoria} · {a.marca}
                </p>
                <h3 className="text-xl font-bold text-[#0a1628] leading-snug mb-2 group-hover:text-[#1a2b4a] transition-colors"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                  {a.nome}
                </h3>
                <p className="flex items-center gap-1 text-xs text-gray-400 font-medium mb-3">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                  {a.cidade}, {a.estado} — {a.pais} {a.bandeira}
                </p>
                <div className="flex items-center gap-1 text-xs text-amber-500 font-bold mb-3">
                  <Star className="w-3.5 h-3.5 fill-amber-400" /> {a.avaliacao}
                </div>
                <p className="text-xs text-gray-500 leading-relaxed mb-4 line-clamp-2">{a.descricao}</p>
                <button onClick={() => setSelected(a)}
                  className="flex items-center gap-2 text-[#0a1628] font-bold text-xs uppercase tracking-widest hover:gap-3 transition-all group/cta">
                  Ver Detalhes
                  <ChevronRight className="w-3.5 h-3.5 text-[#c9a96e] group-hover/cta:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de detalhes */}
      {selected && (
        <ProductDetailModal
          title={selected.nome}
          subtitle={`${selected.marca} · ${selected.categoria}`}
          fotos={selected.fotos}
          price={selected.preco}
          location={`${selected.cidade}, ${selected.estado} — ${selected.pais} ${selected.bandeira}`}
          badge={selected.condicao}
          badgeColor={condicaoCor[selected.condicao] ?? 'bg-gray-100 text-gray-700'}
          specs={[
            { label: 'Marca', value: selected.marca },
            { label: 'Categoria', value: selected.categoria },
            { label: 'Condição', value: selected.condicao },
            { label: 'Avaliação', value: `${selected.avaliacao} ⭐` },
          ]}
          sections={[
            { title: 'Descrição', content: selected.descricao },
          ]}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
