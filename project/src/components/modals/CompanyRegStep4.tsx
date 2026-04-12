// src/components/modals/CompanyRegStep4.tsx — Responsável + Termos
import { Check } from 'lucide-react';
import { type Form, DDI_OPTIONS, applyPhoneMask, Label, Input } from './CompanyRegShared';

interface Props {
  form: Form;
  setForm: React.Dispatch<React.SetStateAction<Form>>;
}

export function CompanyRegStep4({ form, setForm }: Props) {
  const f = (k: keyof Form, v: string | boolean) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
      <p className="text-[10px] font-black text-blue-900 uppercase tracking-widest border-b-2 border-gray-100 pb-2">
        👤 Responsável / Representante
      </p>

      <div>
        <Label>Nome Completo *</Label>
        <Input value={form.resp_nome} onChange={e => f('resp_nome', e.target.value)}
          placeholder="Nome do representante legal" />
      </div>
      <div>
        <Label>Cargo *</Label>
        <Input value={form.resp_cargo} onChange={e => f('resp_cargo', e.target.value)}
          placeholder="Ex: CEO, Diretor, Sócio-Gerente" />
      </div>
      <div>
        <Label>E-mail *</Label>
        <Input value={form.resp_email} onChange={e => f('resp_email', e.target.value)}
          placeholder="responsavel@empresa.com" type="email" />
      </div>
      <div>
        <Label>Telefone</Label>
        <div className="flex gap-2">
          <select
            value={form.resp_ddi}
            onChange={e => { f('resp_ddi', e.target.value); f('resp_telefone', ''); }}
            className="bg-gray-50 border-2 border-gray-100 rounded-[18px] py-4 px-3 font-black text-blue-900 focus:border-blue-900 outline-none transition-all text-sm">
            {DDI_OPTIONS.map(d => (
              <option key={d.code} value={d.ddi}>{d.flag} {d.ddi || 'Outro'}</option>
            ))}
          </select>
          <Input
            value={form.resp_telefone}
            onChange={e => f('resp_telefone', applyPhoneMask(e.target.value, form.resp_ddi))}
            placeholder={
              form.resp_ddi === '+351' ? '912 345 678' :
              form.resp_ddi === '+55'  ? '(11) 91234-5678' :
              form.resp_ddi === '+1'   ? '(555) 123-4567' :
              '000 000 000'
            }
            type="tel" className="flex-1" />
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <button
          type="button"
          onClick={() => f('declarou_veracidade', !form.declarou_veracidade)}
          className={`w-full flex items-start gap-3 px-5 py-4 rounded-[18px] border-2 text-left transition-all ${
            form.declarou_veracidade
              ? 'bg-green-50 border-green-400'
              : 'bg-gray-50 border-gray-100 hover:border-blue-300'
          }`}>
          <div className={`w-5 h-5 rounded-[7px] border-2 flex-shrink-0 flex items-center justify-center transition-all mt-0.5 ${
            form.declarou_veracidade ? 'bg-green-500 border-green-500' : 'border-gray-300'
          }`}>
            {form.declarou_veracidade && <Check className="w-3 h-3 text-white" />}
          </div>
          <p className="text-xs font-bold text-gray-700 leading-relaxed">
            Confirmo que todos os dados fornecidos são verdadeiros, completos e verificáveis,
            e assumo responsabilidade pela sua exactidão.
          </p>
        </button>

        <button
          type="button"
          onClick={() => f('aceitou_termos', !form.aceitou_termos)}
          className={`w-full flex items-start gap-3 px-5 py-4 rounded-[18px] border-2 text-left transition-all ${
            form.aceitou_termos
              ? 'bg-green-50 border-green-400'
              : 'bg-gray-50 border-gray-100 hover:border-blue-300'
          }`}>
          <div className={`w-5 h-5 rounded-[7px] border-2 flex-shrink-0 flex items-center justify-center transition-all mt-0.5 ${
            form.aceitou_termos ? 'bg-green-500 border-green-500' : 'border-gray-300'
          }`}>
            {form.aceitou_termos && <Check className="w-3 h-3 text-white" />}
          </div>
          <p className="text-xs font-bold text-gray-700 leading-relaxed">
            Concordo com os{' '}
            <span className="text-blue-700 underline">Termos de Serviço</span>
            {' '}e a{' '}
            <span className="text-blue-700 underline">Política de Privacidade</span>
            {' '}da NorthWindy.
          </p>
        </button>
      </div>

      <div className="bg-amber-50 border-2 border-amber-100 rounded-[18px] px-5 py-4 flex items-start gap-3">
        <span className="text-lg flex-shrink-0">⏳</span>
        <div>
          <p className="font-black text-amber-800 text-sm">Análise em curso</p>
          <p className="text-xs text-amber-600 font-bold mt-0.5">
            Após o envio, a equipa NorthWindy irá verificar os dados e entrar em contacto pelo e-mail fornecido.
          </p>
        </div>
      </div>
    </div>
  );
}
