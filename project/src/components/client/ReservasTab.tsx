// src/components/client/ReservasTab.tsx
import { useState } from 'react';
import { BookingCard } from '../shared/BookingCard';
import type { EventBooking } from '../../lib/store/events';

interface Props {
  bookings:      any[];
  eventBookings: EventBooking[];
  onRefresh?:    () => void;
}

export function ReservasTab({ bookings, eventBookings, onRefresh }: Props) {
  const [activeTab, setActiveTab] = useState<'passeios' | 'eventos'>('passeios');

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em] mb-1">Histórico</p>
        <h2 className="font-['Playfair_Display'] font-bold text-[#1a2b4a] text-xl">Minhas Reservas</h2>
        <div className="w-8 h-px bg-[#c9a96e] mt-2" />
      </div>
      <div className="flex gap-2">
        {([
          { key: 'passeios' as const, label: '⛵ Passeios', count: bookings.length },
          { key: 'eventos'  as const, label: '🎟️ Eventos',  count: eventBookings.length },
        ]).map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 font-semibold text-xs uppercase tracking-wide transition-all ${activeTab === t.key ? 'bg-[#0a1628] text-white border-b-2 border-[#c9a96e]' : 'bg-gray-50 border border-gray-100 text-gray-500 hover:text-[#1a2b4a]'}`}>
            {t.label}
            {t.count > 0 && <span className={`text-[9px] font-bold w-4 h-4 flex items-center justify-center ${activeTab === t.key ? 'bg-[#c9a96e] text-[#0a1628]' : 'bg-[#0a1628] text-white'}`}>{t.count}</span>}
          </button>
        ))}
      </div>
      {activeTab === 'passeios' && (
        bookings.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-gray-200 rounded-[24px] py-16 text-center">
            <div className="text-5xl mb-4">⛵</div>
            <p className="font-black text-gray-300 uppercase italic">Nenhuma reserva ainda</p>
            <p className="text-xs text-gray-400 font-bold mt-1">Explore os passeios disponíveis!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map(b => <BookingCard key={b.id} b={b} onRefresh={onRefresh} />)}
          </div>
        )
      )}
      {activeTab === 'eventos' && (
        eventBookings.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-gray-200 rounded-[24px] py-16 text-center">
            <div className="text-5xl mb-4">🎟️</div>
            <p className="font-black text-gray-300 uppercase italic">Nenhum bilhete de evento</p>
            <p className="text-xs text-gray-400 font-bold mt-1">Explore os eventos na aba Eventos!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {eventBookings.map(b => {
              const isPast = b.event_date ? new Date((b.event_date + 'T' + (b.event_time || '23:59'))) < new Date() : false;
              const statusLabel = b.status === 'cancelled' ? 'Cancelado' : isPast ? 'Concluído' : 'Confirmado';
              const statusCls = b.status === 'cancelled' ? 'bg-red-100 text-red-600' : isPast ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700';
              return (
                <div key={b.id} className="bg-white border-2 border-gray-100 rounded-[20px] p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center text-lg flex-shrink-0">🎟️</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-blue-900 text-sm truncate">{b.event_title}</p>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${statusCls}`}>{statusLabel}</span>
                    </div>
                    <span className="text-sm font-black text-blue-900 flex-shrink-0">
                      {new Intl.NumberFormat('pt-PT', { style:'currency', currency:'EUR' }).format(b.total_price || 0)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {([['Nº Bilhete', b.booking_number], ['Bilhetes', `${b.tickets} bilhete${b.tickets > 1 ? 's' : ''}`], ['Local', b.event_local], ['Data', new Date(b.event_date + 'T12:00').toLocaleDateString('pt-PT')]] as [string,string][]).map(([l,v]) => (
                      <div key={l} className="bg-gray-50 rounded-[12px] px-3 py-2.5">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">{l}</p>
                        <p className="text-sm font-black text-blue-900 mt-0.5 truncate">{v}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}
