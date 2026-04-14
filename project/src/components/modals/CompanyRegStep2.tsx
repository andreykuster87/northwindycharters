// src/components/modals/CompanyRegStep2.tsx — Identificação Fiscal
import { Globe } from 'lucide-react';
import { type Form, fiscalLabel, CountrySelect, Label, Input } from './CompanyRegShared';

interface Props {
  form: Form;
  setForm: React.Dispatch<React.SetStateAction<Form>>;
}

function applyFiscalMask(value: string, pais: string): string {
  if (pais === 'PT') {
    const d = value.replace(/\D/g, '').slice(0, 9);
    if (d.length <= 3) return d;
    if (d.length <= 6) return `${d.slice(0,3)} ${d.slice(3)}`;
    return `${d.slice(0,3)} ${d.slice(3,6)} ${d.slice(6,9)}`;
  }
  if (pais === 'BR') {
    const d = value.replace(/\D/g, '').slice(0, 14);
    if (d.length <= 2) return d;
    if (d.length <= 5) return `${d.slice(0,2)}.${d.slice(2)}`;
    if (d.length <= 8) return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5)}`;
    if (d.length <= 12) return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5,8)}/${d.slice(8)}`;
    return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5,8)}/${d.slice(8,12)}-${d.slice(12,14)}`;
  }
  if (pais === 'US') {
    const d = value.replace(/\D/g, '').slice(0, 9);
    if (d.length <= 2) return d;
    return `${d.slice(0,2)}-${d.slice(2,9)}`;
  }
  if (['DE','FR','IT','ES','NL','BE','AT','PL','SE','DK','FI','IE','GR','CZ','HU','RO','BG','HR','SK','SI','EE','LV','LT','LU','MT','CY'].includes(pais)) {
    // VAT EU: prefixo do país + alfanumérico
    return value.toUpperCase().slice(0, 14);
  }
  return value;
}

function fiscalMaxLength(pais: string): number {
  if (pais === 'BR') return 18;
  if (pais === 'PT') return 11;
  if (pais === 'US') return 10;
  return 20;
}

export function CompanyRegStep2({ form, setForm }: Props) {
  const f = (k: keyof Form, v: string | boolean) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
      <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em] border-b border-gray-100 pb-2">
        🆔 Identificação Fiscal
      </p>

      <div>
        <Label>País de Registro Fiscal *</Label>
        <CountrySelect value={form.pais_fiscal} onChange={(code, name) => { f('pais_fiscal', code); f('pais_fiscal_nome', name); }} />
      </div>

      <div>
        <Label>Número de Registro da Empresa *</Label>
        <Input value={form.numero_registro} onChange={e => f('numero_registro', e.target.value)}
          placeholder="Ex: 123456789" />
      </div>

      <div>
        <Label>{fiscalLabel(form.pais_fiscal)} *</Label>
        <Input
          value={form.numero_fiscal}
          onChange={e => f('numero_fiscal', applyFiscalMask(e.target.value, form.pais_fiscal))}
          placeholder={
            form.pais_fiscal === 'BR' ? '00.000.000/0000-00' :
            form.pais_fiscal === 'PT' ? '000 000 000' :
            form.pais_fiscal === 'US' ? '00-0000000' :
            'Número fiscal'
          }
          maxLength={fiscalMaxLength(form.pais_fiscal)}
        />
        <p className="text-[10px] font-bold text-gray-400 ml-1 mt-1">
          {form.pais_fiscal === 'BR' && '🇧🇷 CNPJ — Cadastro Nacional da Pessoa Jurídica'}
          {form.pais_fiscal === 'PT' && '🇵🇹 NIF / NIPC — Número de Identificação de Pessoa Coletiva'}
          {form.pais_fiscal === 'US' && '🇺🇸 EIN — Employer Identification Number'}
          {!['BR','PT','US'].includes(form.pais_fiscal) && form.pais_fiscal !== 'OTHER' && '🇪🇺 VAT Number — Número de IVA Europeu'}
        </p>
      </div>

      <div className="bg-[#0a1628]/5 border border-[#c9a96e]/20 px-5 py-4 flex items-start gap-3">
        <Globe className="w-4 h-4 text-[#c9a96e] flex-shrink-0 mt-0.5" />
        <p className="text-xs font-bold text-[#1a2b4a]">
          Os dados fiscais são utilizados para emissão de contratos e documentação oficial.
          Insira apenas informações válidas e verificáveis.
        </p>
      </div>
    </div>
  );
}
