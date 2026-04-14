// src/components/modals/sailor-application/Step1Perfil.tsx
import type { Client } from '../../../lib/localStore';

export function Step1Perfil({ client }: { client: Client }) {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="bg-[#0a1628]/5 border border-[#c9a96e]/20 p-4">
        <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em] mb-3 flex items-center gap-1.5">
          <span>👤</span> Dados do seu perfil
        </p>
        <p className="text-[10px] text-[#1a2b4a]/60 font-bold mb-4">
          Estes dados são carregados automaticamente do seu cadastro de passageiro.
        </p>
        {[
          ['Nome',          client.name],
          ['E-mail',        client.email],
          ['Telefone',      client.phone],
          ['Nacionalidade', client.country_name],
          ['Data Nasc.',    client.birth_date
            ? new Date(client.birth_date).toLocaleDateString('pt-BR')
            : '—'],
        ].map(([label, value]) => (
          <div key={label} className="flex justify-between items-center py-2 border-b border-[#c9a96e]/10 last:border-0">
            <span className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em]">{label}</span>
            <span className="text-xs font-bold text-[#1a2b4a]">{value}</span>
          </div>
        ))}
      </div>
      <div className="bg-[#c9a96e]/5 border border-[#c9a96e]/20 p-4 flex gap-3">
        <span className="text-lg flex-shrink-0">⚓</span>
        <div>
          <p className="text-xs font-semibold text-[#1a2b4a] uppercase tracking-[0.15em] mb-1">O que acontece a seguir?</p>
          <p className="text-xs text-[#1a2b4a]/70 font-bold leading-relaxed">
            Após enviar a candidatura, o admin irá analisar os seus documentos. Se aprovado, receberá credenciais de acesso à área de tripulante.
          </p>
        </div>
      </div>
    </div>
  );
}
