// src/components/company/CompanyPerfilTab.tsx
import { useRef, useState } from 'react';
import { Camera, CheckCircle2, Users, Info, MessageSquare, Image as ImageIcon, Trash2, Plus, MapPin, Building2, Search, Star } from 'lucide-react';
import { AmigosTab, type FriendProfileType } from '../shared/FriendComponents';
import { ForumTab, type ForumUser } from '../shared/ForumTab';
import { CompanySearchCard } from '../shared/CompanySearchCard';
import { updateCompany, type Company } from '../../lib/localStore';
import { uploadDoc } from '../../lib/storage';
import type { Friendship } from '../../lib/localStore';

interface Props {
  company:             Company;
  companyId:           string;
  friendships:         Friendship[];
  onRefreshFriends:    () => Promise<void>;
  onCompanyChange:     (patch: Partial<Company>) => void;
  onOpenFriendProfile?: (otherId: string, otherType: FriendProfileType) => void;
  onViewCompany:       (c: Company) => void;
}

type SubTab = 'forum' | 'amigos' | 'fotos' | 'informacoes';

export function CompanyPerfilTab({
  company, companyId, friendships, onRefreshFriends,
  onCompanyChange, onOpenFriendProfile, onViewCompany,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [subTab, setSubTab] = useState<SubTab>('amigos');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [bio, setBio] = useState(company.descricao || '');
  const [editingBio, setEditingBio] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);

  const album = company.album || [];
  const profilePhoto = company.profile_photo || null;

  async function handleProfilePhoto(file: File) {
    if (file.size > 4 * 1024 * 1024) { alert('Máximo 4MB'); return; }
    setUploadingPhoto(true);
    try {
      const url = await uploadDoc(file, 'companies', `profile-${companyId}`);
      if (url) {
        await updateCompany(companyId, { profile_photo: url } as any);
        onCompanyChange({ profile_photo: url });
      }
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function handleAddAlbumPhotos(files: FileList) {
    if (uploadingPhoto) return;
    setUploadingPhoto(true);
    try {
      const remaining = 8 - album.length;
      const toUpload = Array.from(files).slice(0, remaining);
      const urls: string[] = [];
      for (const file of toUpload) {
        const url = await uploadDoc(file, 'companies', `album-${companyId}`);
        if (url) urls.push(url);
      }
      const next = [...album, ...urls];
      await updateCompany(companyId, { album: next } as any);
      onCompanyChange({ album: next });
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function handleRemoveAlbumPhoto(index: number) {
    const next = album.filter((_, i) => i !== index);
    await updateCompany(companyId, { album: next } as any);
    onCompanyChange({ album: next });
  }

  async function handleSaveBio() {
    await updateCompany(companyId, { descricao: bio });
    onCompanyChange({ descricao: bio });
    setEditingBio(false);
  }

  const forumUser: ForumUser | undefined = companyId
    ? { id: companyId, name: company.nome_fantasia || 'Empresa', type: 'company' }
    : undefined;

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em] mb-1">Conta</p>
        <h2 className="font-['Playfair_Display'] font-bold text-[#1a2b4a] text-xl">Perfil Público</h2>
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
                ? <img src={profilePhoto} alt="Logo" className="w-full h-full object-cover" />
                : <div className="w-full h-full bg-white/10 flex items-center justify-center">
                    <Building2 className="w-10 h-10 text-[#c9a96e]" />
                  </div>
              }
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-5 h-5 text-white" />
              </div>
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-[#c9a96e] hover:bg-[#b8934a] text-[#0a1628] flex items-center justify-center shadow-lg transition-all"
              title="Alterar logo"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleProfilePhoto(f); e.target.value = ''; }} />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#c9a96e] mb-1">
              {company.profile_number}
            </p>
            <h3 className="font-['Playfair_Display'] font-bold text-lg leading-tight truncate">{company.nome_fantasia}</h3>
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              {company.blocked
                ? <span className="bg-red-400/20 border border-red-400/40 text-red-200 text-[10px] font-semibold px-2.5 py-0.5">🚫 Bloqueada</span>
                : <span className="bg-[#c9a96e]/15 border border-[#c9a96e]/30 text-[#c9a96e] text-[10px] font-semibold px-2.5 py-0.5 flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5" /> Verificada
                  </span>
              }
              {company.cidade && (
                <span className="bg-white/10 text-white/70 text-[10px] font-medium px-2.5 py-0.5 flex items-center gap-1">
                  <MapPin className="w-2.5 h-2.5" /> {company.cidade}
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
          { key: 'forum',       label: 'Fórum',        icon: MessageSquare },
          { key: 'amigos',      label: 'Amigos',       icon: Users },
          { key: 'fotos',       label: 'Fotos',        icon: ImageIcon },
          { key: 'informacoes', label: 'Biografia',    icon: Info },
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
      {subTab === 'forum' && <ForumTab currentUser={forumUser} />}

      {/* Amigos */}
      {subTab === 'amigos' && companyId && (
        <AmigosTab
          myId={companyId}
          myType="company"
          friendships={friendships}
          onRefresh={onRefreshFriends}
          onOpenProfile={onOpenFriendProfile}
        />
      )}

      {/* Fotos */}
      {subTab === 'fotos' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em]">Álbum de Fotos</p>
              <p className="text-xs font-medium text-gray-500 mt-0.5">{album.length}/8</p>
            </div>
            {album.length < 8 && (
              <label className="flex items-center gap-1.5 bg-[#0a1628] hover:bg-[#1a2b4a] disabled:opacity-60 text-white px-3 py-2 text-[11px] font-semibold uppercase tracking-wider transition-all cursor-pointer">
                {uploadingPhoto
                  ? <><div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> Enviando…</>
                  : <><Plus className="w-3.5 h-3.5" /> Adicionar</>
                }
                <input type="file" accept="image/*" multiple className="sr-only"
                  onChange={e => { if (e.target.files?.length) handleAddAlbumPhotos(e.target.files); e.target.value = ''; }} />
              </label>
            )}
          </div>

          {album.length === 0 ? (
            <label className="w-full border-2 border-dashed border-gray-200 hover:border-[#c9a96e] py-12 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer">
              <ImageIcon className="w-8 h-8 text-gray-300" />
              <p className="font-semibold text-gray-400 text-xs uppercase tracking-wider">Clique para adicionar a primeira foto</p>
              <p className="text-[10px] text-gray-300">JPG, PNG · máx 4MB</p>
              <input type="file" accept="image/*" multiple className="sr-only"
                onChange={e => { if (e.target.files?.length) handleAddAlbumPhotos(e.target.files); e.target.value = ''; }} />
            </label>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {album.map((url, i) => (
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

      {/* Informações: descrição + diretório de empresas */}
      {subTab === 'informacoes' && (
        <div className="space-y-4">
          {/* Descrição editável */}
          <div className="bg-white border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em]">Descrição</p>
              <button onClick={() => editingBio ? handleSaveBio() : setEditingBio(true)}
                className="text-xs font-semibold text-[#1a2b4a]">
                {editingBio ? '✅ Guardar' : '✏️ Editar'}
              </button>
            </div>
            {editingBio ? (
              <textarea value={bio} onChange={e => setBio(e.target.value)} rows={4}
                className="w-full bg-gray-50 border border-gray-200 py-3 px-4 text-sm font-semibold text-[#1a2b4a] focus:border-[#c9a96e] outline-none resize-none"
                placeholder="Descreva a sua empresa…" />
            ) : (
              <p className="text-sm text-gray-600 font-semibold leading-relaxed">
                {bio || <span className="text-gray-300 italic">Sem descrição. Clique em Editar.</span>}
              </p>
            )}
          </div>

          {/* Procurar perfil público */}
          <div>
            <button
              onClick={() => setSearchExpanded(v => !v)}
              className={`w-full flex items-center justify-center gap-1.5 px-3 py-2.5 font-semibold text-xs uppercase transition-all ${
                searchExpanded ? 'bg-[#0a1628] text-white' : 'bg-gray-50 border-2 border-gray-100 text-[#1a2b4a] hover:border-[#c9a96e]/30'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              Procurar perfil
            </button>
            <div className="mt-2">
              <CompanySearchCard
                expanded={searchExpanded}
                onToggle={() => setSearchExpanded(v => !v)}
                onCompanyClick={onViewCompany}
                onSailorClick={() => {}}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
