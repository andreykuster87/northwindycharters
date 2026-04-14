// src/components/company/DestaquesTab.tsx
import { useState, useEffect, useRef } from 'react';
import { Camera, Image, Trash2, MapPin, Phone, Mail, Globe, Building2, Ship, CalendarDays, Users, Star, Search } from 'lucide-react';
import { getCompanies, updateCompany, type Company } from '../../lib/localStore';
import { uploadDoc } from '../../lib/storage';
import { CompanySearchCard } from '../shared/CompanySearchCard';

interface Props {
  company:       Company;
  onViewCompany: (c: Company) => void;
}

export function DestaquesTab({ company, onViewCompany }: Props) {
  const [bio, setBio]             = useState(company.descricao || '');
  const [editing, setEditing]     = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>((company as any).profile_photo || null);
  const [album, setAlbum]         = useState<string[]>((company as any).album || []);
  const [uploading, setUploading] = useState(false);
  const profileInputRef           = useRef<HTMLInputElement>(null);

  const [searchExpanded, setSearchExpanded] = useState(false);

  useEffect(() => {
    const fresh = getCompanies().find(c => c.id === company.id);
    if (fresh) {
      setAlbum((fresh as any).album || []);
      setProfilePhoto((fresh as any).profile_photo || null);
      setBio((fresh as any).descricao || '');
    }
  }, [company.id]);

  const stats = [
    { icon: Ship,         label: 'Embarcações', value: '4'   },
    { icon: CalendarDays, label: 'Eventos/mês', value: '12'  },
    { icon: Users,        label: 'Clientes',    value: '240' },
    { icon: Star,         label: 'Avaliação',   value: '4.8' },
  ];

  async function handleProfilePhoto(file: File) {
    setUploading(true);
    try {
      const url = await uploadDoc(file, 'companies', `profile-${company.id}`);
      if (url) {
        setProfilePhoto(url);
        await updateCompany(company.id, { profile_photo: url } as any);
      }
    } finally { setUploading(false); }
  }

  async function handleAlbumUpload(files: FileList) {
    setUploading(true);
    try {
      const remaining = 8 - album.length;
      const toUpload = Array.from(files).slice(0, remaining);
      const urls: string[] = [];
      for (const file of toUpload) {
        const url = await uploadDoc(file, 'companies', `album-${company.id}`);
        if (url) urls.push(url);
      }
      const updated = [...album, ...urls];
      setAlbum(updated);
      await updateCompany(company.id, { album: updated } as any);
    } finally { setUploading(false); }
  }

  async function removeAlbumPhoto(index: number) {
    const updated = album.filter((_, i) => i !== index);
    setAlbum(updated);
    await updateCompany(company.id, { album: updated } as any);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-['Playfair_Display'] font-bold text-[#1a2b4a] uppercase italic">Perfil Público</h2>
          <p className="text-xs text-gray-400 font-semibold">O seu perfil e diretório público de empresas</p>
        </div>
        <button
          onClick={() => setSearchExpanded(v => !v)}
          className={`flex items-center gap-1.5 px-3 py-2 font-semibold text-xs uppercase transition-all flex-shrink-0 ${
            searchExpanded
              ? 'bg-[#0a1628] text-white'
              : 'bg-gray-50 border-2 border-gray-100 text-[#1a2b4a] hover:border-[#c9a96e]/30'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          Procurar perfil
        </button>
      </div>

      <CompanySearchCard
        expanded={searchExpanded}
        onToggle={() => setSearchExpanded(v => !v)}
        onCompanyClick={c => onViewCompany(c)}
        onSailorClick={() => {}}
      />

      <div className="bg-gradient-to-br from-[#0a1628] to-[#1a2b4a] p-5 text-white">
        <div className="flex items-center gap-4">
          <div className="relative flex-shrink-0">
            <button
              onClick={() => profileInputRef.current?.click()}
              className="w-16 h-16 overflow-hidden border-2 border-white/30 hover:border-white/60 transition-all group"
            >
              {profilePhoto ? (
                <img src={profilePhoto} alt="Perfil" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-white/20 flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="w-5 h-5 text-white" />
              </div>
            </button>
            <input ref={profileInputRef} type="file" accept="image/*" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleProfilePhoto(f); e.target.value = ''; }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#c9a96e]">{company.profile_number}</p>
            <h3 className="text-lg font-['Playfair_Display'] font-bold uppercase italic leading-tight truncate">{company.nome_fantasia}</h3>
            <p className="text-[#c9a96e] text-xs font-semibold truncate">{company.razao_social}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {company.setor.split(',').slice(0,2).map(s => (
                <span key={s} className="bg-white/20 text-white text-[10px] font-semibold px-2.5 py-0.5">{s.trim()}</span>
              ))}
              <span className="bg-white/20 text-white text-[10px] font-semibold px-2.5 py-0.5 flex items-center gap-1">
                <MapPin className="w-2.5 h-2.5" /> {company.cidade}
              </span>
            </div>
          </div>
        </div>
      </div>

      {uploading && (
        <div className="bg-[#0a1628]/5 border-2 border-[#c9a96e]/20 px-4 py-3 flex items-center gap-2">
          <span className="animate-spin w-4 h-4 border-2 border-[#c9a96e]/30 border-t-[#0a1628]" />
          <p className="text-xs font-semibold text-[#1a2b4a]">Enviando...</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {stats.map(s => (
          <div key={s.label} className="bg-white border border-gray-100 p-4 text-center">
            <s.icon className="w-5 h-5 text-[#c9a96e] mx-auto mb-1.5" />
            <p className="text-2xl font-bold text-[#1a2b4a]">{s.value}</p>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-100 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em] flex items-center gap-1.5">
            <Image className="w-3.5 h-3.5" /> Álbum de Fotos
          </p>
          <p className="text-[10px] font-semibold text-gray-400">{album.length}/8</p>
        </div>

        {album.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {album.map((url, i) => (
              <div key={i} className="relative group overflow-hidden aspect-square">
                <img src={url} alt={`Foto ${i+1}`} className="w-full h-full object-cover" />
                <button
                  onClick={() => removeAlbumPhoto(i)}
                  className="absolute top-1 right-1 bg-red-500 text-white p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {album.length < 8 && (
          <label className="flex items-center justify-center gap-2 border-2 border-dashed border-[#c9a96e]/30 hover:border-[#c9a96e] bg-[#0a1628]/5 hover:bg-gray-50 text-[#1a2b4a] py-3 font-semibold text-xs uppercase cursor-pointer transition-all">
            <Camera className="w-4 h-4" />
            Adicionar Fotos
            <input type="file" accept="image/*" multiple className="sr-only"
              onChange={e => { if (e.target.files?.length) handleAlbumUpload(e.target.files); e.target.value = ''; }} />
          </label>
        )}
      </div>

      <div className="bg-white border border-gray-100 p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em]">Descrição</p>
          <button onClick={() => { if (editing) updateCompany(company.id, { descricao: bio }); setEditing(v=>!v); }}
            className="text-xs font-semibold text-[#1a2b4a]">
            {editing ? '✅ Guardar' : '✏️ Editar'}
          </button>
        </div>
        {editing
          ? <textarea value={bio} onChange={e => setBio(e.target.value)} rows={4}
              className="w-full bg-gray-50 border border-gray-200 py-3 px-4 text-sm font-semibold text-[#1a2b4a] focus:border-[#c9a96e] outline-none resize-none"
              placeholder="Descreva a sua empresa…" />
          : <p className="text-sm text-gray-600 font-semibold leading-relaxed">
              {bio || <span className="text-gray-300 italic">Sem descrição. Clique em Editar.</span>}
            </p>
        }
      </div>

      <div className="bg-white border border-gray-100 p-4 space-y-3">
        <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em]">Contacto</p>
        {[
          { icon: Phone, value: company.telefone },
          { icon: Mail,  value: company.email },
          { icon: Globe, value: company.website || '—' },
          { icon: MapPin,value: `${company.cidade}, ${company.pais_nome}` },
        ].map((r, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#0a1628]/5 flex items-center justify-center flex-shrink-0">
              <r.icon className="w-4 h-4 text-[#c9a96e]" />
            </div>
            <p className="text-sm font-semibold text-gray-700 truncate">{r.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
