// src/components/company/ReservasTab.tsx
import { useState } from 'react';
import { ClipboardList, ChevronUp, ChevronDown, CheckCircle2, XCircle } from 'lucide-react';
import { getEventBookingsByCompany, type EventBooking } from '../../lib/localStore';

function fmtDate(iso: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' });
}
function currency(n: number) {
  return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(n);
}

const BOOKINGS = [
  { id:'R001', cliente:'João Silva',    evento:'Sunset Cruise',    data:'2025-07-15', pax:4, valor:280, status:'confirmada', embarcacao:'Vento Norte',  comandante:'Carlos Mendes', convidados:['Ana Silva','Pedro Silva','Rita Costa'] },
  { id:'R002', cliente:'Ana Ferreira',  evento:'Tour Arrábida',    data:'2025-07-19', pax:2, valor:180, status:'pendente',   embarcacao:'Horizonte',    comandante:'Rita Santos',   convidados:['Marco Ferreira'] },
  { id:'R003', cliente:'Grupo Empresa', evento:'Regata de Verão',  data:'2025-07-14', pax:8, valor:640, status:'confirmada', embarcacao:'Mar Aberto',   comandante:'Carlos Mendes', convidados:['Sofia Lopes','Rui Gomes','Marta Nunes','Pedro Alves','Tiago Costa','Carlos Lima','Joana Reis'] },
  { id:'R004', cliente:'Miguel Lopes',  evento:'Pesca Desportiva', data:'2025-07-17', pax:3, valor:210, status:'cancelada',  embarcacao:'Vento Norte',  comandante:'Pedro Almeida', convidados:['Sara Lopes','Bruno Lopes'] },
];
const BOOK_STATUS: Record<string,string> = {
  confirmada: 'bg-green-100 text-green-700',
  pendente:   'bg-amber-100 text-amber-700',
  cancelada:  'bg-red-100 text-red-600',
};

function ReservaCard({ b }: { b: typeof BOOKINGS[0] }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className={`bg-white border-2 rounded-[16px] overflow-hidden transition-all cursor-pointer ${expanded ? 'border-blue-200' : 'border-gray-100 hover:border-blue-100'}`}
      onClick={() => setExpanded(v => !v)}>
      <div className="px-4 py-3 flex items-center gap-3">
        <div className="w-9 h-9 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
          <ClipboardList className="w-4 h-4 text-blue-500" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
            <p className="font-black text-blue-900 text-sm">{b.cliente}</p>
            <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full ${BOOK_STATUS[b.status]}`}>{b.status}</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 flex-wrap">
            <span>📅 {fmtDate(b.data)}</span>
            <span>👥 {b.pax} convidados</span>
            <span>⛵ {b.embarcacao}</span>
            <span>🧭 {b.comandante}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <p className="font-black text-sm text-blue-900">{currency(b.valor)}</p>
          {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 px-4 py-4 space-y-3" onClick={e => e.stopPropagation()}>
          <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Dossié da Reserva</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              ['Nº Reserva',   b.id],
              ['Embarcação',   b.embarcacao],
              ['Comandante',   b.comandante],
              ['Data',         fmtDate(b.data)],
              ['Nº Convidados', String(b.pax)],
              ['Valor Total',  currency(b.valor)],
            ].map(([l, v]) => (
              <div key={l} className="bg-gray-50 rounded-[10px] px-3 py-2">
                <p className="text-[9px] font-black text-gray-400 uppercase">{l}</p>
                <p className="text-sm font-black text-blue-900">{v}</p>
              </div>
            ))}
          </div>
          {b.convidados.length > 0 && (
            <div className="bg-blue-50 rounded-[12px] px-3 py-3">
              <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-2">Lista de Convidados</p>
              <div className="space-y-1.5">
                {b.convidados.map((c, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-black text-[8px]">{c.charAt(0)}</span>
                    </div>
                    <p className="text-xs font-bold text-blue-900">{c}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {b.status === 'pendente' && (
            <div className="flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-green-50 hover:bg-green-100 border-2 border-green-100 text-green-700 rounded-[10px] font-black text-[10px] uppercase transition-all">
                <CheckCircle2 className="w-3.5 h-3.5" /> Confirmar
              </button>
              <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-red-50 hover:bg-red-100 border-2 border-red-100 text-red-600 rounded-[10px] font-black text-[10px] uppercase transition-all">
                <XCircle className="w-3.5 h-3.5" /> Cancelar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface Props {
  companyId: string;
}

export function ReservasTab({ companyId }: Props) {
  const [filter, setFilter] = useState<'todas'|'confirmada'|'pendente'|'cancelada'>('todas');
  const [activeTab, setActiveTab] = useState<'passeios'|'eventos'>('passeios');

  const total = BOOKINGS.filter(b=>b.status==='confirmada').reduce((a,b)=>a+b.valor,0);
  const filtered = filter === 'todas' ? BOOKINGS : BOOKINGS.filter(b => b.status === filter);

  const allEventBookings: EventBooking[] = getEventBookingsByCompany(companyId);
  const totalEventos = allEventBookings.reduce((a, b) => a + b.total_price, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-black text-blue-900 uppercase italic">Reservas</h2>
          <p className="text-xs text-gray-400 font-bold">Histórico de reservas</p>
        </div>
        <div className="bg-green-50 border-2 border-green-100 rounded-[14px] px-4 py-2 text-right flex-shrink-0">
          <p className="text-[9px] font-black text-green-600 uppercase">Confirmadas</p>
          <p className="text-base font-black text-green-700">{currency(total)}</p>
        </div>
      </div>

      <div className="flex gap-2">
        {[
          { key: 'passeios' as const, label: '⛵ Passeios', count: BOOKINGS.length },
          { key: 'eventos'  as const, label: '🎟️ Eventos',  count: allEventBookings.length },
        ].map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-[12px] font-black text-xs uppercase transition-all ${
              activeTab === t.key ? 'bg-blue-900 text-white' : 'bg-gray-50 border-2 border-gray-100 text-gray-500'
            }`}>
            {t.label}
            {t.count > 0 && (
              <span className={`text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center ${
                activeTab === t.key ? 'bg-white text-blue-900' : 'bg-blue-900 text-white'
              }`}>{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {activeTab === 'passeios' && (
        <>
          <div className="flex gap-2 flex-wrap">
            {(['todas','confirmada','pendente','cancelada'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-[10px] text-[10px] font-black uppercase transition-all ${
                  filter === f ? 'bg-blue-900 text-white' : 'bg-gray-50 border-2 border-gray-100 text-gray-500'
                }`}>
                {f}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            {filtered.map(b => <ReservaCard key={b.id} b={b} />)}
            {filtered.length === 0 && (
              <div className="text-center py-10">
                <ClipboardList className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                <p className="font-black text-gray-300 uppercase italic text-xs">Sem reservas</p>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'eventos' && (
        <div className="space-y-2">
          {allEventBookings.length === 0 ? (
            <div className="text-center py-10">
              <span className="text-4xl block mb-2">🎟️</span>
              <p className="font-black text-gray-300 uppercase italic text-xs">Sem bilhetes de eventos</p>
            </div>
          ) : (
            allEventBookings.map(b => {
              const isPast = new Date(`${b.event_date}T${b.event_time || '23:59'}`) < new Date();
              const statusLabel = isPast ? 'Realizado' : 'Confirmado';
              const statusCls   = isPast ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700';
              return (
                <div key={b.id} className="bg-white border-2 border-gray-100 rounded-[16px] px-4 py-3 flex items-center gap-3">
                  <div className="w-9 h-9 bg-purple-50 rounded-full flex items-center justify-center flex-shrink-0 text-base">🎟️</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                      <p className="font-black text-blue-900 text-sm truncate">{b.event_title}</p>
                      <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full ${statusCls}`}>{statusLabel}</span>
                    </div>
                    <p className="text-xs font-bold text-gray-500 truncate">
                      {b.customer_name} · {new Date(b.event_date+'T12:00').toLocaleDateString('pt-PT',{day:'2-digit',month:'short'})} · {b.tickets} bilhete{b.tickets!==1?'s':''}
                    </p>
                  </div>
                  <p className="font-black text-sm text-blue-900 flex-shrink-0">{currency(b.total_price)}</p>
                </div>
              );
            })
          )}
          {allEventBookings.length > 0 && (
            <div className="bg-gradient-to-r from-blue-900 to-blue-700 rounded-[16px] px-5 py-3 flex items-center justify-between">
              <p className="text-blue-300 text-xs font-black uppercase">Total Eventos</p>
              <p className="text-white font-black text-lg">{currency(totalEventos)}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
