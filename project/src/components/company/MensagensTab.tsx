// src/components/company/MensagensTab.tsx
import { useState } from 'react';
import { Bell, ChevronUp, ChevronDown, Inbox, Trash2 } from 'lucide-react';
import { getMessages, markMessageRead, type Message } from '../../lib/localStore';

interface Props {
  companyId: string;
}

export function MensagensTab({ companyId }: Props) {
  const [messages,  setMessages]  = useState<Message[]>(() => getMessages(companyId));
  const [openId,    setOpenId]    = useState<string | null>(null);
  const [archived,  setArchived]  = useState<Set<string>>(new Set());

  const visibleMessages = messages.filter(m => !archived.has(m.id));
  const unread = visibleMessages.filter(m => !m.read).length;

  const EXAMPLE_MSGS: Message[] = [
    { id:'m1', recipientId: companyId, type:'booking', title:'Nova Reserva', body:'João Silva reservou o Sunset Cruise para 4 pax.', read:false, createdAt: new Date(Date.now()-3600000).toISOString() },
    { id:'m2', recipientId: companyId, type:'system',  title:'Boas-vindas!', body:'Bem-vindo à área de empresa NorthWindy. O seu perfil está activo.', read:true, createdAt: new Date(Date.now()-86400000).toISOString() },
  ];
  const displayMessages: Message[] = visibleMessages.length > 0 ? visibleMessages : EXAMPLE_MSGS.filter(m => !archived.has(m.id));

  const MSG_ICONS: Record<string, string> = {
    booking: '⚓', system: '🔔', payment: '💶', cancel: '❌', info: 'ℹ️',
  };
  const MSG_COLORS: Record<string, string> = {
    booking: 'bg-[#0a1628]/5 border-[#c9a96e]/20',
    system:  'bg-gray-50 border-gray-100',
    payment: 'bg-green-50 border-green-100',
    cancel:  'bg-red-50 border-red-100',
    info:    'bg-[#c9a96e]/5 border-[#c9a96e]/20',
  };

  function openMessage(id: string) {
    setOpenId(prev => (prev === id ? null : id));
    if (!messages.find(m => m.id === id)?.read) {
      markMessageRead(companyId, id);
      setMessages(prev => prev.map(m => m.id === id ? { ...m, read: true } : m));
    }
  }

  function archiveMessage(id: string) {
    setArchived(prev => new Set([...prev, id]));
    if (openId === id) setOpenId(null);
  }

  function deleteMessage(id: string) {
    setMessages(prev => prev.filter(m => m.id !== id));
    setArchived(prev => { const s = new Set(prev); s.delete(id); return s; });
    if (openId === id) setOpenId(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-['Playfair_Display'] font-bold text-[#1a2b4a] uppercase italic">Mensagens</h2>
          <p className="text-xs text-gray-400 font-semibold">Notificações e avisos</p>
        </div>
        {unread > 0 && (
          <span className="bg-red-500 text-white text-xs font-semibold px-3 py-1.5 flex items-center gap-1.5">
            <Bell className="w-3.5 h-3.5" /> {unread} não lida{unread !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="space-y-2">
        {displayMessages.length === 0 ? (
          <div className="text-center py-12">
            <Inbox className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="font-semibold text-gray-300 uppercase italic text-sm">Sem mensagens</p>
          </div>
        ) : (
          displayMessages.map(m => {
            const isOpen = openId === m.id;
            return (
              <div key={m.id}
                className={`border overflow-hidden transition-all ${
                  MSG_COLORS[m.type] || 'bg-gray-50 border-gray-100'
                } ${!m.read ? 'ring-1 ring-[#c9a96e]/40' : ''}`}>
                <button
                  onClick={() => openMessage(m.id)}
                  className="w-full flex items-start gap-3 p-4 text-left">
                  <div className="text-xl flex-shrink-0 mt-0.5">{MSG_ICONS[m.type] || 'ℹ️'}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <p className={`text-sm truncate ${!m.read ? 'font-bold text-[#1a2b4a]' : 'font-semibold text-gray-700'}`}>{m.title}</p>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {!m.read && <div className="w-2 h-2 bg-[#c9a96e]" />}
                        {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
                      </div>
                    </div>
                    <p className="text-[10px] font-semibold text-gray-400">
                      {!m.read ? '● Não lida · ' : ''}
                      {new Date(m.createdAt).toLocaleDateString('pt-PT', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })}
                    </p>
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 space-y-3 border-t border-black/5">
                    <p className="text-xs font-semibold text-gray-600 leading-relaxed pt-3">{m.body}</p>
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => archiveMessage(m.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold text-[10px] uppercase transition-all">
                        <Inbox className="w-3 h-3" /> Arquivar
                      </button>
                      <button
                        onClick={() => deleteMessage(m.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-red-50 hover:bg-red-100 border border-red-100 text-red-600 font-semibold text-[10px] uppercase transition-all">
                        <Trash2 className="w-3 h-3" /> Excluir
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
