// src/lib/rh.ts
// CRUD operations for the RH module using Supabase
import { supabase } from './supabase';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface StaffMember {
  id: string;      // sailor/client id
  nome: string;
  email: string;
  cargo: string;
  status: 'disponível' | 'em serviço' | 'escritório' | 'ausente' | 'férias';
  cert: string;
  barco: string;
  addedAt: string;
}

export interface FeriasRequest {
  id: string;
  staffId: string;
  staffNome: string;
  dataInicio: string;
  dataFim: string;
  motivo?: string;
  status: 'pendente' | 'aprovada' | 'recusada';
  iniciadoPor: 'funcionario' | 'empresa';
  resposta?: string;
  createdAt: string;
}

export interface Comunicado {
  id: string;
  titulo: string;
  corpo: string;
  tipo: 'mensagem' | 'documento';
  docUrl?: string;
  docNome?: string;
  destinatarios: 'todos' | string[];
  createdAt: string;
}

export interface Recibo {
  id: string;
  staffId: string;
  staffNome: string;
  mes: string;
  valor: number;
  docUrl?: string;
  docNome?: string;
  status: 'enviado' | 'visto';
  createdAt: string;
}

export interface Resposta {
  id: string;
  staffId: string;
  staffNome: string;
  comunicadoId?: string;
  titulo: string;
  corpo: string;
  docUrl?: string;
  docNome?: string;
  createdAt: string;
  lida: boolean;
}

// ── Mappers (DB row → app type) ────────────────────────────────────────────────

function mapStaff(r: Record<string, unknown>): StaffMember {
  return {
    id:      r.sailor_id as string,
    nome:    r.nome as string,
    email:   r.email as string,
    cargo:   r.cargo as string,
    status:  (r.status as StaffMember['status']) || 'disponível',
    cert:    (r.cert as string) || '—',
    barco:   (r.barco as string) || '—',
    addedAt: r.added_at as string,
  };
}

function mapFerias(r: Record<string, unknown>): FeriasRequest {
  return {
    id:          r.id as string,
    staffId:     r.staff_id as string,
    staffNome:   r.staff_nome as string,
    dataInicio:  r.inicio as string,
    dataFim:     r.fim as string,
    motivo:      (r.motivo as string) || undefined,
    status:      (r.status as FeriasRequest['status']) || 'pendente',
    iniciadoPor: (r.iniciado_por as FeriasRequest['iniciadoPor']) || 'empresa',
    resposta:    (r.resposta as string) || undefined,
    createdAt:   r.created_at as string,
  };
}

function mapComunicado(r: Record<string, unknown>): Comunicado {
  let dest: 'todos' | string[] = 'todos';
  const raw = r.destinatarios as string;
  if (raw && raw !== 'todos') {
    try { dest = JSON.parse(raw); } catch { dest = 'todos'; }
  }
  return {
    id:            r.id as string,
    titulo:        r.titulo as string,
    corpo:         (r.corpo as string) || '',
    tipo:          (r.tipo as Comunicado['tipo']) || 'mensagem',
    docUrl:        (r.doc_url as string) || undefined,
    docNome:       (r.doc_nome as string) || undefined,
    destinatarios: dest,
    createdAt:     r.created_at as string,
  };
}

function mapRecibo(r: Record<string, unknown>): Recibo {
  return {
    id:        r.id as string,
    staffId:   r.staff_id as string,
    staffNome: r.staff_nome as string,
    mes:       r.mes as string,
    valor:     Number(r.valor),
    docUrl:    (r.doc_url as string) || undefined,
    docNome:   (r.doc_nome as string) || undefined,
    status:    (r.status as Recibo['status']) || 'enviado',
    createdAt: r.created_at as string,
  };
}

function mapResposta(r: Record<string, unknown>): Resposta {
  return {
    id:            r.id as string,
    staffId:       r.staff_id as string,
    staffNome:     r.staff_nome as string,
    comunicadoId:  (r.comunicado_id as string) || undefined,
    titulo:        r.titulo as string,
    corpo:         (r.corpo as string) || '',
    docUrl:        (r.doc_url as string) || undefined,
    docNome:       (r.doc_nome as string) || undefined,
    lida:          Boolean(r.lida),
    createdAt:     r.created_at as string,
  };
}

// ── Staff ──────────────────────────────────────────────────────────────────────

export async function loadStaff(companyId: string): Promise<StaffMember[]> {
  const { data } = await supabase
    .from('rh_staff')
    .select('*')
    .eq('company_id', companyId)
    .order('added_at', { ascending: true });
  return (data ?? []).map(r => mapStaff(r as Record<string, unknown>));
}

export async function addStaff(companyId: string, m: StaffMember): Promise<void> {
  const { error } = await supabase.from('rh_staff').upsert({
    company_id: companyId,
    sailor_id:  m.id,
    nome:       m.nome,
    email:      m.email,
    cargo:      m.cargo,
    status:     m.status,
    cert:       m.cert,
    barco:      m.barco,
  });
  if (error) console.error('[rh] addStaff:', error);
}

export async function removeStaff(companyId: string, sailorId: string): Promise<void> {
  const { error } = await supabase.from('rh_staff').delete().eq('company_id', companyId).eq('sailor_id', sailorId);
  if (error) console.error('[rh] removeStaff:', error);
}

// ── Férias ─────────────────────────────────────────────────────────────────────

export async function loadFerias(companyId: string): Promise<FeriasRequest[]> {
  const { data } = await supabase
    .from('rh_ferias')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });
  return (data ?? []).map(r => mapFerias(r as Record<string, unknown>));
}

export async function insertFerias(companyId: string, f: FeriasRequest): Promise<void> {
  const { error } = await supabase.from('rh_ferias').insert({
    id:           f.id,
    company_id:   companyId,
    staff_id:     f.staffId,
    staff_nome:   f.staffNome,
    inicio:       f.dataInicio,
    fim:          f.dataFim,
    motivo:       f.motivo ?? null,
    status:       f.status,
    iniciado_por: f.iniciadoPor,
    resposta:     f.resposta ?? null,
  });
  if (error) console.error('[rh] insertFerias:', error);
}

export async function updateFeriasStatus(
  id: string,
  status: FeriasRequest['status'],
  resposta?: string,
): Promise<void> {
  const { error } = await supabase.from('rh_ferias').update({ status, resposta: resposta ?? null }).eq('id', id);
  if (error) console.error('[rh] updateFeriasStatus:', error);
}

export async function deleteFerias(id: string): Promise<void> {
  const { error } = await supabase.from('rh_ferias').delete().eq('id', id);
  if (error) console.error('[rh] deleteFerias:', error);
}

// ── Comunicados ────────────────────────────────────────────────────────────────

export async function loadComunicados(companyId: string): Promise<Comunicado[]> {
  const { data } = await supabase
    .from('rh_comunicados')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });
  return (data ?? []).map(r => mapComunicado(r as Record<string, unknown>));
}

export async function insertComunicado(companyId: string, c: Comunicado): Promise<string | null> {
  const { error } = await supabase.from('rh_comunicados').insert({
    id:            c.id,
    company_id:    companyId,
    titulo:        c.titulo,
    corpo:         c.corpo,
    tipo:          c.tipo,
    doc_url:       c.docUrl ?? null,
    doc_nome:      c.docNome ?? null,
    destinatarios: typeof c.destinatarios === 'string' ? c.destinatarios : JSON.stringify(c.destinatarios),
  });
  if (error) { console.error('[rh] insertComunicado:', error); return error.message; }
  return null;
}

export async function deleteComunicado(id: string): Promise<void> {
  const { error } = await supabase.from('rh_comunicados').delete().eq('id', id);
  if (error) console.error('[rh] deleteComunicado:', error);
}

// ── Recibos ────────────────────────────────────────────────────────────────────

export async function loadRecibos(companyId: string): Promise<Recibo[]> {
  const { data } = await supabase
    .from('rh_recibos')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });
  return (data ?? []).map(r => mapRecibo(r as Record<string, unknown>));
}

export async function insertRecibo(companyId: string, r: Recibo): Promise<void> {
  const { error } = await supabase.from('rh_recibos').insert({
    id:         r.id,
    company_id: companyId,
    staff_id:   r.staffId,
    staff_nome: r.staffNome,
    mes:        r.mes,
    valor:      r.valor,
    doc_url:    r.docUrl ?? null,
    doc_nome:   r.docNome ?? null,
    status:     r.status,
  });
  if (error) console.error('[rh] insertRecibo:', error);
}

export async function deleteRecibo(id: string): Promise<void> {
  const { error } = await supabase.from('rh_recibos').delete().eq('id', id);
  if (error) console.error('[rh] deleteRecibo:', error);
}

// ── Respostas ──────────────────────────────────────────────────────────────────

export async function loadRespostas(companyId: string): Promise<Resposta[]> {
  const { data } = await supabase
    .from('rh_respostas')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });
  return (data ?? []).map(r => mapResposta(r as Record<string, unknown>));
}

export async function insertResposta(companyId: string, r: Resposta): Promise<void> {
  const { error } = await supabase.from('rh_respostas').insert({
    id:            r.id,
    company_id:    companyId,
    staff_id:      r.staffId,
    staff_nome:    r.staffNome,
    comunicado_id: r.comunicadoId ?? null,
    titulo:        r.titulo,
    corpo:         r.corpo,
    doc_url:       r.docUrl ?? null,
    doc_nome:      r.docNome ?? null,
    lida:          r.lida,
  });
  if (error) console.error('[rh] insertResposta:', error);
}

export async function markRespostaLida(id: string): Promise<void> {
  const { error } = await supabase.from('rh_respostas').update({ lida: true }).eq('id', id);
  if (error) console.error('[rh] markRespostaLida:', error);
}

// ── loadComunicadosForSailor (usado em EmpresaFuncionarioTab) ──────────────────

export async function loadComunicadosForSailor(companyId: string, sailorId: string): Promise<Comunicado[]> {
  const all = await loadComunicados(companyId);
  return all.filter(c => {
    if (c.destinatarios === 'todos') return true;
    if (Array.isArray(c.destinatarios)) return c.destinatarios.includes(sailorId);
    return false;
  });
}

export async function loadRespostasForSailor(companyId: string, sailorId: string): Promise<Resposta[]> {
  const { data } = await supabase
    .from('rh_respostas')
    .select('*')
    .eq('company_id', companyId)
    .eq('staff_id', sailorId)
    .order('created_at', { ascending: false });
  return (data ?? []).map(r => mapResposta(r as Record<string, unknown>));
}

export async function findCompanyForSailorDB(sailorId: string): Promise<{ companyId: string; companyName: string; cargo: string } | null> {
  const { data } = await supabase
    .from('rh_staff')
    .select('company_id, cargo')
    .eq('sailor_id', sailorId)
    .limit(1)
    .maybeSingle();
  if (!data) return null;
  return { companyId: data.company_id as string, companyName: '', cargo: data.cargo as string };
}

export async function loadFeriasForSailor(companyId: string, sailorId: string): Promise<FeriasRequest[]> {
  const { data } = await supabase
    .from('rh_ferias')
    .select('*')
    .eq('company_id', companyId)
    .eq('staff_id', sailorId)
    .order('created_at', { ascending: false });
  return (data ?? []).map(r => mapFerias(r as Record<string, unknown>));
}

export async function loadRecibosForSailor(companyId: string, sailorId: string): Promise<Recibo[]> {
  const { data } = await supabase
    .from('rh_recibos')
    .select('*')
    .eq('company_id', companyId)
    .eq('staff_id', sailorId)
    .order('created_at', { ascending: false });
  return (data ?? []).map(r => mapRecibo(r as Record<string, unknown>));
}

export async function markReciboVisto(id: string): Promise<void> {
  const { error } = await supabase.from('rh_recibos').update({ status: 'visto' }).eq('id', id);
  if (error) console.error('[rh] markReciboVisto:', error);
}

// ── Bell items ─────────────────────────────────────────────────────────────────

export interface BellItem {
  id:        string;
  titulo:    string;
  tipo:      'comunicado' | 'recibo';
  createdAt: string;
}

/** Retorna contagem + lista de itens não lidos (para o dropdown do sino). */
export async function loadEmpresaBell(sailorId: string): Promise<{ count: number; items: BellItem[] }> {
  const ref = await findCompanyForSailorDB(sailorId);
  if (!ref) return { count: 0, items: [] };

  const [comuns, recibos] = await Promise.all([
    loadComunicadosForSailor(ref.companyId, sailorId),
    loadRecibosForSailor(ref.companyId, sailorId),
  ]);

  let seenIds: string[] = [];
  try { seenIds = JSON.parse(localStorage.getItem(`nw_rh_seen_${sailorId}`) || '[]'); } catch { seenIds = []; }

  const items: BellItem[] = [
    ...comuns.filter(c => !seenIds.includes(c.id)).map(c => ({
      id: c.id, titulo: c.titulo, tipo: 'comunicado' as const, createdAt: c.createdAt,
    })),
    ...recibos.filter(r => r.status === 'enviado').map(r => ({
      id: r.id, titulo: `Recibo — ${r.mes}`, tipo: 'recibo' as const, createdAt: r.createdAt,
    })),
  ].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return { count: items.length, items };
}

/** Compat: retorna apenas a contagem. */
export async function loadEmpresaUnread(sailorId: string): Promise<number> {
  return (await loadEmpresaBell(sailorId)).count;
}

export function markComunicadoSeen(sailorId: string, comunicadoId: string): void {
  try {
    const seen: string[] = JSON.parse(localStorage.getItem(`nw_rh_seen_${sailorId}`) || '[]');
    if (!seen.includes(comunicadoId)) {
      seen.push(comunicadoId);
      localStorage.setItem(`nw_rh_seen_${sailorId}`, JSON.stringify(seen));
    }
  } catch { /* ignore */ }
}
