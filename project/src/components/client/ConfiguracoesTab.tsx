// src/components/client/ConfiguracoesTab.tsx
import { useState, useRef } from 'react';
import {
  LogOut, KeyRound, Eye, EyeOff, Check, Copy, Trash2,
  AlertCircle, ChevronUp, ChevronDown, Mail, Phone,
  User, FileText, Clock, Info, Upload, MapPin, Home,
} from 'lucide-react';
import { updateClient, deleteClient, DOC_TYPES } from '../../lib/localStore';
import type { AuthState } from '../../hooks/useAuth';
import { DocumentoCard } from './DocumentoCard';
import { DocumentoViewer } from './DocumentoViewer';
import type { DocumentoDisplayItem } from './DocumentoViewer';

function normalizeLogin(name: string, profileNumber: string) {
  const num  = String(parseInt(profileNumber || '1', 10));
  const slug = name.split(' ')[0].toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
  return `${slug}#${num}`;
}

interface Props {
  auth:           AuthState;
  client:         any;
  onLogout:       () => void;
  onClientChange: (patch: any) => void;
}

export function ConfiguracoesTab({ auth, client, onLogout, onClientChange }: Props) {
  // ── password ──────────────────────────────────────────────────────────────
  const [newPass,   setNewPass]   = useState('');
  const [confPass,  setConfPass]  = useState('');
  const [showNew,   setShowNew]   = useState(false);
  const [showConf,  setShowConf]  = useState(false);
  const [errPass,   setErrPass]   = useState<string | null>(null);
  const [saved,     setSaved]     = useState(false);
  const [delStep,   setDelStep]   = useState<0|1|2>(0);
  const [showCreds, setShowCreds] = useState(false);

  // ── section toggles ───────────────────────────────────────────────────────
  const [showDadosPessoais, setShowDadosPessoais] = useState(false);
  const [showContatos,      setShowContatos]      = useState(false);
  const [showDocumentos,    setShowDocumentos]    = useState(false);

  // ── dados pessoais ────────────────────────────────────────────────────────
  const [dpName,        setDpName]        = useState(client?.name || '');
  const [dpBirth,       setDpBirth]       = useState(client?.birth_date || '');
  const [dpCountry,     setDpCountry]     = useState(client?.country_name || '');
  const [dpLanguage,    setDpLanguage]    = useState(client?.language || '');
  const [savedDados,    setSavedDados]    = useState(false);
  const [pendingDados,  setPendingDados]  = useState(false);

  // ── endereço ──────────────────────────────────────────────────────────────
  const [showAddrForm,    setShowAddrForm]    = useState(false);
  const [addrMorada,      setAddrMorada]      = useState('');
  const [addrCidade,      setAddrCidade]      = useState('');
  const [addrPostal,      setAddrPostal]      = useState('');
  const [addrProof,       setAddrProof]       = useState<string | null>(null);
  const [addrErrMsg,      setAddrErrMsg]      = useState<string | null>(null);
  const [savedAddr,       setSavedAddr]       = useState(false);
  const addrProofRef = useRef<HTMLInputElement>(null);

  const hasPendingAddr = client?.pending_address_status === 'pending';
  const hasRejectedAddr = client?.pending_address_status === 'rejected';

  // ── contactos ─────────────────────────────────────────────────────────────
  const [email,          setEmail]          = useState(client?.email || '');
  const [phone,          setPhone]          = useState(client?.phone || '');
  const [savedContatos,  setSavedContatos]  = useState(false);

  // ── documentos ────────────────────────────────────────────────────────────
  const [docType,    setDocType]    = useState(client?.doc_type || '');
  const [docNumber,  setDocNumber]  = useState(client?.passport_number || '');
  const [docIssued,  setDocIssued]  = useState(client?.passport_issued || '');
  const [docExpires, setDocExpires] = useState(client?.passport_expires || '');
  const [docFront,   setDocFront]   = useState<string | null>(client?.doc_url || null);
  const [docBack,    setDocBack]    = useState<string | null>(client?.doc_back_url || null);
  const [savedDocs,  setSavedDocs]  = useState(false);
  const [docViewing, setDocViewing] = useState<DocumentoDisplayItem | null>(null);
  const docFrontRef = useRef<HTMLInputElement>(null);
  const docBackRef  = useRef<HTMLInputElement>(null);

  const selectedDocMeta = DOC_TYPES.find(d => d.value === docType);
  const hasBack = selectedDocMeta?.hasBack ?? true;

  const daysUntilExpiry = client?.passport_expires
    ? Math.floor((new Date(client.passport_expires).getTime() - Date.now()) / 86400000)
    : null;
  const docEditable = daysUntilExpiry === null || daysUntilExpiry <= 15;

  function buildDocItem(): DocumentoDisplayItem | null {
    if (!client?.doc_type && !client?.passport_number) return null;
    const tipoMeta = DOC_TYPES.find(d => d.value === client.doc_type);
    const status: DocumentoDisplayItem['status'] =
      daysUntilExpiry === null ? 'unknown'
      : daysUntilExpiry < 0   ? 'expired'
      : daysUntilExpiry <= 30 ? 'expiring'
      : 'valid';
    return {
      id:          client.doc_type || 'identity',
      tipo:        tipoMeta?.label || client.doc_type || 'Documento de Identidade',
      numero:      client.passport_number || undefined,
      emissao:     client.passport_issued  || undefined,
      validade:    client.passport_expires || undefined,
      status,
      imagem:      client.doc_url      || null,
      imagemVerso: client.doc_back_url || null,
    };
  }
  const docItem = buildDocItem();

  const loginDisplay = client?.client_login || normalizeLogin(client?.name || '', client?.profile_number || '1');
  const senhaDisplay = client?.client_password || '0000';

  const strength = newPass.length < 4 ? 0 : newPass.length < 7 ? 1 : newPass.length < 10 ? 2 : 3;
  const strengthLabels = ['Muito curta', 'Fraca', 'Média', 'Forte'];
  const strengthColors = ['bg-red-400', 'bg-yellow-400', 'bg-blue-400', 'bg-green-500'];

  // ── handlers ──────────────────────────────────────────────────────────────
  async function savePass() {
    setErrPass(null);
    if (!newPass.trim())      { setErrPass('Informe a nova senha.'); return; }
    if (newPass.length < 4)   { setErrPass('Mínimo 4 caracteres.'); return; }
    if (newPass !== confPass) { setErrPass('As senhas não coincidem.'); return; }
    if (auth.clientId) await updateClient(auth.clientId, { client_password: newPass });
    onClientChange({ client_password: newPass });
    setSaved(true); setNewPass(''); setConfPass('');
    setTimeout(() => setSaved(false), 2500);
  }

  async function saveDadosPessoais() {
    if (auth.clientId) await updateClient(auth.clientId, {
      name: dpName, birth_date: dpBirth, country_name: dpCountry, language: dpLanguage,
    });
    onClientChange({ name: dpName, birth_date: dpBirth, country_name: dpCountry, language: dpLanguage });
    setSavedDados(true); setPendingDados(true);
    setTimeout(() => setSavedDados(false), 2500);
  }

  async function submitAddressChange() {
    setAddrErrMsg(null);
    if (!addrMorada.trim()) { setAddrErrMsg('Introduza a morada.'); return; }
    if (!addrCidade.trim()) { setAddrErrMsg('Introduza a cidade.'); return; }
    if (!addrProof)         { setAddrErrMsg('É necessário carregar o comprovante de residência.'); return; }
    const patch: any = {
      pending_address:            addrMorada,
      pending_city:               addrCidade,
      pending_postal_code:        addrPostal,
      pending_address_proof:      addrProof,
      pending_address_status:     'pending',
      pending_address_submitted_at: new Date().toISOString(),
    };
    if (auth.clientId) await updateClient(auth.clientId, patch);
    onClientChange(patch);
    setSavedAddr(true);
    setShowAddrForm(false);
    setTimeout(() => setSavedAddr(false), 3000);
  }

  async function saveContatos() {
    if (auth.clientId) await updateClient(auth.clientId, { email, phone });
    onClientChange({ email, phone });
    setSavedContatos(true);
    setTimeout(() => setSavedContatos(false), 2500);
  }

  async function saveDocumentos() {
    const patch: any = { doc_type: docType, passport_number: docNumber, passport_issued: docIssued, passport_expires: docExpires };
    if (docFront !== client?.doc_url)      patch.doc_url      = docFront;
    if (docBack  !== client?.doc_back_url) patch.doc_back_url = docBack;
    if (auth.clientId) await updateClient(auth.clientId, patch);
    onClientChange(patch);
    setSavedDocs(true);
    setTimeout(() => setSavedDocs(false), 2500);
  }

  function readFileAsBase64(file: File): Promise<string> {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = ev => resolve(ev.target?.result as string);
      reader.readAsDataURL(file);
    });
  }

  async function handleDocFile(file: File, side: 'front' | 'back') {
    if (file.size > 5 * 1024 * 1024) { alert('Máximo 5MB'); return; }
    const data = await readFileAsBase64(file);
    if (side === 'front') setDocFront(data);
    else setDocBack(data);
  }

  async function handleAddrProofFile(file: File) {
    if (file.size > 5 * 1024 * 1024) { alert('Máximo 5MB'); return; }
    setAddrProof(await readFileAsBase64(file));
  }

  async function deleteAccount() {
    if (auth.clientId) await deleteClient(auth.clientId);
    onLogout();
  }

  // ── section header helper ─────────────────────────────────────────────────
  function SectionHeader({ open, onToggle, icon: Icon, label }: {
    open: boolean; onToggle: () => void; icon: any; label: string;
  }) {
    return (
      <button onClick={onToggle}
        className={`w-full flex items-center justify-between px-4 py-3.5 text-xs font-semibold uppercase tracking-wide transition-all ${open ? 'bg-[#0a1628] text-white' : 'bg-gray-50 text-[#1a2b4a] hover:bg-gray-100'}`}>
        <div className="flex items-center gap-2">
          <Icon className={`w-3.5 h-3.5 ${open ? 'text-[#c9a96e]' : ''}`} />
          {label}
        </div>
        {open ? <ChevronUp className="w-3.5 h-3.5 text-[#c9a96e]" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em] mb-1">Conta</p>
        <h2 className="font-['Playfair_Display'] font-bold text-[#1a2b4a] text-xl">Configurações</h2>
        <div className="w-8 h-px bg-[#c9a96e] mt-2" />
      </div>

      {/* ── 1. Dados Pessoais ─────────────────────────────────────────────── */}
      <div className="border border-gray-100 overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <SectionHeader open={showDadosPessoais} onToggle={() => setShowDadosPessoais(v => !v)} icon={User} label="Dados Pessoais" />
        {showDadosPessoais && (
          <div className="bg-white px-4 pb-4 pt-3 space-y-4">

            {/* ── dados base ── */}
            <div className="space-y-3">
              <div className="bg-amber-50 border border-amber-200 px-3 py-2.5 flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-amber-700 font-medium text-xs leading-relaxed">
                  Alterações sujeitas a aprovação pela equipa NorthWindy.
                </p>
              </div>
              {[
                { label: 'Nome completo',      val: dpName,     set: setDpName,     type: 'text' },
                { label: 'Data de nascimento', val: dpBirth,    set: setDpBirth,    type: 'date' },
                { label: 'País',               val: dpCountry,  set: setDpCountry,  type: 'text' },
                { label: 'Idioma',             val: dpLanguage, set: setDpLanguage, type: 'text' },
              ].map(f => (
                <div key={f.label}>
                  <label className="text-[10px] font-semibold text-[#1a2b4a] uppercase tracking-wider mb-1 block">{f.label}</label>
                  <input type={f.type} value={f.val}
                    onChange={e => f.set(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 py-3 px-4 text-sm font-medium text-[#1a2b4a] focus:border-[#c9a96e] outline-none transition-colors" />
                </div>
              ))}
              {savedDados && (
                <div className="bg-green-50 border border-green-200 px-3 py-2 flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <p className="text-green-700 font-medium text-xs">Submetido — aguarda aprovação.</p>
                </div>
              )}
              {pendingDados && !savedDados && (
                <div className="bg-amber-50 border border-amber-200 px-3 py-2 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  <p className="text-amber-700 font-medium text-xs">Aguarda aprovação</p>
                </div>
              )}
              <button onClick={saveDadosPessoais}
                className="w-full bg-[#0a1628] hover:bg-[#1a2b4a] text-white py-3 font-semibold text-xs uppercase tracking-wider transition-all">
                Submeter para Aprovação
              </button>
            </div>

            {/* ── divider ── */}
            <div className="h-px bg-gray-100" />

            {/* ── endereço ── */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Home className="w-3.5 h-3.5 text-[#c9a96e]" />
                  <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em]">Endereço</p>
                </div>
                {!hasPendingAddr && !showAddrForm && (
                  <button
                    onClick={() => { setShowAddrForm(true); setAddrMorada(client?.address || ''); setAddrCidade(client?.city || ''); setAddrPostal(client?.postal_code || ''); setAddrProof(null); setAddrErrMsg(null); }}
                    className="text-[10px] font-semibold text-[#1a2b4a] border border-gray-200 hover:border-[#c9a96e] hover:text-[#c9a96e] px-3 py-1.5 transition-all uppercase tracking-wide">
                    Alterar Endereço
                  </button>
                )}
              </div>

              {/* current address display */}
              {(client?.address || client?.city || client?.postal_code) && !showAddrForm && (
                <div className="bg-gray-50 border border-gray-100 px-4 py-3 space-y-1">
                  {client.address    && <p className="text-sm font-medium text-[#1a2b4a] flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />{client.address}</p>}
                  {(client.city || client.postal_code) && (
                    <p className="text-xs text-gray-500 pl-5">{[client.postal_code, client.city].filter(Boolean).join(' · ')}</p>
                  )}
                </div>
              )}
              {!client?.address && !client?.city && !showAddrForm && (
                <p className="text-xs text-gray-400 italic">Nenhum endereço registado.</p>
              )}

              {/* pending badge */}
              {hasPendingAddr && (
                <div className="bg-amber-50 border border-amber-200 px-3 py-2.5 space-y-1">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    <p className="text-amber-700 font-semibold text-xs">Alteração de endereço aguarda aprovação</p>
                  </div>
                  <div className="pl-6 space-y-0.5">
                    {client.pending_address    && <p className="text-xs text-amber-600">{client.pending_address}</p>}
                    {(client.pending_city || client.pending_postal_code) && (
                      <p className="text-xs text-amber-600">{[client.pending_postal_code, client.pending_city].filter(Boolean).join(' · ')}</p>
                    )}
                  </div>
                </div>
              )}

              {/* rejected badge */}
              {hasRejectedAddr && (
                <div className="bg-red-50 border border-red-200 px-3 py-2.5 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-red-700 font-semibold text-xs">Solicitação rejeitada</p>
                    <button onClick={() => { setShowAddrForm(true); setAddrMorada(''); setAddrCidade(''); setAddrPostal(''); setAddrProof(null); setAddrErrMsg(null); }}
                      className="text-[10px] font-semibold text-red-600 underline mt-1">
                      Submeter novamente
                    </button>
                  </div>
                </div>
              )}

              {/* address change form */}
              {showAddrForm && (
                <div className="border border-[#c9a96e]/30 bg-[#fdfaf5] p-4 space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Info className="w-3.5 h-3.5 text-[#c9a96e]" />
                    <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-wide">Alteração de endereço — requer comprovante</p>
                  </div>

                  {addrErrMsg && (
                    <div className="bg-red-50 border border-red-200 px-3 py-2 flex items-center gap-2">
                      <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                      <p className="text-red-700 text-xs font-medium">{addrErrMsg}</p>
                    </div>
                  )}

                  {[
                    { label: 'Morada / Rua',  val: addrMorada, set: setAddrMorada, placeholder: 'Rua, número, andar...' },
                    { label: 'Cidade',         val: addrCidade, set: setAddrCidade, placeholder: 'Lisboa' },
                    { label: 'Código Postal',  val: addrPostal, set: setAddrPostal, placeholder: '1000-001' },
                  ].map(f => (
                    <div key={f.label}>
                      <label className="text-[10px] font-semibold text-[#1a2b4a] uppercase tracking-wider mb-1 block">{f.label}</label>
                      <input type="text" value={f.val} placeholder={f.placeholder}
                        onChange={e => { f.set(e.target.value); setAddrErrMsg(null); }}
                        className="w-full bg-white border border-gray-200 py-3 px-4 text-sm font-medium text-[#1a2b4a] focus:border-[#c9a96e] outline-none transition-colors placeholder:text-gray-300" />
                    </div>
                  ))}

                  {/* proof upload */}
                  <div>
                    <label className="text-[10px] font-semibold text-[#1a2b4a] uppercase tracking-wider mb-1 block">
                      Comprovante de Residência <span className="text-red-400">*</span>
                    </label>
                    <div
                      onClick={() => addrProofRef.current?.click()}
                      className="border-2 border-dashed border-[#c9a96e]/40 hover:border-[#c9a96e]/70 p-4 flex flex-col items-center gap-2 cursor-pointer transition-colors group bg-white">
                      {addrProof
                        ? <img src={addrProof} alt="comprovante" className="max-h-32 object-contain" />
                        : <>
                            <Upload className="w-6 h-6 text-gray-300 group-hover:text-[#c9a96e] transition-colors" />
                            <p className="text-xs text-gray-400 font-medium text-center">Clique para carregar comprovante<br /><span className="text-[10px] text-gray-300">Conta de luz, água, banco, etc.</span></p>
                          </>
                      }
                    </div>
                    <input ref={addrProofRef} type="file" accept="image/*,application/pdf" className="hidden"
                      onChange={e => { const f = e.target.files?.[0]; if (f) handleAddrProofFile(f); }} />
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button onClick={() => { setShowAddrForm(false); setAddrErrMsg(null); }}
                      className="flex-1 border border-gray-200 text-gray-500 hover:bg-gray-50 py-2.5 font-semibold text-xs uppercase transition-all">
                      Cancelar
                    </button>
                    <button onClick={submitAddressChange}
                      className="flex-1 bg-[#0a1628] hover:bg-[#1a2b4a] text-white py-2.5 font-semibold text-xs uppercase tracking-wider transition-all">
                      Submeter Solicitação
                    </button>
                  </div>
                </div>
              )}

              {savedAddr && (
                <div className="bg-green-50 border border-green-200 px-3 py-2 flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <p className="text-green-700 font-medium text-xs">Solicitação enviada — aguarda aprovação em Solicitações.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── 2. Contactos ──────────────────────────────────────────────────── */}
      <div className="border border-gray-100 overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <SectionHeader open={showContatos} onToggle={() => setShowContatos(v => !v)} icon={Mail} label="Contactos" />
        {showContatos && (
          <div className="bg-white px-4 pb-4 pt-3 space-y-3">
            {[
              { label: 'Email',     val: email, set: setEmail, type: 'email', icon: Mail  },
              { label: 'Telefone',  val: phone, set: setPhone, type: 'tel',   icon: Phone },
            ].map(f => (
              <div key={f.label}>
                <label className="text-[10px] font-semibold text-[#1a2b4a] uppercase tracking-wider mb-1 block">{f.label}</label>
                <div className="relative">
                  <f.icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type={f.type} value={f.val}
                    onChange={e => f.set(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 py-3 pl-10 pr-4 text-sm font-medium text-[#1a2b4a] focus:border-[#c9a96e] outline-none transition-colors" />
                </div>
              </div>
            ))}
            {savedContatos && (
              <div className="bg-green-50 border border-green-200 px-3 py-2 flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                <p className="text-green-700 font-medium text-xs">Contactos guardados!</p>
              </div>
            )}
            <button onClick={saveContatos}
              className="w-full bg-[#0a1628] hover:bg-[#1a2b4a] text-white py-3 font-semibold text-xs uppercase tracking-wider transition-all">
              Guardar Contactos
            </button>
          </div>
        )}
      </div>

      {/* ── 3. Documentos ────────────────────────────────────────────────── */}
      <div className="border border-gray-100 overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <SectionHeader open={showDocumentos} onToggle={() => setShowDocumentos(v => !v)} icon={FileText} label="Documentos" />
        {showDocumentos && (
          <div className="bg-white px-4 pb-4 pt-3 space-y-3">
            {!docEditable ? (
              <div className="space-y-3">
                <div className="bg-blue-50 border border-blue-200 px-3 py-2.5 flex items-start gap-2">
                  <Clock className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <p className="text-blue-700 font-medium text-xs leading-relaxed">
                    Editável 15 dias antes do vencimento
                    {daysUntilExpiry !== null && ` (em ${daysUntilExpiry} dias)`}.
                  </p>
                </div>
                {docItem
                  ? <DocumentoCard doc={docItem} onClick={() => setDocViewing(docItem)} />
                  : <p className="text-xs text-gray-400 text-center py-4">Nenhum documento registado.</p>
                }
              </div>
            ) : (
              <div className="space-y-3">
                {docItem && <DocumentoCard doc={docItem} onClick={() => setDocViewing(docItem)} />}
                {(daysUntilExpiry !== null && daysUntilExpiry <= 0) && (
                  <div className="bg-red-50 border border-red-200 px-3 py-2.5 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-red-700 font-medium text-xs">Documento expirado — atualize os seus dados.</p>
                  </div>
                )}
                {(daysUntilExpiry !== null && daysUntilExpiry > 0 && daysUntilExpiry <= 15) && (
                  <div className="bg-amber-50 border border-amber-200 px-3 py-2.5 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-amber-700 font-medium text-xs">Documento expira em {daysUntilExpiry} dias.</p>
                  </div>
                )}
                <div>
                  <label className="text-[10px] font-semibold text-[#1a2b4a] uppercase tracking-wider mb-1 block">Tipo de Documento</label>
                  <select value={docType} onChange={e => setDocType(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 py-3 px-4 text-sm font-medium text-[#1a2b4a] focus:border-[#c9a96e] outline-none transition-colors">
                    <option value="">— Selecionar —</option>
                    {DOC_TYPES.map(d => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                </div>
                {[
                  { label: 'Número',   val: docNumber,  set: setDocNumber,  type: 'text' },
                  { label: 'Emissão',  val: docIssued,  set: setDocIssued,  type: 'date' },
                  { label: 'Validade', val: docExpires, set: setDocExpires, type: 'date' },
                ].map(f => (
                  <div key={f.label}>
                    <label className="text-[10px] font-semibold text-[#1a2b4a] uppercase tracking-wider mb-1 block">{f.label}</label>
                    <input type={f.type} value={f.val}
                      onChange={e => f.set(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 py-3 px-4 text-sm font-medium text-[#1a2b4a] focus:border-[#c9a96e] outline-none transition-colors" />
                  </div>
                ))}
                {(['front', ...(hasBack ? ['back'] : [])] as ('front' | 'back')[]).map(side => {
                  const isFront = side === 'front';
                  const current = isFront ? docFront : docBack;
                  const ref     = isFront ? docFrontRef : docBackRef;
                  return (
                    <div key={side}>
                      <label className="text-[10px] font-semibold text-[#1a2b4a] uppercase tracking-wider mb-1 block">
                        {isFront ? 'Frente do documento' : 'Verso do documento'}
                      </label>
                      <div onClick={() => ref.current?.click()}
                        className="border-2 border-dashed border-gray-200 hover:border-[#c9a96e]/50 p-4 flex flex-col items-center gap-2 cursor-pointer transition-colors group">
                        {current
                          ? <img src={current} alt={side} className="max-h-28 object-contain" />
                          : <><Upload className="w-6 h-6 text-gray-300 group-hover:text-[#c9a96e] transition-colors" /><p className="text-xs text-gray-400 font-medium">Clique para carregar imagem</p></>
                        }
                      </div>
                      <input ref={ref} type="file" accept="image/*,application/pdf" className="hidden"
                        onChange={e => { const f = e.target.files?.[0]; if (f) handleDocFile(f, side); }} />
                    </div>
                  );
                })}
                {savedDocs && (
                  <div className="bg-green-50 border border-green-200 px-3 py-2 flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <p className="text-green-700 font-medium text-xs">Documentos guardados!</p>
                  </div>
                )}
                <button onClick={saveDocumentos}
                  className="w-full bg-[#0a1628] hover:bg-[#1a2b4a] text-white py-3 font-semibold text-xs uppercase tracking-wider transition-all">
                  Guardar Documentos
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Credenciais de acesso ─────────────────────────────────────────── */}
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

      {/* ── Alterar senha ─────────────────────────────────────────────────── */}
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

      {/* ── Terminar sessão ───────────────────────────────────────────────── */}
      <button onClick={onLogout}
        className="w-full flex items-center justify-center gap-2 border border-gray-200 text-gray-500 hover:border-red-200 hover:text-red-500 hover:bg-red-50 py-3.5 font-semibold text-sm uppercase tracking-wide transition-all">
        <LogOut className="w-4 h-4" /> Terminar Sessão
      </button>

      {/* ── Eliminar conta ────────────────────────────────────────────────── */}
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
              <button onClick={() => setDelStep(0)} className="flex-1 border border-gray-100 text-gray-500 py-2.5 font-semibold text-xs uppercase">Cancelar</button>
              <button onClick={() => setDelStep(2)} className="flex-1 bg-red-500 hover:bg-red-400 text-white py-2.5 font-semibold text-xs uppercase transition-all">Confirmar</button>
            </div>
          </div>
        )}
        {delStep === 2 && (
          <div className="space-y-3">
            <p className="text-xs font-medium text-red-700 text-center">⚠️ Última confirmação — a conta será eliminada permanentemente.</p>
            <div className="flex gap-2">
              <button onClick={() => setDelStep(0)} className="flex-1 border border-gray-100 text-gray-500 py-2.5 font-semibold text-xs uppercase">Cancelar</button>
              <button onClick={deleteAccount} className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2.5 font-semibold text-xs uppercase transition-all">Eliminar</button>
            </div>
          </div>
        )}
      </div>

      {docViewing && (
        <DocumentoViewer documento={docViewing} onClose={() => setDocViewing(null)} />
      )}
    </div>
  );
}
