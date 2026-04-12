// src/components/shared/CrewManager.tsx
import { useState, useRef } from 'react';
import {
  UserPlus, X, AlertTriangle, CheckCircle2,
  Clock, Search, ShieldX, ChevronDown, ShieldCheck,
} from 'lucide-react';
import { getSailors, updateBoat, type Sailor, type Boat } from '../../lib/localStore';
import { supabase } from '../../lib/supabase';

// ── Funções disponíveis ───────────────────────────────────────────────────────
const FUNCOES_TRIPULACAO = [
  'Comandante','Co-piloto','Mestre','Marinheiro','Mecânico Naval',
  'Cozinheiro de Bordo','Stewarde / Stewardess','Guia Turístico',
  'Mergulhador','Segurança','Tripulante','Outro',
];

// ── RoleSelect ────────────────────────────────────────────────────────────────
function RoleSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [outroText, setOutroText] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useState(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  });

  const isOutro  = value === 'Outro' || (value && !FUNCOES_TRIPULACAO.includes(value));
  const display  = isOutro && value !== 'Outro' ? value : (value || 'Função...');
  const showOutro = value === 'Outro';

  return (
    <div ref={ref} className="relative" style={{ minWidth: '9rem' }}>
      <button type="button" onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between gap-1 bg-white/80 border rounded-lg py-1.5 px-2.5 text-xs font-bold transition-all outline-none
          ${open ? 'border-blue-900' : 'border-gray-200'} ${value && value !== 'Outro' ? 'text-blue-900' : 'text-gray-400'}`}>
        <span className="truncate">{value === 'Outro' ? '✏️ Outro' : display}</span>
        <ChevronDown className={`w-3 h-3 text-gray-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-50 left-0 mt-1 w-44 bg-white border-2 border-blue-900 rounded-xl shadow-xl overflow-hidden">
          <div className="max-h-48 overflow-y-auto">
            {FUNCOES_TRIPULACAO.map(f => (
              <button key={f} type="button"
                onClick={() => { if (f === 'Outro') { onChange('Outro'); setOpen(false); setTimeout(() => inputRef.current?.focus(), 50); } else { onChange(f); setOpen(false); } }}
                className={`w-full text-left px-3 py-2 text-xs font-bold transition-colors hover:bg-blue-50 ${value === f ? 'bg-blue-900 text-white' : 'text-blue-900'}`}>
                {f === 'Outro' ? '✏️ Outro — escrever' : f}
              </button>
            ))}
          </div>
        </div>
      )}
      {showOutro && (
        <input ref={inputRef} type="text" value={outroText}
          onChange={e => { setOutroText(e.target.value); onChange(e.target.value || 'Outro'); }}
          placeholder="Qual a função?"
          className="mt-1 w-full bg-amber-50 border border-amber-300 rounded-lg py-1.5 px-2.5 text-xs font-bold text-blue-900 focus:border-blue-900 outline-none"
          onKeyDown={e => e.key === 'Enter' && e.preventDefault()} />
      )}
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function isExpired(d?: string) {
  if (!d) return false;
  try {
    const date = d.includes('/') ? (() => { const [dd,mm,yy] = d.split('/'); return new Date(+yy,+mm-1,+dd,23,59,59); })() : new Date(d+'T23:59:59');
    return date < new Date();
  } catch { return false; }
}

function isExpiringSoon(d?: string, days = 30) {
  if (!d) return false;
  try {
    const date = d.includes('/') ? (() => { const [dd,mm,yy] = d.split('/'); return new Date(+yy,+mm-1,+dd,23,59,59); })() : new Date(d+'T23:59:59');
    const lim = new Date(); lim.setDate(lim.getDate() + days);
    return date > new Date() && date <= lim;
  } catch { return false; }
}

function fmtDate(d?: string) {
  if (!d) return '—';
  try { return d.includes('/') ? d : new Date(d+'T12:00').toLocaleDateString('pt-BR'); } catch { return d; }
}

type CrewStatus = 'ok' | 'expiring_soon' | 'expired' | 'blocked' | 'pending';

function getSailorStatus(s: Sailor): { status: CrewStatus; reason: string } {
  if (s.blocked) return { status: 'blocked', reason: s.block_reason || 'Conta bloqueada' };
  if (s.status === 'pending') return { status: 'pending', reason: 'Cadastro não aprovado' };
  const docs = [
    { label: 'Passaporte',  val: s.passaporte?.validade },
    { label: 'Habilitação', val: s.cartahabitacao?.validade },
    { label: 'Médico',      val: s.medico?.validade },
  ];
  const expired = docs.filter(d => isExpired(d.val));
  if (expired.length) return { status: 'expired', reason: `Doc. expirado: ${expired.map(d => d.label).join(', ')}` };
  const soon = docs.filter(d => isExpiringSoon(d.val));
  if (soon.length) return { status: 'expiring_soon', reason: `A expirar: ${soon.map(d => d.label).join(', ')}` };
  return { status: 'ok', reason: 'Documentação em dia' };
}

const STATUS_CFG = {
  ok:           { color: 'bg-green-500',  text: 'text-green-700',  bg: 'bg-green-50',  border: 'border-green-200',  label: 'Em dia',        icon: ShieldCheck   },
  expiring_soon:{ color: 'bg-amber-400',  text: 'text-amber-700',  bg: 'bg-amber-50',  border: 'border-amber-200',  label: 'A expirar',     icon: Clock         },
  expired:      { color: 'bg-red-500',    text: 'text-red-700',    bg: 'bg-red-50',    border: 'border-red-200',    label: 'Doc. expirado', icon: AlertTriangle  },
  blocked:      { color: 'bg-red-600',    text: 'text-red-800',    bg: 'bg-red-50',    border: 'border-red-300',    label: 'Bloqueado',     icon: ShieldX       },
  pending:      { color: 'bg-gray-400',   text: 'text-gray-600',   bg: 'bg-gray-50',   border: 'border-gray-200',   label: 'Pendente',      icon: Clock         },
};

// ── Tipos ─────────────────────────────────────────────────────────────────────
interface CrewMember { sailor_id: string; role: string; added_at: string; }
interface CrewManagerProps { boat: Boat; onBoatUpdate?: (boat: Boat) => void; }

// ── Componente ────────────────────────────────────────────────────────────────
export function CrewManager({ boat, onBoatUpdate }: CrewManagerProps) {
  const [emailInput,   setEmailInput]   = useState('');
  const [roleInput,    setRoleInput]    = useState('');
  const [error,        setError]        = useState<string | null>(null);
  const [warning,      setWarning]      = useState<string | null>(null);
  const [success,      setSuccess]      = useState<string | null>(null);
  const [confirmBlock, setConfirmBlock] = useState<{ sailor: Sailor; reason: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const getCrew = (): CrewMember[] => {
    try { const m = JSON.parse((boat as any).metadata || '{}'); return Array.isArray(m.crew) ? m.crew : []; } catch { return []; }
  };

  const saveCrew = async (crew: CrewMember[]) => {
    try {
      // Save crew directly to boats table
      await updateBoat(boat.id, { crew } as any);
      onBoatUpdate?.({ ...boat, crew } as any);
    } catch (err) {
      console.error('Erro ao guardar tripulação:', err);
    }
  };

  const crew       = getCrew();
  const allSailors = getSailors();
  const crewWithData = crew.map(c => {
    const sailor = allSailors.find(s => s.id === c.sailor_id);
    if (!sailor) return null;
    return { ...c, sailor, statusInfo: getSailorStatus(sailor) };
  }).filter(Boolean) as Array<CrewMember & { sailor: Sailor; statusInfo: { status: CrewStatus; reason: string } }>;

  const handleAdd = async () => {
    setError(null); setWarning(null); setSuccess(null);
    const email = emailInput.trim().toLowerCase();
    if (!email) { setError('Introduz um email.'); return; }
    // Search cache first, then Supabase directly
    let sailor: Sailor | null = allSailors.find(s => s.email.toLowerCase() === email) || null;
    if (!sailor) {
      const { data } = await supabase
        .from('sailors').select('*').ilike('email', email).single();
      sailor = data as Sailor | null;
    }
    if (!sailor) { setError('Nenhum tripulante encontrado com este email. Verifique se está registado na plataforma.'); return; }
    if (crew.some(c => c.sailor_id === (sailor as Sailor).id)) { setError(`${(sailor as Sailor).name} já está na tripulação.`); return; }
    const { status, reason } = getSailorStatus(sailor as Sailor);
    if (status === 'blocked') { setConfirmBlock({ sailor: sailor as Sailor, reason }); return; }
    if (status === 'pending') { setError(`${(sailor as Sailor).name} ainda não foi aprovado na plataforma.`); return; }
    if (status === 'expired') setWarning(`⚠️ ${(sailor as Sailor).name} tem documentação expirada. Foi adicionado mas não poderá operar até regularizar.`);
    doAdd(sailor as Sailor);
  };

  const doAdd = async (sailor: Sailor) => {
    await saveCrew([...crew, { sailor_id: sailor.id, role: roleInput.trim() || 'Tripulante', added_at: new Date().toISOString() }]);
    setEmailInput(''); setRoleInput(''); setConfirmBlock(null);
    if (!warning) { setSuccess(`${sailor.name} adicionado.`); setTimeout(() => setSuccess(null), 3000); }
    setTimeout(() => setWarning(null), 6000);
    inputRef.current?.focus();
  };

  return (
    <div className="space-y-4">

      {/* ── Adicionar ── */}
      <div className="bg-blue-50 border-2 border-blue-100 rounded-2xl p-4 space-y-3">
        <p className="text-xs font-black text-blue-900 uppercase flex items-center gap-2">
          <UserPlus className="w-3.5 h-3.5" /> Adicionar Tripulante
        </p>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" />
            <input ref={inputRef} type="email" value={emailInput}
              onChange={e => { setEmailInput(e.target.value); setError(null); }}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              placeholder="Email do tripulante..."
              className="w-full bg-white border-2 border-gray-100 rounded-xl py-2.5 pl-9 pr-3 text-sm font-bold text-blue-900 focus:border-blue-900 outline-none transition-all placeholder:text-gray-300 placeholder:font-normal" />
          </div>
          <RoleSelect value={roleInput} onChange={setRoleInput} />
          <button type="button" onClick={handleAdd}
            className="bg-blue-900 hover:bg-blue-800 text-white px-4 rounded-xl font-black text-xs uppercase transition-all flex items-center gap-1.5 flex-shrink-0">
            <UserPlus className="w-3.5 h-3.5" /> Adicionar
          </button>
        </div>
        {error   && <div className="flex items-start gap-2 bg-red-50 border-2 border-red-200 rounded-xl px-3 py-2.5"><AlertTriangle className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" /><p className="text-xs font-bold text-red-700">{error}</p></div>}
        {warning && <div className="flex items-start gap-2 bg-amber-50 border-2 border-amber-200 rounded-xl px-3 py-2.5"><AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" /><p className="text-xs font-bold text-amber-700">{warning}</p></div>}
        {success && <div className="flex items-center gap-2 bg-green-50 border-2 border-green-200 rounded-xl px-3 py-2.5"><CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" /><p className="text-xs font-bold text-green-700">{success}</p></div>}
      </div>

      {/* ── Modal bloqueado ── */}
      {confirmBlock && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setConfirmBlock(null)}>
          <div className="bg-white w-full max-w-sm rounded-[28px] shadow-2xl border-4 border-red-400 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="bg-red-500 px-6 py-5 text-center">
              <ShieldX className="w-8 h-8 text-white mx-auto mb-2" />
              <h3 className="font-black text-white uppercase italic text-lg">Conta Bloqueada</h3>
              <p className="text-red-200 text-xs font-bold mt-1">{confirmBlock.sailor.name}</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-red-50 border-2 border-red-100 rounded-2xl p-4">
                <p className="text-xs font-black text-red-700 uppercase mb-1">Motivo</p>
                <p className="text-sm font-bold text-red-800">{confirmBlock.reason}</p>
              </div>
              <button onClick={() => setConfirmBlock(null)} className="w-full bg-red-500 hover:bg-red-400 text-white py-4 rounded-2xl font-black uppercase text-sm transition-all">Entendido</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Lista ── */}
      {crewWithData.length === 0 ? (
        <div className="bg-gray-50 rounded-2xl py-8 flex flex-col items-center gap-2 border-2 border-dashed border-gray-100">
          <UserPlus className="w-6 h-6 text-gray-300" />
          <p className="text-xs text-gray-400 font-bold text-center">Nenhum tripulante adicionado.<br />Usa o email para adicionar.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-[10px] font-black text-gray-400 uppercase px-1">{crewWithData.length} tripulante{crewWithData.length !== 1 ? 's' : ''}</p>
          {crewWithData.map(({ sailor, role, statusInfo }) => {
            const cfg = STATUS_CFG[statusInfo.status];
            const StatusIcon = cfg.icon;
            const photo = sailor.profile_photo || '';
            const docs = [
              { label: 'Passaporte',  val: sailor.passaporte?.validade,     nr: sailor.passaporte?.numero },
              { label: 'Habilitação', val: sailor.cartahabitacao?.validade,  nr: sailor.cartahabitacao?.numero },
              { label: 'Cert. Médico',val: sailor.medico?.validade,          nr: undefined },
            ];

            return (
              <div key={sailor.id} className={`rounded-2xl border-2 overflow-hidden ${cfg.bg} ${cfg.border}`}>

                {/* Cabeçalho */}
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-blue-100 flex-shrink-0 border-2 border-white shadow-sm">
                    {photo
                      ? <img src={photo} alt={sailor.name} className="w-full h-full object-cover" />
                      : <div className={`w-full h-full flex items-center justify-center font-black text-sm ${cfg.text}`}>{sailor.name.substring(0,2).toUpperCase()}</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-black text-blue-900 text-sm truncate">{sailor.name}</p>
                      {sailor.profile_number && (
                        <span className="text-[9px] font-black bg-blue-900 text-white px-2 py-0.5 rounded-full flex-shrink-0">#{sailor.profile_number}</span>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-500 font-bold truncate">{sailor.email}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    {/* Status badge */}
                    <div className={`flex items-center gap-1 text-[9px] font-black uppercase px-2.5 py-1 rounded-full border bg-white ${cfg.text} ${cfg.border}`}>
                      <StatusIcon className="w-3 h-3" />
                      {cfg.label}
                    </div>
                    {/* Função badge — fixo e destacado */}
                    {role && (
                      <div className="flex items-center gap-1 bg-blue-900 text-white text-[9px] font-black uppercase px-2.5 py-1 rounded-full">
                        ⚓ {role}
                      </div>
                    )}
                  </div>
                  <button type="button" onClick={() => saveCrew(crew.filter(c => c.sailor_id !== sailor.id))}
                    className="w-6 h-6 rounded-full bg-white/80 hover:bg-red-50 border border-gray-200 hover:border-red-300 flex items-center justify-center transition-all flex-shrink-0 ml-1">
                    <X className="w-3 h-3 text-gray-400 hover:text-red-500" />
                  </button>
                </div>

                {/* Documentos */}
                <div className="grid grid-cols-3 gap-px bg-white/40 border-t border-white/40">
                  {docs.map(({ label, val, nr }) => {
                    const exp  = isExpired(val);
                    const soon = isExpiringSoon(val);
                    const color = exp ? 'text-red-600' : soon ? 'text-amber-600' : val ? 'text-green-600' : 'text-gray-300';
                    return (
                      <div key={label} className="bg-white/60 py-2 px-2 text-center">
                        <p className="text-[8px] font-black text-gray-400 uppercase">{label}</p>
                        {nr && <p className="text-[9px] font-black text-blue-900 mt-0.5">Nº {nr}</p>}
                        <p className={`text-[9px] font-black mt-0.5 ${color}`}>{val ? `Val: ${fmtDate(val)}` : '—'}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Aviso se problema */}
                {statusInfo.status !== 'ok' && (
                  <div className={`px-4 py-2 border-t border-white/40 flex items-center gap-2 ${cfg.bg}`}>
                    <AlertTriangle className={`w-3 h-3 flex-shrink-0 ${cfg.text}`} />
                    <p className={`text-[10px] font-bold ${cfg.text}`}>{statusInfo.reason}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Legenda */}
      <div className="flex flex-wrap gap-3 pt-1">
        {Object.entries(STATUS_CFG).map(([key, cfg]) => (
          <span key={key} className="flex items-center gap-1.5 text-[9px] font-bold text-gray-500">
            <span className={`w-2 h-2 rounded-full ${cfg.color}`} /> {cfg.label}
          </span>
        ))}
      </div>
    </div>
  );
}