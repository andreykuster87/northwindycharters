// src/components/admin/AdminDashboardShared.tsx
import { useState } from 'react';

// ── Tipos partilhados pelas sub-peças do dashboard ────────────────────────────

export interface Auth {
  isAuthenticated: boolean;
  role: 'admin' | 'sailor' | null;
  userName?: string;
  sailorId?: string;
}

export type AdminTabKey =
  | 'reservas' | 'frota' | 'passeios' | 'cancelamentos'
  | 'sol' | 'verificados' | 'clientes' | 'mensagens' | 'financeiro'
  | 'empresas' | 'eventos' | 'candidatos';

export type SailorTabKey = 'reservas' | 'frota' | 'passeios' | 'cancelamentos' | 'mensagens' | 'eventos' | 'empresa';

export type TabKey = AdminTabKey | SailorTabKey;

export interface TabDef {
  key:    TabKey;
  icon:   React.ElementType;
  label:  string;
  short:  string;
  badge?: number;
}

// ── KPI Card ─────────────────────────────────────────────────────────────────

export function KpiCard({ emoji, label, value }: { emoji: string; label: string; value: number }) {
  return (
    <div className="bg-white rounded-[18px] border-2 border-gray-100 px-4 py-3 flex items-center gap-3 shadow-sm">
      <span className="text-xl">{emoji}</span>
      <div>
        <p className="text-xl font-black text-blue-900 leading-tight">{value}</p>
        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
      </div>
    </div>
  );
}

// ── DevResetBanner ─────────────────────────────────────────────────────────────

export function DevResetBanner({ onReset }: { onReset: () => void }) {
  const [confirm, setConfirm] = useState<null | 'all' | 'clients' | 'sailors' | 'boats'>(null);

  async function wipe(target: 'all' | 'clients' | 'sailors' | 'boats') {
    const sb = (await import('../../lib/supabase')).supabase;

    if (target === 'all' || target === 'clients') {
      await sb.from('bookings').delete().not('id', 'is', null);
      await sb.from('messages').delete().not('id', 'is', null);
      await sb.from('clients').delete().not('id', 'is', null);
    }
    if (target === 'all' || target === 'sailors') {
      await sb.from('sailors').delete().not('id', 'is', null);
    }
    if (target === 'all' || target === 'boats') {
      await sb.from('bookings').delete().not('id', 'is', null);
      await sb.from('trips').delete().not('id', 'is', null);
      await sb.from('boats').delete().not('id', 'is', null);
    }
    if (target === 'all') {
      await sb.from('events').delete().not('id', 'is', null);
      await sb.from('event_bookings').delete().not('id', 'is', null);
      await sb.from('job_offers').delete().not('id', 'is', null);
    }
    await sb.from('counters').update({ value: 0 }).in('key', ['profile_counter','booking_counter','event_booking_counter']);

    setConfirm(null);
    await (await import('../../lib/localStore')).refreshAll();
    onReset();
  }

  const ACTIONS = [
    { key: 'clients' as const, label: 'Passageiros',  emoji: '👤', color: 'text-cyan-700 border-cyan-200 bg-cyan-50 hover:bg-cyan-100',         desc: 'Clientes + reservas, mensagens e documentos' },
    { key: 'sailors' as const, label: 'Tripulantes',  emoji: '⚓', color: 'text-blue-700 border-blue-200 bg-blue-50 hover:bg-blue-100',           desc: 'Sailors + documentos e mensagens' },
    { key: 'boats'   as const, label: 'Embarcações',  emoji: '⛵', color: 'text-indigo-700 border-indigo-200 bg-indigo-50 hover:bg-indigo-100',   desc: 'Barcos + passeios + reservas' },
    { key: 'all'     as const, label: 'Tudo',         emoji: '🗑️', color: 'text-red-700 border-red-200 bg-red-50 hover:bg-red-100',               desc: 'Apaga todos os dados nw_*' },
  ];
  const active = ACTIONS.find(a => a.key === confirm);

  return (
    <>
      <div className="bg-amber-50 border-2 border-amber-200 rounded-[18px] px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1">
          <p className="text-[11px] font-black text-amber-700 uppercase tracking-widest">🛠️ Modo Desenvolvimento</p>
          <p className="text-xs font-bold text-amber-600">Apaga dados de forma independente.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {ACTIONS.map(a => (
            <button key={a.key} onClick={() => setConfirm(a.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 font-black text-xs transition-all ${a.color}`}>
              {a.emoji} {a.label}
            </button>
          ))}
          <button onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 font-black text-xs text-gray-600 border-gray-300 bg-gray-50 hover:bg-gray-100">
            🔢 Contadores
          </button>
        </div>
      </div>
      {confirm && active && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setConfirm(null)}>
          <div className="bg-white rounded-[28px] shadow-2xl border-2 border-red-100 w-full max-w-sm p-8 text-center animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5 text-3xl">{active.emoji}</div>
            <h3 className="text-xl font-black text-blue-900 uppercase italic mb-2">Confirmar Limpeza</h3>
            <p className="text-base font-black text-red-600 mb-2">{active.label}</p>
            <p className="text-xs font-bold text-gray-400 mb-4">{active.desc}</p>
            <p className="text-[11px] text-gray-400 font-bold mb-6 bg-gray-50 rounded-[14px] px-4 py-3">⚠️ Esta ação não pode ser desfeita.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirm(null)} className="flex-1 border-2 border-gray-200 text-gray-500 py-3.5 rounded-[20px] font-black text-sm uppercase hover:border-blue-900 hover:text-blue-900 transition-all">Cancelar</button>
              <button onClick={() => wipe(confirm!)} className="flex-1 bg-red-600 hover:bg-red-500 text-white py-3.5 rounded-[20px] font-black text-sm uppercase transition-all shadow-md">🗑️ Apagar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
