// src/components/admin/tabs/CandidatosTab.tsx
// Aba admin: candidaturas de passageiros para tripulação
import { useState } from 'react';
import { CheckCircle2, XCircle, Eye, Anchor } from 'lucide-react';
import {
  getSailorApplications,
  approveSailorApplication,
  rejectSailorApplication,
  APP_REJECT_REASONS,
  type SailorApplication,
} from '../../../lib/localStore';
import { resolveDocUrl } from '../../../lib/localStore';
import { DocImage, DossierField } from '../../shared/adminHelpers';

function fmtDate(iso?: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ── DossierModal ──────────────────────────────────────────────────────────────
function DossierModal({
  app,
  onApprove,
  onReject,
  onClose,
}: {
  app: SailorApplication;
  onApprove: () => void;
  onReject: (reasons: string[]) => void;
  onClose: () => void;
}) {
  const [rejectMode, setRejectMode] = useState(false);
  const [reasons,    setReasons]    = useState<string[]>([]);
  const [loading,    setLoading]    = useState(false);

  async function handleApprove() {
    setLoading(true);
    try { await onApprove(); } finally { setLoading(false); }
  }
  async function handleReject() {
    if (!reasons.length) return;
    setLoading(true);
    try { await onReject(reasons); } finally { setLoading(false); }
  }

  function Sec({ title }: { title: string }) {
    return <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em] mb-3 mt-1">{title}</p>;
  }

  const frontUrl  = resolveDocUrl(app.caderneta_doc_url);
  const backUrl   = resolveDocUrl(app.caderneta_doc_back_url);
  const docUrls   = [frontUrl, backUrl].filter(Boolean) as string[];
  const docLabels = docUrls.map((_, i) => i === 0 ? 'Frente — Caderneta' : 'Verso — Caderneta');

  const idFront  = resolveDocUrl(app.doc_id_url);
  const idBack   = resolveDocUrl(app.doc_id_back_url);
  const idUrls   = [idFront, idBack].filter(Boolean) as string[];
  const idLabels = idUrls.map((_, i) => i === 0 ? 'Frente — Doc. ID' : 'Verso — Doc. ID');

  const cartaFront  = resolveDocUrl(app.carta_habilitacao_url);
  const cartaBack   = resolveDocUrl(app.carta_habilitacao_back_url);
  const cartaUrls   = [cartaFront, cartaBack].filter(Boolean) as string[];
  const cartaLabels = cartaUrls.map((_, i) => i === 0 ? 'Frente — Carta' : 'Verso — Carta');

  const medicoUrl = resolveDocUrl(app.medico_url);
  const chefUrl   = resolveDocUrl((app as any).chef_certificacoes_url);
  const antUrl    = resolveDocUrl((app as any).antecedentes_criminais_url);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#0a1628]/60 backdrop-blur-md"
      onClick={onClose}>
      <div className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border-4 border-[#0a1628]"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="bg-[#0a1628] px-8 py-6 flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 text-white flex items-center justify-center font-bold text-xl flex-shrink-0">
            {app.name.substring(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[#c9a96e] text-[10px] font-semibold uppercase tracking-[0.15em]">Dossiê · Candidatura</p>
            <h3 className="font-['Playfair_Display'] font-bold text-2xl text-white uppercase truncate">{app.name}</h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className={`text-[10px] font-semibold uppercase px-2.5 py-0.5 ${
                app.status === 'pending'  ? 'bg-yellow-400 text-yellow-900' :
                app.status === 'approved' ? 'bg-green-400 text-green-900' :
                'bg-red-500 text-white'
              }`}>
                {app.status === 'pending' ? '⏳ Pendente' : app.status === 'approved' ? '✅ Aprovado' : '❌ Recusado'}
              </span>
              <span className="bg-white/20 text-white text-[10px] font-semibold px-2.5 py-0.5">
                {fmtDate(app.created_at)}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="bg-[#1a2b4a] hover:bg-[#c9a96e]/20 text-white p-2.5 flex-shrink-0">
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 space-y-6">

          {/* Dados Pessoais */}
          <div>
            <Sec title="👤 Dados Pessoais" />
            <div className="grid grid-cols-2 gap-3">
              <DossierField label="Nome"          value={app.name} />
              <DossierField label="Telefone"      value={app.phone} />
              <DossierField label="Nascimento"    value={app.birth_date ? fmtDate(app.birth_date) : '—'} />
              <DossierField label="Nacionalidade" value={app.nacionalidade || '—'} />
            </div>
            <div className="mt-3">
              <DossierField label="E-mail" value={app.email} />
            </div>
          </div>

          {/* Candidatura / Função */}
          <div>
            <Sec title="⚓ Função & Caderneta" />
            <div className="bg-[#0a1628] text-white px-5 py-3 font-bold text-sm mb-3">
              {app.funcoes?.join(', ') || '—'}
            </div>
            <div className="bg-gray-50 p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <DossierField label="Caderneta Nº"  value={app.caderneta_maritima_numero || '—'} />
                <DossierField label="Validade"       value={app.caderneta_maritima_validade || '—'} />
              </div>
              {frontUrl && <DocImage url={frontUrl} label="Frente — Caderneta" allImages={docUrls} allLabels={docLabels} />}
              {backUrl  && <DocImage url={backUrl}  label="Verso — Caderneta"  allImages={docUrls} allLabels={docLabels} />}
              {!frontUrl && <p className="text-[10px] text-gray-400 font-bold bg-white px-4 py-3">Nenhum ficheiro anexado</p>}
            </div>
          </div>

          {/* Documento de Identificação */}
          <div>
            <Sec title="🪪 Documento de Identificação" />
            <div className="bg-gray-50 p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <DossierField label="Tipo"    value={(app.doc_id_tipo || '—').toUpperCase()} />
                <DossierField label="Número"  value={app.doc_id_numero || '—'} />
                <DossierField label="Validade" value={app.doc_id_validade || '—'} />
              </div>
              {idFront && <DocImage url={idFront} label="Frente — Doc. ID" allImages={idUrls} allLabels={idLabels} />}
              {idBack  && <DocImage url={idBack}  label="Verso — Doc. ID"  allImages={idUrls} allLabels={idLabels} />}
              {!idFront && <p className="text-[10px] text-gray-400 font-bold bg-white px-4 py-3">Passaporte já registado — sem upload necessário</p>}
            </div>
          </div>

          {/* STCW */}
          {app.stcw && Object.values(app.stcw).some(Boolean) && (
            <div>
              <Sec title="📋 Certificados STCW" />
              <div className="bg-gray-50 p-4 space-y-2">
                {Object.entries(app.stcw).filter(([, v]) => v).map(([k]) => (
                  <div key={k} className="flex justify-between items-center bg-white px-4 py-2.5">
                    <span className="text-xs font-bold text-[#1a2b4a] uppercase">{k}</span>
                    <span className="text-xs font-bold text-gray-500">{app.stcw_validades?.[k] || '✓'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certificado Médico */}
          {app.medico_validade && (
            <div>
              <Sec title="🩺 Certificado Médico Marítimo" />
              <div className="bg-gray-50 p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {(app as any).medico_numero && <DossierField label="Nº Certificado" value={(app as any).medico_numero} />}
                  <DossierField label="Validade" value={app.medico_validade} />
                </div>
                {medicoUrl
                  ? <DocImage url={medicoUrl} label="Certificado Médico" />
                  : <p className="text-[10px] text-gray-400 font-bold bg-white px-4 py-3">Nenhum ficheiro anexado</p>
                }
              </div>
            </div>
          )}

          {/* Carta de Habilitação */}
          {app.carta_habilitacao_numero && (
            <div>
              <Sec title="⚓ Carta de Habilitação Náutica" />
              <div className="bg-gray-50 p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <DossierField label="Número"  value={app.carta_habilitacao_numero} />
                  <DossierField label="Validade" value={app.carta_habilitacao_validade || '—'} />
                </div>
                {cartaFront && <DocImage url={cartaFront} label="Frente — Carta" allImages={cartaUrls} allLabels={cartaLabels} />}
                {cartaBack  && <DocImage url={cartaBack}  label="Verso — Carta"  allImages={cartaUrls} allLabels={cartaLabels} />}
              </div>
            </div>
          )}

          {/* Cozinheiro */}
          {app.chef_experiencia_catering && (
            <div>
              <Sec title="🍳 Cozinheiro / Chef" />
              <div className="bg-[#c9a96e]/5 p-4 space-y-3">
                {app.chef_certificacoes && <DossierField label="Certificações" value={app.chef_certificacoes} />}
                {chefUrl && <DocImage url={chefUrl} label="Certificado de Cozinheiro" />}
              </div>
            </div>
          )}

          {/* Antecedentes */}
          <div>
            <Sec title="⚖️ Antecedentes Criminais" />
            <div className="bg-gray-50 p-4">
              {antUrl
                ? <DocImage url={antUrl} label="Certidão de Antecedentes" />
                : <p className="text-[10px] text-gray-400 font-bold bg-white px-4 py-3">Nenhuma certidão enviada</p>
              }
            </div>
          </div>

          {/* Experiência */}
          {app.experiencia_embarcado && app.experiencias?.length > 0 && (
            <div>
              <Sec title="💼 Experiência a Bordo" />
              <div className="space-y-2">
                {app.experiencias.map((e, i) => (
                  <div key={i} className="bg-gray-50 p-4">
                    <p className="text-xs font-bold text-[#1a2b4a]">{e.empresa}</p>
                    <p className="text-[10px] font-bold text-gray-500 mt-1">{e.funcao} · {e.periodo_inicio} → {e.periodo_fim}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Idiomas */}
          {app.idiomas?.length > 0 && (
            <div>
              <Sec title="🌐 Idiomas" />
              <div className="flex flex-wrap gap-2">
                {app.idiomas.map(lang => (
                  <span key={lang} className="bg-[#0a1628]/5 text-[#1a2b4a] text-xs font-bold px-3 py-1.5">{lang}</span>
                ))}
              </div>
            </div>
          )}

          {/* Declarações */}
          <div>
            <Sec title="🛡️ Declaração e Termos" />
            <div className="bg-green-50 border-2 border-green-100 p-4 space-y-2">
              {app.declara_verdade && (
                <div className="flex items-center gap-2">
                  <span className="text-green-600 text-sm">✓</span>
                  <p className="text-[11px] font-bold text-green-800 leading-relaxed">
                    Declarou que todas as informações são verdadeiras e está ciente das normas de segurança e responsabilidades legais do trabalho embarcado.
                  </p>
                </div>
              )}
              {app.aceita_termos && (
                <div className="flex items-center gap-2">
                  <span className="text-green-600 text-sm">✓</span>
                  <p className="text-[11px] font-bold text-green-800">Aceitou os Termos e Condições da plataforma NorthWindy.</p>
                </div>
              )}
              {(app as any).declaracao_data && (
                <div className="bg-white px-3 py-2 mt-2">
                  <p className="text-[9px] font-semibold text-gray-400 uppercase">Data e Hora da Declaração</p>
                  <p className="font-bold text-[#1a2b4a] text-sm mt-0.5">
                    {(() => {
                      const d = new Date((app as any).declaracao_data);
                      if (isNaN(d.getTime())) return (app as any).declaracao_data;
                      return d.toLocaleString('pt-PT', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      });
                    })()}
                  </p>
                </div>
              )}
              <div className="bg-white px-3 py-2 mt-2">
                <p className="text-[9px] font-semibold text-gray-400 uppercase">Data da Candidatura</p>
                <p className="font-bold text-[#1a2b4a] text-sm mt-0.5">
                  {(() => {
                    const d = new Date(app.created_at);
                    if (isNaN(d.getTime())) return app.created_at;
                    return d.toLocaleString('pt-PT', {
                      day: '2-digit', month: '2-digit', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    });
                  })()}
                </p>
              </div>
            </div>
          </div>

          {/* Motivos de rejeição */}
          {rejectMode && (
            <div className="bg-red-50 border-2 border-red-200 p-4 space-y-3">
              <p className="text-xs font-semibold text-red-700 uppercase">Selecione os motivos de rejeição:</p>
              {APP_REJECT_REASONS.map(([key, emoji, label]) => (
                <label key={key} className="flex items-center gap-3 cursor-pointer">
                  <div className={`w-5 h-5 border-2 flex items-center justify-center transition-all ${
                    reasons.includes(key) ? 'bg-red-600 border-red-600' : 'border-gray-200 bg-white'
                  }`} onClick={() => setReasons(r => r.includes(key) ? r.filter(x => x !== key) : [...r, key])}>
                    {reasons.includes(key) && <span className="text-white text-[10px]">✓</span>}
                  </div>
                  <span className="text-sm">{emoji}</span>
                  <span className="text-xs font-bold text-red-800">{label}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {app.status === 'pending' && (
          <div className="px-8 pb-8 pt-4 border-t border-gray-100 flex-shrink-0 space-y-3">
            {rejectMode ? (
              <div className="flex gap-3">
                <button onClick={() => setRejectMode(false)} disabled={loading}
                  className="flex-1 border-2 border-gray-200 py-3.5 font-semibold text-xs text-gray-500 uppercase hover:border-[#c9a96e] transition-all">
                  Cancelar
                </button>
                <button onClick={handleReject} disabled={loading || !reasons.length}
                  className="flex-1 bg-red-600 hover:bg-red-500 disabled:bg-gray-200 text-white py-3.5 font-semibold text-xs uppercase transition-all flex items-center justify-center gap-2">
                  {loading ? <span className="animate-spin w-3 h-3 border-2 border-white/30 border-t-white" /> : <><XCircle className="w-3.5 h-3.5" /> Confirmar Rejeição</>}
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
                <button onClick={() => setRejectMode(true)}
                  className="flex-1 border-2 border-red-200 text-red-600 py-3.5 font-semibold text-xs uppercase hover:bg-red-50 transition-all flex items-center justify-center gap-1.5">
                  <XCircle className="w-3.5 h-3.5" /> Recusar
                </button>
                <button onClick={handleApprove} disabled={loading}
                  className="flex-1 bg-[#0a1628] hover:bg-[#1a2b4a] disabled:bg-gray-200 text-white py-3.5 font-semibold text-xs uppercase transition-all flex items-center justify-center gap-1.5">
                  {loading ? <span className="animate-spin w-3 h-3 border-2 border-white/30 border-t-white" /> : <><CheckCircle2 className="w-3.5 h-3.5" /> Aprovar</>}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── ApplicationCard ────────────────────────────────────────────────────────────
function ApplicationCard({
  app,
  onView,
}: {
  app: SailorApplication;
  onView: () => void;
}) {
  const statusMap: Record<string, { label: string; cls: string }> = {
    pending:  { label: '⏳ Pendente',  cls: 'bg-yellow-100 text-yellow-700' },
    approved: { label: '✅ Aprovado',  cls: 'bg-green-100 text-green-700'   },
    rejected: { label: '❌ Recusado',  cls: 'bg-red-100 text-red-600'       },
  };
  const st = statusMap[app.status] || statusMap.pending;

  return (
    <div className="bg-white border-2 border-[#c9a96e]/20 overflow-hidden">
      <div className="bg-[#0a1628] px-5 py-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-white/20 flex items-center justify-center font-bold text-white text-sm flex-shrink-0">
          {app.name.substring(0, 2).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-white uppercase truncate text-sm">{app.name}</p>
          <p className="text-[#c9a96e] text-[10px] font-bold truncate">{app.email}</p>
        </div>
        <span className={`text-[9px] font-semibold uppercase px-2 py-0.5 flex-shrink-0 ${st.cls}`}>{st.label}</span>
      </div>
      <div className="p-4 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gray-50 p-2.5">
            <p className="text-[9px] font-semibold text-gray-400 uppercase">Funções</p>
            <p className="font-bold text-[#1a2b4a] text-[10px] mt-0.5 truncate">{app.funcoes?.join(', ') || '—'}</p>
          </div>
          <div className="bg-gray-50 p-2.5">
            <p className="text-[9px] font-semibold text-gray-400 uppercase">Caderneta</p>
            <p className="font-bold text-[#1a2b4a] text-[10px] mt-0.5">{app.caderneta_maritima_numero || '—'}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className={`p-2 text-center text-[9px] font-semibold uppercase ${app.caderneta_doc_url ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-400'}`}>
            Caderneta {app.caderneta_doc_url ? '✓' : '—'}
          </div>
          <div className={`p-2 text-center text-[9px] font-semibold uppercase ${app.doc_id_url ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-400'}`}>
            Doc ID {app.doc_id_url ? '✓' : '—'}
          </div>
          <div className={`p-2 text-center text-[9px] font-semibold uppercase ${app.medico_validade ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-400'}`}>
            Médico {app.medico_validade ? '✓' : '—'}
          </div>
        </div>
        <div className="flex items-center justify-between pt-1">
          <p className="text-[9px] text-gray-400 font-bold">{fmtDate(app.created_at)}</p>
          <button onClick={onView}
            className="flex items-center gap-1.5 bg-[#0a1628] hover:bg-[#1a2b4a] text-white px-3 py-1.5 font-semibold text-[10px] uppercase transition-all">
            <Eye className="w-3 h-3" /> Ver Dossiê
          </button>
        </div>
      </div>
    </div>
  );
}

// ── CandidatosTab (exported) ───────────────────────────────────────────────────
export function CandidatosTab({ onDataChange }: { onDataChange?: () => void }) {
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [selected, setSelected] = useState<SailorApplication | null>(null);
  const [approveResult, setApproveResult] = useState<{ login: string; password: string; name: string } | null>(null);

  const apps = getSailorApplications(filter === 'all' ? undefined : filter);
  const pending = getSailorApplications('pending').length;

  async function handleApprove(app: SailorApplication) {
    const result = await approveSailorApplication(app.id);
    setSelected(null);
    setApproveResult({ login: result.login, password: result.password, name: app.name });
    onDataChange?.();
  }

  async function handleReject(app: SailorApplication, reasons: string[]) {
    await rejectSailorApplication(app.id, reasons);
    setSelected(null);
    onDataChange?.();
  }

  return (
    <div className="space-y-5">
      {/* Filtros */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Pendentes — sempre visível */}
        <button onClick={() => setFilter('pending')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold border-2 transition-all ${
            filter === 'pending' ? 'bg-[#0a1628] text-white border-[#0a1628]' : 'bg-gray-50 text-gray-500 border-gray-100 hover:border-[#c9a96e]/30'
          }`}>
          ⏳ Pendentes
          {pending > 0 && (
            <span className={`text-[9px] font-bold w-4 h-4 flex items-center justify-center ${filter === 'pending' ? 'bg-white text-[#0a1628]' : 'bg-amber-500 text-white'}`}>
              {pending}
            </span>
          )}
        </button>

        {/* Toggle mais filtros */}
        <button onClick={() => setShowMoreFilters(v => !v)}
          className="flex items-center gap-1 px-3 py-2 text-xs font-semibold border-2 border-gray-100 bg-gray-50 text-gray-400 hover:border-[#c9a96e]/30 transition-all">
          {showMoreFilters ? '▲' : '▼'} Outros filtros
        </button>

        {/* Filtros adicionais colapsáveis */}
        {showMoreFilters && (
          <div className="flex gap-2 flex-wrap">
            {([
              ['approved', '✅ Aprovados'],
              ['rejected', '❌ Recusados'],
              ['all',      '📋 Todos'],
            ] as const).map(([key, label]) => (
              <button key={key} onClick={() => setFilter(key)}
                className={`px-3 py-2 text-xs font-semibold border-2 transition-all ${
                  filter === key ? 'bg-[#0a1628] text-white border-[#0a1628]' : 'bg-gray-50 text-gray-500 border-gray-100 hover:border-[#c9a96e]/30'
                }`}>
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {apps.length === 0 ? (
        <div className="bg-gray-50 border-2 border-gray-100 p-10 flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-gray-100 flex items-center justify-center">
            <Anchor className="w-6 h-6 text-gray-300" />
          </div>
          <p className="text-xs font-semibold text-gray-400 uppercase">Nenhuma candidatura {filter === 'pending' ? 'pendente' : filter === 'approved' ? 'aprovada' : filter === 'rejected' ? 'recusada' : ''}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {apps.map(app => (
            <ApplicationCard key={app.id} app={app} onView={() => setSelected(app)} />
          ))}
        </div>
      )}

      {/* Dossiê Modal */}
      {selected && (
        <DossierModal
          app={selected}
          onApprove={() => handleApprove(selected)}
          onReject={(r) => handleReject(selected, r)}
          onClose={() => setSelected(null)}
        />
      )}

      {/* Modal de credenciais pós-aprovação */}
      {approveResult && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white shadow-2xl border-2 border-green-100 w-full max-w-sm p-8 text-center">
            <div className="w-16 h-16 bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="font-['Playfair_Display'] font-bold text-xl text-[#1a2b4a] uppercase mb-2">Aprovado!</h3>
            <p className="text-sm font-bold text-gray-500 mb-5">{approveResult.name} agora é tripulante da plataforma.</p>
            <div className="bg-[#0a1628] p-4 space-y-3 text-left mb-5">
              <p className="text-[#c9a96e] text-[10px] font-semibold uppercase tracking-[0.15em]">🔑 Credenciais Geradas</p>
              <div className="flex justify-between items-center bg-[#1a2b4a] px-4 py-2.5">
                <span className="text-[#c9a96e] text-xs font-bold uppercase">Login</span>
                <span className="text-white font-bold text-sm">{approveResult.login}</span>
              </div>
              <div className="flex justify-between items-center bg-[#1a2b4a] px-4 py-2.5">
                <span className="text-[#c9a96e] text-xs font-bold uppercase">Senha</span>
                <span className="text-white font-bold text-sm">{approveResult.password}</span>
              </div>
            </div>
            <p className="text-[10px] text-gray-400 font-bold mb-5">As credenciais foram enviadas por mensagem ao tripulante.</p>
            <button onClick={() => setApproveResult(null)}
              className="w-full bg-[#0a1628] hover:bg-[#1a2b4a] text-white py-3.5 font-semibold text-sm uppercase transition-all">
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
