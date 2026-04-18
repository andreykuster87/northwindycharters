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
  sailorId?:   string;
  sailorName?: string;
}

export function EventosAdminTab({ role, sailorId, sailorName }: Props) {
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
    return (
      <EventosMural
        title="Mural de Eventos"
        subtitle="Eventos náuticos aprovados para a comunidade"
      />
    );
  }

  return (
    <div className="space-y-4" key={renderKey}>
      {/* Sub-tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {[
          { key: 'mural' as const,  label: 'Mural Público',   icon: '🌊' },
          { key: 'gestao' as const, label: 'Gestão',          icon: '⚙️', badge: pendingCount },
          { key: 'criar' as const,  label: 'Criar Evento',    icon: '➕' },
        ].map(t => (
          <button key={t.key} onClick={() => setSubTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2.5 font-semibold text-xs uppercase transition-all ${
              subTab === t.key ? 'bg-[#0a1628] text-white shadow-md' : 'bg-white border-2 border-gray-100 text-gray-500 hover:border-[#c9a96e]/30'
            }`}>
            {t.icon} {t.label}
            {t.badge && t.badge > 0 && (
              <span className={`text-[9px] font-semibold w-4 h-4 flex items-center justify-center ${subTab === t.key ? 'bg-white text-[#0a1628]' : 'bg-red-500 text-white'}`}>
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Mural público */}
      {subTab === 'mural' && (
        <EventosMural
          title="Mural de Eventos — Visão Pública"
          subtitle="Eventos aprovados visíveis para todos"
          emptyMessage="Nenhum evento aprovado. Aprove eventos na aba Gestão."
        />
      )}

      {/* Criar Evento (admin auto-aprovado) */}
      {subTab === 'criar' && (
        <NovoEventoAdminForm
          onSuccess={() => { reload(); setSubTab('mural'); }}
          onCancel={() => setSubTab('mural')}
        />
      )}

      {/* Gestão admin */}
      {subTab === 'gestao' && (
        <div className="space-y-4">
          <div>
            <h2 className="font-['Playfair_Display'] font-bold text-lg text-[#1a2b4a] uppercase">Gestão de Eventos</h2>
            <p className="text-xs text-gray-400 font-bold mt-0.5">Solicitações das empresas — aprovação e moderação</p>
          </div>

          {/* KPIs de status */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { s: '' as const,           label: 'Total',      value: allEvents.length,                                      cls: 'border-gray-100' },
              { s: 'pending' as const,    label: 'Pendentes',  value: allEvents.filter(e=>e.status==='pending').length,      cls: 'border-amber-100' },
              { s: 'analysis' as const,   label: 'Em Análise', value: allEvents.filter(e=>e.status==='analysis').length,     cls: 'border-[#c9a96e]/20' },
              { s: 'approved' as const,   label: 'Aprovados',  value: allEvents.filter(e=>e.status==='approved').length,     cls: 'border-green-100' },
            ].map(k => (
              <button key={k.label} onClick={() => setFilterStatus(k.s === filterStatus ? '' : k.s)}
                className={`bg-white border-2 px-4 py-3 text-left transition-all hover:border-[#c9a96e]/30 ${k.cls} ${filterStatus === k.s && k.s !== '' ? 'ring-2 ring-[#c9a96e]/40' : ''}`}>
                <p className="text-xl font-bold text-[#1a2b4a]">{k.value}</p>
                <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-[0.15em]">{k.label}</p>
              </button>
            ))}
          </div>

          {/* Filtro de status */}
          <div className="flex flex-wrap gap-2">
            {[
              { v: '' as const,          l: 'Todos' },
              { v: 'pending' as const,   l: '⏳ Pendentes' },
              { v: 'analysis' as const,  l: '🔍 Em Análise' },
              { v: 'approved' as const,  l: '✅ Aprovados' },
              { v: 'rejected' as const,  l: '❌ Reprovados' },
            ].map(({ v, l }) => (
              <button key={l} onClick={() => setFilterStatus(v)}
                className={`px-3 py-2 text-xs font-semibold border-2 transition-all ${
                  filterStatus === v ? 'bg-[#0a1628] text-white border-[#0a1628]' : 'bg-gray-50 text-gray-500 border-gray-100 hover:border-[#c9a96e]/30'
                }`}>
                {l}
              </button>
            ))}
          </div>

          {/* Lista */}
          {filtered.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-gray-200 py-12 text-center">
              <div className="text-4xl mb-3">📋</div>
              <p className="font-semibold text-gray-300 uppercase text-sm">Nenhum evento encontrado</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map(ev => (
                <EventRow key={ev.id} ev={ev} onOpen={() => setActiveEvent(ev)} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal de acção */}
      {activeEvent && (
        <EventosAdminActionModal
          ev={activeEvent}
          onClose={() => { setActiveEvent(null); reload(); }}
          onApprove={async () => { await approveEvent(activeEvent.id); setActiveEvent(null); reload(); }}
          onAnalysis={async notes => { await setEventAnalysis(activeEvent.id, notes); setActiveEvent(null); reload(); }}
          onReject={async reason => { await rejectEvent(activeEvent.id, reason); setActiveEvent(null); reload(); }}
        />
      )}
    </div>
  );
}
