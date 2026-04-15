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
      icon={<Building2 className="w-5 h-5 text-[#c9a96e]" />}
      iconBgClass="bg-[#0a1628]"
      title="Área da Empresa"
      subtitle="Gestão e parcerias"
      brandTitle="Bem-vindo, Parceiro!"
      brandTagline="Gerencie a sua frota, contratos e parcerias NorthWindy num só lugar."
      hint={
        <div className="bg-[#0a1628]/5 border border-[#c9a96e]/20 px-4 py-3">
          <p className="text-xs font-medium text-[#1a2b4a]">
            Login: <strong className="text-[#c9a96e]">empresa#número</strong> ou <strong className="text-[#c9a96e]">e-mail</strong> · Senha recebida via WhatsApp na aprovação
          </p>
        </div>
      }
      loginPlaceholder="Ex: marinacascais#1 ou email@exemplo.com"
      passwdPlaceholder="Senha recebida via WhatsApp"
      submitLabel="Entrar na Empresa"
      onSubmit={handleSubmit}
      onClose={onClose}
      onRegister={onRegister}
      registerLabel="Registar Empresa"
    />
  );
}
