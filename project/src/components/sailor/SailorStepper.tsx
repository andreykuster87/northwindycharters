// src/components/sailor/SailorStepper.tsx
import { CheckCircle2 } from 'lucide-react';
import { TABS, type TabN } from '../../constants/sailorConstants';

export function SailorStepper({ current, done }: { current: TabN; done: Set<number> }) {
  return (
    <div className="flex items-center px-1 py-2">
      {TABS.map((tab, i) => {
        const isActive = tab.n === current;
        const isDone   = done.has(tab.n);
        return (
          <div key={tab.n} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              <div className={`w-8 h-8 flex items-center justify-center border-2 transition-all duration-300 text-sm
                ${isActive ? 'bg-[#c9a96e] border-[#c9a96e]'
                  : isDone  ? 'bg-[#c9a96e]/80 border-[#c9a96e]/80'
                  : 'bg-white/5 border-white/15'}`}>
                {isDone
                  ? <CheckCircle2 className="w-4 h-4 text-[#0a1628]" />
                  : <span className={isActive ? 'text-[#0a1628] font-bold' : 'text-white/40'}>{tab.icon}</span>
                }
              </div>
              <span className={`text-[9px] font-semibold uppercase tracking-widest transition-all
                ${isActive ? 'text-[#c9a96e]' : isDone ? 'text-[#c9a96e]/70' : 'text-white/30'}`}>
                {tab.short}
              </span>
            </div>
            {i < TABS.length - 1 && (
              <div className={`h-px flex-1 mx-1 mb-4 transition-all duration-300 ${isDone ? 'bg-[#c9a96e]/60' : 'bg-white/10'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
