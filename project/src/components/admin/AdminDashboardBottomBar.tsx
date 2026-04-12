// src/components/admin/AdminDashboardBottomBar.tsx
// Bottom tab bar para mobile: 5 tabs principais + drawer "Mais" para o resto.
import { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import type { TabDef, TabKey } from './AdminDashboardShared';

interface Props {
  bottomTabs: TabDef[];
  moreTabs:   TabDef[];
  activeTab:  TabKey;
  onTabChange: (key: TabKey) => void;
}

export function AdminDashboardBottomBar({ bottomTabs, moreTabs, activeTab, onTabChange }: Props) {
  const [moreOpen, setMoreOpen] = useState(false);

  function handleTabChange(key: TabKey) {
    setMoreOpen(false);
    onTabChange(key);
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-gray-100 shadow-2xl">

      {/* More drawer */}
      {moreOpen && moreTabs.length > 0 && (
        <div className="absolute bottom-full left-0 right-0 bg-white border-t-2 border-gray-100 shadow-2xl rounded-t-[24px] p-4">
          <div className="grid grid-cols-2 gap-2">
            {moreTabs.map(t => {
              const Icon   = t.icon;
              const active = activeTab === t.key;
              return (
                <button key={t.key} onClick={() => handleTabChange(t.key)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-[14px] font-black text-sm uppercase transition-all ${
                    active ? 'bg-blue-900 text-white' : 'bg-gray-50 text-gray-500 hover:bg-blue-50'
                  }`}>
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{t.label}</span>
                  {t.badge && t.badge > 0 && (
                    <span className={`text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center ml-auto flex-shrink-0 ${active ? 'bg-white text-blue-900' : 'bg-red-500 text-white'}`}>
                      {t.badge > 9 ? '9+' : t.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <button onClick={() => setMoreOpen(false)}
            className="w-full mt-3 py-2.5 text-xs font-black text-gray-400 uppercase tracking-wider border-2 border-gray-100 rounded-[12px]">
            Fechar
          </button>
        </div>
      )}

      <div className="flex items-stretch h-16">
        {bottomTabs.map(t => {
          const Icon   = t.icon;
          const active = activeTab === t.key && !moreOpen;
          return (
            <button key={t.key} onClick={() => handleTabChange(t.key)}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 relative transition-all ${
                active ? 'text-blue-900' : 'text-gray-400'
              }`}>
              <div className="relative">
                <Icon className={`w-5 h-5 transition-all ${active ? 'scale-110' : ''}`} />
                {t.badge && t.badge > 0 && (
                  <span className="absolute -top-1 -right-1.5 bg-red-500 text-white text-[7px] font-black w-3 h-3 rounded-full flex items-center justify-center">
                    {t.badge > 9 ? '9+' : t.badge}
                  </span>
                )}
              </div>
              <span className="text-[9px] font-black uppercase tracking-wide">{t.short}</span>
              {active && <div className="absolute bottom-0 h-0.5 w-8 bg-blue-900 rounded-full" />}
            </button>
          );
        })}

        {moreTabs.length > 0 && (
          <button onClick={() => setMoreOpen(v => !v)}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-all ${
              moreOpen || moreTabs.some(t => t.key === activeTab) ? 'text-blue-900' : 'text-gray-400'
            }`}>
            {moreOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
            <span className="text-[9px] font-black uppercase tracking-wide">Mais</span>
          </button>
        )}
      </div>
    </div>
  );
}
