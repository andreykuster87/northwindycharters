// src/components/CreateTripModal/steps/Step1Localizacao.tsx
import { MapPin, ChevronDown } from 'lucide-react';
import { COUNTRIES, STATES, type Country } from '../../../constants/constants';
import { CountryDropdown } from '../../shared/CountryDropdown';

interface Props {
  selectedCountry: Country;
  selectedState:   string;
  cityInput:       string;
  geoLoading:      boolean;
  onCountryChange: (c: Country) => void;
  onStateChange:   (s: string) => void;
  onCityChange:    (c: string) => void;
  onGeolocate:     () => void;
  onNext:          () => void;
}

export function Step1Localizacao({
  selectedCountry, selectedState, cityInput, geoLoading,
  onCountryChange, onStateChange, onCityChange, onGeolocate, onNext,
}: Props) {
  const statesForCountry = STATES[selectedCountry.code] || [];

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center justify-between">
        <p className="text-xs font-black text-blue-900 uppercase flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-blue-400" /> Localização de Origem
        </p>
        <button type="button" onClick={onGeolocate} disabled={geoLoading}
          className="flex items-center gap-1.5 text-[10px] font-black uppercase text-blue-400 hover:text-blue-900 border border-blue-200 hover:border-blue-900 px-3 py-1.5 rounded-full transition-all disabled:opacity-50">
          {geoLoading ? '⏳ Detectando...' : '📍 Usar minha localização'}
        </button>
      </div>

      <div>
        <label className="text-[10px] font-black text-blue-900 uppercase tracking-wider ml-1 mb-1.5 block">País *</label>
        <CountryDropdown value={selectedCountry.code} onChange={c => { onCountryChange(c); onStateChange(''); }} />
      </div>

      {statesForCountry.length > 0 && (
        <div>
          <label className="text-[10px] font-black text-blue-900 uppercase tracking-wider ml-1 mb-1.5 block">Estado / Região</label>
          <div className="relative">
            <select value={selectedState} onChange={e => onStateChange(e.target.value)}
              className="w-full bg-gray-50 border-2 border-gray-100 rounded-[18px] py-4 px-5 font-bold text-blue-900 focus:border-blue-900 outline-none transition-all text-sm appearance-none">
              <option value="">Selecione o estado...</option>
              {statesForCountry.map(s => <option key={s.code} value={s.code}>{s.name}</option>)}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      )}

      <div>
        <label className="text-[10px] font-black text-blue-900 uppercase tracking-wider ml-1 mb-1.5 block">Cidade *</label>
        <input value={cityInput} onChange={e => onCityChange(e.target.value)}
          placeholder="Ex: Búzios, Florianópolis..."
          className="w-full bg-gray-50 border-2 border-gray-100 rounded-[18px] py-4 px-5 font-black text-blue-900 focus:border-blue-900 outline-none transition-all uppercase italic placeholder:normal-case placeholder:not-italic placeholder:text-gray-300 text-sm" />
      </div>

      <button type="button" onClick={onNext}
        className="w-full bg-blue-900 text-white py-5 rounded-[30px] font-black uppercase tracking-widest text-sm hover:bg-blue-800 shadow-xl transition-all mt-2">
        Próximo → Rota & Encontro
      </button>
    </div>
  );
}