// src/components/company/FeriasSubTab.tsx
import { useState } from 'react';
import { CalendarDays, Bell, AlertCircle, X, Check, Clock, CheckCircle2, XCircle, Trash2, Plus, Calendar } from 'lucide-react';
import { insertFerias, updateFeriasStatus, deleteFerias, type StaffMember, type FeriasRequest } from '../../lib/rh';
import { Avatar, fmtDateShort, diffDays, uid } from './RHShared';

interface Props {
  staff:     StaffMember[];
  ferias:    FeriasRequest[];
  setFerias: React.Dispatch<React.SetStateAction<FeriasRequest[]>>;
  companyId: string;
  onToast:   (msg: string) => void;
}

export function FeriasSubTab({ staff, ferias, setFerias, companyId, onToast }: Props) {
  const [showNew,  setShowNew]  = useState(false);
  const [filter,   setFilter]   = useState<'todas' | 'pendente' | 'aprovada' | 'recusada'>('todas');
  const [form,     setForm]     = useState({ staffId: '', inicio: '', fim: '', motivo: '', resposta: '' });
  const [formErr,  setFormErr]  = useState('');
  const [respId,   setRespId]   = useState<string | null>(null);
  const [respText, setRespText] = useState('');

  const pendentes = ferias.filter(f => f.status === 'pendente');

  async function createFerias() {
    if (!form.staffId) { setFormErr('Selecione um funcionário.'); return; }
    if (!form.inicio)  { setFormErr('Informe a data de início.'); return; }
    if (!form.fim)     { setFormErr('Informe a data de fim.'); return; }
    if (form.fim < form.inicio) { setFormErr('Data de fim deve ser após o início.'); return; }
    setFormErr('');

    const member = staff.find(s => s.id === form.staffId);
    if (!member) return;

    const req: FeriasRequest = {
      id:          uid(),
      staffId:     form.staffId,
      staffNome:   member.nome,
      dataInicio:  form.inicio,
      dataFim:     form.fim,
      motivo:      form.motivo || undefined,
      status:      'aprovada',
      iniciadoPor: 'empresa',
      createdAt:   new Date().toISOString(),
    };

    setFerias(prev => [req, ...prev]);
    await insertFerias(companyId, req);
    setShowNew(false);
    setForm({ staffId: '', inicio: '', fim: '', motivo: '', resposta: '' });
    onToast(`✅ Férias de ${member.nome} registadas!`);
  }

  async function aprovar(id: string) {
    const txt = respText || undefined;
    setFerias(prev => prev.map(f => f.id === id ? { ...f, status: 'aprovada', resposta: txt } : f));
    await updateFeriasStatus(id, 'aprovada', txt);
    setRespId(null); setRespText('');
    onToast('✅ Férias aprovadas!');
  }

  async function recusar(id: string) {
    const txt = respText || undefined;
    setFerias(prev => prev.map(f => f.id === id ? { ...f, status: 'recusada', resposta: txt } : f));
    await updateFeriasStatus(id, 'recusada', txt);
    setRespId(null); setRespText('');
    onToast('❌ Férias recusadas.');
  }

  async function remover(id: string) {
    setFerias(prev => prev.filter(f => f.id !== id));
    await deleteFerias(id);
  }

  const filtered = filter === 'todas' ? ferias : ferias.filter(f => f.status === filter);

  const STATUS_CLS: Record<string, string> = {
    pendente:  'bg-amber-100 text-amber-700',
    aprovada:  'bg-green-100 text-green-700',
    recusada:  'bg-red-100 text-red-600',
  };
  const STATUS_ICON: Record<string, React.ReactNode> = {
    pendente:  <Clock className="w-3.5 h-3.5" />,
    aprovada:  <CheckCircle2 className="w-3.5 h-3.5" />,
    recusada:  <XCircle className="w-3.5 h-3.5" />,
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-black text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
          <CalendarDays className="w-3.5 h-3.5" /> Férias
        </p>
        <p className="text-[10px] text-gray-400 font-bold">Controlo de férias e ausências</p>
      </div>

      {pendentes.length > 0 && (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-[16px] px-4 py-3 flex items-center gap-3">
          <Bell className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <p className="text-xs font-black text-amber-800">
            {pendentes.length} pedido{pendentes.length !== 1 ? 's' : ''} de férias aguarda{pendentes.length !== 1 ? 'm' : ''} aprovação
          </p>
        </div>
      )}

      {showNew && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowNew(false)}>
          <div className="bg-white w-full max-w-sm rounded-[28px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
            <div className="bg-blue-900 px-6 py-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest">RH · Férias</p>
                <h3 className="text-base font-black text-white uppercase italic">Marcar Férias</h3>
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
                  <label className="text-[10px] font-black text-blue-900 uppercase tracking-wider mb-1.5 block">Início *</label>
                  <input type="date" value={form.inicio} onChange={e => setForm(v => ({ ...v, inicio: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-[16px] font-bold text-blue-900 text-sm focus:border-blue-900 outline-none transition-all" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-blue-900 uppercase tracking-wider mb-1.5 block">Fim *</label>
                  <input type="date" value={form.fim} onChange={e => setForm(v => ({ ...v, fim: e.target.value }))}
                    min={form.inicio}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-[16px] font-bold text-blue-900 text-sm focus:border-blue-900 outline-none transition-all" />
                </div>
              </div>
              {form.inicio && form.fim && form.fim >= form.inicio && (
                <div className="bg-blue-50 border-2 border-blue-100 rounded-[14px] px-4 py-2.5 flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-blue-500" />
                  <p className="text-xs font-black text-blue-700">{diffDays(form.inicio, form.fim)} dia{diffDays(form.inicio, form.fim) !== 1 ? 's' : ''} de férias</p>
                </div>
              )}
              <div>
                <label className="text-[10px] font-black text-blue-900 uppercase tracking-wider mb-1.5 block">Motivo</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {(['Férias Programadas', 'Atestado Médico', 'Folga', 'Outro'] as const).map(preset => (
                    <button key={preset} type="button"
                      onClick={() => setForm(v => ({ ...v, motivo: v.motivo === preset ? '' : preset }))}
                      className={`px-3 py-1.5 rounded-[10px] text-[10px] font-black uppercase transition-all border-2 ${form.motivo === preset ? 'bg-blue-900 text-white border-blue-900' : 'bg-gray-50 border-gray-100 text-gray-500 hover:border-blue-200'}`}>
                      {preset}
                    </button>
                  ))}
                </div>
                <textarea value={form.motivo} onChange={e => setForm(v => ({ ...v, motivo: e.target.value }))} rows={2}
                  placeholder="Ou escreva um motivo personalizado…"
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-[16px] font-bold text-blue-900 text-sm focus:border-blue-900 outline-none resize-none transition-all" />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowNew(false)}
                  className="px-4 py-3 border-2 border-gray-100 text-gray-400 rounded-[14px] font-black text-xs uppercase hover:border-gray-200 transition-all">
                  Cancelar
                </button>
                <button onClick={createFerias} disabled={staff.length === 0}
                  className="flex-1 bg-blue-900 hover:bg-blue-800 disabled:opacity-40 text-white py-3 rounded-[14px] font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                  <Check className="w-4 h-4" /> Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        {(['todas', 'pendente', 'aprovada', 'recusada'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-[10px] text-[10px] font-black uppercase transition-all ${filter === f ? 'bg-blue-900 text-white' : 'bg-gray-50 border-2 border-gray-100 text-gray-500'}`}>
            {f}
            {f === 'pendente' && pendentes.length > 0 && (
              <span className="ml-1 bg-amber-400 text-blue-900 text-[8px] font-black w-3.5 h-3.5 rounded-full inline-flex items-center justify-center">{pendentes.length}</span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-gray-200 rounded-[24px] py-12 text-center">
          <CalendarDays className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="font-black text-gray-300 uppercase italic text-sm">Sem registos de férias</p>
          <button onClick={() => setShowNew(true)}
            className="mt-4 bg-blue-900 text-white px-6 py-2.5 rounded-[14px] font-black text-xs uppercase hover:bg-blue-800 transition-all flex items-center gap-1.5 mx-auto">
            <Plus className="w-3.5 h-3.5" /> + Marcar férias
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(f => (
            <div key={f.id} className="bg-white border-2 border-gray-100 rounded-[18px] overflow-hidden hover:border-blue-100 transition-all">
              <div className="px-4 py-3 flex items-center gap-3">
                <Avatar nome={f.staffNome} size={9} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-black text-blue-900 text-sm truncate">{f.staffNome}</p>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1 ${STATUS_CLS[f.status]}`}>
                      {STATUS_ICON[f.status]} {f.status}
                    </span>
                    {f.iniciadoPor === 'funcionario' && (
                      <span className="text-[9px] font-black bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Pedido</span>
                    )}
                  </div>
                  <p className="text-xs font-bold text-gray-500 flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3 h-3" />
                    {fmtDateShort(f.dataInicio)} → {fmtDateShort(f.dataFim)}
                    <span className="text-gray-400">· {diffDays(f.dataInicio, f.dataFim)} dias</span>
                  </p>
                  {f.motivo && <p className="text-[10px] text-gray-400 font-bold mt-0.5 truncate">{f.motivo}</p>}
                  {f.resposta && <p className="text-[10px] text-blue-600 font-bold mt-0.5 truncate">Resp: {f.resposta}</p>}
                </div>
                <button onClick={() => remover(f.id)} className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0 p-1">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {f.status === 'pendente' && (
                <div className="px-4 pb-3">
                  {respId === f.id ? (
                    <div className="space-y-2">
                      <input value={respText} onChange={e => setRespText(e.target.value)}
                        placeholder="Mensagem para o funcionário (opcional)…"
                        className="w-full px-3 py-2 bg-gray-50 border-2 border-gray-100 rounded-[12px] font-bold text-blue-900 text-xs focus:border-blue-900 outline-none" />
                      <div className="flex gap-2">
                        <button onClick={() => recusar(f.id)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-red-50 hover:bg-red-100 border-2 border-red-100 text-red-600 rounded-[10px] font-black text-[10px] uppercase transition-all">
                          <XCircle className="w-3.5 h-3.5" /> Recusar
                        </button>
                        <button onClick={() => aprovar(f.id)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-green-50 hover:bg-green-100 border-2 border-green-100 text-green-700 rounded-[10px] font-black text-[10px] uppercase transition-all">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Aprovar
                        </button>
                      </div>
                      <button onClick={() => { setRespId(null); setRespText(''); }}
                        className="w-full text-[10px] font-black text-gray-400 uppercase">Cancelar</button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={() => setRespId(f.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-blue-50 hover:bg-blue-100 border-2 border-blue-100 text-blue-700 rounded-[10px] font-black text-[10px] uppercase transition-all">
                        Responder ao Pedido
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          <button onClick={() => setShowNew(true)}
            className="w-full border-2 border-dashed border-blue-200 hover:border-blue-400 bg-blue-50 hover:bg-blue-100 text-blue-700 py-3 rounded-[14px] font-black text-xs uppercase transition-all flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" /> + Marcar férias
          </button>
        </div>
      )}
    </div>
  );
}
