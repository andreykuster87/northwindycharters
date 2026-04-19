// src/components/pages/ClientProfileView.tsx
// Perfil público read-only de um passageiro (client) — design NorthWindy.
// Hero com banner de avaliação + subtabs Fórum | Amigos | Fotos | Biografia.
import { useState } from 'react';
import {
  ArrowLeft, Waves, User, Image as ImageIcon, CheckCircle2, MapPin,
  MessageSquare, Users as UsersIcon, Info, Star,
} from 'lucide-react';
import type { Client } from '../../lib/store/core';
import { getSailors, getClients, getCompanies } from '../../lib/localStore';
import type { FriendProfileType } from '../../lib/localStore';
import { FriendButton, useFriendships } from '../shared/FriendComponents';
import { ForumTab, type ForumUser } from '../shared/ForumTab';

type SubTab = 'forum' | 'amigos' | 'fotos' | 'informacoes';

interface Props {
  client:            Client;
  onBack:            () => void;
  currentUserId?:    string;
  currentUserType?:  FriendProfileType;
  currentUserName?:  string;
  onOpenFriendProfile?: (otherId: string, otherType: FriendProfileType) => void;
}

export function ClientProfileView({ client, onBack, currentUserId, currentUserType, currentUserName, onOpenFriendProfile }: Props) {
  const { friendships: myFriendships, loadFriendships } = useFriendships(currentUserId);
  const { friendships: theirFriendships } = useFriendships(client.id);
  const [subTab, setSubTab] = useState<SubTab>('informacoes');

  const album = client.album || [];
  const bio   = client.outras_informacoes;
  const canAddFriend = !!currentUserId && !!currentUserType && currentUserId !== client.id;

  const forumUser: ForumUser | undefined = currentUserId && currentUserType
    ? { id: currentUserId, name: currentUserName || 'Usuário', type: currentUserType }
    : undefined;

  // Apenas amizades aceitas deste passageiro (read-only)
  const theirAccepted = theirFriendships.filter(f => f.status === 'accepted');

  function friendDisplay(f: typeof theirAccepted[number]) {
    const otherId   = f.requester_id === client.id ? f.recipient_id   : f.requester_id;
    const otherType = f.requester_id === client.id ? f.recipient_type : f.requester_type;
    let name = otherId;
    let photo: string | null = null;
    if (otherType === 'sailor') {
      const s = getSailors().find(s => s.id === otherId);
      if (s) { name = s.name; photo = s.profile_photo ?? null; }
    } else if (otherType === 'client') {
      const c = getClients().find(c => c.id === otherId);
      if (c) { name = c.name; photo = c.profile_photo ?? null; }
    } else if (otherType === 'company') {
      const c = getCompanies().find(c => c.id === otherId);
      if (c) { name = c.nome_fantasia; photo = (c as any).profile_photo ?? null; }
    }
    return { name, photo, otherId, otherType };
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* ── NAVBAR ── */}
      <nav className="bg-[#0a1628] text-white px-4 py-3 sticky top-0 z-40 shadow-xl border-b border-[#c9a96e]/10">
        <div className="flex items-center gap-3 max-w-6xl mx-auto">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Waves className="w-5 h-5 text-[#c9a96e]" />
            <span className="font-['Playfair_Display'] font-bold italic text-base hidden sm:inline text-white">NorthWindy</span>
          </div>
          <div className="flex-1" />
          {canAddFriend && (
            <FriendButton
              myId={currentUserId!} myType={currentUserType!}
              theirId={client.id} theirType="client"
              friendships={myFriendships} onAction={loadFriendships} compact
            />
          )}
          <button onClick={onBack}
            className="bg-white/5 hover:bg-red-600/80 px-4 py-2 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-all flex-shrink-0 border border-white/10">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Voltar</span>
          </button>
        </div>
      </nav>

      {/* ── CONTENT ── */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 space-y-6">


        <div>
          <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em] mb-1">Passageiro</p>
          <h2 className="font-['Playfair_Display'] font-bold text-[#1a2b4a] text-xl">Perfil Público</h2>
          <div className="w-8 h-px bg-[#c9a96e] mt-2" />
        </div>

        {/* Hero com banner de avaliação */}
        <div className="bg-[#0a1628] p-5 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: 'repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 0,transparent 60px),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 0,transparent 60px)' }} />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a96e]/60 to-transparent" />
          <div className="relative flex items-center gap-4">
            <div className="w-20 h-20 overflow-hidden border border-[#c9a96e]/40 flex-shrink-0 bg-white/10 flex items-center justify-center">
              {client.profile_photo
                ? <img src={client.profile_photo} alt={client.name} className="w-full h-full object-cover" />
                : <User className="w-10 h-10 text-[#c9a96e]/60" />
              }
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#c9a96e] mb-1">
                {client.profile_number}
              </p>
              <h3 className="font-['Playfair_Display'] font-bold text-lg leading-tight truncate">{client.name}</h3>
              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                {!client.blocked && (
                  <span className="bg-[#c9a96e]/15 border border-[#c9a96e]/30 text-[#c9a96e] text-[10px] font-semibold px-2.5 py-0.5 flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5" /> Verificado
                  </span>
                )}
                {client.country_name && (
                  <span className="bg-white/10 text-white/70 text-[10px] font-medium px-2.5 py-0.5 flex items-center gap-1">
                    <MapPin className="w-2.5 h-2.5" /> {client.country_name}
                  </span>
                )}
              </div>
            </div>

            <div className="flex-shrink-0 flex flex-col items-end gap-1">
              <p className="text-[9px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em]">Avaliação</p>
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star key={i} className="w-3 h-3 text-[#c9a96e]/30" />
                ))}
              </div>
              <p className="text-[9px] font-medium text-white/50">Sem avaliações</p>
            </div>
          </div>
        </div>

        {/* SubTabs */}
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {([
            { key: 'forum',       label: 'Fórum',     icon: MessageSquare },
            { key: 'amigos',      label: 'Amigos',    icon: UsersIcon     },
            { key: 'fotos',       label: 'Fotos',     icon: ImageIcon     },
            { key: 'informacoes', label: 'Biografia', icon: Info          },
          ] as { key: SubTab; label: string; icon: any }[]).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setSubTab(key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold transition-all border-b-2 -mb-px whitespace-nowrap ${
                subTab === key
                  ? 'border-[#c9a96e] text-[#c9a96e]'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Fórum */}
        {subTab === 'forum' && (
          <ForumTab currentUser={forumUser} />
        )}

        {/* Amigos (read-only) */}
        {subTab === 'amigos' && (
          <div className="bg-white border-2 border-[#0a1628]/5 p-5">
            <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em] mb-3 flex items-center gap-1.5">
              <UsersIcon className="w-3.5 h-3.5" /> Amigos ({theirAccepted.length})
            </p>
            {theirAccepted.length === 0 ? (
              <p className="text-sm text-gray-400 font-semibold italic">
                Este passageiro ainda não possui amigos.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {theirAccepted.map(f => {
                  const { name, photo, otherId, otherType } = friendDisplay(f);
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => {
                        console.log('[ClientProfileView] friend click', { otherId, otherType, hasHandler: !!onOpenFriendProfile });
                        onOpenFriendProfile?.(otherId, otherType);
                      }}
                      className="bg-gray-50 border border-[#0a1628]/5 p-3 flex items-center gap-3 cursor-pointer hover:bg-[#c9a96e]/5 hover:border-[#c9a96e]/40 transition-all text-left w-full"
                    >
                      <div className="w-10 h-10 border border-[#c9a96e]/20 overflow-hidden bg-white flex items-center justify-center flex-shrink-0">
                        {photo
                          ? <img src={photo} alt={name} className="w-full h-full object-cover" />
                          : <User className="w-5 h-5 text-[#c9a96e]/40" />}
                      </div>
                      <p className="font-bold text-[#1a2b4a] text-sm truncate uppercase flex-1">{name}</p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Fotos (read-only) */}
        {subTab === 'fotos' && (
          <section className="bg-white border-2 border-[#0a1628]/5 p-5">
            <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em] mb-3 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5" /> Álbum
            </p>
            {album.length === 0 ? (
              <div className="border-2 border-dashed border-gray-200 py-12 text-center">
                <ImageIcon className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                <p className="text-xs font-bold text-gray-300 uppercase tracking-wider">Nenhuma foto compartilhada</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {album.map((url, i) => (
                  <div key={i} className="overflow-hidden" style={{ aspectRatio: '1/1' }}>
                    <img src={url} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Biografia (read-only) */}
        {subTab === 'informacoes' && (
          <div className="bg-white border-2 border-[#0a1628]/5 p-5">
            <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em] mb-3 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> Biografia
            </p>
            {bio ? (
              <p className="text-sm text-gray-600 font-semibold leading-relaxed whitespace-pre-wrap">{bio}</p>
            ) : (
              <p className="text-sm text-gray-400 font-semibold italic">
                Este passageiro ainda não adicionou uma biografia.
              </p>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
