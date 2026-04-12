// src/components/AdminDashboard/shared/CancelModal.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Modal de cancelamento de reserva — escolha do tipo + observação livre.
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from 'react';
import { XCircle } from 'lucide-react';
import { getTrips, type Booking } from '../../lib/localStore';

// ── Props ─────────────────────────────────────────────────────────────────────

interface CancelModalProps {
  bookingId: string;
  bookings:  Booking[];
  onClose:   () => void;
  /** Chamado após confirmar — passa o id e o motivo composto */
  onConfirm: (bookingId: string, reason: string) => void;
}

// ── Tipos de cancelamento ─────────────────────────────────────────────────────

const CANCEL_TYPES: [string, string, string][] = [
  ['cliente',     '👤', 'Cancelamento pelo cliente'],
  ['climatico',   '🌧️', 'Segurança e condições climáticas'],
  ['interrupcao', '⚠️', 'Interrupção do serviço pós-embarque'],
];

// ── Componente ────────────────────────────────────────────────────────────────

export function CancelModal({ bookingId, bookings, onClose, onConfirm }: CancelModalProps) {
  const [cancelType,   setCancelType]   = useState('');
  const [cancelReason, setCancelReason] = useState('');

  const booking  = bookings.find(b => b.id === bookingId);
  const tripData = booking?.trip ?? getTrips().find(t => t.id === booking?.trip_id) ?? null;

  function handleConfirm() {
    const reason = [cancelType, cancelReason].filter(Boolean).join(' — ') || 'Não informado';
    onConfirm(bookingId, reason);
    setCancelType('');
    setCancelReason('');
  }

  return (
    <div
      className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-blue-900/70 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-sm rounded-[40px] shadow-2xl border-4 border-red-400 animate-in zoom-in-95 duration-300 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="bg-red-500 px-8 py-6 text-center">
          <div className="text-4xl mb-2">⚠️</div>
          <h3 className="text-xl font-black text-white uppercase italic">Cancelar Reserva</h3>
          <p className="text-red-200 text-xs font-bold mt-1 uppercase tracking-widest">
            Esta acção não pode ser desfeita
          </p>
        </div>

        {/* Corpo */}
        <div className="p-8 space-y-5">
          <p className="text-gray-600 font-bold text-sm text-center">
            Cancelar reserva de{' '}
            <span className="font-black text-blue-900">{booking?.customer_name}</span>
            {tripData?.boat_name && (
              <> — <span className="italic text-blue-900">{tripData.boat_name}</span></>
            )}?
          </p>

          <div className="space-y-3">
            <p className="text-[10px] font-black text-gray-400 uppercase">
              Tipo de cancelamento
            </p>
            {CANCEL_TYPES.map(([key, emoji, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setCancelType(p => p === key ? '' : key)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-[16px] border-2 font-bold text-sm text-left transition-all
                  ${cancelType === key
                    ? 'border-red-400 bg-red-50 text-red-800'
                    : 'border-gray-100 bg-gray-50 text-gray-600 hover:border-red-200'
                  }`}
              >
                <span className="text-lg flex-shrink-0">{emoji}</span>
                <span className="flex-1">{label}</span>
                {cancelType === key && <span className="text-red-400 font-black text-xs">✓</span>}
              </button>
            ))}

            <textarea
              value={cancelReason}
              onChange={e => setCancelReason(e.target.value)}
              placeholder="Observações adicionais..."
              rows={2}
              className="w-full bg-gray-50 border-2 border-gray-100 focus:border-red-400 rounded-[16px] px-4 py-2.5 font-bold text-sm outline-none resize-none transition-colors placeholder:text-gray-300"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 border-2 border-gray-100 text-gray-500 hover:border-gray-300 py-3.5 rounded-[25px] font-black text-sm uppercase transition-all"
            >
              Fechar
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 bg-red-500 hover:bg-red-400 text-white py-3.5 rounded-[25px] font-black text-sm uppercase transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <XCircle className="w-4 h-4" /> Cancelar Reserva
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}