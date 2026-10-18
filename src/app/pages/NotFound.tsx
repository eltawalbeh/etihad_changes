import { Link } from 'react-router';
import { Home, Package, Phone, Search } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';

export function NotFound() {
  const { t, isRTL } = useLanguage();

  return (
    <div
      className="min-h-screen bg-[#0D0D0D] flex flex-col items-center justify-center px-6 py-20"
      style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-lg"
      >
        {/* Big 404 */}
        <div
          className="text-[#D32F2F] mb-4 select-none"
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(6rem, 20vw, 10rem)',
            fontWeight: 900,
            lineHeight: 1,
            textShadow: '0 0 80px rgba(211, 47, 47, 0.3)',
          }}
        >
          404
        </div>

        <h1
          className="text-white mb-3"
          style={{
            fontFamily: "'IBM Plex Sans Arabic', sans-serif",
            fontSize: 'clamp(1.5rem, 4vw, 2rem)',
            fontWeight: 700,
          }}
        >
          {t('notfound.title')}
        </h1>
        <p className="text-white/50 mb-10 text-sm leading-relaxed">{t('notfound.subtitle')}</p>

        {/* Search */}
        <div className="flex items-center bg-white/10 border border-white/10 rounded-full px-4 py-2.5 mb-10 max-w-sm mx-auto">
          <Search size={16} className="text-white/40 shrink-0" />
          <input
            type="text"
            placeholder={t('general.search_placeholder')}
            className={`flex-1 bg-transparent text-white text-sm px-3 focus:outline-none placeholder:text-white/30 ${isRTL ? 'text-right' : 'text-left'}`}
          />
        </div>

        {/* Quick links */}
        <div className={`flex flex-col sm:flex-row items-center justify-center gap-3 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
          {[
            { label: t('notfound.home'), href: '/', icon: Home },
            { label: t('notfound.packages'), href: '/packages', icon: Package },
            { label: t('notfound.contact'), href: '/contact', icon: Phone },
          ].map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              to={href}
              className={`flex items-center gap-2 px-5 py-2.5 border border-white/20 hover:border-[#D32F2F] hover:bg-[#D32F2F] text-white rounded-full text-sm transition-all duration-200 ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <Icon size={14} />
              {label}
            </Link>
          ))}
        </div>

        {/* Destination image decoration */}
        <div className="mt-16 opacity-20">
          <div className="text-6xl">🗺️</div>
        </div>
      </motion.div>
    </div>
  );
}