// src/components/shared/EscolasNauticasTab.tsx
import { useState } from 'react';
import {
  MapPin, Search, SlidersHorizontal, Star, ChevronRight, ChevronDown, ChevronUp,
  GraduationCap, Phone, Globe, Mail, Clock, Plus, X, AlertCircle, ImagePlus,
  Calendar, DollarSign, Timer,
} from 'lucide-react';
import type { MarketplaceRole } from './MarketplaceTab';
import { ProductDetailModal } from './ProductDetailModal';

const TIPOS = ['Todas', 'Vela', 'Motor', 'Mergulho', 'Náutica Geral', 'Pesca'];

interface Curso {
  nome: string; valor: string; data_inicio: string; horario: string;
  duracao: string; local: string; descricao_formacao: string;
}

interface Escola {
  id: number; destaque: boolean;
  nome: string; tipo: string;
  pais: string; estado: string; cidade: string; bandeira: string;
  descricao: string;
  fotos: string[];
  cursos: Curso[];
  avaliacao: number; avaliacoes: number;
  contato: { tel: string; email: string; web: string };
  horario: string;
  cor: string;
}

const ESCOLAS: Escola[] = [
  {
    id: 1, destaque: true,
    nome: 'Escola Náutica de Cascais', tipo: 'Vela',
    pais: 'Portugal', estado: 'Lisboa', cidade: 'Cascais', bandeira: '🇵🇹',
    descricao: 'Formação náutica certificada desde 1987. Cursos de vela ligeira, oceânica e skipper.',
    fotos: ['https://images.unsplash.com/photo-1534854638093-bada1813ca19?w=800&h=500&fit=crop', 'https://images.unsplash.com/photo-1540946485063-a40da27545f8?w=800&h=500&fit=crop'],
    cursos: [
      { nome: 'Vela Ligeira — Iniciação', valor: '€ 280', data_inicio: '15 Mai 2026', horario: 'Sáb 09:00–13:00', duracao: '4 semanas (16h)', local: 'Marina de Cascais', descricao_formacao: 'Curso de iniciação à vela ligeira em Laser e 420. Inclui teoria de navegação, manobras básicas, segurança no mar e prática em água. Certificação pela Federação Portuguesa de Vela.' },
      { nome: 'Vela Oceânica — Cruzeiro', valor: '€ 750', data_inicio: '01 Jun 2026', horario: 'Seg–Sex 09:00–17:00', duracao: '1 semana (40h)', local: 'Marina de Cascais', descricao_formacao: 'Navegação oceânica em veleiro de 40 pés. Abrange navegação astronómica, meteorologia, manobras de vela em oceano, travessias costeiras e planeamento de rotas. Diploma de Skipper Costeiro.' },
      { nome: 'Skipper PCA-II', valor: '€ 1.200', data_inicio: '20 Jun 2026', horario: 'Diário 08:00–18:00', duracao: '2 semanas (80h)', local: 'Marina de Cascais + Navegação Cascais–Sesimbra', descricao_formacao: 'Formação completa para carta de Patrão de Costa Alargada (PCA-II). Inclui módulo teórico (regulamento, cartas náuticas, IALA, RIEAM) e módulo prático (manobras, homem ao mar, navegação nocturna). Habilitação oficial DGRM.' },
      { nome: 'STCW Basic Safety Training', valor: '€ 490', data_inicio: '10 Jul 2026', horario: 'Seg–Sex 09:00–17:00', duracao: '1 semana (35h)', local: 'Centro de Formação Cascais', descricao_formacao: 'Certificação STCW obrigatória para embarcar profissionalmente. Módulos: sobrevivência no mar, combate a incêndio, primeiros socorros, segurança pessoal e responsabilidades sociais.' },
    ],
    avaliacao: 4.9, avaliacoes: 312,
    contato: { tel: '+351 214 868 100', email: 'info@escolanauticacascais.pt', web: 'escolanauticacascais.pt' },
    horario: 'Seg-Sáb · 09:00–18:00', cor: '#0B1F3A',
  },
  {
    id: 2, destaque: true,
    nome: 'Escola de Vela do Porto', tipo: 'Vela',
    pais: 'Portugal', estado: 'Porto', cidade: 'Porto', bandeira: '🇵🇹',
    descricao: 'Formação profissional e recreativa em vela. Convênio com federação portuguesa.',
    fotos: ['https://images.unsplash.com/photo-1540946485063-a40da27545f8?w=800&h=500&fit=crop'],
    cursos: [
      { nome: 'Iniciação à Vela', valor: '€ 220', data_inicio: '03 Mai 2026', horario: 'Sáb e Dom 10:00–14:00', duracao: '3 semanas (24h)', local: 'Douro Marina, Porto', descricao_formacao: 'Primeiros passos na vela em embarcação escola de 8m. Aprenda a ler o vento, bordejar, virar por davante e em roda. Teoria básica de meteorologia e nós marinheiros.' },
      { nome: 'Curso de Regatas', valor: '€ 580', data_inicio: '12 Jun 2026', horario: 'Qua e Sex 16:00–19:00', duracao: '6 semanas (36h)', local: 'Foz do Douro', descricao_formacao: 'Aperfeiçoamento de técnica em regata: partidas, marcações, táticas, regulamento de regatas World Sailing. Prática em J/70 e optimist para jovens.' },
      { nome: 'Vela Adaptada', valor: '€ 0 (Gratuito)', data_inicio: '05 Jul 2026', horario: 'Dom 10:00–12:00', duracao: '8 semanas (16h)', local: 'Douro Marina, Porto', descricao_formacao: 'Programa de vela inclusiva para pessoas com deficiência motora ou visual. Embarcações adaptadas, instrutores especializados. Parceria com a Federação Portuguesa de Desporto para Pessoas com Deficiência.' },
    ],
    avaliacao: 4.7, avaliacoes: 184,
    contato: { tel: '+351 222 001 234', email: 'geral@escolavelajporto.pt', web: 'escolavelaport.pt' },
    horario: 'Ter-Dom · 08:30–17:30', cor: '#1d4ed8',
  },
  {
    id: 3, destaque: false,
    nome: 'Academia Náutica Brasil', tipo: 'Náutica Geral',
    pais: 'Brasil', estado: 'São Paulo', cidade: 'Santos', bandeira: '🇧🇷',
    descricao: 'Formação completa em náutica recreativa e profissional. Habilitação náutica pela Marinha do Brasil.',
    fotos: ['https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=800&h=500&fit=crop', 'https://images.unsplash.com/photo-1605281317010-fe5ffe798166?w=800&h=500&fit=crop'],
    cursos: [
      { nome: 'Arrais-Amador', valor: 'R$ 890', data_inicio: '10 Mai 2026', horario: 'Sáb 08:00–17:00', duracao: '3 sábados (27h)', local: 'Santos — Capitania dos Portos', descricao_formacao: 'Habilitação para conduzir embarcações de esporte e recreio nos limites da navegação interior. Legislação náutica, balizamento, navegação, primeiros socorros e sobrevivência no mar. Prova na Marinha do Brasil.' },
      { nome: 'Mestre-Amador', valor: 'R$ 1.200', data_inicio: '07 Jun 2026', horario: 'Sáb 08:00–17:00', duracao: '4 sábados (36h)', local: 'Santos — Centro Náutico', descricao_formacao: 'Habilitação para navegação costeira até 20 milhas. Carta náutica, navegação estimada, uso de GPS, meteorologia costeira, regras RIPEAM, motores marítimos, radiocomunicação VHF.' },
      { nome: 'Capitão-Amador', valor: 'R$ 1.800', data_inicio: '15 Jul 2026', horario: 'Sáb e Dom 08:00–17:00', duracao: '4 fins de semana (64h)', local: 'Santos + Navegação oceânica', descricao_formacao: 'Habilitação para navegação sem limites. Navegação astronômica, uso do sextante, meteorologia oceânica, estabilidade, comunicações GMDSS. Inclui travessia prática de 48h.' },
    ],
    avaliacao: 4.8, avaliacoes: 520,
    contato: { tel: '+55 13 3222-4455', email: 'academianauticabr@gmail.com', web: 'academianauticabr.com.br' },
    horario: 'Seg-Sex · 08:00–18:00', cor: '#059669',
  },
  {
    id: 4, destaque: false,
    nome: 'Centro de Mergulho Atlântico', tipo: 'Mergulho',
    pais: 'Portugal', estado: 'Setúbal', cidade: 'Setúbal', bandeira: '🇵🇹',
    descricao: 'Escola de mergulho certificada PADI. Cursos do Open Water ao Divemaster.',
    fotos: ['https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=500&fit=crop'],
    cursos: [
      { nome: 'PADI Open Water Diver', valor: '€ 390', data_inicio: '18 Mai 2026', horario: 'Sáb e Dom 08:00–16:00', duracao: '2 fins de semana (32h)', local: 'Praia da Arrábida + Piscina indoor', descricao_formacao: 'Certificação internacional PADI para mergulhar até 18m. Inclui e-learning teórico, 5 sessões em águas confinadas (piscina) e 4 mergulhos em mar aberto na Arrábida. Kit de mergulho incluído durante o curso.' },
      { nome: 'PADI Advanced Open Water', valor: '€ 350', data_inicio: '08 Jun 2026', horario: 'Sáb e Dom 08:00–15:00', duracao: '1 fim de semana (16h)', local: 'Reserva Marinha Arrábida', descricao_formacao: 'Aprofundamento até 30m com 5 mergulhos de aventura: profundo, navegação subaquática, noturno, flutuabilidade perfeita e naturalista. Pré-requisito: OWD.' },
      { nome: 'PADI Rescue Diver', valor: '€ 450', data_inicio: '20 Jun 2026', horario: 'Sáb e Dom 08:00–17:00', duracao: '2 fins de semana (30h)', local: 'Sesimbra + Piscina', descricao_formacao: 'Gestão de stress, auto-resgate, resgate de mergulhadores, primeiros socorros com O₂. Inclui certificação EFR (Emergency First Response). Pré-requisito: AOWD.' },
      { nome: 'PADI Divemaster', valor: '€ 990', data_inicio: '10 Ago 2026', horario: 'Intensivo 3 semanas', duracao: '3 semanas (120h)', local: 'Centro + Arrábida + Berlengas', descricao_formacao: 'Primeiro nível profissional PADI. Teoria avançada, supervisão de alunos, condução de mergulhos, mapeamento de locais, gestão de emergências. Estágio prático com a equipa. Mínimo 60 mergulhos logados.' },
    ],
    avaliacao: 4.6, avaliacoes: 98,
    contato: { tel: '+351 265 001 789', email: 'info@mergulhoatlantico.pt', web: 'mergulhoatlantico.pt' },
    horario: 'Diário · 07:00–19:00', cor: '#0e7490',
  },
  {
    id: 5, destaque: false,
    nome: 'Escola de Pesca Oceânica', tipo: 'Pesca',
    pais: 'Portugal', estado: 'Algarve', cidade: 'Faro', bandeira: '🇵🇹',
    descricao: 'Formação em pesca desportiva e comercial. Técnicas de pesca oceânica e costeira.',
    fotos: ['https://images.unsplash.com/photo-1504309092620-4d0ec726efa4?w=800&h=500&fit=crop'],
    cursos: [
      { nome: 'Pesca Desportiva — Fundamentos', valor: '€ 180', data_inicio: '24 Mai 2026', horario: 'Sáb 06:00–14:00', duracao: '2 sábados (16h)', local: 'Porto de Faro + Mar alto', descricao_formacao: 'Introdução às técnicas de pesca desportiva: spinning, jigging, trolling costeiro. Identificação de espécies, regulamentação, equipamento e nós essenciais. Saída prática em embarcação.' },
      { nome: 'Big Game Fishing', valor: '€ 650', data_inicio: '14 Jun 2026', horario: 'Sáb 05:00–18:00', duracao: '3 sábados (39h)', local: 'Largo do Algarve', descricao_formacao: 'Pesca oceânica de espadarte, atum e marlim. Técnicas de trolling oceânico, combate, equipamento pesado (80-130 lbs), preparação de iscos e teasing. Inclui 3 saídas em alto mar com capitão experiente.' },
      { nome: 'Fly Fishing Marítimo', valor: '€ 320', data_inicio: '05 Jul 2026', horario: 'Dom 07:00–13:00', duracao: '4 domingos (24h)', local: 'Ria Formosa', descricao_formacao: 'Técnica de pesca com mosca em ambiente estuarino e costeiro. Casting em água salgada, moscas para robalo e dourada, leitura de correntes e marés. Material de fly fishing fornecido.' },
    ],
    avaliacao: 4.5, avaliacoes: 67,
    contato: { tel: '+351 289 801 456', email: 'escola@pescaoceanica.pt', web: 'pescaoceanica.pt' },
    horario: 'Seg-Sáb · 06:00–16:00', cor: '#b45309',
  },
  {
    id: 6, destaque: false,
    nome: 'Escola Náutica do Algarve', tipo: 'Motor',
    pais: 'Portugal', estado: 'Algarve', cidade: 'Portimão', bandeira: '🇵🇹',
    descricao: 'Cursos de náutica a motor para recreio e profissional. Habilitação Categoria A, B e C.',
    fotos: ['https://images.unsplash.com/photo-1605281317010-fe5ffe798166?w=800&h=500&fit=crop', 'https://images.unsplash.com/photo-1622015663319-e97e697503ee?w=800&h=500&fit=crop'],
    cursos: [
      { nome: 'Patrão Local (Cat. A)', valor: '€ 350', data_inicio: '09 Mai 2026', horario: 'Sáb e Dom 09:00–13:00', duracao: '3 fins de semana (24h)', local: 'Marina de Portimão', descricao_formacao: 'Habilitação para conduzir embarcações a motor até 7m em navegação local (até 5 milhas da costa). Legislação, balizamento, manobras de porto, nós, segurança. Exame final na capitania.' },
      { nome: 'Patrão de Costa (Cat. B)', valor: '€ 580', data_inicio: '06 Jun 2026', horario: 'Sáb 09:00–17:00', duracao: '4 sábados (32h)', local: 'Marina de Portimão + Navegação costeira', descricao_formacao: 'Navegação costeira até 25 milhas. Carta náutica, GPS, plotagem, derrota estimada, meteorologia básica, RIPEAM, radiocomunicação VHF. Inclui módulo prático de 8h em mar.' },
      { nome: 'Operador de VHF/DSC', valor: '€ 120', data_inicio: '28 Jun 2026', horario: 'Sáb 09:00–17:00', duracao: '1 dia (8h)', local: 'Centro de Formação Portimão', descricao_formacao: 'Certificado de operador de VHF marítimo com DSC (Short Range Certificate). Procedimentos de comunicação, chamadas de socorro, urgência e segurança, utilização do DSC e AIS. Exame ANACOM.' },
    ],
    avaliacao: 4.7, avaliacoes: 143,
    contato: { tel: '+351 282 400 321', email: 'geral@nauticaalgarve.pt', web: 'nauticaalgarve.pt' },
    horario: 'Seg-Sex · 09:00–17:00', cor: '#7c3aed',
  },
];

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} className={`w-3 h-3 ${i <= Math.round(value) ? 'fill-amber-400 text-amber-400' : 'text-gray-200 fill-gray-200'}`} />
      ))}
    </div>
  );
}

// ── Formulário ────────────────────────────────────────────────────────────────

function NovaEscolaForm({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  const [fotos, setFotos]     = useState<string[]>([]);
  const [error, setError]     = useState<string | null>(null);
  const [form, setForm]       = useState({
    nome: '', tipo: 'Vela', pais: '', estado: '', cidade: '', descricao: '',
    tel: '', email: '', web: '', horario: '',
    curso_nome: '', curso_valor: '', curso_duracao: '', curso_descricao: '',
  });

  const f = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));
  const inputCls = "w-full bg-gray-50 border-2 border-gray-100 py-3 px-4 font-bold text-[#1a2b4a] focus:border-[#c9a96e] outline-none text-sm placeholder:text-gray-300";
  const lbl = "text-[10px] font-semibold text-[#1a2b4a] uppercase tracking-[0.15em] ml-1 mb-1.5 block";

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) { setError('Máximo 4MB.'); return; }
    if (fotos.length >= 5) { setError('Máximo 5 fotos.'); return; }
    const reader = new FileReader();
    reader.onload = ev => setFotos(p => [...p, ev.target?.result as string]);
    reader.readAsDataURL(file);
  };

  const removeFoto = (i: number) => setFotos(p => p.filter((_, j) => j !== i));

  function handleSubmit() {
    if (!form.nome.trim() || !form.pais.trim() || !form.cidade.trim() || !form.email.trim()) { setError('Nome, localização e email são obrigatórios.'); return; }
    if (fotos.length === 0) { setError('Pelo menos 1 foto é obrigatória.'); return; }
    alert('Escola listada com sucesso! A equipa NorthWindy irá rever.');
    onSuccess();
  }

  return (
    <div className="bg-white border-2 border-[#c9a96e]/20 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-[#1a2b4a] uppercase tracking-[0.15em]">Listar Escola Náutica</p>
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
        <label className={lbl}>Fotos da Escola * ({fotos.length}/5)</label>
        <div className="flex gap-2 flex-wrap">
          {fotos.map((src, i) => (
            <div key={i} className="relative w-20 h-20 overflow-hidden">
              <img src={src} className="w-full h-full object-cover" alt="" />
              <button onClick={() => removeFoto(i)} className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center"><X className="w-3 h-3 text-white" /></button>
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
        <div className="col-span-2"><label className={lbl}>Nome *</label><input value={form.nome} onChange={e => f('nome', e.target.value)} placeholder="Nome da escola" className={inputCls} /></div>
        <div><label className={lbl}>Tipo</label><select value={form.tipo} onChange={e => f('tipo', e.target.value)} className={inputCls}>{TIPOS.filter(t=>t!=='Todas').map(t=><option key={t}>{t}</option>)}</select></div>
        <div><label className={lbl}>Horário</label><input value={form.horario} onChange={e => f('horario', e.target.value)} placeholder="Seg-Sex 09:00–18:00" className={inputCls} /></div>
      </div>
      {/* Localização */}
      <p className="text-[10px] font-semibold text-[#1a2b4a] uppercase tracking-[0.15em] ml-1">Localização</p>
      <div className="grid grid-cols-3 gap-3">
        <div><label className={lbl}>País *</label><input value={form.pais} onChange={e => f('pais', e.target.value)} placeholder="Portugal" className={inputCls} /></div>
        <div><label className={lbl}>Estado / Região</label><input value={form.estado} onChange={e => f('estado', e.target.value)} placeholder="Lisboa" className={inputCls} /></div>
        <div><label className={lbl}>Cidade *</label><input value={form.cidade} onChange={e => f('cidade', e.target.value)} placeholder="Cascais" className={inputCls} /></div>
      </div>
      <div><label className={lbl}>Descrição</label><textarea value={form.descricao} onChange={e => f('descricao', e.target.value)} rows={2} placeholder="Sobre a escola…" className={inputCls + ' resize-none'} /></div>
      <div className="grid grid-cols-3 gap-3">
        <div><label className={lbl}>Telefone</label><input value={form.tel} onChange={e => f('tel', e.target.value)} placeholder="+351…" className={inputCls} /></div>
        <div><label className={lbl}>Email *</label><input value={form.email} onChange={e => f('email', e.target.value)} placeholder="email@escola.pt" className={inputCls} /></div>
        <div><label className={lbl}>Website</label><input value={form.web} onChange={e => f('web', e.target.value)} placeholder="escola.pt" className={inputCls} /></div>
      </div>
      <p className="text-[10px] font-semibold text-[#1a2b4a] uppercase tracking-[0.15em] ml-1">Curso exemplo (opcional)</p>
      <div className="grid grid-cols-2 gap-3">
        <div><label className={lbl}>Nome do Curso</label><input value={form.curso_nome} onChange={e => f('curso_nome', e.target.value)} placeholder="Ex: Iniciação à Vela" className={inputCls} /></div>
        <div><label className={lbl}>Valor</label><input value={form.curso_valor} onChange={e => f('curso_valor', e.target.value)} placeholder="€ 280" className={inputCls} /></div>
        <div><label className={lbl}>Duração</label><input value={form.curso_duracao} onChange={e => f('curso_duracao', e.target.value)} placeholder="4 semanas (16h)" className={inputCls} /></div>
        <div><label className={lbl}>Descrição</label><input value={form.curso_descricao} onChange={e => f('curso_descricao', e.target.value)} placeholder="O que o aluno vai aprender…" className={inputCls} /></div>
      </div>
      <button onClick={handleSubmit}
        className="w-full bg-[#0a1628] hover:bg-[#0a1628]/90 text-white py-4 font-semibold text-sm uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2">
        <Plus className="w-4 h-4" /> Listar Escola
      </button>
    </div>
  );
}

// ── Card de curso ─────────────────────────────────────────────────────────────

function CursoCard({ curso }: { curso: Curso }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="bg-white border-2 border-[#0a1628]/5 p-3 hover:border-[#c9a96e]/30 transition-all">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[#1a2b4a] text-xs leading-snug">{curso.nome}</p>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <span className="flex items-center gap-1 text-[10px] font-semibold text-green-700 bg-green-50 px-2 py-0.5">
              <DollarSign className="w-2.5 h-2.5" /> {curso.valor}
            </span>
            <span className="flex items-center gap-1 text-[10px] font-bold text-gray-500">
              <Calendar className="w-2.5 h-2.5 text-[#c9a96e]" /> {curso.data_inicio}
            </span>
            <span className="flex items-center gap-1 text-[10px] font-bold text-gray-500">
              <Timer className="w-2.5 h-2.5 text-[#c9a96e]" /> {curso.duracao}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-1.5 text-[10px] font-bold text-gray-400">
        <Clock className="w-2.5 h-2.5" /> {curso.horario} · <MapPin className="w-2.5 h-2.5" /> {curso.local}
      </div>
      <button onClick={() => setExpanded(v => !v)}
        className="flex items-center gap-1 text-[10px] font-semibold text-[#c9a96e] hover:text-[#1a2b4a] transition-colors mt-2">
        {expanded ? <><ChevronUp className="w-3 h-3" /> Ocultar</> : <><ChevronDown className="w-3 h-3" /> Ver formação</>}
      </button>
      {expanded && (
        <div className="mt-2 bg-[#0a1628]/5 px-3 py-2.5">
          <p className="text-[9px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em] mb-1">Sobre a Formação</p>
          <p className="text-xs font-bold text-[#1a2b4a] leading-relaxed">{curso.descricao_formacao}</p>
        </div>
      )}
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export function EscolasNauticasTab({ role }: { role?: MarketplaceRole }) {
  const [tipoAtivo, setTipoAtivo]             = useState('Todas');
  const [busca, setBusca]                     = useState('');
  const [showForm, setShowForm]               = useState(false);
  const [expandedSchools, setExpandedSchools] = useState<number[]>([]);
  const [selected, setSelected]               = useState<Escola | null>(null);

  const lista = ESCOLAS.filter(e => {
    const matchTipo  = tipoAtivo === 'Todas' || e.tipo === tipoAtivo;
    const matchBusca = busca === '' || e.nome.toLowerCase().includes(busca.toLowerCase()) || e.cidade.toLowerCase().includes(busca.toLowerCase()) || e.pais.toLowerCase().includes(busca.toLowerCase());
    return matchTipo && matchBusca;
  });

  const toggleSchool = (id: number) =>
    setExpandedSchools(p => p.includes(id) ? p.filter(i => i !== id) : [...p, id]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-['Playfair_Display'] font-bold text-[#1a2b4a]">Escolas Náuticas</h2>
        <p className="text-xs text-gray-400 font-bold mt-0.5">Formação náutica certificada em PT e BR</p>
      </div>

      {/* CTA Publicar — TOPO */}
      {role && !showForm && (
        <button onClick={() => setShowForm(true)}
          className="w-full bg-[#0a1628] hover:bg-[#0a1628]/90 text-white py-4 font-semibold text-sm uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" /> Listar Escola Náutica
        </button>
      )}
      {showForm && <NovaEscolaForm onSuccess={() => setShowForm(false)} onCancel={() => setShowForm(false)} />}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" placeholder="Nome ou localização…" value={busca}
          onChange={e => setBusca(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-white border-2 border-gray-100 text-[#1a2b4a] font-bold text-sm placeholder-gray-400 focus:outline-none focus:border-[#c9a96e]" />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400" />
        {TIPOS.map(t => (
          <button key={t} onClick={() => setTipoAtivo(t)}
            className={`px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide transition-all ${
              tipoAtivo === t ? 'bg-[#0a1628] text-white shadow-md shadow-[#0a1628]/20' : 'bg-white text-gray-500 border border-gray-200 hover:border-[#c9a96e]/30 hover:text-[#1a2b4a]'
            }`}>{t}</button>
        ))}
      </div>

      <div className="flex gap-3">
        <div className="bg-[#0a1628]/5 px-4 py-2 text-center">
          <p className="text-xl font-bold text-[#1a2b4a] italic">{lista.length}</p>
          <p className="text-[9px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em]">Escolas</p>
        </div>
        <div className="bg-emerald-50 px-4 py-2 text-center">
          <p className="text-xl font-bold text-emerald-700 italic">{lista.reduce((a, e) => a + e.cursos.length, 0)}</p>
          <p className="text-[9px] font-semibold text-emerald-400 uppercase tracking-[0.15em]">Cursos</p>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lista.length === 0 && (
          <div className="col-span-full text-center py-16 bg-white border border-gray-100">
            <GraduationCap className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="font-semibold text-gray-300 uppercase italic">Nenhuma escola encontrada</p>
          </div>
        )}

        {lista.map(e => {
          const isExpanded = expandedSchools.includes(e.id);
          return (
            <div key={e.id}
              className="group bg-white overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
              {/* Foto */}
              <div className="relative overflow-hidden" style={{ height: 240 }}>
                <img src={e.fotos[0]} alt={e.nome}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  {e.destaque && <span className="text-[9px] font-semibold uppercase bg-[#c9a96e] text-white px-2 py-0.5 tracking-wider">Destaque</span>}
                  <span className="text-[9px] font-semibold uppercase bg-white/90 text-[#0a1628] px-2 py-0.5 tracking-wider">{e.tipo}</span>
                </div>
                <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
                  <StarRating value={e.avaliacao} />
                  <span className="text-[10px] font-bold text-white">{e.avaliacao}</span>
                  <span className="text-[10px] text-white/60 font-bold">({e.avaliacoes})</span>
                </div>
                <span className="absolute bottom-3 right-3 text-xl">{e.bandeira}</span>
              </div>

              {/* Body */}
              <div className="p-5 border-b border-gray-100">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#c9a96e] mb-2">
                  {e.tipo} · {e.cidade}
                </p>
                <h3 className="text-xl font-bold text-[#0a1628] leading-snug mb-2 group-hover:text-[#1a2b4a] transition-colors"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                  {e.nome}
                </h3>
                <p className="flex items-center gap-1 text-xs text-gray-400 font-medium mb-3">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                  {e.cidade}, {e.estado} — {e.pais} {e.bandeira}
                </p>
                <p className="text-xs text-gray-500 leading-relaxed mb-4 line-clamp-2">{e.descricao}</p>

                {/* Contatos */}
                <div className="space-y-1 mb-4">
                  <div className="flex items-center gap-2 text-[10px] text-gray-400 font-medium"><Clock className="w-3 h-3" /> {e.horario}</div>
                  <div className="flex items-center gap-2 text-[10px] text-gray-400 font-medium"><Globe className="w-3 h-3" /> {e.contato.web}</div>
                </div>

                {/* Cursos toggle */}
                <button onClick={() => toggleSchool(e.id)}
                  className="w-full flex items-center justify-between border border-gray-200 px-4 py-2.5 mb-3 hover:border-[#c9a96e] transition-colors">
                  <span className="text-[10px] font-semibold text-[#0a1628] uppercase tracking-wider">
                    {e.cursos.length} Curso{e.cursos.length > 1 ? 's' : ''} Disponíve{e.cursos.length > 1 ? 'is' : 'l'}
                  </span>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-[#c9a96e]" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </button>

                {isExpanded && (
                  <div className="mb-4 space-y-2 animate-in fade-in duration-150">
                    {e.cursos.map(c => <CursoCard key={c.nome} curso={c} />)}
                  </div>
                )}

                <button onClick={() => setSelected(e)}
                  className="flex items-center gap-2 text-[#0a1628] font-bold text-xs uppercase tracking-widest hover:gap-3 transition-all group/cta">
                  Ver Escola
                  <ChevronRight className="w-3.5 h-3.5 text-[#c9a96e] group-hover/cta:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de detalhes */}
      {selected && (
        <ProductDetailModal
          title={selected.nome}
          subtitle={`${selected.tipo} · ${selected.avaliacao}⭐ (${selected.avaliacoes} avaliações)`}
          fotos={selected.fotos}
          location={`${selected.cidade}, ${selected.estado} — ${selected.pais} ${selected.bandeira}`}
          badge={selected.tipo}
          sections={[
            {
              title: 'Sobre a Escola',
              content: selected.descricao,
            },
            {
              title: 'Contacto',
              content: (
                <div className="space-y-1">
                  <p className="text-[10px]"><span className="font-semibold text-[#1a2b4a]">Horário:</span> {selected.horario}</p>
                  <p className="text-[10px]"><span className="font-semibold text-[#1a2b4a]">Tel:</span> {selected.contato.tel}</p>
                  <p className="text-[10px]"><span className="font-semibold text-[#1a2b4a]">Email:</span> {selected.contato.email}</p>
                  <p className="text-[10px]"><span className="font-semibold text-[#1a2b4a]">Web:</span> {selected.contato.web}</p>
                </div>
              ),
            },
            {
              title: `${selected.cursos.length} Curso${selected.cursos.length > 1 ? 's' : ''} Disponíve${selected.cursos.length > 1 ? 'is' : 'l'}`,
              content: (
                <div className="space-y-2">
                  {selected.cursos.map(c => (
                    <div key={c.nome} className="bg-[#0a1628]/5 p-3">
                      <p className="font-semibold text-[#1a2b4a] text-xs">{c.nome}</p>
                      <div className="flex flex-wrap gap-2 mt-1 mb-1.5">
                        <span className="text-[9px] font-semibold text-green-700 bg-green-50 px-2 py-0.5">{c.valor}</span>
                        <span className="text-[9px] font-bold text-gray-500">{c.data_inicio}</span>
                        <span className="text-[9px] font-bold text-gray-500">{c.duracao}</span>
                      </div>
                      <p className="text-[9px] font-bold text-gray-600 leading-relaxed">{c.descricao_formacao}</p>
                    </div>
                  ))}
                </div>
              ),
            },
          ]}
          footerActions={
            <div className="flex gap-2">
              <a href={`mailto:${selected.contato.email}`}
                className="flex-1 flex items-center justify-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-[10px] font-semibold uppercase px-3 py-2.5 transition-all">
                <Mail className="w-3 h-3" /> Email
              </a>
              <a href={`tel:${selected.contato.tel}`}
                className="flex-1 flex items-center justify-center gap-1 bg-[#0a1628] hover:bg-[#0a1628]/90 text-white text-[10px] font-semibold uppercase px-3 py-2.5 transition-all">
                <Phone className="w-3 h-3" /> Ligar
              </a>
            </div>
          }
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
