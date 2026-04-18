// src/components/pages/ClientProfileView.tsx
// Perfil público read-only de um passageiro/cliente — design NorthWindy.
import { useState } from 'react';
import {
  ArrowLeft, Waves, User, Phone, Mail, Globe,
  Calendar, Flag, CheckCircle2, Clock,
} from 'lucide-react';
import { type Sailor, type Client } from '../../lib/localStore';
import { ProfileSearch } from '../admin/ProfileSearch';
import type { Company } from '../../lib/store/companies';

interface ClientProfileViewProps {
  client:         Client;
  onBack:         () => void;
  onOpenSailor?:  (s: Sailor)  => void;
  onOpenClient?:  (c: Client)  => void;
  onOpenCompany?: (c: Company) => void;
}

export function ClientProfileView({ client: initialClient, onBack, onOpenSailor, onOpenClient, onOpenCompany }: ClientProfileViewProps) {
  const [localClient] = useState<Client>(initialClient);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* ── NAVBAR ── */}
      <nav className="bg-[#0a1628] text-white px-4 py-3 sticky top-0 z-40 shadow-xl border-b border-[#c9a96e]/10">
        <div className="flex items-center gap-3 max-w-6xl mx-auto">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Waves className="w-5 h-5 text-[#c9a96e]" />
            <span className="font-['Playfair_Display'] font-bold italic text-base hidden sm:inline text-white">NorthWindy</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-white text-sm truncate uppercase">{localClient.name}</p>
            <p className="text-[#c9a96e]/60 text-[10px] font-semibold hidden sm:block">
              {localClient.profile_number} · {localClient.country_name}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {(onOpenSailor || onOpenClient || onOpenCompany) && (
              <ProfileSearch
                onOpenSailor={onOpenSailor ?? (() => {})}
                onOpenClient={onOpenClient ?? (() => {})}
                onOpenCompany={onOpenCompany ?? (() => {})}
              />
            )}
            <button onClick={onBack}
              className="bg-white/5 hover:bg-red-600/80 px-4 py-2 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-all flex-shrink-0 border border-white/10">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Voltar</span>
            </button>
          </div>
        </div>
      </nav>

      {/* ── CONTENT AREA ── */}
      <div className="flex flex-1 max-w-6xl mx-auto w-full">

        {/* ── SIDEBAR (desktop) ── */}
        <aside className="hidden md:flex flex-col w-56 flex-shrink-0 py-6 pl-4 pr-3 gap-0">
          {/* Mini card do cliente */}
          <div className="bg-white border-2 border-[#0a1628]/5 p-4 mb-4 shadow-sm">
            <div className="w-14 h-14 border-2 border-[#c9a96e]/20 overflow-hidden bg-[#0a1628]/5 flex items-center justify-center mx-auto mb-3">
              {localClient.profile_photo
                ? <img src={localClient.profile_photo} alt={localClient.name} className="w-full h-full object-cover" />
                : <User className="w-7 h-7 text-[#c9a96e]/40" />
              }
            </div>
            <p className="font-['Playfair_Display'] font-bold text-[#1a2b4a] text-sm text-center uppercase leading-tight">{localClient.name}</p>
            <p className="text-[10px] font-semibold text-[#c9a96e] text-center mt-1">{localClient.profile_number}</p>
            {localClient.status === 'active' && (
              <div className="flex items-center justify-center gap-1 mt-2">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wide">Ativo</span>
              </div>
            )}
            {localClient.status === 'pending_verification' && (
              <div className="flex items-center justify-center gap-1 mt-2">
                <Clock className="w-3 h-3 text-amber-500" />
                <span className="text-[9px] font-bold text-amber-600 uppercase tracking-wide">Em verificação</span>
              </div>
            )}
            {localClient.blocked && (
              <div className="mt-2 pt-2 border-t border-red-200">
                <p className="text-[9px] font-semibold text-red-600 uppercase tracking-wide text-center">Bloqueado</p>
              </div>
            )}
          </div>
        </aside>

        {/* ── MAIN CONTENT (mobile + desktop) ── */}
        <div className="flex-1 py-6 px-4 space-y-5">

          {/* ── Informações pessoais ── */}
          <div className="bg-white border-2 border-[#0a1628]/5 p-5">
            <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em] mb-3">Informações Pessoais</p>
            <div className="space-y-3">
              {[
                { icon: Mail,     label: 'Email',           value: localClient.email },
                { icon: Phone,    label: 'Telefone',        value: localClient.phone },
                { icon: Globe,    label: 'País',            value: localClient.country_name },
                { icon: Flag,     label: 'Código país',     value: localClient.country_code },
                { icon: Calendar, label: 'Data nascimento', value: localClient.birth_date ? new Date(localClient.birth_date).toLocaleDateString('pt-PT') : '—' },
              ].map(row => (
                <div key={row.label} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#0a1628]/5 flex items-center justify-center flex-shrink-0">
                    <row.icon className="w-3.5 h-3.5 text-[#c9a96e]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">{row.label}</p>
                    <p className="text-sm font-bold text-[#1a2b4a] truncate">{row.value}</p>
                  </div>
                </div>
              ))}
              {localClient.language && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#0a1628]/5 flex items-center justify-center flex-shrink-0">
                    <Globe className="w-3.5 h-3.5 text-[#c9a96e]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">Idioma</p>
                    <p className="text-sm font-bold text-[#1a2b4a]">{localClient.language}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Documento de viagem ── */}
          {(localClient.passport_expires || localClient.doc_url) && (
            <div className="bg-white border-2 border-[#0a1628]/5 p-5">
              <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em] mb-3">Documento de Viagem</p>
              <div className="space-y-3">
                {localClient.doc_type && (
                  <div>
                    <p className="text-[9px] font-semibold text-gray-400 uppercase">Tipo</p>
                    <p className="text-sm font-bold text-[#1a2b4a]">{localClient.doc_type}</p>
                  </div>
                )}
                {localClient.passport_number && (
                  <div>
                    <p className="text-[9px] font-semibold text-gray-400 uppercase">Número</p>
                    <p className="text-sm font-bold text-[#1a2b4a]">{localClient.passport_number}</p>
                  </div>
                )}
                {localClient.passport_expires && (
                  <div>
                    <p className="text-[9px] font-semibold text-gray-400 uppercase">Validade</p>
                    <p className="text-sm font-bold text-[#1a2b4a]">{new Date(localClient.passport_expires).toLocaleDateString('pt-PT')}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Status */}
          <div className="bg-white border-2 border-[#0a1628]/5 p-5">
            <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em] mb-3">Estado</p>
            <div className="flex items-center gap-2">
              {localClient.status === 'active' && (
                <>
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-sm font-bold text-emerald-600">Ativo</span>
                </>
              )}
              {localClient.status === 'pending_verification' && (
                <>
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="text-sm font-bold text-amber-600">Em verificação</span>
                </>
              )}
              {localClient.blocked && (
                <>
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-sm font-bold text-red-600">Bloqueado</span>
                  {localClient.block_reason && (
                    <span className="text-xs text-red-500">— {localClient.block_reason}</span>
                  )}
                </>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
