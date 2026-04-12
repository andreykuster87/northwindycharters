// src/components/EditTripModal.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Modal de edição de passeio — edita todos os campos e gere a agenda
// (adicionar / remover datas e horários).
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useRef } from 'react';
import {
  X, Anchor, Clock, Wine, UtensilsCrossed, Beer,
  Save, CheckCircle2, Camera,
} from 'lucide-react';
import { updateTrip, getTrips, type Trip } from '../../lib/localStore';
import { uid, today, COUNTRIES, type ScheduleEntry } from '../../constants/constants';
import { OptionChip } from '../shared/OptionChip';
import { PhotoAlbumManager } from '../shared/PhotoAlbumManager';
import { duracaoToHours, getBlockedSlots, DURACOES, CarouselPreview } from './EditTripModalShared';
import { EditTripAgendaTab } from './EditTripAgendaTab';

// ── Tipos ─────────────────────────────────────────────────────────────────────

type Tab = 'agenda' | 'rota' | 'valor' | 'extras' | 'fotos';

interface Props {
  trip:     Trip;
  capacity: number;          // capacidade do barco
  onClose:  () => void;
  onSaved:  (updated: Trip) => void;
}

// ── Componente ────────────────────────────────────────────────────────────────

export function EditTripModal({ trip, capacity, onClose, onSaved }: Props) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const [activeTab,    setActiveTab]    = useState<Tab>('agenda');
  const [saved,        setSaved]        = useState(false);
  const [error,        setError]        = useState<string | null>(null);

  // ── campos editáveis ──────────────────────────────────────────────────────

  // Rota
  const [marinaSaida,    setMarinaSaida]    = useState((trip as any).marina_saida    || '');
  const [marinaChegada,  setMarinaChegada]  = useState((trip as any).marina_chegada  || '');
  const [meetingPoint,   setMeetingPoint]   = useState((trip as any).meeting_point   || '');
  const [meetingSector,  setMeetingSector]  = useState((trip as any).meeting_sector  || '');
  const [meetingGate,    setMeetingGate]    = useState((trip as any).meeting_gate    || '');
  const [meetingRef,     setMeetingRef]     = useState((trip as any).meeting_ref     || '');
  const [meetingMapsUrl, setMeetingMapsUrl] = useState((trip as any).meeting_maps_url || '');

  // Valor
  const [duracao,           setDuracao]           = useState((trip as any).duracao           || '');
  const [valorPorPessoa,    setValorPorPessoa]    = useState(String(trip.valor_por_pessoa     || ''));
  const [minimoTripulantes, setMinimoTripulantes] = useState((trip as any).minimo_tripulantes ?? 1);
  const [descricao,         setDescricao]         = useState(trip.descricao || '');

  // Extras
  const [bebidas, setBebidas] = useState<'inclusas' | 'nao_inclusas' | 'traga'>((trip as any).bebidas || 'nao_inclusas');
  const [comida,  setComida]  = useState<'inclusa' | 'nao_inclusa'>((trip as any).comida || 'nao_inclusa');
  const [bar,     setBar]     = useState<'tem' | 'nao_tem'>((trip as any).bar || 'nao_tem');

  // Fotos
  const initPhotos: string[] = (() => {
    const stored = getTrips().find(t => t.id === trip.id);
    const all: string[] = [];
    if (stored?.cover_photo) all.push(stored.cover_photo);
    (stored?.photos || []).forEach((p: string) => { if (p && p !== stored.cover_photo) all.push(p); });
    return all;
  })();
  const initCover: string = (() => {
    const stored = getTrips().find(t => t.id === trip.id);
    return stored?.cover_photo || '';
  })();
  const [tripPhotos, setTripPhotos] = useState<string[]>(initPhotos);
  const [tripCover,  setTripCover]  = useState<string>(initCover);

  // Agenda
  const initSchedule: ScheduleEntry[] = ((trip as any).schedule || []).map((e: any) => ({
    id:         e.id || uid(),
    date:       e.date,
    time_slots: e.time_slots || [],
    spots:      e.spots ?? capacity,
  }));
  const [schedule,      setSchedule]      = useState<ScheduleEntry[]>(initSchedule.length ? initSchedule : [{ id: uid(), date: today(), time_slots: [], spots: capacity }]);
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);

  // ── agenda helpers ────────────────────────────────────────────────────────

  const addEntry = () => {
    const e: ScheduleEntry = { id: uid(), date: today(), time_slots: [], spots: capacity };
    setSchedule(p => [...p, e]);
    setExpandedEntry(e.id);
    setTimeout(() => bodyRef.current?.scrollTo({ top: 9999, behavior: 'smooth' }), 100);
  };

  const removeEntry = (id: string) => {
    if (schedule.length <= 1) { setError('⚠️ O passeio precisa de pelo menos uma data.'); return; }
    setSchedule(p => p.filter(e => e.id !== id));
    if (expandedEntry === id) setExpandedEntry(null);
  };

  const updateEntry = (id: string, patch: Partial<ScheduleEntry>) => {
    if (patch.date) {
      const dup = schedule.some(e => e.id !== id && e.date === patch.date);
      if (dup) { setError(`⚠️ Já existe uma entrada para ${patch.date}.`); return; }
      setError(null);
    }
    setSchedule(p => p.map(e => e.id === id ? { ...e, ...patch } : e));
  };

  const toggleSlot = (id: string, slot: string) => {
    setSchedule(p => p.map(e => {
      if (e.id !== id) return e;
      if (e.time_slots.includes(slot)) {
        const hours    = duracaoToHours(duracao);
        const toRemove = new Set([slot, ...getBlockedSlots(slot, hours)]);
        return { ...e, time_slots: e.time_slots.filter(s => !toRemove.has(s)).sort() };
      }
      const hours   = duracaoToHours(duracao);
      const blocked = new Set<string>();
      e.time_slots.forEach(s => getBlockedSlots(s, hours).forEach(b => blocked.add(b)));
      if (blocked.has(slot)) return e;
      return { ...e, time_slots: [...e.time_slots, slot].sort() };
    }));
  };

  // ── guardar ───────────────────────────────────────────────────────────────

  const handleSave = () => {
    if (!marinaSaida.trim())   { setActiveTab('rota');   setError('⚠️ Informe a marina de saída.');   return; }
    if (!marinaChegada.trim()) { setActiveTab('rota');   setError('⚠️ Informe a marina de chegada.'); return; }
    if (!duracao)              { setActiveTab('valor');  setError('⚠️ Selecione a duração.');         return; }
    const val = parseFloat(valorPorPessoa.replace(',', '.'));
    if (!val || val <= 0)      { setActiveTab('valor');  setError('⚠️ Informe um valor por pessoa válido.'); return; }
    if (schedule.some(e => !e.date)) { setActiveTab('agenda'); setError('⚠️ Todas as datas devem estar preenchidas.'); return; }
    setError(null);

    const countryObj = COUNTRIES.find(c => c.code === (trip as any).country_code) || COUNTRIES[0];

    const patch: Partial<Trip> = {
      marina_saida:    marinaSaida.trim(),
      marina_chegada:  marinaChegada.trim(),
      duracao,
      valor_por_pessoa: val,
      descricao:       descricao.trim(),
      // campos extras via cast
      ...(({
        minimo_tripulantes: minimoTripulantes,
        bebidas, comida, bar,
        meeting_point:    meetingPoint.trim(),
        meeting_sector:   meetingSector.trim(),
        meeting_gate:     meetingGate.trim(),
        meeting_ref:      meetingRef.trim(),
        meeting_maps_url: meetingMapsUrl.trim(),
        schedule: schedule.map(({ id, date, time_slots, spots }) => ({ id, date, time_slots, spots })),
        currency:        countryObj.currency,
        currency_symbol: countryObj.symbol,
        currency_locale: countryObj.locale,
        photos:          tripPhotos,
        cover_photo:     tripCover || tripPhotos[0] || '',
      }) as any),
    };

    updateTrip(trip.id, patch);
    const updated = { ...trip, ...patch } as Trip;
    setSaved(true);
    setTimeout(() => { setSaved(false); onSaved(updated); }, 900);
  };

  // ── render ────────────────────────────────────────────────────────────────

  const TABS: { id: Tab; icon: string; label: string }[] = [
    { id: 'agenda', icon: '📅', label: 'Agenda'  },
    { id: 'rota',   icon: '⛵', label: 'Rota'    },
    { id: 'valor',  icon: '💰', label: 'Valor'   },
    { id: 'extras', icon: '🍾', label: 'Extras'  },
    { id: 'fotos',  icon: '📷', label: 'Fotos'   },
  ];

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-blue-900/60 backdrop-blur-md">
      <div className="bg-white w-full max-w-lg max-h-[92vh] flex flex-col rounded-[40px] shadow-2xl border-4 border-blue-900 animate-in zoom-in-95 duration-300">

        {/* ── Header ── */}
        <div className="flex-shrink-0 bg-blue-900 px-6 pt-5 pb-4 rounded-t-[36px]">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest mb-0.5 flex items-center gap-1.5">
                <Anchor className="w-3 h-3" /> Editar Passeio
              </p>
              <h2 className="text-xl font-black text-white uppercase italic leading-tight">{trip.boat_name}</h2>
            </div>
            <button onClick={onClose} className="bg-blue-800 hover:bg-blue-700 text-white p-3 rounded-full transition-all flex-shrink-0">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab bar */}
          <div className="flex gap-1 bg-blue-800/50 rounded-[16px] p-1">
            {TABS.map(t => (
              <button key={t.id} onClick={() => { setActiveTab(t.id); setError(null); }}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-[12px] transition-all
                  ${activeTab === t.id ? 'bg-white text-blue-900 shadow-md' : 'text-blue-300 hover:text-white'}`}>
                <span className="text-base leading-none">{t.icon}</span>
                <span className="text-[9px] font-black uppercase leading-none">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Body ── */}
        <div ref={bodyRef} className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* Erro */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-[16px] px-4 py-3 flex items-center gap-3 animate-in fade-in duration-200">
              <span className="text-lg">⚠️</span>
              <p className="text-red-700 font-bold text-sm">{error}</p>
            </div>
          )}

          {/* ── TAB AGENDA ── */}
          {activeTab === 'agenda' && (
            <EditTripAgendaTab
              schedule={schedule}
              expandedEntry={expandedEntry}
              setExpandedEntry={setExpandedEntry}
              duracao={duracao}
              capacity={capacity}
              onAddEntry={addEntry}
              onRemoveEntry={removeEntry}
              onUpdateEntry={updateEntry}
              onToggleSlot={toggleSlot}
            />
          )}

          {/* ── TAB ROTA ── */}
          {activeTab === 'rota' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <p className="text-xs font-black text-blue-900 uppercase flex items-center gap-2">
                <Anchor className="w-3.5 h-3.5" /> Rota & Ponto de Encontro
              </p>

              {[
                { label: 'Marina de Saída *',  val: marinaSaida,   set: setMarinaSaida,   icon: '⚓' },
                { label: 'Marina de Chegada *', val: marinaChegada, set: setMarinaChegada, icon: '🏁' },
                { label: 'Ponto de Encontro',  val: meetingPoint,  set: setMeetingPoint,  icon: '📍' },
                { label: 'Sector / Zona',      val: meetingSector, set: setMeetingSector, icon: '🗂️' },
                { label: 'Portão / Gate',      val: meetingGate,   set: setMeetingGate,   icon: '🚪' },
                { label: 'Referência local',   val: meetingRef,    set: setMeetingRef,    icon: '🔖' },
                { label: 'Link Google Maps',   val: meetingMapsUrl,set: setMeetingMapsUrl,icon: '🗺️' },
              ].map(({ label, val, set, icon }) => (
                <div key={label}>
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-1.5 flex items-center gap-1">
                    <span>{icon}</span> {label}
                  </p>
                  <input value={val} onChange={e => set(e.target.value)}
                    placeholder={label}
                    className="w-full bg-gray-50 border-2 border-gray-100 focus:border-blue-900 rounded-[12px] px-4 py-3 font-bold text-blue-900 outline-none transition-all text-sm placeholder:text-gray-300" />
                </div>
              ))}
            </div>
          )}

          {/* ── TAB VALOR ── */}
          {activeTab === 'valor' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <p className="text-xs font-black text-blue-900 uppercase flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" /> Duração & Valor
              </p>

              {/* Duração */}
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase mb-2">⏱ Duração *</p>
                <div className="flex flex-wrap gap-2">
                  {DURACOES.map(d => (
                    <button key={d} type="button" onClick={() => setDuracao(d)}
                      className={`px-4 py-2.5 rounded-full font-black text-xs uppercase border-2 transition-all
                        ${duracao === d ? 'bg-blue-900 text-white border-blue-900 shadow-md' : 'bg-gray-50 text-gray-500 border-gray-100 hover:border-blue-300 hover:text-blue-900'}`}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Valor */}
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase mb-1.5">💰 Valor por pessoa *</p>
                <input type="number" value={valorPorPessoa} onChange={e => setValorPorPessoa(e.target.value)}
                  min="0" step="0.01" placeholder="0.00"
                  className="w-full bg-gray-50 border-2 border-gray-100 focus:border-blue-900 rounded-[12px] px-4 py-3 font-black text-blue-900 outline-none transition-all text-sm" />
              </div>

              {/* Mínimo tripulantes */}
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase mb-2">👥 Mínimo de confirmados</p>
                <div className="flex items-center gap-3">
                  <button onClick={() => setMinimoTripulantes(v => Math.max(1, v - 1))}
                    className="w-9 h-9 rounded-full bg-gray-100 hover:bg-blue-100 font-black text-lg text-blue-900 transition-all flex items-center justify-center">−</button>
                  <span className="font-black text-blue-900 text-xl w-12 text-center">{minimoTripulantes}</span>
                  <button onClick={() => setMinimoTripulantes(v => Math.min(capacity, v + 1))}
                    className="w-9 h-9 rounded-full bg-gray-100 hover:bg-blue-100 font-black text-lg text-blue-900 transition-all flex items-center justify-center">+</button>
                </div>
              </div>

              {/* Descrição */}
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase mb-1.5">📝 Descrição</p>
                <textarea value={descricao} onChange={e => setDescricao(e.target.value)}
                  rows={4} placeholder="Descreva o passeio…"
                  className="w-full bg-gray-50 border-2 border-gray-100 focus:border-blue-900 rounded-[16px] px-4 py-3 font-bold text-blue-900 outline-none transition-all text-sm resize-none placeholder:text-gray-300" />
              </div>
            </div>
          )}

          {/* ── TAB EXTRAS ── */}
          {activeTab === 'extras' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <p className="text-xs font-black text-blue-900 uppercase flex items-center gap-2">
                <Beer className="w-3.5 h-3.5" /> Extras a Bordo
              </p>

              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase mb-2 flex items-center gap-1">
                  <Wine className="w-3 h-3" /> Bebidas
                </p>
                <div className="flex gap-2 flex-wrap">
                  <OptionChip label="Inclusas"         icon="🍾" active={bebidas === 'inclusas'}     onClick={() => setBebidas('inclusas')} />
                  <OptionChip label="Não inclusas"     icon="🚫" active={bebidas === 'nao_inclusas'} onClick={() => setBebidas('nao_inclusas')} />
                  <OptionChip label="Traga sua bebida" icon="🎒" active={bebidas === 'traga'}         onClick={() => setBebidas('traga')} />
                </div>
              </div>

              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase mb-2 flex items-center gap-1">
                  <UtensilsCrossed className="w-3 h-3" /> Alimentação
                </p>
                <div className="flex gap-2 flex-wrap">
                  <OptionChip label="Inclusa"     icon="🍽️" active={comida === 'inclusa'}     onClick={() => setComida('inclusa')} />
                  <OptionChip label="Não inclusa" icon="🚫" active={comida === 'nao_inclusa'} onClick={() => setComida('nao_inclusa')} />
                </div>
              </div>

              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase mb-2 flex items-center gap-1">
                  <Beer className="w-3 h-3" /> Bar a Bordo
                </p>
                <div className="flex gap-2 flex-wrap">
                  <OptionChip label="Temos bar" icon="🍹" active={bar === 'tem'}     onClick={() => setBar('tem')} />
                  <OptionChip label="Sem bar"   icon="🚫" active={bar === 'nao_tem'} onClick={() => setBar('nao_tem')} />
                </div>
              </div>
            </div>
          )}

          {/* ── TAB FOTOS ── */}
          {activeTab === 'fotos' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <p className="text-xs font-black text-blue-900 uppercase flex items-center gap-2">
                <Camera className="w-3.5 h-3.5" /> Fotos do Passeio
              </p>

              {/* Carrossel de preview */}
              {tripPhotos.length > 0 && (
                <CarouselPreview photos={tripPhotos} cover={tripCover} />
              )}

              {/* Gestor de fotos */}
              <PhotoAlbumManager
                entityId={trip.id}
                entityType="trips"
                initialPhotos={tripPhotos}
                initialCover={tripCover}
                compact
                onUpdate={(photos, cover) => {
                  setTripPhotos(photos);
                  setTripCover(cover);
                }}
              />
            </div>
          )}
        </div>

        <div className="flex-shrink-0 border-t-2 border-gray-100 px-6 py-4 flex gap-3">
          <button onClick={onClose}
            className="px-5 py-4 border-2 border-gray-100 text-gray-400 rounded-[24px] font-black text-sm uppercase hover:border-blue-900 hover:text-blue-900 transition-all">
            Cancelar
          </button>
          <button onClick={handleSave}
            className={`flex-1 py-4 rounded-[24px] font-black uppercase tracking-widest text-sm transition-all shadow-lg flex items-center justify-center gap-2
              ${saved ? 'bg-green-500 text-white' : 'bg-blue-900 text-white hover:bg-blue-800'}`}>
            {saved
              ? <><CheckCircle2 className="w-4 h-4" /> Guardado!</>
              : <><Save className="w-4 h-4" /> Guardar alterações</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}
