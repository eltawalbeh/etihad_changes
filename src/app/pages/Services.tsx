import { useState } from 'react';
import { Link } from 'react-router';
import { Plane, Map, FileText, Car, Building2, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { submitInquiry } from '../lib/inquiries';

const PAGE_HERO = 'https://images.unsplash.com/photo-1650784854945-264d5b0b6b07?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1600';

export function Services() {
  const { t, lang, isRTL } = useLanguage();
  const [inquirySuccess, setInquirySuccess] = useState(false);
  const [inquirySending, setInquirySending] = useState(false);
  const [inquiryError, setInquiryError] = useState('');
  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  const visaTypes = [
    'Schengen Visa', 'USA / Canada Visa', 'UK Visa', 'GCC Visa', 'Australia Visa', 'Japan Visa'
  ].map(name => ({ name, price: isRTL ? 'اطلب عرض سعر' : 'Request a quote' }));

  const carFleet = [
    { name: isRTL ? 'سيارات اقتصادية' : 'Economy Cars', icon: '🚗' },
    { name: isRTL ? 'سيارات فاخرة' : 'Luxury Sedans', icon: '🏎️' },
    { name: isRTL ? 'سيارات عائلية' : 'Family SUVs', icon: '🚙' },
    { name: isRTL ? 'حافلات صغيرة' : 'Mini Buses', icon: '🚐' },
  ];

  const handleInquiry = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inquirySending) return;
    setInquirySending(true); setInquiryError('');
    const fields = new FormData(e.currentTarget);
    try {
      await submitInquiry({
        source: 'service', name: String(fields.get('name') || ''),
        phone: String(fields.get('phone') || ''), email: String(fields.get('email') || ''),
        subject: String(fields.get('service') || ''),
        message: String(fields.get('message') || ''),
      });
      setInquirySuccess(true);
    } catch (error) { setInquiryError(error instanceof Error ? error.message : 'Request failed'); }
    finally { setInquirySending(false); }
  };

  const services = [
    {
      icon: Plane,
      title: t('services.international_title'),
      desc: t('services.international_desc'),
      features: isRTL
        ? ['باقات مصممة خصيصاً', 'مرشد سياحي متخصص', 'حجز فنادق وطيران', 'تأمين سفر شامل']
        : ['Custom-designed itineraries', 'Expert tour guides', 'Hotel & flight booking', 'Comprehensive travel insurance'],
      cta: { label: isRTL ? 'استعرض الرحلات الخارجية' : 'Browse International Trips', href: '/packages?type=external' },
      color: '#D32F2F',
    },
    {
      icon: Map,
      title: t('services.domestic_title'),
      desc: t('services.domestic_desc'),
      features: isRTL
        ? ['رحلات داخل المملكة', 'زيارة الوجهات الطبيعية', 'باقات عائلية ومجموعات', 'خدمة النقل والإقامة']
        : ['Kingdom-wide trips', 'Natural & heritage sites', 'Family & group packages', 'Transport & accommodation'],
      cta: { label: isRTL ? 'استعرض الرحلات الداخلية' : 'Browse Domestic Trips', href: '/packages?type=internal' },
      color: '#1a5276',
    },
  ];

  return (
    <div style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>
      {/* Page Hero */}
      <section
        className="relative h-[320px] flex items-end overflow-hidden"
        style={{ backgroundImage: `url(${PAGE_HERO})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="absolute inset-0 bg-black/65" />
        <div className={`relative z-10 max-w-[1280px] w-full mx-auto px-6 pb-10 ${isRTL ? 'text-right' : 'text-left'}`}>
          <div className={`flex items-center gap-2 text-white/60 text-xs mb-3 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
            <Link to="/" className="hover:text-white">{t('general.breadcrumb_home')}</Link>
            <span>/</span>
            <span className="text-white">{t('nav.services')}</span>
          </div>
          <h1
            className="text-white"
            style={{
              fontFamily: isRTL ? "'Cairo', sans-serif" : "'Playfair Display', serif",
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              fontWeight: 700,
            }}
          >
            {t('services_page.title')}
          </h1>
        </div>
      </section>

      {/* Main services cards */}
      <section className="py-20 bg-[#F5F0EB]">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {services.map((svc, i) => {
              const Icon = svc.icon;
              return (
                <motion.div
                  key={svc.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${isRTL ? 'text-right' : 'text-left'}`}
                >
                  <div className="p-8">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center mb-5" style={{ background: `${svc.color}15` }}>
                      <Icon size={26} style={{ color: svc.color }} />
                    </div>
                    <h2
                      className="text-[#0D0D0D] mb-3"
                      style={{ fontFamily: isRTL ? "'Cairo', sans-serif" : "'Playfair Display', serif", fontSize: '1.5rem', fontWeight: 700 }}
                    >
                      {svc.title}
                    </h2>
                    <p className="text-[#8C8076] mb-5 leading-relaxed text-sm">{svc.desc}</p>
                    <ul className="space-y-2 mb-6">
                      {svc.features.map((f, j) => (
                        <li key={j} className={`flex items-center gap-2 text-sm text-[#0D0D0D] ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <Check size={14} className="text-green-500 shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Link
                      to={svc.cta.href}
                      className={`inline-flex items-center gap-2 px-6 py-2.5 text-white rounded-lg text-sm font-semibold transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}
                      style={{ background: svc.color }}
                    >
                      {svc.cta.label}
                      <Arrow size={14} />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Visa Services */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-8 ${isRTL ? 'text-right' : 'text-left'}`}
          >
            <div className={`flex flex-col sm:flex-row sm:items-start gap-6 mb-6 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
              <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center shrink-0">
                <FileText size={26} className="text-amber-600" />
              </div>
              <div className="flex-1">
                <h2
                  className="text-[#0D0D0D] mb-2"
                  style={{ fontFamily: isRTL ? "'Cairo', sans-serif" : "'Playfair Display', serif", fontSize: '1.5rem', fontWeight: 700 }}
                >
                  {t('services.visa_title')}
                </h2>
                <p className="text-[#8C8076] text-sm leading-relaxed">{t('services.visa_desc')}</p>
              </div>
            </div>
            <h4 className="font-semibold text-[#0D0D0D] mb-4 text-sm">{t('services_page.visa_types')}</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {visaTypes.map(v => (
                <div key={v.name} className="flex flex-col gap-1 p-3 border border-gray-100 rounded-lg hover:border-amber-300 transition-colors">
                  <span className="text-sm font-medium text-[#0D0D0D]">{v.name}</span>
                  <span className="text-xs text-[#D32F2F] font-semibold">{v.price}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => document.getElementById('inquiry-form')?.scrollIntoView({ behavior: 'smooth' })}
              className={`mt-6 inline-flex items-center gap-2 px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-semibold transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              {t('services_page.inquire')} <Arrow size={14} />
            </button>
          </motion.div>

          {/* Car Rental */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-8 ${isRTL ? 'text-right' : 'text-left'}`}
          >
            <div className={`flex flex-col sm:flex-row sm:items-start gap-6 mb-6 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
              <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center shrink-0">
                <Car size={26} className="text-blue-600" />
              </div>
              <div className="flex-1">
                <h2
                  className="text-[#0D0D0D] mb-2"
                  style={{ fontFamily: isRTL ? "'Cairo', sans-serif" : "'Playfair Display', serif", fontSize: '1.5rem', fontWeight: 700 }}
                >
                  {t('services.rental_title')}
                </h2>
                <p className="text-[#8C8076] text-sm leading-relaxed">{t('services.rental_desc')}</p>
              </div>
            </div>
            <h4 className="font-semibold text-[#0D0D0D] mb-4 text-sm">{t('services_page.fleet')}</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {carFleet.map(c => (
                <div key={c.name} className="flex flex-col items-center gap-2 p-4 border border-gray-100 rounded-lg hover:border-blue-200 transition-colors text-center">
                  <span className="text-3xl">{c.icon}</span>
                  <span className="text-sm text-[#0D0D0D]">{c.name}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => document.getElementById('inquiry-form')?.scrollIntoView({ behavior: 'smooth' })}
              className={`mt-6 inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              {t('services_page.inquire')} <Arrow size={14} />
            </button>
          </motion.div>

          {/* Exhibitions - Full width */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`bg-[#0D0D0D] text-white rounded-xl overflow-hidden p-8 md:p-12 ${isRTL ? 'text-right' : 'text-left'}`}
          >
            <div className={`flex flex-col md:flex-row items-start md:items-center justify-between gap-6 ${isRTL ? 'md:flex-row-reverse' : ''}`}>
              <div>
                <div className="w-14 h-14 bg-[#D32F2F]/20 rounded-full flex items-center justify-center mb-4">
                  <Building2 size={26} className="text-[#FF6659]" />
                </div>
                <h2
                  className="text-white mb-3"
                  style={{ fontFamily: isRTL ? "'Cairo', sans-serif" : "'Playfair Display', serif", fontSize: '1.6rem', fontWeight: 700 }}
                >
                  {t('services_page.exhibitions_title')}
                </h2>
                <p className="text-white/60 text-sm leading-relaxed max-w-xl">{t('services_page.exhibitions_desc')}</p>
              </div>
              <button
                onClick={() => document.getElementById('inquiry-form')?.scrollIntoView({ behavior: 'smooth' })}
                className={`shrink-0 inline-flex items-center gap-2 px-8 py-3.5 bg-[#D32F2F] hover:bg-[#9A0007] text-white rounded-lg text-sm font-semibold transition-colors whitespace-nowrap ${isRTL ? 'flex-row-reverse' : ''}`}
              >
                {t('services_page.exhibitions_cta')} <Arrow size={14} />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Inquiry Form */}
      <section id="inquiry-form" className="py-20 bg-white">
        <div className="max-w-[700px] mx-auto px-6">
          <div className={`mb-10 ${isRTL ? 'text-right' : 'text-center'}`}>
            <h2
              className="text-[#0D0D0D]"
              style={{
                fontFamily: isRTL ? "'Cairo', sans-serif" : "'Playfair Display', serif",
                fontSize: 'clamp(1.6rem, 3vw, 2rem)',
                fontWeight: 700,
              }}
            >
              {t('services_page.inquiry_title')}
            </h2>
          </div>

          {inquirySuccess ? (
            <div className="text-center py-10">
              <div className="text-6xl mb-4">✅</div>
              <h4 className="text-xl font-bold text-[#0D0D0D] mb-2">{t('contact.success')}</h4>
            </div>
          ) : (
            <form onSubmit={handleInquiry} className={`bg-[#F5F0EB] rounded-2xl p-8 shadow-sm ${isRTL ? 'text-right' : 'text-left'}`}>
              {inquiryError && <p role="alert" className="mb-3 text-red-700 text-sm">{inquiryError}</p>}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {[
                  { name: 'name', label: t('contact.full_name'), type: 'text', placeholder: isRTL ? 'الاسم الكامل' : 'Full Name' },
                  { name: 'phone', label: t('contact.phone'), type: 'tel', placeholder: '+966 5XX XXX XXXX' },
                  { name: 'email', label: t('contact.email'), type: 'email', placeholder: 'email@example.com' },
                ].map(f => (
                  <div key={f.label} className={f.label === t('contact.email') ? 'sm:col-span-2' : ''}>
                    <label className="block text-xs font-semibold text-[#8C8076] uppercase tracking-wide mb-1.5">{f.label}</label>
                    <input
                      type={f.type}
                      name={f.name}
                      placeholder={f.placeholder}
                      required
                      className={`w-full border border-gray-200 bg-white rounded-lg px-4 py-2.5 text-sm text-[#0D0D0D] focus:outline-none focus:border-[#D32F2F] ${isRTL ? 'text-right' : 'text-left'}`}
                    />
                  </div>
                ))}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#8C8076] uppercase tracking-wide mb-1.5">{t('services_page.inquiry_service')}</label>
                  <select name="service" className={`w-full border border-gray-200 bg-white rounded-lg px-4 py-2.5 text-sm text-[#0D0D0D] focus:outline-none focus:border-[#D32F2F]`}>
                    <option>{t('services.international_title')}</option>
                    <option>{t('services.domestic_title')}</option>
                    <option>{t('services.visa_title')}</option>
                    <option>{t('services.rental_title')}</option>
                    <option>{t('services_page.exhibitions_title')}</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#8C8076] uppercase tracking-wide mb-1.5">{t('services_page.inquiry_msg')}</label>
                  <textarea
                    name="message"
                    rows={4}
                    required
                    className={`w-full border border-gray-200 bg-white rounded-lg px-4 py-2.5 text-sm text-[#0D0D0D] focus:outline-none focus:border-[#D32F2F] resize-none ${isRTL ? 'text-right' : 'text-left'}`}
                  />
                </div>
              </div>
              <button type="submit" className="w-full py-3.5 bg-[#D32F2F] hover:bg-[#9A0007] text-white rounded-lg font-semibold text-sm transition-colors">
                {inquirySending ? (isRTL ? 'جاري الإرسال...' : 'Sending...') : t('services_page.inquiry_submit')}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}