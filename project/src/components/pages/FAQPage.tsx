// src/components/FAQPage.tsx
import { useEffect, useState } from 'react';
import { ArrowLeft, ChevronDown, ChevronRight } from 'lucide-react';
import { LOGO_SRC } from '../../assets';

interface FAQPageProps {
  onBack: () => void;
}

const faqs = [
  {
    category: 'Reservas',
    eyebrow: 'COMO FUNCIONA',
    items: [
      { q: 'Como faço uma reserva?', a: 'Escolha o passeio que mais gosta, selecione uma data e horário disponíveis, e finalize a reserva após criar uma conta gratuita. Receberá uma confirmação por email.' },
      { q: 'Posso reservar para um grupo?', a: 'Sim! Cada embarcação tem uma capacidade máxima indicada. Basta selecionar o número de participantes ao fazer a sua reserva.' },
      { q: 'A reserva é imediata?', a: 'Na maioria dos passeios, a confirmação é automática. Em alguns casos, o Comandante pode precisar de validar a disponibilidade, o que acontece em até 24 horas.' },
    ],
  },
  {
    category: 'Cancelamentos e Reembolsos',
    eyebrow: 'POLÍTICAS',
    items: [
      { q: 'Como cancelo uma reserva?', a: 'Aceda à sua Área de Cliente, selecione a reserva e clique em "Cancelar". A política de reembolso aplicada depende do prazo de antecedência.' },
      { q: 'Tenho direito a reembolso?', a: 'Cancelamentos com mais de 48 horas de antecedência têm direito a reembolso integral. Para cancelamentos tardios, consulte a política específica de cada passeio.' },
      { q: 'O que acontece em caso de mau tempo?', a: 'Em caso de condições meteorológicas adversas que impeçam a realização do passeio, o Comandante poderá cancelar e receberá um reembolso integral ou a possibilidade de reagendar.' },
    ],
  },
  {
    category: 'Segurança',
    eyebrow: 'NAVEGAÇÃO SEGURA',
    items: [
      { q: 'Os Comandantes são verificados?', a: 'Sim. Todos os Comandantes passam por um processo de verificação que inclui documentação náutica, licenças e seguros obrigatórios.' },
      { q: 'É necessário saber nadar?', a: 'Recomendamos que todos os participantes saibam nadar. Coletes salva-vidas estão sempre disponíveis a bordo e são obrigatórios quando indicado.' },
      { q: 'Os passeios têm seguro?', a: 'Todos os passeios publicados na plataforma devem ter seguro de responsabilidade civil válido. Verifique os detalhes de cada passeio antes de reservar.' },
    ],
  },
  {
    category: 'Conta e Dados',
    eyebrow: 'PRIVACIDADE',
    items: [
      { q: 'Como crio uma conta?', a: 'Clique em "Criar conta" no portal de acesso, preencha os seus dados e confirme o registo. O processo demora menos de 2 minutos.' },
      { q: 'Os meus dados estão seguros?', a: 'Sim. Tratamos os seus dados em total conformidade com o RGPD. Nunca partilhamos os seus dados com terceiros sem o seu consentimento.' },
      { q: 'Como altero as minhas informações pessoais?', a: 'Aceda às Definições na sua Área de Cliente e atualize os seus dados a qualquer momento.' },
    ],
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`overflow-hidden transition-all duration-300 border-b ${open ? 'border-[#c9a96e]/30' : 'border-gray-100'}`}>
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left group">
        <span className={`font-['Playfair_Display'] font-bold text-sm transition-colors ${open ? 'text-[#c9a96e]' : 'text-[#1a2b4a] group-hover:text-[#c9a96e]'}`}>{q}</span>
        <ChevronDown className={`w-4 h-4 flex-shrink-0 transition-all duration-300 ${open ? 'rotate-180 text-[#c9a96e]' : 'text-gray-300'}`} />
      </button>
      {open && (
        <div className="px-5 pb-5">
          <p className="text-gray-500 font-medium text-sm leading-relaxed">{a}</p>
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
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#c9a96e] mb-6">Ajuda · Suporte</p>
          <h1 className="font-['Playfair_Display'] font-bold italic text-4xl md:text-5xl leading-tight mb-4">
            Perguntas Frequentes
          </h1>
          <div className="flex items-center justify-center gap-3 my-5">
            <div className="w-8 h-px bg-[#c9a96e]" />
            <div className="w-8 h-px bg-[#c9a96e]" />
          </div>
          <p className="text-white/50 font-medium">Encontre rapidamente as respostas que precisa.</p>
        </div>
      </section>

      {/* FAQ Sections */}
      <section className="max-w-3xl mx-auto px-6 md:px-8 py-16 space-y-14">
        {faqs.map((cat, ci) => (
          <div key={ci}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#c9a96e] mb-3">{cat.eyebrow}</p>
            <h2 className="font-['Playfair_Display'] font-bold text-[#1a2b4a] text-2xl mb-4">{cat.category}</h2>
            <div className="w-8 h-px bg-[#c9a96e] mb-6" />
            <div className="bg-white border border-gray-100" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              {cat.items.map((item, ii) => (
                <FAQItem key={ii} q={item.q} a={item.a} />
              ))}
            </div>
          </div>
        ))}

        {/* Still need help */}
        <div className="relative bg-[#0a1628] p-10 text-center overflow-hidden">
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: 'repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 0,transparent 60px),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 0,transparent 60px)' }} />
          <div className="relative">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#c9a96e] mb-3">SUPORTE</p>
            <p className="font-['Playfair_Display'] font-bold italic text-white text-2xl mb-3">Ainda tem dúvidas?</p>
            <div className="w-8 h-px bg-[#c9a96e] mx-auto mb-5" />
            <p className="text-white/50 font-medium text-sm mb-8">A nossa equipa está disponível para ajudar.</p>
            <a href="mailto:suporte@northwindy.com"
              className="inline-flex items-center gap-2 border border-[#c9a96e] text-[#c9a96e] hover:bg-[#c9a96e] hover:text-[#0a1628] px-6 py-3 font-semibold uppercase text-xs tracking-widest transition-all">
              Contactar suporte <ChevronRight className="w-3.5 h-3.5" />
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
