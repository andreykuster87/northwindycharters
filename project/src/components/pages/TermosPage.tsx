// src/components/TermosPage.tsx
import { useEffect, useState } from 'react';
import { ArrowLeft, Shield, Anchor, ChevronDown } from 'lucide-react';
import { LOGO_SRC } from '../../assets';

interface TermosPageProps {
  onBack: () => void;
}

const categories = [
  {
    emoji: '📋',
    title: 'Termos de Serviço',
    color: 'border-blue-900',
    sections: [
      {
        title: '1. Definições',
        content: `Para efeitos dos presentes Termos, entende-se por: "Plataforma" o website e aplicações NorthWindy Charters; "Utilizador" qualquer pessoa singular ou coletiva que aceda à Plataforma; "Comandante" o prestador de serviços náuticos registado na Plataforma; "Passeio" o serviço de embarcação disponibilizado por um Comandante.`,
      },
      {
        title: '2. Aceitação dos Termos',
        content: `Ao aceder e utilizar a Plataforma NorthWindy Charters, o Utilizador aceita integralmente os presentes Termos, bem como a Política de Privacidade. A utilização continuada da Plataforma após alterações implica a aceitação das mesmas. Caso não concorde, deverá abster-se de utilizar a Plataforma.`,
      },
      {
        title: '3. Registo e Conta',
        content: `O registo é gratuito e destinado a maiores de 18 anos. O Utilizador é responsável pela veracidade das informações fornecidas e pela confidencialidade das suas credenciais. A NorthWindy reserva-se o direito de suspender ou encerrar contas que violem estes Termos, sem aviso prévio e sem direito a indemnização.`,
      },
      {
        title: '4. Reservas e Pagamentos',
        content: `As reservas estão sujeitas à disponibilidade indicada pelo Comandante. O pagamento é processado de forma segura através dos meios disponíveis na Plataforma. Após confirmação, o Utilizador receberá um comprovativo por email. A NorthWindy não armazena dados de cartão de crédito.`,
      },
      {
        title: '5. Responsabilidades',
        content: `A NorthWindy Charters atua exclusivamente como intermediário entre Utilizadores e Comandantes. A responsabilidade pela prestação dos serviços a bordo é inteiramente do Comandante. A NorthWindy não se responsabiliza por danos materiais, corporais ou morais decorrentes dos passeios, nem por atrasos, alterações ou cancelamentos por parte dos Comandantes.`,
      },
      {
        title: '6. Propriedade Intelectual',
        content: `Todo o conteúdo da Plataforma — logótipos, textos, imagens, código e design — é propriedade exclusiva da NorthWindy Charters e está protegido por lei. É proibida qualquer reprodução, distribuição ou utilização comercial sem autorização expressa e por escrito.`,
      },
      {
        title: '7. Privacidade e Dados Pessoais',
        content: `O tratamento de dados pessoais é realizado em conformidade com o RGPD (UE 2016/679). Os dados destinam-se exclusivamente à prestação e melhoria dos serviços. O Utilizador tem direito de acesso, retificação, portabilidade e apagamento dos seus dados mediante pedido para privacidade@northwindy.com.`,
      },
      {
        title: '8. Alterações aos Termos',
        content: `A NorthWindy reserva-se o direito de alterar os presentes Termos a qualquer momento. As alterações serão comunicadas por email e/ou pela Plataforma, entrando em vigor 15 dias após notificação. O uso continuado após esse prazo constitui aceitação tácita.`,
      },
      {
        title: '9. Legislação Aplicável e Foro',
        content: `Os presentes Termos são regidos pela legislação portuguesa. Em caso de litígio, as partes submetem-se à jurisdição exclusiva dos Tribunais da Comarca de Lisboa, com expressa renúncia a qualquer outro foro.`,
      },
    ],
  },
  {
    emoji: '⚓',
    title: 'Termos e Condições',
    color: 'border-cyan-600',
    sections: [
      {
        title: '10. Código de Conduta',
        content: `O Utilizador compromete-se a comportar-se de forma respeitosa para com o Comandante, tripulação e outros passageiros. Comportamentos desrespeitosos, violentos ou que coloquem em risco a segurança da embarcação podem resultar na interrupção imediata do passeio, sem reembolso, e no bloqueio permanente da conta.`,
      },
      {
        title: '11. Substâncias Proibidas',
        content: `É estritamente proibido embarcar com substâncias ilícitas ou consumir álcool em excesso durante os passeios. O Comandante tem autoridade para negar o embarque ou interromper o passeio a qualquer passageiro que se apresente em estado de embriaguez ou sob efeito de substâncias que comprometam a segurança a bordo.`,
      },
      {
        title: '12. Pontualidade',
        content: `O Utilizador deve apresentar-se no local de embarque com pelo menos 15 minutos de antecedência. Atrasos superiores a 20 minutos sem aviso prévio podem implicar a perda da reserva sem reembolso, salvo acordo expresso com o Comandante.`,
      },
      {
        title: '13. Menores a Bordo',
        content: `Menores de 18 anos apenas podem participar acompanhados por um responsável legal adulto. O responsável assume total responsabilidade pela segurança do menor durante todo o passeio.`,
      },
      {
        title: '14. Animais e Bagagem',
        content: `A admissão de animais e as regras de bagagem são definidas por cada Comandante e indicadas na ficha do passeio. A NorthWindy não se responsabiliza por danos ou perdas de objetos pessoais a bordo.`,
      },
    ],
  },
  {
    emoji: '🛡️',
    title: 'Segurança',
    color: 'border-green-600',
    sections: [
      {
        title: '15. Normas de Segurança Marítima',
        content: `Todos os Comandantes são obrigados a cumprir integralmente a legislação nacional e europeia sobre segurança marítima, incluindo a Portaria n.º 107/2019 e a Diretiva 2009/45/CE. Certificados, licenças e seguros são verificados pela NorthWindy no momento do registo e periodicamente.`,
      },
      {
        title: '16. Equipamento de Segurança',
        content: `Cada embarcação deve dispor obrigatoriamente de: coletes salva-vidas para todos os passageiros, sinalizadores de emergência, kit de primeiros socorros, rádio VHF e meios de extinção de incêndio. O Utilizador pode solicitar verificação destes equipamentos antes do embarque.`,
      },
      {
        title: '17. Condições Meteorológicas',
        content: `O Comandante tem autoridade exclusiva para cancelar ou interromper um passeio por razões de segurança meteorológicas. Esta decisão é irrevogável e não constitui incumprimento contratual. Em caso de cancelamento por mau tempo, o Utilizador tem direito a reembolso integral ou reagendamento sem custos.`,
      },
      {
        title: '18. Responsabilidade do Utilizador a Bordo',
        content: `O Utilizador deve seguir em todo o momento as instruções do Comandante e da tripulação. Em situação de emergência, deve obedecer imediatamente às ordens dadas. A desobediência a instruções de segurança pode resultar em responsabilidade civil por danos causados a terceiros ou à embarcação.`,
      },
      {
        title: '19. Verificação de Comandantes',
        content: `A NorthWindy verifica a documentação de todos os Comandantes: cédula marítima, título de navegador, apólice de seguro de responsabilidade civil e registos de segurança da embarcação. Comandantes com irregularidades são imediatamente suspensos da Plataforma.`,
      },
    ],
  },
  {
    emoji: '↩️',
    title: 'Política de Cancelamento',
    color: 'border-amber-500',
    sections: [
      {
        title: '20. Cancelamento pelo Utilizador',
        content: `• Mais de 72 horas de antecedência: reembolso integral (100%).\n• Entre 24 e 72 horas: reembolso de 50% do valor pago.\n• Menos de 24 horas: sem reembolso, salvo força maior documentada.\n• Não comparência sem aviso: sem reembolso.`,
      },
      {
        title: '21. Cancelamento pelo Comandante',
        content: `Se o Comandante cancelar um passeio confirmado por razões não relacionadas com segurança ou força maior, o Utilizador tem direito a reembolso integral e a uma compensação de 10% do valor da reserva, creditada em saldo na Plataforma para uso futuro.`,
      },
      {
        title: '22. Cancelamento por Força Maior',
        content: `Situações de força maior incluem: condições meteorológicas adversas declaradas pelas autoridades marítimas, avaria mecânica súbita, atos de autoridade pública ou eventos imprevisíveis fora do controlo razoável das partes. Nestes casos, o Utilizador tem direito a reembolso integral ou reagendamento sem custos.`,
      },
      {
        title: '23. Processo de Reembolso',
        content: `Os reembolsos são processados pelo mesmo meio de pagamento utilizado na reserva, num prazo máximo de 7 dias úteis após confirmação do cancelamento. A NorthWindy não cobra taxas de processamento. Dúvidas: suporte@northwindy.com.`,
      },
      {
        title: '24. Reagendamento',
        content: `O Utilizador pode solicitar o reagendamento até 48 horas antes da data do passeio, sujeito a disponibilidade. Cada reserva permite um reagendamento gratuito. Reagendamentos adicionais podem estar sujeitos a taxa definida pelo Comandante.`,
      },
    ],
  },
];

function AccordionSection({ title, content }: { title: string; content: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`border-2 rounded-2xl overflow-hidden transition-all duration-200 ${open ? 'border-blue-900' : 'border-gray-100 hover:border-blue-200'}`}>
      <button onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left">
        <span className="font-black text-blue-900 text-sm">{title}</span>
        <ChevronDown className={`w-4 h-4 text-blue-900 flex-shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-5 pb-5">
          <p className="text-gray-600 font-bold text-sm leading-relaxed whitespace-pre-line">{content}</p>
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
          className="flex items-center gap-2 text-blue-900 font-black uppercase text-xs tracking-widest hover:gap-3 transition-all">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>
        <img src={LOGO_SRC} alt="NorthWindy" style={{ height: '112px', width: 'auto', objectFit: 'contain' }} />
        <div className="w-20" />
      </header>

      {/* Hero */}
      <section className="bg-blue-900 text-white px-6 md:px-16 py-16 text-center">
        <div className="max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6">
            <Shield className="w-3 h-3" /> Legal
          </span>
          <h1 className="text-4xl md:text-5xl font-black uppercase italic leading-tight mb-3">
            Termos, Condições,<br />Segurança & Cancelamentos
          </h1>
          <p className="text-blue-300 font-bold text-sm">Última atualização: Janeiro de 2025</p>
        </div>
      </section>

      {/* Índice rápido */}
      <section className="max-w-3xl mx-auto px-6 md:px-8 pt-10 pb-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {categories.map((cat, i) => (
            <a key={i} href={`#cat-${i}`}
              className="flex flex-col items-center gap-2 bg-gray-50 hover:bg-blue-50 border-2 border-gray-100 hover:border-blue-900 rounded-2xl px-3 py-4 transition-all text-center group">
              <span className="text-2xl">{cat.emoji}</span>
              <span className="font-black text-blue-900 text-[11px] uppercase leading-tight group-hover:text-blue-700">{cat.title}</span>
            </a>
          ))}
        </div>
      </section>

      {/* Aviso */}
      <section className="max-w-3xl mx-auto px-6 md:px-8 py-4">
        <div className="bg-blue-50 border-l-4 border-blue-900 rounded-r-2xl px-6 py-4 flex gap-3">
          <Anchor className="w-5 h-5 text-blue-900 flex-shrink-0 mt-0.5" />
          <p className="text-blue-900 font-bold text-sm leading-relaxed">
            Ao criar uma conta ou efetuar uma reserva na NorthWindy Charters, aceita integralmente todos os documentos abaixo. Leia com atenção antes de prosseguir.
          </p>
        </div>
      </section>

      {/* Categorias com acordeão */}
      <section className="max-w-3xl mx-auto px-6 md:px-8 pb-16 space-y-10">
        {categories.map((cat, ci) => (
          <div key={ci} id={`cat-${ci}`} className={`border-l-4 ${cat.color} pl-5`}>
            <div className="flex items-center gap-3 mb-5">
              <span className="text-2xl">{cat.emoji}</span>
              <h2 className="font-black text-blue-900 text-xl uppercase italic">{cat.title}</h2>
            </div>
            <div className="space-y-3">
              {cat.sections.map((sec, si) => (
                <AccordionSection key={si} title={sec.title} content={sec.content} />
              ))}
            </div>
          </div>
        ))}

        {/* Contacto */}
        <div className="bg-gray-50 rounded-[24px] p-8 text-center">
          <p className="font-black text-blue-900 text-xl uppercase italic mb-2">Dúvidas Legais?</p>
          <p className="text-gray-500 font-bold text-sm mb-6">A nossa equipa jurídica está disponível para esclarecer qualquer questão.</p>
          <a href="mailto:legal@northwindy.com"
            className="inline-flex items-center gap-2 bg-blue-900 hover:bg-blue-800 text-white px-6 py-3 rounded-full font-black uppercase text-xs transition-all">
            legal@northwindy.com
          </a>
        </div>
      </section>

      <footer className="border-t border-gray-100 py-8 text-center text-xs text-gray-400 font-bold uppercase tracking-widest">
        © {new Date().getFullYear()} NorthWindy Charters · Todos os direitos reservados
      </footer>
    </div>
  );
}