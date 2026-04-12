// src/lib/store/companies.ts — MIGRADO PARA SUPABASE
import { supabase } from '../supabase';

export interface Company {
  id:                  string;
  profile_number:      string;
  razao_social:        string;
  nome_fantasia:       string;
  setor:               string;
  descricao?:          string;
  pais:                string;
  pais_nome:           string;
  estado:              string;
  cidade:              string;
  endereco:            string;
  codigo_postal:       string;
  numero_registro:     string;
  numero_fiscal:       string;
  pais_fiscal:         string;
  telefone:            string;
  email:               string;
  website?:            string;
  instagram?:          string;
  linkedin?:           string;
  facebook?:           string;
  outras_redes?:       string;
  resp_nome:           string;
  resp_cargo:          string;
  resp_email:          string;
  resp_telefone:       string;
  company_login?:      string;
  company_password?:   string;
  blocked?:            boolean;
  block_reason?:       string;
  declarou_veracidade: boolean;
  aceitou_termos:      boolean;
  status:              'pending' | 'active' | 'inactive' | 'suspended';
  created_at:          string;
  updated_at:          string;
}

export type CompanyLoginResult =
  | { ok: true;  company: Company }
  | { ok: false; reason: 'not_found' | 'wrong_password' | 'not_active' | 'blocked' };

export async function getCompanies(): Promise<Company[]> {
  const { data, error } = await supabase
    .from('companies').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getPendingCompanies(): Promise<Company[]> {
  const { data, error } = await supabase
    .from('companies').select('*').eq('status', 'pending');
  if (error) throw error;
  return data ?? [];
}

export async function saveCompany(
  data: Omit<Company, 'id' | 'profile_number' | 'created_at' | 'updated_at'>
): Promise<Company> {
  const { data: cnt, error: cntErr } = await supabase.rpc('next_counter', { counter_key: 'profile_counter' });
  if (cntErr) throw cntErr;
  const seq            = Number(cnt);
  const profile_number = `EMP-${String(seq).padStart(5, '0')}`;

  const { data: inserted, error } = await supabase
    .from('companies').insert({ ...data, profile_number }).select().single();
  if (error) throw error;
  return inserted;
}

export async function approveCompany(id: string): Promise<void> {
  const { data: company } = await supabase
    .from('companies').select('nome_fantasia, profile_number').eq('id', id).single();
  if (!company) return;

  const seq       = parseInt((company.profile_number as string).replace('EMP-', ''), 10) || 1;
  const loginSlug = (company.nome_fantasia as string)
    .split(' ')[0].toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
  const login    = `${loginSlug}#${seq}`;
  const password = Math.random().toString(36).substring(2, 8).toUpperCase();

  const { error } = await supabase.from('companies').update({
    status: 'active', company_login: login, company_password: password,
  }).eq('id', id);
  if (error) throw error;
}

export async function rejectCompany(id: string): Promise<void> {
  const { error } = await supabase.from('companies').delete().eq('id', id);
  if (error) throw error;
}

export async function updateCompany(id: string, patch: Partial<Company>): Promise<void> {
  const { error } = await supabase.from('companies').update(patch).eq('id', id);
  if (error) throw error;
}

export async function deleteCompany(id: string): Promise<void> {
  const { error } = await supabase.from('companies').delete().eq('id', id);
  if (error) throw error;
}

export async function companyLogin(loginInput: string, password: string): Promise<CompanyLoginResult> {
  const { data, error } = await supabase
    .from('companies').select('*').ilike('company_login', loginInput.trim()).single();
  if (error || !data)               return { ok: false, reason: 'not_found' };
  if (data.blocked)                 return { ok: false, reason: 'blocked' };
  if (data.status !== 'active')     return { ok: false, reason: 'not_active' };
  if (data.company_password !== password) return { ok: false, reason: 'wrong_password' };
  return { ok: true, company: data };
}