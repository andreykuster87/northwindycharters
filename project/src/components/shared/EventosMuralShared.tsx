// src/components/shared/EventosMuralShared.tsx
// Helpers e constantes partilhados pelos sub-componentes do EventosMural

export function fmtDate(iso: string) {
  return new Date(iso + 'T12:00').toLocaleDateString('pt-PT', {
    weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
  });
}

export function fmtCurrency(v: number) {
  return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(v);
}

export function daysUntil(iso: string): number {
  const diff = new Date(iso + 'T00:00:00').getTime() - new Date().setHours(0, 0, 0, 0);
  return Math.ceil(diff / 86400000);
}

export const TIPO_EMOJI: Record<string, string> = {
  Regata: '🏁', Passeio: '⛵', Formação: '🎓', Desportivo: '🏊',
  Tour: '🗺️', Festa: '🎉', Outro: '📌',
};

export const TIPO_COLOR: Record<string, string> = {
  Regata:     'bg-red-50 text-red-700 border-red-100',
  Passeio:    'bg-blue-50 text-blue-700 border-blue-100',
  Formação:   'bg-purple-50 text-purple-700 border-purple-100',
  Desportivo: 'bg-orange-50 text-orange-700 border-orange-100',
  Tour:       'bg-teal-50 text-teal-700 border-teal-100',
  Festa:      'bg-pink-50 text-pink-700 border-pink-100',
  Outro:      'bg-gray-50 text-gray-600 border-gray-100',
};
