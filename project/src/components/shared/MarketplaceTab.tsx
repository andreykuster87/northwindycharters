// src/components/shared/MarketplaceTab.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Aba Marketplace — agrega 7 sub-seções:
//   Passeios · Eventos · Embarcações · Escolas Náuticas · Ofertas de Trabalho · Acessórios · Peças e Motores
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useMemo } from 'react';
import { Anchor, GraduationCap, Briefcase, ShoppingBag, Wrench, Store, Sailboat, CalendarDays } from 'lucide-react';
import { NegocieTab }        from './NegocieTab';
import { EscolasNauticasTab } from './EscolasNauticasTab';
import { OfertasTab }         from './OfertasTab';
import { AcessoriosTab }      from './AcessoriosTab';
import { PecasMotoresTab }    from './PecasMotoresTab';
import { EventosMural }       from './EventosMural';
import { PasseiosTab }        from '../client/PasseiosTab';
import { loadTrips }          from '../../utils/clientHelpers';
import type { Company }       from '../../lib/localStore';

type SubTab = 'passeios' | 'eventos' | 'embarcacoes' | 'escolas' | 'ofertas' | 'acessorios' | 'pecas';

export type MarketplaceRole = 'admin' | 'sailor' | 'company' | 'client' | null;

interface Props {
  role:        MarketplaceRole;
  company?:    Company;
  sailorId?:   string;
  userName?:   string;
  initialTab?: SubTab;
}

const SUB_TABS: { key: SubTab; icon: React.ElementType; label: string; short: string }[] = [
  { key: 'passeios',    icon: Sailboat,       label: 'Passeios',          short: 'Passeios'    },
  { key: 'eventos',     icon: CalendarDays,   label: 'Eventos',           short: 'Eventos'     },
  { key: 'embarcacoes', icon: Anchor,         label: 'Embarcações',       short: 'Embarcações' },
  { key: 'escolas',     icon: GraduationCap,  label: 'Escolas Náuticas',  short: 'Escolas'     },
  { key: 'ofertas',     icon: Briefcase,      label: 'Ofertas de Trabalho', short: 'Trabalho'  },
  { key: 'acessorios',  icon: ShoppingBag,    label: 'Acessórios',        short: 'Acessórios'  },
  { key: 'pecas',       icon: Wrench,         label: 'Peças e Motores',   short: 'Peças'       },
];

export function MarketplaceTab({ role, company, sailorId, userName, initialTab }: Props) {
  const [subTab, setSubTab] = useState<SubTab>(initialTab ?? 'passeios');

  const ofertasRole = role === 'client' ? null : (role as 'admin' | 'sailor' | 'company' | null);

  const allBoats = useMemo(() => loadTrips(), []);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[#0a1628] flex items-center justify-center flex-shrink-0">
          <Store className="w-5 h-5 text-[#c9a96e]" />
        </div>
        <div>
          <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em] mb-0.5">Explorar</p>
          <h2 className="font-['Playfair_Display'] font-bold text-[#1a2b4a] text-lg leading-tight">Marketplace</h2>
          <p className="text-xs text-gray-400 font-medium">Passeios, eventos, compra, venda, formação e emprego náutico</p>
        </div>
      </div>

      {/* Sub-navegação — scroll horizontal no mobile */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
        {SUB_TABS.map(t => {
          const Icon   = t.icon;
          const active = subTab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setSubTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2.5 font-semibold text-xs uppercase whitespace-nowrap transition-all flex-shrink-0 ${
                active
                  ? 'bg-[#0a1628] text-white'
                  : 'bg-white border border-gray-100 text-gray-500 hover:border-[#c9a96e]/30 hover:text-[#1a2b4a]'
              }`}>
              <Icon className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="hidden sm:inline">{t.label}</span>
              <span className="sm:hidden">{t.short}</span>
            </button>
          );
        })}
      </div>

      {/* Divisor */}
      <div className="h-px bg-gray-100" />

      {/* Conteúdo da sub-aba */}
      {subTab === 'passeios'    && <PasseiosTab allBoats={allBoats} onSelect={() => {}} />}
      {subTab === 'eventos'     && <EventosMural />}
      {subTab === 'embarcacoes' && <NegocieTab role={role} />}
      {subTab === 'escolas'     && <EscolasNauticasTab role={role} />}
      {subTab === 'ofertas'     && <OfertasTab role={ofertasRole} company={company} sailorId={sailorId} />}
      {subTab === 'acessorios'  && <AcessoriosTab role={role} />}
      {subTab === 'pecas'       && <PecasMotoresTab role={role} />}
    </div>
  );
}
