// src/components/pages/ClientProfileView.tsx
// Perfil público read-only de um passageiro (client).
// Mostra apenas dados públicos: nome, país, foto, álbum.
import { ArrowLeft, Waves, User, Image as ImageIcon, CheckCircle2, MapPin } from 'lucide-react';
import type { Client } from '../../lib/store/core';
import type { FriendProfileType } from '../../lib/localStore';
import { FriendButton, useFriendships } from '../shared/FriendComponents';

interface Props {
  client:            Client;
  onBack:            () => void;
  currentUserId?:    string;
  currentUserType?:  FriendProfileType;
}

export function ClientProfileView({ client, onBack, currentUserId, currentUserType }: Props) {
  const { friendships, loadFriendships } = useFriendships(currentUserId);
  const album = client.album || [];
  const canAddFriend = !!currentUserId && !!currentUserType && currentUserId !== client.id;

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
              friendships={friendships} onAction={loadFriendships} compact
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

        {/* Hero */}
        <div className="bg-[#0a1628] p-6 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: 'repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 0,transparent 60px),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 0,transparent 60px)' }} />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a96e]/60 to-transparent" />
          <div className="relative flex items-center gap-1.5 flex-wrap">
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

        {/* Álbum */}
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

      </main>
    </div>
  );
}
