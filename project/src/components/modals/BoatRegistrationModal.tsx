// src/components/modals/BoatRegistrationModal.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Orquestrador do registo de embarcação — 5 steps.
// Estado global aqui; toda a UI nos componentes Step*.
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from 'react';
import { X, Ship } from 'lucide-react';
import { saveBoat, updateBoat } from '../../lib/localStore';

// Steps
import { BoatStep1Embarcacao }   from './boat/steps/BoatStep1Embarcacao';
import { BoatStep2Proprietario } from './boat/steps/BoatStep2Proprietario';
import { BoatStep3Licenciamento } from './boat/steps/BoatStep3Licenciamento';
import { BoatStep4Operacional }  from './boat/steps/BoatStep4Operacional';
import { BoatStep5Fotos }        from './boat/steps/BoatStep5Fotos';
import type { BoatForm }         from './boat/steps/BoatStep1Embarcacao';
import type { CrewEntry }        from './boat/shared/BoatCrewSearch';

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  onClose: () => void;
  onSuccess: (boat: any) => void;
  sailorId?: string;
}

// ── Estado inicial do formulário ──────────────────────────────────────────────

const EMPTY_FORM: BoatForm = {
  nome: '', matricula: '', porto: '', portoOutro: '', bandeira: '', tipo: '',
  anoConstr: '', material: '', comprimento: '', boca: '', calado: '',
  proprietario: '', nif: '', morada: '', propDdi: '+351', propTelefone: '', email: '',
  registoNr: '', registoVal: '', registoEntidade: '',
  licNavNr: '', licNavVal: '', certNavNr: '', certNavVal: '',
  seguroNr: '', seguradora: '', seguroVal: '',
  licPassNr: '', licPassVal: '',
  comandanteNome: '', comandanteCert: '', comandanteVal: '',
  capPassageiros: '', nrTripulantes: '', areaOperacao: '',
  tipoAtividade: [], tipoAtividadeOutro: '',
  nrColetes: '', balsaSalvavidas: '', balsaUltimaInsp: '',
  extintores: '', extintoresInsp: '',
  radioVHF: '', primeirosSocorros: '', sinaisSocorro: '', sinaisVal: '',
  ultimaInsp: '', proximaInsp: '', historicoManu: '',
};

const STEPS_META = [
  { label: 'Identificação', sub: 'Dados da embarcação' },
  { label: 'Propriedade',   sub: 'Dados do proprietário' },
  { label: 'Licenciamento', sub: 'Certificados e seguros' },
  { label: 'Operacional',   sub: 'Capacidade e segurança' },
  { label: 'Fotos',         sub: 'Imagens da embarcação' },
];

// ── Componente ────────────────────────────────────────────────────────────────

export function BoatRegistrationModal({ onClose, onSuccess, sailorId }: Props) {
  const [step,      setStep]      = useState<1|2|3|4|5>(1);
  const [loading,   setLoading]   = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [savedBoatId, setSavedBoatId] = useState<string | null>(null);
  const [declaracao,  setDeclaracao]  = useState(false);

  // Fotos embarcação
  const [photoCover,    setPhotoCover]    = useState('');
  const [photoExterior, setPhotoExterior] = useState('');
  const [photoInterior, setPhotoInterior] = useState('');
  const [photosExtra,   setPhotosExtra]   = useState<string[]>([]);

  // Docs licenciamento
  const [docLicNav,  setDocLicNav]  = useState({ front: '', back: '' });
  const [docCertNav, setDocCertNav] = useState({ front: '', back: '' });
  const [docSeguro,  setDocSeguro]  = useState({ front: '', back: '' });
  const [docLicPass, setDocLicPass] = useState({ front: '', back: '' });

  // Doc proprietário
  const [propDocType,  setPropDocType]  = useState('');
  const [propDocNr,    setPropDocNr]    = useState('');
  const [propDocFront, setPropDocFront] = useState('');
  const [propDocBack,  setPropDocBack]  = useState('');

  // Tripulação
  const [crew, setCrew] = useState<CrewEntry[]>([]);

  // Formulário principal
  const [f, setF] = useState<BoatForm>(EMPTY_FORM);
  const fd = (k: string, v: string) => setF(p => ({
  ...p,
  [k]: k === 'tipoAtividade' ? (Array.isArray(v) ? v : v.split('||').filter(Boolean)) : v,
} as any));

  // ── Navegação ────────────────────────────────────────────────────────────
  const validate = (s: number): string | null => {
    if (s === 1) {
      if (!f.nome.trim())      return '⚠️ Nome é obrigatório.';
      if (!f.matricula.trim()) return '⚠️ Matrícula é obrigatória.';
      if (!f.tipo)             return '⚠️ Tipo de embarcação é obrigatório.';
    }
    if (s === 2 && !f.proprietario.trim()) return '⚠️ Nome do proprietário é obrigatório.';
    if (s === 4) {
      if (!f.capPassageiros || parseInt(f.capPassageiros) < 1) return '⚠️ Capacidade é obrigatória.';
      if (!declaracao) return '⚠️ Aceite a declaração para continuar.';
    }
    return null;
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate(step);
    if (err) { setFormError(err); return; }
    setFormError(null);
    setStep(s => (s + 1) as any);
  };

  const handleBack = () => { setFormError(null); setStep(s => (s - 1) as any); };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate(4);
    if (err) { setFormError(err); return; }
    setLoading(true); setFormError(null);
    try {
      const all = [photoCover, photoExterior, photoInterior, ...photosExtra].filter(Boolean);

      const metadata = JSON.stringify({
  ...f, propDocType, propDocNr,
  propDoc: { front: propDocFront, back: propDocBack },
  docs: { licNav: docLicNav, certNav: docCertNav, seguro: docSeguro, licPass: docLicPass },
  crew,
  registoNr:       f.registoNr,
  registoVal:      f.registoVal,
  registoEntidade: f.registoEntidade,
});
      const boat = await saveBoat({
        sailor_id: sailorId || '', name: f.nome.trim(), type: f.tipo,
        capacity: parseInt(f.capPassageiros) || 0,
        bie_number: f.matricula.trim(), imo_number: f.licNavNr.trim(),
        matricula: f.matricula.trim(),
        porto: f.porto === 'Outro' ? (f.portoOutro.trim() || 'Outro') : f.porto,
        bandeira: f.bandeira, material: f.material, comprimento: f.comprimento,
        ano_construcao: f.anoConstr, proprietario: f.proprietario, nif: f.nif,
        area_operacao: f.areaOperacao,
        tipo_atividade: [...f.tipoAtividade, f.tipoAtividadeOutro].filter(Boolean).join(', '),
        comandante: f.comandanteNome,
        description: [f.bandeira && `Bandeira: ${f.bandeira}`, f.material && `Casco: ${f.material}`].filter(Boolean).join(' · '),
        cover_photo: photoCover || photoExterior || all[0] || '',
        photos: all, status: 'pending', metadata,
      } as any);
      setSavedBoatId(boat.id);
      setStep(5);
    } catch (err: any) {
      if (err.name === 'QuotaExceededError' || err.message?.includes('quota')) {
        setFormError('⚠️ Armazenamento do browser cheio. Reduza o tamanho das fotos ou limpe dados antigos.');
      } else {
        setFormError(`Erro: ${err.message}`);
      }
    } finally { setLoading(false); }
  };

  // ── Persistir fotos após submit ───────────────────────────────────────────
  const persistPhotos = async (cover: string, ext: string, int_: string, extra: string[]) => {
    if (!savedBoatId) return;
    const all = [cover, ext, int_, ...extra].filter(Boolean);
    try {
      await updateBoat(savedBoatId, {
        photos: all,
        cover_photo: cover || ext || all[0] || '',
      } as any);
    } catch (err) {
      console.error('Erro ao guardar fotos:', err);
    }
  };

  const buildResult = () => {
    const all = [photoCover, photoExterior, photoInterior, ...photosExtra].filter(Boolean);
    return { id: savedBoatId, name: f.nome.trim(), type: f.tipo, capacity: parseInt(f.capPassageiros) || 0, cover_photo: photoCover || all[0] || '', photos: all };
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-blue-900/50 backdrop-blur-md">
      <div className="bg-white w-full max-w-xl max-h-[92vh] flex flex-col rounded-[32px] shadow-2xl border-4 border-blue-900 animate-in zoom-in-95 duration-300 overflow-hidden">

        {/* Header */}
        <div className="bg-blue-900 px-6 py-5 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Ship className="w-5 h-5 text-white" />
              <span className="text-white font-black uppercase text-sm tracking-widest">Cadastro de Embarcação</span>
            </div>
            <button onClick={onClose} className="bg-blue-800 hover:bg-blue-700 text-white p-2 rounded-full transition-all">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex gap-1.5 mb-3">
            {STEPS_META.map((_, i) => (
              <div key={i} className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${i + 1 <= step ? 'bg-white' : 'bg-blue-700'}`} />
            ))}
          </div>
          <p className="text-white font-black uppercase text-lg italic">{STEPS_META[step - 1].label}</p>
          <p className="text-blue-300 text-xs font-bold uppercase tracking-widest">{STEPS_META[step - 1].sub}</p>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5">
          {formError && (
            <div className="mb-4 bg-red-50 border-2 border-red-200 rounded-2xl px-4 py-3 flex items-center gap-2">
              <span className="text-red-500 text-sm flex-shrink-0">⚠️</span>
              <p className="text-red-700 font-bold text-sm">{formError}</p>
            </div>
          )}

          {step === 1 && <BoatStep1Embarcacao f={f} fd={fd} onNext={handleNext} />}

          {step === 2 && (
            <BoatStep2Proprietario
              f={f} fd={fd}
              propDocType={propDocType} setPropDocType={setPropDocType}
              propDocNr={propDocNr}    setPropDocNr={setPropDocNr}
              propDocFront={propDocFront} setPropDocFront={setPropDocFront}
              propDocBack={propDocBack}   setPropDocBack={setPropDocBack}
              onBack={handleBack} onNext={handleNext}
            />
          )}

          {step === 3 && (
            <BoatStep3Licenciamento
              f={f} fd={fd}
              docLicNav={docLicNav}   setDocLicNav={setDocLicNav}
              docCertNav={docCertNav} setDocCertNav={setDocCertNav}
              docSeguro={docSeguro}   setDocSeguro={setDocSeguro}
              docLicPass={docLicPass} setDocLicPass={setDocLicPass}
              crew={crew} setCrew={setCrew}
              onBack={handleBack} onNext={handleNext}
            />
          )}

          {step === 4 && (
            <BoatStep4Operacional
              f={f} fd={fd}
              declaracao={declaracao} setDeclaracao={setDeclaracao}
              loading={loading}
              onBack={handleBack} onSubmit={handleSubmit}
            />
          )}

          {step === 5 && savedBoatId && (
            <BoatStep5Fotos
              boatId={savedBoatId}
              photoCover={photoCover}       setPhotoCover={setPhotoCover}
              photoExterior={photoExterior} setPhotoExterior={setPhotoExterior}
              photoInterior={photoInterior} setPhotoInterior={setPhotoInterior}
              photosExtra={photosExtra}     setPhotosExtra={setPhotosExtra}
              onPersist={persistPhotos}
              onConclude={() => onSuccess(buildResult())}
            />
          )}
        </div>
      </div>
    </div>
  );
}