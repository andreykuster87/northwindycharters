// src/components/admin/ProfileSearch.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Busca global de perfis no navbar do admin: tripulantes, usuários e empresas.
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { getSailors, getClients, getCompanies } from '../../lib/localStore';
import type { Sailor, Client } from '../../lib/localStore';
import type { Company } from '../../lib/store/companies';

// ── Tipos ─────────────────────────────────────────────────────────────────────

type ResultType = 'sailor' | 'client' | 'company';

interface SearchResult {
  id:            string;
  type:          ResultType;
  name:          string;
  sub:           string;       // email ou setor
  profile_number?: string;
  profile_photo?: string | null;
  status:        string;
  raw:           Sailor | Client | Company;
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  onOpenSailor:  (s: Sailor)  => void;
  onOpenClient:  (c: Client)  => void;
  onOpenCompany: (c: Company) => void;
}

// ── Helpers visuais ───────────────────────────────────────────────────────────

const TYPE_LABEL: Record<ResultType, string> = {
  sailor:  'Tripulante',
  client:  'Usuário',
  company: 'Empresa',
};

const TYPE_COLOR: Record<ResultType, string> = {
  sailor:  'bg-green-500/20 text-green-300',
  client:  'bg-blue-500/20 text-blue-300',
  company: 'bg-amber-500/20 text-amber-300',
};

function statusDot(status: string): string {
  if (['approved', 'active'].includes(status))         return 'bg-green-400';
  if (['pending', 'pending_verification'].includes(status)) return 'bg-amber-400';
  return 'bg-red-400';
}

// ── Componente ────────────────────────────────────────────────────────────────

export function ProfileSearch({ onOpenSailor, onOpenClient, onOpenCompany }: Props) {
  const [query,   setQuery]   = useState('');
  const [open,    setOpen]    = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [focused, setFocused] = useState(-1);

  const inputRef    = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fecha ao clicar fora
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setFocused(-1);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Pesquisa em tempo real — lê do cache em memória (0 queries)
  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (!q || q.length < 2) { setResults([]); setOpen(false); return; }

    const hits: SearchResult[] = [];

    // Tripulantes
    getSailors().forEach(s => {
      if (
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        String(s.profile_number || '').includes(q) ||
        (s.phone || '').toLowerCase().includes(q)
      ) {
        hits.push({
          id: s.id, type: 'sailor',
          name: s.name, sub: s.email,
          profile_number: s.profile_number,
          profile_photo: s.profile_photo,
          status: s.status, raw: s,
        });
      }
    });

    // Usuários (clientes não convertidos a tripulante)
    // Três verificações em cascata para cobrir promoções antigas (UUID diferente) e novas.
    const allSailors   = getSailors();
    const sailorIds    = new Set(allSailors.map(s => s.id));
    const sailorEmails = new Set(allSailors.map(s => s.email.toLowerCase()));
    getClients().forEach(c => {
      // Exclui clientes que foram promovidos a tripulante
      if (
        c.role === 'converted_to_sailor' ||
        sailorIds.has(c.id) ||
        sailorEmails.has(c.email.toLowerCase())
      ) return;
      if (
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        String(c.profile_number || '').includes(q) ||
        (c.phone || '').toLowerCase().includes(q)
      ) {
        hits.push({
          id: c.id, type: 'client',
          name: c.name, sub: c.email,
          profile_number: (c as any).profile_number,
          profile_photo: c.profile_photo,
          status: c.status, raw: c,
        });
      }
    });

    // Empresas
    getCompanies().forEach(co => {
      if (
        co.nome_fantasia.toLowerCase().includes(q) ||
        co.razao_social.toLowerCase().includes(q) ||
        co.email.toLowerCase().includes(q) ||
        co.setor.toLowerCase().includes(q)
      ) {
        hits.push({
          id: co.id, type: 'company',
          name: co.nome_fantasia, sub: co.email,
          profile_number: co.profile_number,
          profile_photo: (co as any).profile_photo,
          status: co.status, raw: co,
        });
      }
    });

    // Limita a 10 resultados para não sobrecarregar o dropdown
    setResults(hits.slice(0, 10));
    setOpen(hits.length > 0);
    setFocused(-1);
  }, [query]);

  function handleSelect(r: SearchResult) {
    setQuery('');
    setOpen(false);
    setFocused(-1);
    if (r.type === 'sailor')  onOpenSailor(r.raw as Sailor);
    if (r.type === 'client')  onOpenClient(r.raw as Client);
    if (r.type === 'company') onOpenCompany(r.raw as Company);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setFocused(f => Math.min(f + 1, results.length - 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setFocused(f => Math.max(f - 1, 0)); }
    if (e.key === 'Enter' && focused >= 0) { e.preventDefault(); handleSelect(results[focused]); }
    if (e.key === 'Escape') { setOpen(false); setQuery(''); inputRef.current?.blur(); }
  }

  return (
    <div ref={containerRef} className="relative flex-1 max-w-xs hidden md:block">
      {/* Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/70 pointer-events-none" />
        <input
          ref={inputRef}
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => { if (results.length > 0) setOpen(true); }}
          onKeyDown={handleKeyDown}
          placeholder="Buscar perfil…"
          autoComplete="off"
          className="w-full bg-white/20 border border-white/30 py-2 pl-9 pr-8 text-xs font-medium text-white placeholder:text-white/70 outline-none focus:border-[#c9a96e] focus:bg-white/25 transition-all"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setOpen(false); inputRef.current?.focus(); }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-[#0e1e36] border border-[#c9a96e]/20 shadow-2xl z-50 overflow-hidden max-h-80 overflow-y-auto">
          {results.map((r, i) => (
            <div
              key={r.id}
              onMouseDown={() => handleSelect(r)}
              onMouseEnter={() => setFocused(i)}
              className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors ${
                focused === i ? 'bg-[#c9a96e]/10' : 'hover:bg-white/5'
              }`}
            >
              {/* Avatar */}
              <div className="w-8 h-8 flex-shrink-0 bg-[#1a2b4a] flex items-center justify-center font-bold text-[10px] text-[#c9a96e] border border-[#c9a96e]/20 overflow-hidden">
                {r.profile_photo
                  ? <img src={r.profile_photo} alt={r.name} className="w-full h-full object-cover" />
                  : r.name.substring(0, 2).toUpperCase()
                }
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${statusDot(r.status)}`} />
                  <p className="font-bold text-white text-xs truncate">{r.name}</p>
                  {r.profile_number && (
                    <span className="text-[9px] font-semibold text-[#c9a96e]/60 flex-shrink-0">
                      #{parseInt(r.profile_number, 10)}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-white/40 font-medium truncate">{r.sub}</p>
              </div>

              {/* Badge tipo + ícone de abertura */}
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <span className={`text-[9px] font-semibold uppercase px-1.5 py-0.5 ${TYPE_COLOR[r.type]}`}>
                  {TYPE_LABEL[r.type]}
                </span>
                <span className="text-[8px] text-white/20 font-medium">
                  {r.type === 'client' ? 'Ver dossiê →' : 'Ver perfil →'}
                </span>
              </div>
            </div>
          ))}

          {/* Rodapé */}
          <div className="px-3 py-2 border-t border-white/5 bg-[#081120]">
            <p className="text-[9px] font-semibold text-white/20 uppercase tracking-wider">
              {results.length} resultado{results.length !== 1 ? 's' : ''} · ↑↓ navegar · Enter abrir · Esc fechar
            </p>
          </div>
        </div>
      )}

      {/* Sem resultados */}
      {open && results.length === 0 && query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-[#0e1e36] border border-[#c9a96e]/20 shadow-2xl z-50 px-4 py-5 text-center">
          <p className="text-[11px] font-semibold text-white/30">Nenhum perfil encontrado para "{query}"</p>
        </div>
      )}
    </div>
  );
}
