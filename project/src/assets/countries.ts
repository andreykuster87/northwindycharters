// src/constants/countries.ts
// ─────────────────────────────────────────────────────────────────────────────
// Fonte única de verdade para países, DDIs e fusos horários.
// Importar em ClientRegistrationModal, SailorRegistration, etc.
// ─────────────────────────────────────────────────────────────────────────────

export interface Country {
  code: string;
  name: string;
  flag: string;
  ddi:  string;
  mask: string;
  tz:   string;
}

export const COUNTRIES: Country[] = [
  { code:'BR',    name:'Brasil',           flag:'🇧🇷', ddi:'+55',  mask:'(##) #####-####',  tz:'America/Sao_Paulo' },
  { code:'PT',    name:'Portugal',         flag:'🇵🇹', ddi:'+351', mask:'### ### ###',       tz:'Europe/Lisbon' },
  { code:'US',    name:'Estados Unidos',   flag:'🇺🇸', ddi:'+1',   mask:'(###) ###-####',   tz:'America/New_York' },
  { code:'GB',    name:'Reino Unido',      flag:'🇬🇧', ddi:'+44',  mask:'#### ### ####',    tz:'Europe/London' },
  { code:'DE',    name:'Alemanha',         flag:'🇩🇪', ddi:'+49',  mask:'#### ########',    tz:'Europe/Berlin' },
  { code:'FR',    name:'França',           flag:'🇫🇷', ddi:'+33',  mask:'## ## ## ## ##',   tz:'Europe/Paris' },
  { code:'ES',    name:'Espanha',          flag:'🇪🇸', ddi:'+34',  mask:'### ### ###',      tz:'Europe/Madrid' },
  { code:'IT',    name:'Itália',           flag:'🇮🇹', ddi:'+39',  mask:'### ### ####',     tz:'Europe/Rome' },
  { code:'AR',    name:'Argentina',        flag:'🇦🇷', ddi:'+54',  mask:'(###) ###-####',   tz:'America/Argentina/Buenos_Aires' },
  { code:'CL',    name:'Chile',            flag:'🇨🇱', ddi:'+56',  mask:'# #### ####',      tz:'America/Santiago' },
  { code:'CO',    name:'Colômbia',         flag:'🇨🇴', ddi:'+57',  mask:'### ### ####',     tz:'America/Bogota' },
  { code:'MX',    name:'México',           flag:'🇲🇽', ddi:'+52',  mask:'## #### ####',     tz:'America/Mexico_City' },
  { code:'JP',    name:'Japão',            flag:'🇯🇵', ddi:'+81',  mask:'##-####-####',     tz:'Asia/Tokyo' },
  { code:'CN',    name:'China',            flag:'🇨🇳', ddi:'+86',  mask:'### #### ####',    tz:'Asia/Shanghai' },
  { code:'AU',    name:'Austrália',        flag:'🇦🇺', ddi:'+61',  mask:'#### ### ###',     tz:'Australia/Sydney' },
  { code:'CA',    name:'Canadá',           flag:'🇨🇦', ddi:'+1',   mask:'(###) ###-####',   tz:'America/Toronto' },
  { code:'NL',    name:'Holanda',          flag:'🇳🇱', ddi:'+31',  mask:'## ### ####',      tz:'Europe/Amsterdam' },
  { code:'SE',    name:'Suécia',           flag:'🇸🇪', ddi:'+46',  mask:'##-### ## ##',     tz:'Europe/Stockholm' },
  { code:'NO',    name:'Noruega',          flag:'🇳🇴', ddi:'+47',  mask:'### ## ###',       tz:'Europe/Oslo' },
  { code:'CH',    name:'Suíça',            flag:'🇨🇭', ddi:'+41',  mask:'## ### ## ##',     tz:'Europe/Zurich' },
  { code:'ZA',    name:'África do Sul',    flag:'🇿🇦', ddi:'+27',  mask:'## ### ####',      tz:'Africa/Johannesburg' },
  { code:'AE',    name:'Emirados Árabes',  flag:'🇦🇪', ddi:'+971', mask:'## ### ####',      tz:'Asia/Dubai' },
  { code:'GR',    name:'Grécia',           flag:'🇬🇷', ddi:'+30',  mask:'### ### ####',     tz:'Europe/Athens' },
  { code:'HR',    name:'Croácia',          flag:'🇭🇷', ddi:'+385', mask:'## ### ####',      tz:'Europe/Zagreb' },
  { code:'OTHER', name:'Outro',            flag:'🌍',  ddi:'+',    mask:'##############',   tz:'UTC' },
];

export const LANGUAGES = [
  { code:'pt-BR', label:'Português (Brasil)' },
  { code:'pt-PT', label:'Português (Portugal)' },
  { code:'en',    label:'English' },
  { code:'es',    label:'Español' },
  { code:'fr',    label:'Français' },
  { code:'de',    label:'Deutsch' },
  { code:'it',    label:'Italiano' },
  { code:'ja',    label:'日本語' },
  { code:'zh',    label:'中文' },
  { code:'ar',    label:'العربية' },
];

export const TIMEZONES = [
  { value:'America/Sao_Paulo',        label:'America/São Paulo (GMT-3)' },
  { value:'Europe/Lisbon',            label:'Europe/Lisbon (GMT+0/+1)' },
  { value:'Europe/London',            label:'Europe/London (GMT+0/+1)' },
  { value:'Europe/Berlin',            label:'Europe/Berlin (GMT+1/+2)' },
  { value:'Europe/Paris',             label:'Europe/Paris (GMT+1/+2)' },
  { value:'Europe/Madrid',            label:'Europe/Madrid (GMT+1/+2)' },
  { value:'America/New_York',         label:'America/New York (GMT-5/-4)' },
  { value:'America/Los_Angeles',      label:'America/Los Angeles (GMT-8/-7)' },
  { value:'America/Buenos_Aires',     label:'America/Buenos Aires (GMT-3)' },
  { value:'Asia/Tokyo',               label:'Asia/Tokyo (GMT+9)' },
  { value:'Asia/Dubai',               label:'Asia/Dubai (GMT+4)' },
  { value:'Australia/Sydney',         label:'Australia/Sydney (GMT+10/+11)' },
  { value:'UTC',                      label:'UTC (GMT+0)' },
];