// src/components/ClientArea/components/ReservasBox.tsx
import { useState } from 'react';
import { BookOpen } from 'lucide-react';
import { type Booking } from '../../lib/localStore';
import { BookingCard } from './BookingCard';

export function ReservasBox({
  bookings,
  onRefresh,
  onOpenChange,
}: {
  bookings: Booking[];
  onRefresh?: () => void;
  onOpenChange?: (open: boolean) => void;
}) {
  const [open, setOpen] = useState(false);

  function handleOpen() {
    const next = !open;
    setOpen(next);
    onOpenChange?.(next);
  }

  return (
    <div className="bg-white border-2 border-gray-100 overflow-hidden w-full">
      <button onClick={handleOpen} className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-all">
        <div className="flex items-center gap-3">
          <div className="bg-[#0a1628] p-2 rounded-full">
            <BookOpen className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-semibold text-[#1a2b4a] text-sm uppercase tracking-wide">Minhas Reservas</span>
          {bookings.length > 0 && (
            <span className="bg-[#0a1628] text-white text-[9px] font-semibold px-2 py-0.5 rounded-full">
              {bookings.length}
            </span>
          )}
        </div>
        <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="h-px bg-gray-100 mb-3" />
          {bookings.length === 0 ? (
            <div className="py-6 text-center">
              <div className="text-3xl mb-2">⛵</div>
              <p className="font-semibold text-gray-300 uppercase italic text-xs">Nenhuma reserva ainda</p>
            </div>
          ) : (
            bookings.map(b => <BookingCard key={b.id} b={b} onRefresh={onRefresh} />)
          )}
        </div>
      )}
    </div>
  );
}
