// src/components/modals/sailor-application/utils.ts

export function applyDateMask(v: string): string {
  const d = v.replace(/\D/g, '').slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
}

export function nowDatetimeLocal(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

export interface Experiencia {
  empresa: string;
  funcao: string;
  periodo_inicio: string;
  periodo_fim: string;
}

export const BLANK_EXP: Experiencia = {
  empresa: '', funcao: '', periodo_inicio: '', periodo_fim: '',
};
