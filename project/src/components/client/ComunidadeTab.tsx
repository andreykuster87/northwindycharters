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
    { tag: 'STCW',       title: 'STCW Básico (BST)',                   desc: 'Certificado internacional de segurança: Sobrevivência, Incêndio, Primeiros Socorros. Obrigatório para qualquer pessoa que durma a bordo ou trabalhe com o navio em navegação.' },
    { tag: 'STCW',       title: 'Security Awareness (VPDSD)',          desc: 'Certificação de conscientização de proteção para atuação em portos internacionais.' },
    { tag: 'Saúde',      title: 'Medical Certificate (Padrão IMO)',    desc: 'Atestado médico internacional (ex: ENG1 ou equivalente reconhecido pela bandeira do navio).' },
    { tag: 'Identidade', title: "Seaman's Book (SID)",                 desc: 'Cédula de identidade marítima da bandeira da embarcação. Essencial para cruzar fronteiras marítimas.' },
    { tag: 'Galley',     title: 'HACCP / Food Safety Level 2',         desc: 'Certificação global de segurança alimentar para profissionais de cozinha.' },
    { tag: 'Documentos', title: 'Passaporte e Vistos',                 desc: 'Passaporte com validade mínima de 6 meses e vistos de tripulante (como o C1/D) dependendo da região de operação.' },
    { tag: 'Financeiro', title: 'International Invoice',               desc: 'Documento fiscal internacional para recebimento da taxa (fee) em moeda estrangeira.' },
  ];

  const nacionalItemsMain = [
    { tag: 'Registro',   title: 'CIR (Caderneta de Inscrição e Registro)', desc: 'Registro profissional na Marinha ou Autoridade Marítima do país (ex: Capitania dos Portos). Oficializa o trabalhador como marítimo local.' },
    { tag: 'Saúde',      title: 'ASO Marítimo Nacional',              desc: 'Atestado de Saúde Ocupacional específico para as normas do país, garantindo que o profissional está apto para o esforço físico a bordo.' },
    { tag: 'Financeiro', title: 'Comprovante de Situação Cadastral (Fiscal)', desc: 'Documentação para emissão de nota fiscal de autônomo, MEI ou recibo de prestação de serviço local para o pagamento da taxa.' },
    { tag: 'Seguro',     title: 'Seguro de Acidentes Pessoais',       desc: 'Muitas vezes exigido para prestadores pontuais para cobrir o trajeto e o período de serviço na costa.' },
  ];

  const nacionalItemsGalley = [
    { tag: 'Galley', title: 'Certificado de Manipulação de Alimentos', desc: 'Curso de higiene exigido pelo órgão de saúde nacional (ex: ANVISA, EFSA, FDA local).' },
    { tag: 'Galley', title: 'Laudo Laboratorial Recente',              desc: 'Exames de saúde específicos para manipuladores de alimentos exigidos pela norma sanitária do país para serviços em eventos.' },
  ];

  return (
    <div className="space-y-5">

      {/* Header */}
      <div>
        <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em] mb-1">Oportunidades</p>
        <h2 className="font-['Playfair_Display'] font-bold text-[#1a2b4a] text-xl">Faça parte da tripulação marítima</h2>
        <div className="w-8 h-px bg-[#c9a96e] mt-2" />
      </div>

      {/* CTA — Status de candidatura ou botão de inserir */}
      {applicationStatus === 'pending' ? (
        <div className="bg-amber-50 border border-amber-200 p-4 flex items-start gap-3">
          <div className="w-9 h-9 bg-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-base">⏳</span>
          </div>
          <div>
            <p className="text-xs font-semibold text-amber-800 uppercase tracking-wide">Candidatura em Análise</p>
            <p className="text-xs font-medium text-amber-700 mt-1 leading-relaxed">
              A sua candidatura a tripulante está sendo analisada pela equipa. Receberá uma mensagem com o resultado em breve.
            </p>
          </div>
        </div>
      ) : applicationStatus === 'approved' ? (
        <div className="bg-green-50 border border-green-200 p-4 flex items-start gap-3">
          <div className="w-9 h-9 bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
            <CheckCircle2 className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold text-green-800 uppercase tracking-wide">Candidatura Aprovada!</p>
            <p className="text-xs font-medium text-green-700 mt-1 leading-relaxed">
              A sua candidatura foi aprovada. Verifique as suas mensagens para obter as credenciais de acesso à área de tripulante.
            </p>
          </div>
        </div>
      ) : applicationStatus === 'rejected' ? (
        <div className="space-y-3">
          <div className="bg-red-50 border border-red-200 p-4 flex items-start gap-3">
            <div className="w-9 h-9 bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-base">❌</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-red-800 uppercase tracking-wide">Candidatura Não Aprovada</p>
              <p className="text-xs font-medium text-red-700 mt-1 leading-relaxed">
                A candidatura anterior não foi aprovada. Verifique as mensagens para saber o motivo e tente novamente.
              </p>
            </div>
          </div>
          <button onClick={onOpenApplication}
            className="w-full bg-[#0a1628] hover:bg-[#1a2b4a] text-white py-4 font-semibold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2.5 border border-[#c9a96e]/30">
            <Anchor className="w-4 h-4 text-[#c9a96e]" /> Nova Candidatura
          </button>
        </div>
      ) : (
        <button onClick={onOpenApplication}
          className="w-full bg-[#0a1628] text-white p-4 font-semibold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-3 border border-[#c9a96e]/30 hover:border-[#c9a96e] relative overflow-hidden group">
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: 'repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 0,transparent 60px),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 0,transparent 60px)' }} />
          <div className="w-8 h-8 bg-[#c9a96e]/15 border border-[#c9a96e]/30 flex items-center justify-center relative">
            <Anchor className="w-4 h-4 text-[#c9a96e]" />
          </div>
          <span className="relative">Inserir Documentos e Candidatar-me</span>
        </button>
      )}

      {/* Seletor Nacional / Internacional */}
      <div className="grid grid-cols-2 gap-0 border border-gray-100">
        <button onClick={() => setActivePanel('nacional')}
          className={`flex items-center justify-center gap-2 py-2.5 font-semibold text-xs uppercase tracking-wide transition-all ${activePanel === 'nacional' ? 'bg-[#0a1628] text-[#c9a96e] border-b-2 border-[#c9a96e]' : 'text-gray-500 hover:text-[#1a2b4a] bg-gray-50'}`}>
          <span className="text-base leading-none">⚓</span> Nacional
        </button>
        <button onClick={() => setActivePanel('internacional')}
          className={`flex items-center justify-center gap-2 py-2.5 font-semibold text-xs uppercase tracking-wide transition-all ${activePanel === 'internacional' ? 'bg-[#0a1628] text-[#c9a96e] border-b-2 border-[#c9a96e]' : 'text-gray-500 hover:text-[#1a2b4a] bg-gray-50'}`}>
          <span className="text-base leading-none">🌐</span> Internacional
        </button>
      </div>

      {/* Painel ativo — descrição */}
      {activePanel === 'internacional' ? (
        <div className="bg-[#0a1628] text-white p-5 flex items-start gap-3 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: 'repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 0,transparent 60px),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 0,transparent 60px)' }} />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a96e]/60 to-transparent" />
          <div className="w-9 h-9 bg-[#c9a96e]/15 border border-[#c9a96e]/30 flex items-center justify-center flex-shrink-0 mt-0.5 relative">
            <Anchor className="w-4 h-4 text-[#c9a96e]" />
          </div>
          <div className="relative">
            <p className="font-['Playfair_Display'] font-bold italic text-sm">Padrão IMO / MLC 2006</p>
            <p className="text-[#c9a96e]/70 text-xs font-medium mt-0.5">Cruzeiros, navios mercantes e rotas internacionais</p>
            <p className="text-white/60 text-xs leading-relaxed mt-2">
              Conformidade com a IMO e a convenção MLC 2006. Certificações STCW são o bilhete de entrada para qualquer rota internacional.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-[#0a1628] text-white p-5 flex items-start gap-3 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: 'repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 0,transparent 60px),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 0,transparent 60px)' }} />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a96e]/60 to-transparent" />
          <div className="w-9 h-9 bg-[#c9a96e]/15 border border-[#c9a96e]/30 flex items-center justify-center flex-shrink-0 mt-0.5 relative">
            <MapPin className="w-4 h-4 text-[#c9a96e]" />
          </div>
          <div className="relative">
            <p className="font-['Playfair_Display'] font-bold italic text-sm">Costa Nacional</p>
            <p className="text-[#c9a96e]/70 text-xs font-medium mt-0.5">Autoridade Marítima Local e Vigilância Sanitária</p>
            <p className="text-white/60 text-xs leading-relaxed mt-2">
              Legislação da Autoridade Marítima e normas do país de operação. Essencial para serviços em portos e eventos nacionais.
            </p>
          </div>
        </div>
      )}

      {/* Lista de documentos */}
      {activePanel === 'nacional' ? (
        <div className="space-y-2.5">
          {nacionalItemsMain.map(({ tag, title, desc }) => (
            <div key={title} className="bg-white border border-gray-100 p-4 flex gap-3" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              <CheckCircle2 className="w-4 h-4 text-[#c9a96e] flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-[9px] font-semibold uppercase px-2 py-0.5 bg-[#0a1628] text-[#c9a96e] tracking-wider">{tag}</span>
                  <p className="text-xs font-['Playfair_Display'] font-bold text-[#1a2b4a]">{title}</p>
                </div>
                <p className="text-xs font-medium text-gray-500 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}

          <div className="bg-[#0a1628]/5 border border-[#c9a96e]/20 p-4 flex gap-3 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a96e]/40 to-transparent" />
            <div className="w-8 h-8 bg-[#0a1628] flex items-center justify-center flex-shrink-0">
              <span className="text-sm text-[#c9a96e]">⚓</span>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em] mb-1">Dica para a Cozinha (Galley)</p>
              <p className="text-xs font-medium text-[#1a2b4a] leading-relaxed">
                Para serviços pontuais, mantenha sempre uma cópia digital do <strong>HACCP</strong> e do <strong>Laudo Médico de Coprocultura</strong> (exame de fezes) atualizado no último semestre. Isso evita problemas com inspeções sanitárias surpresa em qualquer porto.
              </p>
            </div>
          </div>

          {nacionalItemsGalley.map(({ tag, title, desc }) => (
            <div key={title} className="bg-white border border-gray-100 p-4 flex gap-3" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              <CheckCircle2 className="w-4 h-4 text-[#c9a96e] flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-[9px] font-semibold uppercase px-2 py-0.5 bg-[#0a1628] text-[#c9a96e] tracking-wider">{tag}</span>
                  <p className="text-xs font-['Playfair_Display'] font-bold text-[#1a2b4a]">{title}</p>
                </div>
                <p className="text-xs font-medium text-gray-500 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2.5">
          {internacionalItems.map(({ tag, title, desc }) => (
            <div key={title} className="bg-white border border-gray-100 p-4 flex gap-3" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              <CheckCircle2 className="w-4 h-4 text-[#c9a96e] flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-[9px] font-semibold uppercase px-2 py-0.5 bg-[#0a1628] text-[#c9a96e] tracking-wider">{tag}</span>
                  <p className="text-xs font-['Playfair_Display'] font-bold text-[#1a2b4a]">{title}</p>
                </div>
                <p className="text-xs font-medium text-gray-500 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {activePanel === 'internacional' && (
        <div className="bg-[#0a1628]/5 border border-[#c9a96e]/20 p-4 flex gap-3 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a96e]/40 to-transparent" />
          <div className="w-8 h-8 bg-[#0a1628] flex items-center justify-center flex-shrink-0">
            <span className="text-sm text-[#c9a96e]">⚓</span>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em] mb-1">Dica para a Cozinha (Galley)</p>
            <p className="text-xs font-medium text-[#1a2b4a] leading-relaxed">
              Para serviços pontuais, mantenha sempre uma cópia digital do <strong>HACCP</strong> e do <strong>Laudo Médico de Coprocultura</strong> (exame de fezes) atualizado no último semestre. Isso evita problemas com inspeções sanitárias surpresa em qualquer porto.
            </p>
          </div>
        </div>
      )}

      {/* Banner — Faça parte da comunidade (movido de "Informações" do Perfil) */}
      <div className="bg-[#0a1628] p-4 flex items-start gap-3 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 0,transparent 60px),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 0,transparent 60px)' }} />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a96e]/60 to-transparent" />
        <div className="w-9 h-9 bg-[#c9a96e]/15 border border-[#c9a96e]/30 flex items-center justify-center flex-shrink-0 mt-0.5 relative">
          <Anchor className="w-4 h-4 text-[#c9a96e]" />
        </div>
        <div className="flex-1 min-w-0 relative">
          <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em]">Faça parte da tripulação marítima</p>
          <p className="text-xs font-medium text-white/60 mt-1 leading-relaxed">
            Para fazer parte da tripulação marítima, insira os documentos necessários e fique visível para empresas náuticas.
          </p>
          <button
            onClick={onOpenApplication}
            className="mt-3 border border-[#c9a96e] text-[#c9a96e] hover:bg-[#c9a96e] hover:text-[#0a1628] px-4 py-2 font-semibold text-[10px] uppercase tracking-wider transition-all flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3" /> Inserir Documentos
          </button>
        </div>
      </div>

    </div>
  );
}
