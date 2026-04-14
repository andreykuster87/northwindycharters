// src/components/company/EmpresaFuncionarioTab.tsx
import { useState, useRef, useEffect } from 'react';
import {
  Building2, FileText, Download, Bell, ChevronDown, ChevronUp,
  Plus, Eye, HeartPulse, Sun,
} from 'lucide-react';
import { uploadDoc } from '../../lib/storage';
import { getCompanies, refreshAll } from '../../lib/localStore';
import {
  Resposta, Comunicado, Recibo, FeriasRequest,
  loadComunicadosForSailor,
  loadRespostasForSailor,
  loadRecibosForSailor,
  loadFeriasForSailor,
  insertResposta,
  insertFerias,
  findCompanyForSailorDB,
  markReciboVisto,
  markComunicadoSeen,
} from '../../lib/rh';
import { type RequestTipo, type FormState } from './EmpresaFuncionarioShared';
import { EmpresaFuncionarioNewModal } from './EmpresaFuncionarioNewModal';

export type { Resposta };

function uid() { return crypto.randomUUID(); }

interface CompanyRef {
  companyId: string;
  companyName: string;
  cargo: string;
}

export function EmpresaFuncionarioTab({
  sailorId, sailorName, onUnreadChange,
}: {
  sailorId: string;
  sailorName: string;
  onUnreadChange?: (count: number) => void;
}) {
  const [company,       setCompany]       = useState<CompanyRef | null>(null);
  const [comunicados,   setComunicados]   = useState<Comunicado[]>([]);
  const [recibos,       setRecibos]       = useState<Recibo[]>([]);
  const [respostas,     setRespostas]     = useState<Resposta[]>([]);
  const [feriasLista,   setFeriasLista]   = useState<FeriasRequest[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [expandedC,     setExpandedC]     = useState<Set<string>>(new Set());
  const [expandedR,     setExpandedR]     = useState<Set<string>>(new Set());
  const [showNew,       setShowNew]       = useState(false);
  const [replyTo,       setReplyTo]       = useState<Comunicado | null>(null);
  const [uploading,     setUploading]     = useState(false);
  const [requestTipo,   setRequestTipo]   = useState<RequestTipo>('mensagem');
  const [form,          setForm]          = useState<FormState>({ titulo: '', corpo: '', docUrl: '', docNome: '', inicio: '', fim: '' });
  const [formErr,       setFormErr]       = useState('');
  const [subTab,        setSubTab]        = useState<'recebidas' | 'enviadas'>('recebidas');
  const fileRef = useRef<HTMLInputElement>(null);

  function getSeenIds() {
    try { return JSON.parse(localStorage.getItem(`nw_rh_seen_${sailorId}`) || '[]') as string[]; } catch { return []; }
  }
  function addSeen(id: string) { markComunicadoSeen(sailorId, id); }

  function notifyUnread(comuns: Comunicado[], recs: Recibo[]) {
    const seen = getSeenIds();
    const u = comuns.filter(c => !seen.includes(c.id)).length + recs.filter(r => r.status === 'enviado').length;
    onUnreadChange?.(u);
  }

  useEffect(() => {
    async function load() {
      setLoading(true);
      const ref = await findCompanyForSailorDB(sailorId);
      if (!ref) { setLoading(false); onUnreadChange?.(0); return; }

      await refreshAll().catch(() => {});
      const companies  = getCompanies();
      const co         = companies.find(c => c.id === ref.companyId);
      const companyName = co?.nome_fantasia || co?.razao_social || ref.companyId;
      setCompany({ ...ref, companyName });

      const [comuns, recs, resps, ferias] = await Promise.all([
        loadComunicadosForSailor(ref.companyId, sailorId),
        loadRecibosForSailor(ref.companyId, sailorId),
        loadRespostasForSailor(ref.companyId, sailorId),
        loadFeriasForSailor(ref.companyId, sailorId),
      ]);
      setComunicados(comuns);
      setRecibos(recs);
      setRespostas(resps);
      setFeriasLista(ferias);
      setLoading(false);
      notifyUnread(comuns, recs);
    }
    load();
  }, [sailorId]);

  // Detect active férias/atestado today
  const today = new Date().toISOString().slice(0, 10);
  const feriasAtiva = feriasLista.find(f =>
    f.status === 'aprovada' && f.dataInicio <= today && f.dataFim >= today
  );
  const isAtestado = feriasAtiva?.motivo?.toLowerCase().includes('atestado');

  function toggleExpandC(id: string) {
    setExpandedC(prev => {
      const next = new Set(prev);
      if (!prev.has(id)) {
        next.add(id); addSeen(id);
        const newSeen = [...getSeenIds(), id];
        const u = comunicados.filter(c => !newSeen.includes(c.id)).length + recibos.filter(r => r.status === 'enviado').length;
        onUnreadChange?.(u);
      } else { next.delete(id); }
      return next;
    });
  }

  function toggleExpandRecibo(id: string) {
    setExpandedR(prev => {
      const next = new Set(prev);
      if (!prev.has(id)) {
        next.add(id);
        setRecibos(rs => {
          const updated = rs.map(r => r.id === id ? { ...r, status: 'visto' as const } : r);
          const u = comunicados.filter(c => !getSeenIds().includes(c.id)).length + updated.filter(r => r.status === 'enviado').length;
          onUnreadChange?.(u);
          return updated;
        });
        markReciboVisto(id);
      } else { next.delete(id); }
      return next;
    });
  }

  async function handleDocUpload(file: File) {
    setUploading(true);
    try {
      const url = await uploadDoc(file, 'rh', `resposta-${sailorId}-${Date.now()}`);
      if (url) setForm(v => ({ ...v, docUrl: url, docNome: file.name }));
    } finally { setUploading(false); }
  }

  function openReply(comunicado: Comunicado) {
    setReplyTo(comunicado);
    setRequestTipo('mensagem');
    setForm({ titulo: `Re: ${comunicado.titulo}`, corpo: '', docUrl: '', docNome: '', inicio: '', fim: '' });
    setFormErr(''); setShowNew(true);
  }

  function openNew() {
    setReplyTo(null);
    setRequestTipo('mensagem');
    setForm({ titulo: '', corpo: '', docUrl: '', docNome: '', inicio: '', fim: '' });
    setFormErr(''); setShowNew(true);
  }

  function closeForm() {
    setShowNew(false); setReplyTo(null);
    setForm({ titulo: '', corpo: '', docUrl: '', docNome: '', inicio: '', fim: '' });
    setFormErr('');
  }

  function handleTipoChange(t: RequestTipo) {
    setRequestTipo(t);
    const defaults: Record<RequestTipo, string> = {
      mensagem: '',
      ferias:   'Pedido de Férias',
      atestado: 'Apresentação de Atestado',
    };
    setForm(v => ({ ...v, titulo: defaults[t], inicio: '', fim: '' }));
    setFormErr('');
  }

  async function handleSubmit() {
    if (!company) return;

    if (requestTipo === 'mensagem') {
      if (!form.titulo.trim()) { setFormErr('Informe o assunto.'); return; }
      if (!form.corpo.trim() && !form.docUrl) { setFormErr('Escreva uma mensagem ou anexe um documento.'); return; }
      setFormErr('');
      const nova: Resposta = {
        id: uid(), staffId: sailorId, staffNome: sailorName,
        comunicadoId: replyTo?.id,
        titulo: form.titulo.trim(), corpo: form.corpo.trim(),
        docUrl: form.docUrl || undefined, docNome: form.docNome || undefined,
        createdAt: new Date().toISOString(), lida: false,
      };
      setRespostas(prev => [nova, ...prev]);
      await insertResposta(company.companyId, nova);
    } else {
      // férias ou atestado
      if (!form.inicio) { setFormErr('Informe a data de início.'); return; }
      if (!form.fim)    { setFormErr('Informe a data de fim.'); return; }
      if (form.fim < form.inicio) { setFormErr('Data de fim deve ser após o início.'); return; }
      setFormErr('');
      const req: FeriasRequest = {
        id: uid(), staffId: sailorId, staffNome: sailorName,
        dataInicio: form.inicio, dataFim: form.fim,
        motivo: requestTipo === 'atestado' ? 'Atestado' : (form.corpo.trim() || undefined),
        status: 'pendente', iniciadoPor: 'funcionario',
        createdAt: new Date().toISOString(),
      };
      setFeriasLista(prev => [req, ...prev]);
      await insertFerias(company.companyId, req);
    }
    closeForm();
  }

  function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
  function fmtMes(mes: string) {
    if (!mes) return '—';
    const [y, m] = mes.split('-');
    return new Date(Number(y), Number(m) - 1).toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' });
  }
  function fmtDay(iso: string) {
    return new Date(iso + 'T12:00').toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' });
  }
  function currency(n: number) {
    return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(n);
  }

  const seenIds       = getSeenIds();
  const unreadComuns  = comunicados.filter(c => !seenIds.includes(c.id)).length;
  const unreadRecibos = recibos.filter(r => r.status === 'enviado').length;
  const totalRecebidas = comunicados.length + recibos.length;

  if (loading) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-['Playfair_Display'] font-bold text-[#1a2b4a] uppercase flex items-center gap-2">
            <Building2 className="w-5 h-5" /> Empresa
          </h2>
          <p className="text-xs text-gray-400 font-bold">Comunicações internas</p>
        </div>
        <div className="py-16 text-center">
          <div className="w-8 h-8 border-2 border-[#c9a96e]/30 border-t-[#0a1628] animate-spin mx-auto" />
          <p className="text-xs font-bold text-gray-400 mt-3">A carregar…</p>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-['Playfair_Display'] font-bold text-[#1a2b4a] uppercase flex items-center gap-2">
            <Building2 className="w-5 h-5" /> Empresa
          </h2>
          <p className="text-xs text-gray-400 font-bold">Comunicações internas</p>
        </div>
        <div className="bg-white border border-dashed border-gray-200 py-16 text-center px-6">
          <Building2 className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <p className="font-semibold text-gray-300 uppercase text-sm">Sem empresa associada</p>
          <p className="text-xs text-gray-400 font-bold mt-2 leading-relaxed">
            Ainda não faz parte da equipa de nenhuma empresa.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-['Playfair_Display'] font-bold text-[#1a2b4a] uppercase flex items-center gap-2">
            <Building2 className="w-5 h-5" /> Empresa
          </h2>
          <p className="text-xs text-gray-400 font-bold">Comunicações internas</p>
        </div>
        <button onClick={openNew}
          className="bg-[#0a1628] hover:bg-[#0a1628]/90 text-white px-4 py-2.5 font-semibold text-xs uppercase flex items-center gap-1.5 flex-shrink-0 transition-all">
          <Plus className="w-3.5 h-3.5" /> Mensagem
        </button>
      </div>

      {/* Banner férias/atestado ativo */}
      {feriasAtiva && (
        <div className={`p-4 flex items-center gap-4 ${isAtestado ? 'bg-gradient-to-br from-amber-500 to-amber-400' : 'bg-gradient-to-br from-teal-600 to-teal-500'}`}>
          <div className="w-12 h-12 bg-white/20 flex items-center justify-center flex-shrink-0">
            {isAtestado
              ? <HeartPulse className="w-6 h-6 text-white" />
              : <Sun className="w-6 h-6 text-white" />
            }
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-white text-sm uppercase">
              {isAtestado ? 'Desejamos melhoras!' : 'Aproveite as suas férias!'}
            </p>
            <p className="text-white/80 text-xs font-bold mt-0.5">
              {isAtestado ? 'Atestado' : 'Férias'} · {fmtDay(feriasAtiva.dataInicio)} → {fmtDay(feriasAtiva.dataFim)}
            </p>
          </div>
        </div>
      )}

      {/* Card da empresa */}
      <div className="bg-[#0a1628] p-4 text-white"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 24px,rgba(201,169,110,0.04) 24px,rgba(201,169,110,0.04) 25px),repeating-linear-gradient(90deg,transparent,transparent 24px,rgba(201,169,110,0.04) 24px,rgba(201,169,110,0.04) 25px)' }}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/10 flex items-center justify-center flex-shrink-0">
            <Building2 className="w-6 h-6 text-[#c9a96e]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em]">Empresa</p>
            <p className="font-['Playfair_Display'] font-bold text-white uppercase text-base leading-tight truncate">{company.companyName}</p>
            <p className="text-[#c9a96e]/70 text-xs font-bold">{company.cargo}</p>
          </div>
          <div className="flex-shrink-0 text-right">
            <p className="text-2xl font-bold text-white">{unreadComuns + unreadRecibos}</p>
            <p className="text-[10px] font-semibold text-[#c9a96e] uppercase">Não lido{(unreadComuns + unreadRecibos) !== 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1.5 bg-gray-100 p-1.5">
        {[
          { key: 'recebidas' as const, label: 'Da Empresa', unread: unreadComuns + unreadRecibos, total: totalRecebidas },
          { key: 'enviadas'  as const, label: 'Enviadas por Mim', unread: 0, total: respostas.length },
        ].map(t => (
          <button key={t.key} onClick={() => setSubTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 font-semibold text-[10px] uppercase tracking-wide transition-all ${subTab === t.key ? 'bg-white text-[#1a2b4a] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
            {t.label}
            {t.unread > 0 ? (
              <span className="text-[8px] font-semibold w-3.5 h-3.5 flex items-center justify-center bg-red-500 text-white">{t.unread}</span>
            ) : t.total > 0 ? (
              <span className={`text-[8px] font-semibold w-3.5 h-3.5 flex items-center justify-center ${subTab === t.key ? 'bg-[#0a1628] text-white' : 'bg-gray-300 text-white'}`}>{t.total}</span>
            ) : null}
          </button>
        ))}
      </div>

      {/* ── Da Empresa ── */}
      {subTab === 'recebidas' && (
        totalRecebidas === 0 ? (
          <div className="bg-white border border-dashed border-gray-200 py-12 text-center">
            <Bell className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="font-semibold text-gray-300 uppercase text-sm">Sem mensagens</p>
            <p className="text-xs text-gray-400 font-bold mt-1">A empresa ainda não enviou mensagens.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {comunicados.map(c => {
              const open  = expandedC.has(c.id);
              const isNew = !seenIds.includes(c.id);
              return (
                <div key={c.id} className={`bg-white overflow-hidden transition-all border ${isNew ? 'border-[#c9a96e]/40 ring-1 ring-[#c9a96e]/10' : 'border-gray-100 hover:border-[#c9a96e]/20'}`}>
                  <button onClick={() => toggleExpandC(c.id)} className="w-full px-4 py-3 flex items-center gap-3 text-left">
                    <div className={`w-9 h-9 flex items-center justify-center flex-shrink-0 ${c.tipo === 'documento' ? 'bg-[#c9a96e]/5' : 'bg-[#0a1628]/5'}`}>
                      {c.tipo === 'documento' ? <FileText className="w-4 h-4 text-amber-600" /> : <MessageSquare className="w-4 h-4 text-[#c9a96e]" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-[#1a2b4a] text-sm truncate">{c.titulo}</p>
                        {isNew && <span className="w-2 h-2 bg-[#c9a96e] flex-shrink-0" />}
                      </div>
                      <p className="text-[10px] font-bold text-gray-400">
                        {new Date(c.createdAt).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' })}
                        {c.docNome && <span className="ml-2 text-amber-600">· {c.docNome}</span>}
                      </p>
                    </div>
                    {open ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                  </button>
                  {open && (
                    <div className="px-4 pb-4 space-y-3 border-t border-gray-50">
                      {c.corpo && <p className="text-sm font-bold text-gray-700 leading-relaxed pt-3 whitespace-pre-wrap">{c.corpo}</p>}
                      {c.docUrl && (
                        <a href={c.docUrl} download={c.docNome || 'documento'} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2 bg-[#c9a96e]/5 border border-[#c9a96e]/20 hover:border-[#c9a96e]/40 px-3 py-2.5 transition-all">
                          <FileText className="w-4 h-4 text-amber-600 flex-shrink-0" />
                          <p className="text-xs font-bold text-[#1a2b4a] flex-1 truncate">{c.docNome || 'Ver documento'}</p>
                          <Download className="w-3.5 h-3.5 text-amber-600" />
                        </a>
                      )}
                      <button onClick={() => openReply(c)}
                        className="w-full flex items-center justify-center gap-2 bg-[#0a1628]/5 hover:bg-[#0a1628]/10 border border-[#c9a96e]/20 text-[#1a2b4a] px-4 py-2.5 font-semibold text-xs uppercase transition-all">
                        <Send className="w-3.5 h-3.5" /> Responder
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {recibos.map(r => {
              const open  = expandedR.has(r.id);
              const isNew = r.status === 'enviado';
              return (
                <div key={r.id} className={`bg-white overflow-hidden transition-all border ${isNew ? 'border-green-300 ring-1 ring-green-100' : 'border-gray-100 hover:border-green-100'}`}>
                  <button onClick={() => toggleExpandRecibo(r.id)} className="w-full px-4 py-3 flex items-center gap-3 text-left">
                    <div className="w-9 h-9 bg-green-50 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-[#1a2b4a] text-sm truncate">Recibo — {fmtMes(r.mes)}</p>
                        {isNew && <span className="w-2 h-2 bg-green-500 flex-shrink-0" />}
                        <span className={`text-[9px] font-semibold px-1.5 py-0.5 flex-shrink-0 ${isNew ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {isNew ? 'Novo' : <><Eye className="w-2.5 h-2.5 inline" /> Visto</>}
                        </span>
                      </div>
                      <p className="text-[10px] font-bold text-gray-400">
                        {new Date(r.createdAt).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' })}
                        {r.docNome && <span className="ml-2 text-amber-600">· {r.docNome}</span>}
                      </p>
                    </div>
                    <p className="font-bold text-green-700 text-sm flex-shrink-0">{currency(r.valor)}</p>
                    {open ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                  </button>
                  {open && (
                    <div className="px-4 pb-4 border-t border-gray-50 pt-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-gray-500">Salário — {fmtMes(r.mes)}</p>
                        <p className="font-bold text-green-700">{currency(r.valor)}</p>
                      </div>
                      {r.docUrl && (
                        <a href={r.docUrl} download={r.docNome || 'recibo'} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2 bg-[#c9a96e]/5 border border-[#c9a96e]/20 hover:border-[#c9a96e]/40 px-3 py-2.5 transition-all">
                          <FileText className="w-4 h-4 text-amber-600 flex-shrink-0" />
                          <p className="text-xs font-bold text-[#1a2b4a] flex-1 truncate">{r.docNome || 'Ver recibo'}</p>
                          <Download className="w-3.5 h-3.5 text-amber-600" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )
      )}

      {/* ── Enviadas ── */}
      {subTab === 'enviadas' && (
        respostas.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-200 py-12 text-center">
            <Send className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="font-semibold text-gray-300 uppercase text-sm">Sem mensagens enviadas</p>
          </div>
        ) : (
          <div className="space-y-2">
            {respostas.map(r => (
              <div key={r.id} className="bg-white border border-gray-100 overflow-hidden hover:border-[#c9a96e]/20 transition-all">
                <div className="px-4 py-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-50 flex items-center justify-center flex-shrink-0">
                      <Send className="w-3.5 h-3.5 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-[#1a2b4a] text-sm truncate">{r.titulo}</p>
                        {r.lida && <span className="flex items-center gap-0.5 text-[9px] font-semibold text-green-600 flex-shrink-0"><Eye className="w-2.5 h-2.5" /> Lida</span>}
                      </div>
                      {r.corpo && <p className="text-xs font-bold text-gray-500 mt-0.5 line-clamp-2">{r.corpo}</p>}
                      {r.comunicadoId && <p className="text-[10px] font-bold text-[#c9a96e] mt-0.5">↩ Resposta a comunicado</p>}
                      <p className="text-[10px] font-bold text-gray-400 mt-1">{fmtDate(r.createdAt)}</p>
                    </div>
                  </div>
                  {r.docUrl && (
                    <a href={r.docUrl} download={r.docNome || 'documento'} target="_blank" rel="noopener noreferrer"
                      className="mt-2 flex items-center gap-2 bg-[#c9a96e]/5 border border-[#c9a96e]/20 hover:border-[#c9a96e]/40 px-3 py-2 transition-all">
                      <FileText className="w-3 h-3 text-amber-600 flex-shrink-0" />
                      <p className="text-[10px] font-bold text-[#1a2b4a] flex-1 truncate">{r.docNome || 'Ver documento'}</p>
                      <Download className="w-3 h-3 text-amber-600" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* ── Modal ── */}
      {showNew && (
        <EmpresaFuncionarioNewModal
          replyTo={replyTo}
          requestTipo={requestTipo}
          form={form}
          setForm={setForm}
          formErr={formErr}
          uploading={uploading}
          fileRef={fileRef}
          onClose={closeForm}
          onTipoChange={handleTipoChange}
          onSubmit={handleSubmit}
          onDocUpload={handleDocUpload}
        />
      )}
    </div>
  );
}
