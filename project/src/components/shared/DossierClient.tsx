// src/components/shared/DossierClient.tsx
// Modal de dossiê de um Client verificado.
import { useState } from 'react';
import {
  resolveDocUrl,
  blockProfile,
  unblockProfile,
  updateClient,
  approveClient,
  getClients,
  type Client,
} from '../../lib/localStore';
import { DocImage, DossierField, DOC_TYPE_LABELS, stripNonDigits } from './adminHelpers';
import { DossierShell }     from './dossier/DossierShell';
import { CredentialsBlock } from './dossier/CredentialsBlock';

// ── Props ─────────────────────────────────────────────────────────────────────

interface DossierClientProps {
  client: Client;
  onClose: () => void;
  onClientsChange: (clients: Client[]) => void;
  onDeleteRequest: (id: string, name: string) => void;
}

// ── Componente ────────────────────────────────────────────────────────────────

export function DossierClient({
  client,
  onClose,
  onClientsChange,
  onDeleteRequest,
}: DossierClientProps) {
  const isBlocked = !!(client as any).blocked;

  const [credsRefresh, setCredsRefresh] = useState(0);
  const stored       = getClients().find((x: any) => x.id === client.id);
  const clientLogin  = (stored as any)?.client_login   as string | undefined;
  const clientPasswd = (stored as any)?.client_password as string | undefined;

  // ── handlers ────────────────────────────────────────────────────────────────

  async function handleGenerateCredentials() {
    const pNum         = String(parseInt((client as any).profile_number || '1', 10));
    const client_login = client.name
      .split(' ')[0].toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '') + '#' + pNum;
    await approveClient(client.id);
    await updateClient(client.id, { client_login, client_password: '0000' } as any);
    onClientsChange(getClients());
    setCredsRefresh(r => r + 1);
  }

  async function handleBlock() {
    const reason = prompt('Motivo do bloqueio:');
    if (!reason) return;
    await blockProfile(client.id, 'client', reason);
    onClientsChange(getClients());
    onClose();
  }

  async function handleUnblock() {
    await unblockProfile(client.id, 'client');
    onClientsChange(getClients());
    onClose();
  }

  // ── render ──────────────────────────────────────────────────────────────────

  const frontUrl = resolveDocUrl((client as any).doc_url);
  const backUrl  = resolveDocUrl((client as any).doc_back_url);

  const badges = (
    <>
      <span className="bg-green-400 text-green-900 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
        ✓ Verificado
      </span>
      {isBlocked && (
        <span className="bg-red-500 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
          🚫 Bloqueado
        </span>
      )}
      {(client as any).profile_number && (
        <span className="bg-white/20 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full">
          Perfil #{String(parseInt((client as any).profile_number, 10))}
        </span>
      )}
    </>
  );

  return (
    <DossierShell
      initials={client.name.substring(0, 2).toUpperCase()}
      subtitle="Dossiê · Usuário NorthWindy"
      name={client.name}
      badges={badges}
      onClose={onClose}
    >
      {/* 1. Dados Pessoais */}
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
          👤 Dados Pessoais
        </p>
        <div className="grid grid-cols-2 gap-3">
          {([
            ['Nome',         client.name],
            ['E-mail',       client.email],
            ['Telefone',     client.phone || '—'],
            ['Nascimento',   (client as any).birth_date || '—'],
            ['País',         client.country_name || '—'],
            ['Idioma',       (client as any).language || '—'],
            ['Fuso Horário', (client as any).timezone || '—'],
            ['Cadastro',     new Date(client.created_at).toLocaleDateString('pt-BR')],
          ] as [string, string][]).map(([l, v]) => (
            <DossierField key={l} label={l} value={v} />
          ))}
        </div>
      </div>

      {/* 2. Documento de Identificação */}
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
          🪪 Documento de Identificação
        </p>
        <div className="bg-gray-50 rounded-[18px] p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {([
              ['Tipo Doc.',    DOC_TYPE_LABELS[(client as any).doc_type || ''] || (client as any).doc_type || '—'],
              ['Nº Documento', client.passport_number || '—'],
              ['Validade',     client.passport_expires
                ? new Date(client.passport_expires + 'T12:00').toLocaleDateString('pt-BR')
                : '—'],
            ] as [string, string][]).map(([l, v]) => (
              <div key={l} className="bg-white rounded-[12px] p-3">
                <p className="text-[9px] font-black text-gray-400 uppercase">{l}</p>
                <p className="font-black text-blue-900 text-sm mt-0.5">{v}</p>
              </div>
            ))}
          </div>
          {frontUrl && <DocImage url={frontUrl} label="Frente do Documento" />}
          {backUrl  && <DocImage url={backUrl}  label="Verso do Documento" />}
        </div>
      </div>

      {/* 3. Credenciais */}
      <div key={credsRefresh}>
        {clientLogin ? (
          <CredentialsBlock login={clientLogin} password={clientPasswd || '0000'} />
        ) : (
          <button
            onClick={handleGenerateCredentials}
            className="w-full bg-blue-900 hover:bg-blue-800 text-white py-3.5 rounded-[20px] font-black uppercase text-sm transition-all flex items-center justify-center gap-2 shadow-md"
          >
            🔑 Gerar Credenciais Agora
          </button>
        )}
      </div>

      {/* 4. WhatsApp */}
      {client.phone && (
        <a
          href={`https://wa.me/${stripNonDigits(client.phone)}?text=${encodeURIComponent('Olá ' + client.name + '! Como posso ajudar?')}`}
          target="_blank"
          rel="noreferrer"
          className="w-full bg-green-500 hover:bg-green-400 text-white py-4 rounded-[25px] font-black uppercase text-sm transition-all flex items-center justify-center gap-2 shadow-md"
        >
          <span className="text-lg">📲</span> Contactar via WhatsApp
        </a>
      )}

      {/* 5. Bloquear / Desbloquear */}
      {isBlocked ? (
        <button
          onClick={handleUnblock}
          className="w-full bg-green-600 hover:bg-green-500 text-white py-4 rounded-[25px] font-black uppercase text-sm transition-all flex items-center justify-center gap-2 shadow-md"
        >
          🔓 Desbloquear Conta
        </button>
      ) : (
        <button
          onClick={handleBlock}
          className="w-full bg-red-50 hover:bg-red-100 border-2 border-red-200 text-red-600 py-3 rounded-[25px] font-black uppercase text-sm transition-all flex items-center justify-center gap-2"
        >
          🚫 Bloquear Conta
        </button>
      )}

      {/* 6. Excluir */}
      <button
        onClick={() => onDeleteRequest(client.id, client.name)}
        className="w-full bg-red-50 hover:bg-red-100 border-2 border-red-200 text-red-500 py-3 rounded-[25px] font-black uppercase text-sm transition-all flex items-center justify-center gap-2"
      >
        🗑️ Excluir Cadastro
      </button>
    </DossierShell>
  );
}
