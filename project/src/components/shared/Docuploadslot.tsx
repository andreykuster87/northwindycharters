// src/components/shared/DocUploadSlot.tsx
import { useRef } from 'react';
import { Upload, FileText, Trash2, CheckCircle2 } from 'lucide-react';

interface DocUploadSlotProps {
  label:     string;
  sublabel?: string;
  required?: boolean;
  file:      File | null;
  preview:   string | null;
  onSelect:  (f: File, p: string | null) => void;
  onClear:   () => void;
  maxMB?:    number;
}

export function DocUploadSlot({
  label, sublabel, required = false,
  file, preview, onSelect, onClear, maxMB = 8,
}: DocUploadSlotProps) {
  const ref = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > maxMB * 1024 * 1024) {
      alert(`Arquivo muito grande. Máximo ${maxMB}MB.`);
      return;
    }
    if (f.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = ev => onSelect(f, ev.target?.result as string);
      reader.readAsDataURL(f);
    } else {
      onSelect(f, null);
    }
    e.target.value = '';
  };

  return (
    <div>
      <label className="text-[10px] font-black text-blue-900 uppercase tracking-wider ml-1 mb-1.5 flex items-center gap-1.5">
        <Upload className="w-3 h-3"/>
        {label}
        {required
          ? <span className="text-red-400">*</span>
          : <span className="text-gray-300 font-bold normal-case text-[9px]">(opcional)</span>
        }
      </label>
      {sublabel && (
        <p className="text-[10px] text-gray-400 font-bold ml-1 mb-1.5">{sublabel}</p>
      )}
      <input ref={ref} type="file" accept="image/*,.pdf" onChange={handleChange} className="hidden"/>

      {!file ? (
        <button type="button" onClick={() => ref.current?.click()}
          className="w-full border-2 border-dashed border-blue-200 rounded-[18px] py-6 flex flex-col items-center gap-2 hover:border-blue-900 hover:bg-blue-50 transition-all group">
          <div className="w-10 h-10 bg-blue-100 group-hover:bg-blue-900 rounded-full flex items-center justify-center transition-all">
            <Upload className="w-4 h-4 text-blue-400 group-hover:text-white transition-all"/>
          </div>
          <div className="text-center">
            <p className="font-black text-blue-900 text-sm">Clique para enviar</p>
            <p className="text-xs text-gray-400 font-bold mt-0.5">JPG, PNG ou PDF · Máx {maxMB}MB</p>
          </div>
        </button>
      ) : (
        <div className="border-2 border-blue-200 rounded-[18px] overflow-hidden">
          {preview ? (
            <div className="relative">
              <img src={preview} alt={label} className="w-full max-h-40 object-contain bg-gray-50"/>
              <button type="button" onClick={onClear}
                className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-all">
                <Trash2 className="w-3.5 h-3.5"/>
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 bg-blue-50">
              <div className="flex items-center gap-3">
                <FileText className="w-7 h-7 text-blue-400"/>
                <div>
                  <p className="font-black text-blue-900 text-sm truncate max-w-[180px]">{file.name}</p>
                  <p className="text-xs text-gray-400 font-bold">{(file.size / 1024).toFixed(0)} KB</p>
                </div>
              </div>
              <button type="button" onClick={onClear} className="text-red-400 hover:text-red-600 p-1.5 transition-all">
                <Trash2 className="w-4 h-4"/>
              </button>
            </div>
          )}
          <div className="px-4 py-2 bg-green-50 border-t border-green-100 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0"/>
            <p className="text-xs font-black text-green-700">Pronto para envio</p>
          </div>
        </div>
      )}
    </div>
  );
}