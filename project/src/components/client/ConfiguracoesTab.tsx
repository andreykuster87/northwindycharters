// src/components/client/ConfiguracoesTab.tsx
import { useState } from 'react';
import {
  LogOut, KeyRound, Eye, EyeOff, Check, Copy, Trash2,
  AlertCircle, ChevronUp, ChevronDown,
} from 'lucide-react';
import { updateClient, deleteClient } from '../../lib/localStore';
import type { AuthState } from '../../hooks/useAuth';

function normalizeLogin(name: string, profileNumber: string) {
  const num  = String(parseInt(profileNumber || '1', 10));
  const slug = name.split(' ')[0].toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
  return `${slug}#${num}`;
}

interface Props {
  auth:           AuthState;
  client:         any;
  onLogout:       () => void;
  onClientChange: (patch: any) => void;
}

export function ConfiguracoesTab({ auth, client, onLogout, onClientChange }: Props) {
  const [newPass,   setNewPass]   = useState('');
  const [confPass,  setConfPass]  = useState('');
  const [showNew,   setShowNew]   = useState(false);
  const [showConf,  setShowConf]  = useState(false);
  const [errPass,   setErrPass]   = useState<string | null>(null);
  const [saved,     setSaved]     = useState(false);
  const [delStep,   setDelStep]   = useState<0|1|2>(0);
  const [showCreds, setShowCreds] = useState(false);

  const loginDisplay = client?.client_login || normalizeLogin(client?.name || '', client?.profile_number || '1');
  const senhaDisplay = client?.client_password || '0000';

  const strength = newPass.length < 4 ? 0 : newPass.length < 7 ? 1 : newPass.length < 10 ? 2 : 3;
  const strengthLabels = ['Muito curta', 'Fraca', 'Média', 'Forte'];
  const strengthColors = ['bg-red-400', 'bg-yellow-400', 'bg-blue-400', 'bg-green-500'];

  async function savePass() {
    setErrPass(null);
    if (!newPass.trim())      { setErrPass('Informe a nova senha.'); return; }
    if (newPass.length < 4)   { setErrPass('Mínimo 4 caracteres.'); return; }
    if (newPass !== confPass) { setErrPass('As senhas não coincidem.'); return; }
    if (auth.clientId) await updateClient(auth.clientId, { client_password: newPass });
    onClientChange({ client_password: newPass });
    setSaved(true);
    setNewPass(''); setConfPass('');
    setTimeout(() => setSaved(false), 2500);
  }

  async function deleteAccount() {
    if (auth.clientId) await deleteClient(auth.clientId);
    onLogout();
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em] mb-1">Conta</p>
        <h2 className="font-['Playfair_Display'] font-bold text-[#1a2b4a] text-xl">Configurações</h2>
        <div className="w-8 h-px bg-[#c9a96e] mt-2" />
      </div>

      {/* Credenciais de acesso — colapsável */}
      <div className="border border-gray-100 overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <button onClick={() => setShowCreds(v => !v)}
          className={`w-full flex items-center justify-between px-4 py-3.5 text-xs font-semibold uppercase tracking-wide transition-all ${showCreds ? 'bg-[#0a1628] text-white' : 'bg-gray-50 text-[#1a2b4a] hover:bg-gray-100'}`}>
          <div className="flex items-center gap-2">
            <KeyRound className={`w-3.5 h-3.5 ${showCreds ? 'text-[#c9a96e]' : ''}`} />
            Credenciais de acesso
          </div>
          {showCreds ? <ChevronUp className="w-3.5 h-3.5 text-[#c9a96e]" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
        {showCreds && (
          <div className="bg-[#0a1628] px-4 pb-4 pt-3 space-y-2 animate-in fade-in duration-150">
            {([['Login', loginDisplay], ['Senha', senhaDisplay]] as [string, string][]).map(([l, v]) => (
              <div key={l} className="flex items-center justify-between bg-white/5 border border-[#c9a96e]/20 px-4 py-2.5">
                <span className="text-[#c9a96e]/70 text-xs font-semibold uppercase tracking-wide">{l}</span>
                <div className="flex items-center gap-2">
                  <span className="text-white font-['Playfair_Display'] font-bold text-sm">{v}</span>
                  <button onClick={() => navigator.clipboard.writeText(v)}
                    className="bg-white/10 hover:bg-[#c9a96e]/20 text-[#c9a96e] p-1 transition-all">
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Alterar senha */}
      <div className="bg-white border border-gray-100 p-4 space-y-3 relative" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a96e]/30 to-transparent" />
        <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em]">Alterar Senha</p>

        {errPass && (
          <div className="bg-red-50 border border-red-200 px-3 py-2.5 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p className="text-red-700 font-medium text-xs">{errPass}</p>
          </div>
        )}
        {saved && (
          <div className="bg-green-50 border border-green-200 px-3 py-2.5 flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
            <p className="text-green-700 font-medium text-xs">Senha alterada com sucesso!</p>
          </div>
        )}

        {[
          { label: 'Nova Senha',      val: newPass,  set: setNewPass,  show: showNew,  setShow: setShowNew  },
          { label: 'Confirmar Senha', val: confPass, set: setConfPass, show: showConf, setShow: setShowConf },
        ].map(f => (
          <div key={f.label}>
            <label className="text-[10px] font-semibold text-[#1a2b4a] uppercase tracking-wider ml-1 mb-1 block">{f.label}</label>
            <div className="relative">
              <input type={f.show ? 'text' : 'password'} value={f.val}
                onChange={e => { f.set(e.target.value); setErrPass(null); setSaved(false); }}
                className="w-full bg-gray-50 border border-gray-200 py-3.5 px-4 pr-10 font-medium text-[#1a2b4a] focus:border-[#c9a96e] outline-none text-sm transition-colors" />
              <button type="button" onClick={() => f.setShow(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#c9a96e] transition-colors">
                {f.show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        ))}

        {newPass.length > 0 && (
          <div className="space-y-1">
            <div className="flex gap-1 h-1.5">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className={`flex-1 transition-all ${i <= strength ? strengthColors[strength] : 'bg-gray-100'}`} />
              ))}
            </div>
            <p className={`text-[10px] font-semibold ml-1 ${strengthColors[strength].replace('bg-', 'text-')}`}>{strengthLabels[strength]}</p>
          </div>
        )}

        <button onClick={savePass}
          className="w-full bg-[#0a1628] hover:bg-[#1a2b4a] text-white py-3.5 font-semibold text-xs uppercase tracking-wider transition-all">
          Guardar Nova Senha
        </button>
      </div>

      {/* Terminar sessão */}
      <button onClick={onLogout}
        className="w-full flex items-center justify-center gap-2 border border-gray-200 text-gray-500 hover:border-red-200 hover:text-red-500 hover:bg-red-50 py-3.5 font-semibold text-sm uppercase tracking-wide transition-all">
        <LogOut className="w-4 h-4" /> Terminar Sessão
      </button>

      {/* Eliminar conta */}
      <div className="bg-white border border-red-50 p-4 relative" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <p className="text-[10px] font-semibold text-red-500 uppercase tracking-[0.15em] mb-3">Zona de Perigo</p>
        {delStep === 0 && (
          <button onClick={() => setDelStep(1)}
            className="w-full border border-red-100 text-red-400 hover:bg-red-50 hover:border-red-300 py-3 font-semibold text-xs uppercase tracking-wide transition-all flex items-center justify-center gap-2">
            <Trash2 className="w-3.5 h-3.5" /> Eliminar Conta
          </button>
        )}
        {delStep === 1 && (
          <div className="space-y-3">
            <p className="text-xs font-medium text-gray-700 text-center">Tem a certeza? Esta acção é irreversível.</p>
            <div className="flex gap-2">
              <button onClick={() => setDelStep(0)}
                className="flex-1 border border-gray-100 text-gray-500 py-2.5 font-semibold text-xs uppercase">Cancelar</button>
              <button onClick={() => setDelStep(2)}
                className="flex-1 bg-red-500 hover:bg-red-400 text-white py-2.5 font-semibold text-xs uppercase transition-all">Confirmar</button>
            </div>
          </div>
        )}
        {delStep === 2 && (
          <div className="space-y-3">
            <p className="text-xs font-medium text-red-700 text-center">⚠️ Última confirmação — a conta será eliminada permanentemente.</p>
            <div className="flex gap-2">
              <button onClick={() => setDelStep(0)}
                className="flex-1 border border-gray-100 text-gray-500 py-2.5 font-semibold text-xs uppercase">Cancelar</button>
              <button onClick={deleteAccount}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2.5 font-semibold text-xs uppercase transition-all">Eliminar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
