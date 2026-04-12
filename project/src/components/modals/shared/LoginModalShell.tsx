// src/components/modals/shared/LoginModalShell.tsx
// Base UI compartilhada pelos 3 modais de login (client, sailor, company).
// A lógica de autenticação fica no modal específico via prop onSubmit.

import { useState, ReactNode } from 'react';
import { X, Eye, EyeOff, AlertCircle } from 'lucide-react';

interface Props {
  // Conteúdo específico de cada área
  icon:               ReactNode;
  iconBgClass:        string;   // ex: 'bg-blue-900' | 'bg-amber-500'
  title:              string;
  subtitle:           string;
  hint:               ReactNode;
  cardBorderClass:    string;   // ex: 'border-blue-900' | 'border-amber-500'
  loginPlaceholder?:  string;
  passwdPlaceholder?: string;
  inputFocusClass?:   string;   // ex: 'focus:border-blue-900'
  submitClass:        string;   // classes completas do botão Entrar
  submitLabel?:       string;

  // Lógica de auth injetada: retorna null em sucesso, string de erro em falha
  onSubmit: (login: string, password: string) => Promise<string | null>;
  onClose:  () => void;

  // Registo (opcional — sailor não tem)
  onRegister?:         () => void;
  registerLabel?:      string;
  registerBorderClass?: string;
  registerTextClass?:   string;
}

export function LoginModalShell({
  icon, iconBgClass, title, subtitle, hint,
  cardBorderClass,
  loginPlaceholder = 'Login',
  passwdPlaceholder = 'Senha',
  inputFocusClass = 'focus:border-blue-900',
  submitClass,
  submitLabel = 'Entrar',
  onSubmit, onClose,
  onRegister, registerLabel = 'Criar Conta',
  registerBorderClass = 'border-blue-900',
  registerTextClass = 'text-blue-900',
}: Props) {
  const [loginInput, setLoginInput] = useState('');
  const [senhaInput, setSenhaInput] = useState('');
  const [showPass,   setShowPass]   = useState(false);
  const [error,      setError]      = useState<string | null>(null);
  const [loading,    setLoading]    = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const err = await onSubmit(loginInput, senhaInput);
    setLoading(false);
    if (err) setError(err);
  };

  const inputClass = `w-full bg-gray-50 border-2 border-gray-100 rounded-[18px] py-4 px-5 font-bold text-blue-900 ${inputFocusClass} outline-none transition-all text-sm`;
  const labelClass = 'text-[10px] font-black text-blue-900 uppercase tracking-wider ml-1 mb-1.5 block';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-blue-900/60 backdrop-blur-sm">
      <div className={`bg-white rounded-[40px] p-8 max-w-sm w-full shadow-2xl border-4 ${cardBorderClass} animate-in zoom-in-95 duration-300`}>

        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className={`${iconBgClass} p-2.5 rounded-full`}>{icon}</div>
              <h2 className="text-2xl font-black text-blue-900 uppercase italic">{title}</h2>
            </div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest ml-12">{subtitle}</p>
          </div>
          <button onClick={onClose} className="text-gray-300 hover:text-red-500 transition-colors p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hint */}
        <div className="rounded-[20px] px-5 py-3 mb-6">{hint}</div>

        {/* Erro */}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border-2 border-red-200 rounded-[18px] px-4 py-3 mb-5">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p className="text-red-700 font-bold text-xs">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Login</label>
            <input
              type="text"
              placeholder={loginPlaceholder}
              value={loginInput}
              onChange={e => { setLoginInput(e.target.value); setError(null); }}
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className={labelClass}>Senha</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                placeholder={passwdPlaceholder}
                value={senhaInput}
                onChange={e => { setSenhaInput(e.target.value); setError(null); }}
                className={`${inputClass} pr-12`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-blue-900 transition-colors"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-[25px] font-black uppercase tracking-widest text-sm shadow-xl transition-all mt-2 disabled:opacity-60 ${submitClass}`}
          >
            {loading
              ? <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              : submitLabel
            }
          </button>
        </form>

        {/* Registo */}
        {onRegister && (
          <div className="mt-5 pt-5 border-t-2 border-gray-50 text-center">
            <p className="text-xs text-gray-400 font-bold mb-3">Ainda não tem cadastro?</p>
            <button
              onClick={onRegister}
              className={`w-full border-2 ${registerBorderClass} ${registerTextClass} py-3 rounded-[25px] font-black uppercase text-sm hover:bg-gray-50 transition-all`}
            >
              {registerLabel}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
