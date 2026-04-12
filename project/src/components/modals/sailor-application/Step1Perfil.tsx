// src/components/modals/sailor-application/Step1Perfil.tsx
import type { Client } from '../../../lib/localStore';

export function Step1Perfil({ client }: { client: Client }) {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="bg-blue-50 border-2 border-blue-100 rounded-[20px] p-4">
        <p className="text-[10px] font-black text-blue-900 uppercase tracking-wide mb-3 flex items-center gap-1.5">
          <span>👤</span> Dados do seu perfil
        </p>
        <p className="text-[10px] text-blue-500 font-bold mb-4">
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
          <div key={label} className="flex justify-between items-center py-2 border-b border-blue-100 last:border-0">
            <span className="text-[10px] font-black text-blue-400 uppercase">{label}</span>
            <span className="text-xs font-bold text-blue-900">{value}</span>
          </div>
        ))}
      </div>
      <div className="bg-amber-50 border-2 border-amber-200 rounded-[18px] p-4 flex gap-3">
        <span className="text-lg flex-shrink-0">⚓</span>
        <div>
          <p className="text-xs font-black text-amber-800 uppercase mb-1">O que acontece a seguir?</p>
          <p className="text-xs text-amber-700 font-bold leading-relaxed">
            Após enviar a candidatura, o admin irá analisar os seus documentos. Se aprovado, receberá credenciais de acesso à área de tripulante.
          </p>
        </div>
      </div>
    </div>
  );
}
