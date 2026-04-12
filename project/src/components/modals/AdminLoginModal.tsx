// src/components/AdminLoginModal.tsx
import { useState } from 'react';
import { LOGO_ALT_SRC } from '../../assets';

interface Props {
  onSuccess: () => void;
  onClose:   () => void;
}

export function AdminLoginModal({ onSuccess, onClose }: Props) {
  const [pass,  setPass]  = useState('');
  const [error, setError] = useState(false);

  function handleLogin() {
    if (pass === '0000') {
      onSuccess();
      setPass('');
      setError(false);
    } else {
      setError(true);
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl border-2 border-gray-100 animate-in zoom-in-95 duration-300">
        <div className="flex flex-col items-center mb-6">
          <img src={LOGO_ALT_SRC}
 alt="NorthWindy" className="w-28 h-auto mb-4 opacity-80" />
          <h2 className="text-lg font-black text-blue-900 uppercase tracking-widest">Acesso Restrito</h2>
          <p className="text-gray-400 text-xs font-medium mt-1">Área administrativa</p>
        </div>
        <div className="flex flex-col gap-3">
          <input
            type="password"
            placeholder="Senha de administrador"
            value={pass}
            onChange={e => { setPass(e.target.value); setError(false); }}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            className={`w-full border-2 rounded-[16px] px-4 py-3 text-sm font-bold outline-none transition-all ${
              error ? 'border-red-400 bg-red-50 text-red-700' : 'border-gray-200 focus:border-blue-900'
            }`}
          />
          {error && (
            <p className="text-red-500 text-xs font-bold text-center -mt-1">Senha incorreta</p>
          )}
          <button
            onClick={handleLogin}
            className="w-full bg-blue-900 hover:bg-blue-800 text-white py-3 rounded-[16px] font-black uppercase text-sm transition-all shadow-lg"
          >
            Entrar
          </button>
          <button
            onClick={() => { onClose(); setPass(''); setError(false); }}
            className="text-gray-400 hover:text-gray-600 text-xs font-bold transition-colors text-center"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}