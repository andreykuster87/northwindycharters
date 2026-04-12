// src/components/CreateTripModal/shared/CountryDropdown.tsx
import { useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { COUNTRIES, type Country } from '../../constants/constants';

export function CountryDropdown({ value, onChange }: {
  value: string;
  onChange: (c: Country) => void;
}) {
  const [open,   setOpen]   = useState(false);
  const [search, setSearch] = useState('');

  const selected = COUNTRIES.find(c => c.code === value) || COUNTRIES[0];
  const filtered = COUNTRIES.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen(v => !v)}
        className="w-full bg-gray-50 border-2 border-gray-100 rounded-[18px] py-4 px-5 font-bold text-blue-900 outline-none transition-all text-sm flex items-center justify-between hover:border-blue-300">
        <span className="flex items-center gap-3">
          <span className="text-xl">{selected.flag}</span>
          <span className="font-black">{selected.name}</span>
          <span className="text-gray-400 text-xs font-bold">{selected.currency} · {selected.symbol}</span>
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-50 top-full mt-2 left-0 right-0 bg-white border-2 border-blue-900 rounded-[20px] shadow-2xl overflow-hidden max-h-60 flex flex-col">
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
              <input autoFocus value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Buscar país..."
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-[12px] text-sm font-bold text-blue-900 outline-none" />
            </div>
          </div>
          <div className="overflow-y-auto">
            {filtered.map(c => (
              <button key={c.code} type="button"
                onClick={() => { onChange(c); setOpen(false); setSearch(''); }}
                className={`w-full flex items-center gap-3 px-5 py-3 hover:bg-blue-50 transition-colors text-left ${c.code === value ? 'bg-blue-50' : ''}`}>
                <span className="text-lg">{c.flag}</span>
                <span className="font-bold text-blue-900 text-sm flex-1">{c.name}</span>
                <span className="text-gray-400 text-xs font-bold">{c.symbol}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}