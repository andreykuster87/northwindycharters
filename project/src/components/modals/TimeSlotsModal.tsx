// src/components/TimeSlotsModal.tsx
import { X, Users } from 'lucide-react';

export interface ScheduleData {
  date:      string;
  time_slots: string[];
  spots:     number;
  spotsLeft: number;
  slotSpots: Record<string, number>;
}

interface Props {
  entry:    ScheduleData;
  boatName: string;
  onClose:  () => void;
  onBook:   (date: string, slot: string) => void;
}

export function TimeSlotsModal({ entry, boatName, onClose, onBook }: Props) {
  const parts = entry.date.split('-');
  const d = parts[2], m = parts[1], y = parts[0];

  // Soma vagas de todos os horários individuais
  const totalAvailable = entry.time_slots.length > 0
    ? entry.time_slots.reduce((sum, slot) => {
        const sv = entry.slotSpots[slot] ?? 0;
        return sum + Math.max(0, sv);
      }, 0)
    : entry.spotsLeft;

  const soldOut = totalAvailable === 0;

  const dayBg   = soldOut             ? 'bg-red-50 border-red-200'     :
                  totalAvailable > 5  ? 'bg-green-50 border-green-200' :
                                        'bg-amber-50 border-amber-200';
  const dayText = soldOut             ? 'text-red-600'   :
                  totalAvailable > 5  ? 'text-green-700' :
                                        'text-amber-700';

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-4"
      style={{ background: 'rgba(4,10,24,0.88)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-sm shadow-2xl border border-[#c9a96e]/30 animate-in zoom-in-95 duration-300 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="bg-[#0a1628] px-6 py-5 flex items-start justify-between gap-3 relative"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 24px,rgba(201,169,110,0.04) 24px,rgba(201,169,110,0.04) 25px),repeating-linear-gradient(90deg,transparent,transparent 24px,rgba(201,169,110,0.04) 24px,rgba(201,169,110,0.04) 25px)',
          }}
        >
          <div>
            <p className="text-[#c9a96e] text-[10px] font-semibold uppercase tracking-[0.15em] mb-0.5">
              {boatName}
            </p>
            <h3 className="text-2xl font-['Playfair_Display'] font-bold text-white leading-tight">{d}/{m}/{y}</h3>
            <p className="text-[#c9a96e]/70 text-xs font-semibold mt-1 uppercase tracking-[0.15em]">
              Vagas e horários disponíveis
            </p>
          </div>
          <button
            onClick={onClose}
            className="bg-white/10 hover:bg-white/20 text-white p-2.5 transition-all flex-shrink-0 mt-0.5"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="absolute bottom-0 left-0 right-0 h-px bg-[#c9a96e]/40" />
        </div>

        <div className="p-6 space-y-5">

          {/* Sold Out */}
          {soldOut ? (
            <div className="flex flex-col items-center gap-3 py-2">
              <div className="w-16 h-16 bg-red-100 flex items-center justify-center">
                <span className="text-3xl">🚫</span>
              </div>
              <p className="font-semibold text-red-600 text-2xl uppercase tracking-[0.15em]">Sold Out</p>
              <div className="w-full bg-red-50 border border-red-200 px-4 py-3 text-center">
                <p className="text-red-600 font-semibold text-sm">0 vagas disponíveis neste dia</p>
                <p className="text-red-400 font-bold text-xs mt-0.5">Tente selecionar outra data</p>
              </div>
              <button
                onClick={onClose}
                className="w-full border border-gray-200 text-gray-400 py-4 font-semibold uppercase text-sm hover:border-[#c9a96e] hover:text-[#1a2b4a] transition-all"
              >
                Escolher outra data
              </button>
            </div>
          ) : (
            <>
              {/* Total do dia */}
              <div className={`flex items-center gap-3 px-5 py-4 border ${dayBg}`}>
                <Users className={`w-5 h-5 flex-shrink-0 ${dayText}`} />
                <div>
                  <p className={`font-semibold text-sm ${dayText}`}>
                    {totalAvailable} vaga{totalAvailable !== 1 ? 's' : ''} disponíve{totalAvailable !== 1 ? 'is' : 'l'} neste dia
                  </p>
                  <p className="text-[10px] font-bold text-gray-400 mt-0.5">
                    Selecione um horário para reservar
                  </p>
                </div>
              </div>

              {/* Horários */}
              {entry.time_slots.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em] mb-3">
                    Escolha o horário
                  </p>
                  <div className="space-y-2">
                    {entry.time_slots.map(slot => {
                      const sv  = Math.max(0, entry.slotSpots[slot] ?? 0);
                      const ok  = sv > 0;

                      const btnCls =
                        sv > 3 ? 'bg-[#0a1628] text-white hover:bg-[#0a1628]/90 shadow-sm' :
                        sv > 0 ? 'bg-amber-500 text-white hover:bg-amber-400 shadow-sm' :
                                 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60';

                      const badgeCls =
                        sv > 3 ? 'bg-white/10 text-[#c9a96e]' :
                        sv > 0 ? 'bg-amber-400 text-amber-900' :
                                 'bg-gray-200 text-gray-400';

                      return (
                        <button
                          key={slot}
                          type="button"
                          disabled={!ok}
                          onClick={() => ok && onBook(entry.date, slot)}
                          className={`w-full flex items-center justify-between px-5 py-3.5 transition-all active:scale-[0.98] ${btnCls}`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-lg tabular-nums">{slot}</span>
                            <span className="text-[10px] font-bold opacity-80 uppercase tracking-wide">
                              {ok ? 'Clique para reservar' : 'Esgotado'}
                            </span>
                          </div>
                          <div className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold ${
                            ok ? badgeCls : 'bg-red-100 text-red-500'
                          }`}>
                            {ok ? (
                              <><Users className="w-3 h-3" />{sv} vaga{sv !== 1 ? 's' : ''}</>
                            ) : 'Sold Out'}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
