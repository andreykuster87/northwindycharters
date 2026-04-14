// src/components/TermosPage.tsx
import { useEffect, useState } from 'react';
import { ArrowLeft, Shield, Anchor, ChevronDown, ChevronRight } from 'lucide-react';
import { LOGO_SRC } from '../../assets';

interface TermosPageProps {
  onBack: () => void;
}

const categories = [
  {
    emoji: '📋',
    title: 'Termos de Serviço',
    eyebrow: 'CONTRATO',
    sections: [
      { title: '1. Definições', content: `Para efeitos dos presentes Termos, entende-se por: "Plataforma" o website e aplicações NorthWindy Charters; "Utilizador" qualquer pessoa singular ou coletiva que aceda à Plataforma; "Comandante" o prestador de serviços náuticos registado na Plataforma; "Passeio" o serviço de embarcação disponibilizado por um Comandante.` },
      { title: '2. Aceitação dos Termos', content: `Ao aceder e utilizar a Plataforma NorthWindy Charters, o Utilizador aceita integralmente os presentes Termos, bem como a Política de Privacidade. A utilização continuada da Plataforma após alterações implica a aceitação das mesmas. Caso não concorde, deverá abster-se de utilizar a Plataforma.` },
      { title: '3. Registo e Conta', content: `O registo é gratuito e destinado a maiores de 18 anos. O Utilizador é responsável pela veracidade das informações fornecidas e pela confidencialidade das suas credenciais. A NorthWindy reserva-se o direito de suspender ou encerrar contas que violem estes Termos, sem aviso prévio e sem direito a indemnização.` },
      { title: '4. Reservas e Pagamentos', content: `As reservas estão sujeitas à disponibilidade indicada pelo Comandante. O pagamento é processado de forma segura através dos meios disponíveis na Plataforma. Após confirmação, o Utilizador receberá um comprovativo por email. A NorthWindy não armazena dados de cartão de crédito.` },
      { title: '5. Responsabilidades', content: `A NorthWindy Charters atua exclusivamente como intermediário entre Utilizadores e Comandantes. A responsabilidade pela prestação dos serviços a bordo é inteiramente do Comandante. A NorthWindy não se responsabiliza por danos materiais, corporais ou morais decorrentes dos passeios, nem por atrasos, alterações ou cancelamentos por parte dos Comandantes.` },
      { title: '6. Propriedade Intelectual', content: `Todo o conteúdo da Plataforma — logótipos, textos, imagens, código e design — é propriedade exclusiva da NorthWindy Charters e está protegido por lei. É proibida qualquer reprodução, distribuição ou utilização comercial sem autorização expressa e por escrito.` },
      { title: '7. Privacidade e Dados Pessoais', content: `O tratamento de dados pessoais é realizado em conformidade com o RGPD (UE 2016/679). Os dados destinam-se exclusivamente à prestação e melhoria dos serviços. O Utilizador tem direito de acesso, retificação, portabilidade e apagamento dos seus dados mediante pedido para privacidade@northwindy.com.` },
      { title: '8. Alterações aos Termos', content: `A NorthWindy reserva-se o direito de alterar os presentes Termos a qualquer momento. As alterações serão comunicadas por email e/ou pela Plataforma, entrando em vigor 15 dias após notificação. O uso continuado após esse prazo constitui aceitação tácita.` },
      { title: '9. Legislação Aplicável e Foro', content: `Os presentes Termos são regidos pela legislação portuguesa. Em caso de litígio, as partes submetem-se à jurisdição exclusiva dos Tribunais da Comarca de Lisboa, com expressa renúncia a qualquer outro foro.` },
    ],
  },
  {
    emoji: '⚓',
    title: 'Termos e Condições',
    eyebrow: 'CONDUTA',
    sections: [
      { title: '10. Código de Conduta', content: `O Utilizador compromete-se a comportar-se de forma respeitosa para com o Comandante, tripulação e outros passageiros. Comportamentos desrespeitosos, violentos ou que coloquem em risco a segurança da embarcação podem resultar na interrupção imediata do passeio, sem reembolso, e no bloqueio permanente da conta.` },
      { title: '11. Substâncias Proibidas', content: `É estritamente proibido embarcar com substâncias ilícitas ou consumir álcool em excesso durante os passeios. O Comandante tem autoridade para negar o embarque ou interromper o passeio a qualquer passageiro que se apresente em estado de embriaguez ou sob efeito de substâncias que comprometam a segurança a bordo.` },
      { title: '12. Pontualidade', content: `O Utilizador deve apresentar-se no local de embarque com pelo menos 15 minutos de antecedência. Atrasos superiores a 20 minutos sem aviso prévio podem implicar a perda da reserva sem reembolso, salvo acordo expresso com o Comandante.` },
      { title: '13. Menores a Bordo', content: `Menores de 18 anos apenas podem participar acompanhados por um responsável legal adulto. O responsável assume total responsabilidade pela segurança do menor durante todo o passeio.` },
      { title: '14. Animais e Bagagem', content: `A admissão de animais e as regras de bagagem são definidas por cada Comandante e indicadas na ficha do passeio. A NorthWindy não se responsabiliza por danos ou perdas de objetos pessoais a bordo.` },
    ],
  },
  {
    emoji: '🛡️',
    title: 'Segurança',
    eyebrow: 'NORMAS MARÍTIMAS',
    sections: [
      { title: '15. Normas de Segurança Marítima', content: `Todos os Comandantes são obrigados a cumprir integralmente a legislação nacional e europeia sobre segurança marítima, incluindo a Portaria n.º 107/2019 e a Diretiva 2009/45/CE. Certificados, licenças e seguros são verificados pela NorthWindy no momento do registo e periodicamente.` },
      { title: '16. Equipamento de Segurança', content: `Cada embarcação deve dispor obrigatoriamente de: coletes salva-vidas para todos os passageiros, sinalizadores de emergência, kit de primeiros socorros, rádio VHF e meios de extinção de incêndio. O Utilizador pode solicitar verificação destes equipamentos antes do embarque.` },
      { title: '17. Condições Meteorológicas', content: `O Comandante tem autoridade exclusiva para cancelar ou interromper um passeio por razões de segurança meteorológicas. Esta decisão é irrevogável e não constitui incumprimento contratual. Em caso de cancelamento por mau tempo, o Utilizador tem direito a reembolso integral ou reagendamento sem custos.` },
      { title: '18. Responsabilidade do Utilizador a Bordo', content: `O Utilizador deve seguir em todo o momento as instruções do Comandante e da tripulação. Em situação de emergência, deve obedecer imediatamente às ordens dadas. A desobediência a instruções de segurança pode resultar em responsabilidade civil por danos causados a terceiros ou à embarcação.` },
      { title: '19. Verificação de Comandantes', content: `A NorthWindy verifica a documentação de todos os Comandantes: cédula marítima, título de navegador, apólice de seguro de responsabilidade civil e registos de segurança da embarcação. Comandantes com irregularidades são imediatamente suspensos da Plataforma.` },
    ],
  },
  {
    emoji: '↩️',
    title: 'Política de Cancelamento',
    eyebrow: 'REEMBOLSOS',
    sections: [
      { title: '20. Cancelamento pelo Utilizador', content: `• Mais de 72 horas de antecedência: reembolso integral (100%).\n• Entre 24 e 72 horas: reembolso de 50% do valor pago.\n• Menos de 24 horas: sem reembolso, salvo força maior documentada.\n• Não comparência sem aviso: sem reembolso.` },
      { title: '21. Cancelamento pelo Comandante', content: `Se o Comandante cancelar um passeio confirmado por razões não relacionadas com segurança ou força maior, o Utilizador tem direito a reembolso integral e a uma compensação de 10% do valor da reserva, creditada em saldo na Plataforma para uso futuro.` },
      { title: '22. Cancelamento por Força Maior', content: `Situações de força maior incluem: condições meteorológicas adversas declaradas pelas autoridades marítimas, avaria mecânica súbita, atos de autoridade pública ou eventos imprevisíveis fora do controlo razoável das partes. Nestes casos, o Utilizador tem direito a reembolso integral ou reagendamento sem custos.` },
      { title: '23. Processo de Reembolso', content: `Os reembolsos são processados pelo mesmo meio de pagamento utilizado na reserva, num prazo máximo de 7 dias úteis após confirmação do cancelamento. A NorthWindy não cobra taxas de processamento. Dúvidas: suporte@northwindy.com.` },
      { title: '24. Reagendamento', content: `O Utilizador pode solicitar o reagendamento até 48 horas antes da data do passeio, sujeito a disponibilidade. Cada reserva permite um reagendamento gratuito. Reagendamentos adicionais podem estar sujeitos a taxa definida pelo Comandante.` },
    ],
  },
];

function AccordionSection({ title, content }: { title: string; content: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`overflow-hidden transition-all duration-200 border-b ${open ? 'border-[#c9a96e]/30' : 'border-gray-100'}`}>
      <button onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left group">
        <span className={`font-['Playfair_Display'] font-bold text-sm transition-colors ${open ? 'text-[#c9a96e]' : 'text-[#1a2b4a] group-hover:text-[#c9a96e]'}`}>{title}</span>
        <ChevronDown className={`w-4 h-4 flex-shrink-0 transition-all duration-300 ${open ? 'rotate-180 text-[#c9a96e]' : 'text-gray-300'}`} />
      </button>
      {open && (
        <div className="px-5 pb-5">
          <p className="text-gray-500 font-medium text-sm leading-relaxed whitespace-pre-line">{content}</p>
        </div>
      )}
    </div>
  );
}

export function TermosPage({ onBack }: TermosPageProps) {
  useEffect(() => {
    document.title = 'Termos, Condições & Políticas | NorthWindy Charters';
    return () => { document.title = 'NorthWindy Charters'; };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <style>{`
        * { scrollbar-width: none; -ms-overflow-style: none; }
        *::-webkit-scrollbar { display: none; }
      `}</style>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 px-6 md:px-16 py-4 flex items-center justify-between">
        <button onClick={onBack}
          className="flex items-center gap-2 text-[#1a2b4a] font-medium text-sm tracking-wide hover:gap-3 transition-all">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>
        <img src={LOGO_SRC} alt="NorthWindy" style={{ height: '112px', width: 'auto', objectFit: 'contain' }} />
        <div className="w-20" />
      </header>

      {/* Hero */}
      <section className="relative bg-[#0a1628] text-white px-6 md:px-16 py-24 text-center overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 0,transparent 60px),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 0,transparent 60px)' }} />
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-[#c9a96e]/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a96e]/40 to-transparent" />
        <div className="relative max-w-2xl mx-auto">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#c9a96e] mb-6">
            Legal · NorthWindy Charters
          </p>
          <h1 className="font-['Playfair_Display'] font-bold italic text-4xl md:text-5xl leading-tight mb-4">
            Termos, Condições,<br />Segurança & Cancelamentos
          </h1>
          <div className="flex items-center justify-center gap-3 my-6">
            <div className="w-8 h-px bg-[#c9a96e]" />
            <div className="w-8 h-px bg-[#c9a96e]" />
          </div>
          <p className="text-white/40 font-medium text-sm">Última atualização: Janeiro de 2025</p>
        </div>
      </section>

      {/* Índice rápido */}
      <section className="max-w-3xl mx-auto px-6 md:px-8 pt-12 pb-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {categories.map((cat, i) => (
            <a key={i} href={`#cat-${i}`}
              className="group flex flex-col items-center gap-2 bg-white border border-gray-100 hover:border-[#c9a96e] transition-all text-center p-5"
              style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              <span className="text-2xl">{cat.emoji}</span>
              <span className="font-['Playfair_Display'] font-bold text-[#1a2b4a] text-[12px] leading-tight group-hover:text-[#c9a96e] transition-colors">{cat.title}</span>
            </a>
          ))}
        </div>
      </section>

      {/* Aviso */}
      <section className="max-w-3xl mx-auto px-6 md:px-8 py-6">
        <div className="flex gap-3 bg-[#0a1628]/5 border-l-2 border-[#c9a96e] px-6 py-4">
          <Anchor className="w-5 h-5 text-[#c9a96e] flex-shrink-0 mt-0.5" />
          <p className="text-[#1a2b4a] font-medium text-sm leading-relaxed">
            Ao criar uma conta ou efetuar uma reserva na NorthWindy Charters, aceita integralmente todos os documentos abaixo. Leia com atenção antes de prosseguir.
          </p>
        </div>
      </section>

      {/* Categorias com acordeão */}
      <section className="max-w-3xl mx-auto px-6 md:px-8 pb-16 space-y-10">
        {categories.map((cat, ci) => (
          <div key={ci} id={`cat-${ci}`}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#c9a96e] mb-3">{cat.eyebrow}</p>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">{cat.emoji}</span>
              <h2 className="font-['Playfair_Display'] font-bold text-[#1a2b4a] text-2xl">{cat.title}</h2>
            </div>
            <div className="w-8 h-px bg-[#c9a96e] mb-6" />
            <div className="bg-white border border-gray-100" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              {cat.sections.map((sec, si) => (
                <AccordionSection key={si} title={sec.title} content={sec.content} />
              ))}
            </div>
          </div>
        ))}

        {/* Contacto */}
        <div className="relative bg-[#0a1628] p-10 text-center overflow-hidden">
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: 'repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 0,transparent 60px),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 0,transparent 60px)' }} />
          <div className="relative">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#c9a96e] mb-3">SUPORTE JURÍDICO</p>
            <p className="font-['Playfair_Display'] font-bold italic text-white text-2xl mb-3">Dúvidas Legais?</p>
            <div className="w-8 h-px bg-[#c9a96e] mx-auto mb-5" />
            <p className="text-white/50 font-medium text-sm mb-8">A nossa equipa jurídica está disponível para esclarecer qualquer questão.</p>
            <a href="mailto:legal@northwindy.com"
              className="inline-flex items-center gap-2 border border-[#c9a96e] text-[#c9a96e] hover:bg-[#c9a96e] hover:text-[#0a1628] px-6 py-3 font-semibold uppercase text-xs tracking-widest transition-all">
              legal@northwindy.com <ChevronRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-100 py-8 text-center text-xs text-gray-400 font-medium uppercase tracking-widest">
        © {new Date().getFullYear()} NorthWindy Charters · Todos os direitos reservados
      </footer>
    </div>
  );
}
