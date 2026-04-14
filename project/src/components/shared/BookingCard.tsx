// src/components/ClientArea/components/BookingCard.tsx
import { useState } from 'react';
import {
  ChevronDown, ChevronRight, MapPin, Building2, DoorOpen, Map,
  UserPlus, CheckCircle2, X, Ticket, Users, MessageSquare,
} from 'lucide-react';
import {
  getSailors, getClients, getAllTrips, updateBookingGuests, sendSystemMessage,
  type Booking, type BookingGuest,
} from '../../lib/localStore';
import { fmtBRL } from '../../utils/clientHelpers';

const STATUS_MAP: Record<string, { label: string; cls: string; dot: string }> = {
  pending:         { label: '⏳ Aguardando confirmação', cls: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-400' },
  awaiting_guests: { label: '👥 Aguardando convidados',  cls: 'bg-amber-100 text-amber-700 border-amber-200',   dot: 'bg-amber-400'  },
  confirmed:       { label: '✅ Confirmada',             cls: 'bg-green-100 text-green-700 border-green-200', dot: 'bg-green-500' },
  cancelado:       { label: '❌ Cancelada',              cls: 'bg-red-100 text-red-600 border-red-200',       dot: 'bg-red-500'   },
  completed:       { label: '🌊 Concluída',              cls: 'bg-teal-100 text-teal-700 border-teal-200',    dot: 'bg-teal-500'  },
};

function fmtTicket(n?: number): string {
  if (!n) return '—';
  return '#' + String(n).padStart(5, '0');
}

interface GuestModalProps {
  booking:  Booking;
  tripData: any;
  onClose:  () => void;
  onSaved:  () => void;
}

function GuestModal({ booking, tripData, onClose, onSaved }: GuestModalProps) {
  const maxGuests = booking.passengers - 1;
  const clients   = getClients();

  const init: BookingGuest[] = booking.guests?.length ? [...booking.guests] : [];

  const [guests, setGuests] = useState<BookingGuest[]>(init);
  const [obs,    setObs]    = useState(booking.guests_obs || '');
  const [errors, setErrors] = useState<string[]>([]);
  const [saved,  setSaved]  = useState(false);

  function addGuest() {
    if (guests.length >= maxGuests) return;
    setGuests(prev => [...prev, { profile_number: '', email: '' }]);
  }

  function removeGuest(idx: number) {
    setGuests(prev => prev.filter((_, i) => i !== idx));
  }

  function lookupByEmail(idx: number, email: string) {
    const updated = guests.map((g, i) => i === idx ? { ...g, email, client_id: undefined, name: undefined, profile_number: '' } : g);
    const found = clients.find(c => c.email.toLowerCase() === email.toLowerCase().trim());
    if (found) {
      updated[idx] = {
        ...updated[idx],
        email:          found.email,
        profile_number: found.profile_number,
        name:           found.name,
        client_id:      found.id,
      };
    }
    setGuests(updated);
  }

  function updateName(idx: number, name: string) {
    setGuests(prev => prev.map((g, i) => i === idx ? { ...g, name } : g));
  }

  const hasUnregisteredGuests = guests.some(g => g.email && g.email.includes('@') && !g.client_id);

  async function handleSave() {
    const errs: string[] = [];
    guests.forEach((g, i) => {
      if (g.email && !g.client_id) {
        errs.push('Convidado ' + (i + 1) + ': "' + g.email + '" não está cadastrado no sistema.');
      }
    });
    if (errs.length) { setErrors(errs); return; }
    setErrors([]);

    const validGuests = guests.filter(g => g.client_id);
    await updateBookingGuests(booking.id, validGuests, obs);

    const dateStr  = booking.booking_date ? new Date(booking.booking_date + 'T12:00').toLocaleDateString('pt-BR') : '—';
    const tripName = tripData?.boat_name || 'Passeio';
    const ticket   = fmtTicket(booking.booking_number);

    validGuests.forEach(g => {
      sendSystemMessage({
        client_id: g.client_id!,
        type:      'booking_confirmed',
        title:     '🎟️ Bilhete ' + ticket + ' — ' + tripName,
        body:
          'Olá *' + (g.name || 'convidado') + '*! Você foi adicionado como convidado na reserva *' + ticket + '*.\n\n' +
          '🛥️ *' + tripName + '*\n' +
          '📅 ' + dateStr + (booking.time_slot && booking.time_slot !== '00:00' ? ' · 🕐 ' + booking.time_slot : '') + '\n' +
          '⚓ ' + (tripData?.marina_saida || '') + (tripData?.marina_chegada ? ' → ' + tripData.marina_chegada : '') + '\n' +
          '👥 ' + booking.passengers + ' pessoa' + (booking.passengers !== 1 ? 's' : '') + '\n\nAguarde a confirmação do comandante! ⛵',
        meta: {
          booking_id:   booking.id,
          trip_name:    tripName,
          booking_date: booking.booking_date,
          time_slot:    booking.time_slot,
          passengers:   booking.passengers,
        },
      });
    });

    setSaved(true);
    setTimeout(() => { onSaved(); onClose(); }, 700);
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4 bg-[#0a1628]/60 backdrop-blur-md">
      <div className="bg-white w-full max-w-md max-h-[90vh] flex flex-col shadow-2xl border-4 border-[#0a1628] animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300">

        <div className="flex-shrink-0 bg-[#0a1628] px-6 pt-5 pb-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[#c9a96e] text-[10px] font-semibold uppercase tracking-[0.15em] mb-0.5">
                Bilhete {fmtTicket(booking.booking_number)}
              </p>
              <h2 className="text-lg font-bold text-white uppercase italic">Convidados</h2>
              <p className="text-[#c9a96e] text-xs font-bold mt-0.5">
                {tripData?.boat_name} · {guests.length}/{maxGuests} convidado{maxGuests !== 1 ? 's' : ''}
              </p>
            </div>
            <button onClick={onClose} className="bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-full transition-all">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {errors.length > 0 && (
            <div className="bg-red-50 border-2 border-red-200 px-4 py-3 space-y-1">
              {errors.map((e, i) => (
                <p key={i} className="text-red-700 font-bold text-xs">⚠️ {e}</p>
              ))}
            </div>
          )}

          <p className="text-xs font-bold text-gray-400 leading-relaxed">
            Identifique cada convidado pelo{' '}
            <span className="text-[#1a2b4a] font-semibold">email cadastrado</span>.
            Pode confirmar sem preencher todos.
          </p>

          {guests.length === 0 && (
            <div className="py-6 text-center bg-gray-50 border-2 border-dashed border-gray-200">
              <p className="text-sm font-semibold text-gray-300 uppercase italic">Nenhum convidado adicionado</p>
              <p className="text-xs text-gray-300 font-bold mt-1">Pode confirmar assim ou adicionar abaixo</p>
            </div>
          )}

          {guests.map((g, idx) => (
            <div key={idx} className={'border-2 p-4 space-y-3 transition-all ' + (g.client_id ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-white')}>
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold text-gray-500 uppercase">Convidado {idx + 1}</p>
                <div className="flex items-center gap-2">
                  {g.client_id && (
                    <span className="text-[9px] font-semibold text-green-700 bg-green-100 border border-green-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5" /> Encontrado
                    </span>
                  )}
                  <button onClick={() => removeGuest(idx)}
                    className="w-6 h-6 flex items-center justify-center rounded-full bg-red-50 border border-red-200 text-red-400 hover:bg-red-100 transition-all">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div>
                <p className="text-[9px] font-semibold text-gray-400 uppercase mb-1">Email cadastrado</p>
                <input
                  type="email"
                  placeholder="email@exemplo.com"
                  value={g.email}
                  onChange={e => lookupByEmail(idx, e.target.value)}
                  className={'w-full border-2 px-3 py-2.5 font-bold text-[#1a2b4a] text-sm outline-none transition-all ' +
                    (g.client_id ? 'bg-white border-green-300 focus:border-green-400' : 'bg-white border-gray-200 focus:border-[#c9a96e]')}
                />
              </div>

              {(g.client_id || g.email) && (
                <div>
                  <p className="text-[9px] font-semibold text-gray-400 uppercase mb-1">
                    Nome {g.client_id ? '(preenchido automaticamente)' : ''}
                  </p>
                  <input
                    type="text"
                    placeholder="Nome do convidado"
                    value={g.name || ''}
                    onChange={e => updateName(idx, e.target.value)}
                    className={'w-full border-2 px-3 py-2.5 font-bold text-[#1a2b4a] text-sm outline-none transition-all ' +
                      (g.client_id ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200 focus:border-[#c9a96e]')}
                  />
                </div>
              )}

              {g.client_id && g.profile_number && (
                <div className="flex items-center gap-2 bg-white border border-green-200 px-3 py-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                  <p className="text-xs font-semibold text-green-800">
                    Perfil #{parseInt(g.profile_number, 10)} · {g.email}
                  </p>
                </div>
              )}

              {g.email && !g.client_id && g.email.includes('@') && (
                <div className="bg-red-50 border border-red-200 px-3 py-2 flex items-center gap-2">
                  <span className="text-red-400 text-sm flex-shrink-0">✗</span>
                  <p className="text-xs font-semibold text-red-600">
                    Email não cadastrado — o convidado precisa ter conta no sistema.
                  </p>
                </div>
              )}
            </div>
          ))}

          {guests.length < maxGuests && (
            <button onClick={addGuest}
              className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-[#c9a96e]/30 hover:border-[#0a1628] text-[#1a2b4a] hover:text-[#0a1628] py-3 font-semibold text-sm uppercase transition-all hover:bg-gray-50">
              <UserPlus className="w-4 h-4" />
              {guests.length === 0
                ? '+ Adicionar convidado'
                : '+ Adicionar convidado (' + (guests.length + 1) + '/' + maxGuests + ')'}
            </button>
          )}

          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-gray-400" />
              <p className="text-[10px] font-semibold text-gray-500 uppercase">Observação (opcional)</p>
            </div>
            <textarea
              value={obs}
              rows={2}
              onChange={e => setObs(e.target.value)}
              placeholder="Ex: Vou sozinho, reservei espaço extra."
              className="w-full bg-gray-50 border-2 border-gray-100 focus:border-[#c9a96e] px-4 py-3 font-bold text-[#1a2b4a] text-sm outline-none transition-all resize-none placeholder:text-gray-300"
            />
          </div>
        </div>

        <div className="flex-shrink-0 border-t-2 border-gray-100 px-5 py-4 flex gap-3">
          <button onClick={onClose}
            className="px-5 py-3.5 border-2 border-gray-100 text-gray-400 font-semibold text-sm uppercase hover:border-gray-300 transition-all">
            Cancelar
          </button>
          <button onClick={handleSave} disabled={hasUnregisteredGuests}
            title={hasUnregisteredGuests ? 'Remova ou corrija os emails não cadastrados' : undefined}
            className={'flex-1 py-3.5 font-semibold uppercase text-sm shadow-lg transition-all flex items-center justify-center gap-2 ' +
              (saved ? 'bg-green-500 text-white' : hasUnregisteredGuests ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' : 'bg-[#0a1628] text-white hover:bg-[#0a1628]/90')}>
            <CheckCircle2 className={'w-4 h-4 ' + (saved ? '' : hasUnregisteredGuests ? 'text-gray-300' : 'text-green-400')} />
            {saved ? 'Guardado!' : hasUnregisteredGuests ? 'Corrija os emails' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function BookingCard({ b, onRefresh }: { b: Booking; onRefresh?: () => void }) {
  const [open,      setOpen]      = useState(false);
  const [showGuest, setShowGuest] = useState(false);
  const fmt = fmtBRL;

  const st       = STATUS_MAP[b.status] || { label: b.status, cls: 'bg-gray-100 text-gray-500 border-gray-200', dot: 'bg-gray-400' };
  const tripData = ((b as any).trip || getAllTrips().find((t: any) => t.id === b.trip_id)) as any;
  const photo    = tripData?.cover_photo || tripData?.photos?.[0] || '';

  const bebidasLabel = ({ inclusas: '🍾 Bebidas inclusas', nao_inclusas: '🚫 Sem bebidas', traga: '🎒 Traga sua bebida' } as any)[tripData?.bebidas] || null;
  const comidaLabel  = ({ inclusa: '🍽️ Comida inclusa', nao_inclusa: '🚫 Sem comida' } as any)[tripData?.comida] || null;
  const barLabel     = ({ tem: '🍹 Bar a bordo', nao_tem: '🚫 Sem bar' } as any)[tripData?.bar] || null;

  // ✅ confirmed incluído
  const canAddGuests = ['pending', 'awaiting_guests', 'confirmed'].includes(b.status);
  const guestsFilled = b.guests?.length || 0;
  const guestsNeeded = b.passengers - 1;

  return (
    <div>
      <div className={'bg-white border-2 overflow-hidden transition-all ' + (open ? 'border-[#0a1628] shadow-md' : 'border-gray-100')}>

        <button type="button" onClick={() => setOpen(v => !v)} className="w-full flex items-stretch text-left hover:bg-gray-50 transition-colors">
          <div className="w-20 flex-shrink-0 bg-[#0a1628] overflow-hidden">
            {photo
              ? <img src={photo} alt="" className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-xl opacity-30">⛵</div>}
          </div>
          <div className="flex-1 px-4 py-3 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-bold text-[#1a2b4a] uppercase italic truncate text-sm">{tripData?.boat_name || 'Passeio'}</p>
              {b.booking_number && (
                <span className="text-[9px] font-semibold text-[#c9a96e] bg-[#c9a96e]/15 border border-[#c9a96e]/30 px-1.5 py-0.5 rounded-full flex-shrink-0 flex items-center gap-0.5">
                  <Ticket className="w-2.5 h-2.5" /> {fmtTicket(b.booking_number)}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 font-bold mt-0.5">
              📅 {b.booking_date ? new Date(b.booking_date + 'T12:00').toLocaleDateString('pt-BR') : '—'}
              {(b as any).time_slot && (b as any).time_slot !== '00:00' ? ' · 🕐 ' + (b as any).time_slot : ''}
              {' · '}👥 {b.passengers} pax
            </p>
            <p className="text-xs text-gray-400 font-bold">💰 {fmt(b.total_price)}</p>
            <span className={'inline-block mt-1 text-[9px] font-semibold uppercase px-2 py-0.5 rounded-full border ' + st.cls}>{st.label}</span>
          </div>
          <div className="flex items-center pr-4 flex-shrink-0">
            <ChevronDown className={'w-4 h-4 text-gray-400 transition-transform duration-200 ' + (open ? 'rotate-180 text-[#1a2b4a]' : '')} />
          </div>
        </button>

        {canAddGuests && (
          <div className="px-4 pb-3 pt-1 border-t border-gray-100">
            <button
              onClick={() => setShowGuest(true)}
              className={'w-full flex items-center justify-between px-4 py-2.5 border-2 transition-all font-semibold text-xs uppercase ' +
                (guestsFilled > 0
                  ? 'bg-green-50 border-green-200 text-green-700 hover:border-green-400'
                  : 'bg-[#0a1628]/5 border-[#c9a96e]/20 text-[#1a2b4a] hover:border-[#0a1628]')}
            >
              <div className="flex items-center gap-2">
                <UserPlus className="w-3.5 h-3.5 flex-shrink-0" />
                <span>
                  {guestsFilled > 0
                    ? guestsFilled + '/' + guestsNeeded + ' convidado' + (guestsNeeded !== 1 ? 's' : '') + ' · editar'
                    : 'Adicionar convidados'}
                </span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
            </button>
          </div>
        )}

        {open && (
          <div className="border-t-2 border-gray-100 bg-gray-50/40 px-5 py-5 space-y-5 animate-in fade-in slide-in-from-top-2 duration-200">
            {b.booking_number && (
              <div className="bg-[#0a1628] px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Ticket className="w-5 h-5 text-[#c9a96e]" />
                  <div>
                    <p className="text-[#c9a96e] text-[9px] font-semibold uppercase tracking-[0.15em]">Nº do Bilhete</p>
                    <p className="text-white font-bold text-2xl">{fmtTicket(b.booking_number)}</p>
                  </div>
                </div>
                <span className={'text-[10px] font-semibold px-3 py-1.5 rounded-full border-2 ' + st.cls}>{st.label}</span>
              </div>
            )}
            {photo && (
              <div className="w-full h-40 overflow-hidden">
                <img src={photo} alt="" className="w-full h-full object-cover" />
              </div>
            )}
            <div>
              <h3 className="font-bold text-[#1a2b4a] text-lg uppercase italic">{tripData?.boat_name || 'Passeio'}</h3>
              {(tripData?.city || tripData?.country_name) && (
                <p className="text-xs text-gray-400 font-bold flex items-center gap-1 mt-0.5">
                  <span>{tripData?.country_flag || '🌍'}</span>
                  {[tripData?.city, tripData?.state_name, tripData?.country_name].filter(Boolean).join(', ')}
                </p>
              )}
            </div>
            {tripData && (
              <div className="bg-[#0a1628] px-4 py-3">
                <p className="text-[#c9a96e] text-[9px] font-semibold uppercase tracking-[0.15em] mb-1.5">Rota</p>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-white text-sm uppercase italic truncate flex-1">{tripData.marina_saida}</p>
                  <ChevronRight className="w-4 h-4 text-[#c9a96e] flex-shrink-0" />
                  <p className="font-bold text-gray-300 text-sm uppercase italic truncate flex-1">{tripData.marina_chegada}</p>
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-2">
              {([
                ['📅 Data',        b.booking_date ? new Date(b.booking_date + 'T12:00').toLocaleDateString('pt-BR') : '—'],
                ['🕐 Horário',     (b as any).time_slot && (b as any).time_slot !== '00:00' ? (b as any).time_slot : '—'],
                ['⏱ Duração',      tripData?.duracao || '—'],
                ['👥 Passageiros',  b.passengers + ' pessoa' + (b.passengers !== 1 ? 's' : '')],
                ['💰 Total',        fmt(b.total_price)],
                ['⚓ Comandante',    tripData ? (getSailors().find((s: any) => s.id === tripData.sailor_id)?.name || 'Comandante') : '—'],
              ] as [string, string][]).map(([l, v]) => (
                <div key={l} className="bg-white px-3 py-2.5 border border-gray-100">
                  <p className="text-[9px] font-semibold text-gray-400 uppercase">{l}</p>
                  <p className="font-semibold text-[#1a2b4a] text-xs mt-0.5">{v}</p>
                </div>
              ))}
            </div>
            {(b.guests?.length || 0) > 0 && (
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.15em] mb-2 flex items-center gap-1.5">
                  <Users className="w-3 h-3" /> Convidados
                </p>
                <div className="space-y-1.5">
                  {b.guests!.map((g, i) => (
                    <div key={i} className={'flex items-center gap-3 px-3 py-2.5 border-2 ' + (g.client_id ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200')}>
                      <div className={'w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ' + (g.client_id ? 'bg-green-500 text-white' : 'bg-gray-300 text-white')}>
                        {g.name ? g.name[0].toUpperCase() : (i + 1)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-[#1a2b4a] truncate">{g.name || '—'}</p>
                        <p className="text-[10px] text-gray-400 font-bold">#{g.profile_number ? parseInt(g.profile_number, 10) : '?'} · {g.email}</p>
                      </div>
                      {g.client_id && <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {b.guests_obs && (
              <div className="bg-[#c9a96e]/5 border border-[#c9a96e]/20 px-4 py-3 flex items-start gap-2">
                <MessageSquare className="w-3.5 h-3.5 text-[#c9a96e] flex-shrink-0 mt-0.5" />
                <p className="text-xs font-bold text-[#1a2b4a] leading-relaxed">{b.guests_obs}</p>
              </div>
            )}
            {tripData?.minimo_tripulantes > 1 && (
              <div className="bg-[#c9a96e]/5 border border-[#c9a96e]/20 px-4 py-2.5 flex items-center gap-2">
                <span>⚠️</span>
                <p className="text-xs font-semibold text-[#1a2b4a]">Mínimo de {tripData.minimo_tripulantes} confirmados para realizar</p>
              </div>
            )}
            {(bebidasLabel || comidaLabel || barLabel) && (
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.15em] mb-2">🎁 Incluído</p>
                <div className="flex flex-wrap gap-1.5">
                  {[bebidasLabel, comidaLabel, barLabel].filter(Boolean).map((label, i) => (
                    <span key={i} className="text-[10px] font-semibold text-gray-600 bg-white border border-gray-200 px-2.5 py-1 rounded-full">{label}</span>
                  ))}
                </div>
              </div>
            )}
            {tripData?.descricao && (
              <p className="text-xs font-bold text-gray-600 leading-relaxed bg-white border border-gray-100 px-4 py-3">{tripData.descricao}</p>
            )}
            {tripData?.meeting_point && (
              <div className="bg-[#0a1628]/5 border-2 border-[#0a1628]/10 p-4 space-y-3">
                <p className="text-[10px] font-semibold text-[#1a2b4a] uppercase tracking-[0.15em] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> Ponto de Encontro
                </p>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-[#0a1628] rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#1a2b4a] text-sm">{tripData.meeting_point}</p>
                    {(tripData.meeting_sector || tripData.meeting_gate) && (
                      <p className="text-xs text-[#1a2b4a] font-bold mt-0.5">{[tripData.meeting_sector, tripData.meeting_gate].filter(Boolean).join(' · ')}</p>
                    )}
                    {tripData.meeting_ref && (
                      <p className="text-xs text-gray-500 font-bold italic mt-0.5">📍 {tripData.meeting_ref}</p>
                    )}
                  </div>
                </div>
                {(tripData.meeting_sector || tripData.meeting_gate) && (
                  <div className="grid grid-cols-2 gap-2">
                    {tripData.meeting_sector && (
                      <div className="bg-white px-3 py-2.5 border border-gray-100 flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 text-[#c9a96e] flex-shrink-0" />
                        <div>
                          <p className="text-[9px] font-semibold text-gray-400 uppercase">Setor</p>
                          <p className="font-semibold text-[#1a2b4a] text-xs">{tripData.meeting_sector}</p>
                        </div>
                      </div>
                    )}
                    {tripData.meeting_gate && (
                      <div className="bg-white px-3 py-2.5 border border-gray-100 flex items-center gap-2">
                        <DoorOpen className="w-3.5 h-3.5 text-[#c9a96e] flex-shrink-0" />
                        <div>
                          <p className="text-[9px] font-semibold text-gray-400 uppercase">Portão</p>
                          <p className="font-semibold text-[#1a2b4a] text-xs">{tripData.meeting_gate}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {tripData.meeting_maps_url && (
                  <a href={tripData.meeting_maps_url} target="_blank" rel="noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-[#0a1628] hover:bg-[#0a1628]/90 text-white py-3 font-semibold text-xs uppercase transition-all shadow-md">
                    <Map className="w-4 h-4" /> Ver no Google Maps ↗
                  </a>
                )}
              </div>
            )}
            <div className={'px-4 py-3 border-2 flex items-center gap-3 ' + st.cls}>
              <div className={'w-2.5 h-2.5 rounded-full flex-shrink-0 ' + st.dot} />
              <p className="font-semibold text-sm">{st.label}</p>
            </div>
          </div>
        )}
      </div>

      {showGuest && (
        <GuestModal
          booking={b}
          tripData={tripData}
          onClose={() => setShowGuest(false)}
          onSaved={() => { setShowGuest(false); onRefresh?.(); }}
        />
      )}
    </div>
  );
}
