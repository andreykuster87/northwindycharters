// src/components/admin/AdminDashboardNavbar.tsx
// Navbar fixa do painel Admin / Sailor: logo, badges de role, mini-avatar do
// sailor, busca global de perfis (admin), botões de notificação e logout.
import { Waves, Bell, UserCheck, Settings, LogOut } from 'lucide-react';
import type { Sailor, Client } from '../../lib/localStore';
import type { Company } from '../../lib/store/companies';
import type { Auth } from './AdminDashboardShared';
import { ProfileSearch } from './ProfileSearch';

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
  // Busca de perfil (só admin)
  onOpenSailorDossier?:  (s: Sailor)  => void;
  onOpenClientDossier?:  (c: Client)  => void;
  onOpenCompanyDossier?: (c: Company) => void;
}

export function AdminDashboardNavbar({
  isAdmin, isSailor, auth,
  sailorData, sailorPhoto,
  unreadMsgs, empresaUnread, solBadge,
  onLogout, onSettings, onGoToMessages, onGoToSol,
  onOpenSailorDossier, onOpenClientDossier, onOpenCompanyDossier,
}: Props) {
  return (
    <nav className="bg-[#0a1628] text-white px-4 py-3 sticky top-0 z-40 shadow-xl border-b border-[#c9a96e]/10">
      <div className="flex items-center gap-3 max-w-7xl mx-auto">

        {/* Logo + badge de role */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Waves className="w-5 h-5 text-[#c9a96e]" />
          <span className="font-['Playfair_Display'] font-bold italic text-base hidden sm:inline">NorthWindy</span>
          {isAdmin && (
            <span className="bg-[#c9a96e]/15 text-[#c9a96e] text-[9px] font-semibold uppercase tracking-[0.12em] px-2 py-0.5">
              Admin
            </span>
          )}
          {isSailor && (
            <span className="bg-[#c9a96e]/15 text-[#c9a96e] text-[9px] font-semibold uppercase tracking-[0.12em] px-2 py-0.5">
              Tripulante
            </span>
          )}
        </div>

        {/* Sailor: mini avatar + nome */}
        {isSailor && sailorData && (
          <div className="flex-1 min-w-0 flex items-center gap-2.5">
            <div className="w-7 h-7 overflow-hidden flex-shrink-0 border border-[#c9a96e]/30 bg-[#1a2b4a] flex items-center justify-center">
              {sailorPhoto
                ? <img src={sailorPhoto} alt="" className="w-full h-full object-cover" />
                : <span className="text-[#c9a96e] font-bold text-[10px]">{sailorData.name.charAt(0).toUpperCase()}</span>
              }
            </div>
            <p className="font-['Playfair_Display'] font-bold text-white text-sm truncate">{sailorData.name}</p>
          </div>
        )}

        {/* Admin: busca global de perfis */}
        {isAdmin && onOpenSailorDossier && onOpenClientDossier && onOpenCompanyDossier && (
          <ProfileSearch
            onOpenSailor={onOpenSailorDossier}
            onOpenClient={onOpenClientDossier}
            onOpenCompany={onOpenCompanyDossier}
          />
        )}

        {/* Ações */}
        <div className="flex items-center gap-1.5 ml-auto flex-shrink-0">
          {isSailor && (
            <button onClick={onSettings}
              className="relative bg-white/5 hover:bg-white/10 p-2 transition-all">
              <Settings className="w-4 h-4 text-white/70 hover:text-white" />
            </button>
          )}
          {isSailor && (
            <button onClick={onGoToMessages}
              className="relative bg-white/5 hover:bg-white/10 p-2 transition-all">
              <Bell className="w-4 h-4 text-white/70" />
              {(unreadMsgs + empresaUnread) > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#c9a96e] text-[#0a1628] text-[8px] font-black w-3.5 h-3.5 flex items-center justify-center">
                  {unreadMsgs + empresaUnread}
                </span>
              )}
            </button>
          )}
          {isAdmin && solBadge > 0 && (
            <button onClick={onGoToSol}
              className="relative bg-[#c9a96e]/20 hover:bg-[#c9a96e]/30 p-2 transition-all">
              <UserCheck className="w-4 h-4 text-[#c9a96e]" />
              <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[8px] font-black w-3.5 h-3.5 flex items-center justify-center">
                {solBadge}
              </span>
            </button>
          )}
          <button onClick={onLogout}
            className="bg-white/5 hover:bg-red-600/80 px-3 py-2 text-xs font-semibold uppercase tracking-wider flex items-center gap-1 transition-all">
            <LogOut className="w-3 h-3" />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>

      </div>
    </nav>
  );
}
