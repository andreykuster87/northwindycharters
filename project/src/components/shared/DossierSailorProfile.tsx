// src/components/shared/DossierSailorProfile.tsx
// Secções de perfil do dossiê: dados pessoais, documentos, certificados, etc.
import { useState } from 'react';
import { Pencil, Check, X } from 'lucide-react';
import { resolveDocUrl, DOC_TYPES, type Sailor } from '../../lib/localStore';
import { supabase } from '../../lib/supabase';
import { DocImage, DossierField } from './adminHelpers';

// ── Helper de formatação de datas ─────────────────────────────────────────────
// Aceita tanto dd/mm/yyyy (input do utilizador) como yyyy-mm-dd (ISO do backend)
function fmtAnyDate(d?: string): string {
  if (!d) return '—';
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(d)) return d; // já em dd/mm/yyyy
  const parsed = new Date(d + 'T12:00');
  return isNaN(parsed.getTime()) ? d : parsed.toLocaleDateString('pt-BR');
}

// ── Sub-componente: edição inline de campo ────────────────────────────────────

function InlineEdit({
  value,
  sailorId,
  dbField,
  onSaved,
}: {
  value?: string;
  sailorId: string;
  dbField: string;
  onSaved: (v: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft,   setDraft]   = useState(value || '');
  const [saving,  setSaving]  = useState(false);

  async function save() {
    if (!draft.trim()) return;
    setSaving(true);
    const { error } = await supabase.from('sailors').update({ [dbField]: draft.trim() }).eq('id', sailorId);
    setSaving(false);
    if (!error) { onSaved(draft.trim()); setEditing(false); }
    else alert('Erro ao guardar. Tente novamente.');
  }

  if (editing) {
    return (
      <div className="flex items-center gap-1 mt-0.5">
        <input
          autoFocus
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false); }}
          className="flex-1 border border-[#c9a96e] px-2 py-1 text-sm font-semibold text-[#1a2b4a] outline-none min-w-0"
        />
        <button onClick={save} disabled={saving}
          className="p-1 bg-green-500 text-white hover:bg-green-600 transition-colors disabled:opacity-50">
          <Check className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => setEditing(false)}
          className="p-1 bg-gray-300 text-gray-700 hover:bg-gray-400 transition-colors">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 mt-0.5">
      <p className="font-semibold text-[#1a2b4a] text-sm tracking-widest">{value || '—'}</p>
      <button onClick={() => setEditing(true)}
        title="Editar"
        className="opacity-40 hover:opacity-100 transition-opacity text-[#c9a96e] flex-shrink-0">
        <Pencil className="w-3 h-3" />
      </button>
    </div>
  );
}

// ── Sub-componente: secção de documento (padrão: Nº → Validade → Imagem) ──────

function DocSection({
  label,
  numero,
  validade,
  docUrl,
  docBackUrl,
  showMissingFile = false,
  sailorId,
  dbNumeroField,
  onNumeroSaved,
}: {
  label: string;
  numero?: string;
  validade?: string;
  docUrl?: string | null;
  docBackUrl?: string | null;
  showMissingFile?: boolean;
  sailorId?: string;
  dbNumeroField?: string;
  onNumeroSaved?: (v: string) => void;
}) {
  const frontUrl = resolveDocUrl(docUrl);
  const backUrl  = resolveDocUrl(docBackUrl);

  return (
    <div className="bg-gray-50 p-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-3">
          <p className="text-[9px] font-semibold text-gray-400 uppercase">Nº Documento</p>
          {sailorId && dbNumeroField && onNumeroSaved ? (
            <InlineEdit value={numero} sailorId={sailorId} dbField={dbNumeroField} onSaved={onNumeroSaved} />
          ) : (
            <p className="font-semibold text-[#1a2b4a] text-sm mt-0.5 tracking-widest">{numero || '—'}</p>
          )}
        </div>
        <div className="bg-white p-3">
          <p className="text-[9px] font-semibold text-gray-400 uppercase">Validade</p>
          <p className="font-semibold text-[#1a2b4a] text-sm mt-0.5">{fmtAnyDate(validade)}</p>
        </div>
      </div>
      {frontUrl
        ? <DocImage url={frontUrl} label={`Frente — ${label}`} />
        : showMissingFile && (
            <p className="text-[10px] text-gray-400 font-bold bg-white px-4 py-3">
              Nenhum ficheiro anexado
            </p>
          )
      }
      {backUrl && <DocImage url={backUrl} label={`Verso — ${label}`} />}
    </div>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  sailor: Sailor;
  isPending: boolean;
  isVerified: boolean;
}

// ── Componente ────────────────────────────────────────────────────────────────

export function DossierSailorProfile({ sailor, isPending, isVerified }: Props) {
  // Estado local para números editados inline pelo admin
  const [medicoNumero,     setMedicoNumero]     = useState(sailor.medico?.numero     || '');
  const [passaporteNumero, setPassaporteNumero] = useState(sailor.passaporte?.numero || '');
  const [cartaNumero,      setCartaNumero]      = useState(sailor.cartahabitacao?.numero || '');
  const [cadernetaNumero,  setCadernetaNumero]  = useState((sailor as any).caderneta_maritima?.numero || '');

  return (
    <>
      {/* 1. Dados Pessoais */}
      <div>
        <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em] mb-3">
          👤 Dados Pessoais
        </p>
        <div className="grid grid-cols-2 gap-3">
          {([
            ['Nome',          sailor.name],
            ...((sailor as any).username ? [['@ Username', `@${(sailor as any).username}`] as [string, string]] : []),
            ['E-mail',        sailor.email],
            ['Telefone',      sailor.phone || '—'],
            ['Nascimento',    (sailor as any).birth_date || '—'],
            ['Nacionalidade', sailor.nacionalidade || '—'],
            ['CPF / NIF',     (sailor as any).cpf_nif || '—'],
            ['Endereço',      (sailor as any).endereco || '—'],
            ['Idioma',        sailor.language || '—'],
            ['Fuso Horário',  sailor.timezone || '—'],
            ...(isVerified && sailor.verified_at
              ? [['Verificado em', new Date(sailor.verified_at).toLocaleDateString('pt-BR')] as [string, string]]
              : []),
            ['Cadastro', new Date(sailor.created_at).toLocaleDateString('pt-BR')],
          ] as [string, string][]).map(([l, v]) => (
            <DossierField key={l} label={l} value={v} />
          ))}
        </div>
      </div>

      {/* 1b. Função Pretendida */}
      {(sailor as any).funcao && (
        <div>
          <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em] mb-3">
            ⚓ Função Pretendida
          </p>
          <div className="flex flex-wrap gap-2">
            {(() => {
              const rawFuncao = (sailor as any).funcao as string;
              const funcoes = rawFuncao.split(',').map(f => f.trim()).filter(Boolean);
              return funcoes.map(f => {
                const label = f === 'Outro' ? ((sailor as any).funcao_outro || 'Outro') : f;
                return (
                  <span key={f} className="bg-[#0a1628] text-white px-4 py-2 font-semibold text-sm">
                    {label}
                  </span>
                );
              });
            })()}
          </div>
        </div>
      )}

      {/* 2. Documento de Identificação */}
      <div>
        <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em] mb-3">
          🪪 Documento de Identificação
        </p>
        {(() => {
          const docTipo = (sailor.passaporte as any)?.tipo;
          const docTypeInfo = DOC_TYPES.find(d => d.value === docTipo);
          const docTypeLabel = docTypeInfo?.label || '';
          return docTypeLabel ? (
            <div className="bg-[#0a1628]/5 border border-[#c9a96e]/20 px-4 py-2 mb-3">
              <p className="text-[9px] font-semibold text-gray-400 uppercase mb-0.5">Tipo</p>
              <p className="font-semibold text-[#1a2b4a] text-sm">{docTypeLabel}</p>
            </div>
          ) : null;
        })()}
        <DocSection
          label="Documento de ID"
          numero={passaporteNumero}
          validade={sailor.passaporte?.validade}
          docUrl={sailor.passaporte?.doc_url}
          docBackUrl={(sailor.passaporte as any)?.doc_back_url}
          showMissingFile={isPending}
          sailorId={sailor.id}
          dbNumeroField="passaporte_numero"
          onNumeroSaved={setPassaporteNumero}
        />
      </div>

      {/* 2b. Caderneta Marítima + sub-grupo STCW */}
      <div>
        <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em] mb-3">
          ⚓ Caderneta Marítima (CIR)
        </p>
        {(sailor as any).caderneta_maritima?.possui || (sailor as any).caderneta_maritima?.numero || (sailor as any).caderneta_maritima?.doc_url ? (
          <DocSection
            label="Caderneta Marítima"
            numero={cadernetaNumero}
            validade={(sailor as any).caderneta_maritima?.validade}
            docUrl={(sailor as any).caderneta_maritima?.doc_url}
            docBackUrl={(sailor as any).caderneta_maritima?.doc_back_url}
            showMissingFile={isPending}
            sailorId={sailor.id}
            dbNumeroField="caderneta_numero"
            onNumeroSaved={setCadernetaNumero}
          />
        ) : (
          <p className="text-[10px] text-gray-400 font-bold bg-gray-50 px-4 py-3">Não informada</p>
        )}

        {/* Certificados STCW — sub-grupo */}
        <div className="ml-4 border-l-2 border-[#c9a96e]/20 mt-3 space-y-2">
          <p className="text-[9px] font-semibold text-[#c9a96e]/70 uppercase tracking-[0.15em] pl-3 pb-1">
            ⚡ Certificados STCW
          </p>
          {sailor.stcw && Object.values(sailor.stcw).some(Boolean) ? (
            <div className="pl-3 space-y-1.5">
              {Object.entries(sailor.stcw)
                .filter(([, v]) => v)
                .map(([k]) => {
                  const validade = (sailor as any).stcw_validades?.[k];
                  return (
                    <div key={k} className="flex items-center justify-between bg-[#0a1628] text-white px-4 py-2.5">
                      <span className="text-[10px] font-semibold uppercase">✓ {k}</span>
                      {validade && (
                        <span className="text-[10px] font-bold text-[#c9a96e]">
                          Val: {fmtAnyDate(validade)}
                        </span>
                      )}
                    </div>
                  );
                })}
            </div>
          ) : (
            <p className="text-[10px] text-gray-400 font-bold bg-gray-50 px-4 py-3 ml-3">
              Nenhum certificado informado
            </p>
          )}
        </div>
      </div>

      {/* 3. Carta de Patrão / Mestre */}
      <div>
        <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em] mb-3">
          ⚓ Carta de Patrão / Mestre
        </p>
        {sailor.cartahabitacao?.numero || sailor.cartahabitacao?.doc_url ? (
          <DocSection
            label="Carta de Habilitação"
            numero={cartaNumero}
            validade={sailor.cartahabitacao?.validade}
            docUrl={sailor.cartahabitacao?.doc_url}
            docBackUrl={(sailor.cartahabitacao as any)?.doc_back_url}
            showMissingFile={isPending}
            sailorId={sailor.id}
            dbNumeroField="cartahabitacao_numero"
            onNumeroSaved={setCartaNumero}
          />
        ) : (
          <p className="text-[10px] text-gray-400 font-bold bg-gray-50 px-4 py-3">
            Não informada
          </p>
        )}
      </div>

      {/* 5. Certificado Médico */}
      <div>
        <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em] mb-3">
          🩺 Certificado Médico Marítimo
        </p>
        {(sailor as any).possui_medico === false ? (
          <div className="bg-[#c9a96e]/5 border border-[#c9a96e]/20 px-4 py-3 flex items-center gap-2">
            <span className="text-sm">⚠️</span>
            <p className="text-[11px] font-bold text-[#1a2b4a]">Não possui certificado médico marítimo válido.</p>
          </div>
        ) : sailor.medico?.validade || sailor.medico?.numero ? (
          <DocSection
            label="Certificado Médico"
            numero={medicoNumero}
            validade={sailor.medico?.validade}
            docUrl={sailor.medico?.doc_url}
            showMissingFile={isPending}
            sailorId={sailor.id}
            dbNumeroField="medico_numero"
            onNumeroSaved={setMedicoNumero}
          />
        ) : (
          <p className="text-[10px] text-gray-400 font-bold bg-gray-50 px-4 py-3">
            Não informado
          </p>
        )}
      </div>

      {/* 5b. Experiência Profissional */}
      {(sailor as any).experiencia_embarcado !== undefined && (
        <div>
          <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em] mb-3">
            🚢 Experiência Profissional
          </p>
          <div className="space-y-2">
            <div className="bg-gray-50 px-4 py-3">
              <p className="text-[9px] font-semibold text-gray-400 uppercase mb-0.5">Trabalhou embarcado</p>
              <p className="font-semibold text-[#1a2b4a] text-sm">
                {(sailor as any).experiencia_embarcado ? '✓ Sim' : '✗ Não'}
              </p>
            </div>
            {(sailor as any).experiencias?.filter((e: any) => e.empresa || e.funcao).map((exp: any, i: number) => (
              <div key={i} className="bg-gray-50 p-4 grid grid-cols-2 gap-3">
                <div className="col-span-2 bg-white p-3">
                  <p className="text-[9px] font-semibold text-gray-400 uppercase">Empresa / Embarcação</p>
                  <p className="font-semibold text-[#1a2b4a] text-sm mt-0.5">{exp.empresa || '—'}</p>
                </div>
                <div className="bg-white p-3">
                  <p className="text-[9px] font-semibold text-gray-400 uppercase">Função</p>
                  <p className="font-semibold text-[#1a2b4a] text-sm mt-0.5">{exp.funcao || '—'}</p>
                </div>
                <div className="bg-white p-3">
                  <p className="text-[9px] font-semibold text-gray-400 uppercase">Período</p>
                  <p className="font-semibold text-[#1a2b4a] text-sm mt-0.5">
                    {fmtAnyDate(exp.periodo_inicio)}
                    {' → '}
                    {fmtAnyDate(exp.periodo_fim)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5c. Cursos e Qualificações */}
      {((sailor as any).cursos_relevantes || (sailor as any).idiomas?.length || (sailor as any).possui_offshore !== undefined) && (
        <div>
          <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em] mb-3">
            🎓 Cursos e Qualificações
          </p>
          <div className="space-y-2">
            {(sailor as any).cursos_relevantes && (
              <div className="bg-gray-50 px-4 py-3">
                <p className="text-[9px] font-semibold text-gray-400 uppercase mb-1">Cursos Relevantes</p>
                <p className="font-bold text-[#1a2b4a] text-sm leading-relaxed">{(sailor as any).cursos_relevantes}</p>
              </div>
            )}
            {(sailor as any).possui_offshore !== undefined && (
              <div className="bg-gray-50 px-4 py-3">
                <p className="text-[9px] font-semibold text-gray-400 uppercase mb-0.5">Cursos Offshore (HUET)</p>
                <p className="font-semibold text-[#1a2b4a] text-sm">{(sailor as any).possui_offshore ? '✓ Sim' : '✗ Não'}</p>
              </div>
            )}
            {(sailor as any).idiomas?.length > 0 && (
              <div className="bg-gray-50 px-4 py-3">
                <p className="text-[9px] font-semibold text-gray-400 uppercase mb-2">Idiomas</p>
                <div className="flex flex-wrap gap-1.5">
                  {(sailor as any).idiomas.map((i: string) => (
                    <span key={i} className="bg-[#0a1628] text-white text-[10px] font-semibold px-3 py-1 rounded-full">{i}</span>
                  ))}
                  {(sailor as any).idioma_outro && (
                    <span className="bg-[#0a1628] text-white text-[10px] font-semibold px-3 py-1 rounded-full">{(sailor as any).idioma_outro}</span>
                  )}
                  {(sailor as any).idioma_nivel && (
                    <span className="bg-[#0a1628]/5 text-[#1a2b4a] text-[10px] font-semibold px-3 py-1 rounded-full">Nível: {(sailor as any).idioma_nivel}</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5d. Disponibilidade */}
      {((sailor as any).disponivel_imediato !== undefined || (sailor as any).tempo_embarque) && (
        <div>
          <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em] mb-3">
            📅 Disponibilidade
          </p>
          <div className="grid grid-cols-2 gap-3">
            {(sailor as any).disponivel_imediato !== undefined && (
              <DossierField label="Embarque imediato"
                value={(sailor as any).disponivel_imediato ? '✓ Sim' : '✗ Não'} />
            )}
            {(sailor as any).disponivel_internacional !== undefined && (
              <DossierField label="Viagens internacionais"
                value={(sailor as any).disponivel_internacional ? '✓ Sim' : '✗ Não'} />
            )}
            {(sailor as any).tempo_embarque && (
              <DossierField label="Tempo máx. embarque" value={(sailor as any).tempo_embarque} />
            )}
          </div>
        </div>
      )}

      {/* 5e. Informações Adicionais */}
      {((sailor as any).restricao_medica || (sailor as any).outras_informacoes) && (
        <div>
          <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em] mb-3">
            📝 Informações Adicionais
          </p>
          <div className="space-y-2">
            {(sailor as any).restricao_medica && (
              <div className="bg-[#c9a96e]/5 border border-[#c9a96e]/20 px-4 py-3">
                <p className="text-[9px] font-semibold text-[#1a2b4a] uppercase mb-1">Restrição Médica</p>
                <p className="font-bold text-[#1a2b4a] text-sm leading-relaxed">{(sailor as any).restricao_medica}</p>
              </div>
            )}
            {(sailor as any).outras_informacoes && (
              <div className="bg-gray-50 px-4 py-3">
                <p className="text-[9px] font-semibold text-gray-400 uppercase mb-1">Outras Informações</p>
                <p className="font-bold text-[#1a2b4a] text-sm leading-relaxed">{(sailor as any).outras_informacoes}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5f. Declaração */}
      {(sailor as any).declaracao_data && (
        <div>
          <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em] mb-3">
            🛡️ Declaração e Termos
          </p>
          <div className="bg-green-50 border-2 border-green-100 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-green-600 text-sm">✓</span>
              <p className="text-[11px] font-bold text-green-800 leading-relaxed">
                Declarou que todas as informações são verdadeiras e está ciente das normas de segurança e responsabilidades legais do trabalho embarcado.
              </p>
            </div>
            {(sailor as any).aceitou_termos && (
              <div className="flex items-center gap-2">
                <span className="text-green-600 text-sm">✓</span>
                <p className="text-[11px] font-bold text-green-800">Aceitou os Termos e Condições da plataforma NorthWindy.</p>
              </div>
            )}
            <div className="bg-white px-3 py-2 mt-2">
              <p className="text-[9px] font-semibold text-gray-400 uppercase">Data da Declaração</p>
              <p className="font-semibold text-[#1a2b4a] text-sm mt-0.5">
                {(() => {
                  const raw = (sailor as any).declaracao_data;
                  if (!raw) return '—';
                  const d = new Date(raw);
                  if (isNaN(d.getTime())) return raw;
                  return d.toLocaleString('pt-PT', {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  });
                })()}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
