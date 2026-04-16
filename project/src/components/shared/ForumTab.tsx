// src/components/shared/ForumTab.tsx — Fórum NorthWindy (Supabase)
import { useState, useEffect, useCallback } from 'react';
import {
  MessageCircle, ThumbsUp, Eye, ChevronRight, Tag, Pin,
  TrendingUp, Search, Plus, X, Send, Clock, User, ArrowLeft,
  Loader2, AlertCircle,
} from 'lucide-react';
import {
  getForumPosts, getForumReplies, createForumPost, createForumReply,
  getLikedPostIds, toggleForumLike, timeAgo,
  type ForumPost, type ForumReply,
} from '../../lib/store/forum';

// ── Constantes ────────────────────────────────────────────────────────────────

const CATEGORIAS = ['Todos', 'Técnico', 'Rotas', 'Equipamento', 'Trabalho', 'Legal', 'Geral'];

const CAT_COR: Record<string, string> = {
  Técnico:     'bg-blue-100 text-blue-700',
  Rotas:       'bg-emerald-100 text-emerald-700',
  Trabalho:    'bg-amber-100 text-amber-700',
  Equipamento: 'bg-purple-100 text-purple-700',
  Legal:       'bg-slate-100 text-slate-700',
  Geral:       'bg-gray-100 text-gray-600',
};

function avatarCor(name: string) {
  const cores = ['bg-blue-700','bg-emerald-700','bg-rose-700','bg-amber-700','bg-slate-700','bg-violet-700','bg-[#0a1628]'];
  let h = 0; for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0xffff;
  return cores[h % cores.length];
}
function initials(name: string) {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

// ── Props ─────────────────────────────────────────────────────────────────────

export interface ForumUser {
  id:   string;
  name: string;
  type: string; // 'company' | 'sailor' | 'client'
}

interface Props {
  currentUser?: ForumUser;
}

// ── Componente de resposta ────────────────────────────────────────────────────

function ReplyCard({ reply }: { reply: ForumReply }) {
  return (
    <div className="flex gap-3 py-3 border-b border-gray-50 last:border-0">
      <div className={`w-8 h-8 ${avatarCor(reply.author_name)} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0`}>
        {initials(reply.author_name)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-bold text-[#1a2b4a] text-xs">{reply.author_name}</span>
          <span className="text-[10px] text-gray-400 font-semibold flex items-center gap-0.5">
            <Clock className="w-2.5 h-2.5" />{timeAgo(reply.created_at)}
          </span>
        </div>
        <p className="text-sm text-gray-600 font-semibold leading-relaxed">{reply.body}</p>
      </div>
    </div>
  );
}

// ── Vista de thread aberta ────────────────────────────────────────────────────

function ThreadView({
  post, currentUser, likedByMe,
  onBack, onLike,
}: {
  post: ForumPost;
  currentUser?: ForumUser;
  likedByMe: boolean;
  onBack: () => void;
  onLike: () => void;
}) {
  const [replies,       setReplies]       = useState<ForumReply[]>([]);
  const [loadingReplies,setLoadingReplies] = useState(true);
  const [respostaTexto, setRespostaTexto] = useState('');
  const [sending,       setSending]       = useState(false);
  const [likes,         setLikes]         = useState(post.like_count ?? 0);
  const [liked,         setLiked]         = useState(likedByMe);

  useEffect(() => {
    getForumReplies(post.id).then(r => { setReplies(r); setLoadingReplies(false); });
  }, [post.id]);

  async function handleLike() {
    if (!currentUser) return;
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikes(n => wasLiked ? n - 1 : n + 1);
    await toggleForumLike(post.id, currentUser.id, wasLiked);
    onLike();
  }

  async function handleReply() {
    if (!respostaTexto.trim() || !currentUser) return;
    setSending(true);
    try {
      const reply = await createForumReply({
        post_id:     post.id,
        body:        respostaTexto.trim(),
        author_name: currentUser.name,
        author_id:   currentUser.id,
        author_type: currentUser.type,
      });
      setReplies(r => [...r, reply]);
      setRespostaTexto('');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-[#1a2b4a] font-bold text-xs uppercase tracking-[0.15em] hover:gap-3 transition-all"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao Fórum
      </button>

      {/* Post */}
      <div className="bg-white border-2 border-gray-100 p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className={`w-10 h-10 ${avatarCor(post.author_name)} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
            {initials(post.author_name)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap gap-1.5 mb-1.5">
              <span className={`text-[9px] font-bold uppercase px-2 py-0.5 ${CAT_COR[post.categoria] ?? 'bg-gray-100 text-gray-600'}`}>
                {post.categoria}
              </span>
              {post.pinned && (
                <span className="bg-[#0a1628]/5 text-[#1a2b4a] text-[9px] font-bold uppercase px-2 py-0.5 flex items-center gap-1">
                  <Pin className="w-2.5 h-2.5" /> Fixado
                </span>
              )}
            </div>
            <h3 className="font-bold text-[#1a2b4a] text-base leading-snug mb-1">{post.title}</h3>
            <div className="flex items-center gap-3 text-[10px] text-gray-400 font-bold">
              <span className="flex items-center gap-1"><User className="w-3 h-3" />{post.author_name}</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{timeAgo(post.created_at)}</span>
            </div>
          </div>
        </div>

        <p className="text-gray-600 text-sm font-semibold leading-relaxed mb-5 whitespace-pre-wrap">{post.body}</p>

        <div className="flex gap-4 text-xs text-gray-400 font-bold pt-4 border-t border-gray-100">
          <button
            onClick={handleLike}
            disabled={!currentUser}
            className={`flex items-center gap-1 transition-colors ${liked ? 'text-[#c9a96e]' : 'hover:text-[#1a2b4a]'} disabled:opacity-40`}
          >
            <ThumbsUp className="w-3.5 h-3.5" /> {likes}
          </button>
          <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" />{replies.length} respostas</span>
          <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{post.views}</span>
        </div>
      </div>

      {/* Respostas */}
      <div className="bg-white border-2 border-gray-100 p-4">
        <p className="text-[10px] font-bold text-[#c9a96e] uppercase tracking-[0.15em] mb-3">
          {replies.length} {replies.length === 1 ? 'Resposta' : 'Respostas'}
        </p>
        {loadingReplies ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-gray-300" />
          </div>
        ) : replies.length === 0 ? (
          <div className="py-8 text-center">
            <MessageCircle className="w-8 h-8 text-gray-200 mx-auto mb-2" />
            <p className="text-xs font-semibold text-gray-300 uppercase italic">Seja o primeiro a responder</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {replies.map(r => <ReplyCard key={r.id} reply={r} />)}
          </div>
        )}
      </div>

      {/* Caixa de resposta */}
      <div className="bg-white border-2 border-gray-100 p-4">
        <p className="text-xs font-bold text-[#1a2b4a] uppercase tracking-[0.15em] mb-3">Deixar uma resposta</p>
        {!currentUser ? (
          <div className="bg-[#0a1628]/5 px-4 py-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#c9a96e] flex-shrink-0" />
            <p className="text-xs font-semibold text-[#1a2b4a]">Inicie sessão para responder.</p>
          </div>
        ) : (
          <>
            <textarea
              value={respostaTexto}
              onChange={e => setRespostaTexto(e.target.value)}
              placeholder="Escreva a sua resposta…"
              rows={3}
              className="w-full bg-gray-50 border-2 border-gray-100 px-4 py-3 text-sm font-semibold text-[#1a2b4a] placeholder-gray-400 focus:outline-none focus:border-[#c9a96e] resize-none mb-3"
            />
            <div className="flex justify-end">
              <button
                onClick={handleReply}
                disabled={!respostaTexto.trim() || sending}
                className="flex items-center gap-1.5 bg-[#0a1628] hover:bg-[#0a1628]/90 disabled:opacity-50 text-white text-xs font-bold uppercase px-5 py-2.5 transition-all"
              >
                {sending
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : <Send className="w-3.5 h-3.5" />
                }
                Publicar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export function ForumTab({ currentUser }: Props) {
  const [posts,         setPosts]         = useState<ForumPost[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [catAtiva,      setCatAtiva]      = useState('Todos');
  const [busca,         setBusca]         = useState('');
  const [novaThread,    setNovaThread]    = useState(false);
  const [novoTitulo,    setNovoTitulo]    = useState('');
  const [novoTexto,     setNovoTexto]     = useState('');
  const [novaCat,       setNovaCat]       = useState('Geral');
  const [sending,       setSending]       = useState(false);
  const [threadAberta,  setThreadAberta]  = useState<ForumPost | null>(null);
  const [likedIds,      setLikedIds]      = useState<string[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [p, l] = await Promise.all([
        getForumPosts(catAtiva === 'Todos' ? undefined : catAtiva),
        currentUser ? getLikedPostIds(currentUser.id) : Promise.resolve([]),
      ]);
      setPosts(p);
      setLikedIds(l);
    } finally {
      setLoading(false);
    }
  }, [catAtiva, currentUser]);

  useEffect(() => { load(); }, [load]);

  const filtrados = posts.filter(p =>
    busca === '' ||
    p.title.toLowerCase().includes(busca.toLowerCase()) ||
    p.author_name.toLowerCase().includes(busca.toLowerCase())
  );

  async function handlePublicar() {
    if (!novoTitulo.trim() || !novoTexto.trim() || !currentUser) return;
    setSending(true);
    try {
      await createForumPost({
        title:       novoTitulo.trim(),
        body:        novoTexto.trim(),
        categoria:   novaCat,
        author_name: currentUser.name,
        author_id:   currentUser.id,
        author_type: currentUser.type,
        pinned:      false,
      });
      setNovaThread(false); setNovoTitulo(''); setNovoTexto(''); setNovaCat('Geral');
      await load();
    } finally {
      setSending(false);
    }
  }

  // Vista de thread aberta
  if (threadAberta) {
    return (
      <ThreadView
        post={threadAberta}
        currentUser={currentUser}
        likedByMe={likedIds.includes(threadAberta.id)}
        onBack={() => setThreadAberta(null)}
        onLike={load}
      />
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-['Playfair_Display'] font-bold text-[#1a2b4a]">Fórum</h2>
          <p className="text-xs text-gray-400 font-bold mt-0.5">Comunidade NorthWindy · {filtrados.length} tópicos</p>
        </div>
        {currentUser && (
          <button
            onClick={() => setNovaThread(true)}
            className="flex items-center gap-1.5 bg-[#0a1628] hover:bg-[#0a1628]/90 text-white text-xs font-bold uppercase px-4 py-2.5 transition-all shadow-md shadow-[#0a1628]/20"
          >
            <Plus className="w-3.5 h-3.5" /> Novo Tópico
          </button>
        )}
      </div>

      {/* Formulário novo tópico */}
      {novaThread && (
        <div className="bg-white border-2 border-[#c9a96e]/30 p-5 shadow-lg shadow-[#0a1628]/5">
          <div className="flex items-center justify-between mb-4">
            <p className="font-bold text-[#1a2b4a] text-sm uppercase tracking-[0.15em]">Criar Novo Tópico</p>
            <button onClick={() => setNovaThread(false)} className="text-gray-400 hover:text-red-500 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] block mb-1">Categoria</label>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIAS.filter(c => c !== 'Todos').map(cat => (
                  <button key={cat} onClick={() => setNovaCat(cat)}
                    className={`px-3 py-1 text-[9px] font-bold uppercase transition-all ${
                      novaCat === cat ? 'bg-[#0a1628] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] block mb-1">Título</label>
              <input
                value={novoTitulo} onChange={e => setNovoTitulo(e.target.value)}
                placeholder="Escreva o título do tópico…"
                className="w-full bg-gray-50 border-2 border-gray-100 px-4 py-2.5 text-sm font-semibold text-[#1a2b4a] placeholder-gray-400 focus:outline-none focus:border-[#c9a96e]"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] block mb-1">Mensagem</label>
              <textarea
                value={novoTexto} onChange={e => setNovoTexto(e.target.value)}
                placeholder="Descreva a sua questão ou partilhe informação…"
                rows={4}
                className="w-full bg-gray-50 border-2 border-gray-100 px-4 py-3 text-sm font-semibold text-[#1a2b4a] placeholder-gray-400 focus:outline-none focus:border-[#c9a96e] resize-none"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setNovaThread(false)}
                className="px-4 py-2 text-xs font-bold text-gray-500 border-2 border-gray-200 hover:border-gray-300 transition-all uppercase">
                Cancelar
              </button>
              <button
                onClick={handlePublicar}
                disabled={!novoTitulo.trim() || !novoTexto.trim() || sending}
                className="flex items-center gap-1.5 bg-[#0a1628] hover:bg-[#0a1628]/90 disabled:opacity-50 text-white text-xs font-bold uppercase px-5 py-2 transition-all"
              >
                {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                Publicar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text" placeholder="Pesquisar tópicos…" value={busca}
          onChange={e => setBusca(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-white border-2 border-gray-100 text-[#1a2b4a] font-semibold text-sm placeholder-gray-400 focus:outline-none focus:border-[#c9a96e]"
        />
      </div>

      {/* Filtros de categoria */}
      <div className="flex items-center gap-2 flex-wrap">
        <Tag className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
        {CATEGORIAS.map(cat => (
          <button key={cat} onClick={() => setCatAtiva(cat)}
            className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide transition-all ${
              catAtiva === cat
                ? 'bg-[#0a1628] text-white shadow-md shadow-[#0a1628]/20'
                : 'bg-white text-gray-500 border border-gray-200 hover:border-[#c9a96e]/30 hover:text-[#1a2b4a]'
            }`}>
            {cat}
          </button>
        ))}
      </div>

      {/* Stats */}
      {!loading && filtrados.length > 0 && (
        <div className="flex gap-2">
          {[
            { icon: TrendingUp, val: filtrados.filter(p => (p.reply_count ?? 0) > 10).length,          label: 'Em alta',  color: 'text-rose-500 bg-rose-50' },
            { icon: Pin,        val: filtrados.filter(p => p.pinned).length,                            label: 'Fixados',  color: 'text-[#c9a96e] bg-[#0a1628]/5' },
            { icon: MessageCircle, val: filtrados.reduce((s, p) => s + (p.reply_count ?? 0), 0),       label: 'Respostas',color: 'text-emerald-600 bg-emerald-50' },
          ].map(s => (
            <div key={s.label} className={`${s.color} px-3 py-2 flex items-center gap-2 flex-1`}>
              <s.icon className={`w-4 h-4 ${s.color.split(' ')[0]}`} />
              <div>
                <p className={`text-base font-bold italic ${s.color.split(' ')[0]} leading-none`}>{s.val}</p>
                <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-gray-500">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lista de posts */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-[#c9a96e]" />
        </div>
      ) : filtrados.length === 0 ? (
        <div className="text-center py-14 bg-white border-2 border-dashed border-gray-200">
          <MessageCircle className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="font-bold text-gray-300 uppercase italic text-sm">
            {posts.length === 0 ? 'Ainda não há tópicos' : 'Nenhum tópico encontrado'}
          </p>
          {currentUser && posts.length === 0 && (
            <button onClick={() => setNovaThread(true)}
              className="mt-4 inline-flex items-center gap-1.5 bg-[#0a1628] text-white text-xs font-bold uppercase px-4 py-2.5">
              <Plus className="w-3.5 h-3.5" /> Criar o primeiro tópico
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtrados.map(post => {
            const hot = (post.reply_count ?? 0) > 10 || (post.like_count ?? 0) > 20;
            return (
              <button key={post.id} onClick={() => setThreadAberta(post)}
                className="w-full text-left bg-white border-2 border-gray-100 hover:border-[#c9a96e]/30 hover:shadow-md transition-all p-4 group">
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 ${avatarCor(post.author_name)} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                    {initials(post.author_name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                      <span className={`text-[9px] font-bold uppercase px-2 py-0.5 ${CAT_COR[post.categoria] ?? 'bg-gray-100 text-gray-600'}`}>
                        {post.categoria}
                      </span>
                      {post.pinned && (
                        <span className="bg-[#0a1628]/5 text-[#1a2b4a] text-[9px] font-bold uppercase px-1.5 py-0.5 flex items-center gap-0.5">
                          <Pin className="w-2 h-2" /> Fixado
                        </span>
                      )}
                      {hot && (
                        <span className="bg-rose-50 text-rose-600 text-[9px] font-bold uppercase px-1.5 py-0.5 flex items-center gap-0.5">
                          <TrendingUp className="w-2 h-2" /> Em alta
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-[#1a2b4a] text-sm leading-snug group-hover:text-[#1a2b4a]/70 transition-colors mb-1 text-left line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-gray-400 text-[10px] font-semibold leading-relaxed line-clamp-1 mb-2">{post.body}</p>
                    <div className="flex items-center gap-3 text-[10px] text-gray-400 font-bold">
                      <span className="flex items-center gap-0.5"><User className="w-3 h-3" />{post.author_name}</span>
                      <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" />{timeAgo(post.created_at)}</span>
                      <span className="flex items-center gap-0.5 ml-auto"><MessageCircle className="w-3 h-3" />{post.reply_count ?? 0}</span>
                      <span className="flex items-center gap-0.5"><Eye className="w-3 h-3" />{post.views}</span>
                      <span className={`flex items-center gap-0.5 ${likedIds.includes(post.id) ? 'text-[#c9a96e]' : ''}`}>
                        <ThumbsUp className="w-3 h-3" />{post.like_count ?? 0}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#c9a96e] transition-colors flex-shrink-0 mt-1" />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
