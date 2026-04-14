// src/components/modals/boat/steps/BoatStep2Proprietario.tsx
import { ChevronLeft, ChevronRight, ChevronDown, ShieldCheck, Building2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { BoatInput, pickDocCompressed } from '../shared/BoatFormWidgets';
import { COUNTRIES } from '../../../../assets/countries';
import type { BoatForm } from './BoatStep1Embarcacao';
import { getClients, getSailors } from '../../../../lib/localStore';
import { getCompanies } from '../../../../lib/store/companies';

// ── Card de perfil encontrado ─────────────────────────────────────────────────
function ProfileCard({ name, email, profileNumber, docType, docNr, phone, nif, morada }: {
  name: string; email: string; profileNumber?: string;
  docType?: string; docNr?: string; phone?: string;
  nif?: string; morada?: string;
}) {
  const initials = name.substring(0, 2).toUpperCase();

  const rows = [
    { l: 'Documento', v: docType || '—' },
    { l: 'Nº Doc.',   v: docNr   || '—' },
    { l: 'Telefone',  v: phone   || '—' },
    { l: 'NIF / Fiscal', v: nif  || '—' },
  ].filter(r => r.v !== '—' || r.l === 'Telefone');

  return (
    <div className="border border-green-200 bg-green-50 overflow-hidden">
      {/* Cabeçalho */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="w-10 h-10 bg-[#0a1628] flex-shrink-0 shadow-sm flex items-center justify-center font-bold text-white text-sm">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-bold text-[#1a2b4a] text-sm truncate">{name}</p>
            {profileNumber && (
              <span className="text-[9px] font-semibold bg-[#0a1628] text-white px-2 py-0.5 flex-shrink-0">
                #{profileNumber}
              </span>
            )}
          </div>
          <p className="text-[10px] text-gray-500 font-bold truncate">{email}</p>
        </div>
        <div className="flex-shrink-0 text-[9px] font-semibold uppercase px-2 py-1 text-green-700 border border-green-300 bg-white flex items-center gap-1">
          <ShieldCheck className="w-3 h-3" /> Verificado
        </div>
      </div>

      {/* Grid de dados */}
      <div className={`grid gap-px bg-white/40 border-t border-white/60`}
        style={{ gridTemplateColumns: `repeat(${Math.min(rows.length, 4)}, 1fr)` }}>
        {rows.map(({ l, v }) => (
          <div key={l} className="bg-white/70 py-2 px-3 text-center">
            <p className="text-[8px] font-semibold text-gray-400 uppercase">{l}</p>
            <p className="text-[10px] font-bold mt-0.5 text-green-700 truncate">{v}</p>
          </div>
        ))}
      </div>

      {/* Morada se disponível */}
      {morada && (
        <div className="border-t border-white/60 bg-white/50 px-4 py-2">
          <p className="text-[8px] font-semibold text-gray-400 uppercase mb-0.5">Morada</p>
          <p className="text-[10px] font-bold text-green-700">{morada}</p>
        </div>
      )}
    </div>
  );
}

// ── Card de empresa encontrada ─────────────────────────────────────────────────
function CompanyCard({ company, onClear }: {
  company: { name: string; nif: string; email: string; telefone: string; morada: string; numero: string };
  onClear: () => void;
}) {
  return (
    <div className="border border-[#c9a96e]/30 bg-[#0a1628]/5 overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="w-10 h-10 bg-[#0a1628] flex-shrink-0 shadow-sm flex items-center justify-center font-bold text-white text-sm">
          🏢
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-bold text-[#1a2b4a] text-sm truncate">{company.name}</p>
            <span className="text-[9px] font-semibold bg-[#0a1628] text-white px-2 py-0.5 flex-shrink-0">
              NorthWindy
            </span>
          </div>
          <p className="text-[10px] text-gray-500 font-bold truncate">{company.email}</p>
        </div>
        <div className="flex-shrink-0 text-[9px] font-semibold uppercase px-2 py-1 text-[#1a2b4a] border border-[#c9a96e]/30 bg-white flex items-center gap-1">
          <ShieldCheck className="w-3 h-3" /> Verificada
        </div>
      </div>
      <div className="grid grid-cols-3 gap-px bg-white/40 border-t border-white/60">
        {[
          { l: 'NIF / Fiscal', v: company.nif || '—' },
          { l: 'Telefone',     v: company.telefone || '—' },
          { l: 'Nº Registo',   v: company.numero || '—' },
        ].map(({ l, v }) => (
          <div key={l} className="bg-white/70 py-2 px-3 text-center">
            <p className="text-[8px] font-semibold text-gray-400 uppercase">{l}</p>
            <p className="text-[10px] font-bold mt-0.5 text-[#1a2b4a] truncate">{v}</p>
          </div>
        ))}
      </div>
      {company.morada && (
        <div className="border-t border-white/60 bg-white/50 px-4 py-2">
          <p className="text-[8px] font-semibold text-gray-400 uppercase mb-0.5">Morada</p>
          <p className="text-[10px] font-bold text-[#1a2b4a]">{company.morada}</p>
        </div>
      )}
      <div className="border-t border-white/60 bg-white/40 px-4 py-2">
        <button type="button" onClick={onClear}
          className="text-[10px] font-semibold text-gray-400 hover:text-red-500 transition-colors uppercase tracking-wider">
          ✕ Remover e inserir manualmente
        </button>
      </div>
    </div>
  );
}
function PhoneInput({ label, ddi, onDdiChange, phone, onPhoneChange }: {
  label: string; ddi: string; onDdiChange: (v: string) => void;
  phone: string; onPhoneChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) { setOpen(false); setSearch(''); } };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  const selected = COUNTRIES.find(c => c.ddi === ddi) || COUNTRIES[0];
  const filtered = COUNTRIES.filter(c => search ? c.name.toLowerCase().includes(search.toLowerCase()) || c.ddi.includes(search) : true);
  const applyMask = (val: string, mask: string) => {
    const digits = val.replace(/\D/g, '');
    let result = ''; let di = 0;
    for (let i = 0; i < mask.length && di < digits.length; i++) {
      if (mask[i] === '#') { result += digits[di++]; } else { result += mask[i]; }
    }
    return result;
  };
  return (
    <div>
      <label className="block text-xs font-semibold text-[#1a2b4a] uppercase mb-1.5">{label}</label>
      <div className="flex gap-2">
        <div ref={ref} className="relative flex-shrink-0">
          <button type="button" onClick={() => setOpen(o => !o)}
            className={`h-full bg-gray-50 border py-3 px-3 flex items-center gap-1.5 font-bold text-sm transition-all min-w-[88px] ${open ? 'border-[#c9a96e]' : 'border-gray-200'} text-[#1a2b4a]`}>
            <span>{selected.flag}</span>
            <span className="text-xs font-semibold">{selected.ddi}</span>
            <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>
          {open && (
            <div className="absolute z-50 w-64 mt-1 bg-white border border-[#c9a96e] shadow-xl overflow-hidden">
              <div className="p-2 border-b border-gray-100">
                <input autoFocus value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="PESQUISAR PAÍS..." className="w-full text-sm font-bold text-[#1a2b4a] bg-gray-50 py-2 px-3 outline-none border border-gray-200 focus:border-[#c9a96e] placeholder:text-gray-300" />
              </div>
              <div className="max-h-48 overflow-y-auto">
                {filtered.map(c => (
                  <button key={c.code} type="button" onClick={() => { onDdiChange(c.ddi); setOpen(false); setSearch(''); }}
                    className={`w-full text-left px-3 py-2 flex items-center gap-2.5 hover:bg-gray-50 transition-colors ${c.ddi === ddi ? 'bg-[#0a1628] text-white' : 'text-[#1a2b4a]'}`}>
                    <span>{c.flag}</span>
                    <span className="text-xs font-semibold">{c.ddi}</span>
                    <span className="text-xs font-bold truncate">{c.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <input type="tel" value={phone} onChange={e => onPhoneChange(applyMask(e.target.value, selected.mask))}
          placeholder={selected.mask.replace(/#/g, '0')}
          className="flex-1 bg-gray-50 border border-gray-200 py-3 px-4 font-bold text-[#1a2b4a] text-sm focus:border-[#c9a96e] outline-none transition-all placeholder:text-gray-300" />
      </div>
    </div>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  f: BoatForm; fd: (k: string, v: string) => void;
  propDocType: string; setPropDocType: (v: string) => void;
  propDocNr: string; setPropDocNr: (v: string) => void;
  propDocFront: string; setPropDocFront: (v: string) => void;
  propDocBack: string; setPropDocBack: (v: string) => void;
  onBack: () => void; onNext: (e: React.FormEvent) => void;
}

type OwnerMode = 'search' | 'empresa';

// ── Componente ────────────────────────────────────────────────────────────────
export function BoatStep2Proprietario({
  f, fd, propDocType, setPropDocType, propDocNr, setPropDocNr,
  propDocFront, setPropDocFront, propDocBack, setPropDocBack,
  onBack, onNext,
}: Props) {
  const [profileCard, setProfileCard] = useState<{
    name: string; email: string; profileNumber?: string;
    docType?: string; docNr?: string; phone?: string;
    nif?: string; morada?: string;
  } | null>(null);

  const [ownerMode, setOwnerMode] = useState<OwnerMode>('search');

  // Estado para empresa encontrada pelo NIF
  const [companyCard, setCompanyCard] = useState<{
    name: string; nif: string; email: string; telefone: string; morada: string; numero: string;
  } | null>(null);
  const [nifSearched, setNifSearched] = useState(false);

  function handleEmailBlur(email: string) {
    if (!email || ownerMode !== 'search') return;
    const norm = email.toLowerCase().trim();

    const clients = getClients();
    const client = clients.find(c => c.email?.toLowerCase() === norm);
    if (client) {
      const phone = (client.phone || '').replace(/^\+\d{1,3}\s?/, '');
      const nif   = (client as any).cpf_nif || (client as any).nif || '';
      const morada = (client as any).endereco || (client as any).morada || '';
      fd('proprietario', client.name || '');
      fd('propTelefone', phone);
      fd('nif',   nif);
      fd('morada', morada);
      setPropDocType(client.doc_type       || '');
      setPropDocNr(client.passport_number  || '');
      setProfileCard({
        name: client.name, email: client.email,
        profileNumber: client.profile_number,
        docType: client.doc_type, docNr: client.passport_number,
        phone, nif, morada,
      });
      return;
    }

    const sailors = getSailors();
    const sailor = sailors.find(s => s.email?.toLowerCase() === norm);
    if (sailor) {
      const phone = (sailor.phone || '').replace(/^\+\d{1,3}\s?/, '');
      const nif   = (sailor as any).cpf_nif || '';
      const morada = (sailor as any).endereco || '';
      fd('proprietario', sailor.name || '');
      fd('propTelefone', phone);
      fd('nif',   nif);
      fd('morada', morada);
      setPropDocType(sailor.passaporte?.tipo   || '');
      setPropDocNr(sailor.passaporte?.numero   || '');
      setProfileCard({
        name: sailor.name, email: sailor.email,
        profileNumber: sailor.profile_number,
        docType: sailor.passaporte?.tipo, docNr: sailor.passaporte?.numero,
        phone, nif, morada,
      });
    }
  }

  function clearProfile() {
    setProfileCard(null);
    fd('email', ''); fd('proprietario', ''); fd('propTelefone', '');
    fd('nif', ''); fd('morada', '');
    setPropDocType(''); setPropDocNr('');
  }

  function handleNifBlur(nif: string) {
    if (!nif.trim() || ownerMode !== 'empresa') return;
    const norm = nif.replace(/[\s.\-\/]/g, '').toLowerCase();
    if (!norm) return;

    const companies = getCompanies();
    const found = companies.find(c =>
      c.numero_fiscal.replace(/[\s.\-\/]/g, '').toLowerCase() === norm ||
      c.numero_registro.replace(/[\s.\-\/]/g, '').toLowerCase() === norm
    );

    if (found) {
      const morada = [found.endereco, found.cidade, found.codigo_postal, found.pais_nome].filter(Boolean).join(', ');
      fd('proprietario', found.razao_social || found.nome_fantasia);
      fd('email', found.email);
      fd('propTelefone', found.telefone.replace(/^\+\d{1,3}\s?/, ''));
      fd('morada', morada);
      setCompanyCard({
        name:     found.razao_social || found.nome_fantasia,
        nif:      found.numero_fiscal,
        email:    found.email,
        telefone: found.telefone,
        morada,
        numero:   found.numero_registro,
      });
      setNifSearched(true);
    } else {
      setCompanyCard(null);
      setNifSearched(true);
    }
  }

  function clearCompanyCard() {
    setCompanyCard(null);
    setNifSearched(false);
    fd('nif', ''); fd('proprietario', ''); fd('email', '');
    fd('propTelefone', ''); fd('morada', '');
  }

  const isProfileFound = !!profileCard && ownerMode === 'search';

  return (
    <form onSubmit={onNext} className="space-y-4">

      {/* ── Modo de proprietário ── */}
      <div>
        <p className="text-[10px] font-semibold text-[#1a2b4a] uppercase tracking-[0.15em] mb-2">Tipo de proprietário</p>
        <div className="grid grid-cols-2 gap-2">
          {([
            { key: 'search',  label: 'Conta NorthWindy', icon: <ShieldCheck className="w-4 h-4" /> },
            { key: 'empresa', label: 'Empresa',           icon: <Building2 className="w-4 h-4" /> },
          ] as { key: OwnerMode; label: string; icon: React.ReactNode }[]).map(m => (
            <button key={m.key} type="button"
              onClick={() => { setOwnerMode(m.key); clearProfile(); setCompanyCard(null); setNifSearched(false); }}
              className={`flex flex-col items-center gap-1.5 py-3 px-2 border font-semibold text-[10px] uppercase transition-all
                ${ownerMode === m.key ? 'bg-[#0a1628] border-[#0a1628] text-white' : 'bg-gray-50 border-gray-100 text-[#1a2b4a] hover:border-[#c9a96e]/30'}`}>
              {m.icon}
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Modo: Conta NorthWindy ── */}
      {ownerMode === 'search' && (
        <>
          <div>
            <label className="block text-xs font-semibold text-[#1a2b4a] uppercase mb-1.5">Email da conta</label>
            <input
              type="email" value={f.email}
              onChange={e => { fd('email', e.target.value.toUpperCase()); setProfileCard(null); }}
              onBlur={e => handleEmailBlur(e.target.value)}
              placeholder="EMAIL@EXEMPLO.COM"
              className="w-full bg-gray-50 border border-gray-200 py-3 px-4 font-bold text-[#1a2b4a] text-sm focus:border-[#c9a96e] outline-none transition-all placeholder:text-gray-300 uppercase"
            />
          </div>

          {isProfileFound && profileCard ? (
            <>
              <ProfileCard {...profileCard} />
              <button type="button" onClick={clearProfile}
                className="w-full text-center text-[10px] font-semibold text-gray-400 hover:text-red-500 transition-colors uppercase tracking-wider">
                ✕ Remover e pesquisar outro
              </button>
            </>
          ) : (
            <div className="bg-[#0a1628]/5 border border-[#c9a96e]/20 px-4 py-3 text-[10px] font-bold text-[#1a2b4a]">
              💡 Introduza o email e clique fora do campo para pesquisar o perfil automaticamente.
            </div>
          )}
        </>
      )}

      {/* ── Modo: Empresa ── */}
      {ownerMode === 'empresa' && (
        <>
          <div className="bg-[#c9a96e]/5 border border-[#c9a96e]/20 px-4 py-3 text-[10px] font-bold text-[#1a2b4a]">
            🏢 Introduza o NIF/NIPC/CNPJ — os dados são preenchidos automaticamente se a empresa estiver cadastrada na NorthWindy.
          </div>

          {/* ── NIF PRIMEIRO — com lookup automático ── */}
          <div>
            <label className="block text-xs font-semibold text-[#1a2b4a] uppercase mb-1.5">
              NIF / NIPC / CNPJ *
            </label>
            <div className="relative">
              <input
                type="text"
                value={f.nif}
                onChange={e => { fd('nif', e.target.value.toUpperCase()); setCompanyCard(null); setNifSearched(false); }}
                onBlur={e => handleNifBlur(e.target.value)}
                placeholder="INTRODUZA O NÚMERO FISCAL E CLIQUE FORA"
                className={`w-full border py-3 px-4 font-bold text-[#1a2b4a] text-sm outline-none transition-all placeholder:text-gray-300 uppercase ${
                  companyCard
                    ? 'bg-[#0a1628]/5 border-[#c9a96e]/30 focus:border-[#c9a96e]'
                    : nifSearched && !companyCard
                    ? 'bg-[#c9a96e]/5 border-[#c9a96e]/20 focus:border-[#c9a96e]'
                    : 'bg-gray-50 border-gray-200 focus:border-[#c9a96e]'
                }`}
              />
              {companyCard && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1a2b4a] text-[10px] font-semibold uppercase">
                  ✓ Encontrada
                </span>
              )}
            </div>
            {nifSearched && !companyCard && (
              <p className="text-[10px] font-bold text-amber-600 mt-1.5 ml-1">
                ⚠️ Empresa não encontrada na NorthWindy — preencha manualmente abaixo.
              </p>
            )}
            {!nifSearched && (
              <p className="text-[10px] font-bold text-gray-400 mt-1 ml-1">
                💡 Clique fora do campo para pesquisar automaticamente.
              </p>
            )}
          </div>

          {/* Card empresa encontrada */}
          {companyCard && (
            <CompanyCard company={companyCard} onClear={clearCompanyCard} />
          )}

          {/* Restantes campos — só mostrar se empresa NÃO foi encontrada */}
          {!companyCard && (
            <>
              <BoatInput
                label="Razão Social / Nome da empresa"
                value={f.proprietario}
                onChange={v => fd('proprietario', v)} required
                placeholder="RAZÃO SOCIAL"
              />

              <BoatInput
                label="Email de contacto" value={f.email}
                onChange={v => fd('email', v)}
                placeholder="EMAIL@EXEMPLO.COM"
              />

              <div className="grid grid-cols-2 gap-3">
                <BoatInput label="Tipo de documento" value={propDocType} onChange={v => setPropDocType(v.toUpperCase())}
                  placeholder="EX: NIPC" />
                <BoatInput label="Nº documento" value={propDocNr} onChange={v => setPropDocNr(v.toUpperCase())} placeholder="Nº" />
              </div>

              <BoatInput label="Morada" value={f.morada} onChange={v => fd('morada', v)}
                placeholder="RUA, Nº, CÓDIGO POSTAL, CIDADE" />

              <PhoneInput
                label="Contacto telefónico"
                ddi={f.propDdi}        onDdiChange={v => fd('propDdi', v)}
                phone={f.propTelefone} onPhoneChange={v => fd('propTelefone', v)}
              />
            </>
          )}
        </>
      )}

      {/* ── Campos extra quando perfil encontrado: permite editar NIF/Morada se em branco ── */}
      {isProfileFound && (
        <div className="space-y-3 pt-1">
          {!profileCard?.nif && (
            <BoatInput label="NIF / Documento fiscal" value={f.nif}
              onChange={v => fd('nif', v)} placeholder="NIF / CNPJ / EIN" />
          )}
          {!profileCard?.morada && (
            <BoatInput label="Morada" value={f.morada}
              onChange={v => fd('morada', v)} placeholder="RUA, Nº, CÓDIGO POSTAL, CIDADE" />
          )}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onBack}
          className="px-5 py-4 border border-gray-200 text-gray-400 font-semibold text-sm uppercase hover:border-[#0a1628] hover:text-[#1a2b4a] transition-all flex items-center gap-1">
          <ChevronLeft className="w-4 h-4" /> Voltar
        </button>
        <button type="submit"
          className="flex-1 bg-[#0a1628] text-white py-4 font-semibold uppercase text-sm hover:bg-[#0a1628]/90 transition-all flex items-center justify-center gap-2">
          Próximo <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}
