import { useState } from 'react';
import { Link } from 'react-router';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';

export function News() {
  const { t, lang, isRTL } = useLanguage();
  const { articles } = useData();
  const [activeTab, setActiveTab] = useState<string>('all');
  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  const tabs = [
    { key: 'all', label: t('news.all_articles') },
    { key: 'tips', label: t('news.tips') },
    { key: 'destinations', label: t('news.destinations') },
    { key: 'news', label: t('news.latest') },
  ];

  const filtered = activeTab === 'all'
    ? articles.filter(a => a.is_published)
    : articles.filter(a => a.is_published && a.category === activeTab);

  const featured = filtered[0];
  const rest = filtered.slice(1);

  const categoryLabels: Record<string, string> = {
    destinations: isRTL ? 'وجهات' : 'Destinations',
    tips: isRTL ? 'نصائح سفر' : 'Travel Tips',
    news: isRTL ? 'أخبار' : 'News',
  };

  return (
    <div style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>
      {/* Page Hero */}
      <section
        className="relative h-[320px] flex items-end overflow-hidden"
        style={{
          backgroundImage: `url(https://images.unsplash.com/photo-1672831131396-72c5e85aba44?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1600)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black/65" />
        <div className={`relative z-10 max-w-[1280px] w-full mx-auto px-6 pb-10 ${isRTL ? 'text-right' : 'text-left'}`}>
          <div className={`flex items-center gap-2 text-white/60 text-xs mb-3 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
            <Link to="/" className="hover:text-white">{t('general.breadcrumb_home')}</Link>
            <span>/</span>
            <span className="text-white">{t('nav.news')}</span>
          </div>
          <h1
            className="text-white"
            style={{
              fontFamily: isRTL ? "'Cairo', sans-serif" : "'Playfair Display', serif",
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              fontWeight: 700,
            }}
          >
            {t('news.title')}
          </h1>
        </div>
      </section>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-100 sticky top-20 z-30">
        <div className={`max-w-[1280px] mx-auto px-6 flex gap-1 overflow-x-auto ${isRTL ? 'flex-row-reverse' : ''}`}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-4 text-sm whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-[#D32F2F] text-[#D32F2F] font-semibold'
                  : 'border-transparent text-[#8C8076] hover:text-[#0D0D0D]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Articles */}
      <div className="max-w-[1280px] mx-auto px-6 py-12">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📰</div>
            <p className="text-[#8C8076]">{t('general.no_results')}</p>
          </div>
        ) : (
          <>
            {/* Featured large card */}
            {featured && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-10"
              >
                <Link
                  to={`/news/${featured.slug}`}
                  className={`group flex flex-col md:flex-row gap-0 bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 ${isRTL ? 'md:flex-row-reverse' : ''}`}
                >
                  <div className="md:w-1/2 overflow-hidden" style={{ height: '320px' }}>
                    <img
                      src={featured.cover_image_url}
                      alt={lang === 'ar' ? featured.title_ar : featured.title_en}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className={`md:w-1/2 p-8 flex flex-col justify-center ${isRTL ? 'text-right' : 'text-left'}`}>
                    <div className={`flex items-center gap-2 mb-3 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                      <span className="px-2.5 py-1 bg-[#D32F2F] text-white text-xs rounded-full font-medium">
                        {categoryLabels[featured.category] || featured.category}
                      </span>
                      <span className="text-xs text-[#8C8076]">
                        {new Date(featured.published_at).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                    <h2
                      className="text-[#0D0D0D] mb-3 group-hover:text-[#D32F2F] transition-colors"
                      style={{
                        fontFamily: isRTL ? "'Cairo', sans-serif" : "'Playfair Display', serif",
                        fontSize: 'clamp(1.3rem, 3vw, 1.8rem)',
                        fontWeight: 700,
                      }}
                    >
                      {lang === 'ar' ? featured.title_ar : featured.title_en}
                    </h2>
                    <p className="text-[#8C8076] text-sm leading-relaxed mb-5 line-clamp-3">
                      {lang === 'ar' ? featured.excerpt_ar : featured.excerpt_en}
                    </p>
                    <span className={`flex items-center gap-1.5 text-[#D32F2F] text-sm font-semibold ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                      {t('news.read_more')} <Arrow size={14} />
                    </span>
                  </div>
                </Link>
              </motion.div>
            )}

            {/* Grid */}
            {rest.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {rest.map((article, i) => {
                  const title = lang === 'ar' ? article.title_ar : article.title_en;
                  const excerpt = lang === 'ar' ? article.excerpt_ar : article.excerpt_en;
                  const date = new Date(article.published_at).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', {
                    year: 'numeric', month: 'long', day: 'numeric',
                  });
                  return (
                    <motion.div
                      key={article.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <Link
                        to={`/news/${article.slug}`}
                        className="group block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 h-full"
                      >
                        <div className="overflow-hidden h-48">
                          <img
                            src={article.cover_image_url}
                            alt={title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                        </div>
                        <div className={`p-5 ${isRTL ? 'text-right' : 'text-left'}`}>
                          <div className={`flex items-center gap-2 mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <span className="px-2.5 py-1 bg-[#D32F2F] text-white text-xs rounded-full font-medium">
                              {categoryLabels[article.category] || article.category}
                            </span>
                            <span className="text-xs text-[#8C8076]">{date}</span>
                          </div>
                          <h3 className="font-semibold text-[#0D0D0D] mb-2 line-clamp-2 text-[15px] group-hover:text-[#D32F2F] transition-colors">
                            {title}
                          </h3>
                          <p className="text-[#8C8076] text-sm line-clamp-2 leading-relaxed mb-4">{excerpt}</p>
                          <span className={`flex items-center gap-1 text-[#D32F2F] text-xs font-medium ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                            {t('news.read_more')} <Arrow size={12} />
                          </span>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}