// src/components/sailor/SailorConfiguracoesTab.tsx
import { useState } from 'react';
import {
  KeyRound, Eye, EyeOff, Check, Copy,
  AlertCircle, ChevronUp, ChevronDown, User as UserIcon, FileText, Save,
  Trash2, AlertTriangle,
} from 'lucide-react';
import { updateSailor, deleteSailor } from '../../lib/localStore';
import type { Sailor } from '../../lib/store/core';
import type { Auth } from '../admin/AdminDashboardShared';
import { SailorProfileContent } from '../pages/SailorProfileView';

function normalizeLogin(name: string, profileNumber: string) {
  const num  = String(parseInt(profileNumber || '1', 10));
  const slug = name.split(' ')[0].toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
  return `${slug}#${num}`;
}

interface Props {
  auth:           Auth;
  sailor:         Sailor;
  onLogout:       () => void;
  onSailorChange: (patch: Partial<Sailor>) => void;
}

export function SailorConfiguracoesTab({ auth, sailor, onLogout, onSailorChange }: Props) {
  const [newPass,   setNewPass]   = useState('');
  const [confPass,  setConfPass]  = useState('');
  const [showNew,   setShowNew]   = useState(false);
  const [showConf,  setShowConf]  = useState(false);
  const [errPass,   setErrPass]   = useState<string | null>(null);
  const [saved,     setSaved]     = useState(false);
  const [delStep,   setDelStep]   = useState<0|1|2>(0);
  const [showCreds, setShowCreds] = useState(false);
  const [showDados, setShowDados] = useState(false);
  const [showDocs,  setShowDocs]  = useState(false);

  const loginDisplay = (sailor as any)?.sailor_login || normalizeLogin(sailor?.name || '', sailor?.profile_number || '1');
  const senhaDisplay = (sailor as any)?.sailor_password || '0000';

  const strength = newPass.length < 4 ? 0 : newPass.length < 7 ? 1 : newPass.length < 10 ? 2 : 3;
  const strengthLabels = ['Muito curta', 'Fraca', 'Média', 'Forte'];
  const strengthColors = ['bg-red-400', 'bg-yellow-400', 'bg-blue-400', 'bg-green-500'];

  async function savePass() {
    setErrPass(null);
    if (!newPass.trim())      { setErrPass('Informe a nova senha.'); return; }
    if (newPass.length < 4)   { setErrPass('Mínimo 4 caracteres.'); return; }
    if (newPass !== confPass) { setErrPass('As senhas não coincidem.'); return; }
    if (auth.sailorId) await updateSailor(auth.sailorId, { sailor_password: newPass } as any);
    onSailorChange({ sailor_password: newPass } as any);
    setSaved(true);
    setNewPass(''); setConfPass('');
    setTimeout(() => setSaved(false), 2500);
  }

  async function deleteAccount() {
    if (auth.sailorId) await deleteSailor(auth.sailorId);
    onLogout();
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em] mb-1">Conta</p>
        <h2 className="font-['Playfair_Display'] font-bold text-[#1a2b4a] text-xl">Configurações</h2>
        <div className="w-8 h-px bg-[#c9a96e] mt-2" />
      </div>

      {/* Dados Pessoais */}
      <CollapsibleSection icon={UserIcon} label="Dados Pessoais" open={showDados} onToggle={() => setShowDados(v => !v)}>
        <DadosPessoaisForm
          sailor={sailor}
          sailorId={auth.sailorId}
          onSaved={patch => onSailorChange(patch)}
        />
      </CollapsibleSection>

      {/* Documentos (link ao Perfil Público) */}
      <CollapsibleSection icon={FileText} label="Documentos" open={showDocs} onToggle={() => setShowDocs(v => !v)}>
        <div className="space-y-3">
          <div className="bg-amber-50 border border-amber-200 px-3 py-2.5 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-700 font-semibold text-xs">Edição condicional</p>
              <p className="text-amber-600/80 text-[11px] mt-0.5">
                Os documentos só podem ser atualizados a partir de 15 dias antes do vencimento ou quando expirados.
              </p>
            </div>
          </div>
          <SailorProfileContent sailor={sailor} subTab="documentos" isOwner={true} />
        </div>
      </CollapsibleSection>

      {/* Credenciais */}
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

      {/* Zona de Perigo */}
      <div className="bg-white border border-red-200 p-4 space-y-3 relative" style={{ boxShadow: '0 1px 4px rgba(220,38,38,0.08)' }}>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-400/50 to-transparent" />
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          <p className="text-[10px] font-semibold text-red-600 uppercase tracking-[0.15em]">Zona de Perigo</p>
        </div>
        <p className="text-xs text-gray-600">
          A exclusão da conta é <strong>permanente</strong>. Perderá acesso ao histórico de reservas, documentos e amigos.
        </p>

        {delStep === 0 && (
          <button
            onClick={() => setDelStep(1)}
            className="w-full bg-white border border-red-300 hover:bg-red-50 text-red-600 py-3 font-semibold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Excluir Conta
          </button>
        )}

        {delStep === 1 && (
          <div className="bg-red-50 border border-red-200 p-3 space-y-2">
            <p className="text-xs font-semibold text-red-700">Tem a certeza?</p>
            <p className="text-[11px] text-red-600/80">Esta ação não pode ser revertida.</p>
            <div className="flex gap-2">
              <button
                onClick={() => setDelStep(0)}
                className="flex-1 bg-white border border-gray-200 hover:bg-gray-50 text-[#1a2b4a] py-2 font-semibold text-[11px] uppercase tracking-wider transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={() => setDelStep(2)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 font-semibold text-[11px] uppercase tracking-wider transition-all"
              >
                Sim, continuar
              </button>
            </div>
          </div>
        )}

        {delStep === 2 && (
          <div className="bg-red-50 border border-red-200 p-3 space-y-2">
            <p className="text-xs font-semibold text-red-700">Confirmação final</p>
            <p className="text-[11px] text-red-600/80">Carregue em “Eliminar agora” para remover a conta definitivamente.</p>
            <div className="flex gap-2">
              <button
                onClick={() => setDelStep(0)}
                className="flex-1 bg-white border border-gray-200 hover:bg-gray-50 text-[#1a2b4a] py-2 font-semibold text-[11px] uppercase tracking-wider transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={deleteAccount}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 font-semibold text-[11px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3 h-3" />
                Eliminar agora
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CollapsibleSection({
  icon: Icon, label, open, onToggle, children,
}: {
  icon: any; label: string; open: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <div className="border border-gray-100 overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <button onClick={onToggle}
        className={`w-full flex items-center justify-between px-4 py-3.5 text-xs font-semibold uppercase tracking-wide transition-all ${open ? 'bg-[#0a1628] text-white' : 'bg-gray-50 text-[#1a2b4a] hover:bg-gray-100'}`}>
        <div className="flex items-center gap-2">
          <Icon className={`w-3.5 h-3.5 ${open ? 'text-[#c9a96e]' : ''}`} />
          {label}
        </div>
        {open ? <ChevronUp className="w-3.5 h-3.5 text-[#c9a96e]" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>
      {open && (
        <div className="bg-white p-4 animate-in fade-in duration-150">
          {children}
        </div>
      )}
    </div>
  );
}

function DadosPessoaisForm({ sailor, sailorId, onSaved }: {
  sailor: Sailor; sailorId: string | null; onSaved: (patch: Partial<Sailor>) => void;
}) {
  const [form, setForm] = useState({
    name:          sailor?.name          ?? '',
    phone:         sailor?.phone         ?? '',
    email:         sailor?.email         ?? '',
    endereco:      sailor?.endereco      ?? '',
    nacionalidade: sailor?.nacionalidade ?? '',
    birth_date:    sailor?.birth_date    ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dirty =
    form.name          !== (sailor?.name          ?? '') ||
    form.phone         !== (sailor?.phone         ?? '') ||
    form.email         !== (sailor?.email         ?? '') ||
    form.endereco      !== (sailor?.endereco      ?? '') ||
    form.nacionalidade !== (sailor?.nacionalidade ?? '') ||
    form.birth_date    !== (sailor?.birth_date    ?? '');

  async function handleSave() {
    setError(null);
    if (!form.name.trim())  { setError('O nome é obrigatório.'); return; }
    if (!form.email.trim()) { setError('O email é obrigatório.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setError('Email inválido.'); return; }

    setSaving(true);
    try {
      if (sailorId) await updateSailor(sailorId, form as any);
      onSaved(form);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    } catch (e: any) {
      setError(e?.message || 'Não foi possível guardar.');
    } finally {
      setSaving(false);
    }
  }

  const fields: { key: keyof typeof form; label: string; type?: string; placeholder?: string; full?: boolean }[] = [
    { key: 'name',          label: 'Nome Completo', full: true },
    { key: 'email',         label: 'Email',         type: 'email' },
    { key: 'phone',         label: 'Telefone',      placeholder: '+351 912345678' },
    { key: 'birth_date',    label: 'Data de Nascimento', type: 'date' },
    { key: 'nacionalidade', label: 'Nacionalidade' },
    { key: 'endereco',      label: 'Endereço',      full: true, placeholder: 'Rua, nº, cidade, código postal' },
  ];

  return (
    <div className="space-y-3">
      {error && (
        <div className="bg-red-50 border border-red-200 px-3 py-2.5 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-red-700 font-medium text-xs">{error}</p>
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 px-3 py-2.5 flex items-center gap-2">
          <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
          <p className="text-green-700 font-medium text-xs">Dados atualizados com sucesso!</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {fields.map(f => (
          <div key={f.key} className={f.full ? 'sm:col-span-2' : ''}>
            <label className="text-[10px] font-semibold text-[#1a2b4a] uppercase tracking-wider ml-1 mb-1 block">{f.label}</label>
            <input
              type={f.type || 'text'}
              value={form[f.key] || ''}
              placeholder={f.placeholder}
              onChange={e => setForm(s => ({ ...s, [f.key]: e.target.value }))}
              className="w-full bg-gray-50 border border-gray-200 py-3 px-3 font-medium text-[#1a2b4a] focus:border-[#c9a96e] outline-none text-sm transition-colors"
            />
          </div>
        ))}
      </div>

      <button
        onClick={handleSave}
        disabled={!dirty || saving}
        className="w-full bg-[#0a1628] hover:bg-[#1a2b4a] disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3.5 font-semibold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
      >
        <Save className="w-3.5 h-3.5" />
        {saving ? 'A guardar…' : 'Guardar Alterações'}
      </button>
    </div>
  );
}
