// src/components/client/ClientRegWidgets.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Componentes partilhados pelo registo de clientes:
// ScrollColumn, BirthDatePicker, CountryDropdown, PhonePrefixDropdown,
// DocTypeDropdown, DocUploadSlot, COUNTRIES, LANGUAGES
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useRef, useEffect } from 'react';
import {
  ChevronDown, Search, Calendar, Upload,
  FileText, Trash2, CheckCircle2, CreditCard,
} from 'lucide-react';
import { DOC_TYPES } from '../../lib/localStore';
import type { DocTypeValue } from '../../lib/localStore';

// ── Constantes ────────────────────────────────────────────────────────────────

export const COUNTRIES = [
  { code: 'BR',    name: 'Brasil',         flag: '🇧🇷', ddi: '+55',  mask: '(##) #####-####', tz: 'America/Sao_Paulo' },
  { code: 'PT',    name: 'Portugal',        flag: '🇵🇹', ddi: '+351', mask: '### ### ###',      tz: 'Europe/Lisbon' },
  { code: 'US',    name: 'Estados Unidos',  flag: '🇺🇸', ddi: '+1',   mask: '(###) ###-####',  tz: 'America/New_York' },
  { code: 'GB',    name: 'Reino Unido',     flag: '🇬🇧', ddi: '+44',  mask: '#### ### ####',   tz: 'Europe/London' },
  { code: 'DE',    name: 'Alemanha',        flag: '🇩🇪', ddi: '+49',  mask: '#### ########',   tz: 'Europe/Berlin' },
  { code: 'FR',    name: 'França',          flag: '🇫🇷', ddi: '+33',  mask: '## ## ## ## ##',  tz: 'Europe/Paris' },
  { code: 'ES',    name: 'Espanha',         flag: '🇪🇸', ddi: '+34',  mask: '### ### ###',     tz: 'Europe/Madrid' },
  { code: 'IT',    name: 'Itália',          flag: '🇮🇹', ddi: '+39',  mask: '### ### ####',    tz: 'Europe/Rome' },
  { code: 'AR',    name: 'Argentina',       flag: '🇦🇷', ddi: '+54',  mask: '(###) ###-####',  tz: 'America/Argentina/Buenos_Aires' },
  { code: 'CL',    name: 'Chile',           flag: '🇨🇱', ddi: '+56',  mask: '# #### ####',     tz: 'America/Santiago' },
  { code: 'CO',    name: 'Colômbia',        flag: '🇨🇴', ddi: '+57',  mask: '### ### ####',    tz: 'America/Bogota' },
  { code: 'MX',    name: 'México',          flag: '🇲🇽', ddi: '+52',  mask: '## #### ####',    tz: 'America/Mexico_City' },
  { code: 'JP',    name: 'Japão',           flag: '🇯🇵', ddi: '+81',  mask: '##-####-####',    tz: 'Asia/Tokyo' },
  { code: 'CN',    name: 'China',           flag: '🇨🇳', ddi: '+86',  mask: '### #### ####',   tz: 'Asia/Shanghai' },
  { code: 'AU',    name: 'Austrália',       flag: '🇦🇺', ddi: '+61',  mask: '#### ### ###',    tz: 'Australia/Sydney' },
  { code: 'CA',    name: 'Canadá',          flag: '🇨🇦', ddi: '+1',   mask: '(###) ###-####',  tz: 'America/Toronto' },
  { code: 'NL',    name: 'Holanda',         flag: '🇳🇱', ddi: '+31',  mask: '## ### ####',     tz: 'Europe/Amsterdam' },
  { code: 'SE',    name: 'Suécia',          flag: '🇸🇪', ddi: '+46',  mask: '##-### ## ##',    tz: 'Europe/Stockholm' },
  { code: 'NO',    name: 'Noruega',         flag: '🇳🇴', ddi: '+47',  mask: '### ## ###',      tz: 'Europe/Oslo' },
  { code: 'CH',    name: 'Suíça',           flag: '🇨🇭', ddi: '+41',  mask: '## ### ## ##',    tz: 'Europe/Zurich' },
  { code: 'ZA',    name: 'África do Sul',   flag: '🇿🇦', ddi: '+27',  mask: '## ### ####',     tz: 'Africa/Johannesburg' },
  { code: 'AE',    name: 'Emirados Árabes', flag: '🇦🇪', ddi: '+971', mask: '## ### ####',     tz: 'Asia/Dubai' },
  { code: 'OTHER', name: 'Outro',           flag: '🌍',  ddi: '+',    mask: '##############',  tz: 'UTC' },
] as const;

export type Country = typeof COUNTRIES[number];

export const LANGUAGES = [
  { code: 'pt-BR', label: 'Português (Brasil)' },
  { code: 'pt-PT', label: 'Português (Portugal)' },
  { code: 'en',    label: 'English' },
  { code: 'es',    label: 'Español' },
  { code: 'fr',    label: 'Français' },
  { code: 'de',    label: 'Deutsch' },
  { code: 'it',    label: 'Italiano' },
  { code: 'ja',    label: '日本語' },
  { code: 'zh',    label: '中文' },
  { code: 'ar',    label: 'العربية' },
];

export const MONTHS = [
  '01 - Janeiro', '02 - Fevereiro', '03 - Março', '04 - Abril',
  '05 - Maio', '06 - Junho', '07 - Julho', '08 - Agosto',
  '09 - Setembro', '10 - Outubro', '11 - Novembro', '12 - Dezembro',
];

// ── Helper ────────────────────────────────────────────────────────────────────

export function applyMask(value: string, mask: string): string {
  const digits = value.replace(/\D/g, '');
  let result = ''; let di = 0;
  for (let i = 0; i < mask.length && di < digits.length; i++) {
    if (mask[i] === '#') result += digits[di++];
    else result += mask[i];
  }
  return result;
}

// ── ScrollColumn ──────────────────────────────────────────────────────────────

export function ScrollColumn({ items, value, onChange, placeholder }: {
  items: string[]; value: string; onChange: (v: string) => void; placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function h(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }
    if (open) document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  return (
    <div ref={ref} className="relative flex-1">
      <button type="button" onClick={() => setOpen(v => !v)}
        className={`w-full bg-gray-50 border py-3.5 px-3 font-medium text-sm text-center transition-all outline-none
          ${value ? 'border-[#c9a96e] text-[#1a2b4a] font-semibold' : 'border-gray-200 text-gray-300'} hover:border-[#c9a96e]/50`}>
        {value || placeholder}
        <ChevronDown className={`w-3 h-3 inline ml-1 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-white border border-[#c9a96e]/30 shadow-2xl overflow-hidden">
          <div className="max-h-48 overflow-y-auto">
            {items.map(item => (
              <button key={item} type="button"
                onClick={() => { onChange(item.split(' ')[0]); setOpen(false); }}
                className={`w-full px-3 py-2.5 text-center text-sm font-medium transition-colors hover:bg-gray-50
                  ${value === item.split(' ')[0] ? 'text-[#1a2b4a] font-semibold' : 'text-gray-400'}`}>
                {item}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── BirthDatePicker ───────────────────────────────────────────────────────────

export function BirthDatePicker({ day, month, year, onDay, onMonth, onYear }: {
  day: string; month: string; year: string;
  onDay: (v: string) => void; onMonth: (v: string) => void; onYear: (v: string) => void;
}) {
  const [rawValue, setRawValue] = useState(() => {
    if (!day && !month && !year) return '';
    return applyMask([day, month, year].join(''), '##/##/####');
  });

  const handleChange = (raw: string) => {
    const masked = applyMask(raw, '##/##/####');
    setRawValue(masked);
    const digits = masked.replace(/\D/g, '');
    onDay(digits.substring(0, 2));
    onMonth(digits.substring(2, 4));
    onYear(digits.substring(4, 8));
  };

  return (
    <div>
      <label className="text-[10px] font-semibold text-[#1a2b4a] uppercase tracking-[0.12em] ml-1 mb-1.5 flex items-center gap-1.5">
        <Calendar className="w-3 h-3 text-[#c9a96e]" /> Data de Nascimento *
      </label>
      <input
        type="text"
        inputMode="numeric"
        value={rawValue}
        onChange={e => handleChange(e.target.value)}
        placeholder="dd/mm/aaaa"
        maxLength={10}
        className="w-full bg-white border border-gray-200 py-3 px-4 font-medium text-[#1a2b4a] outline-none text-sm focus:border-[#c9a96e] transition-all"
      />
    </div>
  );
}

// ── CountryDropdown ───────────────────────────────────────────────────────────

export function CountryDropdown({ value, onChange, label }: {
  value: string; onChange: (c: Country) => void; label: string;
}) {
  const [open, setOpen]     = useState(false);
  const [search, setSearch] = useState('');
  const selected = COUNTRIES.find(c => c.code === value) || COUNTRIES[0];
  const filtered = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.ddi.includes(search)
  );
  return (
    <div className="relative">
      <label className="text-[10px] font-semibold text-[#1a2b4a] uppercase tracking-[0.12em] ml-1 mb-1.5 block">{label}</label>
      <button type="button" onClick={() => setOpen(v => !v)}
        className="w-full bg-gray-50 border border-gray-200 py-3.5 px-4 font-medium text-[#1a2b4a] outline-none transition-all text-sm flex items-center justify-between hover:border-[#c9a96e]/50">
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
              <button key={c.code} type="button" onClick={() => { onChange(c); setOpen(false); setSearch(''); }}
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
  const [open, setOpen]     = useState(false);
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
              <button key={c.code} type="button" onClick={() => { onChange(c); setOpen(false); setSearch(''); }}
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

export function DocTypeDropdown({ value, onChange }: {
  value: DocTypeValue; onChange: (v: DocTypeValue) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = DOC_TYPES.find(d => d.value === value) || DOC_TYPES[0];
  return (
    <div className="relative">
      <label className="text-[10px] font-semibold text-[#1a2b4a] uppercase tracking-[0.12em] ml-1 mb-1.5 flex items-center gap-1.5">
        <CreditCard className="w-3 h-3 text-[#c9a96e]" /> Tipo de Documento *
      </label>
      <button type="button" onClick={() => setOpen(v => !v)}
        className="w-full bg-gray-50 border border-gray-200 py-3.5 px-4 font-medium text-[#1a2b4a] outline-none transition-all text-sm flex items-center justify-between hover:border-[#c9a96e]/50">
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

export function DocUploadSlot({ label, sublabel, required = false, file, preview, onSelect, onClear, maxMB = 8 }: {
  label: string; sublabel?: string; required?: boolean;
  file: File | null; preview: string | null;
  onSelect: (f: File, p: string | null) => void;
  onClear: () => void; maxMB?: number;
}) {
  const ref = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > maxMB * 1024 * 1024) { alert(`Arquivo muito grande. Máximo ${maxMB}MB.`); return; }
    if (f.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = ev => onSelect(f, ev.target?.result as string);
      reader.readAsDataURL(f);
    } else { onSelect(f, null); }
    e.target.value = '';
  };

  return (
    <div>
      <label className="text-[10px] font-semibold text-[#1a2b4a] uppercase tracking-[0.12em] ml-1 mb-1.5 flex items-center gap-1.5">
        <Upload className="w-3 h-3 text-[#c9a96e]" />
        {label}
        {required
          ? <span className="text-red-400">*</span>
          : <span className="text-gray-300 font-medium normal-case">(opcional)</span>}
      </label>
      {sublabel && <p className="text-[10px] text-gray-400 font-medium ml-1 mb-2">{sublabel}</p>}
      <input ref={ref} type="file" accept="image/*,.pdf" onChange={handleChange} className="hidden" />

      {!file ? (
        <button type="button" onClick={() => ref.current?.click()}
          className="w-full border border-dashed border-[#c9a96e]/30 py-6 flex flex-col items-center gap-2 hover:border-[#c9a96e] hover:bg-[#0a1628]/5 transition-all group">
          <div className="w-10 h-10 bg-[#0a1628]/10 group-hover:bg-[#0a1628] flex items-center justify-center transition-all">
            <Upload className="w-4 h-4 text-[#c9a96e] transition-all" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-[#1a2b4a] text-sm">Clique para enviar</p>
            <p className="text-xs text-gray-400 font-medium mt-0.5">JPG, PNG ou PDF · Máx {maxMB}MB</p>
          </div>
        </button>
      ) : (
        <div className="border border-[#c9a96e]/30 overflow-hidden">
          {preview ? (
            <div className="relative">
              <img src={preview} alt={label} className="w-full max-h-36 object-contain bg-gray-50" />
              <button type="button" onClick={onClear}
                className="absolute top-2 right-2 bg-red-500 text-white p-1.5 hover:bg-red-600 transition-all">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 bg-[#0a1628]/5">
              <div className="flex items-center gap-3">
                <FileText className="w-7 h-7 text-[#c9a96e]" />
                <div>
                  <p className="font-semibold text-[#1a2b4a] text-sm truncate max-w-[180px]">{file.name}</p>
                  <p className="text-xs text-gray-400 font-medium">{(file.size / 1024).toFixed(0)} KB</p>
                </div>
              </div>
              <button type="button" onClick={onClear} className="text-red-400 hover:text-red-600 p-1.5 transition-all">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
          <div className="px-4 py-2 bg-[#c9a96e]/5 border-t border-[#c9a96e]/20 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#c9a96e] flex-shrink-0" />
            <p className="text-xs font-semibold text-[#1a2b4a]">Pronto para envio</p>
          </div>
        </div>
      )}
    </div>
  );
}
