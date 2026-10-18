// ─── Visa Data Layer ─────────────────────────────────────────────────────────
// This is the local visa information database.
// To switch to live Yahala API data, replace the mock calls in EVisaPage.tsx
// with: GET https://vi.yahala.co/api/search?country={CODE}&residency={NAT}&api_key={KEY}

export type EntryType = 'single' | 'double' | 'multiple';

export interface VisaType {
  id: string;
  type_ar: string;
  type_en: string;
  /** Calendar days from application to decision */
  processing_days_min: number;
  processing_days_max: number;
  /** Application fee in SAR */
  fee_sar: number;
  /** Visa validity from issue date */
  validity_days: number;
  /** Permitted stay per entry */
  stay_days: number;
  entries: EntryType;
  requirements_ar: string[];
  requirements_en: string[];
  /** Type code used in Yahala deep-link (?type=...) */
  yahala_type: string;
  popular?: boolean;
}

export interface CountryVisaInfo {
  country_code: string;
  country_ar: string;
  country_en: string;
  flag: string;
  /** Whether GCC nationals get visa-on-arrival */
  gcc_free?: boolean;
  visa_types: VisaType[];
}

// ─── Helper ───────────────────────────────────────────────────────────────────

const REQ_COMMON_AR = [
  'جواز سفر ساري المفعول (6 أشهر على الأقل)',
  'صورة شخصية حديثة (خلفية بيضاء)',
  'كشف حساب بنكي (3 أشهر)',
];
const REQ_COMMON_EN = [
  'Valid passport (min. 6 months)',
  'Recent passport photo (white background)',
  'Bank statements (3 months)',
];

// ─── Country Database ─────────────────────────────────────────────────────────

export const VISA_DATA: CountryVisaInfo[] = [
  // ── Japan ──────────────────────────────────────────────────────────────────
  {
    country_code: 'JP',
    country_ar: 'اليابان',
    country_en: 'Japan',
    flag: '🇯🇵',
    visa_types: [
      {
        id: 'jp-tourist',
        type_ar: 'تأشيرة سياحية',
        type_en: 'Tourist Visa',
        processing_days_min: 4,
        processing_days_max: 7,
        fee_sar: 180,
        validity_days: 90,
        stay_days: 15,
        entries: 'single',
        yahala_type: 'tourism',
        popular: true,
        requirements_ar: [...REQ_COMMON_AR, 'حجز فندق مؤكد', 'تذاكر طيران ذهاباً وإياباً', 'جدول رحلة مفصّل'],
        requirements_en: [...REQ_COMMON_EN, 'Confirmed hotel booking', 'Round-trip flight tickets', 'Detailed itinerary'],
      },
      {
        id: 'jp-business',
        type_ar: 'تأشيرة أعمال',
        type_en: 'Business Visa',
        processing_days_min: 5,
        processing_days_max: 10,
        fee_sar: 280,
        validity_days: 90,
        stay_days: 15,
        entries: 'single',
        yahala_type: 'business',
        requirements_ar: [...REQ_COMMON_AR, 'خطاب من الشركة', 'دعوة رسمية من الجانب الياباني', 'السجل التجاري'],
        requirements_en: [...REQ_COMMON_EN, 'Company letter', 'Official invitation from Japan side', 'Commercial registration'],
      },
    ],
  },

  // ── United Kingdom ─────────────────────────────────────────────────────────
  {
    country_code: 'GB',
    country_ar: 'المملكة المتحدة',
    country_en: 'United Kingdom',
    flag: '🇬🇧',
    visa_types: [
      {
        id: 'gb-visit',
        type_ar: 'تأشيرة زيارة / سياحة',
        type_en: 'Standard Visitor Visa',
        processing_days_min: 15,
        processing_days_max: 21,
        fee_sar: 750,
        validity_days: 180,
        stay_days: 180,
        entries: 'multiple',
        yahala_type: 'visit',
        popular: true,
        requirements_ar: [...REQ_COMMON_AR, 'حجوزات فنادق', 'إثبات ملكية العقار أو عقد إيجار', 'شهادة عمل أو إفادة راتب'],
        requirements_en: [...REQ_COMMON_EN, 'Hotel bookings', 'Property deed or rental contract', 'Employment certificate or salary slip'],
      },
      {
        id: 'gb-business',
        type_ar: 'تأشيرة أعمال',
        type_en: 'Business Visitor Visa',
        processing_days_min: 15,
        processing_days_max: 21,
        fee_sar: 750,
        validity_days: 180,
        stay_days: 180,
        entries: 'multiple',
        yahala_type: 'business',
        requirements_ar: [...REQ_COMMON_AR, 'خطاب دعوة من شركة بريطانية', 'إثبات النشاط التجاري', 'شهادة عمل'],
        requirements_en: [...REQ_COMMON_EN, 'Invitation letter from UK company', 'Proof of business activity', 'Employment letter'],
      },
    ],
  },

  // ── United States ──────────────────────────────────────────────────────────
  {
    country_code: 'US',
    country_ar: 'الولايات المتحدة الأمريكية',
    country_en: 'United States',
    flag: '🇺🇸',
    visa_types: [
      {
        id: 'us-b2',
        type_ar: 'تأشيرة سياحية (B-2)',
        type_en: 'Tourist Visa (B-2)',
        processing_days_min: 30,
        processing_days_max: 60,
        fee_sar: 600,
        validity_days: 3650,
        stay_days: 180,
        entries: 'multiple',
        yahala_type: 'tourism',
        popular: true,
        requirements_ar: [...REQ_COMMON_AR, 'إتمام نموذج DS-160 إلكترونياً', 'حجز موعد مقابلة قنصلية', 'إثبات روابط وطيدة بالمملكة'],
        requirements_en: [...REQ_COMMON_EN, 'Complete DS-160 form online', 'Schedule consulate interview', 'Proof of strong ties to home country'],
      },
      {
        id: 'us-b1',
        type_ar: 'تأشيرة أعمال (B-1)',
        type_en: 'Business Visa (B-1)',
        processing_days_min: 30,
        processing_days_max: 60,
        fee_sar: 600,
        validity_days: 3650,
        stay_days: 180,
        entries: 'multiple',
        yahala_type: 'business',
        requirements_ar: [...REQ_COMMON_AR, 'إتمام نموذج DS-160', 'خطاب من الشركة', 'دعوة أمريكية'],
        requirements_en: [...REQ_COMMON_EN, 'DS-160 form', 'Company letter', 'US invitation letter'],
      },
    ],
  },

  // ── Germany ────────────────────────────────────────────────────────────────
  {
    country_code: 'DE',
    country_ar: 'ألمانيا',
    country_en: 'Germany',
    flag: '🇩🇪',
    visa_types: [
      {
        id: 'de-schengen-tourist',
        type_ar: 'تأشيرة شنغن - سياحة',
        type_en: 'Schengen Visa – Tourism',
        processing_days_min: 10,
        processing_days_max: 15,
        fee_sar: 350,
        validity_days: 90,
        stay_days: 90,
        entries: 'multiple',
        yahala_type: 'tourism',
        popular: true,
        requirements_ar: [...REQ_COMMON_AR, 'تأمين سفر شامل لمنطقة شنغن', 'حجوزات فندقية لكامل الرحلة', 'كشف حساب بنكي بحد أدنى 5000 ريال'],
        requirements_en: [...REQ_COMMON_EN, 'Travel insurance covering all Schengen area', 'Hotel bookings for entire trip', 'Bank balance min. SAR 5,000'],
      },
      {
        id: 'de-schengen-business',
        type_ar: 'تأشيرة شنغن - أعمال',
        type_en: 'Schengen Visa – Business',
        processing_days_min: 10,
        processing_days_max: 15,
        fee_sar: 350,
        validity_days: 90,
        stay_days: 90,
        entries: 'multiple',
        yahala_type: 'business',
        requirements_ar: [...REQ_COMMON_AR, 'تأمين سفر شنغن', 'خطاب شركة ألمانية', 'خطاب من صاحب العمل'],
        requirements_en: [...REQ_COMMON_EN, 'Schengen travel insurance', 'German company letter', 'Employer letter'],
      },
    ],
  },

  // ── France ─────────────────────────────────────────────────────────────────
  {
    country_code: 'FR',
    country_ar: 'فرنسا',
    country_en: 'France',
    flag: '🇫🇷',
    visa_types: [
      {
        id: 'fr-schengen-tourist',
        type_ar: 'تأشيرة شنغن - سياحة',
        type_en: 'Schengen Visa – Tourism',
        processing_days_min: 10,
        processing_days_max: 15,
        fee_sar: 350,
        validity_days: 90,
        stay_days: 90,
        entries: 'multiple',
        yahala_type: 'tourism',
        popular: true,
        requirements_ar: [...REQ_COMMON_AR, 'تأمين سفر شنغن', 'حجوزات فنادق', 'برنامج الرحلة'],
        requirements_en: [...REQ_COMMON_EN, 'Schengen travel insurance', 'Hotel reservations', 'Travel itinerary'],
      },
    ],
  },

  // ── Turkey ────────────────────────────────────────────────────────────────
  {
    country_code: 'TR',
    country_ar: 'تركيا',
    country_en: 'Turkey',
    flag: '🇹🇷',
    visa_types: [
      {
        id: 'tr-evisa',
        type_ar: 'تأشيرة إلكترونية (e-Visa)',
        type_en: 'e-Visa',
        processing_days_min: 1,
        processing_days_max: 3,
        fee_sar: 180,
        validity_days: 180,
        stay_days: 90,
        entries: 'multiple',
        yahala_type: 'evisa',
        popular: true,
        requirements_ar: ['جواز سفر ساري المفعول', 'بريد إلكتروني فعّال', 'بطاقة ائتمان للدفع'],
        requirements_en: ['Valid passport', 'Active email address', 'Credit/debit card for payment'],
      },
    ],
  },

  // ── Indonesia ──────────────────────────────────────────────────────────────
  {
    country_code: 'ID',
    country_ar: 'إندونيسيا',
    country_en: 'Indonesia',
    flag: '🇮🇩',
    visa_types: [
      {
        id: 'id-voa',
        type_ar: 'تأشيرة عند الوصول (VoA)',
        type_en: 'Visa on Arrival (VoA)',
        processing_days_min: 0,
        processing_days_max: 0,
        fee_sar: 190,
        validity_days: 30,
        stay_days: 30,
        entries: 'single',
        yahala_type: 'voa',
        popular: true,
        requirements_ar: ['جواز سفر ساري المفعول (6 أشهر)', 'مبلغ كافٍ من المال لتغطية الإقامة'],
        requirements_en: ['Valid passport (6 months)', 'Sufficient funds for the stay'],
      },
      {
        id: 'id-evisa',
        type_ar: 'تأشيرة إلكترونية',
        type_en: 'e-Visa (B211A)',
        processing_days_min: 3,
        processing_days_max: 7,
        fee_sar: 280,
        validity_days: 60,
        stay_days: 60,
        entries: 'single',
        yahala_type: 'evisa',
        requirements_ar: [...REQ_COMMON_AR, 'حجز فندق مؤكد'],
        requirements_en: [...REQ_COMMON_EN, 'Confirmed hotel booking'],
      },
    ],
  },

  // ── Maldives ───────────────────────────────────────────────────────────────
  {
    country_code: 'MV',
    country_ar: 'جزر المالديف',
    country_en: 'Maldives',
    flag: '🇲🇻',
    visa_types: [
      {
        id: 'mv-voa',
        type_ar: 'تأشيرة عند الوصول (مجانية)',
        type_en: 'Free Visa on Arrival',
        processing_days_min: 0,
        processing_days_max: 0,
        fee_sar: 0,
        validity_days: 30,
        stay_days: 30,
        entries: 'single',
        yahala_type: 'voa',
        popular: true,
        requirements_ar: ['جواز سفر ساري المفعول', 'حجز فندق مؤكد أو منتجع', 'تذكرة عودة مؤكدة', 'مبلغ كافٍ ($100 يومياً على الأقل)'],
        requirements_en: ['Valid passport', 'Confirmed hotel/resort booking', 'Return ticket', 'Min. $100/day in funds'],
      },
    ],
  },

  // ── Morocco ────────────────────────────────────────────────────────────────
  {
    country_code: 'MA',
    country_ar: 'المغرب',
    country_en: 'Morocco',
    flag: '🇲🇦',
    visa_types: [
      {
        id: 'ma-tourist',
        type_ar: 'تأشيرة سياحية',
        type_en: 'Tourist Visa',
        processing_days_min: 5,
        processing_days_max: 10,
        fee_sar: 150,
        validity_days: 90,
        stay_days: 90,
        entries: 'single',
        yahala_type: 'tourism',
        popular: true,
        requirements_ar: [...REQ_COMMON_AR, 'حجز فندق', 'تذاكر طيران'],
        requirements_en: [...REQ_COMMON_EN, 'Hotel booking', 'Flight tickets'],
      },
    ],
  },

  // ── UAE ────────────────────────────────────────────────────────────────────
  {
    country_code: 'AE',
    country_ar: 'الإمارات العربية المتحدة',
    country_en: 'United Arab Emirates',
    flag: '🇦🇪',
    gcc_free: true,
    visa_types: [
      {
        id: 'ae-visit-30',
        type_ar: 'تأشيرة زيارة 30 يوم',
        type_en: 'Visit Visa – 30 Days',
        processing_days_min: 2,
        processing_days_max: 4,
        fee_sar: 250,
        validity_days: 60,
        stay_days: 30,
        entries: 'single',
        yahala_type: 'visit_30',
        popular: true,
        requirements_ar: ['جواز سفر ساري (6 أشهر)', 'صورة شخصية'],
        requirements_en: ['Valid passport (6 months)', 'Passport photo'],
      },
      {
        id: 'ae-visit-60',
        type_ar: 'تأشيرة زيارة 60 يوم',
        type_en: 'Visit Visa – 60 Days',
        processing_days_min: 2,
        processing_days_max: 4,
        fee_sar: 420,
        validity_days: 90,
        stay_days: 60,
        entries: 'single',
        yahala_type: 'visit_60',
        requirements_ar: ['جواز سفر ساري (6 أشهر)', 'صورة شخصية'],
        requirements_en: ['Valid passport (6 months)', 'Passport photo'],
      },
      {
        id: 'ae-transit',
        type_ar: 'تأشيرة عبور 96 ساعة',
        type_en: 'Transit Visa – 96 Hours',
        processing_days_min: 1,
        processing_days_max: 2,
        fee_sar: 100,
        validity_days: 14,
        stay_days: 4,
        entries: 'single',
        yahala_type: 'transit',
        requirements_ar: ['جواز سفر ساري', 'تذكرة عبور (connecting flight)'],
        requirements_en: ['Valid passport', 'Connecting flight ticket'],
      },
    ],
  },

  // ── Malaysia ───────────────────────────────────────────────────────────────
  {
    country_code: 'MY',
    country_ar: 'ماليزيا',
    country_en: 'Malaysia',
    flag: '🇲🇾',
    visa_types: [
      {
        id: 'my-evisa',
        type_ar: 'تأشيرة إلكترونية (eNTRI)',
        type_en: 'e-Visa (eNTRI)',
        processing_days_min: 1,
        processing_days_max: 3,
        fee_sar: 75,
        validity_days: 90,
        stay_days: 15,
        entries: 'single',
        yahala_type: 'evisa',
        popular: true,
        requirements_ar: ['جواز سفر ساري (6 أشهر)', 'صورة شخصية', 'بريد إلكتروني'],
        requirements_en: ['Valid passport (6 months)', 'Passport photo', 'Email address'],
      },
      {
        id: 'my-tourist',
        type_ar: 'تأشيرة سياحية',
        type_en: 'Tourist Visa',
        processing_days_min: 5,
        processing_days_max: 10,
        fee_sar: 200,
        validity_days: 90,
        stay_days: 30,
        entries: 'single',
        yahala_type: 'tourism',
        requirements_ar: [...REQ_COMMON_AR, 'حجز فندق', 'تذاكر طيران'],
        requirements_en: [...REQ_COMMON_EN, 'Hotel booking', 'Flight tickets'],
      },
    ],
  },

  // ── Thailand ───────────────────────────────────────────────────────────────
  {
    country_code: 'TH',
    country_ar: 'تايلاند',
    country_en: 'Thailand',
    flag: '🇹🇭',
    visa_types: [
      {
        id: 'th-tourist',
        type_ar: 'تأشيرة سياحية',
        type_en: 'Tourist Visa (TR)',
        processing_days_min: 3,
        processing_days_max: 7,
        fee_sar: 280,
        validity_days: 60,
        stay_days: 60,
        entries: 'single',
        yahala_type: 'tourism',
        popular: true,
        requirements_ar: [...REQ_COMMON_AR, 'حجز فندق', 'تذاكر طيران', 'مبلغ 20,000 بات (حد أدنى)'],
        requirements_en: [...REQ_COMMON_EN, 'Hotel booking', 'Flight tickets', 'Min. 20,000 THB in funds'],
      },
      {
        id: 'th-voa',
        type_ar: 'تأشيرة عند الوصول',
        type_en: 'Visa on Arrival',
        processing_days_min: 0,
        processing_days_max: 0,
        fee_sar: 225,
        validity_days: 15,
        stay_days: 15,
        entries: 'single',
        yahala_type: 'voa',
        requirements_ar: ['جواز سفر ساري (6 أشهر)', 'صورة شخصية', 'مبلغ 10,000 بات', 'حجز فندق مؤكد'],
        requirements_en: ['Valid passport (6 months)', 'Passport photo', '10,000 THB in funds', 'Confirmed hotel'],
      },
    ],
  },

  // ── Italy ──────────────────────────────────────────────────────────────────
  {
    country_code: 'IT',
    country_ar: 'إيطاليا',
    country_en: 'Italy',
    flag: '🇮🇹',
    visa_types: [
      {
        id: 'it-schengen-tourist',
        type_ar: 'تأشيرة شنغن - سياحة',
        type_en: 'Schengen Visa – Tourism',
        processing_days_min: 10,
        processing_days_max: 15,
        fee_sar: 350,
        validity_days: 90,
        stay_days: 90,
        entries: 'multiple',
        yahala_type: 'tourism',
        popular: true,
        requirements_ar: [...REQ_COMMON_AR, 'تأمين سفر شنغن', 'حجوزات فنادق', 'برنامج الرحلة المفصّل'],
        requirements_en: [...REQ_COMMON_EN, 'Schengen travel insurance', 'Hotel reservations', 'Detailed itinerary'],
      },
    ],
  },

  // ── Spain ──────────────────────────────────────────────────────────────────
  {
    country_code: 'ES',
    country_ar: 'إسبانيا',
    country_en: 'Spain',
    flag: '🇪🇸',
    visa_types: [
      {
        id: 'es-schengen-tourist',
        type_ar: 'تأشيرة شنغن - سياحة',
        type_en: 'Schengen Visa – Tourism',
        processing_days_min: 10,
        processing_days_max: 15,
        fee_sar: 350,
        validity_days: 90,
        stay_days: 90,
        entries: 'multiple',
        yahala_type: 'tourism',
        popular: true,
        requirements_ar: [...REQ_COMMON_AR, 'تأمين سفر شنغن', 'حجوزات فنادق', 'برنامج الرحلة'],
        requirements_en: [...REQ_COMMON_EN, 'Schengen travel insurance', 'Hotel reservations', 'Travel itinerary'],
      },
    ],
  },

  // ── Netherlands ────────────────────────────────────────────────────────────
  {
    country_code: 'NL',
    country_ar: 'هولندا',
    country_en: 'Netherlands',
    flag: '🇳🇱',
    visa_types: [
      {
        id: 'nl-schengen-tourist',
        type_ar: 'تأشيرة شنغن - سياحة',
        type_en: 'Schengen Visa – Tourism',
        processing_days_min: 10,
        processing_days_max: 15,
        fee_sar: 350,
        validity_days: 90,
        stay_days: 90,
        entries: 'multiple',
        yahala_type: 'tourism',
        popular: true,
        requirements_ar: [...REQ_COMMON_AR, 'تأمين سفر شنغن', 'حجوزات فنادق'],
        requirements_en: [...REQ_COMMON_EN, 'Schengen travel insurance', 'Hotel reservations'],
      },
    ],
  },

  // ── Switzerland ────────────────────────────────────────────────────────────
  {
    country_code: 'CH',
    country_ar: 'سويسرا',
    country_en: 'Switzerland',
    flag: '🇨🇭',
    visa_types: [
      {
        id: 'ch-schengen-tourist',
        type_ar: 'تأشيرة شنغن - سياحة',
        type_en: 'Schengen Visa – Tourism',
        processing_days_min: 10,
        processing_days_max: 15,
        fee_sar: 350,
        validity_days: 90,
        stay_days: 90,
        entries: 'multiple',
        yahala_type: 'tourism',
        popular: true,
        requirements_ar: [...REQ_COMMON_AR, 'تأمين سفر شنغن', 'حجوزات فنادق', 'اثبات المقدرة المالية'],
        requirements_en: [...REQ_COMMON_EN, 'Schengen travel insurance', 'Hotel reservations', 'Proof of financial means'],
      },
    ],
  },

  // ── Greece ─────────────────────────────────────────────────────────────────
  {
    country_code: 'GR',
    country_ar: 'اليونان',
    country_en: 'Greece',
    flag: '🇬🇷',
    visa_types: [
      {
        id: 'gr-schengen-tourist',
        type_ar: 'تأشيرة شنغن - سياحة',
        type_en: 'Schengen Visa – Tourism',
        processing_days_min: 10,
        processing_days_max: 15,
        fee_sar: 350,
        validity_days: 90,
        stay_days: 90,
        entries: 'multiple',
        yahala_type: 'tourism',
        popular: true,
        requirements_ar: [...REQ_COMMON_AR, 'تأمين سفر شنغن', 'حجوزات فنادق'],
        requirements_en: [...REQ_COMMON_EN, 'Schengen travel insurance', 'Hotel reservations'],
      },
    ],
  },

  // ── Portugal ───────────────────────────────────────────────────────────────
  {
    country_code: 'PT',
    country_ar: 'البرتغال',
    country_en: 'Portugal',
    flag: '🇵🇹',
    visa_types: [
      {
        id: 'pt-schengen-tourist',
        type_ar: 'تأشيرة شنغن - سياحة',
        type_en: 'Schengen Visa – Tourism',
        processing_days_min: 10,
        processing_days_max: 15,
        fee_sar: 350,
        validity_days: 90,
        stay_days: 90,
        entries: 'multiple',
        yahala_type: 'tourism',
        popular: true,
        requirements_ar: [...REQ_COMMON_AR, 'تأمين سفر شنغن', 'حجوزات فنادق'],
        requirements_en: [...REQ_COMMON_EN, 'Schengen travel insurance', 'Hotel reservations'],
      },
    ],
  },

  // ── Australia ──────────────────────────────────────────────────────────────
  {
    country_code: 'AU',
    country_ar: 'أستراليا',
    country_en: 'Australia',
    flag: '🇦🇺',
    visa_types: [
      {
        id: 'au-tourist',
        type_ar: 'تأشيرة سياحية (Subclass 600)',
        type_en: 'Tourist Visa (Subclass 600)',
        processing_days_min: 20,
        processing_days_max: 40,
        fee_sar: 700,
        validity_days: 365,
        stay_days: 90,
        entries: 'multiple',
        yahala_type: 'tourism',
        popular: true,
        requirements_ar: [...REQ_COMMON_AR, 'تأمين صحي', 'حجز فندق أو دعوة', 'إثبات ملكية عقار', 'كشف حساب لآخر 6 أشهر'],
        requirements_en: [...REQ_COMMON_EN, 'Health insurance', 'Hotel booking or invitation', 'Property ownership proof', 'Bank statements (6 months)'],
      },
    ],
  },

  // ── Canada ─────────────────────────────────────────────────────────────────
  {
    country_code: 'CA',
    country_ar: 'كندا',
    country_en: 'Canada',
    flag: '🇨🇦',
    visa_types: [
      {
        id: 'ca-visitor',
        type_ar: 'تأشيرة زيارة (TRV)',
        type_en: 'Visitor Visa (TRV)',
        processing_days_min: 14,
        processing_days_max: 30,
        fee_sar: 450,
        validity_days: 3650,
        stay_days: 180,
        entries: 'multiple',
        yahala_type: 'visit',
        popular: true,
        requirements_ar: [...REQ_COMMON_AR, 'بصمات أصابع وصورة بيومترية', 'رسالة تقديم شخصية', 'إثبات روابط وطيدة بالسعودية'],
        requirements_en: [...REQ_COMMON_EN, 'Biometrics (fingerprints + photo)', 'Personal cover letter', 'Proof of strong ties to Saudi Arabia'],
      },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getCountryVisa(code: string): CountryVisaInfo | undefined {
  return VISA_DATA.find((c) => c.country_code === code);
}

/** Build a Yahala deep-link URL — base: https://vi.yahala.co/visa */
export function buildYahalaLink(
  countryCode: string,
  yahalaType: string,
  nationalityCode: string
): string {
  const BASE = 'https://vi.yahala.co/visa';
  const params = new URLSearchParams({
    country: countryCode,
    type: yahalaType,
    residency: nationalityCode.toLowerCase(),
  });
  return `${BASE}?${params.toString()}`;
}

export function formatProcessingDays(min: number, max: number, isRTL: boolean): string {
  if (min === 0 && max === 0) return isRTL ? 'عند الوصول' : 'On Arrival';
  if (min === max) return isRTL ? `${min} أيام` : `${min} days`;
  return isRTL ? `${min}–${max} أيام` : `${min}–${max} days`;
}

export function formatFee(fee: number, isRTL: boolean): string {
  if (fee === 0) return isRTL ? 'مجاناً' : 'Free';
  return isRTL ? `${fee.toLocaleString()} ر.س` : `SAR ${fee.toLocaleString()}`;
}

export function formatEntries(entries: EntryType, isRTL: boolean): string {
  const map: Record<EntryType, [string, string]> = {
    single: ['دخول واحد', 'Single Entry'],
    double: ['دخولان', 'Double Entry'],
    multiple: ['دخول متعدد', 'Multiple Entry'],
  };
  return isRTL ? map[entries][0] : map[entries][1];
}