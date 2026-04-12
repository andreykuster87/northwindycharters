// src/components/shared/ScrollCol.tsx
import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export function ScrollCol({ items, value, onChange, placeholder }: {
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
        className={`w-full bg-gray-50 border-2 rounded-[14px] py-3 px-2 font-bold text-sm text-center transition-all outline-none
          ${value ? 'border-blue-900 text-blue-900 font-black' : 'border-gray-100 text-gray-300'} hover:border-blue-300`}>
        {value || placeholder}
        <ChevronDown className={`w-3 h-3 inline ml-0.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-white border-2 border-blue-900 rounded-[16px] shadow-2xl overflow-hidden">
          <div className="max-h-44 overflow-y-auto">
            {items.map(item => (
              <button key={item} type="button"
                onClick={() => { onChange(item.split(' ')[0]); setOpen(false); }}
                className={`w-full px-2 py-2.5 text-center text-xs font-bold transition-colors hover:bg-blue-50
                  ${value === item.split(' ')[0] ? 'bg-blue-900 text-white font-black' : 'text-blue-900'}`}>
                {item}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}