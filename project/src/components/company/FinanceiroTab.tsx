// src/components/company/FinanceiroTab.tsx
import { useState } from 'react';
import { getEventBookingsByCompany } from '../../lib/localStore';

function currency(n: number) {
  return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(n);
}

interface Props {
  companyId: string;
}

export function FinanceiroTab({ companyId }: Props) {
  const [showAll, setShowAll] = useState(false);
  const now = new Date();

  const evtBookings = getEventBookingsByCompany(companyId);
  const activeEvt   = evtBookings.filter(b => b.status !== 'cancelled');

  function isEventPast(dateStr: string, timeStr: string) {
    try { return new Date(`${dateStr}T${timeStr || '23:59'}`) < now; } catch { return false; }
  }

  const confirmados = activeEvt.filter(b => isEventPast(b.event_date, b.event_time));
  const pendentes   = activeEvt.filter(b => !isEventPast(b.event_date, b.event_time));

  const receitaConf  = confirmados.reduce((s, b) => s + b.total_price, 0);
  const receitaPend  = pendentes.reduce((s, b)   => s + b.total_price, 0);
  const receitaTotal = receitaConf + receitaPend;

  const displayBookings = showAll ? activeEvt : activeEvt.slice(0, 5);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-['Playfair_Display'] font-bold text-[#1a2b4a] uppercase italic">Financeiro</h2>
        <p className="text-xs text-gray-400 font-semibold">Receitas dos seus eventos</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Confirmada', value: currency(receitaConf),  cls: 'text-green-600', bg: 'bg-green-50 border-green-100',        icon: '💰' },
          { label: 'Pendente',   value: currency(receitaPend),  cls: 'text-[#1a2b4a]', bg: 'bg-[#c9a96e]/5 border-[#c9a96e]/20', icon: '⏳' },
          { label: 'Total',      value: currency(receitaTotal), cls: 'text-[#1a2b4a]', bg: 'bg-[#0a1628]/5 border-[#c9a96e]/20', icon: '📊' },
        ].map(k => (
          <div key={k.label} className={`border p-3 ${k.bg}`}>
            <p className="text-base mb-0.5">{k.icon}</p>
            <p className={`text-sm font-bold leading-tight ${k.cls}`}>{k.value}</p>
            <p className="text-[9px] font-semibold uppercase tracking-wider text-gray-500 mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-[#0a1628]/5 border border-[#c9a96e]/20 px-4 py-3">
        <p className="text-xs font-semibold text-[#1a2b4a] leading-relaxed">
          💡 <span className="font-bold">Receita Pendente</span> = evento ainda não se realizou. Automaticamente passa a <span className="font-bold">Confirmada</span> após a data/hora do evento.
        </p>
      </div>

      <div className="bg-white border border-gray-100 p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em]">Bilhetes Vendidos</p>
          <span className="bg-[#c9a96e]/15 text-[#c9a96e] text-[10px] font-semibold px-2 py-0.5">
            {activeEvt.length} bilhete{activeEvt.length !== 1 ? 's' : ''}
          </span>
        </div>

        {activeEvt.length === 0 ? (
          <div className="text-center py-8">
            <span className="text-3xl block mb-2">🎟️</span>
            <p className="font-semibold text-gray-300 uppercase italic text-xs">Sem bilhetes vendidos ainda</p>
            <p className="text-[10px] font-semibold text-gray-400 mt-1">As receitas aparecem aqui após as primeiras reservas.</p>
          </div>
        ) : (
          <>
            <div className="space-y-2.5">
              {displayBookings.map(b => {
                const isPast  = isEventPast(b.event_date, b.event_time);
                const statusCls = isPast ? 'text-green-600' : 'text-[#1a2b4a]';
                const statusLabel = isPast ? '✅ Confirmada' : '⏳ Pendente';
                return (
                  <div key={b.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                    <div className={`w-8 h-8 flex items-center justify-center flex-shrink-0 text-sm ${
                      isPast ? 'bg-green-50' : 'bg-[#c9a96e]/10'
                    }`}>
                      {isPast ? '💰' : '⏳'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#1a2b4a] truncate">{b.event_title}</p>
                      <p className="text-[10px] font-semibold text-gray-400">
                        {b.customer_name} · {b.tickets} bilhete{b.tickets !== 1 ? 's' : ''} · {new Date(b.event_date + 'T12:00').toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' })}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`font-bold text-sm ${statusCls}`}>+{currency(b.total_price)}</p>
                      <p className={`text-[9px] font-semibold ${statusCls}`}>{statusLabel}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            {activeEvt.length > 5 && (
              <button
                onClick={() => setShowAll(v => !v)}
                className="w-full mt-3 text-[10px] font-semibold text-[#1a2b4a] hover:text-[#0a1628] uppercase tracking-wider transition-colors"
              >
                {showAll ? '▲ Mostrar menos' : `▼ Ver todos (${activeEvt.length})`}
              </button>
            )}
          </>
        )}
      </div>

      {activeEvt.length > 0 && (() => {
        const byEvent = new Map<string, { title: string; total: number; qtd: number; isPast: boolean }>();
        activeEvt.forEach(b => {
          const e = byEvent.get(b.event_id) || { title: b.event_title, total: 0, qtd: 0, isPast: isEventPast(b.event_date, b.event_time) };
          byEvent.set(b.event_id, { ...e, total: e.total + b.total_price, qtd: e.qtd + 1 });
        });
        const events = Array.from(byEvent.values());
        if (events.length === 0) return null;
        return (
          <div className="bg-white border border-gray-100 p-4">
            <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em] mb-3">Receita por Evento</p>
            <div className="space-y-2">
              {events.map((ev, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-50 flex items-center justify-center flex-shrink-0 text-sm">🎟️</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1a2b4a] truncate">{ev.title}</p>
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-semibold uppercase px-1.5 py-0.5 ${
                        ev.isPast ? 'bg-green-100 text-green-700' : 'bg-[#c9a96e]/15 text-[#c9a96e]'
                      }`}>{ev.isPast ? 'Realizado' : 'Pendente'}</span>
                      <span className="text-[10px] font-semibold text-gray-400">{ev.qtd} bilhete{ev.qtd !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  <p className="font-bold text-sm text-[#1a2b4a] flex-shrink-0">{currency(ev.total)}</p>
                </div>
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
