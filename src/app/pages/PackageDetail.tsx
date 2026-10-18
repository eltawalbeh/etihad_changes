import { useState } from 'react';
import { Link, useParams, Navigate } from 'react-router';
import { Clock, Users, MapPin, CheckCircle, XCircle, Calendar, MessageCircle, ChevronLeft, ChevronRight, X, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { PackageCard } from '../components/PackageCard';
import { EmojiFlag, toFlagEmoji } from '../components/EmojiFlag';
import { buildWhatsAppUrl, normalizeWhatsAppNumber, recordWhatsAppClick } from '../lib/siteTracking';

const FONT = "'IBM Plex Sans Arabic', sans-serif";

export function PackageDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { lang, t, isRTL } = useLanguage();
  const { packages, settings } = useData();
  const [showModal, setShowModal] = useState(false);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [galleryIndex, setGalleryIndex] = useState<number | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Booking form state
  const [bookingName, setBookingName] = useState('');
  const [bookingPhone, setBookingPhone] = useState('');
  const [bookingEmail, setBookingEmail] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingRequests, setBookingRequests] = useState('');

  const pkg = packages.find(p => p.slug === slug);
  if (!pkg) return <Navigate to="/packages" replace />;

  const Arrow = isRTL ? ArrowLeft : ArrowRight;
  const title = lang === 'ar' ? pkg.title_ar : pkg.title_en;
  const destination = lang === 'ar' ? pkg.destination_ar : pkg.destination_en;
  const description = lang === 'ar' ? pkg.description_ar : pkg.description_en;
  const includes = Array.isArray(lang === 'ar' ? pkg.includes_ar : pkg.includes_en) ? (lang === 'ar' ? pkg.includes_ar : pkg.includes_en) : [];
  const excludes = Array.isArray(lang === 'ar' ? pkg.excludes_ar : pkg.excludes_en) ? (lang === 'ar' ? pkg.excludes_ar : pkg.excludes_en) : [];
  const itinerary = Array.isArray(lang === 'ar' ? pkg.itinerary_ar : pkg.itinerary_en) ? (lang === 'ar' ? pkg.itinerary_ar : pkg.itinerary_en) : [];
  const galleryUrls = Array.isArray(pkg.gallery_urls) ? pkg.gallery_urls : [];
  const isStartingFrom = pkg.pricing_model === 'rate_matrix';
  const totalPrice = isStartingFrom ? null : pkg.price * (adults + children * 0.5);
  const whatsappNumber = normalizeWhatsAppNumber(settings.whatsapp);
  const currentPackageUrl = typeof window === 'undefined' ? '' : window.location.href;

  const related = packages.filter(p => p.slug !== pkg.slug && p.trip_type === pkg.trip_type).slice(0, 3);

  // Build the exact booking details that will be sent to the configured WhatsApp recipient.
  const buildWhatsAppBookingMessage = () => [
    isRTL ? 'طلب حجز رحلة' : 'Trip Booking Request',
    '',
    `${isRTL ? 'الرحلة' : 'Package'}: ${title}`,
    `${isRTL ? 'الوجهة' : 'Destination'}: ${destination} ${toFlagEmoji(pkg.flag)}`,
    `${isRTL ? 'المدة' : 'Duration'}: ${pkg.duration_days} ${t('packages.days')}`,
    `${isRTL ? 'مدينة المغادرة' : 'Departure city'}: ${pkg.departure_city || '—'}`,
    '',
    `${isRTL ? 'الاسم' : 'Name'}: ${bookingName}`,
    `${isRTL ? 'الهاتف' : 'Phone'}: ${bookingPhone}`,
    bookingEmail ? `${isRTL ? 'البريد' : 'Email'}: ${bookingEmail}` : '',
    `${isRTL ? 'تاريخ المغادرة' : 'Departure Date'}: ${bookingDate}`,
    `${isRTL ? 'البالغون' : 'Adults'}: ${adults}`,
    `${isRTL ? 'الأطفال' : 'Children'}: ${children}`,
    totalPrice !== null
      ? `${isRTL ? 'الإجمالي التقديري' : 'Estimated Total'}: ${totalPrice.toLocaleString()} ${t('packages.sar')}`
      : `${isRTL ? 'السعر' : 'Price'}: ${isRTL ? 'يبدأ من' : 'Starting from'} ${pkg.price.toLocaleString()} ${t('packages.sar')}`,
    bookingRequests ? `${isRTL ? 'طلبات خاصة' : 'Special Requests'}: ${bookingRequests}` : '',
    currentPackageUrl ? `${isRTL ? 'رابط الباقة' : 'Package URL'}: ${currentPackageUrl}` : '',
  ].filter(Boolean).join('\n');

  const buildWhatsAppInquiryMessage = () => [
    isRTL ? 'استفسار عن رحلة' : 'Trip Inquiry',
    '',
    `${isRTL ? 'الرحلة' : 'Package'}: ${title}`,
    `${isRTL ? 'الوجهة' : 'Destination'}: ${destination} ${toFlagEmoji(pkg.flag)}`,
    `${isRTL ? 'المدة' : 'Duration'}: ${pkg.duration_days} ${t('packages.days')}`,
    `${isRTL ? 'البالغون' : 'Adults'}: ${adults}`,
    `${isRTL ? 'الأطفال' : 'Children'}: ${children}`,
    totalPrice !== null
      ? `${isRTL ? 'الإجمالي التقديري' : 'Estimated Total'}: ${totalPrice.toLocaleString()} ${t('packages.sar')}`
      : `${isRTL ? 'السعر' : 'Price'}: ${isRTL ? 'يبدأ من' : 'Starting from'} ${pkg.price.toLocaleString()} ${t('packages.sar')}`,
    currentPackageUrl ? `${isRTL ? 'رابط الباقة' : 'Package URL'}: ${currentPackageUrl}` : '',
  ].filter(Boolean).join('\n');

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingSuccess(true);
  };

  return (
    <div style={{ fontFamily: FONT }}>
      {/* Hero */}
      <div
        className="relative h-[420px] flex items-end overflow-hidden"
        style={{ backgroundImage: `url(${pkg.cover_image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="relative z-10 max-w-[1280px] w-full mx-auto px-6 pb-10" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className="flex items-center gap-2 text-white/60 text-xs mb-3">
            <Link to="/" className="hover:text-white">{t('general.breadcrumb_home')}</Link>
            <span>/</span>
            <Link to="/packages" className="hover:text-white">{t('nav.packages')}</Link>
            <span>/</span>
            <span className="text-white truncate max-w-[200px]">{title}</span>
          </div>
          <h1
            className="text-white mb-2"
            style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 700 }}
          >
            <EmojiFlag emoji={pkg.flag} className="me-1" /> {title}
          </h1>
          <div className="flex flex-wrap gap-3">
            {[
              { icon: Clock, text: `${pkg.duration_days} ${t('packages.days')}` },
              { icon: MapPin, text: pkg.departure_city },
              { icon: Users, text: `${t('packages.travelers')}: ${pkg.max_travelers}` },
            ].map(({ icon: Icon, text }) => (
              <span key={text} className="flex items-center gap-1.5 text-white/80 text-sm bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full">
                <Icon size={13} />
                {text}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-[1280px] mx-auto px-6 py-12" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Main content */}
          <div className="flex-1 min-w-0">
            <p className="text-[#8C8076] leading-relaxed mb-10 text-base">{description}</p>

            {/* Itinerary */}
            {itinerary.length > 0 && (
              <div className="mb-10">
                <h2 className="text-[#0D0D0D] mb-6" style={{ fontSize: '1.4rem', fontWeight: 700 }}>
                  {t('packages.itinerary')}
                </h2>
                <div className="space-y-4">
                  {itinerary.map(day => (
                    <div key={day.day} className="flex gap-4">
                      <div className="shrink-0 w-10 h-10 bg-[#D32F2F] rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {day.day}
                      </div>
                      <div className="flex-1 pt-1">
                        <h4 className="font-semibold text-[#0D0D0D] text-sm mb-1">{day.title}</h4>
                        <p className="text-[#8C8076] text-sm leading-relaxed">{day.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Includes & Excludes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
              <div>
                <h3 className="font-semibold text-[#0D0D0D] mb-4" style={{ fontFamily: FONT }}>
                  ✅ {t('packages.includes')}
                </h3>
                <ul className="space-y-2.5">
                  {includes.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[#0D0D0D]">
                      <CheckCircle size={15} className="text-green-500 shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-[#0D0D0D] mb-4" style={{ fontFamily: FONT }}>
                  ❌ {t('packages.excludes')}
                </h3>
                <ul className="space-y-2.5">
                  {excludes.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[#8C8076]">
                      <XCircle size={15} className="text-red-400 shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Gallery */}
            {galleryUrls.length > 0 && (
              <div className="mb-10">
                <h3 className="font-semibold text-[#0D0D0D] mb-4" style={{ fontFamily: FONT }}>
                  {t('packages.gallery')}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {galleryUrls.map((url, i) => (
                    <div
                      key={i}
                      className="relative overflow-hidden rounded-lg cursor-pointer group"
                      style={{ height: '160px' }}
                      onClick={() => setGalleryIndex(i)}
                    >
                      <img src={url} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Booking card */}
          <aside className="lg:w-[340px] shrink-0">
            <div className="sticky top-28 bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="mb-5">
                {isStartingFrom && (
                  <div className="text-[#8C8076] text-sm font-medium">{isRTL ? 'يبدأ من' : 'Starting from'}</div>
                )}
                <div className="text-[#D32F2F] font-bold" style={{ fontFamily: FONT, fontSize: '2.5rem' }}>
                  {pkg.price.toLocaleString()}
                </div>
                <div className="text-[#8C8076] text-sm">{t('packages.sar')}{isStartingFrom ? '' : ` / ${isRTL ? 'للشخص' : 'per person'}`}</div>
                <span className="inline-block mt-2 px-3 py-1 bg-green-50 text-green-700 text-xs rounded-full border border-green-200">
                  ✓ {t('packages.available')}
                </span>
              </div>

              {/* Travelers counter */}
              <div className="mb-4">
                <label className="text-xs font-bold text-[#8C8076] uppercase tracking-wide block mb-2">{t('packages.adults')}</label>
                <div className="flex items-center gap-3">
                  <button onClick={() => setAdults(Math.max(1, adults - 1))} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:border-[#D32F2F] text-[#0D0D0D] font-bold">−</button>
                  <span className="text-lg font-semibold text-[#0D0D0D] min-w-[24px] text-center">{adults}</span>
                  <button onClick={() => setAdults(Math.min(pkg.max_travelers, adults + 1))} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:border-[#D32F2F] text-[#0D0D0D] font-bold">+</button>
                </div>
              </div>
              <div className="mb-6">
                <label className="text-xs font-bold text-[#8C8076] uppercase tracking-wide block mb-2">{t('packages.children')}</label>
                <div className="flex items-center gap-3">
                  <button onClick={() => setChildren(Math.max(0, children - 1))} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:border-[#D32F2F] text-[#0D0D0D] font-bold">−</button>
                  <span className="text-lg font-semibold text-[#0D0D0D] min-w-[24px] text-center">{children}</span>
                  <button onClick={() => setChildren(Math.min(10, children + 1))} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:border-[#D32F2F] text-[#0D0D0D] font-bold">+</button>
                </div>
              </div>

              {/* Total */}
              {!isStartingFrom && (
                <div className="flex items-center justify-between py-3 border-t border-b border-gray-100 mb-5">
                  <span className="text-sm font-semibold text-[#0D0D0D]">{t('packages.total')}</span>
                  <span className="text-[#D32F2F] font-bold text-xl">
                    {totalPrice?.toLocaleString()} {t('packages.sar')}
                  </span>
                </div>
              )}

              <button
                onClick={() => { setBookingSuccess(false); setShowModal(true); }}
                className="w-full py-3.5 bg-[#D32F2F] hover:bg-[#9A0007] text-white rounded-xl font-semibold text-sm transition-colors mb-3"
              >
                {t('packages.book_now')}
              </button>

              {/* WhatsApp inquiry with package info */}
              {whatsappNumber && (
                <a
                  href={buildWhatsAppUrl(whatsappNumber, buildWhatsAppInquiryMessage())}
                  onClick={() => recordWhatsAppClick({ source: 'package_inquiry', packageId: pkg.id, packageTitle: title })}
                  target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 border-2 border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2"
              >
                <MessageCircle size={16} />
                  {t('packages.whatsapp')}
                </a>
              )}
            </div>
          </aside>
        </div>

        {/* Related packages */}
        {related.length > 0 && (
          <div className="mt-16" dir={isRTL ? 'rtl' : 'ltr'}>
            <h2 className="text-[#0D0D0D] mb-8" style={{ fontSize: '1.6rem', fontWeight: 700 }}>
              {t('packages.related')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map(p => <PackageCard key={p.id} pkg={p} />)}
            </div>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
            onClick={e => e.target === e.currentTarget && setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
              style={{ fontFamily: FONT }}
              dir={isRTL ? 'rtl' : 'ltr'}
            >
              {/* Modal header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h3 className="font-bold text-[#0D0D0D]" style={{ fontSize: '1.25rem' }}>
                  {t('booking.title')}
                </h3>
                <button onClick={() => setShowModal(false)} className="text-[#8C8076] hover:text-[#0D0D0D] transition-colors">
                  <X size={20} />
                </button>
              </div>

              {bookingSuccess ? (
                <div className="p-8 text-center">
                  <div className="text-6xl mb-4">✅</div>
                  <h4 className="text-xl font-bold text-[#0D0D0D] mb-2">{t('booking.success')}</h4>
                  <p className="text-[#8C8076] mb-6">{t('booking.success_msg')}</p>
                  {/* WhatsApp follow-up with ALL booking details */}
                  {whatsappNumber && (
                    <a
                      href={buildWhatsAppUrl(whatsappNumber, buildWhatsAppBookingMessage())}
                      onClick={() => recordWhatsAppClick({ source: 'package_booking', packageId: pkg.id, packageTitle: title })}
                      target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#25D366] hover:bg-[#1fba59] text-white rounded-xl font-semibold transition-colors"
                  >
                    <MessageCircle size={18} />
                      {t('booking.whatsapp_followup')}
                    </a>
                  )}
                  <p className="text-xs text-[#8C8076] mt-3">
                    {isRTL ? 'سيتم إرسال تفاصيل حجزك كاملة عبر واتساب' : 'All your booking details will be sent via WhatsApp'}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleBookingSubmit} className="p-6 overflow-y-auto max-h-[70vh]">
                  {/* Package summary */}
                  <div className="flex items-center gap-3 p-3 bg-[#F5F0EB] rounded-lg mb-5">
                    <img src={pkg.cover_image_url} alt={title} className="w-14 h-14 rounded-lg object-cover shrink-0" />
                    <div>
                      <p className="font-semibold text-[#0D0D0D] text-sm line-clamp-1">{title}</p>
                      <p className="text-[#D32F2F] text-xs">{pkg.duration_days} {t('packages.days')} · {destination} <EmojiFlag emoji={pkg.flag} /></p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-[#8C8076] uppercase tracking-wide mb-1.5">{t('booking.full_name')}</label>
                      <input
                        type="text"
                        placeholder={isRTL ? 'الاسم الكامل' : 'Full Name'}
                        required
                        value={bookingName}
                        onChange={e => setBookingName(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-[#0D0D0D] focus:outline-none focus:border-[#D32F2F]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#8C8076] uppercase tracking-wide mb-1.5">{t('booking.phone')}</label>
                      <input
                        type="tel"
                        placeholder="+966 5XX XXX XXXX"
                        required
                        value={bookingPhone}
                        onChange={e => setBookingPhone(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-[#0D0D0D] focus:outline-none focus:border-[#D32F2F]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#8C8076] uppercase tracking-wide mb-1.5">{t('booking.email')}</label>
                      <input
                        type="email"
                        placeholder="email@example.com"
                        value={bookingEmail}
                        onChange={e => setBookingEmail(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-[#0D0D0D] focus:outline-none focus:border-[#D32F2F]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#8C8076] uppercase tracking-wide mb-1.5">{t('booking.departure_date')}</label>
                      <div className="relative">
                        <Calendar size={14} className="absolute top-1/2 -translate-y-1/2 start-3 text-[#8C8076]" />
                        <input
                          type="date"
                          required
                          value={bookingDate}
                          onChange={e => setBookingDate(e.target.value)}
                          className="w-full border border-gray-200 rounded-lg ps-9 pe-4 py-2.5 text-sm text-[#0D0D0D] focus:outline-none focus:border-[#D32F2F]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#8C8076] uppercase tracking-wide mb-1.5">{t('booking.special_requests')}</label>
                      <textarea
                        rows={3}
                        value={bookingRequests}
                        onChange={e => setBookingRequests(e.target.value)}
                        placeholder={isRTL ? 'أي طلبات أو ملاحظات خاصة...' : 'Any special requests or notes...'}
                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-[#0D0D0D] focus:outline-none focus:border-[#D32F2F] resize-none"
                      />
                    </div>

                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input type="checkbox" required className="mt-0.5 accent-[#D32F2F]" />
                      <span className="text-xs text-[#8C8076]">{t('booking.terms')}</span>
                    </label>
                  </div>

                  {/* Total in modal */}
                  {!isStartingFrom && (
                    <div className="flex items-center justify-between my-4 p-3 bg-[#F5F0EB] rounded-lg">
                      <span className="text-sm text-[#0D0D0D] font-medium">{t('packages.total')}</span>
                      <span className="text-[#D32F2F] font-bold" style={{ fontSize: '1.25rem' }}>
                        {totalPrice?.toLocaleString()} {t('packages.sar')}
                      </span>
                    </div>
                  )}

                  <div className="flex flex-col gap-3">
                    <button
                      type="submit"
                      className="w-full py-3.5 bg-[#D32F2F] hover:bg-[#9A0007] text-white rounded-xl font-semibold text-sm transition-colors"
                    >
                      {t('booking.submit')}
                    </button>
                    <p className="text-xs text-[#8C8076] text-center">
                      {isRTL ? 'بعد إرسال الطلب ستظهر لك رسالة WhatsApp بكامل التفاصيل.' : 'After submitting, WhatsApp will open with the complete booking details.'}
                    </p>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox */}
      <AnimatePresence>
        {galleryIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
            onClick={() => setGalleryIndex(null)}
          >
            <button
              onClick={() => setGalleryIndex(i => i !== null ? (i - 1 + galleryUrls.length) % galleryUrls.length : null)}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white"
            >
              <ChevronLeft size={20} />
            </button>
            <img
              src={galleryUrls[galleryIndex]}
              alt={`Gallery ${galleryIndex + 1}`}
              className="max-w-full max-h-full object-contain rounded"
              onClick={e => e.stopPropagation()}
            />
            <button
              onClick={() => setGalleryIndex(i => i !== null ? (i + 1) % galleryUrls.length : null)}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white"
            >
              <ChevronRight size={20} />
            </button>
            <button onClick={() => setGalleryIndex(null)} className="absolute top-4 right-4 text-white bg-white/10 rounded-full p-2">
              <X size={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}