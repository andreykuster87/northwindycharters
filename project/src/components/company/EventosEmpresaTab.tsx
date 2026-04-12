// src/components/company/EventosEmpresaTab.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Aba de Eventos para a Área da Empresa:
//   • Criar evento → vai para solicitações do admin
//   • Ver histórico com status (pendente / análise / aprovado / reprovado)
//   • Ver mural público
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from 'react';
import {
  Plus, CalendarDays, MapPin, Clock, CheckCircle2,
  XCircle, Eye, AlertCircle, ChevronDown, ChevronUp, Camera, X as XIcon, Trash2,
} from 'lucide-react';
import {
  getEventsByCompany, saveEvent, deleteEvent,
  type NauticEvent, type EventStatus,
} from '../../lib/localStore';
import { EventosMural } from '../shared/EventosMural';
import type { Company } from '../../lib/localStore';

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Date(iso + 'T12:00').toLocaleDateString('pt-PT', { day:'2-digit', month:'short', year:'numeric' });
}

const STATUS_MAP: Record<EventStatus, { label: string; cls: string; icon: React.ElementType; desc: string }> = {
  pending:  { label: 'Pendente',   cls: 'bg-amber-100 text-amber-700',  icon: Clock,        desc: 'Aguardando análise da equipa NorthWindy.' },
  analysis: { label: 'Em Análise', cls: 'bg-blue-100 text-blue-700',    icon: Eye,          desc: 'A equipa está a analisar o seu evento.' },
  approved: { label: 'Aprovado',   cls: 'bg-green-100 text-green-700',  icon: CheckCircle2, desc: 'Evento publicado no Mural! 🎉' },
  rejected: { label: 'Reprovado',  cls: 'bg-red-100 text-red-600',      icon: XCircle,      desc: 'Evento não aprovado. Veja o motivo e reenvie.' },
};

const TIPOS_EVENTO = ['Regata','Passeio','Formação','Desportivo','Tour','Festa','Outro'];
const EMOJIS       = ['⛵','🏁','🎓','🏊','🗺️','🎉','🌊','⚓','🐬','🚣','🤿','🏄','📌'];

// ── Formulário de criação ─────────────────────────────────────────────────────

interface EventForm {
  title: string; description: string; tipo: string;
  date: string; time: string; local: string; cidade: string;
  vagas: string; preco: string; cover_emoji: string;
  photos: string[];
}

const EMPTY_FORM: EventForm = {
  title:'', description:'', tipo:'Passeio',
  date:'', time:'', local:'', cidade:'',
  vagas:'', preco:'', cover_emoji:'⛵',
  photos:[],
};

function NovoEventoForm({
  company,
  onSuccess,
  onCancel,
}: {
  company: Company;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<EventForm>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const f = (k: keyof EventForm, v: string) => setForm(p => ({...p, [k]: v}));

  function validate(): string | null {
    if (!form.title.trim())  return 'Título é obrigatório.';
    if (!form.tipo)          return 'Selecione o tipo do evento.';
    if (!form.date)          return 'Data é obrigatória.';
    if (!form.time)          return 'Hora é obrigatória.';
    if (!form.local.trim())  return 'Local é obrigatório.';
    if (!form.cidade.trim()) return 'Cidade é obrigatória.';
    if (!form.vagas || isNaN(Number(form.vagas)) || Number(form.vagas) < 1)
      return 'Número de vagas inválido.';
    if (form.date < new Date().toISOString().split('T')[0])
      return 'A data do evento não pode ser no passado.';
    return null;
  }

  async function handleSubmit() {
    const err = validate();
    if (err) { setError(err); return; }
    setLoading(true);
    try {
      await saveEvent({
        company_id:    company.id,
        company_name:  company.nome_fantasia,
        company_phone: company.telefone,
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
      onSuccess();
    } catch {
      setError('Erro ao criar evento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  const inputCls = "w-full bg-gray-50 border-2 border-gray-100 rounded-[14px] py-3 px-4 font-bold text-blue-900 focus:border-blue-900 outline-none text-sm placeholder:text-gray-300";
  const labelCls = "text-[10px] font-black text-blue-900 uppercase tracking-wider ml-1 mb-1.5 block";

  return (
    <div className="bg-white border-2 border-blue-100 rounded-[22px] p-5 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-black text-blue-900 uppercase tracking-wider">Novo Evento</p>
        <button onClick={onCancel} className="text-gray-400 hover:text-red-500 transition-colors text-xs font-black">✕ Cancelar</button>
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-100 rounded-[12px] px-4 py-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-red-700 font-bold text-xs">{error}</p>
        </div>
      )}

      {/* Emoji picker */}
      <div>
        <label className={labelCls}>Ícone do Evento</label>
        <div className="flex flex-wrap gap-2">
          {EMOJIS.map(e => (
            <button key={e} onClick={() => f('cover_emoji', e)}
              className={`w-9 h-9 rounded-[10px] text-lg flex items-center justify-center transition-all border-2 ${
                form.cover_emoji === e ? 'bg-blue-900 border-blue-900' : 'bg-gray-50 border-gray-100 hover:border-blue-300'
              }`}>
              {e}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className={labelCls}>Título *</label>
        <input value={form.title} onChange={e => f('title', e.target.value)}
          placeholder="Ex: Regata de Verão — Cascais" className={inputCls} />
      </div>

      {/* Tipo */}
      <div>
        <label className={labelCls}>Tipo de Evento *</label>
        <div className="flex flex-wrap gap-2">
          {TIPOS_EVENTO.map(t => (
            <button key={t} onClick={() => f('tipo', t)}
              className={`px-3 py-2 rounded-[12px] text-xs font-black border-2 transition-all ${
                form.tipo === t ? 'bg-blue-900 text-white border-blue-900' : 'bg-gray-50 text-gray-500 border-gray-100 hover:border-blue-300'
              }`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Data e Hora */}
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

      {/* Local + Cidade */}
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

      {/* Vagas + Preço */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Vagas *</label>
          <input type="number" value={form.vagas} onChange={e => f('vagas', e.target.value)}
            placeholder="Ex: 20" min="1" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Preço (€) — 0 = gratuito</label>
          <input type="number" value={form.preco} onChange={e => f('preco', e.target.value)}
            placeholder="0" min="0" step="0.01" className={inputCls} />
        </div>
      </div>

      {/* Descrição */}
      <div>
        <label className={labelCls}>Descrição</label>
        <textarea value={form.description} onChange={e => f('description', e.target.value)} rows={3}
          placeholder="Descreva o evento, programa e detalhes relevantes…"
          className="w-full bg-gray-50 border-2 border-gray-100 rounded-[14px] py-3 px-4 font-bold text-blue-900 focus:border-blue-900 outline-none text-sm placeholder:text-gray-300 resize-none" />
      </div>

      {/* Fotos do evento */}
      <div>
        <label className={labelCls}>📸 Fotos do Evento (máx. 6)</label>
        <div className="space-y-3">
          {/* Grid de fotos carregadas */}
          {form.photos.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {form.photos.map((p, i) => (
                <div key={i} className="relative group rounded-[12px] overflow-hidden aspect-square">
                  <img src={p} alt={`Foto ${i+1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, photos: prev.photos.filter((_, idx) => idx !== i) }))}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  >
                    <XIcon className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          {/* Botão upload */}
          {form.photos.length < 6 && (
            <label className="flex items-center justify-center gap-2 border-2 border-dashed border-blue-200 hover:border-blue-400 bg-blue-50 hover:bg-blue-100 text-blue-600 py-3 rounded-[14px] font-black text-xs uppercase cursor-pointer transition-all">
              <Camera className="w-4 h-4" />
              Carregar Foto{form.photos.length > 0 ? ' (+)' : 's'}
              <input
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                onChange={e => {
                  const files = Array.from(e.target.files || []);
                  const remaining = 6 - form.photos.length;
                  files.slice(0, remaining).forEach(file => {
                    const reader = new FileReader();
                    reader.onload = ev2 => {
                      const result = ev2.target?.result as string;
                      setForm(prev => ({
                        ...prev,
                        photos: [...prev.photos, result].slice(0, 6),
                      }));
                    };
                    reader.readAsDataURL(file);
                  });
                  e.target.value = '';
                }}
              />
            </label>
          )}
          <p className="text-[10px] font-bold text-gray-400 ml-1">
            {form.photos.length}/6 fotos · Formatos: JPG, PNG, WEBP
          </p>
        </div>
      </div>

      <div className="bg-amber-50 border-2 border-amber-100 rounded-[14px] px-4 py-3">
        <p className="text-xs font-bold text-amber-800">
          ⏳ Após o envio, o evento ficará pendente até aprovação pela equipa NorthWindy. Receberá uma notificação com o resultado.
        </p>
      </div>

      <button onClick={handleSubmit} disabled={loading}
        className="w-full bg-blue-900 hover:bg-blue-800 disabled:opacity-50 text-white py-4 rounded-[16px] font-black text-sm uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2">
        {loading
          ? <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
          : <><Plus className="w-4 h-4" /> Enviar Solicitação</>
        }
      </button>
    </div>
  );
}

// ── Card do evento da empresa ─────────────────────────────────────────────────

function MeuEventoCard({ ev, onDelete }: { ev: NauticEvent; onDelete: () => void }) {
  const [expanded, setExpanded]     = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const statusInfo = STATUS_MAP[ev.status];
  const StatusIcon = statusInfo.icon;

  return (
    <div className="bg-white border-2 border-gray-100 rounded-[20px] overflow-hidden hover:border-blue-200 transition-all">
      {/* Header */}
      <div className="px-4 py-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0 text-xl">
          {ev.cover_emoji || '📌'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-black text-blue-900 text-sm truncate">{ev.title}</p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1 ${statusInfo.cls}`}>
              <StatusIcon className="w-2.5 h-2.5" /> {statusInfo.label}
            </span>
            <span className="text-xs font-bold text-gray-400">{fmtDate(ev.date)} às {ev.time}</span>
          </div>
        </div>
        <button onClick={() => setExpanded(v => !v)} className="text-gray-400 hover:text-blue-600 transition-colors flex-shrink-0">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Status banner */}
      <div className={`mx-4 mb-3 px-3 py-2 rounded-[10px] ${statusInfo.cls} flex items-center gap-2`}>
        <StatusIcon className="w-3.5 h-3.5 flex-shrink-0" />
        <p className="text-xs font-bold leading-relaxed">{statusInfo.desc}</p>
      </div>

      {/* Motivo de reprovação */}
      {ev.status === 'rejected' && ev.reject_reason && (
        <div className="mx-4 mb-3 bg-red-50 border border-red-100 rounded-[10px] px-3 py-2">
          <p className="text-[9px] font-black text-red-500 uppercase tracking-wider mb-0.5">Motivo</p>
          <p className="text-xs font-bold text-red-700">{ev.reject_reason}</p>
        </div>
      )}

      {/* Nota do admin */}
      {ev.admin_notes && (
        <div className="mx-4 mb-3 bg-blue-50 border border-blue-100 rounded-[10px] px-3 py-2">
          <p className="text-[9px] font-black text-blue-500 uppercase tracking-wider mb-0.5">Nota NorthWindy</p>
          <p className="text-xs font-bold text-blue-800">{ev.admin_notes}</p>
        </div>
      )}

      {/* Detalhes expansíveis */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-gray-50 pt-3">
          <div className="grid grid-cols-2 gap-2">
            {[
              ['Local',  ev.local],
              ['Cidade', ev.cidade],
              ['Vagas',  String(ev.vagas)],
              ['Preço',  ev.preco === 0 ? 'Gratuito' : `€${ev.preco}`],
            ].map(([l, v]) => (
              <div key={l} className="bg-gray-50 rounded-[10px] px-3 py-2">
                <p className="text-[9px] font-black text-gray-400 uppercase">{l}</p>
                <p className="text-sm font-black text-blue-900">{v}</p>
              </div>
            ))}
          </div>
          {ev.description && (
            <p className="text-xs font-bold text-gray-600 bg-gray-50 rounded-[10px] px-3 py-2 leading-relaxed">{ev.description}</p>
          )}

          {/* Ações */}
          {(ev.status === 'pending' || ev.status === 'rejected') && (
            !confirmDel ? (
              <button onClick={() => setConfirmDel(true)}
                className="w-full border-2 border-red-100 text-red-400 hover:bg-red-50 hover:border-red-300 py-2.5 rounded-[12px] font-black text-xs uppercase transition-all">
                🗑 Retirar Solicitação
              </button>
            ) : (
              <div className="bg-red-50 border-2 border-red-100 rounded-[12px] p-3 space-y-2">
                <p className="text-xs font-black text-red-700 text-center">Confirmar remoção?</p>
                <div className="flex gap-2">
                  <button onClick={() => setConfirmDel(false)}
                    className="flex-1 border-2 border-gray-200 text-gray-500 py-2 rounded-[10px] font-black text-xs uppercase">Cancelar</button>
                  <button onClick={onDelete}
                    className="flex-1 bg-red-500 hover:bg-red-400 text-white py-2 rounded-[10px] font-black text-xs uppercase transition-all">Remover</button>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export function EventosEmpresaTab({ company }: { company: Company }) {
  const [subTab,     setSubTab]     = useState<'meus' | 'realizados'>('meus');
  const [showNovo,   setShowNovo]   = useState(false);
  const [renderKey,  setRenderKey]  = useState(0);

  const todayStr    = new Date().toISOString().split('T')[0];
  const allEventos  = getEventsByCompany(company.id);
  const meusEventos = allEventos.filter(e => e.date >= todayStr);
  const realizados  = allEventos.filter(e => e.date < todayStr);

  function reload() { setRenderKey(k => k + 1); }

  return (
    <div className="space-y-4" key={renderKey}>
      {/* Título + botões de sub-tab no canto direito */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-blue-900 uppercase italic">Meus Eventos</h2>
          <p className="text-xs text-gray-400 font-bold">Gerencie e acompanhe os seus eventos</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {[
            { key: 'meus'       as const, label: 'Meus Eventos'       },
            { key: 'realizados' as const, label: 'Eventos Realizados' },
          ].map(t => (
            <button key={t.key} onClick={() => setSubTab(t.key)}
              className={`px-3 py-2 rounded-[12px] font-black text-[10px] uppercase transition-all ${
                subTab === t.key ? 'bg-blue-900 text-white shadow-md' : 'bg-white border-2 border-gray-100 text-gray-500 hover:border-blue-200'
              }`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Formulário de novo evento (inline) */}
      {showNovo && (
        <NovoEventoForm
          company={company}
          onSuccess={() => { reload(); setShowNovo(false); }}
          onCancel={() => setShowNovo(false)}
        />
      )}

      {/* Meus eventos */}
      {!showNovo && subTab === 'meus' && (
        <div className="space-y-3">
          {meusEventos.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-gray-200 rounded-[24px] py-14 text-center">
              <div className="text-5xl mb-4">📅</div>
              <p className="font-black text-gray-300 uppercase italic text-sm">Nenhum evento criado ainda</p>
              <button onClick={() => setShowNovo(true)}
                className="mt-4 bg-blue-900 text-white px-6 py-2.5 rounded-[14px] font-black text-xs uppercase hover:bg-blue-800 transition-all flex items-center gap-1.5 mx-auto">
                <Plus className="w-3.5 h-3.5" /> Criar Novo Evento
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {meusEventos.map(ev => (
                  <MeuEventoCard key={ev.id} ev={ev}
                    onDelete={() => { deleteEvent(ev.id); reload(); }} />
                ))}
              </div>
              {/* CTA criar novo evento no painel */}
              <button onClick={() => setShowNovo(true)}
                className="w-full border-2 border-dashed border-blue-200 hover:border-blue-400 bg-blue-50 hover:bg-blue-100 text-blue-700 py-3 rounded-[16px] font-black text-xs uppercase transition-all flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" /> Criar Novo Evento
              </button>
            </>
          )}
        </div>
      )}

      {/* Eventos realizados */}
      {!showNovo && subTab === 'realizados' && (
        <div className="space-y-3">
          {realizados.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-gray-200 rounded-[24px] py-14 text-center">
              <div className="text-5xl mb-4">🏁</div>
              <p className="font-black text-gray-300 uppercase italic text-sm">Nenhum evento realizado ainda</p>
            </div>
          ) : (
            realizados.map(ev => (
              <MeuEventoCard key={ev.id} ev={ev}
                onDelete={() => { deleteEvent(ev.id); reload(); }} />
            ))
          )}
        </div>
      )}

      {/* Mural público — sempre visível abaixo */}
      {!showNovo && (
        <EventosMural title="Mural de Eventos" subtitle="Eventos aprovados pela NorthWindy" />
      )}
    </div>
  );
}