// src/components/shared/ForumTab.tsx
import { useState } from 'react';
import { MessageCircle, ThumbsUp, Eye, ChevronRight, Tag, Pin, TrendingUp, Search, Plus, X, Send, Clock, User } from 'lucide-react';

const CATEGORIAS_FORUM = ['Todos', 'Técnico', 'Rotas', 'Equipamento', 'Trabalho', 'Legal', 'Geral'];

const THREADS = [
  {
    id: 1, pinned: true, hot: true,
    categoria: 'Técnico',
    titulo: 'Motor Yanmar 4JH diesel — problema de sobreaquecimento',
    autor: 'Paulo Marinheiro',
    avatarInicial: 'PM',
    avatarCor: 'bg-blue-700',
    tempo: 'há 2h',
    respostas: 14, views: 238, likes: 22,
    preview: 'Estou a ter problemas com o motor a aquecer acima dos 90°C após 30 minutos de navegação. Já troquei o impeller e o termostato mas continua igual. Alguém já passou por isto?',
    tags: ['Yanmar', 'Motor', 'Manutenção'],
  },
  {
    id: 2, pinned: false, hot: true,
    categoria: 'Rotas',
    titulo: 'Melhor época para travessia Lisboa → Açores',
    autor: 'Capitão Rui',
    avatarInicial: 'CR',
    avatarCor: 'bg-emerald-700',
    tempo: 'há 5h',
    respostas: 31, views: 512, likes: 47,
    preview: 'Planeio fazer a travessia em Junho com o meu Bavaria 46. Quais as janelas meteorológicas mais favoráveis? Alguém fez recentemente?',
    tags: ['Açores', 'Travessia', 'Meteo'],
  },
  {
    id: 3, pinned: false, hot: false,
    categoria: 'Trabalho',
    titulo: 'Dúvidas sobre contrato sazonal — direitos do marinheiro',
    autor: 'Ana Costa',
    avatarInicial: 'AC',
    avatarCor: 'bg-rose-700',
    tempo: 'há 1d',
    respostas: 8, views: 143, likes: 11,
    preview: 'Recebi uma proposta de contrato sazonal (Maio–Setembro) mas tenho dúvidas sobre subsidio de férias, seguro e código marítimo. Alguém pode orientar?',
    tags: ['Contrato', 'Direitos', 'Sazonal'],
  },
  {
    id: 4, pinned: false, hot: false,
    categoria: 'Equipamento',
    titulo: 'Comparativo VHF portátil — Standard Horizon vs ICOM',
    autor: 'Filipe Santos',
    avatarInicial: 'FS',
    avatarCor: 'bg-amber-700',
    tempo: 'há 2d',
    respostas: 19, views: 324, likes: 28,
    preview: 'Procuro um VHF portátil DSC para usar tanto em powerboat como veleiro. Alguém fez comparação entre os modelos HX890 e M36? Qual a melhor relação qualidade-preço?',
    tags: ['VHF', 'DSC', 'Comunicações'],
  },
  {
    id: 5, pinned: false, hot: false,
    categoria: 'Legal',
    titulo: 'Registo de embarcação no Brasil para marinheiro português',
    autor: 'Carlos Lima',
    avatarInicial: 'CL',
    avatarCor: 'bg-slate-700',
    tempo: 'há 3d',
    respostas: 5, views: 87, likes: 6,
    preview: 'Quero registar o meu veleiro para operar na costa brasileira. Tenho CNNAUT PT. Quais os passos junto à Marinha do Brasil? Preciso de CIR?',
    tags: ['Brasil', 'Registo', 'CNNAUT'],
  },
  {
    id: 6, pinned: false, hot: false,
    categoria: 'Geral',
    titulo: 'Encontro NorthWindy — Vilamoura — Julho 2026',
    autor: 'NorthWindy Staff',
    avatarInicial: 'NW',
    avatarCor: 'bg-[#0a1628]',
    tempo: 'há 4d',
    respostas: 42, views: 890, likes: 71,
    preview: 'Estamos a organizar um encontro de tripulantes e armadores em Vilamoura no próximo verão. Confirme a sua presença e saiba mais sobre o programa.',
    tags: ['Evento', 'Encontro', 'Vilamoura'],
  },
];

const categoriaCor: Record<string, string> = {
  'Técnico':    'bg-blue-100 text-blue-700',
  'Rotas':      'bg-emerald-100 text-emerald-700',
  'Trabalho':   'bg-amber-100 text-amber-700',
  'Equipamento':'bg-purple-100 text-purple-700',
  'Legal':      'bg-slate-100 text-slate-700',
  'Geral':      'bg-gray-100 text-gray-600',
};

interface ForumTabProps {
  userName?: string;
}

export function ForumTab({ userName }: ForumTabProps) {
  const [catAtiva, setCatAtiva] = useState('Todos');
  const [busca, setBusca]       = useState('');
  const [novaThread, setNovaThread] = useState(false);
  const [novoTitulo, setNovoTitulo] = useState('');
  const [novoTexto, setNovoTexto]   = useState('');
  const [novaCat, setNovaCat]       = useState('Geral');
  const [threadAberta, setThreadAberta] = useState<typeof THREADS[0] | null>(null);
  const [respostaTexto, setRespostaTexto] = useState('');

  const filtradas = THREADS.filter(t => {
    const matchCat  = catAtiva === 'Todos' || t.categoria === catAtiva;
    const matchBusca = busca === '' || t.titulo.toLowerCase().includes(busca.toLowerCase());
    return matchCat && matchBusca;
  });

  // Vista de thread aberta
  if (threadAberta) {
    return (
      <div className="space-y-4">
        <button onClick={() => setThreadAberta(null)}
          className="flex items-center gap-2 text-[#1a2b4a] font-semibold text-xs uppercase tracking-[0.15em] hover:gap-3 transition-all">
          ← Voltar ao Fórum
        </button>

        <div className="bg-white border-2 border-gray-100 p-5">
          <div className="flex items-start gap-3 mb-4">
            <div className={`w-9 h-9 ${threadAberta.avatarCor} flex items-center justify-center text-white text-xs font-semibold flex-shrink-0`}>
              {threadAberta.avatarInicial}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap gap-1.5 mb-1.5">
                <span className={`text-[9px] font-semibold uppercase px-2 py-0.5 ${categoriaCor[threadAberta.categoria]}`}>
                  {threadAberta.categoria}
                </span>
                {threadAberta.pinned && (
                  <span className="bg-[#0a1628]/5 text-[#1a2b4a] text-[9px] font-semibold uppercase px-2 py-0.5 flex items-center gap-1">
                    <Pin className="w-2.5 h-2.5" /> Fixado
                  </span>
                )}
              </div>
              <h3 className="font-bold text-[#1a2b4a] text-base leading-snug mb-1">{threadAberta.titulo}</h3>
              <div className="flex items-center gap-3 text-[10px] text-gray-400 font-bold">
                <span>{threadAberta.autor}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{threadAberta.tempo}</span>
              </div>
            </div>
          </div>

          <p className="text-gray-600 text-sm font-bold leading-relaxed mb-4">{threadAberta.preview}</p>

          <div className="flex flex-wrap gap-1.5 mb-4">
            {threadAberta.tags.map(tag => (
              <span key={tag} className="bg-gray-100 text-gray-500 text-[9px] font-semibold uppercase px-2 py-0.5">{tag}</span>
            ))}
          </div>

          <div className="flex gap-4 text-xs text-gray-400 font-bold pt-4 border-t border-gray-100">
            <button className="flex items-center gap-1 hover:text-[#1a2b4a] transition-colors">
              <ThumbsUp className="w-3.5 h-3.5" /> {threadAberta.likes}
            </button>
            <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" /> {threadAberta.respostas} respostas</span>
            <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {threadAberta.views} views</span>
          </div>
        </div>

        {/* Respostas placeholder */}
        <div className="bg-[#0a1628]/5 p-4 text-center">
          <MessageCircle className="w-8 h-8 text-[#c9a96e]/40 mx-auto mb-2" />
          <p className="text-xs font-semibold text-[#c9a96e]/60 uppercase italic">
            {threadAberta.respostas} respostas · Em desenvolvimento
          </p>
          <p className="text-[10px] text-gray-400 font-bold mt-1">O sistema de respostas estará disponível em breve</p>
        </div>

        {/* Responder */}
        <div className="bg-white border-2 border-gray-100 p-4">
          <p className="text-xs font-semibold text-[#1a2b4a] uppercase tracking-[0.15em] mb-3">Deixar uma resposta</p>
          <textarea
            value={respostaTexto}
            onChange={e => setRespostaTexto(e.target.value)}
            placeholder="Escreva a sua resposta…"
            rows={3}
            className="w-full bg-gray-50 border-2 border-gray-100 px-4 py-3 text-sm font-bold text-[#1a2b4a] placeholder-gray-400 focus:outline-none focus:border-[#c9a96e] resize-none mb-3"
          />
          <div className="flex justify-end">
            <button
              onClick={() => { setRespostaTexto(''); }}
              className="flex items-center gap-1.5 bg-[#0a1628] hover:bg-[#0a1628]/90 text-white text-xs font-semibold uppercase px-5 py-2.5 transition-all hover:scale-105">
              <Send className="w-3.5 h-3.5" /> Publicar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-['Playfair_Display'] font-bold text-[#1a2b4a]">Fórum</h2>
          <p className="text-xs text-gray-400 font-bold mt-0.5">Comunidade NorthWindy · {filtradas.length} tópicos</p>
        </div>
        <button onClick={() => setNovaThread(true)}
          className="flex items-center gap-1.5 bg-[#0a1628] hover:bg-[#0a1628]/90 text-white text-xs font-semibold uppercase px-4 py-2.5 transition-all hover:scale-105 shadow-md shadow-[#0a1628]/20">
          <Plus className="w-3.5 h-3.5" /> Novo Tópico
        </button>
      </div>

      {/* Nova thread form */}
      {novaThread && (
        <div className="bg-white border-2 border-[#c9a96e]/30 p-5 shadow-lg shadow-[#0a1628]/5">
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold text-[#1a2b4a] text-sm uppercase tracking-[0.15em]">Criar Novo Tópico</p>
            <button onClick={() => setNovaThread(false)} className="text-gray-400 hover:text-red-500 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.15em] block mb-1">Categoria</label>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIAS_FORUM.filter(c => c !== 'Todos').map(cat => (
                  <button key={cat} onClick={() => setNovaCat(cat)}
                    className={`px-3 py-1 text-[9px] font-semibold uppercase transition-all ${
                      novaCat === cat ? 'bg-[#0a1628] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-50'
                    }`}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.15em] block mb-1">Título</label>
              <input value={novoTitulo} onChange={e => setNovoTitulo(e.target.value)}
                placeholder="Escreva o título do tópico…"
                className="w-full bg-gray-50 border-2 border-gray-100 px-4 py-2.5 text-sm font-bold text-[#1a2b4a] placeholder-gray-400 focus:outline-none focus:border-[#c9a96e]"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.15em] block mb-1">Mensagem</label>
              <textarea value={novoTexto} onChange={e => setNovoTexto(e.target.value)}
                placeholder="Descreva a sua questão ou partilhe informação…"
                rows={4}
                className="w-full bg-gray-50 border-2 border-gray-100 px-4 py-3 text-sm font-bold text-[#1a2b4a] placeholder-gray-400 focus:outline-none focus:border-[#c9a96e] resize-none"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setNovaThread(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-500 border-2 border-gray-200 hover:border-gray-300 transition-all uppercase">
                Cancelar
              </button>
              <button onClick={() => { setNovaThread(false); setNovoTitulo(''); setNovoTexto(''); }}
                className="flex items-center gap-1.5 bg-[#0a1628] hover:bg-[#0a1628]/90 text-white text-xs font-semibold uppercase px-5 py-2 transition-all">
                <Send className="w-3.5 h-3.5" /> Publicar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" placeholder="Pesquisar tópicos…" value={busca}
          onChange={e => setBusca(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-white border-2 border-gray-100 text-[#1a2b4a] font-bold text-sm placeholder-gray-400 focus:outline-none focus:border-[#c9a96e]"
        />
      </div>

      {/* Category filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Tag className="w-3.5 h-3.5 text-gray-400" />
        {CATEGORIAS_FORUM.map(cat => (
          <button key={cat} onClick={() => setCatAtiva(cat)}
            className={`px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide transition-all ${
              catAtiva === cat
                ? 'bg-[#0a1628] text-white shadow-md shadow-[#0a1628]/20'
                : 'bg-white text-gray-500 border border-gray-200 hover:border-[#c9a96e]/30 hover:text-[#1a2b4a]'
            }`}>
            {cat}
          </button>
        ))}
      </div>

      {/* Stats row */}
      <div className="flex gap-2">
        {[
          { icon: TrendingUp, val: filtradas.filter(t => t.hot).length, label: 'Em alta', color: 'text-rose-500 bg-rose-50' },
          { icon: Pin, val: filtradas.filter(t => t.pinned).length, label: 'Fixados', color: 'text-[#c9a96e] bg-[#0a1628]/5' },
          { icon: MessageCircle, val: filtradas.reduce((s, t) => s + t.respostas, 0), label: 'Respostas', color: 'text-emerald-600 bg-emerald-50' },
        ].map(s => (
          <div key={s.label} className={`${s.color} px-3 py-2 flex items-center gap-2 flex-1`}>
            <s.icon className={`w-4 h-4 ${s.color.split(' ')[0]}`} />
            <div>
              <p className={`text-base font-bold italic ${s.color.split(' ')[0]} leading-none`}>{s.val}</p>
              <p className="text-[8px] font-semibold uppercase tracking-[0.15em] text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Thread list */}
      <div className="space-y-2">
        {filtradas.length === 0 && (
          <div className="text-center py-12 bg-white border-2 border-gray-100">
            <MessageCircle className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="font-semibold text-gray-300 uppercase italic">Nenhum tópico encontrado</p>
          </div>
        )}
        {filtradas.map(t => (
          <button key={t.id} onClick={() => setThreadAberta(t)}
            className="w-full text-left bg-white border-2 border-gray-100 hover:border-[#c9a96e]/30 hover:shadow-md transition-all p-4 group">
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div className={`w-9 h-9 ${t.avatarCor} flex items-center justify-center text-white text-xs font-semibold flex-shrink-0`}>
                {t.avatarInicial}
              </div>
              <div className="flex-1 min-w-0">
                {/* Badges */}
                <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                  <span className={`text-[9px] font-semibold uppercase px-2 py-0.5 ${categoriaCor[t.categoria]}`}>
                    {t.categoria}
                  </span>
                  {t.pinned && (
                    <span className="bg-[#0a1628]/5 text-[#1a2b4a] text-[9px] font-semibold uppercase px-1.5 py-0.5 flex items-center gap-0.5">
                      <Pin className="w-2 h-2" /> Fixado
                    </span>
                  )}
                  {t.hot && (
                    <span className="bg-rose-50 text-rose-600 text-[9px] font-semibold uppercase px-1.5 py-0.5 flex items-center gap-0.5">
                      <TrendingUp className="w-2 h-2" /> Em alta
                    </span>
                  )}
                </div>
                {/* Title */}
                <h3 className="font-bold text-[#1a2b4a] text-sm leading-snug group-hover:text-[#1a2b4a]/70 transition-colors mb-1 text-left">
                  {t.titulo}
                </h3>
                {/* Preview */}
                <p className="text-gray-400 text-[10px] font-bold leading-relaxed line-clamp-1 mb-2">{t.preview}</p>
                {/* Meta */}
                <div className="flex items-center gap-3 text-[10px] text-gray-400 font-bold">
                  <span className="flex items-center gap-0.5"><User className="w-3 h-3" />{t.autor}</span>
                  <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" />{t.tempo}</span>
                  <span className="flex items-center gap-0.5 ml-auto"><MessageCircle className="w-3 h-3" />{t.respostas}</span>
                  <span className="flex items-center gap-0.5"><Eye className="w-3 h-3" />{t.views}</span>
                  <span className="flex items-center gap-0.5"><ThumbsUp className="w-3 h-3" />{t.likes}</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#c9a96e] transition-colors flex-shrink-0 mt-1" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
