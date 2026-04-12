// src/utils/formatters.ts
// ─────────────────────────────────────────────────────────────────────────────
// Funções utilitárias partilhadas entre componentes de registo.
// ─────────────────────────────────────────────────────────────────────────────

/** Aplica máscara de telefone. Ex: "(##) #####-####" */
export function applyMask(value: string, mask: string): string {
  const digits = value.replace(/\D/g, '');
  let result = '';
  let di = 0;
  for (let i = 0; i < mask.length && di < digits.length; i++) {
    if (mask[i] === '#') result += digits[di++];
    else result += mask[i];
  }
  return result;
}

/**
 * Converte um ficheiro para base64, comprimindo imagens antes de guardar.
 * — PDFs são guardados tal qual.
 * — Imagens são redimensionadas para máx. 1200px e qualidade 0.72 (JPEG).
 */
export async function fileToBase64(file: File): Promise<string> {
  if (file.type === 'application/pdf') {
    return new Promise((res, rej) => {
      const r = new FileReader();
      r.onload  = () => res(r.result as string);
      r.onerror = rej;
      r.readAsDataURL(file);
    });
  }
  return compressImage(file, 1200, 0.72);
}

/**
 * Comprime uma imagem para as dimensões e qualidade indicadas.
 * Usado também para fotos de perfil (maxPx = 400, quality = 0.8).
 */
export function compressImage(file: File, maxPx = 1200, quality = 0.72): Promise<string> {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onerror = rej;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = rej;
      img.onload = () => {
        let { width, height } = img;
        if (width > maxPx || height > maxPx) {
          if (width > height) { height = Math.round(height * maxPx / width);  width  = maxPx; }
          else                { width  = Math.round(width  * maxPx / height); height = maxPx; }
        }
        const canvas = document.createElement('canvas');
        canvas.width  = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) { rej(new Error('Canvas não disponível')); return; }
        ctx.drawImage(img, 0, 0, width, height);
        res(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/** Normaliza um string para uso como login: sem acentos, só alfanumérico. */
export function normalizeLoginBase(name: string): string {
  return name.split(' ')[0].toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
}

/** Gera login no formato nome#perfil. Ex: "andrey#1" */
export function generateLogin(name: string, profileNumber: string): string {
  const num = String(parseInt(profileNumber, 10));
  return `${normalizeLoginBase(name)}#${num}`;
}