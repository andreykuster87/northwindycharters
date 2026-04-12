// src/components/company/RecibosSubTab.tsx
import { useState, useRef } from 'react';
import { FileText, X, AlertCircle, Plus, Send, Paperclip, Download, Eye, Trash2 } from 'lucide-react';
import { uploadDoc } from '../../lib/storage';
import { insertRecibo, deleteRecibo, type StaffMember, type Recibo } from '../../lib/rh';
import { uid } from './RHShared';

interface Props {
  staff:     StaffMember[];
  recibos:   Recibo[];
  setRecibos: React.Dispatch<React.SetStateAction<Recibo[]>>;
  companyId: string;
  onToast:   (msg: string) => void;
}

export function RecibosSubTab({ staff, recibos, setRecibos, companyId, onToast }: Props) {
  const [showNew,   setShowNew]   = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selStaff,  setSelStaff]  = useState<string | null>(null);
  const [form,      setForm]      = useState({ staffId: '', mes: '', valor: '', docUrl: '', docNome: '' });
  const [formErr,   setFormErr]   = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleDocUpload(file: File) {
    setUploading(true);
    try {
      const url = await uploadDoc(file, 'rh', `recibo-${companyId}-${Date.now()}`);
      if (url) setForm(v => ({ ...v, docUrl: url, docNome: file.name }));
    } finally { setUploading(false); }
  }

  async function sendRecibo() {
    if (!form.staffId) { setFormErr('Selecione um funcionário.'); return; }
    if (!form.mes)     { setFormErr('Selecione o mês.'); return; }
    if (!form.valor || isNaN(Number(form.valor)) || Number(form.valor) <= 0) { setFormErr('Informe um valor válido.'); return; }
    setFormErr('');

    const member = staff.find(s => s.id === form.staffId);
    if (!member) return;

    const novo: Recibo = {
      id:        uid(),
      staffId:   form.staffId,
      staffNome: member.nome,
      mes:       form.mes,
      valor:     Number(form.valor),
      docUrl:    form.docUrl || undefined,
      docNome:   form.docNome || undefined,
      status:    'enviado',
      createdAt: new Date().toISOString(),
    };

    setRecibos(prev => [novo, ...prev]);
    await insertRecibo(companyId, novo);
    setShowNew(false);
    setForm({ staffId: '', mes: '', valor: '', docUrl: '', docNome: '' });
    onToast(`💶 Recibo de ${member.nome} enviado!`);
  }

  async function remover(id: string) {
    setRecibos(prev => prev.filter(r => r.id !== id));
    await deleteRecibo(id);
  }

  function fmtMes(mes: string) {
    if (!mes) return '—';
    const [y, m] = mes.split('-');
    return new Date(Number(y), Number(m) - 1).toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' });
  }

  function currency(n: number) {
    return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(n);
  }

  const displayed = selStaff ? recibos.filter(r => r.staffId === selStaff) : recibos;

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-black text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5" /> Recibos de Salário
        </p>
        <p className="text-[10px] text-gray-400 font-bold">Envio de recibos de salário para a equipa</p>
      </div>

      {showNew && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowNew(false)}>
          <div className="bg-white w-full max-w-sm rounded-[28px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
            <div className="bg-blue-900 px-6 py-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest">RH · Recibos</p>
                <h3 className="text-base font-black text-white uppercase italic">Enviar Recibo</h3>
              </div>
              <button onClick={() => setShowNew(false)} className="bg-blue-800 p-2 rounded-full text-white hover:bg-blue-700 transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {formErr && (
                <div className="bg-red-50 border-2 border-red-100 rounded-[14px] px-4 py-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <p className="text-xs font-bold text-red-700">{formErr}</p>
                </div>
              )}
              <div>
                <label className="text-[10px] font-black text-blue-900 uppercase tracking-wider mb-1.5 block">Funcionário *</label>
                {staff.length === 0 ? (
                  <p className="text-xs font-bold text-gray-400 bg-gray-50 border-2 border-gray-100 rounded-[14px] px-4 py-3">
                    Adicione funcionários na aba Equipa primeiro.
                  </p>
                ) : (
                  <select value={form.staffId} onChange={e => setForm(v => ({ ...v, staffId: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-[16px] font-bold text-blue-900 text-sm focus:border-blue-900 outline-none transition-all">
                    <option value="">Selecione…</option>
                    {staff.map(s => <option key={s.id} value={s.id}>{s.nome} — {s.cargo}</option>)}
                  </select>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black text-blue-900 uppercase tracking-wider mb-1.5 block">Mês *</label>
                  <input type="month" value={form.mes} onChange={e => setForm(v => ({ ...v, mes: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-[16px] font-bold text-blue-900 text-sm focus:border-blue-900 outline-none transition-all" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-blue-900 uppercase tracking-wider mb-1.5 block">Salário (€) *</label>
                  <input type="number" min="0" step="0.01" value={form.valor} onChange={e => setForm(v => ({ ...v, valor: e.target.value }))}
                    placeholder="0.00"
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-[16px] font-bold text-blue-900 text-sm focus:border-blue-900 outline-none transition-all" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-blue-900 uppercase tracking-wider mb-1.5 block">Recibo em PDF (opcional)</label>
                {form.docUrl ? (
                  <div className="flex items-center gap-3 bg-green-50 border-2 border-green-100 rounded-[14px] px-4 py-3">
                    <FileText className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <p className="text-xs font-black text-green-800 flex-1 truncate">{form.docNome || 'Documento'}</p>
                    <button onClick={() => setForm(v => ({ ...v, docUrl: '', docNome: '' }))} className="text-red-400 hover:text-red-600 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className={`flex items-center justify-center gap-2 border-2 border-dashed rounded-[14px] px-4 py-4 font-black text-xs uppercase cursor-pointer transition-all ${uploading ? 'border-blue-200 bg-blue-50 text-blue-400' : 'border-gray-200 hover:border-blue-300 bg-gray-50 hover:bg-blue-50 text-gray-400 hover:text-blue-600'}`}>
                    {uploading ? (
                      <><span className="animate-spin w-4 h-4 border-2 border-blue-300 border-t-blue-900 rounded-full" /> A enviar…</>
                    ) : (
                      <><Paperclip className="w-4 h-4" /> Anexar PDF</>
                    )}
                    <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" className="sr-only" disabled={uploading}
                      onChange={e => { const f = e.target.files?.[0]; if (f) handleDocUpload(f); e.target.value = ''; }} />
                  </label>
                )}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowNew(false)}
                  className="px-4 py-3 border-2 border-gray-100 text-gray-400 rounded-[14px] font-black text-xs uppercase hover:border-gray-200 transition-all">
                  Cancelar
                </button>
                <button onClick={sendRecibo} disabled={uploading || staff.length === 0}
                  className="flex-1 bg-blue-900 hover:bg-blue-800 disabled:opacity-40 text-white py-3 rounded-[14px] font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                  <Send className="w-4 h-4" /> Enviar Recibo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {staff.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setSelStaff(null)}
            className={`px-3 py-1.5 rounded-[10px] text-[10px] font-black uppercase transition-all ${!selStaff ? 'bg-blue-900 text-white' : 'bg-gray-50 border-2 border-gray-100 text-gray-500'}`}>
            Todos
          </button>
          {staff.map(s => (
            <button key={s.id} onClick={() => setSelStaff(selStaff === s.id ? null : s.id)}
              className={`px-3 py-1.5 rounded-[10px] text-[10px] font-black uppercase transition-all ${selStaff === s.id ? 'bg-blue-900 text-white' : 'bg-gray-50 border-2 border-gray-100 text-gray-500'}`}>
              {s.nome.split(' ')[0]}
            </button>
          ))}
        </div>
      )}

      {displayed.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-gray-200 rounded-[24px] py-12 text-center">
          <FileText className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="font-black text-gray-300 uppercase italic text-sm">Sem recibos</p>
          <button onClick={() => setShowNew(true)}
            className="mt-4 bg-blue-900 text-white px-6 py-2.5 rounded-[14px] font-black text-xs uppercase hover:bg-blue-800 transition-all flex items-center gap-1.5 mx-auto">
            <Plus className="w-3.5 h-3.5" /> Criar novo envio de rec
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {displayed.map(r => (
            <div key={r.id} className="bg-white border-2 border-gray-100 rounded-[16px] overflow-hidden hover:border-blue-100 transition-all group">
              <div className="px-4 py-3 flex items-center gap-3">
                <div className="w-9 h-9 bg-green-50 rounded-[10px] flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-black text-blue-900 text-sm truncate">{r.staffNome}</p>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full flex-shrink-0 ${r.status === 'visto' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                      {r.status === 'visto' ? <><Eye className="w-2.5 h-2.5 inline" /> Visto</> : 'Enviado'}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-gray-500">{fmtMes(r.mes)}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <p className="font-black text-green-700 text-sm">{currency(r.valor)}</p>
                  <button onClick={() => remover(r.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 hover:text-red-400">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              {r.docUrl && (
                <div className="px-4 pb-3">
                  <a href={r.docUrl} download={r.docNome || 'recibo'} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-amber-50 border-2 border-amber-100 hover:border-amber-300 rounded-[12px] px-3 py-2 transition-all">
                    <FileText className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                    <p className="text-xs font-black text-amber-800 flex-1 truncate">{r.docNome || 'Ver recibo'}</p>
                    <Download className="w-3.5 h-3.5 text-amber-600" />
                  </a>
                </div>
              )}
            </div>
          ))}
          <button onClick={() => setShowNew(true)}
            className="w-full border-2 border-dashed border-blue-200 hover:border-blue-400 bg-blue-50 hover:bg-blue-100 text-blue-700 py-3 rounded-[14px] font-black text-xs uppercase transition-all flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" /> Criar novo envio de rec
          </button>
        </div>
      )}
    </div>
  );
}
