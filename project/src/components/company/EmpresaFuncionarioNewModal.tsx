// src/components/company/EmpresaFuncionarioNewModal.tsx
// Modal "Nova Comunicação / Pedido de Férias / Atestado" do EmpresaFuncionarioTab.
import { RefObject } from 'react';
import {
  X, AlertCircle, MessageSquare, Sun, HeartPulse,
  Send, CalendarDays, FileText, Paperclip,
} from 'lucide-react';
import { type Comunicado } from '../../lib/rh';
import { type RequestTipo, type FormState } from './EmpresaFuncionarioShared';

interface Props {
  replyTo:       Comunicado | null;
  requestTipo:   RequestTipo;
  form:          FormState;
  setForm:       React.Dispatch<React.SetStateAction<FormState>>;
  formErr:       string;
  uploading:     boolean;
  fileRef:       RefObject<HTMLInputElement>;
  onClose:       () => void;
  onTipoChange:  (t: RequestTipo) => void;
  onSubmit:      () => void;
  onDocUpload:   (file: File) => void;
}

export function EmpresaFuncionarioNewModal({
  replyTo, requestTipo, form, setForm, formErr, uploading,
  fileRef, onClose, onTipoChange, onSubmit, onDocUpload,
}: Props) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ background: 'rgba(4,10,24,0.88)', backdropFilter: 'blur(8px)' }} onClick={onClose}>
      <div className="bg-white w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col border border-[#c9a96e]/30" onClick={e => e.stopPropagation()}>
        <div className={`px-6 py-5 flex items-center justify-between flex-shrink-0 border-b border-[#c9a96e] ${requestTipo === 'atestado' ? 'bg-amber-500' : requestTipo === 'ferias' ? 'bg-teal-600' : 'bg-[#0a1628]'}`}
          style={{ backgroundImage: requestTipo === 'mensagem' ? 'repeating-linear-gradient(0deg,transparent,transparent 24px,rgba(201,169,110,0.04) 24px,rgba(201,169,110,0.04) 25px),repeating-linear-gradient(90deg,transparent,transparent 24px,rgba(201,169,110,0.04) 24px,rgba(201,169,110,0.04) 25px)' : undefined }}>
          <div>
            <p className="text-[10px] font-semibold text-white/60 uppercase tracking-[0.15em]">
              {replyTo ? 'Responder' : 'Nova Comunicação'}
            </p>
            <h3 className="text-base font-['Playfair_Display'] font-bold text-white">
              {replyTo ? `↩ ${replyTo.titulo}` : requestTipo === 'ferias' ? 'Pedido de Férias' : requestTipo === 'atestado' ? 'Apresentar Atestado' : 'Mensagem à Empresa'}
            </h3>
          </div>
          <button onClick={onClose} className="bg-black/20 p-2 text-white hover:bg-black/30 transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {formErr && (
            <div className="bg-red-50 border border-red-100 px-4 py-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-xs font-bold text-red-700">{formErr}</p>
            </div>
          )}

          {/* Tipo (só se não for resposta) */}
          {!replyTo && (
            <div>
              <label className="text-[10px] font-semibold text-[#1a2b4a] uppercase tracking-[0.15em] mb-2 block">Tipo</label>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { key: 'mensagem' as const, icon: <MessageSquare className="w-3.5 h-3.5" />, label: 'Mensagem', color: 'bg-[#0a1628] border-[#0a1628] text-white', inactive: 'bg-gray-50 border-gray-100 text-gray-500 hover:border-[#c9a96e]/30' },
                  { key: 'ferias'   as const, icon: <Sun className="w-3.5 h-3.5" />,            label: 'Férias',   color: 'bg-teal-600 border-teal-600 text-white',  inactive: 'bg-gray-50 border-gray-100 text-gray-500 hover:border-teal-300' },
                  { key: 'atestado' as const, icon: <HeartPulse className="w-3.5 h-3.5" />,     label: 'Atestado', color: 'bg-amber-500 border-amber-500 text-white',  inactive: 'bg-gray-50 border-gray-100 text-gray-500 hover:border-amber-300' },
                ] as const).map(t => (
                  <button key={t.key} type="button" onClick={() => onTipoChange(t.key)}
                    className={`flex flex-col items-center gap-1 py-2.5 font-semibold text-[10px] border transition-all ${requestTipo === t.key ? t.color : t.inactive}`}>
                    {t.icon}{t.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Datas para férias/atestado */}
          {(requestTipo === 'ferias' || requestTipo === 'atestado') && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-semibold text-[#1a2b4a] uppercase tracking-[0.15em] mb-1.5 block">Início *</label>
                <input type="date" value={form.inicio} onChange={e => setForm(v => ({ ...v, inicio: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 font-bold text-[#1a2b4a] text-sm focus:border-[#c9a96e] outline-none transition-all" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-[#1a2b4a] uppercase tracking-[0.15em] mb-1.5 block">Fim *</label>
                <input type="date" value={form.fim} min={form.inicio} onChange={e => setForm(v => ({ ...v, fim: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 font-bold text-[#1a2b4a] text-sm focus:border-[#c9a96e] outline-none transition-all" />
              </div>
            </div>
          )}

          {/* Assunto (apenas para mensagem) */}
          {requestTipo === 'mensagem' && (
            <div>
              <label className="text-[10px] font-semibold text-[#1a2b4a] uppercase tracking-[0.15em] mb-1.5 block">Assunto *</label>
              <input value={form.titulo} onChange={e => setForm(v => ({ ...v, titulo: e.target.value }))}
                placeholder="Ex: Dúvida sobre horário"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 font-bold text-[#1a2b4a] text-sm focus:border-[#c9a96e] outline-none transition-all" />
            </div>
          )}

          {/* Mensagem/observações */}
          <div>
            <label className="text-[10px] font-semibold text-[#1a2b4a] uppercase tracking-[0.15em] mb-1.5 block">
              {requestTipo === 'ferias' || requestTipo === 'atestado' ? 'Observações (opcional)' : 'Mensagem'}
            </label>
            <textarea value={form.corpo} onChange={e => setForm(v => ({ ...v, corpo: e.target.value }))} rows={requestTipo === 'mensagem' ? 5 : 3}
              placeholder={requestTipo === 'ferias' ? 'Motivo ou notas adicionais…' : requestTipo === 'atestado' ? 'Informação adicional…' : 'Escreva a sua mensagem aqui…'}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 font-bold text-[#1a2b4a] text-sm focus:border-[#c9a96e] outline-none resize-none transition-all" />
          </div>

          {/* Anexo (só para mensagem e atestado) */}
          {(requestTipo === 'mensagem' || requestTipo === 'atestado') && (
            <div>
              <label className="text-[10px] font-semibold text-[#1a2b4a] uppercase tracking-[0.15em] mb-1.5 block">
                {requestTipo === 'atestado' ? 'Documento do Atestado (opcional)' : 'Documento / Anexo (opcional)'}
              </label>
              {form.docUrl ? (
                <div className="flex items-center gap-3 bg-green-50 border border-green-100 px-4 py-3">
                  <FileText className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <p className="text-xs font-bold text-green-800 flex-1 truncate">{form.docNome || 'Documento'}</p>
                  <button onClick={() => setForm(v => ({ ...v, docUrl: '', docNome: '' }))} className="text-red-400 hover:text-red-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className={`flex items-center justify-center gap-2 border border-dashed px-4 py-4 font-semibold text-xs uppercase cursor-pointer transition-all ${uploading ? 'border-[#c9a96e]/30 bg-[#0a1628]/5 text-[#c9a96e]' : 'border-gray-200 hover:border-[#c9a96e]/30 bg-gray-50 hover:bg-[#0a1628]/5 text-gray-400 hover:text-[#1a2b4a]'}`}>
                  {uploading
                    ? <><span className="animate-spin w-4 h-4 border-2 border-[#c9a96e]/30 border-t-[#0a1628]" /> A enviar…</>
                    : <><Paperclip className="w-4 h-4" /> Selecionar ficheiro</>
                  }
                  <input ref={fileRef} type="file" className="sr-only" disabled={uploading}
                    onChange={e => { const f = e.target.files?.[0]; if (f) onDocUpload(f); e.target.value = ''; }} />
                </label>
              )}
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button onClick={onClose}
              className="px-4 py-3 border border-gray-200 text-gray-400 font-semibold text-xs uppercase hover:border-gray-300 transition-all">
              Cancelar
            </button>
            <button onClick={onSubmit} disabled={uploading}
              className={`flex-1 disabled:opacity-40 text-white py-3 font-semibold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${requestTipo === 'atestado' ? 'bg-amber-500 hover:bg-amber-400' : requestTipo === 'ferias' ? 'bg-teal-600 hover:bg-teal-500' : 'bg-[#0a1628] hover:bg-[#0a1628]/90'}`}>
              {requestTipo === 'ferias'
                ? <><CalendarDays className="w-4 h-4" /> Solicitar Férias</>
                : requestTipo === 'atestado'
                ? <><HeartPulse className="w-4 h-4" /> Enviar Atestado</>
                : <><Send className="w-4 h-4" /> Enviar</>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
