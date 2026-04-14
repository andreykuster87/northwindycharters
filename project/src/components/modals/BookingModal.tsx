// src/components/BookingModal.tsx
import { useState } from 'react';
import {
  X, Users, MapPin, Clock, ShieldCheck,
  ChevronLeft, ChevronRight, Calendar, Phone, CheckCircle2
} from 'lucide-react';

export interface BookingData {
  customerName:  string;
  customerPhone: string;
  date:          string;
  timeSlot?:     string;   // horário pré-selecionado (pode vir do modal de datas)
  passengers:    number;
  notes:         string;
  boat: {
    id:              string;
    name:            string;
    price_per_hour:  number;
    capacity:        number;
    marina_location: string;
    sailor:          { name: string; verified: boolean; phone?: string };
  };
}

interface BookingModalProps {
  boat: {
    id: string;
    name: string;
    photo_url: string;
    photos?: string[];
    capacity: number;
    price_per_hour: number;
    marina_location: string;
    duracao?: string;
    descricao?: string;
    currency?: string;
    currency_locale?: string;
    sailor: { name: string; verified: boolean; phone?: string };
  };
  clientName?:          string;
  clientPhone?:         string;
  preselectedDate?:     string;   // vem do modal de horários
  preselectedTimeSlot?: string;   // vem do modal de horários
  onClose:   () => void;
  onConfirm: (data: BookingData) => void;
}

function formatCurrency(v: number, currency?: string, locale?: string) {
  try {
    if (currency && locale) {
      return new Intl.NumberFormat(locale, {
        style: 'currency', currency,
        minimumFractionDigits: currency === 'JPY' ? 0 : 2,
      }).format(v);
    }
  } catch {}
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
}

function parseLocation(loc: string) {
  const arrow = loc.split('→');
  if (arrow.length >= 2) {
    const from = arrow[0].trim();
    const rest  = arrow[1].split('·');
    return { from, to: rest[0].trim(), duration: rest[1]?.trim() || '' };
  }
  return { from: loc, to: '', duration: '' };
}

export function BookingModal({
  boat, onClose, onConfirm,
  clientName = '', clientPhone = '',
  preselectedDate, preselectedTimeSlot,
}: BookingModalProps) {

  const validPhoto = (p: string) => p && (p.startsWith('data:image') || p.startsWith('https'));
  const photos = (boat.photos && boat.photos.length > 0)
    ? boat.photos.filter(validPhoto)
    : boat.photo_url && validPhoto(boat.photo_url) ? [boat.photo_url] : [];

  const [photoIdx,   setPhotoIdx]   = useState(0);
  const [step,       setStep]       = useState<'info' | 'form'>('info');

  // Pré-preenche com dados do cliente logado e com data/slot vindos do modal de horários
  const [name,       setName]       = useState(clientName);
  const [phone,      setPhone]      = useState(clientPhone);
  const [date,       setDate]       = useState(preselectedDate || '');
  const [timeSlot,   setTimeSlot]   = useState(preselectedTimeSlot || '');
  const [passengers, setPassengers] = useState(1);
  const [notes,      setNotes]      = useState('');
  const [formError,  setFormError]  = useState<string | null>(null);

  const isPreFilled   = !!clientName;
  const hasPreDate    = !!preselectedDate;
  const hasPreSlot    = !!preselectedTimeSlot;
  const { from, to, duration } = parseLocation(boat.marina_location);
  const totalPrice = boat.price_per_hour * passengers;

  const prevPhoto = () => setPhotoIdx(i => (i - 1 + photos.length) % photos.length);
  const nextPhoto = () => setPhotoIdx(i => (i + 1) % photos.length);

  const handleConfirm = () => {
    if (!name.trim())  { setFormError('Informe seu nome.'); return; }
    if (!phone.trim()) { setFormError('Informe seu WhatsApp.'); return; }
    if (!date)         { setFormError('Selecione uma data.'); return; }
    setFormError(null);
    onConfirm({
      customerName:  name,
      customerPhone: phone,
      date,
      timeSlot:      timeSlot || undefined,
      passengers,
      notes,
      boat: {
        id:              boat.id,
        name:            boat.name,
        price_per_hour:  boat.price_per_hour,
        capacity:        boat.capacity,
        marina_location: boat.marina_location,
        sailor:          boat.sailor,
      },
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(4,10,24,0.88)', backdropFilter: 'blur(8px)' }}
    >
      <div className="bg-white w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl border border-[#c9a96e]/30 animate-in zoom-in-95 duration-300">

        {/* Galeria */}
        <div className="relative overflow-hidden bg-[#0a1628]" style={{ height: '320px' }}>
          {photos.length > 0 ? (
            <img src={photos[photoIdx]} alt={boat.name}
              className="w-full h-full object-contain transition-all duration-500"
              onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}/>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#0a1628] to-[#1a2b4a] flex flex-col items-center justify-center gap-3">
              <div className="text-6xl opacity-30">⛵</div>
              <span className="font-semibold text-white/30 text-2xl uppercase italic">{boat.name.substring(0,2)}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628]/70 via-transparent to-transparent"/>
          <button onClick={onClose}
            className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white p-3 hover:bg-white/40 transition-all">
            <X className="w-5 h-5"/>
          </button>
          {photos.length > 1 && (
            <>
              <button onClick={prevPhoto} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-2.5 hover:bg-white/40 transition-all">
                <ChevronLeft className="w-5 h-5"/>
              </button>
              <button onClick={nextPhoto} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-2.5 hover:bg-white/40 transition-all">
                <ChevronRight className="w-5 h-5"/>
              </button>
              <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-1.5">
                {photos.map((_, i) => (
                  <button key={i} onClick={() => setPhotoIdx(i)}
                    className={`transition-all ${i === photoIdx ? 'w-6 h-2 bg-[#c9a96e]' : 'w-2 h-2 bg-white/50'}`}/>
                ))}
              </div>
            </>
          )}
          {/* Modal header bottom line */}
          <div className="absolute bottom-0 left-0 right-0 border-b border-[#c9a96e]/60"/>
          <div className="absolute bottom-0 left-0 right-0 p-6 pb-4">
            <h2 className="text-3xl font-['Playfair_Display'] font-bold text-white uppercase">{boat.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              {boat.sailor.verified && <ShieldCheck className="w-4 h-4 text-green-400 flex-shrink-0"/>}
              <span className="text-white/80 font-semibold text-sm">{boat.sailor.name}</span>
            </div>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="p-8 space-y-6">

          {/* Info do passeio */}
          <div className="grid grid-cols-2 gap-3">
            {from && (
              <div className="col-span-2 bg-[#0a1628]/5 border border-[#c9a96e]/20 p-4 flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#c9a96e] mt-0.5 flex-shrink-0"/>
                <div>
                  <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em]">Rota</p>
                  <p className="font-semibold text-[#1a2b4a] text-sm">{from}{to && to !== from ? ` → ${to}` : ''}</p>
                </div>
              </div>
            )}
            {duration && (
              <div className="bg-gray-50 p-4 flex items-center gap-3">
                <Clock className="w-4 h-4 text-gray-400"/>
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.15em]">Duração</p>
                  <p className="font-semibold text-[#1a2b4a] text-sm">{duration}</p>
                </div>
              </div>
            )}
            <div className="bg-gray-50 p-4 flex items-center gap-3">
              <Users className="w-4 h-4 text-gray-400"/>
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.15em]">Capacidade</p>
                <p className="font-semibold text-[#1a2b4a] text-sm">até {boat.capacity} pessoas</p>
              </div>
            </div>
          </div>

          {/* Data/horário pré-selecionados (banner informativo) */}
          {(hasPreDate || hasPreSlot) && (
            <div className="bg-green-50 border border-green-200 p-4 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0"/>
              <div>
                <p className="font-semibold text-green-800 text-sm">Horário selecionado</p>
                <p className="text-green-600 font-bold text-xs mt-0.5">
                  {hasPreDate && (() => { const [y,m,d] = date.split('-'); return `${d}/${m}/${y}`; })()}
                  {hasPreSlot && ` · ${timeSlot}`}
                </p>
              </div>
            </div>
          )}

          {boat.descricao && (
            <p className="text-sm text-gray-500 font-bold leading-relaxed border-l-4 border-[#c9a96e]/30 pl-4">{boat.descricao}</p>
          )}

          {/* Preço + botão entrar no formulário */}
          <div className="bg-[#0a1628] p-5 flex items-center justify-between">
            <div>
              <p className="text-[#c9a96e] text-[10px] font-semibold uppercase tracking-[0.15em]">Valor por pessoa</p>
              <p className="text-white font-bold text-3xl">
                {formatCurrency(boat.price_per_hour, boat.currency, boat.currency_locale)}
              </p>
            </div>
            {step === 'info' && (
              <button onClick={() => setStep('form')}
                className="bg-white text-[#1a2b4a] px-8 py-4 font-semibold uppercase text-sm hover:bg-gray-50 transition-all shadow-lg">
                Reservar →
              </button>
            )}
          </div>

          {/* Formulário */}
          {step === 'form' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-6 bg-[#c9a96e]"/>
                <h3 className="font-semibold text-[#c9a96e] uppercase tracking-[0.15em] text-sm">Dados da Reserva</h3>
              </div>

              {isPreFilled && (
                <div className="bg-green-50 border border-green-200 px-4 py-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0"/>
                  <p className="text-green-700 font-bold text-xs">Dados preenchidos automaticamente com o seu perfil.</p>
                </div>
              )}

              {formError && (
                <div className="bg-red-50 border border-red-200 px-4 py-3 text-red-700 font-bold text-sm">
                  ⚠️ {formError}
                </div>
              )}

              <div className="space-y-3">
                {/* Nome */}
                <div className="relative">
                  {isPreFilled && <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500"/>}
                  <input placeholder="Seu nome completo" value={name}
                    onChange={e => { setName(e.target.value); setFormError(null); }}
                    readOnly={isPreFilled}
                    className={`w-full border py-4 px-5 font-bold text-[#1a2b4a] outline-none transition-all text-sm
                      ${isPreFilled ? 'bg-green-50 border-green-200 cursor-default' : 'bg-gray-50 border-gray-200 focus:border-[#c9a96e]'}`}/>
                </div>

                {/* Telefone */}
                <div className="relative">
                  <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300"/>
                  {isPreFilled && <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500"/>}
                  <input placeholder="WhatsApp (ex: 11 99999-9999)" value={phone}
                    onChange={e => { setPhone(e.target.value); setFormError(null); }}
                    readOnly={isPreFilled}
                    className={`w-full border py-4 pl-12 pr-10 font-bold text-[#1a2b4a] outline-none transition-all text-sm
                      ${isPreFilled ? 'bg-green-50 border-green-200 cursor-default' : 'bg-gray-50 border-gray-200 focus:border-[#c9a96e]'}`}/>
                </div>

                {/* Data — bloqueada se pré-selecionada */}
                <div className="relative">
                  <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300"/>
                  {hasPreDate && <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500"/>}
                  <input type={hasPreDate ? 'text' : 'date'}
                    value={hasPreDate
                      ? (() => { const [y,m,d] = date.split('-'); return `${d}/${m}/${y}${hasPreSlot ? ` · ${timeSlot}` : ''}`; })()
                      : date}
                    min={!hasPreDate ? new Date().toISOString().split('T')[0] : undefined}
                    onChange={!hasPreDate ? e => { setDate(e.target.value); setFormError(null); } : undefined}
                    readOnly={hasPreDate}
                    className={`w-full border py-4 pl-12 pr-10 font-bold text-[#1a2b4a] outline-none transition-all text-sm
                      ${hasPreDate ? 'bg-green-50 border-green-200 cursor-default' : 'bg-gray-50 border-gray-200 focus:border-[#c9a96e]'}`}/>
                </div>

                {/* Nº pessoas */}
                <div className="bg-gray-50 border border-gray-200 py-4 px-5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400"/>
                    <span className="font-semibold text-[#1a2b4a] text-sm">Nº de pessoas</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <button type="button" onClick={() => setPassengers(p => Math.max(1, p - 1))}
                      className="w-8 h-8 border border-gray-200 text-gray-500 font-semibold hover:border-[#c9a96e] hover:text-[#1a2b4a] transition-all flex items-center justify-center">−</button>
                    <span className="font-semibold text-[#1a2b4a] text-xl w-6 text-center">{passengers}</span>
                    <button type="button" onClick={() => setPassengers(p => Math.min(boat.capacity, p + 1))}
                      className="w-8 h-8 border border-gray-200 text-gray-500 font-semibold hover:border-[#c9a96e] hover:text-[#1a2b4a] transition-all flex items-center justify-center">+</button>
                  </div>
                </div>

                <textarea placeholder="Observações (opcional)" value={notes}
                  onChange={e => setNotes(e.target.value)} rows={2}
                  className="w-full bg-gray-50 border border-gray-200 py-4 px-5 font-bold text-[#1a2b4a] focus:border-[#c9a96e] outline-none transition-all text-sm resize-none placeholder:text-gray-300"/>
              </div>

              {/* Total */}
              <div className="bg-[#0a1628]/5 border border-[#c9a96e]/20 px-5 py-3 flex justify-between items-center">
                <span className="text-xs font-semibold text-[#c9a96e] uppercase tracking-[0.15em]">Total ({passengers} pessoa{passengers !== 1 ? 's' : ''})</span>
                <span className="font-semibold text-[#1a2b4a] text-xl">
                  {formatCurrency(totalPrice, boat.currency, boat.currency_locale)}
                </span>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep('info')}
                  className="px-6 py-4 border border-gray-200 text-gray-400 font-semibold text-sm uppercase hover:border-gray-300 transition-all">
                  ← Voltar
                </button>
                <button onClick={handleConfirm}
                  className="flex-1 bg-[#0a1628] text-white py-4 font-semibold uppercase text-sm hover:bg-[#0a1628]/90 transition-all shadow-lg flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-400"/> Confirmar via WhatsApp
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
