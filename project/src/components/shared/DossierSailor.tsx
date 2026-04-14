// src/components/shared/DossierSailor.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Modal de dossiê de um Sailor — cobre dois modos:
//   • mode="pending"   → selReg (solicitação pendente, com botões Aprovar/Recusar)
//   • mode="verified"  → dossierSailor (profissional verificado, com bloquear/desbloquear)
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from 'react';
import { ShieldCheck, XCircle, Key } from 'lucide-react';
import {
  blockProfile,
  unblockProfile,
  getSailors,
  type Sailor,
} from '../../lib/localStore';
import { DossierSailorProfile } from './DossierSailorProfile';
import { DossierShell }     from './dossier/DossierShell';
import { CredentialsBlock } from './dossier/CredentialsBlock';

// ── Props ─────────────────────────────────────────────────────────────────────

interface DossierSailorProps {
  sailor: Sailor;
  mode: 'pending' | 'verified';
  approveLoading?: boolean;
  onClose: () => void;
  onApprove?: (sailor: Sailor) => void;
  onReject?:  (sailor: Sailor) => void;
  onSailorsChange?: (sailors: Sailor[]) => void;
  onDeleteRequest?: (id: string, name: string) => void;
}

// ── Componente ────────────────────────────────────────────────────────────────

export function DossierSailor({
  sailor,
  mode,
  approveLoading = false,
  onClose,
  onApprove,
  onReject,
  onSailorsChange,
  onDeleteRequest,
}: DossierSailorProps) {
  const isPending  = mode === 'pending';
  const isVerified = mode === 'verified';
  const isBlocked  = !!(sailor as any).blocked;

  const [genLoading,  setGenLoading]  = useState(false);
  const [localLogin,  setLocalLogin]  = useState<string | null>(null);
  const [localPasswd, setLocalPasswd] = useState<string | null>(null);

  async function handleBlock() {
    const reason = prompt('Motivo do bloqueio:');
    if (!reason) return;
    await blockProfile(sailor.id, 'sailor', reason);
    onSailorsChange?.(getSailors());
    onClose();
  }

  async function handleUnblock() {
    await unblockProfile(sailor.id, 'sailor');
    onSailorsChange?.(getSailors());
    onClose();
  }

  async function handleGenerateCredentials() {
    setGenLoading(true);
    try {
      const { supabase } = await import('../../lib/supabase');

      const { data: existing } = await supabase
        .from('sailors').select('sailor_login, sailor_password').eq('id', sailor.id).single();

      if (existing?.sailor_login && existing?.sailor_password) {
        setLocalLogin(existing.sailor_login);
        setLocalPasswd(existing.sailor_password);
        return;
      }

      const pNum         = String(parseInt((sailor as any).profile_number || '1', 10));
      const sailor_login = sailor.name
        .split(' ')[0].toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '') + '#' + pNum;
      const sailor_password = Math.random().toString(36).substring(2, 8).toUpperCase();

      const { error } = await supabase
        .from('sailors')
        .update({ sailor_login, sailor_password, status: 'approved', verified: true, verified_at: new Date().toISOString() })
        .eq('id', sailor.id);

      if (error) throw error;

      setLocalLogin(sailor_login);
      setLocalPasswd(sailor_password);
      onSailorsChange?.(getSailors());
    } catch (err: any) {
      alert(`Erro: ${err?.message || 'Tente novamente.'}`);
    } finally {
      setGenLoading(false);
    }
  }

  // ── Badges ────────────────────────────────────────────────────────────────

  const badges = (
    <>
      {isPending && (
        <span className="bg-yellow-400 text-yellow-900 text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded-full">
          ⏳ Pendente
        </span>
      )}
      {isVerified && (
        <span className="bg-green-400 text-green-900 text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
          <ShieldCheck className="w-3 h-3" /> Verificado
        </span>
      )}
      {isBlocked && (
        <span className="bg-red-500 text-white text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded-full">
          🚫 Bloqueado
        </span>
      )}
      {(sailor as any).profile_number && (
        <span className="bg-white/20 text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-full">
          Perfil #{String(parseInt((sailor as any).profile_number, 10))}
        </span>
      )}
    </>
  );

  // ── Credenciais ───────────────────────────────────────────────────────────

  const currentLogin  = localLogin  || (sailor as any).sailor_login  || '';
  const currentPasswd = localPasswd || (sailor as any).sailor_password || '';

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <DossierShell
      initials={sailor.name.substring(0, 2).toUpperCase()}
      subtitle={isPending ? 'Dossiê · Solicitação' : 'Dossiê · Profissional Verificado'}
      name={sailor.name}
      badges={badges}
      onClose={onClose}
    >
      {/* 1–5. Secções de perfil */}
      <DossierSailorProfile sailor={sailor} isPending={isPending} isVerified={isVerified} />

      {/* 6. Credenciais (só verified) */}
      {isVerified && (
        currentLogin ? (
          <CredentialsBlock login={currentLogin} password={currentPasswd} />
        ) : (
          <button
            onClick={handleGenerateCredentials}
            disabled={genLoading}
            className="w-full bg-[#0a1628] hover:bg-[#0a1628]/90 disabled:opacity-50 text-white py-4 font-semibold uppercase text-sm transition-all flex items-center justify-center gap-2 shadow-md"
          >
            <Key className="w-4 h-4" />
            {genLoading ? '⏳ A gerar...' : '🔑 Gerar Credenciais de Acesso'}
          </button>
        )
      )}

      {/* 6b. Enviar senha por WhatsApp */}
      {isVerified && (sailor as any).sailor_login && sailor.phone && (() => {
        const phone = sailor.phone.replace(/\D/g, '');
        const phoneWithCountry = phone.startsWith('351') || phone.startsWith('55') ? phone : `55${phone}`;
        const login    = (sailor as any).sailor_login  || '';
        const password = (sailor as any).sailor_password || '';
        const msg = [
          `🌊 *NorthWindy — Credenciais de Acesso*`,
          ``,
          `Olá, ${sailor.name}!`,
          ``,
          `Os seus dados de acesso à plataforma NorthWindy:`,
          `*Login:* ${login}`,
          `*Senha:* ${password}`,
          ``,
          `Acesse em: https://northwindy.com`,
        ].join('\n');
        return (
          <a
            href={`https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(msg)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-green-500 hover:bg-green-400 text-white py-3.5 font-semibold uppercase text-sm transition-all flex items-center justify-center gap-2 shadow-md"
          >
            💬 Enviar senha por WhatsApp
          </a>
        );
      })()}

      {/* 7. Aprovar / Recusar (só pending) */}
      {isPending && (
        <div className="flex gap-3">
          <button
            onClick={() => onReject?.(sailor)}
            className="flex-1 bg-red-50 hover:bg-red-100 border-2 border-red-200 text-red-600 py-5 font-semibold uppercase text-sm transition-all flex items-center justify-center gap-2"
          >
            <XCircle className="w-5 h-5" /> Recusar
          </button>
          <button
            onClick={() => onApprove?.(sailor)}
            disabled={approveLoading}
            className="flex-1 bg-green-600 hover:bg-green-500 text-white py-5 font-semibold uppercase text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-5 h-5" />
            {approveLoading ? 'Aprovando...' : 'Aprovar'}
          </button>
        </div>
      )}

      {/* 8. Bloquear / Desbloquear (só verified) */}
      {isVerified && (
        isBlocked ? (
          <button
            onClick={handleUnblock}
            className="w-full bg-green-600 hover:bg-green-500 text-white py-4 font-semibold uppercase text-sm transition-all flex items-center justify-center gap-2 shadow-md"
          >
            🔓 Desbloquear Conta
          </button>
        ) : (
          <button
            onClick={handleBlock}
            className="w-full bg-red-50 hover:bg-red-100 border-2 border-red-200 text-red-600 py-3 font-semibold uppercase text-sm transition-all flex items-center justify-center gap-2"
          >
            🚫 Bloquear Conta
          </button>
        )
      )}

      {/* 9. Excluir (só verified) */}
      {isVerified && onDeleteRequest && (
        <button
          onClick={() => onDeleteRequest(sailor.id, sailor.name)}
          className="w-full bg-red-50 hover:bg-red-100 border-2 border-red-200 text-red-500 py-3 font-semibold uppercase text-sm transition-all flex items-center justify-center gap-2"
        >
          🗑️ Excluir Cadastro
        </button>
      )}
    </DossierShell>
  );
}
