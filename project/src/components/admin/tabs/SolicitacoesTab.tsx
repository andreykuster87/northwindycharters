// src/components/admin/tabs/SolicitacoesTab.tsx
import { useState, useRef } from 'react';
import { ShieldCheck, Anchor, Users, XCircle, Check, Ship, Building2 } from 'lucide-react';
import {
  resolveDocUrl,
  type Sailor, type Client, type Boat,
  getSailorApplications,
} from '../../../lib/localStore';
import {
  getPendingCompanies, approveCompany, rejectCompany,
  type Company,
} from '../../../lib/localStore';
import { DocImage, DOC_TYPE_LABELS } from '../../shared/adminHelpers';
import { DossierBoat } from '../../shared/DossierBoat';
import { CandidatosTab } from './CandidatosTab';

// ── Props ─────────────────────────────────────────────────────────────────────
interface SolicitacoesTabProps {
  pendingSailors:  Sailor[];
  pendingClients:  Client[];
  pendingBoats?:   Boat[];
  sailors?:        Sailor[];
  initialSub?:     'profissionais' | 'usuarios' | 'embarcacoes' | 'empresas' | 'tripulacao';
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
      <div className="bg-gray-50 rounded-xl p-2.5">
        <p className="text-[9px] font-black text-gray-400 uppercase">{label}</p>
        <p className="font-bold text-blue-900 text-xs mt-0.5 truncate">{value}</p>
      </div>
    ) : null;

  return (
    <div className="bg-white border-2 border-amber-100 rounded-[30px] overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-700 to-amber-600 px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-black text-white uppercase italic truncate">{company.nome_fantasia}</p>
            <p className="text-[11px] font-bold text-amber-200 truncate">{company.razao_social}</p>
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <span className="bg-yellow-300 text-yellow-900 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">⏳ Pendente</span>
            <span className="bg-white/20 text-white text-[9px] font-black px-2 py-0.5 rounded-full">{company.profile_number}</span>
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
          className="w-full text-center text-xs font-black text-blue-900 hover:text-blue-700 transition-colors py-1">
          {expanded ? '▲ Ocultar detalhes' : '▼ Ver mais detalhes'}
        </button>

        {expanded && (
          <div className="space-y-3 border-t-2 border-gray-100 pt-3">
            {company.descricao && (
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Descrição</p>
                <p className="text-xs font-bold text-blue-900">{company.descricao}</p>
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
            <div className="bg-blue-50 rounded-[16px] p-3 space-y-2">
              <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest">👤 Responsável</p>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Nome"   value={company.resp_nome} />
                <Field label="Cargo"  value={company.resp_cargo} />
                <Field label="E-mail" value={company.resp_email} />
                <Field label="Tel."   value={company.resp_telefone} />
              </div>
            </div>

            {/* Declarações */}
            <div className="flex gap-2">
              <span className={`text-[10px] font-black px-3 py-1.5 rounded-full ${company.declarou_veracidade ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                {company.declarou_veracidade ? '✅ Veracidade confirmada' : '❌ Sem declaração'}
              </span>
              <span className={`text-[10px] font-black px-3 py-1.5 rounded-full ${company.aceitou_termos ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                {company.aceitou_termos ? '✅ Termos aceites' : '❌ Termos não aceites'}
              </span>
            </div>
          </div>
        )}

        {/* Ações */}
        <div className="flex gap-3 pt-1">
          <button onClick={onReject}
            className="flex-1 border-2 border-red-200 text-red-600 hover:bg-red-50 py-3 rounded-2xl font-black text-xs uppercase transition-all flex items-center justify-center gap-1">
            <XCircle className="w-3.5 h-3.5" /> Rejeitar
          </button>
          <button onClick={onApprove}
            className="flex-1 bg-green-600 hover:bg-green-500 text-white py-3 rounded-2xl font-black text-xs uppercase transition-all flex items-center justify-center gap-1 shadow-md">
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
      <div className="bg-gray-50 rounded-xl p-2.5">
        <p className="text-[9px] font-black text-gray-400 uppercase">{label}</p>
        <p className="font-bold text-blue-900 text-xs mt-0.5 truncate">{value}</p>
      </div>
    ) : null;

  const DocRow = ({ label, data }: { label: string; data?: { front: string; back: string } }) => {
    if (!data?.front && !data?.back) return null;
    return (
      <div className="space-y-1">
        <p className="text-[10px] font-black text-gray-400 uppercase">{label}</p>
        <div className={`grid ${data.back ? 'grid-cols-2' : 'grid-cols-1'} gap-2`}>
          {data.front && <DocImage url={data.front} label="Frente" />}
          {data.back  && <DocImage url={data.back}  label="Verso"  />}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white border-2 border-blue-100 rounded-[30px] overflow-hidden">
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/10 rounded-full overflow-hidden flex-shrink-0">
            {boat.cover_photo
              ? <img src={boat.cover_photo} className="w-full h-full object-cover" alt="" />
              : <div className="w-full h-full flex items-center justify-center text-2xl">⛵</div>}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-black text-white uppercase italic truncate">{boat.name}</p>
            <p className="text-xs font-bold text-blue-200">{boat.type} · Cap. {boat.capacity} pax</p>
          </div>
          <span className="bg-yellow-400 text-yellow-900 text-[9px] font-black uppercase px-2 py-0.5 rounded-full flex-shrink-0">⏳ Pendente</span>
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
          className="w-full text-center text-xs font-black text-blue-900 hover:text-blue-700 transition-colors py-1">
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
            className="flex-1 border-2 border-red-200 text-red-600 hover:bg-red-50 py-3 rounded-2xl font-black text-xs uppercase transition-all flex items-center justify-center gap-1">
            <XCircle className="w-3.5 h-3.5" /> Rejeitar
          </button>
          <button onClick={onApprove}
            className="flex-1 bg-green-600 hover:bg-green-500 text-white py-3 rounded-2xl font-black text-xs uppercase transition-all flex items-center justify-center gap-1 shadow-md">
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
  const [sub, setSub] = useState<'profissionais' | 'usuarios' | 'embarcacoes' | 'empresas'>(
    (initialSub === 'tripulacao' ? 'profissionais' : initialSub) || 'profissionais'
  );
  const prevInitialSub = useRef(initialSub);
  if (initialSub && initialSub !== prevInitialSub.current) {
    prevInitialSub.current = initialSub;
    setSub(initialSub);
  }
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

  const tabs = [
    ['profissionais', 'Profissionais', Anchor,    profissionaisBadge,     'bg-yellow-500'],
    ['usuarios',      'Usuários',      Users,     pendingClients.length,  'bg-amber-400'],
    ['embarcacoes',   'Embarcações',   Ship,      pendingBoats.length,    'bg-blue-500'],
    ['empresas',      'Empresas',      Building2, pendingCompanies.length,'bg-amber-600'],
  ] as const;

  return (
    <>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-black text-blue-900 uppercase italic">Solicitações de Cadastro</h2>
          <p className="text-gray-400 font-bold text-sm uppercase mt-1">Gerencie e verifique os cadastros recebidos</p>
        </div>

        {/* Sub-tabs */}
        <div className="bg-gray-100 rounded-[25px] p-1.5 flex gap-1 flex-wrap w-fit">
          {tabs.map(([k, l, Icon, badge, bc]) => (
            <button key={k} onClick={() => setSub(k)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-[18px] font-black text-sm transition-all ${sub === k ? 'bg-white text-blue-900 shadow-md' : 'text-gray-500 hover:text-blue-900'}`}>
              <Icon className="w-4 h-4" /> {l}
              {badge > 0 && <span className={`${bc} text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full`}>{badge}</span>}
            </button>
          ))}
        </div>

        {/* ── Profissionais pendentes ── */}
        {sub === 'profissionais' && (
          <div className="space-y-8">
            {/* Marinheiros cadastrados diretamente */}
            <div>
              <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Cadastros de Profissionais</h3>
              {pendingSailors.length === 0 ? (
                <div className="bg-white rounded-[40px] p-10 text-center border-2 border-dashed border-gray-200">
                  <div className="text-4xl mb-3">✅</div>
                  <p className="text-gray-400 font-black uppercase italic">Nenhum cadastro pendente</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {pendingSailors.map(s => (
                    <div key={s.id} onClick={() => onOpenSailorDossier(s)}
                      className="bg-white border-2 border-yellow-200 rounded-[30px] p-6 cursor-pointer hover:border-blue-900 transition-all group">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center font-black text-yellow-700 text-lg">
                          {s.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-black text-blue-900 uppercase italic">{s.name}</p>
                            {(s as any).profile_number && (
                              <span className="bg-blue-100 text-blue-700 text-[9px] font-black px-2 py-0.5 rounded-full">
                                #{String(parseInt((s as any).profile_number, 10))}
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-bold text-gray-400">{s.email}</p>
                        </div>
                        <span className="bg-yellow-100 text-yellow-700 text-[10px] font-black uppercase px-3 py-1 rounded-full">⏳ Pendente</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-gray-400">{s.phone} · {s.nacionalidade}</p>
                        <span className="text-blue-900 text-xs font-black opacity-0 group-hover:opacity-100 transition-all">Ver dossiê →</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Candidaturas de passageiros → tripulantes */}
            <div>
              <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Candidaturas de Passageiros</h3>
              <CandidatosTab onDataChange={onDataChange} />
            </div>
          </div>
        )}

        {/* ── Usuários pendentes ── */}
        {sub === 'usuarios' && (
          pendingClients.length === 0 ? (
            <div className="bg-white rounded-[40px] p-16 text-center border-2 border-dashed border-gray-200">
              <div className="text-5xl mb-4">👤</div>
              <p className="text-gray-400 font-black uppercase italic text-lg">Nenhum usuário pendente</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pendingClients.map(c => {
                const frontUrl = resolveDocUrl((c as any).doc_url);
                const backUrl  = resolveDocUrl((c as any).doc_back_url);
                return (
                  <div key={c.id} className="bg-white border-2 border-amber-200 rounded-[30px] overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-900 to-blue-800 px-6 py-4 flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/20 text-white rounded-full flex items-center justify-center font-black text-lg flex-shrink-0">
                        {c.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-white uppercase italic truncate">{c.name}</p>
                        <p className="text-xs font-bold text-blue-200 truncate">{c.email}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span className="bg-amber-400 text-amber-900 text-[10px] font-black uppercase px-3 py-1 rounded-full">⏳ Pendente</span>
                        {(c as any).profile_number && (
                          <span className="bg-white/20 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
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
                          <div key={l} className="bg-gray-50 rounded-[12px] p-2.5">
                            <p className="text-[9px] font-black text-gray-400 uppercase">{l}</p>
                            <p className="font-bold text-blue-900 text-xs mt-0.5 truncate">{v}</p>
                          </div>
                        ))}
                      </div>
                      {frontUrl && <DocImage url={frontUrl} label="Frente do Documento" />}
                      {backUrl  && <DocImage url={backUrl}  label="Verso do Documento" />}
                      <button onClick={() => onVerifyClient(c)}
                        className="w-full bg-green-600 hover:bg-green-500 text-white py-4 rounded-[20px] font-black uppercase text-sm transition-all flex items-center justify-center gap-2 shadow-md">
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
            <div className="bg-white rounded-[40px] p-16 text-center border-2 border-dashed border-gray-200">
              <div className="text-5xl mb-4">⛵</div>
              <p className="text-gray-400 font-black uppercase italic text-lg">Nenhuma embarcação pendente</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pendingBoats.map(b => (
                <div key={b.id} onClick={() => setDossierBoat(b)}
                  className="bg-white border-2 border-blue-100 rounded-[30px] overflow-hidden cursor-pointer hover:border-blue-900 hover:shadow-lg transition-all group">
                  <div className="relative h-32 bg-blue-50 overflow-hidden">
                    {b.cover_photo
                      ? <img src={b.cover_photo} alt={b.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      : <div className="w-full h-full flex items-center justify-center text-4xl opacity-20">⛵</div>}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <span className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">⏳ Pendente</span>
                    {(b.photos || []).length > 1 && (
                      <span className="absolute bottom-2 right-2 bg-black/50 text-white text-[9px] font-black px-2 py-0.5 rounded-full">📷 {b.photos.length}</span>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-black text-blue-900 uppercase italic truncate">{b.name}</p>
                        <p className="text-xs font-bold text-gray-400">{b.type} · Cap. {b.capacity} pax</p>
                      </div>
                      <Ship className="w-4 h-4 text-blue-300 flex-shrink-0 mt-0.5" />
                    </div>
                    {((b as any).proprietario || (b as any).matricula) && (
                      <div className="grid grid-cols-2 gap-1.5 mt-2">
                        {(b as any).matricula && (
                          <div className="bg-gray-50 rounded-lg p-2">
                            <p className="text-[8px] font-black text-gray-400 uppercase">Matrícula</p>
                            <p className="text-[10px] font-bold text-blue-900 truncate">{(b as any).matricula}</p>
                          </div>
                        )}
                        {(b as any).proprietario && (
                          <div className="bg-gray-50 rounded-lg p-2">
                            <p className="text-[8px] font-black text-gray-400 uppercase">Proprietário</p>
                            <p className="text-[10px] font-bold text-blue-900 truncate">{(b as any).proprietario}</p>
                          </div>
                        )}
                      </div>
                    )}
                    <p className="text-[10px] font-black text-blue-900 uppercase text-center mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      Ver dossiê completo →
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* ── Empresas pendentes ── */}
        {sub === 'empresas' && (
          pendingCompanies.length === 0 ? (
            <div className="bg-white rounded-[40px] p-16 text-center border-2 border-dashed border-gray-200">
              <div className="text-5xl mb-4">🏢</div>
              <p className="text-gray-400 font-black uppercase italic text-lg">Nenhuma empresa pendente</p>
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
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-blue-900/70 backdrop-blur-md">
          <div className="bg-white w-full max-w-sm rounded-[40px] shadow-2xl border-4 border-red-400 animate-in zoom-in-95 duration-300 overflow-hidden">
            <div className="bg-red-500 px-8 py-6 text-center">
              <div className="text-4xl mb-2">⚠️</div>
              <h3 className="text-xl font-black text-white uppercase italic">Recusar Candidatura</h3>
              <p className="text-red-200 text-xs font-bold mt-1 uppercase tracking-widest">{rejectTarget.name}</p>
            </div>
            <div className="p-8 space-y-5">
              <p className="text-gray-600 font-bold text-sm text-center">Selecione um ou mais motivos da recusa.</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[10px] font-black text-gray-400 uppercase">Motivos da recusa</p>
                  {rejectReasons.length > 0 && (
                    <span className="bg-red-100 text-red-600 text-[10px] font-black px-2 py-0.5 rounded-full">
                      {rejectReasons.length} selecionado{rejectReasons.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                {REJECT_REASONS.map(([key, emoji, label]) => {
                  const checked = rejectReasons.includes(key);
                  return (
                    <button key={key} type="button" onClick={() => toggleReason(key)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-[16px] border-2 font-bold text-sm text-left transition-all
                        ${checked ? 'border-red-400 bg-red-50 text-red-800' : 'border-gray-100 bg-gray-50 text-gray-600 hover:border-red-200'}`}>
                      <span className="text-lg flex-shrink-0">{emoji}</span>
                      <span className="flex-1">{label}</span>
                      <div className={`w-5 h-5 rounded-[6px] border-2 flex items-center justify-center flex-shrink-0 transition-all
                        ${checked ? 'bg-red-500 border-red-500' : 'border-gray-300 bg-white'}`}>
                        {checked && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => { setRejectTarget(null); setRejectReasons([]); }}
                  className="flex-1 border-2 border-gray-100 text-gray-500 hover:border-gray-300 py-4 rounded-[25px] font-black text-sm uppercase transition-all">
                  Cancelar
                </button>
                <button onClick={handleConfirmReject} disabled={rejectReasons.length === 0}
                  className="flex-1 bg-red-500 hover:bg-red-400 text-white py-4 rounded-[25px] font-black text-sm uppercase transition-all shadow-lg disabled:opacity-40 flex items-center justify-center gap-2">
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