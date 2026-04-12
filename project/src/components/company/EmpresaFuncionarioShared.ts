// src/components/company/EmpresaFuncionarioShared.ts
// Tipos partilhados entre EmpresaFuncionarioTab e sub-componentes.

export type RequestTipo = 'mensagem' | 'ferias' | 'atestado';

export interface FormState {
  titulo: string;
  corpo:  string;
  docUrl: string;
  docNome: string;
  inicio: string;
  fim:    string;
}
