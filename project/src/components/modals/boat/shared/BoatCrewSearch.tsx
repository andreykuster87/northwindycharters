// src/components/modals/boat/shared/BoatCrewSearch.tsx
import { useState, useRef } from 'react';
import { X, Search, UserPlus, AlertTriangle } from 'lucide-react';
import { getSailors } from '../../../../lib/localStore';
import { supabase } from '../../../../lib/supabase';
import type { Sailor } from '../../../../lib/localStore';

// ── Tipos ─────────────────────────────────────────────────────────────────────

export interface CrewEntry {
  sailor_id: string; name: string; email: string;
  role: string; status: 'ok' | 'expiring' | 'blocked' | 'pending';
  reason: string;
}

// ── Helpers de validade ───────────────────────────────────────────────────────

function isExpired(d?: string) {
  if (!d) return false;
  try {
    const date = d.includes('/')
      ? (() => { const [dd, mm, yy] = d.split('/'); return new Date(+yy, +mm - 1, +dd, 23, 59, 59); })()
      : new Date(d + 'T23:59:59');
    return date < new Date();
  } catch { return false; }
}

function isExpiringSoon(d?: string) {
  if (!d) return false;
  try {
    const date = d.includes('/')
      ? (() => { const [dd, mm, yy] = d.split('/'); return new Date(+yy, +mm - 1, +dd, 23, 59, 59); })()
      : new Date(d + 'T23:59:59');
    const lim = new Date(); lim.setDate(lim.getDate() + 30);
    return date > new Date() && date <= lim;
  } catch { return false; }
}

function getSailorStatus(s: Sailor): { status: 'ok' | 'expiring' | 'blocked' | 'pending'; reason: string } {
  if (s.blocked) return { status: 'blocked', reason: s.block_reason || 'Conta bloqueada' };
  if (s.status === 'pending') return { status: 'pending', reason: 'Cadastro não aprovado' };
  const docs = [
    { l: 'Passaporte',  v: s.passaporte?.validade },
    { l: 'Habilitação', v: s.cartahabitacao?.validade },
    { l: 'Médico',      v: s.medico?.validade },
  ];
  const expired = docs.filter(d => isExpired(d.v));
  if (expired.length) return { status: 'blocked', reason: `Doc. expirado: ${expired.map(d => d.l).join(', ')}` };
  const soon = docs.filter(d => isExpiringSoon(d.v));
  if (soon.length) return { status: 'expiring', reason: `A expirar: ${soon.map(d => d.l).join(', ')}` };
  return { status: 'ok', reason: 'Documentação em dia' };
}

const STATUS_COLORS = {
  ok:       { dot: 'bg-green-500', bg: 'bg-green-50',  border: 'border-green-200', text: 'text-green-700',  label: '● Em dia' },
  expiring: { dot: 'bg-amber-400', bg: 'bg-amber-50',  border: 'border-amber-200', text: 'text-amber-700',  label: '● A expirar' },
  blocked:  { dot: 'bg-red-500',   bg: 'bg-red-50',    border: 'border-red-200',   text: 'text-red-700',    label: '● Bloqueado' },
  pending:  { dot: 'bg-gray-400',  bg: 'bg-gray-50',   border: 'border-gray-200',  text: 'text-gray-600',   label: '● Pendente' },
};

// ── Componente ────────────────────────────────────────────────────────────────

export function CrewSearchInput({ crew, allCrew, onChange, defaultRole = 'Tripulante', label = 'Tripulante' }: {
  crew: CrewEntry[];
  allCrew: CrewEntry[];
  onChange: (c: CrewEntry[]) => void;
  defaultRole?: string;
  label?: string;
}) {
  const [email,         setEmail]         = useState('');
  const [role,          setRole]          = useState(defaultRole);
  const [preview,       setPreview]       = useState<Sailor | null>(null);
  const [previewStatus, setPreviewStatus] = useState<{ status: 'ok' | 'expiring' | 'blocked' | 'pending'; reason: string } | null>(null);
  const [error,         setError]         = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleEmailChange = (val: string) => {
    setEmail(val); setError(null); setPreview(null); setPreviewStatus(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const e = val.trim().toLowerCase();
    if (!e || !e.includes('@')) return;
    // Debounce 400ms — só consulta Supabase quando o utilizador parar de escrever
    debounceRef.current = setTimeout(async () => {
      // Cache primeiro (0 queries)
      let sailor = getSailors().find(s => s.email.toLowerCase() === e);
      if (!sailor) {
        // Fallback Supabase: só campos necessários
        const { data } = await supabase
          .from('sailors')
          .select('id,name,email,status,blocked,block_reason,passaporte_validade,cartahabitacao_validade,medico_validade,profile_number,phone')
          .ilike('email', e)
          .maybeSingle();
        if (data) sailor = data as any;
      }
      if (sailor) { setPreview(sailor as any); setPreviewStatus(getSailorStatus(sailor as any)); }
    }, 400);
  };

  const handleAdd = async () => {
    setError(null);
    const e = email.trim().toLowerCase();
    if (!e) { setError('Introduz um email.'); return; }
    let sailor: any = getSailors().find((s: any) => s.email.toLowerCase() === e);
    if (!sailor) {
      const { data } = await supabase.from('sailors').select('*').ilike('email', e).single();
      sailor = data || null;
    }
    if (!sailor) { setError('Não encontrado — verifica se está registado na plataforma.'); return; }
    if (allCrew.some(c => c.sailor_id === sailor.id)) {
      setError(`${sailor.name} já está adicionado (como ${allCrew.find(c => c.sailor_id === sailor.id)?.role || 'tripulante'}).`); return;
    }
    const { status, reason } = getSailorStatus(sailor);
    if (status === 'blocked') { setError(`Conta bloqueada: ${reason}`); return; }
    if (status === 'pending') { setError(`${sailor.name} ainda não foi aprovado na plataforma.`); return; }
    onChange([...crew, { sailor_id: sailor.id, name: sailor.name, email: sailor.email, role: role || defaultRole, status, reason }]);
    setEmail(''); setRole(defaultRole); setPreview(null); setPreviewStatus(null);
  };

  const profilePhoto = preview?.profile_photo || '';

  return (
    <div className="space-y-3">
      {/* Input de email */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" />
          <input type="email" value={email}
            onChange={e => handleEmailChange(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder={`Email do ${label.toLowerCase()}...`}
            autoComplete="off" autoCorrect="off" autoCapitalize="none" spellCheck={false}
            className="w-full bg-gray-50 border border-gray-200 py-2.5 pl-9 pr-3 text-sm font-bold text-[#1a2b4a] focus:border-[#c9a96e] outline-none transition-all placeholder:text-gray-300 placeholder:font-normal" />
        </div>
        <button type="button" onClick={handleAdd}
          className="bg-[#0a1628] hover:bg-[#0a1628]/90 text-white px-4 font-semibold text-xs uppercase transition-all flex items-center gap-1.5 flex-shrink-0">
          <UserPlus className="w-3.5 h-3.5" /> Adicionar
        </button>
      </div>

      {/* Preview */}
      {preview && previewStatus && (
        <div className={`border overflow-hidden ${
          previewStatus.status === 'blocked' ? 'border-red-200 bg-red-50' :
          previewStatus.status === 'pending' ? 'border-gray-200 bg-gray-50' :
          previewStatus.status === 'expiring' ? 'border-amber-200 bg-amber-50' :
          'border-green-200 bg-green-50'}`}>
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-10 h-10 overflow-hidden bg-[#0a1628]/10 flex-shrink-0 border border-white shadow-sm">
              {profilePhoto
                ? <img src={profilePhoto} alt={preview.name} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center font-bold text-[#1a2b4a] text-sm">
                    {preview.name.substring(0, 2).toUpperCase()}
                  </div>}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-[#1a2b4a] text-sm truncate">{preview.name}</p>
              <p className="text-[10px] text-gray-500 font-bold truncate">{preview.email}</p>
            </div>
            <div className={`flex-shrink-0 text-[9px] font-semibold uppercase px-2 py-1 ${STATUS_COLORS[previewStatus.status].text} border ${STATUS_COLORS[previewStatus.status].border} bg-white`}>
              {previewStatus.status === 'ok' ? '✓ Em dia' :
               previewStatus.status === 'expiring' ? '⚠ A expirar' :
               previewStatus.status === 'blocked' ? '✗ Bloqueado' : '○ Pendente'}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-px bg-white/40 border-t border-white/60">
            {[
              { l: 'Passaporte',  v: (preview as any).passaporte?.validade },
              { l: 'Habilitação', v: (preview as any).cartahabitacao?.validade },
              { l: 'Médico',      v: (preview as any).medico?.validade },
            ].map(({ l, v }) => (
              <div key={l} className="bg-white/60 py-2 px-3 text-center">
                <p className="text-[8px] font-semibold text-gray-400 uppercase">{l}</p>
                <p className={`text-[10px] font-bold mt-0.5 ${!v ? 'text-gray-300' : previewStatus.status === 'ok' ? 'text-green-600' : previewStatus.status === 'expiring' ? 'text-amber-600' : 'text-red-500'}`}>
                  {v || '—'}
                </p>
              </div>
            ))}
          </div>
          {previewStatus.status !== 'blocked' && previewStatus.status !== 'pending' && (
            <div className="px-4 py-2.5 flex items-center gap-2 border-t border-white/60">
              <span className="text-[10px] font-semibold text-gray-500 uppercase">Função:</span>
              <input value={role} onChange={e => setRole(e.target.value)}
                className="flex-1 bg-white/80 border border-gray-200 py-1 px-2 text-xs font-bold text-[#1a2b4a] outline-none focus:border-[#c9a96e] transition-all" />
            </div>
          )}
          {previewStatus.status === 'blocked' && (
            <div className="px-4 py-2 flex items-center gap-2 border-t border-red-200">
              <AlertTriangle className="w-3 h-3 text-red-500 flex-shrink-0" />
              <p className="text-[10px] font-bold text-red-600">{previewStatus.reason}</p>
            </div>
          )}
        </div>
      )}

      {email.includes('@') && !preview && (
        <p className="text-[10px] font-bold text-gray-400 flex items-center gap-1.5 px-1">
          <Search className="w-3 h-3" /> A pesquisar...
        </p>
      )}

      {error && (
        <p className="text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-3 py-2 flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />{error}
        </p>
      )}

      {/* Lista de tripulantes */}
      {crew.length > 0 && (
        <div className="space-y-2">
          {crew.map((c, i) => {
            const cfg = STATUS_COLORS[c.status];
            return (
              <div key={c.sailor_id} className={`flex items-center gap-3 px-3 py-2.5 border ${cfg.bg} ${cfg.border}`}>
                <div className={`w-2 h-2 flex-shrink-0 ${cfg.dot}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-bold text-[#1a2b4a] text-sm truncate">{c.name}</p>
                    {c.role === 'Comandante' && <span className="text-[8px] font-semibold bg-[#0a1628] text-white px-1.5 py-0.5 uppercase flex-shrink-0">⚓ Cmd</span>}
                  </div>
                  <p className="text-[10px] text-gray-400 font-bold truncate">{c.email}</p>
                  <p className={`text-[10px] font-bold ${cfg.text}`}>{c.status !== 'ok' ? c.reason : cfg.label}</p>
                </div>
                <input value={c.role} onChange={e => onChange(crew.map((x, j) => j === i ? { ...x, role: e.target.value } : x))}
                  className="w-24 bg-white/70 border border-gray-200 py-1 px-2 text-[10px] font-bold text-[#1a2b4a] outline-none" />
                <button type="button" onClick={() => onChange(crew.filter((_, j) => j !== i))}
                  className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
