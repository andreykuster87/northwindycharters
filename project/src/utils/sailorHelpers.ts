// src/components/SailorRegistration/shared/sailorHelpers.ts

export function applyMask(value: string, mask: string): string {
  const digits = value.replace(/\D/g, '');
  let result = ''; let di = 0;
  for (let i = 0; i < mask.length && di < digits.length; i++) {
    result += mask[i] === '#' ? digits[di++] : mask[i];
  }
  return result;
}

/** Aplica máscara dd/mm/aaaa e retorna o valor formatado */
export function applyDateMask(value: string): string {
  return applyMask(value, '##/##/####');
}

export async function fileToBase64(file: File): Promise<string> {
  if (file.type === 'application/pdf') {
    return new Promise((res, rej) => {
      const r = new FileReader();
      r.onload  = () => res(r.result as string);
      r.onerror = rej;
      r.readAsDataURL(file);
    });
  }
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onerror = rej;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = rej;
      img.onload = () => {
        const MAX = 1200;
        let { width, height } = img;
        if (width > MAX || height > MAX) {
          if (width > height) { height = Math.round(height * MAX / width); width = MAX; }
          else                { width  = Math.round(width  * MAX / height); height = MAX; }
        }
        const canvas = document.createElement('canvas');
        canvas.width  = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) { rej(new Error('Canvas não disponível')); return; }
        ctx.drawImage(img, 0, 0, width, height);
        res(canvas.toDataURL('image/jpeg', 0.72));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}