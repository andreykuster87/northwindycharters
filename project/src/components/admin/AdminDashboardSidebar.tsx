// src/components/admin/AdminDashboardSidebar.tsx
// Sidebar desktop (≥ md): card de perfil (sailor ou admin) + lista de tabs.
import { ShieldCheck, ChevronRight, Camera } from 'lucide-react';
import type { Sailor } from '../../lib/localStore';
import type { TabDef, TabKey } from './AdminDashboardShared';

interface Props {
  isAdmin:       boolean;
  isSailor:      boolean;
  sailorData:    Sailor | null;
  sailorPhoto:   string;
  tabs:          TabDef[];
  activeTab:     TabKey;
  onTabChange:   (key: TabKey) => void;
  onPhotoChange: (file: File) => void;
}

export function AdminDashboardSidebar({
  isAdmin, isSailor,
  sailorData, sailorPhoto,
  tabs, activeTab,
  onTabChange, onPhotoChange,
}: Props) {
  return (
    <aside className="hidden md:flex flex-col gap-1 w-56 flex-shrink-0 py-6 pl-4 pr-2">

      {/* Card de perfil — sailor */}
      {isSailor && sailorData && (
        <div className="bg-white border-2 border-gray-100 rounded-[22px] p-4 mb-3">
          <div className="relative mx-auto w-fit mb-2">
            <div
              className="w-14 h-14 rounded-[14px] overflow-hidden border-2 border-gray-100 bg-blue-900 flex items-center justify-center cursor-pointer group"
              onClick={() => document.getElementById('sailor-photo-input')?.click()}
            >
              {sailorPhoto
                ? <img src={sailorPhoto} alt="" className="w-full h-full object-cover" />
                : <span className="text-white font-black text-xl">{sailorData.name.charAt(0).toUpperCase()}</span>
              }
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-[12px]">
                <Camera className="w-4 h-4 text-white" />
              </div>
            </div>
            <button
              onClick={() => document.getElementById('sailor-photo-input')?.click()}
              className="absolute -bottom-1.5 -right-1.5 w-6 h-6 bg-amber-400 hover:bg-amber-300 rounded-full flex items-center justify-center shadow-md transition-all"
            >
              <Camera className="w-3 h-3 text-blue-900" />
            </button>
            <input
              id="sailor-photo-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) onPhotoChange(f); }}
            />
          </div>
          <p className="font-black text-blue-900 text-xs text-center uppercase italic leading-tight truncate">
            {sailorData.name}
          </p>
          <p className="text-[10px] font-bold text-gray-400 text-center mt-0.5">{sailorData.profile_number}</p>
          <div className="mt-2 pt-2 border-t border-gray-50 flex items-center justify-center gap-1">
            {sailorData.verified
              ? <><ShieldCheck className="w-2.5 h-2.5 text-green-500" /><p className="text-[9px] font-black text-green-600 uppercase">Verificado</p></>
              : <p className="text-[9px] font-black text-amber-600 uppercase">⏳ Pendente</p>
            }
          </div>
        </div>
      )}

      {/* Card de perfil — admin */}
      {isAdmin && (
        <div className="bg-white border-2 border-gray-100 rounded-[22px] p-4 mb-3">
          <div className="w-12 h-12 bg-blue-900 rounded-[12px] flex items-center justify-center mx-auto mb-2">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <p className="font-black text-blue-900 text-xs text-center uppercase italic">Administrador</p>
          <p className="text-[10px] font-bold text-gray-400 text-center mt-0.5">NorthWindy</p>
          <div className="mt-2 pt-2 border-t border-gray-50 flex items-center justify-center gap-1">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
            <p className="text-[9px] font-black text-green-600 uppercase">Online</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      {tabs.map(t => {
        const Icon   = t.icon;
        const active = activeTab === t.key;
        return (
          <button
            key={t.key}
            onClick={() => onTabChange(t.key)}
            className={`flex items-center gap-2.5 px-4 py-3 rounded-[14px] text-xs font-black uppercase tracking-wide transition-all relative ${
              active ? 'bg-blue-900 text-white shadow-lg' : 'text-gray-500 hover:bg-white hover:text-blue-900'
            }`}
          >
            <Icon className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="flex-1 truncate">{t.label}</span>
            {t.badge && t.badge > 0 && (
              <span className={`text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${active ? 'bg-white text-blue-900' : 'bg-red-500 text-white'}`}>
                {t.badge > 9 ? '9+' : t.badge}
              </span>
            )}
            {active && <ChevronRight className="w-3 h-3 flex-shrink-0" />}
          </button>
        );
      })}
    </aside>
  );
}
