// src/components/CreateTripModal/steps/Step2Rota.tsx
import { Navigation, MapPin, Map, Info } from 'lucide-react';

interface Props {
  marinaSaida:     string;
  marinaChegada:   string;
  meetingPoint:    string;
  meetingSector:   string;
  meetingGate:     string;
  meetingRef:      string;
  meetingMapsUrl:  string;
  onMarinaChange:  (field: 'marinaSaida' | 'marinaChegada', value: string) => void;
  onMeetingChange: (field: string, value: string) => void;
  onBack:          () => void;
  onNext:          () => void;
}

export function Step2Rota({
  marinaSaida, marinaChegada, meetingPoint, meetingSector,
  meetingGate, meetingRef, meetingMapsUrl,
  onMarinaChange, onMeetingChange, onBack, onNext,
}: Props) {
  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">

      {/* Rota */}
      <div className="space-y-3">
        <p className="text-xs font-black text-blue-900 uppercase flex items-center gap-2">
          <Navigation className="w-3.5 h-3.5" /> Rota do Passeio
        </p>
        <div className="relative">
          <div className="absolute left-5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white shadow" />
          <input placeholder="Marina de saída" value={marinaSaida}
            onChange={e => onMarinaChange('marinaSaida', e.target.value)}
            className="w-full bg-gray-50 border-2 border-gray-100 rounded-[18px] py-4 pl-10 pr-6 font-black text-blue-900 focus:border-green-500 outline-none transition-all uppercase italic placeholder:normal-case placeholder:not-italic placeholder:text-gray-300 text-sm" />
          <p className="text-[10px] font-bold text-gray-400 uppercase ml-2 mt-1">Ponto de partida</p>
        </div>
        <div className="flex items-center gap-3 px-5">
          <div className="w-0.5 h-6 bg-gray-200 ml-1" />
          <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">trajeto</p>
        </div>
        <div className="relative">
          <div className="absolute left-5 top-1/2 -translate-y-1/2">
            <MapPin className="w-3.5 h-3.5 text-red-500" />
          </div>
          <input placeholder="Marina de chegada" value={marinaChegada}
            onChange={e => onMarinaChange('marinaChegada', e.target.value)}
            className="w-full bg-gray-50 border-2 border-gray-100 rounded-[18px] py-4 pl-10 pr-6 font-black text-blue-900 focus:border-red-400 outline-none transition-all uppercase italic placeholder:normal-case placeholder:not-italic placeholder:text-gray-300 text-sm" />
          <p className="text-[10px] font-bold text-gray-400 uppercase ml-2 mt-1">Ponto de chegada</p>
        </div>
      </div>

      <div className="border-t-2 border-dashed border-gray-100" />

      {/* Ponto de encontro */}
      <div className="space-y-3">
        <p className="text-xs font-black text-blue-900 uppercase flex items-center gap-2">
          <Map className="w-3.5 h-3.5 text-blue-400" /> Ponto de Encontro
        </p>
        <div className="bg-blue-50 border-2 border-blue-100 rounded-[20px] px-4 py-3 flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs font-bold text-blue-600">
            Informe onde os passageiros devem se apresentar. Aparecerá na confirmação de cada reserva.
          </p>
        </div>
        <div>
          <label className="text-[10px] font-black text-blue-900 uppercase tracking-wider ml-1 mb-1.5 block">
            Local de Encontro *
          </label>
          <input value={meetingPoint} onChange={e => onMeetingChange('meetingPoint', e.target.value)}
            placeholder="Ex: Marina da Glória, Cais 3, Porto de Cascais..."
            className="w-full bg-gray-50 border-2 border-gray-100 rounded-[18px] py-4 px-5 font-bold text-blue-900 focus:border-blue-900 outline-none transition-all text-sm placeholder:text-gray-300" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-black text-blue-900 uppercase tracking-wider ml-1 mb-1.5 block">Setor / Área</label>
            <input value={meetingSector} onChange={e => onMeetingChange('meetingSector', e.target.value)}
              placeholder="Ex: Setor A..."
              className="w-full bg-gray-50 border-2 border-gray-100 rounded-[18px] py-4 px-5 font-bold text-blue-900 focus:border-blue-900 outline-none transition-all text-sm placeholder:text-gray-300" />
          </div>
          <div>
            <label className="text-[10px] font-black text-blue-900 uppercase tracking-wider ml-1 mb-1.5 block">Portão / Acesso</label>
            <input value={meetingGate} onChange={e => onMeetingChange('meetingGate', e.target.value)}
              placeholder="Ex: Portão 7..."
              className="w-full bg-gray-50 border-2 border-gray-100 rounded-[18px] py-4 px-5 font-bold text-blue-900 focus:border-blue-900 outline-none transition-all text-sm placeholder:text-gray-300" />
          </div>
        </div>
        <div>
          <label className="text-[10px] font-black text-blue-900 uppercase tracking-wider ml-1 mb-1.5 block">Ponto de Referência</label>
          <input value={meetingRef} onChange={e => onMeetingChange('meetingRef', e.target.value)}
            placeholder="Ex: Próximo ao bar..."
            className="w-full bg-gray-50 border-2 border-gray-100 rounded-[18px] py-4 px-5 font-bold text-blue-900 focus:border-blue-900 outline-none transition-all text-sm placeholder:text-gray-300" />
        </div>
        <div>
          <label className="text-[10px] font-black text-blue-900 uppercase tracking-wider ml-1 mb-1.5 block">Link Google Maps</label>
          <div className="relative">
            <input value={meetingMapsUrl} onChange={e => onMeetingChange('meetingMapsUrl', e.target.value)}
              placeholder="https://maps.google.com/?q=..."
              className="w-full bg-gray-50 border-2 border-gray-100 rounded-[18px] py-4 px-5 pr-24 font-bold text-blue-900 focus:border-blue-900 outline-none transition-all text-sm placeholder:text-gray-300" />
            {meetingMapsUrl && (
              <a href={meetingMapsUrl} target="_blank" rel="noreferrer"
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-900 text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-full hover:bg-blue-800 transition-all">
                Ver ↗
              </a>
            )}
          </div>
        </div>

        {/* Preview */}
        {meetingPoint && (
          <div className="bg-white border-2 border-blue-200 rounded-[18px] px-5 py-4 space-y-2">
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">📍 Preview — como aparecerá na reserva</p>
            <p className="font-black text-blue-900 text-sm">{meetingPoint}</p>
            {(meetingSector || meetingGate) && (
              <p className="text-xs text-gray-500 font-bold">{[meetingSector, meetingGate].filter(Boolean).join(' · ')}</p>
            )}
            {meetingRef && <p className="text-xs text-gray-400 font-bold italic">{meetingRef}</p>}
            {meetingMapsUrl && (
              <a href={meetingMapsUrl} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200 hover:bg-blue-100 transition-all mt-1">
                <Map className="w-3 h-3" /> Ver no Google Maps ↗
              </a>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onBack}
          className="px-6 py-5 border-2 border-gray-100 text-gray-400 rounded-[30px] font-black text-sm uppercase hover:border-blue-900 hover:text-blue-900 transition-all">
          ← Voltar
        </button>
        <button type="button" onClick={onNext}
          className="flex-1 bg-blue-900 text-white py-5 rounded-[30px] font-black uppercase tracking-widest text-sm hover:bg-blue-800 shadow-xl transition-all">
          Próximo → Duração & Valor
        </button>
      </div>
    </div>
  );
}