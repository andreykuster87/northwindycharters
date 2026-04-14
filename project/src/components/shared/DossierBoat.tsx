// src/components/shared/DossierBoat.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Dossiê completo de uma embarcação — abre como modal.
// Sub-componentes extraídos para:
//   ./dossier/DossierBoatHelpers.tsx  — helpers, Section, Field, PhotoGallery, SailorMiniCard, StatusBadge
//   ./dossier/DocEditor.tsx           — edição inline de documentos de licenciamento
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from 'react';
import {
  X, ShieldCheck, XCircle, Ship, FileText,
  ChevronDown, ChevronUp, MapPin, Compass, AlertTriangle, Lock,
} from 'lucide-react';
import { updateBoat, getAllBoats, type Boat, type Sailor } from '../../lib/localStore';
import { DossierSailor } from './DossierSailor';

import {
  isBoatComplete, fmtDate,
  StatusBadge, Section, Field, PhotoGallery, SailorMiniCard,
} from './dossier/DossierBoatHelpers';
import { DocEditor, DOC_DEFS } from './dossier/DocEditor';

// ── Props ─────────────────────────────────────────────────────────────────────

interface DossierBoatProps {
  boat:                  Boat;
  sailors?:              Sailor[];
  mode:                  'active' | 'pending';
  role?:                 'admin' | 'sailor' | null;
  onClose:               () => void;
  onApprove?:            (boat: Boat) => void;
  onReject?:             (boat: Boat) => void;
  onCreateTrip?:         (boat: Boat) => void;
  onFilterByBoat?:       (boatId: string) => void;
  onBoatsChange?:        (boats: Boat[]) => void;
  onSendToVerification?: () => void;
}

// ── Componente principal ──────────────────────────────────────────────────────

export function DossierBoat({
  boat, sailors = [], mode,
  onClose, onApprove, onReject,
  onCreateTrip, onFilterByBoat, onBoatsChange,
  onSendToVerification,
  role = null,
}: DossierBoatProps) {
  const [docsOpen,      setDocsOpen]      = useState(true);
  const [openSailor,    setOpenSailor]    = useState<Sailor | null>(null);
  const [sentToVerif,   setSentToVerif]   = useState(false);
  const [currentBoat,   setCurrentBoat]   = useState<Boat>(boat);
  const [verified, setVerified] = useState(() => {
    // Embarcação activa = verificada pelo admin
    if (boat.status === 'active') return true;
    let m: any = {};
    try { m = JSON.parse((boat as any).metadata || '{}'); } catch {}
    return m.docs_verified === true;
  });

  // Parse metadata
  let meta: any = {};
  try { meta = JSON.parse((currentBoat as any).metadata || '{}'); } catch {}

  const boatSailor = sailors.find(s => s.id === currentBoat.sailor_id) as (Sailor & Record<string, any>) | undefined;

  // ── Guardar patch de metadata ─────────────────────────────────────────────
  const saveMeta = async (patch: Partial<any>) => {
    const newMeta = { ...meta, ...patch };
    if (patch.docs) newMeta.docs = { ...meta.docs, ...patch.docs };
    const metaStr = JSON.stringify(newMeta);
    await updateBoat(currentBoat.id, { metadata: metaStr } as any);
    const updated = { ...currentBoat, metadata: metaStr } as any;
    setCurrentBoat(updated);
    onBoatsChange?.(getAllBoats());
  };

  // ── Enviar para re-verificação ────────────────────────────────────────────
  const handleSendToVerification = async () => {
    const newMeta = JSON.stringify({ ...meta, docs_updated_at: new Date().toISOString(), docs_review_requested: true });
    await updateBoat(currentBoat.id, { status: 'pending', metadata: newMeta } as any);
    const updated = { ...currentBoat, status: 'pending', metadata: newMeta } as any;
    setCurrentBoat(updated);
    setVerified(false);
    setSentToVerif(true);
    onBoatsChange?.(getAllBoats());
    setTimeout(() => { onClose(); setTimeout(() => { onSendToVerification?.(); }, 100); }, 1500);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#0a1628]/60 backdrop-blur-md" onClick={onClose}>
        <div className="bg-white w-full max-w-lg max-h-[92vh] flex flex-col shadow-2xl border-4 border-[#0a1628] overflow-hidden"
          onClick={e => e.stopPropagation()}>

          {/* ── Capa ── */}
          <div className="relative flex-shrink-0" style={{ height: '180px' }}>
            {currentBoat.cover_photo
              ? <img src={currentBoat.cover_photo} alt={currentBoat.name} className="w-full h-full object-cover" />
              : <div className="w-full h-full bg-[#0a1628] flex items-center justify-center"><Ship className="w-16 h-16 text-[#c9a96e]" /></div>}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628]/90 via-[#0a1628]/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 px-6 py-4 flex items-end justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <StatusBadge boat={currentBoat} />
                  {currentBoat.type && <span className="bg-white/20 text-white text-[9px] font-semibold uppercase px-2 py-0.5 rounded-full">{currentBoat.type}</span>}
                </div>
                <h3 className="text-2xl font-bold text-white uppercase italic leading-tight">{currentBoat.name}</h3>
                {(currentBoat as any).matricula && <p className="text-[#c9a96e] text-xs font-bold mt-0.5">{(currentBoat as any).matricula}</p>}
              </div>
              <button onClick={onClose} className="bg-[#0a1628]/80 hover:bg-[#0a1628] text-white p-2.5 rounded-full flex-shrink-0 transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* ── Corpo scrollável ── */}
          <div className="overflow-y-auto flex-1 p-6 space-y-6">

            {/* 1. Identificação */}
            <Section title="Identificação">
              <div className="grid grid-cols-2 gap-2">
                <Field label="Nome"           value={currentBoat.name} />
                <Field label="Tipo"           value={currentBoat.type} />
                <Field label="Matrícula"      value={(currentBoat as any).matricula || currentBoat.bie_number} />
                <Field label="Porto"          value={(currentBoat as any).porto} />
                <Field label="Bandeira"       value={(currentBoat as any).bandeira} />
                <Field label="Material"       value={(currentBoat as any).material} />
                <Field label="Comprimento"    value={(currentBoat as any).comprimento ? `${(currentBoat as any).comprimento} m` : undefined} />
                <Field label="Boca"           value={meta.boca ? `${meta.boca} m` : undefined} />
                <Field label="Calado"         value={meta.calado ? `${meta.calado} m` : undefined} />
                <Field label="Ano construção" value={(currentBoat as any).ano_construcao} />
                <Field label="Capacidade"     value={`${currentBoat.capacity} passageiros`} />
                <Field label="Tripulantes"    value={meta.nrTripulantes} />
                <Field label="Área operação"  value={(currentBoat as any).area_operacao} />
                <Field label="Atividade"      value={(currentBoat as any).tipo_atividade} />
              </div>
            </Section>

            {/* 2. Proprietário */}
            {((currentBoat as any).proprietario || meta.proprietario) && (
              <Section title="Propriedade">
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Proprietário"    value={(currentBoat as any).proprietario || meta.proprietario} />
                  <Field label="NIF / Documento" value={(currentBoat as any).nif || meta.nif} />
                  <Field label="Morada"          value={meta.morada} />
                  <Field label="Email"           value={meta.email} />
                  <Field label="Telefone"        value={meta.propTelefone ? `${meta.propDdi || ''} ${meta.propTelefone}`.trim() : undefined} />
                </div>
              </Section>
            )}

            {/* 3. Licenciamento */}
<Section title="Licenciamento e Certificação">
  <div className="grid grid-cols-2 gap-2 mb-3">
    {/* Registo da embarcação */}
    {(meta.registoNr || meta.registoEntidade) && (
      <>
        <Field label="Registo nº"           value={meta.registoNr} />
        <Field label="Validade registo"     value={fmtDate(meta.registoVal)} />
        {meta.registoEntidade && (
          <div className="col-span-2">
            <Field label="Entidade registadora" value={meta.registoEntidade} />
          </div>
        )}
        <div className="col-span-2"><div className="h-px bg-gray-100 my-1" /></div>
      </>
    )}
    <Field label="Licença navegação nº"  value={meta.licNavNr} />
    <Field label="Validade"              value={fmtDate(meta.licNavVal)} />
    <Field label="Cert. navegabilidade"  value={meta.certNavNr} />
    <Field label="Validade"              value={fmtDate(meta.certNavVal)} />
    <Field label="Seguro nº"             value={meta.seguroNr} />
    <Field label="Seguradora"            value={meta.seguradora} />
    <Field label="Validade seguro"       value={fmtDate(meta.seguroVal)} />
    <Field label="Lic. passageiros nº"   value={meta.licPassNr} />
    <Field label="Validade"              value={fmtDate(meta.licPassVal)} />
  </div>
</Section>

            {/* 4. Tripulação (sumário) */}
            {(meta.comandanteNome || (currentBoat as any).comandante) && (
              <Section title="Tripulação">
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <Field label="Comandante" value={meta.comandanteNome || (currentBoat as any).comandante} />
                  <Field label="Cert. nº"   value={meta.comandanteCert} />
                  <Field label="Validade"   value={fmtDate(meta.comandanteVal)} />
                </div>
              </Section>
            )}

            {/* 5. Segurança */}
            {(meta.nrColetes || meta.radioVHF) && (
              <Section title="Segurança e Manutenção">
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Coletes salva-vidas"    value={meta.nrColetes} />
                  <Field label="Balsa salva-vidas"      value={meta.balsaSalvavidas} />
                  <Field label="Rádio VHF"              value={meta.radioVHF} />
                  <Field label="Kit primeiros socorros" value={meta.primeirosSocorros} />
                  <Field label="Sinais de socorro"      value={meta.sinaisSocorro} />
                  <Field label="Validade sinais"        value={fmtDate(meta.sinaisVal)} />
                  <Field label="Extintores"             value={meta.extintores} />
                  <Field label="Última inspeção"        value={fmtDate(meta.ultimaInsp)} />
                  <Field label="Próxima inspeção"       value={fmtDate(meta.proximaInsp)} />
                </div>
                {meta.historicoManu && (
                  <div className="mt-2 bg-gray-50 p-3">
                    <p className="text-[9px] font-semibold text-gray-400 uppercase mb-1">Histórico de manutenção</p>
                    <p className="text-xs font-bold text-[#1a2b4a] leading-relaxed">{meta.historicoManu}</p>
                  </div>
                )}
              </Section>
            )}

            {/* 6. Documentos editáveis */}
            <Section title="Documentos de Licenciamento">
              <div className="flex items-center justify-between mb-3">
                <button type="button" onClick={() => setDocsOpen(o => !o)}
                  className="flex items-center gap-2 text-xs font-semibold text-[#1a2b4a] uppercase hover:text-[#c9a96e] transition-colors">
                  <FileText className="w-3.5 h-3.5" />
                  {docsOpen ? 'Ocultar documentos' : 'Ver documentos'}
                  {docsOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
                {verified && (
                  <span className="text-[9px] font-semibold text-gray-400 uppercase flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Bloqueado — editável 15d antes do vencimento
                  </span>
                )}
              </div>
              {docsOpen && (
                <div className="space-y-3">
                  {DOC_DEFS.map(def => (
                    <DocEditor key={def.key} docDef={def} meta={meta} verified={verified} onSave={patch => saveMeta(patch)} />
                  ))}
                </div>
              )}
            </Section>

            {/* 7. Fotos */}
            <Section title={`Fotos da Embarcação (${(currentBoat.photos || []).length})`}>
              <PhotoGallery photos={currentBoat.photos || []} cover={currentBoat.cover_photo || ''} />
            </Section>


            {/* ── Ações — modo pending ── */}
            {mode === 'pending' && (
              <div className="flex gap-3 pt-2">
                <button onClick={() => onReject?.(currentBoat)}
                  className="flex-1 border-2 border-red-200 text-red-600 hover:bg-red-50 py-4 font-semibold text-sm uppercase transition-all flex items-center justify-center gap-2">
                  <XCircle className="w-4 h-4" /> Rejeitar
                </button>
                <button onClick={() => onApprove?.(currentBoat)}
                  className="flex-1 bg-green-600 hover:bg-green-500 text-white py-4 font-semibold text-sm uppercase transition-all flex items-center justify-center gap-2 shadow-md">
                  <ShieldCheck className="w-4 h-4" /> Aprovar
                </button>
              </div>
            )}

            {/* ── Ações — modo active ── */}
            {mode === 'active' && (
              <div className="space-y-3 pt-2">
                {onCreateTrip && (() => {
                  const { ok, missing } = isBoatComplete(currentBoat);

                  if (!ok) return (
                    <div className="space-y-3">
                      <button disabled className="w-full bg-[#c9a96e]/5 border-2 border-[#c9a96e]/20 text-[#1a2b4a] py-4 font-semibold uppercase text-sm flex items-center justify-center gap-2 cursor-not-allowed">
                        <AlertTriangle className="w-4 h-4 text-[#c9a96e] flex-shrink-0" /> Cadastro Incompleto — Preencha os Dados
                      </button>
                      <div className="bg-[#c9a96e]/5 border-2 border-[#c9a96e]/20 px-4 py-3 space-y-1.5">
                        <p className="text-[10px] font-semibold text-[#1a2b4a] uppercase">Documentos em falta:</p>
                        {missing.map(item => (
                          <div key={item} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#c9a96e] flex-shrink-0" />
                            <p className="text-xs font-bold text-[#1a2b4a]">{item}</p>
                          </div>
                        ))}
                      </div>
                      <button onClick={handleSendToVerification} disabled={sentToVerif}
                        className={`w-full py-4 font-semibold uppercase text-sm transition-all flex items-center justify-center gap-2 ${sentToVerif ? 'bg-green-50 border-2 border-green-300 text-green-700 cursor-not-allowed' : 'bg-[#0a1628] text-white hover:bg-[#0a1628]/90 shadow-md'}`}>
                        {sentToVerif ? <><ShieldCheck className="w-4 h-4" /> Enviado!</> : <><ShieldCheck className="w-4 h-4" /> Enviar para Verificação</>}
                      </button>
                    </div>
                  );

                  if (!verified) return (
                    <div className="space-y-2">
                      {!sentToVerif ? (
                        <button onClick={handleSendToVerification}
                          className="w-full bg-[#0a1628] text-white py-4 font-semibold uppercase text-sm hover:bg-[#0a1628]/90 transition-all flex items-center justify-center gap-2 shadow-md">
                          <ShieldCheck className="w-4 h-4" /> Enviar para Verificação
                        </button>
                      ) : (
                        <button disabled className="w-full bg-green-50 border-2 border-green-300 text-green-700 py-4 font-semibold uppercase text-sm flex items-center justify-center gap-2 cursor-not-allowed">
                          <ShieldCheck className="w-4 h-4" /> Enviado para Verificação!
                        </button>
                      )}
                      <button disabled className="w-full bg-gray-50 border-2 border-gray-200 text-gray-400 py-3 font-semibold uppercase text-sm flex items-center justify-center gap-2 cursor-not-allowed">
                        <AlertTriangle className="w-3.5 h-3.5" /> Aguardando Verificação do Admin
                      </button>
                      <p className="text-[10px] font-bold text-gray-400 text-center px-2">
                        Após verificação pelo admin, a embarcação ficará disponível para criar passeios.
                      </p>
                    </div>
                  );

                  return (
                    <button onClick={() => { onCreateTrip(currentBoat); onClose(); }}
                      className="w-full bg-[#0a1628] text-white py-4 font-semibold uppercase text-sm hover:bg-[#0a1628]/90 transition-all flex items-center justify-center gap-2 shadow-md">
                      <MapPin className="w-4 h-4 text-green-400" /> Criar Passeio com esta Embarcação
                    </button>
                  );
                })()}

                {onFilterByBoat && (
                  <button onClick={() => { onFilterByBoat(currentBoat.id); onClose(); }}
                    className="w-full border-2 border-[#0a1628] text-[#1a2b4a] hover:bg-gray-50 py-4 font-semibold uppercase text-sm transition-all flex items-center justify-center gap-2">
                    <Compass className="w-4 h-4" /> Ver Reservas desta Embarcação
                  </button>
                )}
                <button onClick={onClose}
                  className="w-full border-2 border-gray-100 text-gray-400 py-3 font-semibold uppercase text-sm hover:border-gray-300 transition-all">
                  Fechar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dossiê do Sailor */}
      {openSailor && (
        <DossierSailor
          sailor={openSailor}
          mode={openSailor.status === 'approved' && (openSailor as any).verified ? 'verified' : 'pending'}
          onClose={() => setOpenSailor(null)}
        />
      )}
    </>
  );
}
