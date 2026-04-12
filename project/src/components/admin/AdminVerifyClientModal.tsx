// src/components/admin/AdminVerifyClientModal.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Modal de confirmação de verificação de cliente
// + modal de credenciais geradas após aprovação.
// ─────────────────────────────────────────────────────────────────────────────
import { ShieldCheck, Check, Copy } from 'lucide-react';
import type { Client } from '../../lib/localStore';
import { DOC_TYPE_LABELS, stripNonDigits } from '../shared/adminHelpers';

// ── Modal: confirmar verificação ──────────────────────────────────────────────

interface VerifyProps {
  client:        Client;
  loading:       boolean;
  onConfirm:     () => void;
  onClose:       () => void;
}

export function VerifyClientModal({ client, loading, onConfirm, onClose }: VerifyProps) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-blue-900/60 backdrop-blur-md">
      <div className="bg-white rounded-[40px] shadow-2xl border-4 border-blue-900 p-8 max-w-sm w-full">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <ShieldCheck className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-black text-blue-900 uppercase italic text-center mb-2">Verificar Usuário</h3>
        <p className="text-center text-gray-500 font-bold text-sm mb-6">
          Confirma a verificação de <span className="text-blue-900 font-black">{client.name}</span>?
        </p>
        <div className="bg-gray-50 rounded-[20px] p-4 mb-6 space-y-1.5">
          {([
            ['E-mail',     client.email],
            ['WhatsApp',   client.phone || '—'],
            ['Nascimento', (client as any).birth_date || '—'],
            ['Tipo Doc.',  DOC_TYPE_LABELS[(client as any).doc_type || ''] || (client as any).doc_type || '—'],
            ['Documento',  client.passport_number || '—'],
          ] as [string, string][]).map(([l, v]) => (
            <div key={l} className="flex justify-between gap-2">
              <span className="text-gray-400 font-bold text-xs uppercase flex-shrink-0">{l}</span>
              <span className="font-black text-blue-900 text-xs text-right">{v}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 border-2 border-gray-100 text-gray-400 py-4 rounded-[25px] font-black text-sm uppercase hover:border-gray-300 transition-all">
            Cancelar
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 bg-green-600 hover:bg-green-500 text-white py-4 rounded-[25px] font-black text-sm uppercase transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4" /> {loading ? 'Verificando...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Modal: credenciais geradas ────────────────────────────────────────────────

interface CredentialsProps {
  client:  any;
  onClose: () => void;
}

export function ClientCredentialsModal({ client, onClose }: CredentialsProps) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-blue-900/60 backdrop-blur-md">
      <div className="bg-white rounded-[40px] shadow-2xl border-4 border-green-500 p-8 max-w-sm w-full">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-black text-blue-900 uppercase italic text-center mb-1">Usuário Verificado!</h3>
        <p className="text-center text-gray-400 font-bold text-xs mb-5">
          {client.name} foi aprovado com sucesso.
        </p>
        <div className="bg-blue-900 rounded-[20px] p-5 mb-4">
          <p className="text-blue-300 text-[10px] font-black uppercase tracking-widest text-center mb-3">🔑 Credenciais de Acesso</p>
          {([
            ['Login', client.client_login || '—'],
            ['Senha', client.client_password || '0000'],
          ] as [string, string][]).map(([l, v]) => (
            <div key={l} className="flex items-center justify-between bg-blue-800 rounded-[12px] px-4 py-2.5 mb-2 last:mb-0">
              <span className="text-blue-300 text-xs font-bold uppercase">{l}</span>
              <div className="flex items-center gap-2">
                <span className="text-white font-black text-sm">{v}</span>
                <button onClick={() => navigator.clipboard.writeText(v)}
                  className="bg-blue-700 hover:bg-blue-600 text-white p-1 rounded-lg transition-all">
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
        {client.phone && (
          <a
            href={`https://wa.me/${stripNonDigits(client.phone)}?text=${encodeURIComponent(
              'Olá ' + client.name + '! 🌊\n\nSeu cadastro na NorthWindy foi verificado! ✅\n\n🔑 Seus dados de acesso:\nLogin: ' +
              (client.client_login || '—') + '\nSenha: ' + (client.client_password || '0000') +
              '\n\nAcesse: northwindy.com ⛵'
            )}`}
            target="_blank" rel="noreferrer"
            className="w-full bg-green-500 hover:bg-green-400 text-white py-4 rounded-[25px] font-black uppercase text-sm transition-all flex items-center justify-center gap-2 shadow-lg mb-3"
          >
            <span className="text-lg">📲</span> Enviar Credenciais via WhatsApp
          </a>
        )}
        <button onClick={onClose}
          className="w-full border-2 border-gray-100 text-gray-400 py-3 rounded-[25px] font-black text-sm uppercase hover:border-gray-300 transition-all">
          Fechar
        </button>
      </div>
    </div>
  );
}