// src/components/admin/SailorSettingsModal.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Modal de configurações do marinheiro — alteração de senha.
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from 'react';
import { Settings, XCircle, Eye, EyeOff } from 'lucide-react';
import { updateSailor } from '../../lib/localStore';

interface Props {
  sailorId: string;
  onClose:  () => void;
}

export function SailorSettingsModal({ sailorId, onClose }: Props) {
  const [newPwd,     setNewPwd]     = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showPwd,    setShowPwd]    = useState(false);
  const [saved,      setSaved]      = useState(false);
  const [error,      setError]      = useState('');

  const handleSave = () => {
    if (!newPwd)                      { setError('Digite a nova senha.'); return; }
    if (newPwd.length < 4)            { setError('Senha muito curta (mín. 4 caracteres).'); return; }
    if (newPwd !== confirmPwd)        { setError('As senhas não coincidem.'); return; }
    updateSailor(sailorId, { password: newPwd } as any);
    setSaved(true);
    setTimeout(() => { onClose(); setSaved(false); }, 1800);
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-blue-900/70 backdrop-blur-md"
      onClick={onClose}>
      <div className="bg-white w-full max-w-sm rounded-[40px] shadow-2xl border-4 border-blue-900 animate-in zoom-in-95 duration-300 overflow-hidden"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="bg-blue-900 px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-800 p-2 rounded-full"><Settings className="w-4 h-4 text-blue-300" /></div>
            <div>
              <p className="text-blue-300 text-[10px] font-black uppercase tracking-widest">Painel</p>
              <h3 className="text-lg font-black text-white uppercase italic">Configurações</h3>
            </div>
          </div>
          <button onClick={onClose} className="bg-blue-800 hover:bg-blue-700 text-white p-2.5 rounded-full transition-all">
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 space-y-5">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">🔒 Alterar Senha</p>
          <div className="space-y-3">
            <div className="relative">
              <label className="text-[10px] font-black text-gray-400 uppercase block mb-1.5">Nova senha</label>
              <input
                type={showPwd ? 'text' : 'password'}
                value={newPwd}
                onChange={e => { setNewPwd(e.target.value); setError(''); }}
                placeholder="••••••••"
                className="w-full bg-gray-50 border-2 border-gray-100 focus:border-blue-900 rounded-[18px] px-5 py-3.5 font-bold text-sm outline-none pr-12 transition-colors"
              />
              <button type="button" onClick={() => setShowPwd(p => !p)}
                className="absolute right-4 top-[38px] text-gray-400 hover:text-blue-900 transition-colors">
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase block mb-1.5">Confirmar senha</label>
              <input
                type={showPwd ? 'text' : 'password'}
                value={confirmPwd}
                onChange={e => { setConfirmPwd(e.target.value); setError(''); }}
                placeholder="••••••••"
                className="w-full bg-gray-50 border-2 border-gray-100 focus:border-blue-900 rounded-[18px] px-5 py-3.5 font-bold text-sm outline-none transition-colors"
              />
            </div>
          </div>
          {error && <p className="text-red-500 font-bold text-xs">⚠️ {error}</p>}
          {saved  && <p className="text-green-600 font-bold text-xs flex items-center gap-1">✅ Senha alterada com sucesso!</p>}
          <button onClick={handleSave}
            className="w-full bg-blue-900 hover:bg-blue-800 text-white py-4 rounded-[25px] font-black uppercase text-sm transition-all shadow-lg">
            Salvar nova senha
          </button>
          <button onClick={onClose}
            className="w-full text-gray-400 hover:text-blue-900 py-2.5 font-black text-xs uppercase transition-all">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}