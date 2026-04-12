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
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-blue-950/80 backdrop-blur-md"
      onClick={onClose}
    >
      <style>{hideScrollbarStyle}</style>
      <div
        className="footer-modal-scroll bg-white w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-[40px] shadow-2xl border-4 border-blue-900 animate-in zoom-in-95 duration-300"
        onClick={e => e.stopPropagation()}
      >
        {/* Header sticky com tabs */}
        <div className="bg-blue-900 px-8 py-7 rounded-t-[36px] flex items-start justify-between gap-4 sticky top-0 z-10">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-blue-800 p-1.5 rounded-full"><FileText className="w-3.5 h-3.5 text-blue-300" /></div>
              <span className="text-blue-300 text-[10px] font-black uppercase tracking-widest">NorthWindy Charters</span>
            </div>
            <h2 className="text-xl font-black text-white uppercase italic leading-tight">
              Termos, Condições, Segurança<br />& Política de Cancelamento
            </h2>
            <div className="flex flex-col gap-2 mt-4 w-full">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`text-[10px] font-black uppercase tracking-wider px-4 py-2 rounded-full transition-all text-left ${
                    activeTab === tab.id
                      ? 'bg-white text-blue-900'
                      : 'bg-blue-800 text-blue-300 hover:bg-blue-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          <button onClick={onClose} className="bg-blue-800 hover:bg-blue-700 text-white p-2.5 rounded-full transition-all flex-shrink-0 mt-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 space-y-8">

          {/* ══ TAB: TERMOS GERAIS ══ */}
          {activeTab === 'termos' && (
            <>
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-blue-100 p-2.5 rounded-[14px]"><Shield className="w-5 h-5 text-blue-600" /></div>
                  <h3 className="font-black text-blue-900 uppercase italic text-sm leading-tight">Termos e Condições Gerais</h3>
                </div>
                <div className="space-y-2.5">
                  {[
                    { emoji: '📋', text: 'A reserva implica a aceitação integral dos presentes termos e condições.' },
                    { emoji: '🔒', text: 'Os dados pessoais recolhidos são tratados em conformidade com o RGPD e nunca partilhados com terceiros sem consentimento.' },
                    { emoji: '⚓', text: 'A NorthWindy Charters actua como intermediário entre o cliente e os marinheiros/embarcações certificados, não sendo operadora directa da navegação.' },
                    { emoji: '📍', text: 'Os passeios estão sujeitos a disponibilidade e às normas das autoridades marítimas locais em vigor.' },
                  ].map(({ emoji, text }) => (
                    <div key={text} className="flex items-start gap-3 border-2 rounded-[18px] px-5 py-3.5 bg-blue-50 border-blue-100">
                      <span className="text-xl flex-shrink-0 leading-none mt-0.5">{emoji}</span>
                      <p className="font-bold text-sm text-gray-600 leading-snug">{text}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="h-px bg-gray-100" />

              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-amber-100 p-2.5 rounded-[14px]"><AlertTriangle className="w-5 h-5 text-amber-600" /></div>
                  <h3 className="font-black text-blue-900 uppercase italic text-sm leading-tight">Responsabilidades</h3>
                </div>
                <div className="space-y-2.5">
                  {[
                    { emoji: '🛡️', text: 'Cada embarcação é operada por marinheiros certificados e habilitados pelas autoridades náuticas competentes.' },
                    { emoji: '⚠️', text: 'O cliente assume a responsabilidade pelo cumprimento das normas de segurança a bordo e das instruções da tripulação.' },
                    { emoji: '🌊', text: 'A NorthWindy não se responsabiliza por danos pessoais ou materiais resultantes de comportamentos negligentes do cliente durante o passeio.' },
                    { emoji: '📞', text: 'Em caso de emergência a bordo, a tripulação dispõe de protocolos de segurança marítima e contactos directos com as autoridades.' },
                    { emoji: '🛡️', text: 'Serviços de seguro viagem e protecção náutica estão disponíveis para contratação, com cobertura personalizada para acidentes pessoais durante o passeio.' },
                  ].map(({ emoji, text }) => (
                    <div key={text} className="flex items-start gap-3 border-2 rounded-[18px] px-5 py-3.5 bg-amber-50 border-amber-100">
                      <span className="text-xl flex-shrink-0 leading-none mt-0.5">{emoji}</span>
                      <p className="font-bold text-sm text-gray-600 leading-snug">{text}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="h-px bg-gray-100" />

              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-green-100 p-2.5 rounded-[14px]"><Leaf className="w-5 h-5 text-green-600" /></div>
                  <h3 className="font-black text-blue-900 uppercase italic text-sm leading-tight">Sustentabilidade e Preservação</h3>
                </div>
                <div className="space-y-2.5">
                  {[
                    { emoji: '🌍', text: 'Aplicamos protocolos de Impacto Zero em todas as operações. O descarte de resíduos no mar é terminantemente proibido.' },
                    { emoji: '🌊', text: 'Incentivamos o respeito absoluto aos ecossistemas marinhos locais e promovemos a navegação consciente e responsável para as gerações futuras.' },
                  ].map(({ emoji, text }) => (
                    <div key={text} className="flex items-start gap-3 border-2 rounded-[18px] px-5 py-3.5 bg-green-50 border-green-100">
                      <span className="text-xl flex-shrink-0 leading-none mt-0.5">{emoji}</span>
                      <p className="font-bold text-sm text-gray-600 leading-snug">{text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ══ TAB: SEGURANÇA ══ */}
          {activeTab === 'seguranca' && (
            <>
              <div className="bg-blue-900 rounded-[20px] px-6 py-4">
                <p className="text-white font-black text-sm uppercase italic">⚓ Compromisso Global com a Segurança Náutica</p>
                <p className="text-blue-300 font-bold text-xs mt-1 leading-relaxed">
                  Em todas as nossas operações, a segurança é o pilar fundamental. Operamos sob rigoroso protocolo de gestão de riscos, garantindo que cada jornada seja pautada pela confiança, integridade e profissionalismo.
                </p>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-blue-100 p-2.5 rounded-[14px]"><Users className="w-5 h-5 text-blue-600" /></div>
                  <h3 className="font-black text-blue-900 uppercase italic text-sm leading-tight">Briefing de Segurança ao Passageiro</h3>
                </div>
                <p className="text-gray-400 font-bold text-xs mb-3 uppercase tracking-wider">Apresentado antes do embarque ou no voucher de compra.</p>
                <div className="space-y-2.5">
                  {[
                    { num: '1', title: 'Uso de Coletes', text: 'Obrigatório para crianças e não nadadores durante todo o trajeto. Para os demais, o colete deve estar visível e de fácil acesso.' },
                    { num: '2', title: 'Embarque e Desembarque', text: 'Só suba ou desça do barco quando o motor estiver desligado e o condutor autorizar. Nunca salte com o barco em movimento.' },
                    { num: '3', title: 'Circulação a Bordo', text: 'Evite caminhar pelo barco em velocidade de cruzeiro. Mantenha mãos e pés dentro da embarcação em todos os momentos.' },
                    { num: '4', title: 'Comportamento na Água', text: 'Mantenha-se afastado dos motores (a hélice é cortante mesmo desligada) e não se distancie do raio visual do condutor.' },
                    { num: '5', title: 'Resíduos', text: 'É proibido deitar qualquer tipo de lixo ao mar. Utilize as lixeiras a bordo.' },
                    { num: '6', title: 'Autoridade do Comandante', text: 'Em emergências ou mudanças climáticas, as instruções do comandante são soberanas e devem ser seguidas sem questionamento.' },
                  ].map(({ num, title, text }) => (
                    <div key={num} className="flex items-start gap-3 border-2 rounded-[18px] px-5 py-3.5 bg-blue-50 border-blue-100">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-900 text-white text-[10px] font-black flex items-center justify-center mt-0.5">{num}</span>
                      <div>
                        <p className="font-black text-blue-900 text-xs uppercase italic mb-0.5">{title}</p>
                        <p className="font-bold text-sm text-gray-600 leading-snug">{text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="h-px bg-gray-100" />

              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-red-100 p-2.5 rounded-[14px]"><Shield className="w-5 h-5 text-red-500" /></div>
                  <h3 className="font-black text-blue-900 uppercase italic text-sm leading-tight">Equipamentos de Salvatagem Obrigatórios</h3>
                </div>
                <div className="space-y-2.5">
                  {[
                    { emoji: '🦺', title: 'Coletes Salva-vidas', text: 'Um por cada pessoa a bordo, com tamanho e flutuabilidade adequados (incluindo crianças). Em local de fácil acesso, nunca em armários trancados.' },
                    { emoji: '🔴', title: 'Boia Circular', text: 'Pelo menos uma boia com retinida (corda) para lançar em caso de homem ao mar.' },
                    { emoji: '🧯', title: 'Extintores de Incêndio', text: 'Dentro do prazo de validade, posicionados junto ao motor e ao posto de comando.' },
                  ].map(({ emoji, title, text }) => (
                    <div key={title} className="flex items-start gap-3 border-2 rounded-[18px] px-5 py-3.5 bg-red-50 border-red-100">
                      <span className="text-xl flex-shrink-0 leading-none mt-0.5">{emoji}</span>
                      <div>
                        <p className="font-black text-blue-900 text-xs uppercase italic mb-0.5">{title}</p>
                        <p className="font-bold text-sm text-gray-600 leading-snug">{text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="h-px bg-gray-100" />

              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-amber-100 p-2.5 rounded-[14px]"><AlertTriangle className="w-5 h-5 text-amber-600" /></div>
                  <h3 className="font-black text-blue-900 uppercase italic text-sm leading-tight">Normas de Conduta e Navegação</h3>
                </div>
                <div className="space-y-2.5">
                  {[
                    { emoji: '📏', text: 'Respeite a distância mínima de 200 metros da linha de arrebentação e de áreas delimitadas para banhistas.' },
                    { emoji: '🚤', text: 'Reduza a velocidade ao entrar em canais, proximidade de marinas ou áreas de fundeio.' },
                    { emoji: '🚫', text: 'Tolerância zero para consumo de álcool pelo condutor — equivalente à Lei Seca nas estradas.' },
                    { emoji: '⛽', text: 'Regra do combustível: 1/3 para ir · 1/3 para voltar · 1/3 de reserva.' },
                    { emoji: '⚖️', text: 'Nunca exceda o limite de passageiros indicado pelo fabricante. O excesso de peso compromete a estabilidade.' },
                  ].map(({ emoji, text }) => (
                    <div key={text} className="flex items-start gap-3 border-2 rounded-[18px] px-5 py-3.5 bg-amber-50 border-amber-100">
                      <span className="text-xl flex-shrink-0 leading-none mt-0.5">{emoji}</span>
                      <p className="font-bold text-sm text-gray-600 leading-snug">{text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ══ TAB: PADRÕES OPERACIONAIS ══ */}
          {activeTab === 'operacional' && (
            <>
              <div className="bg-blue-900 rounded-[20px] px-6 py-4">
                <p className="text-white font-black text-sm uppercase italic">👨‍✈️ Padrões Operacionais</p>
                <p className="text-blue-300 font-bold text-xs mt-1 leading-relaxed">
                  A nossa rede global de parceiros e comandantes adere a um código de conduta rigoroso, garantindo a excelência em cada operação.
                </p>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-blue-100 p-2.5 rounded-[14px]"><FileText className="w-5 h-5 text-blue-600" /></div>
                  <h3 className="font-black text-blue-900 uppercase italic text-sm leading-tight">Verificação Técnica Pré-Partida</h3>
                </div>
                <div className="space-y-2.5">
                  {[
                    { emoji: '✅', title: 'Inspecção Obrigatória', text: 'Checklist técnico antes de cada saída, cobrindo sistemas de propulsão, segurança e equipamentos de comunicação.' },
                    { emoji: '📡', title: 'Rádio VHF ou Telemóvel', text: 'Essencial para pedir socorro. Em passeios mais longos, o rádio VHF é mais fiável que o telemóvel.' },
                    { emoji: '🗺️', title: 'Aviso de Saída', text: 'Informar a uma marina ou pessoa em terra sobre o destino e horário previsto de retorno.' },
                    { emoji: '💡', title: 'Luzes de Navegação', text: 'Se houver possibilidade de navegar ao entardecer ou à noite, as luzes de bombordo (encarnada), boreste (verde) e alcançado (branca) devem estar operacionais.' },
                  ].map(({ emoji, title, text }) => (
                    <div key={title} className="flex items-start gap-3 border-2 rounded-[18px] px-5 py-3.5 bg-blue-50 border-blue-100">
                      <span className="text-xl flex-shrink-0 leading-none mt-0.5">{emoji}</span>
                      <div>
                        <p className="font-black text-blue-900 text-xs uppercase italic mb-0.5">{title}</p>
                        <p className="font-bold text-sm text-gray-600 leading-snug">{text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="h-px bg-gray-100" />

              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-green-100 p-2.5 rounded-[14px]"><Shield className="w-5 h-5 text-green-600" /></div>
                  <h3 className="font-black text-blue-900 uppercase italic text-sm leading-tight">Certificação e Conformidade</h3>
                </div>
                <div className="space-y-2.5">
                  {[
                    { emoji: '📜', title: 'Habilitação e Documentação', text: 'O condutor deve portar a Arrais Amador (ou superior) e o TIE (Título de Inscrição da Embarcação) deve estar em dia.' },
                    { emoji: '🏅', title: 'Certificações Válidas', text: 'Exigimos que todas as embarcações e tripulações possuam licenças e certificações válidas perante as autoridades marítimas competentes.' },
                    { emoji: '🚫', title: 'Política de Sobriedade', text: 'Tolerância zero para consumo de substâncias que possam comprometer a capacidade operacional da tripulação.' },
                  ].map(({ emoji, title, text }) => (
                    <div key={title} className="flex items-start gap-3 border-2 rounded-[18px] px-5 py-3.5 bg-green-50 border-green-100">
                      <span className="text-xl flex-shrink-0 leading-none mt-0.5">{emoji}</span>
                      <div>
                        <p className="font-black text-blue-900 text-xs uppercase italic mb-0.5">{title}</p>
                        <p className="font-bold text-sm text-gray-600 leading-snug">{text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="h-px bg-gray-100" />

              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-purple-100 p-2.5 rounded-[14px]"><Anchor className="w-5 h-5 text-purple-600" /></div>
                  <h3 className="font-black text-blue-900 uppercase italic text-sm leading-tight">Zonas e Actividades a Bordo</h3>
                </div>
                <div className="space-y-2.5">
                  {[
                    { emoji: '🏊', text: 'Actividades na água são permitidas apenas com motores desligados e em áreas autorizadas pela tripulação.' },
                    { emoji: '🚶', text: 'Permaneça em áreas seguras e designadas enquanto a embarcação estiver em deslocamento.' },
                    { emoji: '👨‍✈️', text: 'O Comandante possui autoridade máxima para decisões técnicas e de segurança. O cumprimento das suas instruções é fundamental para a protecção de todos.' },
                  ].map(({ emoji, text }) => (
                    <div key={text} className="flex items-start gap-3 border-2 rounded-[18px] px-5 py-3.5 bg-purple-50 border-purple-100">
                      <span className="text-xl flex-shrink-0 leading-none mt-0.5">{emoji}</span>
                      <p className="font-bold text-sm text-gray-600 leading-snug">{text}</p>
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
                  <div className="bg-red-100 p-2.5 rounded-[14px]"><Anchor className="w-5 h-5 text-red-500" /></div>
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
                  <h3 className="font-black text-blue-900 uppercase italic text-sm leading-tight">2. Condições Climáticas (Pré-Embarque)</h3>
                </div>
                <p className="text-gray-500 font-bold text-sm mb-4 leading-relaxed">
                  Caso as autoridades marítimas ou a NorthWindy determinem que as condições impedem a saída segura da embarcação:
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
            </>
          )}

          <button onClick={onClose} className="w-full bg-blue-900 hover:bg-blue-800 text-white py-4 rounded-[25px] font-black uppercase text-sm tracking-widest transition-all shadow-lg">
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
      <footer className="bg-blue-950 py-16 px-6">
        <div className="max-w-6xl mx-auto">

          {/* Link discreto */}
          <div className="mb-8 pb-6 border-b border-white/5">
            <button
              onClick={() => setShowTerms(true)}
              className="text-blue-300/30 hover:text-blue-300/60 text-[10px] uppercase tracking-widest transition-colors"
            >
              Termos · Condições · Segurança · Política de Cancelamento · Responsabilidades
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 pb-10 border-b border-white/10">

            {/* Logo + descrição */}
            <div className="flex flex-col items-start gap-5">
              <button
                onClick={onAdminClick}
                className="group transition-all duration-300 hover:scale-105"
                title="Acesso restrito"
              >
                <img
                  src={LOGO_SRC}
                  alt="NorthWindy Charters"
                  style={{ height: '112px', width: 'auto', objectFit: 'contain', filter: 'brightness(0) invert(1) drop-shadow(0 2px 12px rgba(255,255,255,0.15))' }}
                />
              </button>
              <p className="text-blue-300/70 text-sm leading-relaxed max-w-xs">
                O marketplace de referência para passeios náuticos. Qualidade, transparência e experiências únicas no Tejo e além.
              </p>
            </div>

            {/* Contactos */}
            <div className="flex flex-col gap-4">
              <h4 className="text-white font-black uppercase tracking-widest text-xs mb-1">Contactos</h4>
              <a href="https://wa.me/351900000000" target="_blank" rel="noreferrer"
                className="flex items-center gap-3 text-blue-200/70 hover:text-white transition-colors text-sm group">
                <span className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-green-500/20 flex items-center justify-center transition-colors text-base">💬</span>
                WhatsApp
              </a>
              <a href="mailto:info@northwindy.com"
                className="flex items-center gap-3 text-blue-200/70 hover:text-white transition-colors text-sm group">
                <span className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-blue-500/20 flex items-center justify-center transition-colors text-base">✉️</span>
                info@northwindy.com
              </a>
              <a href="tel:+351900000000"
                className="flex items-center gap-3 text-blue-200/70 hover:text-white transition-colors text-sm group">
                <span className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-blue-400/20 flex items-center justify-center transition-colors text-base">📞</span>
                +351 900 000 000
              </a>
            </div>

            {/* Redes sociais */}
            <div className="flex flex-col gap-4">
              <h4 className="text-white font-black uppercase tracking-widest text-xs mb-1">Siga-nos</h4>
              <a href="https://instagram.com/northwindycharters" target="_blank" rel="noreferrer"
                className="flex items-center gap-3 text-blue-200/70 hover:text-white transition-colors text-sm group">
                <span className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-pink-500/20 flex items-center justify-center transition-colors text-base">📸</span>
                @northwindycharters
              </a>
              <a href="https://facebook.com/northwindy" target="_blank" rel="noreferrer"
                className="flex items-center gap-3 text-blue-200/70 hover:text-white transition-colors text-sm group">
                <span className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-blue-600/20 flex items-center justify-center transition-colors text-base">👥</span>
                NorthWindy Charters
              </a>
              <a href="https://linkedin.com/company/northwindy" target="_blank" rel="noreferrer"
                className="flex items-center gap-3 text-blue-200/70 hover:text-white transition-colors text-sm group">
                <span className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-blue-500/20 flex items-center justify-center transition-colors text-base">💼</span>
                NorthWindy
              </a>
              <a href="https://tiktok.com/@northwindy" target="_blank" rel="noreferrer"
                className="flex items-center gap-3 text-blue-200/70 hover:text-white transition-colors text-sm group">
                <span className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-white/10 flex items-center justify-center transition-colors text-base">🎵</span>
                @northwindy
              </a>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-blue-300/40 text-xs">
              © 2026 NorthWindy Charters. Todos os direitos reservados.
            </p>
            <p className="text-blue-300/25 text-[10px] uppercase tracking-widest">
              Est. 2026 · Lisboa, Portugal
            </p>
          </div>
        </div>
      </footer>
      {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}
    </>
  );
}