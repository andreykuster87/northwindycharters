// src/components/modals/boat/steps/BoatStep1Embarcacao.tsx
import { ChevronRight } from 'lucide-react';
import { ScrollSelect, BoatInput } from '../shared/BoatFormWidgets';

const BANDEIRAS = ['Portugal','Brasil','Espanha','França','Itália','Reino Unido','Alemanha','Holanda','Grécia','Malta','Chipre','Panamá','Bahamas','Ilhas Cayman','Ilhas Marshall','Estados Unidos','Outra'];
const TIPOS_EMBARCACAO = ['Veleiro','Lancha','Catamarã','Iate a Motor','Escuna','Barco Pneumático','Traineira','Rebocador','Semi-rígido','Outro'];
const MATERIAIS = ['Fibra de vidro (GRP)','Aço inoxidável','Alumínio','Madeira tratada','Madeira de teca','Carbono','Ferro','Outro'];

const PORTOS_POR_PAIS: Record<string, string[]> = {
  'Portugal':       ['Lisboa','Porto','Setúbal','Cascais','Sesimbra','Sines','Faro','Portimão','Lagos','Tavira','Olhão','Vila Real de Sto. António','Aveiro','Viana do Castelo','Funchal','Ponta Delgada','Angra do Heroísmo','Horta','Outro'],
  'Brasil':         ['Rio de Janeiro','Santos','Salvador','Manaus','Fortaleza','Recife','Belém','Vitória','Florianópolis','Porto Alegre','Angra dos Reis','Ilhabela','Paraty','Búzios','Porto Belo','Outro'],
  'Espanha':        ['Barcelona','Valencia','Palma de Mallorca','Alicante','Málaga','Las Palmas','Cartagena','Bilbau','Vigo','Cádiz','Santander','La Coruña','Outro'],
  'França':         ['Marselha','Nice','Toulon','Bordéus','Saint-Malo','Cannes','Antibes','La Rochelle','Brest','Outro'],
  'Itália':         ['Génova','Nápoles','Palermo','Veneza','Ancona','Trieste','Livorno','Bari','Cagliari','Outro'],
  'Reino Unido':    ['Londres','Southampton','Liverpool','Portsmouth','Plymouth','Bristol','Aberdeen','Dover','Outro'],
  'Alemanha':       ['Hamburgo','Bremen','Rostock','Kiel','Lübeck','Outro'],
  'Holanda':        ['Amesterdão','Roterdão','Haia','Outro'],
  'Grécia':         ['Pireu','Tessalônica','Pátras','Heraclião','Rodes','Outro'],
  'Malta':          ['Valetta','Marsaxlokk','Outro'],
  'Chipre':         ['Limassol','Larnaca','Outro'],
  'Panamá':         ['Cidade do Panamá','Colón','Outro'],
  'Bahamas':        ['Nassau','Freeport','Outro'],
  'Ilhas Cayman':   ['George Town','Outro'],
  'Ilhas Marshall': ['Majuro','Outro'],
  'Estados Unidos': ['Miami','Nova Iorque','Los Angeles','Seattle','Houston','Fort Lauderdale','San Francisco','Outro'],
  'Outra':          ['Outro'],
};

export interface BoatForm {
  nome: string; matricula: string; porto: string; portoOutro: string; bandeira: string;
  tipo: string; anoConstr: string; material: string; comprimento: string; boca: string; calado: string;
  proprietario: string; nif: string; morada: string; propDdi: string; propTelefone: string; email: string;
  registoNr: string; registoVal: string; registoEntidade: string;
  licNavNr: string; licNavVal: string; certNavNr: string; certNavVal: string;
  seguroNr: string; seguradora: string; seguroVal: string;
  licPassNr: string; licPassVal: string;
  comandanteNome: string; comandanteCert: string; comandanteVal: string;
  capPassageiros: string; nrTripulantes: string; areaOperacao: string;
  tipoAtividade: string[]; tipoAtividadeOutro: string;
  nrColetes: string; balsaSalvavidas: string; balsaUltimaInsp: string;
  extintores: string; extintoresInsp: string;
  radioVHF: string; primeirosSocorros: string; sinaisSocorro: string; sinaisVal: string;
  ultimaInsp: string; proximaInsp: string; historicoManu: string;
}

interface Props {
  f: BoatForm;
  fd: (k: string, v: string) => void;
  onNext: (e: React.FormEvent) => void;
}

export function BoatStep1Embarcacao({ f, fd, onNext }: Props) {
  return (
    <form onSubmit={onNext} className="space-y-4">
      <BoatInput label="Nome da embarcação" value={f.nome} onChange={v => fd('nome', v)} required placeholder="EX: ESTRELA DO MAR" />
      <BoatInput label="Número de registo / matrícula" value={f.matricula} onChange={v => fd('matricula', v)} required placeholder="EX: PT-LX-1234-A" />
      <ScrollSelect label="Bandeira / País de Registo" options={BANDEIRAS} value={f.bandeira}
        onChange={v => { fd('bandeira', v); fd('porto', ''); }}
        required placeholder="SELECIONAR BANDEIRA..." />
      {f.bandeira && (
        <>
          <ScrollSelect label="Porto de Abrigo" options={PORTOS_POR_PAIS[f.bandeira] || ['Outro']} value={f.porto}
            onChange={v => { fd('porto', v); if (v !== 'Outro') fd('portoOutro', ''); }}
            placeholder="SELECIONAR PORTO..." />
          {f.porto === 'Outro' && (
            <BoatInput label="Especifique o Porto" value={f.portoOutro || ''} onChange={v => fd('portoOutro', v)}
              placeholder="NOME DO PORTO DE ABRIGO..." />
          )}
        </>
      )}
      <ScrollSelect label="Tipo de embarcação" options={TIPOS_EMBARCACAO} value={f.tipo} onChange={v => fd('tipo', v)} required />
      <div className="grid grid-cols-2 gap-3">
        <BoatInput label="Ano de construção" value={f.anoConstr} onChange={v => fd('anoConstr', v)} type="number" placeholder="EX: 2010" />
        <ScrollSelect label="Material do casco" options={MATERIAIS} value={f.material} onChange={v => fd('material', v)} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <BoatInput label="Comprimento (m)" value={f.comprimento} onChange={v => fd('comprimento', v)} type="number" placeholder="12.5" />
        <BoatInput label="Boca (m)" value={f.boca} onChange={v => fd('boca', v)} type="number" placeholder="3.8" />
        <BoatInput label="Calado (m)" value={f.calado} onChange={v => fd('calado', v)} type="number" placeholder="1.8" />
      </div>
      <button type="submit" className="w-full bg-blue-900 text-white py-4 rounded-2xl font-black uppercase text-sm hover:bg-blue-800 transition-all flex items-center justify-center gap-2">
        Próximo <ChevronRight className="w-4 h-4" />
      </button>
    </form>
  );
}