// src/components/ClientRegistration/clientRegistrationConstants.ts
// ─────────────────────────────────────────────────────────────────────────────
// Constantes e utilitários partilhados pelos steps do registo de cliente.
// ─────────────────────────────────────────────────────────────────────────────

export const COUNTRIES = [
  { code: 'BR',    name: 'Brasil',          flag: '🇧🇷', ddi: '+55',  mask: '(##) #####-####', tz: 'America/Sao_Paulo' },
  { code: 'PT',    name: 'Portugal',         flag: '🇵🇹', ddi: '+351', mask: '### ### ###',      tz: 'Europe/Lisbon' },
  { code: 'US',    name: 'Estados Unidos',   flag: '🇺🇸', ddi: '+1',   mask: '(###) ###-####',  tz: 'America/New_York' },
  { code: 'GB',    name: 'Reino Unido',      flag: '🇬🇧', ddi: '+44',  mask: '#### ### ####',   tz: 'Europe/London' },
  { code: 'DE',    name: 'Alemanha',         flag: '🇩🇪', ddi: '+49',  mask: '#### ########',   tz: 'Europe/Berlin' },
  { code: 'FR',    name: 'França',           flag: '🇫🇷', ddi: '+33',  mask: '## ## ## ## ##',  tz: 'Europe/Paris' },
  { code: 'ES',    name: 'Espanha',          flag: '🇪🇸', ddi: '+34',  mask: '### ### ###',     tz: 'Europe/Madrid' },
  { code: 'IT',    name: 'Itália',           flag: '🇮🇹', ddi: '+39',  mask: '### ### ####',    tz: 'Europe/Rome' },
  { code: 'AR',    name: 'Argentina',        flag: '🇦🇷', ddi: '+54',  mask: '(###) ###-####',  tz: 'America/Argentina/Buenos_Aires' },
  { code: 'CL',    name: 'Chile',            flag: '🇨🇱', ddi: '+56',  mask: '# #### ####',     tz: 'America/Santiago' },
  { code: 'CO',    name: 'Colômbia',         flag: '🇨🇴', ddi: '+57',  mask: '### ### ####',    tz: 'America/Bogota' },
  { code: 'MX',    name: 'México',           flag: '🇲🇽', ddi: '+52',  mask: '## #### ####',    tz: 'America/Mexico_City' },
  { code: 'JP',    name: 'Japão',            flag: '🇯🇵', ddi: '+81',  mask: '##-####-####',    tz: 'Asia/Tokyo' },
  { code: 'CN',    name: 'China',            flag: '🇨🇳', ddi: '+86',  mask: '### #### ####',   tz: 'Asia/Shanghai' },
  { code: 'AU',    name: 'Austrália',        flag: '🇦🇺', ddi: '+61',  mask: '#### ### ###',    tz: 'Australia/Sydney' },
  { code: 'CA',    name: 'Canadá',           flag: '🇨🇦', ddi: '+1',   mask: '(###) ###-####',  tz: 'America/Toronto' },
  { code: 'NL',    name: 'Holanda',          flag: '🇳🇱', ddi: '+31',  mask: '## ### ####',     tz: 'Europe/Amsterdam' },
  { code: 'SE',    name: 'Suécia',           flag: '🇸🇪', ddi: '+46',  mask: '##-### ## ##',    tz: 'Europe/Stockholm' },
  { code: 'NO',    name: 'Noruega',          flag: '🇳🇴', ddi: '+47',  mask: '### ## ###',      tz: 'Europe/Oslo' },
  { code: 'CH',    name: 'Suíça',            flag: '🇨🇭', ddi: '+41',  mask: '## ### ## ##',    tz: 'Europe/Zurich' },
  { code: 'ZA',    name: 'África do Sul',    flag: '🇿🇦', ddi: '+27',  mask: '## ### ####',     tz: 'Africa/Johannesburg' },
  { code: 'AE',    name: 'Emirados Árabes',  flag: '🇦🇪', ddi: '+971', mask: '## ### ####',     tz: 'Asia/Dubai' },
  { code: 'OTHER', name: 'Outro',            flag: '🌍',  ddi: '+',    mask: '##############',  tz: 'UTC' },
] as const;

export type Country = typeof COUNTRIES[number];

export const LANGUAGES = [
  { code: 'pt-BR', label: 'Português (Brasil)' },
  { code: 'pt-PT', label: 'Português (Portugal)' },
  { code: 'en',    label: 'English' },
  { code: 'es',    label: 'Español' },
  { code: 'fr',    label: 'Français' },
  { code: 'de',    label: 'Deutsch' },
  { code: 'it',    label: 'Italiano' },
  { code: 'ja',    label: '日本語' },
  { code: 'zh',    label: '中文' },
  { code: 'ar',    label: 'العربية' },
] as const;

export const MONTHS = [
  '01 - Janeiro', '02 - Fevereiro', '03 - Março', '04 - Abril',
  '05 - Maio', '06 - Junho', '07 - Julho', '08 - Agosto',
  '09 - Setembro', '10 - Outubro', '11 - Novembro', '12 - Dezembro',
];

/** Aplica máscara de telefone a uma string de dígitos. */
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