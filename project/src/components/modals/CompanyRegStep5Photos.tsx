// src/components/modals/CompanyRegStep5Photos.tsx — Fotos da Empresa
import { useRef, useState } from 'react';
import { Camera, ImagePlus, Trash2 } from 'lucide-react';
import { type Form } from './CompanyRegShared';
import { pickPhoto, compressImage } from '../shared/BoatRegPhotoAlbum';

interface Props {
  form: Form;
  setForm: React.Dispatch<React.SetStateAction<Form>>;
}

export function CompanyRegStep5Photos({ form, setForm }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePickProfile() {
    const url = await pickPhoto();
    if (url) setForm(p => ({ ...p, profile_photo: url }));
  }

  async function handleAlbumFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    if (form.album.length >= 9) { setError('Máximo de 9 fotos no álbum.'); return; }
    setUploading(true);
    setError(null);
    try {
      const remaining = 9 - form.album.length;
      const toProcess = Array.from(files).slice(0, remaining);
      const urls: string[] = [];
      for (const file of toProcess) {
        if (!file.type.startsWith('image/')) continue;
        if (file.size > 8 * 1024 * 1024) { setError('Ficheiro muito grande (máx 8MB).'); continue; }
        const url = await compressImage(file);
        urls.push(url);
      }
      setForm(p => ({ ...p, album: [...p.album, ...urls] }));
    } catch {
      setError('Erro ao processar imagem. Tente novamente.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em] border-b border-gray-100 pb-2">
        📷 Fotos da Empresa
      </p>

      <div className="bg-blue-50 border border-blue-200 px-4 py-2.5 flex items-center gap-2">
        <span className="text-blue-400 text-base leading-none">👁</span>
        <p className="text-[11px] font-semibold text-blue-600">
          As fotos serão exibidas no <strong>perfil público</strong> da sua empresa. Todas são opcionais e podem ser adicionadas depois.
        </p>
      </div>

      {/* ── Logotipo / Foto de Perfil ── */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <p className="text-[10px] font-bold text-[#1a2b4a] uppercase tracking-wider">Logotipo / Foto de Perfil</p>
          <span className="text-[9px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">Opcional</span>
        </div>
        <div
          onClick={handlePickProfile}
          className={`relative overflow-hidden cursor-pointer transition-all border-2 flex items-center justify-center
            ${form.profile_photo
              ? 'border-[#0a1628]'
              : 'border-dashed border-gray-200 hover:border-[#c9a96e] bg-gray-50'
            }`}
          style={{ height: 140 }}
        >
          {form.profile_photo ? (
            <>
              <img src={form.profile_photo} alt="Logotipo" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-[#0a1628]/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <span className="bg-white text-[#1a2b4a] font-bold text-xs uppercase px-3 py-2 rounded-full shadow-lg">Trocar</span>
                <button type="button"
                  onClick={e => { e.stopPropagation(); setForm(p => ({ ...p, profile_photo: '' })); }}
                  className="bg-red-500 text-white font-bold text-xs uppercase px-3 py-2 rounded-full shadow-lg">
                  Remover
                </button>
              </div>
              <div className="absolute top-2 right-2 bg-green-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">✓ OK</div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Camera className="w-8 h-8 text-gray-300" />
              <p className="font-bold text-xs uppercase text-gray-400">Clique para adicionar</p>
              <p className="text-[10px] text-gray-300 font-bold">JPG, PNG · máx 8MB</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Álbum de Fotos ── */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <p className="text-[10px] font-bold text-[#1a2b4a] uppercase tracking-wider">Álbum de Fotos</p>
            <span className="text-[9px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">Opcional · máx 9</span>
          </div>
          {form.album.length > 0 && (
            <span className="text-[10px] font-bold text-[#c9a96e]">{form.album.length}/9</span>
          )}
        </div>

        {form.album.length < 9 && (
          <div
            onClick={() => !uploading && fileRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); handleAlbumFiles(e.dataTransfer.files); }}
            className={`border-2 border-dashed p-5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all mb-3
              ${uploading
                ? 'border-[#c9a96e]/30 bg-[#0a1628]/5 cursor-wait'
                : 'border-gray-200 hover:border-[#0a1628] hover:bg-[#0a1628]/5'}`}
          >
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
              onChange={e => handleAlbumFiles(e.target.files)} />
            {uploading ? (
              <>
                <div className="w-5 h-5 border-4 border-[#0a1628] border-t-transparent rounded-full animate-spin" />
                <p className="font-bold text-[#1a2b4a] text-xs uppercase">Processando...</p>
              </>
            ) : (
              <>
                <ImagePlus className="w-6 h-6 text-gray-300" />
                <p className="font-bold text-gray-400 text-xs uppercase">Adicionar fotos</p>
                <p className="text-[10px] text-gray-300 font-bold">JPG, PNG · máx 8MB · arraste ou clique</p>
              </>
            )}
          </div>
        )}

        {error && <p className="text-xs font-bold text-red-600 bg-red-50 px-3 py-2 mb-3">⚠️ {error}</p>}

        {form.album.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {form.album.map((url, i) => (
              <div key={i} className="relative group overflow-hidden border border-gray-100" style={{ aspectRatio: '4/3' }}>
                <img src={url} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button type="button"
                    onClick={() => setForm(p => ({ ...p, album: p.album.filter((_, idx) => idx !== i) }))}
                    className="bg-red-500 text-white p-2 rounded-full">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="absolute top-1 left-1 bg-black/50 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{i + 1}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
