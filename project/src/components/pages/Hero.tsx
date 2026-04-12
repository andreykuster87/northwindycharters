// src/components/pages/Hero.tsx
import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, MapPin, Users,
  X, CalendarDays, ChevronDown, Search, ChevronLeft, ChevronRight,
  Sparkles, Sun, Briefcase,
} from 'lucide-react';
import { getBookings } from '../../lib/localStore';
import type { CatalogBoat } from '../services/catalog';
import type { ScheduleData } from '../modals/TimeSlotsModal';
import {
  formatPrice,
  getBoatCity,
  buildScheduleFromBookings,
} from '../../utils/catalogUtils';
import { TripDetailModal } from '../modals/TripDetailModal';
import { HeroNavbar }      from './hero/HeroNavbar';
import { HeroComunidade }  from './hero/HeroComunidade';
import { FilteredResults } from './hero/FilteredResults';

export type { CatalogBoat } from '../../services/catalog';

interface HeroProps {
  onExplore:        () => void;
  onBeSailor:       () => void;
  boats?:           CatalogBoat[];
  onSelectBoat?:    (boat: CatalogBoat, date?: string, slot?: string) => void;
  onOpenAccess?:    () => void;
  onOpenClientReg?: () => void;
  onOpenSailorReg?: () => void;
  onScrollToAbout?: () => void;
  onOpenAbout?:     () => void;
}

// ── Hero ───────────────────────────────────────────────────────────────────────
export const Hero = ({
  onExplore, onBeSailor, boats = [], onSelectBoat,
  onOpenAccess, onOpenClientReg, onOpenSailorReg, onScrollToAbout, onOpenAbout,
}: HeroProps) => {
  const [heroTab,      setHeroTab]      = useState<'passageiros' | 'comunidade'>('passageiros');
  const [activeCity,   setActiveCity]   = useState<string | null>(null);
  const [activeDate,   setActiveDate]   = useState<string>('');
  const [dateDisplay,  setDateDisplay]  = useState<string>('');
  const [activePeople, setActivePeople] = useState<number | null>(null);
  const [searchQuery,  setSearchQuery]  = useState('');
  const [dropOpen,     setDropOpen]     = useState(false);
  const [peopleOpen,   setPeopleOpen]   = useState(false);
  const [selectedBoat, setSelectedBoat] = useState<CatalogBoat | null>(null);
  const [cadastroOpen, setCadastroOpen] = useState(false);
  const [scrolled,     setScrolled]     = useState(false);
  const [menuOpen,     setMenuOpen]     = useState(false);

  // ── Hero Slideshow ──
  const HERO_IMAGES = [
    '/assets/hero/1.jpg',
    '/assets/hero/2.jpg',
    '/assets/hero/3.jpg',
    '/assets/hero/4.jpg',
    '/assets/hero/5.jpg',
  ];
  const [heroSlide, setHeroSlide] = useState(0);
  const heroTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const heroSlideCount = HERO_IMAGES.length;

  const resetHeroTimer = () => {
    if (heroTimerRef.current) clearInterval(heroTimerRef.current);
    heroTimerRef.current = setInterval(() => {
      setHeroSlide(prev => (prev + 1) % heroSlideCount);
    }, 6000);
  };

  useEffect(() => {
    resetHeroTimer();
    return () => { if (heroTimerRef.current) clearInterval(heroTimerRef.current); };
  }, [heroSlideCount]);

  const goHeroSlide = (dir: 'prev' | 'next') => {
    setHeroSlide(prev => dir === 'next' ? (prev + 1) % heroSlideCount : (prev - 1 + heroSlideCount) % heroSlideCount);
    resetHeroTimer();
  };
  const navigate = useNavigate();

  const carouselTrackRef = useRef<HTMLDivElement>(null);
  const carOffsetRef     = useRef(0);
  const carVelRef        = useRef(0);
  const carRafRef        = useRef(0);
  const carDragging      = useRef(false);
  const carStartX        = useRef(0);
  const carLastX         = useRef(0);
  const carLastT         = useRef(0);
  const carMoved         = useRef(false);

  const dropRef     = useRef<HTMLDivElement>(null);
  const cadastroRef = useRef<HTMLDivElement>(null);
  const peopleRef   = useRef<HTMLDivElement>(null);
  const heroRef     = useRef<HTMLDivElement>(null);
  const [navWhite,  setNavWhite]  = useState(false);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) { setDropOpen(false); setSearchQuery(''); }
      if (cadastroRef.current && !cadastroRef.current.contains(e.target as Node)) setCadastroOpen(false);
      if (peopleRef.current && !peopleRef.current.contains(e.target as Node)) setPeopleOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 10);
      if (heroRef.current) {
        const heroBottom = heroRef.current.getBoundingClientRect().bottom;
        setNavWhite(heroBottom <= 56);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const cityTotals = useMemo(() => {
    const map: Record<string, number> = {};
    boats.forEach(b => {
      const city = (getBoatCity(b) || 'Sem cidade').toLowerCase().trim();
      map[city] = (map[city] || 0) + 1;
    });
    return map;
  }, [boats]);

  const cityDisplayName = useMemo(() => {
    const map: Record<string, string> = {};
    boats.forEach(b => {
      const raw  = getBoatCity(b) || 'Sem cidade';
      const key  = raw.toLowerCase().trim();
      if (!map[key]) map[key] = raw;
    });
    return map;
  }, [boats]);

  const locationTree = useMemo(() => {
    const tree: Record<string, { flag: string; country: string; states: Record<string, { cities: { city: string; cityKey: string; count: number }[] }> }> = {};
    const seenKeys = new Set<string>();
    boats.forEach(b => {
      const country  = b.country_name || 'Outro';
      const flag     = b.country_flag  || '🌍';
      const state    = b.state_name    || '';
      const cityRaw  = getBoatCity(b)  || 'Sem cidade';
      const cityKey  = cityRaw.toLowerCase().trim();
      const treeKey  = `${country}||${state}||${cityKey}`;
      if (seenKeys.has(treeKey)) return;
      seenKeys.add(treeKey);
      if (!tree[country]) tree[country] = { flag, country, states: {} };
      if (!tree[country].states[state]) tree[country].states[state] = { cities: [] };
      tree[country].states[state].cities.push({
        city:    cityDisplayName[cityKey] || cityRaw,
        cityKey,
        count:   cityTotals[cityKey] || 1,
      });
    });
    return Object.values(tree).sort((a, b) => a.country.localeCompare(b.country));
  }, [boats, cityTotals, cityDisplayName]);

  const q = searchQuery.toLowerCase().trim();
  const filteredTree = useMemo(() => {
    if (!q) return locationTree;
    return locationTree.map(cn => ({
      ...cn,
      states: Object.fromEntries(
        Object.entries(cn.states)
          .map(([state, data]) => [state, { cities: data.cities.filter(c =>
            c.city.toLowerCase().includes(q) ||
            state.toLowerCase().includes(q) ||
            cn.country.toLowerCase().includes(q)
          )}])
          .filter(([, data]) => (data as any).cities.length > 0),
      ),
    })).filter(cn => Object.keys(cn.states).length > 0);
  }, [locationTree, q]);

  const allBookings = useMemo(() => {
    return getBookings().filter(b => ['confirmed', 'completed', 'concluido'].includes(b.status));
  }, []);

  const schedulesMap = useMemo(() => {
    const map = new Map<string, ScheduleData[]>();
    boats.forEach(b => map.set(b.id, buildScheduleFromBookings(b, allBookings)));
    return map;
  }, [boats, allBookings]);

  const hasActiveFilter = !!(activeCity || activePeople || activeDate);

  const filteredBoats = useMemo(() => {
    return boats.filter(b => {
      // Excluir barcos esgotados (sem agenda disponível)
      const sched = schedulesMap.get(b.id) || [];
      if (hasActiveFilter && sched.length === 0) return false;

      if (activeCity) {
        const boatCity = (getBoatCity(b) || '').toLowerCase().trim();
        if (boatCity !== activeCity.toLowerCase().trim()) return false;
      }
      if (activePeople && b.capacity < activePeople) return false;
      if (activeDate) {
        if (!sched.some(s => s.date === activeDate)) return false;
      }
      return true;
    });
  }, [boats, activeCity, activePeople, activeDate, schedulesMap, hasActiveFilter]);

  const filteredResultsRef = useRef<HTMLDivElement>(null);

  // Scroll suave até os resultados quando um filtro é ativado
  useEffect(() => {
    if (hasActiveFilter && filteredResultsRef.current) {
      setTimeout(() => {
        filteredResultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    }
  }, [hasActiveFilter, activeCity, activePeople, activeDate]);

  const isMobileView = typeof window !== 'undefined' && window.innerWidth < 768;
  const CARD_W = isMobileView ? Math.min(window.innerWidth - 48, 260) : 270;
  const CAR_GAP = 16;
  const CAR_AUTO = 0.4;
  const CAR_FRICTION = 0.92;
  const CAR_MIN_VEL = 0.15;
  const CAR_DRAG_T = 6;

  const carClamp = (halfW: number) => {
    let o = carOffsetRef.current;
    if (o < -halfW) o += halfW;
    if (o > 0)      o -= halfW;
    carOffsetRef.current = o;
  };

  const carRender = () => {
    if (carouselTrackRef.current)
      carouselTrackRef.current.style.transform = `translateX(${carOffsetRef.current}px)`;
  };

  useEffect(() => {
    const halfW = (CARD_W + CAR_GAP) * filteredBoats.length;
    if (halfW === 0 || filteredBoats.length <= 1) return;
    const tick = () => {
      if (!carDragging.current) {
        if (Math.abs(carVelRef.current) > CAR_MIN_VEL) {
          carVelRef.current    *= CAR_FRICTION;
          carOffsetRef.current += carVelRef.current;
        } else {
          carVelRef.current     = 0;
          carOffsetRef.current -= CAR_AUTO;
        }
        carClamp(halfW);
        carRender();
      }
      carRafRef.current = requestAnimationFrame(tick);
    };
    carRafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(carRafRef.current);
  }, [filteredBoats.length]); // eslint-disable-line

  const onCarStart = (x: number) => {
    carDragging.current = true;
    carMoved.current    = false;
    carStartX.current   = x;
    carLastX.current    = x;
    carLastT.current    = performance.now();
    carVelRef.current   = 0;
  };
  const onCarMove = (x: number) => {
    if (!carDragging.current) return;
    const dx = x - carLastX.current;
    const dt = performance.now() - carLastT.current;
    if (Math.abs(x - carStartX.current) > CAR_DRAG_T) carMoved.current = true;
    const halfW = (CARD_W + CAR_GAP) * filteredBoats.length;
    carOffsetRef.current += dx;
    carClamp(halfW);
    carRender();
    carVelRef.current = dt > 0 ? (dx / dt) * 16 : 0;
    carLastX.current  = x;
    carLastT.current  = performance.now();
  };
  const onCarEnd = () => { carDragging.current = false; };

  function handleBook(boat: CatalogBoat, date?: string, slot?: string) {
    setSelectedBoat(null);
    if (onSelectBoat) onSelectBoat(boat, date, slot);
    else onExplore();
  }

  const navClass = (!scrolled || navWhite)
    ? 'bg-white shadow-sm border-b border-gray-100'
    : 'bg-white/10 backdrop-blur-md border-b border-white/10';

  const navTextClass = (!scrolled || navWhite) ? 'text-gray-600 hover:text-blue-900' : 'text-white/90 hover:text-white';
  const navBtnClass  = (!scrolled || navWhite)
    ? 'bg-blue-900 hover:bg-blue-800 text-white shadow-md'
    : 'bg-white/20 hover:bg-white/30 text-white border border-white/30';
  const navRegClass  = (!scrolled || navWhite)
    ? 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-900'
    : 'bg-white/15 hover:bg-white/25 border-white/30 text-white';

  const isPassageiros = heroTab === 'passageiros';

  return (
    <>
      <div ref={heroRef} className="relative w-full flex flex-col overflow-hidden transition-colors duration-700" style={{ height: '100dvh', minHeight: '620px' }}>

        {/* ── BG Passageiros (Slideshow) ── */}
        <div className={`absolute inset-0 z-0 transition-opacity duration-700 ${isPassageiros ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          {/* Slideshow images */}
          {HERO_IMAGES.map((src, i) => (
            <img
              key={src}
              src={src}
              alt={`Hero ${i + 1}`}
              className="absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-1000"
              style={{ opacity: heroSlide === i ? 1 : 0 }}
            />
          ))}
          {/* Overlay gradients */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

          {/* Setas de navegação */}
          <button
            onClick={() => goHeroSlide('prev')}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white transition-all hover:scale-110"
            aria-label="Slide anterior"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          <button
            onClick={() => goHeroSlide('next')}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white transition-all hover:scale-110"
            aria-label="Próximo slide"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
          </button>

        </div>

        {/* ── BG Comunidade ── */}
        <div className={`absolute inset-0 z-0 transition-opacity duration-700 ${!isPassageiros ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <img src="/assets/oceano.jpg" alt="Background" className="absolute inset-0 w-full h-full object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a1628]/90 via-[#0f2847]/85 to-[#0a1628]/95" />
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(30,64,120,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 30%, rgba(15,40,71,0.4) 0%, transparent 50%)' }} />

          {/* Subtle grid pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        </div>

        <HeroNavbar
          scrolled={scrolled}
          navWhite={navWhite}
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
          navigate={navigate}
          onOpenAccess={onOpenAccess}
          onOpenAbout={onOpenAbout}
          onScrollToAbout={onScrollToAbout}
        />

        <div className="flex-shrink-0" style={{ height: '56px' }} />

        {/* ── Tab Switcher ── */}
        <div className="relative z-30 flex justify-center pt-3 md:pt-4 pb-1">
          <div className={`flex rounded-full p-1 backdrop-blur-md border transition-all duration-500 ${isPassageiros ? 'bg-white/15 border-white/25' : 'bg-white/10 border-white/15'}`}>
            <button
              onClick={() => setHeroTab('passageiros')}
              className={`relative flex items-center gap-2 px-5 md:px-7 py-2 md:py-2.5 rounded-full font-black text-xs md:text-sm uppercase tracking-wide transition-all duration-300 ${
                isPassageiros
                  ? 'bg-gradient-to-r from-orange-500 to-yellow-400 text-white shadow-lg shadow-orange-500/30 scale-105'
                  : 'text-white/60 hover:text-white/90'
              }`}>
              <Sun className="w-3.5 h-3.5 md:w-4 md:h-4" />
              Passageiros
              {isPassageiros && <Sparkles className="w-3 h-3 animate-pulse" />}
            </button>
            <button
              onClick={() => setHeroTab('comunidade')}
              className={`relative flex items-center gap-2 px-5 md:px-7 py-2 md:py-2.5 rounded-full font-black text-xs md:text-sm uppercase tracking-wide transition-all duration-300 ${
                !isPassageiros
                  ? 'bg-gradient-to-r from-blue-900 to-blue-700 text-white shadow-lg shadow-blue-900/40 scale-105'
                  : 'text-white/60 hover:text-white/90'
              }`}>
              <Briefcase className="w-3.5 h-3.5 md:w-4 md:h-4" />
              Comunidade
            </button>
          </div>
        </div>

        {/* ═══════ ABA PASSAGEIROS ═══════ */}
        {isPassageiros && (
        <>
        {/* Spacer para conteúdo abaixo do nav */}

        {/* Filtro */}
        <div className="relative z-30 flex flex-col items-center justify-end px-4 md:px-5 mt-auto mb-4 md:mb-6">
          {/* Indicadores (dots) */}
          <div className="flex items-center gap-2 mb-3">
            {HERO_IMAGES.map((_, i) => (
              <button
                key={i}
                onClick={() => { setHeroSlide(i); resetHeroTimer(); }}
                className={`rounded-full transition-all duration-300 ${heroSlide === i ? 'w-8 h-2.5 bg-white' : 'w-2.5 h-2.5 bg-white/40 hover:bg-white/70'}`}
                aria-label={`Ir para slide ${i + 1}`}
              />
            ))}
          </div>
          <div className="w-full max-w-2xl bg-white/15 backdrop-blur-md border border-white/30 rounded-[24px] p-3 md:p-5 space-y-2 md:space-y-3 shadow-xl shadow-orange-500/10">
            <div className="grid grid-cols-3 gap-2">

              {/* Localização */}
              <div className="relative" ref={dropRef} style={{ zIndex: 9999 }}>
                <button type="button" onClick={() => setDropOpen(v => !v)}
                  className={`w-full flex items-center gap-1.5 md:gap-2.5 px-2.5 md:px-4 py-2.5 md:py-3 rounded-[14px] border-2 font-bold text-xs md:text-sm transition-all text-left
                    ${activeCity ? 'bg-white text-blue-900 border-white' : 'bg-white/15 text-white border-white/30 hover:border-white/60'}`}>
                  <MapPin className={`w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0 ${activeCity ? 'text-blue-900' : 'text-white/70'}`} />
                  <span className="flex-1 truncate">{activeCity || 'Localização'}</span>
                  {activeCity
                    ? <span onClick={e => { e.stopPropagation(); setActiveCity(null); }}
                        className="w-4 h-4 rounded-full bg-blue-900/10 hover:bg-blue-900/20 flex items-center justify-center flex-shrink-0 cursor-pointer">
                        <X className="w-2.5 h-2.5 text-blue-900" />
                      </span>
                    : <ChevronDown className={`w-3.5 h-3.5 flex-shrink-0 text-white/50 transition-transform ${dropOpen ? 'rotate-180' : ''}`} />
                  }
                </button>

                {dropOpen && (
                  <div className="absolute left-0 bottom-full mb-2 bg-white rounded-[18px] shadow-2xl border border-gray-100 w-full min-w-[260px] overflow-hidden"
                    style={{ zIndex: 9999 }}>
                    <div className="p-3 border-b border-gray-100">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        <input autoFocus type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                          placeholder="País, estado ou cidade..."
                          className="w-full pl-9 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-[12px] text-sm font-bold text-blue-900 outline-none focus:border-blue-900 placeholder:text-gray-300 transition-all" />
                        {searchQuery && (
                          <button type="button" onClick={() => setSearchQuery('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="overflow-y-auto" style={{ maxHeight: '240px' }}>
                      {!q && (
                        <>
                          <button onClick={() => { setActiveCity(null); setDropOpen(false); setSearchQuery(''); }}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold transition-colors hover:bg-blue-50 text-left ${!activeCity ? 'text-blue-900 font-black bg-blue-50' : 'text-gray-600'}`}>
                            <span className="text-base">🌍</span>
                            <span className="flex-1">Todos os destinos</span>
                            <span className="text-[10px] font-black text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{boats.length}</span>
                          </button>
                          <div className="h-px bg-gray-100 mx-3" />
                        </>
                      )}
                      {filteredTree.length === 0
                        ? <p className="text-center py-8 text-xs text-gray-300 font-black uppercase italic">Nenhum destino encontrado</p>
                        : filteredTree.map(cn => (
                          <div key={cn.country}>
                            <div className="flex items-center gap-2 px-4 pt-3 pb-1">
                              <span className="text-base leading-none">{cn.flag}</span>
                              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{cn.country}</p>
                            </div>
                            {Object.entries(cn.states).map(([state, data]) => (
                              <div key={state}>
                                {state && <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-7 py-1">{state}</p>}
                                {data.cities.map(({ city, count }) => (
                                  <button key={city} onClick={() => { setActiveCity(city); setDropOpen(false); setSearchQuery(''); }}
                                    className={`w-full flex items-center gap-3 px-7 py-2.5 text-sm transition-colors hover:bg-blue-50 text-left ${activeCity === city ? 'text-blue-900 font-black bg-blue-50' : 'text-gray-700 font-bold'}`}>
                                    <MapPin className="w-3 h-3 text-gray-300 flex-shrink-0" />
                                    <span className="flex-1">{city}</span>
                                    <span className="text-[10px] font-black text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{count}</span>
                                  </button>
                                ))}
                              </div>
                            ))}
                            <div className="h-px bg-gray-100 mx-3 my-1" />
                          </div>
                        ))
                      }
                      <div className="h-2" />
                    </div>
                  </div>
                )}
              </div>

              {/* Data */}
              <div className="relative">
                <CalendarDays className={`absolute left-2.5 md:left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 md:w-4 md:h-4 pointer-events-none z-10 ${activeDate ? 'text-blue-900' : 'text-white/70'}`} />
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="dd/mm/aaaa"
                  value={dateDisplay}
                  onChange={e => {
                    let raw = e.target.value.replace(/\D/g, '');
                    if (raw.length > 8) raw = raw.slice(0, 8);
                    let display = raw;
                    if (raw.length >= 5) display = raw.slice(0, 2) + '/' + raw.slice(2, 4) + '/' + raw.slice(4);
                    else if (raw.length >= 3) display = raw.slice(0, 2) + '/' + raw.slice(2);
                    setDateDisplay(display);
                    if (raw.length === 8) {
                      const dd = raw.slice(0, 2), mm = raw.slice(2, 4), yyyy = raw.slice(4, 8);
                      const d = parseInt(dd), m = parseInt(mm), y = parseInt(yyyy);
                      if (d >= 1 && d <= 31 && m >= 1 && m <= 12 && y >= 2024) setActiveDate(`${yyyy}-${mm}-${dd}`);
                      else setActiveDate('');
                    } else { setActiveDate(''); }
                  }}
                  className={`w-full pl-8 md:pl-10 pr-8 md:pr-10 py-2.5 md:py-3 rounded-[14px] border-2 font-bold text-xs md:text-sm transition-all outline-none
                    ${activeDate ? 'bg-white text-blue-900 border-white' : 'bg-white/15 text-white border-white/30 hover:border-white/60 placeholder:text-white/40'}`}
                />
                {(activeDate || dateDisplay) && (
                  <button type="button" onClick={() => { setActiveDate(''); setDateDisplay(''); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-5 h-5 rounded-full bg-blue-900/10 hover:bg-blue-900/20 flex items-center justify-center cursor-pointer">
                    <X className="w-3 h-3 text-blue-900" />
                  </button>
                )}
              </div>

              {/* Pessoas */}
              <div className="relative">
                <Users className={`absolute left-2.5 md:left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 md:w-4 md:h-4 pointer-events-none z-10 ${activePeople ? 'text-blue-900' : 'text-white/70'}`} />
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Pessoas"
                  value={activePeople ? String(activePeople) : ''}
                  onChange={e => {
                    const raw = e.target.value.replace(/\D/g, '');
                    const val = raw ? parseInt(raw, 10) : null;
                    setActivePeople(val && val > 0 ? val : null);
                  }}
                  className={`w-full pl-8 md:pl-10 pr-8 md:pr-10 py-2.5 md:py-3 rounded-[14px] border-2 font-bold text-xs md:text-sm transition-all outline-none
                    ${activePeople ? 'bg-white text-blue-900 border-white' : 'bg-white/15 text-white border-white/30 hover:border-white/60 placeholder:text-white/40'}
                    [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                />
                {activePeople && (
                  <button type="button" onClick={() => setActivePeople(null)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-5 h-5 rounded-full bg-blue-900/10 hover:bg-blue-900/20 flex items-center justify-center cursor-pointer">
                    <X className="w-3 h-3 text-blue-900" />
                  </button>
                )}
              </div>
            </div>

            {/* Row 2 */}
            <div className="flex items-center justify-between">
              <p className="text-white/50 text-[11px] md:text-xs font-bold">
                {filteredBoats.length} passeio{filteredBoats.length !== 1 ? 's' : ''}
                {activeCity ? ` em ${activeCity}` : ' disponíveis'}
              </p>
              <button onClick={() => navigate('/passeios')}
                className="flex items-center gap-1 md:gap-1.5 bg-gradient-to-r from-orange-500 to-yellow-400 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-[12px] font-black text-[11px] md:text-xs uppercase hover:from-orange-600 hover:to-yellow-500 transition-all shadow-md shadow-orange-500/25 flex-shrink-0">
                Ver todos <ArrowRight className="w-3 h-3 md:w-3.5 md:h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Spacer inferior */}
        <div className="h-4" />
        </>
        )}

        {/* ═══════ ABA COMUNIDADE ═══════ */}
        {!isPassageiros && <HeroComunidade navigate={navigate} />}

      </div>

      {/* ═══════ RESULTADOS FILTRADOS (fora da hero, abaixo) ═══════ */}
      {isPassageiros && hasActiveFilter && (
        <FilteredResults
          filteredResultsRef={filteredResultsRef}
          filteredBoats={filteredBoats}
          schedulesMap={schedulesMap}
          activeCity={activeCity}
          activePeople={activePeople}
          activeDate={activeDate}
          onSelectBoat={setSelectedBoat}
          onClearFilters={() => { setActiveCity(null); setActivePeople(null); setActiveDate(''); setDateDisplay(''); }}
        />
      )}

      {/* Modal de detalhe */}
      {selectedBoat && (
        <TripDetailModal boat={selectedBoat} onClose={() => setSelectedBoat(null)} onBook={handleBook} />
      )}
    </>
  );
};