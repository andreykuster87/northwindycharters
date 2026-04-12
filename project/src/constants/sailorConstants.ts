// src/constants/sailorConstants.ts

export const COUNTRIES = [
  { code:'BR',    name:'Brasil',         flag:'🇧🇷', ddi:'+55',  mask:'(##) #####-####', tz:'America/Sao_Paulo' },
  { code:'PT',    name:'Portugal',       flag:'🇵🇹', ddi:'+351', mask:'### ### ###',      tz:'Europe/Lisbon' },
  { code:'US',    name:'Estados Unidos', flag:'🇺🇸', ddi:'+1',   mask:'(###) ###-####',  tz:'America/New_York' },
  { code:'GB',    name:'Reino Unido',    flag:'🇬🇧', ddi:'+44',  mask:'#### ### ####',   tz:'Europe/London' },
  { code:'DE',    name:'Alemanha',       flag:'🇩🇪', ddi:'+49',  mask:'#### ########',   tz:'Europe/Berlin' },
  { code:'FR',    name:'França',         flag:'🇫🇷', ddi:'+33',  mask:'## ## ## ## ##',  tz:'Europe/Paris' },
  { code:'ES',    name:'Espanha',        flag:'🇪🇸', ddi:'+34',  mask:'### ### ###',     tz:'Europe/Madrid' },
  { code:'IT',    name:'Itália',         flag:'🇮🇹', ddi:'+39',  mask:'### ### ####',    tz:'Europe/Rome' },
  { code:'AR',    name:'Argentina',      flag:'🇦🇷', ddi:'+54',  mask:'(###) ###-####',  tz:'America/Argentina/Buenos_Aires' },
  { code:'CL',    name:'Chile',          flag:'🇨🇱', ddi:'+56',  mask:'# #### ####',     tz:'America/Santiago' },
  { code:'CO',    name:'Colômbia',       flag:'🇨🇴', ddi:'+57',  mask:'### ### ####',    tz:'America/Bogota' },
  { code:'MX',    name:'México',         flag:'🇲🇽', ddi:'+52',  mask:'## #### ####',    tz:'America/Mexico_City' },
  { code:'GR',    name:'Grécia',         flag:'🇬🇷', ddi:'+30',  mask:'### ### ####',    tz:'Europe/Athens' },
  { code:'HR',    name:'Croácia',        flag:'🇭🇷', ddi:'+385', mask:'## ### ####',     tz:'Europe/Zagreb' },
  { code:'OTHER', name:'Outro',          flag:'🌍',  ddi:'+',    mask:'##############',  tz:'UTC' },
] as const;

export type Country = typeof COUNTRIES[number];

export const LANGUAGES = [
  { code:'pt-BR', label:'Português (Brasil)'   },
  { code:'pt-PT', label:'Português (Portugal)' },
  { code:'en',    label:'English'              },
  { code:'es',    label:'Español'              },
  { code:'fr',    label:'Français'             },
  { code:'de',    label:'Deutsch'              },
  { code:'it',    label:'Italiano'             },
];

export const FUNCOES_MARITIMAS = [
  'Marinheiro de Convés',
  'Marinheiro de Máquinas',
  'Moço de Convés',
  'Moço de Máquinas',
  'Comandante / Capitão',
  'Oficial de Náutica',
  'Oficial de Máquinas',
  'Cozinheiro(a) / Taifeiro(a)',
  'Serviços Gerais',
  'Outro',
] as const;

export type FuncaoMaritima = typeof FUNCOES_MARITIMAS[number];

export const STCW_CERTS = [
  { id: 'bst',        label: 'Básico de Segurança (BST)'   },
  { id: 'sobrev',     label: 'Sobrevivência no Mar'         },
  { id: 'incendio',   label: 'Combate a Incêndio'           },
  { id: 'primeiros',  label: 'Primeiros Socorros'           },
  { id: 'social',     label: 'Responsabilidades Sociais'    },
] as const;

export const IDIOMAS_DISPONIVEIS = ['Português', 'Inglês', 'Espanhol'] as const;

export const TABS = [
  { n:1, icon:'👤', short:'Pessoal',    label:'Dados Pessoais'    },
  { n:2, icon:'🪪', short:'Documentos', label:'Documentos'        },
  { n:3, icon:'⚓', short:'STCW',       label:'Certificados STCW' },
  { n:4, icon:'🩺', short:'Médico',     label:'Aptidão & Envio'   },
] as const;

export type TabN = typeof TABS[number]['n'];

export const BIRTH_MONTHS = [
  '01 - Janeiro','02 - Fevereiro','03 - Março','04 - Abril',
  '05 - Maio','06 - Junho','07 - Julho','08 - Agosto',
  '09 - Setembro','10 - Outubro','11 - Novembro','12 - Dezembro',
];