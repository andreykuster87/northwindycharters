// src/components/company/ComunicadosSubTab.tsx
import { useState, useRef, useEffect } from 'react';
import { MessageSquare, FileText, X, AlertCircle, Plus, Send, Paperclip, Download, Bell, ChevronDown, ChevronUp } from 'lucide-react';
import { uploadDoc } from '../../lib/storage';
import {
  loadRespostas, markRespostaLida as dbMarkLida, insertComunicado,
  type StaffMember, type Comunicado, type Resposta,
} from '../../lib/rh';
import { uid } from './RHShared';

interface Props {
  staff:          StaffMember[];
  comunicados:    Comunicado[];
  setComunicados: React.Dispatch<React.SetStateAction<Comunicado[]>>;
  companyId:      string;
  onToast:        (msg: string) => void;
}

export function ComunicadosSubTab({ staff, comunicados, setComunicados, companyId, onToast }: Props) {
  const [showNew,    setShowNew]    = useState(false);
  const [uploading,  setUploading]  = useState(false);
  const [form,       setForm]       = useState({
    titulo: '', corpo: '', tipo: 'mensagem' as 'mensagem' | 'documento',
    destinatarios: 'todos' as 'todos' | string[], docUrl: '', docNome: '',
  });
  const [formErr,    setFormErr]    = useState('');
  const [caixaTab,   setCaixaTab]   = useState<'enviados' | 'inbox'>('inbox');
  const [respostas,  setRespostas]  = useState<Resposta[]>([]);
  const [expandedR,  setExpandedR]  = useState<Set<string>>(new Set());
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadRespostas(companyId).then(setRespostas);
  }, [companyId, caixaTab]);

  const unreadRespostas = respostas.filter(r => !r.lida).length;

  async function markLida(id: string) {
    setRespostas(prev => prev.map(r => r.id === id ? { ...r, lida: true } : r));
    await dbMarkLida(id);
  }

  function toggleExpandR(id: string) {
    setExpandedR(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      if (!prev.has(id)) markLida(id);
      return next;
    });
  }

  async function handleDocUpload(file: File) {
    setUploading(true);
    try {
      const url = await uploadDoc(file, 'rh', `comunicado-${companyId}-${Date.now()}`);
      if (url) setForm(v => ({ ...v, docUrl: url, docNome: file.name }));
    } finally { setUploading(false); }
  }

  async function send() {
    if (!form.titulo.trim()) { setFormErr('Informe o título.'); return; }
    if (!form.corpo.trim() && !form.docUrl) { setFormErr('Escreva uma mensagem ou anexe um documento.'); return; }
    setFormErr('');

    const novo: Comunicado = {
      id:            uid(),
      titulo:        form.titulo.trim(),
      corpo:         form.corpo.trim(),
      tipo:          form.tipo,
      docUrl:        form.docUrl || undefined,
      docNome:       form.docNome || undefined,
      destinatarios: form.destinatarios,
      createdAt:     new Date().toISOString(),
    };

    setComunicados(prev => [novo, ...prev]);
    const err = await insertComunicado(companyId, novo);
    setShowNew(false);
    setForm({ titulo: '', corpo: '', tipo: 'mensagem', destinatarios: 'todos', docUrl: '', docNome: '' });
    if (err) {
      onToast(`❌ Erro ao guardar: ${err}`);
    } else {
      onToast('📢 Comunicado enviado à equipa!');
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-black text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5" /> Comunicados
        </p>
        <p className="text-[10px] text-gray-400 font-bold">Comunicados internos da equipa</p>
      </div>

      <div className="flex gap-1.5 bg-gray-100 rounded-[14px] p-1.5">
        {[
          { key: 'inbox'    as const, label: 'Caixa de Entrada', count: unreadRespostas },
          { key: 'enviados' as const, label: 'Enviados', count: comunicados.length },
        ].map(t => (
          <button key={t.key} onClick={() => setCaixaTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-[10px] font-black text-[10px] uppercase tracking-wide transition-all ${caixaTab === t.key ? 'bg-white text-blue-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
            {t.label}
            {t.count > 0 && (
              <span className={`text-[8px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center ${caixaTab === t.key ? 'bg-blue-900 text-white' : 'bg-gray-300 text-white'}`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {showNew && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowNew(false)}>
          <div className="bg-white w-full max-w-sm rounded-[28px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="bg-blue-900 px-6 py-5 flex items-center justify-between flex-shrink-0">
              <div>
                <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest">RH · Comunicados</p>
                <h3 className="text-base font-black text-white uppercase italic">Novo Comunicado</h3>
              </div>
              <button onClick={() => setShowNew(false)} className="bg-blue-800 p-2 rounded-full text-white hover:bg-blue-700 transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              {formErr && (
                <div className="bg-red-50 border-2 border-red-100 rounded-[14px] px-4 py-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <p className="text-xs font-bold text-red-700">{formErr}</p>
                </div>
              )}
              <div>
                <label className="text-[10px] font-black text-blue-900 uppercase tracking-wider mb-2 block">Tipo</label>
                <div className="flex gap-2">
                  {(['mensagem', 'documento'] as const).map(t => (
                    <button key={t} type="button" onClick={() => setForm(v => ({ ...v, tipo: t }))}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-[12px] font-black text-[10px] border-2 transition-all ${form.tipo === t ? 'bg-blue-900 text-white border-blue-900' : 'bg-gray-50 text-gray-500 border-gray-100 hover:border-blue-300'}`}>
                      {t === 'mensagem' ? <MessageSquare className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-blue-900 uppercase tracking-wider mb-2 block">Para</label>
                <div className="flex gap-2 flex-wrap">
                  <button type="button" onClick={() => setForm(v => ({ ...v, destinatarios: 'todos' }))}
                    className={`px-3 py-1.5 rounded-[10px] text-[10px] font-black border-2 transition-all ${form.destinatarios === 'todos' ? 'bg-blue-900 text-white border-blue-900' : 'bg-gray-50 text-gray-500 border-gray-100 hover:border-blue-300'}`}>
                    Toda a Equipa
                  </button>
                  {staff.map(s => {
                    const sel = Array.isArray(form.destinatarios) && form.destinatarios.includes(s.id);
                    return (
                      <button key={s.id} type="button" onClick={() => {
                        setForm(v => {
                          const cur = Array.isArray(v.destinatarios) ? v.destinatarios : [];
                          const next = cur.includes(s.id) ? cur.filter(id => id !== s.id) : [...cur, s.id];
                          return { ...v, destinatarios: next.length === 0 ? 'todos' : next };
                        });
                      }}
                        className={`px-3 py-1.5 rounded-[10px] text-[10px] font-black border-2 transition-all ${sel ? 'bg-blue-900 text-white border-blue-900' : 'bg-gray-50 text-gray-500 border-gray-100 hover:border-blue-300'}`}>
                        {s.nome.split(' ')[0]}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-blue-900 uppercase tracking-wider mb-1.5 block">Título *</label>
                <input value={form.titulo} onChange={e => { setForm(v => ({ ...v, titulo: e.target.value })); setFormErr(''); }}
                  placeholder="Ex: Reunião semanal"
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-[16px] font-bold text-blue-900 text-sm focus:border-blue-900 outline-none transition-all" />
              </div>
              <div>
                <label className="text-[10px] font-black text-blue-900 uppercase tracking-wider mb-1.5 block">Mensagem</label>
                <textarea value={form.corpo} onChange={e => setForm(v => ({ ...v, corpo: e.target.value }))} rows={4}
                  placeholder="Escreva aqui…"
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-[16px] font-bold text-blue-900 text-sm focus:border-blue-900 outline-none resize-none transition-all" />
              </div>
              <div>
                <label className="text-[10px] font-black text-blue-900 uppercase tracking-wider mb-1.5 block">
                  {form.tipo === 'documento' ? 'Ficheiro * (PDF, DOCX…)' : 'Anexo (opcional)'}
                </label>
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
                    {uploading
                      ? <><span className="animate-spin w-4 h-4 border-2 border-blue-300 border-t-blue-900 rounded-full" /> A enviar…</>
                      : <><Paperclip className="w-4 h-4" /> Selecionar ficheiro</>
                    }
                    <input ref={fileRef} type="file" className="sr-only" disabled={uploading}
                      onChange={e => { const f = e.target.files?.[0]; if (f) handleDocUpload(f); e.target.value = ''; }} />
                  </label>
                )}
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={() => setShowNew(false)}
                  className="px-4 py-3 border-2 border-gray-100 text-gray-400 rounded-[14px] font-black text-xs uppercase hover:border-gray-200 transition-all">
                  Cancelar
                </button>
                <button onClick={send} disabled={uploading}
                  className="flex-1 bg-blue-900 hover:bg-blue-800 disabled:opacity-40 text-white py-3 rounded-[14px] font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                  <Send className="w-4 h-4" /> Enviar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {caixaTab === 'enviados' && (
        comunicados.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-gray-200 rounded-[24px] py-12 text-center">
            <MessageSquare className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="font-black text-gray-300 uppercase italic text-sm">Sem comunicados</p>
            <button onClick={() => setShowNew(true)}
              className="mt-4 bg-blue-900 text-white px-6 py-2.5 rounded-[14px] font-black text-xs uppercase hover:bg-blue-800 transition-all flex items-center gap-1.5 mx-auto">
              <Plus className="w-3.5 h-3.5" /> Criar novo comunicado
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {comunicados.map(c => (
              <div key={c.id} className="bg-white border-2 border-gray-100 rounded-[18px] p-4 space-y-2 hover:border-blue-100 transition-all">
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0 ${c.tipo === 'documento' ? 'bg-amber-50' : 'bg-blue-50'}`}>
                    {c.tipo === 'documento' ? <FileText className="w-4 h-4 text-amber-600" /> : <MessageSquare className="w-4 h-4 text-blue-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-blue-900 text-sm truncate">{c.titulo}</p>
                    {c.corpo && <p className="text-xs font-bold text-gray-500 mt-0.5 line-clamp-2">{c.corpo}</p>}
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <p className="text-[10px] font-bold text-gray-400">
                        {new Date(c.createdAt).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                      <span className="text-[10px] font-black text-blue-400">
                        {c.destinatarios === 'todos' ? '· Toda a equipa' : `· ${(c.destinatarios as string[]).length} pessoa${(c.destinatarios as string[]).length !== 1 ? 's' : ''}`}
                      </span>
                      {respostas.filter(r => r.comunicadoId === c.id).length > 0 && (
                        <span className="text-[9px] font-black bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                          {respostas.filter(r => r.comunicadoId === c.id).length} resposta{respostas.filter(r => r.comunicadoId === c.id).length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {c.docUrl && (
                  <a href={c.docUrl} download={c.docNome || 'documento'} target="_blank" rel="noopener noreferrer"
                    className="mt-3 flex items-center gap-2 bg-amber-50 border-2 border-amber-100 hover:border-amber-300 rounded-[12px] px-3 py-2 transition-all">
                    <FileText className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                    <p className="text-xs font-black text-amber-800 flex-1 truncate">{c.docNome || 'Ver documento'}</p>
                    <Download className="w-3.5 h-3.5 text-amber-600" />
                  </a>
                )}
              </div>
            ))}
            <button onClick={() => setShowNew(true)}
              className="w-full border-2 border-dashed border-blue-200 hover:border-blue-400 bg-blue-50 hover:bg-blue-100 text-blue-700 py-3 rounded-[14px] font-black text-xs uppercase transition-all flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" /> Criar novo comunicado
            </button>
          </div>
        )
      )}

      {caixaTab === 'inbox' && (
        respostas.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-gray-200 rounded-[24px] py-12 text-center">
            <Bell className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="font-black text-gray-300 uppercase italic text-sm">Sem mensagens recebidas</p>
            <p className="text-xs text-gray-400 font-bold mt-1">As respostas dos funcionários aparecerão aqui.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {respostas.map(r => {
              const open = expandedR.has(r.id);
              const relatedComunicado = r.comunicadoId ? comunicados.find(c => c.id === r.comunicadoId) : null;
              return (
                <div key={r.id} className={`bg-white border-2 rounded-[16px] overflow-hidden transition-all ${!r.lida ? 'border-blue-200 ring-1 ring-blue-100' : 'border-gray-100 hover:border-blue-100'}`}>
                  <button onClick={() => toggleExpandR(r.id)} className="w-full px-4 py-3 flex items-center gap-3 text-left">
                    <div className="w-9 h-9 bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0 font-black text-white text-sm">
                      {r.staffNome.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-black text-blue-900 text-sm truncate">{r.staffNome}</p>
                        {!r.lida && <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />}
                      </div>
                      <p className="text-xs font-bold text-gray-600 truncate">{r.titulo}</p>
                      {relatedComunicado && (
                        <p className="text-[10px] font-bold text-blue-400 truncate">↩ {relatedComunicado.titulo}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <p className="text-[10px] font-bold text-gray-400">
                        {new Date(r.createdAt).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' })}
                      </p>
                      {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </div>
                  </button>
                  {open && (
                    <div className="px-4 pb-4 space-y-3 border-t border-gray-50">
                      {r.corpo && (
                        <p className="text-sm font-bold text-gray-700 leading-relaxed pt-3 whitespace-pre-wrap">{r.corpo}</p>
                      )}
                      {r.docUrl && (
                        <a href={r.docUrl} download={r.docNome || 'documento'} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2 bg-amber-50 border-2 border-amber-100 hover:border-amber-300 rounded-[12px] px-3 py-2.5 transition-all">
                          <FileText className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                          <p className="text-xs font-black text-amber-800 flex-1 truncate">{r.docNome || 'Ver documento'}</p>
                          <Download className="w-3.5 h-3.5 text-amber-600" />
                        </a>
                      )}
                      <p className="text-[10px] font-bold text-gray-400">
                        {new Date(r.createdAt).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}
