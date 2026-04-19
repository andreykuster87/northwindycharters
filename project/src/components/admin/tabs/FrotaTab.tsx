// src/components/admin/tabs/FrotaTab.tsx
import { useState } from 'react';
import { Plus, AlertTriangle, Search, X, Ship, ExternalLink } from 'lucide-react';
import { usePagination } from '../../../hooks/usePagination';
import { Pagination }    from '../../shared/Pagination';
import {
  type Boat, type Trip, type Booking, type Sailor,
} from '../../../lib/localStore';
import { DossierBoat } from '../../shared/DossierBoat';

// ── Completude da embarcação ──────────────────────────────────────────────────
function isBoatComplete(boat: Boat): boolean {
  let meta: any = {};
  try { meta = JSON.parse((boat as any).metadata || '{}'); } catch {}
  const docs = meta.docs || {};
  if (!boat.cover_photo) return false;
  if ((boat.photos || []).length < 2) return false;
  if (!docs.licNav?.front && !meta.licNavNr) return false;
  if (!docs.seguro?.front && !meta.seguroNr) return false;
  if (!((boat as any).proprietario || meta.proprietario)) return false;
  if (!(meta.email || (boat as any).email)) return false;
  if (!boat.capacity || boat.capacity < 1) return false;
  return true;
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface FrotaTabProps {
  boats:                 Boat[];
  trips:                 Trip[];
  bookings:              Booking[];
  sailors:               Sailor[];
  role:                  'admin' | 'sailor' | null;
  onAddBoat:             () => void;
  onCreateTrip:          (boat: Boat) => void;
  onFilterByBoat:        (boatId: string) => void;
  onBoatsChange:         (boats: Boat[]) => void;
  onSendToVerification?: () => void;
}

// ── Linha de embarcação ───────────────────────────────────────────────────────
function BoatRow({
  boat, tripsCount, bookingsCount, onClick, onViewProfile,
}: {
  boat: Boat;
  tripsCount: number;
  bookingsCount: number;
  onClick: () => void;
  onViewProfile?: () => void;
}) {
  const complete = isBoatComplete(boat);

  return (
    <div
      onClick={onClick}
      className="flex items-stretch gap-0 cursor-pointer hover:bg-[#0a1628]/[0.03] transition-colors group border-b border-gray-100 last:border-b-0"
    >
      {/* Thumbnail foto */}
      <div className="relative w-24 sm:w-32 flex-shrink-0 overflow-hidden bg-[#0a1628]/5 min-h-[72px]">
        {boat.cover_photo
          ? <img src={boat.cover_photo} alt={boat.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          : <div className="w-full h-full flex items-center justify-center text-3xl opacity-20">⛵</div>
        }
        {/* Badge tipo */}
        {boat.type && (
          <span className="absolute bottom-1 left-1 bg-[#0a1628]/80 text-white text-[8px] font-semibold uppercase px-1.5 py-0.5">
            {boat.type}
          </span>
        )}
        {/* Badge docs pendentes */}
        {!complete && (
          <div className="absolute top-1 left-1 bg-amber-400 text-amber-900 text-[8px] font-semibold px-1.5 py-0.5 flex items-center gap-0.5">
            <AlertTriangle className="w-2.5 h-2.5" />
          </div>
        )}
      </div>

      {/* Conteúdo principal */}
      <div className="flex-1 min-w-0 flex items-center px-4 py-3 gap-3">
        {/* Nome + matrícula */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-bold text-[#1a2b4a] uppercase text-sm truncate">
              {boat.name}
            </p>
            {(boat as any).boat_number && (
              <span className="bg-[#0a1628] text-white text-[8px] font-semibold uppercase px-1.5 py-0.5 flex-shrink-0 flex items-center gap-0.5">
                ⚓ {(boat as any).boat_number}
              </span>
            )}
          </div>
          {(boat as any).matricula && (
            <p className="text-[10px] font-bold text-gray-400 uppercase mt-0.5">
              Matrícula: <span className="text-[#1a2b4a]">{(boat as any).matricula}</span>
            </p>
          )}
        </div>

        {/* Stats — ocultas em mobile muito pequeno */}
        <div className="hidden sm:flex items-center gap-4 flex-shrink-0">
          {[
            ['👥', `${boat.capacity ?? '—'} pax`],
            ['🧭', `${tripsCount} passeio${tripsCount !== 1 ? 's' : ''}`],
            ['📋', `${bookingsCount} reserva${bookingsCount !== 1 ? 's' : ''}`],
          ].map(([icon, val]) => (
            <div key={val} className="text-center">
              <p className="text-[9px] font-semibold text-gray-400 uppercase leading-tight">{icon}</p>
              <p className="text-xs font-bold text-[#1a2b4a]">{val}</p>
            </div>
          ))}
        </div>

        {/* Status badge + botão perfil */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {onViewProfile && (
            <button
              onClick={e => { e.stopPropagation(); onViewProfile(); }}
              title="Ver perfil da embarcação"
              className="flex items-center gap-1 text-[9px] font-semibold uppercase px-2 py-1 bg-[#0a1628]/5 text-[#1a2b4a] hover:bg-[#c9a96e]/15 hover:text-[#c9a96e] transition-colors border border-[#0a1628]/10">
              <ExternalLink className="w-3 h-3" /> Perfil
            </button>
          )}
          {complete ? (
            <span className="text-[10px] font-semibold text-green-600 bg-green-50 border border-green-100 px-2 py-1 flex items-center gap-1">
              ● Pronta
            </span>
          ) : (
            <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-1 flex items-center gap-1">
              <AlertTriangle className="w-2.5 h-2.5" /> Docs
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export function FrotaTab({
  boats, trips, bookings, sailors, role,
  onAddBoat, onCreateTrip, onFilterByBoat, onBoatsChange,
  onSendToVerification,
}: FrotaTabProps) {
  const [selBoat, setSelBoat] = useState<Boat | null>(null);
  const [search,  setSearch]  = useState('');

  const filteredBoats = boats.filter(b => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return (
      ((b as any).boat_number || '').toLowerCase().includes(q) ||
      ((b as any).matricula   || '').toLowerCase().includes(q) ||
      (b.bie_number           || '').toLowerCase().includes(q) ||
      b.name.toLowerCase().includes(q)
    );
  });

  const pg = usePagination(filteredBoats, 20);

  return (
    <>
      <div className="space-y-6">
        {/* Cabeçalho */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="font-['Playfair_Display'] font-bold text-3xl text-[#1a2b4a]">
              {role === 'admin' ? 'Frota NorthWindy' : 'Minha Frota'}
            </h2>
            <p className="text-gray-400 font-bold text-sm uppercase mt-1">
              {boats.length} embarcação(ões)
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Busca */}
            {boats.length > 0 && (
              <div className="relative min-w-[200px] max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Nº embarcação ou matrícula..."
                  className="w-full bg-white border-2 border-gray-100 py-2.5 pl-9 pr-8 text-sm font-bold text-[#1a2b4a] focus:border-[#c9a96e] outline-none transition-all placeholder:text-gray-300 placeholder:font-normal"
                />
                {search && (
                  <button onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Botão adicionar embarcação — centrado no painel */}
        {boats.length > 0 && (
          <div className="flex justify-center">
            <button onClick={onAddBoat}
              className="bg-[#0a1628] text-white px-6 py-3 font-semibold uppercase text-xs hover:bg-[#0a1628]/90 transition-all flex items-center gap-2">
              <Plus className="w-4 h-4" /> Adicionar Embarcação
            </button>
          </div>
        )}

        {/* Vazio */}
        {boats.length === 0 ? (
          <div className="bg-white p-16 text-center border-2 border-dashed border-gray-200 flex flex-col items-center justify-center min-h-[320px] gap-6">
            <div className="text-6xl">⛵</div>
            <p className="text-gray-400 font-semibold uppercase text-lg">Nenhuma embarcação</p>
            <button onClick={onAddBoat}
              className="bg-[#0a1628] text-white px-8 py-4 font-semibold uppercase text-sm hover:bg-[#0a1628]/90 transition-all flex items-center gap-2 shadow-lg">
              <Plus className="w-4 h-4" /> Adicionar Embarcação
            </button>
          </div>
        ) : filteredBoats.length === 0 ? (
          <div className="bg-white p-10 text-center border-2 border-dashed border-gray-200 flex flex-col items-center gap-3">
            <Search className="w-8 h-8 text-gray-200" />
            <p className="text-gray-400 font-semibold uppercase text-sm">Nenhuma embarcação encontrada</p>
            <p className="text-gray-300 font-bold text-xs">"{search}"</p>
            <button onClick={() => setSearch('')} className="text-[#1a2b4a] font-semibold text-xs underline">Limpar filtro</button>
          </div>
        ) : (
          <div className="space-y-0">
            <div className="bg-white border-2 border-[#0a1628]/5 overflow-hidden shadow-sm">
              {/* Cabeçalho da lista */}
              <div className="px-5 py-2.5 bg-[#0a1628]/5 border-b border-gray-100 flex items-center justify-between">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Ship className="w-3 h-3" />
                  {filteredBoats.length} embarcação{filteredBoats.length !== 1 ? 'ões' : ''}
                </span>
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider hidden sm:block">
                  Capacidade · Passeios · Reservas · Status
                </span>
              </div>

              {/* Linhas */}
              {pg.paged.map(b => {
                const boatTrips    = trips.filter(t => t.boat_id === b.id);
                const boatBookings = bookings.filter(bk => boatTrips.some(t => t.id === bk.trip_id));
                return (
                  <BoatRow
                    key={b.id}
                    boat={b}
                    tripsCount={boatTrips.length}
                    bookingsCount={boatBookings.length}
                    onClick={() => setSelBoat(b)}
                    onViewProfile={() => setSelBoat(b)}
                  />
                );
              })}
            </div>

            <div className="bg-white border-2 border-[#0a1628]/5 mt-0 border-t-0">
              <Pagination {...pg} onPrev={pg.prev} onNext={pg.next} onPage={pg.setPage} />
            </div>
          </div>
        )}
      </div>

      {/* ── Dossiê ── */}
      {selBoat && (
        <DossierBoat
          boat={selBoat}
          sailors={sailors}
          mode="active"
          role={role}
          onClose={() => setSelBoat(null)}
          onCreateTrip={onCreateTrip}
          onFilterByBoat={onFilterByBoat}
          onBoatsChange={onBoatsChange}
          onSendToVerification={onSendToVerification}
        />
      )}
    </>
  );
}
