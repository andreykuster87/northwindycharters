// src/components/company/RHTab.tsx
// Módulo de RH — Equipa, Férias, Comunicados, Recibos (Supabase-backed)
import { useState, useRef, useEffect } from 'react';
import {
  Users, CalendarDays, MessageSquare, FileText,
  UserPlus, Search, Mail, X, Check, Trash2, AlertCircle,
  Plus, Send, Paperclip, Download,
  CheckCircle2, XCircle, Clock, Calendar,
  Briefcase, Eye, Bell, ChevronDown, ChevronUp,
} from 'lucide-react';
import { getSailors, getClients } from '../../lib/localStore';
import { uploadDoc } from '../../lib/storage';
import {
  StaffMember, FeriasRequest, Comunicado, Recibo, Resposta,
  loadStaff, addStaff, removeStaff as dbRemoveStaff,
  loadFerias, insertFerias, updateFeriasStatus, deleteFerias,
  loadComunicados, insertComunicado,
  loadRecibos, insertRecibo, deleteRecibo,
  loadRespostas, markRespostaLida as dbMarkLida,
} from '../../lib/rh';

export type { StaffMember, FeriasRequest, Comunicado, Recibo };
import { EquipaSubTab }      from './EquipaSubTab';
import { FeriasSubTab }      from './FeriasSubTab';
import { ComunicadosSubTab } from './ComunicadosSubTab';
import { RecibosSubTab }     from './RecibosSubTab';

// ══ RHTab principal ════════════════════════════════════════════════════════════

export function RHTab({ companyId, onToast }: { companyId: string; onToast: (msg: string) => void }) {
  const [tab,        setTab]        = useState<'equipa' | 'ferias' | 'ausencias' | 'comunicados' | 'recibos'>('equipa');
  const [staff,      setStaff]      = useState<StaffMember[]>([]);
  const [ferias,     setFerias]     = useState<FeriasRequest[]>([]);
  const [comunicados,setComunicados]= useState<Comunicado[]>([]);
  const [recibos,    setRecibos]    = useState<Recibo[]>([]);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [s, f, c, r] = await Promise.all([
        loadStaff(companyId),
        loadFerias(companyId),
        loadComunicados(companyId),
        loadRecibos(companyId),
      ]);
      setStaff(s);
      setFerias(f);
      setComunicados(c);
      setRecibos(r);
      setLoading(false);
    }
    load();
  }, [companyId]);

  const pendentesCount = ferias.filter(f => f.status === 'pendente').length;
  const today = new Date().toISOString().split('T')[0];
  const emAusencia = ferias.filter(f =>
    f.status === 'aprovada' && f.dataInicio <= today && f.dataFim >= today
  );

  const RH_TABS = [
    { key: 'equipa'      as const, icon: <Users className="w-4 h-4" />,        label: 'Equipa' },
    { key: 'ferias'      as const, icon: <CalendarDays className="w-4 h-4" />, label: 'Férias', hasPendente: pendentesCount > 0 },
    { key: 'ausencias'   as const, icon: <Bell className="w-4 h-4" />,          label: 'Em Férias/Atestado', hasPendente: emAusencia.length > 0 },
    { key: 'comunicados' as const, icon: <MessageSquare className="w-4 h-4" />,label: 'Comunicados' },
    { key: 'recibos'     as const, icon: <FileText className="w-4 h-4" />,     label: 'Recibos' },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-lg font-['Playfair_Display'] font-bold text-[#1a2b4a] uppercase italic flex items-center gap-2">
          <Briefcase className="w-5 h-5" /> RH
        </h2>
        <p className="text-xs text-gray-400 font-semibold">Recursos Humanos — Equipa, Férias, Comunicados e Recibos</p>
      </div>

      {/* Sub-tab nav */}
      <div className="flex gap-1 bg-gray-100 p-1 flex-wrap">
        {RH_TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-1 flex flex-col items-center py-2 transition-all relative min-w-[60px] ${tab === t.key ? 'bg-white text-[#1a2b4a] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
            {t.icon}
            <span className="text-[9px] font-semibold uppercase mt-0.5 leading-tight text-center">{t.label}</span>
            {(t as any).hasPendente && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#c9a96e]" />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="w-8 h-8 border-2 border-[#c9a96e]/30 border-t-[#0a1628] animate-spin mx-auto" />
          <p className="text-xs font-semibold text-gray-400 mt-3">A carregar dados…</p>
        </div>
      ) : (
        <>
          {tab === 'equipa'      && <EquipaSubTab      staff={staff} setStaff={setStaff} companyId={companyId} onToast={onToast} />}
          {tab === 'ferias'      && <FeriasSubTab      staff={staff} ferias={ferias} setFerias={setFerias} companyId={companyId} onToast={onToast} />}
          {tab === 'ausencias'   && (
            <div className="space-y-3">
              <div>
                <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em] flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5" /> Em Férias / Atestado
                </p>
                <p className="text-[10px] text-gray-400 font-semibold">Funcionários actualmente ausentes</p>
              </div>
              {emAusencia.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-gray-200 py-12 text-center">
                  <CalendarDays className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                  <p className="font-semibold text-gray-300 uppercase italic text-sm">Nenhum funcionário em ausência</p>
                  <p className="text-xs text-gray-400 font-semibold mt-1">Todos os funcionários estão disponíveis.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {emAusencia.map(f => {
                    const isAtestado = f.motivo?.toLowerCase().includes('atestado') || f.motivo?.toLowerCase().includes('médico');
                    return (
                      <div key={f.id} className={`border px-4 py-3 flex items-center gap-3 ${isAtestado ? 'bg-red-50 border-red-100' : 'bg-purple-50 border-purple-100'}`}>
                        <div className={`w-9 h-9 flex items-center justify-center flex-shrink-0 font-bold text-white text-sm ${isAtestado ? 'bg-red-500' : 'bg-purple-600'}`}>
                          {f.staffNome.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-[#1a2b4a] text-sm truncate">{f.staffNome}</p>
                          <p className="text-[10px] font-semibold text-gray-500">
                            {f.dataInicio} → {f.dataFim}
                            {f.motivo && ` · ${f.motivo}`}
                          </p>
                        </div>
                        <span className={`text-[9px] font-semibold uppercase px-2 py-0.5 flex-shrink-0 ${isAtestado ? 'bg-red-100 text-red-700' : 'bg-purple-100 text-purple-700'}`}>
                          {isAtestado ? '🏥 Atestado' : '🏖️ Férias'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
          {tab === 'comunicados' && <ComunicadosSubTab staff={staff} comunicados={comunicados} setComunicados={setComunicados} companyId={companyId} onToast={onToast} />}
          {tab === 'recibos'     && <RecibosSubTab     staff={staff} recibos={recibos} setRecibos={setRecibos} companyId={companyId} onToast={onToast} />}
        </>
      )}
    </div>
  );
}
