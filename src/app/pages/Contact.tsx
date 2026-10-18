import { useState } from 'react';
import { Link } from 'react-router';
import { Phone, Mail, MapPin, Clock, MessageCircle, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { submitInquiry } from '../lib/inquiries';

const FONT = "'IBM Plex Sans Arabic', sans-serif";

interface FormState {
  name: string;
  phoneCode: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
}

export function Contact() {
  const { t, isRTL } = useLanguage();
  const { settings } = useData();
  const showWhatsApp = settings?.show_whatsapp_button !== false;
  const whatsappNumber = settings?.whatsapp || '966560074845';
  const phoneNumber = settings?.phone || '+966 560 074 845';
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState<FormState>({
    name: '',
    phoneCode: '+966',
    phone: '',
    email: '',
    subject: t('contact.subject_general'),
    message: '',
  });

  const handleChange = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
  };

  const buildWhatsAppMessage = () => {
    const lines = [
      isRTL ? '📩 *رسالة جديدة من الموقع*' : '📩 *New message from website*',
      '',
      `${isRTL ? '👤 الاسم' : '👤 Name'}: ${form.name}`,
      `${isRTL ? '📞 الهاتف' : '📞 Phone'}: ${form.phoneCode} ${form.phone}`,
      form.email ? `${isRTL ? '📧 البريد' : '📧 Email'}: ${form.email}` : '',
      `${isRTL ? '📌 الموضوع' : '📌 Subject'}: ${form.subject}`,
      '',
      `${isRTL ? '💬 الرسالة' : '💬 Message'}:`,
      form.message,
    ].filter(Boolean).join('\n');
    return encodeURIComponent(lines);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;
    setSending(true); setFormError('');
    try {
      await submitInquiry({ source: 'contact', name: form.name, phone: `${form.phoneCode} ${form.phone}`, email: form.email, subject: form.subject, message: form.message });
      setSubmitted(true);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Request failed');
    } finally { setSending(false); }
  };

  const offices = [
    {
      title: isRTL ? (settings.office_arar_label_ar || 'موقع عرعر') : (settings.office_arar_label_en || 'Arar Office'),
      address: isRTL ? settings.address_ar : settings.address_en,
      phone: phoneNumber, icon: '🇸🇦',
      mapsUrl: settings.office_arar_maps_url || 'https://maps.app.goo.gl/Knh6hM25FxMR8CVm7',
    },
    ...((settings.address2_ar || settings.address2_en) ? [{
      title: isRTL ? (settings.office_riyadh_label_ar || 'موقع الرياض') : (settings.office_riyadh_label_en || 'Riyadh Office'),
      address: isRTL ? (settings.address2_ar || settings.address2_en) : (settings.address2_en || settings.address2_ar),
      phone: settings.office_riyadh_phone || '',
      icon: '📍',
      mapsUrl: settings.office_riyadh_maps_url || '',
    }] : []),
  ];

  return (
    <div style={{ fontFamily: FONT }}>
      {/* Page Hero */}
      <section
        className="relative h-[280px] flex items-end overflow-hidden"
        style={{
          backgroundImage: `url(https://images.unsplash.com/photo-1768069794857-9306ac167c6e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1600)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black/65" />
        <div className="relative z-10 max-w-[1280px] w-full mx-auto px-6 pb-10" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className="flex items-center gap-2 text-white/60 text-xs mb-3">
            <Link to="/" className="hover:text-white">{t('general.breadcrumb_home')}</Link>
            <span>/</span>
            <span className="text-white">{t('nav.contact')}</span>
          </div>
          <h1
            className="text-white"
            style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 700 }}
          >
            {t('contact.title')}
          </h1>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-[1280px] mx-auto px-6 py-16" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Form */}
          <div className="lg:w-1/2">
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <CheckCircle size={64} className="text-green-500 mb-4" />
                <h3 className="text-[#0D0D0D] mb-2" style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                  {t('contact.success')}
                </h3>
                <p className="text-[#8C8076] text-sm mb-8">
                  {isRTL ? 'تم تسجيل رسالتك وسيتابع الفريق الطلب خلال ساعات العمل.' : 'Your message was recorded; our team will follow up during business hours.'}
                </p>
                {/* WhatsApp follow-up — only shown if enabled */}
                {showWhatsApp && (
                  <a
                    href={`https://wa.me/${whatsappNumber}?text=${buildWhatsAppMessage()}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-6 py-3 bg-[#25D366] hover:bg-[#1fba59] text-white rounded-full font-semibold text-sm transition-colors"
                  >
                    <MessageCircle size={18} />
                    {isRTL ? 'تابع عبر واتساب' : 'Follow up via WhatsApp'}
                  </a>
                )}
              </motion.div>
            ) : (
              <motion.form
                initial={{ opacity: 0, x: isRTL ? 40 : -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                onSubmit={handleSubmit}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
              >
                {formError && <p role="alert" className="mb-4 text-sm text-red-700">{formError}</p>}
                <h2 className="text-[#0D0D0D] mb-6" style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                  {isRTL ? 'أرسل لنا رسالة' : 'Send Us a Message'}
                </h2>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#8C8076] uppercase tracking-wide mb-1.5">{t('contact.full_name')}</label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={handleChange('name')}
                        placeholder={isRTL ? 'الاسم الكامل' : 'Full Name'}
                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#D32F2F] text-[#0D0D0D]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#8C8076] uppercase tracking-wide mb-1.5">{t('contact.phone')}</label>
                      <div className="flex overflow-hidden rounded-lg border border-gray-200 focus-within:border-[#D32F2F]">
                        <select
                          value={form.phoneCode}
                          onChange={handleChange('phoneCode')}
                          className="border-0 px-3 py-2.5 text-sm bg-gray-50 focus:outline-none text-[#0D0D0D] shrink-0"
                        >
                          <option value="+966">🇸🇦 +966</option>
                          <option value="+962">🇯🇴 +962</option>
                          <option value="+971">🇦🇪 +971</option>
                          <option value="+1">🇺🇸 +1</option>
                        </select>
                        <div className="w-px bg-gray-200 self-stretch shrink-0" />
                        <input
                          type="tel"
                          placeholder="5XX XXX XXXX"
                          required
                          value={form.phone}
                          onChange={handleChange('phone')}
                          className="flex-1 min-w-0 border-0 px-4 py-2.5 text-sm focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#8C8076] uppercase tracking-wide mb-1.5">{t('contact.email')}</label>
                    <input
                      type="email"
                      placeholder="email@example.com"
                      value={form.email}
                      onChange={handleChange('email')}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#D32F2F]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#8C8076] uppercase tracking-wide mb-1.5">{t('contact.subject')}</label>
                    <select
                      value={form.subject}
                      onChange={handleChange('subject')}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#D32F2F] text-[#0D0D0D]"
                    >
                      <option>{t('contact.subject_general')}</option>
                      <option>{t('contact.subject_package')}</option>
                      <option>{t('contact.subject_visa')}</option>
                      <option>{t('contact.subject_rental')}</option>
                      <option>{t('contact.subject_other')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#8C8076] uppercase tracking-wide mb-1.5">{t('contact.message')}</label>
                    <textarea
                      required
                      rows={5}
                      value={form.message}
                      onChange={handleChange('message')}
                      placeholder={isRTL ? 'اكتب رسالتك هنا...' : 'Write your message here...'}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#D32F2F] resize-none"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-5">
                  <button
                    type="submit"
                    className="flex-1 py-3.5 bg-[#D32F2F] hover:bg-[#9A0007] text-white rounded-lg font-semibold text-sm transition-colors"
                  >
                    {sending ? (isRTL ? 'جاري الإرسال...' : 'Sending...') : t('contact.send')}
                  </button>
                  {/* WhatsApp direct send — only shown if enabled */}
                  {showWhatsApp && (
                    <a
                      href={`https://wa.me/${whatsappNumber}?text=${buildWhatsAppMessage()}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-5 py-3.5 bg-[#25D366] hover:bg-[#1fba59] text-white rounded-lg font-semibold text-sm transition-colors"
                      title={isRTL ? 'إرسال عبر واتساب' : 'Send via WhatsApp'}
                    >
                      <MessageCircle size={16} />
                      {isRTL ? 'واتساب' : 'WhatsApp'}
                    </a>
                  )}
                </div>
              </motion.form>
            )}
          </div>

          {/* Contact info */}
          <motion.div
            initial={{ opacity: 0, x: isRTL ? -40 : 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:w-1/2 flex flex-col gap-6"
          >
            {/* Office cards */}
            {offices.map(office => (
              <div key={office.title} className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <span className="text-3xl shrink-0">{office.icon}</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-[#0D0D0D] mb-3">{office.title}</h4>
                    <div className="flex items-start gap-2.5 text-sm text-[#8C8076] mb-2">
                      <MapPin size={14} className="text-[#D32F2F] shrink-0 mt-0.5" />
                      <span>{office.address}</span>
                      {office.mapsUrl && /^https:\/\/(maps\.app\.goo\.gl|www\.google\.com\/maps|maps\.google\.com)\//.test(office.mapsUrl) && <a href={office.mapsUrl} target="_blank" rel="noopener noreferrer" className="block mt-2 text-[#D32F2F] underline">{isRTL ? 'افتح الموقع على خرائط Google' : 'View on Google Maps'}</a>}
                    </div>
                    <div className="flex items-center gap-2.5 text-sm text-[#8C8076]">
                      <Phone size={14} className="text-[#D32F2F] shrink-0" />
                      <span dir="ltr">{office.phone || (isRTL ? 'للتواصل استخدم الرقم العام' : 'Contact via general number')}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Email */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <Mail size={18} className="text-[#D32F2F] shrink-0" />
                <h4 className="font-semibold text-[#0D0D0D]">{isRTL ? 'البريد الإلكتروني' : 'Email'}</h4>
              </div>
              <a href={`mailto:${settings.email || 'info@etihadtours.com'}`} className="text-[#8C8076] hover:text-[#D32F2F] text-sm transition-colors">
                {settings.email || 'info@etihadtours.com'}
              </a>
            </div>

            {/* Working hours */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <Clock size={18} className="text-[#D32F2F] shrink-0" />
                <h4 className="font-semibold text-[#0D0D0D]">{t('contact.working_hours')}</h4>
              </div>
              <p className="text-[#8C8076] text-sm">{isRTL ? settings.working_hours_ar : settings.working_hours_en}</p>
            </div>

            {/* WhatsApp CTA — only shown if enabled */}
            {showWhatsApp && (
              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 py-4 bg-[#25D366] hover:bg-[#1fba59] text-white rounded-xl font-semibold transition-colors text-sm"
              >
                <MessageCircle size={20} />
                {t('contact.whatsapp')}
              </a>
            )}

            {/* Map */}
            <div className="bg-gray-100 rounded-xl overflow-hidden" style={{ height: '220px' }}>
              <iframe
                src="https://maps.google.com/maps?q=King+Abdulaziz+Road,+Alkhalidiyah,+Arar+73211,+Saudi+Arabia&t=&z=15&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Al-Etihad Tours — Arar office"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}