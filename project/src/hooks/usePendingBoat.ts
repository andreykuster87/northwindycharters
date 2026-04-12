// src/hooks/usePendingBoat.ts
import { useState } from 'react';
import type { CatalogBoat } from '../services/catalog';

const STORAGE_KEY = 'nw_pending_boat';

export function usePendingBoat() {
  const [pendingBoat, setPendingBoat] = useState<CatalogBoat | null>(null);

  /** Guarda o passeio na sessão para recuperar após o login */
  function holdForLogin(boat: CatalogBoat) {
    setPendingBoat(boat);
  }

  /** Transfere o passeio para a sessão e limpa o estado local */
  function flushToSession() {
    if (pendingBoat) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(pendingBoat));
      setPendingBoat(null);
    }
  }

  /** Lê e remove o passeio da sessão (usado dentro do ClientArea ao montar) */
  function consumeFromSession(): CatalogBoat | null {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        sessionStorage.removeItem(STORAGE_KEY);
        return JSON.parse(raw);
      }
    } catch {}
    return null;
  }

  function clear() {
    setPendingBoat(null);
    sessionStorage.removeItem(STORAGE_KEY);
  }

  return { pendingBoat, holdForLogin, flushToSession, consumeFromSession, clear };
}