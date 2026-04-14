// src/components/shared/DossierCompany.tsx
// Modal de perfil público de uma empresa — visualização somente leitura
import { X, Building2, MapPin, Phone, Mail, Globe, Star, Ship, Users, CalendarDays, Instagram, Linkedin, Facebook, ExternalLink } from 'lucide-react';
import type { Company } from '../../lib/store/companies';

// ── Props ─────────────────────────────────────────────────────────────────────

interface DossierCompanyProps {
  company: Company;
  onClose: () => void;
}

// ── Componente ────────────────────────────────────────────────────────────────

export function DossierCompany({ company, onClose }: DossierCompanyProps) {
  const profilePhoto = (() => {
    try { return (company as any).profile_photo || null; } catch { return null; }
  })();
  const album: string[] = (() => {
    try { return (company as any).album || []; } catch { return []; }
  })();

  const socials = [
    { icon: Instagram,  href: company.instagram,      label: 'Instagram' },
    { icon: Linkedin,   href: company.linkedin,        label: 'LinkedIn'  },
    { icon: Facebook,   href: company.facebook,        label: 'Facebook'  },
    { icon: Globe,      href: company.website,         label: 'Website'   },
  ].filter(s => s.href);

  return (
    <div className="fixed inset-0 z-[300] flex items-end md:items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg max-h-[90dvh] overflow-y-auto bg-white rounded-t-[28px] md:rounded-[28px] md:mx-4 flex flex-col">

        {/* Header — gradiente com foto */}
        <div className="bg-gradient-to-br from-[#0a1628] to-[#1a2b4a] p-5 rounded-t-[28px] md:rounded-t-[28px] flex-shrink-0">
          <div className="flex items-start justify-between mb-4">
            <span className="text-[10px] font-semibold text-[#c9a96e] bg-white/10 px-2.5 py-1 rounded-full uppercase tracking-[0.15em]">
              {company.profile_number}
            </span>
            <button onClick={onClose} className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all flex-shrink-0">
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          <div className="flex items-center gap-4">
            {/* Foto de perfil */}
            <div className="w-16 h-16 overflow-hidden border-2 border-white/30 flex-shrink-0 bg-white/20">
              {profilePhoto
                ? <img src={profilePhoto} alt={company.nome_fantasia} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center">
                    <Building2 className="w-8 h-8 text-white" />
                  </div>
              }
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold uppercase italic leading-tight text-white truncate">{company.nome_fantasia}</h3>
              <p className="text-[#c9a96e] text-xs font-bold truncate">{company.razao_social}</p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {company.setor.split(',').slice(0, 2).map(s => (
                  <span key={s} className="bg-white/20 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">{s.trim()}</span>
                ))}
                <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <MapPin className="w-2.5 h-2.5" /> {company.cidade}, {company.pais_nome}
                </span>
              </div>
            </div>
          </div>

          {/* Stats decorativos */}
          <div className="grid grid-cols-4 gap-2 mt-4">
            {[
              { icon: Ship,         label: 'Frota',     value: '—' },
              { icon: CalendarDays, label: 'Eventos',   value: '—' },
              { icon: Users,        label: 'Clientes',  value: '—' },
              { icon: Star,         label: 'Avaliação', value: '—' },
            ].map(s => (
              <div key={s.label} className="bg-white/10 py-2 text-center">
                <s.icon className="w-3.5 h-3.5 text-[#c9a96e] mx-auto mb-0.5" />
                <p className="text-sm font-bold text-white">{s.value}</p>
                <p className="text-[9px] font-semibold text-[#c9a96e] uppercase">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Corpo */}
        <div className="p-5 space-y-4 flex-1">

          {/* Descrição */}
          {company.descricao && (
            <div className="bg-gray-50 p-4">
              <p className="text-[10px] font-semibold text-[#1a2b4a] uppercase tracking-[0.15em] mb-2">Sobre a Empresa</p>
              <p className="text-sm font-bold text-gray-600 leading-relaxed">{company.descricao}</p>
            </div>
          )}

          {/* Álbum de fotos */}
          {album.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-[#1a2b4a] uppercase tracking-[0.15em] mb-2">Galeria</p>
              <div className="grid grid-cols-3 gap-2">
                {album.slice(0, 6).map((url, i) => (
                  <div key={i} className="aspect-square overflow-hidden">
                    <img src={url} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contactos */}
          <div className="bg-white border-2 border-gray-100 p-4 space-y-3">
            <p className="text-[10px] font-semibold text-[#1a2b4a] uppercase tracking-[0.15em]">Contacto</p>
            {[
              { icon: Phone, value: company.telefone,                    label: 'Telefone' },
              { icon: Mail,  value: company.email,                       label: 'Email'    },
              { icon: MapPin,value: `${company.cidade}, ${company.pais_nome}`, label: 'Localização' },
            ].map(r => (
              <div key={r.label} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#0a1628]/5 rounded-full flex items-center justify-center flex-shrink-0">
                  <r.icon className="w-3.5 h-3.5 text-[#c9a96e]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-semibold text-gray-400 uppercase">{r.label}</p>
                  <p className="text-sm font-bold text-[#1a2b4a] truncate">{r.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Redes sociais */}
          {socials.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-[#1a2b4a] uppercase tracking-[0.15em] mb-2">Redes</p>
              <div className="flex flex-wrap gap-2">
                {socials.map(s => (
                  <a key={s.label} href={s.href!} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 border-2 border-gray-100 hover:border-[#c9a96e]/30 hover:bg-gray-50 transition-all">
                    <s.icon className="w-3.5 h-3.5 text-[#1a2b4a]" />
                    <span className="text-xs font-semibold text-[#1a2b4a]">{s.label}</span>
                    <ExternalLink className="w-2.5 h-2.5 text-gray-400" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Responsável */}
          <div className="bg-[#0a1628]/5 border-2 border-[#0a1628]/10 p-4">
            <p className="text-[10px] font-semibold text-[#1a2b4a] uppercase tracking-[0.15em] mb-2">Responsável</p>
            <p className="text-sm font-bold text-[#1a2b4a]">{company.resp_nome}</p>
            <p className="text-xs font-bold text-[#1a2b4a]">{company.resp_cargo}</p>
          </div>

        </div>
      </div>
    </div>
  );
}
