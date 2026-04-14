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
      <label className="text-[10px] font-semibold text-[#1a2b4a] uppercase tracking-[0.12em] ml-1 mb-1.5 flex items-center gap-1.5">
        <Globe className="w-3 h-3 text-[#c9a96e]" /> {label}
      </label>
      <button type="button" onClick={() => setOpen(v => !v)}
        className="w-full bg-gray-50 border border-gray-200 py-3.5 px-4 font-medium text-[#1a2b4a] outline-none transition-all text-sm flex items-center justify-between hover:border-[#c9a96e]/50 focus:border-[#c9a96e]">
        <span className="flex items-center gap-3">
          <span className="text-xl">{selected.flag}</span>
          <span className="font-semibold">{selected.name}</span>
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-white border border-[#c9a96e]/30 shadow-2xl overflow-hidden max-h-64 flex flex-col">
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
              <input autoFocus value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Buscar país..."
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-100 text-sm font-medium text-[#1a2b4a] outline-none focus:border-[#c9a96e]" />
            </div>
          </div>
          <div className="overflow-y-auto">
            {filtered.map(c => (
              <button key={c.code} type="button"
                onClick={() => { onChange(c); setOpen(false); setSearch(''); }}
                className={`w-full flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors text-left ${c.code === value ? 'bg-[#0a1628]/5' : ''}`}>
                <span className="text-lg">{c.flag}</span>
                <span className="font-medium text-[#1a2b4a] text-sm flex-1">{c.name}</span>
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
        <span className="font-semibold text-[#1a2b4a] text-sm">{selected.ddi}</span>
        <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-50 top-full left-0 mt-1 bg-white border border-[#c9a96e]/30 shadow-2xl overflow-hidden w-64 flex flex-col">
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
              <input autoFocus value={search} onChange={e => setSearch(e.target.value)}
                placeholder="País ou prefixo..."
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-100 text-sm font-medium text-[#1a2b4a] outline-none" />
            </div>
          </div>
          <div className="overflow-y-auto max-h-52">
            {filtered.map(c => (
              <button key={c.code} type="button"
                onClick={() => { onChange(c); setOpen(false); setSearch(''); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left ${c.code === value ? 'bg-[#0a1628]/5' : ''}`}>
                <span className="text-lg">{c.flag}</span>
                <span className="font-medium text-[#1a2b4a] text-sm flex-1">{c.name}</span>
                <span className="text-xs font-semibold text-gray-400">{c.ddi}</span>
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
      <label className="text-[10px] font-semibold text-[#1a2b4a] uppercase tracking-[0.12em] ml-1 mb-1.5 flex items-center gap-1.5">
        <CreditCard className="w-3 h-3 text-[#c9a96e]" /> {label}
      </label>
      <button type="button" onClick={() => setOpen(v => !v)}
        className="w-full bg-white border border-gray-200 py-3 px-4 font-medium text-[#1a2b4a] outline-none transition-all text-sm flex items-center justify-between hover:border-[#c9a96e]/50">
        <span className="font-semibold">{selected.label}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-white border border-[#c9a96e]/30 shadow-2xl overflow-hidden max-h-64 flex flex-col">
          <div className="overflow-y-auto">
            {DOC_TYPES.map(d => (
              <button key={d.value} type="button"
                onClick={() => { onChange(d.value); setOpen(false); }}
                className={`w-full flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-0 ${d.value === value ? 'bg-[#0a1628]/5' : ''}`}>
                <span className="font-medium text-[#1a2b4a] text-sm flex-1">{d.label}</span>
                {d.value === value && <CheckCircle2 className="w-4 h-4 text-[#c9a96e] flex-shrink-0" />}
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
      <label className="text-[10px] font-semibold text-[#1a2b4a] uppercase tracking-[0.12em] ml-1 mb-1 flex items-center gap-1.5">
        <Upload className="w-3 h-3 text-[#c9a96e]" />
        {label}
        {required
          ? <span className="text-red-400">*</span>
          : <span className="text-gray-300 font-medium normal-case text-[9px]">(opcional)</span>
        }
      </label>
      {sublabel && <p className="text-[10px] text-gray-400 font-medium ml-1 mb-1.5">{sublabel}</p>}
      <input ref={ref} type="file" accept="image/*,.pdf" onChange={handleChange} className="hidden" />
      {!file ? (
        <button type="button" onClick={() => ref.current?.click()}
          className="w-full border border-dashed border-[#c9a96e]/30 py-5 flex flex-col items-center gap-2 hover:border-[#c9a96e] hover:bg-[#0a1628]/5 transition-all group">
          <div className="w-9 h-9 bg-[#0a1628]/10 group-hover:bg-[#0a1628] flex items-center justify-center transition-all">
            <Upload className="w-4 h-4 text-[#c9a96e] transition-all" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-[#1a2b4a] text-xs">Clique para enviar</p>
            <p className="text-[10px] text-gray-400 font-medium mt-0.5">JPG, PNG ou PDF · Máx 8MB</p>
          </div>
        </button>
      ) : (
        <div className="border border-[#c9a96e]/30 overflow-hidden">
          {preview ? (
            <div className="relative">
              <img src={preview} alt={label} className="w-full max-h-32 object-contain bg-gray-50" />
              <button type="button" onClick={onClear}
                className="absolute top-2 right-2 bg-red-500 text-white p-1.5 hover:bg-red-600">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 bg-[#0a1628]/5">
              <div className="flex items-center gap-2">
                <FileText className="w-6 h-6 text-[#c9a96e]" />
                <div>
                  <p className="font-semibold text-[#1a2b4a] text-xs truncate max-w-[160px]">{file.name}</p>
                  <p className="text-[10px] text-gray-400 font-medium">{(file.size / 1024).toFixed(0)} KB</p>
                </div>
              </div>
              <button type="button" onClick={onClear} className="text-red-400 hover:text-red-600 p-1">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          <div className="px-3 py-1.5 bg-[#c9a96e]/5 border-t border-[#c9a96e]/20 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#c9a96e] flex-shrink-0" />
            <p className="text-[10px] font-semibold text-[#1a2b4a]">Pronto para envio</p>
          </div>
        </div>
      )}
    </div>
  );
}
