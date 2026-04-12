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
        <p className="text-xs font-black text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5" /> Equipa
        </p>
        <p className="text-[10px] text-gray-400 font-bold">{staff.length} funcionário{staff.length !== 1 ? 's' : ''}</p>
      </div>

      {showInvite && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={closeInvite}>
          <div className="bg-white w-full max-w-sm rounded-[28px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
            <div className="bg-blue-900 px-6 py-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest">
                  {searchStep === 'input' ? 'Passo 1 de 2' : searchStep === 'found' ? 'Passo 2 de 2' : 'Não encontrado'}
                </p>
                <h3 className="text-base font-black text-white uppercase italic">
                  {searchStep === 'input' ? 'Buscar por E-mail' : searchStep === 'found' ? 'Perfil Encontrado' : 'Sem Cadastro'}
                </h3>
              </div>
              <button onClick={closeInvite} className="bg-blue-800 p-2 rounded-full text-white hover:bg-blue-700 transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {searchStep === 'input' && (
                <>
                  <p className="text-xs font-bold text-gray-500">E-mail do funcionário cadastrado na plataforma:</p>
                  {invError && (
                    <div className="bg-red-50 border-2 border-red-100 rounded-[14px] px-4 py-3 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                      <p className="text-xs font-bold text-red-700">{invError}</p>
                    </div>
                  )}
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                    <input value={searchEmail} onChange={e => { setSearchEmail(e.target.value); setInvError(''); }}
                      onKeyDown={e => e.key === 'Enter' && doSearch()}
                      placeholder="email@exemplo.com" autoFocus
                      className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-[16px] font-bold text-blue-900 text-sm focus:border-blue-900 outline-none transition-all" />
                  </div>
                  <button onClick={doSearch}
                    className="w-full bg-blue-900 hover:bg-blue-800 text-white py-3.5 rounded-[16px] font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                    <Search className="w-4 h-4" /> Buscar
                  </button>
                </>
              )}
              {searchStep === 'notfound' && (
                <>
                  <div className="bg-amber-50 border-2 border-amber-100 rounded-[16px] p-5 text-center space-y-2">
                    <p className="text-3xl">🔍</p>
                    <p className="font-black text-amber-800 text-sm">Nenhum cadastro encontrado</p>
                    <p className="text-xs font-bold text-amber-700">O e-mail <span className="font-black">{searchEmail}</span> não está registado na plataforma.</p>
                  </div>
                  <button onClick={() => { setSearchStep('input'); setInvError(''); }}
                    className="w-full border-2 border-gray-200 text-gray-500 py-3 rounded-[14px] font-black text-xs uppercase hover:border-blue-300 transition-all">
                    ← Tentar outro e-mail
                  </button>
                </>
              )}
              {searchStep === 'found' && foundProfile && (
                <>
                  <div className="bg-blue-50 border-2 border-blue-100 rounded-[16px] p-4 space-y-2">
                    <div className="flex items-center gap-3">
                      <Avatar nome={foundProfile.nome} size={12} />
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-blue-900 text-sm">{foundProfile.nome}</p>
                        <p className="text-xs font-bold text-gray-500 truncate">{foundProfile.email}</p>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${foundProfile.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                          {foundProfile.status === 'active' ? '✓ Ativo' : 'Pendente'}
                        </span>
                      </div>
                    </div>
                    {foundProfile.certs.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1 border-t border-blue-100">
                        {foundProfile.certs.slice(0, 4).map(c => (
                          <span key={c} className="bg-blue-100 text-blue-700 text-[10px] font-black px-2 py-0.5 rounded-full">{c}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-blue-900 uppercase tracking-wider ml-1 mb-2 block">Função na empresa *</label>
                    <div className="flex flex-wrap gap-2">
                      {ROLES.map(r => (
                        <button key={r} type="button" onClick={() => setSelRole(r)}
                          className={`px-3 py-1.5 rounded-[10px] text-[10px] font-black border-2 transition-all ${selRole === r ? 'bg-blue-900 text-white border-blue-900' : 'bg-gray-50 text-gray-500 border-gray-100 hover:border-blue-300'}`}>
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setSearchStep('input')}
                      className="px-4 py-3 border-2 border-gray-100 text-gray-400 rounded-[14px] font-black text-xs uppercase hover:border-gray-200 transition-all">
                      Voltar
                    </button>
                    <button onClick={confirmInvite}
                      className="flex-1 bg-blue-900 hover:bg-blue-800 text-white py-3 rounded-[14px] font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2">
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
        <div className="bg-white border-2 border-dashed border-gray-200 rounded-[24px] py-14 text-center">
          <Users className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="font-black text-gray-300 uppercase italic text-sm">Sem funcionários</p>
          <p className="text-xs text-gray-400 font-bold mt-1">Adicione o primeiro membro da equipa.</p>
          <button onClick={() => setShowInvite(true)}
            className="mt-4 bg-blue-900 text-white px-6 py-2.5 rounded-[14px] font-black text-xs uppercase hover:bg-blue-800 transition-all flex items-center gap-1.5 mx-auto">
            <UserPlus className="w-3.5 h-3.5" /> + Incluir novo funcionário
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {staff.map(s => (
            <div key={s.id} className="bg-white border-2 border-gray-100 rounded-[16px] px-4 py-3 flex items-center gap-3 group hover:border-blue-100 transition-all">
              <Avatar nome={s.nome} />
              <div className="flex-1 min-w-0">
                <p className="font-black text-blue-900 text-sm truncate">{s.nome}</p>
                <p className="text-xs font-bold text-gray-500">{s.cargo}</p>
                {s.cert !== '—' && (
                  <span className="inline-block mt-0.5 bg-blue-50 text-blue-700 text-[10px] font-black px-2 py-0.5 rounded-full">{s.cert}</span>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${STAFF_STATUS_CLS[s.status] || 'bg-gray-100 text-gray-500'}`}>
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
            className="w-full border-2 border-dashed border-blue-200 hover:border-blue-400 bg-blue-50 hover:bg-blue-100 text-blue-700 py-3 rounded-[14px] font-black text-xs uppercase transition-all flex items-center justify-center gap-2">
            <UserPlus className="w-4 h-4" /> + Incluir novo funcionário
          </button>
        </div>
      )}
    </div>
  );
}
