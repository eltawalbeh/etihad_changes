import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router';
import { Menu, X, Globe, MessageCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { motion, AnimatePresence } from 'motion/react';
import { Logo } from './Logo';
import { buildWhatsAppUrl, recordWhatsAppClick } from '../lib/siteTracking';

const FONT = "'IBM Plex Sans Arabic', sans-serif";

export function Navbar() {
  const { lang, setLang, t, isRTL } = useLanguage();
  const { settings } = useData();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  // Only the homepage has a full-screen dark hero where transparent navbar makes sense.
  // All other pages start with a light/white background — use solid navbar there.
  const isHeroPage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { key: 'nav.home', path: '/' },
    { key: 'nav.packages', path: '/packages' },
    { key: 'nav.services', path: '/services' },
    { key: 'nav.about', path: '/about' },
    { key: 'nav.news', path: '/news' },
    { key: 'nav.contact', path: '/contact' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const transparent = isHeroPage && !scrolled && !menuOpen;
  const navBg = transparent ? 'bg-transparent' : 'bg-white shadow-md';
  const textColor = transparent ? 'text-white' : 'text-[#0D0D0D]';

  const whatsappNumber = settings?.whatsapp || '966560074845';
  const whatsappHref = buildWhatsAppUrl(whatsappNumber);

  return (
    <>
      <nav
        className={`w-full transition-all duration-300 ${navBg}`}
        style={{ fontFamily: FONT }}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="flex items-center justify-between h-20">

            {/* Logo */}
            <Link to="/" className="flex items-center shrink-0">
              <Logo variant={transparent ? 'white' : 'dark'} height={50} />
            </Link>

            {/* Desktop Nav Links — center */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.key}
                  to={link.path}
                  className={`relative px-4 py-2 rounded-lg text-[14px] font-medium transition-colors duration-200
                    ${isActive(link.path)
                      ? 'text-[#D32F2F]'
                      : `${textColor} hover:text-[#D32F2F]`
                    }`}
                >
                  {t(link.key)}
                  {isActive(link.path) && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-[#D32F2F] rounded-full" />
                  )}
                </Link>
              ))}
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Language toggle */}
              <button
                onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[13px] font-medium transition-all duration-200
                  ${transparent
                    ? 'border-white/50 text-white hover:bg-white/10'
                    : 'border-gray-200 text-[#0D0D0D] hover:border-[#D32F2F] hover:text-[#D32F2F]'
                  }`}
              >
                <Globe size={14} />
                {lang === 'ar' ? 'EN' : 'عربي'}
              </button>

              {/* WhatsApp */}
              <a
                href={whatsappHref}
                onClick={() => recordWhatsAppClick({ source: 'navbar' })}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 bg-[#25D366] hover:bg-[#1fba59] text-white rounded-full text-[13px] font-semibold transition-colors duration-200"
              >
                <MessageCircle size={14} />
                {isRTL ? 'واتساب' : 'WhatsApp'}
              </a>
            </div>

            {/* Mobile controls */}
            <div className="flex lg:hidden items-center gap-2">
              <button
                onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
                className={`p-2 rounded-full text-[13px] font-medium ${transparent ? 'text-white' : 'text-[#0D0D0D]'}`}
                aria-label="Switch language"
              >
                <Globe size={18} />
              </button>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className={`p-2 rounded-md transition-colors ${transparent ? 'text-white hover:bg-white/10' : 'text-[#0D0D0D] hover:bg-gray-100'}`}
                aria-label="Toggle menu"
              >
                {menuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>

          </div>
        </div>
      </nav>

      {/* Mobile full-screen menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-[#0D0D0D] flex flex-col overflow-y-auto"
            style={{ fontFamily: FONT, paddingTop: 'var(--header-height, 80px)' }}
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            <div className="px-8 py-6 border-b border-white/10 mb-2">
              <Logo variant="white" height={50} />
            </div>
            <div className="px-8 py-6 flex flex-col gap-2 flex-1">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.key}
                  initial={{ opacity: 0, x: isRTL ? 30 : -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <Link
                    to={link.path}
                    className={`flex items-center py-4 text-xl border-b border-white/10 transition-colors
                      ${isActive(link.path) ? 'text-[#D32F2F]' : 'text-white hover:text-[#FF6659]'}`}
                  >
                    {t(link.key)}
                    {isActive(link.path) && (
                      <span className={`block w-2 h-2 rounded-full bg-[#D32F2F] ${isRTL ? 'mr-auto' : 'ml-auto'}`} />
                    )}
                  </Link>
                </motion.div>
              ))}
              <div className="mt-8 flex flex-col gap-3">
                <a
                  href={whatsappHref}
                  onClick={() => recordWhatsAppClick({ source: 'navbar' })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-3 bg-[#25D366] text-white rounded-full font-semibold text-base"
                >
                  <MessageCircle size={18} />
                  {isRTL ? 'واتساب' : 'WhatsApp'}
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}