// src/components/shared/FriendComponents.tsx
// Componentes de amizade reutilizáveis em sailor, client e company.
import { useState, useEffect, useCallback } from 'react';
import { User, UserPlus, UserCheck, UserX, Clock, Users, CheckCircle2, XCircle } from 'lucide-react';
import {
  fetchFriendships, sendFriendRequest, respondFriendRequest, deleteFriendship, getFriendshipBetween,
  getSailors, getClients, getCompanies,
  type Friendship, type FriendProfileType,
} from '../../lib/localStore';

export type { FriendProfileType };

// ── FriendButton ──────────────────────────────────────────────────────────────

export interface FriendButtonProps {
  myId:        string;
  myType:      FriendProfileType;
  theirId:     string;
  theirType:   FriendProfileType;
  friendships: Friendship[];
  onAction:    () => Promise<void>;
  compact?:    boolean;
}

export function FriendButton({ myId, myType, theirId, theirType, friendships, onAction, compact }: FriendButtonProps) {
  const [loading, setLoading] = useState(false);
  const { status, friendship } = getFriendshipBetween(friendships, myId, theirId);

  async function handle() {
    setLoading(true);
    try {
      if (status === 'none') {
        await sendFriendRequest(myId, myType, theirId, theirType);
      } else if (status === 'pending_sent' && friendship) {
        await deleteFriendship(friendship.id);
      } else if (status === 'pending_received' && friendship) {
        await respondFriendRequest(friendship.id, 'accepted');
      } else if (status === 'accepted' && friendship) {
        await deleteFriendship(friendship.id);
      }
      await onAction();
    } finally {
      setLoading(false);
    }
  }

  const base = compact
    ? 'flex items-center gap-1.5 text-[10px] font-bold uppercase px-3 py-1.5 border transition-all'
    : 'flex items-center gap-2 text-xs font-bold uppercase px-4 py-2.5 border-2 transition-all w-full justify-center';

  if (status === 'accepted') return (
    <button onClick={handle} disabled={loading}
      className={`${base} border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-red-50 hover:border-red-200 hover:text-red-600`}>
      <UserCheck className="w-3.5 h-3.5 flex-shrink-0" />
      <span>{loading ? '...' : 'Amigos'}</span>
    </button>
  );

  if (status === 'pending_sent') return (
    <button onClick={handle} disabled={loading}
      className={`${base} border-amber-200 bg-amber-50 text-amber-600 hover:bg-red-50 hover:border-red-200 hover:text-red-600`}>
      <Clock className="w-3.5 h-3.5 flex-shrink-0" />
      <span>{loading ? '...' : 'Pendente'}</span>
    </button>
  );

  if (status === 'pending_received') return (
    <button onClick={handle} disabled={loading}
      className={`${base} border-[#c9a96e]/40 bg-[#c9a96e]/10 text-[#1a2b4a] hover:bg-[#c9a96e]/20`}>
      <UserPlus className="w-3.5 h-3.5 flex-shrink-0" />
      <span>{loading ? '...' : 'Aceitar pedido'}</span>
    </button>
  );

  return (
    <button onClick={handle} disabled={loading}
      className={`${base} border-[#0a1628]/20 bg-[#0a1628]/5 text-[#1a2b4a] hover:bg-[#0a1628] hover:text-white hover:border-[#0a1628]`}>
      <UserPlus className="w-3.5 h-3.5 flex-shrink-0" />
      <span>{loading ? '...' : 'Adicionar Amigo'}</span>
    </button>
  );
}

// ── AmigosTab ─────────────────────────────────────────────────────────────────

export interface AmigosTabProps {
  myId:          string;
  myType:        FriendProfileType;
  friendships:   Friendship[];
  onRefresh:     () => Promise<void>;
  onOpenProfile?: (otherId: string, otherType: FriendProfileType) => void;
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em] mb-3 flex items-center gap-1.5">
      {children}
    </p>
  );
}

export function AmigosTab({ myId, myType: _myType, friendships, onRefresh, onOpenProfile }: AmigosTabProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const pending  = friendships.filter(f => f.status === 'pending' && f.recipient_id === myId);
  const accepted = friendships.filter(f => f.status === 'accepted');
  const sent     = friendships.filter(f => f.status === 'pending' && f.requester_id === myId);

  function resolveName(f: Friendship): string {
    const otherId   = f.requester_id === myId ? f.recipient_id   : f.requester_id;
    const otherType = f.requester_id === myId ? f.recipient_type : f.requester_type;
    if (otherType === 'sailor')  return getSailors().find(s => s.id === otherId)?.name ?? otherId;
    if (otherType === 'client')  return getClients().find(c => c.id === otherId)?.name ?? otherId;
    if (otherType === 'company') return getCompanies().find(c => c.id === otherId)?.nome_fantasia ?? otherId;
    return otherId;
  }

  function resolvePhoto(f: Friendship): string | null {
    const otherId   = f.requester_id === myId ? f.recipient_id   : f.requester_id;
    const otherType = f.requester_id === myId ? f.recipient_type : f.requester_type;
    if (otherType === 'sailor')  return getSailors().find(s => s.id === otherId)?.profile_photo ?? null;
    if (otherType === 'company') return (getCompanies().find(c => c.id === otherId) as any)?.profile_photo ?? null;
    return null;
  }

  async function act(id: string, action: 'accept' | 'decline' | 'remove') {
    setLoading(id);
    try {
      if (action === 'accept')  await respondFriendRequest(id, 'accepted');
      if (action === 'decline') await respondFriendRequest(id, 'declined');
      if (action === 'remove')  await deleteFriendship(id);
      await onRefresh();
    } finally { setLoading(null); }
  }

  const btnBase = 'flex items-center gap-1 text-[9px] font-bold uppercase px-2.5 py-1.5 border transition-all';

  function FriendRow({ f, actions, clickable }: { f: Friendship; actions: React.ReactNode; clickable?: boolean }) {
    const name  = resolveName(f);
    const photo = resolvePhoto(f);
    const otherId   = f.requester_id === myId ? f.recipient_id   : f.requester_id;
    const otherType = f.requester_id === myId ? f.recipient_type : f.requester_type;
    const canOpen   = clickable && !!onOpenProfile;
    const openProfile = () => { if (canOpen) onOpenProfile!(otherId, otherType); };

    return (
      <div className={`bg-white border-2 border-[#0a1628]/5 p-4 flex items-center gap-3 ${canOpen ? 'cursor-pointer hover:border-[#c9a96e]/40 hover:bg-[#c9a96e]/5 transition-all' : ''}`}>
        <div
          className={`w-10 h-10 border border-[#c9a96e]/20 overflow-hidden bg-[#0a1628]/5 flex items-center justify-center flex-shrink-0 ${canOpen ? 'cursor-pointer' : ''}`}
          onClick={openProfile}
          role={canOpen ? 'button' : undefined}
          title={canOpen ? 'Abrir perfil' : undefined}
        >
          {photo
            ? <img src={photo} alt={name} className="w-full h-full object-cover" />
            : <User className="w-5 h-5 text-[#c9a96e]/40" />}
        </div>
        <div
          className={`flex-1 min-w-0 ${canOpen ? 'cursor-pointer' : ''}`}
          onClick={openProfile}
          role={canOpen ? 'button' : undefined}
          title={canOpen ? 'Abrir perfil' : undefined}
        >
          <p className="font-bold text-[#1a2b4a] text-sm truncate uppercase">{name}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-['Playfair_Display'] font-bold text-2xl text-[#1a2b4a]">Amigos</h2>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-0.5">Conexões e pedidos pendentes</p>
      </div>

      {pending.length > 0 && (
        <div>
          <Label><UserPlus className="w-3.5 h-3.5" /> Pedidos recebidos ({pending.length})</Label>
          <div className="space-y-2">
            {pending.map(f => (
              <FriendRow key={f.id} f={f} actions={<>
                <button disabled={loading === f.id} onClick={() => act(f.id, 'accept')}
                  className={`${btnBase} border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100`}>
                  <CheckCircle2 className="w-3 h-3" /> Aceitar
                </button>
                <button disabled={loading === f.id} onClick={() => act(f.id, 'decline')}
                  className={`${btnBase} border-red-200 bg-red-50 text-red-600 hover:bg-red-100`}>
                  <XCircle className="w-3 h-3" /> Recusar
                </button>
              </>} />
            ))}
          </div>
        </div>
      )}

      {accepted.length > 0 ? (
        <div>
          <Label><UserCheck className="w-3.5 h-3.5" /> Amigos ({accepted.length})</Label>
          <div className="space-y-2">
            {accepted.map(f => (
              <FriendRow key={f.id} f={f} clickable actions={
                <button disabled={loading === f.id} onClick={(e) => { e.stopPropagation(); act(f.id, 'remove'); }}
                  className={`${btnBase} border-gray-200 bg-gray-50 text-gray-400 hover:bg-red-50 hover:border-red-200 hover:text-red-600`}>
                  <UserX className="w-3 h-3" /> Remover
                </button>
              } />
            ))}
          </div>
        </div>
      ) : (
        pending.length === 0 && sent.length === 0 && (
          <div className="bg-white border-2 border-dashed border-gray-200 py-16 text-center">
            <Users className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="font-bold text-gray-300 uppercase text-sm">Nenhum amigo ainda</p>
          </div>
        )
      )}

      {sent.length > 0 && (
        <div>
          <Label><Clock className="w-3.5 h-3.5" /> Pedidos enviados ({sent.length})</Label>
          <div className="space-y-2">
            {sent.map(f => (
              <FriendRow key={f.id} f={f} actions={
                <button disabled={loading === f.id} onClick={() => act(f.id, 'remove')}
                  className={`${btnBase} border-amber-200 bg-amber-50 text-amber-600 hover:bg-red-50 hover:border-red-200 hover:text-red-600`}>
                  <XCircle className="w-3 h-3" /> Cancelar
                </button>
              } />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Hook useFriendships ───────────────────────────────────────────────────────

export function useFriendships(userId: string | undefined) {
  const [friendships, setFriendships] = useState<Friendship[]>([]);

  const load = useCallback(async () => {
    if (!userId) return;
    try { setFriendships(await fetchFriendships(userId)); } catch {}
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const pendingCount = friendships.filter(f => f.status === 'pending' && f.recipient_id === userId).length;

  return { friendships, loadFriendships: load, pendingCount };
}
