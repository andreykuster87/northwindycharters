// src/components/ClientArea/components/SettingsModal.tsx
import { useState } from 'react';
import { X, KeyRound, Camera, Eye, EyeOff, Check, AlertCircle, Copy, Trash2 } from 'lucide-react';
import { deleteClient, updateClient } from '../../lib/localStore';
import { normalizeLogin } from '../../utils/clientHelpers';
import type { AuthState } from '../../hooks/useAuth';

// ── Props ─────────────────────────────────────────────────────────────────────

interface SettingsModalProps {
  auth:         AuthState;
  client:       any;
  profilePhoto: string | null;
  onClose:      () => void;
  onLogout:     () => void;
  onPhotoChange: (photo: string | null) => void;
  onClientChange: (patch: any) => void;
}

// ── Componente ────────────────────────────────────────────────────────────────

export function SettingsModal({
  auth, client, profilePhoto,
  onClose, onLogout, onPhotoChange, onClientChange,
}: SettingsModalProps) {
  const [newPassword,  setNewPassword]  = useState('');
  const [confirmPass,  setConfirmPass]  = useState('');
  const [showNew,      setShowNew]      = useState(false);
  const [showConf,     setShowConf]     = useState(false);
  const [passError,    setPassError]    = useState<string | null>(null);
  const [passSaved,    setPassSaved]    = useState(false);
  const [deleteStep,   setDeleteStep]   = useState<0 | 1 | 2>(0);

  async function handleSavePassword() {
    setPassError(null);
    if (!newPassword.trim())        { setPassError('Informe a nova senha.'); return; }
    if (newPassword.length < 4)     { setPassError('Mínimo 4 caracteres.'); return; }
    if (newPassword !== confirmPass) { setPassError('As senhas não coincidem.'); return; }
    if (auth.clientId) await updateClient(auth.clientId, { client_password: newPassword });
    onClientChange({ client_password: newPassword });
    setPassSaved(true);
    setNewPassword('');
    setConfirmPass('');
    setTimeout(() => { setPassSaved(false); onClose(); }, 1800);
  }

  function handlePhotoUpload(file: File) {
    if (file.size > 4 * 1024 * 1024) { alert('Máximo 4MB'); return; }
    const reader = new FileReader();
    reader.onload = ev => {
      const img = new Image();
      img.onload = () => {
        const MAX = 400;
        let { width, height } = img;
        if (width > MAX || height > MAX) {
          if (width > height) { height = Math.round(height * MAX / width); width = MAX; }
          else { width = Math.round(width * MAX / height); height = MAX; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', 0.8);
        onPhotoChange(compressed);
        if (auth.clientId) updateClient(auth.clientId, { profile_photo: compressed } as any);
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  const loginDisplay   = client?.client_login || normalizeLogin(client?.name || '', client?.profile_number);
  const senhaDisplay   = client?.client_password || '0000';
  const strengthLevel  = newPassword.length < 4 ? 0 : newPassword.length < 7 ? 1 : newPassword.length < 10 ? 2 : 3;
  const strengthLabel  = ['Muito curta', 'Fraca', 'Média', 'Forte'][strengthLevel];
  const strengthColors = ['bg-red-400', 'bg-yellow-400', 'bg-blue-400', 'bg-green-500'];

  return (
    <>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-blue-900/60 backdrop-blur-md">
        <div className="bg-white rounded-[40px] shadow-2xl border-4 border-blue-900 w-full max-w-sm animate-in zoom-in-95 duration-300 max-h-[92vh] overflow-y-auto">
          {/* Header */}
          <div className="bg-blue-900 px-8 py-6 rounded-t-[36px] flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="bg-blue-800 p-2 rounded-full"><KeyRound className="w-4 h-4 text-white" /></div>
                <h2 className="text-xl font-black text-white uppercase italic">Configurações</h2>
              </div>
              <p className="text-blue-300 text-[10px] font-black uppercase tracking-widest">Segurança e perfil</p>
            </div>
            <button
              onClick={() => { onClose(); setPassError(null); setNewPassword(''); setConfirmPass(''); }}
              className="bg-blue-800 hover:bg-blue-700 text-white p-2.5 rounded-full transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-8 space-y-4">
            {/* Credenciais */}
            <div className="space-y-2">
              {([['Login', loginDisplay], ['Senha Actual', senhaDisplay]] as [string, string][]).map(([l, v]) => (
                <div key={l} className="bg-gray-50 border-2 border-gray-100 rounded-[18px] px-5 py-3.5 flex items-center justify-between">
                  <span className="text-xs font-black text-gray-400 uppercase">{l}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-blue-900 text-sm">{v}</span>
                    <button onClick={() => navigator.clipboard.writeText(v)}
                      className="p-1.5 rounded-lg bg-gray-200 hover:bg-blue-900 hover:text-white text-gray-500 transition-all">
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Foto de Perfil */}
            <div className="space-y-3">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">📷 Foto de Perfil</p>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-blue-100 flex-shrink-0 shadow-md">
                  {profilePhoto
                    ? <img src={profilePhoto} alt="Perfil" className="w-full h-full object-cover" />
                    : <div className="w-full h-full bg-blue-900 text-white flex items-center justify-center font-black text-2xl">
                        {(auth.userName || 'U').substring(0, 2).toUpperCase()}
                      </div>
                  }
                </div>
                <div className="flex flex-col gap-2 flex-1">
                  <label className="cursor-pointer">
                    <input type="file" accept="image/*" className="hidden"
                      onChange={e => { const f = e.target.files?.[0]; if (f) handlePhotoUpload(f); e.target.value = ''; }}
                    />
                    <div className="flex items-center justify-center gap-2 bg-blue-900 hover:bg-blue-800 text-white py-3 px-4 rounded-[18px] font-black text-xs uppercase transition-all cursor-pointer shadow-md">
                      <Camera className="w-4 h-4" /> Alterar Foto
                    </div>
                  </label>
                  {profilePhoto && (
                    <button type="button"
                      onClick={() => {
                        onPhotoChange(null);
                        if (auth.clientId) updateClient(auth.clientId, { profile_photo: null } as any);
                      }}
                      className="flex items-center justify-center gap-2 border-2 border-red-100 text-red-400 hover:border-red-400 hover:text-red-600 py-2.5 px-4 rounded-[18px] font-black text-xs uppercase transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remover
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Feedback */}
            {passError && (
              <div className="bg-red-50 border-2 border-red-100 rounded-[18px] px-4 py-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <p className="text-red-700 font-bold text-xs">{passError}</p>
              </div>
            )}
            {passSaved && (
              <div className="bg-green-50 border-2 border-green-200 rounded-[18px] px-4 py-3 flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                <p className="text-green-700 font-bold text-xs">Senha alterada com sucesso!</p>
              </div>
            )}

            {/* Nova Senha */}
            <div>
              <label className="text-[10px] font-black text-blue-900 uppercase tracking-wider ml-1 mb-1.5 block">Nova Senha</label>
              <div className="relative">
                <input type={showNew ? 'text' : 'password'} placeholder="Mínimo 4 caracteres" value={newPassword}
                  onChange={e => { setNewPassword(e.target.value); setPassError(null); }}
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-[18px] py-4 px-5 pr-12 font-bold text-blue-900 focus:border-blue-900 outline-none transition-all text-sm"
                />
                <button type="button" onClick={() => setShowNew(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-blue-900 transition-colors">
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirmar Senha */}
            <div>
              <label className="text-[10px] font-black text-blue-900 uppercase tracking-wider ml-1 mb-1.5 block">Confirmar Senha</label>
              <div className="relative">
                <input type={showConf ? 'text' : 'password'} placeholder="Repita a nova senha" value={confirmPass}
                  onChange={e => { setConfirmPass(e.target.value); setPassError(null); }}
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-[18px] py-4 px-5 pr-12 font-bold text-blue-900 focus:border-blue-900 outline-none transition-all text-sm"
                />
                <button type="button" onClick={() => setShowConf(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-blue-900 transition-colors">
                  {showConf ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Força da senha */}
            {newPassword.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex gap-1.5">
                  {[0, 1, 2, 3].map(i => (
                    <div key={i} className={`flex-1 h-1.5 rounded-full transition-all ${i <= strengthLevel ? strengthColors[strengthLevel] : 'bg-gray-100'}`} />
                  ))}
                </div>
                <p className="text-[10px] text-gray-400 font-bold text-right">{strengthLabel}</p>
              </div>
            )}

            {/* Botões */}
            <div className="flex gap-3 pt-2">
              <button onClick={() => { onClose(); setPassError(null); setNewPassword(''); setConfirmPass(''); }}
                className="px-6 py-4 border-2 border-gray-100 text-gray-400 rounded-[25px] font-black text-sm uppercase hover:border-blue-900 hover:text-blue-900 transition-all">
                Cancelar
              </button>
              <button onClick={handleSavePassword}
                className="flex-1 bg-blue-900 text-white py-4 rounded-[25px] font-black uppercase tracking-widest text-sm hover:bg-blue-800 shadow-xl transition-all flex items-center justify-center gap-2">
                <KeyRound className="w-4 h-4" /> Salvar Senha
              </button>
            </div>

            {/* Zona de perigo */}
            <div className="border-t-2 border-red-50 pt-4">
              <button onClick={() => setDeleteStep(1)}
                className="w-full bg-red-50 hover:bg-red-100 border-2 border-red-100 text-red-400 hover:text-red-600 py-3 rounded-[25px] font-black text-xs uppercase transition-all flex items-center justify-center gap-2">
                🗑️ Excluir Minha Conta
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal exclusão */}
      {deleteStep > 0 && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-red-900/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-sm rounded-[40px] shadow-2xl border-4 border-red-500 animate-in zoom-in-95 duration-300 overflow-hidden">
            <div className="bg-red-500 px-8 py-6 text-center">
              <div className="text-4xl mb-2">⚠️</div>
              <h3 className="text-xl font-black text-white uppercase italic">
                {deleteStep === 1 ? 'Excluir Conta?' : 'Tem a certeza absoluta?'}
              </h3>
              <p className="text-red-200 text-xs font-bold mt-1 uppercase tracking-widest">{auth.userName}</p>
            </div>
            <div className="p-8 space-y-5">
              {deleteStep === 1 ? (
                <>
                  <div className="bg-red-50 border-2 border-red-100 rounded-[20px] p-4 space-y-2">
                    <p className="font-black text-red-800 text-sm text-center">Esta acção irá remover:</p>
                    <ul className="space-y-1.5">
                      {['📋 Todos os seus dados pessoais', '🪪 Documentos enviados', '📨 Histórico de mensagens', '🎟️ Histórico de reservas'].map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs font-bold text-red-700">
                          <span className="w-1.5 h-1.5 bg-red-400 rounded-full flex-shrink-0" />{item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <p className="text-gray-500 font-bold text-xs text-center">Esta acção <strong>não pode ser desfeita</strong>.</p>
                  <div className="flex gap-3">
                    <button onClick={() => setDeleteStep(0)} className="flex-1 border-2 border-gray-100 text-gray-500 hover:border-gray-300 py-4 rounded-[25px] font-black text-sm uppercase transition-all">Cancelar</button>
                    <button onClick={() => setDeleteStep(2)} className="flex-1 bg-red-500 hover:bg-red-400 text-white py-4 rounded-[25px] font-black text-sm uppercase transition-all shadow-lg">Continuar →</button>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-red-900 rounded-[20px] p-5 text-center space-y-2">
                    <p className="text-red-300 text-[10px] font-black uppercase tracking-widest">Confirmação final</p>
                    <p className="text-white font-black text-base">Excluir definitivamente a conta de</p>
                    <p className="text-red-200 font-black text-xl uppercase italic">{auth.userName}</p>
                  </div>
                  <p className="text-gray-500 font-bold text-xs text-center leading-relaxed">
                    Após confirmar, <strong>todos os dados serão removidos</strong> permanentemente.
                  </p>
                  <div className="flex gap-3">
                    <button onClick={() => setDeleteStep(0)} className="flex-1 border-2 border-gray-100 text-gray-500 hover:border-gray-300 py-4 rounded-[25px] font-black text-sm uppercase transition-all">Cancelar</button>
                    <button onClick={() => { if (auth.clientId) { deleteClient(auth.clientId); onLogout(); } }}
                      className="flex-1 bg-red-600 hover:bg-red-500 text-white py-4 rounded-[25px] font-black text-sm uppercase transition-all shadow-lg flex items-center justify-center gap-2">
                      🗑️ Excluir Definitivamente
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}