// src/components/modals/AdminPortalModal.tsx
import { useState } from 'react';
import { Anchor, User, Building2, X, ChevronRight, UserPlus } from 'lucide-react';
import { TermosModal } from './TermosModal';
import { LOGO_SRC } from '../../assets';

interface Props {
  onSailorLogin:   () => void;
  onClientLogin:   () => void;
  onClose:         () => void;
  onClientReg?:    () => void;
  onSailorReg?:    () => void;
  onCompanyLogin?: () => void;
  onCompanyReg?:   () => void;
}

/* ── Card de área (login) ───────────────────────────────────────────────── */
function AreaCard({
  icon, iconBg, title, subtitle, onClick,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 px-4 py-3.5 border border-gray-100 bg-white hover:bg-gray-50 hover:border-[#c9a96e]/30 transition-all duration-200 group text-left active:scale-[0.99]"
    >
      <div className={`${iconBg} w-10 h-10 flex items-center justify-center flex-shrink-0`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-['Playfair_Display'] font-bold text-[#1a2b4a] text-sm leading-none mb-0.5">{title}</p>
        <p className="text-[11px] text-gray-400">{subtitle}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-200 group-hover:text-[#c9a96e] group-hover:translate-x-0.5 transition-all duration-200 flex-shrink-0" />
    </button>
  );
}

/* ── Card de registo (criar conta) ─────────────────────────────────────── */
function RegCard({
  icon, iconBg, label, onClick,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex-1 flex flex-col items-center gap-2.5 px-3 py-5 border border-gray-100 bg-white hover:bg-gray-50 hover:border-[#c9a96e]/30 transition-all duration-200 group active:scale-[0.98]"
    >
      <div className={`${iconBg} w-10 h-10 flex items-center justify-center`}>
        {icon}
      </div>
      <span className="font-medium text-[#1a2b4a] text-[11px] text-center leading-tight">{label}</span>
    </button>
  );
}

/* ── Componente principal ───────────────────────────────────────────────── */
export function AdminPortalModal({
  onSailorLogin, onClientLogin, onClose,
  onClientReg, onSailorReg, onCompanyLogin, onCompanyReg,
}: Props) {
  const [criarExpanded, setCriarExpanded] = useState(false);
  const [termosOpen,    setTermosOpen]    = useState(false);

  return (
    <>
      {termosOpen && <TermosModal onClose={() => setTermosOpen(false)} />}

      {/* ── Overlay ─────────────────────────────────────────────────── */}
      <div
        className="fixed inset-0 z-[150] flex items-center justify-center p-4"
        style={{ background: 'rgba(10,18,36,0.75)', backdropFilter: 'blur(8px)' }}
        onClick={onClose}
      >
        {/* ── Card split-panel ──────────────────────────────────────── */}
        <div
          className="relative flex w-full max-w-[580px] overflow-hidden shadow-2xl"
          onClick={e => e.stopPropagation()}
        >

          {/* ═══ ESQUERDA — Brand navy ═══════════════════════════════ */}
          <div
            className="hidden md:flex w-[200px] flex-shrink-0 flex-col items-center justify-center relative overflow-hidden"
            style={{ background: 'linear-gradient(155deg, #0e2447 0%, #060e1e 100%)' }}
          >
            {/* Gold top line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a96e]/60 to-transparent" />
            {/* Gold bottom line */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a96e]/30 to-transparent" />
            {/* Grid texture */}
            <div className="absolute inset-0 opacity-[0.04]"
              style={{ backgroundImage: 'repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 0,transparent 60px),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 0,transparent 60px)' }} />
            {/* Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(201,169,110,0.06) 0%, transparent 70%)' }} />

            {/* Conteúdo */}
            <div className="relative z-10 flex flex-col items-center px-6 text-center">
              <img
                src={LOGO_SRC}
                alt="NorthWindy Charters"
                className="h-[120px] w-auto object-contain mb-5"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
              <h3 className="font-['Playfair_Display'] font-bold italic text-[15px] text-white leading-tight mb-2">
                {criarExpanded ? 'Criar Conta' : 'Portal de Acesso'}
              </h3>
              <div className="w-8 h-px bg-[#c9a96e]/60 my-2" />
              <p className="text-[11px] text-[#c9a96e]/60 leading-relaxed font-medium">
                {criarExpanded
                  ? 'Escolha o seu perfil para começar.'
                  : 'Selecione a sua área para continuar.'}
              </p>
            </div>
          </div>

          {/* ═══ DIREITA — Conteúdo branco ═══════════════════════════ */}
          <div className="flex-1 bg-white px-6 py-7 flex flex-col relative">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a96e]/40 to-transparent" />

            {/* Botão fechar */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-all z-10"
              aria-label="Fechar"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Logo mobile */}
            <div className="flex md:hidden justify-center mb-5">
              <img src={LOGO_SRC} alt="NorthWindy" className="h-14 object-contain" />
            </div>

            {/* Título */}
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest text-center mb-5">
              {criarExpanded ? 'Escolha o seu perfil' : 'Portal de acesso'}
            </p>

            {criarExpanded ? (
              /* ── Modo: Escolha de perfil de registo ── */
              <div className="animate-in fade-in slide-in-from-top-1 duration-200 space-y-4">
                <div className="flex gap-2">
                  <RegCard
                    icon={<Anchor className="w-5 h-5 text-[#c9a96e]" />}
                    iconBg="bg-[#0a1628]"
                    label="Tripulante"
                    onClick={() => { onClose(); onSailorReg?.(); }}
                  />
                  <RegCard
                    icon={<User className="w-5 h-5 text-[#c9a96e]" />}
                    iconBg="bg-[#0a1628]"
                    label="Passageiro"
                    onClick={() => { onClose(); onClientReg?.(); }}
                  />
                  <RegCard
                    icon={<Building2 className="w-5 h-5 text-[#c9a96e]" />}
                    iconBg="bg-[#0a1628]"
                    label="Empresa"
                    onClick={() => { onClose(); onCompanyReg?.(); }}
                  />
                </div>

                <button
                  onClick={() => setCriarExpanded(false)}
                  className="w-full text-center text-gray-400 hover:text-[#1a2b4a] text-[11px] font-medium transition-colors"
                >
                  ← Voltar ao login
                </button>
              </div>
            ) : (
              /* ── Modo: Seleção de área ── */
              <div className="space-y-2">
                <AreaCard
                  icon={<Anchor className="w-5 h-5 text-[#c9a96e]" />}
                  iconBg="bg-[#0a1628]"
                  title="Área do Tripulante"
                  subtitle="Frota, passeios e agendamentos"
                  onClick={onSailorLogin}
                />
                <AreaCard
                  icon={<User className="w-5 h-5 text-[#c9a96e]" />}
                  iconBg="bg-[#0a1628]"
                  title="Área do Passageiro"
                  subtitle="Reservas e passeios"
                  onClick={onClientLogin}
                />
                <AreaCard
                  icon={<Building2 className="w-5 h-5 text-[#c9a96e]" />}
                  iconBg="bg-[#0a1628]"
                  title="Área da Empresa"
                  subtitle="Parcerias e gestão comercial"
                  onClick={() => onCompanyLogin?.()}
                />

                {/* Divisor */}
                <div className="flex items-center gap-3 py-2">
                  <div className="flex-1 h-px bg-gray-100" />
                  <span className="text-[10px] font-medium text-gray-300 uppercase tracking-widest">ou</span>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>

                {/* Criar conta */}
                <button
                  onClick={() => setCriarExpanded(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 border border-[#c9a96e]/30 bg-white hover:bg-gray-50 hover:border-[#c9a96e] text-[#1a2b4a] font-medium text-sm transition-all duration-200 active:scale-[0.99]"
                >
                  <UserPlus className="w-4 h-4 text-[#c9a96e]" />
                  Criar conta agora
                </button>

                {/* Rodapé */}
                <div className="pt-2 space-y-2 text-center">
                  <p className="text-[10px] text-gray-400 leading-relaxed">
                    Ao continuar, concorda com os{' '}
                    <button
                      onClick={() => setTermosOpen(true)}
                      className="text-[#1a2b4a] hover:underline transition-colors"
                    >
                      termos do serviço
                    </button>
                  </p>
                  <button
                    onClick={onClose}
                    className="text-gray-300 hover:text-gray-500 text-[11px] transition-colors"
                  >
                    Voltar ao site
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}
