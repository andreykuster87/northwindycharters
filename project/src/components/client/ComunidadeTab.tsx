// src/components/client/ComunidadeTab.tsx
import { useState } from 'react';
import { CheckCircle2, Anchor, MapPin } from 'lucide-react';

interface Props {
  onGoToProfile:     () => void;
  onOpenApplication: () => void;
  applicationStatus?: string | null;
}

export function ComunidadeTab({ onGoToProfile, onOpenApplication, applicationStatus }: Props) {
  const [activePanel, setActivePanel] = useState<'internacional' | 'nacional'>('nacional');

  const internacionalItems = [
    { tag: 'STCW',       tagColor: 'bg-blue-100 text-blue-700',   title: 'STCW Básico (BST)',                   desc: 'Certificado internacional de segurança: Sobrevivência, Incêndio, Primeiros Socorros. Obrigatório para qualquer pessoa que durma a bordo ou trabalhe com o navio em navegação.' },
    { tag: 'STCW',       tagColor: 'bg-blue-100 text-blue-700',   title: 'Security Awareness (VPDSD)',          desc: 'Certificação de conscientização de proteção para atuação em portos internacionais.' },
    { tag: 'Saúde',      tagColor: 'bg-green-100 text-green-700', title: 'Medical Certificate (Padrão IMO)',    desc: 'Atestado médico internacional (ex: ENG1 ou equivalente reconhecido pela bandeira do navio).' },
    { tag: 'Identidade', tagColor: 'bg-purple-100 text-purple-700', title: "Seaman's Book (SID)",              desc: 'Cédula de identidade marítima da bandeira da embarcação. Essencial para cruzar fronteiras marítimas.' },
    { tag: 'Galley',     tagColor: 'bg-orange-100 text-orange-700', title: 'HACCP / Food Safety Level 2',      desc: 'Certificação global de segurança alimentar para profissionais de cozinha.' },
    { tag: 'Documentos', tagColor: 'bg-indigo-100 text-indigo-700', title: 'Passaporte e Vistos',              desc: 'Passaporte com validade mínima de 6 meses e vistos de tripulante (como o C1/D) dependendo da região de operação.' },
    { tag: 'Financeiro', tagColor: 'bg-amber-100 text-amber-700',  title: 'International Invoice',             desc: 'Documento fiscal internacional para recebimento da taxa (fee) em moeda estrangeira.' },
  ];

  const nacionalItemsMain = [
    { tag: 'Registro',   tagColor: 'bg-blue-100 text-blue-700',   title: 'CIR (Caderneta de Inscrição e Registro)', desc: 'Registro profissional na Marinha ou Autoridade Marítima do país (ex: Capitania dos Portos). Oficializa o trabalhador como marítimo local.' },
    { tag: 'Saúde',      tagColor: 'bg-green-100 text-green-700', title: 'ASO Marítimo Nacional',              desc: 'Atestado de Saúde Ocupacional específico para as normas do país, garantindo que o profissional está apto para o esforço físico a bordo.' },
    { tag: 'Financeiro', tagColor: 'bg-amber-100 text-amber-700', title: 'Comprovante de Situação Cadastral (Fiscal)', desc: 'Documentação para emissão de nota fiscal de autônomo, MEI ou recibo de prestação de serviço local para o pagamento da taxa.' },
    { tag: 'Seguro',     tagColor: 'bg-purple-100 text-purple-700', title: 'Seguro de Acidentes Pessoais',    desc: 'Muitas vezes exigido para prestadores pontuais para cobrir o trajeto e o período de serviço na costa.' },
  ];

  const nacionalItemsGalley = [
    { tag: 'Galley', tagColor: 'bg-orange-100 text-orange-700', title: 'Certificado de Manipulação de Alimentos', desc: 'Curso de higiene exigido pelo órgão de saúde nacional (ex: ANVISA, EFSA, FDA local).' },
    { tag: 'Galley', tagColor: 'bg-orange-100 text-orange-700', title: 'Laudo Laboratorial Recente',          desc: 'Exames de saúde específicos para manipuladores de alimentos exigidos pela norma sanitária do país para serviços em eventos.' },
  ];

  return (
    <div className="space-y-5">

      {/* Header */}
      <div>
        <h2 className="text-lg font-black text-blue-900 uppercase italic">Faça parte da comunidade</h2>
        <p className="text-xs text-gray-400 font-bold mt-0.5">Documentação obrigatória para trabalhar a bordo</p>
      </div>

      {/* CTA — Status de candidatura ou botão de inserir */}
      {applicationStatus === 'pending' ? (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-[20px] p-4 flex items-start gap-3">
          <div className="w-9 h-9 bg-amber-400 rounded-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-base">⏳</span>
          </div>
          <div>
            <p className="text-xs font-black text-amber-800 uppercase tracking-wide">Candidatura em Análise</p>
            <p className="text-xs font-bold text-amber-700 mt-1 leading-relaxed">
              A sua candidatura a tripulante está sendo analisada pela equipa. Receberá uma mensagem com o resultado em breve.
            </p>
          </div>
        </div>
      ) : applicationStatus === 'approved' ? (
        <div className="bg-green-50 border-2 border-green-200 rounded-[20px] p-4 flex items-start gap-3">
          <div className="w-9 h-9 bg-green-500 rounded-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
            <CheckCircle2 className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-xs font-black text-green-800 uppercase tracking-wide">Candidatura Aprovada!</p>
            <p className="text-xs font-bold text-green-700 mt-1 leading-relaxed">
              A sua candidatura foi aprovada. Verifique as suas mensagens para obter as credenciais de acesso à área de tripulante.
            </p>
          </div>
        </div>
      ) : applicationStatus === 'rejected' ? (
        <div className="space-y-3">
          <div className="bg-red-50 border-2 border-red-200 rounded-[20px] p-4 flex items-start gap-3">
            <div className="w-9 h-9 bg-red-100 rounded-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-base">❌</span>
            </div>
            <div>
              <p className="text-xs font-black text-red-800 uppercase tracking-wide">Candidatura Não Aprovada</p>
              <p className="text-xs font-bold text-red-700 mt-1 leading-relaxed">
                A candidatura anterior não foi aprovada. Verifique as mensagens para saber o motivo e tente novamente.
              </p>
            </div>
          </div>
          <button onClick={onOpenApplication}
            className="w-full bg-blue-900 hover:bg-blue-800 text-white rounded-[18px] py-4 font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2.5">
            <Anchor className="w-4 h-4" /> Nova Candidatura
          </button>
        </div>
      ) : (
        <button onClick={onOpenApplication}
          className="w-full bg-blue-900 hover:bg-blue-800 text-white rounded-[20px] p-4 font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-3 shadow-lg shadow-blue-900/20">
          <div className="w-8 h-8 bg-white/20 rounded-[10px] flex items-center justify-center">
            <Anchor className="w-4 h-4 text-white" />
          </div>
          Inserir Documentos e Candidatar-me
        </button>
      )}

      {/* Seletor Nacional / Internacional */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-[16px]">
        <button onClick={() => setActivePanel('nacional')}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-[12px] font-black text-xs uppercase tracking-wide transition-all ${activePanel === 'nacional' ? 'bg-blue-900 text-white shadow-lg' : 'text-gray-500 hover:text-blue-900'}`}>
          <span className="text-base leading-none">⚓</span> Nacional
        </button>
        <button onClick={() => setActivePanel('internacional')}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-[12px] font-black text-xs uppercase tracking-wide transition-all ${activePanel === 'internacional' ? 'bg-blue-900 text-white shadow-lg' : 'text-gray-500 hover:text-blue-900'}`}>
          <span className="text-base leading-none">🌐</span> Internacional
        </button>
      </div>

      {/* Painel ativo — descrição */}
      {activePanel === 'internacional' ? (
        <div className="bg-blue-900 text-white rounded-[20px] p-5 flex items-start gap-3">
          <div className="w-9 h-9 bg-blue-700 rounded-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
            <Anchor className="w-4 h-4 text-blue-200" />
          </div>
          <div>
            <p className="font-black text-sm uppercase italic">Padrão IMO / MLC 2006</p>
            <p className="text-blue-200 text-xs font-bold mt-0.5">Cruzeiros, navios mercantes e rotas internacionais</p>
            <p className="text-blue-100 text-xs leading-relaxed mt-2">
              Conformidade com a IMO e a convenção MLC 2006. Certificações STCW são o bilhete de entrada para qualquer rota internacional.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-green-700 to-teal-700 text-white rounded-[20px] p-5 flex items-start gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
            <MapPin className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-black text-sm uppercase italic">Costa Nacional</p>
            <p className="text-green-100 text-xs font-bold mt-0.5">Autoridade Marítima Local e Vigilância Sanitária</p>
            <p className="text-green-50 text-xs leading-relaxed mt-2">
              Legislação da Autoridade Marítima e normas do país de operação. Essencial para serviços em portos e eventos nacionais.
            </p>
          </div>
        </div>
      )}

      {/* Lista de documentos */}
      {activePanel === 'nacional' ? (
        <div className="space-y-2.5">
          {nacionalItemsMain.map(({ tag, tagColor, title, desc }) => (
            <div key={title} className="bg-white border-2 border-gray-100 rounded-[18px] p-4 flex gap-3">
              <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${tagColor}`}>{tag}</span>
                  <p className="text-xs font-black text-blue-900">{title}</p>
                </div>
                <p className="text-xs font-bold text-gray-500 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}

          <div className="bg-amber-50 border-2 border-amber-200 rounded-[18px] p-4 flex gap-3">
            <div className="w-8 h-8 bg-amber-400 rounded-[10px] flex items-center justify-center flex-shrink-0">
              <span className="text-sm">🍳</span>
            </div>
            <div>
              <p className="text-xs font-black text-amber-800 uppercase tracking-wide mb-1">Dica para a Cozinha (Galley)</p>
              <p className="text-xs font-bold text-amber-700 leading-relaxed">
                Para serviços pontuais, mantenha sempre uma cópia digital do <strong>HACCP</strong> e do <strong>Laudo Médico de Coprocultura</strong> (exame de fezes) atualizado no último semestre. Isso evita problemas com inspeções sanitárias surpresa em qualquer porto.
              </p>
            </div>
          </div>

          {nacionalItemsGalley.map(({ tag, tagColor, title, desc }) => (
            <div key={title} className="bg-white border-2 border-gray-100 rounded-[18px] p-4 flex gap-3">
              <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${tagColor}`}>{tag}</span>
                  <p className="text-xs font-black text-blue-900">{title}</p>
                </div>
                <p className="text-xs font-bold text-gray-500 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2.5">
          {internacionalItems.map(({ tag, tagColor, title, desc }) => (
            <div key={title} className="bg-white border-2 border-gray-100 rounded-[18px] p-4 flex gap-3">
              <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${tagColor}`}>{tag}</span>
                  <p className="text-xs font-black text-blue-900">{title}</p>
                </div>
                <p className="text-xs font-bold text-gray-500 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {activePanel === 'internacional' && (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-[18px] p-4 flex gap-3">
          <div className="w-8 h-8 bg-amber-400 rounded-[10px] flex items-center justify-center flex-shrink-0">
            <span className="text-sm">🍳</span>
          </div>
          <div>
            <p className="text-xs font-black text-amber-800 uppercase tracking-wide mb-1">Dica para a Cozinha (Galley)</p>
            <p className="text-xs font-bold text-amber-700 leading-relaxed">
              Para serviços pontuais, mantenha sempre uma cópia digital do <strong>HACCP</strong> e do <strong>Laudo Médico de Coprocultura</strong> (exame de fezes) atualizado no último semestre. Isso evita problemas com inspeções sanitárias surpresa em qualquer porto.
            </p>
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="bg-white border-2 border-gray-100 rounded-[18px] p-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black text-blue-900 uppercase tracking-wide">Documentação em dia?</p>
          <p className="text-[11px] font-bold text-gray-400 mt-0.5">Atualize seu perfil para ser encontrado pelas empresas</p>
        </div>
        <button onClick={onGoToProfile}
          className="bg-blue-900 hover:bg-blue-800 text-white px-4 py-2.5 rounded-[12px] font-black text-[10px] uppercase tracking-wider transition-all flex items-center gap-1.5 flex-shrink-0">
          <CheckCircle2 className="w-3 h-3" /> Perfil
        </button>
      </div>

    </div>
  );
}
