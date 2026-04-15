// src/components/admin/AdminDashboardNavbar.tsx
import { useState } from 'react';
import { Waves, Bell, UserCheck, Settings, LogOut, FileText, MessageSquare } from 'lucide-react';
import type { Sailor, Client } from '../../lib/localStore';
import type { Company } from '../../lib/store/companies';
import type { Auth } from './AdminDashboardShared';
import type { BellItem } from '../../lib/rh';
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
  bellItems:      BellItem[];
  onLogout:       () => void;
  onSettings:     () => void;
  onGoToMessages: () => void;
  onGoToSol:      () => void;
  onGoToEmpresa:  (itemId?: string) => void;
  // Busca de perfil (só admin)
  onOpenSailorDossier?:  (s: Sailor)  => void;
  onOpenClientDossier?:  (c: Client)  => void;
  onOpenCompanyDossier?: (c: Company) => void;
}

export function AdminDashboardNavbar({
  isAdmin, isSailor, auth,
  sailorData, sailorPhoto,
  unreadMsgs, empresaUnread, solBadge,
  bellItems,
  onLogout, onSettings, onGoToMessages, onGoToSol, onGoToEmpresa,
  onOpenSailorDossier, onOpenClientDossier, onOpenCompanyDossier,
}: Props) {
  const [bellOpen, setBellOpen] = useState(false);

  const totalUnread = unreadMsgs + empresaUnread;

  function handleBellClick() {
    // Se há mensagens da empresa, abre o dropdown; caso contrário vai direto para mensagens
    if (empresaUnread > 0) {
      setBellOpen(v => !v);
    } else if (unreadMsgs > 0) {
      onGoToMessages();
    } else {
      setBellOpen(v => !v);
    }
  }

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

          {/* Sino com dropdown */}
          {isSailor && (
            <div className="relative">
              <button onClick={handleBellClick}
                className="relative bg-white/5 hover:bg-white/10 p-2 transition-all">
                <Bell className={`w-4 h-4 ${totalUnread > 0 ? 'text-[#c9a96e]' : 'text-white/70'}`} />
                {totalUnread > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[8px] font-black w-3.5 h-3.5 flex items-center justify-center">
                    {totalUnread > 9 ? '9+' : totalUnread}
                  </span>
                )}
              </button>

              {/* Dropdown */}
              {bellOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-[#0a1628] border border-[#c9a96e]/20 shadow-2xl z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-[#c9a96e]/10 flex items-center justify-between">
                    <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em]">Notificações</p>
                    {totalUnread > 0 && (
                      <span className="text-[9px] font-bold text-white/40">{totalUnread} não lida{totalUnread !== 1 ? 's' : ''}</span>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto">
                    {/* Mensagens da empresa */}
                    {bellItems.length > 0 && (
                      <>
                        <div className="px-4 py-1.5 bg-white/3">
                          <p className="text-[9px] font-semibold text-[#c9a96e]/60 uppercase tracking-wider">Da Empresa</p>
                        </div>
                        {bellItems.map(item => (
                          <button key={item.id}
                            onClick={() => { onGoToEmpresa(item.id); setBellOpen(false); }}
                            className="w-full px-4 py-3 flex items-start gap-3 hover:bg-white/5 transition-all text-left border-b border-white/5 last:border-0">
                            <div className={`w-7 h-7 flex items-center justify-center flex-shrink-0 mt-0.5 ${item.tipo === 'recibo' ? 'bg-green-500/10' : 'bg-[#c9a96e]/10'}`}>
                              {item.tipo === 'recibo'
                                ? <FileText className="w-3.5 h-3.5 text-green-400" />
                                : <MessageSquare className="w-3.5 h-3.5 text-[#c9a96e]" />
                              }
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-white truncate">{item.titulo}</p>
                              <p className="text-[10px] font-bold text-white/30 mt-0.5">
                                {new Date(item.createdAt).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' })}
                                {' · '}Toque para ver
                              </p>
                            </div>
                            <span className="w-2 h-2 bg-[#c9a96e] flex-shrink-0 mt-1.5" />
                          </button>
                        ))}
                      </>
                    )}

                    {/* Mensagens do sistema */}
                    {unreadMsgs > 0 && (
                      <>
                        <div className="px-4 py-1.5 bg-white/3">
                          <p className="text-[9px] font-semibold text-white/40 uppercase tracking-wider">Sistema</p>
                        </div>
                        <button
                          onClick={() => { onGoToMessages(); setBellOpen(false); }}
                          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-all text-left">
                          <div className="w-7 h-7 bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                            <Bell className="w-3.5 h-3.5 text-blue-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-white">{unreadMsgs} mensage{unreadMsgs !== 1 ? 'ns' : 'm'} do sistema</p>
                            <p className="text-[10px] font-bold text-white/30 mt-0.5">Toque para ver</p>
                          </div>
                          <span className="w-2 h-2 bg-blue-400 flex-shrink-0" />
                        </button>
                      </>
                    )}

                    {totalUnread === 0 && (
                      <div className="px-4 py-8 text-center">
                        <Bell className="w-6 h-6 text-white/10 mx-auto mb-2" />
                        <p className="text-xs font-semibold text-white/30">Sem novas notificações</p>
                      </div>
                    )}
                  </div>

                  {empresaUnread > 0 && (
                    <button
                      onClick={() => { onGoToEmpresa(); setBellOpen(false); }}
                      className="w-full py-2.5 text-[10px] font-semibold text-[#c9a96e] uppercase tracking-wider hover:bg-white/5 transition-all border-t border-[#c9a96e]/10">
                      Ver todas as mensagens da empresa →
                    </button>
                  )}
                </div>
              )}

              {/* Overlay para fechar */}
              {bellOpen && <div className="fixed inset-0 z-40" onClick={() => setBellOpen(false)} />}
            </div>
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
