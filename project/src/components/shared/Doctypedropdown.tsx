// src/components/shared/DocTypeDropdown.tsx
import { useState } from 'react';
import { CreditCard, ChevronDown, CheckCircle2 } from 'lucide-react';
import { DOC_TYPES, type DocTypeValue } from '../../lib/localStore';

interface DocTypeDropdownProps {
  value:    DocTypeValue;
  onChange: (v: DocTypeValue) => void;
  label?:   string;
  /** Estilo compacto para usar dentro de cards (padding reduzido) */
  compact?: boolean;
}

export function DocTypeDropdown({
  value, onChange, label = 'Tipo de Documento *', compact = false
}: DocTypeDropdownProps) {
  const [open, setOpen] = useState(false);
  const selected = DOC_TYPES.find(d => d.value === value) || DOC_TYPES[0];

  const btnClass = compact
    ? 'w-full bg-white border-2 border-gray-100 py-3 px-4'
    : 'w-full bg-gray-50 border-2 border-gray-100 py-4 px-5';

  return (
    <div className="relative">
      <label className="text-[10px] font-semibold text-[#1a2b4a] uppercase tracking-wider ml-1 mb-1.5 flex items-center gap-1.5">
        <CreditCard className="w-3 h-3"/> {label}
      </label>
      <button type="button" onClick={() => setOpen(v => !v)}
        className={`${btnClass} font-bold text-[#1a2b4a] outline-none transition-all text-sm flex items-center justify-between hover:border-[#c9a96e]/30`}>
        <span className="font-semibold">{selected.label}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}/>
      </button>

      {open && (
        <div className="absolute z-50 top-full mt-2 left-0 right-0 bg-white border-2 border-[#0a1628] shadow-2xl overflow-hidden max-h-64 flex flex-col">
          <div className="overflow-y-auto">
            {DOC_TYPES.map(d => (
              <button key={d.value} type="button"
                onClick={() => { onChange(d.value); setOpen(false); }}
                className={`w-full flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-0 ${d.value === value ? 'bg-[#0a1628]/5' : ''}`}>
                <span className="font-bold text-[#1a2b4a] text-sm flex-1">{d.label}</span>
                {d.value === value && <CheckCircle2 className="w-4 h-4 text-[#c9a96e] flex-shrink-0"/>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
