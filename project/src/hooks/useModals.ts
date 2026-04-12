// src/hooks/useModals.ts
import { useState } from 'react';

export type ModalKey =
  | 'adminPortal'
  | 'sailorLogin'
  | 'sailorReg'
  | 'clientLogin'
  | 'clientReg'
  | 'companyReg'
  | 'companyLogin'
  | 'accessGate';

interface ModalsState {
  adminPortal:  boolean;
  sailorLogin:  boolean;
  sailorReg:    boolean;
  clientLogin:  boolean;
  clientReg:    boolean;
  companyReg:   boolean;
  companyLogin: boolean;
  accessGate:   boolean;
}

const INITIAL: ModalsState = {
  adminPortal:  false,
  sailorLogin:  false,
  sailorReg:    false,
  clientLogin:  false,
  clientReg:    false,
  companyReg:   false,
  companyLogin: false,
  accessGate:   false,
};

export function useModals() {
  const [modals, setModals] = useState<ModalsState>(INITIAL);

  function open(key: ModalKey) {
    setModals(prev => ({ ...prev, [key]: true }));
  }

  function close(key: ModalKey) {
    setModals(prev => ({ ...prev, [key]: false }));
  }

  function closeAll() {
    setModals(INITIAL);
  }

  function switchTo(from: ModalKey, to: ModalKey) {
    setModals(prev => ({ ...prev, [from]: false, [to]: true }));
  }

  return { modals, open, close, closeAll, switchTo };
}