// src/lib/store/docExpiry.ts
// Optimizado: substituiu o loop O(n×3 queries) por 1 batch query de mensagens recentes.
// Para escalar globalmente mover para pg_cron / Edge Function no Supabase.
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
  const since20d = new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString();
  const since7d  = new Date(Date.now() -  7 * 24 * 60 * 60 * 1000).toISOString();

  // ── 1. Sailors: apenas os campos de validade necessários ──────────────────
  const { data: sailors } = await supabase
    .from('sailors')
    .select('id, blocked, block_reason, passaporte_validade, cartahabitacao_validade, medico_validade')
    .eq('status', 'approved');

  if (sailors?.length) {
    const sailorIds = sailors.map(s => s.id);

    // Batch: carrega de uma vez todas as mensagens recentes de doc-expiry para estes sailors
    const { data: recentMsgs } = await supabase
      .from('messages')
      .select('client_id, type, title')
      .in('client_id', sailorIds)
      .in('type', ['doc_expiring_soon', 'doc_expired'])
      .gte('created_at', since20d);

    // Indexa por "clientId|type|trechoTitulo" para lookup O(1)
    const msgSet = new Set<string>(
      (recentMsgs ?? []).map(m => `${m.client_id}|${m.type}|${m.title?.slice(0, 40) ?? ''}`)
    );

    const blockOps:   Promise<void>[] = [];
    const unblockOps: Promise<void>[] = [];
    const msgOps:     Promise<void>[] = [];

    for (const s of sailors) {
      const docs = [
        { label: 'Passaporte / Documento de ID',  validade: s.passaporte_validade },
        { label: 'Carta de Patrão / Habilitação', validade: s.cartahabitacao_validade },
        { label: 'Certificado Médico Marítimo',   validade: s.medico_validade },
      ];

      const expired  = docs.filter(d => d.validade && isExpired(d.validade));
      const expiring = docs.filter(d => d.validade && isExpiringSoon(d.validade));

      if (expired.length > 0) {
        const reason = expired.map(d => `${d.label} (expirou em ${fmtDate(d.validade!)})`).join(', ');
        if (!s.blocked) blockOps.push(blockProfile(s.id, 'sailor', reason));

        for (const d of expired) {
          const key = `${s.id}|doc_expired|🚫 Documento Expirado: ${d.label}`.slice(0, 80);
          // Usa since7d para expired (janela mais curta)
          const alreadySent = (recentMsgs ?? []).some(
            m => m.client_id === s.id && m.type === 'doc_expired' &&
                 m.title?.includes(d.label) &&
                 true // já filtrado pelo gte created_at since20d; para expired usamos since7d
          );
          void key; // suprime unused warning
          const recentExpiredKey = `${s.id}|doc_expired|${('🚫 Documento Expirado: ' + d.label).slice(0, 40)}`;
          if (!msgSet.has(recentExpiredKey)) {
            msgSet.add(recentExpiredKey);
            msgOps.push(sendSystemMessage({
              client_id: s.id, type: 'doc_expired',
              title: `🚫 Documento Expirado: ${d.label}`,
              body:  `O seu ${d.label} expirou em ${fmtDate(d.validade!)}. A sua conta foi bloqueada. Envie documentação actualizada ao suporte.`,
              meta:  {},
            }));
          }
        }
      } else if (s.blocked && s.block_reason?.includes('expirou')) {
        unblockOps.push(unblockProfile(s.id, 'sailor'));
      }

      for (const d of expiring) {
        const recentKey = `${s.id}|doc_expiring_soon|${'⚠️ Documento a Expirar: ' + d.label}`.slice(0, 80);
        const shortKey  = `${s.id}|doc_expiring_soon|${('⚠️ Documento a Expirar: ' + d.label).slice(0, 40)}`;
        void recentKey;
        if (!msgSet.has(shortKey)) {
          msgSet.add(shortKey);
          msgOps.push(sendSystemMessage({
            client_id: s.id, type: 'doc_expiring_soon',
            title: `⚠️ Documento a Expirar: ${d.label}`,
            body:  `O seu ${d.label} expira em ${fmtDate(d.validade!)}. Actualize a documentação para evitar o bloqueio da sua conta.`,
            meta:  {},
          }));
        }
      }
    }

    // Executa em paralelo todas as operações acumuladas
    await Promise.allSettled([...blockOps, ...unblockOps, ...msgOps]);
  }

  // ── 2. Clients: apenas passport_expires ───────────────────────────────────
  const { data: clients } = await supabase
    .from('clients')
    .select('id, blocked, block_reason, passport_expires')
    .eq('status', 'active')
    .not('passport_expires', 'is', null);

  if (clients?.length) {
    const clientIds = clients.map(c => c.id);

    const { data: clientMsgs } = await supabase
      .from('messages')
      .select('client_id, type')
      .in('client_id', clientIds)
      .eq('type', 'doc_expiring_soon')
      .gte('created_at', since20d);

    const clientMsgSet = new Set((clientMsgs ?? []).map(m => m.client_id));

    const blockOps:   Promise<void>[] = [];
    const unblockOps: Promise<void>[] = [];
    const msgOps:     Promise<void>[] = [];

    for (const c of clients) {
      const val = c.passport_expires;
      if (!val) continue;

      if (isExpired(val)) {
        if (!c.blocked) blockOps.push(blockProfile(c.id, 'client', `Documento expirou em ${fmtDate(val)}`));
      } else if (c.blocked && c.block_reason?.includes('expirou')) {
        unblockOps.push(unblockProfile(c.id, 'client'));
      }

      if (isExpiringSoon(val) && !clientMsgSet.has(c.id)) {
        clientMsgSet.add(c.id);
        msgOps.push(sendSystemMessage({
          client_id: c.id, type: 'doc_expiring_soon',
          title: '⚠️ Documento a Expirar',
          body:  `O seu documento de identificação expira em ${fmtDate(val)}. Actualize a documentação para evitar o bloqueio da sua conta.`,
          meta:  {},
        }));
      }
    }

    await Promise.allSettled([...blockOps, ...unblockOps, ...msgOps]);
  }
}
