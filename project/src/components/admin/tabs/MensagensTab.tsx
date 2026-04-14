// src/components/AdminDashboard/tabs/MensagensTab.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Aba de mensagens:
//   • Sailor → caixa de entrada (leitura)
//   • Admin  → formulário de envio + histórico recente
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from 'react';
import { Inbox, Send, Check } from 'lucide-react';
import {
  getClients,
  getSailors,
  getAllMessages,
  sendSystemMessage,
  type Message,
  type Sailor,
  type Client,
} from '../../../lib/localStore';

// ── Props ─────────────────────────────────────────────────────────────────────

interface MensagensTabProps {
  role:          'admin' | 'sailor' | null;
  sailorMsgs:    Message[];
  sailors:       Sailor[];   // lista completa para o select de destinatários
  clients:       Client[];   // lista completa para o select de destinatários
}

// ── Constantes ────────────────────────────────────────────────────────────────

const MSG_ICONS: Record<string, string> = {
  booking_confirmed: '✅', booking_pending: '⏳', booking_cancelled: '❌',
  booking_completed: '🌊', welcome: '👋', info: 'ℹ️',
  doc_expired: '🚫', doc_expiring_soon: '⚠️',
  account_blocked: '🔒', account_unblocked: '🔓',
};

const MSG_COLORS: Record<string, string> = {
  booking_confirmed:  'border-l-green-500',
  booking_pending:    'border-l-amber-400',
  booking_cancelled:  'border-l-red-400',
  booking_completed:  'border-l-blue-500',
  welcome:            'border-l-[#0a1628]',
  info:               'border-l-gray-400',
  doc_expired:        'border-l-red-600',
  doc_expiring_soon:  'border-l-orange-400',
  account_blocked:    'border-l-red-700',
  account_unblocked:  'border-l-green-600',
};

// ── Componente ────────────────────────────────────────────────────────────────

export function MensagensTab({ role, sailorMsgs, sailors, clients }: MensagensTabProps) {

  // ── estado do formulário de admin ────────────────────────────────────────
  const [msgTarget,  setMsgTarget]  = useState<string>('all_clients');
  const [msgTitle,   setMsgTitle]   = useState('');
  const [msgBody,    setMsgBody]    = useState('');
  const [msgSent,    setMsgSent]    = useState(false);
  const [msgSending, setMsgSending] = useState(false);

  // ── dados derivados ──────────────────────────────────────────────────────
  const activeClients  = clients.filter(c => c.status === 'active');
  const verifiedSailors = sailors.filter(s => s.status === 'approved');

  // ── handler de envio ─────────────────────────────────────────────────────
  function handleSend() {
    if (!msgTitle.trim() || !msgBody.trim()) return;
    setMsgSending(true);
    try {
      let targets: string[] = [];
      if      (msgTarget === 'all_clients')  targets = getClients().map(c => c.id);
      else if (msgTarget === 'all_sailors')  targets = getSailors().filter(s => s.status === 'approved').map(s => s.id);
      else if (msgTarget === 'all')          targets = [...getClients().map(c => c.id), ...getSailors().filter(s => s.status === 'approved').map(s => s.id)];
      else if (msgTarget === '__specific__') targets = [];
      else                                   targets = [msgTarget];

      targets.forEach(id =>
        sendSystemMessage({
          client_id: id,
          type:      'info',
          title:     msgTitle.trim(),
          body:      msgBody.trim(),
          meta:      {},
        })
      );
      setMsgTitle('');
      setMsgBody('');
      setMsgSent(true);
      setTimeout(() => setMsgSent(false), 3000);
    } finally {
      setMsgSending(false);
    }
  }

  // ── helper: histórico recente (admin) ────────────────────────────────────
  function getRecentMessages() {
    const allPeople = [...getClients(), ...getSailors()];
    const peopleMap = new Map(allPeople.map(p => [p.id, p.name]));
    return getAllMessages()
      .map(m => ({ ...m, ownerName: peopleMap.get(m.client_id) ?? '—' }))
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .slice(0, 10);
  }

  // ── render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* ══ Vista Marinheiro — caixa de entrada ══ */}
      {role === 'sailor' && (
        <div className="space-y-4">
          <div>
            <h2 className="font-['Playfair_Display'] font-bold text-3xl text-[#1a2b4a]">Mensagens</h2>
            <p className="text-gray-400 font-bold text-sm uppercase mt-1">Avisos e notificações do sistema</p>
          </div>

          {sailorMsgs.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-gray-200 p-16 text-center flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-gray-50 flex items-center justify-center">
                <Inbox className="w-7 h-7 text-gray-300" />
              </div>
              <p className="font-semibold text-gray-300 uppercase">Nenhuma mensagem ainda</p>
            </div>
          ) : (
            <div className="bg-white border-2 border-[#0a1628]/5 shadow-sm overflow-hidden">
              <div className="divide-y divide-gray-50">
                {sailorMsgs.map(msg => {
                  const date = new Date(msg.created_at).toLocaleDateString('pt-BR', {
                    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                  });
                  return (
                    <div
                      key={msg.id}
                      className={`border-l-4 px-6 py-5 transition-all ${MSG_COLORS[msg.type] || 'border-l-gray-300'} ${!msg.read ? 'bg-[#0a1628]/5' : 'bg-white'}`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-lg leading-none">{MSG_ICONS[msg.type] || 'ℹ️'}</span>
                          <p className={`text-sm leading-tight ${!msg.read ? 'font-bold text-[#1a2b4a]' : 'font-bold text-gray-600'}`}>
                            {msg.title}
                          </p>
                          {!msg.read && <div className="w-2 h-2 bg-[#0a1628] flex-shrink-0" />}
                        </div>
                        <span className="text-[10px] text-gray-300 font-bold flex-shrink-0">{date}</span>
                      </div>
                      <p className="text-xs font-bold text-gray-500 leading-relaxed ml-7">
                        {msg.body.replace(/\*/g, '')}
                      </p>
                      {msg.meta?.booking_date && (
                        <div className="ml-7 mt-2 flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 px-2 py-0.5">
                            📅 {new Date(msg.meta.booking_date + 'T12:00').toLocaleDateString('pt-BR')}
                          </span>
                          {msg.meta.time_slot && (
                            <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 px-2 py-0.5">
                              🕐 {msg.meta.time_slot}
                            </span>
                          )}
                          {msg.meta.passengers && (
                            <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 px-2 py-0.5">
                              👥 {msg.meta.passengers} pax
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══ Vista Admin — envio + histórico ══ */}
      {role === 'admin' && (
        <div className="space-y-6">
          <div>
            <h2 className="font-['Playfair_Display'] font-bold text-3xl text-[#1a2b4a]">Mensagens</h2>
            <p className="text-gray-400 font-bold text-sm uppercase mt-1">Envie avisos a clientes e comandantes</p>
          </div>

          {/* Formulário */}
          <div className="bg-white border-2 border-[#0a1628]/5 p-8 shadow-sm space-y-5">
            <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em]">📨 Nova Mensagem</p>

            {/* Destinatário */}
            <div>
              <label className="text-[10px] font-semibold text-[#1a2b4a] uppercase tracking-[0.15em] mb-3 block">
                Destinatário
              </label>

              {/* ── Scroll horizontal de opções ── */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
                {([
                  ['all_clients',  '👥', 'Todos os Usuários'],
                  ['all_sailors',  '⚓', 'Todos os Comandantes'],
                  ['all',          '📢', 'Para Todos'],
                  ['specific',     '👤', 'Nome específico'],
                ] as [string, string, string][]).map(([key, emoji, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setMsgTarget(key === 'specific' ? '__specific__' : key)}
                    className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 border-2 font-semibold text-xs transition-all whitespace-nowrap
                      ${(key === 'specific' ? !['all_clients','all_sailors','all'].includes(msgTarget) : msgTarget === key)
                        ? 'border-[#0a1628] bg-[#0a1628] text-white shadow-md'
                        : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-[#c9a96e]/30 hover:text-[#1a2b4a]'
                      }`}
                  >
                    <span>{emoji}</span>
                    {label}
                  </button>
                ))}
              </div>

              {/* ── Campo de busca por nome (só aparece em "Nome específico") ── */}
              {!['all_clients','all_sailors','all'].includes(msgTarget) && (
                <div className="mt-3 relative">
                  <input
                    type="text"
                    placeholder="🔍  Buscar por nome..."
                    className="w-full bg-gray-50 border-2 border-gray-200 focus:border-[#c9a96e] py-3 px-5 font-bold text-[#1a2b4a] outline-none transition-all text-sm"
                    onChange={e => {
                      const q = e.target.value.toLowerCase();
                      if (!q) { setMsgTarget('__specific__'); return; }
                      const allPeople = [
                        ...clients.map(c => ({ ...c, _type: 'client' })),
                        ...sailors.filter(s => s.status === 'approved').map(s => ({ ...s, _type: 'sailor' })),
                      ];
                      const match = allPeople.find(p => p.name.toLowerCase().includes(q));
                      if (match) setMsgTarget(match.id);
                    }}
                  />
                  {/* Lista de sugestões */}
                  <div className="mt-1 max-h-44 overflow-y-auto border-2 border-gray-100 bg-white shadow-lg divide-y divide-gray-50">
                    {[
                      ...clients.map(c => ({ id: c.id, name: c.name, badge: '👤 Usuário' })),
                      ...sailors.filter(s => s.status === 'approved').map(s => ({ id: s.id, name: s.name, badge: '⚓ Comandante' })),
                    ].map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setMsgTarget(p.id)}
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-gray-50 transition-colors
                          ${msgTarget === p.id ? 'bg-gray-50' : ''}`}
                      >
                        <span className={`text-sm font-bold ${msgTarget === p.id ? 'text-[#1a2b4a]' : 'text-gray-700'}`}>{p.name}</span>
                        <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 px-2 py-0.5">{p.badge}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Título */}
            <div>
              <label className="text-[10px] font-semibold text-[#1a2b4a] uppercase tracking-[0.15em] mb-2 block">
                Título *
              </label>
              <input
                value={msgTitle}
                onChange={e => { setMsgTitle(e.target.value); setMsgSent(false); }}
                placeholder="Ex: Aviso importante sobre a plataforma"
                className="w-full bg-gray-50 border-2 border-gray-100 focus:border-[#c9a96e] py-4 px-5 font-bold text-[#1a2b4a] outline-none transition-all text-sm"
              />
            </div>

            {/* Corpo */}
            <div>
              <label className="text-[10px] font-semibold text-[#1a2b4a] uppercase tracking-[0.15em] mb-2 block">
                Mensagem *
              </label>
              <textarea
                value={msgBody}
                onChange={e => { setMsgBody(e.target.value); setMsgSent(false); }}
                rows={4}
                placeholder="Escreva a mensagem aqui..."
                className="w-full bg-gray-50 border-2 border-gray-100 focus:border-[#c9a96e] py-4 px-5 font-bold text-[#1a2b4a] outline-none transition-all text-sm resize-none"
              />
            </div>

            {/* Feedback */}
            {msgSent && (
              <div className="bg-green-50 border-2 border-green-200 px-5 py-3 flex items-center gap-3">
                <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                <p className="text-green-700 font-semibold text-sm">Mensagem enviada com sucesso!</p>
              </div>
            )}

            {/* Enviar */}
            <button
              disabled={!msgTitle.trim() || !msgBody.trim() || msgSending}
              onClick={handleSend}
              className="w-full bg-[#0a1628] hover:bg-[#0a1628]/90 text-white py-5 font-semibold uppercase tracking-widest text-sm transition-all shadow-lg disabled:opacity-40 flex items-center justify-center gap-3"
            >
              <Send className="w-4 h-4" />
              {msgSending
                ? 'Enviando...'
                : `Enviar ${
                    msgTarget === 'all_clients' ? 'a todos os usuários'
                    : msgTarget === 'all_sailors' ? 'a todos os comandantes'
                    : msgTarget === 'all' ? 'para todos'
                    : 'ao destinatário'
                  }`
              }
            </button>
          </div>

          {/* Histórico recente */}
          <div className="bg-white border-2 border-[#0a1628]/5 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em]">📋 Mensagens Recentes</p>
              <span className="text-[10px] font-semibold text-[#c9a96e] bg-[#c9a96e]/15 px-3 py-1">
                últimas entregues
              </span>
            </div>
            {(() => {
              const recent = getRecentMessages();
              if (recent.length === 0) return (
                <div className="text-center py-8">
                  <p className="text-gray-300 font-semibold uppercase text-xs">Nenhuma mensagem enviada ainda</p>
                </div>
              );
              return (
                <div className="space-y-2">
                  {recent.map((m: any) => (
                    <div key={m.id} className="flex items-start gap-3 bg-gray-50 px-4 py-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-[#1a2b4a] text-xs truncate">{m.title}</p>
                          <span className="text-[9px] font-semibold text-gray-400 bg-white border border-gray-200 px-2 py-0.5 flex-shrink-0">
                            → {m.ownerName}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-400 font-bold mt-0.5 truncate">{m.body}</p>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <p className="text-[9px] text-gray-300 font-bold">
                          {new Date(m.created_at).toLocaleDateString('pt-BR')}
                        </p>
                        <span className={`text-[9px] font-semibold px-1.5 py-0.5 ${m.read ? 'bg-gray-100 text-gray-400' : 'bg-[#c9a96e]/15 text-[#c9a96e]'}`}>
                          {m.read ? 'lida' : 'não lida'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
