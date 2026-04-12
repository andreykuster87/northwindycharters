// src/components/admin/tabs/FrotaTab.tsx
import { useState } from 'react';
import { Plus, AlertTriangle, Search, X } from 'lucide-react';
import {
  type Boat, type Trip, type Booking, type Sailor,
} from '../../../lib/localStore';
import { DossierBoat } from '../../shared/DossierBoat';

// ── Completude da embarcação (igual ao DossierBoat) ───────────────────────────
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

// ── Componente ────────────────────────────────────────────────────────────────
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

  return (
    <>
      <div className="space-y-6">
        {/* Cabeçalho */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-3xl font-black text-blue-900 uppercase italic">
              {role === 'admin' ? 'Frota NorthWindy' : 'Minha Frota'}
            </h2>
            <p className="text-gray-400 font-bold text-sm uppercase mt-1">
              {boats.length} embarcação(ões)
            </p>
          </div>
          {/* Barra de busca */}
          {boats.length > 0 && (
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Nº embarcação ou matrícula..."
                className="w-full bg-white border-2 border-gray-100 rounded-2xl py-2.5 pl-9 pr-8 text-sm font-bold text-blue-900 focus:border-blue-900 outline-none transition-all placeholder:text-gray-300 placeholder:font-normal"
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

        {/* Grelha */}
        {boats.length === 0 ? (
          <div className="bg-white rounded-[40px] p-16 text-center border-2 border-dashed border-gray-200 flex flex-col items-center justify-center min-h-[320px] gap-6">
            <div className="text-6xl">⛵</div>
            <p className="text-gray-400 font-black uppercase italic text-lg">Nenhuma embarcação</p>
            <button onClick={onAddBoat}
              className="bg-blue-900 text-white px-8 py-4 rounded-full font-black uppercase text-sm hover:bg-blue-800 transition-all flex items-center gap-2 shadow-lg">
              <Plus className="w-4 h-4" /> Adicionar Embarcação
            </button>
          </div>
        ) : filteredBoats.length === 0 ? (
          <div className="bg-white rounded-[30px] p-10 text-center border-2 border-dashed border-gray-200 flex flex-col items-center gap-3">
            <Search className="w-8 h-8 text-gray-200" />
            <p className="text-gray-400 font-black uppercase text-sm">Nenhuma embarcação encontrada</p>
            <p className="text-gray-300 font-bold text-xs">"{search}"</p>
            <button onClick={() => setSearch('')} className="text-blue-900 font-black text-xs underline">Limpar filtro</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredBoats.map(b => {
              const boatTrips    = trips.filter(t => t.boat_id === b.id);
              const boatBookings = bookings.filter(bk => boatTrips.some(t => t.id === bk.trip_id));
              const complete     = isBoatComplete(b);

              return (
                <div key={b.id} onClick={() => setSelBoat(b)}
                  className={`bg-white border-2 rounded-[30px] overflow-hidden cursor-pointer hover:shadow-lg transition-all group
                    ${complete ? 'border-blue-100 hover:border-blue-900' : 'border-amber-200 hover:border-amber-400'}`}>

                  {/* Foto de capa */}
                  <div className="relative h-36 bg-blue-50 overflow-hidden">
                    {b.cover_photo
                      ? <img src={b.cover_photo} alt={b.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      : <div className="w-full h-full flex items-center justify-center text-5xl opacity-30">⛵</div>}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    {b.type && (
                      <span className="absolute top-3 right-3 bg-blue-900 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full">
                        {b.type}
                      </span>
                    )}
                    {/* Badge incompleto */}
                    {!complete && (
                      <div className="absolute top-3 left-3 bg-amber-400 text-amber-900 text-[9px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
                        <AlertTriangle className="w-2.5 h-2.5" /> Docs pendentes
                      </div>
                    )}
                    {(b.photos || []).length > 1 && (
                      <span className="absolute bottom-2 right-2 bg-black/50 text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                        📷 {b.photos.length}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-5">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="text-lg font-black text-blue-900 uppercase italic truncate">{b.name}</h3>
                      {(b as any).boat_number && (
                        <span className="bg-blue-900 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full flex-shrink-0">
                          ⚓ {(b as any).boat_number}
                        </span>
                      )}
                    </div>
                    {(b as any).matricula && (
                      <p className="text-[10px] font-bold text-gray-400 uppercase mb-3">
                        Matrícula: <span className="text-blue-900 font-black">{(b as any).matricula}</span>
                      </p>
                    )}
                    <div className="space-y-1.5">
                      {[
                        ['Capacidade', `${b.capacity} pessoas`],
                        ['Passeios',   `${boatTrips.length} publicado${boatTrips.length !== 1 ? 's' : ''}`],
                        ['Reservas',   `${boatBookings.length} no total`],
                        ['Status',     complete ? '● Pronta' : '⚠ Docs pendentes'],
                      ].map(([l, v]) => (
                        <div key={l} className="flex justify-between items-center">
                          <span className="text-gray-400 font-bold text-[10px] uppercase">{l}</span>
                          <span className={`font-black text-xs ${
                            l === 'Status'
                              ? complete ? 'text-green-600' : 'text-amber-600'
                              : 'text-blue-900'
                          }`}>{v}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-50 text-center">
                      <span className="text-[10px] font-black text-blue-900 uppercase opacity-0 group-hover:opacity-100 transition-opacity">
                        Ver dossiê completo →
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Card adicionar */}
            <div onClick={onAddBoat}
              className="bg-white border-2 border-dashed border-gray-200 rounded-[30px] p-6 cursor-pointer hover:border-blue-900 transition-all flex flex-col items-center justify-center min-h-[200px] gap-3 group">
              <div className="w-12 h-12 bg-gray-100 group-hover:bg-blue-900 rounded-full flex items-center justify-center transition-all">
                <Plus className="w-6 h-6 text-gray-400 group-hover:text-white" />
              </div>
              <p className="font-black text-gray-400 group-hover:text-blue-900 uppercase text-xs">Nova Embarcação</p>
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