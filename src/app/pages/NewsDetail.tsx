import { Link, useParams, Navigate } from 'react-router';
import { Calendar, User, Tag, Share2, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { PackageCard } from '../components/PackageCard';

export function NewsDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { lang, t, isRTL } = useLanguage();
  const { articles, packages, loading } = useData();
  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  const article = articles.find(a => a.slug === slug);
  if (!article && loading) return <div role="status" className="min-h-screen pt-36 text-center">{isRTL ? 'جاري تحميل المقال...' : 'Loading article...'}</div>;
  if (!article) return <Navigate to="/news" replace />;

  const title = lang === 'ar' ? article.title_ar : article.title_en;
  const content = lang === 'ar' ? article.content_ar : article.content_en;
  const date = new Date(article.published_at).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const categoryLabels: Record<string, string> = {
    destinations: isRTL ? 'وجهات' : 'Destinations',
    tips: isRTL ? 'نصائح سفر' : 'Travel Tips',
    news: isRTL ? 'أخبار' : 'News',
  };

  const relatedPackage = packages[0];

  return (
    <div style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>
      {/* Hero */}
      <div
        className="relative h-[420px] flex items-end overflow-hidden"
        style={{ backgroundImage: `url(${article.cover_image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
        <div className={`relative z-10 max-w-[900px] mx-auto w-full px-6 pb-10 ${isRTL ? 'text-right' : 'text-left'}`}>
          <div className={`flex items-center gap-2 text-white/60 text-xs mb-4 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
            <Link to="/" className="hover:text-white">{t('general.breadcrumb_home')}</Link>
            <span>/</span>
            <Link to="/news" className="hover:text-white">{t('nav.news')}</Link>
            <span>/</span>
            <span className="text-white/80 truncate max-w-[200px]">{title}</span>
          </div>
          <span className="inline-block mb-3 px-3 py-1 bg-[#D32F2F] text-white text-xs rounded-full font-medium">
            {categoryLabels[article.category] || article.category}
          </span>
          <h1
            className="text-white mb-4"
            style={{
              fontFamily: isRTL ? "'Cairo', sans-serif" : "'Playfair Display', serif",
              fontSize: 'clamp(1.6rem, 4vw, 2.5rem)',
              fontWeight: 700,
              lineHeight: 1.2,
            }}
          >
            {title}
          </h1>
          <div className={`flex flex-wrap items-center gap-4 text-white/60 text-sm ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
            <span className={`flex items-center gap-1.5 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Calendar size={13} /> {date}
            </span>
            <span className={`flex items-center gap-1.5 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <User size={13} /> {article.author}
            </span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-[900px] mx-auto px-6 py-12">
        {/* Social share */}
        <div className={`flex items-center justify-between mb-8 pb-6 border-b border-gray-100 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <span className="text-xs text-[#8C8076]">{isRTL ? `بقلم: ${article.author}` : `By ${article.author}`}</span>
          <button
            onClick={() => navigator.share?.({ title, url: window.location.href })}
            className={`flex items-center gap-1.5 text-xs text-[#8C8076] hover:text-[#D32F2F] transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <Share2 size={14} />
            {t('news.share')}
          </button>
        </div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`prose max-w-none text-[#0D0D0D] leading-loose mb-12 ${isRTL ? 'text-right' : 'text-left'}`}
          style={{ fontSize: '1rem', lineHeight: 1.9 }}
        >
          <p className="text-[#8C8076]">{content}</p>
          <p className="text-[#8C8076] mt-4">
            {isRTL
              ? 'هذا المحتوى سيتم جلبه ديناميكياً من قاعدة البيانات عند الربط بـ Supabase. في الوقت الحالي نعرض محتوى تجريبياً.'
              : 'This content will be dynamically fetched from the database when connected to Supabase. For now, placeholder content is displayed.'}
          </p>
        </motion.div>

        {/* Related package CTA */}
        <div className={`bg-[#F5F0EB] rounded-2xl p-8 border border-gray-200 ${isRTL ? 'text-right' : 'text-left'}`}>
          <p className="text-[#D32F2F] text-xs font-semibold uppercase tracking-widest mb-3">
            {t('news.related_package')}
          </p>
          <h3
            className="text-[#0D0D0D] mb-6"
            style={{
              fontFamily: isRTL ? "'Cairo', sans-serif" : "'Playfair Display', serif",
              fontSize: '1.3rem',
              fontWeight: 700,
            }}
          >
            {isRTL ? 'اكتشف باقاتنا المميزة' : 'Explore Our Featured Packages'}
          </h3>
          <div className="max-w-sm">
            <PackageCard pkg={relatedPackage} />
          </div>
        </div>

        {/* Back to news */}
        <div className={`mt-8 ${isRTL ? 'text-right' : 'text-left'}`}>
          <Link
            to="/news"
            className={`inline-flex items-center gap-2 text-[#D32F2F] hover:text-[#9A0007] text-sm font-medium transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            {isRTL ? <Arrow size={14} /> : <ArrowLeft size={14} />}
            {isRTL ? 'العودة إلى المقالات' : 'Back to Articles'}
          </Link>
        </div>
      </div>
    </div>
  );
}