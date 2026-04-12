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
        .select('id, name, status, blocked, client_login, client_password')
        .eq('status', 'active');

      if (error) return 'Erro ao verificar. Tente novamente.';

      const data = (rows ?? []).find(c =>
        (c.client_login || '').toLowerCase() === login.trim().toLowerCase()
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
      icon={<User className="w-5 h-5 text-white" />}
      iconBgClass="bg-blue-900"
      title="Área do Usuário"
      subtitle="Reservas e perfil"
      hint={
        <div className="bg-blue-50 border-2 border-blue-100 rounded-[20px] px-5 py-3">
          <p className="text-xs font-bold text-blue-600">
            Login: <strong>nome#número</strong> (ex: andrey#1) · Senha inicial: <strong>0000</strong>
          </p>
        </div>
      }
      cardBorderClass="border-blue-900"
      loginPlaceholder="Ex: andrey#1"
      passwdPlaceholder="0000"
      inputFocusClass="focus:border-blue-900"
      submitClass="bg-blue-900 hover:bg-blue-800 text-white"
      onSubmit={handleSubmit}
      onClose={onClose}
      onRegister={onRegister}
      registerLabel="Criar Conta Grátis"
      registerBorderClass="border-blue-900"
      registerTextClass="text-blue-900"
    />
  );
}
