// src/components/modals/CompanyRegStep1.tsx — Empresa + Localização
import { useState } from 'react';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import { type Form, SETORES_GRUPOS, CountrySelect, Label, Input, Textarea } from './CompanyRegShared';

interface Props {
  form: Form;
  setForm: React.Dispatch<React.SetStateAction<Form>>;
}

export function CompanyRegStep1({ form, setForm }: Props) {
  const f = (k: keyof Form, v: string | boolean) => setForm(p => ({ ...p, [k]: v }));
  const [setoresOpen, setSetoresOpen] = useState(false);

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
      <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em] border-b border-gray-100 pb-2">
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
        <Label>@ na plataforma *  <span className="text-gray-400 normal-case font-bold">como será chamado(a)</span></Label>
        <div className="relative">
          <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[#c9a96e] font-semibold text-sm select-none">@</span>
          <Input
            value={form.username}
            onChange={e => f('username', e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, '').slice(0, 20))}
            placeholder="usuario_empresa"
            className="pl-9"
          />
        </div>
        {form.username && (
          <p className="text-[10px] font-bold text-[#c9a96e] ml-1 mt-1">@{form.username}</p>
        )}
        <p className="text-[10px] font-bold text-gray-400 ml-1 mt-0.5">3–20 caracteres · apenas letras, números, _ e .</p>
      </div>

      <div>
        <Label>Setor / Indústria *</Label>

        {/* Aviso ao cliente */}
        <div className="bg-amber-50 border border-amber-200 px-4 py-3 mb-3 flex items-start gap-2">
          <span className="text-amber-500 text-base leading-none mt-0.5">⚠</span>
          <p className="text-[11px] font-semibold text-amber-700 leading-relaxed">
            Seja específico na escolha dos setores — eles serão usados como <strong>filtro de busca</strong> para que clientes encontrem a sua empresa na plataforma.
          </p>
        </div>

        {/* Botão de abrir/fechar */}
        <button
          type="button"
          onClick={() => setSetoresOpen(o => !o)}
          className="w-full flex items-center justify-between bg-gray-50 border border-gray-200 py-4 px-5 hover:border-[#c9a96e]/60 transition-all"
        >
          <span className={`text-sm font-semibold ${form.setores.length > 0 ? 'text-[#c9a96e]' : 'text-gray-400'}`}>
            {form.setores.length === 0
              ? 'Escolher setor(s)'
              : `${form.setores.length} setor${form.setores.length > 1 ? 'es' : ''} selecionado${form.setores.length > 1 ? 's' : ''}`}
          </span>
          {setoresOpen
            ? <ChevronUp className="w-4 h-4 text-gray-400" />
            : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>

        {/* Badges dos selecionados (quando fechado) */}
        {!setoresOpen && form.setores.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2 px-1">
            {form.setores.map(s => (
              <span key={s} className="px-3 py-1.5 rounded-[14px] text-xs font-black bg-[#0a1628] text-white border-2 border-[#c9a96e] flex items-center gap-1.5">
                <Check className="w-3 h-3" />{s}
              </span>
            ))}
          </div>
        )}

        {/* Painel expandido com grupos */}
        {setoresOpen && (
          <div className="border border-t-0 border-gray-200 bg-white px-4 pt-4 pb-3 space-y-4">
            {SETORES_GRUPOS.map(({ grupo, setores }) => (
              <div key={grupo}>
                <p className="text-[10px] font-bold text-[#c9a96e] uppercase tracking-wider mb-2 border-b border-gray-100 pb-1">{grupo}</p>
                <div className="flex flex-wrap gap-2">
                  {setores.map(s => {
                    const selected = form.setores.includes(s);
                    const isOutro = s === 'Outro';
                    return (
                      <div key={s} className={`flex items-center gap-2 ${isOutro && selected ? 'w-full' : ''}`}>
                        <button type="button"
                          onClick={() => {
                            const newSetores = selected
                              ? form.setores.filter(x => x !== s)
                              : [...form.setores, s];
                            setForm(p => ({ ...p, setores: newSetores }));
                          }}
                          className={`px-3 py-2 rounded-[14px] text-xs font-black border-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                            selected
                              ? 'bg-[#0a1628] text-white border-[#c9a96e]'
                              : 'bg-gray-50 text-gray-500 border-gray-100 hover:border-[#c9a96e]/50'
                          }`}>
                          {selected && <Check className="w-3 h-3" />}
                          {s}
                        </button>
                        {isOutro && selected && (
                          <input
                            autoFocus
                            type="text"
                            value={form.setor_outro}
                            onChange={e => f('setor_outro', e.target.value)}
                            placeholder="Descreva o setor…"
                            className="flex-1 bg-gray-50 border border-gray-200 py-2 px-3 text-xs font-medium text-[#1a2b4a] focus:border-[#c9a96e] outline-none transition-all placeholder:text-gray-300"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={() => setSetoresOpen(false)}
              className="w-full mt-2 py-2.5 text-xs font-bold text-[#c9a96e] border border-[#c9a96e]/40 hover:border-[#c9a96e] hover:bg-[#c9a96e]/5 transition-all"
            >
              ✓ Confirmar seleção {form.setores.length > 0 ? `(${form.setores.length})` : ''}
            </button>
          </div>
        )}

      </div>

      <div>
        <Label>Descrição da Empresa (opcional)</Label>
        <div className="bg-blue-50 border border-blue-200 px-4 py-2.5 mb-2 flex items-center gap-2">
          <span className="text-blue-400 text-base leading-none">👁</span>
          <p className="text-[11px] font-semibold text-blue-600">
            Este texto será exibido no <strong>perfil público</strong> da sua empresa na plataforma.
          </p>
        </div>
        <Textarea value={form.descricao} onChange={e => f('descricao', e.target.value)}
          placeholder="Breve descrição da actividade…" />
      </div>

      <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em] border-b border-gray-100 pb-2 pt-2">
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
