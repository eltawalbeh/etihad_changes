import { useNavigate } from 'react-router';
import { Clock, Users, MapPin, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import type { Package } from '../data/mockData';
import { EmojiFlag } from './EmojiFlag';

const FONT = "'IBM Plex Sans Arabic', sans-serif";

interface PackageCardProps {
  pkg: Package;
  size?: 'normal' | 'large';
}

export function PackageCard({ pkg, size = 'normal' }: PackageCardProps) {
  const { lang, t, isRTL } = useLanguage();
  const navigate = useNavigate();
  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  const title = lang === 'ar' ? pkg.title_ar : pkg.title_en;
  const destination = lang === 'ar' ? pkg.destination_ar : pkg.destination_en;
  const isStartingFrom = pkg.pricing_model === 'rate_matrix';
  const openPackage = () => navigate(`/packages/${pkg.slug}`);
  const handleCardKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openPackage();
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
      onClick={openPackage}
      onKeyDown={handleCardKeyDown}
      role="link"
      tabIndex={0}
      className="group cursor-pointer bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 border border-gray-100 flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D32F2F]"
      style={{ fontFamily: FONT }}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Image */}
      <div className="relative overflow-hidden" style={{ height: size === 'large' ? '260px' : '210px' }}>
        <img
          src={pkg.cover_image_url}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Flag + Destination — start (right for RTL, left for LTR) */}
        <div className="absolute bottom-3 start-3 flex items-center gap-1.5">
          <EmojiFlag emoji={pkg.flag} className="text-xl leading-none" />
          <span className="text-white text-xs font-medium px-2 py-0.5 bg-black/40 rounded-full backdrop-blur-sm">
            {destination}
          </span>
        </div>

        {/* Trip type badge — end (left for RTL, right for LTR) */}
        <div className="absolute top-3 end-3">
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-full text-white"
            style={{ background: pkg.trip_type === 'external' ? '#D32F2F' : '#1a5276' }}
          >
            {pkg.trip_type === 'external' ? t('packages.type_international') : t('packages.type_domestic')}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4">
        <h3 className="font-semibold text-[#0D0D0D] mb-3 line-clamp-2 leading-snug" style={{ fontSize: '15px' }}>
          {title}
        </h3>

        {/* Meta */}
        <div className="flex flex-wrap gap-3 text-xs text-[#8C8076] mb-4">
          <div className="flex items-center gap-1">
            <Clock size={12} />
            <span>{pkg.duration_days} {t('packages.days')}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users size={12} />
            <span>{pkg.max_travelers}</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin size={12} />
            <span>{pkg.departure_city}</span>
          </div>
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
          <div>
            {isStartingFrom && (
              <div className="text-[#8C8076] text-xs">{isRTL ? 'يبدأ من' : 'Starting from'}</div>
            )}
            <div className="text-[#D32F2F] font-bold text-xl" style={{ fontFamily: FONT }}>
              {pkg.price.toLocaleString()}
            </div>
            <div className="text-[#8C8076] text-xs">{t('packages.sar')}</div>
          </div>
          <span
            className="flex items-center gap-1.5 px-4 py-2 bg-[#D32F2F] text-white text-xs font-semibold rounded-lg"
          >
            {t('packages.details')}
            <Arrow size={12} />
          </span>
        </div>
      </div>
    </motion.div>
  );
}