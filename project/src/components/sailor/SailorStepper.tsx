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
              <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-300 text-sm
                ${isActive ? 'bg-white border-white shadow-lg scale-110'
                  : isDone  ? 'bg-green-400 border-green-400'
                  : 'bg-white/10 border-white/20'}`}>
                {isDone
                  ? <CheckCircle2 className="w-4 h-4 text-green-900" />
                  : <span className={isActive ? 'text-blue-900' : 'text-white/40'}>{tab.icon}</span>
                }
              </div>
              <span className={`text-[9px] font-black uppercase tracking-wider transition-all
                ${isActive ? 'text-white' : isDone ? 'text-green-300' : 'text-white/30'}`}>
                {tab.short}
              </span>
            </div>
            {i < TABS.length - 1 && (
              <div className={`h-0.5 flex-1 mx-1 mb-4 rounded-full transition-all duration-300 ${isDone ? 'bg-green-400' : 'bg-white/15'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}