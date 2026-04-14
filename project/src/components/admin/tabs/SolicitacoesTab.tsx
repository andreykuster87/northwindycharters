// src/components/admin/tabs/SolicitacoesTab.tsx
import { useState, useRef } from 'react';
import { ShieldCheck, Anchor, Users, XCircle, Check, Ship, Building2, FileText, UserCheck } from 'lucide-react';
import {
  resolveDocUrl,
  type Sailor, type Client, type Boat,
  getSailorApplications,
  getSailors, updateSailor,
} from '../../../lib/localStore';
import {
  getPendingCompanies, approveCompany, rejectCompany,
  type Company,
} from '../../../lib/localStore';
import { DocImage, DOC_TYPE_LABELS } from '../../shared/adminHelpers';
import { DossierBoat } from '../../shared/DossierBoat';
import { CandidatosTab } from './CandidatosTab';

// ── Helper: apply approved pending doc to sailor fields ───────────────────────
async function applyPendingDoc(sailor: Sailor, docKey: string, pendingDoc: { doc_url: string; validade?: string; numero?: string }) {
  const patch: any = {};

  if (docKey === 'passaporte') {
    patch.passaporte = { ...sailor.passaporte, doc_url: pendingDoc.doc_url, validade: pendingDoc.validade || sailor.passaporte?.validade, numero: pendingDoc.numero || sailor.passaporte?.numero };
  } else if (docKey === 'caderneta_maritima') {
    patch.caderneta_maritima = { possui: true, doc_url: pendingDoc.doc_url, validade: pendingDoc.validade, numero: pendingDoc.numero };
  } else if (docKey === 'cartahabitacao') {
    patch.cartahabitacao = { ...sailor.cartahabitacao, doc_url: pendingDoc.doc_url, validade: pendingDoc.validade || sailor.cartahabitacao?.validade, numero: pendingDoc.numero || sailor.cartahabitacao?.numero };
  } else if (docKey === 'medico') {
    patch.medico = { ...sailor.medico, doc_url: pendingDoc.doc_url, validade: pendingDoc.validade || sailor.medico?.validade, numero: pendingDoc.numero || sailor.medico?.numero };
  } else if (docKey.startsWith('stcw_')) {
    const certId = docKey.replace('stcw_', '');
    patch.stcw = { ...sailor.stcw, [certId]: true };
    if (pendingDoc.validade) {
      patch.stcw_validades = { ...(sailor.stcw_validades ?? {}), [certId]: pendingDoc.validade };
    }
  }

  // Remove from pending_docs
  const newPending = { ...(sailor.pending_docs ?? {}) };
  delete newPending[docKey];
  patch.pending_docs = Object.keys(newPending).length > 0 ? newPending : null;

  await updateSailor(sailor.id, patch);
}

async function rejectPendingDoc(sailor: Sailor, docKey: string) {
  const newPending = { ...(sailor.pending_docs ?? {}) };
  delete newPending[docKey];
  await updateSailor(sailor.id, {
    pending_docs: Object.keys(newPending).length > 0 ? newPending : null,
  } as any);
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface SolicitacoesTabProps {
  pendingSailors:  Sailor[];
  pendingClients:  Client[];
  pendingBoats?:   Boat[];
  sailors?:        Sailor[];
  initialSub?:     'profissionais' | 'usuarios' | 'embarcacoes' | 'empresas' | 'tripulacao' | 'documentos';
  onOpenSailorDossier: (sailor: Sailor) => void;
  onVerifyClient:  (client: Client) => void;
  onRejectSailor:  (sailor: Sailor, reasons: string[]) => void;
  onApproveBoat?:  (boat: Boat) => void;
  onRejectBoat?:   (boat: Boat) => void;
  onDataChange?:   () => void;
}

const REJECT_REASONS: [string, string, string][] = [
  ['docs_incompletos',     '📄', 'Documentação incompleta ou ilegível'],
  ['habilitacao_invalida', '⚓', 'Habilitação náutica inválida ou expirada'],
  ['medico_invalido',      '🩺', 'Certificado médico inválido ou expirado'],
  ['dados_incorretos',     '✏️', 'Dados pessoais incorretos ou inconsistentes'],
  ['outro',                '❓', 'Outro motivo'],
];

// ── CompanyCard ───────────────────────────────────────────────────────────────
function CompanyCard({
  company,
  onApprove,
  onReject,
}: { company: Company; onApprove: () => void; onReject: () => void }) {
  const [expanded, setExpanded] = useState(false);

  const Field = ({ label, value }: { label: string; value?: string }) =>
    value ? (
      <div className="bg-gray-50 p-2.5">
        <p className="text-[9px] font-semibold text-gray-400 uppercase">{label}</p>
        <p className="font-bold text-[#1a2b4a] text-xs mt-0.5 truncate">{value}</p>
      </div>
    ) : null;

  return (
    <div className="bg-white border-2 border-amber-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-700 to-amber-600 px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 flex items-center justify-center flex-shrink-0">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-white uppercase truncate">{company.nome_fantasia}</p>
            <p className="text-[11px] font-bold text-amber-200 truncate">{company.razao_social}</p>
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <span className="bg-yellow-300 text-yellow-900 text-[9px] font-semibold uppercase px-2 py-0.5">⏳ Pendente</span>
            <span className="bg-white/20 text-white text-[9px] font-semibold px-2 py-0.5">{company.profile_number}</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <Field label="Setor"            value={company.setor} />
          <Field label="País"             value={`${company.pais_nome} (${company.pais})`} />
          <Field label="Cidade"           value={`${company.cidade}${company.estado ? `, ${company.estado}` : ''}`} />
          <Field label="E-mail"           value={company.email} />
          <Field label="Telefone"         value={company.telefone} />
          <Field label="Nº Fiscal"        value={`${company.numero_fiscal} (${company.pais_fiscal})`} />
          <Field label="Nº Registro"      value={company.numero_registro} />
          <Field label="Cadastrado em"    value={new Date(company.created_at).toLocaleDateString('pt-PT')} />
        </div>

        {/* Toggle expandido */}
        <button
          onClick={() => setExpanded(v => !v)}
          className="w-full text-center text-xs font-semibold text-[#1a2b4a] hover:text-[#c9a96e] transition-colors py-1">
          {expanded ? '▲ Ocultar detalhes' : '▼ Ver mais detalhes'}
        </button>

        {expanded && (
          <div className="space-y-3 border-t-2 border-gray-100 pt-3">
            {company.descricao && (
              <div className="bg-gray-50 p-3">
                <p className="text-[9px] font-semibold text-gray-400 uppercase mb-1">Descrição</p>
                <p className="text-xs font-bold text-[#1a2b4a]">{company.descricao}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-2">
              <Field label="Endereço"     value={company.endereco} />
              <Field label="Cod. Postal"  value={company.codigo_postal} />
              <Field label="Website"      value={company.website} />
              <Field label="Instagram"    value={company.instagram} />
              <Field label="LinkedIn"     value={company.linkedin} />
              <Field label="Facebook"     value={company.facebook} />
            </div>

            {/* Responsável */}
            <div className="bg-[#0a1628]/5 p-3 space-y-2">
              <p className="text-[9px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em]">👤 Responsável</p>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Nome"   value={company.resp_nome} />
                <Field label="Cargo"  value={company.resp_cargo} />
                <Field label="E-mail" value={company.resp_email} />
                <Field label="Tel."   value={company.resp_telefone} />
              </div>
            </div>

            {/* Declarações */}
            <div className="flex gap-2">
              <span className={`text-[10px] font-semibold px-3 py-1.5 ${company.declarou_veracidade ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                {company.declarou_veracidade ? '✅ Veracidade confirmada' : '❌ Sem declaração'}
              </span>
              <span className={`text-[10px] font-semibold px-3 py-1.5 ${company.aceitou_termos ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                {company.aceitou_termos ? '✅ Termos aceites' : '❌ Termos não aceites'}
              </span>
            </div>
          </div>
        )}

        {/* Ações */}
        <div className="flex gap-3 pt-1">
          <button onClick={onReject}
            className="flex-1 border-2 border-red-200 text-red-600 hover:bg-red-50 py-3 font-semibold text-xs uppercase transition-all flex items-center justify-center gap-1">
            <XCircle className="w-3.5 h-3.5" /> Rejeitar
          </button>
          <button onClick={onApprove}
            className="flex-1 bg-green-600 hover:bg-green-500 text-white py-3 font-semibold text-xs uppercase transition-all flex items-center justify-center gap-1 shadow-md">
            <ShieldCheck className="w-3.5 h-3.5" /> Aprovar
          </button>
        </div>
      </div>
    </div>
  );
}

// ── BoatCard — card expandível com todos os dados da embarcação ───────────────
function BoatCard({ boat, onApprove, onReject }: { boat: Boat; onApprove?: () => void; onReject?: () => void }) {
  const [expanded, setExpanded] = useState(false);
  let meta: any = {};
  try { meta = JSON.parse((boat as any).metadata || '{}'); } catch {}

  const docs = meta.docs || {};

  const Field = ({ label, value }: { label: string; value?: string }) =>
    value ? (
      <div className="bg-gray-50 p-2.5">
        <p className="text-[9px] font-semibold text-gray-400 uppercase">{label}</p>
        <p className="font-bold text-[#1a2b4a] text-xs mt-0.5 truncate">{value}</p>
      </div>
    ) : null;

  const DocRow = ({ label, data }: { label: string; data?: { front: string; back: string } }) => {
    if (!data?.front && !data?.back) return null;
    return (
      <div className="space-y-1">
        <p className="text-[10px] font-semibold text-gray-400 uppercase">{label}</p>
        <div className={`grid ${data.back ? 'grid-cols-2' : 'grid-cols-1'} gap-2`}>
          {data.front && <DocImage url={data.front} label="Frente" />}
          {data.back  && <DocImage url={data.back}  label="Verso"  />}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white border-2 border-[#c9a96e]/20 overflow-hidden">
      <div className="bg-[#0a1628] px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/10 overflow-hidden flex-shrink-0">
            {boat.cover_photo
              ? <img src={boat.cover_photo} className="w-full h-full object-cover" alt="" />
              : <div className="w-full h-full flex items-center justify-center text-2xl">⛵</div>}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-white uppercase truncate">{boat.name}</p>
            <p className="text-xs font-bold text-[#c9a96e]">{boat.type} · Cap. {boat.capacity} pax</p>
          </div>
          <span className="bg-yellow-400 text-yellow-900 text-[9px] font-semibold uppercase px-2 py-0.5 flex-shrink-0">⏳ Pendente</span>
        </div>
      </div>

      <div className="p-5 space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <Field label="Matrícula"    value={(boat as any).matricula} />
          <Field label="Porto"        value={(boat as any).porto} />
          <Field label="Bandeira"     value={(boat as any).bandeira} />
          <Field label="Proprietário" value={(boat as any).proprietario} />
          <Field label="NIF"          value={(boat as any).nif} />
          <Field label="Material"     value={(boat as any).material} />
        </div>

        <button
          onClick={() => setExpanded(v => !v)}
          className="w-full text-center text-xs font-semibold text-[#1a2b4a] hover:text-[#c9a96e] transition-colors py-1">
          {expanded ? '▲ Ocultar documentos' : '▼ Ver documentos'}
        </button>

        {expanded && (
          <div className="space-y-3 border-t-2 border-gray-100 pt-3">
            <DocRow label="Licença de Navegação" data={docs.licNav}  />
            <DocRow label="Certificado de Navegabilidade" data={docs.certNav} />
            <DocRow label="Seguro" data={docs.seguro} />
            <DocRow label="Licença de Passageiros" data={docs.licPass} />
          </div>
        )}

        <div className="flex gap-3 pt-1">
          <button onClick={onReject}
            className="flex-1 border-2 border-red-200 text-red-600 hover:bg-red-50 py-3 font-semibold text-xs uppercase transition-all flex items-center justify-center gap-1">
            <XCircle className="w-3.5 h-3.5" /> Rejeitar
          </button>
          <button onClick={onApprove}
            className="flex-1 bg-green-600 hover:bg-green-500 text-white py-3 font-semibold text-xs uppercase transition-all flex items-center justify-center gap-1 shadow-md">
            <ShieldCheck className="w-3.5 h-3.5" /> Aprovar
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Componente principal ───────────────────────────────────────────────────────
export function SolicitacoesTab({
  pendingSailors, pendingClients, pendingBoats = [],
  sailors = [],
  initialSub,
  onOpenSailorDossier, onVerifyClient, onRejectSailor,
  onApproveBoat, onRejectBoat, onDataChange,
}: SolicitacoesTabProps) {
  const [sub, setSub] = useState<'profissionais' | 'usuarios' | 'embarcacoes' | 'empresas' | 'documentos'>(
    (initialSub === 'tripulacao' ? 'profissionais' : initialSub) || 'profissionais'
  );
  const prevInitialSub = useRef(initialSub);
  if (initialSub && initialSub !== prevInitialSub.current) {
    prevInitialSub.current = initialSub;
    if (initialSub !== 'tripulacao') setSub(initialSub as any);
  }
  const [docsKey, setDocsKey] = useState(0);
  const [rejectTarget,   setRejectTarget]   = useState<Sailor | null>(null);
  const [rejectReasons,  setRejectReasons]  = useState<string[]>([]);
  const [dossierBoat,    setDossierBoat]    = useState<Boat | null>(null);

  // Empresas — carregadas do store local (reactive: forçar re-render com key)
  const [companiesKey,   setCompaniesKey]   = useState(0);
  const pendingCompanies = getPendingCompanies();

  function toggleReason(key: string) {
    setRejectReasons(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  }
  function handleConfirmReject() {
    if (!rejectTarget) return;
    onRejectSailor(rejectTarget, rejectReasons);
    setRejectTarget(null);
    setRejectReasons([]);
  }

  const candidatosPendentes = getSailorApplications('pending').length;
  const profissionaisBadge = pendingSailors.length + candidatosPendentes;

  // Sailors with pending docs
  const sailorsWithPendingDocs = getSailors().filter(s =>
    s.pending_docs && Object.values(s.pending_docs).some(d => d.status === 'pending')
  );
  const pendingDocsBadge = sailorsWithPendingDocs.reduce((acc, s) =>
    acc + Object.values(s.pending_docs ?? {}).filter(d => d.status === 'pending').length, 0
  );

  const tabs = [
    ['profissionais', 'Profissionais', Anchor,     pendingSailors.length,   'bg-yellow-500'],
    ['usuarios',      'Usuários',      Users,      pendingClients.length,   'bg-amber-400'],
    ['embarcacoes',   'Embarcações',   Ship,       pendingBoats.length,     'bg-[#0a1628]'],
    ['empresas',      'Empresas',      Building2,  pendingCompanies.length, 'bg-amber-600'],
    ['tripulacao',    'Tripulação',    UserCheck,  candidatosPendentes,     'bg-teal-600'],
    ['documentos',    'Documentos',    FileText,   pendingDocsBadge,        'bg-blue-600'],
  ] as const;

  return (
    <>
      <div className="space-y-6">
        <div>
          <h2 className="font-['Playfair_Display'] font-bold text-3xl text-[#1a2b4a]">Solicitações de Cadastro</h2>
          <p className="text-gray-400 font-bold text-sm uppercase mt-1">Gerencie e verifique os cadastros recebidos</p>
        </div>

        {/* Sub-tabs */}
        <div className="bg-gray-100 p-1.5 flex gap-1 flex-wrap w-fit">
          {tabs.map(([k, l, Icon, badge, bc]) => (
            <button key={k} onClick={() => setSub(k)}
              className={`flex items-center gap-2 px-5 py-2.5 font-semibold text-sm transition-all ${sub === k ? 'bg-white text-[#1a2b4a] shadow-md' : 'text-gray-500 hover:text-[#1a2b4a]'}`}>
              <Icon className="w-4 h-4" /> {l}
              {badge > 0 && <span className={`${bc} text-white text-[10px] w-5 h-5 flex items-center justify-center`}>{badge}</span>}
            </button>
          ))}
        </div>

        {/* ── Profissionais pendentes ── */}
        {sub === 'profissionais' && (
          <div className="space-y-8">
            {/* Marinheiros cadastrados diretamente */}
            <div>
              <h3 className="text-sm font-semibold text-[#c9a96e] uppercase tracking-[0.15em] mb-4">Cadastros de Profissionais</h3>
              {pendingSailors.length === 0 ? (
                <div className="bg-white p-10 text-center border-2 border-dashed border-gray-200">
                  <div className="text-4xl mb-3">✅</div>
                  <p className="text-gray-400 font-semibold uppercase">Nenhum cadastro pendente</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {pendingSailors.map(s => (
                    <div key={s.id} onClick={() => onOpenSailorDossier(s)}
                      className="bg-white border-2 border-yellow-200 p-6 cursor-pointer hover:border-[#0a1628] transition-all group">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="w-12 h-12 bg-yellow-100 flex items-center justify-center font-bold text-yellow-700 text-lg">
                          {s.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-[#1a2b4a] uppercase">{s.name}</p>
                            {(s as any).profile_number && (
                              <span className="bg-[#c9a96e]/15 text-[#c9a96e] text-[9px] font-semibold px-2 py-0.5">
                                #{String(parseInt((s as any).profile_number, 10))}
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-bold text-gray-400">{s.email}</p>
                        </div>
                        <span className="bg-yellow-100 text-yellow-700 text-[10px] font-semibold uppercase px-3 py-1">⏳ Pendente</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-gray-400">{s.phone} · {s.nacionalidade}</p>
                        <span className="text-[#1a2b4a] text-xs font-semibold opacity-0 group-hover:opacity-100 transition-all">Ver dossiê →</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* ── Usuários pendentes ── */}
        {sub === 'usuarios' && (
          pendingClients.length === 0 ? (
            <div className="bg-white p-16 text-center border-2 border-dashed border-gray-200">
              <div className="text-5xl mb-4">👤</div>
              <p className="text-gray-400 font-semibold uppercase text-lg">Nenhum usuário pendente</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pendingClients.map(c => {
                const frontUrl = resolveDocUrl((c as any).doc_url);
                const backUrl  = resolveDocUrl((c as any).doc_back_url);
                return (
                  <div key={c.id} className="bg-white border-2 border-amber-200 overflow-hidden">
                    <div className="bg-[#0a1628] px-6 py-4 flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/20 text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
                        {c.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-white uppercase truncate">{c.name}</p>
                        <p className="text-xs font-bold text-[#c9a96e] truncate">{c.email}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span className="bg-amber-400 text-amber-900 text-[10px] font-semibold uppercase px-3 py-1">⏳ Pendente</span>
                        {(c as any).profile_number && (
                          <span className="bg-white/20 text-white text-[10px] font-semibold px-2 py-0.5">
                            Perfil #{String(parseInt((c as any).profile_number, 10))}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="p-5 space-y-4">
                      <div className="grid grid-cols-2 gap-2">
                        {([
                          ['País',         c.country_name || '—'],
                          ['Telefone',     c.phone || '—'],
                          ['Nascimento',   (c as any).birth_date || '—'],
                          ['Idioma',       (c as any).language || '—'],
                          ['Tipo Doc.',    DOC_TYPE_LABELS[(c as any).doc_type || ''] || (c as any).doc_type || '—'],
                          ['Nº Documento', c.passport_number || '—'],
                          ['Validade Doc.',c.passport_expires ? new Date(c.passport_expires + 'T12:00').toLocaleDateString('pt-BR') : '—'],
                          ['Cadastro',     new Date(c.created_at).toLocaleDateString('pt-BR')],
                        ] as [string, string][]).map(([l, v]) => (
                          <div key={l} className="bg-gray-50 p-2.5">
                            <p className="text-[9px] font-semibold text-gray-400 uppercase">{l}</p>
                            <p className="font-bold text-[#1a2b4a] text-xs mt-0.5 truncate">{v}</p>
                          </div>
                        ))}
                      </div>
                      {frontUrl && <DocImage url={frontUrl} label="Frente do Documento" />}
                      {backUrl  && <DocImage url={backUrl}  label="Verso do Documento" />}
                      <button onClick={() => onVerifyClient(c)}
                        className="w-full bg-green-600 hover:bg-green-500 text-white py-4 font-semibold uppercase text-sm transition-all flex items-center justify-center gap-2 shadow-md">
                        <ShieldCheck className="w-4 h-4" /> Verificar e Aprovar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}

        {/* ── Embarcações pendentes ── */}
        {sub === 'embarcacoes' && (
          pendingBoats.length === 0 ? (
            <div className="bg-white p-16 text-center border-2 border-dashed border-gray-200">
              <div className="text-5xl mb-4">⛵</div>
              <p className="text-gray-400 font-semibold uppercase text-lg">Nenhuma embarcação pendente</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pendingBoats.map(b => (
                <div key={b.id} onClick={() => setDossierBoat(b)}
                  className="bg-white border-2 border-[#c9a96e]/20 overflow-hidden cursor-pointer hover:border-[#0a1628] hover:shadow-lg transition-all group">
                  <div className="relative h-32 bg-[#0a1628]/5 overflow-hidden">
                    {b.cover_photo
                      ? <img src={b.cover_photo} alt={b.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      : <div className="w-full h-full flex items-center justify-center text-4xl opacity-20">⛵</div>}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <span className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-[9px] font-semibold uppercase px-2 py-0.5">⏳ Pendente</span>
                    {(b.photos || []).length > 1 && (
                      <span className="absolute bottom-2 right-2 bg-black/50 text-white text-[9px] font-semibold px-2 py-0.5">📷 {b.photos.length}</span>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-bold text-[#1a2b4a] uppercase truncate">{b.name}</p>
                        <p className="text-xs font-bold text-gray-400">{b.type} · Cap. {b.capacity} pax</p>
                      </div>
                      <Ship className="w-4 h-4 text-[#c9a96e] flex-shrink-0 mt-0.5" />
                    </div>
                    {((b as any).proprietario || (b as any).matricula) && (
                      <div className="grid grid-cols-2 gap-1.5 mt-2">
                        {(b as any).matricula && (
                          <div className="bg-gray-50 p-2">
                            <p className="text-[8px] font-semibold text-gray-400 uppercase">Matrícula</p>
                            <p className="text-[10px] font-bold text-[#1a2b4a] truncate">{(b as any).matricula}</p>
                          </div>
                        )}
                        {(b as any).proprietario && (
                          <div className="bg-gray-50 p-2">
                            <p className="text-[8px] font-semibold text-gray-400 uppercase">Proprietário</p>
                            <p className="text-[10px] font-bold text-[#1a2b4a] truncate">{(b as any).proprietario}</p>
                          </div>
                        )}
                      </div>
                    )}
                    <p className="text-[10px] font-semibold text-[#1a2b4a] uppercase text-center mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      Ver dossiê completo →
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* ── Tripulação (candidaturas de passageiros) ── */}
        {sub === 'tripulacao' && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-[#c9a96e] uppercase tracking-[0.15em]">Candidatos a Tripulação</h3>
            <CandidatosTab onDataChange={onDataChange} />
          </div>
        )}

        {/* ── Documentos pendentes ── */}
        {sub === 'documentos' && (
          <div key={docsKey}>
            {sailorsWithPendingDocs.length === 0 ? (
              <div className="bg-white p-16 text-center border-2 border-dashed border-gray-200">
                <div className="text-5xl mb-4">📄</div>
                <p className="text-gray-400 font-semibold uppercase text-lg">Nenhum documento pendente</p>
              </div>
            ) : (
              <div className="space-y-6">
                {sailorsWithPendingDocs.map(s => {
                  const pendingEntries = Object.entries(s.pending_docs ?? {}).filter(([, d]) => d.status === 'pending');
                  if (pendingEntries.length === 0) return null;
                  return (
                    <div key={s.id} className="bg-white border-2 border-blue-100 overflow-hidden">
                      {/* Header */}
                      <div className="bg-[#0a1628] px-6 py-4 flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/10 flex items-center justify-center font-bold text-white text-lg flex-shrink-0">
                          {s.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-white uppercase truncate">{s.name}</p>
                          <p className="text-xs font-bold text-[#c9a96e] truncate">{s.email}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          {(s as any).profile_number && (
                            <span className="bg-white/20 text-white text-[10px] font-semibold px-2 py-0.5">
                              Perfil #{String(parseInt((s as any).profile_number, 10))}
                            </span>
                          )}
                          <span className="bg-blue-500 text-white text-[10px] font-semibold uppercase px-2 py-0.5">
                            {pendingEntries.length} doc{pendingEntries.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>

                      {/* Docs */}
                      <div className="divide-y divide-gray-100">
                        {pendingEntries.map(([docKey, doc]) => {
                          const docLabels: Record<string, string> = {
                            passaporte: 'Documento de Identificação',
                            caderneta_maritima: 'Caderneta Marítima (CIR)',
                            cartahabitacao: 'Carta de Patrão / Mestre',
                            medico: 'Certificado Médico Marítimo',
                            stcw_bst: 'STCW — Básico de Segurança (BST)',
                            stcw_sobrev: 'STCW — Sobrevivência no Mar',
                            stcw_incendio: 'STCW — Combate a Incêndio',
                            stcw_primeiros: 'STCW — Primeiros Socorros',
                            stcw_social: 'STCW — Responsabilidades Sociais',
                          };
                          const label = docLabels[docKey] || docKey;
                          return (
                            <div key={docKey} className="p-5">
                              <div className="flex items-start gap-3 mb-3">
                                <div className="w-9 h-9 bg-blue-50 flex items-center justify-center flex-shrink-0">
                                  <FileText className="w-4 h-4 text-blue-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-[#1a2b4a] text-sm uppercase leading-tight">{label}</p>
                                  <p className="text-[10px] font-semibold text-gray-400 mt-0.5">
                                    Enviado em: {new Date(doc.submitted_at).toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' })}
                                  </p>
                                  {doc.validade && <p className="text-[10px] font-semibold text-gray-500 mt-0.5">Validade: {doc.validade}</p>}
                                  {doc.numero  && <p className="text-[10px] font-semibold text-gray-500 mt-0.5">Número: {doc.numero}</p>}
                                </div>
                                <span className="bg-amber-100 text-amber-700 text-[9px] font-bold uppercase px-2 py-1 flex-shrink-0">⏳ Em revisão</span>
                              </div>

                              {/* Doc preview */}
                              {doc.doc_url && <DocImage url={doc.doc_url} label="Documento enviado" />}

                              {/* Actions */}
                              <div className="flex gap-3 mt-3">
                                <button
                                  onClick={async () => {
                                    await rejectPendingDoc(s, docKey);
                                    setDocsKey(k => k + 1);
                                    onDataChange?.();
                                  }}
                                  className="flex-1 border-2 border-red-200 text-red-600 hover:bg-red-50 py-3 font-semibold text-xs uppercase transition-all flex items-center justify-center gap-1">
                                  <XCircle className="w-3.5 h-3.5" /> Rejeitar
                                </button>
                                <button
                                  onClick={async () => {
                                    const freshSailor = getSailors().find(x => x.id === s.id) ?? s;
                                    await applyPendingDoc(freshSailor, docKey, doc);
                                    setDocsKey(k => k + 1);
                                    onDataChange?.();
                                  }}
                                  className="flex-1 bg-green-600 hover:bg-green-500 text-white py-3 font-semibold text-xs uppercase transition-all flex items-center justify-center gap-1 shadow-md">
                                  <ShieldCheck className="w-3.5 h-3.5" /> Aprovar
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Empresas pendentes ── */}
        {sub === 'empresas' && (
          pendingCompanies.length === 0 ? (
            <div className="bg-white p-16 text-center border-2 border-dashed border-gray-200">
              <div className="text-5xl mb-4">🏢</div>
              <p className="text-gray-400 font-semibold uppercase text-lg">Nenhuma empresa pendente</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pendingCompanies.map(c => (
                <CompanyCard
                  key={c.id}
                  company={c}
                  onApprove={async () => { await approveCompany(c.id); setCompaniesKey(k => k + 1); }}
                  onReject={async () =>  { await rejectCompany(c.id);  setCompaniesKey(k => k + 1); }}
                />
              ))}
            </div>
          )
        )}
      </div>

      {/* ── Dossiê da embarcação ── */}
      {dossierBoat && (
        <DossierBoat
          boat={dossierBoat}
          sailors={sailors}
          mode="pending"
          onClose={() => setDossierBoat(null)}
          onApprove={b => { onApproveBoat?.(b); setDossierBoat(null); }}
          onReject={b => { onRejectBoat?.(b); setDossierBoat(null); }}
        />
      )}

      {/* Modal de Recusa de Profissional */}
      {rejectTarget && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-[#0a1628]/70 backdrop-blur-md">
          <div className="bg-white w-full max-w-sm shadow-2xl border-4 border-red-400 animate-in zoom-in-95 duration-300 overflow-hidden">
            <div className="bg-red-500 px-8 py-6 text-center">
              <div className="text-4xl mb-2">⚠️</div>
              <h3 className="font-['Playfair_Display'] font-bold text-xl text-white uppercase">Recusar Candidatura</h3>
              <p className="text-red-200 text-xs font-bold mt-1 uppercase tracking-widest">{rejectTarget.name}</p>
            </div>
            <div className="p-8 space-y-5">
              <p className="text-gray-600 font-bold text-sm text-center">Selecione um ou mais motivos da recusa.</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase">Motivos da recusa</p>
                  {rejectReasons.length > 0 && (
                    <span className="bg-red-100 text-red-600 text-[10px] font-semibold px-2 py-0.5">
                      {rejectReasons.length} selecionado{rejectReasons.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                {REJECT_REASONS.map(([key, emoji, label]) => {
                  const checked = rejectReasons.includes(key);
                  return (
                    <button key={key} type="button" onClick={() => toggleReason(key)}
                      className={`w-full flex items-center gap-3 px-4 py-3 border-2 font-bold text-sm text-left transition-all
                        ${checked ? 'border-red-400 bg-red-50 text-red-800' : 'border-gray-100 bg-gray-50 text-gray-600 hover:border-red-200'}`}>
                      <span className="text-lg flex-shrink-0">{emoji}</span>
                      <span className="flex-1">{label}</span>
                      <div className={`w-5 h-5 border-2 flex items-center justify-center flex-shrink-0 transition-all
                        ${checked ? 'bg-red-500 border-red-500' : 'border-gray-300 bg-white'}`}>
                        {checked && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => { setRejectTarget(null); setRejectReasons([]); }}
                  className="flex-1 border-2 border-gray-200 text-gray-500 hover:border-[#c9a96e] py-4 font-semibold text-sm uppercase transition-all">
                  Cancelar
                </button>
                <button onClick={handleConfirmReject} disabled={rejectReasons.length === 0}
                  className="flex-1 bg-red-500 hover:bg-red-400 text-white py-4 font-semibold text-sm uppercase transition-all shadow-lg disabled:opacity-40 flex items-center justify-center gap-2">
                  <XCircle className="w-4 h-4" /> Confirmar Recusa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </>
  );
}
