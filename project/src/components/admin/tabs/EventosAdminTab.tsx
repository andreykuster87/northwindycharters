// src/components/admin/tabs/EventosAdminTab.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Admin: mural público + gestão de solicitações de eventos das empresas
// Sailor: mural público de eventos (leitura)
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import {
  getEvents, getPendingEvents, approveEvent,
  rejectEvent, setEventAnalysis,
  type NauticEvent, type EventStatus,
} from '../../../lib/localStore';
import { EventosMural } from '../../shared/EventosMural';
import { fmtDate, STATUS_MAP } from './EventosAdminShared';
import { EventosAdminActionModal } from './EventosAdminActionModal';
import { NovoEventoAdminForm } from './NovoEventoAdminForm';

// ── Linha de evento na lista admin ────────────────────────────────────────────

function EventRow({ ev, onOpen }: { ev: NauticEvent; onOpen: () => void }) {
  const statusInfo = STATUS_MAP[ev.status];
  return (
    <button onClick={onOpen}
      className="w-full text-left bg-white border-2 border-gray-100 px-4 py-4 flex items-center gap-3 hover:border-[#c9a96e]/30 transition-all group">
      <div className="w-10 h-10 bg-[#0a1628]/5 flex items-center justify-center flex-shrink-0 text-lg">
        {ev.cover_emoji || '📌'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-[#1a2b4a] text-sm truncate">{ev.title}</p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 ${statusInfo.cls}`}>
            {statusInfo.label}
          </span>
          <span className="text-xs font-bold text-gray-400 truncate">{ev.company_name}</span>
          <span className="text-xs font-bold text-gray-400">· {fmtDate(ev.date)}</span>
        </div>
      </div>
      <div className="flex-shrink-0 text-gray-300 group-hover:text-[#c9a96e] transition-colors">
        <ChevronDown className="w-4 h-4" />
      </div>
    </button>
  );
}

// ── Tab principal ─────────────────────────────────────────────────────────────

interface Props {
  role: 'admin' | 'sailor' | null;
}

export function EventosAdminTab({ role }: Props) {
  const [subTab,       setSubTab]       = useState<'mural' | 'gestao' | 'criar'>('mural');
  const [filterStatus, setFilterStatus] = useState<EventStatus | ''>('');
  const [activeEvent,  setActiveEvent]  = useState<NauticEvent | null>(null);
  const [renderKey,    setRenderKey]    = useState(0);

  const allEvents     = getEvents();
  const pendingEvents = getPendingEvents();

  const filtered = filterStatus
    ? allEvents.filter(e => e.status === filterStatus)
    : allEvents;

  function reload() { setRenderKey(k => k + 1); }

  const pendingCount = pendingEvents.length;

  // Sailor só vê o mural
  if (role === 'sailor') {
    return <EventosMural title="Mural de Eventos" subtitle="Eventos náuticos aprovados para a comunidade" />;
  }

  return (
    <div className="space-y-4" key={renderKey}>
      {/* Sub-tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {[
          { key: 'mural' as const, label: 'Mural Público', icon: '🌊' },
          { key: 'criar' as const, label: 'Criar Evento',  icon: '➕' },
        ].map(t => (
          <button key={t.key} onClick={() => setSubTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2.5 font-semibold text-xs uppercase transition-all ${
              subTab === t.key ? 'bg-[#0a1628] text-white shadow-md' : 'bg-white border-2 border-gray-100 text-gray-500 hover:border-[#c9a96e]/30'
            }`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Mural público */}
      {subTab === 'mural' && (
        <EventosMural
          title="Mural de Eventos — Visão Pública"
          subtitle="Eventos aprovados visíveis para todos"
          emptyMessage="Nenhum evento aprovado. Aprove eventos em Solicitações."
        />
      )}

      {/* Criar Evento (admin auto-aprovado) */}
      {subTab === 'criar' && (
        <NovoEventoAdminForm
          onSuccess={() => { reload(); setSubTab('mural'); }}
          onCancel={() => setSubTab('mural')}
        />
      )}
    </div>
  );
}
