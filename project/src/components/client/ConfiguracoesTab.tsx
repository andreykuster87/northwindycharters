// src/components/client/ConfiguracoesTab.tsx
import { useState, useRef } from 'react';
import {
  LogOut, KeyRound, Eye, EyeOff, Check, Copy, Trash2,
  AlertCircle, ChevronUp, ChevronDown, User as UserIcon, FileText,
  Save, Upload, Lock, Calendar as CalendarIcon,
} from 'lucide-react';
import { updateClient, deleteClient } from '../../lib/localStore';
import { DOC_TYPES } from '../../lib/store/core';
import { DocumentoCard } from './DocumentoCard';
import { DocumentoViewer, type DocumentoDisplayItem } from './DocumentoViewer';
import type { AuthState } from '../../hooks/useAuth';

function normalizeLogin(name: string, profileNumber: string) {
  const num  = String(parseInt(profileNumber || '1', 10));
  const slug = name.split(' ')[0].toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
  return `${slug}#${num}`;
}

function diasAteVencimento(validade?: string | null): number | null {
  if (!validade) return null;
  const expiry = new Date(validade);
  if (isNaN(expiry.getTime())) return null;
  const now = new Date();
  return Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function calcularStatus(dataValidade?: string | null): DocumentoDisplayItem['status'] {
  const dias = diasAteVencimento(dataValidade);
  if (dias === null) return 'unknown';
  if (dias < 0) return 'expired';
  if (dias <= 30) return 'expiring';
  return 'valid';
}

function fileToDataURL(file: File, maxSide = 1200, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = ev => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxSide || height > maxSide) {
          if (width > height) { height = Math.round(height * maxSide / width); width = maxSide; }
          else { width = Math.round(width * maxSide / height); height = maxSide; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width; canvas.height = height;
        canvas.getContext('2d')?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

interface Props {
  auth:           AuthState;
  client:         any;
  onLogout:       () => void;
  onClientChange: (patch: any) => void;
}

export function ConfiguracoesTab({ auth, client, onLogout, onClientChange }: Props) {
  const [newPass,   setNewPass]   = useState('');
  const [confPass,  setConfPass]  = useState('');
  const [showNew,   setShowNew]   = useState(false);
  const [showConf,  setShowConf]  = useState(false);
  const [errPass,   setErrPass]   = useState<string | null>(null);
  const [saved,     setSaved]     = useState(false);
  const [delStep,   setDelStep]   = useState<0|1|2>(0);
  const [showCreds, setShowCreds] = useState(false);
  const [showDados, setShowDados] = useState(false);
  const [showDocs,  setShowDocs]  = useState(false);

  const loginDisplay = client?.client_login || normalizeLogin(client?.name || '', client?.profile_number || '1');
  const senhaDisplay = client?.client_password || '0000';

  const strength = newPass.length < 4 ? 0 : newPass.length < 7 ? 1 : newPass.length < 10 ? 2 : 3;
  const strengthLabels = ['Muito curta', 'Fraca', 'Média', 'Forte'];
  const strengthColors = ['bg-red-400', 'bg-yellow-400', 'bg-blue-400', 'bg-green-500'];

  async function savePass() {
    setErrPass(null);
    if (!newPass.trim())      { setErrPass('Informe a nova senha.'); return; }
    if (newPass.length < 4)   { setErrPass('Mínimo 4 caracteres.'); return; }
    if (newPass !== confPass) { setErrPass('As senhas não coincidem.'); return; }
    if (auth.clientId) await updateClient(auth.clientId, { client_password: newPass } as any);
    onClientChange({ client_password: newPass });
    setSaved(true);
    setNewPass(''); setConfPass('');
    setTimeout(() => setSaved(false), 2500);
  }

  async function deleteAccount() {
    if (auth.clientId) await deleteClient(auth.clientId);
    onLogout();
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em] mb-1">Conta</p>
        <h2 className="font-['Playfair_Display'] font-bold text-[#1a2b4a] text-xl">Configurações</h2>
        <div className="w-8 h-px bg-[#c9a96e] mt-2" />
      </div>

      {/* ── Dados Pessoais ── */}
      <CollapsibleSection
        icon={UserIcon}
        label="Dados Pessoais"
        open={showDados}
        onToggle={() => setShowDados(v => !v)}
      >
        <DadosPessoaisForm
          client={client}
          onSaved={patch => onClientChange(patch)}
          clientId={auth.clientId}
        />
      </CollapsibleSection>

      {/* ── Documentos (edição só 15 dias antes do vencimento) ── */}
      <CollapsibleSection
        icon={FileText}
        label="Documentos"
        open={showDocs}
        onToggle={() => setShowDocs(v => !v)}
      >
        <DocumentosSection
          client={client}
          onSaved={patch => onClientChange(patch)}
          clientId={auth.clientId}
        />
      </CollapsibleSection>

      {/* ── Credenciais de acesso ── */}
      <div className="border border-gray-100 overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <button onClick={() => setShowCreds(v => !v)}
          className={`w-full flex items-center justify-between px-4 py-3.5 text-xs font-semibold uppercase tracking-wide transition-all ${showCreds ? 'bg-[#0a1628] text-white' : 'bg-gray-50 text-[#1a2b4a] hover:bg-gray-100'}`}>
          <div className="flex items-center gap-2">
            <KeyRound className={`w-3.5 h-3.5 ${showCreds ? 'text-[#c9a96e]' : ''}`} />
            Credenciais de acesso
          </div>
          {showCreds ? <ChevronUp className="w-3.5 h-3.5 text-[#c9a96e]" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
        {showCreds && (
          <div className="bg-[#0a1628] px-4 pb-4 pt-3 space-y-2 animate-in fade-in duration-150">
            {([['Login', loginDisplay], ['Senha', senhaDisplay]] as [string, string][]).map(([l, v]) => (
              <div key={l} className="flex items-center justify-between bg-white/5 border border-[#c9a96e]/20 px-4 py-2.5">
                <span className="text-[#c9a96e]/70 text-xs font-semibold uppercase tracking-wide">{l}</span>
                <div className="flex items-center gap-2">
                  <span className="text-white font-['Playfair_Display'] font-bold text-sm">{v}</span>
                  <button onClick={() => navigator.clipboard.writeText(v)}
                    className="bg-white/10 hover:bg-[#c9a96e]/20 text-[#c9a96e] p-1 transition-all">
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Alterar senha ── */}
      <div className="bg-white border border-gray-100 p-4 space-y-3 relative" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a96e]/30 to-transparent" />
        <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em]">Alterar Senha</p>

        {errPass && (
          <div className="bg-red-50 border border-red-200 px-3 py-2.5 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p className="text-red-700 font-medium text-xs">{errPass}</p>
          </div>
        )}
        {saved && (
          <div className="bg-green-50 border border-green-200 px-3 py-2.5 flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
            <p className="text-green-700 font-medium text-xs">Senha alterada com sucesso!</p>
          </div>
        )}

        {[
          { label: 'Nova Senha',      val: newPass,  set: setNewPass,  show: showNew,  setShow: setShowNew  },
          { label: 'Confirmar Senha', val: confPass, set: setConfPass, show: showConf, setShow: setShowConf },
        ].map(f => (
          <div key={f.label}>
            <label className="text-[10px] font-semibold text-[#1a2b4a] uppercase tracking-wider ml-1 mb-1 block">{f.label}</label>
            <div className="relative">
              <input type={f.show ? 'text' : 'password'} value={f.val}
                onChange={e => { f.set(e.target.value); setErrPass(null); setSaved(false); }}
                className="w-full bg-gray-50 border border-gray-200 py-3.5 px-4 pr-10 font-medium text-[#1a2b4a] focus:border-[#c9a96e] outline-none text-sm transition-colors" />
              <button type="button" onClick={() => f.setShow(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#c9a96e] transition-colors">
                {f.show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        ))}

        {newPass.length > 0 && (
          <div className="space-y-1">
            <div className="flex gap-1 h-1.5">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className={`flex-1 transition-all ${i <= strength ? strengthColors[strength] : 'bg-gray-100'}`} />
              ))}
            </div>
            <p className={`text-[10px] font-semibold ml-1 ${strengthColors[strength].replace('bg-', 'text-')}`}>{strengthLabels[strength]}</p>
          </div>
        )}

        <button onClick={savePass}
          className="w-full bg-[#0a1628] hover:bg-[#1a2b4a] text-white py-3.5 font-semibold text-xs uppercase tracking-wider transition-all">
          Guardar Nova Senha
        </button>
      </div>

      {/* ── Terminar sessão ── */}
      <button onClick={onLogout}
        className="w-full flex items-center justify-center gap-2 border border-gray-200 text-gray-500 hover:border-red-200 hover:text-red-500 hover:bg-red-50 py-3.5 font-semibold text-sm uppercase tracking-wide transition-all">
        <LogOut className="w-4 h-4" /> Terminar Sessão
      </button>

      {/* ── Eliminar conta ── */}
      <div className="bg-white border border-red-50 p-4 relative" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <p className="text-[10px] font-semibold text-red-500 uppercase tracking-[0.15em] mb-3">Zona de Perigo</p>
        {delStep === 0 && (
          <button onClick={() => setDelStep(1)}
            className="w-full border border-red-100 text-red-400 hover:bg-red-50 hover:border-red-300 py-3 font-semibold text-xs uppercase tracking-wide transition-all flex items-center justify-center gap-2">
            <Trash2 className="w-3.5 h-3.5" /> Eliminar Conta
          </button>
        )}
        {delStep === 1 && (
          <div className="space-y-3">
            <p className="text-xs font-medium text-gray-700 text-center">Tem a certeza? Esta acção é irreversível.</p>
            <div className="flex gap-2">
              <button onClick={() => setDelStep(0)}
                className="flex-1 border border-gray-100 text-gray-500 py-2.5 font-semibold text-xs uppercase">Cancelar</button>
              <button onClick={() => setDelStep(2)}
                className="flex-1 bg-red-500 hover:bg-red-400 text-white py-2.5 font-semibold text-xs uppercase transition-all">Confirmar</button>
            </div>
          </div>
        )}
        {delStep === 2 && (
          <div className="space-y-3">
            <p className="text-xs font-medium text-red-700 text-center">⚠️ Última confirmação — a conta será eliminada permanentemente.</p>
            <div className="flex gap-2">
              <button onClick={() => setDelStep(0)}
                className="flex-1 border border-gray-100 text-gray-500 py-2.5 font-semibold text-xs uppercase">Cancelar</button>
              <button onClick={deleteAccount}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2.5 font-semibold text-xs uppercase transition-all">Eliminar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// Subcomponentes
// ═════════════════════════════════════════════════════════════════════════════

function CollapsibleSection({
  icon: Icon, label, open, onToggle, children,
}: {
  icon: any; label: string; open: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <div className="border border-gray-100 overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <button onClick={onToggle}
        className={`w-full flex items-center justify-between px-4 py-3.5 text-xs font-semibold uppercase tracking-wide transition-all ${open ? 'bg-[#0a1628] text-white' : 'bg-gray-50 text-[#1a2b4a] hover:bg-gray-100'}`}>
        <div className="flex items-center gap-2">
          <Icon className={`w-3.5 h-3.5 ${open ? 'text-[#c9a96e]' : ''}`} />
          {label}
        </div>
        {open ? <ChevronUp className="w-3.5 h-3.5 text-[#c9a96e]" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>
      {open && (
        <div className="bg-white p-4 animate-in fade-in duration-150">
          {children}
        </div>
      )}
    </div>
  );
}

// ── Formulário de Dados Pessoais ────────────────────────────────────────────

function DadosPessoaisForm({ client, onSaved, clientId }: {
  client: any; onSaved: (patch: any) => void; clientId: string | null;
}) {
  const [form, setForm] = useState({
    name:         client?.name         ?? '',
    phone:        client?.phone        ?? '',
    email:        client?.email        ?? '',
    endereco:     client?.endereco     ?? '',
    country_name: client?.country_name ?? '',
    birth_date:   client?.birth_date   ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dirty =
    form.name         !== (client?.name         ?? '') ||
    form.phone        !== (client?.phone        ?? '') ||
    form.email        !== (client?.email        ?? '') ||
    form.endereco     !== (client?.endereco     ?? '') ||
    form.country_name !== (client?.country_name ?? '') ||
    form.birth_date   !== (client?.birth_date   ?? '');

  async function handleSave() {
    setError(null);
    if (!form.name.trim())  { setError('O nome é obrigatório.'); return; }
    if (!form.email.trim()) { setError('O email é obrigatório.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setError('Email inválido.'); return; }

    setSaving(true);
    try {
      if (clientId) await updateClient(clientId, form as any);
      onSaved(form);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    } catch (e: any) {
      setError(e?.message || 'Não foi possível guardar. Tente novamente.');
    } finally {
      setSaving(false);
    }
  }

  const fields: { key: keyof typeof form; label: string; type?: string; placeholder?: string; full?: boolean }[] = [
    { key: 'name',         label: 'Nome Completo', full: true },
    { key: 'email',        label: 'Email',         type: 'email' },
    { key: 'phone',        label: 'Telefone',      placeholder: '+351 912345678' },
    { key: 'birth_date',   label: 'Data de Nascimento', type: 'date' },
    { key: 'country_name', label: 'País' },
    { key: 'endereco',     label: 'Endereço',      full: true, placeholder: 'Rua, nº, cidade, código postal' },
  ];

  return (
    <div className="space-y-3">
      {error && (
        <div className="bg-red-50 border border-red-200 px-3 py-2.5 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-red-700 font-medium text-xs">{error}</p>
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 px-3 py-2.5 flex items-center gap-2">
          <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
          <p className="text-green-700 font-medium text-xs">Dados atualizados com sucesso!</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {fields.map(f => (
          <div key={f.key} className={f.full ? 'sm:col-span-2' : ''}>
            <label className="text-[10px] font-semibold text-[#1a2b4a] uppercase tracking-wider ml-1 mb-1 block">{f.label}</label>
            <input
              type={f.type || 'text'}
              value={form[f.key] || ''}
              placeholder={f.placeholder}
              onChange={e => setForm(s => ({ ...s, [f.key]: e.target.value }))}
              className="w-full bg-gray-50 border border-gray-200 py-3 px-3 font-medium text-[#1a2b4a] focus:border-[#c9a96e] outline-none text-sm transition-colors"
            />
          </div>
        ))}
      </div>

      <button
        onClick={handleSave}
        disabled={!dirty || saving}
        className="w-full bg-[#0a1628] hover:bg-[#1a2b4a] disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3.5 font-semibold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
      >
        <Save className="w-3.5 h-3.5" />
        {saving ? 'A guardar…' : 'Guardar Alterações'}
      </button>
    </div>
  );
}

// ── Documentos — edição só 15 dias antes do vencimento ─────────────────────

function DocumentosSection({ client, onSaved, clientId }: {
  client: any; onSaved: (patch: any) => void; clientId: string | null;
}) {
  const [viewing, setViewing] = useState<DocumentoDisplayItem | null>(null);
  const [editing, setEditing] = useState(false);

  if (!client?.doc_type && !client?.passport_number) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-3 text-center">
        <div className="w-14 h-14 bg-gray-100 flex items-center justify-center">
          <FileText className="w-6 h-6 text-gray-400" />
        </div>
        <div>
          <p className="text-sm font-['Playfair_Display'] font-bold text-[#1a2b4a]">
            Nenhum documento registado
          </p>
          <p className="text-xs text-gray-400 mt-1 max-w-[260px] leading-relaxed">
            Os seus documentos aparecerão aqui após a candidatura à comunidade.
          </p>
        </div>
      </div>
    );
  }

  const tipoMeta  = DOC_TYPES.find(d => d.value === client.doc_type);
  const tipoLabel = tipoMeta?.label || client.doc_type || 'Documento de Identidade';
  const dias      = diasAteVencimento(client.passport_expires);
  const editavel  = dias !== null && dias <= 15; // 15 dias antes do vencimento (ou expirado)

  const doc: DocumentoDisplayItem = {
    id:          client.doc_type || 'identity',
    tipo:        tipoLabel,
    numero:      client.passport_number || undefined,
    emissao:     client.passport_issued || undefined,
    validade:    client.passport_expires || undefined,
    status:      calcularStatus(client.passport_expires),
    imagem:      client.doc_url || null,
    imagemVerso: client.doc_back_url || null,
  };

  return (
    <div className="space-y-3">
      {/* Info de edição/bloqueio */}
      {editavel ? (
        <div className="bg-amber-50 border border-amber-200 px-3 py-2.5 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-700 font-semibold text-xs">Edição disponível</p>
            <p className="text-amber-600/80 text-[11px] mt-0.5">
              {dias! < 0
                ? 'Documento expirado — atualize-o para manter o perfil ativo.'
                : `Faltam ${dias} dia${dias === 1 ? '' : 's'} para o vencimento — pode atualizar agora.`}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 px-3 py-2.5 flex items-start gap-2">
          <Lock className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-gray-600 font-semibold text-xs">Edição bloqueada</p>
            <p className="text-gray-500 text-[11px] mt-0.5">
              {dias === null
                ? 'Sem data de validade registada.'
                : `Só é possível editar o documento a partir de 15 dias antes do vencimento (faltam ${dias} dias).`}
            </p>
          </div>
        </div>
      )}

      {/* Card do documento */}
      <DocumentoCard doc={doc} onClick={() => setViewing(doc)} />

      {/* Botão de edição */}
      {editavel && !editing && (
        <button
          onClick={() => setEditing(true)}
          className="w-full border border-[#c9a96e] text-[#c9a96e] hover:bg-[#c9a96e] hover:text-[#0a1628] py-3 font-semibold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
        >
          <Upload className="w-3.5 h-3.5" /> Atualizar Documento
        </button>
      )}

      {/* Modal de edição inline */}
      {editing && (
        <DocumentoEditForm
          client={client}
          onCancel={() => setEditing(false)}
          onSaved={patch => { onSaved(patch); setEditing(false); }}
          clientId={clientId}
        />
      )}

      {/* Visualizador */}
      {viewing && (
        <DocumentoViewer documento={viewing} onClose={() => setViewing(null)} />
      )}
    </div>
  );
}

// ── Formulário de edição de documento ──────────────────────────────────────

function DocumentoEditForm({ client, onCancel, onSaved, clientId }: {
  client: any; onCancel: () => void; onSaved: (patch: any) => void; clientId: string | null;
}) {
  const tipoMeta = DOC_TYPES.find(d => d.value === client.doc_type);
  const hasBack = tipoMeta?.hasBack ?? false;

  const [numero,   setNumero]   = useState<string>(client.passport_number || '');
  const [validade, setValidade] = useState<string>(client.passport_expires || '');
  const [docFront, setDocFront] = useState<string | null>(client.doc_url || null);
  const [docBack,  setDocBack]  = useState<string | null>(client.doc_back_url || null);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  const frontRef = useRef<HTMLInputElement>(null);
  const backRef  = useRef<HTMLInputElement>(null);

  async function handleUpload(file: File, setter: (v: string) => void) {
    if (file.size > 5 * 1024 * 1024) { setError('Máximo 5MB por ficheiro.'); return; }
    try {
      const data = await fileToDataURL(file);
      setter(data);
      setError(null);
    } catch {
      setError('Não foi possível processar o ficheiro.');
    }
  }

  async function handleSave() {
    setError(null);
    if (!numero.trim())   { setError('Informe o número do documento.'); return; }
    if (!validade)        { setError('Informe a data de validade.'); return; }
    if (!docFront)        { setError('Anexe a frente do documento.'); return; }

    const patch = {
      passport_number: numero.trim(),
      passport_expires: validade,
      doc_url: docFront,
      doc_back_url: hasBack ? docBack : null,
    };

    setSaving(true);
    try {
      if (clientId) await updateClient(clientId, patch as any);
      onSaved(patch);
    } catch (e: any) {
      setError(e?.message || 'Não foi possível guardar.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-gray-50 border border-gray-200 p-4 space-y-3">
      <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em]">
        Atualizar {tipoMeta?.label || 'Documento'}
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 px-3 py-2.5 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-red-700 font-medium text-xs">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] font-semibold text-[#1a2b4a] uppercase tracking-wider ml-1 mb-1 block">Número</label>
          <input value={numero} onChange={e => setNumero(e.target.value)}
            className="w-full bg-white border border-gray-200 py-3 px-3 font-medium text-[#1a2b4a] focus:border-[#c9a96e] outline-none text-sm" />
        </div>
        <div>
          <label className="text-[10px] font-semibold text-[#1a2b4a] uppercase tracking-wider ml-1 mb-1 block flex items-center gap-1.5">
            <CalendarIcon className="w-3 h-3" /> Validade
          </label>
          <input type="date" value={validade} onChange={e => setValidade(e.target.value)}
            className="w-full bg-white border border-gray-200 py-3 px-3 font-medium text-[#1a2b4a] focus:border-[#c9a96e] outline-none text-sm" />
        </div>
      </div>

      {/* Upload frente */}
      <UploadSlot
        label="Frente"
        preview={docFront}
        onPick={() => frontRef.current?.click()}
        onClear={() => setDocFront(null)}
      />
      <input ref={frontRef} type="file" accept="image/*,application/pdf" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f, setDocFront); }} />

      {/* Upload verso */}
      {hasBack && (
        <>
          <UploadSlot
            label="Verso"
            preview={docBack}
            onPick={() => backRef.current?.click()}
            onClear={() => setDocBack(null)}
          />
          <input ref={backRef} type="file" accept="image/*,application/pdf" className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f, setDocBack); }} />
        </>
      )}

      <div className="flex gap-2 pt-1">
        <button onClick={onCancel}
          className="flex-1 border border-gray-200 text-gray-500 py-3 font-semibold text-xs uppercase tracking-wide hover:bg-gray-100 transition-all">
          Cancelar
        </button>
        <button onClick={handleSave} disabled={saving}
          className="flex-1 bg-[#0a1628] hover:bg-[#1a2b4a] disabled:bg-gray-300 text-white py-3 font-semibold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2">
          <Save className="w-3.5 h-3.5" />
          {saving ? 'A guardar…' : 'Guardar'}
        </button>
      </div>
    </div>
  );
}

function UploadSlot({ label, preview, onPick, onClear }: {
  label: string; preview: string | null; onPick: () => void; onClear: () => void;
}) {
  return (
    <div>
      <label className="text-[10px] font-semibold text-[#1a2b4a] uppercase tracking-wider ml-1 mb-1 block">{label}</label>
      {preview ? (
        <div className="flex items-center gap-3 bg-white border border-gray-200 p-2">
          {preview.startsWith('data:image/') || preview.startsWith('http')
            ? <img src={preview} alt={label} className="w-14 h-14 object-cover border border-gray-100" />
            : <div className="w-14 h-14 bg-gray-100 flex items-center justify-center">
                <FileText className="w-5 h-5 text-gray-400" />
              </div>}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-700">Ficheiro anexado</p>
            <p className="text-[10px] text-gray-400">Clique em Substituir para atualizar</p>
          </div>
          <button onClick={onPick}
            className="text-[10px] font-bold text-[#c9a96e] hover:text-[#b8934a] uppercase tracking-wide px-2 py-1">
            Substituir
          </button>
          <button onClick={onClear}
            className="text-gray-300 hover:text-red-500 p-1" title="Remover">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <button onClick={onPick}
          className="w-full border border-dashed border-gray-300 hover:border-[#c9a96e] bg-white hover:bg-[#c9a96e]/5 py-4 flex flex-col items-center gap-1.5 transition-all">
          <Upload className="w-4 h-4 text-gray-400" />
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Anexar ficheiro</span>
        </button>
      )}
    </div>
  );
}
