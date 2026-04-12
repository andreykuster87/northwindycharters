// src/components/FAQPage.tsx
import { useEffect, useState } from 'react';
import { ArrowLeft, ChevronDown, HelpCircle, Anchor } from 'lucide-react';
import { LOGO_SRC } from '../../assets';

interface FAQPageProps {
  onBack: () => void;
}

const faqs = [
  {
    category: 'Reservas',
    items: [
      {
        q: 'Como faço uma reserva?',
        a: 'Escolha o passeio que mais gosta, selecione uma data e horário disponíveis, e finalize a reserva após criar uma conta gratuita. Receberá uma confirmação por email.',
      },
      {
        q: 'Posso reservar para um grupo?',
        a: 'Sim! Cada embarcação tem uma capacidade máxima indicada. Basta selecionar o número de participantes ao fazer a sua reserva.',
      },
      {
        q: 'A reserva é imediata?',
        a: 'Na maioria dos passeios, a confirmação é automática. Em alguns casos, o Comandante pode precisar de validar a disponibilidade, o que acontece em até 24 horas.',
      },
    ],
  },
  {
    category: 'Cancelamentos e Reembolsos',
    items: [
      {
        q: 'Como cancelo uma reserva?',
        a: 'Aceda à sua Área de Cliente, selecione a reserva e clique em "Cancelar". A política de reembolso aplicada depende do prazo de antecedência.',
      },
      {
        q: 'Tenho direito a reembolso?',
        a: 'Cancelamentos com mais de 48 horas de antecedência têm direito a reembolso integral. Para cancelamentos tardios, consulte a política específica de cada passeio.',
      },
      {
        q: 'O que acontece em caso de mau tempo?',
        a: 'Em caso de condições meteorológicas adversas que impeçam a realização do passeio, o Comandante poderá cancelar e receberá um reembolso integral ou a possibilidade de reagendar.',
      },
    ],
  },
  {
    category: 'Segurança',
    items: [
      {
        q: 'Os Comandantes são verificados?',
        a: 'Sim. Todos os Comandantes passam por um processo de verificação que inclui documentação náutica, licenças e seguros obrigatórios.',
      },
      {
        q: 'É necessário saber nadar?',
        a: 'Recomendamos que todos os participantes saibam nadar. Coletes salva-vidas estão sempre disponíveis a bordo e são obrigatórios quando indicado.',
      },
      {
        q: 'Os passeios têm seguro?',
        a: 'Todos os passeios publicados na plataforma devem ter seguro de responsabilidade civil válido. Verifique os detalhes de cada passeio antes de reservar.',
      },
    ],
  },
  {
    category: 'Conta e Dados',
    items: [
      {
        q: 'Como crio uma conta?',
        a: 'Clique em "Criar conta" no portal de acesso, preencha os seus dados e confirme o registo. O processo demora menos de 2 minutos.',
      },
      {
        q: 'Os meus dados estão seguros?',
        a: 'Sim. Tratamos os seus dados em total conformidade com o RGPD. Nunca partilhamos os seus dados com terceiros sem o seu consentimento.',
      },
      {
        q: 'Como altero as minhas informações pessoais?',
        a: 'Aceda às Definições na sua Área de Cliente e atualize os seus dados a qualquer momento.',
      },
    ],
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`border-2 rounded-2xl overflow-hidden transition-all duration-300 ${open ? 'border-blue-900' : 'border-gray-100 hover:border-blue-200'}`}>
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left">
        <span className="font-black text-blue-900 text-sm">{q}</span>
        <ChevronDown className={`w-4 h-4 text-blue-900 flex-shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-6 pb-5">
          <p className="text-gray-600 font-bold text-sm leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

export function FAQPage({ onBack }: FAQPageProps) {
  useEffect(() => {
    document.title = 'FAQ | NorthWindy Charters';
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
            <HelpCircle className="w-3 h-3" /> Ajuda
          </span>
          <h1 className="text-4xl md:text-5xl font-black uppercase italic leading-none mb-4">
            Perguntas Frequentes
          </h1>
          <p className="text-blue-300 font-bold">Encontre rapidamente as respostas que precisa.</p>
        </div>
      </section>

      {/* FAQ Sections */}
      <section className="max-w-3xl mx-auto px-6 md:px-8 py-16 space-y-12">
        {faqs.map((cat, ci) => (
          <div key={ci}>
            <div className="flex items-center gap-3 mb-5">
              <div className="bg-blue-900 w-8 h-8 rounded-xl flex items-center justify-center">
                <Anchor className="w-4 h-4 text-white" />
              </div>
              <h2 className="font-black text-blue-900 text-xl uppercase italic">{cat.category}</h2>
            </div>
            <div className="space-y-3">
              {cat.items.map((item, ii) => (
                <FAQItem key={ii} q={item.q} a={item.a} />
              ))}
            </div>
          </div>
        ))}

        {/* Still need help */}
        <div className="bg-blue-50 rounded-[24px] p-8 text-center">
          <p className="font-black text-blue-900 text-xl uppercase italic mb-2">Ainda tem dúvidas?</p>
          <p className="text-gray-500 font-bold text-sm mb-6">A nossa equipa está disponível para ajudar.</p>
          <a href="mailto:suporte@northwindy.com"
            className="inline-flex items-center gap-2 bg-blue-900 hover:bg-blue-800 text-white px-6 py-3 rounded-full font-black uppercase text-xs transition-all">
            Contactar suporte
          </a>
        </div>
      </section>

      <footer className="border-t border-gray-100 py-8 text-center text-xs text-gray-400 font-bold uppercase tracking-widest">
        © {new Date().getFullYear()} NorthWindy Charters · Todos os direitos reservados
      </footer>
    </div>
  );
}