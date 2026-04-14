// src/components/AdminDashboard/tabs/FinanceiroTab.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Aba financeira — passeios + eventos.
// Eventos futuros = receita Pendente. Eventos passados = receita Confirmada.
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { Booking, Sailor, Trip, Boat } from '../../../lib/localStore';
import { getEventBookings, type EventBooking } from '../../../lib/localStore';

// ── Props ─────────────────────────────────────────────────────────────────────

interface FinanceiroTabProps {
  bookings: Booking[];
  sailors:  Sailor[];
  trips:    Trip[];
  boats:    Boat[];
  role:     'admin' | 'sailor' | null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(v: number) {
  return v.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' });
}

function isEventPast(eventDate: string, eventTime: string): boolean {
  try {
    return new Date(`${eventDate}T${eventTime || '23:59'}`) < new Date();
  } catch { return false; }
}

const STATUS_CONFIRMADO = ['confirmed', 'completed', 'concluido'];
const STATUS_PENDENTE   = ['pending', 'awaiting_guests'];

// ── Componente ────────────────────────────────────────────────────────────────

export function FinanceiroTab({ bookings, sailors, trips, boats, role }: FinanceiroTabProps) {
  const [expandedSailor, setExpandedSailor] = useState<string | null>(null);
  const [periodoFiltro,  setPeriodoFiltro]  = useState<'tudo' | '30d' | '7d'>('tudo');
  const [showEventos,    setShowEventos]    = useState(true);
  const [expandedEvt,    setExpandedEvt]    = useState<string | null>(null);

  const now = new Date();

  // ── Passeios ────────────────────────────────────────────────────────────────

  const filteredBookings = bookings.filter(b => {
    if (periodoFiltro === 'tudo') return true;
    if (!b.created_at) return true;
    const dias = periodoFiltro === '7d' ? 7 : 30;
    return (now.getTime() - new Date(b.created_at).getTime()) / 86400000 <= dias;
  });

  const receitaPasseiosConf = filteredBookings
    .filter(b => STATUS_CONFIRMADO.includes(b.status))
    .reduce((s, b) => s + Number(b.total_price), 0);

  const receitaPasseiosPend = filteredBookings
    .filter(b => STATUS_PENDENTE.includes(b.status))
    .reduce((s, b) => s + Number(b.total_price), 0);

  const receitaCancelada = filteredBookings
    .filter(b => b.status === 'cancelado')
    .reduce((s, b) => s + Number(b.total_price), 0);

  const totalReservasPasseios = filteredBookings.filter(b => b.status !== 'cancelado').length;
  const ticketMedio = totalReservasPasseios > 0
    ? receitaPasseiosConf / Math.max(1, filteredBookings.filter(b => STATUS_CONFIRMADO.includes(b.status)).length)
    : 0;

  // ── Eventos ─────────────────────────────────────────────────────────────────
  const allEventBookings: EventBooking[] = getEventBookings();

  const filteredEventBookings = allEventBookings.filter(b => {
    if (b.status === 'cancelled') return false;
    if (periodoFiltro === 'tudo') return true;
    if (!b.created_at) return true;
    const dias = periodoFiltro === '7d' ? 7 : 30;
    return (now.getTime() - new Date(b.created_at).getTime()) / 86400000 <= dias;
  });

  const evtConfirmados = filteredEventBookings.filter(b => isEventPast(b.event_date, b.event_time));
  const evtPendentes   = filteredEventBookings.filter(b => !isEventPast(b.event_date, b.event_time));

  const receitaEventosConf = evtConfirmados.reduce((s, b) => s + b.total_price, 0);
  const receitaEventosPend = evtPendentes.reduce((s, b) => s + b.total_price, 0);

  // ── KPIs combinados ─────────────────────────────────────────────────────────
  const totalConfirmado = receitaPasseiosConf + receitaEventosConf;
  const totalPendente   = receitaPasseiosPend + receitaEventosPend;

  // ── Receita por comandante ──────────────────────────────────────────────────
  const porComandante = sailors
    .filter(s => s.status === 'approved')
    .map(sailor => {
      const sb       = filteredBookings.filter(b => b.sailor_id === sailor.id);
      const receita  = sb.filter(b => STATUS_CONFIRMADO.includes(b.status)).reduce((s, b) => s + Number(b.total_price), 0);
      const pendente = sb.filter(b => STATUS_PENDENTE.includes(b.status)).reduce((s, b) => s + Number(b.total_price), 0);
      const qtd      = sb.filter(b => b.status !== 'cancelado').length;
      return { sailor, receita, pendente, qtd, sailorTrips: trips.filter(t => t.sailor_id === sailor.id), sailorBookings: sb };
    })
    .filter(x => x.qtd > 0 || x.receita > 0)
    .sort((a, b) => b.receita - a.receita);

  // ── Top Passeios ────────────────────────────────────────────────────────────
  const porPasseio = trips
    .map(trip => {
      const tb      = filteredBookings.filter(b => b.trip_id === trip.id);
      const receita = tb.filter(b => STATUS_CONFIRMADO.includes(b.status)).reduce((s, b) => s + Number(b.total_price), 0);
      const qtd     = tb.filter(b => b.status !== 'cancelado').length;
      return { trip, receita, qtd };
    })
    .filter(x => x.qtd > 0)
    .sort((a, b) => b.receita - a.receita)
    .slice(0, 8);

  // ── Top Eventos (agrupados por evento) ──────────────────────────────────────
  const porEvento = (() => {
    const map = new Map<string, { title: string; total: number; qtd: number; isPast: boolean }>();
    filteredEventBookings.forEach(b => {
      const e = map.get(b.event_id) || { title: b.event_title, total: 0, qtd: 0, isPast: isEventPast(b.event_date, b.event_time) };
      map.set(b.event_id, { ...e, total: e.total + b.total_price, qtd: e.qtd + 1 });
    });
    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  })();

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* Cabeçalho + filtro período */}
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-['Playfair_Display'] font-bold text-3xl text-[#1a2b4a]">Financeiro</h2>
          <p className="text-gray-400 font-bold text-sm uppercase mt-1">
            Passeios + Eventos · {fmt(totalConfirmado + totalPendente)} em aberto
          </p>
        </div>
        <div className="flex items-center gap-1 bg-gray-100 p-1">
          {(['tudo', '30d', '7d'] as const).map(p => (
            <button key={p} onClick={() => setPeriodoFiltro(p)}
              className={`px-4 py-1.5 font-semibold text-xs uppercase transition-all ${
                periodoFiltro === p ? 'bg-[#0a1628] text-white shadow' : 'text-gray-500 hover:text-[#1a2b4a]'
              }`}>
              {p === 'tudo' ? 'Tudo' : p === '30d' ? '30 dias' : '7 dias'}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs principais — combinados */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Confirmada',  value: fmt(totalConfirmado),  emoji: '💰', color: 'border-green-200 bg-green-50',  txt: 'text-green-700' },
          { label: 'Pendente',    value: fmt(totalPendente),    emoji: '⏳', color: 'border-amber-200 bg-amber-50',  txt: 'text-amber-700' },
          { label: 'Ticket Médio',value: fmt(ticketMedio),      emoji: '🎟️', color: 'border-[#c9a96e]/20 bg-[#c9a96e]/5', txt: 'text-[#1a2b4a]' },
          { label: 'Cancelado',   value: fmt(receitaCancelada), emoji: '❌', color: 'border-red-200 bg-red-50',      txt: 'text-red-600'   },
        ].map(k => (
          <div key={k.label} className={`border-2 px-5 py-4 ${k.color}`}>
            <p className="text-2xl mb-1">{k.emoji}</p>
            <p className={`text-xl font-bold ${k.txt}`}>{k.value}</p>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.15em] mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Split ⛵ Passeios vs 🎟️ Eventos */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border-2 border-[#c9a96e]/20 px-5 py-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">⛵</span>
            <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em]">Passeios</p>
          </div>
          <p className="text-lg font-bold text-[#1a2b4a]">{fmt(receitaPasseiosConf)}</p>
          <p className="text-[10px] font-bold text-amber-600 mt-0.5">+ {fmt(receitaPasseiosPend)} pendente</p>
          <p className="text-[10px] font-bold text-gray-400">{totalReservasPasseios} reserva{totalReservasPasseios !== 1 ? 's' : ''}</p>
        </div>
        <div className="bg-white border-2 border-purple-100 px-5 py-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🎟️</span>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.15em]">Eventos</p>
          </div>
          <p className="text-lg font-bold text-purple-800">{fmt(receitaEventosConf)}</p>
          <p className="text-[10px] font-bold text-amber-600 mt-0.5">+ {fmt(receitaEventosPend)} pendente</p>
          <p className="text-[10px] font-bold text-gray-400">{filteredEventBookings.length} bilhete{filteredEventBookings.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* ── Receita de Eventos ── */}
      <div className="bg-white border-2 border-purple-100 shadow-sm overflow-hidden">
        <button
          onClick={() => setShowEventos(v => !v)}
          className="w-full flex items-center justify-between px-6 py-5 border-b border-gray-100 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <h3 className="text-base font-bold text-[#1a2b4a] uppercase">🎟️ Receita de Eventos</h3>
            {receitaEventosPend > 0 && (
              <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2.5 py-0.5">
                ⏳ {fmt(receitaEventosPend)} pendente
              </span>
            )}
            {receitaEventosConf > 0 && (
              <span className="bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-0.5">
                ✅ {fmt(receitaEventosConf)} confirmada
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-3 py-1">
              {filteredEventBookings.length} bilhete{filteredEventBookings.length !== 1 ? 's' : ''}
            </span>
            {showEventos ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
          </div>
        </button>

        {showEventos && (
          <div className="p-6 space-y-5">

            {filteredEventBookings.length === 0 ? (
              <div className="text-center py-10">
                <div className="text-4xl mb-3">🎟️</div>
                <p className="font-semibold text-gray-300 uppercase text-sm">Sem bilhetes de eventos</p>
                <p className="text-xs text-gray-400 font-bold mt-1">
                  Assim que alguém comprar um bilhete, aparece aqui como receita pendente.
                </p>
              </div>
            ) : (
              <>
                {/* KPIs internos */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-amber-50 border-2 border-amber-100 px-4 py-3">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.15em] mb-0.5">⏳ Pendente</p>
                    <p className="text-xl font-bold text-amber-700">{fmt(receitaEventosPend)}</p>
                    <p className="text-[10px] font-bold text-gray-400">{evtPendentes.length} bilhete{evtPendentes.length !== 1 ? 's' : ''} · eventos futuros</p>
                  </div>
                  <div className="bg-green-50 border-2 border-green-100 px-4 py-3">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.15em] mb-0.5">✅ Confirmada</p>
                    <p className="text-xl font-bold text-green-700">{fmt(receitaEventosConf)}</p>
                    <p className="text-[10px] font-bold text-gray-400">{evtConfirmados.length} bilhete{evtConfirmados.length !== 1 ? 's' : ''} · eventos realizados</p>
                  </div>
                </div>

                {/* Nota explicativa */}
                <div className="bg-[#0a1628]/5 border-2 border-[#c9a96e]/20 px-4 py-3">
                  <p className="text-xs font-bold text-[#1a2b4a]">
                    💡 A receita muda automaticamente de <span className="font-bold text-amber-700">Pendente → Confirmada</span> quando a data/hora do evento passa.
                  </p>
                </div>

                {/* Por Evento */}
                {porEvento.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em] mb-3">Por Evento</p>
                    <div className="space-y-2">
                      {porEvento.map((ev, i) => (
                        <div key={i} className="flex items-center gap-3 bg-gray-50 px-4 py-3">
                          <div className="w-9 h-9 flex items-center justify-center flex-shrink-0 text-lg">
                            {ev.isPast ? '✅' : '⏳'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-[#1a2b4a] text-sm truncate">{ev.title}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className={`text-[9px] font-semibold uppercase px-1.5 py-0.5 ${
                                ev.isPast ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                              }`}>
                                {ev.isPast ? 'Realizado' : 'Pendente'}
                              </span>
                              <span className="text-[10px] font-bold text-gray-400">
                                {ev.qtd} bilhete{ev.qtd !== 1 ? 's' : ''}
                              </span>
                            </div>
                          </div>
                          <p className="font-bold text-[#1a2b4a] flex-shrink-0">{fmt(ev.total)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bilhetes individuais */}
                <div>
                  <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em] mb-3">Bilhetes Recentes</p>
                  <div className="space-y-2">
                    {filteredEventBookings.map(b => {
                      const isPast = isEventPast(b.event_date, b.event_time);
                      const isOpen = expandedEvt === b.id;
                      return (
                        <div key={b.id}
                          className={`overflow-hidden border-2 transition-all ${
                            isPast ? 'border-green-100 bg-green-50/30' : 'border-amber-100 bg-amber-50/30'
                          }`}>
                          <button
                            className="w-full text-left px-4 py-3 flex items-center gap-3"
                            onClick={() => setExpandedEvt(isOpen ? null : b.id)}
                          >
                            <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 text-base">
                              {isPast ? '✅' : '⏳'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-[#1a2b4a] text-sm truncate">{b.event_title}</p>
                              <p className="text-xs font-bold text-gray-500 truncate">
                                {b.customer_name} · {b.tickets} bilhete{b.tickets !== 1 ? 's' : ''} · {new Date(b.event_date + 'T12:00').toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className={`font-bold text-sm ${isPast ? 'text-green-700' : 'text-amber-700'}`}>
                                {fmt(b.total_price)}
                              </p>
                              <p className={`text-[9px] font-semibold uppercase ${isPast ? 'text-green-600' : 'text-amber-600'}`}>
                                {isPast ? 'Confirmada' : 'Pendente'}
                              </p>
                            </div>
                          </button>

                          {isOpen && (
                            <div className="px-4 pb-4 border-t border-white/60 pt-3 grid grid-cols-2 gap-2 animate-in fade-in duration-150">
                              {[
                                ['Bilhete',   b.booking_number],
                                ['Contacto',  b.customer_phone],
                                ['Local',     b.event_local],
                                ['Hora',      b.event_time],
                                ['Bilhetes',  `${b.tickets} pessoa${b.tickets !== 1 ? 's' : ''}`],
                                ['Empresa',   b.company_name || 'NorthWindy'],
                              ].map(([l, v]) => (
                                <div key={l} className="bg-white px-3 py-2">
                                  <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-[0.15em]">{l}</p>
                                  <p className="text-sm font-bold text-[#1a2b4a] mt-0.5 truncate">{v}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Receita por Comandante ── */}
      {role === 'admin' && porComandante.length > 0 && (
        <div className="bg-white border-2 border-[#0a1628]/5 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <h3 className="text-base font-bold text-[#1a2b4a] uppercase">⚓ Receita por Comandante</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {porComandante.map(({ sailor, receita, pendente, qtd, sailorTrips, sailorBookings }) => {
              const isOpen = expandedSailor === sailor.id;
              const pct    = totalConfirmado > 0 ? (receita / totalConfirmado) * 100 : 0;
              return (
                <div key={sailor.id}>
                  <button
                    onClick={() => setExpandedSailor(isOpen ? null : sailor.id)}
                    className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="w-10 h-10 bg-[#0a1628] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {sailor.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-[#1a2b4a] text-sm truncate">{sailor.name}</p>
                        <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 flex-shrink-0">
                          {qtd} reserva{qtd !== 1 ? 's' : ''}
                        </span>
                        {pendente > 0 && (
                          <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 flex-shrink-0">
                            {fmt(pendente)} pendente
                          </span>
                        )}
                      </div>
                      <div className="mt-1.5 h-1.5 bg-gray-100 overflow-hidden w-full max-w-xs">
                        <div className="h-full bg-[#c9a96e] transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <p className="font-bold text-[#1a2b4a] text-base">{fmt(receita)}</p>
                      {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </div>
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-4 bg-[#0a1628]/5">
                      <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em] mb-3 pt-3">Passeios</p>
                      <div className="space-y-2">
                        {sailorTrips.map(trip => {
                          const tb  = sailorBookings.filter(b => b.trip_id === trip.id);
                          const tr  = tb.filter(b => STATUS_CONFIRMADO.includes(b.status)).reduce((s, b) => s + Number(b.total_price), 0);
                          const tqd = tb.filter(b => b.status !== 'cancelado').length;
                          if (tqd === 0 && tr === 0) return null;
                          return (
                            <div key={trip.id} className="flex items-center justify-between bg-white px-4 py-2.5 border border-gray-100">
                              <div className="min-w-0">
                                <p className="font-bold text-[#1a2b4a] text-xs truncate">{trip.boat_name}</p>
                                <p className="text-[10px] text-gray-400 font-bold">{tqd} reserva{tqd !== 1 ? 's' : ''}</p>
                              </div>
                              <p className="font-bold text-[#1a2b4a] text-sm flex-shrink-0 ml-4">{fmt(tr)}</p>
                            </div>
                          );
                        })}
                        {sailorTrips.length === 0 && (
                          <p className="text-xs text-gray-400 font-bold">Sem passeios cadastrados.</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Top Passeios ── */}
      {porPasseio.length > 0 && (
        <div className="bg-white border-2 border-[#0a1628]/5 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <h3 className="text-base font-bold text-[#1a2b4a] uppercase">🧭 Top Passeios por Receita</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {porPasseio.map(({ trip, receita, qtd }, i) => {
              const pct = totalConfirmado > 0 ? (receita / totalConfirmado) * 100 : 0;
              return (
                <div key={trip.id} className="flex items-center gap-4 px-6 py-3.5">
                  <span className="text-sm font-bold text-gray-300 w-5 flex-shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#1a2b4a] text-sm truncate">{trip.boat_name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="h-1.5 bg-gray-100 overflow-hidden flex-1 max-w-[120px]">
                        <div className="h-full bg-[#c9a96e]" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[10px] font-semibold text-gray-400">{qtd} reserva{qtd !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  <p className="font-bold text-[#1a2b4a] flex-shrink-0">{fmt(receita)}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Estado vazio */}
      {porComandante.length === 0 && porPasseio.length === 0 && filteredEventBookings.length === 0 && (
        <div className="bg-white border-2 border-dashed border-gray-200 p-16 text-center">
          <div className="text-5xl mb-4">💰</div>
          <p className="font-semibold text-gray-300 uppercase text-lg">Sem dados financeiros</p>
          <p className="text-gray-400 font-bold text-sm mt-1">
            As receitas aparecem aqui quando houver reservas confirmadas ou bilhetes de eventos vendidos.
          </p>
        </div>
      )}

    </div>
  );
}
