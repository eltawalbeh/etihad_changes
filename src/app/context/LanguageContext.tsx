import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type Language = 'en' | 'ar';
export type Direction = 'ltr' | 'rtl';

interface LanguageContextType {
  lang: Language;
  dir: Direction;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Nav
    'nav.home': 'Home',
    'nav.about': 'About Us',
    'nav.packages': 'Our Trips',
    'nav.services': 'Services',
    'nav.news': 'Blog & News',
    'nav.contact': 'Contact Us',
    // Hero
    'hero.title': 'Discover the World With Us',
    'hero.subtitle': 'Trips, Visas, Stays — Everything in One Place',
    'hero.cta_primary': 'Browse Trips',
    'hero.cta_secondary': 'Contact Us',
    // Search
    'search.destination': 'Destination',
    'search.date': 'Travel Date',
    'search.duration': 'Duration',
    'search.travelers': 'Travelers',
    'search.button': 'Search',
    'search.placeholder_dest': 'Where to?',
    'search.placeholder_dur': 'Days',
    'search.placeholder_travelers': 'Persons',
    // Stats
    'stats.clients': 'Happy Clients',
    'stats.trips': 'Trips Organized',
    'stats.years': 'Years Experience',
    'stats.destinations': 'Destinations',
    // Services Section
    'services.title': 'Our Services',
    'services.international_title': 'International Trips',
    'services.international_desc': 'Explore world-class destinations with our expertly crafted international tour packages.',
    'services.domestic_title': 'Domestic Trips',
    'services.domestic_desc': 'Discover the beauty of the Arabian Peninsula with curated local travel experiences.',
    'services.visa_title': 'Visa Services',
    'services.visa_desc': 'Fast, reliable visa processing for Schengen, USA, UK, Canada, GCC and more.',
    'services.rental_title': 'Car Rental',
    'services.rental_desc': 'Wide fleet of luxury and economy vehicles for business and leisure travel.',
    'services.learn_more': 'Learn More',
    // Packages Section
    'packages.title': 'Top Packages',
    'packages.view_all': 'View All Packages',
    'packages.book_now': 'Book Now',
    'packages.days': 'Days',
    'packages.sar': 'SAR',
    'packages.details': 'Details & Book',
    'packages.filter_destination': 'Destination',
    'packages.filter_price': 'Price Range',
    'packages.filter_duration': 'Duration',
    'packages.filter_type': 'Trip Type',
    'packages.sort_by': 'Sort By',
    'packages.sort_price': 'Price',
    'packages.sort_duration': 'Duration',
    'packages.sort_newest': 'Newest',
    'packages.clear_filters': 'Clear Filters',
    'packages.type_international': 'International',
    'packages.type_domestic': 'Domestic',
    'packages.all': 'All Packages',
    'packages.duration_1_3': '1–3 Days',
    'packages.duration_4_7': '4–7 Days',
    'packages.duration_8_14': '8–14 Days',
    'packages.duration_14plus': '14+ Days',
    'packages.travelers': 'Max Travelers',
    'packages.departure': 'Departure',
    'packages.includes': 'Includes',
    'packages.excludes': 'Excludes',
    'packages.itinerary': 'Itinerary',
    'packages.gallery': 'Photo Gallery',
    'packages.related': 'You May Also Like',
    'packages.available': 'Available',
    'packages.select_date': 'Select Date',
    'packages.adults': 'Adults',
    'packages.children': 'Children',
    'packages.total': 'Total',
    'packages.whatsapp': 'Inquire via WhatsApp',
    // Why us
    'why.title': 'Why Choose Us',
    'why.price': 'Best Price Guarantee',
    'why.price_desc': 'We match or beat any comparable offer, guaranteed.',
    'why.support': '24/7 Support',
    'why.support_desc': 'Our team is always available to assist you, day or night.',
    'why.experience': 'Trusted Experience',
    'why.experience_desc': 'Over 15 years of excellence in travel and tourism.',
    // News
    'news.title': 'Travel News',
    'news.all': 'All News',
    'news.read_more': 'Read More',
    'news.all_articles': 'All Articles',
    'news.tips': 'Travel Tips',
    'news.destinations': 'Destinations',
    'news.latest': 'Latest News',
    'news.share': 'Share',
    'news.related_package': 'Interested in this destination?',
    // Booking modal
    'booking.title': 'Book Your Trip',
    'booking.full_name': 'Full Name',
    'booking.phone': 'Phone Number',
    'booking.email': 'Email',
    'booking.departure_date': 'Departure Date',
    'booking.adults': 'Adults',
    'booking.children': 'Children',
    'booking.special_requests': 'Special Requests',
    'booking.terms': 'I agree to the terms and conditions',
    'booking.submit': 'Confirm Booking',
    'booking.success': 'Booking Confirmed!',
    'booking.success_msg': 'Thank you! Our team will contact you shortly.',
    'booking.whatsapp_followup': 'Follow up via WhatsApp',
    // Contact
    'contact.title': 'Contact Us',
    'contact.full_name': 'Full Name',
    'contact.phone': 'Phone',
    'contact.email': 'Email',
    'contact.subject': 'Subject',
    'contact.message': 'Message',
    'contact.send': 'Send Message',
    'contact.success': 'Message sent! We\'ll be in touch soon.',
    'contact.subject_general': 'General Inquiry',
    'contact.subject_package': 'Package Inquiry',
    'contact.subject_visa': 'Visa Services',
    'contact.subject_rental': 'Car Rental',
    'contact.subject_other': 'Other',
    'contact.office': 'Our Office',
    'contact.working_hours': 'Working Hours',
    'contact.hours_value': 'Sun–Thu: 9:00 AM – 6:00 PM',
    'contact.whatsapp': 'Chat on WhatsApp',
    // About
    'about.title': 'Al-Etihad for Travel & Tourism',
    'about.story': 'Founded in Saudi Arabia with deep roots in Jordan, Al-Etihad Tours has been crafting unforgettable journeys for over 15 years. From luxury international getaways to seamless visa services, we handle every detail so you can focus on the experience.',
    'about.values_title': 'Our Values',
    'about.value1_title': 'Excellence',
    'about.value1_desc': 'We deliver top-tier service in every aspect of travel.',
    'about.value2_title': 'Trust',
    'about.value2_desc': 'Transparency and integrity are at the heart of everything we do.',
    'about.value3_title': 'Innovation',
    'about.value3_desc': 'We continuously evolve to exceed your expectations.',
    'about.team_title': 'Meet Our Team',
    'about.partners_title': 'Our Partners',
    // Services page
    'services_page.title': 'Our Services',
    'services_page.exhibitions_title': 'Exhibitions & Conferences',
    'services_page.exhibitions_desc': 'Complete corporate travel management for exhibitions, conferences and business events.',
    'services_page.exhibitions_cta': 'Request Quote',
    'services_page.inquiry_title': 'Have a Question?',
    'services_page.inquiry_service': 'Service Interested In',
    'services_page.inquiry_msg': 'Your Message',
    'services_page.inquiry_submit': 'Send Inquiry',
    'services_page.visa_types': 'Visa Types Available',
    'services_page.fleet': 'Our Fleet',
    'services_page.inquire': 'Inquire Now',
    // Footer
    'footer.tagline': 'Your trusted travel partner across the region and beyond.',
    'footer.quick_links': 'Quick Links',
    'footer.services': 'Services',
    'footer.contact_info': 'Contact Info',
    'footer.copyright': '© 2026 Al-Etihad for Travel & Tourism. All rights reserved.',
    'footer.privacy': 'Privacy Policy',
    'footer.terms': 'Terms of Service',
    // 404
    'notfound.title': 'Page Not Found',
    'notfound.subtitle': 'Sorry, the page you\'re looking for doesn\'t exist.',
    'notfound.home': 'Go Home',
    'notfound.packages': 'View Packages',
    'notfound.contact': 'Contact Us',
    // Cookie
    'cookie.text': 'We use cookies to enhance your experience on our website.',
    'cookie.accept': 'Accept',
    'cookie.decline': 'Decline',
    // General
    'general.loading': 'Loading...',
    'general.breadcrumb_home': 'Home',
    'general.search_placeholder': 'Search packages, articles...',
    'general.search_title': 'Search Results',
    'general.search_tabs_packages': 'Packages',
    'general.search_tabs_articles': 'Articles',
    'general.search_tabs_services': 'Services',
    'general.no_results': 'No results found.',
    'general.back': 'Back',
  },
  ar: {
    // Nav
    'nav.home': 'الرئيسية',
    'nav.about': 'من نحن',
    'nav.packages': 'رحلاتنا',
    'nav.services': 'خدماتنا',
    'nav.news': 'المدونة والأخبار',
    'nav.contact': 'تواصل معنا',
    // Hero
    'hero.title': 'اكتشف العالم معنا',
    'hero.subtitle': 'رحلات، تأشيرات، إقامات — كل شيء في مكان واحد',
    'hero.cta_primary': 'استعرض رحلاتنا',
    'hero.cta_secondary': 'تواصل معنا',
    // Search
    'search.destination': 'الوجهة',
    'search.date': 'تاريخ السفر',
    'search.duration': 'المدة',
    'search.travelers': 'المسافرون',
    'search.button': 'بحث',
    'search.placeholder_dest': 'إلى أين؟',
    'search.placeholder_dur': 'أيام',
    'search.placeholder_travelers': 'أشخاص',
    // Stats
    'stats.clients': 'عميل راضٍ',
    'stats.trips': 'رحلة منظمة',
    'stats.years': 'سنة خبرة',
    'stats.destinations': 'وجهة سياحية',
    // Services Section
    'services.title': 'خدماتنا المميزة',
    'services.international_title': 'رحلات خارجية',
    'services.international_desc': 'استكشف وجهات عالمية مميزة مع باقاتنا السياحية الدولية المتكاملة.',
    'services.domestic_title': 'رحلات داخلية',
    'services.domestic_desc': 'اكتشف جمال الجزيرة العربية مع تجارب سفر محلية مختارة بعناية.',
    'services.visa_title': 'خدمات التأشيرات',
    'services.visa_desc': 'معالجة سريعة وموثوقة للتأشيرات: شنغن، أمريكا، كندا، بريطانيا، وأكثر.',
    'services.rental_title': 'تأجير السيارات',
    'services.rental_desc': 'أسطول واسع من السيارات الفاخرة والاقتصادية لأسفار العمل والترفيه.',
    'services.learn_more': 'اعرف أكثر',
    // Packages Section
    'packages.title': 'أبرز عروضنا',
    'packages.view_all': 'عرض جميع الرحلات',
    'packages.book_now': 'احجز الآن',
    'packages.days': 'أيام',
    'packages.sar': 'ر.س',
    'packages.details': 'تفاصيل وحجز',
    'packages.filter_destination': 'الوجهة',
    'packages.filter_price': 'نطاق السعر',
    'packages.filter_duration': 'المدة',
    'packages.filter_type': 'نوع الرحلة',
    'packages.sort_by': 'ترتيب حسب',
    'packages.sort_price': 'السعر',
    'packages.sort_duration': 'المدة',
    'packages.sort_newest': 'الأحدث',
    'packages.clear_filters': 'مسح الفلاتر',
    'packages.type_international': 'خارجية',
    'packages.type_domestic': 'داخلية',
    'packages.all': 'جميع الرحلات',
    'packages.duration_1_3': '٢–٣ أيام',
    'packages.duration_4_7': '٤–٧ أيام',
    'packages.duration_8_14': '٨–١٤ يوماً',
    'packages.duration_14plus': '١٤+ يوماً',
    'packages.travelers': 'الحد الأقصى للمسافرين',
    'packages.departure': 'مدينة المغادرة',
    'packages.includes': 'يشمل',
    'packages.excludes': 'لا يشمل',
    'packages.itinerary': 'البرنامج اليومي',
    'packages.gallery': 'معرض الصور',
    'packages.related': 'قد يعجبك أيضاً',
    'packages.available': 'متاح',
    'packages.select_date': 'اختر التاريخ',
    'packages.adults': 'بالغين',
    'packages.children': 'أطفال',
    'packages.total': 'الإجمالي',
    'packages.whatsapp': 'استفسر عبر واتساب',
    // Why us
    'why.title': 'لماذا الاتحاد؟',
    'why.price': 'ضمان أفضل سعر',
    'why.price_desc': 'نضمن لك أفضل سعر مقابل أي عرض مماثل.',
    'why.support': 'دعم على مدار الساعة',
    'why.support_desc': 'فريقنا متاح دائماً لمساعدتك في أي وقت.',
    'why.experience': 'خبرة موثوقة',
    'why.experience_desc': 'أكثر من ١٥ عاماً من التميز في السفر والسياحة.',
    // News
    'news.title': 'أخبار السياحة',
    'news.all': 'كل الأخبار',
    'news.read_more': 'اقرأ المزيد',
    'news.all_articles': 'كل المقالات',
    'news.tips': 'نصائح سفر',
    'news.destinations': 'وجهات',
    'news.latest': 'آخر الأخبار',
    'news.share': 'مشاركة',
    'news.related_package': 'هل أعجبتك هذه الوجهة؟',
    // Booking modal
    'booking.title': 'احجز رحلتك',
    'booking.full_name': 'الاسم الكامل',
    'booking.phone': 'رقم الهاتف',
    'booking.email': 'البريد الإلكتروني',
    'booking.departure_date': 'تاريخ المغادرة',
    'booking.adults': 'بالغين',
    'booking.children': 'أطفال',
    'booking.special_requests': 'طلبات خاصة',
    'booking.terms': 'أوافق على الشروط والأحكام',
    'booking.submit': 'تأكيد الحجز',
    'booking.success': 'تم الحجز بنجاح!',
    'booking.success_msg': 'شكراً لك! سيتواصل معك فريقنا قريباً.',
    'booking.whatsapp_followup': 'تابع عبر واتساب',
    // Contact
    'contact.title': 'تواصل معنا',
    'contact.full_name': 'الاسم الكامل',
    'contact.phone': 'الهاتف',
    'contact.email': 'البريد الإلكتروني',
    'contact.subject': 'الموضوع',
    'contact.message': 'رسالتك',
    'contact.send': 'إرسال الرسالة',
    'contact.success': 'تم إرسال رسالتك! سنتواصل معك قريباً.',
    'contact.subject_general': 'استفسار عام',
    'contact.subject_package': 'استفسار عن رحلة',
    'contact.subject_visa': 'خدمات التأشيرات',
    'contact.subject_rental': 'تأجير السيارات',
    'contact.subject_other': 'أخرى',
    'contact.office': 'مقرنا',
    'contact.working_hours': 'ساعات العمل',
    'contact.hours_value': 'الأحد–الخميس: ٩ ص – ٦ م',
    'contact.whatsapp': 'تحدث معنا على واتساب',
    // About
    'about.title': 'نحن الاتحاد للسفر والسياحة',
    'about.story': 'تأسست شركة الاتحاد للسفر والسياحة في المملكة العربية السعودية بجذور راسخة في الأردن، وقد عملنا على صياغة رحلات لا تُنسى لأكثر من ٠٥ عاماً. من الرحلات الدولية الفاخرة إلى خدمات التأشيرات السلسة، نتولى كل التفاصيل حتى تتفرغ للتجربة.',
    'about.values_title': 'قيمنا',
    'about.value1_title': 'التميز',
    'about.value1_desc': 'نقدم خدمة عالية المستوى في كل جانب من جوانب السفر.',
    'about.value2_title': 'الثقة',
    'about.value2_desc': 'الشفافية والنزاهة في صميم كل ما نقوم به.',
    'about.value3_title': 'الابتكار',
    'about.value3_desc': 'نتطور باستمرار لنتجاوز توقعاتك دائماً.',
    'about.team_title': 'فريقنا',
    'about.partners_title': 'شركاؤنا',
    // Services page
    'services_page.title': 'خدماتنا',
    'services_page.exhibitions_title': 'المعارض والمؤتمرات',
    'services_page.exhibitions_desc': 'إدارة متكاملة لسفر الأعمال للمعارض والمؤتمرات والفعاليات التجارية.',
    'services_page.exhibitions_cta': 'اطلب عرض سعر',
    'services_page.inquiry_title': 'لديك استفسار؟',
    'services_page.inquiry_service': 'الخدمة المطلوبة',
    'services_page.inquiry_msg': 'رسالتك',
    'services_page.inquiry_submit': 'إرسال الاستفسار',
    'services_page.visa_types': 'أنواع التأشيرات المتاحة',
    'services_page.fleet': 'أسطولنا',
    'services_page.inquire': 'استفسر الآن',
    // Footer
    'footer.tagline': 'شريكك الموثوق في السفر عبر المنطقة والعالم.',
    'footer.quick_links': 'روابط سريعة',
    'footer.services': 'الخدمات',
    'footer.contact_info': 'معلومات التواصل',
    'footer.copyright': '© ٢٠٢٦ الاتحاد للسفر والسياحة. جميع الحقوق محفوظة.',
    'footer.privacy': 'سياسة الخصوصية',
    'footer.terms': 'شروط الاستخدام',
    // 404
    'notfound.title': 'الصفحة غير موجودة',
    'notfound.subtitle': 'عذراً، الصفحة التي تبحث عنها غير موجودة.',
    'notfound.home': 'الصفحة الرئيسية',
    'notfound.packages': 'استعرض الرحلات',
    'notfound.contact': 'تواصل معنا',
    // Cookie
    'cookie.text': 'نستخدم ملفات الكوكيز لتحسين تجربتك على موقعنا.',
    'cookie.accept': 'قبول',
    'cookie.decline': 'رفض',
    // General
    'general.loading': 'جاري التحميل...',
    'general.breadcrumb_home': 'الرئيسية',
    'general.search_placeholder': 'ابحث عن رحلات، مقالات...',
    'general.search_title': 'نتائج البحث',
    'general.search_tabs_packages': 'الرحلات',
    'general.search_tabs_articles': 'المقالات',
    'general.search_tabs_services': 'الخدمات',
    'general.no_results': 'لا توجد نتائج.',
    'general.back': 'رجوع',
  },
};

const LanguageContext = createContext<LanguageContextType>({
  lang: 'ar',
  dir: 'rtl',
  setLang: () => {},
  t: (key) => key,
  isRTL: true,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    const stored = localStorage.getItem('etihad_lang');
    return (stored === 'en' || stored === 'ar') ? stored : 'ar';
  });

  const dir: Direction = lang === 'ar' ? 'rtl' : 'ltr';
  const isRTL = lang === 'ar';

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
    localStorage.setItem('etihad_lang', lang);
  }, [lang, dir]);

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
  }, []);

  const t = useCallback((key: string): string => {
    return translations[lang][key] || translations['en'][key] || key;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, dir, setLang, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}