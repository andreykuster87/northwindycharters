// src/components/shared/SailorSearchCard.tsx
// Painel de busca de tripulantes com live search + filtros avançados (função, disponibilidade, letra, etc.).
import { useState, useMemo } from 'react';
import { Search, X, User, SlidersHorizontal, ChevronDown, ChevronUp, Anchor, CalendarDays, CheckCircle2 } from 'lucide-react';
import { getSailors } from '../../lib/localStore';
import type { Sailor } from '../../lib/store/core';
import { FUNCOES_MARITIMAS } from '../../constants/sailorConstants';

// ── Constantes de disponibilidade (espelho do SailorProfileView) ─────────────

const DISP_OPTIONS = [
  { id: 'indisponivel',   label: 'Indisponível'           },
  { id: 'disponivel',     label: 'Disponível'             },
  { id: 'imediato',       label: 'Embarque Imediato'      },
  { id: 'trajeto_curto',  label: 'Trajeto Curto'          },
  { id: 'nacionais',      label: 'Viagens Nacionais'      },
  { id: 'internacionais', label: 'Viagens Internacionais' },
  { id: 'meio_periodo',   label: 'Meio Período'           },
  { id: 'sob_demanda',    label: 'Sob Demanda'            },
  { id: 'ferias',         label: 'Férias'                 },
] as const;


// ── Props ─────────────────────────────────────────────────────────────────────

interface SailorSearchCardProps {
  onSailorClick: (sailor: Sailor) => void;
  /** Modo controlado (sem header interno) */
  expanded?:  boolean;
  onToggle?:  () => void;
}

// ── Componente ────────────────────────────────────────────────────────────────

export function SailorSearchCard({ onSailorClick, onToggle, expanded: extExpanded }: SailorSearchCardProps) {
  const [intExpanded, setIntExpanded] = useState(false);

  const isControlled = extExpanded !== undefined;
  const expanded     = isControlled ? extExpanded : intExpanded;

  // ── Live search
  const [query, setQuery] = useState('');

  // ── Filtros avançados
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [fNacionalidade,  setFNacionalidade]  = useState('');
  const [fPerfil,         setFPerfil]         = useState('');
  const [fFuncao,         setFFuncao]         = useState('');
  const [fDisp,           setFDisp]           = useState('');

  const hasAdvanced = fNacionalidade || fPerfil || fFuncao || fDisp;

  // ── Dados: apenas tripulantes aprovados
  const allSailors = useMemo(() => getSailors().filter(s => s.status === 'approved'), []);

  // ── Funções únicas extraídas dos tripulantes
  const funcoes = useMemo(
    () => Array.from(new Set(
      allSailors.flatMap(s => (s.funcao || '').split(',').map(f => f.trim()).filter(Boolean))
    )).sort(),
    [allSailors],
  );

  // ── Disponibilidades únicas
  const disps = useMemo(
    () => {
      const ids = new Set(allSailors.flatMap(s => s.disponibilidade ?? []));
      return DISP_OPTIONS.filter(o => ids.has(o.id));
    },
    [allSailors],
  );

  // ── Resultados: live filter
  const results = useMemo(() => {
    if (!query && !hasAdvanced) return null;
    return allSailors.filter(s => {
      const q = query.toLowerCase();
      const matchQuery = !query || [s.name, s.funcao, s.nacionalidade, s.profile_number, ...(s.idiomas ?? [])]
        .some(v => v?.toLowerCase().includes(q));
      const matchNac   = !fNacionalidade || (s.nacionalidade || '').toLowerCase().includes(fNacionalidade.toLowerCase());
      const matchPerf  = !fPerfil || (s.profile_number || '').toLowerCase().includes(fPerfil.toLowerCase());
      const matchFunc  = !fFuncao || (s.funcao || '').toLowerCase().includes(fFuncao.toLowerCase());
      const matchDisp  = !fDisp   || (s.disponibilidade ?? []).includes(fDisp);
      return matchQuery && matchNac && matchPerf && matchFunc && matchDisp;
    });
  }, [query, fNacionalidade, fPerfil, fFuncao, fDisp, allSailors, hasAdvanced]);

  function clearAll() {
    setQuery('');
    setFNacionalidade(''); setFPerfil('');
    setFFuncao(''); setFDisp('');
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
            placeholder="Buscar por nome, função, nacionalidade…"
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
        <div className="bg-gray-50 border-2 border-gray-100 p-3 space-y-3">

          {/* Filtros por campo */}
          <div>
            <p className="text-[9px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em] mb-1.5">Filtros por campo</p>
            <div className="grid grid-cols-2 gap-2">
              {([
                { placeholder: 'Nacionalidade', value: fNacionalidade, set: setFNacionalidade },
                { placeholder: 'Nº Perfil',     value: fPerfil,        set: setFPerfil        },
              ] as const).map(({ placeholder, value, set }) => (
                <input key={placeholder} value={value}
                  onChange={e => set(e.target.value)}
                  placeholder={placeholder}
                  className="bg-white border-2 border-gray-100 px-3 py-2 text-xs font-bold text-[#1a2b4a] focus:border-[#c9a96e] outline-none placeholder:text-gray-300 transition-colors" />
              ))}
            </div>
          </div>

          {/* Filtro por função — chips */}
          {funcoes.length > 0 && (
            <div>
              <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Anchor className="w-3 h-3" /> Função
              </p>
              <div className="flex flex-wrap gap-1.5">
                <button onClick={() => setFFuncao('')}
                  className={`px-2.5 py-1 text-[10px] font-semibold border-2 transition-all ${fFuncao === '' ? 'bg-[#0a1628] text-white border-[#0a1628]' : 'bg-white border-gray-100 text-gray-500 hover:border-[#c9a96e]/40'}`}>
                  Todas
                </button>
                {funcoes.map(f => (
                  <button key={f} onClick={() => setFFuncao(fFuncao === f ? '' : f)}
                    className={`px-2.5 py-1 text-[10px] font-semibold border-2 transition-all ${fFuncao === f ? 'bg-[#c9a96e] text-white border-[#c9a96e]' : 'bg-white border-gray-100 text-gray-500 hover:border-[#c9a96e]/40'}`}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Filtro por disponibilidade — chips */}
          {disps.length > 0 && (
            <div>
              <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <CalendarDays className="w-3 h-3" /> Disponibilidade
              </p>
              <div className="flex flex-wrap gap-1.5">
                <button onClick={() => setFDisp('')}
                  className={`px-2.5 py-1 text-[10px] font-semibold border-2 transition-all ${fDisp === '' ? 'bg-[#0a1628] text-white border-[#0a1628]' : 'bg-white border-gray-100 text-gray-500 hover:border-[#c9a96e]/40'}`}>
                  Todas
                </button>
                {disps.map(d => (
                  <button key={d.id} onClick={() => setFDisp(fDisp === d.id ? '' : d.id)}
                    className={`px-2.5 py-1 text-[10px] font-semibold border-2 transition-all ${fDisp === d.id ? 'bg-[#c9a96e] text-white border-[#c9a96e]' : 'bg-white border-gray-100 text-gray-500 hover:border-[#c9a96e]/40'}`}>
                    {d.label}
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
            <p className="text-center text-xs font-bold text-gray-400 py-6">Nenhum tripulante encontrado</p>
          ) : (
            results.map(s => {
              const funcao = s.funcao
                ? s.funcao.split(',')[0].trim()
                : '';
              return (
                <button key={s.id} onClick={() => onSailorClick(s)}
                  className="w-full bg-gray-50 hover:bg-white hover:border-[#c9a96e]/30 border-2 border-transparent px-3 py-2.5 flex items-center gap-3 transition-all text-left">
                  <div className="w-9 h-9 overflow-hidden bg-[#0a1628]/10 flex items-center justify-center flex-shrink-0">
                    {s.profile_photo
                      ? <img src={s.profile_photo} alt={s.name} className="w-full h-full object-cover" />
                      : <User className="w-4 h-4 text-[#c9a96e]" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#1a2b4a] text-xs truncate flex items-center gap-1.5">
                      {s.name}
                      {s.verified && <CheckCircle2 className="w-3 h-3 text-emerald-500 flex-shrink-0" />}
                    </p>
                    <p className="text-[10px] font-bold text-gray-400 truncate">
                      {[funcao, s.nacionalidade].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  <span className="text-[9px] font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 flex-shrink-0">{s.profile_number}</span>
                </button>
              );
            })
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
          <p className="text-xs font-semibold text-[#1a2b4a] uppercase tracking-wide">Procurar tripulantes</p>
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
