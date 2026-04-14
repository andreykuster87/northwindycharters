// src/components/shared/PecasMotoresTab.tsx
import { useState } from 'react';
import {
  Search, SlidersHorizontal, Wrench, ChevronRight, Heart, MapPin,
  Settings, ImagePlus, X, Plus,
} from 'lucide-react';
import type { MarketplaceRole } from './MarketplaceTab';
import { ProductDetailModal } from './ProductDetailModal';

/* ── tipos ────────────────────────────────────────────────────────────────── */
interface Spec { l: string; v: string }
interface Peca {
  id: number;
  destaque: boolean;
  nome: string;
  categoria: string;
  marca: string;
  preco: string;
  precoNum: number;
  condicao: string;
  potencia: string;
  pais: string;
  estado: string;
  cidade: string;
  bandeira: string;
  descricao: string;
  specs: Spec[];
  cor: string;
  fotos: string[];
}

/* ── dados de exemplo ─────────────────────────────────────────────────────── */
const CATEGORIAS = ['Todos', 'Motores', 'Hélices', 'Eletrônica', 'Filtros', 'Turbinas', 'Eixos e Câmbios'];

const PECAS: Peca[] = [
  {
    id: 1, destaque: true,
    nome: 'Motor Fora de Borda Yamaha F115',
    categoria: 'Motores', marca: 'Yamaha',
    preco: '€ 14.500,00', precoNum: 14500, condicao: 'Novo', potencia: '115 cv',
    pais: 'Portugal', estado: 'Lisboa', cidade: 'Lisboa', bandeira: '🇵🇹',
    descricao: 'Motor 4 tempos 115cv, injeção eletrônica, partida elétrica. Garantia 3 anos. Inclui controle remoto e cabo de comando.',
    specs: [{ l: 'Potência', v: '115 cv' }, { l: 'Cilindros', v: '4' }, { l: 'Peso', v: '163 kg' }, { l: 'Garantia', v: '3 anos' }],
    cor: '#1d4ed8',
    fotos: [
      'https://images.unsplash.com/photo-1605281317010-fe5ffe798166?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1622015663319-e97e697503ee?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&h=500&fit=crop',
    ],
  },
  {
    id: 2, destaque: true,
    nome: 'Motor de Centro Volvo Penta D4-300',
    categoria: 'Motores', marca: 'Volvo Penta',
    preco: '€ 28.900,00', precoNum: 28900, condicao: 'Seminovo', potencia: '300 cv',
    pais: 'Portugal', estado: 'Porto', cidade: 'Porto', bandeira: '🇵🇹',
    descricao: 'Motor diesel de centro 300cv com intercooler. Baixas horas de uso — 240h. Ótimas condições. Revisão completa realizada.',
    specs: [{ l: 'Potência', v: '300 cv' }, { l: 'Horas', v: '240h' }, { l: 'Combustível', v: 'Diesel' }, { l: 'Turbo', v: 'Sim' }],
    cor: '#0B1F3A',
    fotos: [
      'https://images.unsplash.com/photo-1622015663319-e97e697503ee?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1605281317010-fe5ffe798166?w=800&h=500&fit=crop',
    ],
  },
  {
    id: 3, destaque: false,
    nome: 'Hélice 3 Pás Alumínio 15x15',
    categoria: 'Hélices', marca: 'Michigan Wheel',
    preco: '€ 189,00', precoNum: 189, condicao: 'Novo', potencia: 'Até 150 cv',
    pais: 'Portugal', estado: 'Lisboa', cidade: 'Cascais', bandeira: '🇵🇹',
    descricao: 'Hélice alumínio 3 pás 15×15 para motores de 75 a 150cv. Passo direito. Balanceada de fábrica.',
    specs: [{ l: 'Diâmetro', v: '15"' }, { l: 'Passo', v: '15"' }, { l: 'Pás', v: '3' }, { l: 'Material', v: 'Alumínio' }],
    cor: '#6b7280',
    fotos: [
      'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&h=500&fit=crop',
    ],
  },
  {
    id: 4, destaque: false,
    nome: 'Kit Filtro Combustível Racor 500',
    categoria: 'Filtros', marca: 'Racor',
    preco: '€ 89,00', precoNum: 89, condicao: 'Novo', potencia: 'Universal',
    pais: 'Brasil', estado: 'São Paulo', cidade: 'Santos', bandeira: '🇧🇷',
    descricao: 'Kit separador água/combustível Racor 500FG. Inclui filtro, transparente e suporte. Compatível com diesel e gasolina.',
    specs: [{ l: 'Fluxo', v: '150 L/h' }, { l: 'Micron', v: '30μm' }, { l: 'Rosca', v: '1/4 SAE' }, { l: 'Bowl', v: 'Transparente' }],
    cor: '#b45309',
    fotos: [
      'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=500&fit=crop',
    ],
  },
  {
    id: 5, destaque: false,
    nome: 'Caixa de Câmbio Mercruiser Alpha One Gen II',
    categoria: 'Eixos e Câmbios', marca: 'Mercruiser',
    preco: '€ 3.200,00', precoNum: 3200, condicao: 'Recondicionado', potencia: 'Até 350 cv',
    pais: 'Portugal', estado: 'Algarve', cidade: 'Faro', bandeira: '🇵🇹',
    descricao: 'Rabeta Alpha One Gen II recondicionada com garantia de 6 meses. Substituição completa de juntas e vedações.',
    specs: [{ l: 'Modelo', v: 'Alpha One' }, { l: 'Geração', v: 'Gen II' }, { l: 'Garantia', v: '6 meses' }, { l: 'Max cv', v: '350' }],
    cor: '#7c3aed',
    fotos: [
      'https://images.unsplash.com/photo-1621277224630-81a0a0e33827?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1622015663319-e97e697503ee?w=800&h=500&fit=crop',
    ],
  },
  {
    id: 6, destaque: false,
    nome: 'Alternador Marinho Balmar 614',
    categoria: 'Eletrônica', marca: 'Balmar',
    preco: '€ 445,00', precoNum: 445, condicao: 'Novo', potencia: '100A',
    pais: 'Brasil', estado: 'Rio de Janeiro', cidade: 'Rio de Janeiro', bandeira: '🇧🇷',
    descricao: 'Alternador marinho de alto rendimento 100A para veleiros e lanchas. Alta eficiência de carga. Acompanha regulador externo.',
    specs: [{ l: 'Corrente', v: '100A' }, { l: 'Tensão', v: '12/24V' }, { l: 'Polias', v: 'Dupla' }, { l: 'Peso', v: '4.5 kg' }],
    cor: '#059669',
    fotos: [
      'https://images.unsplash.com/photo-1620246814956-9951af3d241e?w=800&h=500&fit=crop',
    ],
  },
];

const condicaoCor: Record<string, string> = {
  'Novo':            'bg-emerald-100 text-emerald-700',
  'Seminovo':        'bg-cyan-100 text-cyan-700',
  'Recondicionado':  'bg-amber-100 text-amber-700',
  'Usado':           'bg-gray-100 text-gray-600',
};

/* ── formulário de publicação ─────────────────────────────────────────────── */
function NovaPecaForm({ onClose }: { onClose: () => void }) {
  const [fotos, setFotos]         = useState<string[]>([]);
  const [nome, setNome]           = useState('');
  const [categoria, setCategoria] = useState('Motores');
  const [marca, setMarca]         = useState('');
  const [preco, setPreco]         = useState('');
  const [condicao, setCondicao]   = useState('Novo');
  const [potencia, setPotencia]   = useState('');
  const [pais, setPais]           = useState('');
  const [estado, setEstado]       = useState('');
  const [cidade, setCidade]       = useState('');
  const [descricao, setDescricao] = useState('');
  const [specs, setSpecs]         = useState([{ l: '', v: '' }, { l: '', v: '' }]);

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
  const updateSpec = (i: number, field: 'l' | 'v', val: string) =>
    setSpecs(s => s.map((sp, j) => j === i ? { ...sp, [field]: val } : sp));
  const addSpec = () => setSpecs(s => [...s, { l: '', v: '' }]);

  const valid = nome && marca && preco && pais && cidade && descricao;

  return (
    <div className="bg-white border-2 border-[#c9a96e]/30 p-5 space-y-4 shadow-lg shadow-[#0a1628]/5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-[#1a2b4a] text-sm uppercase tracking-[0.15em]">Nova Peça / Motor</h3>
        <button onClick={onClose} className="w-7 h-7 bg-gray-100 flex items-center justify-center hover:bg-gray-200">
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* fotos */}
      <div>
        <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-2">Fotos ({fotos.length}/5)</label>
        <div className="flex gap-2 flex-wrap">
          {fotos.map((src, i) => (
            <div key={i} className="relative w-20 h-20 overflow-hidden">
              <img src={src} className="w-full h-full object-cover" alt="" />
              <button onClick={() => removeFoto(i)}
                className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center">
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
            <option>Novo</option><option>Seminovo</option><option>Recondicionado</option><option>Usado</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Preço *</label>
          <input value={preco} onChange={e => setPreco(e.target.value)} placeholder="€ 0,00"
            className="w-full px-3 py-2 border-2 border-gray-100 text-sm font-bold text-[#1a2b4a] focus:outline-none focus:border-[#c9a96e]" />
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Potência / Capacidade</label>
          <input value={potencia} onChange={e => setPotencia(e.target.value)} placeholder="ex: 115 cv"
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
        <div className="sm:col-span-2">
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

      {/* Specs dinâmicas */}
      <div>
        <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Especificações</label>
        <div className="space-y-2">
          {specs.map((s, i) => (
            <div key={i} className="grid grid-cols-2 gap-2">
              <input value={s.l} onChange={e => updateSpec(i, 'l', e.target.value)} placeholder="Ex: Potência"
                className="px-3 py-2 border-2 border-gray-100 text-xs font-bold text-[#1a2b4a] focus:outline-none focus:border-[#c9a96e]" />
              <input value={s.v} onChange={e => updateSpec(i, 'v', e.target.value)} placeholder="Ex: 115 cv"
                className="px-3 py-2 border-2 border-gray-100 text-xs font-bold text-[#1a2b4a] focus:outline-none focus:border-[#c9a96e]" />
            </div>
          ))}
        </div>
        <button onClick={addSpec} className="mt-2 text-[10px] font-semibold text-[#c9a96e] uppercase hover:text-[#1a2b4a] flex items-center gap-1">
          <Plus className="w-3 h-3" /> Adicionar especificação
        </button>
      </div>

      <button disabled={!valid}
        className="w-full py-3 font-semibold text-sm uppercase text-white bg-[#0a1628] shadow-lg shadow-[#0a1628]/20 disabled:opacity-40 transition-all hover:scale-[1.01]">
        Publicar Peça / Motor
      </button>
    </div>
  );
}

/* ── componente principal ─────────────────────────────────────────────────── */
export function PecasMotoresTab({ role }: { role?: MarketplaceRole }) {
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todos');
  const [busca, setBusca]                   = useState('');
  const [favs, setFavs]                     = useState<number[]>([]);
  const [showForm, setShowForm]             = useState(false);
  const [selected, setSelected]             = useState<Peca | null>(null);

  const lista = PECAS.filter(p => {
    const matchCat   = categoriaAtiva === 'Todos' || p.categoria === categoriaAtiva;
    const matchBusca = busca === '' || p.nome.toLowerCase().includes(busca.toLowerCase()) || p.marca.toLowerCase().includes(busca.toLowerCase());
    return matchCat && matchBusca;
  });

  const toggleFav = (id: number) =>
    setFavs(p => p.includes(id) ? p.filter(f => f !== id) : [...p, id]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-['Playfair_Display'] font-bold text-[#1a2b4a]">Peças e Motores</h2>
        <p className="text-xs text-gray-400 font-bold mt-0.5">Motores, hélices, peças e componentes náuticos</p>
      </div>

      {/* CTA Publicar */}
      {role && (
        <button onClick={() => setShowForm(f => !f)}
          className="w-full flex items-center justify-center gap-2 py-3.5 font-semibold text-sm uppercase text-white bg-[#0a1628] shadow-lg shadow-[#0a1628]/20 transition-all hover:scale-[1.01]">
          <Plus className="w-4 h-4" />
          {showForm ? 'Fechar Formulário' : 'Publicar Peça / Motor'}
        </button>
      )}
      {showForm && <NovaPecaForm onClose={() => setShowForm(false)} />}

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
          <p className="text-[9px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em]">Anúncios</p>
        </div>
        <div className="bg-rose-50 px-4 py-2 text-center">
          <p className="text-xl font-bold text-rose-700 italic">{favs.length}</p>
          <p className="text-[9px] font-semibold text-rose-400 uppercase tracking-[0.15em]">Favoritos</p>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lista.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-white border border-gray-100">
            <Wrench className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="font-semibold text-gray-300 uppercase italic">Nenhuma peça encontrada</p>
          </div>
        ) : lista.map(p => (
          <div key={p.id}
            className="group bg-white overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
            {/* Foto */}
            <div className="relative overflow-hidden" style={{ height: 240 }}>
              {p.fotos[0] ? (
                <img src={p.fotos[0]} alt={p.nome}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${p.cor}cc, ${p.cor}55)` }}>
                  <Settings className="w-16 h-16 text-white/20" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              <div className="absolute top-3 left-3 flex items-center gap-1.5">
                {p.destaque && <span className="text-[9px] font-semibold uppercase bg-[#c9a96e] text-white px-2 py-0.5 tracking-wider">Destaque</span>}
                <span className={`text-[9px] font-semibold uppercase px-2 py-0.5 tracking-wider ${condicaoCor[p.condicao] ?? 'bg-white text-gray-700'}`}>{p.condicao}</span>
              </div>
              <button onClick={() => toggleFav(p.id)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center transition-all hover:scale-110">
                <Heart className={`w-4 h-4 ${favs.includes(p.id) ? 'fill-red-400 text-red-400' : 'text-white'}`} />
              </button>
              <div className="absolute bottom-3 right-3">
                <span className="bg-white text-[#0a1628] font-bold text-sm px-3 py-1 tracking-wide">{p.preco}</span>
              </div>
            </div>
            {/* Body */}
            <div className="p-5 border-b border-gray-100">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#c9a96e] mb-2">
                {p.categoria} · {p.marca}
              </p>
              <h3 className="text-xl font-bold text-[#0a1628] leading-snug mb-2 group-hover:text-[#1a2b4a] transition-colors"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                {p.nome}
              </h3>
              <p className="flex items-center gap-1 text-xs text-gray-400 font-medium mb-4">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                {p.cidade}, {p.estado} — {p.pais} {p.bandeira}
              </p>
              <div className="grid grid-cols-4 gap-2 mb-4">
                {p.specs.map(s => (
                  <div key={s.l} className="text-center">
                    <p className="text-[8px] font-semibold text-gray-400 uppercase tracking-wider">{s.l}</p>
                    <p className="text-xs font-bold text-[#0a1628] mt-0.5">{s.v}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 leading-relaxed mb-4 line-clamp-2">{p.descricao}</p>
              <button onClick={() => setSelected(p)}
                className="flex items-center gap-2 text-[#0a1628] font-bold text-xs uppercase tracking-widest hover:gap-3 transition-all group/cta">
                Ver Detalhes
                <ChevronRight className="w-3.5 h-3.5 text-[#c9a96e] group-hover/cta:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        ))}
      </div>

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
            ...selected.specs.map(s => ({ label: s.l, value: s.v })),
            { label: 'Potência', value: selected.potencia },
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
