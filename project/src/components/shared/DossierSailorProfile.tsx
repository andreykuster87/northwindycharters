// src/components/shared/DossierSailorProfile.tsx
// Secções de perfil do dossiê: dados pessoais, documentos, certificados, etc.
import { resolveDocUrl, type Sailor } from '../../lib/localStore';
import { DocImage, DossierField, DOC_TYPE_LABELS } from './adminHelpers';

// ── Sub-componente: secção de documento ──────────────────────────────────────

function DocSection({
  label,
  tipo,
  numero,
  emissao,
  validade,
  docUrl,
  docBackUrl,
  showMissingFile = false,
}: {
  label: string;
  tipo?: string;
  numero?: string;
  emissao?: string;
  validade?: string;
  docUrl?: string | null;
  docBackUrl?: string | null;
  showMissingFile?: boolean;
}) {
  const fmtDate = (d?: string) =>
    d ? new Date(d + 'T12:00').toLocaleDateString('pt-BR') : '—';

  const frontUrl = resolveDocUrl(docUrl);
  const backUrl  = resolveDocUrl(docBackUrl);

  return (
    <div className="bg-gray-50 rounded-[18px] p-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {([
          ['Tipo',    DOC_TYPE_LABELS[tipo || ''] || tipo || '—'],
          ['Número',  numero || '—'],
          ['Emissão', fmtDate(emissao)],
          ['Validade',fmtDate(validade)],
        ] as [string, string][]).map(([l, v]) => (
          <div key={l} className="bg-white rounded-[12px] p-3">
            <p className="text-[9px] font-black text-gray-400 uppercase">{l}</p>
            <p className="font-black text-blue-900 text-sm mt-0.5">{v}</p>
          </div>
        ))}
      </div>
      {frontUrl
        ? <DocImage url={frontUrl} label={`Frente — ${label}`} />
        : showMissingFile && (
            <p className="text-[10px] text-gray-400 font-bold bg-white rounded-[12px] px-4 py-3">
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
  return (
    <>
      {/* 1. Dados Pessoais */}
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
          👤 Dados Pessoais
        </p>
        <div className="grid grid-cols-2 gap-3">
          {([
            ['Nome',          sailor.name],
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
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
            ⚓ Função Pretendida
          </p>
          <div className="bg-blue-900 text-white rounded-[16px] px-5 py-3 font-black text-sm">
            {(sailor as any).funcao === 'Outro'
              ? ((sailor as any).funcao_outro || 'Outro')
              : (sailor as any).funcao}
          </div>
        </div>
      )}

      {/* 2. Documento de Identificação */}
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
          🪪 Documento de Identificação
        </p>
        <DocSection
          label="Documento de ID"
          tipo={(sailor.passaporte as any)?.tipo}
          numero={sailor.passaporte?.numero}
          emissao={sailor.passaporte?.emissao}
          validade={sailor.passaporte?.validade}
          docUrl={sailor.passaporte?.doc_url}
          docBackUrl={(sailor.passaporte as any)?.doc_back_url}
          showMissingFile={isPending}
        />
      </div>

      {/* 2b. Caderneta Marítima */}
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
          ⚓ Caderneta Marítima (CIR)
        </p>
        {(sailor as any).caderneta_maritima ? (
          <div className="bg-gray-50 rounded-[18px] p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-[12px] p-3">
                <p className="text-[9px] font-black text-gray-400 uppercase">Possui</p>
                <p className="font-black text-blue-900 text-sm mt-0.5">
                  {(sailor as any).caderneta_maritima.possui || (sailor as any).caderneta_maritima.doc_url
                    ? '✓ Sim' : '✗ Não'}
                </p>
              </div>
              {(sailor as any).caderneta_maritima.numero && (
                <div className="bg-white rounded-[12px] p-3">
                  <p className="text-[9px] font-black text-gray-400 uppercase">Número</p>
                  <p className="font-black text-blue-900 text-sm mt-0.5 tracking-widest">
                    {(sailor as any).caderneta_maritima.numero}
                  </p>
                </div>
              )}
            </div>
            {(() => {
              const url = resolveDocUrl((sailor as any).caderneta_maritima?.doc_url);
              return url
                ? <DocImage url={url} label="Caderneta Marítima" />
                : <p className="text-[10px] text-gray-400 font-bold bg-white rounded-[12px] px-4 py-3">Nenhum ficheiro anexado</p>;
            })()}
          </div>
        ) : (
          <p className="text-[10px] text-gray-400 font-bold bg-gray-50 rounded-[14px] px-4 py-3">Não informada</p>
        )}
      </div>

      {/* 3. Carta de Patrão / Mestre */}
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
          ⚓ Carta de Patrão / Mestre
        </p>
        {sailor.cartahabitacao?.numero || sailor.cartahabitacao?.doc_url ? (
          <DocSection
            label="Carta de Habilitação"
            tipo={(sailor.cartahabitacao as any)?.tipo}
            numero={sailor.cartahabitacao?.numero}
            emissao={sailor.cartahabitacao?.emissao}
            validade={sailor.cartahabitacao?.validade}
            docUrl={sailor.cartahabitacao?.doc_url}
            docBackUrl={(sailor.cartahabitacao as any)?.doc_back_url}
            showMissingFile={isPending}
          />
        ) : (
          <p className="text-[10px] text-gray-400 font-bold bg-gray-50 rounded-[14px] px-4 py-3">
            Não informada
          </p>
        )}
      </div>

      {/* 4. Certificados STCW */}
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
          ⚡ Certificados STCW
        </p>
        {sailor.stcw && Object.values(sailor.stcw).some(Boolean) ? (
          <div className="space-y-2">
            {Object.entries(sailor.stcw)
              .filter(([, v]) => v)
              .map(([k]) => {
                const validade = (sailor as any).stcw_validades?.[k];
                return (
                  <div key={k} className="flex items-center justify-between bg-blue-900 text-white rounded-[14px] px-4 py-2.5">
                    <span className="text-[10px] font-black uppercase">✓ {k}</span>
                    {validade && (
                      <span className="text-[10px] font-bold text-blue-300">
                        Val: {new Date(validade + 'T12:00').toLocaleDateString('pt-BR')}
                      </span>
                    )}
                  </div>
                );
              })}
          </div>
        ) : (
          <p className="text-[10px] text-gray-400 font-bold bg-gray-50 rounded-[14px] px-4 py-3">
            Nenhum certificado informado
          </p>
        )}
      </div>

      {/* 5. Certificado Médico */}
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
          🩺 Certificado Médico Marítimo
        </p>
        {(sailor as any).possui_medico === false ? (
          <div className="bg-amber-50 border border-amber-100 rounded-[14px] px-4 py-3 flex items-center gap-2">
            <span className="text-sm">⚠️</span>
            <p className="text-[11px] font-bold text-amber-700">Não possui certificado médico marítimo válido.</p>
          </div>
        ) : sailor.medico?.emissao || sailor.medico?.validade || sailor.medico?.numero ? (
          <div className="bg-gray-50 rounded-[18px] p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {([
                ...(sailor.medico.numero ? [['Nº Certificado', sailor.medico.numero]] : []),
                ['Emissão', sailor.medico.emissao
                  ? new Date(sailor.medico.emissao + 'T12:00').toLocaleDateString('pt-BR')
                  : '—'],
                ['Validade', sailor.medico.validade
                  ? new Date(sailor.medico.validade + 'T12:00').toLocaleDateString('pt-BR')
                  : '—'],
              ] as [string, string][]).map(([l, v]) => (
                <div key={l} className="bg-white rounded-[12px] p-3">
                  <p className="text-[9px] font-black text-gray-400 uppercase">{l}</p>
                  <p className="font-black text-blue-900 text-sm mt-0.5">{v}</p>
                </div>
              ))}
            </div>
            {(() => {
              const url = resolveDocUrl(sailor.medico?.doc_url);
              return url
                ? <DocImage url={url} label="Certificado Médico" />
                : <p className="text-[10px] text-gray-400 font-bold bg-white rounded-[12px] px-4 py-3">Nenhum ficheiro anexado</p>;
            })()}
          </div>
        ) : (
          <p className="text-[10px] text-gray-400 font-bold bg-gray-50 rounded-[14px] px-4 py-3">
            Não informado
          </p>
        )}
      </div>

      {/* 5b. Experiência Profissional */}
      {(sailor as any).experiencia_embarcado !== undefined && (
        <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
            🚢 Experiência Profissional
          </p>
          <div className="space-y-2">
            <div className="bg-gray-50 rounded-[14px] px-4 py-3">
              <p className="text-[9px] font-black text-gray-400 uppercase mb-0.5">Trabalhou embarcado</p>
              <p className="font-black text-blue-900 text-sm">
                {(sailor as any).experiencia_embarcado ? '✓ Sim' : '✗ Não'}
              </p>
            </div>
            {(sailor as any).experiencias?.filter((e: any) => e.empresa || e.funcao).map((exp: any, i: number) => (
              <div key={i} className="bg-gray-50 rounded-[18px] p-4 grid grid-cols-2 gap-3">
                <div className="col-span-2 bg-white rounded-[12px] p-3">
                  <p className="text-[9px] font-black text-gray-400 uppercase">Empresa / Embarcação</p>
                  <p className="font-black text-blue-900 text-sm mt-0.5">{exp.empresa || '—'}</p>
                </div>
                <div className="bg-white rounded-[12px] p-3">
                  <p className="text-[9px] font-black text-gray-400 uppercase">Função</p>
                  <p className="font-black text-blue-900 text-sm mt-0.5">{exp.funcao || '—'}</p>
                </div>
                <div className="bg-white rounded-[12px] p-3">
                  <p className="text-[9px] font-black text-gray-400 uppercase">Período</p>
                  <p className="font-black text-blue-900 text-sm mt-0.5">
                    {exp.periodo_inicio ? new Date(exp.periodo_inicio + 'T12:00').toLocaleDateString('pt-BR') : '—'}
                    {' → '}
                    {exp.periodo_fim ? new Date(exp.periodo_fim + 'T12:00').toLocaleDateString('pt-BR') : '—'}
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
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
            🎓 Cursos e Qualificações
          </p>
          <div className="space-y-2">
            {(sailor as any).cursos_relevantes && (
              <div className="bg-gray-50 rounded-[14px] px-4 py-3">
                <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Cursos Relevantes</p>
                <p className="font-bold text-blue-900 text-sm leading-relaxed">{(sailor as any).cursos_relevantes}</p>
              </div>
            )}
            {(sailor as any).possui_offshore !== undefined && (
              <div className="bg-gray-50 rounded-[14px] px-4 py-3">
                <p className="text-[9px] font-black text-gray-400 uppercase mb-0.5">Cursos Offshore (HUET)</p>
                <p className="font-black text-blue-900 text-sm">{(sailor as any).possui_offshore ? '✓ Sim' : '✗ Não'}</p>
              </div>
            )}
            {(sailor as any).idiomas?.length > 0 && (
              <div className="bg-gray-50 rounded-[14px] px-4 py-3">
                <p className="text-[9px] font-black text-gray-400 uppercase mb-2">Idiomas</p>
                <div className="flex flex-wrap gap-1.5">
                  {(sailor as any).idiomas.map((i: string) => (
                    <span key={i} className="bg-blue-900 text-white text-[10px] font-black px-3 py-1 rounded-full">{i}</span>
                  ))}
                  {(sailor as any).idioma_outro && (
                    <span className="bg-blue-900 text-white text-[10px] font-black px-3 py-1 rounded-full">{(sailor as any).idioma_outro}</span>
                  )}
                  {(sailor as any).idioma_nivel && (
                    <span className="bg-blue-100 text-blue-900 text-[10px] font-black px-3 py-1 rounded-full">Nível: {(sailor as any).idioma_nivel}</span>
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
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
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
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
            📝 Informações Adicionais
          </p>
          <div className="space-y-2">
            {(sailor as any).restricao_medica && (
              <div className="bg-amber-50 border border-amber-100 rounded-[14px] px-4 py-3">
                <p className="text-[9px] font-black text-amber-700 uppercase mb-1">Restrição Médica</p>
                <p className="font-bold text-amber-800 text-sm leading-relaxed">{(sailor as any).restricao_medica}</p>
              </div>
            )}
            {(sailor as any).outras_informacoes && (
              <div className="bg-gray-50 rounded-[14px] px-4 py-3">
                <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Outras Informações</p>
                <p className="font-bold text-blue-900 text-sm leading-relaxed">{(sailor as any).outras_informacoes}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5f. Declaração */}
      {(sailor as any).declaracao_data && (
        <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
            🛡️ Declaração e Termos
          </p>
          <div className="bg-green-50 border-2 border-green-100 rounded-[18px] p-4 space-y-2">
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
            <div className="bg-white rounded-[10px] px-3 py-2 mt-2">
              <p className="text-[9px] font-black text-gray-400 uppercase">Data da Declaração</p>
              <p className="font-black text-blue-900 text-sm mt-0.5">
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
