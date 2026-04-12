// src/components/pages/hero/FilteredResults.tsx
import { RefObject } from 'react';
import { MapPin, Users, Search, X, ShieldCheck, ArrowRight } from 'lucide-react';
import type { CatalogBoat } from '../../services/catalog';
import type { ScheduleData } from '../../modals/TimeSlotsModal';
import { formatPrice, parseLocation } from '../../../utils/catalogUtils';

interface Props {
  filteredResultsRef: RefObject<HTMLDivElement>;
  filteredBoats: CatalogBoat[];
  schedulesMap: Map<string, ScheduleData[]>;
  activeCity: string | null;
  activePeople: number | null;
  activeDate: string;
  onSelectBoat: (boat: CatalogBoat) => void;
  onClearFilters: () => void;
}

export function FilteredResults({
  filteredResultsRef, filteredBoats, schedulesMap,
  activeCity, activePeople, activeDate,
  onSelectBoat, onClearFilters,
}: Props) {
  return (
    <div ref={filteredResultsRef} className="relative z-30 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-6xl mx-auto px-4 md:px-8 pt-10 pb-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-blue-950 font-black text-lg md:text-2xl">
              {filteredBoats.length} resultado{filteredBoats.length !== 1 ? 's' : ''}
              {activeCity && <span className="text-orange-500"> em {activeCity}</span>}
              {activePeople && <span className="text-gray-400 text-sm font-bold ml-2">· {activePeople}+ pessoas</span>}
              {activeDate && <span className="text-gray-400 text-sm font-bold ml-2">· {activeDate.split('-').reverse().join('/')}</span>}
            </h2>
            <p className="text-gray-400 text-xs md:text-sm font-bold mt-1">Passeios disponíveis para a sua seleção</p>
          </div>
          <button
            onClick={onClearFilters}
            className="flex items-center gap-1.5 text-gray-400 hover:text-red-500 text-xs font-black uppercase tracking-wide transition-colors">
            <X className="w-3.5 h-3.5" />
            Limpar filtros
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 pb-12">
        {filteredBoats.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredBoats.map(boat => {
              const schedule = schedulesMap.get(boat.id) || [];
              return (
                <div
                  key={boat.id}
                  onClick={() => onSelectBoat(boat)}
                  className="overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group rounded-[20px] bg-white border border-gray-100 hover:-translate-y-1 cursor-pointer"
                >
                  <div className="relative overflow-hidden" style={{ height: '180px' }}>
                    {(() => {
                      const validPhoto = (p: string) => p && (p.startsWith('data:image') || p.startsWith('https'));
                      const allPhotos = (boat.photos || []).filter(validPhoto);
                      if (validPhoto(boat.photo_url) && !allPhotos.includes(boat.photo_url)) allPhotos.unshift(boat.photo_url);
                      const photo = allPhotos[0];
                      return photo
                        ? <img src={photo} alt={boat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        : <div className="w-full h-full bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center"><span className="text-5xl opacity-30">⛵</span></div>;
                    })()}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent" />

                    <div className={`absolute top-3 left-3 text-[10px] font-black uppercase px-2.5 py-1 rounded-full z-10 ${schedule.length > 0 ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                      {schedule.length > 0 ? '● Disponível' : 'Esgotado'}
                    </div>

                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-full z-10">
                      {boat.sailor.verified && <ShieldCheck className="w-3 h-3 text-green-400 flex-shrink-0" />}
                      <span className="text-white text-[11px] font-black truncate max-w-[150px]">{boat.sailor.name}</span>
                    </div>

                    {schedule[0] && (
                      <div className="absolute bottom-3 right-3 text-[11px] font-black text-white bg-blue-900/90 px-2 py-0.5 rounded-full backdrop-blur-sm z-10">
                        {schedule[0].date.split('-').reverse().slice(0, 2).join('/')}
                      </div>
                    )}
                  </div>

                  <div className="px-4 pt-3.5 pb-4 space-y-2.5">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-500 text-[11px] font-bold truncate">
                        {boat.city}{boat.country_flag ? ` ${boat.country_flag}` : ''}
                      </span>
                    </div>

                    <p className="font-black text-blue-950 text-sm uppercase italic leading-tight truncate">{boat.name}</p>

                    <div className="flex items-center text-[10px] font-black">
                      <span className="text-gray-700 truncate flex-1 text-left">{parseLocation(boat.marina_location).from}</span>
                      <div className="flex flex-col items-center px-1.5 flex-shrink-0">
                        {boat.duracao
                          ? <span className="text-gray-500 text-[8px] font-black bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded-full whitespace-nowrap">⏱ {boat.duracao}</span>
                          : <ArrowRight className="w-3 h-3 text-gray-300" />
                        }
                      </div>
                      <span className="text-gray-400 truncate flex-1 text-right">
                        {(() => { const { from, to } = parseLocation(boat.marina_location); return to && to !== from ? to : from; })()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <span className="flex items-center gap-1 text-gray-400 text-[10px] font-bold">
                        <Users className="w-3 h-3" /> Até {boat.capacity}
                      </span>
                      <div className="text-right">
                        <span className="text-[8px] text-gray-400 font-black uppercase block">Por pessoa</span>
                        <span className="font-black text-blue-950 text-base leading-none">{formatPrice(boat.price_per_hour, boat)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <Search className="w-7 h-7 text-gray-300" />
            </div>
            <p className="text-gray-400 font-black text-sm">Nenhum passeio encontrado para esta seleção</p>
            <p className="text-gray-300 text-xs font-bold mt-1">Tente ajustar os filtros</p>
          </div>
        )}
      </div>
    </div>
  );
}
