// src/components/admin/tabs/EventosAdminShared.tsx
// Helpers e constantes partilhados no tab de Eventos Admin.
import { Clock, Eye, CheckCircle2, XCircle } from 'lucide-react';
import { type EventStatus } from '../../../lib/localStore';

export function fmtDate(iso: string) {
  return new Date(iso + 'T12:00').toLocaleDateString('pt-PT', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

export const STATUS_MAP: Record<EventStatus, { label: string; cls: string; icon: React.ElementType }> = {
  pending:  { label: 'Pendente',   cls: 'bg-amber-100 text-amber-700',  icon: Clock         },
  analysis: { label: 'Em Análise', cls: 'bg-blue-100 text-blue-700',    icon: Eye           },
  approved: { label: 'Aprovado',   cls: 'bg-green-100 text-green-700',  icon: CheckCircle2  },
  rejected: { label: 'Reprovado',  cls: 'bg-red-100 text-red-600',      icon: XCircle       },
};

export const REJECT_REASONS = [
  'Informações incompletas ou incorretas',
  'Evento não relacionado à actividade náutica',
  'Data/local inválido ou conflito',
  'Empresa sem verificação activa',
  'Conteúdo impróprio ou enganoso',
  'Duplicado de evento já existente',
  'Outro motivo',
];
