// src/components/client/PerfilTab.tsx
import { useRef } from 'react';
import { Camera, CheckCircle2, Mail, Phone, Anchor } from 'lucide-react';

interface Props {
  client:           any;
  profilePhoto:     string | null;
  onPhotoChange:    (p: string | null) => void;
  onGoToComunidade: () => void;
  onOpenApplication: () => void;
}

export function PerfilTab({ client, profilePhoto, onPhotoChange, onGoToComunidade, onOpenApplication }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

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

  if (!client) return null;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-black text-blue-900 uppercase italic">Meu Perfil</h2>
        <p className="text-xs text-gray-400 font-bold mt-0.5">Informações pessoais e documento</p>
      </div>

      {/* Hero perfil */}
      <div className="bg-gradient-to-br from-blue-900 to-blue-700 rounded-[24px] p-5 text-white">
        <div className="flex items-center gap-4">
          {/* Avatar clicável */}
          <div className="relative flex-shrink-0">
            <div
              className="w-20 h-20 rounded-[20px] overflow-hidden border-3 border-white/30 cursor-pointer group"
              onClick={() => fileRef.current?.click()}
            >
              {profilePhoto
                ? <img src={profilePhoto} alt="Foto" className="w-full h-full object-cover" />
                : <div className="w-full h-full bg-white/20 flex items-center justify-center font-black text-2xl">
                    {(client.name || 'U').substring(0, 2).toUpperCase()}
                  </div>
              }
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-[20px]">
                <Camera className="w-5 h-5 text-white" />
              </div>
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-amber-400 hover:bg-amber-300 text-blue-900 rounded-full flex items-center justify-center shadow-lg transition-all"
              title="Alterar foto"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-300">
              {client.profile_number}
            </p>
            <h3 className="text-lg font-black uppercase italic leading-tight truncate">{client.name}</h3>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              {client.blocked
                ? <span className="bg-red-400/20 border border-red-400/40 text-red-200 text-[10px] font-black px-2.5 py-0.5 rounded-full">🚫 Bloqueada</span>
                : <span className="bg-green-400/20 border border-green-400/40 text-green-200 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5" /> Verificado
                  </span>
              }
              <span className="bg-white/20 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                {client.country_name || 'Portugal'}
              </span>
            </div>
          </div>
        </div>
        {profilePhoto && (
          <button onClick={() => { onPhotoChange(null); }}
            className="mt-3 text-[10px] font-black text-red-300 hover:text-red-200 underline transition-colors">
            Remover foto
          </button>
        )}
      </div>

      {/* Contacto */}
      <div className="bg-white border-2 border-gray-100 rounded-[20px] p-4 space-y-3">
        <p className="text-xs font-black text-blue-900 uppercase tracking-wider">Contacto</p>
        {[
          { icon: Mail,  value: client.email },
          { icon: Phone, value: client.phone,
            href: client.phone ? `https://wa.me/${client.phone.replace(/\D/g,'')}` : undefined },
        ].filter(r => r.value).map((r, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
              <r.icon className="w-4 h-4 text-blue-500" />
            </div>
            {r.href
              ? <a href={r.href} target="_blank" rel="noreferrer"
                  className="text-sm font-bold text-green-600 hover:underline truncate">{r.value}</a>
              : <p className="text-sm font-bold text-gray-700 truncate">{r.value}</p>
            }
          </div>
        ))}
      </div>

      {/* Documento */}
      <div className="bg-white border-2 border-gray-100 rounded-[20px] p-4">
        <p className="text-xs font-black text-blue-900 uppercase tracking-wider mb-3">Documento de Identidade</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            ['Tipo',      client.doc_type || '—'],
            ['Número',    client.passport_number || '—'],
            ['Validade',  client.passport_expires ? new Date(client.passport_expires).toLocaleDateString('pt-PT') : '—'],
          ].map(([l, v]) => (
            <div key={l} className="bg-gray-50 rounded-[12px] px-3 py-2.5">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">{l}</p>
              <p className="text-sm font-black text-blue-900 mt-0.5">{v}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Data de nascimento */}
      {client.birth_date && (
        <div className="bg-white border-2 border-gray-100 rounded-[20px] p-4">
          <p className="text-xs font-black text-blue-900 uppercase tracking-wider mb-2">Data de Nascimento</p>
          <p className="text-sm font-black text-blue-900">
            {new Date(client.birth_date).toLocaleDateString('pt-PT', { day:'2-digit', month:'long', year:'numeric' })}
          </p>
        </div>
      )}

      {/* Aviso comunidade */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-[20px] p-4 flex items-start gap-3">
        <div className="w-9 h-9 bg-blue-900 rounded-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
          <Anchor className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-black text-blue-900 uppercase tracking-wide">Faça parte da comunidade</p>
          <p className="text-xs font-bold text-blue-700 mt-1 leading-relaxed">
            Para fazer parte da comunidade, insira os documentos necessários e fique visível para empresas náuticas.
          </p>
          <button
            onClick={onOpenApplication}
            className="mt-3 bg-blue-900 hover:bg-blue-800 text-white px-4 py-2 rounded-[10px] font-black text-[10px] uppercase tracking-wider transition-all flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3" /> Inserir Documentos
          </button>
        </div>
      </div>
    </div>
  );
}
