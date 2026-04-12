// src/components/admin/AdminDashboardNavbar.tsx
// Navbar fixa do painel Admin / Sailor: logo, badges de role, mini-avatar do
// sailor, botões de notificação, configurações e logout.
import { Waves, Bell, UserCheck, Settings, LogOut } from 'lucide-react';
import type { Sailor } from '../../lib/localStore';
import type { Auth } from './AdminDashboardShared';

interface Props {
  isAdmin:        boolean;
  isSailor:       boolean;
  auth:           Auth | null;
  sailorData:     Sailor | null;
  sailorPhoto:    string;
  unreadMsgs:     number;
  empresaUnread:  number;
  solBadge:       number;
  onLogout:       () => void;
  onSettings:     () => void;
  onGoToMessages: () => void;
  onGoToSol:      () => void;
}

export function AdminDashboardNavbar({
  isAdmin, isSailor, auth,
  sailorData, sailorPhoto,
  unreadMsgs, empresaUnread, solBadge,
  onLogout, onSettings, onGoToMessages, onGoToSol,
}: Props) {
  return (
    <nav className="bg-blue-900 text-white px-4 py-3 sticky top-0 z-40 shadow-xl">
      <div className="flex items-center gap-3 max-w-7xl mx-auto">

        {/* Logo + badge de role */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Waves className="w-5 h-5 text-blue-300" />
          <span className="font-black text-base italic hidden sm:inline">NorthWindy</span>
          {isAdmin && (
            <span className="bg-blue-800 text-blue-200 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
              Admin
            </span>
          )}
          {isSailor && (
            <span className="bg-blue-700 text-blue-200 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
              Tripulante
            </span>
          )}
        </div>

        {/* Sailor: mini avatar + nome */}
        {isSailor && sailorData && (
          <div className="flex-1 min-w-0 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 border-2 border-white/20 bg-blue-700 flex items-center justify-center">
              {sailorPhoto
                ? <img src={sailorPhoto} alt="" className="w-full h-full object-cover" />
                : <span className="text-white font-black text-[10px]">{sailorData.name.charAt(0).toUpperCase()}</span>
              }
            </div>
            <p className="font-black text-white text-sm truncate">{sailorData.name}</p>
          </div>
        )}

        {/* Admin: título */}
        {isAdmin && (
          <div className="flex-1 min-w-0">
            <p className="font-black text-white text-sm truncate hidden sm:block">Painel de Controlo</p>
          </div>
        )}

        {/* Ações */}
        <div className="flex items-center gap-1.5 ml-auto flex-shrink-0">
          {isSailor && (
            <button onClick={onSettings}
              className="relative bg-blue-800 hover:bg-blue-700 p-2 rounded-full transition-all">
              <Settings className="w-4 h-4 text-white" />
            </button>
          )}
          {isSailor && (
            <button onClick={onGoToMessages}
              className="relative bg-blue-800 hover:bg-blue-700 p-2 rounded-full transition-all">
              <Bell className="w-4 h-4 text-white" />
              {(unreadMsgs + empresaUnread) > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-amber-400 text-blue-900 text-[8px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center">
                  {unreadMsgs + empresaUnread}
                </span>
              )}
            </button>
          )}
          {isAdmin && solBadge > 0 && (
            <button onClick={onGoToSol}
              className="relative bg-amber-500 hover:bg-amber-400 p-2 rounded-full transition-all">
              <UserCheck className="w-4 h-4 text-white" />
              <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[8px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center">
                {solBadge}
              </span>
            </button>
          )}
          <button onClick={onLogout}
            className="bg-blue-800 hover:bg-red-600 px-3 py-2 rounded-full text-xs font-black uppercase flex items-center gap-1 transition-all">
            <LogOut className="w-3 h-3" />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>

      </div>
    </nav>
  );
}
