import { useRef } from 'react';
import { Link } from 'react-router';
import { motion, useInView } from 'motion/react';
import { Star, Target, Lightbulb } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';

const FONT = "'IBM Plex Sans Arabic', sans-serif";

function FadeUp({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function About() {
  const { t, lang, isRTL } = useLanguage();
  const { stats, team, settings } = useData();

  // ── Editable content — falls back to defaults if not yet saved in admin ──
  const s = settings;
  const heroImage = s.about_image_url || 'https://images.unsplash.com/photo-1650784854945-264d5b0b6b07?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=900';
  const storyLabel = isRTL ? (s.about_story_label_ar || 'قصتنا') : (s.about_story_label_en || 'Our Story');
  const pageTitle  = isRTL ? (s.about_title_ar  || t('about.title'))  : (s.about_title_en  || t('about.title'));
  const story1     = isRTL ? (s.about_story_ar || '') : (s.about_story_en || '');
  const story2     = isRTL
    ? (s.about_story2_ar || '')
    : (s.about_story2_en || '');
  const valuesTitle = isRTL ? (s.about_values_title_ar || t('about.values_title')) : (s.about_values_title_en || t('about.values_title'));

  const values = [
    {
      icon: Star,
      title: isRTL ? (s.about_value1_title_ar || t('about.value1_title')) : (s.about_value1_title_en || t('about.value1_title')),
      desc:  isRTL ? (s.about_value1_desc_ar  || t('about.value1_desc'))  : (s.about_value1_desc_en  || t('about.value1_desc')),
    },
    {
      icon: Target,
      title: isRTL ? (s.about_value2_title_ar || t('about.value2_title')) : (s.about_value2_title_en || t('about.value2_title')),
      desc:  isRTL ? (s.about_value2_desc_ar  || t('about.value2_desc'))  : (s.about_value2_desc_en  || t('about.value2_desc')),
    },
    {
      icon: Lightbulb,
      title: isRTL ? (s.about_value3_title_ar || t('about.value3_title')) : (s.about_value3_title_en || t('about.value3_title')),
      desc:  isRTL ? (s.about_value3_desc_ar  || t('about.value3_desc'))  : (s.about_value3_desc_en  || t('about.value3_desc')),
    },
  ];

  const statsData = [
    { value: stats.happy_clients.toLocaleString() + '+', label: t('stats.clients') },
    { value: stats.trips_organized.toLocaleString() + '+', label: t('stats.trips') },
    { value: stats.years_experience + '', label: t('stats.years') },
    { value: stats.destinations + '+', label: t('stats.destinations') },
  ];

  // Render marketing metrics only after explicit CMS verification. Vite's build alone
  // cannot catch references to undeclared runtime variables inside a React component.
  const numericStats = [stats.happy_clients, stats.trips_organized, stats.years_experience, stats.destinations];
  const verifiedStatsData = settings.stats_verified === true
    ? statsData.filter((_stat, index) => Number.isFinite(numericStats[index]) && numericStats[index] > 0)
    : [];

  const partners = ['🏢', '✈️', '🏨', '🌍', '🛂', '🚗'];

  return (
    <div style={{ fontFamily: FONT }} dir={isRTL ? 'rtl' : 'ltr'}>

      {/* ── Hero split ── */}
      <section className="bg-white" style={{ paddingTop: 'var(--header-height, 80px)' }}>
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="flex items-center gap-12 flex-col lg:flex-row py-16">

            {/* Image */}
            <motion.div
              initial={{ opacity: 0, x: isRTL ? 60 : -60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="lg:w-1/2 w-full rounded-2xl overflow-hidden shadow-xl flex-shrink-0"
            >
              <img
                src={heroImage}
                alt="Al-Etihad Team"
                className="w-full h-[420px] object-cover"
              />
            </motion.div>

            {/* Text */}
            <motion.div
              initial={{ opacity: 0, x: isRTL ? -60 : 60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:w-1/2 w-full"
            >
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-xs mb-4 text-[#8C8076]">
                <Link to="/" className="hover:text-[#D32F2F] transition-colors">
                  {t('general.breadcrumb_home')}
                </Link>
                <span>/</span>
                <span className="text-[#D32F2F]">{t('nav.about')}</span>
              </div>

              <span className="text-[#D32F2F] text-xs font-semibold uppercase tracking-widest">
                — {storyLabel}
              </span>

              <h1
                className="mt-2 mb-6 text-[#0D0D0D]"
                style={{
                  fontFamily: FONT,
                  fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
                  fontWeight: 700,
                  lineHeight: 1.25,
                }}
              >
                {pageTitle}
              </h1>

              <p className="text-[#8C8076] mb-6" style={{ lineHeight: 1.9, fontSize: '0.95rem' }}>
                {story1}
              </p>

              <p className="text-[#8C8076]" style={{ lineHeight: 1.9, fontSize: '0.95rem' }}>
                {story2}
              </p>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      {verifiedStatsData.length > 0 && <section className="py-16 bg-[#D32F2F]">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {verifiedStatsData.map((stat, i) => (
              <FadeUp key={stat.label} delay={i * 0.1}>
                <div className="text-center">
                  <div
                    className="text-white mb-1"
                    style={{
                      fontFamily: FONT,
                      fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
                      fontWeight: 900,
                    }}
                  >
                    {stat.value}
                  </div>
                  <div className="text-white/75 text-sm font-medium">{stat.label}</div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>}

      {/* ── Values ── */}
      <section className="py-20 bg-[#F5F0EB]">
        <div className="max-w-[1280px] mx-auto px-6">
          <FadeUp>
            <div className="mb-12 text-center">
              <span className="text-[#D32F2F] text-xs font-semibold uppercase tracking-widest">
                — {isRTL ? 'مبادئنا' : 'Core Principles'}
              </span>
              <h2
                className="mt-2 text-[#0D0D0D] text-center"
                style={{
                  fontFamily: FONT,
                  fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
                  fontWeight: 700,
                }}
              >
                {valuesTitle}
              </h2>
            </div>
          </FadeUp>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {values.map((val, i) => {
              const Icon = val.icon;
              return (
                <FadeUp key={i} delay={i * 0.1}>
                  <div className="bg-white rounded-xl p-8 border border-gray-100 hover:shadow-lg transition-shadow text-center">
                    <div className="w-14 h-14 bg-[#D32F2F]/10 rounded-full flex items-center justify-center mb-5 mx-auto">
                      <Icon size={24} className="text-[#D32F2F]" />
                    </div>
                    <h3
                      className="font-bold text-[#0D0D0D] mb-3 text-lg"
                      style={{ fontFamily: FONT }}
                    >
                      {val.title}
                    </h3>
                    <p className="text-[#8C8076] text-sm leading-relaxed">{val.desc}</p>
                  </div>
                </FadeUp>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Team ── */}
      {team.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-[1280px] mx-auto px-6">
            <FadeUp>
              <div className="mb-12 text-center">
                <span className="text-[#D32F2F] text-xs font-semibold uppercase tracking-widest">
                  — {isRTL ? 'أشخاص متميزون' : 'People Behind Us'}
                </span>
                <h2
                  className="mt-2 text-[#0D0D0D] text-center"
                  style={{
                    fontFamily: FONT,
                    fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
                    fontWeight: 700,
                  }}
                >
                  {t('about.team_title')}
                </h2>
              </div>
            </FadeUp>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {team.map((member, i) => (
                <FadeUp key={member.id} delay={i * 0.1}>
                  <div className="flex flex-col items-center gap-3 text-center">
                    <div className="relative">
                      {member.photo_url ? (
                        <img
                          src={member.photo_url}
                          alt={lang === 'ar' ? member.name_ar : member.name_en}
                          className="w-24 h-24 rounded-full object-cover border-4 border-[#F5F0EB]"
                          loading="lazy"
                        />
                      ) : (
                        <div
                          className="w-24 h-24 rounded-full bg-[#F5F0EB] border-4 border-[#F5F0EB] flex items-center justify-center text-[#D32F2F] text-2xl font-bold"
                          aria-label={lang === 'ar' ? member.name_ar : member.name_en}
                        >
                          {(lang === 'ar' ? member.name_ar : member.name_en).trim().charAt(0)}
                        </div>
                      )}
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#D32F2F] rounded-full border-2 border-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#0D0D0D] text-sm">
                        {lang === 'ar' ? member.name_ar : member.name_en}
                      </h4>
                      <p className="text-[#8C8076] text-xs mt-0.5">
                        {lang === 'ar' ? member.role_ar : member.role_en}
                      </p>
                    </div>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Partners ── */}
      <section className="py-16 bg-[#F5F0EB] border-t border-gray-200">
        <div className="max-w-[1280px] mx-auto px-6">
          <FadeUp>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#8C8076] mb-8 text-center">
              {t('about.partners_title')}
            </p>
          </FadeUp>
          <div className="flex flex-wrap justify-center gap-8">
            {partners.map((p, i) => (
              <div key={i} className="text-4xl grayscale hover:grayscale-0 transition-all duration-300 cursor-default">
                {p}
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
