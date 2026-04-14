// src/components/modals/SailorLoginModal.tsx
import { Anchor } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { LoginModalShell } from './shared/LoginModalShell';

interface Props {
  onLogin: (name: string, id: string) => void;
  onClose: () => void;
}

export function SailorLoginModal({ onLogin, onClose }: Props) {
  const handleSubmit = async (login: string, password: string): Promise<string | null> => {
    try {
      const { data: rows, error } = await supabase
        .from('sailors')
        .select('id, name, status, verified, blocked, sailor_login, sailor_password')
        .eq('status', 'approved')
        .eq('verified', true);

      if (error) return 'Erro ao verificar. Tente novamente.';

      const data = (rows ?? []).find(s =>
        (s.sailor_login || '').toLowerCase() === login.trim().toLowerCase()
      );

      if (!data || data.sailor_password !== password) return 'Login ou senha incorretos.';
      if (data.blocked) return 'A sua conta está temporariamente bloqueada. Contacte o suporte NorthWindy.';

      onLogin(data.name, data.id);
      return null;
    } catch {
      return 'Erro ao verificar credenciais. Tente novamente.';
    }
  };

  return (
    <LoginModalShell
      icon={<Anchor className="w-5 h-5 text-[#c9a96e]" />}
      iconBgClass="bg-[#0a1628]"
      title="Área do Comandante"
      subtitle="Frota e agendamentos"
      brandTitle="Bem-vindo, Comandante!"
      brandTagline="Acesse a gestão da sua embarcação, agenda e reservas em tempo real."
      hint={
        <div className="bg-[#0a1628]/5 border border-[#c9a96e]/20 px-4 py-3">
          <p className="text-xs font-medium text-[#1a2b4a]">
            Login: <strong className="text-[#c9a96e]">nome#número</strong> (ex: jose#2) · Senha enviada via <strong>WhatsApp</strong>
          </p>
        </div>
      }
      loginPlaceholder="Ex: jose#2"
      passwdPlaceholder="Senha recebida via WhatsApp"
      onSubmit={handleSubmit}
      onClose={onClose}
    />
  );
}
