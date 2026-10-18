import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router';
import { motion, useInView, AnimatePresence } from 'motion/react';
import {
  Plane, Map, FileText, Car, ArrowRight, ArrowLeft,
  Shield, Headphones, Award, Search,
  ChevronLeft, ChevronRight, MapPin, Star
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { PackageCard } from '../components/PackageCard';
import { useData } from '../context/DataContext';
import { SearchBar } from '../components/SearchBar';

const FONT = "'IBM Plex Sans Arabic', sans-serif";

function isPublicHeroPackage(pkg: any) {
  if (pkg?.status !== 'published' || pkg?.is_active !== true) return false;
  if (!pkg.expiry_date) return true;
  return /^\d{4}-\d{2}-\d{2}$/.test(pkg.expiry_date) && pkg.expiry_date >= new Date().toISOString().slice(0, 10);
}

function AnimatedCounter({ target, duration = 2000 }: { target: number; duration?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target, duration]);

  return <motion.span ref={ref} initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}>{count.toLocaleString()}</motion.span>;
}

function FadeUp({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay, ease: 'easeOut' }} className={className}>
      {children}
    </motion.div>
  );
}

export function Home() {
  const { t, lang, isRTL } = useLanguage();
  const { packages, stats, articles, settings } = useData();
  const [slideIndex, setSlideIndex] = useState(0);
  const [showFab, setShowFab] = useState(false);

  // Ref for the search bar — used by FAB to scroll into view
  const searchRef = useRef<HTMLDivElement>(null);
  // Ref for the hero section — used by IntersectionObserver to show/hide FAB
  const heroRef = useRef<HTMLDivElement>(null);

  const featuredPackages = packages.filter(pkg => pkg.is_featured).filter(isPublicHeroPackage).slice(0, 6);
  const configuredHeroPackages = (settings.hero_package_ids || [])
    .map(id => packages.find(pkg => pkg.id === id))
    .filter(isPublicHeroPackage);
  const heroSlides = (configuredHeroPackages.length ? configuredHeroPackages : featuredPackages).slice(0, 3);
  const heroSlideCount = Math.max(heroSlides.length, 1);
  const currentSlide = heroSlides[slideIndex % heroSlideCount];
  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  // Auto-advance slides
  useEffect(() => {
    if (heroSlides.length < 2) return;
    const timer = setInterval(() => setSlideIndex(i => (i + 1) % heroSlides.length), 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  // Show floating search FAB when hero is out of view
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowFab(!entry.isIntersecting),
      { threshold: 0, rootMargin: '-80px 0px 0px 0px' }
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  const handleFabClick = () => {
    searchRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const services = [
    { icon: Plane, title: t('services.international_title'), desc: t('services.international_desc'), href: '/packages?type=external' },
    { icon: Map, title: t('services.domestic_title'), desc: t('services.domestic_desc'), href: '/packages?type=internal' },
    { icon: FileText, title: t('services.visa_title'), desc: t('services.visa_desc'), href: '/services' },
    { icon: Car, title: t('services.rental_title'), desc: t('services.rental_desc'), href: '/services' },
  ];

  const whyUs = [
    { icon: Shield, title: t('why.price'), desc: t('why.price_desc') },
    { icon: Headphones, title: t('why.support'), desc: t('why.support_desc') },
    { icon: Award, title: t('why.experience'), desc: t('why.experience_desc') },
  ];

  const statsData = [
    { label: t('stats.clients'), value: stats.happy_clients, suffix: '+' },
    { label: t('stats.trips'), value: stats.trips_organized, suffix: '+' },
    { label: t('stats.years'), value: stats.years_experience, suffix: '' },
    { label: t('stats.destinations'), value: stats.destinations, suffix: '' },
  ].filter(item => settings.stats_verified === true && item.value > 0);

  return (
    <div style={{ fontFamily: FONT }}>
      {/* ===== HERO ===== */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col">
        {/* Slides — overflow-hidden scoped here so dropdowns can escape */}
        <div className="absolute inset-0 overflow-hidden">
          <AnimatePresence mode="sync">
            <motion.div
              key={slideIndex}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: 'easeInOut' }}
              className="absolute inset-0"
              style={{
                backgroundImage: currentSlide?.cover_image_url ? `url(${currentSlide.cover_image_url})` : 'linear-gradient(115deg, #161616, #5D1016)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
          </AnimatePresence>

          {/* Gradient overlay — rich, layered */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/40 to-[#D32F2F]/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

          {/* Decorative red accent line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#D32F2F] to-transparent" />
        </div>

        {/* Slide arrows */}
        <button
          onClick={() => setSlideIndex(i => (i - 1 + heroSlides.length) % heroSlides.length)}
          disabled={heroSlides.length < 2}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white transition-all"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={() => setSlideIndex(i => (i + 1) % heroSlides.length)}
          disabled={heroSlides.length < 2}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white transition-all"
        >
          <ChevronRight size={20} />
        </button>

        {/* Current destination badge */}
        {currentSlide && <div className="absolute top-28 right-8 z-20 hidden lg:block">
          <motion.div
            key={slideIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2"
          >
            <MapPin size={14} className="text-[#D32F2F]" />
            <span className="text-white text-sm font-medium">
              {isRTL ? currentSlide?.destination_ar : currentSlide?.destination_en}
            </span>
          </motion.div>
        </div>}

        {/* Star rating badge */}
        <div className="absolute top-28 left-8 z-20 hidden lg:block">
          <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur-md border border-white/10 rounded-full px-4 py-2">
            {[...Array(5)].map((_, i) => <Star key={i} size={12} className="text-yellow-400 fill-yellow-400" />)}
            <span className="text-white text-xs ms-1">{isRTL ? 'خدمة متميزة' : 'Premium Service'}</span>
          </div>
        </div>

        {/* Main hero content */}
        <div className="relative z-10 flex flex-col items-center justify-center flex-1 text-white text-center px-6 pt-24 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3 }}
            className="max-w-5xl mx-auto"
          >
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 mb-6 px-5 py-2 rounded-full bg-[#D32F2F]/20 border border-[#D32F2F]/40 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-[#D32F2F] animate-pulse" />
              <span className="text-sm text-white/90 font-medium tracking-wide">
                {isRTL ? 'الاتحاد للسفر والسياحة' : 'Al-Etihad Tours'}
              </span>
            </div>

            {/* Main headline */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`headline-${slideIndex}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <h1
                  className="mb-3 text-white leading-tight"
                  style={{ fontSize: 'clamp(2.8rem, 8vw, 5.5rem)', fontWeight: 700, lineHeight: 1.05 }}
                >
                  {currentSlide ? (isRTL ? currentSlide.destination_ar : currentSlide.destination_en) : t('hero.title')}
                </h1>
                <p className="text-[#D32F2F] font-semibold text-xl mb-4" style={{ fontSize: 'clamp(1rem, 2.5vw, 1.4rem)' }}>
                  {currentSlide ? (isRTL ? currentSlide.title_ar : currentSlide.title_en) : (isRTL ? 'ابدأ رحلتك معنا' : 'Plan your next journey')}
                </p>
              </motion.div>
            </AnimatePresence>

            <h2
              className="mb-4 text-white/80"
              style={{ fontSize: 'clamp(1.1rem, 3vw, 1.6rem)', fontWeight: 300, lineHeight: 1.5 }}
            >
              {t('hero.title')}
            </h2>
            <p className="text-white/65 mb-8 max-w-2xl mx-auto" style={{ fontSize: '1.05rem', lineHeight: 1.8 }}>
              {t('hero.subtitle')}
            </p>

            <div className={`flex flex-col sm:flex-row gap-4 justify-center mb-8 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
              <Link
                to="/packages"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#D32F2F] hover:bg-[#9A0007] text-white rounded-full font-semibold transition-all duration-300 shadow-lg shadow-[#D32F2F]/30 hover:shadow-[#D32F2F]/50 hover:scale-105 text-sm"
              >
                {t('hero.cta_primary')}
                <Arrow size={16} />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white/50 text-white hover:bg-white hover:text-[#0D0D0D] rounded-full font-semibold transition-all duration-300 backdrop-blur-sm text-sm"
              >
                {t('hero.cta_secondary')}
              </Link>
            </div>

            {/* Slide dots — inline with content flow, no overlap */}
            <div className="flex items-center justify-center gap-2">
              {heroSlides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSlideIndex(i)}
                  className={`rounded-full transition-all duration-300 ${i === slideIndex ? 'w-8 h-2 bg-[#D32F2F]' : 'w-2 h-2 bg-white/40 hover:bg-white/70'}`}
                />
              ))}
            </div>
          </motion.div>
        </div>

        {/* ====== SEARCH BAR ====== */}
        <motion.div
          ref={searchRef}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="relative z-30 w-full max-w-5xl mx-auto px-4 pb-14"
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          <SearchBar />
        </motion.div>
      </section>

      {/* ===== FLOATING MOBILE SEARCH FAB ===== */}
      <AnimatePresence>
        {showFab && (
          <motion.button
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={handleFabClick}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 sm:hidden flex items-center gap-2.5 px-5 py-3 bg-[#D32F2F] hover:bg-[#9A0007] text-white rounded-full font-bold text-sm shadow-xl shadow-[#D32F2F]/40 border border-red-400/30 backdrop-blur-sm"
            style={{ fontFamily: FONT }}
          >
            <Search size={16} />
            {isRTL ? 'ابحث عن رحلة' : 'Search Trips'}
          </motion.button>
        )}
      </AnimatePresence>

      {/* ===== STATS BAR ===== */}
      {statsData.length > 0 && <section className="bg-white border-y border-gray-100 py-10">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8" dir={isRTL ? 'rtl' : 'ltr'}>
            {statsData.map((stat, i) => (
              <FadeUp key={stat.label} delay={i * 0.1}>
                <div className="text-center">
                  <div className="text-[#D32F2F] mb-1 flex items-baseline justify-center gap-1"
                    style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 700 }}>
                    <AnimatedCounter target={stat.value} />
                    <span>{stat.suffix}</span>
                  </div>
                  <div className="text-[#8C8076] text-sm font-medium">{stat.label}</div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>}

      {/* ===== SERVICES ===== */}
      <section className="py-20 bg-[#F5F0EB]">
        <div className="max-w-[1280px] mx-auto px-6" dir={isRTL ? 'rtl' : 'ltr'}>
          <FadeUp>
            <div className="mb-12">
              <span className="text-[#D32F2F] text-xs font-bold uppercase tracking-widest">
                — {isRTL ? 'خدماتنا' : 'What We Offer'}
              </span>
              <h2 className="mt-2 text-[#0D0D0D]" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 700 }}>
                {t('services.title')}
              </h2>
            </div>
          </FadeUp>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((svc, i) => {
              const Icon = svc.icon;
              return (
                <FadeUp key={svc.title} delay={i * 0.1}>
                  <Link
                    to={svc.href}
                    className="group block p-6 bg-white rounded-xl border border-transparent hover:border-[#D32F2F] hover:shadow-xl transition-all duration-300 h-full relative overflow-hidden"
                  >
                    <div className="w-13 h-13 w-12 h-12 bg-[#D32F2F]/10 group-hover:bg-[#D32F2F] rounded-xl flex items-center justify-center mb-5 transition-colors duration-300">
                      <Icon size={22} className="text-[#D32F2F] group-hover:text-white transition-colors duration-300" />
                    </div>
                    <h3 className="font-semibold text-[#0D0D0D] mb-2 text-[15px]">{svc.title}</h3>
                    <p className="text-[#8C8076] text-sm leading-relaxed mb-4">{svc.desc}</p>
                    <span className="flex items-center gap-1 text-[#D32F2F] text-xs font-semibold">
                      {t('services.learn_more')}
                      <Arrow size={12} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D32F2F] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-start" />
                  </Link>
                </FadeUp>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== FEATURED PACKAGES ===== */}
      <section className="py-20 bg-white">
        <div className="max-w-[1280px] mx-auto px-6" dir={isRTL ? 'rtl' : 'ltr'}>
          <FadeUp>
            <div className="flex items-end justify-between mb-12">
              <div>
                <span className="text-[#D32F2F] text-xs font-bold uppercase tracking-widest">
                  — {isRTL ? 'عروض مختارة' : 'Curated Trips'}
                </span>
                <h2 className="mt-2 text-[#0D0D0D]" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 700 }}>
                  {t('packages.title')}
                </h2>
              </div>
              <Link
                to="/packages"
                className="hidden sm:flex items-center gap-1.5 text-[#D32F2F] hover:text-[#9A0007] text-sm font-semibold transition-colors"
              >
                {t('packages.view_all')}
                <Arrow size={14} />
              </Link>
            </div>
          </FadeUp>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredPackages.map((pkg, i) => (
              <FadeUp key={pkg.id} delay={i * 0.08}>
                <PackageCard pkg={pkg} />
              </FadeUp>
            ))}
          </div>

          <FadeUp className="mt-10 text-center">
            <Link
              to="/packages"
              className="inline-flex items-center gap-2 px-8 py-3.5 border-2 border-[#D32F2F] text-[#D32F2F] hover:bg-[#D32F2F] hover:text-white rounded-full font-semibold transition-all duration-200 text-sm"
            >
              {t('packages.view_all')}
              <Arrow size={14} />
            </Link>
          </FadeUp>
        </div>
      </section>

      {/* ===== WHY CHOOSE US ===== */}
      <section className="py-20 bg-[#0D0D0D] text-white relative overflow-hidden">
        {/* Decorative */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-[#D32F2F] blur-3xl" />
          <div className="absolute bottom-10 right-10 w-64 h-64 rounded-full bg-[#D32F2F] blur-3xl" />
        </div>
        <div className="max-w-[1280px] mx-auto px-6 relative" dir={isRTL ? 'rtl' : 'ltr'}>
          <FadeUp>
            <div className="mb-14 text-center">
              <span className="text-[#D32F2F] text-xs font-bold uppercase tracking-widest">
                — {isRTL ? 'لماذا نحن؟' : 'Why Choose Us?'}
              </span>
              <h2 className="mt-2 text-white text-center" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 700 }}>
                {t('why.title')}
              </h2>
            </div>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {whyUs.map((item, i) => {
              const Icon = item.icon;
              return (
                <FadeUp key={item.title} delay={i * 0.15}>
                  <div className="flex flex-col items-center text-center gap-4 p-8 rounded-2xl border border-white/5 hover:border-[#D32F2F]/30 transition-colors bg-white/3">
                    <div className="w-16 h-16 bg-[#D32F2F] rounded-2xl flex items-center justify-center shadow-lg shadow-[#D32F2F]/30">
                      <Icon size={28} className="text-white" />
                    </div>
                    <h3 className="text-white font-bold text-lg">{item.title}</h3>
                    <p className="text-white/55 text-sm leading-relaxed max-w-xs">{item.desc}</p>
                  </div>
                </FadeUp>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== LATEST NEWS ===== */}
      <section className="py-20 bg-[#F5F0EB]">
        <div className="max-w-[1280px] mx-auto px-6" dir={isRTL ? 'rtl' : 'ltr'}>
          <FadeUp>
            <div className="flex items-end justify-between mb-12">
              <div>
                <span className="text-[#D32F2F] text-xs font-bold uppercase tracking-widest">
                  — {isRTL ? 'آخر الأخبار' : 'Latest Articles'}
                </span>
                <h2 className="mt-2 text-[#0D0D0D]" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 700 }}>
                  {t('news.title')}
                </h2>
              </div>
              <Link to="/news" className="hidden sm:flex items-center gap-1.5 text-[#D32F2F] hover:text-[#9A0007] text-sm font-semibold">
                {t('news.all')}
                <Arrow size={14} />
              </Link>
            </div>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {articles.slice(0, 3).map((article, i) => {
              const title = lang === 'ar' ? article.title_ar : article.title_en;
              const excerpt = lang === 'ar' ? article.excerpt_ar : article.excerpt_en;
              const date = new Date(article.published_at).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', {
                year: 'numeric', month: 'long', day: 'numeric',
              });
              const categoryLabels: Record<string, string> = {
                destinations: isRTL ? 'وجهات' : 'Destinations',
                tips: isRTL ? 'نصائح سفر' : 'Travel Tips',
                news: isRTL ? 'أخبار' : 'News',
              };
              return (
                <FadeUp key={article.id} delay={i * 0.1}>
                  <Link to={`/news/${article.slug}`} className="group block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300">
                    <div className="overflow-hidden h-48">
                      <img src={article.cover_image_url} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-2.5 py-1 bg-[#D32F2F] text-white text-xs rounded-full font-semibold">
                          {categoryLabels[article.category] || article.category}
                        </span>
                        <span className="text-xs text-[#8C8076]">{date}</span>
                      </div>
                      <h3 className="font-semibold text-[#0D0D0D] mb-2 line-clamp-2 text-[15px] group-hover:text-[#D32F2F] transition-colors">
                        {title}
                      </h3>
                      <p className="text-[#8C8076] text-sm line-clamp-2 leading-relaxed mb-4">{excerpt}</p>
                      <span className="flex items-center gap-1 text-[#D32F2F] text-xs font-semibold">
                        {t('news.read_more')} <Arrow size={12} />
                      </span>
                    </div>
                  </Link>
                </FadeUp>
              );
            })}
          </div>

          <FadeUp className="mt-10 text-center">
            <Link to="/news" className="inline-flex items-center gap-2 px-8 py-3.5 border-2 border-[#D32F2F] text-[#D32F2F] hover:bg-[#D32F2F] hover:text-white rounded-full font-semibold transition-all duration-200 text-sm">
              {t('news.all')} <Arrow size={14} />
            </Link>
          </FadeUp>
        </div>
      </section>
    </div>
  );
}