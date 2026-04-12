import { Shield, Clock, DollarSign, Anchor, BadgeCheck, X, AlertTriangle, CloudRain, Thermometer, Compass } from 'lucide-react';

const features = [
  { icon: BadgeCheck, title: 'Marinheiros Verificados',  description: 'Todos os profissionais passam por verificação rigorosa de documentação e habilitação.',               number: '01', iconColor: 'text-green-500', clickable: false },
  { icon: DollarSign, title: 'Preços Transparentes',     description: 'Veja o valor exato antes de confirmar sua reserva. Sem taxas ocultas.',                               number: '',   iconColor: 'text-blue-400',  clickable: false },
  { icon: Clock,      title: 'Reserva Instantânea',      description: 'Escolha data e horário em poucos cliques. Confirmação imediata via WhatsApp.',                        number: '',   iconColor: 'text-amber-400', clickable: false },
  { icon: Shield,     title: 'Segurança Náutica',        description: 'Todas as embarcações seguem rigorosamente as normas náuticas vigentes.',                              number: '02', iconColor: 'text-red-400',   clickable: false },
];

const hideScrollbarStyle = `
  .modal-scroll::-webkit-scrollbar { display: none; }
  .modal-scroll { -ms-overflow-style: none; scrollbar-width: none; }
`;

function AboutModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-blue-900/70 backdrop-blur-md"
      onClick={onClose}
    >
      <style>{hideScrollbarStyle}</style>
      <div
        className="modal-scroll bg-white w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-[40px] shadow-2xl border-4 border-blue-900 animate-in zoom-in-95 duration-300"
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-blue-900 px-8 py-7 rounded-t-[36px] flex items-start justify-between gap-4 sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-blue-800 p-1.5 rounded-full">
                <Compass className="w-3.5 h-3.5 text-sky-400" />
              </div>
              <span className="text-blue-300 text-[10px] font-black uppercase tracking-widest">NorthWindy Charters</span>
            </div>
            <h2 className="text-xl font-black text-white uppercase italic leading-tight">
              Não vendemos <span className="vp-shimmer-text">viagens</span>.<br />
              Conectamos o desejo com a experiência de <span className="vp-shimmer-text">navegar</span>.<br />
              <span className="text-blue-300 text-sm font-bold normal-case not-italic mt-1 block leading-snug">
                Conectamos você diretamente com marinheiros profissionais para uma experiência náutica segura e memorável.
              </span>
            </h2>
            <style>{`
              @keyframes vp-pulse-glow {
                0%, 100% { color: #7dd3fc; text-shadow: 0 0 8px rgba(125,211,252,0.5); }
                50%       { color: #bae6fd; text-shadow: 0 0 16px rgba(186,230,253,0.8); }
              }
              .vp-shimmer-text { animation: vp-pulse-glow 2.5s ease-in-out infinite; }
            `}</style>
          </div>
          <button onClick={onClose} className="bg-blue-800 hover:bg-blue-700 text-white p-2.5 rounded-full transition-all flex-shrink-0 mt-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 space-y-8">
          <p className="text-gray-500 font-bold text-sm leading-relaxed">
            A NorthWindy Charters nasceu da vontade de um entusiasta de navegar que, ao buscar o mar, encontrou barreiras onde deveria haver liberdade. A dificuldade em localizar opções de qualidade e a ausência de um processo de contratação dinâmico e fácil foram o combustível para criar algo novo. Percebemos que o mercado náutico precisava de uma ponte: algo que unisse a paixão pelo oceano à agilidade do mundo moderno.
          </p>

          <div className="h-px bg-gray-100" />

          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-sky-100 p-2.5 rounded-[14px]"><Compass className="w-5 h-5 text-sky-600" /></div>
              <h3 className="font-black text-blue-900 uppercase italic text-sm leading-tight">Nossa Essência</h3>
            </div>
            <p className="text-gray-500 font-bold text-sm leading-relaxed">
              Hoje, transformamos essa busca pessoal em uma operadora global de charters que conecta entusiastas às experiências mais exclusivas do planeta. Mais do que viabilizar passeios, entregamos curadoria de alto padrão. Nossa rede é composta exclusivamente por parceiros selecionados e embarcações que superam critérios rigorosos de qualidade, garantindo que a facilidade de reserva se traduza em uma experiência impecável no momento do embarque.
            </p>
          </div>

          <div className="h-px bg-gray-100" />

          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-amber-100 p-2.5 rounded-[14px]"><Anchor className="w-5 h-5 text-amber-600" /></div>
              <h3 className="font-black text-blue-900 uppercase italic text-sm leading-tight">O Que Nos Move</h3>
            </div>
            <div className="space-y-2.5">
              {[
                { emoji: '⚡', title: 'Agilidade Digital, Experiência Real', text: 'Nascemos para desburocratizar. Nossa plataforma foi desenhada para ser dinâmica, permitindo que a contratação do seu próximo passeio seja tão fluida quanto o próprio mar.', bg: 'bg-blue-50 border-blue-100' },
                { emoji: '🌍', title: 'Excelência Global', text: 'Operamos com uma visão cosmopolita, adaptando nossos serviços às demandas de clientes exigentes em qualquer latitude.', bg: 'bg-indigo-50 border-indigo-100' },
                { emoji: '🛡️', title: 'Segurança como Prioridade', text: 'No mar, a confiança é o nosso ativo mais valioso. Nossos protocolos operacionais e parcerias estratégicas garantem que sua única prioridade seja apreciar o horizonte.', bg: 'bg-red-50 border-red-100' },
                { emoji: '🌊', title: 'Sustentabilidade Consciente', text: 'O oceano é nosso escritório e nossa casa. Promovemos a navegação responsável, preservando o ecossistema para as futuras gerações.', bg: 'bg-green-50 border-green-100' },
              ].map(({ emoji, title, text, bg }) => (
                <div key={title} className={`flex items-start gap-3 border-2 rounded-[18px] px-5 py-4 ${bg}`}>
                  <span className="text-xl flex-shrink-0 leading-none mt-0.5">{emoji}</span>
                  <div>
                    <p className="font-black text-blue-900 text-sm uppercase italic mb-1">{title}</p>
                    <p className="font-bold text-sm text-gray-500 leading-snug">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="h-px bg-gray-100" />

          <div className="bg-blue-900 rounded-[24px] px-6 py-5">
            <p className="text-blue-300 font-black text-[10px] uppercase tracking-widest mb-2">Por que navegar com a NorthWindy?</p>
            <p className="text-white font-bold text-sm leading-relaxed">
              Navegar conosco é ter a certeza de um atendimento personalizado e a infraestrutura de uma corporação que domina a complexidade do ambiente náutico global. Criamos a solução que nós mesmos, como entusiastas, queríamos encontrar: uma jornada segura, sofisticada e absolutamente inesquecível.
            </p>
            <p className="text-sky-400 font-black text-sm italic mt-3">NorthWindy Charters — Onde o mundo encontra o mar.</p>
          </div>

          <button onClick={onClose} className="w-full bg-blue-900 hover:bg-blue-800 text-white py-4 rounded-[25px] font-black uppercase text-sm tracking-widest transition-all shadow-lg">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

function CancelPolicyModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-blue-900/70 backdrop-blur-md"
      onClick={onClose}
    >
      <style>{hideScrollbarStyle}</style>
      <div
        className="modal-scroll bg-white w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-[40px] shadow-2xl border-4 border-blue-900 animate-in zoom-in-95 duration-300"
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-blue-900 px-8 py-7 rounded-t-[36px] flex items-start justify-between gap-4 sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-blue-800 p-1.5 rounded-full"><Anchor className="w-3.5 h-3.5 text-cyan-400" /></div>
              <span className="text-blue-300 text-[10px] font-black uppercase tracking-widest">NorthWindy</span>
            </div>
            <h2 className="text-xl font-black text-white uppercase italic leading-tight">
              Política de Cancelamento<br />e Reagendamento
            </h2>
          </div>
          <button onClick={onClose} className="bg-blue-800 hover:bg-blue-700 text-white p-2.5 rounded-full transition-all flex-shrink-0 mt-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 space-y-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-amber-100 p-2.5 rounded-[14px]"><AlertTriangle className="w-5 h-5 text-amber-600" /></div>
              <h3 className="font-black text-blue-900 uppercase italic text-sm leading-tight">1. Cancelamentos por Iniciativa do Cliente</h3>
            </div>
            <p className="text-gray-500 font-bold text-sm mb-4 leading-relaxed">
              Para desistências ou alterações de data solicitadas pelo cliente, aplicam-se as seguintes taxas de retenção sobre o valor total da reserva:
            </p>
            <div className="space-y-2.5">
              {[
                { label: 'Cancelamento com +48h de antecedência',        value: 'Retenção de 40%',  row: 'bg-green-50 border-green-200', badge: 'bg-green-200 text-green-900' },
                { label: 'Cancelamento entre 48h e 24h de antecedência', value: 'Retenção de 60%',  row: 'bg-amber-50 border-amber-200', badge: 'bg-amber-200 text-amber-900' },
                { label: 'Cancelamento com menos de 24h ou No-show',     value: 'Retenção de 100%', row: 'bg-red-50 border-red-200',     badge: 'bg-red-200 text-red-900'   },
              ].map(({ label, value, row, badge }) => (
                <div key={label} className={`flex items-center justify-between border-2 rounded-[18px] px-5 py-3.5 gap-3 ${row}`}>
                  <span className="font-bold text-sm leading-snug text-gray-700">{label}</span>
                  <span className={`flex-shrink-0 font-black text-[11px] uppercase px-3 py-1.5 rounded-full ${badge}`}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="h-px bg-gray-100" />

          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-100 p-2.5 rounded-[14px]"><CloudRain className="w-5 h-5 text-blue-600" /></div>
              <h3 className="font-black text-blue-900 uppercase italic text-sm leading-tight">2. Segurança e Condições Climáticas (Pré-Embarque)</h3>
            </div>
            <p className="text-gray-500 font-bold text-sm mb-4 leading-relaxed">
              A segurança da navegação é nossa prioridade absoluta. Caso as autoridades marítimas locais ou a NorthWindy determinem que as condições climáticas impedem a saída segura da embarcação:
            </p>
            <div className="space-y-2.5">
              {[
                { emoji: '📅', text: 'O cliente terá direito ao reagendamento sem custos (sujeito a disponibilidade).', bg: 'bg-blue-50 border-blue-100' },
                { emoji: '💰', text: 'Não havendo possibilidade de reagendamento, será realizado o estorno integral (100%) do valor pago.', bg: 'bg-green-50 border-green-100' },
              ].map(({ emoji, text, bg }) => (
                <div key={text} className={`flex items-start gap-3 border-2 rounded-[18px] px-5 py-3.5 ${bg}`}>
                  <span className="text-xl flex-shrink-0 leading-none mt-0.5">{emoji}</span>
                  <p className="font-bold text-sm text-gray-600 leading-snug">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="h-px bg-gray-100" />

          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-purple-100 p-2.5 rounded-[14px]"><Thermometer className="w-5 h-5 text-purple-600" /></div>
              <h3 className="font-black text-blue-900 uppercase italic text-sm leading-tight">3. Interrupção do Serviço (Pós-Embarque)</h3>
            </div>
            <p className="text-gray-500 font-bold text-sm mb-4 leading-relaxed">
              Caso o passeio seja interrompido por mudanças climáticas severas ou ordens de segurança após o início da navegação:
            </p>
            <div className="space-y-2.5">
              {[
                { pct: '< 50%', label: 'concluído', text: 'Será emitido um crédito proporcional ou reagendamento parcial, descontando-se os custos operacionais básicos.', bg: 'bg-amber-50 border-amber-100', pctCls: 'bg-amber-200 text-amber-900' },
                { pct: '> 50%', label: 'concluído', text: 'O serviço será considerado integralmente prestado, visto que os custos de logística, tripulação e taxas portuárias já foram executados.', bg: 'bg-gray-50 border-gray-100', pctCls: 'bg-gray-200 text-gray-700' },
              ].map(({ pct, label, text, bg, pctCls }) => (
                <div key={pct} className={`flex items-start gap-4 border-2 rounded-[18px] px-5 py-4 ${bg}`}>
                  <div className="flex-shrink-0 text-center min-w-[52px]">
                    <span className={`inline-block font-black text-base px-3 py-1 rounded-full ${pctCls}`}>{pct}</span>
                    <p className="text-[9px] font-black uppercase text-gray-400 mt-1 leading-tight">{label}</p>
                  </div>
                  <p className="font-bold text-sm text-gray-600 leading-snug pt-1">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <button onClick={onClose} className="w-full bg-blue-900 hover:bg-blue-800 text-white py-4 rounded-[25px] font-black uppercase text-sm tracking-widest transition-all shadow-lg">
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}

export function ValueProposition({ onOpenAbout }: { onOpenAbout: () => void }) {

  return (
    <section className="py-28 px-4 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">

        <div className="mb-8">
          <h2 className="text-5xl md:text-6xl font-black text-blue-900 uppercase italic leading-[0.95] tracking-tighter mb-6">
            Não vendemos{' '}
            <span className="vp-shimmer-text">viagens</span>.<br />
            Conectamos o desejo com a{' '}
            experiência de{' '}
            <span className="vp-shimmer-text">navegar</span>.
          </h2>
          <p className="text-[11px] font-black text-blue-400 uppercase tracking-[0.3em]">
            Charters Certificados · Experiências Únicas
          </p>
        </div>

        <style>{`
          @keyframes vp-pulse-glow {
            0%, 100% { color: #3b82f6; text-shadow: 0 0 8px rgba(59,130,246,0.4), 0 0 20px rgba(59,130,246,0.2); }
            50%       { color: #60a5fa; text-shadow: 0 0 16px rgba(96,165,250,0.7), 0 0 40px rgba(59,130,246,0.35); }
          }
          .vp-shimmer-text {
            animation: vp-pulse-glow 2.5s ease-in-out infinite;
          }
        `}</style>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group relative bg-gray-50 hover:bg-blue-900 rounded-[35px] p-8 border-2 border-gray-100 hover:border-blue-900 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl cursor-default"
              >
                {feature.number && (
                  <span className="absolute top-6 right-8 text-6xl font-black text-gray-100 group-hover:text-blue-800 italic leading-none select-none transition-colors duration-300 pointer-events-none">
                    {feature.number}
                  </span>
                )}
                <div className="relative z-10 mb-8">
                  <div className="bg-white group-hover:bg-blue-800 w-14 h-14 rounded-[18px] flex items-center justify-center shadow-sm transition-all duration-300 border-2 border-gray-100 group-hover:border-blue-700">
                    <Icon className={`w-7 h-7 ${feature.iconColor} group-hover:text-white transition-colors duration-300`} strokeWidth={2.5} />
                  </div>
                </div>
                <h3 className="font-black text-blue-900 group-hover:text-white uppercase italic text-xl mb-3 transition-colors duration-300 leading-tight">
                  {feature.title}
                </h3>
                <p className="text-gray-400 group-hover:text-blue-200 font-bold text-sm leading-relaxed transition-colors duration-300">
                  {feature.description}
                </p>
                <div className="mt-8 h-[3px] bg-gray-200 group-hover:bg-white rounded-full w-8 group-hover:w-full transition-all duration-500 ease-out" />
              </div>
            );
          })}
        </div>

        <div className="mt-12 bg-blue-900 rounded-[40px] px-10 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-white font-black uppercase italic text-2xl tracking-tight leading-tight">Pronto para zarpar?</p>
            <p className="text-blue-300 font-bold text-sm mt-1">Escolha sua embarcação e reserve agora mesmo.</p>
          </div>
          <button
            onClick={() => { const el = document.getElementById('catalog'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }}
            className="flex-shrink-0 bg-white text-blue-900 px-10 py-4 rounded-full font-black uppercase italic text-sm hover:bg-blue-50 transition-all hover:scale-105 shadow-xl tracking-wide"
          >
            Ver Embarcações →
          </button>
        </div>
      </div>
    </section>
  );
}