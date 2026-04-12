// src/components/modals/CompanyLoginModal.tsx
import { Building2 } from 'lucide-react';
import { companyLogin } from '../../lib/localStore';
import { LoginModalShell } from './shared/LoginModalShell';

interface Props {
  onLogin:    (name: string, id: string) => void;
  onClose:    () => void;
  onRegister: () => void;
}

const ERROR_MESSAGES: Record<string, string> = {
  not_found:      'Login não encontrado. Verifique os dados recebidos.',
  wrong_password: 'Senha incorreta.',
  not_active:     'Empresa ainda não aprovada. Aguarde a verificação da equipa NorthWindy.',
  blocked:        'Esta conta está temporariamente suspensa. Contacte o suporte NorthWindy.',
};

export function CompanyLoginModal({ onLogin, onClose, onRegister }: Props) {
  const handleSubmit = async (login: string, password: string): Promise<string | null> => {
    const result = companyLogin(login, password);
    if (!result.ok) return ERROR_MESSAGES[result.reason] ?? 'Erro desconhecido.';
    onLogin(result.company.nome_fantasia, result.company.id);
    return null;
  };

  return (
    <LoginModalShell
      icon={<Building2 className="w-5 h-5 text-white" />}
      iconBgClass="bg-amber-500"
      title="Área da Empresa"
      subtitle="Gestão e parcerias"
      hint={
        <div className="bg-amber-50 border-2 border-amber-100 rounded-[20px] px-5 py-3">
          <p className="text-xs font-bold text-amber-700">
            Login: <strong>empresa#número</strong> · Senha recebida via WhatsApp na aprovação
          </p>
        </div>
      }
      cardBorderClass="border-amber-500"
      loginPlaceholder="Ex: marinacascais#1"
      passwdPlaceholder="Senha recebida via WhatsApp"
      inputFocusClass="focus:border-amber-400"
      submitClass="bg-amber-500 hover:bg-amber-400 text-white"
      submitLabel="Entrar na Empresa"
      onSubmit={handleSubmit}
      onClose={onClose}
      onRegister={onRegister}
      registerLabel="Registar Empresa"
      registerBorderClass="border-amber-500"
      registerTextClass="text-amber-600"
    />
  );
}
