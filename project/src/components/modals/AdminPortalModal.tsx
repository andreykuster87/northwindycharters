// src/components/AdminPortalModal.tsx
import { useState } from 'react';
import { Anchor, User, Users, X, ChevronRight, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TermosModal } from './TermosModal';

import { LOGO_SRC } from '../../assets';

interface Props {
  onSailorLogin:  () => void;
  onClientLogin:  () => void;
  onClose:        () => void;
  onClientReg?:   () => void;
  onSailorReg?:   () => void;
  onCompanyLogin?: () => void;
  onCompanyReg?:  () => void;
}

export function AdminPortalModal({
  onSailorLogin, onClientLogin, onClose, onClientReg, onSailorReg, onCompanyLogin, onCompanyReg,
}: Props) {
  const [criarExpanded, setCriarExpanded] = useState(false);
  const [termosOpen,    setTermosOpen]    = useState(false);
  const navigate = useNavigate();

  return (
    <>
    {termosOpen && (
      <TermosModal
        onClose={() => setTermosOpen(false)}
      />
    )}
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-sm rounded-[32px] shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-300 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="relative flex items-center justify-center px-6 pt-4 pb-3 border-b border-gray-100">
          <img src={LOGO_SRC} alt="NorthWindy" className="h-32 object-contain" />
          <button
            onClick={onClose}
            className="absolute right-5 top-4 w-8 h-8 rounded-full flex items-center justify-center text-gray-300 hover:text-blue-900 hover:bg-blue-50 transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Corpo ── */}
        <div className="px-6 py-6 space-y-3">

          {/* Título */}
          <div className="text-center pb-1">
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
              {criarExpanded ? 'Escolha o seu perfil' : 'Portal de acesso'}
            </p>
          </div>

          {criarExpanded ? (
            /* ── Modo: Escolha de perfil ── */
            <div className="space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="flex gap-2">
                <button
                  onClick={() => { onClose(); onSailorReg?.(); }}
                  className="flex-1 flex flex-col items-center gap-2 bg-blue-50 border-2 border-blue-100 hover:border-blue-900 text-blue-900 px-3 py-5 rounded-2xl font-black text-[11px] transition-all">
                  <Users className="w-5 h-5" />
                  Tripulante
                </button>
                <button
                  onClick={() => { onClose(); onClientReg?.(); }}
                  className="flex-1 flex flex-col items-center gap-2 bg-cyan-50 border-2 border-cyan-100 hover:border-blue-900 text-blue-900 px-3 py-5 rounded-2xl font-black text-[11px] transition-all">
                  <User className="w-5 h-5" />
                  Passageiro
                </button>
                <button
                  onClick={() => { onClose(); onCompanyReg?.(); }}
                  className="flex-1 flex flex-col items-center gap-2 bg-amber-50 border-2 border-amber-100 hover:border-blue-900 text-blue-900 px-3 py-5 rounded-2xl font-black text-[11px] transition-all">
                  <Building2 className="w-5 h-5" />
                  Empresa
                </button>
              </div>

              <button
                onClick={() => setCriarExpanded(false)}
                className="w-full text-center text-gray-400 hover:text-blue-900 text-[11px] font-bold transition-colors pt-1">
                ← Voltar ao login
              </button>
            </div>
          ) : (
            /* ── Modo: Login ── */
            <>
              {/* ── Área do Tripulante ── */}
              <button
                onClick={onSailorLogin}
                className="w-full flex items-center justify-between bg-gray-50 hover:bg-blue-50 border-2 border-gray-100 hover:border-blue-900 px-5 py-4 rounded-2xl transition-all group">
                <div className="flex items-center gap-4">
                  <div className="bg-gray-200 group-hover:bg-blue-900 p-2.5 rounded-full transition-all">
                    <Anchor className="w-5 h-5 text-gray-500 group-hover:text-white transition-all" />
                  </div>
                  <div className="text-left">
                    <p className="font-black text-gray-700 group-hover:text-blue-900 text-sm transition-colors">Área do Tripulante</p>
                    <p className="text-[11px] text-gray-400 font-bold italic">Frota, passeios e agendamentos</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-900 transition-colors" />
              </button>

              {/* ── Área do Passageiro ── */}
              <button
                onClick={onClientLogin}
                className="w-full flex items-center justify-between bg-cyan-50 hover:bg-blue-50 border-2 border-cyan-100 hover:border-blue-900 px-5 py-4 rounded-2xl transition-all group">
                <div className="flex items-center gap-4">
                  <div className="bg-cyan-100 group-hover:bg-blue-900 p-2.5 rounded-full transition-all">
                    <User className="w-5 h-5 text-cyan-600 group-hover:text-white transition-all" />
                  </div>
                  <div className="text-left">
                    <p className="font-black text-gray-700 group-hover:text-blue-900 text-sm transition-colors">Área do Passageiro</p>
                    <p className="text-[11px] text-gray-400 font-bold italic">Reservas e passeios</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-900 transition-colors" />
              </button>

              {/* ── Área da Empresa ── */}
              <button
                onClick={onCompanyLogin}
                className="w-full flex items-center justify-between bg-amber-50 hover:bg-blue-50 border-2 border-amber-100 hover:border-blue-900 px-5 py-4 rounded-2xl transition-all group">
                <div className="flex items-center gap-4">
                  <div className="bg-amber-100 group-hover:bg-blue-900 p-2.5 rounded-full transition-all">
                    <Building2 className="w-5 h-5 text-amber-600 group-hover:text-white transition-all" />
                  </div>
                  <div className="text-left">
                    <p className="font-black text-gray-700 group-hover:text-blue-900 text-sm transition-colors">Área da Empresa</p>
                    <p className="text-[11px] text-gray-400 font-bold italic">Parcerias e gestão comercial</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-900 transition-colors" />
              </button>

              {/* ── Divisor ── */}
              <div className="flex items-center gap-3 py-1">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">ou</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>

              {/* ── Criar conta ── */}
              <p className="text-center text-gray-400 text-[12px] font-bold">
                Ainda não possui conta?{' '}
                <button
                  onClick={() => setCriarExpanded(true)}
                  className="text-blue-700 hover:text-blue-900 font-black underline underline-offset-2 transition-colors">
                  Criar conta agora
                </button>
              </p>
            </>
          )}

          {!criarExpanded && (
            <>
              {/* ── Aviso termos ── */}
              <p className="text-center text-gray-400 text-[10px] font-bold leading-relaxed">
                Ao continuar, concorda com os{' '}
                <button
                  onClick={() => setTermosOpen(true)}
                  className="text-blue-600 hover:text-blue-900 font-black underline underline-offset-1 transition-colors">
                  termos do serviço
                </button>
              </p>

              {/* ── Voltar ── */}
              <button
                onClick={onClose}
                className="w-full text-center text-gray-300 hover:text-gray-500 text-[11px] font-bold transition-colors pt-1">
                Voltar ao site
              </button>
            </>
          )}
        </div>
      </div>
    </div>
    </>
  );
}