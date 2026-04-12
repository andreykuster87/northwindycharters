// src/components/shared/EventosTicketModals.tsx
import { useState } from 'react';
import {
  CalendarDays, MapPin, Users, Ticket,
  X, Check, Plus, Trash2, UserPlus,
} from 'lucide-react';
import { updateEventBookingGuests, type NauticEvent, type EventBooking, type EventGuest } from '../../lib/localStore';
import { fmtDate, fmtCurrency } from './EventosMuralShared';

// ── Modal de Bilhete (confirmação pós-compra) ─────────────────────────────────

export function TicketModal({
  booking,
  event,
  onClose,
  onAddGuest,
}: {
  booking: EventBooking;
  event: NauticEvent;
  onClose: () => void;
  onAddGuest: (b: EventBooking) => void;
}) {
  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-sm rounded-[28px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">

        {/* Topo verde sucesso */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 px-6 pt-8 pb-6 text-center text-white">
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <Check className="w-7 h-7 text-white" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-green-100 mb-1">Reserva Confirmada!</p>
          <h2 className="text-xl font-black uppercase italic leading-tight">{event.title}</h2>
          <p className="text-green-100 text-xs font-bold mt-1">{booking.booking_number}</p>
        </div>

        {/* Corpo do bilhete — estilo perfurado */}
        <div className="relative">
          <div className="flex items-center px-4">
            <div className="w-5 h-5 bg-gray-100 rounded-full -ml-2.5 flex-shrink-0" />
            <div className="flex-1 border-t-2 border-dashed border-gray-200 mx-1" />
            <div className="w-5 h-5 bg-gray-100 rounded-full -mr-2.5 flex-shrink-0" />
          </div>

          <div className="px-6 py-5 space-y-3">
            {[
              { icon: CalendarDays, label: 'Data', value: `${fmtDate(event.date)} às ${event.time}` },
              { icon: MapPin,       label: 'Local', value: `${event.local} — ${event.cidade}` },
              { icon: Users,        label: 'Bilhetes', value: `${booking.tickets} pessoa${booking.tickets > 1 ? 's' : ''}` },
              { icon: Ticket,       label: 'Total', value: fmtCurrency(booking.total_price) },
            ].map(r => (
              <div key={r.label} className="flex items-center gap-3">
                <div className="w-7 h-7 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                  <r.icon className="w-3.5 h-3.5 text-blue-500" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">{r.label}</p>
                  <p className="text-sm font-black text-blue-900 leading-tight">{r.value}</p>
                </div>
              </div>
            ))}

            {booking.guests.length > 0 && (
              <div className="bg-blue-50 rounded-[14px] px-4 py-3 space-y-1.5">
                <p className="text-[9px] font-black text-blue-700 uppercase tracking-wider">Convidados</p>
                {booking.guests.map((g, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 text-[9px] font-black text-blue-800">
                      {g.name.charAt(0).toUpperCase()}
                    </div>
                    <p className="text-xs font-bold text-blue-900">{g.name}{g.doc ? ` · ${g.doc}` : ''}</p>
                  </div>
                ))}
              </div>
            )}

            {booking.tickets > 1 && booking.guests.length < booking.tickets - 1 && (
              <button
                onClick={() => onAddGuest(booking)}
                className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-blue-200 hover:border-blue-400 text-blue-500 hover:text-blue-700 py-3 rounded-[14px] font-black text-xs uppercase transition-all"
              >
                <UserPlus className="w-4 h-4" /> Adicionar Convidado ao Bilhete
              </button>
            )}
          </div>
        </div>

        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className="w-full bg-blue-900 hover:bg-blue-800 text-white py-3.5 rounded-[16px] font-black text-sm uppercase tracking-widest transition-all"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Modal de Adicionar Convidado ───────────────────────────────────────────────

export function AddGuestModal({
  booking,
  onSave,
  onClose,
}: {
  booking: EventBooking;
  onSave: (b: EventBooking) => void;
  onClose: () => void;
}) {
  const available = booking.tickets - 1 - booking.guests.length;
  const [guests, setGuests] = useState<EventGuest[]>([...booking.guests]);
  const [name, setName]     = useState('');
  const [doc,  setDoc]      = useState('');

  function addGuest() {
    if (!name.trim()) return;
    if (guests.length >= booking.tickets - 1) return;
    setGuests(p => [...p, { name: name.trim(), doc: doc.trim() || undefined }]);
    setName(''); setDoc('');
  }

  function removeGuest(i: number) {
    setGuests(p => p.filter((_, idx) => idx !== i));
  }

  function save() {
    updateEventBookingGuests(booking.id, guests);
    onSave({ ...booking, guests });
  }

  return (
    <div className="fixed inset-0 z-[260] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-sm rounded-[28px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="bg-blue-900 px-6 py-5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest">Bilhete {booking.booking_number}</p>
            <h3 className="text-base font-black text-white uppercase italic">Convidados</h3>
          </div>
          <button onClick={onClose} className="bg-blue-800 p-2 rounded-full text-white hover:bg-blue-700 transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-xs font-bold text-gray-500">
            Pode adicionar até <span className="font-black text-blue-900">{available}</span> convidado{available !== 1 ? 's' : ''} neste bilhete.
          </p>

          {guests.length > 0 && (
            <div className="space-y-2">
              {guests.map((g, i) => (
                <div key={i} className="flex items-center gap-3 bg-blue-50 rounded-[12px] px-3 py-2.5">
                  <div className="w-8 h-8 bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0 font-black text-white text-xs">
                    {g.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-blue-900 truncate">{g.name}</p>
                    {g.doc && <p className="text-[10px] font-bold text-gray-400 truncate">{g.doc}</p>}
                  </div>
                  <button onClick={() => removeGuest(i)} className="text-red-400 hover:text-red-600 transition-colors flex-shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {guests.length < booking.tickets - 1 && (
            <div className="bg-gray-50 border-2 border-gray-100 rounded-[16px] p-4 space-y-3">
              <p className="text-[10px] font-black text-blue-900 uppercase tracking-wider">Novo Convidado</p>
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider ml-1 mb-1 block">Nome *</label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addGuest()}
                  placeholder="Nome do convidado"
                  className="w-full bg-white border-2 border-gray-100 rounded-[12px] py-2.5 px-3 text-sm font-bold text-blue-900 focus:border-blue-900 outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider ml-1 mb-1 block">Doc. de Identidade (opcional)</label>
                <input
                  value={doc}
                  onChange={e => setDoc(e.target.value)}
                  placeholder="Ex: CC 12345678"
                  className="w-full bg-white border-2 border-gray-100 rounded-[12px] py-2.5 px-3 text-sm font-bold text-blue-900 focus:border-blue-900 outline-none"
                />
              </div>
              <button
                onClick={addGuest}
                disabled={!name.trim()}
                className="w-full flex items-center justify-center gap-2 bg-blue-900 hover:bg-blue-800 disabled:opacity-40 text-white py-2.5 rounded-[12px] font-black text-xs uppercase transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar
              </button>
            </div>
          )}

          <button
            onClick={save}
            className="w-full bg-green-500 hover:bg-green-400 text-white py-3.5 rounded-[16px] font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            <Check className="w-4 h-4" /> Guardar Convidados
          </button>
        </div>
      </div>
    </div>
  );
}
