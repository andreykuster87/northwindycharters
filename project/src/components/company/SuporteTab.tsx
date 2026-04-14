// src/components/company/SuporteTab.tsx
import { useState } from 'react';
import { MessageSquare, CheckCircle2, Send, LifeBuoy, Mail, Phone } from 'lucide-react';
import { type Company } from '../../lib/localStore';

function fmtDate(iso: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' });
}

interface Props {
  company: Company;
}

export function SuporteTab({ company }: Props) {
  const [msg, setMsg] = useState('');
  const [sent, setSent] = useState(false);

  const TICKETS = [
    { id:'T001', assunto:'Dúvida sobre integração de pagamentos', data:'2025-07-10', status:'respondido' },
    { id:'T002', assunto:'Actualização dos dados da empresa',     data:'2025-07-12', status:'aberto'     },
  ];

  function send() {
    if (!msg.trim()) return;
    const text = `🏢 *Suporte NorthWindy*\n\nEmpresa: ${company.nome_fantasia} (${company.profile_number})\n\n${msg}`;
    window.open(`https://wa.me/351910000000?text=${encodeURIComponent(text)}`, '_blank');
    setSent(true); setMsg('');
    setTimeout(()=>setSent(false), 3000);
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-['Playfair_Display'] font-bold text-[#1a2b4a] uppercase italic">Suporte</h2>
        <p className="text-xs text-gray-400 font-semibold">Contacto directo com a NorthWindy</p>
      </div>
      <div className="bg-gradient-to-br from-green-500 to-green-600 p-5 text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-white/20 flex items-center justify-center flex-shrink-0">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-base uppercase italic">Suporte WhatsApp</p>
            <p className="text-green-100 text-xs font-semibold">Resposta em até 2h</p>
          </div>
        </div>
        <textarea value={msg} onChange={e=>setMsg(e.target.value)} rows={4}
          placeholder="Descreva a sua questão…"
          className="w-full bg-white/20 border border-white/30 py-3 px-4 text-white font-semibold text-sm placeholder:text-green-100 focus:border-white outline-none resize-none mb-3" />
        <button onClick={send}
          className="w-full bg-white text-green-700 py-3.5 font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2">
          {sent ? <><CheckCircle2 className="w-4 h-4" /> Enviado!</> : <><Send className="w-4 h-4" /> Enviar via WhatsApp</>}
        </button>
      </div>
      <div className="bg-white border border-gray-100 p-4">
        <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em] mb-3">Histórico</p>
        <div className="space-y-2.5">
          {TICKETS.map(t => (
            <div key={t.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
              <div className="w-8 h-8 bg-[#0a1628]/5 flex items-center justify-center flex-shrink-0">
                <LifeBuoy className="w-4 h-4 text-[#c9a96e]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#1a2b4a] truncate">{t.assunto}</p>
                <p className="text-xs font-semibold text-gray-400">{t.id} · {fmtDate(t.data)}</p>
              </div>
              <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 flex-shrink-0 ${t.status==='respondido'?'bg-green-100 text-green-700':'bg-amber-100 text-amber-700'}`}>
                {t.status}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {[
          { icon: Mail,  label:'E-mail',   value:'parceiros@northwindy.com' },
          { icon: Phone, label:'WhatsApp', value:'+351 910 000 000' },
        ].map(c => (
          <div key={c.label} className="bg-white border border-gray-100 p-4 flex items-center gap-3">
            <div className="w-9 h-9 bg-[#0a1628]/5 flex items-center justify-center flex-shrink-0">
              <c.icon className="w-4 h-4 text-[#c9a96e]" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{c.label}</p>
              <p className="text-sm font-semibold text-[#1a2b4a] truncate">{c.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
