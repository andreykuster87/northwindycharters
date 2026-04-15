// src/components/modals/ClientLoginModal.tsx
import { User } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { LoginModalShell } from './shared/LoginModalShell';

interface Props {
  onLogin:    (name: string, id: string) => void;
  onClose:    () => void;
  onRegister: () => void;
}

export function ClientLoginModal({ onLogin, onClose, onRegister }: Props) {
  const handleSubmit = async (login: string, password: string): Promise<string | null> => {
    try {
      const { data: rows, error } = await supabase
        .from('clients')
        .select('id, name, status, blocked, client_login, client_password, email')
        .eq('status', 'active');

      if (error) return 'Erro ao verificar. Tente novamente.';

      const input = login.trim().toLowerCase();
      const data = (rows ?? []).find(c =>
        (c.client_login || '').toLowerCase() === input ||
        (c.email || '').toLowerCase() === input
      );

      if (!data || data.client_password !== password) return 'Login ou senha incorretos.';
      if (data.blocked) return 'A sua conta está temporariamente bloqueada. Contacte o suporte NorthWindy.';

      onLogin(data.name, data.id);
      return null;
    } catch {
      return 'Erro ao verificar credenciais. Tente novamente.';
    }
  };

  return (
    <LoginModalShell
      icon={<User className="w-5 h-5 text-[#c9a96e]" />}
      iconBgClass="bg-[#0a1628]"
      title="Área do Usuário"
      subtitle="Reservas e perfil"
      brandTitle="Bem-vindo de Volta!"
      brandTagline="Reserve os melhores passeios náuticos e gerencie as suas viagens com a NorthWindy."
      hint={
        <div className="bg-[#0a1628]/5 border border-[#c9a96e]/20 px-4 py-3">
          <p className="text-xs font-medium text-[#1a2b4a]">
            Login: <strong className="text-[#c9a96e]">nome#número</strong> (ex: andrey#1) ou <strong className="text-[#c9a96e]">e-mail</strong> · Senha inicial: <strong>0000</strong>
          </p>
        </div>
      }
      loginPlaceholder="Ex: andrey#1 ou email@exemplo.com"
      passwdPlaceholder="0000"
      onSubmit={handleSubmit}
      onClose={onClose}
      onRegister={onRegister}
      registerLabel="Criar Conta Grátis"
    />
  );
}
