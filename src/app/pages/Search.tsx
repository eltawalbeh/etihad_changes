import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { Search as SearchIcon } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { packages, articles } from '../data/mockData';
import { PackageCard } from '../components/PackageCard';
import { Link } from 'react-router';
import { ArrowRight, ArrowLeft } from 'lucide-react';

export function Search() {
  const { t, lang, isRTL } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQ = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQ);
  const [activeTab, setActiveTab] = useState<'packages' | 'articles' | 'services'>('packages');
  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ q: query });
  };

  const q = searchParams.get('q')?.toLowerCase() || '';

  const matchedPackages = q
    ? packages.filter(p =>
        p.title_en.toLowerCase().includes(q) ||
        p.title_ar.includes(q) ||
        p.destination_en.toLowerCase().includes(q) ||
        p.destination_ar.includes(q)
      )
    : [];

  const matchedArticles = q
    ? articles.filter(a =>
        a.title_en.toLowerCase().includes(q) ||
        a.title_ar.includes(q) ||
        a.excerpt_en.toLowerCase().includes(q)
      )
    : [];

  const tabs = [
    { key: 'packages' as const, label: t('general.search_tabs_packages'), count: matchedPackages.length },
    { key: 'articles' as const, label: t('general.search_tabs_articles'), count: matchedArticles.length },
  ];

  return (
    <div
      className="min-h-screen bg-[#F5F0EB]"
      style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", paddingTop: 'var(--header-height, 80px)' }}
    >
      {/* Search header */}
      <div className="bg-white border-b border-gray-100 py-10">
        <div className="max-w-[800px] mx-auto px-6">
          <h1
            className={`text-[#0D0D0D] mb-6 ${isRTL ? 'text-right' : 'text-left'}`}
            style={{
              fontFamily: "'IBM Plex Sans Arabic', sans-serif",
              fontSize: '1.8rem',
              fontWeight: 700,
            }}
          >
            {t('general.search_title')}
          </h1>
          <form onSubmit={handleSearch}>
            <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="flex-1 flex items-center bg-[#F5F0EB] rounded-full px-5 py-3 border border-gray-200 focus-within:border-[#D32F2F] transition-colors">
                <SearchIcon size={18} className="text-[#8C8076] shrink-0" />
                <input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder={t('general.search_placeholder')}
                  className={`flex-1 bg-transparent text-[#0D0D0D] text-sm px-3 focus:outline-none placeholder:text-[#8C8076] ${isRTL ? 'text-right' : 'text-left'}`}
                  autoFocus
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-[#D32F2F] hover:bg-[#9A0007] text-white rounded-full text-sm font-semibold transition-colors"
              >
                {t('search.button')}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Tabs + Results */}
      <div className="max-w-[1280px] mx-auto px-6 py-10">
        {q && (
          <>
            {/* Tabs */}
            <div className={`flex gap-1 mb-8 border-b border-gray-200 ${isRTL ? 'flex-row-reverse' : ''}`}>
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-5 py-3 text-sm border-b-2 transition-colors flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}
                    ${activeTab === tab.key
                      ? 'border-[#D32F2F] text-[#D32F2F] font-semibold'
                      : 'border-transparent text-[#8C8076]'
                    }`}
                >
                  {tab.label}
                  <span className="w-5 h-5 text-xs rounded-full bg-gray-100 flex items-center justify-center text-[#8C8076]">
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {activeTab === 'packages' && (
              matchedPackages.length === 0 ? (
                <div className="text-center py-20">
                  <div className="text-5xl mb-4">🔍</div>
                  <p className="text-[#8C8076]">{t('general.no_results')}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {matchedPackages.map(pkg => <PackageCard key={pkg.id} pkg={pkg} />)}
                </div>
              )
            )}

            {activeTab === 'articles' && (
              matchedArticles.length === 0 ? (
                <div className="text-center py-20">
                  <div className="text-5xl mb-4">📰</div>
                  <p className="text-[#8C8076]">{t('general.no_results')}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {matchedArticles.map(article => {
                    const title = lang === 'ar' ? article.title_ar : article.title_en;
                    const excerpt = lang === 'ar' ? article.excerpt_ar : article.excerpt_en;
                    return (
                      <Link
                        key={article.id}
                        to={`/news/${article.slug}`}
                        className={`group flex gap-4 bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}
                      >
                        <img src={article.cover_image_url} alt={title} className="w-20 h-20 rounded-lg object-cover shrink-0" />
                        <div>
                          <h4 className="font-semibold text-[#0D0D0D] mb-1 text-sm group-hover:text-[#D32F2F] transition-colors">{title}</h4>
                          <p className="text-[#8C8076] text-xs line-clamp-2">{excerpt}</p>
                          <span className={`flex items-center gap-1 text-[#D32F2F] text-xs mt-2 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                            {t('news.read_more')} <Arrow size={11} />
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )
            )}
          </>
        )}

        {!q && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">✈️</div>
            <p className="text-[#8C8076] text-lg">{isRTL ? 'ابحث عن رحلتك المثالية' : 'Search for your perfect trip'}</p>
          </div>
        )}
      </div>
    </div>
  );
}