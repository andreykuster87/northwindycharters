// src/components/client/PerfilTab.tsx
import { useRef, useState } from 'react';
import { Camera, CheckCircle2, Anchor, User, FileText } from 'lucide-react';
import { DocumentosTab } from './DocumentosTab';
import { DocumentoViewer } from './DocumentoViewer';
import type { DocumentoDisplayItem } from './DocumentoViewer';

interface Props {
  client:           any;
  profilePhoto:     string | null;
  onPhotoChange:    (p: string | null) => void;
  onGoToComunidade: () => void;
  onOpenApplication: () => void;
}

type SubTab = 'perfil' | 'documentos';

export function PerfilTab({ client, profilePhoto, onPhotoChange, onGoToComunidade, onOpenApplication }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [subTab, setSubTab] = useState<SubTab>('perfil');
  const [docViewing, setDocViewing] = useState<DocumentoDisplayItem | null>(null);

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
          {/* Avatar clicável */}
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
        </div>
        {profilePhoto && (
          <button onClick={() => { onPhotoChange(null); }}
            className="mt-3 text-[10px] font-medium text-red-300 hover:text-red-200 underline transition-colors relative">
            Remover foto
          </button>
        )}
      </div>

      {/* SubTabs: Perfil | Documentos */}
      <div className="flex border-b border-gray-200">
        {([
          { key: 'perfil',      label: 'Informações',  icon: User },
          { key: 'documentos',  label: 'Documentos',   icon: FileText },
        ] as { key: SubTab; label: string; icon: any }[]).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setSubTab(key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold transition-all border-b-2 -mb-px ${
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

      {/* Conteúdo da subaba */}
      {subTab === 'perfil' && (
        <div className="space-y-4">
          {/* Aviso comunidade */}
          <div className="bg-[#0a1628] p-4 flex items-start gap-3 relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.04]"
              style={{ backgroundImage: 'repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 0,transparent 60px),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 0,transparent 60px)' }} />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a96e]/60 to-transparent" />
            <div className="w-9 h-9 bg-[#c9a96e]/15 border border-[#c9a96e]/30 flex items-center justify-center flex-shrink-0 mt-0.5 relative">
              <Anchor className="w-4 h-4 text-[#c9a96e]" />
            </div>
            <div className="flex-1 min-w-0 relative">
              <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em]">Faça parte da comunidade</p>
              <p className="text-xs font-medium text-white/60 mt-1 leading-relaxed">
                Para fazer parte da comunidade, insira os documentos necessários e fique visível para empresas náuticas.
              </p>
              <button
                onClick={onOpenApplication}
                className="mt-3 border border-[#c9a96e] text-[#c9a96e] hover:bg-[#c9a96e] hover:text-[#0a1628] px-4 py-2 font-semibold text-[10px] uppercase tracking-wider transition-all flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3" /> Inserir Documentos
              </button>
            </div>
          </div>
        </div>
      )}

      {subTab === 'documentos' && (
        <DocumentosTab
          client={client}
          onDocumentoClick={setDocViewing}
        />
      )}

      {/* Modal de visualização */}
      {docViewing && (
        <DocumentoViewer
          documento={docViewing}
          onClose={() => setDocViewing(null)}
        />
      )}
    </div>
  );
}
