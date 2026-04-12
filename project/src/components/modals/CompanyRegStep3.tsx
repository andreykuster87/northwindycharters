// src/components/modals/CompanyRegStep3.tsx — Contacto + Redes Sociais
import { type Form, DDI_OPTIONS, applyPhoneMask, Label, Input } from './CompanyRegShared';

interface Props {
  form: Form;
  setForm: React.Dispatch<React.SetStateAction<Form>>;
}

export function CompanyRegStep3({ form, setForm }: Props) {
  const f = (k: keyof Form, v: string | boolean) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
      <p className="text-[10px] font-black text-blue-900 uppercase tracking-widest border-b-2 border-gray-100 pb-2">
        📞 Contacto Corporativo
      </p>

      <div>
        <Label>Telefone * (formato internacional)</Label>
        <div className="flex gap-2">
          <select
            value={form.ddi}
            onChange={e => { f('ddi', e.target.value); f('telefone', ''); }}
            className="bg-gray-50 border-2 border-gray-100 rounded-[18px] py-4 px-3 font-black text-blue-900 focus:border-blue-900 outline-none transition-all text-sm">
            {DDI_OPTIONS.map(d => (
              <option key={d.code} value={d.ddi}>{d.flag} {d.ddi || 'Outro'}</option>
            ))}
          </select>
          <Input
            value={form.telefone}
            onChange={e => f('telefone', applyPhoneMask(e.target.value, form.ddi))}
            placeholder={
              form.ddi === '+351' ? '912 345 678' :
              form.ddi === '+55'  ? '(11) 91234-5678' :
              form.ddi === '+1'   ? '(555) 123-4567' :
              '000 000 000'
            }
            type="tel" className="flex-1" />
        </div>
      </div>

      <div>
        <Label>E-mail Corporativo *</Label>
        <Input value={form.email} onChange={e => f('email', e.target.value)}
          placeholder="empresa@dominio.com" type="email" />
      </div>

      <div>
        <Label>Website</Label>
        <Input value={form.website} onChange={e => f('website', e.target.value)}
          placeholder="https://www.empresa.com" type="url" />
      </div>

      <p className="text-[10px] font-black text-blue-900 uppercase tracking-widest border-b-2 border-gray-100 pb-2 pt-2">
        📲 Redes Sociais (opcional)
      </p>

      <div>
        <Label>Instagram</Label>
        <div className="flex items-center bg-gray-50 border-2 border-gray-100 rounded-[18px] overflow-hidden focus-within:border-blue-900 transition-all">
          <span className="px-4 py-4 text-sm font-black text-gray-400 border-r-2 border-gray-100 bg-gray-100 flex-shrink-0">instagram.com/</span>
          <input value={form.instagram} onChange={e => f('instagram', e.target.value.replace(/^@/,''))}
            placeholder="suaempresa"
            className="flex-1 bg-transparent py-4 px-3 font-bold text-blue-900 outline-none text-sm placeholder:text-gray-300" />
        </div>
      </div>

      <div>
        <Label>LinkedIn</Label>
        <div className="flex items-center bg-gray-50 border-2 border-gray-100 rounded-[18px] overflow-hidden focus-within:border-blue-900 transition-all">
          <span className="px-4 py-4 text-sm font-black text-gray-400 border-r-2 border-gray-100 bg-gray-100 flex-shrink-0">linkedin.com/company/</span>
          <input value={form.linkedin} onChange={e => f('linkedin', e.target.value)}
            placeholder="suaempresa"
            className="flex-1 bg-transparent py-4 px-3 font-bold text-blue-900 outline-none text-sm placeholder:text-gray-300" />
        </div>
      </div>

      <div>
        <Label>Facebook</Label>
        <div className="flex items-center bg-gray-50 border-2 border-gray-100 rounded-[18px] overflow-hidden focus-within:border-blue-900 transition-all">
          <span className="px-4 py-4 text-sm font-black text-gray-400 border-r-2 border-gray-100 bg-gray-100 flex-shrink-0">facebook.com/</span>
          <input value={form.facebook} onChange={e => f('facebook', e.target.value)}
            placeholder="suaempresa"
            className="flex-1 bg-transparent py-4 px-3 font-bold text-blue-900 outline-none text-sm placeholder:text-gray-300" />
        </div>
      </div>

      <div>
        <Label>Outras redes / links</Label>
        <Input value={form.outras_redes} onChange={e => f('outras_redes', e.target.value)}
          placeholder="TikTok, YouTube, etc." />
      </div>
    </div>
  );
}
