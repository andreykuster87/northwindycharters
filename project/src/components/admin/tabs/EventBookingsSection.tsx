// src/components/admin/tabs/EventBookingsSection.tsx
import { useState } from 'react';
import { getEventBookings, type EventBooking } from '../../../lib/localStore';
import { fmt } from '../../shared/adminHelpers';

export function EventBookingsSection({ role }: { role: 'admin' | 'sailor' | null }) {
  const [evTab,      setEvTab]      = useState<'hoje' | 'proximas' | 'historico'>('hoje');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const allEvtBookings: EventBooking[] = getEventBookings();

  const today = new Date().toISOString().split('T')[0];
  const nowTs = new Date().getTime();

  function isToday(dateStr: string) { return dateStr === today; }
  function isPast(dateStr: string, timeStr: string) {
    try { return new Date(`${dateStr}T${timeStr || '23:59'}`).getTime() < nowTs; } catch { return false; }
  }
  function isFuture(dateStr: string) { return dateStr > today; }

  const hojeBookings      = allEvtBookings.filter(b => b.status !== 'cancelled' && isToday(b.event_date));
  const proximasBookings  = allEvtBookings.filter(b => b.status !== 'cancelled' && isFuture(b.event_date));
  const historicoBookings = allEvtBookings.filter(b => isPast(b.event_date, b.event_time) || b.status === 'cancelled');

  const tabData = { hoje: hojeBookings, proximas: proximasBookings, historico: historicoBookings };
  const current = tabData[evTab];

  const totalHoje   = hojeBookings.reduce((s, b) => s + b.total_price, 0);
  const totalProx   = proximasBookings.reduce((s, b) => s + b.total_price, 0);
  const paxHoje     = hojeBookings.reduce((s, b) => s + b.tickets, 0);
  const paxProx     = proximasBookings.reduce((s, b) => s + b.tickets, 0);

  if (allEvtBookings.length === 0) return null;

  return (
    <div className="bg-white rounded-[40px] border-2 border-purple-100 shadow-sm overflow-hidden">

      <div className="px-6 pt-5 pb-3 border-b-2 border-gray-50">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎟️</span>
            <h2 className="text-lg font-black text-blue-900 uppercase italic">Bilhetes de Eventos</h2>
          </div>
          <span className="bg-purple-100 text-purple-700 text-xs font-black px-3 py-1 rounded-full">
            {allEvtBookings.length} total
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-blue-50 rounded-[14px] px-4 py-3">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-sm">📅</span>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Hoje</p>
            </div>
            <p className="text-xl font-black text-blue-900">{hojeBookings.length}</p>
            <p className="text-[10px] font-bold text-gray-400">{paxHoje} pax · {fmt(totalHoje)}</p>
          </div>
          <div className="bg-amber-50 rounded-[14px] px-4 py-3">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-sm">⏭️</span>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Próximas</p>
            </div>
            <p className="text-xl font-black text-amber-800">{proximasBookings.length}</p>
            <p className="text-[10px] font-bold text-gray-400">{paxProx} pax · {fmt(totalProx)}</p>
          </div>
        </div>

        <div className="flex gap-2">
          {([
            { key: 'hoje'      as const, label: '📅 Hoje',     count: hojeBookings.length,     urgent: hojeBookings.length > 0 },
            { key: 'proximas'  as const, label: '⏭️ Próximas', count: proximasBookings.length,  urgent: false },
            { key: 'historico' as const, label: '🗂 Histórico', count: historicoBookings.length, urgent: false },
          ]).map(t => (
            <button key={t.key} onClick={() => setEvTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-[12px] font-black text-xs uppercase transition-all ${
                evTab === t.key
                  ? 'bg-blue-900 text-white'
                  : 'bg-gray-50 border-2 border-gray-100 text-gray-500 hover:border-blue-200'
              }`}>
              {t.label}
              {t.count > 0 && (
                <span className={`text-[9px] font-black min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center ${
                  evTab === t.key
                    ? 'bg-white text-blue-900'
                    : t.urgent ? 'bg-blue-900 text-white' : 'bg-gray-300 text-white'
                }`}>{t.count}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 py-4">
        {current.length === 0 ? (
          <div className="text-center py-10">
            <span className="text-4xl block mb-2">
              {evTab === 'hoje' ? '🌅' : evTab === 'proximas' ? '📆' : '📋'}
            </span>
            <p className="font-black text-gray-300 uppercase italic text-sm">
              {evTab === 'hoje'      ? 'Nenhum bilhete para hoje'
               : evTab === 'proximas' ? 'Sem reservas futuras'
               : 'Sem histórico ainda'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {current.map(b => {
              const isOpen      = expandedId === b.id;
              const isPastEv    = isPast(b.event_date, b.event_time);
              const statusCls   = b.status === 'cancelled'
                ? 'bg-red-100 text-red-600'
                : isPastEv ? 'bg-gray-100 text-gray-600' : isToday(b.event_date) ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700';
              const statusLabel = b.status === 'cancelled' ? 'Cancelado' : isPastEv ? 'Realizado' : isToday(b.event_date) ? 'Hoje' : 'Confirmado';

              return (
                <div key={b.id}
                  className={`rounded-[18px] overflow-hidden border-2 transition-all ${
                    isToday(b.event_date) && b.status !== 'cancelled'
                      ? 'border-blue-200 bg-blue-50/40'
                      : 'border-gray-100 bg-gray-50 hover:border-purple-200'
                  }`}>
                  <button className="w-full text-left px-4 py-3 flex items-center gap-3"
                    onClick={() => setExpandedId(isOpen ? null : b.id)}>
                    <div className="w-9 h-9 rounded-full bg-blue-900 flex items-center justify-center flex-shrink-0 font-black text-white text-xs">
                      {b.customer_name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                        <p className="font-black text-blue-900 text-sm truncate">{b.event_title}</p>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full flex-shrink-0 ${statusCls}`}>{statusLabel}</span>
                      </div>
                      <p className="text-xs font-bold text-gray-500 truncate">
                        👤 {b.customer_name}
                        {b.company_name && b.company_name !== 'NorthWindy' && (
                          <span className="text-gray-400"> · 🏢 {b.company_name}</span>
                        )}
                      </p>
                      <p className="text-xs font-bold text-gray-400">
                        📅 {new Date(b.event_date + 'T12:00').toLocaleDateString('pt-PT', { weekday:'short', day:'2-digit', month:'short' })} às {b.event_time}
                        {' · '}👥 {b.tickets} bilhete{b.tickets !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-black text-blue-900 text-sm">{fmt(b.total_price)}</p>
                      <p className="text-[10px] font-bold text-gray-400">{b.booking_number}</p>
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 border-t border-white/60 pt-3 space-y-3 animate-in fade-in duration-150">
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          ['Bilhete',  b.booking_number],
                          ['Contacto', b.customer_phone],
                          ['Local',    b.event_local],
                          ['Hora',     b.event_time],
                          ['Bilhetes', `${b.tickets} pessoa${b.tickets !== 1 ? 's' : ''}`],
                          ['Valor',    fmt(b.total_price)],
                        ].map(([l, v]) => (
                          <div key={l} className="bg-white rounded-[12px] px-3 py-2.5">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">{l}</p>
                            <p className="text-sm font-black text-blue-900 mt-0.5 truncate">{v}</p>
                          </div>
                        ))}
                      </div>
                      {b.guests.length > 0 && (
                        <div className="bg-purple-50 border border-purple-100 rounded-[12px] px-3 py-2.5">
                          <p className="text-[9px] font-black text-purple-600 uppercase tracking-wider mb-1.5">Convidados</p>
                          {b.guests.map((g: any, i: number) => (
                            <div key={i} className="flex items-center gap-2 mb-1">
                              <div className="w-5 h-5 bg-purple-200 rounded-full flex items-center justify-center text-[9px] font-black text-purple-800 flex-shrink-0">
                                {g.name.charAt(0).toUpperCase()}
                              </div>
                              <p className="text-xs font-bold text-purple-900">{g.name}{g.doc ? ` · ${g.doc}` : ''}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      {b.company_name && (
                        <div className="flex items-center gap-2 bg-blue-50 rounded-[12px] px-3 py-2">
                          <span className="text-sm">🏢</span>
                          <p className="text-xs font-bold text-blue-900">{b.company_name}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
