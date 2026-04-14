// src/components/shared/CompanySearchCard.tsx
// Painel de busca de empresas com live search + filtros avançados opcionais.
import { useState, useMemo } from 'react';
import { Search, X, Building2, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
import { getCompanies } from '../../lib/localStore';
import type { Company } from '../../lib/store/companies';
import type { Sailor } from '../../lib/store/core';

// ── Props ─────────────────────────────────────────────────────────────────────

interface CompanySearchCardProps {
  onCompanyClick: (company: Company) => void;
  onSailorClick:  (sailor: Sailor)  => void;
  /** Quando fornecido, o componente opera em modo controlado (sem header interno) */
  expanded?:  boolean;
  onToggle?:  () => void;
}

// ── Componente ────────────────────────────────────────────────────────────────

export function CompanySearchCard({ onCompanyClick, onToggle, expanded: extExpanded }: CompanySearchCardProps) {
  const [intExpanded, setIntExpanded] = useState(false);

  const isControlled = extExpanded !== undefined;
  const expanded     = isControlled ? extExpanded : intExpanded;

  // ── Live search
  const [query, setQuery] = useState('');

  // ── Filtros avançados
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [fPais,   setFPais]   = useState('');
  const [fEstado, setFEstado] = useState('');
  const [fCidade, setFCidade] = useState('');
  const [fPerfil, setFPerfil] = useState('');
  const [fEmail,  setFEmail]  = useState('');
  const [fSetor,  setFSetor]  = useState('');

  const hasAdvanced = fPais || fEstado || fCidade || fPerfil || fEmail || fSetor;

  // ── Resultados: live filter
  const allCompanies = useMemo(() => getCompanies().filter(c => c.status === 'active'), []);

  const setores = useMemo(
    () => Array.from(new Set(allCompanies.flatMap(c => c.setor.split(',').map(s => s.trim())))).sort(),
    [allCompanies],
  );

  const results = useMemo(() => {
    if (!query && !hasAdvanced) return null;
    return allCompanies.filter(c => {
      const q = query.toLowerCase();
      const matchQuery = !query || [c.nome_fantasia, c.razao_social, c.email, c.cidade, c.setor, c.profile_number]
        .some(v => v?.toLowerCase().includes(q));
      const matchPais   = !fPais   || (c.pais_nome || '').toLowerCase().includes(fPais.toLowerCase());
      const matchEstado = !fEstado || (c.estado    || '').toLowerCase().includes(fEstado.toLowerCase());
      const matchCidade = !fCidade || (c.cidade    || '').toLowerCase().includes(fCidade.toLowerCase());
      const matchPerfil = !fPerfil || (c.profile_number || '').toLowerCase().includes(fPerfil.toLowerCase());
      const matchEmail  = !fEmail  || c.email.toLowerCase().includes(fEmail.toLowerCase());
      const matchSetor  = !fSetor  || c.setor.toLowerCase().includes(fSetor.toLowerCase());
      return matchQuery && matchPais && matchEstado && matchCidade && matchPerfil && matchEmail && matchSetor;
    });
  }, [query, fPais, fEstado, fCidade, fPerfil, fEmail, fSetor, allCompanies, hasAdvanced]);

  function clearAll() {
    setQuery('');
    setFPais(''); setFEstado(''); setFCidade('');
    setFPerfil(''); setFEmail(''); setFSetor('');
    setShowAdvanced(false);
  }

  function handleInternalToggle() {
    if (!isControlled) {
      if (intExpanded) clearAll();
      setIntExpanded(v => !v);
    } else {
      onToggle?.();
    }
  }

  const panel = (
    <div className="space-y-3">

      {/* ── Live search bar ── */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar por nome, cidade, setor…"
            className="w-full bg-gray-50 border-2 border-gray-100 py-2.5 pl-9 pr-3 text-xs font-bold text-[#1a2b4a] focus:border-[#c9a96e] outline-none placeholder:text-gray-300 transition-colors"
            autoFocus
          />
        </div>
        <button
          onClick={() => setShowAdvanced(v => !v)}
          title="Filtros avançados"
          className={`flex items-center gap-1.5 px-3 border-2 font-semibold text-xs transition-all flex-shrink-0 ${
            showAdvanced || hasAdvanced
              ? 'bg-[#0a1628] text-white border-[#0a1628]'
              : 'bg-gray-50 border-gray-100 text-gray-500 hover:border-[#c9a96e]/40'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          {showAdvanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
        {(query || hasAdvanced) && (
          <button onClick={clearAll}
            className="px-3 border-2 border-gray-200 text-gray-400 hover:border-red-200 hover:text-red-500 transition-all flex-shrink-0">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* ── Filtros avançados ── */}
      {showAdvanced && (
        <div className="bg-gray-50 border-2 border-gray-100 p-3 space-y-2">
          <p className="text-[9px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em]">Filtros por campo</p>
          <div className="grid grid-cols-2 gap-2">
            {([
              { placeholder: 'País',      value: fPais,   set: setFPais   },
              { placeholder: 'Estado',    value: fEstado, set: setFEstado },
              { placeholder: 'Cidade',    value: fCidade, set: setFCidade },
              { placeholder: 'Nº Perfil', value: fPerfil, set: setFPerfil },
              { placeholder: 'Email',     value: fEmail,  set: setFEmail  },
            ] as const).map(({ placeholder, value, set }) => (
              <input key={placeholder} value={value}
                onChange={e => set(e.target.value)}
                placeholder={placeholder}
                className="bg-white border-2 border-gray-100 px-3 py-2 text-xs font-bold text-[#1a2b4a] focus:border-[#c9a96e] outline-none placeholder:text-gray-300 transition-colors" />
            ))}
          </div>

          {/* Filtro por setor — chips */}
          {setores.length > 0 && (
            <div>
              <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Setor</p>
              <div className="flex flex-wrap gap-1.5">
                <button onClick={() => setFSetor('')}
                  className={`px-2.5 py-1 text-[10px] font-semibold border-2 transition-all ${fSetor === '' ? 'bg-[#0a1628] text-white border-[#0a1628]' : 'bg-white border-gray-100 text-gray-500 hover:border-[#c9a96e]/40'}`}>
                  Todos
                </button>
                {setores.map(s => (
                  <button key={s} onClick={() => setFSetor(fSetor === s ? '' : s)}
                    className={`px-2.5 py-1 text-[10px] font-semibold border-2 transition-all ${fSetor === s ? 'bg-[#c9a96e] text-white border-[#c9a96e]' : 'bg-white border-gray-100 text-gray-500 hover:border-[#c9a96e]/40'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Resultados ── */}
      {results !== null && (
        <div className="space-y-1.5 max-h-72 overflow-y-auto">
          {results.length === 0 ? (
            <p className="text-center text-xs font-bold text-gray-400 py-6">Nenhuma empresa encontrada</p>
          ) : (
            results.map(c => (
              <button key={c.id} onClick={() => onCompanyClick(c)}
                className="w-full bg-gray-50 hover:bg-white hover:border-[#c9a96e]/30 border-2 border-transparent px-3 py-2.5 flex items-center gap-3 transition-all text-left">
                <div className="w-9 h-9 overflow-hidden bg-[#c9a96e]/15 flex items-center justify-center flex-shrink-0">
                  {(c as any).profile_photo
                    ? <img src={(c as any).profile_photo} alt={c.nome_fantasia} className="w-full h-full object-cover" />
                    : <Building2 className="w-4 h-4 text-[#c9a96e]" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#1a2b4a] text-xs truncate">{c.nome_fantasia}</p>
                  <p className="text-[10px] font-bold text-gray-400 truncate">{c.cidade} · {c.setor.split(',')[0].trim()}</p>
                </div>
                <span className="text-[9px] font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 flex-shrink-0">{c.profile_number}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );

  // ── Modo controlado: apenas painel ────────────────────────────────────────
  if (isControlled) {
    if (!expanded) return null;
    return (
      <div className="bg-white border-2 border-gray-100 p-4">
        {panel}
      </div>
    );
  }

  // ── Modo auto-gerido: card com header ─────────────────────────────────────
  return (
    <div className="bg-white border-2 border-gray-100 overflow-hidden">
      <button onClick={handleInternalToggle}
        className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition-colors">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#0a1628]/5 rounded-full flex items-center justify-center flex-shrink-0">
            <Search className="w-4 h-4 text-[#c9a96e]" />
          </div>
          <p className="text-xs font-semibold text-[#1a2b4a] uppercase tracking-wide">Procurar empresas</p>
        </div>
        <span className="text-gray-400 text-lg leading-none">{intExpanded ? '▲' : '▼'}</span>
      </button>
      {intExpanded && (
        <div className="border-t border-gray-100 p-4">
          {panel}
        </div>
      )}
    </div>
  );
}
