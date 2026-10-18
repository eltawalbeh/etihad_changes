import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { useData } from '../context/DataContext';

function validTagId(value: string | undefined) {
  const tag = String(value || '').trim().toUpperCase();
  return /^(G-[A-Z0-9]{6,}|GTM-[A-Z0-9]+)$/.test(tag) ? tag : '';
}

export function GoogleTag() {
  const { settings } = useData();
  const { pathname, search } = useLocation();
  const tagId = validTagId(settings.google_tag_id);

  useEffect(() => {
    if (!tagId || document.getElementById(`google-tag-${tagId}`)) return;

    if (tagId.startsWith('G-')) {
      const script = document.createElement('script');
      script.id = `google-tag-${tagId}`;
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${tagId}`;
      document.head.appendChild(script);
      window.dataLayer = window.dataLayer || [];
      window.gtag = (...args: any[]) => window.dataLayer?.push(args);
      window.gtag('js', new Date());
      window.gtag('config', tagId, { send_page_view: false });
      return;
    }

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
    const script = document.createElement('script');
    script.id = `google-tag-${tagId}`;
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtm.js?id=${tagId}`;
    document.head.appendChild(script);
  }, [tagId]);

  useEffect(() => {
    if (!tagId) return;
    window.gtag?.('event', 'page_view', {
      page_location: window.location.href,
      page_path: `${pathname}${search}`,
      send_to: tagId.startsWith('G-') ? tagId : undefined,
    });
  }, [tagId, pathname, search]);

  return null;
}

export function SiteMetadata() {
  const { settings } = useData();
  const { pathname } = useLocation();

  useEffect(() => {
    const canonical = `${window.location.origin}${pathname}`;
    let canonicalTag = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalTag) {
      canonicalTag = document.createElement('link');
      canonicalTag.rel = 'canonical';
      document.head.appendChild(canonicalTag);
    }
    canonicalTag.href = canonical;

    const verification = String(settings.search_console_verification || '').trim();
    let verificationTag = document.querySelector('meta[name="google-site-verification"]') as HTMLMetaElement | null;
    if (verification) {
      if (!verificationTag) {
        verificationTag = document.createElement('meta');
        verificationTag.name = 'google-site-verification';
        document.head.appendChild(verificationTag);
      }
      verificationTag.content = verification;
    } else {
      verificationTag?.remove();
    }
  }, [pathname, settings.search_console_verification]);

  return null;
}
