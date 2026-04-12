// src/components/company/RHShared.tsx
// Shared helpers and UI primitives for RHTab sub-components

export function fmtDate(iso: string) {
  if (!iso) return '—';
  return new Date(iso + 'T12:00').toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' });
}
export function fmtDateShort(iso: string) {
  if (!iso) return '—';
  return new Date(iso + 'T12:00').toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' });
}
export function diffDays(a: string, b: string) {
  const ms = new Date(b + 'T12:00').getTime() - new Date(a + 'T12:00').getTime();
  return Math.round(ms / 86400000) + 1;
}
export function uid() { return crypto.randomUUID(); }

export const STAFF_STATUS_CLS: Record<string, string> = {
  'disponível':  'bg-green-100 text-green-700',
  'em serviço':  'bg-blue-100 text-blue-700',
  'escritório':  'bg-gray-100 text-gray-600',
  'ausente':     'bg-amber-100 text-amber-700',
  'férias':      'bg-purple-100 text-purple-700',
};

export const ROLES = ['Skipper', 'Co-Skipper', 'Tripulante', 'Supervisor', 'Gestora Comercial', 'Administrativo', 'Outro'];

export function Avatar({ nome, size = 10 }: { nome: string; size?: number }) {
  const initials = nome.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const sz = `w-${size} h-${size}`;
  return (
    <div className={`${sz} bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0 font-black text-white text-sm`}>
      {initials}
    </div>
  );
}
