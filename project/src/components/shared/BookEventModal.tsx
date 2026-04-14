// src/components/shared/BookEventModal.tsx
import { useState } from 'react';
import { MapPin, Users, Ticket, AlertCircle, Check, X } from 'lucide-react';
import { saveEventBooking, sendSystemMessage, type NauticEvent, type EventBooking } from '../../lib/localStore';
import { fmtDate, fmtCurrency } from './EventosMuralShared';

interface Props {
  ev:          NauticEvent;
  clientId?:   string;
  clientName?: string;
  clientPhone?: string;
  onClose:     () => void;
  onSuccess:   (b: EventBooking) => void;
}

export function BookEventModal({ ev, clientId, clientName, clientPhone, onClose, onSuccess }: Props) {
  const hasProfile = !!(clientName && clientPhone);
  const [name,    setName]    = useState(clientName || '');
  const [phone,   setPhone]   = useState(clientPhone || '');
  const [tickets, setTickets] = useState(1);
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const preco  = ev.preco || 0;
  const total  = preco * tickets;
  const isFree = preco === 0;

  function validate() {
    if (!name.trim())  { setError('O seu nome é obrigatório.'); return false; }
    if (!phone.trim()) { setError('O contacto é obrigatório.'); return false; }
    if (tickets < 1)   { setError('Mínimo 1 bilhete.'); return false; }
    if (tickets > ev.vagas) { setError(`Máximo ${ev.vagas} vagas disponíveis.`); return false; }
    return true;
  }

  async function handleConfirm() {
    if (!validate()) return;
    setLoading(true);
    try {
      const booking = await saveEventBooking({
        event_id:       ev.id,
        event_title:    ev.title,
        event_date:     ev.date,
        event_time:     ev.time,
        event_local:    ev.local,
        event_city:     ev.cidade,
        company_id:     ev.company_id,
        company_name:   ev.company_name,
        client_id:      clientId,
        customer_name:  name.trim(),
        customer_phone: phone.trim(),
        tickets,
        total_price:    total,
        guests:         [],
        status:         'confirmed',
      });

      if (clientId) {
        sendSystemMessage({
          client_id: clientId,
          type:      'booking_confirmed',
          title:     `🎟️ Bilhete Confirmado — ${ev.title}`,
          body:      `O seu bilhete para *${ev.title}* foi confirmado!\n\n📅 ${fmtDate(ev.date)} às ${ev.time}\n📍 ${ev.local}, ${ev.cidade}\n👥 ${tickets} pessoa${tickets > 1 ? 's' : ''}\n💶 ${isFree ? 'Gratuito' : fmtCurrency(total)}\n\n🎟️ Número do bilhete: *${booking.booking_number}*\n\nAté breve! ⚓`,
          meta: {
            booking_id:   booking.id,
            trip_name:    ev.title,
            booking_date: ev.date,
            passengers:   tickets,
          },
        });
      }

      onSuccess(booking);
    } catch {
      setError('Erro ao processar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[240] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">

        <div className="bg-gradient-to-br from-[#0a1628] to-[#1a2b4a] px-6 py-5 flex-shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em] mb-0.5">Reservar Bilhete</p>
              <h3 className="text-base font-['Playfair_Display'] font-bold text-white leading-tight line-clamp-2">{ev.title}</h3>
              <p className="text-[#c9a96e] text-xs font-bold mt-1">{fmtDate(ev.date)} às {ev.time}</p>
            </div>
            <button onClick={onClose} className="bg-white/10 p-2 rounded-full text-white hover:bg-white/20 transition-all flex-shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">

          {error && (
            <div className="bg-red-50 border-2 border-red-100 px-4 py-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-red-700 font-bold text-xs">{error}</p>
            </div>
          )}

          <div className="bg-[#0a1628]/5 px-4 py-3 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
              <MapPin className="w-3.5 h-3.5 text-[#c9a96e] flex-shrink-0" />
              <span className="truncate">{ev.local} — {ev.cidade}</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
              <Ticket className="w-3.5 h-3.5 text-[#c9a96e] flex-shrink-0" />
              <span>{isFree ? 'Gratuito' : `${fmtCurrency(preco)} / pessoa`}</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
              <Users className="w-3.5 h-3.5 text-[#c9a96e] flex-shrink-0" />
              <span>{ev.vagas} vagas disponíveis</span>
            </div>
          </div>

          {hasProfile && (
            <div className="bg-green-50 border-2 border-green-100 px-4 py-2.5 flex items-center gap-2">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Check className="w-3.5 h-3.5 text-white" />
              </div>
              <p className="text-xs font-bold text-green-700">Dados preenchidos automaticamente do seu perfil</p>
            </div>
          )}

          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between ml-1 mb-1.5">
                <label className="text-[10px] font-bold text-[#1a2b4a] uppercase tracking-wider">Nome *</label>
                {hasProfile && <span className="text-[9px] font-bold text-green-600 uppercase tracking-wider">✓ Do perfil</span>}
              </div>
              <input value={name} onChange={e => { setName(e.target.value); setError(''); }}
                placeholder="O seu nome completo"
                className={`w-full border-2 py-3 px-4 text-sm font-bold text-[#1a2b4a] focus:border-[#c9a96e] outline-none transition-all ${hasProfile && name === clientName ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-100'}`} />
            </div>
            <div>
              <div className="flex items-center justify-between ml-1 mb-1.5">
                <label className="text-[10px] font-bold text-[#1a2b4a] uppercase tracking-wider">Contacto *</label>
                {hasProfile && <span className="text-[9px] font-bold text-green-600 uppercase tracking-wider">✓ Do perfil</span>}
              </div>
              <input value={phone} onChange={e => { setPhone(e.target.value); setError(''); }}
                placeholder="+351 912 345 678"
                className={`w-full border-2 py-3 px-4 text-sm font-bold text-[#1a2b4a] focus:border-[#c9a96e] outline-none transition-all ${hasProfile && phone === clientPhone ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-100'}`} />
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#1a2b4a] uppercase tracking-wider ml-1 mb-1.5 block">Nº de Bilhetes</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setTickets(t => Math.max(1, t - 1))}
                  className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full font-bold text-lg text-[#1a2b4a] flex items-center justify-center transition-all"
                >−</button>
                <span className="flex-1 text-center text-2xl font-bold text-[#1a2b4a]">{tickets}</span>
                <button
                  onClick={() => setTickets(t => Math.min(ev.vagas, t + 1))}
                  className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full font-bold text-lg text-[#1a2b4a] flex items-center justify-center transition-all"
                >+</button>
              </div>
              {tickets > 1 && (
                <p className="text-[10px] font-bold text-[#1a2b4a] text-center mt-1.5">
                  💡 Pode adicionar os convidados ao bilhete após a compra
                </p>
              )}
            </div>
          </div>

          {!isFree && (
            <div className="bg-gradient-to-r from-[#0a1628] to-[#1a2b4a] px-5 py-4 flex items-center justify-between text-white">
              <div>
                <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em]">Total a pagar</p>
                <p className="text-2xl font-bold">{fmtCurrency(total)}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-[#c9a96e]">{tickets} × {fmtCurrency(preco)}</p>
              </div>
            </div>
          )}

          {isFree && (
            <div className="bg-green-50 border-2 border-green-100 px-4 py-3 text-center">
              <p className="text-green-700 font-bold text-sm">🎉 Evento Gratuito!</p>
              <p className="text-green-600 font-bold text-xs mt-0.5">Apenas confirme a sua presença.</p>
            </div>
          )}
        </div>

        <div className="px-6 pb-6 pt-2 flex-shrink-0">
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="w-full bg-[#0a1628] hover:bg-[#1a2b4a] disabled:opacity-50 text-white py-4 font-bold text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-xl"
          >
            {loading
              ? <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
              : <><Ticket className="w-4 h-4" /> {isFree ? 'Confirmar Presença' : 'Comprar Bilhete'}</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}
