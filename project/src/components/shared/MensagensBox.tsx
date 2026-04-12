// src/components/ClientArea/components/MensagensBox.tsx
import { useState } from 'react';
import { Bell, Inbox } from 'lucide-react';
import { getMessages, markMessageRead, markAllMessagesRead, type Message } from '../../lib/localStore';
import { MSG_ICONS, MSG_COLORS } from '../../utils/clientHelpers';

export function MensagensBox({ clientId }: { clientId: string }) {
  const [open,     setOpen]     = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => getMessages(clientId));
  const unread = messages.filter(m => !m.read).length;

  function handleOpen() {
    setOpen(v => !v);
    if (!open) {
      markAllMessagesRead(clientId);
      setMessages(prev => prev.map(m => ({ ...m, read: true })));
    }
  }

  function handleMarkRead(id: string) {
    markMessageRead(id);
    setMessages(prev => prev.map(m => m.id === id ? { ...m, read: true } : m));
  }

  return (
    <div className="bg-white rounded-[30px] border-2 border-blue-50 shadow-sm overflow-hidden w-full">

      {/* Cabeçalho */}
      <button onClick={handleOpen} className="w-full flex items-center justify-between px-6 py-5 hover:bg-gray-50 transition-all">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="bg-blue-900 p-2 rounded-full">
              <Bell className="w-4 h-4 text-white" />
            </div>
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </div>
          <div>
            <span className="font-black text-blue-900 text-sm uppercase tracking-wide">Mensagens</span>
            {unread > 0 && (
              <span className="ml-2 bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                {unread} nova{unread !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
        <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Conteúdo expandido */}
      {open && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="h-px bg-gray-100" />

          {messages.length === 0 ? (
            <div className="py-16 text-center flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                <Inbox className="w-7 h-7 text-gray-300" />
              </div>
              <p className="font-black text-gray-300 uppercase italic text-sm">Sem mensagens</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {messages.map(msg => {
                const icon  = MSG_ICONS[msg.type]  || 'ℹ️';
                const color = MSG_COLORS[msg.type] || 'border-l-gray-300';
                const date  = new Date(msg.created_at).toLocaleDateString('pt-BR', {
                  day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                });
                return (
                  <div
                    key={msg.id}
                    onClick={() => handleMarkRead(msg.id)}
                    className={`border-l-4 px-6 py-5 cursor-pointer transition-all hover:bg-gray-50 ${color} ${!msg.read ? 'bg-blue-50/30' : 'bg-white'}`}
                  >
                    {/* Cabeçalho da mensagem */}
                    <div className="flex items-start justify-between gap-3 mb-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-lg leading-none flex-shrink-0">{icon}</span>
                        <p className={`text-sm leading-tight ${!msg.read ? 'font-black text-blue-900' : 'font-bold text-gray-600'}`}>
                          {msg.title}
                        </p>
                        {!msg.read && <div className="w-2 h-2 bg-blue-900 rounded-full flex-shrink-0" />}
                      </div>
                      <span className="text-[10px] text-gray-300 font-bold flex-shrink-0 whitespace-nowrap">{date}</span>
                    </div>

                    {/* Corpo */}
                    <p className="text-xs font-bold text-gray-500 leading-relaxed ml-7">
                      {msg.body.replace(/\*/g, '')}
                    </p>

                    {/* Meta de reserva */}
                    {msg.meta?.booking_date && (
                      <div className="ml-7 mt-2 flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-black text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                          📅 {new Date(msg.meta.booking_date + 'T12:00').toLocaleDateString('pt-BR')}
                        </span>
                        {msg.meta.time_slot && (
                          <span className="text-[10px] font-black text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                            🕐 {msg.meta.time_slot}
                          </span>
                        )}
                        {msg.meta.passengers && (
                          <span className="text-[10px] font-black text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                            👥 {msg.meta.passengers} pax
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}