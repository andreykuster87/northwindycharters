// src/components/admin/tabs/NovoEventoAdminForm.tsx
// Formulário de criação de evento pelo admin (auto-aprovado).
import { useState } from 'react';
import { AlertCircle, Plus, Trash2, Camera } from 'lucide-react';
import { saveEvent, approveEvent } from '../../../lib/localStore';

const TIPOS_EVENTO_ADMIN = ['Regata','Passeio','Formação','Desportivo','Tour','Festa','Outro'];
const EMOJIS_ADMIN       = ['⛵','🏁','🎓','🏊','🗺️','🎉','🌊','⚓','🐬','🚣','🤿','🏄','📌'];

const inputCls = "w-full bg-gray-50 border-2 border-gray-100 py-3 px-4 font-bold text-[#1a2b4a] focus:border-[#c9a96e] outline-none text-sm placeholder:text-gray-300";
const labelCls = "text-[10px] font-semibold text-[#1a2b4a] uppercase tracking-[0.15em] ml-1 mb-1.5 block";

interface Props {
  onSuccess: () => void;
  onCancel:  () => void;
}

export function NovoEventoAdminForm({ onSuccess, onCancel }: Props) {
  const [form, setForm] = useState({
    title: '', description: '', tipo: 'Passeio',
    date: '', time: '', local: '', cidade: '',
    vagas: '', preco: '', cover_emoji: '⛵',
    photos: [] as string[],
  });
  const [error,   setError]   = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const f = (k: string, v: string) => setForm(p => ({...p, [k]: v}));

  function validate(): string | null {
    if (!form.title.trim())  return 'Título é obrigatório.';
    if (!form.date)          return 'Data é obrigatória.';
    if (!form.time)          return 'Hora é obrigatória.';
    if (!form.local.trim())  return 'Local é obrigatório.';
    if (!form.cidade.trim()) return 'Cidade é obrigatória.';
    if (!form.vagas || Number(form.vagas) < 1) return 'Número de vagas inválido.';
    return null;
  }

  async function handleSubmit() {
    const err = validate();
    if (err) { setError(err); return; }
    setLoading(true);
    try {
      const ev = await saveEvent({
        company_id:    'admin',
        company_name:  'NorthWindy',
        company_phone: '',
        title:         form.title.trim(),
        description:   form.description.trim(),
        tipo:          form.tipo,
        date:          form.date,
        time:          form.time,
        local:         form.local.trim(),
        cidade:        form.cidade.trim(),
        vagas:         Number(form.vagas),
        preco:         form.preco ? Number(form.preco) : 0,
        cover_emoji:   form.cover_emoji,
        photos:        form.photos,
      });
      // Admin events auto-approve
      await approveEvent(ev.id);
      onSuccess();
    } catch {
      setError('Erro ao criar evento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white border-2 border-[#c9a96e]/20 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-[#c9a96e] uppercase tracking-[0.15em]">Novo Evento (Admin)</p>
        <button onClick={onCancel} className="text-gray-400 hover:text-red-500 transition-colors text-xs font-semibold">✕ Cancelar</button>
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-100 px-4 py-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-red-700 font-bold text-xs">{error}</p>
        </div>
      )}

      <div className="bg-[#0a1628]/5 border-2 border-[#c9a96e]/20 px-4 py-3">
        <p className="text-xs font-bold text-[#1a2b4a]">
          ✅ Eventos criados pelo admin são publicados directamente no Mural, sem necessidade de aprovação.
        </p>
      </div>

      {/* Emoji picker */}
      <div>
        <label className={labelCls}>Ícone</label>
        <div className="flex flex-wrap gap-2">
          {EMOJIS_ADMIN.map(e => (
            <button key={e} onClick={() => f('cover_emoji', e)}
              className={`w-9 h-9 text-lg flex items-center justify-center transition-all border-2 ${
                form.cover_emoji === e ? 'bg-[#0a1628] border-[#0a1628]' : 'bg-gray-50 border-gray-100 hover:border-[#c9a96e]/30'
              }`}>
              {e}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className={labelCls}>Título *</label>
        <input value={form.title} onChange={e => f('title', e.target.value)}
          placeholder="Ex: Regata Anual NorthWindy" className={inputCls} />
      </div>

      <div>
        <label className={labelCls}>Tipo *</label>
        <div className="flex flex-wrap gap-2">
          {TIPOS_EVENTO_ADMIN.map(t => (
            <button key={t} onClick={() => f('tipo', t)}
              className={`px-3 py-2 text-xs font-semibold border-2 transition-all ${
                form.tipo === t ? 'bg-[#0a1628] text-white border-[#0a1628]' : 'bg-gray-50 text-gray-500 border-gray-100 hover:border-[#c9a96e]/30'
              }`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Data *</label>
          <input type="date" value={form.date} min={new Date().toISOString().split('T')[0]}
            onChange={e => f('date', e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Hora *</label>
          <input type="time" value={form.time} onChange={e => f('time', e.target.value)} className={inputCls} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Local *</label>
          <input value={form.local} onChange={e => f('local', e.target.value)}
            placeholder="Ex: Marina de Cascais" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Cidade *</label>
          <input value={form.cidade} onChange={e => f('cidade', e.target.value)}
            placeholder="Ex: Cascais" className={inputCls} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Vagas *</label>
          <input type="number" value={form.vagas} onChange={e => f('vagas', e.target.value)}
            placeholder="50" min="1" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Preço (€)</label>
          <input type="number" value={form.preco} onChange={e => f('preco', e.target.value)}
            placeholder="0 = gratuito" min="0" className={inputCls} />
        </div>
      </div>

      <div>
        <label className={labelCls}>Descrição</label>
        <textarea value={form.description} onChange={e => f('description', e.target.value)}
          rows={3} placeholder="Descrição do evento…"
          className="w-full bg-gray-50 border-2 border-gray-100 py-3 px-4 font-bold text-[#1a2b4a] focus:border-[#c9a96e] outline-none text-sm placeholder:text-gray-300 resize-none" />
      </div>

      {/* Fotos */}
      <div>
        <label className={labelCls}>📸 Fotos do Evento (máx. 6)</label>
        <div className="space-y-2">
          {form.photos.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {form.photos.map((p, i) => (
                <div key={i} className="relative group overflow-hidden aspect-square">
                  <img src={p} alt="" className="w-full h-full object-cover" />
                  <button type="button"
                    onClick={() => setForm(prev => ({ ...prev, photos: prev.photos.filter((_, idx) => idx !== i) }))}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          {form.photos.length < 6 && (
            <label className="flex items-center justify-center gap-2 border-2 border-dashed border-[#c9a96e]/30 hover:border-[#c9a96e] bg-[#c9a96e]/5 text-[#1a2b4a] py-3 font-semibold text-xs uppercase cursor-pointer transition-all">
              <Camera className="w-4 h-4" /> Carregar Fotos
              <input type="file" accept="image/*" multiple className="sr-only"
                onChange={e => {
                  const files = Array.from(e.target.files || []);
                  files.slice(0, 6 - form.photos.length).forEach(file => {
                    const reader = new FileReader();
                    reader.onload = ev2 => {
                      const result = ev2.target?.result as string;
                      setForm(prev => ({ ...prev, photos: [...prev.photos, result].slice(0, 6) }));
                    };
                    reader.readAsDataURL(file);
                  });
                  e.target.value = '';
                }} />
            </label>
          )}
        </div>
      </div>

      <button onClick={handleSubmit} disabled={loading}
        className="w-full bg-[#0a1628] hover:bg-[#0a1628]/90 disabled:opacity-50 text-white py-3.5 font-semibold text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg">
        {loading
          ? <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white" />
          : <><Plus className="w-4 h-4" /> Publicar Evento</>
        }
      </button>
    </div>
  );
}
