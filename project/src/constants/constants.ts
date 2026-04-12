// src/components/CreateTripModal/constants.ts
// ─────────────────────────────────────────────────────────────────────────────
// Constantes partilhadas por todos os steps do CreateTripModal.
// ─────────────────────────────────────────────────────────────────────────────
// uid vem de core.ts (crypto.randomUUID) — fonte única de verdade.
export { uid } from '../lib/store/core';

export const TIME_OPTIONS = [
  '00:00','01:00','02:00','03:00','04:00','05:00',
  '06:00','07:00','08:00','09:00','10:00','11:00',
  '12:00','13:00','14:00','15:00','16:00','17:00',
  '18:00','19:00','20:00','21:00','22:00','23:00',
];

export const DURACOES = ['2h','4h','6h','8h','Dia completo','Fim de semana'];

export const COUNTRIES = [
  { code:'BR',    name:'Brasil',         flag:'🇧🇷', currency:'BRL', symbol:'R$', locale:'pt-BR' },
  { code:'PT',    name:'Portugal',       flag:'🇵🇹', currency:'EUR', symbol:'€',  locale:'pt-PT' },
  { code:'US',    name:'Estados Unidos', flag:'🇺🇸', currency:'USD', symbol:'$',  locale:'en-US' },
  { code:'GB',    name:'Reino Unido',    flag:'🇬🇧', currency:'GBP', symbol:'£',  locale:'en-GB' },
  { code:'DE',    name:'Alemanha',       flag:'🇩🇪', currency:'EUR', symbol:'€',  locale:'de-DE' },
  { code:'FR',    name:'França',         flag:'🇫🇷', currency:'EUR', symbol:'€',  locale:'fr-FR' },
  { code:'ES',    name:'Espanha',        flag:'🇪🇸', currency:'EUR', symbol:'€',  locale:'es-ES' },
  { code:'IT',    name:'Itália',         flag:'🇮🇹', currency:'EUR', symbol:'€',  locale:'it-IT' },
  { code:'AR',    name:'Argentina',      flag:'🇦🇷', currency:'ARS', symbol:'$',  locale:'es-AR' },
  { code:'CL',    name:'Chile',          flag:'🇨🇱', currency:'CLP', symbol:'$',  locale:'es-CL' },
  { code:'MX',    name:'México',         flag:'🇲🇽', currency:'MXN', symbol:'$',  locale:'es-MX' },
  { code:'GR',    name:'Grécia',         flag:'🇬🇷', currency:'EUR', symbol:'€',  locale:'el-GR' },
  { code:'HR',    name:'Croácia',        flag:'🇭🇷', currency:'EUR', symbol:'€',  locale:'hr-HR' },
  { code:'AU',    name:'Austrália',      flag:'🇦🇺', currency:'AUD', symbol:'A$', locale:'en-AU' },
  { code:'OTHER', name:'Outro',          flag:'🌍',  currency:'USD', symbol:'$',  locale:'en-US' },
] as const;

export type Country = typeof COUNTRIES[number];

export const STATES: Record<string, { code: string; name: string }[]> = {
  BR: [
    {code:'AC',name:'Acre'},{code:'AL',name:'Alagoas'},{code:'AM',name:'Amazonas'},
    {code:'BA',name:'Bahia'},{code:'CE',name:'Ceará'},{code:'DF',name:'Distrito Federal'},
    {code:'ES',name:'Espírito Santo'},{code:'GO',name:'Goiás'},{code:'MA',name:'Maranhão'},
    {code:'MG',name:'Minas Gerais'},{code:'MS',name:'Mato Grosso do Sul'},{code:'MT',name:'Mato Grosso'},
    {code:'PA',name:'Pará'},{code:'PB',name:'Paraíba'},{code:'PE',name:'Pernambuco'},
    {code:'PI',name:'Piauí'},{code:'PR',name:'Paraná'},{code:'RJ',name:'Rio de Janeiro'},
    {code:'RN',name:'Rio Grande do Norte'},{code:'RO',name:'Rondônia'},{code:'RR',name:'Roraima'},
    {code:'RS',name:'Rio Grande do Sul'},{code:'SC',name:'Santa Catarina'},{code:'SE',name:'Sergipe'},
    {code:'SP',name:'São Paulo'},{code:'TO',name:'Tocantins'},
  ],
  PT: [
    {code:'LX',name:'Lisboa'},{code:'PO',name:'Porto'},{code:'FA',name:'Faro'},
    {code:'SE',name:'Setúbal'},{code:'AV',name:'Aveiro'},{code:'CO',name:'Coimbra'},
    {code:'BR',name:'Braga'},{code:'MA',name:'Madeira'},{code:'AC',name:'Açores'},
  ],
  US: [
    {code:'CA',name:'California'},{code:'FL',name:'Florida'},{code:'NY',name:'New York'},
    {code:'TX',name:'Texas'},{code:'HI',name:'Hawaii'},{code:'WA',name:'Washington'},
  ],
};

export const TABS = [
  { n: 1, label: 'Localização',     icon: '📍', short: 'Local'  },
  { n: 2, label: 'Rota & Encontro', icon: '⛵', short: 'Rota'   },
  { n: 3, label: 'Duração & Valor', icon: '💰', short: 'Valor'  },
  { n: 4, label: 'Extras & Agenda', icon: '🗓️', short: 'Agenda' },
  { n: 5, label: 'Descrição',       icon: '📝', short: 'Resumo' },
] as const;

export type TabN = typeof TABS[number]['n'];

export interface ScheduleEntry {
  id: string;
  date: string;
  time_slots: string[];
  spots: number;
}

export interface TripBoat {
  id: string;
  name: string;
  type: string;
  capacity: number;
  bie_number?: string | null;
  imo_number?: string | null;
}

export const today = () => new Date().toISOString().split('T')[0];

export function formatCurrency(value: number, country: Country): string {
  try {
    return new Intl.NumberFormat(country.locale, {
      style: 'currency', currency: country.currency, minimumFractionDigits: 2,
    }).format(value);
  } catch { return `${country.symbol} ${value.toFixed(2)}`; }
}