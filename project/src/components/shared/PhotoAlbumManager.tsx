// src/components/PhotoAlbumManager.tsx
import { useState, useRef } from 'react';
import { Camera, Star, Trash2, Upload, ImagePlus, CheckCircle2 } from 'lucide-react';

interface PhotoAlbumManagerProps {
  entityId:      string;           // boat.id ou trip.id
  entityType:    'boats' | 'trips';
  initialPhotos?: string[];
  initialCover?:  string;
  compact?:       boolean;         // estilo compacto para uso dentro de cards
  onUpdate: (photos: string[], cover: string) => void;
}

export function PhotoAlbumManager({
  entityId, entityType,
  initialPhotos = [], initialCover = '',
  compact = false,
  onUpdate,
}: PhotoAlbumManagerProps) {
  const [photos,   setPhotos]   = useState<string[]>(initialPhotos);
  const [cover,    setCover]    = useState<string>(initialCover || initialPhotos[0] || '');
  const [uploading, setUploading] = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [saved,    setSaved]    = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // ── Comprimir imagem via canvas ───────────────────────────────────────────
  const compressImage = (file: File): Promise<string> =>
    new Promise((res, rej) => {
      const reader = new FileReader();
      reader.onerror = rej;
      reader.onload  = e => {
        const img = new Image();
        img.onerror = rej;
        img.onload  = () => {
          const MAX = 1200;
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
          res(canvas.toDataURL('image/jpeg', 0.75));
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });

  // ── Upload / processamento ────────────────────────────────────────────────
  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      const newUrls: string[] = [];
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) continue;
        if (file.size > 8 * 1024 * 1024) { setError('Ficheiro muito grande (máx 8MB).'); continue; }
        const url = await compressImage(file);
        newUrls.push(url);
      }
      const updated  = [...photos, ...newUrls];
      const newCover = cover || updated[0] || '';
      setPhotos(updated);
      if (!cover && updated.length > 0) setCover(updated[0]);
      onUpdate(updated, newCover);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      setError('Erro ao processar imagem: ' + (err?.message || 'tente novamente'));
    } finally {
      setUploading(false);
    }
  };

  const handleSetCover = (url: string) => {
    setCover(url);
    onUpdate(photos, url);
  };

  const handleDelete = (url: string) => {
    const updated  = photos.filter(p => p !== url);
    const newCover = url === cover ? (updated[0] || '') : cover;
    setPhotos(updated);
    setCover(newCover);
    onUpdate(updated, newCover);
  };

  const pad = compact ? 'p-5' : 'p-8';

  return (
    <div className="space-y-4">
      {/* Upload area */}
      <div
        onClick={() => !uploading && fileRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
        className={`border-2 border-dashed rounded-[25px] ${pad} flex flex-col items-center justify-center gap-3 cursor-pointer transition-all
          ${uploading
            ? 'border-blue-300 bg-blue-50/50 cursor-wait'
            : 'border-gray-200 hover:border-blue-900 hover:bg-blue-50/30'}`}
      >
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
          onChange={e => handleFiles(e.target.files)}/>
        {uploading ? (
          <>
            <div className="w-8 h-8 border-4 border-blue-900 border-t-transparent rounded-full animate-spin"/>
            <p className="font-black text-blue-900 text-sm uppercase">Processando fotos...</p>
          </>
        ) : (
          <>
            <ImagePlus className="w-8 h-8 text-gray-300"/>
            <p className="font-black text-gray-400 text-sm uppercase">Arraste fotos ou clique para selecionar</p>
            <p className="text-[10px] text-gray-300 font-bold">JPG, PNG · máx 8MB por foto</p>
          </>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-[15px] px-4 py-2.5 text-red-700 font-bold text-xs flex items-center gap-2">
          ⚠️ {error}
        </div>
      )}

      {saved && (
        <div className="bg-green-50 border border-green-200 rounded-[15px] px-4 py-2.5 text-green-700 font-bold text-xs flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4"/> Fotos guardadas!
        </div>
      )}

      {/* Gallery grid */}
      {photos.length > 0 && (
        <div className="space-y-3">
          <p className="text-[10px] font-black text-gray-400 uppercase flex items-center gap-2">
            <Camera className="w-3.5 h-3.5"/>
            {photos.length} foto{photos.length !== 1 ? 's' : ''} · clique em ⭐ para definir como capa
          </p>
          <div className="grid grid-cols-3 gap-3">
            {photos.map((url, i) => {
              const isCover = url === cover;
              return (
                <div key={i}
                  className={`relative group rounded-[18px] overflow-hidden transition-all ${isCover ? 'ring-4 ring-blue-900 ring-offset-2' : ''}`}
                  style={{ aspectRatio: '4/3' }}>
                  <img src={url} alt="" className="w-full h-full object-cover"/>

                  {isCover && (
                    <div className="absolute top-2 left-2 bg-blue-900 text-white text-[9px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 shadow">
                      <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400"/> CAPA
                    </div>
                  )}

                  <div className="absolute inset-0 bg-blue-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    {!isCover && (
                      <button type="button" onClick={() => handleSetCover(url)} title="Definir como capa"
                        className="bg-white text-blue-900 p-2.5 rounded-full hover:bg-yellow-400 transition-all shadow-lg">
                        <Star className="w-4 h-4"/>
                      </button>
                    )}
                    <button type="button" onClick={() => handleDelete(url)} title="Remover foto"
                      className="bg-white text-red-500 p-2.5 rounded-full hover:bg-red-500 hover:text-white transition-all shadow-lg">
                      <Trash2 className="w-4 h-4"/>
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Add more */}
            <div onClick={() => fileRef.current?.click()}
              className="rounded-[18px] border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all group"
              style={{ aspectRatio: '4/3' }}>
              <Upload className="w-5 h-5 text-gray-300 group-hover:text-blue-900 transition-colors"/>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
