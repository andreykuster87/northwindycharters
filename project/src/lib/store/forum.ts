// src/lib/store/forum.ts — Fórum NorthWindy (Supabase)
import { supabase } from '../supabase';

export interface ForumPost {
  id:          string;
  title:       string;
  body:        string;
  categoria:   string;
  author_name: string;
  author_id:   string;
  author_type: string;
  pinned:      boolean;
  views:       number;
  created_at:  string;
  // computed
  reply_count?: number;
  like_count?:  number;
  liked_by_me?: boolean;
}

export interface ForumReply {
  id:          string;
  post_id:     string;
  body:        string;
  author_name: string;
  author_id:   string;
  author_type: string;
  created_at:  string;
}

export async function getForumPosts(categoria?: string): Promise<ForumPost[]> {
  let q = supabase.from('forum_posts').select(`
    *,
    reply_count:forum_replies(count),
    like_count:forum_likes(count)
  `).order('pinned', { ascending: false }).order('created_at', { ascending: false });
  if (categoria && categoria !== 'Todos') q = q.eq('categoria', categoria);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []).map((r: any) => ({
    ...r,
    reply_count: r.reply_count?.[0]?.count ?? 0,
    like_count:  r.like_count?.[0]?.count ?? 0,
  }));
}

export async function incrementPostViews(id: string): Promise<void> {
  await supabase.rpc('increment_forum_views', { post_id: id }).maybeSingle();
}

export async function createForumPost(data: Omit<ForumPost, 'id' | 'created_at' | 'views' | 'reply_count' | 'like_count' | 'liked_by_me'>): Promise<ForumPost> {
  const { data: inserted, error } = await supabase
    .from('forum_posts').insert({ ...data, views: 0 }).select().single();
  if (error) throw error;
  return { ...inserted, reply_count: 0, like_count: 0, liked_by_me: false };
}

export async function getForumReplies(postId: string): Promise<ForumReply[]> {
  const { data, error } = await supabase
    .from('forum_replies').select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createForumReply(data: Omit<ForumReply, 'id' | 'created_at'>): Promise<ForumReply> {
  const { data: inserted, error } = await supabase
    .from('forum_replies').insert(data).select().single();
  if (error) throw error;
  return inserted;
}

export async function getLikedPostIds(userId: string): Promise<string[]> {
  const { data } = await supabase
    .from('forum_likes').select('post_id').eq('user_id', userId);
  return (data ?? []).map((r: any) => r.post_id);
}

export async function toggleForumLike(postId: string, userId: string, currentlyLiked: boolean): Promise<void> {
  if (currentlyLiked) {
    await supabase.from('forum_likes').delete().eq('post_id', postId).eq('user_id', userId);
  } else {
    await supabase.from('forum_likes').insert({ post_id: postId, user_id: userId });
  }
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'agora';
  if (m < 60) return `há ${m}min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `há ${h}h`;
  const d = Math.floor(h / 24);
  if (d < 30) return `há ${d}d`;
  return new Date(iso).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' });
}
