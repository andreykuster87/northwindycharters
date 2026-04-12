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
      icon={<Anchor className="w-5 h-5 text-white" />}
      iconBgClass="bg-blue-900"
      title="Área do Comandante"
      subtitle="Frota e agendamentos"
      hint={
        <div className="bg-blue-50 border-2 border-blue-100 rounded-[20px] px-5 py-3">
          <p className="text-xs font-bold text-blue-600">
            Login: <strong>nome#número</strong> (ex: jose#2) · Senha enviada via <strong>WhatsApp</strong>
          </p>
        </div>
      }
      cardBorderClass="border-blue-900"
      loginPlaceholder="Ex: jose#2"
      passwdPlaceholder="Senha recebida via WhatsApp"
      inputFocusClass="focus:border-blue-900"
      submitClass="bg-blue-900 hover:bg-blue-800 text-white"
      onSubmit={handleSubmit}
      onClose={onClose}
    />
  );
}
