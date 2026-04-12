// src/components/ClientSuccessModal.tsx
import { CheckCircle2, Hash } from 'lucide-react';

interface Props {
  name:            string;
  profile_number?: string;
  onClose:         () => void;
}

export function ClientSuccessModal({ name, profile_number, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-blue-900/60 backdrop-blur-md">
      <div className="bg-white rounded-[40px] shadow-2xl border-4 border-blue-900 p-10 max-w-sm w-full text-center animate-in zoom-in-95 duration-300">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-black text-blue-900 uppercase italic mb-2">Cadastro Enviado!</h2>
        <p className="text-gray-500 font-bold text-sm mb-2">
          Bem-vindo, <span className="text-blue-900 font-black">{name}</span>!
        </p>
        {profile_number && (
          <div className="bg-blue-900 rounded-[20px] px-6 py-4 my-4 flex items-center justify-center gap-3 w-full">
            <Hash className="w-5 h-5 text-blue-300 flex-shrink-0" />
            <div className="text-left">
              <p className="text-blue-300 text-[10px] font-black uppercase tracking-widest">Nº de Perfil</p>
              <p className="text-white text-2xl font-black tracking-widest">
                #{String(parseInt(profile_number, 10))}
              </p>
            </div>
          </div>
        )}
        <p className="text-gray-400 font-bold text-xs mb-8 leading-relaxed">
          Seu cadastro foi recebido e está em análise. Após verificação você receberá o login e senha via WhatsApp.
        </p>
        <div className="bg-amber-50 border-2 border-amber-100 rounded-[20px] px-5 py-3 mb-6 flex items-center gap-3">
          <span className="text-xl">⏳</span>
          <p className="text-xs font-black text-amber-700 text-left">
            Verificação pendente — aguarde a notificação da equipe NorthWindy.
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-full bg-blue-900 text-white py-4 rounded-[25px] font-black uppercase hover:bg-blue-800 transition-all shadow-lg"
        >
          Entendido
        </button>
      </div>
    </div>
  );
}