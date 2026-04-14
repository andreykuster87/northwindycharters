// src/components/shared/NegocieTab.tsx
import { useState } from 'react';
import {
  MapPin, ChevronRight, Ship, Search,
  SlidersHorizontal, Heart, Plus, X,
  AlertCircle, ImagePlus, Bath, BedDouble, UtensilsCrossed, Sofa,
} from 'lucide-react';
import type { MarketplaceRole } from './MarketplaceTab';
import { ProductDetailModal } from './ProductDetailModal';

// ── Tipos ─────────────────────────────────────────────────────────────────────

const TIPOS = ['Todos', 'Veleiro', 'Lancha', 'Catamarã', 'Zodíaco', 'Iate'];

interface Embarcacao {
  id: number; destaque: boolean;
  nome: string; tipo: string; ano: number;
  comprimento: string; motor: string; propulsao: 'vela' | 'motor';
  pais: string; estado: string; cidade: string; bandeira: string;
  preco: string; precoNum: number; condicao: string;
  cor: string; fotos: string[];
  specs: { l: string; v: string }[];
  interior: { quartos: number; banheiros: number; sala: boolean; cozinha: boolean; cockpit: boolean; flybridge: boolean };
  tanques: { combustivel: string; agua_doce: string; aguas_negras: string };
  seguranca: string[];
  eletronica: string[];
  extras: string[];
}

// ── Dados ─────────────────────────────────────────────────────────────────────

const EMBARCACOES: Embarcacao[] = [
  {
    id: 1, destaque: true,
    nome: 'Jeanneau Sun Odyssey 440', tipo: 'Veleiro', ano: 2019,
    comprimento: '13.3 m', motor: 'Yanmar 40cv', propulsao: 'vela',
    pais: 'Portugal', estado: 'Lisboa', cidade: 'Cascais', bandeira: '🇵🇹',
    preco: '€ 189.000', precoNum: 189000, condicao: 'Excelente',
    cor: '#0B1F3A',
    fotos: [
      'https://images.unsplash.com/photo-1540946485063-a40da27545f8?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=500&fit=crop',
    ],
    specs: [{ l: 'Camarotes', v: '3' }, { l: 'Banheiros', v: '2' }, { l: 'LOA', v: '13.3 m' }, { l: 'Boca', v: '4.3 m' }, { l: 'Calado', v: '2.1 m' }, { l: 'Desloc.', v: '9.2 t' }, { l: 'Motor', v: '40cv' }, { l: 'Ano', v: '2019' }],
    interior: { quartos: 3, banheiros: 2, sala: true, cozinha: true, cockpit: true, flybridge: false },
    tanques: { combustivel: '200 L', agua_doce: '330 L', aguas_negras: '80 L' },
    seguranca: ['Balsa 6 pax', 'Extintores CO₂', 'Sinais pirotécnicos', 'Colete 150N x6'],
    eletronica: ['GPS Chartplotter', 'AIS', 'Autopiloto', 'VHF DSC', 'Radar 24nm'],
    extras: ['Bimini', 'Sprayhood', 'Lazy bag', 'Hélice de proa'],
  },
  {
    id: 2, destaque: true,
    nome: 'Regal 2600 Bowrider', tipo: 'Lancha', ano: 2021,
    comprimento: '7.9 m', motor: 'MerCruiser 300cv', propulsao: 'motor',
    pais: 'Brasil', estado: 'Paraná', cidade: 'Ilha do Mel', bandeira: '🇧🇷',
    preco: 'R$ 320.000', precoNum: 320000, condicao: 'Seminova',
    cor: '#1d4ed8',
    fotos: [
      'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1605281317010-fe5ffe798166?w=800&h=500&fit=crop',
    ],
    specs: [{ l: 'Capacidade', v: '10 pax' }, { l: 'Motor', v: '300cv' }, { l: 'LOA', v: '7.9 m' }, { l: 'Boca', v: '2.6 m' }, { l: 'Calado', v: '0.9 m' }, { l: 'Desloc.', v: '2.4 t' }, { l: 'Combust.', v: 'Gasolina' }, { l: 'Ano', v: '2021' }],
    interior: { quartos: 1, banheiros: 1, sala: false, cozinha: false, cockpit: true, flybridge: false },
    tanques: { combustivel: '280 L', agua_doce: '60 L', aguas_negras: '30 L' },
    seguranca: ['Coletes x10', 'Extintor', 'Bóia circular'],
    eletronica: ['GPS Garmin', 'Som Bluetooth', 'Luzes LED submersas'],
    extras: ['Bimini', 'Som BT', 'Kit Mergulho', 'Plataforma de popa'],
  },
  {
    id: 3, destaque: false,
    nome: 'Leopard 40 Catamarã', tipo: 'Catamarã', ano: 2017,
    comprimento: '12.2 m', motor: 'Yanmar 2× 29cv', propulsao: 'vela',
    pais: 'Portugal', estado: 'Algarve', cidade: 'Portimão', bandeira: '🇵🇹',
    preco: '€ 245.000', precoNum: 245000, condicao: 'Bom estado',
    cor: '#0e7490',
    fotos: [
      'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1540946485063-a40da27545f8?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&h=500&fit=crop',
    ],
    specs: [{ l: 'Camarotes', v: '4' }, { l: 'Banheiros', v: '4' }, { l: 'LOA', v: '12.2 m' }, { l: 'Boca', v: '6.7 m' }, { l: 'Calado', v: '1.2 m' }, { l: 'Desloc.', v: '8.4 t' }, { l: 'Motores', v: '2×29cv' }, { l: 'Ano', v: '2017' }],
    interior: { quartos: 4, banheiros: 4, sala: true, cozinha: true, cockpit: true, flybridge: true },
    tanques: { combustivel: '300 L', agua_doce: '600 L', aguas_negras: '120 L' },
    seguranca: ['Balsa 8 pax', 'EPIRB', 'MOB', 'Extintores x4'],
    eletronica: ['Chartplotter duplo', 'AIS', 'Radar', 'Autopiloto', 'Watermaker'],
    extras: ['Charter Ready', 'Gerador 6kW', 'Painéis solares 400W', 'Davits'],
  },
  {
    id: 4, destaque: false,
    nome: 'Brig Eagle 780', tipo: 'Zodíaco', ano: 2022,
    comprimento: '7.8 m', motor: 'Suzuki DF250', propulsao: 'motor',
    pais: 'Portugal', estado: 'Setúbal', cidade: 'Setúbal', bandeira: '🇵🇹',
    preco: '€ 48.500', precoNum: 48500, condicao: 'Como nova',
    cor: '#b45309',
    fotos: [
      'https://images.unsplash.com/photo-1605281317010-fe5ffe798166?w=800&h=500&fit=crop',
    ],
    specs: [{ l: 'Capacidade', v: '8 pax' }, { l: 'Motor', v: '250cv' }, { l: 'LOA', v: '7.8 m' }, { l: 'Boca', v: '2.8 m' }, { l: 'Calado', v: '0.5 m' }, { l: 'Desloc.', v: '0.9 t' }, { l: 'Tubo', v: 'Hypalon' }, { l: 'Ano', v: '2022' }],
    interior: { quartos: 0, banheiros: 0, sala: false, cozinha: false, cockpit: true, flybridge: false },
    tanques: { combustivel: '200 L', agua_doce: '—', aguas_negras: '—' },
    seguranca: ['Coletes x8', 'Extintor', 'Bóia'],
    eletronica: ['GPS Garmin', 'VHF', 'Sonda'],
    extras: ['T-top', 'Âncora Elétrica', 'Escada banho'],
  },
  {
    id: 5, destaque: false,
    nome: 'Azimut 50 Iate a Motor', tipo: 'Iate', ano: 2015,
    comprimento: '15.2 m', motor: 'Volvo IPS 600', propulsao: 'motor',
    pais: 'Portugal', estado: 'Lisboa', cidade: 'Lisboa', bandeira: '🇵🇹',
    preco: '€ 380.000', precoNum: 380000, condicao: 'Bom estado',
    cor: '#7c3aed',
    fotos: [
      'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1540946485063-a40da27545f8?w=800&h=500&fit=crop',
    ],
    specs: [{ l: 'Camarotes', v: '3' }, { l: 'Banheiros', v: '2' }, { l: 'LOA', v: '15.2 m' }, { l: 'Boca', v: '4.5 m' }, { l: 'Calado', v: '1.3 m' }, { l: 'Desloc.', v: '18 t' }, { l: 'Motor', v: 'IPS 600' }, { l: 'Ano', v: '2015' }],
    interior: { quartos: 3, banheiros: 2, sala: true, cozinha: true, cockpit: true, flybridge: true },
    tanques: { combustivel: '1200 L', agua_doce: '500 L', aguas_negras: '150 L' },
    seguranca: ['Balsa 8 pax', 'EPIRB', 'Extintores x6', 'MOB automático'],
    eletronica: ['Radar Raymarine', 'Chartplotter 12"', 'AIS', 'Bow Thruster', 'Joystick'],
    extras: ['Ar Condicionado', 'Gerador Onan', 'Bimini elétrico', 'Plataforma hidráulica'],
  },
];

const condicaoCor: Record<string, string> = {
  'Como nova':  'bg-emerald-100 text-emerald-700',
  'Excelente':  'bg-blue-100 text-blue-700',
  'Seminova':   'bg-cyan-100 text-cyan-700',
  'Bom estado': 'bg-amber-100 text-amber-700',
};

// ── Formulário de publicação ──────────────────────────────────────────────────

function NovoAnuncioForm({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  const [fotos, setFotos] = useState<string[]>([]);
  const [form, setForm] = useState({
    nome: '', tipo: 'Veleiro', ano: '', comprimento: '', motor: '',
    preco: '', condicao: 'Excelente',
    pais: '', estado: '', cidade: '',
    quartos: '', banheiros: '', cozinha: false, sala: false,
    combustivel: '', agua_doce: '',
    descricao: '', contacto: '',
  });
  const [error, setError] = useState<string | null>(null);

  const f = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));
  const inputCls = "w-full bg-gray-50 border-2 border-gray-100 py-3 px-4 font-bold text-[#1a2b4a] focus:border-[#c9a96e] outline-none text-sm placeholder:text-gray-300";
  const lbl = "text-[10px] font-semibold text-[#1a2b4a] uppercase tracking-[0.15em] ml-1 mb-1.5 block";

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) { setError('Máximo 4MB por foto.'); return; }
    if (fotos.length >= 5) { setError('Máximo de 5 fotos.'); return; }
    const reader = new FileReader();
    reader.onload = ev => setFotos(p => [...p, ev.target?.result as string]);
    reader.readAsDataURL(file);
  };

  const removeFoto = (i: number) => setFotos(p => p.filter((_, j) => j !== i));

  function handleSubmit() {
    if (!form.nome.trim()) { setError('Nome da embarcação é obrigatório.'); return; }
    if (!form.preco.trim()) { setError('Preço é obrigatório.'); return; }
    if (!form.pais.trim() || !form.cidade.trim()) { setError('País e cidade são obrigatórios.'); return; }
    if (!form.contacto.trim()) { setError('Contacto é obrigatório.'); return; }
    if (fotos.length === 0) { setError('Pelo menos 1 foto é obrigatória.'); return; }
    alert('Anúncio publicado com sucesso! A equipa NorthWindy irá rever e aprovar o seu anúncio.');
    onSuccess();
  }

  return (
    <div className="bg-white border-2 border-[#c9a96e]/20 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-[#1a2b4a] uppercase tracking-[0.15em]">Publicar Embarcação</p>
        <button onClick={onCancel} className="text-gray-400 hover:text-red-500 text-xs font-semibold">✕ Cancelar</button>
      </div>
      {error && (
        <div className="bg-red-50 border-2 border-red-100 px-4 py-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-red-700 font-bold text-xs">{error}</p>
        </div>
      )}

      {/* Fotos */}
      <div>
        <label className={lbl}>Fotos da Embarcação * ({fotos.length}/5)</label>
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
              <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
            </label>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className={lbl}>Nome da Embarcação *</label>
          <input value={form.nome} onChange={e => f('nome', e.target.value)} placeholder="Ex: Jeanneau Sun Odyssey 440" className={inputCls} />
        </div>
        <div>
          <label className={lbl}>Tipo *</label>
          <select value={form.tipo} onChange={e => f('tipo', e.target.value)} className={inputCls}>
            {TIPOS.filter(t => t !== 'Todos').map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className={lbl}>Ano</label>
          <input value={form.ano} onChange={e => f('ano', e.target.value)} placeholder="2020" className={inputCls} />
        </div>
        <div>
          <label className={lbl}>Comprimento</label>
          <input value={form.comprimento} onChange={e => f('comprimento', e.target.value)} placeholder="Ex: 13.3 m" className={inputCls} />
        </div>
        <div>
          <label className={lbl}>Motor</label>
          <input value={form.motor} onChange={e => f('motor', e.target.value)} placeholder="Ex: Yanmar 40cv" className={inputCls} />
        </div>
        <div>
          <label className={lbl}>Preço *</label>
          <input value={form.preco} onChange={e => f('preco', e.target.value)} placeholder="€ 189.000" className={inputCls} />
        </div>
        <div>
          <label className={lbl}>Condição</label>
          <select value={form.condicao} onChange={e => f('condicao', e.target.value)} className={inputCls}>
            {['Excelente', 'Seminova', 'Bom estado', 'Como nova'].map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Localização */}
      <p className="text-[10px] font-semibold text-[#1a2b4a] uppercase tracking-[0.15em] ml-1">Localização</p>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className={lbl}>País *</label>
          <input value={form.pais} onChange={e => f('pais', e.target.value)} placeholder="Portugal" className={inputCls} />
        </div>
        <div>
          <label className={lbl}>Estado / Região</label>
          <input value={form.estado} onChange={e => f('estado', e.target.value)} placeholder="Lisboa" className={inputCls} />
        </div>
        <div>
          <label className={lbl}>Cidade *</label>
          <input value={form.cidade} onChange={e => f('cidade', e.target.value)} placeholder="Cascais" className={inputCls} />
        </div>
      </div>

      {/* Interior */}
      <p className="text-[10px] font-semibold text-[#1a2b4a] uppercase tracking-[0.15em] ml-1">Interior</p>
      <div className="grid grid-cols-4 gap-3">
        <div>
          <label className={lbl}>Quartos</label>
          <input value={form.quartos} onChange={e => f('quartos', e.target.value)} placeholder="3" className={inputCls} />
        </div>
        <div>
          <label className={lbl}>Banheiros</label>
          <input value={form.banheiros} onChange={e => f('banheiros', e.target.value)} placeholder="2" className={inputCls} />
        </div>
        <label className="flex items-center gap-2 cursor-pointer col-span-1">
          <input type="checkbox" checked={form.cozinha} onChange={e => f('cozinha', e.target.checked)} className="w-4 h-4 border-gray-300 text-[#0a1628] focus:ring-[#c9a96e]" />
          <span className="text-[10px] font-semibold text-[#1a2b4a] uppercase">Cozinha</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer col-span-1">
          <input type="checkbox" checked={form.sala} onChange={e => f('sala', e.target.checked)} className="w-4 h-4 border-gray-300 text-[#0a1628] focus:ring-[#c9a96e]" />
          <span className="text-[10px] font-semibold text-[#1a2b4a] uppercase">Sala</span>
        </label>
      </div>

      {/* Tanques */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={lbl}>Tanque Combustível</label>
          <input value={form.combustivel} onChange={e => f('combustivel', e.target.value)} placeholder="200 L" className={inputCls} />
        </div>
        <div>
          <label className={lbl}>Tanque Água Doce</label>
          <input value={form.agua_doce} onChange={e => f('agua_doce', e.target.value)} placeholder="330 L" className={inputCls} />
        </div>
      </div>

      <div>
        <label className={lbl}>Descrição adicional</label>
        <textarea value={form.descricao} onChange={e => f('descricao', e.target.value)} rows={3}
          placeholder="Descreva detalhes extras, equipamentos, estado geral…"
          className="w-full bg-gray-50 border-2 border-gray-100 py-3 px-4 font-bold text-[#1a2b4a] focus:border-[#c9a96e] outline-none text-sm placeholder:text-gray-300 resize-none" />
      </div>

      <div>
        <label className={lbl}>Contacto (email ou telefone) *</label>
        <input value={form.contacto} onChange={e => f('contacto', e.target.value)} placeholder="+351 912 345 678 ou email@exemplo.com" className={inputCls} />
      </div>

      <button onClick={handleSubmit}
        className="w-full bg-[#0a1628] hover:bg-[#0a1628]/90 text-white py-4 font-semibold text-sm uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2">
        <Plus className="w-4 h-4" /> Publicar Embarcação
      </button>
    </div>
  );
}

// ── Card editorial ────────────────────────────────────────────────────────────

function EmbarcacaoCard({
  e, fav, onToggleFav, onVerDetalhes,
}: {
  e: Embarcacao; fav: boolean; onToggleFav: () => void; onVerDetalhes: () => void;
}) {
  const int = e.interior;

  return (
    <div
      className="group bg-white overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>

      {/* Foto */}
      <div className="relative overflow-hidden" style={{ height: 240 }}>
        <img
          src={e.fotos[0]} alt={e.nome}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* badges top-left */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          {e.destaque && (
            <span className="text-[9px] font-semibold uppercase bg-[#c9a96e] text-white px-2 py-0.5 tracking-wider">
              Destaque
            </span>
          )}
          <span className={`text-[9px] font-semibold uppercase px-2 py-0.5 tracking-wider ${condicaoCor[e.condicao] ?? 'bg-white text-gray-700'}`}>
            {e.condicao}
          </span>
        </div>

        {/* favorite */}
        <button onClick={e2 => { e2.stopPropagation(); onToggleFav(); }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center transition-all hover:scale-110">
          <Heart className={`w-4 h-4 ${fav ? 'fill-red-400 text-red-400' : 'text-white'}`} />
        </button>

        {/* price bottom-right */}
        <div className="absolute bottom-3 right-3">
          <span className="bg-white text-[#0a1628] font-bold text-sm px-3 py-1 tracking-wide">
            {e.preco}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 border-b border-gray-100">
        {/* eyebrow */}
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#c9a96e] mb-2">
          {e.tipo} · {e.ano}
        </p>

        {/* title */}
        <h3
          className="text-xl font-bold text-[#0a1628] leading-snug mb-2 group-hover:text-[#1a2b4a] transition-colors"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          {e.nome}
        </h3>

        {/* location */}
        <p className="flex items-center gap-1 text-xs text-gray-400 font-medium mb-4">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
          {e.cidade}, {e.estado} — {e.pais} {e.bandeira}
        </p>

        {/* specs row */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {e.specs.slice(0, 4).map(s => (
            <div key={s.l} className="text-center">
              <p className="text-[8px] font-semibold text-gray-400 uppercase tracking-wider">{s.l}</p>
              <p className="text-xs font-bold text-[#0a1628] mt-0.5">{s.v}</p>
            </div>
          ))}
        </div>

        {/* interior tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {int.quartos > 0 && (
            <span className="flex items-center gap-1 border border-gray-200 text-gray-500 text-[9px] font-semibold px-2 py-1">
              <BedDouble className="w-3 h-3" /> {int.quartos} Quarto{int.quartos > 1 ? 's' : ''}
            </span>
          )}
          {int.banheiros > 0 && (
            <span className="flex items-center gap-1 border border-gray-200 text-gray-500 text-[9px] font-semibold px-2 py-1">
              <Bath className="w-3 h-3" /> {int.banheiros} WC
            </span>
          )}
          {int.cozinha && (
            <span className="flex items-center gap-1 border border-gray-200 text-gray-500 text-[9px] font-semibold px-2 py-1">
              <UtensilsCrossed className="w-3 h-3" /> Cozinha
            </span>
          )}
          {int.sala && (
            <span className="flex items-center gap-1 border border-gray-200 text-gray-500 text-[9px] font-semibold px-2 py-1">
              <Sofa className="w-3 h-3" /> Sala
            </span>
          )}
        </div>

        {/* CTA */}
        <button
          onClick={onVerDetalhes}
          className="flex items-center gap-2 text-[#0a1628] font-bold text-xs uppercase tracking-widest hover:gap-3 transition-all group/cta">
          Ver Detalhes
          <ChevronRight className="w-3.5 h-3.5 text-[#c9a96e] group-hover/cta:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export function NegocieTab({ role }: { role?: MarketplaceRole }) {
  const [tipoAtivo, setTipoAtivo]   = useState('Todos');
  const [busca, setBusca]           = useState('');
  const [favs, setFavs]             = useState<number[]>([]);
  const [showForm, setShowForm]     = useState(false);
  const [selected, setSelected]     = useState<Embarcacao | null>(null);

  const lista = EMBARCACOES.filter(e => {
    const matchTipo  = tipoAtivo === 'Todos' || e.tipo === tipoAtivo;
    const matchBusca = busca === '' || e.nome.toLowerCase().includes(busca.toLowerCase());
    return matchTipo && matchBusca;
  });

  const toggleFav = (id: number) =>
    setFavs(p => p.includes(id) ? p.filter(f => f !== id) : [...p, id]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-['Playfair_Display'] font-bold text-[#1a2b4a]">Negocie Embarcações</h2>
        <p className="text-xs text-gray-400 font-bold mt-0.5">Compra e venda de embarcações em PT e BR</p>
      </div>

      {/* CTA Publicar */}
      {role && !showForm && (
        <button onClick={() => setShowForm(true)}
          className="w-full bg-[#0a1628] hover:bg-[#0a1628]/90 text-white py-4 font-semibold text-sm uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" /> Publicar Embarcação
        </button>
      )}
      {showForm && (
        <NovoAnuncioForm onSuccess={() => setShowForm(false)} onCancel={() => setShowForm(false)} />
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" placeholder="Nome ou tipo…" value={busca}
          onChange={e => setBusca(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-white border-2 border-gray-100 text-[#1a2b4a] font-bold text-sm placeholder-gray-400 focus:outline-none focus:border-[#c9a96e]" />
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-2 flex-wrap">
        <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400" />
        {TIPOS.map(t => (
          <button key={t} onClick={() => setTipoAtivo(t)}
            className={`px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide transition-all ${
              tipoAtivo === t
                ? 'bg-[#0a1628] text-white shadow-md shadow-[#0a1628]/20'
                : 'bg-white text-gray-500 border border-gray-200 hover:border-[#c9a96e]/30 hover:text-[#1a2b4a]'
            }`}>
            {t}
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
        {lista.length === 0 && (
          <div className="col-span-full text-center py-16 bg-white border border-gray-100">
            <Ship className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="font-semibold text-gray-300 uppercase italic">Nenhuma embarcação encontrada</p>
          </div>
        )}
        {lista.map(e => (
          <EmbarcacaoCard
            key={e.id} e={e}
            fav={favs.includes(e.id)}
            onToggleFav={() => toggleFav(e.id)}
            onVerDetalhes={() => setSelected(e)}
          />
        ))}
      </div>

      {/* Modal de detalhes */}
      {selected && (
        <ProductDetailModal
          title={selected.nome}
          subtitle={`${selected.tipo} · ${selected.ano}`}
          fotos={selected.fotos}
          price={selected.preco}
          location={`${selected.cidade}, ${selected.estado} — ${selected.pais} ${selected.bandeira}`}
          badge={selected.condicao}
          badgeColor={condicaoCor[selected.condicao] ?? 'bg-gray-100 text-gray-700'}
          specs={selected.specs.map(s => ({ label: s.l, value: s.v }))}
          sections={[
            {
              title: 'Interior',
              content: (
                <div className="flex flex-wrap gap-2">
                  {selected.interior.quartos > 0 && <span className="bg-[#0a1628]/5 text-[#1a2b4a] text-[10px] font-semibold px-2 py-1">{selected.interior.quartos} Quartos</span>}
                  {selected.interior.banheiros > 0 && <span className="bg-cyan-50 text-cyan-700 text-[10px] font-semibold px-2 py-1">{selected.interior.banheiros} WC</span>}
                  {selected.interior.cozinha && <span className="bg-[#c9a96e]/5 border border-[#c9a96e]/20 text-[#1a2b4a] text-[10px] font-semibold px-2 py-1">Cozinha</span>}
                  {selected.interior.sala && <span className="bg-purple-50 text-purple-700 text-[10px] font-semibold px-2 py-1">Sala</span>}
                  {selected.interior.cockpit && <span className="bg-gray-50 text-gray-700 text-[10px] font-semibold px-2 py-1">Cockpit</span>}
                  {selected.interior.flybridge && <span className="bg-emerald-50 text-emerald-700 text-[10px] font-semibold px-2 py-1">Flybridge</span>}
                </div>
              ),
            },
            {
              title: 'Tanques',
              content: (
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-[#c9a96e]/5 border border-[#c9a96e]/20 px-2 py-2 text-center">
                    <p className="text-[8px] font-semibold text-amber-500 uppercase">Combustível</p>
                    <p className="text-xs font-bold text-amber-800">{selected.tanques.combustivel}</p>
                  </div>
                  <div className="bg-[#0a1628]/5 px-2 py-2 text-center">
                    <p className="text-[8px] font-semibold text-[#c9a96e] uppercase">Água Doce</p>
                    <p className="text-xs font-bold text-[#1a2b4a]">{selected.tanques.agua_doce}</p>
                  </div>
                  <div className="bg-gray-50 px-2 py-2 text-center">
                    <p className="text-[8px] font-semibold text-gray-400 uppercase">Águas Negras</p>
                    <p className="text-xs font-bold text-gray-700">{selected.tanques.aguas_negras}</p>
                  </div>
                </div>
              ),
            },
            {
              title: 'Eletrônica',
              content: <div className="flex flex-wrap gap-1">{selected.eletronica.map(x => <span key={x} className="bg-[#0a1628]/5 text-[#1a2b4a] text-[9px] font-semibold px-2 py-0.5 border border-[#c9a96e]/20">{x}</span>)}</div>,
            },
            {
              title: 'Segurança',
              content: <div className="flex flex-wrap gap-1">{selected.seguranca.map(x => <span key={x} className="bg-emerald-50 text-emerald-700 text-[9px] font-semibold px-2 py-0.5 border border-emerald-100">{x}</span>)}</div>,
            },
            {
              title: 'Extras',
              content: <div className="flex flex-wrap gap-1">{selected.extras.map(x => <span key={x} className="bg-gray-100 text-gray-500 text-[9px] font-semibold px-2 py-0.5">{x}</span>)}</div>,
            },
          ]}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
