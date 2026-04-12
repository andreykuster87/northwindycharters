// src/types/catalog.ts
// ─────────────────────────────────────────────────────────────────────────────
// Fonte única de verdade para o tipo CatalogBoat e tipos auxiliares.
// Todos os componentes devem importar daqui — nunca redefinir localmente.
// ─────────────────────────────────────────────────────────────────────────────

export interface ScheduleEntry {
  date:       string;
  time_slots: string[];
  spots:      number;
}

export interface CatalogBoat {
  id:               string;
  name:             string;
  photo_url:        string;
  photos:           string[];
  capacity:         number;
  price_per_hour:   number;
  marina_location:  string;
  duracao?:         string;
  descricao?:       string;
  boat_type?:       string;

  // Localização
  country_code?:    string;
  country_flag?:    string;
  country_name?:    string;
  state_code?:      string;
  state_name?:      string;
  city?:            string;
  marina_saida?:    string;

  // Moeda
  currency?:        string;
  currency_symbol?: string;
  currency_locale?: string;

  // Extras da viagem
  minimo_tripulantes?: number;
  length_ft?:          number;
  bebidas?: 'inclusas' | 'nao_inclusas' | 'traga';
  comida?:  'inclusa'  | 'nao_inclusa';
  bar?:     'tem'      | 'nao_tem';

  // Ponto de encontro (preenchido pelo Sailor)
  meeting_point?:    string;
  meeting_sector?:   string;
  meeting_gate?:     string;
  meeting_ref?:      string;
  meeting_maps_url?: string;

  // Agenda de datas/horários
  schedule?: ScheduleEntry[];

  sailor: {
    name:      string;
    verified:  boolean;
    phone?:    string;
  };
}