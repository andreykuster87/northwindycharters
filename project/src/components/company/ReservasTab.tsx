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
    <div className={`bg-white border rounded-none overflow-hidden transition-all cursor-pointer ${expanded ? 'border-[#c9a96e]/30' : 'border-gray-100 hover:border-[#c9a96e]/20'}`}
      onClick={() => setExpanded(v => !v)}>
      <div className="px-4 py-3 flex items-center gap-3">
        <div className="w-9 h-9 bg-[#0a1628]/5 flex items-center justify-center flex-shrink-0">
          <ClipboardList className="w-4 h-4 text-[#c9a96e]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
            <p className="font-bold text-[#1a2b4a] text-sm">{b.cliente}</p>
            <span className={`text-[9px] font-semibold uppercase px-1.5 py-0.5 ${BOOK_STATUS[b.status]}`}>{b.status}</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-semibold text-gray-500 flex-wrap">
            <span>📅 {fmtDate(b.data)}</span>
            <span>👥 {b.pax} convidados</span>
            <span>⛵ {b.embarcacao}</span>
            <span>🧭 {b.comandante}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <p className="font-bold text-sm text-[#1a2b4a]">{currency(b.valor)}</p>
          {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 px-4 py-4 space-y-3" onClick={e => e.stopPropagation()}>
          <p className="text-[9px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em]">Dossié da Reserva</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              ['Nº Reserva',   b.id],
              ['Embarcação',   b.embarcacao],
              ['Comandante',   b.comandante],
              ['Data',         fmtDate(b.data)],
              ['Nº Convidados', String(b.pax)],
              ['Valor Total',  currency(b.valor)],
            ].map(([l, v]) => (
              <div key={l} className="bg-gray-50 px-3 py-2">
                <p className="text-[9px] font-semibold text-gray-400 uppercase">{l}</p>
                <p className="text-sm font-semibold text-[#1a2b4a]">{v}</p>
              </div>
            ))}
          </div>
          {b.convidados.length > 0 && (
            <div className="bg-[#0a1628]/5 px-3 py-3">
              <p className="text-[9px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em] mb-2">Lista de Convidados</p>
              <div className="space-y-1.5">
                {b.convidados.map((c, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-[#0a1628] flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-semibold text-[8px]">{c.charAt(0)}</span>
                    </div>
                    <p className="text-xs font-semibold text-[#1a2b4a]">{c}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {b.status === 'pendente' && (
            <div className="flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-green-50 hover:bg-green-100 border border-green-100 text-green-700 font-semibold text-[10px] uppercase transition-all">
                <CheckCircle2 className="w-3.5 h-3.5" /> Confirmar
              </button>
              <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-red-50 hover:bg-red-100 border border-red-100 text-red-600 font-semibold text-[10px] uppercase transition-all">
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
  const [filter,       setFilter]       = useState<'todas'|'confirmada'|'pendente'|'cancelada'>('todas');
  const [filterEv,     setFilterEv]     = useState<'todas'|'confirmada'|'cancelada'>('todas');
  const [activeTab, setActiveTab] = useState<'passeios'|'eventos'>('passeios');

  const total = BOOKINGS.filter(b=>b.status==='confirmada').reduce((a,b)=>a+b.valor,0);
  const filtered = filter === 'todas' ? BOOKINGS : BOOKINGS.filter(b => b.status === filter);

  const allEventBookings: EventBooking[] = getEventBookingsByCompany(companyId);
  const filteredEvents = filterEv === 'todas'
    ? allEventBookings
    : allEventBookings.filter(b =>
        filterEv === 'confirmada' ? b.status === 'confirmed' : b.status === 'cancelled'
      );
  const totalEventos = filteredEvents.reduce((a, b) => a + b.total_price, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-['Playfair_Display'] font-bold text-[#1a2b4a] uppercase italic">Reservas</h2>
          <p className="text-xs text-gray-400 font-semibold">Histórico de reservas</p>
        </div>
        <div className="bg-green-50 border border-green-100 px-4 py-2 text-right flex-shrink-0">
          <p className="text-[9px] font-semibold text-green-600 uppercase">Confirmadas</p>
          <p className="text-base font-bold text-green-700">{currency(total)}</p>
        </div>
      </div>

      <div className="flex gap-2">
        {[
          { key: 'passeios' as const, label: '⛵ Passeios', count: BOOKINGS.length },
          { key: 'eventos'  as const, label: '🎟️ Eventos',  count: allEventBookings.length },
        ].map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 font-semibold text-xs uppercase transition-all ${
              activeTab === t.key ? 'bg-[#0a1628] text-white' : 'bg-gray-50 border border-gray-100 text-gray-500'
            }`}>
            {t.label}
            {t.count > 0 && (
              <span className={`text-[9px] font-semibold w-4 h-4 flex items-center justify-center ${
                activeTab === t.key ? 'bg-white text-[#0a1628]' : 'bg-[#0a1628] text-white'
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
                className={`px-3 py-1.5 text-[10px] font-semibold uppercase transition-all ${
                  filter === f ? 'bg-[#0a1628] text-white' : 'bg-gray-50 border border-gray-100 text-gray-500'
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
                <p className="font-semibold text-gray-300 uppercase italic text-xs">Sem reservas</p>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'eventos' && (
        <div className="space-y-2">
          <div className="flex gap-2 flex-wrap">
            {(['todas','confirmada','cancelada'] as const).map(f => (
              <button key={f} onClick={() => setFilterEv(f)}
                className={`px-3 py-1.5 text-[10px] font-semibold uppercase transition-all ${
                  filterEv === f ? 'bg-[#0a1628] text-white' : 'bg-gray-50 border border-gray-100 text-gray-500'
                }`}>
                {f}
              </button>
            ))}
          </div>
          {filteredEvents.length === 0 ? (
            <div className="text-center py-10">
              <span className="text-4xl block mb-2">🎟️</span>
              <p className="font-semibold text-gray-300 uppercase italic text-xs">Sem bilhetes de eventos</p>
            </div>
          ) : (
            filteredEvents.map(b => {
              const isPast = new Date(`${b.event_date}T${b.event_time || '23:59'}`) < new Date();
              const isCancelled = b.status === 'cancelled';
              const statusLabel = isCancelled ? 'Cancelada' : isPast ? 'Realizado' : 'Confirmado';
              const statusCls   = isCancelled ? 'bg-red-100 text-red-600' : isPast ? 'bg-[#0a1628]/10 text-[#1a2b4a]' : 'bg-green-100 text-green-700';
              return (
                <div key={b.id} className="bg-white border border-gray-100 px-4 py-3 flex items-center gap-3">
                  <div className="w-9 h-9 bg-purple-50 flex items-center justify-center flex-shrink-0 text-base">🎟️</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                      <p className="font-bold text-[#1a2b4a] text-sm truncate">{b.event_title}</p>
                      <span className={`text-[9px] font-semibold uppercase px-1.5 py-0.5 ${statusCls}`}>{statusLabel}</span>
                    </div>
                    <p className="text-xs font-semibold text-gray-500 truncate">
                      {b.customer_name} · {new Date(b.event_date+'T12:00').toLocaleDateString('pt-PT',{day:'2-digit',month:'short'})} · {b.tickets} bilhete{b.tickets!==1?'s':''}
                    </p>
                  </div>
                  <p className="font-bold text-sm text-[#1a2b4a] flex-shrink-0">{currency(b.total_price)}</p>
                </div>
              );
            })
          )}
          {filteredEvents.length > 0 && (
            <div className="bg-gradient-to-r from-[#0a1628] to-[#1a2b4a] px-5 py-3 flex items-center justify-between">
              <p className="text-[#c9a96e] text-xs font-semibold uppercase tracking-[0.15em]">Total Eventos</p>
              <p className="text-white font-bold text-lg">{currency(totalEventos)}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
