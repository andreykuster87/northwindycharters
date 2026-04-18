// src/components/modals/CompanySettingsModal.tsx
// Configurações da empresa: contactos + troca de senha
import { useState } from 'react';
import {
  X, Settings as SettingsIcon, KeyRound, Eye, EyeOff, Check, AlertCircle, Copy,
  Phone, Mail, Globe, MapPin,
} from 'lucide-react';
import { updateCompany, type Company } from '../../lib/localStore';

interface Props {
  company: Company;
  onClose: () => void;
  onCompanyChange: (patch: Partial<Company>) => void;
  onToast?: (msg: string) => void;
}

export function CompanySettingsModal({ company, onClose, onCompanyChange, onToast }: Props) {
  const [tab, setTab] = useState<'contactos' | 'senha'>('contactos');

  // Contactos
  const [telefone, setTelefone] = useState(company.telefone || '');
  const [email, setEmail]       = useState(company.email || '');
  const [website, setWebsite]   = useState(company.website || '');
  const [savingContact, setSavingContact] = useState(false);
  const [contactSaved, setContactSaved]   = useState(false);

  // Senha
  const [currentPass, setCurrentPass] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew]         = useState(false);
  const [showConf, setShowConf]       = useState(false);
  const [passError, setPassError]     = useState<string | null>(null);
  const [passSaved, setPassSaved]     = useState(false);

  async function handleSaveContact() {
    setSavingContact(true);
    try {
      await updateCompany(company.id, { telefone, email, website });
      onCompanyChange({ telefone, email, website });
      setContactSaved(true);
      onToast?.('Contactos actualizados');
      setTimeout(() => setContactSaved(false), 2000);
    } finally {
      setSavingContact(false);
    }
  }

  async function handleSavePassword() {
    setPassError(null);
    if (!currentPass.trim())               { setPassError('Informe a senha actual.'); return; }
    if (currentPass !== company.company_password) { setPassError('Senha actual incorrecta.'); return; }
    if (!newPassword.trim())               { setPassError('Informe a nova senha.'); return; }
    if (newPassword.length < 4)            { setPassError('Mínimo 4 caracteres.'); return; }
    if (newPassword !== confirmPass)       { setPassError('As senhas não coincidem.'); return; }
    await updateCompany(company.id, { company_password: newPassword });
    onCompanyChange({ company_password: newPassword });
    setPassSaved(true);
    setCurrentPass(''); setNewPassword(''); setConfirmPass('');
    onToast?.('Senha alterada com sucesso');
    setTimeout(() => setPassSaved(false), 2000);
  }

  const loginDisplay = company.company_login || '—';
  const strengthLevel  = newPassword.length < 4 ? 0 : newPassword.length < 7 ? 1 : newPassword.length < 10 ? 2 : 3;
  const strengthLabel  = ['Muito curta', 'Fraca', 'Média', 'Forte'][strengthLevel];
  const strengthColors = ['bg-red-400', 'bg-yellow-400', 'bg-blue-400', 'bg-green-500'];

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(4,10,24,0.88)', backdropFilter: 'blur(8px)' }}
    >
      <div className="bg-white shadow-2xl border border-[#c9a96e]/30 w-full max-w-md animate-in zoom-in-95 duration-300 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div
          className="bg-[#0a1628] px-6 py-5 flex items-center justify-between relative"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg,transparent,transparent 24px,rgba(201,169,110,0.04) 24px,rgba(201,169,110,0.04) 25px),repeating-linear-gradient(90deg,transparent,transparent 24px,rgba(201,169,110,0.04) 24px,rgba(201,169,110,0.04) 25px)',
          }}
        >
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="bg-white/10 p-2"><SettingsIcon className="w-4 h-4 text-[#c9a96e]" /></div>
              <h2 className="text-lg font-['Playfair_Display'] font-bold text-white uppercase">Configurações</h2>
            </div>
            <p className="text-[#c9a96e] text-[10px] font-semibold uppercase tracking-[0.15em]">Contactos e segurança</p>
          </div>
          <button
            onClick={onClose}
            className="bg-white/10 hover:bg-white/20 text-white p-2.5 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="absolute bottom-0 left-0 right-0 h-px bg-[#c9a96e]/40" />
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-50 border-b border-gray-100">
          {([['contactos', 'Contactos', Phone], ['senha', 'Senha', KeyRound]] as const).map(([key, label, Icon]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-semibold uppercase tracking-wider transition-all ${
                tab === key
                  ? 'bg-white text-[#1a2b4a] border-b-2 border-[#c9a96e]'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon className="w-3.5 h-3.5" /> {label}
            </button>
          ))}
        </div>

        <div className="p-6 space-y-4">
          {tab === 'contactos' && (
            <>
              {contactSaved && (
                <div className="bg-green-50 border border-green-200 px-4 py-3 flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <p className="text-green-700 font-bold text-xs">Contactos actualizados com sucesso!</p>
                </div>
              )}

              <div className="space-y-3">
                {/* Telefone */}
                <div>
                  <label className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em] ml-1 mb-1.5 block flex items-center gap-1.5">
                    <Phone className="w-3 h-3" /> Telefone
                  </label>
                  <input
                    value={telefone}
                    onChange={e => setTelefone(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 py-3 px-4 text-sm font-semibold text-[#1a2b4a] focus:border-[#c9a96e] outline-none"
                    placeholder="+351 …"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em] ml-1 mb-1.5 block flex items-center gap-1.5">
                    <Mail className="w-3 h-3" /> Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 py-3 px-4 text-sm font-semibold text-[#1a2b4a] focus:border-[#c9a96e] outline-none"
                    placeholder="empresa@exemplo.com"
                  />
                </div>

                {/* Website */}
                <div>
                  <label className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em] ml-1 mb-1.5 block flex items-center gap-1.5">
                    <Globe className="w-3 h-3" /> Website
                  </label>
                  <input
                    value={website}
                    onChange={e => setWebsite(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 py-3 px-4 text-sm font-semibold text-[#1a2b4a] focus:border-[#c9a96e] outline-none"
                    placeholder="https://…"
                  />
                </div>

                {/* Localização (só leitura) */}
                <div>
                  <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.15em] ml-1 mb-1.5 block flex items-center gap-1.5">
                    <MapPin className="w-3 h-3" /> Localização
                  </label>
                  <div className="w-full bg-gray-100 border border-gray-200 py-3 px-4 text-sm font-semibold text-gray-500">
                    {company.cidade}, {company.pais_nome}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1 ml-1 font-semibold">Para alterar a localização contacte o suporte.</p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={onClose}
                  className="px-6 py-3.5 border border-gray-200 text-gray-400 font-semibold text-sm uppercase hover:border-[#c9a96e] hover:text-[#1a2b4a] transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveContact}
                  disabled={savingContact}
                  className="flex-1 bg-[#0a1628] text-white py-3.5 font-semibold uppercase tracking-[0.15em] text-sm hover:bg-[#0a1628]/90 shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <Check className="w-4 h-4" /> {savingContact ? 'A guardar…' : 'Guardar'}
                </button>
              </div>
            </>
          )}

          {tab === 'senha' && (
            <>
              {/* Login */}
              <div className="bg-gray-50 border border-gray-200 px-4 py-3 flex items-center justify-between">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.15em]">Login</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#1a2b4a] text-sm">{loginDisplay}</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(loginDisplay)}
                    className="p-1.5 bg-gray-200 hover:bg-[#0a1628] hover:text-white text-gray-500 transition-all"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {passError && (
                <div className="bg-red-50 border border-red-100 px-4 py-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <p className="text-red-700 font-bold text-xs">{passError}</p>
                </div>
              )}
              {passSaved && (
                <div className="bg-green-50 border border-green-200 px-4 py-3 flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <p className="text-green-700 font-bold text-xs">Senha alterada com sucesso!</p>
                </div>
              )}

              {/* Senha actual */}
              <div>
                <label className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em] ml-1 mb-1.5 block">Senha Actual</label>
                <div className="relative">
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    value={currentPass}
                    onChange={e => { setCurrentPass(e.target.value); setPassError(null); }}
                    className="w-full bg-gray-50 border border-gray-200 py-3.5 px-4 pr-12 font-bold text-[#1a2b4a] focus:border-[#c9a96e] outline-none text-sm"
                    placeholder="A sua senha actual"
                  />
                  <button type="button" onClick={() => setShowCurrent(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-[#1a2b4a] transition-colors">
                    {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Nova senha */}
              <div>
                <label className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em] ml-1 mb-1.5 block">Nova Senha</label>
                <div className="relative">
                  <input
                    type={showNew ? 'text' : 'password'}
                    placeholder="Mínimo 4 caracteres"
                    value={newPassword}
                    onChange={e => { setNewPassword(e.target.value); setPassError(null); }}
                    className="w-full bg-gray-50 border border-gray-200 py-3.5 px-4 pr-12 font-bold text-[#1a2b4a] focus:border-[#c9a96e] outline-none text-sm"
                  />
                  <button type="button" onClick={() => setShowNew(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-[#1a2b4a] transition-colors">
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirmar */}
              <div>
                <label className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em] ml-1 mb-1.5 block">Confirmar Senha</label>
                <div className="relative">
                  <input
                    type={showConf ? 'text' : 'password'}
                    placeholder="Repita a nova senha"
                    value={confirmPass}
                    onChange={e => { setConfirmPass(e.target.value); setPassError(null); }}
                    className="w-full bg-gray-50 border border-gray-200 py-3.5 px-4 pr-12 font-bold text-[#1a2b4a] focus:border-[#c9a96e] outline-none text-sm"
                  />
                  <button type="button" onClick={() => setShowConf(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-[#1a2b4a] transition-colors">
                    {showConf ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {newPassword.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex gap-1.5">
                    {[0, 1, 2, 3].map(i => (
                      <div key={i} className={`flex-1 h-1.5 transition-all ${i <= strengthLevel ? strengthColors[strengthLevel] : 'bg-gray-100'}`} />
                    ))}
                  </div>
                  <p className="text-[10px] text-gray-400 font-bold text-right">{strengthLabel}</p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={onClose}
                  className="px-6 py-3.5 border border-gray-200 text-gray-400 font-semibold text-sm uppercase hover:border-[#c9a96e] hover:text-[#1a2b4a] transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSavePassword}
                  className="flex-1 bg-[#0a1628] text-white py-3.5 font-semibold uppercase tracking-[0.15em] text-sm hover:bg-[#0a1628]/90 shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  <KeyRound className="w-4 h-4" /> Alterar Senha
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
