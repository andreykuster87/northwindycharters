// src/components/pages/SailorProfileView.tsx
// Perfil público read-only de um tripulante — design NorthWindy.
// Dados sensíveis omitidos (email, telefone, NIF, nº de documento).
// isOwner=true habilita aba de documentos com todos os docs + botão "Incluir".
import { useState, useRef } from 'react';
import {
  ArrowLeft, Waves, User, FileText, Briefcase,
  MapPin, Globe, Image as ImageIcon, ChevronRight,
  CheckCircle2, AlertTriangle, XCircle, Clock,
  Award, Languages, Anchor, CalendarDays, PlusCircle, Upload, X, Eye, RefreshCw,
} from 'lucide-react';
import { uploadDoc } from '../../lib/storage';
import { updateSailor, getSailors, type Sailor } from '../../lib/localStore';
import { STCW_CERTS } from '../../constants/sailorConstants';

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(d?: string): string {
  if (!d) return '—';
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(d)) return d;
  const parsed = new Date(d + 'T12:00');
  return isNaN(parsed.getTime()) ? d : parsed.toLocaleDateString('pt-PT');
}

type DocStatus = 'valid' | 'expiring' | 'expired' | 'unknown' | 'missing' | 'pending';

function docStatus(validade?: string): DocStatus {
  if (!validade) return 'unknown';
  const raw = /^\d{2}\/\d{2}\/\d{4}$/.test(validade)
    ? validade.split('/').reverse().join('-')
    : validade;
  const exp = new Date(raw + 'T12:00');
  if (isNaN(exp.getTime())) return 'unknown';
  const now  = new Date();
  const days = Math.floor((exp.getTime() - now.getTime()) / 86_400_000);
  if (days < 0)   return 'expired';
  if (days < 60)  return 'expiring';
  return 'valid';
}

const STATUS_CFG: Record<DocStatus, { label: string; icon: React.ElementType; cls: string }> = {
  valid:    { label: 'Válido',       icon: CheckCircle2,  cls: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  expiring: { label: 'A expirar',   icon: AlertTriangle, cls: 'text-amber-600  bg-amber-50  border-amber-200'  },
  expired:  { label: 'Expirado',    icon: XCircle,       cls: 'text-red-600    bg-red-50    border-red-200'    },
  unknown:  { label: 'Sem data',    icon: Clock,         cls: 'text-gray-400   bg-gray-50   border-gray-200'   },
  missing:  { label: 'Não possui',  icon: XCircle,       cls: 'text-gray-400   bg-gray-50   border-gray-300'   },
  pending:  { label: 'Em revisão',  icon: Clock,         cls: 'text-amber-600  bg-amber-50  border-amber-200'  },
};

// ── Sub-componentes ───────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em] mb-3 flex items-center gap-1.5">
      {children}
    </p>
  );
}

function canRenew(validade?: string): boolean {
  if (!validade) return true; // sem data = pode renovar
  const raw = /^\d{2}\/\d{2}\/\d{4}$/.test(validade)
    ? validade.split('/').reverse().join('-')
    : validade;
  const exp = new Date(raw + 'T12:00');
  if (isNaN(exp.getTime())) return true;
  const days = Math.floor((exp.getTime() - new Date().getTime()) / 86_400_000);
  return days <= 15; // pode renovar se faltam ≤15 dias ou já expirou
}

interface DocCardProps {
  label:      string;
  validade?:  string;
  status?:    DocStatus;
  docUrl?:    string | null;
  isOwner?:   boolean;
  onClick?:   () => void;
}

function DocCard({ label, validade, status: forcedStatus, docUrl, isOwner, onClick }: DocCardProps) {
  const st  = forcedStatus ?? docStatus(validade);
  const cfg = STATUS_CFG[st];
  const Icon = cfg.icon;
  const clickable = isOwner && !!docUrl;
  return (
    <div
      onClick={clickable ? onClick : undefined}
      className={`bg-white border-2 border-[#0a1628]/5 p-4 flex items-start gap-3 transition-all ${
        clickable ? 'cursor-pointer hover:border-[#c9a96e]/40 hover:shadow-sm' : 'hover:border-[#c9a96e]/20'
      }`}
    >
      <div className="w-9 h-9 bg-[#0a1628]/5 flex items-center justify-center flex-shrink-0 mt-0.5">
        <FileText className="w-4 h-4 text-[#c9a96e]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-[#1a2b4a] text-sm uppercase leading-tight">{label}</p>
        <p className="text-[10px] font-semibold text-gray-400 mt-0.5">
          Validade: {fmtDate(validade)}
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {clickable && (
          <span className="flex items-center gap-1 text-[9px] font-bold uppercase px-2 py-1 border border-[#0a1628]/20 bg-[#0a1628]/5 text-[#1a2b4a]">
            <Eye className="w-3 h-3" /> Ver
          </span>
        )}
        <span className={`flex items-center gap-1 text-[9px] font-bold uppercase px-2 py-1 border ${cfg.cls}`}>
          <Icon className="w-3 h-3" />
          {cfg.label}
        </span>
      </div>
    </div>
  );
}

// ── DocViewerModal ─────────────────────────────────────────────────────────────

interface DocViewerModalProps {
  label:    string;
  docKey:   string;
  docUrl:   string;
  validade?: string;
  isOwner?: boolean;
  onClose:  () => void;
  onRenew:  () => void;
}

function DocViewerModal({ label, docKey: _docKey, docUrl, validade, isOwner, onClose, onRenew }: DocViewerModalProps) {
  const isPdf = docUrl.toLowerCase().includes('.pdf') || docUrl.toLowerCase().includes('application/pdf');
  const renewable = isOwner && canRenew(validade);
  const daysUntilExpiry = (() => {
    if (!validade) return null;
    const raw = /^\d{2}\/\d{2}\/\d{4}$/.test(validade)
      ? validade.split('/').reverse().join('-')
      : validade;
    const exp = new Date(raw + 'T12:00');
    if (isNaN(exp.getTime())) return null;
    return Math.floor((exp.getTime() - new Date().getTime()) / 86_400_000);
  })();

  return (
    <div
      className="fixed inset-0 z-[400] flex items-center justify-center p-4"
      style={{ background: 'rgba(4,10,24,0.92)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-2xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#0a1628] px-6 py-5 flex items-center justify-between relative overflow-hidden flex-shrink-0">
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: 'repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 0,transparent 60px),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 0,transparent 60px)' }} />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a96e]/40 to-transparent" />
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-9 h-9 bg-[#c9a96e]/10 flex items-center justify-center">
              <FileText className="w-4 h-4 text-[#c9a96e]" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-[#c9a96e]/70 uppercase tracking-[0.15em]">Visualizar Documento</p>
              <h3 className="font-['Playfair_Display'] font-bold italic text-base text-white leading-tight">{label}</h3>
            </div>
          </div>
          <button onClick={onClose}
            className="relative z-10 w-8 h-8 bg-white/5 hover:bg-white/15 flex items-center justify-center transition-all border border-white/10">
            <X className="w-4 h-4 text-white/70" />
          </button>
        </div>

        {/* Info bar */}
        <div className="bg-gray-50 border-b border-gray-100 px-6 py-3 flex items-center gap-4 flex-shrink-0">
          <div>
            <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">Validade</p>
            <p className="text-sm font-bold text-[#1a2b4a]">{fmtDate(validade)}</p>
          </div>
          {validade && (
            <div className="ml-auto">
              {daysUntilExpiry !== null && daysUntilExpiry < 0 && (
                <span className="flex items-center gap-1 text-[9px] font-bold uppercase px-2 py-1 border text-red-600 bg-red-50 border-red-200">
                  <XCircle className="w-3 h-3" /> Expirado há {Math.abs(daysUntilExpiry)} dias
                </span>
              )}
              {daysUntilExpiry !== null && daysUntilExpiry >= 0 && daysUntilExpiry <= 15 && (
                <span className="flex items-center gap-1 text-[9px] font-bold uppercase px-2 py-1 border text-amber-600 bg-amber-50 border-amber-200">
                  <AlertTriangle className="w-3 h-3" /> Expira em {daysUntilExpiry} dias
                </span>
              )}
              {daysUntilExpiry !== null && daysUntilExpiry > 15 && (
                <span className="flex items-center gap-1 text-[9px] font-bold uppercase px-2 py-1 border text-emerald-600 bg-emerald-50 border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" /> Válido — {daysUntilExpiry} dias restantes
                </span>
              )}
            </div>
          )}
        </div>

        {/* Document preview */}
        <div className="flex-1 overflow-auto bg-gray-100 flex items-center justify-center min-h-0" style={{ minHeight: '300px' }}>
          {isPdf ? (
            <iframe
              src={docUrl}
              title={label}
              className="w-full h-full"
              style={{ minHeight: '400px' }}
            />
          ) : (
            <img
              src={docUrl}
              alt={label}
              className="max-w-full max-h-full object-contain p-4"
              style={{ maxHeight: '50vh' }}
            />
          )}
        </div>

        {/* Footer */}
        {isOwner && (
          <div className="border-t border-gray-100 px-6 py-4 flex items-center gap-3 flex-shrink-0 bg-white">
            {renewable ? (
              <button
                onClick={() => { onClose(); onRenew(); }}
                className="flex items-center gap-2 bg-[#0a1628] text-white py-3 px-6 font-semibold uppercase tracking-widest text-xs hover:bg-[#1a2b4a] transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Renovar Documento
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 py-3 px-4 flex-1">
                <Clock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                <p className="text-xs font-semibold text-gray-500">
                  A renovação estará disponível 15 dias antes do vencimento
                  {daysUntilExpiry !== null && daysUntilExpiry > 15 && ` (em ${daysUntilExpiry - 15} dias)`}
                </p>
              </div>
            )}
            <button
              onClick={onClose}
              className="ml-auto border border-gray-200 text-gray-400 py-3 px-5 font-semibold text-xs uppercase hover:border-[#c9a96e] hover:text-[#1a2b4a] transition-all"
            >
              Fechar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── IncluirDocModal ───────────────────────────────────────────────────────────

interface IncluirDocModalProps {
  label:     string;
  docKey:    string;
  sailorId:  string;
  onClose:   () => void;
  onSuccess: () => void;
}

function IncluirDocModal({ label, docKey, sailorId, onClose, onSuccess }: IncluirDocModalProps) {
  const [file,     setFile]     = useState<File | null>(null);
  const [validade, setValidade] = useState('');
  const [numero,   setNumero]   = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleSubmit() {
    if (!file) { setError('Selecione um arquivo.'); return; }
    setLoading(true);
    try {
      const url = await uploadDoc(file, 'sailors', `pending-${sailorId}-${docKey}`);
      if (!url) throw new Error('Falha no upload');

      const sailor = getSailors().find(s => s.id === sailorId);
      const existing = sailor?.pending_docs ?? {};
      await updateSailor(sailorId, {
        pending_docs: {
          ...existing,
          [docKey]: {
            doc_url:      url,
            validade:     validade || undefined,
            numero:       numero   || undefined,
            submitted_at: new Date().toISOString(),
            status:       'pending',
          },
        },
      } as any);
      onSuccess();
    } catch (e: any) {
      setError('Erro ao enviar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4"
      style={{ background: 'rgba(4,10,24,0.88)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}>
      <div className="bg-white w-full max-w-sm shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-[#0a1628] px-6 py-5 flex items-center justify-between relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: 'repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 0,transparent 60px),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 0,transparent 60px)' }} />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a96e]/40 to-transparent" />
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-9 h-9 bg-[#c9a96e]/10 flex items-center justify-center">
              <Upload className="w-4 h-4 text-[#c9a96e]" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-[#c9a96e]/70 uppercase tracking-[0.15em]">Incluir Documento</p>
              <h3 className="font-['Playfair_Display'] font-bold italic text-base text-white leading-tight">{label}</h3>
            </div>
          </div>
          <button onClick={onClose}
            className="relative z-10 w-8 h-8 bg-white/5 hover:bg-white/15 flex items-center justify-center transition-all border border-white/10">
            <X className="w-4 h-4 text-white/70" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* File upload */}
          <div>
            <label className="text-[10px] font-semibold text-[#1a2b4a] uppercase tracking-[0.12em] block mb-1.5">
              Arquivo do documento <span className="text-red-500">*</span>
            </label>
            <div
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed cursor-pointer py-6 flex flex-col items-center gap-2 transition-all ${
                file ? 'border-[#c9a96e]/50 bg-[#c9a96e]/5' : 'border-gray-200 hover:border-[#c9a96e]/40'
              }`}>
              <Upload className="w-6 h-6 text-gray-300" />
              <p className="text-xs font-semibold text-gray-400">
                {file ? file.name : 'Clique para selecionar'}
              </p>
              <p className="text-[10px] text-gray-300">PDF, JPG ou PNG — máx. 4MB</p>
              <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) { setFile(f); setError(''); } }} />
            </div>
          </div>

          {/* Validade */}
          <div>
            <label className="text-[10px] font-semibold text-[#1a2b4a] uppercase tracking-[0.12em] block mb-1.5">
              Validade (opcional)
            </label>
            <input
              type="text" placeholder="DD/MM/AAAA"
              value={validade} onChange={e => setValidade(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 py-3 px-4 font-medium text-[#1a2b4a] focus:border-[#c9a96e] outline-none transition-all text-sm"
            />
          </div>

          {/* Número */}
          <div>
            <label className="text-[10px] font-semibold text-[#1a2b4a] uppercase tracking-[0.12em] block mb-1.5">
              Número do documento (opcional)
            </label>
            <input
              type="text" placeholder="Nº..."
              value={numero} onChange={e => setNumero(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 py-3 px-4 font-medium text-[#1a2b4a] focus:border-[#c9a96e] outline-none transition-all text-sm"
            />
          </div>

          {error && (
            <p className="text-red-600 font-semibold text-xs flex items-center gap-1.5">
              <span>⚠️</span> {error}
            </p>
          )}

          <div className="bg-amber-50 border border-amber-200 px-4 py-3 flex items-start gap-2">
            <span className="text-amber-500 text-sm mt-0.5">ℹ️</span>
            <p className="text-[11px] font-semibold text-amber-700 leading-relaxed">
              O documento será enviado para análise. Após aprovação, ficará visível no seu perfil.
            </p>
          </div>

          <div className="h-px bg-gray-100" />

          <button
            onClick={handleSubmit}
            disabled={loading || !file}
            className="w-full bg-[#0a1628] text-white py-4 px-6 font-semibold uppercase tracking-widest text-sm hover:bg-[#1a2b4a] transition-all disabled:opacity-50">
            {loading ? '⏳ Enviando...' : '📤 Enviar para análise'}
          </button>
          <button
            onClick={onClose}
            className="w-full border border-gray-200 text-gray-400 py-3 px-6 font-semibold text-sm uppercase hover:border-[#c9a96e] hover:text-[#1a2b4a] transition-all">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Tab: Perfil ───────────────────────────────────────────────────────────────

function PerfilTab({ sailor }: { sailor: Sailor }) {
  const profilePhoto = sailor.profile_photo ?? null;
  const album: string[] = (sailor as any).album ?? [];
  const bio = (sailor as any).outras_informacoes as string | undefined;
  const funcao = (sailor as any).funcao === 'Outro'
    ? ((sailor as any).funcao_outro || 'Outro')
    : (sailor as any).funcao;

  return (
    <div className="space-y-6">

      {/* Galeria */}
      {album.length > 0 && (
        <div className="bg-white border-2 border-[#0a1628]/5 p-5">
          <SectionLabel><ImageIcon className="w-3.5 h-3.5" /> Fotos</SectionLabel>
          <div className="grid grid-cols-3 gap-2">
            {album.slice(0, 9).map((url, i) => (
              <div key={i} className="overflow-hidden aspect-square border border-gray-100">
                <img src={url} alt={`Foto ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Biografia */}
      {bio && (
        <div className="bg-white border-2 border-[#0a1628]/5 p-5">
          <SectionLabel>📋 Sobre</SectionLabel>
          <p className="text-sm text-gray-600 font-semibold leading-relaxed">{bio}</p>
        </div>
      )}

      {/* Informações básicas */}
      <div className="bg-white border-2 border-[#0a1628]/5 p-5">
        <SectionLabel><User className="w-3.5 h-3.5" /> Informações</SectionLabel>
        <div className="space-y-3">
          {[
            { icon: Anchor,       label: 'Função',        value: funcao },
            { icon: Globe,        label: 'Nacionalidade', value: sailor.nacionalidade },
            { icon: MapPin,       label: 'Localização',   value: (sailor as any).endereco ? undefined : null },
            { icon: Languages,    label: 'Idioma',        value: sailor.language },
          ].filter(r => r.value).map(r => (
            <div key={r.label} className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#0a1628]/5 flex items-center justify-center flex-shrink-0">
                <r.icon className="w-3.5 h-3.5 text-[#c9a96e]" />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">{r.label}</p>
                <p className="text-sm font-bold text-[#1a2b4a] truncate">{r.value}</p>
              </div>
            </div>
          ))}
          {/* Idiomas extras */}
          {(sailor as any).idiomas?.length > 0 && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-[#0a1628]/5 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Languages className="w-3.5 h-3.5 text-[#c9a96e]" />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Idiomas falados</p>
                <div className="flex flex-wrap gap-1.5">
                  {(sailor as any).idiomas.map((l: string) => (
                    <span key={l} className="bg-[#0a1628] text-white text-[10px] font-semibold px-2.5 py-0.5">{l}</span>
                  ))}
                  {(sailor as any).idioma_outro && (
                    <span className="bg-[#0a1628] text-white text-[10px] font-semibold px-2.5 py-0.5">{(sailor as any).idioma_outro}</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Disponibilidade */}
      {((sailor as any).disponivel_imediato !== undefined || (sailor as any).tempo_embarque) && (
        <div className="bg-white border-2 border-[#0a1628]/5 p-5">
          <SectionLabel><CalendarDays className="w-3.5 h-3.5" /> Disponibilidade</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {(sailor as any).disponivel_imediato !== undefined && (
              <span className={`flex items-center gap-1 text-xs font-semibold px-3 py-1.5 border-2 ${
                (sailor as any).disponivel_imediato
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-gray-50 text-gray-500 border-gray-200'
              }`}>
                {(sailor as any).disponivel_imediato ? '✓' : '✗'} Embarque imediato
              </span>
            )}
            {(sailor as any).disponivel_internacional !== undefined && (
              <span className={`flex items-center gap-1 text-xs font-semibold px-3 py-1.5 border-2 ${
                (sailor as any).disponivel_internacional
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-gray-50 text-gray-500 border-gray-200'
              }`}>
                {(sailor as any).disponivel_internacional ? '✓' : '✗'} Viagens internacionais
              </span>
            )}
            {(sailor as any).tempo_embarque && (
              <span className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 border-2 bg-[#0a1628]/5 text-[#1a2b4a] border-[#0a1628]/10">
                <Clock className="w-3 h-3" /> {(sailor as any).tempo_embarque}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Tab: Documentos ───────────────────────────────────────────────────────────

type DocEntry = {
  label:    string;
  validade?: string;
  present:  boolean;
  docKey:   string;
  docUrl?:  string | null;
  pendingStatus?: 'pending' | 'approved' | 'rejected';
};

interface DocumentosTabProps {
  sailor:    Sailor;
  isOwner?:  boolean;
  onDocAdded?: () => void;
}

function DocumentosTab({ sailor, isOwner, onDocAdded }: DocumentosTabProps) {
  const [incluirModal, setIncluirModal] = useState<{ label: string; docKey: string } | null>(null);
  const [successDoc,   setSuccessDoc]   = useState<string | null>(null);
  const [viewingDoc,   setViewingDoc]   = useState<DocEntry | null>(null);

  const pendingDocs = sailor.pending_docs ?? {};

  const docs: DocEntry[] = [];

  // Documento de identificação
  const hasPassaporte = !!(sailor.passaporte?.validade || sailor.passaporte?.doc_url);
  const passType = sailor.passaporte?.tipo;
  const passLabel = passType === 'passport' ? 'Passaporte'
    : passType === 'rg' ? 'RG — Registro Geral'
    : passType === 'bi' ? 'BI — Bilhete de Identidade'
    : passType === 'cc' ? 'CC — Cartão de Cidadão'
    : passType === 'habilitacao_nau' ? 'Habilitação Náutica'
    : 'Documento de Identificação';
  docs.push({
    label:    passLabel,
    validade: sailor.passaporte?.validade,
    present:  hasPassaporte,
    docKey:   'passaporte',
    docUrl:   sailor.passaporte?.doc_url ?? null,
    pendingStatus: pendingDocs['passaporte']?.status,
  });

  // Caderneta Marítima
  const hasCaderneta = !!((sailor as any).caderneta_maritima?.possui || (sailor as any).caderneta_maritima?.validade);
  docs.push({
    label:    'Caderneta Marítima (CIR)',
    validade: (sailor as any).caderneta_maritima?.validade,
    present:  hasCaderneta,
    docKey:   'caderneta_maritima',
    docUrl:   (sailor as any).caderneta_maritima?.doc_url ?? null,
    pendingStatus: pendingDocs['caderneta_maritima']?.status,
  });

  // Carta de Patrão / Mestre
  const hasCarta = !!(sailor.cartahabitacao?.validade || sailor.cartahabitacao?.doc_url);
  docs.push({
    label:    'Carta de Patrão / Mestre',
    validade: sailor.cartahabitacao?.validade,
    present:  hasCarta,
    docKey:   'cartahabitacao',
    docUrl:   sailor.cartahabitacao?.doc_url ?? null,
    pendingStatus: pendingDocs['cartahabitacao']?.status,
  });

  // Certificado Médico
  const hasMedico = !!((sailor as any).possui_medico !== false && (sailor.medico?.validade || sailor.medico?.doc_url));
  docs.push({
    label:    'Certificado Médico Marítimo',
    validade: sailor.medico?.validade,
    present:  hasMedico,
    docKey:   'medico',
    docUrl:   sailor.medico?.doc_url ?? null,
    pendingStatus: pendingDocs['medico']?.status,
  });

  // STCW
  STCW_CERTS.forEach(cert => {
    const hasStcw = !!(sailor.stcw?.[cert.id]);
    docs.push({
      label:    `STCW — ${cert.label}`,
      validade: (sailor as any).stcw_validades?.[cert.id],
      present:  hasStcw,
      docKey:   `stcw_${cert.id}`,
      docUrl:   (sailor as any).stcw_docs?.[cert.id] ?? null,
      pendingStatus: pendingDocs[`stcw_${cert.id}`]?.status,
    });
  });

  function handleSuccess(docKey: string) {
    setIncluirModal(null);
    setSuccessDoc(docKey);
    setTimeout(() => setSuccessDoc(null), 3000);
    onDocAdded?.();
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-['Playfair_Display'] font-bold text-2xl text-[#1a2b4a]">Documentos</h2>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-0.5">Habilitações e certificações marítimas</p>
      </div>

      {/* Legenda de status */}
      <div className="bg-white border-2 border-[#0a1628]/5 p-4">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Legenda</p>
        <div className="flex flex-wrap gap-2">
          {(['valid', 'expiring', 'expired', 'unknown'] as DocStatus[]).map(key => {
            const cfg = STATUS_CFG[key];
            const Icon = cfg.icon;
            return (
              <span key={key} className={`flex items-center gap-1 text-[9px] font-bold uppercase px-2 py-1 border ${cfg.cls}`}>
                <Icon className="w-3 h-3" /> {cfg.label}
              </span>
            );
          })}
          {isOwner && (
            <span className={`flex items-center gap-1 text-[9px] font-bold uppercase px-2 py-1 border ${STATUS_CFG.missing.cls}`}>
              <XCircle className="w-3 h-3" /> Não possui
            </span>
          )}
          {isOwner && (
            <span className={`flex items-center gap-1 text-[9px] font-bold uppercase px-2 py-1 border ${STATUS_CFG.pending.cls}`}>
              <Clock className="w-3 h-3" /> Em revisão
            </span>
          )}
        </div>
      </div>

      {successDoc && (
        <div className="bg-emerald-50 border-2 border-emerald-200 px-4 py-3 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <p className="text-sm font-semibold text-emerald-700">Documento enviado para análise. O admin será notificado.</p>
        </div>
      )}

      <div className="space-y-3">
        {docs.map((d, i) => {
          // Se está em análise pendente
          if (d.pendingStatus === 'pending') {
            return (
              <div key={i} className="bg-amber-50 border-2 border-amber-200 p-4 flex items-start gap-3">
                <div className="w-9 h-9 bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FileText className="w-4 h-4 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[#1a2b4a] text-sm uppercase leading-tight">{d.label}</p>
                  <p className="text-[10px] font-semibold text-amber-600 mt-0.5">Aguardando análise do admin</p>
                </div>
                <span className={`flex items-center gap-1 text-[9px] font-bold uppercase px-2 py-1 border ${STATUS_CFG.pending.cls} flex-shrink-0`}>
                  <Clock className="w-3 h-3" /> Em revisão
                </span>
              </div>
            );
          }

          if (d.present) {
            return (
              <DocCard
                key={i}
                label={d.label}
                validade={d.validade}
                docUrl={d.docUrl}
                isOwner={isOwner}
                onClick={() => setViewingDoc(d)}
              />
            );
          }

          // Documento ausente
          if (!isOwner) return null;

          return (
            <div key={i} className="bg-white border-2 border-dashed border-gray-200 p-4 flex items-start gap-3 hover:border-[#c9a96e]/30 transition-all">
              <div className="w-9 h-9 bg-gray-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <FileText className="w-4 h-4 text-gray-300" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-400 text-sm uppercase leading-tight">{d.label}</p>
                <p className="text-[10px] font-semibold text-gray-300 mt-0.5">Validade: —</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`flex items-center gap-1 text-[9px] font-bold uppercase px-2 py-1 border ${STATUS_CFG.missing.cls}`}>
                  <XCircle className="w-3 h-3" /> Não possui
                </span>
                <button
                  onClick={() => setIncluirModal({ label: d.label, docKey: d.docKey })}
                  className="flex items-center gap-1 text-[9px] font-bold uppercase px-2 py-1 border border-[#c9a96e]/40 bg-[#c9a96e]/10 text-[#c9a96e] hover:bg-[#c9a96e]/20 transition-all flex-shrink-0">
                  <PlusCircle className="w-3 h-3" /> Incluir
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Aviso de privacidade */}
      {!isOwner && (
        <div className="bg-[#0a1628]/3 border border-[#0a1628]/10 px-4 py-3 flex items-start gap-2">
          <span className="text-[#c9a96e] text-sm mt-0.5">🔒</span>
          <p className="text-[11px] font-semibold text-gray-500 leading-relaxed">
            Os números dos documentos não são exibidos no perfil público por razões de privacidade e segurança de dados.
          </p>
        </div>
      )}

      {/* Modal de visualização */}
      {viewingDoc && viewingDoc.docUrl && (
        <DocViewerModal
          label={viewingDoc.label}
          docKey={viewingDoc.docKey}
          docUrl={viewingDoc.docUrl}
          validade={viewingDoc.validade}
          isOwner={isOwner}
          onClose={() => setViewingDoc(null)}
          onRenew={() => {
            setViewingDoc(null);
            setIncluirModal({ label: viewingDoc.label, docKey: viewingDoc.docKey });
          }}
        />
      )}

      {/* Modal de incluir */}
      {incluirModal && (
        <IncluirDocModal
          label={incluirModal.label}
          docKey={incluirModal.docKey}
          sailorId={sailor.id}
          onClose={() => setIncluirModal(null)}
          onSuccess={() => handleSuccess(incluirModal.docKey)}
        />
      )}
    </div>
  );
}

// ── Tab: Experiência ──────────────────────────────────────────────────────────

function ExperienciaTab({ sailor }: { sailor: Sailor }) {
  const experiencias: any[] = ((sailor as any).experiencias ?? []).filter((e: any) => e.empresa || e.funcao);
  const cursos = (sailor as any).cursos_relevantes as string | undefined;
  const offshore = (sailor as any).possui_offshore as boolean | undefined;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-['Playfair_Display'] font-bold text-2xl text-[#1a2b4a]">Experiência</h2>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-0.5">Historial profissional e qualificações</p>
      </div>

      {/* Trabalhou embarcado */}
      {(sailor as any).experiencia_embarcado !== undefined && (
        <div className="bg-white border-2 border-[#0a1628]/5 p-5">
          <SectionLabel><Anchor className="w-3.5 h-3.5" /> Experiência embarcado</SectionLabel>
          <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 ${
            (sailor as any).experiencia_embarcado
              ? 'bg-emerald-50 text-emerald-700 border-2 border-emerald-200'
              : 'bg-gray-50 text-gray-500 border-2 border-gray-200'
          }`}>
            {(sailor as any).experiencia_embarcado ? '✓ Sim, trabalhou embarcado' : '✗ Sem experiência embarcado'}
          </span>
        </div>
      )}

      {/* Histórico profissional */}
      {experiencias.length > 0 && (
        <div className="bg-white border-2 border-[#0a1628]/5 p-5">
          <SectionLabel><Briefcase className="w-3.5 h-3.5" /> Historial Profissional</SectionLabel>
          <div className="space-y-3">
            {experiencias.map((exp, i) => (
              <div key={i} className="border-l-2 border-[#c9a96e]/40 pl-4 py-1">
                <p className="font-bold text-[#1a2b4a] text-sm">{exp.empresa || '—'}</p>
                <p className="text-xs font-semibold text-[#c9a96e] mt-0.5">{exp.funcao || '—'}</p>
                {(exp.periodo_inicio || exp.periodo_fim) && (
                  <p className="text-[10px] font-semibold text-gray-400 mt-0.5">
                    {exp.periodo_inicio ? fmtDate(exp.periodo_inicio) : '?'}
                    {' → '}
                    {exp.periodo_fim ? fmtDate(exp.periodo_fim) : 'Presente'}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cursos */}
      {cursos && (
        <div className="bg-white border-2 border-[#0a1628]/5 p-5">
          <SectionLabel><Award className="w-3.5 h-3.5" /> Cursos e Qualificações</SectionLabel>
          <p className="text-sm text-gray-600 font-semibold leading-relaxed">{cursos}</p>
          {offshore !== undefined && (
            <div className={`mt-3 inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 border-2 ${
              offshore
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-gray-50 text-gray-500 border-gray-200'
            }`}>
              {offshore ? '✓' : '✗'} Cursos Offshore / HUET
            </div>
          )}
        </div>
      )}

      {experiencias.length === 0 && !cursos && (sailor as any).experiencia_embarcado === undefined && (
        <div className="bg-white border-2 border-dashed border-gray-200 py-16 text-center">
          <Briefcase className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="font-bold text-gray-300 uppercase text-sm">Sem experiência registada</p>
        </div>
      )}
    </div>
  );
}

// ── Componente Principal ──────────────────────────────────────────────────────

export type ViewTab = 'perfil' | 'documentos' | 'experiencia';

export const VIEW_TABS: { key: ViewTab; icon: React.ElementType; label: string; short: string }[] = [
  { key: 'perfil',      icon: User,        label: 'Perfil',       short: 'Perfil'  },
  { key: 'documentos',  icon: FileText,    label: 'Documentos',   short: 'Docs'    },
  { key: 'experiencia', icon: Briefcase,   label: 'Experiência',  short: 'Exp.'    },
];

// ── SailorProfileContent — conteúdo inline (sem navbar/sidebar próprios) ──────
// Usado pelo dashboard do tripulante para evitar layouts duplicados.

interface SailorProfileContentProps {
  sailor:      Sailor;
  subTab:      ViewTab;
  isOwner?:    boolean;
  onDocAdded?: () => void;
}

export function SailorProfileContent({ sailor, subTab, isOwner, onDocAdded }: SailorProfileContentProps) {
  const [localSailor, setLocalSailor] = useState<Sailor>(sailor);

  // Sincroniza quando o sailor externo muda (ex: foto atualizada)
  if (sailor.id !== localSailor.id || sailor.profile_photo !== localSailor.profile_photo) {
    setLocalSailor(sailor);
  }

  function handleDocAdded() {
    const fresh = getSailors().find(s => s.id === sailor.id);
    if (fresh) setLocalSailor(fresh);
    onDocAdded?.();
  }

  return (
    <>
      {subTab === 'perfil'      && <PerfilTab      sailor={localSailor} />}
      {subTab === 'documentos'  && <DocumentosTab  sailor={localSailor} isOwner={isOwner} onDocAdded={handleDocAdded} />}
      {subTab === 'experiencia' && <ExperienciaTab sailor={localSailor} />}
    </>
  );
}

interface SailorProfileViewProps {
  sailor:    Sailor;
  onBack:    () => void;
  isOwner?:  boolean;
}

export function SailorProfileView({ sailor, onBack, isOwner }: SailorProfileViewProps) {
  const [tab,        setTab]        = useState<ViewTab>('perfil');
  const [localSailor, setLocalSailor] = useState<Sailor>(sailor);

  // Refresh local sailor data after adding a doc
  function handleDocAdded() {
    const fresh = getSailors().find(s => s.id === sailor.id);
    if (fresh) setLocalSailor(fresh);
  }

  const funcao = (localSailor as any).funcao === 'Outro'
    ? ((localSailor as any).funcao_outro || 'Outro')
    : (localSailor as any).funcao;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* ── NAVBAR ── */}
      <nav className="bg-[#0a1628] text-white px-4 py-3 sticky top-0 z-40 shadow-xl border-b border-[#c9a96e]/10">
        <div className="flex items-center gap-3 max-w-6xl mx-auto">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Waves className="w-5 h-5 text-[#c9a96e]" />
            <span className="font-['Playfair_Display'] font-bold italic text-base hidden sm:inline text-white">NorthWindy</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-white text-sm truncate uppercase">{localSailor.name}</p>
            <p className="text-[#c9a96e]/60 text-[10px] font-semibold hidden sm:block">
              {localSailor.profile_number}{funcao ? ` · ${funcao}` : ''}{isOwner ? ' · Meu perfil público' : ''}
            </p>
          </div>
          <button onClick={onBack}
            className="bg-white/5 hover:bg-red-600/80 px-4 py-2 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-all flex-shrink-0 border border-white/10">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Voltar</span>
          </button>
        </div>
      </nav>

      {/* ── CONTENT AREA ── */}
      <div className="flex flex-1 max-w-6xl mx-auto w-full">

        {/* ── SIDEBAR (desktop) ── */}
        <aside className="hidden md:flex flex-col w-56 flex-shrink-0 py-6 pl-4 pr-3 gap-0">
          {/* Mini card do tripulante */}
          <div className="bg-white border-2 border-[#0a1628]/5 p-4 mb-4 shadow-sm">
            <div className="w-14 h-14 border-2 border-[#c9a96e]/20 overflow-hidden bg-[#0a1628]/5 flex items-center justify-center mx-auto mb-3">
              {localSailor.profile_photo
                ? <img src={localSailor.profile_photo} alt={localSailor.name} className="w-full h-full object-cover" />
                : <User className="w-7 h-7 text-[#c9a96e]/40" />
              }
            </div>
            <p className="font-['Playfair_Display'] font-bold text-[#1a2b4a] text-sm text-center uppercase leading-tight">{localSailor.name}</p>
            <p className="text-[10px] font-semibold text-[#c9a96e] text-center mt-1">{localSailor.profile_number}</p>
            {funcao && (
              <p className="text-[10px] font-semibold text-gray-400 text-center mt-0.5 truncate">{funcao}</p>
            )}
            {localSailor.verified && (
              <div className="flex items-center justify-center gap-1 mt-2">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wide">Verificado</span>
              </div>
            )}
            {isOwner && (
              <div className="mt-2 pt-2 border-t border-gray-100">
                <p className="text-[9px] font-semibold text-[#c9a96e] uppercase tracking-wide text-center">Meu Perfil Público</p>
              </div>
            )}
          </div>

          {/* Nav items */}
          <div className="bg-white border-2 border-[#0a1628]/5 overflow-hidden shadow-sm">
            {VIEW_TABS.map(t => {
              const Icon   = t.icon;
              const active = tab === t.key;
              return (
                <button key={t.key} onClick={() => setTab(t.key)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-xs font-semibold uppercase tracking-wider transition-all border-b border-[#0a1628]/5 last:border-0 ${
                    active
                      ? 'bg-[#0a1628] text-white'
                      : 'text-gray-500 hover:bg-[#0a1628]/5 hover:text-[#1a2b4a]'
                  }`}>
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="flex-1 text-left">{t.label}</span>
                  {active && <ChevronRight className="w-3 h-3 text-[#c9a96e]" />}
                </button>
              );
            })}
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main className="flex-1 min-w-0 px-4 py-6 pb-24 md:pb-6 overflow-hidden">
          {tab === 'perfil'      && <PerfilTab      sailor={localSailor} />}
          {tab === 'documentos'  && <DocumentosTab  sailor={localSailor} isOwner={isOwner} onDocAdded={handleDocAdded} />}
          {tab === 'experiencia' && <ExperienciaTab sailor={localSailor} />}
        </main>
      </div>

      {/* ── BOTTOM TAB BAR (mobile) ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0a1628] border-t border-[#c9a96e]/10 shadow-2xl">
        <div className="flex items-stretch h-16">
          {VIEW_TABS.map(t => {
            const Icon   = t.icon;
            const active = tab === t.key;
            return (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-all relative ${
                  active ? 'text-[#c9a96e]' : 'text-white/40'
                }`}>
                <Icon className={`w-5 h-5 transition-all ${active ? 'scale-110' : ''}`} />
                <span className="text-[9px] font-semibold uppercase tracking-wide">{t.short}</span>
                {active && <div className="absolute bottom-0 h-0.5 w-8 bg-[#c9a96e]" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
