// src/lib/store/core.ts
// ─────────────────────────────────────────────────────────────────────────────
// Tipos base e helpers internos.
// ─────────────────────────────────────────────────────────────────────────────

// ── Tipos de Documento ────────────────────────────────────────────────────────

export const DOC_TYPES = [
  { value: 'passport',        label: '🛂 Passaporte',                    hasBack: false },
  { value: 'rg',              label: '🪪 RG — Registro Geral',           hasBack: true  },
  { value: 'bi',              label: '🪪 BI — Bilhete de Identidade',    hasBack: true  },
  { value: 'cc',              label: '🪪 CC — Cartão de Cidadão',        hasBack: true  },
  { value: 'cnh',             label: '🚗 CNH — Carteira de Habilitação', hasBack: true  },
  { value: 'habilitacao_nau', label: '⚓ Habilitação Náutica',           hasBack: true  },
  { value: 'nif',             label: '🏛️ NIF / NIT',                     hasBack: false },
  { value: 'other',           label: '📄 Outro',                         hasBack: true  },
] as const;

export type DocTypeValue = typeof DOC_TYPES[number]['value'];

// ── Interfaces de domínio ─────────────────────────────────────────────────────

export interface DocInfo {
  numero?:       string;
  tipo?:         DocTypeValue;
  emissao?:      string;
  validade?:     string;
  doc_url?:      string | null;
  doc_back_url?: string | null;
}

export interface Sailor {
  id:             string;
  profile_number: string;
  name:           string;
  phone:          string;
  email:          string;
  language:       string;
  timezone:       string;
  nacionalidade:  string;
  birth_date?:    string;
  // Dados pessoais extras
  cpf_nif?:       string;
  rg_doc?:        string;
  passaporte_num?: string;
  endereco?:      string;
  // Função pretendida
  funcao?:        string;
  funcao_outro?:  string;
  // Documentos marítimos
  passaporte:     DocInfo;
  cartahabitacao: DocInfo;
  caderneta_maritima?: { possui: boolean; numero?: string; validade?: string; doc_url?: string | null };
  comprovante_endereco_url?: string | null;
  // STCW com validades
  stcw:           Record<string, boolean>;
  stcw_validades?: Record<string, string>;
  // Médico
  medico:         DocInfo;
  // Experiência profissional
  experiencia_embarcado?: boolean;
  experiencias?: Array<{ empresa: string; funcao: string; periodo_inicio: string; periodo_fim: string }>;
  // Cursos e qualificações
  cursos_relevantes?: string;
  possui_offshore?:   boolean;
  idiomas?:           string[];
  idioma_nivel?:      string;
  idioma_outro?:      string;
  // Disponibilidade
  disponivel_imediato?:     boolean;
  disponivel_internacional?: boolean;
  tempo_embarque?:          string;
  // Informações adicionais
  restricao_medica?:    string;
  outras_informacoes?:  string;
  // Declaração
  declaracao_data?:       string;
  aceitou_termos?:        boolean;
  declarou_verdadeira?:   boolean;
  // Status
  status:         'pending' | 'approved';
  blocked?:       boolean;
  block_reason?:  string;
  verified:       boolean;
  verified_at?:   string;
  created_at:     string;
  profile_photo?: string | null;
  username?:      string;
  pending_docs?:  Record<string, { doc_url: string; validade?: string; numero?: string; submitted_at: string; status: 'pending' | 'approved' | 'rejected' }> | null;
  album?:         string[];
  disponibilidade?: string[];
}

export interface Client {
  id:               string;
  profile_number:   string;
  name:             string;
  phone:            string;
  email:            string;
  country_code:     string;
  country_name:     string;
  timezone:         string;
  language:         string;
  birth_date:       string;
  doc_type:         DocTypeValue;
  passport_number:  string;
  passport_issued:  string | null;
  passport_expires: string;
  doc_url:          string | null;
  doc_back_url:     string | null;
  status:           'pending_verification' | 'active';
  blocked?:         boolean;
  block_reason?:    string;
  role:             string;
  created_at:       string;
  profile_photo?:   string | null;
  username?:        string;
  endereco?:        string;
  album?:           string[];
  outras_informacoes?: string;
}

export interface Boat {
  id:              string;
  sailor_id:       string;
  name:            string;
  type:            string;
  capacity:        number;
  bie_number:      string;
  imo_number:      string;
  description:     string;
  cover_photo:     string;
  photos:          string[];
  status:          string;
  created_at:      string;
  length_ft?:      number | null;
  matricula?:      string;
  porto?:          string;
  bandeira?:       string;
  material?:       string;
  comprimento?:    string;
  ano_construcao?: string;
  proprietario?:   string;
  nif?:            string;
  area_operacao?:  string;
  tipo_atividade?: string;
  comandante?:     string;
  metadata?:       string;
  boat_number?:    string;
  crew?:           string;
}

export interface TripScheduleEntry {
  date:       string;
  time_slots: string[];
  spots:      number;
}

export interface Trip {
  id:               string;
  boat_id:          string;
  sailor_id:        string;
  sailor_name:      string;
  boat_name:        string;
  boat_type:        string;
  capacity:         number;
  marina_saida:     string;
  marina_chegada:   string;
  duracao:          string;
  valor_por_pessoa: number;
  descricao:        string;
  cover_photo:      string;
  photos:           string[];
  status:           string;
  created_at:       string;
  schedule:         TripScheduleEntry[];
}

export interface BookingGuest {
  profile_number: string;
  email:          string;
  name?:          string;
  client_id?:     string;
}

export interface Booking {
  id:              string;
  booking_number:  number;
  trip_id:         string;
  sailor_id:       string;
  client_id?:      string;
  customer_name:   string;
  customer_phone:  string;
  booking_date:    string;
  time_slot:       string;
  passengers:      number;
  notes:           string;
  total_price:     number;
  status:          string;
  guests?:         BookingGuest[];
  guests_obs?:     string;
  created_at:      string;
  cancelled_at?:   string;
  cancel_reason?:  string;
  trip?:           Partial<Trip>;
}

export type MessageType =
  | 'booking_pending' | 'booking_confirmed' | 'booking_cancelled'
  | 'booking_completed' | 'welcome' | 'info'
  | 'doc_expired' | 'doc_expiring_soon'
  | 'account_blocked' | 'account_unblocked';

export interface Message {
  id:         string;
  client_id:  string;
  type:       MessageType;
  title:      string;
  body:       string;
  read:       boolean;
  created_at: string;
  meta?: {
    booking_id?:   string;
    trip_name?:    string;
    booking_date?: string;
    time_slot?:    string;
    passengers?:   number;
  };
}

// ── Helpers internos ──────────────────────────────────────────────────────────

export function uid(): string {
  return crypto.randomUUID();
}

export function formatProfileNumber(profileNumber: string): string {
  return String(parseInt(profileNumber, 10));
}

export function resolveDocUrl(docUrl: string | null | undefined): string | null {
  if (!docUrl) return null;
  // Supabase Storage URL ou base64 data URL
  return docUrl;
}