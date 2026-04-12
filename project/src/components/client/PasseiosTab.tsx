// src/components/client/PasseiosTab.tsx
import { useState, useEffect, useMemo, useRef } from 'react';
import { MapPin, CalendarDays, Users, Search, X, ChevronDown } from 'lucide-react';
import { TripCarousel } from '../shared/TripCard';
import type { CatalogBoat } from '../../services/catalog';

interface Props {
  allBoats: CatalogBoat[];
  onSelect: (b: CatalogBoat, date?: string, slot?: string) => void;
}

export function PasseiosTab({ allBoats, onSelect }: Props) {
  const [activeCity,   setActiveCity]   = useState<string | null>(null);
  const [activeDate,   setActiveDate]   = useState('');
  const [dateDisplay,  setDateDisplay]  = useState('');
  const [activePeople, setActivePeople] = useState<number | null>(null);
  const [dropOpen,     setDropOpen]     = useState(false);
  const [peopleOpen,   setPeopleOpen]   = useState(false);
  const [searchQuery,  setSearchQuery]  = useState('');
  const dropRef   = useRef<HTMLDivElement>(null);
  const peopleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (dropRef.current   && !dropRef.current.contains(e.target as Node))   setDropOpen(false);
      if (peopleRef.current && !peopleRef.current.contains(e.target as Node)) setPeopleOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const cityMap = useMemo(() => {
    const map: Record<string, { label: string; count: number }> = {};
    allBoats.forEach(b => {
      const raw = b.city?.trim() || b.marina_saida?.trim() || '';
      if (!raw) return;
      const key = raw.toLowerCase();
      if (!map[key]) map[key] = { label: raw, count: 0 };
      map[key].count++;
    });
    return map;
  }, [allBoats]);

  const uniqueCities = Object.entries(cityMap)
    .sort((a, b) => b[1].count - a[1].count)
    .map(([key, { label, count }]) => ({ key, label, count }));

  const q = searchQuery.toLowerCase().trim();
  const filteredCities = q ? uniqueCities.filter(c => c.label.toLowerCase().includes(q)) : uniqueCities;

  const filteredBoats = useMemo(() => allBoats.filter(b => {
    if (activeCity) {
      const city = (b.city?.trim() || b.marina_saida?.trim() || '').toLowerCase();
      if (city !== activeCity) return false;
    }
    if (activePeople && b.capacity < activePeople) return false;
    if (activeDate) {
      const dates = (b.schedule || []).map((s: any) => s.date);
      if (!dates.includes(activeDate)) return false;
    }
    return true;
  }), [allBoats, activeCity, activePeople, activeDate]);

  const hasFilters = activeCity || activeDate || activePeople;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-black text-blue-900 uppercase italic">Passeios Disponíveis</h2>
        <p className="text-xs text-gray-400 font-bold mt-0.5">
          {filteredBoats.length} passeio{filteredBoats.length !== 1 ? 's' : ''} encontrado{filteredBoats.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-[18px] border-2 border-gray-100 p-3 flex flex-wrap gap-2">

        {/* Localização */}
        <div className="relative flex-1 min-w-[130px]" ref={dropRef}>
          <button onClick={() => setDropOpen(v => !v)}
            className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-[12px] border-2 font-bold text-xs transition-all text-left ${activeCity ? 'bg-blue-900 text-white border-blue-900' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-blue-900'}`}>
            <MapPin className={`w-3.5 h-3.5 flex-shrink-0 ${activeCity ? 'text-white/70' : 'text-gray-400'}`} />
            <span className="flex-1 truncate">{activeCity ? cityMap[activeCity]?.label : 'Localização'}</span>
            {activeCity
              ? <span onClick={e => { e.stopPropagation(); setActiveCity(null); }} className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <X className="w-2.5 h-2.5 text-white" />
                </span>
              : <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${dropOpen ? 'rotate-180' : ''}`} />
            }
          </button>
          {dropOpen && (
            <div className="absolute left-0 top-full mt-2 bg-white rounded-[16px] shadow-2xl border border-gray-100 w-full min-w-[220px] overflow-hidden z-50">
              <div className="p-2 border-b border-gray-100">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                  <input autoFocus value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Cidade..."
                    className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-[10px] text-xs font-bold text-blue-900 outline-none placeholder:text-gray-300" />
                </div>
              </div>
              <div className="overflow-y-auto max-h-52">
                <button onClick={() => { setActiveCity(null); setDropOpen(false); setSearchQuery(''); }}
                  className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs font-bold hover:bg-blue-50 ${!activeCity ? 'text-blue-900 font-black bg-blue-50' : 'text-gray-600'}`}>
                  🌍 <span className="flex-1">Todos os destinos</span>
                  <span className="text-[9px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-full font-black">{allBoats.length}</span>
                </button>
                {filteredCities.map(({ key, label, count }) => (
                  <button key={key} onClick={() => { setActiveCity(key); setDropOpen(false); setSearchQuery(''); }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-blue-50 ${activeCity === key ? 'text-blue-900 font-black bg-blue-50' : 'text-gray-700 font-bold'}`}>
                    <MapPin className="w-3 h-3 text-gray-300 flex-shrink-0" />
                    <span className="flex-1">{label}</span>
                    <span className="text-[9px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-full font-black">{count}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Data */}
        <div className="relative flex-shrink-0">
          <CalendarDays className={`absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none z-10 ${activeDate ? 'text-white' : 'text-gray-400'}`} />
          <input type="text" inputMode="numeric" placeholder="dd/mm/aaaa"
            value={dateDisplay}
            onChange={e => {
              let raw = e.target.value.replace(/\D/g, '');
              if (raw.length > 8) raw = raw.slice(0, 8);
              let display = raw;
              if (raw.length >= 5) display = raw.slice(0, 2) + '/' + raw.slice(2, 4) + '/' + raw.slice(4);
              else if (raw.length >= 3) display = raw.slice(0, 2) + '/' + raw.slice(2);
              setDateDisplay(display);
              if (raw.length === 8) {
                const dd = raw.slice(0, 2), mm = raw.slice(2, 4), yyyy = raw.slice(4, 8);
                const d = parseInt(dd), m = parseInt(mm), y = parseInt(yyyy);
                if (d >= 1 && d <= 31 && m >= 1 && m <= 12 && y >= 2024) setActiveDate(`${yyyy}-${mm}-${dd}`);
                else setActiveDate('');
              } else { setActiveDate(''); }
            }}
            className={`pl-8 pr-8 py-2.5 rounded-[12px] border-2 font-bold text-xs outline-none appearance-none transition-all ${activeDate ? 'bg-blue-900 text-white border-blue-900 placeholder:text-white/40' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-blue-900 placeholder:text-gray-300'}`}
            style={{ minWidth: 120 }}
          />
          {(activeDate || dateDisplay) && (
            <button onClick={() => { setActiveDate(''); setDateDisplay(''); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-4 h-4 rounded-full bg-white/20 flex items-center justify-center">
              <X className="w-2.5 h-2.5 text-white" />
            </button>
          )}
        </div>

        {/* Pessoas */}
        <div className="relative flex-shrink-0" ref={peopleRef}>
          <button onClick={() => setPeopleOpen(v => !v)}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-[12px] border-2 font-bold text-xs transition-all ${activePeople ? 'bg-blue-900 text-white border-blue-900' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-blue-900'}`}>
            <Users className={`w-3.5 h-3.5 ${activePeople ? 'text-white/70' : 'text-gray-400'}`} />
            <span>{activePeople ? `${activePeople} pax` : 'Pessoas'}</span>
            {activePeople
              ? <span onClick={e => { e.stopPropagation(); setActivePeople(null); }} className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center">
                  <X className="w-2.5 h-2.5 text-white" />
                </span>
              : <ChevronDown className={`w-3.5 h-3.5 text-gray-400 ${peopleOpen ? 'rotate-180' : ''}`} />
            }
          </button>
          {peopleOpen && (
            <div className="absolute right-0 top-full mt-2 bg-white rounded-[16px] shadow-2xl border border-gray-100 overflow-hidden z-50 min-w-[160px]">
              <div className="overflow-y-auto max-h-52">
                <button onClick={() => { setActivePeople(null); setPeopleOpen(false); }}
                  className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs font-bold hover:bg-blue-50 ${!activePeople ? 'text-blue-900 font-black bg-blue-50' : 'text-gray-600'}`}>
                  👥 <span className="flex-1">Qualquer número</span>
                </button>
                {[1,2,3,4,5,6,7,8,10,12,15,20].map(n => (
                  <button key={n} onClick={() => { setActivePeople(n); setPeopleOpen(false); }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-blue-50 ${activePeople === n ? 'text-blue-900 font-black bg-blue-50' : 'text-gray-700 font-bold'}`}>
                    <Users className="w-3 h-3 text-gray-300 flex-shrink-0" />
                    <span>{n} pessoa{n !== 1 ? 's' : ''}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {hasFilters && (
          <button onClick={() => { setActiveCity(null); setActiveDate(''); setActivePeople(null); }}
            className="text-[10px] font-black text-red-400 hover:text-red-600 px-2 py-1 rounded-lg hover:bg-red-50 transition-all flex-shrink-0">
            Limpar
          </button>
        )}
      </div>

      <TripCarousel boats={filteredBoats} onSelect={onSelect} />
    </div>
  );
}
