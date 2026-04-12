// src/components/sailor/SailorSharedComponents.tsx
import { useState, useRef } from 'react';
import { Globe, Search, ChevronDown, CheckCircle2, CreditCard, Upload, Trash2, FileText } from 'lucide-react';
import { COUNTRIES, type Country } from '../../constants/sailorConstants';
import { DOC_TYPES } from '../../lib/localStore';
import type { DocTypeValue } from '../../lib/localStore';

// ── CountryDropdown ───────────────────────────────────────────────────────────

export function CountryDropdown({ value, onChange, label }: {
  value: string; onChange: (c: Country) => void; label: string;
}) {
  const [open,   setOpen]   = useState(false);
  const [search, setSearch] = useState('');
  const selected = COUNTRIES.find(c => c.code === value) || COUNTRIES[0];
  const filtered = COUNTRIES.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="relative">
      <label className="text-[10px] font-black text-blue-900 uppercase tracking-wider ml-1 mb-1.5 flex items-center gap-1.5">
        <Globe className="w-3 h-3" /> {label}
      </label>
      <button type="button" onClick={() => setOpen(v => !v)}
        className="w-full bg-gray-50 border-2 border-gray-100 rounded-[18px] py-4 px-5 font-bold text-blue-900 outline-none transition-all text-sm flex items-center justify-between hover:border-blue-300">
        <span className="flex items-center gap-3">
          <span className="text-xl">{selected.flag}</span>
          <span className="font-black">{selected.name}</span>
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-50 top-full mt-2 left-0 right-0 bg-white border-2 border-blue-900 rounded-[20px] shadow-2xl overflow-hidden max-h-64 flex flex-col">
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
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── PhonePrefixDropdown ───────────────────────────────────────────────────────

export function PhonePrefixDropdown({ value, onChange }: {
  value: string; onChange: (c: Country) => void;
}) {
  const [open,   setOpen]   = useState(false);
  const [search, setSearch] = useState('');
  const selected = COUNTRIES.find(c => c.code === value) || COUNTRIES[0];
  const filtered = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.ddi.includes(search)
  );
  return (
    <div className="relative flex-shrink-0">
      <button type="button" onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 h-full pr-2 hover:opacity-70 transition-opacity">
        <span className="text-lg">{selected.flag}</span>
        <span className="font-black text-blue-900 text-sm">{selected.ddi}</span>
        <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-50 top-full left-0 mt-2 bg-white border-2 border-blue-900 rounded-[20px] shadow-2xl overflow-hidden w-64 flex flex-col">
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
              <input autoFocus value={search} onChange={e => setSearch(e.target.value)}
                placeholder="País ou prefixo..."
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-[12px] text-sm font-bold text-blue-900 outline-none" />
            </div>
          </div>
          <div className="overflow-y-auto max-h-52">
            {filtered.map(c => (
              <button key={c.code} type="button"
                onClick={() => { onChange(c); setOpen(false); setSearch(''); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 transition-colors text-left ${c.code === value ? 'bg-blue-50' : ''}`}>
                <span className="text-lg">{c.flag}</span>
                <span className="font-bold text-blue-900 text-sm flex-1">{c.name}</span>
                <span className="text-xs font-black text-gray-400">{c.ddi}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── DocTypeDropdown ───────────────────────────────────────────────────────────

export function DocTypeDropdown({ value, onChange, label }: {
  value: DocTypeValue; onChange: (v: DocTypeValue) => void; label: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = DOC_TYPES.find(d => d.value === value) || DOC_TYPES[0];
  return (
    <div className="relative">
      <label className="text-[10px] font-black text-blue-900 uppercase tracking-wider ml-1 mb-1.5 flex items-center gap-1.5">
        <CreditCard className="w-3 h-3" /> {label}
      </label>
      <button type="button" onClick={() => setOpen(v => !v)}
        className="w-full bg-white border-2 border-gray-100 rounded-[15px] py-3 px-4 font-bold text-blue-900 outline-none transition-all text-sm flex items-center justify-between hover:border-blue-300">
        <span className="font-black">{selected.label}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-50 top-full mt-2 left-0 right-0 bg-white border-2 border-blue-900 rounded-[20px] shadow-2xl overflow-hidden max-h-64 flex flex-col">
          <div className="overflow-y-auto">
            {DOC_TYPES.map(d => (
              <button key={d.value} type="button"
                onClick={() => { onChange(d.value); setOpen(false); }}
                className={`w-full flex items-center gap-3 px-5 py-3.5 hover:bg-blue-50 transition-colors text-left border-b border-gray-50 last:border-0 ${d.value === value ? 'bg-blue-50' : ''}`}>
                <span className="font-bold text-blue-900 text-sm flex-1">{d.label}</span>
                {d.value === value && <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── DocUploadSlot ─────────────────────────────────────────────────────────────

export function DocUploadSlot({
  label, sublabel, required = false,
  file, preview, onSelect, onClear,
}: {
  label: string; sublabel?: string; required?: boolean;
  file: File | null; preview: string | null;
  onSelect: (f: File, p: string | null) => void;
  onClear: () => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f || f.size > 8 * 1024 * 1024) return;
    if (f.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = ev => onSelect(f, ev.target?.result as string);
      reader.readAsDataURL(f);
    } else { onSelect(f, null); }
    e.target.value = '';
  };
  return (
    <div>
      <label className="text-[10px] font-black text-blue-900 uppercase tracking-wider ml-1 mb-1 flex items-center gap-1.5">
        <Upload className="w-3 h-3" />
        {label}
        {required
          ? <span className="text-red-400">*</span>
          : <span className="text-gray-300 font-bold normal-case text-[9px]">(opcional)</span>
        }
      </label>
      {sublabel && <p className="text-[10px] text-gray-400 font-bold ml-1 mb-1.5">{sublabel}</p>}
      <input ref={ref} type="file" accept="image/*,.pdf" onChange={handleChange} className="hidden" />
      {!file ? (
        <button type="button" onClick={() => ref.current?.click()}
          className="w-full border-2 border-dashed border-blue-200 rounded-[15px] py-5 flex flex-col items-center gap-2 hover:border-blue-900 hover:bg-blue-50 transition-all group">
          <div className="w-9 h-9 bg-blue-100 group-hover:bg-blue-900 rounded-full flex items-center justify-center transition-all">
            <Upload className="w-4 h-4 text-blue-400 group-hover:text-white transition-all" />
          </div>
          <div className="text-center">
            <p className="font-black text-blue-900 text-xs">Clique para enviar</p>
            <p className="text-[10px] text-gray-400 font-bold mt-0.5">JPG, PNG ou PDF · Máx 8MB</p>
          </div>
        </button>
      ) : (
        <div className="border-2 border-blue-200 rounded-[15px] overflow-hidden">
          {preview ? (
            <div className="relative">
              <img src={preview} alt={label} className="w-full max-h-32 object-contain bg-gray-50" />
              <button type="button" onClick={onClear}
                className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 bg-blue-50">
              <div className="flex items-center gap-2">
                <FileText className="w-6 h-6 text-blue-400" />
                <div>
                  <p className="font-black text-blue-900 text-xs truncate max-w-[160px]">{file.name}</p>
                  <p className="text-[10px] text-gray-400 font-bold">{(file.size / 1024).toFixed(0)} KB</p>
                </div>
              </div>
              <button type="button" onClick={onClear} className="text-red-400 hover:text-red-600 p-1">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          <div className="px-3 py-1.5 bg-green-50 border-t border-green-100 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
            <p className="text-[10px] font-black text-green-700">Pronto para envio</p>
          </div>
        </div>
      )}
    </div>
  );
}