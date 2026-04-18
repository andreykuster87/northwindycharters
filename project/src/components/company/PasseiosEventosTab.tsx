// src/components/company/PasseiosEventosTab.tsx
// Aba "Passeios e Eventos" da área da empresa:
//   • Passeios: lista de trips criados pela empresa
//   • Eventos: lista de eventos criados pela empresa (activos + realizados)
import { useState, useEffect } from 'react';
import {
  Ship, CalendarDays, Anchor, Plus, ChevronDown, ChevronUp,
  CheckCircle2, XCircle, Eye, Clock, AlertCircle,
} from 'lucide-react';
import {
  getEventsByCompany, deleteEvent, getAllTrips,
  type NauticEvent, type EventStatus, type Company,
} from '../../lib/localStore';
import type { Trip } from '../../lib/localStore';
import { NovoEventoOverlay } from './NovoEventoOverlay';

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Date(iso + 'T12:00').toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' });
}

const STATUS_MAP: Record<EventStatus, { label: string; cls: string; icon: React.ElementType }> = {
  pending:  { label: 'Pendente',    cls: 'bg-[#c9a96e]/15 text-[#c9a96e]', icon: Clock        },
  analysis: { label: 'Em Análise',  cls: 'bg-[#0a1628]/10 text-[#1a2b4a]', icon: Eye          },
  approved: { label: 'Aprovado',    cls: 'bg-green-100 text-green-700',     icon: CheckCircle2 },
  rejected: { label: 'Reprovado',   cls: 'bg-red-100 text-red-600',         icon: XCircle      },
};

// ── Card de evento ────────────────────────────────────────────────────────────

function EventoCard({ ev, onDelete }: { ev: NauticEvent; onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const s = STATUS_MAP[ev.status];
  const StatusIcon = s.icon;

  return (
    <div className="bg-white border border-gray-100 overflow-hidden">
      <div className="px-4 py-3 flex items-center gap-3">
        <div className="w-10 h-10 bg-[#0a1628]/5 flex items-center justify-center flex-shrink-0 text-xl">
          {ev.cover_emoji || '📌'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-[#1a2b4a] text-sm truncate">{ev.title}</p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 flex items-center gap-1 ${s.cls}`}>
              <StatusIcon className="w-2.5 h-2.5" /> {s.label}
            </span>
            <span className="text-xs font-semibold text-gray-400">{fmtDate(ev.date)} às {ev.time}</span>
          </div>
        </div>
        <button onClick={() => setExpanded(v => !v)} className="text-gray-400 hover:text-[#1a2b4a] flex-shrink-0">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-50 pt-3 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {[
              ['Local',  ev.local],
              ['Cidade', ev.cidade],
              ['Vagas',  String(ev.vagas)],
              ['Preço',  ev.preco === 0 ? 'Gratuito' : `€${ev.preco}`],
            ].map(([l, v]) => (
              <div key={l} className="bg-gray-50 px-3 py-2">
                <p className="text-[9px] font-semibold text-gray-400 uppercase">{l}</p>
                <p className="text-sm font-semibold text-[#1a2b4a]">{v}</p>
              </div>
            ))}
          </div>
          {ev.description && (
            <p className="text-xs font-semibold text-gray-600 bg-gray-50 px-3 py-2 leading-relaxed">{ev.description}</p>
          )}
          {(ev.status === 'pending' || ev.status === 'rejected') && (
            !confirmDel ? (
              <button onClick={() => setConfirmDel(true)}
                className="w-full border border-red-100 text-red-400 hover:bg-red-50 hover:border-red-300 py-2.5 font-semibold text-xs uppercase transition-all">
                🗑 Retirar Solicitação
              </button>
            ) : (
              <div className="bg-red-50 border border-red-100 p-3 space-y-2">
                <p className="text-xs font-semibold text-red-700 text-center">Confirmar remoção?</p>
                <div className="flex gap-2">
                  <button onClick={() => setConfirmDel(false)}
                    className="flex-1 border border-gray-200 text-gray-500 py-2 font-semibold text-xs uppercase">Cancelar</button>
                  <button onClick={onDelete}
                    className="flex-1 bg-red-500 hover:bg-red-400 text-white py-2 font-semibold text-xs uppercase transition-all">Remover</button>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

// ── Card de passeio ───────────────────────────────────────────────────────────

function PasseioCard({ trip }: { trip: Trip }) {
  const [expanded, setExpanded] = useState(false);
  const statusLabel: Record<string, { label: string; cls: string }> = {
    active:    { label: 'Activo',    cls: 'bg-green-100 text-green-700' },
    cancelled: { label: 'Cancelado', cls: 'bg-red-100 text-red-600' },
    inactive:  { label: 'Inactivo',  cls: 'bg-gray-100 text-gray-500' },
  };
  const s = statusLabel[trip.status] ?? { label: trip.status, cls: 'bg-gray-100 text-gray-500' };
  const nextDate = trip.schedule
    .map(e => e.date)
    .filter(d => d >= new Date().toISOString().split('T')[0])
    .sort()[0];

  return (
    <div className="bg-white border border-gray-100 overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="w-10 h-10 flex-shrink-0 overflow-hidden bg-[#0a1628]/5">
          {trip.cover_photo
            ? <img src={trip.cover_photo} alt="" className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center"><Ship className="w-5 h-5 text-[#c9a96e]" /></div>
          }
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-[#1a2b4a] text-sm truncate">{trip.boat_name}</p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 ${s.cls}`}>{s.label}</span>
            <span className="text-[10px] font-semibold text-gray-400">{trip.duracao}</span>
          </div>
        </div>
        <button onClick={() => setExpanded(v => !v)} className="text-gray-400 hover:text-[#1a2b4a] flex-shrink-0">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-gray-50 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            {[
              ['Saída',       trip.marina_saida],
              ['Chegada',     trip.marina_chegada],
              ['Preço',       `€${trip.valor_por_pessoa}/pax`],
              ['Próx. data',  nextDate ?? '—'],
            ].map(([l, v]) => (
              <div key={l} className="bg-gray-50 px-3 py-2">
                <p className="text-[9px] font-semibold text-gray-400 uppercase">{l}</p>
                <p className="text-xs font-bold text-[#1a2b4a]">{v}</p>
              </div>
            ))}
          </div>
          {trip.descricao && (
            <p className="text-[11px] text-gray-500 font-semibold leading-relaxed line-clamp-2">{trip.descricao}</p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

interface Props {
  company:  Company;
  onToast:  (msg: string) => void;
}

export function PasseiosEventosTab({ company, onToast }: Props) {
  const companyId = company.id;
  const [activeTab,   setActiveTab]   = useState<'passeios' | 'eventos'>('passeios');
  const [eventSubTab, setEventSubTab] = useState<'activos' | 'realizados'>('activos');
  const [showNovo,    setShowNovo]    = useState(false);
  const [trips,       setTrips]       = useState<Trip[]>([]);
  const [renderKey,   setRenderKey]   = useState(0);

  useEffect(() => {
    setTrips(getAllTrips());
  }, [renderKey]);

  function reload() { setRenderKey(k => k + 1); }

  const todayStr     = new Date().toISOString().split('T')[0];
  const allEventos   = getEventsByCompany(companyId);
  const activos      = allEventos.filter(e => e.date >= todayStr);
  const realizados   = allEventos.filter(e => e.date < todayStr);
  const companyTrips = trips.filter(t => t.sailor_id === companyId);

  return (
    <div className="space-y-5" key={renderKey}>
      {/* Overlay de novo evento */}
      {showNovo && (
        <NovoEventoOverlay
          company={company}
          onSuccess={() => { reload(); setShowNovo(false); onToast('Evento enviado para aprovação!'); }}
          onClose={() => setShowNovo(false)}
        />
      )}

      {/* Header */}
      <div>
        <h2 className="text-lg font-['Playfair_Display'] font-bold text-[#1a2b4a] uppercase italic flex items-center gap-2">
          <Ship className="w-5 h-5" /> Passeios e Eventos
        </h2>
        <p className="text-xs text-gray-400 font-semibold">Os passeios e eventos da sua empresa</p>
      </div>

      {/* Abas */}
      <div className="flex gap-1 bg-gray-100 p-1">
        {([
          ['passeios', 'Passeios', Ship,        companyTrips.length],
          ['eventos',  'Eventos',  CalendarDays, allEventos.length],
        ] as const).map(([key, label, Icon, count]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-bold uppercase tracking-wider transition-all ${
              activeTab === key ? 'bg-white text-[#1a2b4a] shadow-sm' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
            {count > 0 && (
              <span className="bg-[#c9a96e]/20 text-[#c9a96e] text-[9px] font-bold px-1.5 py-0.5 leading-none">
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Passeios ── */}
      {activeTab === 'passeios' && (
        <div className="space-y-3">
          {companyTrips.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-gray-200 py-14 text-center">
              <Anchor className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="font-semibold text-gray-300 uppercase italic text-sm">Nenhum passeio registado</p>
              <p className="text-xs text-gray-400 font-semibold mt-1">Os passeios são criados e geridos na aba <strong>Frota</strong>.</p>
            </div>
          ) : (
            companyTrips.map(t => <PasseioCard key={t.id} trip={t} />)
          )}
        </div>
      )}

      {/* ── Eventos ── */}
      {activeTab === 'eventos' && (
        <div className="space-y-3">
          {/* Sub-tabs */}
          <div className="flex gap-1 bg-gray-100 p-1">
            {([
              ['activos',    `Activos (${activos.length})`],
              ['realizados', `Realizados (${realizados.length})`],
            ] as const).map(([key, label]) => (
              <button key={key} onClick={() => setEventSubTab(key)}
                className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider transition-all ${
                  eventSubTab === key ? 'bg-white text-[#1a2b4a] shadow-sm' : 'text-gray-400 hover:text-gray-600'
                }`}>
                {label}
              </button>
            ))}
          </div>

          {/* Criar novo evento */}
          <button
            onClick={() => setShowNovo(true)}
            className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-[#c9a96e]/30 hover:border-[#c9a96e] bg-[#0a1628]/5 hover:bg-gray-50 text-[#1a2b4a] py-3 font-semibold text-xs uppercase transition-all"
          >
            <Plus className="w-4 h-4" /> Criar Novo Evento
          </button>

          {/* Lista */}
          {(eventSubTab === 'activos' ? activos : realizados).length === 0 ? (
            <div className="bg-white border-2 border-dashed border-gray-200 py-12 text-center">
              <div className="text-4xl mb-3">{eventSubTab === 'activos' ? '📅' : '🏁'}</div>
              <p className="font-semibold text-gray-300 uppercase italic text-sm">
                {eventSubTab === 'activos' ? 'Nenhum evento activo' : 'Nenhum evento realizado'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {(eventSubTab === 'activos' ? activos : realizados).map(ev => (
                <EventoCard key={ev.id} ev={ev}
                  onDelete={() => { deleteEvent(ev.id); reload(); }} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
