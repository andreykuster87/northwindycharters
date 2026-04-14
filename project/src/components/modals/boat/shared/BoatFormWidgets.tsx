// src/components/modals/boat/shared/BoatFormWidgets.tsx
import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Camera } from 'lucide-react';

// ── ScrollSelect ──────────────────────────────────────────────────────────────

export function ScrollSelect({ label, options, value, onChange, required, placeholder }: {
  label: string; options: string[]; value: string;
  onChange: (v: string) => void; required?: boolean; placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  return (
    <div ref={ref} className="relative">
      <label className="block text-xs font-semibold text-[#1a2b4a] uppercase mb-1.5">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <button type="button" onClick={() => setOpen(o => !o)}
        className={`w-full bg-gray-50 border py-3 px-4 font-bold text-sm text-left flex items-center justify-between transition-all
          ${open ? 'border-[#c9a96e]' : 'border-gray-200'} ${value ? 'text-[#1a2b4a]' : 'text-gray-300'}`}>
        <span className="truncate">{value || placeholder || 'Selecionar...'}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 ml-2 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-[#c9a96e] shadow-xl overflow-hidden">
          <div className="max-h-48 overflow-y-auto">
            {options.map(opt => (
              <button key={opt} type="button" onClick={() => { onChange(opt); setOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-sm font-bold transition-colors hover:bg-gray-50
                  ${value === opt ? 'bg-[#0a1628] text-white' : 'text-[#1a2b4a]'}`}>
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Input ─────────────────────────────────────────────────────────────────────

export const BoatInput = ({ label, placeholder, value, onChange, type = 'text', required = false }: {
  label: string; placeholder?: string; value: string;
  onChange: (v: string) => void; type?: string; required?: boolean;
}) => (
  <div>
    <label className="block text-xs font-semibold text-[#1a2b4a] uppercase mb-1.5">
      {label}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
    <input type={type} value={value} placeholder={placeholder}
      onChange={e => onChange(type === 'email' || type === 'number' || type === 'date' ? e.target.value : e.target.value.toUpperCase())}
      className="w-full bg-gray-50 border border-gray-200 py-3 px-4 font-bold text-[#1a2b4a] text-sm focus:border-[#c9a96e] outline-none transition-all placeholder:text-gray-300 placeholder:font-normal uppercase" />
  </div>
);

// ── DateInput ─────────────────────────────────────────────────────────────────

export const DateInput = ({ label, value, onChange }: {
  label: string; value: string; onChange: (v: string) => void;
}) => (
  <div>
    <label className="block text-xs font-semibold text-[#1a2b4a] uppercase mb-1.5">{label}</label>
    <input type="date" value={value} onChange={e => onChange(e.target.value)}
      className="w-full bg-gray-50 border border-gray-200 py-3 px-4 font-bold text-[#1a2b4a] text-sm focus:border-[#c9a96e] outline-none transition-all" />
  </div>
);

// ── YesNo ─────────────────────────────────────────────────────────────────────

export const YesNo = ({ label, value, onChange }: {
  label: string; value: string; onChange: (v: string) => void;
}) => (
  <div>
    <label className="block text-xs font-semibold text-[#1a2b4a] uppercase mb-1.5">{label}</label>
    <div className="flex gap-2">
      {['Sim', 'Não'].map(o => (
        <button key={o} type="button" onClick={() => onChange(o)}
          className={`flex-1 py-3 font-semibold text-sm uppercase border-2 transition-all
            ${value === o ? 'bg-[#0a1628] text-white border-[#0a1628]' : 'bg-gray-50 text-gray-400 border-gray-100 hover:border-[#c9a96e]/30 hover:text-[#1a2b4a]'}`}>
          {o}
        </button>
      ))}
    </div>
  </div>
);

// ── SectionTitle ──────────────────────────────────────────────────────────────

export const SectionTitle = ({ number, title }: { number: string; title: string }) => (
  <div className="flex items-center gap-3 pb-2 border-b border-[#c9a96e]/20 mb-4">
    <span className="bg-[#0a1628] text-white w-7 h-7 flex items-center justify-center text-xs font-semibold flex-shrink-0">{number}</span>
    <h3 className="font-semibold text-[#c9a96e] text-sm uppercase tracking-[0.15em]">{title}</h3>
  </div>
);

// ── DocPhotoSlot ──────────────────────────────────────────────────────────────

export function DocPhotoSlot({ label, value, onPick, onRemove }: {
  label: string; value: string; onPick: () => void; onRemove: () => void;
}) {
  return (
    <div>
      <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">{label}</p>
      {value ? (
        <div className="relative">
          <img src={value} className="w-full h-24 object-cover border border-[#0a1628]" alt={label} />
          <button type="button" onClick={onRemove}
            className="absolute top-1 right-1 bg-red-500 text-white w-5 h-5 flex items-center justify-center text-xs font-bold">×</button>
        </div>
      ) : (
        <button type="button" onClick={onPick}
          className="w-full h-24 border border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 hover:border-[#c9a96e] hover:bg-[#0a1628]/5 transition-all">
          <Camera className="w-5 h-5 text-gray-300" />
          <span className="text-[10px] font-bold text-gray-300">Foto</span>
        </button>
      )}
    </div>
  );
}

// ── pickDocCompressed — compressão agressiva para docs ────────────────────────

export async function pickDocCompressed(): Promise<string | null> {
  return new Promise(resolve => {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = 'image/*';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) { resolve(null); return; }
      const reader = new FileReader();
      reader.onload = e => {
        const img = new Image();
        img.onload = () => {
          const MAX = 800;
          let { width, height } = img;
          if (width > MAX || height > MAX) {
            if (width > height) { height = Math.round(height * MAX / width); width = MAX; }
            else { width = Math.round(width * MAX / height); height = MAX; }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width; canvas.height = height;
          canvas.getContext('2d')?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.55));
        };
        img.onerror = () => resolve(null);
        img.src = e.target?.result as string;
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    };
    document.body.appendChild(input);
    input.click();
    setTimeout(() => { try { document.body.removeChild(input); } catch {} }, 30000);
  });
}

// ── DocIdInput ────────────────────────────────────────────────────────────────

const DOC_ID_TYPES    = ['BI / Cartão de Cidadão', 'Passaporte', 'RG', 'CNH', 'Outro'];
const DOC_ID_COM_VERSO = ['BI / Cartão de Cidadão', 'RG', 'CNH'];

export function DocIdInput({ docType, onDocType, docNr, onDocNr, frontPhoto, backPhoto, onFrontPhoto, onBackPhoto, onRemoveFront, onRemoveBack }: {
  docType: string; onDocType: (v: string) => void;
  docNr: string; onDocNr: (v: string) => void;
  frontPhoto: string; backPhoto: string;
  onFrontPhoto: () => void; onBackPhoto: () => void;
  onRemoveFront: () => void; onRemoveBack: () => void;
}) {
  const hasVerso = DOC_ID_COM_VERSO.includes(docType);
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <ScrollSelect label="Tipo de documento" options={DOC_ID_TYPES} value={docType} onChange={onDocType} />
        <div>
          <label className="block text-xs font-semibold text-[#1a2b4a] uppercase mb-1.5">Número</label>
          <input value={docNr} onChange={e => onDocNr(e.target.value.toUpperCase())} placeholder="Nº DO DOCUMENTO"
            className="w-full bg-gray-50 border border-gray-200 py-3 px-4 font-bold text-[#1a2b4a] text-sm focus:border-[#c9a96e] outline-none transition-all placeholder:text-gray-300 placeholder:font-normal uppercase" />
        </div>
      </div>
      {docType && (
        <div className={`grid ${hasVerso ? 'grid-cols-2' : 'grid-cols-1'} gap-3`}>
          <DocPhotoSlot label="Frente" value={frontPhoto} onPick={onFrontPhoto} onRemove={onRemoveFront} />
          {hasVerso && <DocPhotoSlot label="Verso" value={backPhoto} onPick={onBackPhoto} onRemove={onRemoveBack} />}
        </div>
      )}
    </div>
  );
}
