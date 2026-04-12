// src/components/shared/BoatRegPhotoAlbum.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Componentes de gestão de fotos para o registo de embarcação.
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useRef } from 'react';
import { Star, Trash2, Upload, ImagePlus, Camera, CheckCircle2 } from 'lucide-react';

// ── Compressão de imagem ──────────────────────────────────────────────────────
export function compressImage(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onerror = rej;
    reader.onload = e => {
      const img = new Image();
      img.onerror = rej;
      img.onload = () => {
        const MAX = 800;
        let { width, height } = img;
        if (width > MAX || height > MAX) {
          if (width > height) { height = Math.round(height * MAX / width); width = MAX; }
          else                { width  = Math.round(width  * MAX / height); height = MAX; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) { rej(new Error('Canvas indisponível')); return; }
        ctx.drawImage(img, 0, 0, width, height);
        res(canvas.toDataURL('image/jpeg', 0.60));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

// ── pickPhoto — abre file picker e retorna Promise<string | null> ─────────────
export function pickPhoto(): Promise<string | null> {
  return new Promise(resolve => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) { resolve(null); return; }
      try {
        const url = await compressImage(file);
        resolve(url);
      } catch {
        resolve(null);
      }
    };
    // Necessário para alguns browsers (Bolt/WebContainer)
    input.style.display = 'none';
    document.body.appendChild(input);
    input.click();
    setTimeout(() => {
      try { document.body.removeChild(input); } catch {}
    }, 30000);
  });
}

// ── PhotoSlot ─────────────────────────────────────────────────────────────────
interface PhotoSlotProps {
  label:     string;
  sublabel?: string;
  hint?:     string;
  required?: boolean;
  value:     string;
  onPick:    () => void;
  onRemove?: () => void;
}

export function PhotoSlot({ label, sublabel, hint, required, value, onPick, onRemove }: PhotoSlotProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1.5">
        <p className="text-xs font-black text-blue-900 uppercase">{label}</p>
        {sublabel && <span className="text-[9px] text-gray-400 font-bold">{sublabel}</span>}
        {required
          ? <span className="text-[9px] font-black text-red-500 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-full ml-auto">Obrigatória</span>
          : <span className="text-[9px] font-black text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full ml-auto">Opcional</span>}
      </div>
      {hint && <p className="text-[10px] text-gray-400 font-bold mb-2">{hint}</p>}
      <div
        onClick={onPick}
        className={`relative rounded-[20px] overflow-hidden cursor-pointer transition-all border-4
          ${value
            ? 'border-blue-900 shadow-lg'
            : required
            ? 'border-dashed border-red-200 hover:border-red-400 bg-red-50'
            : 'border-dashed border-gray-200 hover:border-blue-400 bg-gray-50'
          }`}
        style={{ height: 160 }}
      >
        {value ? (
          <>
            <img src={value} alt={label} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-blue-900/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <span className="bg-white text-blue-900 font-black text-xs uppercase px-3 py-2 rounded-full shadow-lg">Trocar</span>
              {onRemove && (
                <button type="button" onClick={e => { e.stopPropagation(); onRemove(); }}
                  className="bg-red-500 text-white font-black text-xs uppercase px-3 py-2 rounded-full shadow-lg">
                  Remover
                </button>
              )}
            </div>
            <div className="absolute top-2 right-2 bg-green-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full">✓ OK</div>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <ImagePlus className={`w-8 h-8 ${required ? 'text-red-300' : 'text-gray-300'}`} />
            <p className={`font-black text-xs uppercase ${required ? 'text-red-400' : 'text-gray-400'}`}>
              Clique para adicionar
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── PhotoAlbumInline ───────────────────────────────────────────────────────────
interface PhotoAlbumInlineProps {
  photos:   string[];
  onAdd:    () => void;
  onRemove: (index: number) => void;
}

export function PhotoAlbumInline({ photos, onAdd, onRemove }: PhotoAlbumInlineProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError]         = useState<string | null>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) continue;
        if (file.size > 8 * 1024 * 1024) { setError('Ficheiro muito grande (máx 8MB).'); continue; }
        const url = await compressImage(file);
        // Simulate onAdd with the URL — call the parent's onAdd after setting the photo
        // We use a custom event approach since onAdd doesn't take a param
        // Store temporarily and trigger
        (window as any).__pendingPhoto = url;
        onAdd();
      }
    } catch (err: any) {
      setError('Erro ao processar imagem: ' + (err?.message || 'tente novamente'));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div
        onClick={() => !uploading && fileRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
        className={`border-2 border-dashed rounded-[20px] p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all
          ${uploading ? 'border-blue-300 bg-blue-50/50 cursor-wait' : 'border-gray-200 hover:border-blue-900 hover:bg-blue-50/30'}`}
      >
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
          onChange={e => handleFiles(e.target.files)} />
        {uploading ? (
          <>
            <div className="w-6 h-6 border-4 border-blue-900 border-t-transparent rounded-full animate-spin" />
            <p className="font-black text-blue-900 text-xs uppercase">Processando...</p>
          </>
        ) : (
          <>
            <ImagePlus className="w-6 h-6 text-gray-300" />
            <p className="font-black text-gray-400 text-xs uppercase">Adicionar fotos extras</p>
            <p className="text-[10px] text-gray-300 font-bold">JPG, PNG · máx 8MB</p>
          </>
        )}
      </div>

      {error && <p className="text-xs font-bold text-red-600 bg-red-50 rounded-xl px-3 py-2">⚠️ {error}</p>}

      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((url, i) => (
            <div key={i} className="relative group rounded-xl overflow-hidden" style={{ aspectRatio: '4/3' }}>
              <img src={url} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button type="button" onClick={() => onRemove(i)}
                  className="bg-red-500 text-white p-2 rounded-full">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── PhotoChecklist — PROPS CORRETAS: cover / exterior / interior / extra ───────
interface PhotoChecklistProps {
  cover:    string;
  exterior: string;
  interior: string;
  extra:    string[];
}

export function PhotoChecklist({ cover, exterior, interior, extra }: PhotoChecklistProps) {
  const items = [
    { label: 'Foto de capa',   done: !!cover    },
    { label: 'Vista exterior', done: !!exterior },
    { label: 'Interior',       done: !!interior },
    { label: `Fotos extras (${(extra || []).length})`, done: (extra || []).length > 0 },
  ];
  return (
    <div className="bg-blue-50 border-2 border-blue-100 rounded-[20px] px-5 py-4">
      <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3">Checklist de fotos</p>
      <div className="space-y-2">
        {items.map(({ label, done }) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${done ? 'bg-green-500' : 'bg-gray-200'}`}>
              {done && <CheckCircle2 className="w-3 h-3 text-white" />}
            </div>
            <span className={`text-xs font-bold ${done ? 'text-green-700' : 'text-gray-400'}`}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}