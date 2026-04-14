// src/components/modals/boat/steps/BoatStep3Licenciamento.tsx
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { BoatInput, DateInput, DocPhotoSlot, SectionTitle, pickDocCompressed } from '../shared/BoatFormWidgets';
import type { BoatForm } from './BoatStep1Embarcacao';

interface DocPair { front: string; back: string; }

interface Props {
  f: BoatForm; fd: (k: string, v: string) => void;
  docLicNav: DocPair; setDocLicNav: (v: DocPair) => void;
  docCertNav: DocPair; setDocCertNav: (v: DocPair) => void;
  docSeguro: DocPair; setDocSeguro: (v: DocPair) => void;
  docLicPass: DocPair; setDocLicPass: (v: DocPair) => void;
  onBack: () => void; onNext: (e: React.FormEvent) => void;
}

export function BoatStep3Licenciamento({ f, fd, docLicNav, setDocLicNav, docCertNav, setDocCertNav, docSeguro, setDocSeguro, docLicPass, setDocLicPass, onBack, onNext }: Props) {
  const pick = async (setter: (v: DocPair) => void, prev: DocPair, side: 'front' | 'back') => {
    const url = await pickDocCompressed();
    if (url) setter({ ...prev, [side]: url });
  };

  return (
    <form onSubmit={onNext} className="space-y-4">
      <SectionTitle number="3" title="Licenciamento e Certificação" />

      {/* Registo da embarcação */}
      <div className="bg-[#0a1628]/5 border border-[#c9a96e]/20 p-4 space-y-3">
        <p className="text-xs font-semibold text-[#c9a96e] uppercase tracking-[0.15em]">⚓ Registo da Embarcação</p>
        <div className="grid grid-cols-2 gap-3">
          <BoatInput label="Nº de registo" value={f.registoNr} onChange={v => fd('registoNr', v)} placeholder="EX: 12345/2020" />
          <DateInput label="Validade" value={f.registoVal} onChange={v => fd('registoVal', v)} />
        </div>
        <BoatInput label="Entidade registadora" value={f.registoEntidade} onChange={v => fd('registoEntidade', v)} placeholder="EX: INSTITUTO PORTUÁRIO E DOS TRANSPORTES MARÍTIMOS" />
      </div>

      {/* Licença de navegação */}
      <div className="grid grid-cols-2 gap-3">
        <BoatInput label="Licença de navegação nº" value={f.licNavNr} onChange={v => fd('licNavNr', v)} placeholder="Nº" />
        <DateInput label="Validade" value={f.licNavVal} onChange={v => fd('licNavVal', v)} />
      </div>
      <div className="bg-gray-50 p-3 grid grid-cols-2 gap-2">
        <DocPhotoSlot label="Frente" value={docLicNav.front} onPick={() => pick(setDocLicNav, docLicNav, 'front')} onRemove={() => setDocLicNav({ ...docLicNav, front: '' })} />
        <DocPhotoSlot label="Verso"  value={docLicNav.back}  onPick={() => pick(setDocLicNav, docLicNav, 'back')}  onRemove={() => setDocLicNav({ ...docLicNav, back: '' })} />
      </div>

      {/* Certificado de navegabilidade */}
      <div className="grid grid-cols-2 gap-3">
        <BoatInput label="Cert. navegabilidade nº" value={f.certNavNr} onChange={v => fd('certNavNr', v)} placeholder="Nº" />
        <DateInput label="Validade" value={f.certNavVal} onChange={v => fd('certNavVal', v)} />
      </div>
      <div className="bg-gray-50 p-3 grid grid-cols-2 gap-2">
        <DocPhotoSlot label="Frente" value={docCertNav.front} onPick={() => pick(setDocCertNav, docCertNav, 'front')} onRemove={() => setDocCertNav({ ...docCertNav, front: '' })} />
        <DocPhotoSlot label="Verso"  value={docCertNav.back}  onPick={() => pick(setDocCertNav, docCertNav, 'back')}  onRemove={() => setDocCertNav({ ...docCertNav, back: '' })} />
      </div>

      {/* Seguro */}
      <div className="grid grid-cols-2 gap-3">
        <BoatInput label="Seguro resp. civil nº" value={f.seguroNr} onChange={v => fd('seguroNr', v)} placeholder="Nº APÓLICE" />
        <BoatInput label="Seguradora" value={f.seguradora} onChange={v => fd('seguradora', v)} placeholder="NOME" />
      </div>
      <DateInput label="Validade do seguro" value={f.seguroVal} onChange={v => fd('seguroVal', v)} />
      <div className="bg-gray-50 p-3">
        <DocPhotoSlot label="Apólice de seguro" value={docSeguro.front} onPick={() => pick(setDocSeguro, docSeguro, 'front')} onRemove={() => setDocSeguro({ ...docSeguro, front: '' })} />
      </div>

      {/* Licença transporte passageiros */}
      <div className="grid grid-cols-2 gap-3">
        <BoatInput label="Lic. transporte pass. nº" value={f.licPassNr} onChange={v => fd('licPassNr', v)} placeholder="Nº" />
        <DateInput label="Validade" value={f.licPassVal} onChange={v => fd('licPassVal', v)} />
      </div>
      <div className="bg-gray-50 p-3 grid grid-cols-2 gap-2">
        <DocPhotoSlot label="Frente" value={docLicPass.front} onPick={() => pick(setDocLicPass, docLicPass, 'front')} onRemove={() => setDocLicPass({ ...docLicPass, front: '' })} />
        <DocPhotoSlot label="Verso"  value={docLicPass.back}  onPick={() => pick(setDocLicPass, docLicPass, 'back')}  onRemove={() => setDocLicPass({ ...docLicPass, back: '' })} />
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onBack} className="px-5 py-4 border border-gray-200 text-gray-400 font-semibold text-sm uppercase hover:border-[#0a1628] hover:text-[#1a2b4a] transition-all flex items-center gap-1">
          <ChevronLeft className="w-4 h-4" /> Voltar
        </button>
        <button type="submit" className="flex-1 bg-[#0a1628] text-white py-4 font-semibold uppercase text-sm hover:bg-[#0a1628]/90 transition-all flex items-center justify-center gap-2">
          Próximo <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}
