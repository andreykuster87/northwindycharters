// src/components/SiteFooter.tsx
import { useState } from 'react';
import { X, Anchor, AlertTriangle, CloudRain, Thermometer, Shield, FileText, Users, Leaf } from 'lucide-react';
import { LOGO_SRC } from '../../assets';

const hideScrollbarStyle = `
  .footer-modal-scroll::-webkit-scrollbar { display: none; }
  .footer-modal-scroll { -ms-overflow-style: none; scrollbar-width: none; }
`;

const TABS = [
  { id: 'termos',       label: 'Termos Gerais' },
  { id: 'seguranca',    label: 'Segurança' },
  { id: 'operacional',  label: 'Padrões Operacionais' },
  { id: 'cancelamento', label: 'Cancelamentos' },
];

function TermsModal({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState('termos');

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(4,10,24,0.88)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <style>{hideScrollbarStyle}</style>
      <div
        className="footer-modal-scroll bg-white w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header sticky com tabs */}
        <div className="bg-[#0a1628] relative overflow-hidden px-6 py-6 sticky top-0 z-10 flex items-start justify-between gap-4">
          {/* Grid texture */}
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: 'repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 0,transparent 60px),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 0,transparent 60px)' }} />
          {/* Gold bottom line */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a96e]/40 to-transparent" />

          <div className="relative z-10 flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 bg-[#c9a96e]/10 flex items-center justify-center">
                <FileText className="w-3.5 h-3.5 text-[#c9a96e]" />
              </div>
              <span className="text-[10px] font-semibold text-[#c9a96e]/70 uppercase tracking-[0.15em]">NorthWindy Charters</span>
            </div>
            <h2 className="font-['Playfair_Display'] font-bold italic text-xl text-white leading-tight">
              Termos, Condições, Segurança<br />& Política de Cancelamento
            </h2>
            <div className="flex flex-wrap gap-2 mt-4">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`text-[10px] font-semibold uppercase tracking-wider px-4 py-2 transition-all ${
                    activeTab === tab.id
                      ? 'bg-[#c9a96e] text-[#0a1628]'
                      : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={onClose}
            className="relative z-10 w-8 h-8 bg-white/5 hover:bg-white/15 flex items-center justify-center transition-all border border-white/10 flex-shrink-0 mt-1"
          >
            <X className="w-4 h-4 text-white/70" />
          </button>
        </div>

        <div className="p-8 space-y-8">

          {/* ══ TAB: TERMOS GERAIS ══ */}
          {activeTab === 'termos' && (
            <>
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#0a1628]/10 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-[#c9a96e]" />
                  </div>
                  <h3 className="font-['Playfair_Display'] font-bold text-[#1a2b4a] text-sm leading-tight">Termos e Condições Gerais</h3>
                </div>
                <div className="space-y-2.5">
                  {[
                    { emoji: '📋', text: 'A reserva implica a aceitação integral dos presentes termos e condições.' },
                    { emoji: '🔒', text: 'Os dados pessoais recolhidos são tratados em conformidade com o RGPD e nunca partilhados com terceiros sem consentimento.' },
                    { emoji: '⚓', text: 'A NorthWindy Charters actua como intermediário entre o cliente e os marinheiros/embarcações certificados, não sendo operadora directa da navegação.' },
                    { emoji: '📍', text: 'Os passeios estão sujeitos a disponibilidade e às normas das autoridades marítimas locais em vigor.' },
                  ].map(({ emoji, text }) => (
                    <div key={text} className="flex items-start gap-3 border border-gray-100 px-5 py-3.5 bg-[#0a1628]/3">
                      <span className="text-xl flex-shrink-0 leading-none mt-0.5">{emoji}</span>
                      <p className="font-medium text-sm text-gray-600 leading-snug">{text}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="h-px bg-gray-100" />

              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-amber-50 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                  </div>
                  <h3 className="font-['Playfair_Display'] font-bold text-[#1a2b4a] text-sm leading-tight">Responsabilidades</h3>
                </div>
                <div className="space-y-2.5">
                  {[
                    { emoji: '🛡️', text: 'Cada embarcação é operada por marinheiros certificados e habilitados pelas autoridades náuticas competentes.' },
                    { emoji: '⚠️', text: 'O cliente assume a responsabilidade pelo cumprimento das normas de segurança a bordo e das instruções da tripulação.' },
                    { emoji: '🌊', text: 'A NorthWindy não se responsabiliza por danos pessoais ou materiais resultantes de comportamentos negligentes do cliente durante o passeio.' },
                    { emoji: '📞', text: 'Em caso de emergência a bordo, a tripulação dispõe de protocolos de segurança marítima e contactos directos com as autoridades.' },
                    { emoji: '🛡️', text: 'Serviços de seguro viagem e protecção náutica estão disponíveis para contratação, com cobertura personalizada para acidentes pessoais durante o passeio.' },
                  ].map(({ emoji, text }) => (
                    <div key={text} className="flex items-start gap-3 border border-amber-100 px-5 py-3.5 bg-amber-50">
                      <span className="text-xl flex-shrink-0 leading-none mt-0.5">{emoji}</span>
                      <p className="font-medium text-sm text-gray-600 leading-snug">{text}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="h-px bg-gray-100" />

              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-50 flex items-center justify-center">
                    <Leaf className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="font-['Playfair_Display'] font-bold text-[#1a2b4a] text-sm leading-tight">Sustentabilidade e Preservação</h3>
                </div>
                <div className="space-y-2.5">
                  {[
                    { emoji: '🌍', text: 'Aplicamos protocolos de Impacto Zero em todas as operações. O descarte de resíduos no mar é terminantemente proibido.' },
                    { emoji: '🌊', text: 'Incentivamos o respeito absoluto aos ecossistemas marinhos locais e promovemos a navegação consciente e responsável para as gerações futuras.' },
                  ].map(({ emoji, text }) => (
                    <div key={text} className="flex items-start gap-3 border border-green-100 px-5 py-3.5 bg-green-50">
                      <span className="text-xl flex-shrink-0 leading-none mt-0.5">{emoji}</span>
                      <p className="font-medium text-sm text-gray-600 leading-snug">{text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ══ TAB: SEGURANÇA ══ */}
          {activeTab === 'seguranca' && (
            <>
              <div className="bg-[#0a1628] relative overflow-hidden px-6 py-4">
                <div className="absolute inset-0 opacity-[0.04]"
                  style={{ backgroundImage: 'repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 0,transparent 60px),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 0,transparent 60px)' }} />
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a96e]/40 to-transparent" />
                <div className="relative z-10">
                  <p className="font-['Playfair_Display'] font-bold italic text-white text-sm">⚓ Compromisso Global com a Segurança Náutica</p>
                  <p className="text-[#c9a96e]/70 font-medium text-xs mt-1 leading-relaxed">
                    Em todas as nossas operações, a segurança é o pilar fundamental. Operamos sob rigoroso protocolo de gestão de riscos, garantindo que cada jornada seja pautada pela confiança, integridade e profissionalismo.
                  </p>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-[#0a1628]/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-[#c9a96e]" />
                  </div>
                  <h3 className="font-['Playfair_Display'] font-bold text-[#1a2b4a] text-sm leading-tight">Briefing de Segurança ao Passageiro</h3>
                </div>
                <p className="text-gray-400 font-medium text-xs mb-3 uppercase tracking-wider">Apresentado antes do embarque ou no voucher de compra.</p>
                <div className="space-y-2.5">
                  {[
                    { num: '1', title: 'Uso de Coletes', text: 'Obrigatório para crianças e não nadadores durante todo o trajeto. Para os demais, o colete deve estar visível e de fácil acesso.' },
                    { num: '2', title: 'Embarque e Desembarque', text: 'Só suba ou desça do barco quando o motor estiver desligado e o condutor autorizar. Nunca salte com o barco em movimento.' },
                    { num: '3', title: 'Circulação a Bordo', text: 'Evite caminhar pelo barco em velocidade de cruzeiro. Mantenha mãos e pés dentro da embarcação em todos os momentos.' },
                    { num: '4', title: 'Comportamento na Água', text: 'Mantenha-se afastado dos motores (a hélice é cortante mesmo desligada) e não se distancie do raio visual do condutor.' },
                    { num: '5', title: 'Resíduos', text: 'É proibido deitar qualquer tipo de lixo ao mar. Utilize as lixeiras a bordo.' },
                    { num: '6', title: 'Autoridade do Comandante', text: 'Em emergências ou mudanças climáticas, as instruções do comandante são soberanas e devem ser seguidas sem questionamento.' },
                  ].map(({ num, title, text }) => (
                    <div key={num} className="flex items-start gap-3 border border-gray-100 px-5 py-3.5 bg-[#0a1628]/3">
                      <span className="flex-shrink-0 w-6 h-6 bg-[#0a1628] text-[#c9a96e] text-[10px] font-bold flex items-center justify-center mt-0.5">{num}</span>
                      <div>
                        <p className="font-semibold text-[#1a2b4a] text-xs uppercase tracking-wide mb-0.5">{title}</p>
                        <p className="font-medium text-sm text-gray-600 leading-snug">{text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="h-px bg-gray-100" />

              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-red-50 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-red-500" />
                  </div>
                  <h3 className="font-['Playfair_Display'] font-bold text-[#1a2b4a] text-sm leading-tight">Equipamentos de Salvatagem Obrigatórios</h3>
                </div>
                <div className="space-y-2.5">
                  {[
                    { emoji: '🦺', title: 'Coletes Salva-vidas', text: 'Um por cada pessoa a bordo, com tamanho e flutuabilidade adequados (incluindo crianças). Em local de fácil acesso, nunca em armários trancados.' },
                    { emoji: '🔴', title: 'Boia Circular', text: 'Pelo menos uma boia com retinida (corda) para lançar em caso de homem ao mar.' },
                    { emoji: '🧯', title: 'Extintores de Incêndio', text: 'Dentro do prazo de validade, posicionados junto ao motor e ao posto de comando.' },
                  ].map(({ emoji, title, text }) => (
                    <div key={title} className="flex items-start gap-3 border border-red-100 px-5 py-3.5 bg-red-50">
                      <span className="text-xl flex-shrink-0 leading-none mt-0.5">{emoji}</span>
                      <div>
                        <p className="font-semibold text-[#1a2b4a] text-xs uppercase tracking-wide mb-0.5">{title}</p>
                        <p className="font-medium text-sm text-gray-600 leading-snug">{text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="h-px bg-gray-100" />

              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-amber-50 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                  </div>
                  <h3 className="font-['Playfair_Display'] font-bold text-[#1a2b4a] text-sm leading-tight">Normas de Conduta e Navegação</h3>
                </div>
                <div className="space-y-2.5">
                  {[
                    { emoji: '📏', text: 'Respeite a distância mínima de 200 metros da linha de arrebentação e de áreas delimitadas para banhistas.' },
                    { emoji: '🚤', text: 'Reduza a velocidade ao entrar em canais, proximidade de marinas ou áreas de fundeio.' },
                    { emoji: '🚫', text: 'Tolerância zero para consumo de álcool pelo condutor — equivalente à Lei Seca nas estradas.' },
                    { emoji: '⛽', text: 'Regra do combustível: 1/3 para ir · 1/3 para voltar · 1/3 de reserva.' },
                    { emoji: '⚖️', text: 'Nunca exceda o limite de passageiros indicado pelo fabricante. O excesso de peso compromete a estabilidade.' },
                  ].map(({ emoji, text }) => (
                    <div key={text} className="flex items-start gap-3 border border-amber-100 px-5 py-3.5 bg-amber-50">
                      <span className="text-xl flex-shrink-0 leading-none mt-0.5">{emoji}</span>
                      <p className="font-medium text-sm text-gray-600 leading-snug">{text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ══ TAB: PADRÕES OPERACIONAIS ══ */}
          {activeTab === 'operacional' && (
            <>
              <div className="bg-[#0a1628] relative overflow-hidden px-6 py-4">
                <div className="absolute inset-0 opacity-[0.04]"
                  style={{ backgroundImage: 'repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 0,transparent 60px),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 0,transparent 60px)' }} />
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a96e]/40 to-transparent" />
                <div className="relative z-10">
                  <p className="font-['Playfair_Display'] font-bold italic text-white text-sm">👨‍✈️ Padrões Operacionais</p>
                  <p className="text-[#c9a96e]/70 font-medium text-xs mt-1 leading-relaxed">
                    A nossa rede global de parceiros e comandantes adere a um código de conduta rigoroso, garantindo a excelência em cada operação.
                  </p>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#0a1628]/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-[#c9a96e]" />
                  </div>
                  <h3 className="font-['Playfair_Display'] font-bold text-[#1a2b4a] text-sm leading-tight">Verificação Técnica Pré-Partida</h3>
                </div>
                <div className="space-y-2.5">
                  {[
                    { emoji: '✅', title: 'Inspecção Obrigatória', text: 'Checklist técnico antes de cada saída, cobrindo sistemas de propulsão, segurança e equipamentos de comunicação.' },
                    { emoji: '📡', title: 'Rádio VHF ou Telemóvel', text: 'Essencial para pedir socorro. Em passeios mais longos, o rádio VHF é mais fiável que o telemóvel.' },
                    { emoji: '🗺️', title: 'Aviso de Saída', text: 'Informar a uma marina ou pessoa em terra sobre o destino e horário previsto de retorno.' },
                    { emoji: '💡', title: 'Luzes de Navegação', text: 'Se houver possibilidade de navegar ao entardecer ou à noite, as luzes de bombordo (encarnada), boreste (verde) e alcançado (branca) devem estar operacionais.' },
                  ].map(({ emoji, title, text }) => (
                    <div key={title} className="flex items-start gap-3 border border-gray-100 px-5 py-3.5 bg-[#0a1628]/3">
                      <span className="text-xl flex-shrink-0 leading-none mt-0.5">{emoji}</span>
                      <div>
                        <p className="font-semibold text-[#1a2b4a] text-xs uppercase tracking-wide mb-0.5">{title}</p>
                        <p className="font-medium text-sm text-gray-600 leading-snug">{text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="h-px bg-gray-100" />

              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-50 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="font-['Playfair_Display'] font-bold text-[#1a2b4a] text-sm leading-tight">Certificação e Conformidade</h3>
                </div>
                <div className="space-y-2.5">
                  {[
                    { emoji: '📜', title: 'Habilitação e Documentação', text: 'O condutor deve portar a Arrais Amador (ou superior) e o TIE (Título de Inscrição da Embarcação) deve estar em dia.' },
                    { emoji: '🏅', title: 'Certificações Válidas', text: 'Exigimos que todas as embarcações e tripulações possuam licenças e certificações válidas perante as autoridades marítimas competentes.' },
                    { emoji: '🚫', title: 'Política de Sobriedade', text: 'Tolerância zero para consumo de substâncias que possam comprometer a capacidade operacional da tripulação.' },
                  ].map(({ emoji, title, text }) => (
                    <div key={title} className="flex items-start gap-3 border border-green-100 px-5 py-3.5 bg-green-50">
                      <span className="text-xl flex-shrink-0 leading-none mt-0.5">{emoji}</span>
                      <div>
                        <p className="font-semibold text-[#1a2b4a] text-xs uppercase tracking-wide mb-0.5">{title}</p>
                        <p className="font-medium text-sm text-gray-600 leading-snug">{text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="h-px bg-gray-100" />

              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#0a1628]/10 flex items-center justify-center">
                    <Anchor className="w-5 h-5 text-[#c9a96e]" />
                  </div>
                  <h3 className="font-['Playfair_Display'] font-bold text-[#1a2b4a] text-sm leading-tight">Zonas e Actividades a Bordo</h3>
                </div>
                <div className="space-y-2.5">
                  {[
                    { emoji: '🏊', text: 'Actividades na água são permitidas apenas com motores desligados e em áreas autorizadas pela tripulação.' },
                    { emoji: '🚶', text: 'Permaneça em áreas seguras e designadas enquanto a embarcação estiver em deslocamento.' },
                    { emoji: '👨‍✈️', text: 'O Comandante possui autoridade máxima para decisões técnicas e de segurança. O cumprimento das suas instruções é fundamental para a protecção de todos.' },
                  ].map(({ emoji, text }) => (
                    <div key={text} className="flex items-start gap-3 border border-gray-100 px-5 py-3.5 bg-gray-50">
                      <span className="text-xl flex-shrink-0 leading-none mt-0.5">{emoji}</span>
                      <p className="font-medium text-sm text-gray-600 leading-snug">{text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ══ TAB: CANCELAMENTOS ══ */}
          {activeTab === 'cancelamento' && (
            <>
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-red-50 flex items-center justify-center">
                    <Anchor className="w-5 h-5 text-red-500" />
                  </div>
                  <h3 className="font-['Playfair_Display'] font-bold text-[#1a2b4a] text-sm leading-tight">1. Cancelamentos por Iniciativa do Cliente</h3>
                </div>
                <p className="text-gray-500 font-medium text-sm mb-4 leading-relaxed">
                  Para desistências ou alterações de data solicitadas pelo cliente, aplicam-se as seguintes taxas de retenção sobre o valor total da reserva:
                </p>
                <div className="space-y-2.5">
                  {[
                    { label: 'Cancelamento com +48h de antecedência',        value: 'Retenção de 40%',  row: 'bg-green-50 border-green-200', badge: 'bg-green-100 text-green-800' },
                    { label: 'Cancelamento entre 48h e 24h de antecedência', value: 'Retenção de 60%',  row: 'bg-amber-50 border-amber-200', badge: 'bg-amber-100 text-amber-800' },
                    { label: 'Cancelamento com menos de 24h ou No-show',     value: 'Retenção de 100%', row: 'bg-red-50 border-red-200',     badge: 'bg-red-100 text-red-800'   },
                  ].map(({ label, value, row, badge }) => (
                    <div key={label} className={`flex items-center justify-between border px-5 py-3.5 gap-3 ${row}`}>
                      <span className="font-medium text-sm leading-snug text-gray-700">{label}</span>
                      <span className={`flex-shrink-0 font-semibold text-[11px] uppercase px-3 py-1 ${badge}`}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="h-px bg-gray-100" />

              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#0a1628]/10 flex items-center justify-center">
                    <CloudRain className="w-5 h-5 text-[#c9a96e]" />
                  </div>
                  <h3 className="font-['Playfair_Display'] font-bold text-[#1a2b4a] text-sm leading-tight">2. Condições Climáticas (Pré-Embarque)</h3>
                </div>
                <p className="text-gray-500 font-medium text-sm mb-4 leading-relaxed">
                  Caso as autoridades marítimas ou a NorthWindy determinem que as condições impedem a saída segura da embarcação:
                </p>
                <div className="space-y-2.5">
                  {[
                    { emoji: '📅', text: 'O cliente terá direito ao reagendamento sem custos (sujeito a disponibilidade).', bg: 'bg-[#0a1628]/3 border-gray-100' },
                    { emoji: '💰', text: 'Não havendo possibilidade de reagendamento, será realizado o estorno integral (100%) do valor pago.', bg: 'bg-green-50 border-green-100' },
                  ].map(({ emoji, text, bg }) => (
                    <div key={text} className={`flex items-start gap-3 border px-5 py-3.5 ${bg}`}>
                      <span className="text-xl flex-shrink-0 leading-none mt-0.5">{emoji}</span>
                      <p className="font-medium text-sm text-gray-600 leading-snug">{text}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="h-px bg-gray-100" />

              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#0a1628]/10 flex items-center justify-center">
                    <Thermometer className="w-5 h-5 text-[#c9a96e]" />
                  </div>
                  <h3 className="font-['Playfair_Display'] font-bold text-[#1a2b4a] text-sm leading-tight">3. Interrupção do Serviço (Pós-Embarque)</h3>
                </div>
                <p className="text-gray-500 font-medium text-sm mb-4 leading-relaxed">
                  Caso o passeio seja interrompido por mudanças climáticas severas ou ordens de segurança após o início da navegação:
                </p>
                <div className="space-y-2.5">
                  {[
                    { pct: '< 50%', label: 'concluído', text: 'Será emitido um crédito proporcional ou reagendamento parcial, descontando-se os custos operacionais básicos.', bg: 'bg-amber-50 border-amber-100', pctCls: 'bg-amber-100 text-amber-900' },
                    { pct: '> 50%', label: 'concluído', text: 'O serviço será considerado integralmente prestado, visto que os custos de logística, tripulação e taxas portuárias já foram executados.', bg: 'bg-gray-50 border-gray-100', pctCls: 'bg-gray-100 text-gray-700' },
                  ].map(({ pct, label, text, bg, pctCls }) => (
                    <div key={pct} className={`flex items-start gap-4 border px-5 py-4 ${bg}`}>
                      <div className="flex-shrink-0 text-center min-w-[52px]">
                        <span className={`inline-block font-bold text-base px-3 py-1 ${pctCls}`}>{pct}</span>
                        <p className="text-[9px] font-semibold uppercase text-gray-400 mt-1 leading-tight">{label}</p>
                      </div>
                      <p className="font-medium text-sm text-gray-600 leading-snug pt-1">{text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <button
            onClick={onClose}
            className="w-full bg-[#0a1628] text-white py-4 px-6 font-semibold uppercase tracking-widest text-sm hover:bg-[#1a2b4a] transition-all"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}

interface Props {
  onAdminClick: () => void;
}

export function SiteFooter({ onAdminClick }: Props) {
  const [showTerms, setShowTerms] = useState(false);

  return (
    <>
      <footer id="site-footer" className="bg-[#0a1628] py-16 px-6 relative overflow-hidden">
        {/* Grid texture */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 0,transparent 60px),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 0,transparent 60px)' }} />
        {/* Gold top line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a96e]/60 to-transparent" />

        <div className="max-w-6xl mx-auto relative z-10">

          {/* Link de termos */}
          <div className="mb-8 pb-6 border-b border-[#c9a96e]/10">
            <button
              onClick={() => setShowTerms(true)}
              className="text-[#c9a96e]/30 hover:text-[#c9a96e]/60 text-[10px] font-semibold uppercase tracking-[0.15em] transition-colors"
            >
              Termos · Condições · Segurança · Política de Cancelamento · Responsabilidades
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 pb-10 border-b border-[#c9a96e]/10">

            {/* Logo + descrição */}
            <div className="flex flex-col items-start gap-5">
              <button
                onClick={onAdminClick}
                className="group transition-all duration-300 hover:opacity-80"
                title="Acesso restrito"
              >
                <img
                  src={LOGO_SRC}
                  alt="NorthWindy Charters"
                  style={{ height: '112px', width: 'auto', objectFit: 'contain', filter: 'brightness(0) invert(1) drop-shadow(0 2px 12px rgba(255,255,255,0.15))' }}
                />
              </button>
              <p className="text-white/40 text-sm leading-relaxed max-w-xs font-medium">
                O marketplace de referência para passeios náuticos. Qualidade, transparência e experiências únicas no Tejo e além.
              </p>
            </div>

            {/* Contactos */}
            <div className="flex flex-col gap-4">
              <h4 className="font-['Playfair_Display'] font-bold text-[#c9a96e] text-base mb-1">Contactos</h4>
              <a href="https://wa.me/351900000000" target="_blank" rel="noreferrer"
                className="flex items-center gap-3 text-white/50 hover:text-white transition-colors text-sm group">
                <span className="w-8 h-8 bg-white/5 group-hover:bg-green-500/20 flex items-center justify-center transition-colors text-base">💬</span>
                WhatsApp
              </a>
              <a href="mailto:info@northwindy.com"
                className="flex items-center gap-3 text-white/50 hover:text-white transition-colors text-sm group">
                <span className="w-8 h-8 bg-white/5 group-hover:bg-[#c9a96e]/20 flex items-center justify-center transition-colors text-base">✉️</span>
                info@northwindy.com
              </a>
              <a href="tel:+351900000000"
                className="flex items-center gap-3 text-white/50 hover:text-white transition-colors text-sm group">
                <span className="w-8 h-8 bg-white/5 group-hover:bg-[#c9a96e]/20 flex items-center justify-center transition-colors text-base">📞</span>
                +351 900 000 000
              </a>
            </div>

            {/* Redes sociais */}
            <div className="flex flex-col gap-4">
              <h4 className="font-['Playfair_Display'] font-bold text-[#c9a96e] text-base mb-1">Siga-nos</h4>
              <a href="https://instagram.com/northwindycharters" target="_blank" rel="noreferrer"
                className="flex items-center gap-3 text-white/50 hover:text-white transition-colors text-sm group">
                <span className="w-8 h-8 bg-white/5 group-hover:bg-pink-500/20 flex items-center justify-center transition-colors text-base">📸</span>
                @northwindycharters
              </a>
              <a href="https://facebook.com/northwindy" target="_blank" rel="noreferrer"
                className="flex items-center gap-3 text-white/50 hover:text-white transition-colors text-sm group">
                <span className="w-8 h-8 bg-white/5 group-hover:bg-[#c9a96e]/20 flex items-center justify-center transition-colors text-base">👥</span>
                NorthWindy Charters
              </a>
              <a href="https://linkedin.com/company/northwindy" target="_blank" rel="noreferrer"
                className="flex items-center gap-3 text-white/50 hover:text-white transition-colors text-sm group">
                <span className="w-8 h-8 bg-white/5 group-hover:bg-[#c9a96e]/20 flex items-center justify-center transition-colors text-base">💼</span>
                NorthWindy
              </a>
              <a href="https://tiktok.com/@northwindy" target="_blank" rel="noreferrer"
                className="flex items-center gap-3 text-white/50 hover:text-white transition-colors text-sm group">
                <span className="w-8 h-8 bg-white/5 group-hover:bg-white/10 flex items-center justify-center transition-colors text-base">🎵</span>
                @northwindy
              </a>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-white/25 text-xs font-medium">
              © 2026 NorthWindy Charters. Todos os direitos reservados.
            </p>
            <p className="text-[#c9a96e]/25 text-[10px] font-semibold uppercase tracking-[0.15em]">
              Est. 2026 · Lisboa, Portugal
            </p>
          </div>
        </div>
      </footer>
      {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}
    </>
  );
}
