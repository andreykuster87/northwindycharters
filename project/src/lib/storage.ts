// src/lib/storage.ts — Upload de documentos para Supabase Storage
import { supabase } from './supabase';

const BUCKET = 'documents';

/** Comprime imagem mantendo proporção (max 1200px, JPEG 72%). PDFs passam direto. */
export async function compressImageFile(file: File, maxDim = 1200, quality = 0.72): Promise<File> {
  if (file.type === 'application/pdf') return file;
  if (!file.type.startsWith('image/')) return file;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) { height = Math.round(height * maxDim / width); width = maxDim; }
          else { width = Math.round(width * maxDim / height); height = maxDim; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('Canvas não disponível')); return; }
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (!blob) { reject(new Error('Falha ao comprimir')); return; }
            resolve(new File([blob], file.name, { type: 'image/jpeg' }));
          },
          'image/jpeg',
          quality,
        );
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/** Upload de arquivo para Supabase Storage. Retorna a URL pública. */
export async function uploadDocFile(file: File, folder: string, label: string): Promise<string> {
  const ext = file.name.split('.').pop() || 'jpg';
  const path = `${folder}/${label}-${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: true });
  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/** Comprime (se imagem) e faz upload. Helper combinado. */
export async function uploadDoc(file: File | null, folder: string, label: string): Promise<string | null> {
  if (!file) return null;
  const compressed = await compressImageFile(file);
  return uploadDocFile(compressed, folder, label);
}

/** Remove uma lista de URLs do Storage. Silencioso em caso de erro (melhor esforço). */
export async function deleteUploadedDocs(urls: (string | null | undefined)[]): Promise<void> {
  const paths = urls.flatMap(url => {
    if (!url) return [];
    try {
      const match = url.match(/\/object\/public\/[^/]+\/(.+)$/);
      return match ? [match[1]] : [];
    } catch { return []; }
  });
  if (paths.length === 0) return;
  await supabase.storage.from(BUCKET).remove(paths).catch(() => {});
}
