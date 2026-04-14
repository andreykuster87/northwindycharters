// src/components/admin/SailorSettingsModal.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Modal de configurações do marinheiro — alteração de senha.
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from 'react';
import { Settings, X, Eye, EyeOff } from 'lucide-react';
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
    if (!newPwd)               { setError('Digite a nova senha.'); return; }
    if (newPwd.length < 4)     { setError('Senha muito curta (mín. 4 caracteres).'); return; }
    if (newPwd !== confirmPwd) { setError('As senhas não coincidem.'); return; }
    updateSailor(sailorId, { password: newPwd } as any);
    setSaved(true);
    setTimeout(() => { onClose(); setSaved(false); }, 1800);
  };

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-4"
      style={{ background: 'rgba(4,10,24,0.88)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-sm shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#0a1628] relative overflow-hidden px-6 py-5 flex items-center justify-between">
          {/* Grid texture */}
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: 'repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 0,transparent 60px),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 0,transparent 60px)' }} />
          {/* Gold bottom line */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a96e]/40 to-transparent" />

          <div className="relative z-10 flex items-center gap-3">
            <div className="w-9 h-9 bg-[#c9a96e]/10 flex items-center justify-center">
              <Settings className="w-4 h-4 text-[#c9a96e]" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-[#c9a96e]/70 uppercase tracking-[0.15em]">Painel</p>
              <h3 className="font-['Playfair_Display'] font-bold italic text-xl text-white leading-tight">
                Configurações
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="relative z-10 w-8 h-8 bg-white/5 hover:bg-white/15 flex items-center justify-center transition-all border border-white/10"
          >
            <X className="w-4 h-4 text-white/70" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em]">
            🔒 Alterar Senha
          </p>

          <div className="space-y-4">
            {/* Nova senha */}
            <div>
              <label className="text-[10px] font-semibold text-[#1a2b4a] uppercase tracking-[0.12em] block mb-1.5">
                Nova senha
              </label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={newPwd}
                  onChange={e => { setNewPwd(e.target.value); setError(''); }}
                  placeholder="••••••••"
                  className="w-full bg-gray-50 border border-gray-200 py-3.5 px-4 font-medium text-[#1a2b4a] focus:border-[#c9a96e] outline-none transition-all text-sm pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1a2b4a] transition-colors"
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirmar senha */}
            <div>
              <label className="text-[10px] font-semibold text-[#1a2b4a] uppercase tracking-[0.12em] block mb-1.5">
                Confirmar senha
              </label>
              <input
                type={showPwd ? 'text' : 'password'}
                value={confirmPwd}
                onChange={e => { setConfirmPwd(e.target.value); setError(''); }}
                placeholder="••••••••"
                className="w-full bg-gray-50 border border-gray-200 py-3.5 px-4 font-medium text-[#1a2b4a] focus:border-[#c9a96e] outline-none transition-all text-sm"
              />
            </div>
          </div>

          {error && (
            <p className="text-red-600 font-semibold text-xs flex items-center gap-1.5">
              <span>⚠️</span> {error}
            </p>
          )}
          {saved && (
            <p className="text-emerald-600 font-semibold text-xs flex items-center gap-1.5">
              <span>✅</span> Senha alterada com sucesso!
            </p>
          )}

          <div className="h-px bg-gray-100" />

          <button
            onClick={handleSave}
            className="w-full bg-[#0a1628] text-white py-4 px-6 font-semibold uppercase tracking-widest text-sm hover:bg-[#1a2b4a] transition-all"
          >
            Salvar nova senha
          </button>
          <button
            onClick={onClose}
            className="w-full border border-gray-200 text-gray-400 py-3 px-6 font-semibold text-sm uppercase hover:border-[#c9a96e] hover:text-[#1a2b4a] transition-all"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
