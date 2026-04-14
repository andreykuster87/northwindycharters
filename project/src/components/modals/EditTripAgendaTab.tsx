// src/components/modals/EditTripAgendaTab.tsx
// Conteúdo do tab Agenda do EditTripModal.
import { CalendarDays, Plus, Trash2, ChevronDown, Users, Clock } from 'lucide-react';
import { TIME_OPTIONS, type ScheduleEntry } from '../../constants/constants';
import { entryBlocked, fmt } from './EditTripModalShared';
import { today } from '../../constants/constants';

interface AgendaTabProps {
  schedule:         ScheduleEntry[];
  expandedEntry:    string | null;
  setExpandedEntry: (id: string | null) => void;
  duracao:          string;
  capacity:         number;
  onAddEntry:       () => void;
  onRemoveEntry:    (id: string) => void;
  onUpdateEntry:    (id: string, patch: Partial<ScheduleEntry>) => void;
  onToggleSlot:     (id: string, slot: string) => void;
}

export function EditTripAgendaTab({
  schedule,
  expandedEntry,
  setExpandedEntry,
  duracao,
  capacity,
  onAddEntry,
  onRemoveEntry,
  onUpdateEntry,
  onToggleSlot,
}: AgendaTabProps) {
  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-[#c9a96e] uppercase tracking-[0.15em] flex items-center gap-2">
          <CalendarDays className="w-3.5 h-3.5" /> Datas & Horários
        </p>
        <button onClick={onAddEntry}
          className="flex items-center gap-1.5 bg-[#0a1628] hover:bg-[#0a1628]/90 text-white px-3 py-2 font-semibold text-[10px] uppercase transition-all">
          <Plus className="w-3 h-3" /> Nova data
        </button>
      </div>

      {/* Lista de datas */}
      <div className="space-y-2.5">
        {schedule
          .slice()
          .sort((a, b) => a.date.localeCompare(b.date))
          .map(entry => {
            const isOpen  = expandedEntry === entry.id;
            const isPast  = entry.date < today();
            const blocked = entryBlocked(entry, duracao);

            return (
              <div key={entry.id} className={`border overflow-hidden transition-all
                ${isPast ? 'border-gray-100 opacity-60' : isOpen ? 'border-[#0a1628]' : 'border-gray-100'}`}>

                {/* Cabeçalho da data */}
                <div onClick={() => setExpandedEntry(isOpen ? null : entry.id)}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all
                    ${isOpen ? 'bg-[#0a1628]' : 'bg-gray-50 hover:bg-gray-50'}`}>

                  <CalendarDays className={`w-4 h-4 flex-shrink-0 ${isOpen ? 'text-[#c9a96e]' : isPast ? 'text-gray-300' : 'text-[#c9a96e]'}`} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`font-bold text-sm ${isOpen ? 'text-white' : isPast ? 'text-gray-400' : 'text-[#1a2b4a]'}`}>
                        {fmt(entry.date)}
                      </p>
                      {isPast && (
                        <span className="text-[9px] font-semibold bg-gray-200 text-gray-500 px-1.5 py-0.5">passada</span>
                      )}
                    </div>
                    <p className={`text-[10px] font-bold truncate mt-0.5 ${isOpen ? 'text-[#c9a96e]/70' : 'text-gray-400'}`}>
                      {entry.time_slots.length > 0
                        ? entry.time_slots.join(' · ')
                        : 'Nenhum horário'
                      } · {entry.spots} vagas
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button type="button" onClick={e => { e.stopPropagation(); onRemoveEntry(entry.id); }}
                      className={`p-1.5 transition-all ${isOpen ? 'text-red-300 hover:bg-red-500 hover:text-white' : 'text-gray-300 hover:bg-red-100 hover:text-red-500'}`}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180 text-[#c9a96e]' : 'text-gray-400'}`} />
                  </div>
                </div>

                {/* Painel expandido */}
                {isOpen && (
                  <div className="p-4 space-y-4 bg-white border-t border-[#c9a96e]/20 animate-in fade-in duration-150">

                    {/* Data */}
                    <div>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase mb-2 flex items-center gap-1">
                        <CalendarDays className="w-3 h-3" /> Data
                      </p>
                      <input type="date" value={entry.date}
                        onChange={e => onUpdateEntry(entry.id, { date: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 focus:border-[#c9a96e] px-4 py-3 font-bold text-[#1a2b4a] outline-none transition-all text-sm" />
                    </div>

                    {/* Vagas */}
                    <div>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase mb-2 flex items-center gap-1">
                        <Users className="w-3 h-3" /> Vagas neste dia
                      </p>
                      <div className="flex items-center gap-3">
                        <button type="button" onClick={() => onUpdateEntry(entry.id, { spots: Math.max(1, entry.spots - 1) })}
                          className="w-9 h-9 bg-gray-100 hover:bg-[#0a1628]/5 font-bold text-lg text-[#1a2b4a] transition-all flex items-center justify-center">−</button>
                        <span className="font-bold text-[#1a2b4a] text-xl w-12 text-center">{entry.spots}</span>
                        <button type="button" onClick={() => onUpdateEntry(entry.id, { spots: Math.min(capacity, entry.spots + 1) })}
                          className="w-9 h-9 bg-gray-100 hover:bg-[#0a1628]/5 font-bold text-lg text-[#1a2b4a] transition-all flex items-center justify-center">+</button>
                        <span className="text-xs text-gray-400 font-bold">/ máx {capacity}</span>
                      </div>
                    </div>

                    {/* Horários */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Horários disponíveis
                        </p>
                        {duracao && (
                          <span className="text-[10px] font-semibold text-[#c9a96e] bg-[#c9a96e]/5 border border-[#c9a96e]/20 px-2 py-0.5">
                            ⏱ {duracao}
                          </span>
                        )}
                      </div>

                      {/* legenda */}
                      {duracao && entry.time_slots.length > 0 && (
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <span className="flex items-center gap-1 text-[9px] font-semibold text-[#1a2b4a] uppercase">
                            <span className="w-3 h-3 bg-[#0a1628] inline-block" /> Selecionado
                          </span>
                          <span className="flex items-center gap-1 text-[9px] font-semibold text-orange-600 uppercase">
                            <span className="w-3 h-3 bg-orange-400 inline-block" /> Em uso
                          </span>
                          <span className="flex items-center gap-1 text-[9px] font-semibold text-gray-400 uppercase">
                            <span className="w-3 h-3 bg-gray-100 border border-gray-200 inline-block" /> Livre
                          </span>
                        </div>
                      )}

                      <div className="grid grid-cols-5 gap-1.5">
                        {TIME_OPTIONS.map(slot => {
                          const active    = entry.time_slots.includes(slot);
                          const isBlocked = !active && blocked.has(slot);
                          const cls = active
                            ? 'bg-[#0a1628] text-white border-[#0a1628] shadow-md'
                            : isBlocked
                            ? 'bg-orange-100 text-orange-400 border-orange-200 cursor-not-allowed opacity-70'
                            : 'bg-gray-50 text-gray-500 border-gray-100 hover:border-[#c9a96e]/30 hover:text-[#1a2b4a]';
                          return (
                            <button key={slot} type="button" disabled={isBlocked}
                              onClick={() => !isBlocked && onToggleSlot(entry.id, slot)}
                              className={`py-2 px-1 font-semibold text-[11px] transition-all border ${cls}`}>
                              {slot}
                            </button>
                          );
                        })}
                      </div>

                      {!duracao && (
                        <p className="text-[10px] text-amber-500 font-bold mt-2">
                          ⚠️ Defina a duração na aba Valor para bloquear slots automaticamente
                        </p>
                      )}
                      {entry.time_slots.length === 0 && (
                        <p className="text-[10px] text-amber-500 font-bold mt-2">⚠️ Selecione ao menos um horário</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
      </div>

      {schedule.length === 0 && (
        <div className="bg-gray-50 border border-dashed border-gray-200 py-10 text-center">
          <CalendarDays className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-400 font-semibold text-xs uppercase">Nenhuma data cadastrada</p>
        </div>
      )}
    </div>
  );
}
