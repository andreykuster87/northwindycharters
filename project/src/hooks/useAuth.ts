// src/hooks/useAuth.ts
import { useState } from 'react';

export type UserRole = 'admin' | 'sailor' | 'client' | 'company' | null;

export interface AuthState {
  isAuthenticated: boolean;
  role: UserRole;
  userName?: string;
  sailorId?: string;
  clientId?: string;
  companyId?: string;
}

const SESSION_KEY = 'nw_auth';

function loadSession(): AuthState {
  try {
    const saved = sessionStorage.getItem(SESSION_KEY);
    return saved ? JSON.parse(saved) : { isAuthenticated: false, role: null };
  } catch {
    return { isAuthenticated: false, role: null };
  }
}

function saveSession(auth: AuthState) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(auth));
}

function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

export function useAuth() {
  const [auth, setAuthState] = useState<AuthState>(loadSession);

  function loginAsAdmin() {
    const next: AuthState = { isAuthenticated: true, role: 'admin' };
    saveSession(next);
    setAuthState(next);
  }

  function loginAsSailor(name: string, id: string) {
    const next: AuthState = { isAuthenticated: true, role: 'sailor', userName: name, sailorId: id };
    saveSession(next);
    setAuthState(next);
  }

  function loginAsClient(name: string, id: string) {
    const next: AuthState = { isAuthenticated: true, role: 'client', userName: name, clientId: id };
    saveSession(next);
    setAuthState(next);
  }

  function loginAsCompany(name: string, id: string) {
    const next: AuthState = { isAuthenticated: true, role: 'company', userName: name, companyId: id };
    saveSession(next);
    setAuthState(next);
  }

  function logout() {
    clearSession();
    setAuthState({ isAuthenticated: false, role: null });
  }

  return { auth, loginAsAdmin, loginAsSailor, loginAsClient, loginAsCompany, logout };
}