import { useState, useEffect } from 'react';
import { Cookie, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { motion, AnimatePresence } from 'motion/react';

export function CookieBanner() {
  const { t, isRTL } = useLanguage();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('etihad_cookie_consent');
    if (!consent) {
      setTimeout(() => setVisible(true), 2000);
    }
    const reopen = () => setVisible(true);
    window.addEventListener('etihad:reopen-consent', reopen);
    return () => window.removeEventListener('etihad:reopen-consent', reopen);
  }, []);

  const handleAccept = () => {
    localStorage.setItem('etihad_cookie_consent', 'accepted');
    window.dispatchEvent(new Event('etihad:consent-changed'));
    setVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('etihad_cookie_consent', 'declined');
    window.dispatchEvent(new Event('etihad:consent-changed'));
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={`fixed bottom-4 z-50 left-4 right-4 sm:left-auto sm:right-6 sm:w-[380px] bg-[#161616] text-white rounded-xl shadow-2xl border border-white/10 p-5`}
          style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          <button
            onClick={handleDecline}
            className={`absolute top-3 ${isRTL ? 'left-3' : 'right-3'} text-white/50 hover:text-white transition-colors`}
            aria-label="Close"
          >
            <X size={16} />
          </button>
          <div className={`flex items-start gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className="w-8 h-8 bg-[#D32F2F]/20 rounded-full flex items-center justify-center shrink-0 mt-0.5">
              <Cookie size={15} className="text-[#D32F2F]" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-white/80 leading-relaxed">{t('cookie.text')}</p>
              <div className={`flex gap-2 mt-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <button
                  onClick={handleAccept}
                  className="px-4 py-1.5 bg-[#D32F2F] hover:bg-[#9A0007] text-white text-xs rounded-full font-medium transition-colors"
                >
                  {t('cookie.accept')}
                </button>
                <button
                  onClick={handleDecline}
                  className="px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs rounded-full transition-colors"
                >
                  {t('cookie.decline')}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}