// src/components/modals/boat/steps/BoatStep5Fotos.tsx
import { CheckCircle2 } from 'lucide-react';
import { PhotoAlbumInline, PhotoSlot, PhotoChecklist, pickPhoto } from '../../../shared/BoatRegPhotoAlbum';

interface Props {
  boatId: string;
  photoCover: string;    setPhotoCover: (v: string) => void;
  photoExterior: string; setPhotoExterior: (v: string) => void;
  photoInterior: string; setPhotoInterior: (v: string) => void;
  photosExtra: string[]; setPhotosExtra: (v: string[]) => void;
  onPersist: (cover: string, ext: string, int_: string, extra: string[]) => void;
  onConclude: () => void;
}

export function BoatStep5Fotos({ photoCover, setPhotoCover, photoExterior, setPhotoExterior, photoInterior, setPhotoInterior, photosExtra, setPhotosExtra, onPersist, onConclude }: Props) {
  return (
    <div className="space-y-5">
      <div className="bg-green-50 border border-green-200 p-4 flex items-center gap-3">
        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
        <div>
          <p className="font-bold text-green-800 text-sm uppercase">Embarcação registada!</p>
          <p className="text-green-600 text-xs font-bold mt-0.5">A aguardar aprovação. Adicione as fotos.</p>
        </div>
      </div>

      <PhotoChecklist cover={photoCover} exterior={photoExterior} interior={photoInterior} extra={photosExtra} />

      <PhotoSlot label="📸 Foto de Capa" sublabel="Imagem principal" value={photoCover}
        onPick={async () => { const u = await pickPhoto(); if (u) { setPhotoCover(u); onPersist(u, photoExterior, photoInterior, photosExtra); } }}
        onRemove={() => { setPhotoCover(''); onPersist('', photoExterior, photoInterior, photosExtra); }} />

      <PhotoSlot label="⛵ Exterior" sublabel="Vista exterior / lateral" value={photoExterior}
        onPick={async () => { const u = await pickPhoto(); if (u) { setPhotoExterior(u); onPersist(photoCover, u, photoInterior, photosExtra); } }}
        onRemove={() => { setPhotoExterior(''); onPersist(photoCover, '', photoInterior, photosExtra); }} />

      <PhotoSlot label="🛋️ Interior" sublabel="Cabine ou salão" value={photoInterior}
        onPick={async () => { const u = await pickPhoto(); if (u) { setPhotoInterior(u); onPersist(photoCover, photoExterior, u, photosExtra); } }}
        onRemove={() => { setPhotoInterior(''); onPersist(photoCover, photoExterior, '', photosExtra); }} />

      <PhotoAlbumInline
        photos={photosExtra}
        onAdd={async () => {
          const u = await pickPhoto();
          if (u) { const next = [...photosExtra, u]; setPhotosExtra(next); onPersist(photoCover, photoExterior, photoInterior, next); }
        }}
        onRemove={i => {
          const next = photosExtra.filter((_, idx) => idx !== i);
          setPhotosExtra(next); onPersist(photoCover, photoExterior, photoInterior, next);
        }}
      />

      <button onClick={onConclude}
        className="w-full bg-[#0a1628] text-white py-4 font-semibold uppercase text-sm hover:bg-[#0a1628]/90 transition-all flex items-center justify-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-green-400" /> Concluir
      </button>
      <button onClick={onConclude} className="w-full text-center text-gray-400 font-bold text-xs hover:text-gray-600 transition-colors">
        Pular fotos por agora
      </button>
    </div>
  );
}
