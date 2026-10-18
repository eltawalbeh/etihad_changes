import { useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';

function validTagId(value: string | undefined) {
  const tag = String(value || '').trim().toUpperCase();
  return /^(G-[A-Z0-9]{6,}|GTM-[A-Z0-9]+)$/.test(tag) ? tag : '';
}
function applyMeta(name: string, content: string, attribute: 'name' | 'property' = 'name') {
  let node = document.querySelector<HTMLMetaElement>(`meta[${attribute}="${name}"]`);
  if (!node) { node = document.createElement('meta'); node.setAttribute(attribute, name); document.head.appendChild(node); }
  node.content = content;
}
export function GoogleTag() {
  const { settings } = useData();
  const { pathname, search } = useLocation();
  const tagId = validTagId(settings.google_tag_id);
  const [consent, setConsent] = useState(() => typeof window !== 'undefined' && window.localStorage.getItem('etihad_cookie_consent') === 'accepted');
  useEffect(() => {
    const sync = () => setConsent(window.localStorage.getItem('etihad_cookie_consent') === 'accepted');
    window.addEventListener('etihad:consent-changed', sync);
    return () => window.removeEventListener('etihad:consent-changed', sync);
  }, []);
  useEffect(() => {
    if (!consent || !tagId || document.getElementById(`google-tag-${tagId}`)) return;
    const script = document.createElement('script');
    script.id = `google-tag-${tagId}`;
    script.async = true;
    if (tagId.startsWith('G-')) {
      script.src = `https://www.googletagmanager.com/gtag/js?id=${tagId}`;
      window.dataLayer = window.dataLayer || [];
      window.gtag = (...args: any[]) => window.dataLayer?.push(args);
      window.gtag('js', new Date());
      window.gtag('config', tagId, { send_page_view: false });
    } else {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
      script.src = `https://www.googletagmanager.com/gtm.js?id=${tagId}`;
    }
    document.head.appendChild(script);
  }, [tagId, consent]);
  useEffect(() => {
    if (!consent || !tagId.startsWith('G-')) return;
    window.gtag?.('event', 'page_view', { page_location: window.location.href, page_path: pathname + search, send_to: tagId });
  }, [consent, tagId, pathname, search]);
  return null;
}
const pageTitles: Record<string, [string, string, string, string]> = {
  '/': ['الرئيسية', 'Home', 'رحلات وخدمات سياحية من مؤسسة الاتحاد للسفر والسياحة.', 'Travel experiences and support from Al-Etihad Tours.'],
  '/about': ['من نحن', 'About Us', 'تعرف على مؤسسة الاتحاد للسفر والسياحة وخدماتها.', 'Learn about Al-Etihad Tours and its travel services.'],
  '/contact': ['تواصل معنا', 'Contact Us', 'موقع عرعر وطرق التواصل مع الاتحاد للسفر والسياحة.', 'Contact Al-Etihad Tours and find the Arar office.'],
  '/packages': ['الرحلات', 'Travel Packages', 'استعرض عروض الرحلات واطلب التفاصيل.', 'Explore available travel packages and request details.'],
  '/services': ['خدماتنا', 'Services', 'خدمات الرحلات وتأشيرات السفر.', 'Travel services and visa assistance.'],
  '/news': ['الأخبار', 'News', 'مقالات وأخبار الاتحاد للسفر والسياحة.', 'Travel articles and news from Al-Etihad Tours.'],
  '/evisa': ['التأشيرات', 'Visas', 'معلومات وخدمات مساعدة التأشيرات.', 'Visa information and assistance.'],
  '/privacy': ['سياسة الخصوصية', 'Privacy Policy', 'كيفية التعامل مع بيانات الاستفسارات.', 'How inquiry data is handled.'],
  '/terms': ['شروط الاستخدام', 'Terms of Use', 'شروط استخدام الموقع وإرسال الاستفسارات.', 'Website terms and conditions.'],
};
export function SiteMetadata() {
  const { settings } = useData();
  const { pathname } = useLocation();
  const { lang } = useLanguage();
  useEffect(() => {
    const isAr = lang === 'ar';
    const base = pageTitles[pathname] || (pathname.startsWith('/packages/') ? pageTitles['/packages'] : pathname.startsWith('/news/') ? pageTitles['/news'] : pageTitles['/']);
    const title = (isAr ? base[0] : base[1]) + ' | ' + (isAr ? 'الاتحاد للسفر والسياحة' : 'Al-Etihad Tours');
    const description = base[isAr ? 2 : 3];
    const canonical = 'https://etihadtours.com' + (pathname === '/' ? '/' : pathname);
    document.title = title;
    applyMeta('description', description);
    applyMeta('robots', ['/privacy', '/terms'].includes(pathname) ? 'noindex,follow' : 'index,follow');
    applyMeta('og:title', title, 'property');
    applyMeta('og:description', description, 'property');
    applyMeta('og:url', canonical, 'property');
    applyMeta('twitter:title', title);
    applyMeta('twitter:description', description);
    let canonicalTag = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonicalTag) { canonicalTag = document.createElement('link'); canonicalTag.rel = 'canonical'; document.head.appendChild(canonicalTag); }
    canonicalTag.href = canonical;
    const verification = String(settings.search_console_verification || '').trim();
    let verificationTag = document.querySelector<HTMLMetaElement>('meta[name="google-site-verification"]');
    if (verification) applyMeta('google-site-verification', verification);
    else verificationTag?.remove();
    let structured = document.getElementById('etihad-structured-data');
    if (!structured) { structured = document.createElement('script'); structured.id = 'etihad-structured-data'; structured.setAttribute('type','application/ld+json'); document.head.appendChild(structured); }
    const schema: any = {
      '@context':'https://schema.org', '@type':'TravelAgency',
      name:'مؤسسة الاتحاد للسفر والسياحة', alternateName:'Al-Etihad Tours',
      url:'https://etihadtours.com',
      email:settings.email || 'info@etihadtours.com',
      address:{ '@type':'PostalAddress', streetAddress:'King Abdulaziz Road, Alkhalidiyah', addressLocality:'Arar', postalCode:'73211', addressCountry:'SA' }
    };
    if (settings.phone) schema.telephone = settings.phone;
    structured.textContent = JSON.stringify(schema);
  }, [pathname, lang, settings.email, settings.phone, settings.search_console_verification]);
  return null;
}
