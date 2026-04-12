// src/components/admin/tabs/BookingDetailModal.tsx
import { X, Calendar, Clock, Users, User, Phone, FileText } from 'lucide-react';
import { type Booking } from '../../../lib/localStore';
import { fmt } from '../../shared/adminHelpers';
import { STATUS_CLASSES, getTripData } from './ReservasTabShared';

export function BookingDetailModal({ booking, onClose }: { booking: Booking; onClose: () => void }) {
  const tripData = getTripData(booking.trip_id);

  const fmtDate = (d?: string) =>
    d ? new Date(d + 'T12:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }) : '—';

  const statusLabel: Record<string, string> = {
    pending: 'Aguardando', confirmed: 'Confirmada', cancelado: 'Cancelada',
    completed: 'Concluída', concluido: 'Concluída',
  };
  const statusCls = STATUS_CLASSES[booking.status] || 'bg-gray-100 text-gray-500 border-gray-200';

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-blue-900/60 backdrop-blur-md"
      onClick={onClose}>
      <div className="bg-white w-full max-w-md rounded-[36px] shadow-2xl border-4 border-blue-900 overflow-hidden"
        onClick={e => e.stopPropagation()}>

        <div className="bg-blue-900 px-7 py-5 flex items-center justify-between">
          <div>
            <p className="text-blue-300 text-[10px] font-black uppercase tracking-widest">Detalhe da Reserva</p>
            <h3 className="text-xl font-black text-white uppercase italic truncate max-w-[260px]">
              {tripData?.boat_name || 'Passeio'}
            </h3>
            <p className="text-blue-300 text-xs font-bold mt-0.5">
              Reserva #{booking.booking_number || booking.id.slice(0, 6).toUpperCase()}
            </p>
          </div>
          <button onClick={onClose}
            className="w-9 h-9 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

          <div className="flex justify-center">
            <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase border-2 ${statusCls}`}>
              {statusLabel[booking.status] || booking.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 border-2 border-blue-100 rounded-[18px] p-4">
              <div className="flex items-center gap-1.5 mb-1">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                <p className="text-[9px] font-black text-blue-400 uppercase">Data</p>
              </div>
              <p className="font-black text-blue-900 text-sm leading-snug">{fmtDate(booking.booking_date)}</p>
            </div>
            <div className="bg-blue-50 border-2 border-blue-100 rounded-[18px] p-4">
              <div className="flex items-center gap-1.5 mb-1">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <p className="text-[9px] font-black text-blue-400 uppercase">Horário</p>
              </div>
              <p className="font-black text-blue-900 text-xl">{booking.time_slot || '—'}</p>
            </div>
          </div>

          <div className="bg-gray-50 border-2 border-gray-100 rounded-[18px] p-4 space-y-2">
            <div className="flex items-center gap-1.5 mb-2">
              <User className="w-3.5 h-3.5 text-gray-400" />
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Responsável pela Reserva</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-blue-900 flex items-center justify-center text-white font-black text-xs flex-shrink-0">
                {booking.customer_name?.substring(0, 2).toUpperCase() || '—'}
              </div>
              <div>
                <p className="font-black text-blue-900 text-sm">{booking.customer_name || '—'}</p>
                {booking.customer_phone && (
                  <p className="text-xs text-gray-400 font-bold flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {booking.customer_phone}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 border-2 border-gray-100 rounded-[18px] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-gray-400" />
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Passageiros</p>
              </div>
              <span className="bg-blue-900 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full">
                {booking.passengers} pessoa{booking.passengers !== 1 ? 's' : ''}
              </span>
            </div>

            {booking.guests && booking.guests.length > 0 ? (
              <div className="space-y-2">
                {booking.guests.map((g, i) => (
                  <div key={i} className="flex items-center gap-2 bg-white rounded-[12px] px-3 py-2.5">
                    <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-900 font-black text-[10px] flex-shrink-0">
                      {(g.name || g.email)?.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-black text-blue-900 text-xs truncate">{g.name || '—'}</p>
                      <p className="text-[10px] text-gray-400 font-bold truncate">{g.email}</p>
                      {g.profile_number && (
                        <p className="text-[9px] text-blue-400 font-black">Perfil #{g.profile_number}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-gray-400 font-bold text-center py-1">
                {booking.passengers} passageiro{booking.passengers !== 1 ? 's' : ''} — nomes não especificados
              </p>
            )}

            {booking.guests_obs && (
              <div className="bg-amber-50 border border-amber-100 rounded-[12px] px-3 py-2">
                <p className="text-[9px] font-black text-amber-700 uppercase mb-0.5">Observações</p>
                <p className="text-xs font-bold text-amber-800">{booking.guests_obs}</p>
              </div>
            )}
          </div>

          {booking.notes && (
            <div className="bg-gray-50 border-2 border-gray-100 rounded-[18px] p-4">
              <div className="flex items-center gap-1.5 mb-1">
                <FileText className="w-3.5 h-3.5 text-gray-400" />
                <p className="text-[10px] font-black text-gray-400 uppercase">Notas</p>
              </div>
              <p className="text-sm font-bold text-blue-900 leading-relaxed">{booking.notes}</p>
            </div>
          )}

          <div className="bg-blue-900 rounded-[18px] p-4 flex items-center justify-between">
            <p className="text-blue-300 text-xs font-black uppercase">Total da Reserva</p>
            <p className="text-white font-black text-xl">{fmt(booking.total_price)}</p>
          </div>

          <button onClick={onClose}
            className="w-full border-2 border-gray-100 text-gray-400 py-4 rounded-[25px] font-black uppercase text-sm hover:border-blue-900 hover:text-blue-900 transition-all">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
