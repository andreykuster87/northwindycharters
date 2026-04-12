// src/components/AdminDashboard/tabs/CancelamentosTab.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Aba de cancelamentos — lista de reservas canceladas com contacto rápido.
// ─────────────────────────────────────────────────────────────────────────────
import { XCircle } from 'lucide-react';
import {
  deleteBooking, getTrips, getBoats, getSailors,
  type Booking,
} from '../../../lib/localStore';
import { fmt } from '../../shared/adminHelpers';

// ── Props ─────────────────────────────────────────────────────────────────────

interface CancelamentosTabProps {
  bookings: Booking[];
  role:     'admin' | 'sailor' | null;
  onReload: () => void;
}

// ── Componente ────────────────────────────────────────────────────────────────

export function CancelamentosTab({ bookings, role, onReload }: CancelamentosTabProps) {
  const cancelled = bookings.filter(b => b.status === 'cancelado');

  function handleDeleteOne(id: string) {
    deleteBooking(id);
    onReload();
  }

  function handleDeleteAll() {
    cancelled.forEach(b => deleteBooking(b.id));
    onReload();
  }

  return (
    <div className="space-y-6">

      {/* Cabeçalho */}
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-black text-blue-900 uppercase italic">Cancelamentos</h2>
          <p className="text-gray-400 font-bold text-sm uppercase mt-1">
            {cancelled.length} reserva(s) cancelada(s)
          </p>
        </div>
        {cancelled.length > 0 && role === 'admin' && (
          <button
            onClick={handleDeleteAll}
            className="flex items-center gap-2 bg-red-50 hover:bg-red-100 border-2 border-red-100 text-red-600 px-4 py-2.5 rounded-full font-black text-xs uppercase transition-all"
          >
            🗑️ Limpar todas
          </button>
        )}
      </div>

      {/* Estado vazio */}
      {cancelled.length === 0 ? (
        <div className="bg-white rounded-[40px] border-2 border-blue-50 p-16 text-center shadow-sm">
          <div className="text-5xl mb-4">✅</div>
          <p className="font-black text-gray-400 uppercase italic">Nenhum cancelamento registado</p>
        </div>
      ) : (
        <div className="space-y-4">
          {cancelled.map(b => {
            const tripData   = getTrips().find(t => t.id === b.trip_id) ?? null;
            const boatData   = tripData ? (getBoats().find(bt => bt.id === tripData.boat_id) ?? null) : null;
            const sailorData = getSailors().find(s => s.id === b.sailor_id) ?? null;
            const photo      = tripData?.cover_photo || tripData?.photos?.[0] || boatData?.cover_photo || '';

            return (
              <div key={b.id} className="bg-white rounded-[30px] border-2 border-red-100 shadow-sm overflow-hidden">

                {/* Faixa de topo */}
                <div className="flex items-stretch">
                  <div className="w-24 flex-shrink-0 bg-red-50 overflow-hidden relative">
                    {photo
                      ? <img src={photo} alt="" className="w-full h-full object-cover opacity-70" />
                      : <div className="w-full h-full flex items-center justify-center text-3xl opacity-20">⛵</div>
                    }
                    <div className="absolute inset-0 bg-red-900/10" />
                  </div>
                  <div className="flex-1 px-6 py-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-black text-blue-900 text-base italic">
                          {tripData?.boat_name || boatData?.name || 'Passeio'}
                        </p>
                        <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mt-0.5">
                          Reserva cancelada
                        </p>
                      </div>
                      {role === 'admin' && (
                        <button
                          onClick={() => handleDeleteOne(b.id)}
                          className="bg-red-50 hover:bg-red-100 text-red-400 hover:text-red-600 p-2 rounded-full transition-all border-2 border-red-100 flex-shrink-0"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Detalhes */}
                <div className="px-6 pb-5 space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    {([
                      ['Nome',    b.customer_name || '—'],
                      ['Passag.', `${b.passengers} pessoa${b.passengers !== 1 ? 's' : ''}`],
                      ['Valor',   fmt(b.total_price)],
                      ['Reserva', b.created_at ? new Date(b.created_at).toLocaleDateString('pt-BR') : '—'],
                    ] as [string, string][]).map(([l, v]) => (
                      <div key={l} className="bg-gray-50 rounded-[14px] px-3 py-2.5">
                        <p className="text-[9px] font-black text-gray-400 uppercase">{l}</p>
                        <p className="font-black text-blue-900 text-sm mt-0.5">{v}</p>
                      </div>
                    ))}
                  </div>

                  {/* WhatsApp cliente */}
                  {b.customer_phone && (
                    <a
                      href={`https://wa.me/${b.customer_phone.replace(/\D/g, '')}?text=${encodeURIComponent('Olá ' + b.customer_name + '! Entramos em contacto sobre o cancelamento da sua reserva na NorthWindy.')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 text-white py-2.5 rounded-[18px] font-black text-xs uppercase transition-all"
                    >
                      📲 {b.customer_phone}
                    </a>
                  )}

                  {/* Comandante */}
                  {sailorData && (
                    <div className="flex items-center gap-3 bg-blue-50 rounded-[18px] px-4 py-3">
                      <div className="w-10 h-10 bg-blue-900 text-white rounded-full flex items-center justify-center font-black text-sm flex-shrink-0">
                        {sailorData.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-blue-900 text-sm truncate">{sailorData.name}</p>
                        <p className="text-xs text-blue-400 font-bold truncate">{sailorData.email}</p>
                      </div>
                      {sailorData.phone && (
                        <a
                          href={`https://wa.me/${sailorData.phone.replace(/\D/g, '')}?text=${encodeURIComponent('Olá ' + sailorData.name + '! Temos um cancelamento para resolver.')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-green-500 hover:bg-green-400 text-white px-3 py-2 rounded-full font-black text-[10px] uppercase transition-all flex items-center gap-1.5 flex-shrink-0"
                        >
                          📲 WhatsApp
                        </a>
                      )}
                    </div>
                  )}

                  {/* Motivo */}
                  <div className="bg-red-50 border-2 border-red-100 rounded-[18px] px-4 py-3">
                    <p className="text-[9px] font-black text-red-400 uppercase tracking-widest mb-1">⚠️ Motivo</p>
                    <p className="font-bold text-red-800 text-sm">
                      {(b as any).cancel_reason || 'Não informado'}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}