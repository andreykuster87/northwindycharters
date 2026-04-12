// src/components/TermosModal.tsx
// Modal compacto com todos os termos — usado na área de criação de conta
import { useState } from 'react';
import { X, Shield, ChevronDown } from 'lucide-react';

interface TermosModalProps {
  onAccept?: () => void;
  onClose:  () => void;
}

const categories = [
  {
    emoji: '📋',
    title: 'Termos de Serviço',
    sections: [
      { title: '1. Aceitação', content: 'Ao criar uma conta, aceita integralmente os presentes Termos e a Política de Privacidade. O registo destina-se a maiores de 18 anos.' },
      { title: '2. Registo e Conta', content: 'O Utilizador é responsável pela veracidade dos dados fornecidos e pela confidencialidade das credenciais. Contas com informação falsa podem ser suspensas.' },
      { title: '3. Reservas e Pagamentos', content: 'As reservas estão sujeitas à disponibilidade do Comandante. O pagamento é processado de forma segura. A NorthWindy não armazena dados de cartão.' },
      { title: '4. Responsabilidades', content: 'A NorthWindy atua como intermediário. A responsabilidade pelos serviços a bordo é do Comandante. A NorthWindy não se responsabiliza por danos decorrentes dos passeios.' },
      { title: '5. Privacidade (RGPD)', content: 'Os dados pessoais são tratados em conformidade com o RGPD (UE 2016/679), usados apenas para a prestação dos serviços. Pode solicitar acesso, retificação ou apagamento em privacidade@northwindy.com.' },
    ],
  },
  {
    emoji: '⚓',
    title: 'Termos e Condições',
    sections: [
      { title: '6. Código de Conduta', content: 'Comportamentos desrespeitosos, violentos ou que comprometam a segurança da embarcação resultam na interrupção imediata do passeio sem reembolso e bloqueio da conta.' },
      { title: '7. Substâncias Proibidas', content: 'É proibido embarcar com substâncias ilícitas ou consumir álcool em excesso. O Comandante pode negar o embarque a passageiros em estado de embriaguez.' },
      { title: '8. Pontualidade', content: 'Apresente-se 15 minutos antes do embarque. Atrasos superiores a 20 minutos sem aviso podem implicar perda da reserva sem reembolso.' },
      { title: '9. Menores a Bordo', content: 'Menores de 18 anos apenas podem participar acompanhados por um responsável legal adulto, que assume total responsabilidade pela segurança do menor.' },
    ],
  },
  {
    emoji: '🛡️',
    title: 'Segurança',
    sections: [
      { title: '10. Normas Marítimas', content: 'Todos os Comandantes cumprem a legislação nacional e europeia de segurança marítima. Licenças, certificados e seguros são verificados pela NorthWindy.' },
      { title: '11. Equipamento a Bordo', content: 'Coletes salva-vidas, sinalizadores, kit de primeiros socorros, rádio VHF e extintores são obrigatórios em todas as embarcações.' },
      { title: '12. Mau Tempo', content: 'O Comandante pode cancelar ou interromper o passeio por razões de segurança meteorológicas. Neste caso, tem direito a reembolso integral ou reagendamento.' },
      { title: '13. Instruções a Bordo', content: 'Deve seguir todas as instruções do Comandante e tripulação. A desobediência a instruções de segurança pode implicar responsabilidade civil.' },
    ],
  },
  {
    emoji: '↩️',
    title: 'Cancelamentos',
    sections: [
      { title: '14. Cancelamento pelo Cliente', content: '• +72h de antecedência: reembolso 100%\n• Entre 24h–72h: reembolso 50%\n• -24h: sem reembolso (salvo força maior)\n• Não comparência: sem reembolso' },
      { title: '15. Cancelamento pelo Comandante', content: 'Se o Comandante cancelar sem justificação válida, tem direito a reembolso integral + compensação de 10% em saldo na Plataforma.' },
      { title: '16. Força Maior', content: 'Mau tempo declarado pelas autoridades, avaria mecânica ou eventos imprevisíveis garantem reembolso integral ou reagendamento sem custos.' },
      { title: '17. Reembolsos', content: 'Processados em 7 dias úteis pelo mesmo meio de pagamento. Sem taxas de processamento. Dúvidas: suporte@northwindy.com.' },
    ],
  },
];

function AccordionItem({ title, content }: { title: string; content: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`border rounded-xl overflow-hidden transition-all ${open ? 'border-blue-900' : 'border-gray-100'}`}>
      <button onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left">
        <span className="font-black text-blue-900 text-xs">{title}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-blue-900 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-4 pb-4">
          <p className="text-gray-600 font-bold text-xs leading-relaxed whitespace-pre-line">{content}</p>
        </div>
      )}
    </div>
  );
}

export function TermosModal({ onClose }: TermosModalProps) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}>
      <div className="bg-white w-full max-w-lg rounded-[28px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300"
        style={{ maxHeight: '88vh' }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-900" />
            <h2 className="font-black text-blue-900 text-base uppercase italic">Termos & Condições</h2>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-300 hover:text-blue-900 hover:bg-blue-50 transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Aviso */}
        <div className="px-6 py-3 bg-blue-50 border-b border-blue-100 flex-shrink-0">
          <p className="text-blue-900 font-bold text-xs leading-relaxed">
            Leia os termos abaixo antes de criar a sua conta. Ao aceitar, confirma que leu e compreendeu todas as condições.
          </p>
        </div>

        {/* Scroll content */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">
          {categories.map((cat, ci) => (
            <div key={ci}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{cat.emoji}</span>
                <h3 className="font-black text-blue-900 text-sm uppercase italic">{cat.title}</h3>
              </div>
              <div className="space-y-2">
                {cat.sections.map((sec, si) => (
                  <AccordionItem key={si} title={sec.title} content={sec.content} />
                ))}
              </div>
            </div>
          ))}

          {/* Data e versão */}
          <p className="text-center text-gray-400 text-[10px] font-bold pt-2">
            Versão 1.0 · Última atualização: Janeiro de 2025 · NorthWindy Charters
          </p>
        </div>

      </div>
    </div>
  );
}