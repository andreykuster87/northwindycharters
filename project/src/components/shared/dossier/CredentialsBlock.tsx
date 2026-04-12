// src/components/shared/dossier/CredentialsBlock.tsx
// Exibe login + senha com botões de copiar para a área de transferência.
import { Copy } from 'lucide-react';

interface Props {
  login:    string;
  password: string;
}

export function CredentialsBlock({ login, password }: Props) {
  return (
    <div className="bg-blue-900 rounded-[20px] p-5">
      <p className="text-blue-300 text-[10px] font-black uppercase tracking-widest mb-3">
        🔑 Credenciais de Acesso
      </p>
      {([['Login', login], ['Senha', password]] as [string, string][]).map(([label, value]) => (
        <div
          key={label}
          className="flex items-center justify-between bg-blue-800 rounded-[12px] px-4 py-2.5 mb-2 last:mb-0"
        >
          <span className="text-blue-300 text-xs font-bold uppercase">{label}</span>
          <div className="flex items-center gap-2">
            <span className="text-white font-black text-sm">{value}</span>
            <button
              onClick={() => navigator.clipboard.writeText(value)}
              className="bg-blue-700 hover:bg-blue-600 text-white p-1 rounded-lg transition-all"
            >
              <Copy className="w-3 h-3" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
