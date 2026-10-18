import { Outlet, useLocation } from 'react-router';
import { useEffect, useRef } from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { WhatsAppButton } from '../components/WhatsAppButton';
import { CookieBanner } from '../components/CookieBanner';
import { TopBanner } from '../components/TopBanner';
import { GoogleTag, SiteMetadata } from '../components/GoogleTag';
import { LanguageProvider } from '../context/LanguageContext';
import { DataProvider } from '../context/DataContext';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

/**
 * SiteHeader
 * ──────────
 * A single `fixed` wrapper that stacks TopBanner + Navbar.
 * Both live inside one positioned container, so the banner always
 * pushes the navbar down naturally — no overlap, no z-index fights.
 *
 * We measure the total height and write it to --header-height so
 * pages without a hero image can consume it via CSS / inline style.
 */
function SiteHeader() {
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function updateVar() {
      const h = headerRef.current?.offsetHeight ?? 80;
      document.documentElement.style.setProperty('--header-height', `${h}px`);
    }

    updateVar();
    const observer = new ResizeObserver(updateVar);
    if (headerRef.current) observer.observe(headerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={headerRef} className="fixed top-0 left-0 right-0 z-50">
      <TopBanner />
      <Navbar />
    </div>
  );
}

export function Root() {
  return (
    <LanguageProvider>
      <DataProvider>
        <GoogleTag />
        <SiteMetadata />
        <ScrollToTop />
        <div className="min-h-screen flex flex-col bg-[#F5F0EB]">
          <SiteHeader />
          {/*
            Pages with a full-width hero image (Home, Contact, News, etc.) intentionally
            sit behind the fixed header — the transparent navbar overlays the dark hero.
            Pages WITHOUT a hero (Search, etc.) use pt-[var(--header-height)] themselves.
          */}
          <main className="flex-1">
            <Outlet />
          </main>
          <Footer />
          <WhatsAppButton />
          <CookieBanner />
        </div>
      </DataProvider>
    </LanguageProvider>
  );
}
