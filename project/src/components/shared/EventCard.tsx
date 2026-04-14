// src/components/shared/EventCard.tsx
import { useState } from 'react';
import {
  CalendarDays, MapPin, Users, Ticket,
  ChevronDown, ChevronUp,
} from 'lucide-react';
import { type NauticEvent, type EventBooking } from '../../lib/localStore';
import { fmtDate, fmtCurrency, daysUntil, TIPO_EMOJI, TIPO_COLOR } from './EventosMuralShared';
import { PhotoAlbum } from './EventosLightbox';
import { TicketModal, AddGuestModal } from './EventosTicketModals';
import { BookEventModal } from './BookEventModal';

interface Props {
  ev:           NauticEvent;
  clientId?:    string;
  clientName?:  string;
  clientPhone?: string;
}

export function EventCard({ ev, clientId, clientName, clientPhone }: Props) {
  const [expanded,     setExpanded]     = useState(false);
  const [showBooking,  setShowBooking]  = useState(false);
  const [activeTicket, setActiveTicket] = useState<EventBooking | null>(null);
  const [addGuestFor,  setAddGuestFor]  = useState<EventBooking | null>(null);

  const days    = daysUntil(ev.date);
  const emoji   = ev.cover_emoji || TIPO_EMOJI[ev.tipo] || '📌';
  const tipoCls = TIPO_COLOR[ev.tipo] || TIPO_COLOR.Outro;
  const photos  = ev.photos && ev.photos.length > 0 ? ev.photos : [];

  const urgencyBadge = days === 0
    ? { cls: 'bg-red-100 text-red-700',       label: '🔴 Hoje!' }
    : days === 1
    ? { cls: 'bg-orange-100 text-orange-700', label: '🟠 Amanhã' }
    : days <= 7
    ? { cls: 'bg-amber-100 text-amber-700',   label: `🟡 Em ${days} dias` }
    : null;

  function handleGuestSaved(updated: EventBooking) {
    setAddGuestFor(null);
    setActiveTicket(updated);
  }

  return (
    <>
      <div className="bg-white border-2 border-gray-100 overflow-hidden hover:border-[#c9a96e]/30 transition-all group">

        <div className="relative">
          {photos.length > 0 ? (
            <div className="px-3 pt-3">
              <PhotoAlbum photos={photos} emoji={emoji} />
            </div>
          ) : (
            <div className="bg-gradient-to-r from-[#0a1628] to-[#1a2b4a] px-5 py-4 flex items-start gap-4">
              <div className="w-12 h-12 bg-white/20 flex items-center justify-center flex-shrink-0 text-2xl">
                {emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${tipoCls}`}>{ev.tipo}</span>
                  {urgencyBadge && (
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${urgencyBadge.cls}`}>{urgencyBadge.label}</span>
                  )}
                </div>
                <p className="font-bold text-white text-sm leading-tight line-clamp-2">{ev.title}</p>
                <p className="text-[#c9a96e] text-[11px] font-bold mt-0.5 truncate">{ev.company_name}</p>
              </div>
            </div>
          )}

          {photos.length > 0 && (
            <div className="absolute top-5 left-5 flex flex-wrap gap-1.5 pointer-events-none">
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border backdrop-blur-sm bg-white/80 ${tipoCls}`}>{ev.tipo}</span>
              {urgencyBadge && (
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${urgencyBadge.cls} backdrop-blur-sm`}>{urgencyBadge.label}</span>
              )}
            </div>
          )}
        </div>

        <div className="px-5 py-4 space-y-3">

          {photos.length > 0 && (
            <div>
              <p className="font-bold text-[#1a2b4a] text-sm leading-tight">{ev.title}</p>
              <p className="text-gray-400 text-[11px] font-bold mt-0.5 truncate">{ev.company_name}</p>
            </div>
          )}

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
              <CalendarDays className="w-3.5 h-3.5 text-[#c9a96e] flex-shrink-0" />
              <span>{fmtDate(ev.date)} às {ev.time}</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
              <MapPin className="w-3.5 h-3.5 text-[#c9a96e] flex-shrink-0" />
              <span className="truncate">{ev.local} — {ev.cidade}</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
              <Users className="w-3.5 h-3.5 text-[#c9a96e] flex-shrink-0" />
              <span>{ev.vagas} vagas</span>
            </div>
            {ev.preco !== undefined && (
              <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
                <Ticket className="w-3.5 h-3.5 text-[#c9a96e] flex-shrink-0" />
                <span className="font-bold text-[#1a2b4a]">
                  {ev.preco === 0 ? '🎉 Gratuito' : fmtCurrency(ev.preco) + ' / pessoa'}
                </span>
              </div>
            )}
          </div>

          {ev.description && (
            <>
              <button onClick={() => setExpanded(v => !v)}
                className="flex items-center gap-1 text-[11px] font-bold text-[#1a2b4a] hover:text-[#0a1628] transition-colors">
                {expanded ? <><ChevronUp className="w-3 h-3" /> Ocultar detalhes</> : <><ChevronDown className="w-3 h-3" /> Ver detalhes</>}
              </button>
              {expanded && (
                <p className="text-xs font-bold text-gray-600 leading-relaxed bg-gray-50 px-3 py-2.5">
                  {ev.description}
                </p>
              )}
            </>
          )}

          <button
            onClick={() => setShowBooking(true)}
            className="w-full bg-[#0a1628] hover:bg-[#1a2b4a] active:scale-[0.98] text-white py-3.5 font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-md"
          >
            <Ticket className="w-4 h-4" />
            {ev.preco === 0 ? 'Confirmar Presença' : 'Reservar Bilhete'}
          </button>
        </div>
      </div>

      {showBooking && (
        <BookEventModal
          ev={ev}
          clientId={clientId}
          clientName={clientName}
          clientPhone={clientPhone}
          onClose={() => setShowBooking(false)}
          onSuccess={booking => {
            setShowBooking(false);
            setActiveTicket(booking);
          }}
        />
      )}

      {activeTicket && (
        <TicketModal
          booking={activeTicket}
          event={ev}
          onClose={() => setActiveTicket(null)}
          onAddGuest={b => { setActiveTicket(null); setAddGuestFor(b); }}
        />
      )}

      {addGuestFor && (
        <AddGuestModal
          booking={addGuestFor}
          onSave={handleGuestSaved}
          onClose={() => { setAddGuestFor(null); setActiveTicket(addGuestFor); }}
        />
      )}
    </>
  );
}
