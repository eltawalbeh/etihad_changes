import { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { PackageCard } from '../components/PackageCard';
import { useData } from '../context/DataContext';

const PAGE_HERO = 'https://images.unsplash.com/photo-1672831131396-72c5e85aba44?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1600';

export function Packages() {
  const { t, lang, isRTL } = useLanguage();
  const { packages } = useData();
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get('type') || '';

  const [tripType, setTripType] = useState<string>(initialType);
  const [durationFilter, setDurationFilter] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>('newest');
  const [priceMin, setPriceMin] = useState<number>(0);
  const [priceMax, setPriceMax] = useState<number>(20000);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const durations = [
    { key: 'packages.duration_1_3', min: 1, max: 3 },
    { key: 'packages.duration_4_7', min: 4, max: 7 },
    { key: 'packages.duration_8_14', min: 8, max: 14 },
    { key: 'packages.duration_14plus', min: 15, max: 999 },
  ];

  const filtered = useMemo(() => {
    let result = packages.filter(p => p.is_active);
    if (tripType) result = result.filter(p => p.trip_type === tripType);
    if (durationFilter.length > 0) {
      result = result.filter(p => {
        return durationFilter.some(key => {
          const d = durations.find(d => d.key === key);
          return d && p.duration_days >= d.min && p.duration_days <= d.max;
        });
      });
    }
    result = result.filter(p => p.price >= priceMin && p.price <= priceMax);
    if (sortBy === 'price_asc') result = [...result].sort((a, b) => a.price - b.price);
    if (sortBy === 'price_desc') result = [...result].sort((a, b) => b.price - a.price);
    if (sortBy === 'duration') result = [...result].sort((a, b) => a.duration_days - b.duration_days);
    if (sortBy === 'newest') result = [...result].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return result;
  }, [packages, tripType, durationFilter, sortBy, priceMin, priceMax]);

  const clearFilters = () => {
    setTripType('');
    setDurationFilter([]);
    setSortBy('newest');
    setPriceMin(0);
    setPriceMax(20000);
  };

  const toggleDuration = (key: string) => {
    setDurationFilter(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const Sidebar = () => (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${isRTL ? 'text-right' : 'text-left'}`}
      style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
    >
      {/* Trip Type */}
      <div className="mb-6">
        <h4 className="font-semibold text-[#0D0D0D] mb-3 text-sm">{t('packages.filter_type')}</h4>
        <div className="flex flex-col gap-2">
          {[
            { value: '', label: t('packages.all') },
            { value: 'external', label: t('packages.type_international') },
            { value: 'internal', label: t('packages.type_domestic') },
          ].map(opt => (
            <label key={opt.value} className={`flex items-center gap-2 cursor-pointer text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
              <input
                type="radio"
                name="tripType"
                value={opt.value}
                checked={tripType === opt.value}
                onChange={() => setTripType(opt.value)}
                className="accent-[#D32F2F]"
              />
              <span className="text-[#0D0D0D]">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Duration */}
      <div className="mb-6">
        <h4 className="font-semibold text-[#0D0D0D] mb-3 text-sm">{t('packages.filter_duration')}</h4>
        <div className="flex flex-col gap-2">
          {durations.map(d => (
            <label key={d.key} className={`flex items-center gap-2 cursor-pointer text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
              <input
                type="checkbox"
                checked={durationFilter.includes(d.key)}
                onChange={() => toggleDuration(d.key)}
                className="accent-[#D32F2F]"
              />
              <span className="text-[#0D0D0D]">{t(d.key)}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <h4 className="font-semibold text-[#0D0D0D] mb-3 text-sm">{t('packages.filter_price')}</h4>
        <div className="flex flex-col gap-3">
          <div className={`flex items-center gap-2 text-xs text-[#8C8076] ${isRTL ? 'flex-row-reverse' : ''}`}>
            <span>{priceMin.toLocaleString()} {t('packages.sar')}</span>
            <span className="flex-1" />
            <span>{priceMax.toLocaleString()} {t('packages.sar')}</span>
          </div>
          <input
            type="range"
            min={0}
            max={20000}
            step={500}
            value={priceMax}
            onChange={e => setPriceMax(Number(e.target.value))}
            className="w-full accent-[#D32F2F]"
          />
        </div>
      </div>

      {/* Clear */}
      <button
        onClick={clearFilters}
        className="w-full py-2.5 border border-[#D32F2F] text-[#D32F2F] hover:bg-[#D32F2F] hover:text-white rounded text-sm font-medium transition-colors"
      >
        {t('packages.clear_filters')}
      </button>
    </div>
  );

  return (
    <div style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>
      {/* Page Hero */}
      <section
        className="relative h-[320px] flex items-end justify-start overflow-hidden"
        style={{ backgroundImage: `url(${PAGE_HERO})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="absolute inset-0 bg-black/65" />
        <div className="relative z-10 max-w-[1280px] w-full mx-auto px-6 pb-10" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className="flex items-center gap-2 text-white/60 text-xs mb-3">
            <Link to="/" className="hover:text-white transition-colors">{t('general.breadcrumb_home')}</Link>
            <span>/</span>
            <span className="text-white">{t('nav.packages')}</span>
          </div>
          <h1
            className="text-white"
            style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 700 }}
          >
            {isRTL ? 'عروض الرحلات' : 'Tour Packages'}
          </h1>
        </div>
      </section>

      {/* Main content */}
      <div className="max-w-[1280px] mx-auto px-6 py-12">
        {/* Mobile filter toggle */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-sm text-[#0D0D0D] ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <SlidersHorizontal size={15} />
            {isRTL ? 'الفلاتر' : 'Filters'}
            {(tripType || durationFilter.length > 0) && (
              <span className="w-5 h-5 bg-[#D32F2F] text-white text-xs rounded-full flex items-center justify-center">
                {(tripType ? 1 : 0) + durationFilter.length}
              </span>
            )}
          </button>
          {sidebarOpen && (
            <div className="mt-4">
              <Sidebar />
            </div>
          )}
        </div>

        <div className={`flex gap-8 ${isRTL ? 'flex-row-reverse' : ''}`}>
          {/* Sidebar Desktop */}
          <aside className="hidden lg:block w-72 shrink-0">
            <Sidebar />
          </aside>

          {/* Main */}
          <div className="flex-1 min-w-0">
            {/* Sort bar */}
            <div className={`flex items-center justify-between mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <p className="text-sm text-[#8C8076]">
                {filtered.length} {isRTL ? 'رحلة' : 'packages found'}
              </p>
              <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className="text-xs text-[#8C8076]">{t('packages.sort_by')}:</span>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="border border-gray-200 rounded px-3 py-1.5 text-sm text-[#0D0D0D] focus:outline-none focus:border-[#D32F2F]"
                >
                  <option value="newest">{t('packages.sort_newest')}</option>
                  <option value="price_asc">{t('packages.sort_price')} ↑</option>
                  <option value="price_desc">{t('packages.sort_price')} ↓</option>
                  <option value="duration">{t('packages.sort_duration')}</option>
                </select>
              </div>
            </div>

            {/* Grid */}
            {filtered.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🗺️</div>
                <p className="text-[#8C8076] text-lg">{t('general.no_results')}</p>
                <button onClick={clearFilters} className="mt-4 text-[#D32F2F] text-sm underline">{t('packages.clear_filters')}</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filtered.map((pkg, i) => (
                  <motion.div
                    key={pkg.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <PackageCard pkg={pkg} />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}