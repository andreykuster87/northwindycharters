// src/components/shared/EventosMural.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Mural Público: eventos aprovados + fórum da comunidade.
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useMemo } from 'react';
import { Search, CalendarDays, MessageSquare } from 'lucide-react';
import { getPublicEvents, type NauticEvent } from '../../lib/localStore';
import { TIPO_EMOJI } from './EventosMuralShared';
import { EventCard } from './EventCard';
import { ForumTab, type ForumUser } from './ForumTab';

// ── Componente principal ──────────────────────────────────────────────────────

interface Props {
  title?:        string;
  subtitle?:     string;
  emptyMessage?: string;
  clientId?:     string;
  clientName?:   string;
  clientPhone?:  string;
  actionSlot?:   React.ReactNode;
  currentUser?:  ForumUser;
}

export function EventosMural({
  title = 'Mural Público',
  subtitle = 'Eventos náuticos e fórum da comunidade',
  emptyMessage = 'Nenhum evento disponível no momento.',
  clientId,
  clientName,
  clientPhone,
  actionSlot,
  currentUser,
}: Props) {
  const [muralTab,     setMuralTab]     = useState<'eventos' | 'forum'>('forum');
  const [search,       setSearch]       = useState('');
  const [filterTipo,   setFilterTipo]   = useState('');
  const [filterCidade, setFilterCidade] = useState('');

  const allEvents = getPublicEvents();
  const tipos     = Array.from(new Set(allEvents.map(e => e.tipo))).sort();
  const cidades   = Array.from(new Set(allEvents.map(e => e.cidade))).sort();

  const filtered = useMemo(() => {
    let list = allEvents;
    if (filterTipo)   list = list.filter(e => e.tipo   === filterTipo);
    if (filterCidade) list = list.filter(e => e.cidade === filterCidade);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(e =>
        e.title.toLowerCase().includes(q) ||
        e.local.toLowerCase().includes(q) ||
        e.company_name.toLowerCase().includes(q) ||
        e.cidade.toLowerCase().includes(q)
      );
    }
    return list;
  }, [allEvents, filterTipo, filterCidade, search]);

  const hasFilters = filterTipo || filterCidade || search.trim();

  return (
    <div className="space-y-4">
      {(title || subtitle) && (
        <div>
          {title   && <h2 className="text-lg font-['Playfair_Display'] font-bold text-[#1a2b4a] uppercase italic">{title}</h2>}
          {subtitle && <p className="text-xs text-gray-400 font-bold mt-0.5">{subtitle}</p>}
        </div>
      )}

      {/* Tabs Eventos / Fórum */}
      <div className="flex gap-1 bg-gray-100 p-1">
        {([
          ['forum',   'Fórum',   MessageSquare],
          ['eventos', 'Eventos', CalendarDays],
        ] as const).map(([key, label, Icon]) => (
          <button
            key={key}
            onClick={() => setMuralTab(key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-bold uppercase tracking-wider transition-all ${
              muralTab === key ? 'bg-white text-[#1a2b4a] shadow-sm' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* ── Aba Eventos ── */}
      {muralTab === 'eventos' && (
        <>
          {/* Filtros */}
          <div className="bg-white border-2 border-gray-100 p-3 space-y-2.5">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Buscar eventos, locais, organizadores…"
                className="w-full bg-gray-50 border-2 border-gray-100 py-2.5 pl-9 pr-4 font-bold text-[#1a2b4a] focus:border-[#c9a96e] outline-none text-sm placeholder:text-gray-300" />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select value={filterTipo} onChange={e => setFilterTipo(e.target.value)}
                className="bg-gray-50 border-2 border-gray-100 py-2 px-3 text-xs font-bold text-gray-600 focus:border-[#c9a96e] outline-none transition-all">
                <option value="">🏷️ Todos os tipos</option>
                {tipos.map(t => <option key={t} value={t}>{TIPO_EMOJI[t] || '📌'} {t}</option>)}
              </select>
              {cidades.length > 1 && (
                <select value={filterCidade} onChange={e => setFilterCidade(e.target.value)}
                  className="bg-gray-50 border-2 border-gray-100 py-2 px-3 text-xs font-bold text-gray-600 focus:border-[#c9a96e] outline-none transition-all">
                  <option value="">📍 Todas as cidades</option>
                  {cidades.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              )}
              {hasFilters && (
                <button onClick={() => { setSearch(''); setFilterTipo(''); setFilterCidade(''); }}
                  className="text-[10px] font-bold text-red-400 hover:text-red-600 px-2 py-1 hover:bg-red-50 transition-all">
                  Limpar
                </button>
              )}
              {actionSlot && <div className="ml-auto">{actionSlot}</div>}
            </div>
            {filtered.length !== allEvents.length && (
              <p className="text-[10px] font-bold text-gray-400">
                {filtered.length} evento{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          {/* Grid */}
          {filtered.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-gray-200 py-16 text-center">
              <div className="text-5xl mb-4">⚓</div>
              <p className="font-semibold text-gray-300 uppercase italic">
                {allEvents.length === 0 ? emptyMessage : 'Nenhum evento corresponde aos filtros'}
              </p>
              {hasFilters && (
                <button onClick={() => { setSearch(''); setFilterTipo(''); setFilterCidade(''); }}
                  className="mt-3 text-[#1a2b4a] font-bold text-sm underline">
                  Limpar filtros
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map(ev => (
                <EventCard
                  key={ev.id}
                  ev={ev}
                  clientId={clientId}
                  clientName={clientName}
                  clientPhone={clientPhone}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Aba Fórum ── */}
      {muralTab === 'forum' && (
        <ForumTab currentUser={currentUser} />
      )}
    </div>
  );
}
