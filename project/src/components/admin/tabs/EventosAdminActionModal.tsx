// src/components/admin/tabs/EventosAdminActionModal.tsx
// Modal de aprovação / análise / rejeição de um evento.
import { useState } from 'react';
import { XCircle, Eye, CheckCircle2, Trash2 } from 'lucide-react';
import { type NauticEvent } from '../../../lib/localStore';
import { fmtDate, STATUS_MAP, REJECT_REASONS } from './EventosAdminShared';

interface Props {
  ev:         NauticEvent;
  onClose:    () => void;
  onApprove:  () => void;
  onAnalysis: (notes: string) => void;
  onReject:   (reason: string) => void;
}

export function EventosAdminActionModal({ ev, onClose, onApprove, onAnalysis, onReject }: Props) {
  const [mode,    setMode]    = useState<'view' | 'analysis' | 'reject'>('view');
  const [notes,   setNotes]   = useState('');
  const [reason,  setReason]  = useState('');
  const [customR, setCustomR] = useState('');

  const finalReason = reason === 'Outro motivo' ? customR : reason;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-blue-900/60 backdrop-blur-sm"
      onClick={onClose}>
      <div className="bg-white rounded-[28px] shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}>

        {/* Header evento */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-700 px-6 py-5 rounded-t-[28px]">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black text-blue-300 uppercase tracking-wider mb-0.5">{ev.company_name}</p>
              <h3 className="text-base font-black text-white uppercase italic leading-tight">{ev.title}</h3>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${STATUS_MAP[ev.status].cls}`}>
                  {STATUS_MAP[ev.status].label}
                </span>
                <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{ev.tipo}</span>
              </div>
            </div>
            <button onClick={onClose} className="bg-white/20 hover:bg-white/30 p-2 rounded-full text-white transition-all flex-shrink-0">
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Detalhes */}
          {mode === 'view' && (
            <>
              <div className="grid grid-cols-2 gap-2">
                {[
                  ['Data',    fmtDate(ev.date)],
                  ['Hora',    ev.time],
                  ['Local',   ev.local],
                  ['Cidade',  ev.cidade],
                  ['Vagas',   String(ev.vagas)],
                  ['Preço',   ev.preco === 0 ? 'Gratuito' : ev.preco ? `€${ev.preco}` : '—'],
                ].map(([l, v]) => (
                  <div key={l} className="bg-gray-50 rounded-[12px] px-3 py-2.5">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">{l}</p>
                    <p className="text-sm font-black text-blue-900 mt-0.5 truncate">{v}</p>
                  </div>
                ))}
              </div>

              {ev.description && (
                <div className="bg-blue-50 rounded-[14px] px-4 py-3">
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-wider mb-1">Descrição</p>
                  <p className="text-xs font-bold text-blue-900 leading-relaxed">{ev.description}</p>
                </div>
              )}

              {ev.reject_reason && (
                <div className="bg-red-50 border-2 border-red-100 rounded-[14px] px-4 py-3">
                  <p className="text-[10px] font-black text-red-500 uppercase tracking-wider mb-1">Motivo da Reprovação</p>
                  <p className="text-xs font-bold text-red-700">{ev.reject_reason}</p>
                </div>
              )}
              {ev.admin_notes && (
                <div className="bg-amber-50 border-2 border-amber-100 rounded-[14px] px-4 py-3">
                  <p className="text-[10px] font-black text-amber-600 uppercase tracking-wider mb-1">Notas Admin</p>
                  <p className="text-xs font-bold text-amber-800">{ev.admin_notes}</p>
                </div>
              )}

              {/* Botões de acção — só para pending/analysis */}
              {(ev.status === 'pending' || ev.status === 'analysis') && (
                <div className="grid grid-cols-3 gap-2 pt-2">
                  <button onClick={onApprove}
                    className="bg-green-600 hover:bg-green-500 text-white py-3 rounded-[14px] font-black text-xs uppercase transition-all flex flex-col items-center gap-1 shadow-md">
                    <CheckCircle2 className="w-4 h-4" /> Aprovar
                  </button>
                  <button onClick={() => setMode('analysis')}
                    className="bg-blue-100 hover:bg-blue-200 text-blue-900 py-3 rounded-[14px] font-black text-xs uppercase transition-all flex flex-col items-center gap-1">
                    <Eye className="w-4 h-4" /> Análise
                  </button>
                  <button onClick={() => setMode('reject')}
                    className="bg-red-100 hover:bg-red-200 text-red-700 py-3 rounded-[14px] font-black text-xs uppercase transition-all flex flex-col items-center gap-1">
                    <XCircle className="w-4 h-4" /> Reprovar
                  </button>
                </div>
              )}
              {ev.status === 'approved' && (
                <button onClick={() => setMode('reject')}
                  className="w-full mt-2 bg-red-50 hover:bg-red-100 border-2 border-red-100 text-red-600 py-3 rounded-[14px] font-black text-xs uppercase transition-all flex items-center justify-center gap-2">
                  <Trash2 className="w-3.5 h-3.5" /> Cancelar / Remover Evento
                </button>
              )}
            </>
          )}

          {/* Modo análise */}
          {mode === 'analysis' && (
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-[14px] px-4 py-3">
                <p className="text-xs font-bold text-blue-800">
                  Coloque o evento em análise e envie uma nota para a empresa explicando o que falta ou o que será verificado.
                </p>
              </div>
              <div>
                <label className="text-[10px] font-black text-blue-900 uppercase tracking-wider ml-1 mb-1.5 block">Nota para a empresa</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4}
                  placeholder="Ex: Precisamos verificar o local e os dados de segurança do evento…"
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-[14px] py-3 px-4 font-bold text-blue-900 text-sm focus:border-blue-900 outline-none resize-none" />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setMode('view')} className="flex-1 border-2 border-gray-100 text-gray-500 py-3 rounded-[14px] font-black text-xs uppercase">Voltar</button>
                <button onClick={() => onAnalysis(notes)}
                  className="flex-1 bg-blue-700 hover:bg-blue-600 text-white py-3 rounded-[14px] font-black text-xs uppercase transition-all shadow-md">
                  Enviar para Análise
                </button>
              </div>
            </div>
          )}

          {/* Modo rejeição */}
          {mode === 'reject' && (
            <div className="space-y-4">
              <div className="bg-red-50 rounded-[14px] px-4 py-3">
                <p className="text-xs font-bold text-red-800">
                  Selecione o motivo da reprovação. A empresa será notificada automaticamente.
                </p>
              </div>
              <div className="space-y-2">
                {REJECT_REASONS.map(r => (
                  <button key={r} onClick={() => setReason(r)}
                    className={`w-full text-left px-4 py-3 rounded-[12px] border-2 font-bold text-xs transition-all ${
                      reason === r ? 'bg-red-50 border-red-400 text-red-700' : 'bg-gray-50 border-gray-100 text-gray-600 hover:border-red-200'
                    }`}>
                    {reason === r && '✓ '}{r}
                  </button>
                ))}
              </div>
              {reason === 'Outro motivo' && (
                <div>
                  <label className="text-[10px] font-black text-blue-900 uppercase tracking-wider ml-1 mb-1.5 block">Descreva o motivo</label>
                  <textarea value={customR} onChange={e => setCustomR(e.target.value)} rows={3}
                    placeholder="Explique o motivo…"
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-[14px] py-3 px-4 font-bold text-blue-900 text-sm focus:border-blue-900 outline-none resize-none" />
                </div>
              )}
              <div className="flex gap-2">
                <button onClick={() => setMode('view')} className="flex-1 border-2 border-gray-100 text-gray-500 py-3 rounded-[14px] font-black text-xs uppercase">Voltar</button>
                <button onClick={() => finalReason && onReject(finalReason)}
                  disabled={!finalReason}
                  className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white py-3 rounded-[14px] font-black text-xs uppercase transition-all shadow-md">
                  Reprovar Evento
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
