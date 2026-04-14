// src/components/shared/dossier/CredentialsBlock.tsx
// Exibe login + senha com botões de copiar para a área de transferência.
import { Copy } from 'lucide-react';

interface Props {
  login:    string;
  password: string;
}

export function CredentialsBlock({ login, password }: Props) {
  return (
    <div className="bg-[#0a1628] p-5">
      <p className="text-[#c9a96e] text-[10px] font-semibold uppercase tracking-[0.15em] mb-3">
        🔑 Credenciais de Acesso
      </p>
      {([['Login', login], ['Senha', password]] as [string, string][]).map(([label, value]) => (
        <div
          key={label}
          className="flex items-center justify-between bg-[#0a1628]/60 border border-[#c9a96e]/20 px-4 py-2.5 mb-2 last:mb-0"
        >
          <span className="text-[#c9a96e] text-xs font-bold uppercase">{label}</span>
          <div className="flex items-center gap-2">
            <span className="text-white font-bold text-sm">{value}</span>
            <button
              onClick={() => navigator.clipboard.writeText(value)}
              className="bg-[#c9a96e]/20 hover:bg-[#c9a96e]/30 text-[#c9a96e] p-1 transition-all"
            >
              <Copy className="w-3 h-3" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
