// src/components/shared/dossier/DossierBoatHelpers.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Helpers, tipos e sub-componentes reutilizados no DossierBoat.
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from 'react';
import { Camera } from 'lucide-react';
import type { Boat, Sailor } from '../../../lib/localStore';
import { DocImage, LightboxViewer } from '../adminHelpers';

// ── Verificação de completude ─────────────────────────────────────────────────

export function isBoatComplete(boat: Boat): { ok: boolean; missing: string[] } {
  const missing: string[] = [];
  let meta: any = {};
  try { meta = JSON.parse((boat as any).metadata || '{}'); } catch {}
  const docs = meta.docs || {};

  if (!boat.cover_photo)                  missing.push('Foto de capa');
  if ((boat.photos || []).length < 2)     missing.push('Mínimo 2 fotos da embarcação');
  if (!docs.licNav?.front && !meta.licNavNr) missing.push('Licença de Navegação');
  if (!docs.seguro?.front && !meta.seguroNr) missing.push('Seguro de Responsabilidade Civil');
  if (!((boat as any).proprietario || meta.proprietario)) missing.push('Nome do Proprietário');
  if (!(meta.email || (boat as any).email)) missing.push('Email do Proprietário');
  if (!boat.capacity || boat.capacity < 1) missing.push('Capacidade de passageiros');

  return { ok: missing.length === 0, missing };
}

// ── Helpers de validade ───────────────────────────────────────────────────────

export function diffDays(valStr?: string): number | null {
  if (!valStr) return null;
  try {
    const dt = valStr.includes('/')
      ? (() => { const [d, m, y] = valStr.split('/'); return new Date(+y, +m - 1, +d, 23, 59, 59); })()
      : new Date(valStr + 'T23:59:59');
    return Math.floor((dt.getTime() - Date.now()) / 86400000);
  } catch { return null; }
}

export function valBadge(val?: string) {
  const d = diffDays(val);
  if (d === null) return null;
  if (d < 0)    return { label: `Vencido há ${Math.abs(d)}d`, cls: 'bg-red-100 text-red-700 border-red-200' };
  if (d <= 30)  return { label: `Vence em ${d}d ⚠`, cls: 'bg-amber-100 text-amber-700 border-amber-200' };
  return { label: `Válido — ${d}d restantes`, cls: 'bg-green-100 text-green-700 border-green-200' };
}

export function canEditDoc(verified: boolean, val?: string): boolean {
  if (!verified) return true;
  const d = diffDays(val);
  if (d === null) return true;
  return d <= 15;
}

export function getBoatStatus(boat: Boat): 'active' | 'attention' | 'expired' | 'pending' | 'incomplete' {
  if (boat.status === 'pending') return 'pending';
  const { ok } = isBoatComplete(boat);
  if (!ok) return 'incomplete';
  let meta: any = {};
  try { meta = JSON.parse((boat as any).metadata || '{}'); } catch {}
  const vals = [meta.licNavVal, meta.certNavVal, meta.seguroVal, meta.licPassVal, meta.comandanteVal, meta.sinaisVal];
  const days = vals.map(diffDays).filter((d): d is number => d !== null);
  if (days.some(d => d < 0))   return 'expired';
  if (days.some(d => d <= 30)) return 'attention';
  return 'active';
}

export const fmtDate = (d?: string) => {
  if (!d) return '—';
  try { return new Date(d + 'T12:00').toLocaleDateString('pt-BR'); } catch { return d; }
};

// ── StatusBadge ───────────────────────────────────────────────────────────────

export function StatusBadge({ boat }: { boat: Boat }) {
  const st = getBoatStatus(boat);
  const map = {
    pending:    { cls: 'bg-yellow-400 text-yellow-900', label: '⏳ Pendente' },
    incomplete: { cls: 'bg-amber-400 text-amber-900',   label: '⚠ Docs Pendentes' },
    expired:    { cls: 'bg-red-500 text-white',          label: '🔴 Doc. Vencido' },
    attention:  { cls: 'bg-orange-400 text-orange-900', label: '⚠ Atenção — Validade Próxima' },
    active:     { cls: 'bg-green-400 text-green-900',   label: '● Ativa' },
  };
  const { cls, label } = map[st];
  return <span className={`${cls} text-[9px] font-bold uppercase px-2 py-0.5 rounded-full`}>{label}</span>;
}

// ── Section & Field ───────────────────────────────────────────────────────────

export const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <div className="flex items-center gap-2 mb-3">
      <div className="h-px flex-1 bg-[#0a1628]/5" />
      <span className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em] px-2">{title}</span>
      <div className="h-px flex-1 bg-[#0a1628]/5" />
    </div>
    {children}
  </div>
);

export const Field = ({ label, value }: { label: string; value?: string | number }) => (
  value !== undefined && value !== '' && value !== null ? (
    <div className="bg-gray-50 p-2.5">
      <p className="text-[9px] font-bold text-gray-400 uppercase">{label}</p>
      <p className="font-bold text-[#1a2b4a] text-xs mt-0.5 break-words">{String(value) || '—'}</p>
    </div>
  ) : null
);

// ── PhotoGallery ──────────────────────────────────────────────────────────────

export function PhotoGallery({ photos, cover }: { photos: string[]; cover: string }) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  if (!photos.length) return (
    <div className="bg-gray-50 py-8 flex flex-col items-center gap-2">
      <Camera className="w-6 h-6 text-gray-300" />
      <p className="text-xs text-gray-400 font-bold">Sem fotos</p>
    </div>
  );

  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        {photos.map((p, i) => (
          <div key={i} onClick={() => setLightboxIdx(i)}
            className={`relative aspect-square overflow-hidden cursor-zoom-in border-2 transition-all hover:border-[#c9a96e] group
              ${p === cover ? 'border-[#0a1628]' : 'border-gray-100'}`}>
            <img src={p} alt={`foto ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            {p === cover && (
              <div className="absolute bottom-0 left-0 right-0 bg-[#0a1628]/80 py-0.5 text-center">
                <span className="text-[8px] font-bold text-white uppercase">Capa</span>
              </div>
            )}
          </div>
        ))}
      </div>
      {lightboxIdx !== null && (
        <LightboxViewer
          images={photos}
          labels={photos.map((p, i) => p === cover ? 'Capa' : `Foto ${i + 1}`)}
          startIndex={lightboxIdx}
          onClose={() => setLightboxIdx(null)}
        />
      )}
    </>
  );
}

// ── SailorMiniCard ────────────────────────────────────────────────────────────

export function SailorMiniCard({ sailor, onClick }: { sailor: Sailor & Record<string, any>; onClick?: () => void }) {
  const profilePhoto = sailor.profile_photo || '';

  const STCW_CERTS = ['Segurança Básica', 'Técnicas de Sobrevivência', 'Combate a Incêndios', 'Primeiros Socorros'];
  const stcwList = STCW_CERTS.filter(c => sailor.stcw?.[c]);

  const expiryColor = (val?: string) => {
    if (!val) return 'text-gray-400';
    const parts = val.includes('/') ? val.split('/') : val.split('-');
    const date = val.includes('/')
      ? new Date(+parts[2], +parts[1] - 1, +parts[0])
      : new Date(val + 'T12:00');
    const diff = (date.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    if (diff < 0)  return 'text-red-600';
    if (diff < 60) return 'text-amber-600';
    return 'text-green-600';
  };

  return (
    <div onClick={onClick}
      className={`bg-gradient-to-br from-[#0a1628] to-[#1a2b4a] overflow-hidden transition-all ${onClick ? 'cursor-pointer hover:from-[#1a2b4a] hover:to-[#0a1628] hover:shadow-lg' : ''}`}>
      <div className="px-4 py-4 flex items-center gap-3">
        <div className="w-12 h-12 rounded-full overflow-hidden bg-[#0a1628]/60 flex-shrink-0 border-2 border-[#c9a96e]/30">
          {profilePhoto
            ? <img src={profilePhoto} alt={sailor.name} className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center font-bold text-white text-base">
                {sailor.name.substring(0, 2).toUpperCase()}
              </div>}
        </div>
        <div>
          <p className="font-bold text-white text-sm font-['Playfair_Display']">{sailor.name}</p>
          <p className="text-[#c9a96e] text-xs font-bold">{sailor.email}</p>
          <p className="text-[#c9a96e] text-xs font-bold">{sailor.phone}</p>
        </div>
      </div>
      <div className="px-4 pb-4 grid grid-cols-3 gap-2">
        {[
          { label: 'Passaporte', val: sailor.passaporte?.validade },
          { label: 'Habilitação', val: sailor.cartahabitacao?.validade },
          { label: 'Médico', val: sailor.medico?.validade },
        ].map(({ label, val }) => (
          <div key={label} className="bg-[#0a1628]/40 px-2 py-2 text-center">
            <p className="text-[8px] font-semibold text-[#c9a96e] uppercase mb-1">{label}</p>
            <p className={`text-[10px] font-bold ${expiryColor(val)}`}>{val || '—'}</p>
          </div>
        ))}
      </div>
      {stcwList.length > 0 && (
        <div className="px-4 pb-4 flex flex-wrap gap-1">
          {stcwList.map(c => (
            <span key={c} className="bg-[#0a1628]/40 text-[#c9a96e] text-[9px] font-bold px-2 py-0.5 rounded-full border border-[#c9a96e]/30">
              ✓ {c}
            </span>
          ))}
        </div>
      )}
      {onClick && (
        <div className="px-4 pb-3 border-t border-[#c9a96e]/20 pt-2 text-center">
          <span className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em]">Ver dossiê completo →</span>
        </div>
      )}
    </div>
  );
}
