import { Link } from 'react-router';
import { Phone, Mail, MapPin, Instagram, Twitter, Facebook, MessageCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { Logo } from './Logo';
import { TikTokIcon, SnapchatIcon } from './SocialIcons';
import { buildWhatsAppUrl, recordWhatsAppClick } from '../lib/siteTracking';

export function Footer() {
  const { t, isRTL } = useLanguage();
  const { settings } = useData();

  const phone = settings?.phone || '';
  const phoneHref = `tel:${phone.replace(/\s+/g, '')}`;
  const email = settings?.email || 'info@etihadtours.com';
  const whatsapp = settings?.whatsapp || '966560074845';
  const addressAr = settings?.address_ar || 'طريق الملك عبدالعزيز، الخالدية، عرعر 73211، المملكة العربية السعودية';
  const addressEn = settings?.address_en || 'King Abdulaziz Road, Alkhalidiyah, Arar 73211, Saudi Arabia';
  const tagline = isRTL
    ? (settings?.tagline_ar || 'شريكك الموثوق في السفر عبر المنطقة والعالم.')
    : (settings?.tagline_en || 'Your trusted travel partner across the region and beyond.');

  // Social links — only show if URL is set AND toggle is enabled in admin
  const socialLinks = [
    { icon: Instagram,    href: settings?.social_instagram, enabled: settings?.social_instagram_enabled, label: 'Instagram' },
    { icon: Twitter,      href: settings?.social_twitter,   enabled: settings?.social_twitter_enabled,   label: 'X (Twitter)' },
    { icon: Facebook,     href: settings?.social_facebook,  enabled: settings?.social_facebook_enabled,  label: 'Facebook' },
    { icon: TikTokIcon,   href: settings?.social_tiktok,    enabled: settings?.social_tiktok_enabled,    label: 'TikTok' },
    { icon: SnapchatIcon, href: settings?.social_snapchat,  enabled: settings?.social_snapchat_enabled,  label: 'Snapchat' },
    { icon: MessageCircle, href: whatsapp ? buildWhatsAppUrl(whatsapp) : '', enabled: true, label: 'WhatsApp' },
  ].filter(s => s.href && s.enabled);

  return (
    <footer
      className="bg-[#0D0D0D] text-white"
      style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", borderTop: '3px solid #D32F2F' }}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="max-w-[1280px] mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Column 1: Logo + Tagline + Social */}
          <div className="lg:col-span-1">
            <div className="mb-5">
              <Logo variant="white" height={56} />
            </div>
            <p className="text-[#8C8076] text-sm leading-relaxed mb-6">{tagline}</p>
            {socialLinks.length > 0 && (
              <div className="flex gap-3">
                {socialLinks.map(({ icon: Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    onClick={() => { if (label === 'WhatsApp') recordWhatsAppClick({ source: 'footer' }); }}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#D32F2F] flex items-center justify-center transition-colors duration-200"
                  >
                    <Icon size={15} />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4
              className="text-white font-semibold mb-5 text-[15px]"
              style={{ color: '#D32F2F' }}
            >
              {t('footer.quick_links')}
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: t('nav.home'), path: '/' },
                { label: t('nav.about'), path: '/about' },
                { label: t('nav.packages'), path: '/packages' },
                { label: t('nav.services'), path: '/services' },
                { label: t('nav.news'), path: '/news' },
                { label: t('nav.contact'), path: '/contact' },
              ].map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className="text-[#8C8076] hover:text-white text-sm transition-colors duration-200"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Services */}
          <div>
            <h4 className="font-semibold mb-5 text-[15px]" style={{ color: '#D32F2F' }}>
              {t('footer.services')}
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: t('services.international_title'), path: '/packages?type=external' },
                { label: t('services.domestic_title'), path: '/packages?type=internal' },
                { label: t('services.visa_title'), path: '/services' },
                { label: t('services.rental_title'), path: '/services' },
                { label: t('services_page.exhibitions_title'), path: '/services' },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.path}
                    className="text-[#8C8076] hover:text-white text-sm transition-colors duration-200"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact Info */}
          <div>
            <h4 className="font-semibold mb-5 text-[15px]" style={{ color: '#D32F2F' }}>
              {t('footer.contact_info')}
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <MapPin size={15} className="text-[#D32F2F] shrink-0 mt-0.5" />
                <span className="text-[#8C8076] text-sm">
                  {isRTL ? addressAr : addressEn}
                </span>
              </li>
              {phone && (
                <li className="flex items-center gap-2.5">
                  <Phone size={15} className="text-[#D32F2F] shrink-0" />
                  <a href={phoneHref} className="text-[#8C8076] hover:text-white text-sm transition-colors" dir="ltr">
                    {phone}
                  </a>
                </li>
              )}
              <li className="flex items-center gap-2.5">
                <Mail size={15} className="text-[#D32F2F] shrink-0" />
                <a href={`mailto:${email}`} className="text-[#8C8076] hover:text-white text-sm transition-colors">
                  {email}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className={`max-w-[1280px] mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#8C8076] ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
          <div className="text-center sm:text-start">
            <div>{t('footer.copyright')}</div>
            <div className="mt-1 leading-relaxed" dir={isRTL ? 'rtl' : 'ltr'}>
              {isRTL
                ? 'رخصة السياحة - الإتحاد - 73104024 | مؤسسة الأتحاد للسفر و السياحة - 3450102063'
                : 'Tourism License - Al Etihad - 73104024 | Al Etihad Travel & Tourism Establishment - 3450102063'}
            </div>
          </div>
          <div className={`flex gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Link to="/privacy" className="hover:text-white transition-colors">{t('footer.privacy')}</Link>
            <Link to="/terms" className="hover:text-white transition-colors">{t('footer.terms')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}