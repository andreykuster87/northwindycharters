// src/components/pages/hero/HeroNavbar.tsx
import { Lock, X, ChevronRight } from 'lucide-react';
import { NavigateFunction } from 'react-router-dom';
import { LOGO_SRC } from '../../../assets';

interface Props {
  scrolled: boolean;
  navWhite: boolean;
  menuOpen: boolean;
  setMenuOpen: (v: boolean) => void;
  navigate: NavigateFunction;
  onOpenAccess?: () => void;
  onOpenAbout?: () => void;
  onScrollToAbout?: () => void;
}

export function HeroNavbar({
  scrolled, navWhite, menuOpen, setMenuOpen,
  navigate, onOpenAccess, onOpenAbout, onScrollToAbout,
}: Props) {
  const navClass = (!scrolled || navWhite)
    ? 'bg-white shadow-sm border-b border-gray-100'
    : 'bg-white/10 backdrop-blur-md border-b border-white/10';

  return (
    <>
      {/* Navbar */}
      <div className={`fixed top-0 left-0 right-0 z-50 flex-shrink-0 transition-all duration-300 ${navClass}`}>
        <div className="w-full px-4 md:px-6 h-14 flex items-center" style={{ position: 'relative' }}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Abrir menu"
            className="flex flex-col items-center justify-center gap-[5px] w-10 h-10 rounded-xl transition-all hover:scale-105 flex-shrink-0 bg-white border border-gray-200 hover:border-blue-900 shadow-sm z-10">
            <span className="block h-[2px] w-5 rounded-full bg-blue-900" />
            <span className="block h-[2px] w-5 rounded-full bg-blue-900" />
            <span className="block h-[2px] w-5 rounded-full bg-blue-900" />
          </button>

          <button
            onClick={onOpenAbout ?? onScrollToAbout}
            aria-label="Início"
            style={{
              position: 'absolute', left: '50%', top: '50%',
              transform: 'translate(-50%, -50%)',
              height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
            <img
              src={LOGO_SRC}
              alt="NorthWindy Charters"
              style={{
                height: '94px', width: 'auto', objectFit: 'contain',
                filter: (!scrolled || navWhite)
                  ? 'none'
                  : 'brightness(0) invert(1) drop-shadow(0 2px 8px rgba(0,0,0,0.6))',
              }}
            />
          </button>

          <button
            onClick={onOpenAccess}
            className={`ml-auto flex items-center gap-2 px-4 py-2 rounded-full font-black text-xs transition-all hover:scale-105 flex-shrink-0 z-10
              ${(!scrolled || navWhite)
                ? 'bg-white border border-gray-200 text-blue-900 hover:border-blue-900 shadow-sm'
                : 'bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm'}`}>
            <Lock className="w-3.5 h-3.5" />
            <span>Acesse</span>
          </button>
        </div>
      </div>

      {/* Drawer overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Drawer painel */}
      <div className={`fixed top-0 left-0 h-full z-[70] w-[300px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex-1 flex justify-center">
            <img src={LOGO_SRC} alt="NorthWindy" className="h-20 object-contain" />
          </div>
          <button
            onClick={() => setMenuOpen(false)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-blue-900 hover:bg-blue-50 transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          {[
            { label: 'Quem somos',           path: '/quem-somos' },
            { label: 'Catálogo de passeios', path: '/passeios' },
            { label: 'Parceiros',            path: '/parceiros' },
            { label: 'Comunidade',           path: '/comunidade' },
            { label: 'Contatos',             action: () => { window.location.href = 'mailto:geral@northwindy.com'; } },
            { label: 'Termos e condições',   path: '/termos' },
            { label: 'FAQ',                  path: '/faq' },
          ].map((item, i) => (
            <button
              key={i}
              onClick={() => {
                setMenuOpen(false);
                if (item.action) { item.action(); }
                else if (item.path) navigate(item.path);
              }}
              className="w-full flex items-center justify-between px-6 py-4 hover:bg-blue-50 text-left transition-colors border-b border-gray-50 last:border-0 group">
              <span className="font-black text-blue-900 text-sm group-hover:translate-x-1 transition-transform duration-150">{item.label}</span>
              <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-900 transition-colors" />
            </button>
          ))}
        </nav>

        <div className="px-6 py-5 border-t border-gray-100">
          <p className="text-gray-400 text-[10px] font-bold text-center uppercase tracking-widest">
            © {new Date().getFullYear()} NorthWindy Charters
          </p>
        </div>
      </div>
    </>
  );
}
