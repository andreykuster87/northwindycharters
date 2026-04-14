// src/components/modals/CompanyRegStep2.tsx — Identificação Fiscal
import { Globe } from 'lucide-react';
import { type Form, fiscalLabel, CountrySelect, Label, Input } from './CompanyRegShared';

interface Props {
  form: Form;
  setForm: React.Dispatch<React.SetStateAction<Form>>;
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
        <Input value={form.numero_fiscal} onChange={e => f('numero_fiscal', e.target.value)}
          placeholder={
            form.pais_fiscal === 'BR' ? '00.000.000/0000-00' :
            form.pais_fiscal === 'PT' ? '000 000 000' :
            form.pais_fiscal === 'US' ? 'XX-XXXXXXX' :
            'Número fiscal'
          }
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
