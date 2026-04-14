// src/components/ClientArea/components/CityFilter.tsx
import { useState, useEffect, useRef } from 'react';
import { X, Filter, ChevronDown, MapPin, Check } from 'lucide-react';
import { type CatalogBoat, parseLocation } from '../utils/clientHelpers';

interface CityFilterProps {
  boats:      CatalogBoat[];
  activeCity: string | null;
  onChange:   (city: string | null) => void;
}

type CountryGroup = {
  flag:   string;
  name:   string;
  code:   string;
  cities: { label: string; count: number }[];
};

export function CityFilter({ boats, activeCity, onChange }: CityFilterProps) {
  const [open,            setOpen]           = useState(false);
  const [expandedCountry, setExpandedCountry] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setExpandedCountry(null);
      }
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const groups: CountryGroup[] = [];
  boats.forEach(b => {
    const city = b.city?.trim() || b.marina_saida?.trim() || parseLocation(b.marina_location).from;
    const flag = b.country_flag || '🌍';
    const name = b.country_name || 'Outro';
    const code = flag + name;
    let group = groups.find(g => g.code === code);
    if (!group) { group = { flag, name, code, cities: [] }; groups.push(group); }
    const existing = group.cities.find(c => c.label === city);
    if (existing) existing.count++;
    else if (city) group.cities.push({ label: city, count: 1 });
  });
  groups.sort((a, b) => a.name.localeCompare(b.name, 'pt'));
  groups.forEach(g => g.cities.sort((a, b) => a.label.localeCompare(b.label, 'pt')));

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => { setOpen(v => !v); if (open) setExpandedCountry(null); }}
        className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 font-bold text-xs uppercase transition-all
          ${activeCity ? 'bg-[#0a1628] text-white border-[#0a1628] shadow-md' : 'bg-white text-[#1a2b4a] border-[#c9a96e]/30 hover:border-[#0a1628]'}`}
      >
        <Filter className="w-3.5 h-3.5" />
        <span className="max-w-[120px] truncate">{activeCity || 'Região'}</span>
        {activeCity && (
          <span
            onClick={e => { e.stopPropagation(); onChange(null); setOpen(false); setExpandedCountry(null); }}
            className="ml-1 w-4 h-4 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/40 transition-all"
          >
            <X className="w-2.5 h-2.5" />
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 bg-white border-2 border-[#0a1628] shadow-2xl overflow-hidden min-w-[260px] animate-in fade-in slide-in-from-top-2 duration-150">
          <button
            onClick={() => { onChange(null); setOpen(false); setExpandedCountry(null); }}
            className={`w-full flex items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-gray-50 ${!activeCity ? 'bg-[#0a1628]/5' : ''}`}
          >
            <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${!activeCity ? 'bg-[#0a1628]' : 'bg-gray-200'}`} />
            <span className={`font-bold text-sm flex-1 ${!activeCity ? 'text-[#1a2b4a]' : 'text-gray-600'}`}>Todas as regiões</span>
            {!activeCity && <Check className="w-3.5 h-3.5 text-[#1a2b4a] flex-shrink-0" />}
          </button>
          <div className="h-px bg-gray-100" />
          {groups.map(group => {
            const isExpanded = expandedCountry === group.code;
            const hasActive  = group.cities.some(c => c.label === activeCity);
            return (
              <div key={group.code}>
                <button
                  onClick={() => setExpandedCountry(isExpanded ? null : group.code)}
                  className={`w-full flex items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-gray-50 ${isExpanded || hasActive ? 'bg-[#0a1628]/5' : ''}`}
                >
                  <span className="text-lg flex-shrink-0">{group.flag}</span>
                  <span className={`font-bold text-sm flex-1 ${hasActive ? 'text-[#1a2b4a]' : 'text-gray-700'}`}>{group.name}</span>
                  <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full flex-shrink-0">
                    {group.cities.reduce((s, c) => s + c.count, 0)}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-[#1a2b4a]' : ''}`} />
                </button>
                {isExpanded && (
                  <div className="bg-[#0a1628]/5 border-t border-[#c9a96e]/20">
                    {group.cities.map(city => {
                      const isC = activeCity === city.label;
                      return (
                        <button
                          key={city.label}
                          onClick={() => { onChange(city.label); setOpen(false); setExpandedCountry(null); }}
                          className={`w-full flex items-center gap-3 pl-12 pr-5 py-2.5 text-left transition-colors hover:bg-gray-50 ${isC ? 'bg-gray-50' : ''}`}
                        >
                          <MapPin className={`w-3.5 h-3.5 flex-shrink-0 ${isC ? 'text-[#1a2b4a]' : 'text-[#c9a96e]'}`} />
                          <span className={`text-sm flex-1 ${isC ? 'font-bold text-[#1a2b4a]' : 'font-bold text-gray-600'}`}>{city.label}</span>
                          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex-shrink-0 ${isC ? 'bg-[#0a1628] text-white' : 'bg-white text-[#1a2b4a] border border-[#c9a96e]/30'}`}>
                            {city.count} passeio{city.count !== 1 ? 's' : ''}
                          </span>
                          {isC && <Check className="w-3.5 h-3.5 text-[#1a2b4a] flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}
                <div className="h-px bg-gray-100 mx-3" />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
