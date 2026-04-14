// src/components/AdminDashboard/tabs/ReservasTab.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Aba de reservas — KPIs, reservas pendentes e histórico completo.
// Inclui reservas de eventos (bilhetes).
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from 'react';
import { XCircle, X, Calendar, Clock, Users, User, Hash, Phone, FileText, Ticket } from 'lucide-react';
import { usePagination } from '../../../hooks/usePagination';
import { Pagination }    from '../../shared/Pagination';
import {
  getAllTrips,
  getBookings,
  deleteBooking,
  updateBookingStatus,
  notifyBookingStatusChange,

  type Booking,
  type Boat,
  type Trip,

} from '../../../lib/localStore';
import { fmt } from '../../shared/adminHelpers';
import { STATUS_CLASSES, getTripData, getClientId } from './ReservasTabShared';
import { BookingDetailModal } from './BookingDetailModal';
import { EventBookingsSection } from './EventBookingsSection';

// ── Props ─────────────────────────────────────────────────────────────────────

interface ReservasTabProps {
  bookings:      Booking[];
  boats:         Boat[];
  trips:         Trip[];
  role:          'admin' | 'sailor' | null;
  filterBoatId:  string | null;
  onClearFilter: () => void;
  onCancelRequest: (bookingId: string) => void;
  onReload:      () => void;
}


// ── Componente ────────────────────────────────────────────────────────────────

export function ReservasTab({
  bookings,
  boats,
  trips,
  role,
  filterBoatId,
  onClearFilter,
  onCancelRequest,
  onReload,
}: ReservasTabProps) {

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // ── dados derivados ──────────────────────────────────────────────────────

  const filteredTrips    = filterBoatId ? trips.filter(t => t.boat_id === filterBoatId) : null;
  const filteredBoat     = filterBoatId ? boats.find(b => b.id === filterBoatId) : null;
  const allDisplay       = filteredTrips
    ? bookings.filter(b => filteredTrips.some(t => t.id === b.trip_id))
    : bookings;
  const displayBookings  = role === 'admin' ? allDisplay : allDisplay.filter(b => b.status !== 'cancelado');
  const pg = usePagination(displayBookings, 20);
  const pendingBookings  = bookings.filter(b => b.status === 'pending');

  const kpiRevenue = bookings
    .filter(b => ['confirmed', 'completed', 'concluido'].includes(b.status))
    .reduce((s, b) => s + Number(b.total_price), 0);
  const kpiPending = bookings.filter(b => ['pending', 'aguardando'].includes(b.status)).length;

  // ── handlers ────────────────────────────────────────────────────────────

  function handleStatusChange(bookingId: string, newStatus: string) {
    updateBookingStatus(bookingId, newStatus);
    const tripData  = getTripData(bookings.find(b => b.id === bookingId)?.trip_id || '');
    const clientId  = getClientId(bookingId);
    const booking   = bookings.find(b => b.id === bookingId);
    if (clientId && tripData && booking) {
      notifyBookingStatusChange({
        clientId,
        bookingId,
        tripName:    tripData.boat_name,
        bookingDate: booking.booking_date,
        timeSlot:    booking.time_slot,
        passengers:  booking.passengers,
        newStatus,
      });
    }
    onReload();
  }

  function handleQuickConfirm(b: Booking) {
    updateBookingStatus(b.id, 'confirmed');
    const tripData = getTripData(b.trip_id);
    const clientId = getClientId(b.id);
    if (clientId && tripData) {
      notifyBookingStatusChange({
        clientId,
        bookingId:   b.id,
        tripName:    tripData.boat_name,
        bookingDate: b.booking_date,
        timeSlot:    b.time_slot,
        passengers:  b.passengers,
        newStatus:   'confirmed',
      });
    }
    onReload();
  }

  // ── render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* Banner de filtro por embarcação */}
      {filterBoatId && filteredBoat && (() => {
        const filteredBookings = bookings.filter(b =>
          filteredTrips!.some(t => t.id === b.trip_id)
        );
        return (
          <div className="bg-[#0a1628] p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              {filteredBoat.cover_photo
                ? <img src={filteredBoat.cover_photo} alt="" className="w-12 h-12 object-cover flex-shrink-0" />
                : <div className="w-12 h-12 bg-[#1a2b4a] flex items-center justify-center text-xl flex-shrink-0">⛵</div>
              }
              <div className="min-w-0">
                <p className="text-[#c9a96e] text-[10px] font-semibold uppercase">Filtrando por embarcação</p>
                <p className="text-white font-bold truncate">{filteredBoat.name}</p>
                <p className="text-[#c9a96e] text-[10px] font-bold">
                  {filteredBookings.length} reserva{filteredBookings.length !== 1 ? 's' : ''} · {filteredTrips!.length} passeio{filteredTrips!.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <button
              onClick={onClearFilter}
              className="bg-[#1a2b4a] hover:bg-[#c9a96e]/20 text-white px-4 py-2 font-semibold text-xs uppercase transition-all flex-shrink-0 flex items-center gap-1.5"
            >
              <XCircle className="w-3.5 h-3.5" /> Ver todas
            </button>
          </div>
        );
      })()}

      {/* KPIs */}
      {!filterBoatId && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { l: 'Reservas',  v: bookings.length },
            { l: 'Pendentes', v: kpiPending       },
          ].map(({ l, v }) => (
            <div key={l} className="bg-white p-6 border-2 border-[#0a1628]/5 shadow-sm">
              <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em]">{l}</p>
              <p className="text-4xl font-bold text-[#1a2b4a] mt-2">{v}</p>
            </div>
          ))}
        </div>
      )}

      {/* Reservas pendentes de confirmação */}
      {!filterBoatId && pendingBookings.length > 0 && (
        <div className="bg-[#c9a96e]/5 border-2 border-[#c9a96e]/20 p-6 space-y-3">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">⏳</span>
            <h2 className="text-base font-bold text-[#1a2b4a] uppercase">Aguardando sua confirmação</h2>
            <span className="bg-amber-500 text-white text-[10px] font-semibold px-2 py-0.5">
              {pendingBookings.length}
            </span>
          </div>

          {pendingBookings.map(b => {
            const tripData = getTripData(b.trip_id);
            const photo    = tripData?.cover_photo || tripData?.photos?.[0] || '';
            return (
              <div key={b.id} className="bg-white border-2 border-[#c9a96e]/20 overflow-hidden shadow-sm">
                <div className="flex items-stretch">
                  <div className="w-20 flex-shrink-0 bg-[#0a1628] overflow-hidden">
                    {photo
                      ? <img src={photo} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-xl opacity-30">⛵</div>
                    }
                  </div>
                  <div className="flex-1 p-4 min-w-0">
                    <p className="font-bold text-[#1a2b4a] uppercase text-sm truncate">
                      {tripData?.boat_name || 'Passeio'}
                    </p>
                    <p className="text-xs text-gray-500 font-bold">
                      👤 {b.customer_name} · 📱 {b.customer_phone}
                    </p>
                    <p className="text-xs text-gray-400 font-bold">
                      📅 {b.booking_date
                        ? new Date(b.booking_date + 'T12:00').toLocaleDateString('pt-BR')
                        : '—'
                      } · 👥 {b.passengers} pessoa{b.passengers !== 1 ? 's' : ''} · 💰 {fmt(b.total_price)}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1.5 p-3 justify-center">
                    <button
                      onClick={() => handleQuickConfirm(b)}
                      className="bg-green-500 hover:bg-green-400 text-white px-3 py-2 font-semibold text-[10px] uppercase transition-all"
                    >
                      ✓ Confirmar
                    </button>
                    <button
                      onClick={() => onCancelRequest(b.id)}
                      className="bg-red-100 hover:bg-red-200 text-red-600 px-3 py-2 font-semibold text-[10px] uppercase transition-all"
                    >
                      ✗ Recusar
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Histórico de reservas */}
      <div className="bg-white border-2 border-[#0a1628]/5 p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
          <h2 className="font-['Playfair_Display'] font-bold text-xl text-[#1a2b4a] uppercase">
            {filteredBoat ? `Reservas — ${filteredBoat.name}` : 'Histórico de Reservas'}
          </h2>
          <div className="flex items-center gap-2">
            {displayBookings.filter(b => b.status === 'cancelado').length > 0 && role === 'admin' && (
              <button
                onClick={() => {
                  displayBookings.filter(b => b.status === 'cancelado').forEach(b => deleteBooking(b.id));
                  onReload();
                }}
                className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 border-2 border-red-100 text-red-600 px-3 py-1.5 font-semibold text-[10px] uppercase transition-all"
              >
                🗑️ Limpar canceladas ({displayBookings.filter(b => b.status === 'cancelado').length})
              </button>
            )}
            {displayBookings.length > 0 && (
              <span className="bg-[#0a1628]/5 text-[#1a2b4a] text-xs font-semibold px-3 py-1 border-2 border-[#c9a96e]/20">
                {displayBookings.length} reserva{displayBookings.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {displayBookings.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📋</div>
            <p className="text-gray-400 font-semibold uppercase">
              {filteredBoat ? 'Nenhuma reserva para esta embarcação' : 'Nenhuma reserva ainda'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {pg.paged.map(b => {
              const tripData = getTripData(b.trip_id);
              const photo    = tripData?.cover_photo || tripData?.photos?.[0] || '';
              return (
                <div key={b.id}
                  className="flex items-stretch bg-gray-50 overflow-hidden border-2 border-gray-100 cursor-pointer hover:border-[#c9a96e]/30 hover:shadow-sm transition-all group"
                  onClick={() => setSelectedBooking(b)}>
                  <div className="w-16 flex-shrink-0 bg-[#0a1628] overflow-hidden">
                    {photo
                      ? <img src={photo} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-lg opacity-30">⛵</div>
                    }
                  </div>
                  <div className="flex-1 px-4 py-3 min-w-0">
                    <p className="font-bold text-[#1a2b4a] text-sm truncate">
                      {tripData?.boat_name || 'Passeio'}
                    </p>
                    <p className="text-xs text-gray-500 font-bold truncate">
                      👤 {b.customer_name} · 📅 {b.booking_date
                        ? new Date(b.booking_date + 'T12:00').toLocaleDateString('pt-BR')
                        : '—'}
                    </p>
                    <p className="text-xs text-gray-400 font-bold">
                      👥 {b.passengers} · 💰 {fmt(b.total_price)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 pr-4 flex-shrink-0" onClick={e => e.stopPropagation()}>
                    {b.status !== 'cancelado' ? (
                      <select
                        value={b.status}
                        onChange={e => {
                          if (e.target.value === 'cancelado') {
                            onCancelRequest(b.id);
                          } else {
                            handleStatusChange(b.id, e.target.value);
                          }
                        }}
                        className={`px-3 py-1.5 text-[10px] font-semibold uppercase border-2 cursor-pointer outline-none ${STATUS_CLASSES[b.status] || 'bg-gray-100 text-gray-500 border-gray-200'}`}
                      >
                        <option value="pending">Aguardando</option>
                        <option value="confirmed">Confirmada</option>
                        <option value="cancelado">Cancelar</option>
                      </select>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1.5 text-[10px] font-semibold uppercase border-2 bg-red-100 text-red-600 border-red-200">
                          Cancelada
                        </span>
                        {role === 'admin' && (
                          <button
                            onClick={() => { deleteBooking(b.id); onReload(); }}
                            className="bg-red-100 hover:bg-red-500 text-red-500 hover:text-white p-1.5 transition-all border-2 border-red-200 hover:border-red-500"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <Pagination {...pg} onPrev={pg.prev} onNext={pg.next} onPage={pg.setPage} />
      </div>

      {/* ── Reservas de Eventos ── */}
      {!filterBoatId && (
        <EventBookingsSection role={role} />
      )}

      {/* Modal de detalhe da reserva */}
      {selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
        />
      )}
    </div>
  );
}
