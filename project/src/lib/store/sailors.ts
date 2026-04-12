// src/lib/store/sailors.ts — MIGRADO PARA SUPABASE
import { supabase } from '../supabase';
import type { Sailor } from './core';

// ── Mapper DB row → Sailor ────────────────────────────────────────────────────
function rowToSailor(r: any): Sailor {
  return {
    id:             r.id,
    profile_number: r.profile_number,
    name:           r.name,
    phone:          r.phone,
    email:          r.email,
    language:       r.language       ?? 'pt',
    timezone:       r.timezone       ?? 'Europe/Lisbon',
    nacionalidade:  r.nacionalidade,
    birth_date:     r.birth_date,
    cpf_nif:        r.cpf_nif,
    rg_doc:         r.rg_doc,
    passaporte_num: r.passaporte_num,
    endereco:       r.endereco,
    funcao:         r.funcao,
    funcao_outro:   r.funcao_outro,
    passaporte: {
      numero:       r.passaporte_numero,
      tipo:         r.passaporte_tipo,
      emissao:      r.passaporte_emissao,
      validade:     r.passaporte_validade,
      doc_url:      r.passaporte_doc_url,
      doc_back_url: r.passaporte_doc_back_url,
    },
    cartahabitacao: {
      numero:       r.cartahabitacao_numero,
      tipo:         r.cartahabitacao_tipo,
      emissao:      r.cartahabitacao_emissao,
      validade:     r.cartahabitacao_validade,
      doc_url:      r.cartahabitacao_doc_url,
      doc_back_url: r.cartahabitacao_doc_back_url,
    },
    caderneta_maritima: {
      possui:  r.caderneta_possui ?? false,
      numero:  r.caderneta_numero,
    },
    stcw:                     r.stcw             ?? {},
    stcw_validades:           r.stcw_validades   ?? {},
    medico: {
      emissao:  r.medico_emissao,
      validade: r.medico_validade,
      doc_url:  r.medico_doc_url,
    },
    experiencia_embarcado:    r.experiencia_embarcado,
    experiencias:             r.experiencias     ?? [],
    cursos_relevantes:        r.cursos_relevantes,
    possui_offshore:          r.possui_offshore,
    idiomas:                  r.idiomas          ?? [],
    idioma_nivel:             r.idioma_nivel,
    idioma_outro:             r.idioma_outro,
    disponivel_imediato:      r.disponivel_imediato,
    disponivel_internacional: r.disponivel_internacional,
    tempo_embarque:           r.tempo_embarque,
    restricao_medica:         r.restricao_medica,
    outras_informacoes:       r.outras_informacoes,
    declaracao_data:          r.declaracao_data,
    aceitou_termos:           r.aceitou_termos,
    status:                   r.status,
    verified:                 r.verified,
    verified_at:              r.verified_at,
    blocked:                  r.blocked,
    block_reason:             r.block_reason,
    created_at:               r.created_at,
  };
}

function sailorToRow(data: Partial<Sailor>): any {
  const row: any = { ...data };
  if (data.passaporte) {
    row.passaporte_numero         = data.passaporte.numero       ?? null;
    row.passaporte_tipo           = data.passaporte.tipo         ?? null;
    row.passaporte_emissao        = data.passaporte.emissao      ?? null;
    row.passaporte_validade       = data.passaporte.validade     ?? null;
    row.passaporte_doc_url        = data.passaporte.doc_url      ?? null;
    row.passaporte_doc_back_url   = data.passaporte.doc_back_url ?? null;
    delete row.passaporte;
  }
  if (data.cartahabitacao) {
    row.cartahabitacao_numero         = data.cartahabitacao.numero       ?? null;
    row.cartahabitacao_tipo           = data.cartahabitacao.tipo         ?? null;
    row.cartahabitacao_emissao        = data.cartahabitacao.emissao      ?? null;
    row.cartahabitacao_validade       = data.cartahabitacao.validade     ?? null;
    row.cartahabitacao_doc_url        = data.cartahabitacao.doc_url      ?? null;
    row.cartahabitacao_doc_back_url   = data.cartahabitacao.doc_back_url ?? null;
    delete row.cartahabitacao;
  }
  if (data.medico) {
    row.medico_emissao  = data.medico.emissao  ?? null;
    row.medico_validade = data.medico.validade ?? null;
    row.medico_doc_url  = data.medico.doc_url  ?? null;
    delete row.medico;
  }
  if (data.caderneta_maritima) {
    row.caderneta_possui = data.caderneta_maritima.possui;
    row.caderneta_numero = data.caderneta_maritima.numero ?? null;
    delete row.caderneta_maritima;
  }
  // Remover campos que não existem na tabela
  delete row.id; // não enviar id no update
  return row;
}

// ── CRUD ──────────────────────────────────────────────────────────────────────

export async function getSailors(): Promise<Sailor[]> {
  const { data, error } = await supabase
    .from('sailors').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(rowToSailor);
}

export async function saveSailor(
  data: Omit<Sailor, 'id' | 'profile_number' | 'created_at' | 'status' | 'verified'>
): Promise<Sailor> {
  const { data: cnt, error: cntErr } = await supabase.rpc('next_counter', { counter_key: 'profile_counter' });
  if (cntErr) throw cntErr;
  const profile_number = String(cnt).padStart(5, '0');

  const row = { ...sailorToRow(data as any), profile_number, status: 'pending', verified: false };

  const { data: inserted, error } = await supabase
    .from('sailors').insert(row).select().single();
  if (error) {
    if (error.code === '23505') {
      if (error.message.includes('email')) throw new Error('DUPLICATE_EMAIL');
      throw new Error('DUPLICATE_DOCUMENT');
    }
    throw error;
  }
  return rowToSailor(inserted);
}

export async function approveSailor(id: string): Promise<void> {
  const { error } = await supabase.from('sailors').update({
    status:      'approved',
    verified:    true,
    verified_at: new Date().toISOString(),
  }).eq('id', id);
  if (error) throw error;
}

export async function updateSailor(id: string, patch: Partial<Sailor>): Promise<void> {
  const row = sailorToRow(patch);
  const { error } = await supabase.from('sailors').update(row).eq('id', id);
  if (error) throw error;
}

export async function deleteSailor(id: string): Promise<void> {
  const { error } = await supabase.from('sailors').delete().eq('id', id);
  if (error) throw error;
}

export async function sailorLogin(login: string, password: string): Promise<Sailor | null> {
  const { data, error } = await supabase
    .from('sailors').select('*')
    .eq('sailor_login',    login)
    .eq('sailor_password', password)
    .eq('status',   'approved')
    .eq('verified', true)
    .single();
  if (error || !data) return null;
  return rowToSailor(data);
}