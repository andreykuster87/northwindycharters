// src/components/ClientSuccessModal.tsx
import { CheckCircle2, Hash } from 'lucide-react';

interface Props {
  name:            string;
  profile_number?: string;
  onClose:         () => void;
}

export function ClientSuccessModal({ name, profile_number, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(4,10,24,0.88)', backdropFilter: 'blur(8px)' }}
    >
      <div className="bg-white shadow-2xl border border-[#c9a96e]/30 p-10 max-w-sm w-full text-center animate-in zoom-in-95 duration-300">
        <div className="w-20 h-20 bg-green-100 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-['Playfair_Display'] font-bold text-[#1a2b4a] uppercase mb-2">Cadastro Enviado!</h2>
        <p className="text-gray-500 font-bold text-sm mb-2">
          Bem-vindo, <span className="text-[#1a2b4a] font-semibold">{name}</span>!
        </p>
        {profile_number && (
          <div className="bg-[#0a1628] px-6 py-4 my-4 flex items-center justify-center gap-3 w-full">
            <Hash className="w-5 h-5 text-[#c9a96e] flex-shrink-0" />
            <div className="text-left">
              <p className="text-[#c9a96e] text-[10px] font-semibold uppercase tracking-[0.15em]">Nº de Perfil</p>
              <p className="text-white text-2xl font-semibold tracking-widest">
                #{String(parseInt(profile_number, 10))}
              </p>
            </div>
          </div>
        )}
        <p className="text-gray-400 font-bold text-xs mb-8 leading-relaxed">
          Seu cadastro foi recebido e está em análise. Após verificação você receberá o login e senha via WhatsApp.
        </p>
        <div className="bg-[#c9a96e]/5 border border-[#c9a96e]/20 px-5 py-3 mb-6 flex items-center gap-3">
          <span className="text-xl">⏳</span>
          <p className="text-xs font-semibold text-[#1a2b4a] text-left">
            Verificação pendente — aguarde a notificação da equipe NorthWindy.
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-full bg-[#0a1628] text-white py-4 font-semibold uppercase hover:bg-[#0a1628]/90 transition-all shadow-lg"
        >
          Entendido
        </button>
      </div>
    </div>
  );
}
