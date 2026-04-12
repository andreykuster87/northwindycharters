// src/components/modals/CompanyRegStep1.tsx — Empresa + Localização
import { Check } from 'lucide-react';
import { type Form, SETORES, CountrySelect, Label, Input, Textarea } from './CompanyRegShared';

interface Props {
  form: Form;
  setForm: React.Dispatch<React.SetStateAction<Form>>;
}

export function CompanyRegStep1({ form, setForm }: Props) {
  const f = (k: keyof Form, v: string | boolean) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
      <p className="text-[10px] font-black text-blue-900 uppercase tracking-widest border-b-2 border-gray-100 pb-2">
        🏢 Informações Básicas
      </p>

      <div>
        <Label>Razão Social *</Label>
        <Input value={form.razao_social} onChange={e => f('razao_social', e.target.value.toUpperCase())}
          placeholder="NOME LEGAL DA EMPRESA" style={{textTransform:'uppercase'}} />
      </div>
      <div>
        <Label>Nome Fantasia *</Label>
        <Input value={form.nome_fantasia} onChange={e => f('nome_fantasia', e.target.value.toUpperCase())}
          placeholder="NOME COMERCIAL" style={{textTransform:'uppercase'}} />
      </div>

      <div>
        <Label>Setor / Indústria * <span className="text-gray-400 normal-case font-bold">(pode escolher vários)</span></Label>
        <div className="flex flex-wrap gap-2">
          {SETORES.map(s => {
            const selected = form.setores.includes(s);
            return (
              <button key={s} type="button"
                onClick={() => {
                  const newSetores = selected
                    ? form.setores.filter(x => x !== s)
                    : [...form.setores, s];
                  setForm(p => ({ ...p, setores: newSetores }));
                }}
                className={`px-3 py-2 rounded-[14px] text-xs font-black border-2 transition-all flex items-center gap-1.5 ${
                  selected
                    ? 'bg-blue-900 text-white border-blue-900'
                    : 'bg-gray-50 text-gray-500 border-gray-100 hover:border-blue-300'
                }`}>
                {selected && <Check className="w-3 h-3" />}
                {s}
              </button>
            );
          })}
        </div>
        {form.setores.length > 0 && (
          <p className="text-[10px] font-bold text-blue-700 mt-2 ml-1">
            ✓ {form.setores.length} setor{form.setores.length > 1 ? 'es' : ''} selecionado{form.setores.length > 1 ? 's' : ''}
          </p>
        )}
        {form.setores.includes('Outro') && (
          <div className="mt-3">
            <Input value={form.setor_outro} onChange={e => f('setor_outro', e.target.value)}
              placeholder="Descreva o setor" />
          </div>
        )}
      </div>

      <div>
        <Label>Descrição da Empresa (opcional)</Label>
        <Textarea value={form.descricao} onChange={e => f('descricao', e.target.value)}
          placeholder="Breve descrição da actividade…" />
      </div>

      <p className="text-[10px] font-black text-blue-900 uppercase tracking-widest border-b-2 border-gray-100 pb-2 pt-2">
        🌍 Localização
      </p>

      <div>
        <Label>País *</Label>
        <CountrySelect value={form.pais} onChange={(code, name) => { f('pais', code); f('pais_nome', name); }} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Estado / Região</Label>
          <Input value={form.estado} onChange={e => f('estado', e.target.value.toUpperCase())}
            placeholder="EX: LISBOA" style={{textTransform:'uppercase'}} />
        </div>
        <div>
          <Label>Cidade *</Label>
          <Input value={form.cidade} onChange={e => f('cidade', e.target.value.toUpperCase())}
            placeholder="EX: LISBOA" style={{textTransform:'uppercase'}} />
        </div>
      </div>
      <div>
        <Label>Endereço Completo *</Label>
        <Input value={form.endereco} onChange={e => f('endereco', e.target.value.toUpperCase())}
          placeholder="RUA, NÚMERO, ANDAR…" style={{textTransform:'uppercase'}} />
      </div>
      <div>
        <Label>Código Postal</Label>
        <Input
          value={form.codigo_postal}
          onChange={e => {
            let v = e.target.value.replace(/\D/g,'');
            if (form.pais === 'PT') {
              if (v.length > 4) v = v.slice(0,4) + '-' + v.slice(4,7);
            } else if (form.pais === 'BR') {
              if (v.length > 5) v = v.slice(0,5) + '-' + v.slice(5,8);
            } else {
              v = e.target.value;
            }
            f('codigo_postal', v);
          }}
          placeholder={
            form.pais === 'PT' ? '1000-001' :
            form.pais === 'BR' ? '01310-100' :
            form.pais === 'US' ? '10001' :
            'Código postal'
          }
          maxLength={form.pais === 'PT' ? 8 : form.pais === 'BR' ? 9 : 20}
        />
        <p className="text-[10px] font-bold text-gray-400 ml-1 mt-1">
          {form.pais === 'PT' && 'Formato: 0000-000'}
          {form.pais === 'BR' && 'Formato: 00000-000'}
        </p>
      </div>
    </div>
  );
}
