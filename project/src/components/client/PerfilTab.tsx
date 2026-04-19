// src/components/client/PerfilTab.tsx
import { useRef, useState } from 'react';
import { Camera, CheckCircle2, Users, User, Info, MessageSquare, Image as ImageIcon, Trash2, Plus, Star } from 'lucide-react';
import { AmigosTab, type FriendProfileType } from '../shared/FriendComponents';
import { ForumTab, type ForumUser } from '../shared/ForumTab';
import { pickPhoto } from '../shared/BoatRegPhotoAlbum';
import { updateClient, type Friendship } from '../../lib/localStore';

interface Props {
  client:            any;
  profilePhoto:      string | null;
  onPhotoChange:     (p: string | null) => void;
  onGoToComunidade:  () => void;
  onOpenApplication: () => void;
  clientId:          string | null;
  friendships:       Friendship[];
  onRefreshFriends:  () => Promise<void>;
  album:             string[];
  onAlbumChange:     (next: string[]) => void;
  onOpenFriendProfile?: (otherId: string, otherType: FriendProfileType) => void;
  onClientChange?:   (patch: Record<string, any>) => void;
}

type SubTab = 'forum' | 'amigos' | 'fotos' | 'informacoes';

export function PerfilTab({
  client, profilePhoto, onPhotoChange, onOpenApplication,
  clientId, friendships, onRefreshFriends,
  album, onAlbumChange, onOpenFriendProfile, onClientChange,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [subTab, setSubTab] = useState<SubTab>('amigos');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // ── Biografia editável ───────────────────────────────────────────────────
  const bio = client?.outras_informacoes as string | undefined;
  const [editingBio, setEditingBio] = useState(false);
  const [bioDraft,   setBioDraft]   = useState<string>(bio ?? '');
  const [savingBio,  setSavingBio]  = useState(false);

  async function saveBio() {
    if (!clientId) return;
    const trimmed = bioDraft.trim();
    setSavingBio(true);
    try {
      await updateClient(clientId, { outras_informacoes: trimmed || undefined });
      onClientChange?.({ outras_informacoes: trimmed || undefined });
      setEditingBio(false);
    } catch (err) { console.error('[bio save]', err); }
    finally { setSavingBio(false); }
  }

  function cancelBio() {
    setBioDraft(bio ?? '');
    setEditingBio(false);
  }

  function handleFile(file: File) {
    if (file.size > 4 * 1024 * 1024) { alert('Máximo 4MB'); return; }
    const reader = new FileReader();
    reader.onload = ev => {
      const img = new Image();
      img.onload = () => {
        const MAX = 400;
        let { width, height } = img;
        if (width > MAX || height > MAX) {
          if (width > height) { height = Math.round(height * MAX / width); width = MAX; }
          else { width = Math.round(width * MAX / height); height = MAX; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width; canvas.height = height;
        canvas.getContext('2d')?.drawImage(img, 0, 0, width, height);
        const data = canvas.toDataURL('image/jpeg', 0.8);
        onPhotoChange(data);
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  async function handleAddAlbumPhoto() {
    if (uploadingPhoto) return;
    setUploadingPhoto(true);
    try {
      const url = await pickPhoto();
      if (url) onAlbumChange([...(album || []), url]);
    } finally {
      setUploadingPhoto(false);
    }
  }

  function handleRemoveAlbumPhoto(index: number) {
    const next = (album || []).filter((_, i) => i !== index);
    onAlbumChange(next);
  }

  if (!client) return null;

  const forumUser: ForumUser | undefined = clientId
    ? { id: clientId, name: client.name || 'Passageiro', type: 'client' }
    : undefined;

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em] mb-1">Conta</p>
        <h2 className="font-['Playfair_Display'] font-bold text-[#1a2b4a] text-xl">Meu Perfil</h2>
        <div className="w-8 h-px bg-[#c9a96e] mt-2" />
      </div>

      {/* Hero perfil */}
      <div className="bg-[#0a1628] p-5 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 0,transparent 60px),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 0,transparent 60px)' }} />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a96e]/60 to-transparent" />
        <div className="relative flex items-center gap-4">
          <div className="relative flex-shrink-0">
            <div
              className="w-20 h-20 overflow-hidden border border-[#c9a96e]/40 cursor-pointer group"
              onClick={() => fileRef.current?.click()}
            >
              {profilePhoto
                ? <img src={profilePhoto} alt="Foto" className="w-full h-full object-cover" />
                : <div className="w-full h-full bg-white/10 flex items-center justify-center font-bold text-2xl text-[#c9a96e]">
                    {(client.name || 'U').substring(0, 2).toUpperCase()}
                  </div>
              }
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-5 h-5 text-white" />
              </div>
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-[#c9a96e] hover:bg-[#b8934a] text-[#0a1628] flex items-center justify-center shadow-lg transition-all"
              title="Alterar foto"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#c9a96e] mb-1">
              {client.profile_number}
            </p>
            <h3 className="font-['Playfair_Display'] font-bold text-lg leading-tight truncate">{client.name}</h3>
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              {client.blocked
                ? <span className="bg-red-400/20 border border-red-400/40 text-red-200 text-[10px] font-semibold px-2.5 py-0.5">🚫 Bloqueada</span>
                : <span className="bg-[#c9a96e]/15 border border-[#c9a96e]/30 text-[#c9a96e] text-[10px] font-semibold px-2.5 py-0.5 flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5" /> Verificado
                  </span>
              }
              <span className="bg-white/10 text-white/70 text-[10px] font-medium px-2.5 py-0.5">
                {client.country_name || 'Portugal'}
              </span>
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
        {profilePhoto && (
          <button onClick={() => { onPhotoChange(null); }}
            className="mt-3 text-[10px] font-medium text-red-300 hover:text-red-200 underline transition-colors relative">
            Remover foto
          </button>
        )}
      </div>

      {/* SubTabs: Fórum | Amigos | Fotos | Informações */}
      <div className="flex border-b border-gray-200 overflow-x-auto">
        {([
          { key: 'forum',       label: 'Fórum',        icon: MessageSquare },
          { key: 'amigos',      label: 'Amigos',       icon: Users },
          { key: 'fotos',       label: 'Fotos',        icon: ImageIcon },
          { key: 'informacoes', label: 'Biografia',    icon: Info  },
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

      {/* Conteúdo: Fórum */}
      {subTab === 'forum' && (
        <ForumTab currentUser={forumUser} />
      )}

      {/* Conteúdo: Amigos */}
      {subTab === 'amigos' && clientId && (
        <AmigosTab
          myId={clientId}
          myType="client"
          friendships={friendships}
          onRefresh={onRefreshFriends}
          onOpenProfile={onOpenFriendProfile}
        />
      )}

      {/* Conteúdo: Fotos */}
      {subTab === 'fotos' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em]">Álbum pessoal</p>
              <p className="text-xs font-medium text-gray-500 mt-0.5">
                {(album || []).length === 0 ? 'Nenhuma foto adicionada' : `${(album || []).length} foto${(album || []).length !== 1 ? 's' : ''}`}
              </p>
            </div>
            <button
              onClick={handleAddAlbumPhoto}
              disabled={uploadingPhoto}
              className="flex items-center gap-1.5 bg-[#0a1628] hover:bg-[#1a2b4a] disabled:opacity-60 text-white px-3 py-2 text-[11px] font-semibold uppercase tracking-wider transition-all"
            >
              {uploadingPhoto
                ? <><div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> Enviando…</>
                : <><Plus className="w-3.5 h-3.5" /> Adicionar</>
              }
            </button>
          </div>

          {(album || []).length === 0 ? (
            <button
              onClick={handleAddAlbumPhoto}
              disabled={uploadingPhoto}
              className="w-full border-2 border-dashed border-gray-200 hover:border-[#c9a96e] py-12 flex flex-col items-center justify-center gap-2 transition-all"
            >
              <ImageIcon className="w-8 h-8 text-gray-300" />
              <p className="font-semibold text-gray-400 text-xs uppercase tracking-wider">Clique para adicionar a primeira foto</p>
              <p className="text-[10px] text-gray-300">JPG, PNG · máx 4MB</p>
            </button>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {(album || []).map((url, i) => (
                <div key={i} className="relative group overflow-hidden" style={{ aspectRatio: '1/1' }}>
                  <img src={url} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={() => handleRemoveAlbumPhoto(i)}
                      className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-all"
                      title="Remover foto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Conteúdo: Biografia */}
      {subTab === 'informacoes' && (
        <div className="bg-white border-2 border-[#0a1628]/5 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em] flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> Biografia
            </p>
            {!editingBio && (
              <button
                onClick={() => { setBioDraft(bio ?? ''); setEditingBio(true); }}
                className="text-[10px] font-semibold text-[#c9a96e] hover:text-[#1a2b4a] uppercase tracking-wider transition-colors"
              >
                {bio ? 'Editar' : '+ Adicionar'}
              </button>
            )}
          </div>

          {editingBio ? (
            <div className="space-y-2">
              <textarea
                value={bioDraft}
                onChange={e => setBioDraft(e.target.value.slice(0, 1000))}
                rows={5}
                placeholder="Escreva a sua biografia — experiência, interesses, o que procura…"
                className="w-full border border-gray-200 px-3 py-2 text-sm text-[#1a2b4a] font-semibold leading-relaxed outline-none focus:border-[#c9a96e] bg-white resize-none"
                autoFocus
              />
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">
                  {bioDraft.length}/1000
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={cancelBio}
                    disabled={savingBio}
                    className="px-3 py-1.5 border border-gray-200 text-[10px] font-bold text-gray-500 hover:border-gray-300 uppercase tracking-wider transition-all disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={saveBio}
                    disabled={savingBio}
                    className="px-3 py-1.5 bg-[#0a1628] text-[#c9a96e] text-[10px] font-bold hover:bg-[#1a2b4a] uppercase tracking-wider transition-all disabled:opacity-50"
                  >
                    {savingBio ? 'A guardar…' : 'Guardar'}
                  </button>
                </div>
              </div>
            </div>
          ) : bio ? (
            <p className="text-sm text-gray-600 font-semibold leading-relaxed whitespace-pre-wrap">{bio}</p>
          ) : (
            <p className="text-sm text-gray-400 font-semibold italic">
              Ainda não adicionou uma biografia. Clique em "+ Adicionar" para escrever sobre si.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
