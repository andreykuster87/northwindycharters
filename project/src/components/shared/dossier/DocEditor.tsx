// src/components/shared/dossier/DocEditor.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Edição inline de um documento de licenciamento da embarcação.
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from 'react';
import { X, Check, Lock, Upload, RefreshCw } from 'lucide-react';
import { DocImage } from '../adminHelpers';
import { valBadge, canEditDoc } from './DossierBoatHelpers';

export interface DocDef {
  key:      string;
  label:    string;
  nrKey:    string;
  valKey:   string;
  hasBack?: boolean;
}

export const DOC_DEFS: DocDef[] = [
  { key: 'licNav',  label: 'Licença de Navegação',           nrKey: 'licNavNr',  valKey: 'licNavVal'  },
  { key: 'certNav', label: 'Cert. de Navegabilidade',        nrKey: 'certNavNr', valKey: 'certNavVal' },
  { key: 'seguro',  label: 'Seguro de Resp. Civil',          nrKey: 'seguroNr',  valKey: 'seguroVal'  },
  { key: 'licPass', label: 'Lic. Transporte de Passageiros', nrKey: 'licPassNr', valKey: 'licPassVal' },
];

interface Props {
  docDef:   DocDef;
  meta:     any;
  verified: boolean;
  onSave:   (patch: any) => void;
}

export function DocEditor({ docDef, meta, verified, onSave }: Props) {
  const { key, label, nrKey, valKey } = docDef;
  const docData = (meta.docs || {})[key] || {};
  const nr  = meta[nrKey]  || '';
  const val = meta[valKey] || '';
  const badge    = valBadge(val);
  const editable = canEditDoc(verified, val);

  const [editing,   setEditing]   = useState(false);
  const [editNr,    setEditNr]    = useState(nr);
  const [editVal,   setEditVal]   = useState(val);
  const [editFront, setEditFront] = useState(docData.front || '');
  const [editBack,  setEditBack]  = useState(docData.back  || '');

  const pickPhoto = (setter: (v: string) => void) => {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = 'image/*';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = e => setter((e.target?.result as string) || '');
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const handleSave = () => {
    onSave({ [nrKey]: editNr, [valKey]: editVal, docs: { ...meta.docs, [key]: { front: editFront, back: editBack } } });
    setEditing(false);
  };

  const hasData  = nr || val || docData.front;
  const daysLeft = (() => { try { if (!val) return null; const d = val.includes('/') ? (() => { const [dd,mm,yy]=val.split('/'); return new Date(+yy,+mm-1,+dd,23,59,59); })() : new Date(val+'T23:59:59'); return Math.floor((d.getTime()-Date.now())/86400000); } catch { return null; } })();

  return (
    <div className={`border-2 overflow-hidden transition-all ${
      !hasData ? 'border-dashed border-[#c9a96e]/20 bg-[#c9a96e]/5' :
      daysLeft !== null && daysLeft < 0 ? 'border-red-200 bg-red-50' :
      daysLeft !== null && daysLeft <= 30 ? 'border-orange-200 bg-orange-50' :
      'border-gray-100 bg-gray-50'}`}>

      {/* Cabeçalho */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-[#1a2b4a] uppercase">{label}</p>
          {nr && <p className="text-[10px] font-bold text-gray-500 mt-0.5">Nº {nr}</p>}
          {badge && <span className={`inline-block mt-1 text-[9px] font-bold px-2 py-0.5 rounded-full border ${badge.cls}`}>{badge.label}</span>}
          {!hasData && <span className="inline-block mt-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#c9a96e]/15 text-[#1a2b4a]">⚠ Documento em falta</span>}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          {!editable && verified && (
            <span title="Bloqueado — só editável 15 dias antes do vencimento">
              <Lock className="w-3.5 h-3.5 text-gray-300" />
            </span>
          )}
          {editable && !editing && (
            <button type="button"
              onClick={() => { setEditing(true); setEditNr(nr); setEditVal(val); setEditFront(docData.front||''); setEditBack(docData.back||''); }}
              className="bg-[#0a1628] text-white px-3 py-1.5 text-[10px] font-bold uppercase flex items-center gap-1 hover:bg-[#1a2b4a] transition-all">
              {hasData ? <><RefreshCw className="w-3 h-3" /> Atualizar</> : <><Upload className="w-3 h-3" /> Inserir</>}
            </button>
          )}
          {editing && (
            <>
              <button type="button" onClick={handleSave}
                className="bg-green-600 text-white px-3 py-1.5 text-[10px] font-bold uppercase flex items-center gap-1 hover:bg-green-500 transition-all">
                <Check className="w-3 h-3" /> Guardar
              </button>
              <button type="button" onClick={() => setEditing(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Fotos existentes (modo leitura) */}
      {!editing && docData.front && (
        <div className={`px-4 pb-3 grid ${docData.back ? 'grid-cols-2' : 'grid-cols-1'} gap-2`}>
          <DocImage url={docData.front} label="Frente"
            allImages={[docData.front, docData.back].filter(Boolean)}
            allLabels={['Frente', 'Verso']} />
          {docData.back && <DocImage url={docData.back} label="Verso"
            allImages={[docData.front, docData.back].filter(Boolean)}
            allLabels={['Frente', 'Verso']} />}
        </div>
      )}

      {/* Formulário de edição */}
      {editing && (
        <div className="px-4 pb-4 space-y-3 border-t-2 border-white/60 pt-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[9px] font-bold text-gray-500 uppercase block mb-1">Nº Documento</label>
              <input value={editNr} onChange={e => setEditNr(e.target.value.toUpperCase())} placeholder="Nº"
                className="w-full bg-white border-2 border-gray-200 py-2 px-3 text-xs font-bold text-[#1a2b4a] focus:border-[#c9a96e] outline-none uppercase" />
            </div>
            <div>
              <label className="text-[9px] font-bold text-gray-500 uppercase block mb-1">Validade</label>
              <input type="date" value={editVal} onChange={e => setEditVal(e.target.value)}
                className="w-full bg-white border-2 border-gray-200 py-2 px-3 text-xs font-bold text-[#1a2b4a] focus:border-[#c9a96e] outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {(['Frente', 'Verso'] as const).map((side, si) => {
              const url    = si === 0 ? editFront : editBack;
              const setUrl = si === 0 ? setEditFront : setEditBack;
              return (
                <div key={side}>
                  <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">{side}</p>
                  {url ? (
                    <div className="relative">
                      <img src={url} className="w-full h-20 object-cover border-2 border-[#0a1628]" alt={side} />
                      <button type="button" onClick={() => setUrl('')}
                        className="absolute top-1 right-1 bg-red-500 text-white w-5 h-5 flex items-center justify-center text-xs font-bold">×</button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => pickPhoto(setUrl)}
                      className="w-full h-20 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 hover:border-[#c9a96e] hover:bg-[#0a1628]/5 transition-all">
                      <Upload className="w-4 h-4 text-gray-300" />
                      <span className="text-[9px] font-bold text-gray-300 uppercase">Upload</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
