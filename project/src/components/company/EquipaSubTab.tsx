// src/components/company/EquipaSubTab.tsx
import { useState } from 'react';
import { Users, UserPlus, Search, Mail, X, Check, Trash2, AlertCircle } from 'lucide-react';
import { getSailors, getClients } from '../../lib/localStore';
import { addStaff, removeStaff as dbRemoveStaff, type StaffMember } from '../../lib/rh';
import { Avatar, ROLES, STAFF_STATUS_CLS } from './RHShared';

interface Props {
  staff:     StaffMember[];
  setStaff:  React.Dispatch<React.SetStateAction<StaffMember[]>>;
  companyId: string;
  onToast:   (msg: string) => void;
}

export function EquipaSubTab({ staff, setStaff, companyId, onToast }: Props) {
  const [showInvite,   setShowInvite]   = useState(false);
  const [searchEmail,  setSearchEmail]  = useState('');
  const [searchStep,   setSearchStep]   = useState<'input' | 'found' | 'notfound'>('input');
  const [foundProfile, setFoundProfile] = useState<{ id: string; nome: string; email: string; certs: string[]; status: string; tipo: string } | null>(null);
  const [selRole,      setSelRole]      = useState('Tripulante');
  const [invError,     setInvError]     = useState('');

  function doSearch() {
    const q = searchEmail.trim().toLowerCase();
    if (!q || !q.includes('@')) { setInvError('Informe um e-mail válido.'); return; }
    if (staff.some(s => s.email.toLowerCase() === q)) { setInvError('Este e-mail já está na equipa.'); return; }
    setInvError('');

    const sailors = getSailors();
    const sailor  = sailors.find(s => s.email?.toLowerCase() === q);
    if (sailor) {
      const certs: string[] = [];
      if (sailor.cartahabitacao?.numero) certs.push('Habilitação Náutica');
      const stcwKeys = Object.entries(sailor.stcw || {}).filter(([, v]) => v).map(([k]) => k);
      certs.push(...stcwKeys);
      if (sailor.medico?.validade) certs.push('Cert. Médico');
      setFoundProfile({ id: sailor.id, nome: sailor.name, email: sailor.email, certs, status: sailor.status, tipo: 'sailor' });
      setSearchStep('found');
      return;
    }

    const clients = getClients();
    const client  = clients.find(c => c.email?.toLowerCase() === q);
    if (client) {
      setFoundProfile({ id: client.id, nome: client.name, email: client.email, certs: [], status: client.status, tipo: 'client' });
      setSearchStep('found');
      return;
    }

    setSearchStep('notfound');
  }

  async function confirmInvite() {
    if (!foundProfile) return;
    const newMember: StaffMember = {
      id:      foundProfile.id,
      nome:    foundProfile.nome,
      email:   foundProfile.email,
      cargo:   selRole,
      status:  'disponível',
      cert:    foundProfile.certs[0] || '—',
      barco:   '—',
      addedAt: new Date().toISOString(),
    };
    setStaff(prev => [...prev, newMember]);
    await addStaff(companyId, newMember);
    closeInvite();
    onToast(`✅ ${foundProfile.nome} adicionado à equipa!`);
  }

  function closeInvite() {
    setShowInvite(false);
    setSearchEmail(''); setFoundProfile(null); setSearchStep('input'); setSelRole('Tripulante'); setInvError('');
  }

  async function handleRemove(id: string) {
    setStaff(prev => prev.filter(s => s.id !== id));
    await dbRemoveStaff(companyId, id);
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em] flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5" /> Equipa
        </p>
        <p className="text-[10px] text-gray-400 font-semibold">{staff.length} funcionário{staff.length !== 1 ? 's' : ''}</p>
      </div>

      {showInvite && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={closeInvite}>
          <div className="bg-white w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
            <div className="bg-[#0a1628] px-6 py-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em]">
                  {searchStep === 'input' ? 'Passo 1 de 2' : searchStep === 'found' ? 'Passo 2 de 2' : 'Não encontrado'}
                </p>
                <h3 className="text-base font-['Playfair_Display'] font-bold text-white uppercase italic">
                  {searchStep === 'input' ? 'Buscar por E-mail' : searchStep === 'found' ? 'Perfil Encontrado' : 'Sem Cadastro'}
                </h3>
              </div>
              <button onClick={closeInvite} className="bg-white/10 p-2 text-white hover:bg-white/20 transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {searchStep === 'input' && (
                <>
                  <p className="text-xs font-semibold text-gray-500">E-mail do funcionário cadastrado na plataforma:</p>
                  {invError && (
                    <div className="bg-red-50 border border-red-100 px-4 py-3 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                      <p className="text-xs font-semibold text-red-700">{invError}</p>
                    </div>
                  )}
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                    <input value={searchEmail} onChange={e => { setSearchEmail(e.target.value); setInvError(''); }}
                      onKeyDown={e => e.key === 'Enter' && doSearch()}
                      placeholder="email@exemplo.com" autoFocus
                      className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-200 font-semibold text-[#1a2b4a] text-sm focus:border-[#c9a96e] outline-none transition-all" />
                  </div>
                  <button onClick={doSearch}
                    className="w-full bg-[#0a1628] hover:bg-[#1a2b4a] text-white py-3.5 font-bold text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                    <Search className="w-4 h-4" /> Buscar
                  </button>
                </>
              )}
              {searchStep === 'notfound' && (
                <>
                  <div className="bg-[#c9a96e]/5 border border-[#c9a96e]/20 p-5 text-center space-y-2">
                    <p className="text-3xl">🔍</p>
                    <p className="font-bold text-[#1a2b4a] text-sm">Nenhum cadastro encontrado</p>
                    <p className="text-xs font-semibold text-[#1a2b4a]">O e-mail <span className="font-bold">{searchEmail}</span> não está registado na plataforma.</p>
                  </div>
                  <button onClick={() => { setSearchStep('input'); setInvError(''); }}
                    className="w-full border border-gray-200 text-gray-500 py-3 font-semibold text-xs uppercase hover:border-[#c9a96e]/30 transition-all">
                    ← Tentar outro e-mail
                  </button>
                </>
              )}
              {searchStep === 'found' && foundProfile && (
                <>
                  <div className="bg-[#0a1628]/5 border border-[#c9a96e]/20 p-4 space-y-2">
                    <div className="flex items-center gap-3">
                      <Avatar nome={foundProfile.nome} size={12} />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[#1a2b4a] text-sm">{foundProfile.nome}</p>
                        <p className="text-xs font-semibold text-gray-500 truncate">{foundProfile.email}</p>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 ${foundProfile.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                          {foundProfile.status === 'active' ? '✓ Ativo' : 'Pendente'}
                        </span>
                      </div>
                    </div>
                    {foundProfile.certs.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1 border-t border-[#c9a96e]/20">
                        {foundProfile.certs.slice(0, 4).map(c => (
                          <span key={c} className="bg-[#c9a96e]/15 text-[#c9a96e] text-[10px] font-semibold px-2 py-0.5">{c}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em] ml-1 mb-2 block">Função na empresa *</label>
                    <div className="flex flex-wrap gap-2">
                      {ROLES.map(r => (
                        <button key={r} type="button" onClick={() => setSelRole(r)}
                          className={`px-3 py-1.5 text-[10px] font-semibold border transition-all ${selRole === r ? 'bg-[#0a1628] text-white border-[#0a1628]' : 'bg-gray-50 text-gray-500 border-gray-100 hover:border-[#c9a96e]/30'}`}>
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setSearchStep('input')}
                      className="px-4 py-3 border border-gray-200 text-gray-400 font-semibold text-xs uppercase hover:border-[#c9a96e]/30 transition-all">
                      Voltar
                    </button>
                    <button onClick={confirmInvite}
                      className="flex-1 bg-[#0a1628] hover:bg-[#1a2b4a] text-white py-3 font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                      <Check className="w-4 h-4" /> Confirmar
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {staff.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-gray-200 py-14 text-center">
          <Users className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="font-semibold text-gray-300 uppercase italic text-sm">Sem funcionários</p>
          <p className="text-xs text-gray-400 font-semibold mt-1">Adicione o primeiro membro da equipa.</p>
          <button onClick={() => setShowInvite(true)}
            className="mt-4 bg-[#0a1628] text-white px-6 py-2.5 font-semibold text-xs uppercase hover:bg-[#1a2b4a] transition-all flex items-center gap-1.5 mx-auto">
            <UserPlus className="w-3.5 h-3.5" /> + Incluir novo funcionário
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {staff.map(s => (
            <div key={s.id} className="bg-white border border-gray-100 px-4 py-3 flex items-center gap-3 group hover:border-[#c9a96e]/30 transition-all">
              <Avatar nome={s.nome} />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[#1a2b4a] text-sm truncate">{s.nome}</p>
                <p className="text-xs font-semibold text-gray-500">{s.cargo}</p>
                {s.cert !== '—' && (
                  <span className="inline-block mt-0.5 bg-[#c9a96e]/15 text-[#c9a96e] text-[10px] font-semibold px-2 py-0.5">{s.cert}</span>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 ${STAFF_STATUS_CLS[s.status] || 'bg-gray-100 text-gray-500'}`}>
                  {s.status}
                </span>
                <button onClick={() => handleRemove(s.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-600 p-1">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
          <button onClick={() => setShowInvite(true)}
            className="w-full border-2 border-dashed border-[#c9a96e]/30 hover:border-[#c9a96e] bg-[#0a1628]/5 hover:bg-gray-50 text-[#1a2b4a] py-3 font-semibold text-xs uppercase transition-all flex items-center justify-center gap-2">
            <UserPlus className="w-4 h-4" /> + Incluir novo funcionário
          </button>
        </div>
      )}
    </div>
  );
}
