// src/lib/store/docExpiry.ts — MIGRADO PARA SUPABASE
import { supabase } from '../supabase';
import { blockProfile, unblockProfile } from './profiles';
import { sendSystemMessage } from './messages';

function isExpired(d?: string): boolean {
  if (!d) return false;
  return new Date(d + 'T23:59:59') < new Date();
}

function isExpiringSoon(d?: string, days = 30): boolean {
  if (!d) return false;
  const exp = new Date(d + 'T23:59:59');
  const lim = new Date(); lim.setDate(lim.getDate() + days);
  return exp > new Date() && exp <= lim;
}

function fmtDate(d: string): string {
  try { return new Date(d + 'T12:00').toLocaleDateString('pt-BR'); } catch { return d; }
}

export async function runDocumentExpiryCheck(): Promise<void> {
  // ── Verificar Sailors aprovados ───────────────────────────────────────────
  const { data: sailors } = await supabase
    .from('sailors').select('*').eq('status', 'approved');

  for (const s of sailors ?? []) {
    const docs = [
      { label: 'Passaporte / Documento de ID',  validade: s.passaporte_validade },
      { label: 'Carta de Patrão / Habilitação', validade: s.cartahabitacao_validade },
      { label: 'Certificado Médico Marítimo',   validade: s.medico_validade },
    ];

    const expired  = docs.filter(d => d.validade && isExpired(d.validade));
    const expiring = docs.filter(d => d.validade && isExpiringSoon(d.validade));

    if (expired.length > 0) {
      const reason = expired.map(d => `${d.label} (expirou em ${fmtDate(d.validade!)})`).join(', ');
      if (!s.blocked) await blockProfile(s.id, 'sailor', reason);
    } else if (s.blocked && s.block_reason?.includes('expirou')) {
      await unblockProfile(s.id, 'sailor');
    }

    // Verificar se já foi avisado nos últimos 20 dias
    for (const d of expiring) {
      const { count } = await supabase
        .from('messages').select('*', { count: 'exact', head: true })
        .eq('client_id', s.id)
        .eq('type', 'doc_expiring_soon')
        .ilike('title', `%${d.label}%`)
        .gte('created_at', new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString());

      if (!count || count === 0) {
        await sendSystemMessage({
          client_id: s.id, type: 'doc_expiring_soon',
          title: `⚠️ Documento a Expirar: ${d.label}`,
          body:  `O seu ${d.label} expira em ${fmtDate(d.validade!)}. Actualize a documentação para evitar o bloqueio da sua conta.`,
          meta:  {},
        });
      }
    }

    for (const d of expired) {
      const { count } = await supabase
        .from('messages').select('*', { count: 'exact', head: true })
        .eq('client_id', s.id)
        .eq('type', 'doc_expired')
        .ilike('title', `%${d.label}%`)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      if (!count || count === 0) {
        await sendSystemMessage({
          client_id: s.id, type: 'doc_expired',
          title: `🚫 Documento Expirado: ${d.label}`,
          body:  `O seu ${d.label} expirou em ${fmtDate(d.validade!)}. A sua conta foi bloqueada. Envie documentação actualizada ao suporte.`,
          meta:  {},
        });
      }
    }
  }

  // ── Verificar Clients activos ─────────────────────────────────────────────
  const { data: clients } = await supabase
    .from('clients').select('*').eq('status', 'active');

  for (const c of clients ?? []) {
    const val = c.passport_expires;

    if (val && isExpired(val)) {
      if (!c.blocked) await blockProfile(c.id, 'client', `Documento expirou em ${fmtDate(val)}`);
    } else if (c.blocked && c.block_reason?.includes('expirou')) {
      await unblockProfile(c.id, 'client');
    }

    if (val && isExpiringSoon(val)) {
      const { count } = await supabase
        .from('messages').select('*', { count: 'exact', head: true })
        .eq('client_id', c.id)
        .eq('type', 'doc_expiring_soon')
        .gte('created_at', new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString());

      if (!count || count === 0) {
        await sendSystemMessage({
          client_id: c.id, type: 'doc_expiring_soon',
          title: '⚠️ Documento a Expirar',
          body:  `O seu documento de identificação expira em ${fmtDate(val)}. Actualize a documentação para evitar o bloqueio da sua conta.`,
          meta:  {},
        });
      }
    }
  }
}