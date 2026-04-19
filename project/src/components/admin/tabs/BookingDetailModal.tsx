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
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-[#0a1628]/60 backdrop-blur-md"
      onClick={onClose}>
      <div className="bg-white w-full max-w-md shadow-2xl border-4 border-[#0a1628] overflow-hidden"
        onClick={e => e.stopPropagation()}>

        <div className="bg-[#0a1628] px-7 py-5 flex items-center justify-between">
          <div>
            <p className="text-[#c9a96e] text-[10px] font-semibold uppercase tracking-[0.15em]">Detalhe da Reserva</p>
            <h3 className="font-['Playfair_Display'] font-bold text-xl text-white uppercase truncate max-w-[260px]">
              {tripData?.boat_name || 'Passeio'}
            </h3>
            <p className="text-[#c9a96e] text-xs font-bold mt-0.5">
              Reserva #{booking.booking_number || booking.id.slice(0, 6).toUpperCase()}
            </p>
          </div>
          <button onClick={onClose}
            className="w-9 h-9 bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

          <div className="flex justify-center">
            <span className={`px-4 py-1.5 text-xs font-semibold uppercase border-2 ${statusCls}`}>
              {statusLabel[booking.status] || booking.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#0a1628]/5 border-2 border-[#c9a96e]/20 p-4">
              <div className="flex items-center gap-1.5 mb-1">
                <Calendar className="w-3.5 h-3.5 text-[#c9a96e]" />
                <p className="text-[9px] font-semibold text-[#c9a96e] uppercase">Data</p>
              </div>
              <p className="font-bold text-[#1a2b4a] text-sm leading-snug">{fmtDate(booking.booking_date)}</p>
            </div>
            <div className="bg-[#0a1628]/5 border-2 border-[#c9a96e]/20 p-4">
              <div className="flex items-center gap-1.5 mb-1">
                <Clock className="w-3.5 h-3.5 text-[#c9a96e]" />
                <p className="text-[9px] font-semibold text-[#c9a96e] uppercase">Horário</p>
              </div>
              <p className="font-bold text-[#1a2b4a] text-xl">{booking.time_slot || '—'}</p>
            </div>
          </div>

          <div className="bg-gray-50 border-2 border-gray-100 p-4 space-y-2">
            <div className="flex items-center gap-1.5 mb-2">
              <User className="w-3.5 h-3.5 text-gray-400" />
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.15em]">Responsável pela Reserva</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-[#0a1628] flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                {booking.customer_name?.substring(0, 2).toUpperCase() || '—'}
              </div>
              <div>
                <p className="font-bold text-[#1a2b4a] text-sm">{booking.customer_name || '—'}</p>
                {booking.customer_phone && (
                  <p className="text-xs text-gray-400 font-bold flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {booking.customer_phone}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 border-2 border-gray-100 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-gray-400" />
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.15em]">Passageiros</p>
              </div>
              <span className="bg-[#0a1628] text-white text-[10px] font-semibold px-2.5 py-0.5">
                {booking.passengers} pessoa{booking.passengers !== 1 ? 's' : ''}
              </span>
            </div>

            {booking.guests && booking.guests.length > 0 ? (
              <div className="space-y-2">
                {booking.guests.map((g, i) => (
                  <div key={i} className="flex items-center gap-2 bg-white px-3 py-2.5">
                    <div className="w-7 h-7 bg-[#0a1628]/5 flex items-center justify-center text-[#1a2b4a] font-bold text-[10px] flex-shrink-0">
                      {(g.name || g.email)?.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-[#1a2b4a] text-xs truncate">{g.name || '—'}</p>
                      <p className="text-[10px] text-gray-400 font-bold truncate">{g.email}</p>
                      {g.profile_number && (
                        <p className="text-[9px] text-[#c9a96e] font-semibold">Perfil #{g.profile_number}</p>
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
              <div className="bg-[#c9a96e]/5 border border-[#c9a96e]/20 px-3 py-2">
                <p className="text-[9px] font-semibold text-[#1a2b4a] uppercase mb-0.5">Observações</p>
                <p className="text-xs font-bold text-[#1a2b4a]">{booking.guests_obs}</p>
              </div>
            )}
          </div>

          {booking.notes && (
            <div className="bg-gray-50 border-2 border-gray-100 p-4">
              <div className="flex items-center gap-1.5 mb-1">
                <FileText className="w-3.5 h-3.5 text-gray-400" />
                <p className="text-[10px] font-semibold text-gray-400 uppercase">Notas</p>
              </div>
              <p className="text-sm font-bold text-[#1a2b4a] leading-relaxed">{booking.notes}</p>
            </div>
          )}

          {booking.status === 'cancelado' && (
            <div className="bg-red-50 border-2 border-red-100 p-4 space-y-3">
              <div>
                <p className="text-[9px] font-semibold text-red-400 uppercase tracking-[0.15em] mb-1">⚠️ Motivo do Cancelamento</p>
                <p className="font-bold text-red-800 text-sm">
                  {(booking as any).cancel_reason || 'Não informado'}
                </p>
              </div>
              {booking.customer_phone && (
                <a
                  href={`https://wa.me/${booking.customer_phone.replace(/\D/g, '')}?text=${encodeURIComponent('Olá ' + (booking.customer_name || '') + '! Entramos em contacto sobre o cancelamento da sua reserva na NorthWindy.')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 text-white py-2.5 font-semibold text-xs uppercase transition-all"
                >
                  📲 WhatsApp — {booking.customer_phone}
                </a>
              )}
            </div>
          )}

          <div className="bg-[#0a1628] p-4 flex items-center justify-between">
            <p className="text-[#c9a96e] text-xs font-semibold uppercase">Total da Reserva</p>
            <p className="text-white font-bold text-xl">{fmt(booking.total_price)}</p>
          </div>

          <button onClick={onClose}
            className="w-full border-2 border-gray-200 text-gray-400 py-4 font-semibold uppercase text-sm hover:border-[#c9a96e] hover:text-[#1a2b4a] transition-all">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
