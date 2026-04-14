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
        <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em] flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5" /> Recibos de Salário
        </p>
        <p className="text-[10px] text-gray-400 font-semibold">Envio de recibos de salário para a equipa</p>
      </div>

      {showNew && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowNew(false)}>
          <div className="bg-white w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
            <div className="bg-[#0a1628] px-6 py-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em]">RH · Recibos</p>
                <h3 className="text-base font-['Playfair_Display'] font-bold text-white uppercase italic">Enviar Recibo</h3>
              </div>
              <button onClick={() => setShowNew(false)} className="bg-white/10 p-2 text-white hover:bg-white/20 transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {formErr && (
                <div className="bg-red-50 border border-red-100 px-4 py-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <p className="text-xs font-semibold text-red-700">{formErr}</p>
                </div>
              )}
              <div>
                <label className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em] mb-1.5 block">Funcionário *</label>
                {staff.length === 0 ? (
                  <p className="text-xs font-semibold text-gray-400 bg-gray-50 border border-gray-100 px-4 py-3">
                    Adicione funcionários na aba Equipa primeiro.
                  </p>
                ) : (
                  <select value={form.staffId} onChange={e => setForm(v => ({ ...v, staffId: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 font-semibold text-[#1a2b4a] text-sm focus:border-[#c9a96e] outline-none transition-all">
                    <option value="">Selecione…</option>
                    {staff.map(s => <option key={s.id} value={s.id}>{s.nome} — {s.cargo}</option>)}
                  </select>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em] mb-1.5 block">Mês *</label>
                  <input type="month" value={form.mes} onChange={e => setForm(v => ({ ...v, mes: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 font-semibold text-[#1a2b4a] text-sm focus:border-[#c9a96e] outline-none transition-all" />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em] mb-1.5 block">Salário (€) *</label>
                  <input type="number" min="0" step="0.01" value={form.valor} onChange={e => setForm(v => ({ ...v, valor: e.target.value }))}
                    placeholder="0.00"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 font-semibold text-[#1a2b4a] text-sm focus:border-[#c9a96e] outline-none transition-all" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em] mb-1.5 block">Recibo em PDF (opcional)</label>
                {form.docUrl ? (
                  <div className="flex items-center gap-3 bg-green-50 border border-green-100 px-4 py-3">
                    <FileText className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <p className="text-xs font-semibold text-green-800 flex-1 truncate">{form.docNome || 'Documento'}</p>
                    <button onClick={() => setForm(v => ({ ...v, docUrl: '', docNome: '' }))} className="text-red-400 hover:text-red-600 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className={`flex items-center justify-center gap-2 border-2 border-dashed px-4 py-4 font-semibold text-xs uppercase cursor-pointer transition-all ${uploading ? 'border-[#c9a96e]/30 bg-[#0a1628]/5 text-[#c9a96e]' : 'border-gray-200 hover:border-[#c9a96e]/30 bg-gray-50 hover:bg-[#0a1628]/5 text-gray-400 hover:text-[#1a2b4a]'}`}>
                    {uploading ? (
                      <><span className="animate-spin w-4 h-4 border-2 border-[#c9a96e]/30 border-t-[#0a1628]" /> A enviar…</>
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
                  className="px-4 py-3 border border-gray-200 text-gray-400 font-semibold text-xs uppercase hover:border-[#c9a96e]/30 transition-all">
                  Cancelar
                </button>
                <button onClick={sendRecibo} disabled={uploading || staff.length === 0}
                  className="flex-1 bg-[#0a1628] hover:bg-[#1a2b4a] disabled:opacity-40 text-white py-3 font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2">
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
            className={`px-3 py-1.5 text-[10px] font-semibold uppercase transition-all ${!selStaff ? 'bg-[#0a1628] text-white' : 'bg-gray-50 border border-gray-100 text-gray-500'}`}>
            Todos
          </button>
          {staff.map(s => (
            <button key={s.id} onClick={() => setSelStaff(selStaff === s.id ? null : s.id)}
              className={`px-3 py-1.5 text-[10px] font-semibold uppercase transition-all ${selStaff === s.id ? 'bg-[#0a1628] text-white' : 'bg-gray-50 border border-gray-100 text-gray-500'}`}>
              {s.nome.split(' ')[0]}
            </button>
          ))}
        </div>
      )}

      {displayed.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-gray-200 py-12 text-center">
          <FileText className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="font-semibold text-gray-300 uppercase italic text-sm">Sem recibos</p>
          <button onClick={() => setShowNew(true)}
            className="mt-4 bg-[#0a1628] text-white px-6 py-2.5 font-semibold text-xs uppercase hover:bg-[#1a2b4a] transition-all flex items-center gap-1.5 mx-auto">
            <Plus className="w-3.5 h-3.5" /> Criar novo envio de rec
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {displayed.map(r => (
            <div key={r.id} className="bg-white border border-gray-100 overflow-hidden hover:border-[#c9a96e]/30 transition-all group">
              <div className="px-4 py-3 flex items-center gap-3">
                <div className="w-9 h-9 bg-green-50 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-[#1a2b4a] text-sm truncate">{r.staffNome}</p>
                    <span className={`text-[9px] font-semibold uppercase px-2 py-0.5 flex-shrink-0 ${r.status === 'visto' ? 'bg-green-100 text-green-700' : 'bg-[#c9a96e]/15 text-[#c9a96e]'}`}>
                      {r.status === 'visto' ? <><Eye className="w-2.5 h-2.5 inline" /> Visto</> : 'Enviado'}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-gray-500">{fmtMes(r.mes)}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <p className="font-bold text-green-700 text-sm">{currency(r.valor)}</p>
                  <button onClick={() => remover(r.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 hover:text-red-400">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              {r.docUrl && (
                <div className="px-4 pb-3">
                  <a href={r.docUrl} download={r.docNome || 'recibo'} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-[#c9a96e]/5 border border-[#c9a96e]/20 hover:border-[#c9a96e] px-3 py-2 transition-all">
                    <FileText className="w-3.5 h-3.5 text-[#c9a96e] flex-shrink-0" />
                    <p className="text-xs font-semibold text-[#1a2b4a] flex-1 truncate">{r.docNome || 'Ver recibo'}</p>
                    <Download className="w-3.5 h-3.5 text-[#c9a96e]" />
                  </a>
                </div>
              )}
            </div>
          ))}
          <button onClick={() => setShowNew(true)}
            className="w-full border-2 border-dashed border-[#c9a96e]/30 hover:border-[#c9a96e] bg-[#0a1628]/5 hover:bg-gray-50 text-[#1a2b4a] py-3 font-semibold text-xs uppercase transition-all flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" /> Criar novo envio de rec
          </button>
        </div>
      )}
    </div>
  );
}
