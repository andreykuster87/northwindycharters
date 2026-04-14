// src/components/AdminDashboard/shared/DeleteConfirmModal.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Modal de exclusão com dupla confirmação (step 1 → aviso, step 2 → confirmar).
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from 'react';
import {
  deleteSailor,
  deleteClient,
  getSailors,
  getClients,
  type Sailor,
  type Client,
} from '../../lib/localStore';

// ── Tipos ─────────────────────────────────────────────────────────────────────

export interface DeleteTarget {
  id:   string;
  role: 'sailor' | 'client';
  name: string;
}

interface DeleteConfirmModalProps {
  target: DeleteTarget;
  onClose:   () => void;
  /** Chamado após exclusão efectiva — passa as listas actualizadas */
  onDeleted: (sailors: Sailor[], clients: Client[]) => void;
}

// ── Componente ────────────────────────────────────────────────────────────────

export function DeleteConfirmModal({ target, onClose, onDeleted }: DeleteConfirmModalProps) {
  const [step, setStep] = useState<1 | 2>(1);

  const isSailor = target.role === 'sailor';

  function handleDelete() {
    if (isSailor) {
      deleteSailor(target.id);
    } else {
      deleteClient(target.id);
    }
    onDeleted(getSailors(), getClients());
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-red-900/60 backdrop-blur-md">
      <div className="bg-white w-full max-w-sm shadow-2xl border-4 border-red-500 animate-in zoom-in-95 duration-300 overflow-hidden">

        {/* Cabeçalho — keeps red as semantic danger color */}
        <div className="bg-red-500 px-8 py-6 text-center">
          <div className="text-4xl mb-2">⚠️</div>
          <h3 className="text-xl font-semibold text-white uppercase">
            {step === 1 ? 'Excluir Cadastro?' : 'Tem a certeza absoluta?'}
          </h3>
          <p className="text-red-200 text-xs font-bold mt-1 uppercase tracking-[0.15em]">
            {target.name}
          </p>
        </div>

        <div className="p-8 space-y-5">

          {/* ── Step 1: aviso ── */}
          {step === 1 && (
            <>
              <div className="bg-red-50 border border-red-100 p-4 space-y-2">
                <p className="font-semibold text-red-800 text-sm text-center">
                  Esta acção irá remover permanentemente:
                </p>
                <ul className="space-y-1.5">
                  {[
                    '📋 Todos os dados pessoais',
                    '🪪 Documentos enviados',
                    '📨 Histórico de mensagens',
                    isSailor
                      ? '⚓ Perfil de comandante e acesso'
                      : '🎟️ Histórico de reservas associado',
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs font-bold text-red-700">
                      <span className="w-1.5 h-1.5 bg-red-400 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <p className="text-gray-500 font-bold text-xs text-center">
                Esta acção <strong>não pode ser desfeita</strong>.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 border border-gray-200 text-gray-500 hover:border-gray-300 py-4 font-semibold text-sm uppercase transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 bg-red-500 hover:bg-red-400 text-white py-4 font-semibold text-sm uppercase transition-all shadow-lg"
                >
                  Continuar →
                </button>
              </div>
            </>
          )}

          {/* ── Step 2: confirmação final ── */}
          {step === 2 && (
            <>
              <div className="bg-red-900 p-5 text-center space-y-2">
                <p className="text-red-300 text-[10px] font-semibold uppercase tracking-[0.15em]">
                  Confirmação final
                </p>
                <p className="text-white font-semibold text-base">
                  Excluir definitivamente o cadastro de
                </p>
                <p className="text-red-200 font-semibold text-xl uppercase">
                  {target.name}
                </p>
                <p className="text-red-400 text-xs font-bold">
                  {isSailor ? '⚓ Comandante' : '👤 Usuário'}
                </p>
              </div>

              <p className="text-gray-500 font-bold text-xs text-center leading-relaxed">
                Após confirmar,{' '}
                <strong>todos os dados serão removidos</strong> permanentemente do sistema.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 border border-gray-200 text-gray-500 hover:border-gray-300 py-4 font-semibold text-sm uppercase transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 bg-red-600 hover:bg-red-500 text-white py-4 font-semibold text-sm uppercase transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  🗑️ Excluir Definitivamente
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
