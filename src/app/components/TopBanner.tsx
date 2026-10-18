import { useState } from 'react';
import { X, ExternalLink } from 'lucide-react';
import { Link } from 'react-router';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';

export function TopBanner() {
  const { settings } = useData();
  const { isRTL } = useLanguage();
  const [dismissed, setDismissed] = useState(false);

  // Don't render if: disabled, dismissed by user, or no message
  if (!settings?.banner_enabled) return null;
  if (dismissed) return null;

  const message = isRTL ? settings.banner_message_ar : settings.banner_message_en;
  if (!message?.trim()) return null;

  const linkUrl = settings.banner_link?.trim();
  const linkLabel = isRTL
    ? (settings.banner_link_label_ar || 'اقرأ المزيد')
    : (settings.banner_link_label_en || 'Read More');

  // Decide if link is internal or external
  const isExternal = linkUrl && (linkUrl.startsWith('http://') || linkUrl.startsWith('https://'));

  return (
    <div
      className="relative bg-[#D32F2F] text-white text-sm"
      style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-2.5 flex items-center gap-3">

        {/* Message — centered, takes remaining space */}
        <p className="flex-1 text-center font-medium leading-snug text-white/95 text-[13px]">
          {message}
        </p>

        {/* "Read More" link — only if URL is provided */}
        {linkUrl && (
          isExternal ? (
            <a
              href={linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 flex items-center gap-1 bg-white/20 hover:bg-white/30 active:bg-white/40 text-white text-[12px] font-semibold px-3 py-1 rounded-full transition-colors whitespace-nowrap"
            >
              {linkLabel}
              <ExternalLink size={11} />
            </a>
          ) : (
            <Link
              to={linkUrl}
              className="shrink-0 flex items-center gap-1 bg-white/20 hover:bg-white/30 active:bg-white/40 text-white text-[12px] font-semibold px-3 py-1 rounded-full transition-colors whitespace-nowrap"
            >
              {linkLabel}
            </Link>
          )
        )}

        {/* Dismiss button */}
        <button
          onClick={() => setDismissed(true)}
          className="shrink-0 p-1 rounded-full hover:bg-white/20 active:bg-white/30 transition-colors text-white/80 hover:text-white"
          aria-label="Dismiss banner"
        >
          <X size={15} />
        </button>

      </div>
    </div>
  );
}