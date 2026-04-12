// src/components/shared/CompanySearchCard.tsx
// Painel de busca de empresas.
// Pode ser controlado externamente (expanded/onToggle) ou auto-gerido.
import { useState } from 'react';
import { Search, X, Building2 } from 'lucide-react';
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

  const [results, setResults] = useState<Company[] | null>(null);

  // Campos de filtro
  const [searchNome,   setSearchNome]   = useState('');
  const [searchPais,   setSearchPais]   = useState('');
  const [searchEstado, setSearchEstado] = useState('');
  const [searchCidade, setSearchCidade] = useState('');
  const [searchPerfil, setSearchPerfil] = useState('');
  const [searchEmail,  setSearchEmail]  = useState('');
  const [searchSetor,  setSearchSetor]  = useState('');

  function handleSearch() {
    const all = getCompanies().filter(c => c.status === 'active');
    const r = all.filter(c => {
      const matchNome   = !searchNome   || c.nome_fantasia.toLowerCase().includes(searchNome.toLowerCase());
      const matchPais   = !searchPais   || (c.pais_nome || '').toLowerCase().includes(searchPais.toLowerCase());
      const matchEstado = !searchEstado || (c.estado || '').toLowerCase().includes(searchEstado.toLowerCase());
      const matchCidade = !searchCidade || (c.cidade || '').toLowerCase().includes(searchCidade.toLowerCase());
      const matchPerfil = !searchPerfil || (c.profile_number || '').toLowerCase().includes(searchPerfil.toLowerCase());
      const matchEmail  = !searchEmail  || c.email.toLowerCase().includes(searchEmail.toLowerCase());
      const matchSetor  = !searchSetor  || c.setor.toLowerCase().includes(searchSetor.toLowerCase());
      return matchNome && matchPais && matchEstado && matchCidade && matchPerfil && matchEmail && matchSetor;
    });
    setResults(r);
  }

  function clearSearch() {
    setResults(null);
    setSearchNome(''); setSearchPais(''); setSearchEstado('');
    setSearchCidade(''); setSearchPerfil(''); setSearchEmail(''); setSearchSetor('');
  }

  function handleInternalToggle() {
    if (!isControlled) {
      if (intExpanded) clearSearch();
      setIntExpanded(v => !v);
    } else {
      onToggle?.();
    }
  }

  const hasFilters = searchNome || searchPais || searchEstado || searchCidade || searchPerfil || searchEmail || searchSetor;

  const panel = (
    <div className="space-y-3">
      {/* Filtros */}
      <div className="grid grid-cols-2 gap-2">
        {([
          { placeholder: 'Nome',      value: searchNome,   set: setSearchNome   },
          { placeholder: 'País',      value: searchPais,   set: setSearchPais   },
          { placeholder: 'Estado',    value: searchEstado, set: setSearchEstado },
          { placeholder: 'Cidade',    value: searchCidade, set: setSearchCidade },
          { placeholder: 'Nº Perfil', value: searchPerfil, set: setSearchPerfil },
          { placeholder: 'Email',     value: searchEmail,  set: setSearchEmail  },
        ] as const).map(({ placeholder, value, set }) => (
          <input key={placeholder} value={value}
            onChange={e => set(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder={placeholder}
            className="bg-gray-50 border-2 border-gray-100 rounded-[12px] px-3 py-2.5 text-xs font-bold text-blue-900 focus:border-blue-400 outline-none placeholder:text-gray-300 transition-colors" />
        ))}
      </div>
      <input value={searchSetor} onChange={e => setSearchSetor(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleSearch()}
        placeholder="Setor de negócio"
        className="w-full bg-gray-50 border-2 border-gray-100 rounded-[12px] px-3 py-2.5 text-xs font-bold text-blue-900 focus:border-blue-400 outline-none placeholder:text-gray-300 transition-colors" />

      {/* Botões de ação */}
      <div className="flex gap-2">
        <button onClick={handleSearch}
          className="flex-1 bg-blue-900 hover:bg-blue-800 text-white py-2.5 rounded-[12px] font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-1.5">
          <Search className="w-3.5 h-3.5" /> Pesquisar
        </button>
        {(results !== null || hasFilters) && (
          <button onClick={clearSearch}
            className="px-4 border-2 border-gray-200 text-gray-500 hover:border-red-200 hover:text-red-500 rounded-[12px] font-black text-xs transition-all">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Resultados */}
      {results !== null && (
        <div className="space-y-2 max-h-72 overflow-y-auto">
          {results.length === 0 ? (
            <p className="text-center text-xs font-bold text-gray-400 py-6">Nenhuma empresa encontrada</p>
          ) : (
            results.map(c => (
              <button key={c.id} onClick={() => onCompanyClick(c)}
                className="w-full bg-gray-50 hover:bg-blue-50 hover:border-blue-200 border-2 border-transparent rounded-[14px] px-3 py-2.5 flex items-center gap-3 transition-all text-left">
                <div className="w-9 h-9 rounded-full overflow-hidden bg-amber-100 flex items-center justify-center flex-shrink-0">
                  {(c as any).profile_photo
                    ? <img src={(c as any).profile_photo} alt={c.nome_fantasia} className="w-full h-full object-cover" />
                    : <Building2 className="w-4 h-4 text-amber-600" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-blue-900 text-xs truncate">{c.nome_fantasia}</p>
                  <p className="text-[10px] font-bold text-gray-400 truncate">{c.cidade} · {c.setor.split(',')[0]}</p>
                </div>
                <span className="text-[9px] font-black text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full flex-shrink-0">{c.profile_number}</span>
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
      <div className="bg-white border-2 border-gray-100 rounded-[20px] p-4">
        {panel}
      </div>
    );
  }

  // ── Modo auto-gerido: card com header ─────────────────────────────────────
  return (
    <div className="bg-white border-2 border-gray-100 rounded-[20px] overflow-hidden">
      <button onClick={handleInternalToggle}
        className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition-colors">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
            <Search className="w-4 h-4 text-blue-700" />
          </div>
          <p className="text-xs font-black text-blue-900 uppercase tracking-wide">Procurar empresas</p>
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
