// src/components/CreateTripModal/CreateTripModal.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Orquestrador — estado, validações, submit e composição dos steps.
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useRef } from 'react';
import { X, Anchor, CheckCircle2, Users } from 'lucide-react';
import { saveTrip, updateTrip, getTrips } from '../../lib/localStore';
import { PhotoAlbumManager } from '../shared/PhotoAlbumManager';

import {
  COUNTRIES, STATES, TABS, uid, today,
  type Country, type TabN, type ScheduleEntry, type TripBoat,
} from '../../constants/constants';
import { Stepper }        from '../shared/Stepper';
import { Step1Localizacao } from '../client/steps/Step1Localizacao';
import { Step2Rota }        from '../client/steps/Step2Rota';
import { Step3Valor }       from '../client/steps/Step3Valor';
import { Step4Agenda }      from '../client/steps/Step4Agenda';
import { Step5Descricao }   from '../client/steps/Step5Descricao';

// ── Props ─────────────────────────────────────────────────────────────────────

interface CreateTripModalProps {
  boat:       TripBoat;
  sailorId?:  string;
  sailorName?: string;
  onClose:    () => void;
  onSuccess:  (trip: any) => void;
}

// ── helpers ───────────────────────────────────────────────────────────────────

function duracaoToHours(dur: string): number {
  if (!dur) return 0;
  if (dur === 'Dia completo')  return 12;
  if (dur === 'Fim de semana') return 24;
  const match = dur.match(/^(\d+)h$/);
  return match ? parseInt(match[1], 10) : 0;
}

function getBlockedSlots(startSlot: string, durationHours: number): Set<string> {
  const blocked = new Set<string>();
  if (!startSlot || durationHours <= 0) return blocked;
  const [sh, sm]  = startSlot.split(':').map(Number);
  const startMin  = sh * 60 + sm;
  const endMin    = startMin + durationHours * 60;
  const TIME_OPTIONS = ['06:00','07:00','08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00'];
  TIME_OPTIONS.forEach(s => {
    const [h, mn] = s.split(':').map(Number);
    const slotMin = h * 60 + mn;
    if (slotMin > startMin && slotMin < endMin) blocked.add(s);
  });
  return blocked;
}

// ── Componente ────────────────────────────────────────────────────────────────

export function CreateTripModal({ boat, sailorId, sailorName, onClose, onSuccess }: CreateTripModalProps) {
  const [tab,         setTab]         = useState<TabN>(1);
  const [doneTabs,    setDoneTabs]    = useState<Set<number>>(new Set());
  const [loading,     setLoading]     = useState(false);
  const [savedTripId, setSavedTripId] = useState<string | null>(null);
  const [showPhotos,  setShowPhotos]  = useState(false);
  const [tripCover,   setTripCover]   = useState('');
  const [formError,   setFormError]   = useState<string | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  // ── Estado do formulário ─────────────────────────────────────────────────

  // Step 1
  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[0]);
  const [selectedState,   setSelectedState]   = useState('');
  const [cityInput,       setCityInput]       = useState('');
  const [geoLoading,      setGeoLoading]      = useState(false);

  // Step 2
  const [marinaSaida,     setMarinaSaida]     = useState('');
  const [marinaChegada,   setMarinaChegada]   = useState('');
  const [meetingPoint,    setMeetingPoint]    = useState('');
  const [meetingSector,   setMeetingSector]   = useState('');
  const [meetingGate,     setMeetingGate]     = useState('');
  const [meetingRef,      setMeetingRef]      = useState('');
  const [meetingMapsUrl,  setMeetingMapsUrl]  = useState('');

  // Step 3
  const [duracao,            setDuracao]            = useState('');
  const [valorPorPessoa,     setValorPorPessoa]     = useState('');
  const [minimoTripulantes,  setMinimoTripulantes]  = useState(1);

  // Step 4
  const [bebidas,       setBebidas]       = useState<'inclusas' | 'nao_inclusas' | 'traga'>('nao_inclusas');
  const [comida,        setComida]        = useState<'inclusa' | 'nao_inclusa'>('nao_inclusa');
  const [bar,           setBar]           = useState<'tem' | 'nao_tem'>('nao_tem');
  const [schedule,      setSchedule]      = useState<ScheduleEntry[]>([{ id: uid(), date: today(), time_slots: [], spots: boat.capacity }]);
  const [expandedEntry, setExpandedEntry] = useState<string | null>(schedule[0].id);

  // Step 5
  const [descricao, setDescricao] = useState('');

  // ── Helpers ──────────────────────────────────────────────────────────────

  const scrollTop = () => bodyRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  const showErr   = (msg: string) => { setFormError(msg); scrollTop(); };
  const goTo      = (n: TabN) => { setFormError(null); setTab(n); scrollTop(); };
  const markDone  = (n: number) => setDoneTabs(prev => new Set([...prev, n]));
  const fmt       = (d: string) => { if (!d) return '—'; const [y, m, dd] = d.split('-'); return `${dd}/${m}/${y}`; };

  // ── Agenda helpers ───────────────────────────────────────────────────────

  const addEntry = () => {
    const e: ScheduleEntry = { id: uid(), date: today(), time_slots: [], spots: boat.capacity };
    if (schedule.some(s => s.date === e.date)) {
      setFormError('⚠️ Já existe uma entrada para esta data. Altere a data no campo abaixo.');
    }
    setSchedule(p => [...p, e]);
    setExpandedEntry(e.id);
  };

  const removeEntry = (id: string) => {
    setSchedule(p => p.filter(e => e.id !== id));
    if (expandedEntry === id) setExpandedEntry(null);
  };

  const updateEntry = (id: string, patch: Partial<ScheduleEntry>) => {
    if (patch.date) {
      const dup = schedule.some(e => e.id !== id && e.date === patch.date);
      if (dup) { setFormError(`⚠️ Já existe uma entrada para ${fmt(patch.date)}. Escolha outra data.`); return; }
      setFormError(null);
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

  // ── Validações ────────────────────────────────────────────────────────────

  const handleNext1 = () => {
    if (!cityInput.trim()) { showErr('⚠️ Informe a cidade de origem.'); return; }
    markDone(1); goTo(2);
  };

  const handleNext2 = () => {
    if (!marinaSaida.trim())   { showErr('⚠️ Informe a marina de saída.'); return; }
    if (!marinaChegada.trim()) { showErr('⚠️ Informe a marina de chegada.'); return; }
    if (!meetingPoint.trim())  { showErr('⚠️ Informe o ponto de encontro.'); return; }
    markDone(2); goTo(3);
  };

  const handleNext3 = () => {
    if (!duracao)                                           { showErr('⚠️ Selecione a duração.'); return; }
    if (!valorPorPessoa || parseFloat(valorPorPessoa) <= 0) { showErr('⚠️ Informe o valor por pessoa.'); return; }
    markDone(3); goTo(4);
  };

  const handleNext4 = () => {
    if (schedule.some(e => e.time_slots.length === 0)) { showErr('⚠️ Selecione pelo menos um horário em cada data.'); return; }
    markDone(4); goTo(5);
  };

  // ── Geolocalização ────────────────────────────────────────────────────────

  const handleGeolocate = () => {
    if (!navigator.geolocation) return;
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const { latitude, longitude } = pos.coords;
        const res  = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=pt`);
        const data = await res.json();
        const addr = data.address || {};
        setCityInput(addr.city || addr.town || addr.village || addr.municipality || '');
        const cc    = (addr.country_code || '').toUpperCase();
        const found = COUNTRIES.find(c => c.code === cc);
        if (found) {
          setSelectedCountry(found);
          setSelectedState('');
          if (STATES[found.code]) {
            const stateName  = addr.state || '';
            const stateMatch = STATES[found.code].find(s =>
              stateName.toLowerCase().includes(s.name.toLowerCase()) || s.name.toLowerCase().includes(stateName.toLowerCase())
            );
            if (stateMatch) setSelectedState(stateMatch.code);
          }
        }
        if (!meetingMapsUrl) setMeetingMapsUrl(`https://maps.google.com/?q=${latitude},${longitude}`);
      } catch {}
      finally { setGeoLoading(false); }
    }, () => setGeoLoading(false));
  };

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setLoading(true);
    try {
      const stateObj = (STATES[selectedCountry.code] || []).find(s => s.code === selectedState);
      const trip = await saveTrip({
        boat_id:           boat.id,
        sailor_id:         sailorId   || '',
        sailor_name:       sailorName || '',
        boat_name:         boat.name,
        boat_type:         boat.type,
        capacity:          boat.capacity,
        marina_saida:      marinaSaida,
        marina_chegada:    marinaChegada,
        duracao,
        valor_por_pessoa:  parseFloat(valorPorPessoa),
        descricao:         descricao || '',
        status:            'active',
        cover_photo:       '',
        photos:            [],
        schedule:          schedule.map(({ id: _id, ...rest }) => rest),
        country_code:      selectedCountry.code,
        country_name:      selectedCountry.name,
        country_flag:      selectedCountry.flag,
        currency:          selectedCountry.currency,
        currency_symbol:   selectedCountry.symbol,
        currency_locale:   selectedCountry.locale,
        state_code:        selectedState,
        state_name:        stateObj?.name || '',
        city:              cityInput.trim(),
        minimo_tripulantes: minimoTripulantes,
        bebidas, comida, bar,
        meeting_point:     meetingPoint.trim(),
        meeting_sector:    meetingSector.trim(),
        meeting_gate:      meetingGate.trim(),
        meeting_ref:       meetingRef.trim(),
        meeting_maps_url:  meetingMapsUrl.trim(),
      } as any);
      setSavedTripId(trip.id);
      setShowPhotos(true);
    } catch (err: any) {
      showErr('Erro ao publicar: ' + (err?.message || 'Erro desconhecido'));
    } finally {
      setLoading(false);
    }
  };

  const buildResult = () => {
    const saved    = getTrips().find(t => t.id === savedTripId);
    const stateObj = (STATES[selectedCountry.code] || []).find(s => s.code === selectedState);
    return {
      id: savedTripId, boat_id: boat.id, boat_name: boat.name, boat_type: boat.type,
      capacity: boat.capacity, marina_saida: marinaSaida, marina_chegada: marinaChegada,
      duracao, valor_por_pessoa: parseFloat(valorPorPessoa), descricao: descricao || null,
      cover_photo: saved?.cover_photo || saved?.photos?.[0] || tripCover || '',
      photos: saved?.photos || [],
      schedule: schedule.map(({ id: _id, ...rest }) => rest),
      country_code: selectedCountry.code, country_name: selectedCountry.name,
      country_flag: selectedCountry.flag, currency: selectedCountry.currency,
      currency_symbol: selectedCountry.symbol, currency_locale: selectedCountry.locale,
      state_code: selectedState, state_name: stateObj?.name || '', city: cityInput.trim(),
      minimo_tripulantes: minimoTripulantes, bebidas, comida, bar,
      meeting_point: meetingPoint.trim(), meeting_sector: meetingSector.trim(),
      meeting_gate: meetingGate.trim(), meeting_ref: meetingRef.trim(),
      meeting_maps_url: meetingMapsUrl.trim(),
      status: 'active', created_at: new Date().toISOString(),
    };
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-blue-900/60 backdrop-blur-md">
      <div className="bg-white w-full max-w-lg max-h-[90vh] flex flex-col rounded-[40px] shadow-2xl border-4 border-blue-900 animate-in zoom-in-95 duration-300">

        {/* Header fixo */}
        <div className="flex-shrink-0 bg-blue-900 px-8 pt-6 pb-5 rounded-t-[36px]">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-black text-white uppercase italic">Criar Passeio</h2>
              <p className="text-blue-300 text-xs font-bold uppercase tracking-widest mt-0.5 flex items-center gap-2">
                <Anchor className="w-3 h-3" /> {boat.name} · {boat.capacity} pessoas
              </p>
            </div>
            <button onClick={onClose} className="bg-blue-800 hover:bg-blue-700 text-white p-3 rounded-full transition-all flex-shrink-0">
              <X className="w-5 h-5" />
            </button>
          </div>
          {!showPhotos && <Stepper current={tab} done={doneTabs} />}
          {!showPhotos && (
            <p className="text-white/70 font-black text-xs uppercase italic tracking-wide mt-1">
              {TABS[tab - 1].label} · Passo {tab} de {TABS.length}
            </p>
          )}
        </div>

        {/* Body com scroll */}
        <div ref={bodyRef} className="flex-1 overflow-y-auto">

          {/* Fotos — após publicar */}
          {showPhotos && savedTripId && (
            <div className="p-8 space-y-6 animate-in fade-in duration-300">
              <div className="bg-green-50 border-2 border-green-200 rounded-[25px] p-5 flex items-center gap-4">
                <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                <div>
                  <p className="font-black text-green-800 uppercase">Passeio publicado!</p>
                  <p className="text-green-600 text-xs font-bold mt-0.5">Adicione fotos para atrair mais clientes.</p>
                </div>
              </div>
              <PhotoAlbumManager
                entityId={savedTripId} entityType="trips"
                initialPhotos={[]} initialCover=""
                onUpdate={(photos, cover) => {
                  setTripCover(cover);
                  if (savedTripId) updateTrip(savedTripId, { photos, cover_photo: cover || photos[0] || '' });
                }}
              />
              <button onClick={() => onSuccess(buildResult())}
                className="w-full bg-blue-900 text-white py-5 rounded-[30px] font-black uppercase tracking-widest text-base hover:bg-blue-800 shadow-xl transition-all flex items-center justify-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-400" /> Concluir
              </button>
              <button onClick={() => onSuccess(buildResult())}
                className="w-full text-center text-gray-400 font-bold text-xs hover:text-gray-600 transition-colors">
                Pular por agora
              </button>
            </div>
          )}

          {!showPhotos && (
            <div className="p-8 space-y-6">
              {/* Erro */}
              {formError && (
                <div className="bg-red-50 border-2 border-red-200 rounded-[18px] px-5 py-3 flex items-center gap-3 animate-in fade-in duration-200">
                  <span>⚠️</span><p className="text-red-700 font-bold text-sm">{formError}</p>
                </div>
              )}

              {/* Embarcação — sempre visível */}
              <div className="bg-blue-50 border-2 border-blue-100 rounded-[25px] p-5 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] font-black text-blue-400 uppercase">Embarcação</p>
                  <p className="font-black text-blue-900 uppercase italic">{boat.name}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-blue-400 uppercase flex items-center gap-1">
                    <Users className="w-3 h-3" /> Capacidade
                  </p>
                  <p className="font-black text-blue-900">{boat.capacity} pessoas</p>
                </div>
              </div>

              {tab === 1 && (
                <Step1Localizacao
                  selectedCountry={selectedCountry} selectedState={selectedState}
                  cityInput={cityInput} geoLoading={geoLoading}
                  onCountryChange={setSelectedCountry} onStateChange={setSelectedState}
                  onCityChange={setCityInput} onGeolocate={handleGeolocate} onNext={handleNext1}
                />
              )}
              {tab === 2 && (
                <Step2Rota
                  marinaSaida={marinaSaida} marinaChegada={marinaChegada}
                  meetingPoint={meetingPoint} meetingSector={meetingSector}
                  meetingGate={meetingGate} meetingRef={meetingRef} meetingMapsUrl={meetingMapsUrl}
                  onMarinaChange={(f, v) => f === 'marinaSaida' ? setMarinaSaida(v) : setMarinaChegada(v)}
                  onMeetingChange={(f, v) => {
                    if (f === 'meetingPoint')   setMeetingPoint(v);
                    if (f === 'meetingSector')  setMeetingSector(v);
                    if (f === 'meetingGate')    setMeetingGate(v);
                    if (f === 'meetingRef')     setMeetingRef(v);
                    if (f === 'meetingMapsUrl') setMeetingMapsUrl(v);
                  }}
                  onBack={() => goTo(1)} onNext={handleNext2}
                />
              )}
              {tab === 3 && (
                <Step3Valor
                  boat={boat} selectedCountry={selectedCountry}
                  duracao={duracao} valorPorPessoa={valorPorPessoa} minimoTripulantes={minimoTripulantes}
                  onDuracaoChange={setDuracao} onValorChange={setValorPorPessoa} onMinimoChange={setMinimoTripulantes}
                  onBack={() => goTo(2)} onNext={handleNext3}
                />
              )}
              {tab === 4 && (
                <Step4Agenda
                  boat={boat} duracao={duracao}
                  bebidas={bebidas} comida={comida} bar={bar}
                  schedule={schedule} expandedEntry={expandedEntry}
                  onBebidasChange={setBebidas} onComidaChange={setComida} onBarChange={setBar}
                  onAddEntry={addEntry} onRemoveEntry={removeEntry}
                  onUpdateEntry={updateEntry} onToggleSlot={toggleSlot}
                  onExpandEntry={setExpandedEntry}
                  onBack={() => goTo(3)} onNext={handleNext4}
                />
              )}
              {tab === 5 && (
                <Step5Descricao
                  selectedCountry={selectedCountry} selectedState={selectedState} cityInput={cityInput}
                  marinaSaida={marinaSaida} marinaChegada={marinaChegada} meetingPoint={meetingPoint}
                  duracao={duracao} valorPorPessoa={valorPorPessoa} minimoTripulantes={minimoTripulantes}
                  bebidas={bebidas} schedule={schedule} descricao={descricao} loading={loading}
                  onDescricaoChange={setDescricao} onBack={() => goTo(4)} onSubmit={handleSubmit}
                />
              )}
            </div>
          )}
        </div>

        {/* Pills de progresso — rodapé */}
        {!showPhotos && (
          <div className="flex-shrink-0 bg-blue-900/5 border-t-2 border-gray-100 py-3 flex items-center justify-center gap-2">
            {TABS.map(t => (
              <div key={t.n} className={`h-1.5 rounded-full transition-all duration-300
                ${t.n === tab ? 'w-8 bg-blue-900' : doneTabs.has(t.n) ? 'w-4 bg-blue-300' : 'w-4 bg-gray-200'}`} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}