// src/components/modals/shared/LoginModalShell.tsx
import { useState, ReactNode } from 'react';
import { X, Eye, EyeOff, AlertCircle, AtSign, Lock as LockIcon } from 'lucide-react';
import { LOGO_SRC } from '../../../assets';

interface Props {
  icon:               ReactNode;
  iconBgClass:        string;
  title:              string;
  subtitle:           string;
  hint:               ReactNode;
  accentHue?:         'blue' | 'amber';

  brandTitle?:        string;
  brandTagline?:      string;

  loginPlaceholder?:  string;
  passwdPlaceholder?: string;
  submitLabel?:       string;

  onSubmit:  (login: string, password: string) => Promise<string | null>;
  onClose:   () => void;

  onRegister?:    () => void;
  registerLabel?: string;

  cardBorderClass?:     string;
  inputFocusClass?:     string;
  submitClass?:         string;
  registerBorderClass?: string;
  registerTextClass?:   string;
}

export function LoginModalShell({
  icon, iconBgClass,
  title, subtitle, hint,
  accentHue = 'blue',
  brandTitle   = 'Bem-vindo de Volta!',
  brandTagline = 'Acesse a sua conta e explore o melhor da náutica com a NorthWindy Charters.',
  loginPlaceholder  = 'Login',
  passwdPlaceholder = 'Senha',
  submitLabel       = 'Entrar',
  onSubmit, onClose,
  onRegister, registerLabel = 'Criar Conta',
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

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(4,10,24,0.88)', backdropFilter: 'blur(8px)' }}
    >
      <div className="absolute inset-0" onClick={onClose} />

      <div
        className="relative flex w-full max-w-[700px] overflow-hidden shadow-[0_48px_96px_rgba(0,0,0,0.65)] animate-in zoom-in-95 duration-300"
        style={{ minHeight: '420px' }}
      >
        {/* ════ LEFT — Form (white) ════ */}
        <div className="relative flex-1 bg-white px-8 py-9 flex flex-col">
          {/* gold top line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a96e]/60 to-transparent" />

          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-all z-10"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-1">
              <div className={`${iconBgClass} w-9 h-9 flex items-center justify-center flex-shrink-0`}>
                {icon}
              </div>
              <div>
                <h2 className="font-['Playfair_Display'] font-bold text-xl text-[#1a2b4a] leading-none">{title}</h2>
                <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em] mt-0.5">{subtitle}</p>
              </div>
            </div>
          </div>

          {/* Hint */}
          <div className="mb-5">{hint}</div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 px-4 py-3 mb-4">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-red-700 font-medium text-xs">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3 flex-1">
            <div className="relative">
              <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#c9a96e] pointer-events-none" />
              <input
                type="text"
                placeholder={loginPlaceholder}
                value={loginInput}
                onChange={e => { setLoginInput(e.target.value); setError(null); }}
                className="w-full bg-gray-50 border border-gray-200 pl-11 pr-4 py-3.5 font-medium text-[#1a2b4a] text-sm focus:border-[#c9a96e] focus:outline-none transition-all placeholder:text-gray-400"
                required
              />
            </div>

            <div className="relative">
              <LockIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#c9a96e] pointer-events-none" />
              <input
                type={showPass ? 'text' : 'password'}
                placeholder={passwdPlaceholder}
                value={senhaInput}
                onChange={e => { setSenhaInput(e.target.value); setError(null); }}
                className="w-full bg-gray-50 border border-gray-200 pl-11 pr-12 py-3.5 font-medium text-[#1a2b4a] text-sm focus:border-[#c9a96e] focus:outline-none transition-all placeholder:text-gray-400"
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#c9a96e] transition-colors"
                aria-label={showPass ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 font-semibold uppercase tracking-widest text-sm text-white bg-[#1a2b4a] hover:bg-[#0a1628] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] mt-1"
            >
              {loading
                ? <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : submitLabel}
            </button>
          </form>

          {onRegister && (
            <p className="mt-5 text-sm text-gray-400 text-center">
              Ainda não tem cadastro?{' '}
              <button onClick={onRegister} className="font-semibold text-[#c9a96e] hover:underline transition-all">
                {registerLabel}
              </button>
            </p>
          )}
        </div>

        {/* ════ RIGHT — Brand panel (dark navy) ════ */}
        <div
          className="hidden md:flex w-[260px] flex-col items-center justify-center relative overflow-hidden"
          style={{ background: 'linear-gradient(155deg, #0e2447 0%, #060e1e 100%)' }}
        >
          {/* gold top line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a96e]/60 to-transparent" />
          {/* gold bottom line */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a96e]/30 to-transparent" />

          {/* grid texture */}
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: 'repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 0,transparent 60px),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 0,transparent 60px)' }} />

          {/* glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(201,169,110,0.06) 0%, transparent 70%)' }} />

          <div className="relative z-10 flex flex-col items-center px-7 text-center">
            <img src={LOGO_SRC} alt="NorthWindy Charters" className="h-20 w-auto object-contain mb-6"
              style={{ filter: 'brightness(0) invert(1)' }} />

            <h3 className="font-['Playfair_Display'] font-bold italic text-white text-lg leading-tight mb-3">
              {brandTitle}
            </h3>

            <div className="w-8 h-px bg-[#c9a96e]/60 my-3" />

            <p className="text-xs leading-relaxed font-medium text-[#c9a96e]/70">
              {brandTagline}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
