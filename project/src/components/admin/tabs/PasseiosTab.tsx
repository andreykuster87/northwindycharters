// src/components/AdminDashboard/tabs/PasseiosTab.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Aba de passeios — lista expansível com agenda, reservas e gestão de fotos.
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from 'react';
import { XCircle, ChevronDown, Pencil } from 'lucide-react';
import { usePagination } from '../../../hooks/usePagination';
import { Pagination }    from '../../shared/Pagination';
import {
  cancelTrip,
  updateTrip,
  getBoats,
  type Trip,
  type Booking,
} from '../../../lib/localStore';
import { PhotoAlbumManager } from '../../shared/PhotoAlbumManager';
import { EditTripModal } from '../../modals/EditTripModal';
import { fmt, fmtTrip, todayStr } from '../../shared/adminHelpers';

// ── Props ─────────────────────────────────────────────────────────────────────

interface PasseiosTabProps {
  trips:    Trip[];
  bookings: Booking[];
  role:     'admin' | 'sailor' | null;
  /** Navega para a aba frota */
  onGoToFrota: () => void;
  /** Actualiza lista de viagens após edição */
  onTripsChange: (trips: Trip[]) => void;
}

// ── Helpers de status ─────────────────────────────────────────────────────────

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  pending:   { label: '⏳ Aguardando', cls: 'bg-amber-100 text-amber-700 border-amber-200' },
  confirmed: { label: '✅ Confirmada', cls: 'bg-green-100 text-green-700 border-green-200' },
  cancelado: { label: '❌ Cancelada',  cls: 'bg-red-100 text-red-600 border-red-200'      },
};

// ── Componente ────────────────────────────────────────────────────────────────

export function PasseiosTab({
  trips,
  bookings,
  role,
  onGoToFrota,
  onTripsChange,
}: PasseiosTabProps) {
  const [expandedTripId, setExpandedTripId] = useState<string | null>(null);
  const [editingTrip,    setEditingTrip]    = useState<Trip | null>(null);
  const pg = usePagination(trips, 20);

  function handleCancelTrip(id: string) {
    if (!window.confirm('Cancelar este passeio?')) return;
    cancelTrip(id);
    onTripsChange(trips.filter(t => t.id !== id));
    if (expandedTripId === id) setExpandedTripId(null);
  }

  function handlePhotosUpdate(tripId: string, photos: string[], cover: string) {
    updateTrip(tripId, { photos, cover_photo: cover });
    onTripsChange(
      trips.map(x => x.id === tripId ? { ...x, photos, cover_photo: cover } as any : x)
    );
  }

  function handleTripSaved(updated: Trip) {
    onTripsChange(trips.map(x => x.id === updated.id ? updated : x));
    setEditingTrip(null);
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div>
        <h2 className="font-['Playfair_Display'] font-bold text-3xl text-[#1a2b4a]">
          {role === 'admin' ? 'Passeios Cadastrados' : 'Meus Passeios'}
        </h2>
        <p className="text-gray-400 font-bold text-sm uppercase mt-1">
          {trips.length} passeio(s)
        </p>
      </div>

      {/* Estado vazio */}
      {trips.length === 0 ? (
        <div className="bg-white p-16 text-center border-2 border-dashed border-gray-200 flex flex-col items-center justify-center min-h-[320px]">
          <div className="text-5xl mb-6">🧭</div>
          <p className="text-gray-400 font-semibold uppercase text-lg mb-4">
            Nenhum passeio ainda
          </p>
          <button
            onClick={onGoToFrota}
            className="bg-[#0a1628] text-white px-8 py-4 font-semibold text-sm uppercase hover:bg-[#0a1628]/90 transition-all"
          >
            Ir para Minha Frota →
          </button>
        </div>
      ) : (
        <div className="bg-white border-2 border-[#0a1628]/5 shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-50">
            {pg.paged.map(t => {
              const isOpen       = expandedTripId === t.id;
              const tripBookings = bookings.filter(b => b.trip_id === t.id);
              const confirmedB   = tripBookings.filter(b => ['confirmed', 'completed', 'concluido'].includes(b.status));
              const pendingB     = tripBookings.filter(b => b.status === 'pending');
              const futureDates  = ((t as any).schedule || []).filter((e: any) => e.date >= todayStr);
              const confirmedPax = confirmedB.reduce((s, b) => s + (b.passengers || 0), 0);
              const priceDisplay = fmtTrip(t.valor_por_pessoa, t);

              return (
                <div key={t.id} className="transition-all">
                  {/* Linha de sumário */}
                  <div
                    onClick={() => setExpandedTripId(isOpen ? null : t.id)}
                    className={`flex items-center gap-4 px-6 py-4 cursor-pointer transition-all hover:bg-gray-50 ${isOpen ? 'bg-[#0a1628]/5 border-l-4 border-[#0a1628]' : ''}`}
                  >
                    <div className="w-16 h-16 flex-shrink-0 overflow-hidden bg-[#0a1628]">
                      {(t as any).cover_photo
                        ? <img src={(t as any).cover_photo} alt="" className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-2xl opacity-30">⛵</div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {(t as any).country_flag && (
                          <span className="text-lg">{(t as any).country_flag}</span>
                        )}
                        <p className="font-bold text-[#1a2b4a] uppercase truncate">{t.boat_name}</p>
                        <span className="text-[10px] font-semibold text-green-600 bg-green-100 px-2 py-0.5 flex-shrink-0 border border-green-200">
                          ● Ativo
                        </span>
                      </div>
                      <p className="text-xs font-bold text-gray-400 truncate mt-0.5">
                        {[(t as any).city, (t as any).state_name, (t as any).country_name].filter(Boolean).join(', ')}
                        {' · '}{t.marina_saida} → {t.marina_chegada} · {t.duracao}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="text-[10px] font-bold text-[#1a2b4a]">{priceDisplay}/pessoa</span>
                        <span className="text-[10px] text-gray-300">·</span>
                        <span className="text-[10px] font-bold text-gray-400">
                          {futureDates.length} data{futureDates.length !== 1 ? 's' : ''} futuras
                        </span>
                        {confirmedB.length > 0 && (
                          <span className="text-[10px] font-semibold text-green-700 bg-green-50 px-2 py-0.5 border border-green-200">
                            {confirmedB.length} confirmada{confirmedB.length !== 1 ? 's' : ''}
                          </span>
                        )}
                        {pendingB.length > 0 && (
                          <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 border border-amber-200">
                            ⏳ {pendingB.length} pendente{pendingB.length !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={e => { e.stopPropagation(); setEditingTrip(t); }}
                        className="bg-[#0a1628]/5 hover:bg-[#0a1628]/10 text-[#c9a96e] p-2 transition-all border border-[#c9a96e]/30"
                        title="Editar passeio"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); handleCancelTrip(t.id); }}
                        className="bg-red-50 hover:bg-red-100 text-red-400 hover:text-red-600 p-2 transition-all border border-red-100"
                        title="Cancelar passeio"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                      <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#1a2b4a]' : ''}`} />
                    </div>
                  </div>

                  {/* Painel expandido */}
                  {isOpen && (
                    <div className="border-t-2 border-[#0a1628]/5 bg-gray-50/40 px-6 py-6 space-y-6 animate-in fade-in slide-in-from-top-2 duration-200">

                      {/* Fotos */}
                      {((t as any).photos?.length > 0 || (t as any).cover_photo) && (
                        <div>
                          <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em] mb-3">📷 Fotos</p>
                          <div className="flex gap-2 overflow-x-auto pb-1">
                            {[...new Set([(t as any).cover_photo, ...((t as any).photos || [])])].filter(Boolean).map((p: string, i: number) => (
                              <div
                                key={i}
                                className={`flex-shrink-0 w-24 h-24 overflow-hidden border-2 ${p === (t as any).cover_photo ? 'border-[#0a1628]' : 'border-gray-100'}`}
                              >
                                <img src={p} alt="" className="w-full h-full object-cover" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Detalhes */}
                      <div>
                        <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em] mb-3">📋 Detalhes</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {([
                            ['País',           [(t as any).country_flag, (t as any).country_name].filter(Boolean).join(' ') || '—'],
                            ['Estado',         (t as any).state_name || '—'],
                            ['Cidade',         (t as any).city || '—'],
                            ['Marina Saída',   t.marina_saida || '—'],
                            ['Marina Chegada', t.marina_chegada || '—'],
                            ['Duração',        t.duracao || '—'],
                            ['Capacidade',     `${t.capacity} pessoas`],
                            ['Mínimo',         (t as any).minimo_tripulantes ? `${(t as any).minimo_tripulantes} confirmados` : '—'],
                            ['Preço',          `${priceDisplay}/pessoa`],
                            ['Bebidas',        ({ inclusas: '🍾 Inclusas', nao_inclusas: '🚫 Não inclusas', traga: '🎒 Traga a sua' } as any)[(t as any).bebidas] || '—'],
                            ['Comida',         ({ inclusa: '🍽️ Inclusa', nao_inclusa: '🚫 Não inclusa' } as any)[(t as any).comida] || '—'],
                            ['Bar',            ({ tem: '🍹 Tem bar', nao_tem: '🚫 Sem bar' } as any)[(t as any).bar] || '—'],
                          ] as [string, string][]).map(([l, v]) => (
                            <div key={l} className="bg-white px-4 py-3 border border-gray-100">
                              <p className="text-[9px] font-semibold text-gray-400 uppercase">{l}</p>
                              <p className="font-bold text-[#1a2b4a] text-sm mt-0.5">{v}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Descrição */}
                      {t.descricao && (
                        <div>
                          <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em] mb-2">📝 Descrição</p>
                          <div className="bg-white px-5 py-4 border border-gray-100">
                            <p className="text-sm font-bold text-gray-600 leading-relaxed">{t.descricao}</p>
                          </div>
                        </div>
                      )}

                      {/* Agenda */}
                      {futureDates.length > 0 && (
                        <div>
                          <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em] mb-3">📅 Agenda</p>
                          <div className="space-y-2">
                            {futureDates.map((entry: any, i: number) => {
                              const [y, m, d] = entry.date.split('-');
                              const spotsLeft  = Math.max(0, entry.spots - confirmedPax);
                              return (
                                <div
                                  key={i}
                                  className={`bg-white px-5 py-3.5 border-2 ${spotsLeft > 0 ? 'border-[#c9a96e]/20' : 'border-gray-100 opacity-60'}`}
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <p className="font-bold text-[#1a2b4a] text-sm">{d}/{m}/{y}</p>
                                    <span className={`text-[10px] font-semibold px-2.5 py-0.5 ${spotsLeft > 3 ? 'bg-green-100 text-green-700' : spotsLeft > 0 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-500'}`}>
                                      {spotsLeft > 0 ? `${spotsLeft} vaga${spotsLeft !== 1 ? 's' : ''} disponíveis` : 'Esgotado'}
                                    </span>
                                  </div>
                                  {entry.time_slots?.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5">
                                      {entry.time_slots.map((slot: string) => (
                                        <span key={slot} className="text-[10px] font-semibold bg-[#0a1628]/5 border border-[#c9a96e]/30 text-[#1a2b4a] px-2.5 py-1">
                                          {slot}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Reservas do passeio */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em]">🎟️ Reservas deste passeio</p>
                          <span className="text-[10px] font-semibold bg-[#0a1628]/5 text-[#1a2b4a] px-3 py-0.5 border border-[#0a1628]/10">
                            {tripBookings.length} total · {confirmedB.length} confirmadas · {pendingB.length} pendentes
                          </span>
                        </div>
                        {tripBookings.length === 0 ? (
                          <div className="bg-white border-2 border-dashed border-gray-100 py-6 text-center">
                            <p className="text-gray-300 font-semibold text-xs uppercase">Nenhuma reserva para este passeio</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {tripBookings.map(b => {
                              const st = STATUS_MAP[b.status] || { label: b.status, cls: 'bg-gray-100 text-gray-500 border-gray-200' };
                              return (
                                <div key={b.id} className="bg-white border border-gray-100 px-5 py-3 flex items-center gap-4">
                                  <div className="flex-1 min-w-0">
                                    <p className="font-bold text-[#1a2b4a] text-sm truncate">{b.customer_name}</p>
                                    <p className="text-xs text-gray-400 font-bold">
                                      📅 {b.booking_date ? new Date(b.booking_date + 'T12:00').toLocaleDateString('pt-BR') : '—'} · 👥 {b.passengers} pessoa{b.passengers !== 1 ? 's' : ''} · 💰 {fmt(b.total_price)}
                                    </p>
                                  </div>
                                  <span className={`text-[10px] font-semibold uppercase px-2.5 py-1 border-2 flex-shrink-0 ${st.cls}`}>
                                    {st.label}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Gerir fotos */}
                      <div>
                        <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em] mb-3">📷 Gerir Fotos</p>
                        <PhotoAlbumManager
                          entityId={t.id}
                          entityType="trips"
                          initialPhotos={(t as any).photos || []}
                          initialCover={(t as any).cover_photo || ''}
                          onUpdate={(photos, cover) => handlePhotosUpdate(t.id, photos, cover)}
                        />
                      </div>

                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <Pagination {...pg} onPrev={pg.prev} onNext={pg.next} onPage={pg.setPage} />
        </div>
      )}

      {/* Modal de edição */}
      {editingTrip && (() => {
        const boats = getBoats();
        const boat  = boats.find(b => b.id === (editingTrip as any).boat_id);
        const cap   = boat?.capacity ?? editingTrip.capacity ?? 20;
        return (
          <EditTripModal
            trip={editingTrip}
            capacity={cap}
            onClose={() => setEditingTrip(null)}
            onSaved={handleTripSaved}
          />
        );
      })()}
    </div>
  );
}
