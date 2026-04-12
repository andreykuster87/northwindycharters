// src/components/CreateTripModal/steps/Step4Agenda.tsx
import { Beer, Wine, UtensilsCrossed, CalendarDays, Plus, Trash2, ChevronDown } from 'lucide-react';
import { TIME_OPTIONS, today, type ScheduleEntry, type TripBoat } from '../../../constants/constants';
import { OptionChip } from '../../shared/OptionChip';

// ── helpers ───────────────────────────────────────────────────────────────────

function duracaoToHours(dur: string): number {
  if (!dur) return 0;
  if (dur === 'Dia completo')  return 12;
  if (dur === 'Fim de semana') return 48;
  const diasMatch = dur.match(/(\d+(?:\.\d+)?)\s*dia/i);
  if (diasMatch) return parseFloat(diasMatch[1]) * 24;
  const hMatch = dur.match(/^(\d+)h(\d+)?m?/);
  if (hMatch) return parseInt(hMatch[1], 10) + (hMatch[2] ? parseInt(hMatch[2], 10) / 60 : 0);
  const mMatch = dur.match(/^(\d+)\s*min/);
  if (mMatch) return parseInt(mMatch[1], 10) / 60;
  return 0;
}

/** Converts "YYYY-MM-DD" + "HH:MM" to absolute minutes since epoch-day */
function toAbsMin(date: string, slot: string): number {
  const [y, mo, d] = date.split('-').map(Number);
  const [h, m]     = slot.split(':').map(Number);
  // Use day-index (days since 2000-01-01) * 1440 + slot minutes
  const base = new Date(y, mo - 1, d).getTime() / 60000; // minutes since epoch
  return base + h * 60 + m;
}

/**
 * For a given entry, returns the set of slots that are blocked because a
 * selected slot (from ANY entry in the schedule) occupies that time window.
 * This correctly handles cross-day overlaps.
 */
function getGlobalBlockedSlots(
  targetEntry: ScheduleEntry,
  allEntries:  ScheduleEntry[],
  duracao:     string,
): Set<string> {
  const hours   = duracaoToHours(duracao);
  if (hours <= 0) return new Set();
  const blocked = new Set<string>();

  // For each slot in ANY entry (including this one), mark windows on targetEntry
  allEntries.forEach(srcEntry => {
    srcEntry.time_slots.forEach(startSlot => {
      const startAbs = toAbsMin(srcEntry.date, startSlot);
      const endAbs   = startAbs + hours * 60;

      TIME_OPTIONS.forEach(slot => {
        // Skip the start slot itself — it's the selected one, not blocked
        if (srcEntry.id === targetEntry.id && slot === startSlot) return;

        const slotAbs = toAbsMin(targetEntry.date, slot);
        // Slot is blocked if it falls strictly inside [startAbs, endAbs)
        if (slotAbs > startAbs && slotAbs < endAbs) {
          blocked.add(slot);
        }
      });
    });
  });

  return blocked;
}

/** Returns true if this slot is in the past (for today's date) */
function isSlotPast(date: string, slot: string): boolean {
  const todayStr = new Date().toISOString().split('T')[0];
  if (date !== todayStr) return date < todayStr;
  const [h, m] = slot.split(':').map(Number);
  const now = new Date();
  return h < now.getHours() || (h === now.getHours() && m <= now.getMinutes());
}

/** Today's date as YYYY-MM-DD */
const todayDate = () => new Date().toISOString().split('T')[0];

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  boat:             TripBoat;
  duracao:          string;
  bebidas:          'inclusas' | 'nao_inclusas' | 'traga';
  comida:           'inclusa' | 'nao_inclusa';
  bar:              'tem' | 'nao_tem';
  schedule:         ScheduleEntry[];
  expandedEntry:    string | null;
  onBebidasChange:  (v: 'inclusas' | 'nao_inclusas' | 'traga') => void;
  onComidaChange:   (v: 'inclusa' | 'nao_inclusa') => void;
  onBarChange:      (v: 'tem' | 'nao_tem') => void;
  onAddEntry:       () => void;
  onRemoveEntry:    (id: string) => void;
  onUpdateEntry:    (id: string, patch: Partial<ScheduleEntry>) => void;
  onToggleSlot:     (id: string, slot: string) => void;
  onExpandEntry:    (id: string | null) => void;
  onBack:           () => void;
  onNext:           () => void;
}

// ── Componente ────────────────────────────────────────────────────────────────

export function Step4Agenda({
  boat, duracao, bebidas, comida, bar, schedule, expandedEntry,
  onBebidasChange, onComidaChange, onBarChange,
  onAddEntry, onRemoveEntry, onUpdateEntry, onToggleSlot, onExpandEntry,
  onBack, onNext,
}: Props) {

  const fmt = (d: string) => { if (!d) return '—'; const [y, m, dd] = d.split('-'); return `${dd}/${m}/${y}`; };

  // Next available date not already in schedule
  const getNextFreeDate = () => {
    const usedDates = new Set(schedule.map(e => e.date));
    let d = new Date();
    d.setHours(0, 0, 0, 0);
    for (let i = 0; i < 365; i++) {
      const str = d.toISOString().split('T')[0];
      if (!usedDates.has(str)) return str;
      d.setDate(d.getDate() + 1);
    }
    return todayDate();
  };

  function handleAddEntry() {
    onAddEntry();
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">

      {/* Extras */}
      <div className="space-y-4">
        <p className="text-xs font-black text-blue-900 uppercase flex items-center gap-2">
          <Beer className="w-3.5 h-3.5" /> Extras a Bordo
        </p>
        <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <Wine className="w-3 h-3" /> Bebidas
          </p>
          <div className="flex gap-2 flex-wrap">
            <OptionChip label="Inclusas"         icon="🍾" active={bebidas === 'inclusas'}     onClick={() => onBebidasChange('inclusas')} />
            <OptionChip label="Não inclusas"     icon="🚫" active={bebidas === 'nao_inclusas'} onClick={() => onBebidasChange('nao_inclusas')} />
            <OptionChip label="Traga sua bebida" icon="🎒" active={bebidas === 'traga'}         onClick={() => onBebidasChange('traga')} />
          </div>
        </div>
        <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <UtensilsCrossed className="w-3 h-3" /> Alimentação
          </p>
          <div className="flex gap-2 flex-wrap">
            <OptionChip label="Inclusa"     icon="🍽️" active={comida === 'inclusa'}     onClick={() => onComidaChange('inclusa')} />
            <OptionChip label="Não inclusa" icon="🚫" active={comida === 'nao_inclusa'} onClick={() => onComidaChange('nao_inclusa')} />
          </div>
        </div>
        <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <Beer className="w-3 h-3" /> Bar a Bordo
          </p>
          <div className="flex gap-2 flex-wrap">
            <OptionChip label="Temos bar a bordo" icon="🍹" active={bar === 'tem'}     onClick={() => onBarChange('tem')} />
            <OptionChip label="Sem bar a bordo"   icon="🚫" active={bar === 'nao_tem'} onClick={() => onBarChange('nao_tem')} />
          </div>
        </div>
      </div>

      <div className="border-t-2 border-dashed border-gray-100" />

      {/* Agenda */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="flex items-center gap-2 text-xs font-black text-blue-900 uppercase">
            <CalendarDays className="w-3.5 h-3.5" /> Datas e Horários *
          </label>
          <button type="button" onClick={handleAddEntry}
            className="flex items-center gap-1.5 bg-blue-900 hover:bg-blue-800 text-white px-3 py-1.5 rounded-full font-black text-[10px] uppercase transition-all">
            <Plus className="w-3 h-3" /> Adicionar data
          </button>
        </div>
        <div className="space-y-3">
          {schedule.map(entry => {
            const isOpen = expandedEntry === entry.id;
            const isPast = entry.date < todayDate();
            return (
              <div key={entry.id} className={`border-2 rounded-[20px] overflow-hidden ${isPast ? 'border-red-200 opacity-60' : 'border-gray-100'}`}>
                <div onClick={() => onExpandEntry(isOpen ? null : entry.id)}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all ${isOpen ? 'bg-blue-900' : isPast ? 'bg-red-50 hover:bg-red-100' : 'bg-gray-50 hover:bg-blue-50'}`}>
                  <CalendarDays className={`w-4 h-4 flex-shrink-0 ${isOpen ? 'text-blue-300' : isPast ? 'text-red-400' : 'text-gray-400'}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`font-black text-sm ${isOpen ? 'text-white' : isPast ? 'text-red-600' : 'text-blue-900'}`}>
                      {fmt(entry.date)} {isPast && <span className="text-[10px] font-black text-red-400 ml-1">⚠️ data passada</span>}
                    </p>
                    <p className={`text-[10px] font-bold truncate ${isOpen ? 'text-blue-300' : 'text-gray-400'}`}>
                      {entry.time_slots.length > 0 ? entry.time_slots.join('  ·  ') : 'Nenhum horário selecionado'} · {entry.spots} vagas
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {schedule.length > 1 && (
                      <button type="button" onClick={e => { e.stopPropagation(); onRemoveEntry(entry.id); }}
                        className={`p-1.5 rounded-full transition-all ${isOpen ? 'text-red-300 hover:bg-red-500 hover:text-white' : 'text-gray-300 hover:bg-red-100 hover:text-red-500'}`}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180 text-blue-300' : 'text-gray-400'}`} />
                  </div>
                </div>

                {isOpen && (
                  <div className="p-4 space-y-4 bg-white border-t-2 border-blue-100">
                    {/* Data */}
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase mb-2">📅 Data</p>
                      <input
                        type="date"
                        value={entry.date}
                        min={todayDate()}
                        onChange={e => {
                          const newDate = e.target.value;
                          // Block duplicate dates for the same boat
                          const dup = schedule.some(s => s.id !== entry.id && s.date === newDate);
                          if (dup) return; // silently ignore (validation is in parent)
                          onUpdateEntry(entry.id, { date: newDate, time_slots: [] });
                        }}
                        className="w-full bg-gray-50 border-2 border-gray-100 focus:border-blue-900 rounded-[14px] px-4 py-3 font-black text-blue-900 outline-none transition-all text-sm" />
                      {schedule.some(s => s.id !== entry.id && s.date === entry.date) && (
                        <p className="text-xs text-red-500 font-bold mt-1">⚠️ Já existe uma data igual neste passeio.</p>
                      )}
                    </div>
                    {/* Vagas */}
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase mb-2">👥 Vagas neste dia</p>
                      <div className="flex items-center gap-3">
                        <button type="button" onClick={() => onUpdateEntry(entry.id, { spots: Math.max(1, entry.spots - 1) })}
                          className="w-9 h-9 rounded-full bg-gray-100 hover:bg-blue-100 font-black text-lg text-blue-900 transition-all flex items-center justify-center">−</button>
                        <span className="font-black text-blue-900 text-xl w-12 text-center">{entry.spots}</span>
                        <button type="button" onClick={() => onUpdateEntry(entry.id, { spots: Math.min(boat.capacity, entry.spots + 1) })}
                          className="w-9 h-9 rounded-full bg-gray-100 hover:bg-blue-100 font-black text-lg text-blue-900 transition-all flex items-center justify-center">+</button>
                        <span className="text-xs text-gray-400 font-bold">/ máx {boat.capacity}</span>
                      </div>
                    </div>
                    {/* Horários */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] font-black text-gray-400 uppercase">🕐 Horários disponíveis</p>
                        {duracao && (
                          <span className="text-[10px] font-black text-blue-400 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
                            Duração: {duracao}
                          </span>
                        )}
                      </div>
                      {duracao && entry.time_slots.length > 0 && (
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <span className="flex items-center gap-1 text-[9px] font-black text-blue-900 uppercase">
                            <span className="w-3 h-3 bg-blue-900 rounded-[3px] inline-block" />Selecionado
                          </span>
                          <span className="flex items-center gap-1 text-[9px] font-black text-orange-600 uppercase">
                            <span className="w-3 h-3 bg-orange-400 rounded-[3px] inline-block" />Em uso
                          </span>
                          <span className="flex items-center gap-1 text-[9px] font-black text-gray-400 uppercase">
                            <span className="w-3 h-3 bg-gray-200 rounded-[3px] inline-block" />Passado
                          </span>
                        </div>
                      )}
                      {/* Cross-day warning */}
                      {duracao && entry.time_slots.some(slot => {
                        const hours = duracaoToHours(duracao);
                        const [h, m] = slot.split(':').map(Number);
                        return (h * 60 + m + hours * 60) > 24 * 60;
                      }) && (
                        <div className="mb-2 bg-amber-50 border border-amber-200 rounded-[10px] px-3 py-2">
                          <p className="text-[10px] font-black text-amber-700">
                            ⚠️ Este horário ultrapassa meia-noite — o bloqueio aplica-se automaticamente ao dia seguinte.
                          </p>
                        </div>
                      )}
                      <div className="grid grid-cols-6 gap-1.5">
                        {(() => {
                          const blockedByOverlap = getGlobalBlockedSlots(entry, schedule, duracao);
                          return TIME_OPTIONS.map(slot => {
                            const active  = entry.time_slots.includes(slot);
                            const blocked = !active && blockedByOverlap.has(slot);
                            const past    = !active && isSlotPast(entry.date, slot);
                            const cls     = active
                              ? 'bg-blue-900 text-white border-blue-900 shadow-md'
                              : blocked
                              ? 'bg-orange-100 text-orange-400 border-orange-200 cursor-not-allowed opacity-70'
                              : past
                              ? 'bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed opacity-50'
                              : 'bg-gray-50 text-gray-400 border-gray-100 hover:border-blue-300 hover:text-blue-900';
                            const disabled = blocked || past;
                            return (
                              <button key={slot} type="button"
                                disabled={disabled}
                                onClick={() => !disabled && onToggleSlot(entry.id, slot)}
                                title={past ? 'Horário passado' : blocked ? `Bloqueado — dentro do intervalo de ${duracao}` : slot}
                                className={`py-2 px-1 rounded-[10px] font-black text-[11px] transition-all border-2 ${cls}`}>
                                {slot}
                              </button>
                            );
                          });
                        })()}
                      </div>
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
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onBack}
          className="px-6 py-5 border-2 border-gray-100 text-gray-400 rounded-[30px] font-black text-sm uppercase hover:border-blue-900 hover:text-blue-900 transition-all">
          ← Voltar
        </button>
        <button type="button" onClick={onNext}
          className="flex-1 bg-blue-900 text-white py-5 rounded-[30px] font-black uppercase tracking-widest text-sm hover:bg-blue-800 shadow-xl transition-all">
          Próximo → Descrição
        </button>
      </div>
    </div>
  );
}