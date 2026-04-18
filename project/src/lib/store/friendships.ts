// src/lib/store/friendships.ts
import { supabase } from '../supabase';

export type FriendProfileType = 'sailor' | 'client' | 'company';
export type FriendshipStatus = 'none' | 'pending_sent' | 'pending_received' | 'accepted';

export interface Friendship {
  id: string;
  requester_id: string;
  requester_type: FriendProfileType;
  recipient_id: string;
  recipient_type: FriendProfileType;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  updated_at: string;
}

export async function fetchFriendships(userId: string): Promise<Friendship[]> {
  const { data, error } = await supabase
    .from('friendships')
    .select('*')
    .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`)
    .neq('status', 'declined');
  if (error) throw error;
  return data ?? [];
}

export async function sendFriendRequest(
  requesterId: string,
  requesterType: FriendProfileType,
  recipientId: string,
  recipientType: FriendProfileType,
): Promise<Friendship> {
  const { data, error } = await supabase
    .from('friendships')
    .insert({ requester_id: requesterId, requester_type: requesterType, recipient_id: recipientId, recipient_type: recipientType })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function respondFriendRequest(id: string, status: 'accepted' | 'declined'): Promise<void> {
  const { error } = await supabase
    .from('friendships')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteFriendship(id: string): Promise<void> {
  const { error } = await supabase.from('friendships').delete().eq('id', id);
  if (error) throw error;
}

export function getFriendshipBetween(
  friendships: Friendship[],
  myId: string,
  theirId: string,
): { status: FriendshipStatus; friendship?: Friendship } {
  const f = friendships.find(
    fr => (fr.requester_id === myId && fr.recipient_id === theirId) ||
          (fr.requester_id === theirId && fr.recipient_id === myId),
  );
  if (!f) return { status: 'none' };
  if (f.status === 'accepted') return { status: 'accepted', friendship: f };
  if (f.requester_id === myId) return { status: 'pending_sent', friendship: f };
  return { status: 'pending_received', friendship: f };
}
