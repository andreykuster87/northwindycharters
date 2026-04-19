// src/components/admin/AdminDashboardSidebar.tsx
// Sidebar desktop (≥ md): card de perfil (sailor ou admin) + lista de tabs.
import { useState } from 'react';
import { ShieldCheck, CheckCircle2, ChevronRight, ChevronDown, Camera, Users, Building2, Ship } from 'lucide-react';
import type { Sailor } from '../../lib/localStore';
import type { TabDef, TabKey, ClientesSubTab } from './AdminDashboardShared';
import { VIEW_TABS, type ViewTab } from '../pages/SailorProfileView';

const CLIENTES_SUB_TABS: { key: ClientesSubTab; label: string; icon: React.ElementType }[] = [
  { key: 'usuarios',    label: 'Usuários',    icon: Users },
  { key: 'verificados', label: 'Verificados', icon: ShieldCheck },
  { key: 'empresas',    label: 'Empresas',    icon: Building2 },
  { key: 'frota',       label: 'Frota',       icon: Ship },
];

interface Props {
  isAdmin:               boolean;
  isSailor:              boolean;
  sailorData:            Sailor | null;
  sailorPhoto:           string;
  tabs:                  TabDef[];
  activeTab:             TabKey;
  onTabChange:           (key: TabKey) => void;
  onPhotoChange:         (file: File) => void;
  profileSubTab?:        ViewTab;
  onProfileSubTabChange?: (t: ViewTab) => void;
  clientesSubTab?:        ClientesSubTab;
  onClientesSubTabChange?: (t: ClientesSubTab) => void;
}

export function AdminDashboardSidebar({
  isAdmin, isSailor,
  sailorData, sailorPhoto,
  tabs, activeTab,
  onTabChange, onPhotoChange,
  profileSubTab, onProfileSubTabChange,
  clientesSubTab, onClientesSubTabChange,
}: Props) {
  const [collapsed, setCollapsed] = useState<Set<TabKey>>(new Set());

  function handleTabClick(key: TabKey, hasSubTabs: boolean) {
    if (hasSubTabs && activeTab === key) {
      setCollapsed(prev => {
        const next = new Set(prev);
        if (next.has(key)) next.delete(key); else next.add(key);
        return next;
      });
    } else {
      onTabChange(key);
      if (hasSubTabs) {
        setCollapsed(prev => { const next = new Set(prev); next.delete(key); return next; });
      }
    }
  }

  return (
    <aside className="hidden md:flex flex-col gap-1 w-56 flex-shrink-0 py-6 pr-2">

      {/* Card de perfil — sailor */}
      {isSailor && sailorData && (
        <div className="bg-white border border-gray-100 p-4 mb-3 relative" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a96e]/40 to-transparent" />
          <div className="relative mx-auto w-fit mb-2">
            <div
              className="w-14 h-14 overflow-hidden border border-[#c9a96e]/30 bg-[#0a1628] flex items-center justify-center cursor-pointer group relative"
              onClick={() => document.getElementById('sailor-photo-input')?.click()}
            >
              {sailorPhoto
                ? <img src={sailorPhoto} alt="" className="w-full h-full object-cover" />
                : <span className="text-[#c9a96e] font-bold text-xl">{sailorData.name.charAt(0).toUpperCase()}</span>
              }
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-4 h-4 text-white" />
              </div>
            </div>
            <button
              onClick={() => document.getElementById('sailor-photo-input')?.click()}
              className="absolute -bottom-1.5 -right-1.5 w-6 h-6 bg-[#c9a96e] hover:bg-[#b8934a] flex items-center justify-center shadow-md transition-all"
            >
              <Camera className="w-3 h-3 text-[#0a1628]" />
            </button>
            <input
              id="sailor-photo-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) onPhotoChange(f); }}
            />
          </div>
          <p className="font-['Playfair_Display'] font-bold text-[#1a2b4a] text-xs text-center leading-tight truncate">
            {sailorData.name}
          </p>
          <p className="text-[10px] font-medium text-[#c9a96e] text-center mt-0.5 tracking-[0.1em] uppercase">{sailorData.profile_number}</p>
          <div className="mt-2 pt-2 border-t border-gray-50 flex items-center justify-center gap-1">
            {sailorData.verified
              ? <><CheckCircle2 className="w-2.5 h-2.5 text-green-500" /><p className="text-[9px] font-semibold text-green-600 uppercase tracking-wide">Verificado</p></>
              : <p className="text-[9px] font-semibold text-amber-600 uppercase tracking-wide">⏳ Pendente</p>
            }
          </div>
        </div>
      )}

      {/* Card de perfil — admin */}
      {isAdmin && (
        <div className="bg-white border border-gray-100 p-4 mb-3 relative" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a96e]/40 to-transparent" />
          <div className="w-14 h-14 bg-[#0a1628] flex items-center justify-center mx-auto mb-2">
            <ShieldCheck className="w-6 h-6 text-[#c9a96e]" />
          </div>
          <p className="font-['Playfair_Display'] font-bold text-[#1a2b4a] text-xs text-center leading-tight truncate">Administrador</p>
          <p className="text-[10px] font-medium text-[#c9a96e] text-center mt-0.5 tracking-[0.1em] uppercase">NorthWindy</p>
          <div className="mt-2 pt-2 border-t border-gray-50 flex items-center justify-center gap-1">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
            <p className="text-[9px] font-semibold text-green-600 uppercase tracking-wide">Online</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      {tabs.map(t => {
        const Icon   = t.icon;
        const active = activeTab === t.key;
        const isPerfil   = false;
        const isClientes = t.key === 'clientes' && isAdmin;
        const hasSubTabs = isClientes;
        const isExpanded = active && !collapsed.has(t.key);
        return (
          <div key={t.key}>
            <button
              onClick={() => handleTabClick(t.key, hasSubTabs)}
              className={`w-full flex items-center gap-2.5 px-4 py-3 text-xs font-semibold uppercase tracking-wide transition-all relative ${
                active
                  ? 'bg-[#0a1628] text-white border-l-2 border-[#c9a96e]'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-[#1a2b4a] border-l-2 border-transparent'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${active ? 'text-[#c9a96e]' : ''}`} />
              <span className="flex-1 truncate text-left">{t.label}</span>
              {t.badge && t.badge > 0 && (
                <span className={`text-[9px] font-bold w-4 h-4 flex items-center justify-center flex-shrink-0 ${active ? 'bg-[#c9a96e] text-[#0a1628]' : 'bg-red-500 text-white'}`}>
                  {t.badge > 9 ? '9+' : t.badge}
                </span>
              )}
              {hasSubTabs
                ? isExpanded
                  ? <ChevronDown className="w-3 h-3 flex-shrink-0 text-[#c9a96e]" />
                  : <ChevronRight className="w-3 h-3 flex-shrink-0 opacity-40" />
                : active && <ChevronRight className="w-3 h-3 flex-shrink-0 text-[#c9a96e]" />
              }
            </button>

            {/* Sub-itens do Perfil Público */}
            {isPerfil && isExpanded && (
              <div className="border-l-2 border-[#c9a96e]/20 ml-4">
                {VIEW_TABS.map(vt => {
                  const VIcon = vt.icon;
                  const subActive = profileSubTab === vt.key;
                  return (
                    <button
                      key={vt.key}
                      onClick={() => onProfileSubTabChange?.(vt.key)}
                      className={`w-full flex items-center gap-2 pl-3 pr-2 py-2 text-[10px] font-semibold uppercase tracking-wide transition-all ${
                        subActive
                          ? 'text-[#c9a96e] bg-[#c9a96e]/8'
                          : 'text-gray-400 hover:text-[#1a2b4a] hover:bg-gray-50'
                      }`}
                    >
                      <VIcon className="w-3 h-3 flex-shrink-0" />
                      <span>{vt.label}</span>
                      {subActive && <div className="ml-auto w-1 h-1 bg-[#c9a96e] rounded-full" />}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Sub-itens de Clientes */}
            {isClientes && isExpanded && (
              <div className="border-l-2 border-[#c9a96e]/20 ml-4">
                {CLIENTES_SUB_TABS.map(ct => {
                  const CIcon = ct.icon;
                  const subActive = clientesSubTab === ct.key;
                  return (
                    <button
                      key={ct.key}
                      onClick={() => onClientesSubTabChange?.(ct.key)}
                      className={`w-full flex items-center gap-2 pl-3 pr-2 py-2 text-[10px] font-semibold uppercase tracking-wide transition-all ${
                        subActive
                          ? 'text-[#c9a96e] bg-[#c9a96e]/8'
                          : 'text-gray-400 hover:text-[#1a2b4a] hover:bg-gray-50'
                      }`}
                    >
                      <CIcon className="w-3 h-3 flex-shrink-0" />
                      <span>{ct.label}</span>
                      {subActive && <div className="ml-auto w-1 h-1 bg-[#c9a96e] rounded-full" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </aside>
  );
}
