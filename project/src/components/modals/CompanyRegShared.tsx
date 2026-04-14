// src/components/modals/CompanyRegShared.tsx
// Constantes, tipos e componentes de UI partilhados pelos steps do CompanyRegistrationModal
import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

// ── Constantes ────────────────────────────────────────────────────────────────

export const SETORES = [
  'Charter Náutico', 'Construção Naval', 'Marina / Porto de Recreio',
  'Transporte Marítimo', 'Pesca Comercial', 'Equipamentos Náuticos',
  'Turismo Náutico', 'Seguros Marítimos', 'Escola Náutica',
  'Manutenção & Reparação Naval', 'Logística Marítima', 'Outro',
];

export function fiscalLabel(pais: string): string {
  if (pais === 'BR') return 'CNPJ';
  if (pais === 'US') return 'EIN';
  if (pais === 'PT') return 'NIF / NIPC';
  if (['DE','FR','IT','ES','NL','BE','AT','PL','SE','DK','FI','IE','GR','CZ','HU','RO','BG','HR','SK','SI','EE','LV','LT','LU','MT','CY'].includes(pais)) return 'VAT Number (EU)';
  return 'Número Fiscal';
}

export const DDI_OPTIONS = [
  { code: 'PT', ddi: '+351', flag: '🇵🇹' },
  { code: 'BR', ddi: '+55',  flag: '🇧🇷' },
  { code: 'US', ddi: '+1',   flag: '🇺🇸' },
  { code: 'ES', ddi: '+34',  flag: '🇪🇸' },
  { code: 'FR', ddi: '+33',  flag: '🇫🇷' },
  { code: 'DE', ddi: '+49',  flag: '🇩🇪' },
  { code: 'IT', ddi: '+39',  flag: '🇮🇹' },
  { code: 'GB', ddi: '+44',  flag: '🇬🇧' },
  { code: 'NL', ddi: '+31',  flag: '🇳🇱' },
  { code: 'OTHER', ddi: '', flag: '🌍' },
];

export const PAISES = [
  { code: 'PT', name: 'Portugal',     flag: '🇵🇹' },
  { code: 'BR', name: 'Brasil',       flag: '🇧🇷' },
  { code: 'US', name: 'EUA',          flag: '🇺🇸' },
  { code: 'ES', name: 'Espanha',      flag: '🇪🇸' },
  { code: 'FR', name: 'França',       flag: '🇫🇷' },
  { code: 'DE', name: 'Alemanha',     flag: '🇩🇪' },
  { code: 'IT', name: 'Itália',       flag: '🇮🇹' },
  { code: 'GB', name: 'Reino Unido',  flag: '🇬🇧' },
  { code: 'NL', name: 'Holanda',      flag: '🇳🇱' },
  { code: 'SE', name: 'Suécia',       flag: '🇸🇪' },
  { code: 'NO', name: 'Noruega',      flag: '🇳🇴' },
  { code: 'GR', name: 'Grécia',       flag: '🇬🇷' },
  { code: 'HR', name: 'Croácia',      flag: '🇭🇷' },
  { code: 'MT', name: 'Malta',        flag: '🇲🇹' },
  { code: 'AO', name: 'Angola',       flag: '🇦🇴' },
  { code: 'MZ', name: 'Moçambique',   flag: '🇲🇿' },
  { code: 'OTHER', name: 'Outro',     flag: '🌍' },
];

import { Building2, ShieldCheck, Phone, User } from 'lucide-react';

export const STEPS_META = [
  { icon: Building2,   label: 'Empresa',      sub: 'Informações básicas e localização' },
  { icon: ShieldCheck, label: 'Fiscal',        sub: 'Identificação e registro' },
  { icon: Phone,       label: 'Contato',       sub: 'Comunicação e redes sociais' },
  { icon: User,        label: 'Responsável',   sub: 'Representante legal' },
];

// ── Tipo do formulário ────────────────────────────────────────────────────────

export interface Form {
  razao_social: string; nome_fantasia: string; setores: string[]; setor_outro: string; descricao: string;
  pais: string; pais_nome: string; estado: string; cidade: string; endereco: string; codigo_postal: string;
  numero_registro: string; numero_fiscal: string; pais_fiscal: string; pais_fiscal_nome: string;
  ddi: string; telefone: string; email: string; website: string;
  instagram: string; linkedin: string; facebook: string; outras_redes: string;
  username: string;
  resp_nome: string; resp_cargo: string; resp_email: string; resp_ddi: string; resp_telefone: string;
  declarou_veracidade: boolean; aceitou_termos: boolean;
}

export const EMPTY: Form = {
  razao_social: '', nome_fantasia: '', setores: [], setor_outro: '', descricao: '',
  pais: 'PT', pais_nome: 'Portugal', estado: '', cidade: '', endereco: '', codigo_postal: '',
  numero_registro: '', numero_fiscal: '', pais_fiscal: 'PT', pais_fiscal_nome: 'Portugal',
  ddi: '+351', telefone: '', email: '', website: '',
  instagram: '', linkedin: '', facebook: '', outras_redes: '',
  username: '',
  resp_nome: '', resp_cargo: '', resp_email: '', resp_ddi: '+351', resp_telefone: '',
  declarou_veracidade: false, aceitou_termos: false,
};

// ── Máscara de telefone por DDI ────────────────────────────────────────────────

export function applyPhoneMask(value: string, ddi: string): string {
  const digits = value.replace(/\D/g, '');
  if (ddi === '+351') {
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0,3)} ${digits.slice(3)}`;
    return `${digits.slice(0,3)} ${digits.slice(3,6)} ${digits.slice(6,9)}`;
  }
  if (ddi === '+55') {
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0,2)}) ${digits.slice(2)}`;
    if (digits.length <= 11) return `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7)}`;
    return `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7,11)}`;
  }
  if (ddi === '+1') {
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0,3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6,10)}`;
  }
  if (ddi === '+44') {
    if (digits.length <= 4) return digits;
    return `${digits.slice(0,4)} ${digits.slice(4,10)}`;
  }
  if (['+34','+33','+49','+39','+31'].includes(ddi)) {
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0,3)} ${digits.slice(3)}`;
    return `${digits.slice(0,3)} ${digits.slice(3,6)} ${digits.slice(6,9)}`;
  }
  return digits;
}

// ── Select de País com busca ───────────────────────────────────────────────────

export function CountrySelect({ value, onChange }: { value: string; onChange: (code: string, name: string) => void }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapRef = useRef<HTMLDivElement>(null);
  const selected = PAISES.find(p => p.code === value);
  const filtered = search
    ? PAISES.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    : PAISES;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false); setSearch('');
      }
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full bg-gray-50 border border-gray-200 py-4 px-5 font-medium text-[#1a2b4a] focus:border-[#c9a96e] outline-none transition-all text-sm flex items-center justify-between hover:border-[#c9a96e]/50"
      >
        <span className="flex items-center gap-2">
          {selected ? <><span>{selected.flag}</span>{selected.name}</> : 'Selecione o país'}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-100 shadow-xl overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar país…"
              className="w-full bg-gray-50 px-3 py-2 text-sm font-medium text-[#1a2b4a] outline-none border border-transparent focus:border-[#c9a96e]/50"
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filtered.map(p => (
              <button
                key={p.code}
                type="button"
                onClick={() => { onChange(p.code, p.name); setOpen(false); setSearch(''); }}
                className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-gray-50 text-left ${value === p.code ? 'bg-gray-50 text-[#1a2b4a]' : 'text-gray-700'}`}
              >
                <span>{p.flag}</span>{p.name}
                {value === p.code && <span className="ml-auto text-[#c9a96e] font-semibold text-xs">✓</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sub-componentes de UI ─────────────────────────────────────────────────────

export const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="text-[10px] font-semibold text-[#1a2b4a] uppercase tracking-wider ml-1 mb-1.5 block">
    {children}
  </label>
);

export const Input = ({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className={`w-full bg-gray-50 border border-gray-200 py-4 px-5 font-medium text-[#1a2b4a] focus:border-[#c9a96e] outline-none transition-all text-sm placeholder:text-gray-300 ${props.className || ''}`}
  />
);

export const Textarea = ({ ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    {...props}
    rows={3}
    className="w-full bg-gray-50 border border-gray-200 py-4 px-5 font-medium text-[#1a2b4a] focus:border-[#c9a96e] outline-none transition-all text-sm placeholder:text-gray-300 resize-none"
  />
);
