// src/lib/store/sailor-applications.ts
// ─────────────────────────────────────────────────────────────────────────────
// Types e helpers para candidaturas de tripulação (passageiro → tripulante)
// ─────────────────────────────────────────────────────────────────────────────

import type { DocTypeValue } from './core';

export type ApplicationStatus = 'pending' | 'approved' | 'rejected';

export interface SailorApplication {
  id: string;
  client_id: string;

  // Snapshot de dados do client
  name: string;
  email: string;
  phone: string;
  birth_date?: string;
  nacionalidade?: string;

  // Dados de tripulação
  funcoes: string[];

  // Caderneta Marítima (obrigatório)
  caderneta_maritima_numero: string;
  caderneta_maritima_validade: string;
  caderneta_doc_url?: string | null;
  caderneta_doc_back_url?: string | null;

  // Documento de Identificação (opcional)
  doc_id_tipo?: DocTypeValue | null;
  doc_id_numero?: string | null;
  doc_id_validade?: string | null;
  doc_id_url?: string | null;
  doc_id_back_url?: string | null;

  // Carta de Habilitação (opcional)
  carta_habilitacao_numero?: string | null;
  carta_habilitacao_validade?: string | null;
  carta_habilitacao_url?: string | null;
  carta_habilitacao_back_url?: string | null;

  // STCW (opcional)
  stcw?: Record<string, boolean>;
  stcw_validades?: Record<string, string>;

  // Médico (opcional)
  medico_numero?: string | null;
  medico_validade?: string | null;
  medico_url?: string | null;

  // Experiência & idiomas (opcional)
  experiencia_embarcado?: boolean;
  experiencias?: Array<{ empresa: string; funcao: string; periodo_inicio: string; periodo_fim: string }>;
  cursos_relevantes?: string;
  idiomas?: string[];

  // Chef (opcional - só se função = Cozinheiro)
  chef_experiencia_catering?: boolean;
  chef_certificacoes?: string;
  chef_certificacoes_url?: string | null;

  // Confirmações obrigatórias
  antecedentes_criminais?: string;
  antecedentes_criminais_url?: string | null;
  declara_verdade: boolean;
  aceita_termos: boolean;
  declaracao_data?: string;

  // Status
  status: ApplicationStatus;
  reject_reason?: string[];

  // Timestamps
  created_at: string;
  approved_at?: string | null;
  approved_by?: string | null;
}

// Dados do formulário (com Files para upload)
export interface SailorApplicationFormData {
  funcoes: string[];

  caderneta_maritima_numero: string;
  caderneta_maritima_validade: string;
  caderneta_file?: File | null;
  caderneta_file_prev?: string | null;
  caderneta_back_file?: File | null;
  caderneta_back_file_prev?: string | null;

  doc_id_tipo: DocTypeValue | null;
  doc_id_numero: string;
  doc_id_validade: string;
  doc_id_file?: File | null;
  doc_id_file_prev?: string | null;
  doc_id_back_file?: File | null;
  doc_id_back_file_prev?: string | null;

  carta_habilitacao_numero: string;
  carta_habilitacao_validade: string;
  carta_file?: File | null;
  carta_file_prev?: string | null;
  carta_back_file?: File | null;
  carta_back_file_prev?: string | null;

  stcw: Record<string, boolean>;
  stcw_validades: Record<string, string>;

  medico_validade: string;
  medico_file?: File | null;
  medico_file_prev?: string | null;

  experiencia_embarcado: boolean | null;
  experiencias: Array<{ empresa: string; funcao: string; periodo_inicio: string; periodo_fim: string }>;
  cursos_relevantes: string;
  idiomas: string[];

  chef_experiencia_catering: boolean;
  chef_certificacoes: string;

  antecedentes_criminais: string;
  declara_verdade: boolean;
  aceita_termos: boolean;
}

export const FUNCOES_MARITIMAS = [
  { id: 'marinheiroConves',   label: 'Marinheiro de Convés'   },
  { id: 'marinheiroMaquinas', label: 'Marinheiro de Máquinas' },
  { id: 'moco',               label: 'Moço'                   },
  { id: 'comandante',         label: 'Comandante'             },
  { id: 'oficialNautico',     label: 'Oficial Náutico'        },
  { id: 'oficialMaquinas',    label: 'Oficial de Máquinas'    },
  { id: 'cozinheiro',         label: 'Cozinheiro'             },
  { id: 'servicosGerais',     label: 'Serviços Gerais'        },
  { id: 'outro',              label: 'Outro'                  },
] as const;

export const APP_REJECT_REASONS: [string, string, string][] = [
  ['docs_incompletos',     '📄', 'Documentação incompleta ou ilegível'],
  ['habilitacao_invalida', '⚓', 'Habilitação náutica inválida ou expirada'],
  ['medico_invalido',      '🩺', 'Certificado médico inválido ou expirado'],
  ['dados_incorretos',     '✏️', 'Dados pessoais incorretos ou inconsistentes'],
  ['antecedentes',         '⚖️', 'Antecedentes criminais impeditivos'],
  ['outro',                '❓', 'Outro motivo'],
];
