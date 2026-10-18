import React, { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import {
  Clock, DollarSign, RefreshCw, CheckCircle2,
  ArrowLeft, ArrowRight, ExternalLink, ChevronDown,
  ChevronUp, Shield, Info, Search, Globe, AlertTriangle,
} from 'lucide-react';
import { EmojiFlag } from '../components/EmojiFlag';
import { useLanguage } from '../context/LanguageContext';
import {
  VISA_DATA, getCountryVisa, buildYahalaLink,
  formatProcessingDays, formatFee, formatEntries,
  type VisaType,
} from '../data/visaData';

// ─── Nationality lookup (matches SearchBar NATIONALITIES) ─────────────────────
const NATIONALITY_LABELS: Record<string, { ar: string; en: string; flag: string }> = {
  SA: { ar: 'سعودي', en: 'Saudi', flag: '🇸🇦' },
  AE: { ar: 'إماراتي', en: 'Emirati', flag: '🇦🇪' },
  KW: { ar: 'كويتي', en: 'Kuwaiti', flag: '🇰🇼' },
  QA: { ar: 'قطري', en: 'Qatari', flag: '🇶🇦' },
  BH: { ar: 'بحريني', en: 'Bahraini', flag: '🇧🇭' },
  OM: { ar: 'عُماني', en: 'Omani', flag: '🇴🇲' },
  JO: { ar: 'أردني', en: 'Jordanian', flag: '🇯🇴' },
  EG: { ar: 'مصري', en: 'Egyptian', flag: '🇪🇬' },
  SY: { ar: 'سوري', en: 'Syrian', flag: '🇸🇾' },
  LB: { ar: 'لبناني', en: 'Lebanese', flag: '🇱🇧' },
  IQ: { ar: 'عراقي', en: 'Iraqi', flag: '🇮🇶' },
  YE: { ar: 'يمني', en: 'Yemeni', flag: '🇾🇪' },
  SD: { ar: 'سوداني', en: 'Sudanese', flag: '🇸🇩' },
  LY: { ar: 'ليبي', en: 'Libyan', flag: '🇱🇾' },
  TN: { ar: 'تونسي', en: 'Tunisian', flag: '🇹🇳' },
  DZ: { ar: 'جزائري', en: 'Algerian', flag: '🇩🇿' },
  MA: { ar: 'مغربي', en: 'Moroccan', flag: '🇲🇦' },
  PK: { ar: 'باكستاني', en: 'Pakistani', flag: '🇵🇰' },
  IN: { ar: 'هندي', en: 'Indian', flag: '🇮🇳' },
  BD: { ar: 'بنغلاديشي', en: 'Bangladeshi', flag: '🇧🇩' },
  PH: { ar: 'فلبيني', en: 'Filipino', flag: '🇵🇭' },
  ID: { ar: 'إندونيسي', en: 'Indonesian', flag: '🇮🇩' },
  MY: { ar: 'ماليزي', en: 'Malaysian', flag: '🇲🇾' },
  TR: { ar: 'تركي', en: 'Turkish', flag: '🇹🇷' },
  US: { ar: 'أمريكي', en: 'American', flag: '🇺🇸' },
  GB: { ar: 'بريطانيااني', en: 'British', flag: '🇬🇧' },
  DE: { ar: 'ألماني', en: 'German', flag: '🇩🇪' },
  FR: { ar: 'فرنسي', en: 'French', flag: '🇫🇷' },
  CN: { ar: 'صيني', en: 'Chinese', flag: '🇨🇳' },
  RU: { ar: 'روسي', en: 'Russian', flag: '🇷🇺' },
};

// ─── Visa Card ────────────────────────────────────────────────────────────────

function VisaCard({
  visa,
  countryCode,
  nationalityCode,
  isRTL,
}: {
  visa: VisaType;
  countryCode: string;
  nationalityCode: string;
  isRTL: boolean;
}) {
  const [reqOpen, setReqOpen] = useState(false);
  const yahalaUrl = buildYahalaLink(countryCode, visa.yahala_type, nationalityCode || 'sa');
  const processingLabel = formatProcessingDays(visa.processing_days_min, visa.processing_days_max, isRTL);
  const feeLabel = formatFee(visa.fee_sar, isRTL);
  const entriesLabel = formatEntries(visa.entries, isRTL);
  const reqs = isRTL ? visa.requirements_ar : visa.requirements_en;
  const isOnArrival = visa.processing_days_min === 0 && visa.processing_days_max === 0;

  return (
    <div
      className={`relative bg-white rounded-2xl border-2 ${
        visa.popular ? 'border-[#fd2452]' : 'border-gray-100'
      } shadow-sm hover:shadow-md transition-shadow overflow-hidden`}
    >
      {/* Popular badge */}
      {visa.popular && (
        <div className="absolute top-0 end-0">
          <div className="bg-[#fd2452] text-white text-[10px] font-bold px-2.5 py-1 rounded-bl-xl rounded-tr-xl">
            {isRTL ? 'الأكثر طلباً' : 'Most Popular'}
          </div>
        </div>
      )}

      <div className="p-5">
        {/* Title */}
        <h3 className="text-[15px] font-semibold text-gray-800 mb-4 pe-16">
          {isRTL ? visa.type_ar : visa.type_en}
        </h3>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {/* Processing */}
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Clock className="w-3.5 h-3.5 text-[#fd2452]" />
              <span className="text-[11px] text-gray-400">{isRTL ? 'وقت المعالجة' : 'Processing'}</span>
            </div>
            <span className={`text-[13px] font-semibold ${isOnArrival ? 'text-green-600' : 'text-gray-800'}`}>
              {processingLabel}
            </span>
          </div>

          {/* Fee */}
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <DollarSign className="w-3.5 h-3.5 text-[#fd2452]" />
              <span className="text-[11px] text-gray-400">{isRTL ? 'الرسوم' : 'Fee'}</span>
            </div>
            <span className={`text-[13px] font-semibold ${visa.fee_sar === 0 ? 'text-green-600' : 'text-gray-800'}`}>
              {feeLabel}
            </span>
          </div>

          {/* Validity */}
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Shield className="w-3.5 h-3.5 text-[#fd2452]" />
              <span className="text-[11px] text-gray-400">{isRTL ? 'صلاحية التأشيرة' : 'Validity'}</span>
            </div>
            <span className="text-[13px] font-semibold text-gray-800">
              {isRTL ? `${visa.validity_days} يوم` : `${visa.validity_days} days`}
            </span>
          </div>

          {/* Entries */}
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <RefreshCw className="w-3.5 h-3.5 text-[#fd2452]" />
              <span className="text-[11px] text-gray-400">{isRTL ? 'نوع الدخول' : 'Entry'}</span>
            </div>
            <span className="text-[13px] font-semibold text-gray-800">{entriesLabel}</span>
          </div>
        </div>

        {/* Stay duration pill */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-[12px] text-gray-400">{isRTL ? 'مدة الإقامة:' : 'Max stay:'}</span>
          <span className="bg-blue-50 text-blue-700 text-[12px] font-medium px-2.5 py-0.5 rounded-full">
            {isRTL ? `${visa.stay_days} يوم` : `${visa.stay_days} days`}
          </span>
        </div>

        {/* Requirements accordion */}
        <button
          onClick={() => setReqOpen((o) => !o)}
          className="w-full flex items-center justify-between text-[13px] text-gray-500 hover:text-gray-800 transition-colors mb-3 py-1.5 border-t border-gray-100"
        >
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
            {isRTL
              ? `المستندات المطلوبة (${reqs.length})`
              : `Required documents (${reqs.length})`}
          </span>
          {reqOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {reqOpen && (
          <ul className="mb-4 space-y-1.5">
            {reqs.map((req, i) => (
              <li key={i} className="flex items-start gap-2 text-[12px] text-gray-600">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                {req}
              </li>
            ))}
          </ul>
        )}

        {/* Apply CTA */}
        <a
          href={yahalaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 bg-[#fd2452] hover:bg-[#e61b46] active:bg-[#c4143a] text-white rounded-xl py-3 text-[14px] font-semibold transition-colors"
        >
          <span>{isRTL ? 'تقدّم بطلب عبر ياهلا' : 'Apply via Ya Hala'}</span>
          <ExternalLink className="w-4 h-4 flex-shrink-0" />
        </a>

        {/* Yahala attribution */}
        <p className="text-center text-[11px] text-gray-400 mt-2">
          {isRTL ? 'مدعوم من منصة ياهلا للتأشيرات' : 'Powered by Ya Hala Visa Platform'}
        </p>
      </div>
    </div>
  );
}

// ─── No-data state ────────────────────────────────────────────────────────────

function NoVisaData({ countryEn, countryAr, isRTL }: { countryEn: string; countryAr: string; isRTL: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
      <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-4">
        <AlertTriangle className="w-8 h-8 text-amber-400" />
      </div>
      <h3 className="text-[18px] font-semibold text-gray-800 mb-2">
        {isRTL ? 'لا تتوفر بيانات تأشيرة' : 'No visa data found'}
      </h3>
      <p className="text-[14px] text-gray-500 max-w-sm">
        {isRTL
          ? `لا تتوفر بيانات تأشيرة لـ ${countryAr} حالياً. تواصل معنا للمساعدة.`
          : `We don't have visa data for ${countryEn} yet. Contact us for assistance.`}
      </p>
    </div>
  );
}

// ─── Country Selector Strip ───────────────────────────────────────────────────

function CountryStrip({ isRTL, selectedCode, onSelect }: {
  isRTL: boolean;
  selectedCode: string;
  onSelect: (code: string) => void;
}) {
  return (
    <div className="overflow-x-auto scrollbar-none pb-1">
      <div className="flex gap-2 w-max">
        {VISA_DATA.map((c) => (
          <button
            key={c.country_code}
            onClick={() => onSelect(c.country_code)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] whitespace-nowrap transition-all border ${
              selectedCode === c.country_code
                ? 'bg-[#fd2452] text-white border-[#fd2452]'
                : 'bg-white text-gray-600 border-gray-200 hover:border-[#fd2452] hover:text-[#fd2452]'
            }`}
          >
            <EmojiFlag emoji={c.flag} className="text-base leading-none" />
            <span>{isRTL ? c.country_ar : c.country_en}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function EVisaPage() {
  const { isRTL, lang } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Read from URL
  const initialCountry = searchParams.get('country') ?? '';
  const initialNationality = searchParams.get('nationality') ?? 'SA';

  const [selectedCountry, setSelectedCountry] = useState(initialCountry);
  const [selectedNationality, setSelectedNationality] = useState(initialNationality);

  const handleCountrySelect = (code: string) => {
    setSelectedCountry(code);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('country', code);
      return next;
    });
  };

  const countryInfo = useMemo(() => getCountryVisa(selectedCountry), [selectedCountry]);
  const natInfo = NATIONALITY_LABELS[selectedNationality];

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  return (
    <div className="min-h-screen bg-[#f5f0eb]" dir={isRTL ? 'rtl' : 'ltr'}>

      {/* ── Hero Header ── */}
      <div className="bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white py-10 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-6 text-[14px]"
          >
            <BackIcon className="w-4 h-4" />
            {isRTL ? 'رجوع' : 'Back'}
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#fd2452] rounded-xl flex items-center justify-center flex-shrink-0">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-[22px] sm:text-[28px] font-bold">
                  {isRTL ? 'تأشيرة إلكترونية' : 'e-Visa Search'}
                </h1>
                <p className="text-white/60 text-[13px]">
                  {isRTL
                    ? 'تصفّح أنواع التأشيرات وقدّم طلبك مباشرة عبر ياهلا'
                    : 'Browse visa types and apply directly through Yahala'}
                </p>
              </div>
            </div>

            {/* Nationality badge */}
            {natInfo && (
              <div className="sm:ms-auto flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2">
                <EmojiFlag emoji={natInfo.flag} className="text-lg" />
                <span className="text-[13px] text-white/80">
                  {isRTL ? `الجنسية: ${natInfo.ar}` : `Nationality: ${natInfo.en}`}
                </span>
              </div>
            )}
          </div>

          {/* Country strip */}
          <CountryStrip
            isRTL={isRTL}
            selectedCode={selectedCountry}
            onSelect={handleCountrySelect}
          />
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Info banner */}
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
          <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="text-[13px] text-blue-700">
            {isRTL
              ? 'الرسوم والمعلومات المعروضة تقريبية. يتم توجيهك لمنصة ياهلا للحصول على السعر الدقيق وإتمام الطلب.'
              : 'Fees and information shown are approximate. You will be redirected to Yahala platform for exact pricing and to complete your application.'}
          </p>
        </div>

        {/* No country selected */}
        {!selectedCountry && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-5 shadow-sm">
              <Search className="w-9 h-9 text-gray-300" />
            </div>
            <h2 className="text-[20px] font-semibold text-gray-700 mb-2">
              {isRTL ? 'اختر دولة الوجهة' : 'Select a Destination Country'}
            </h2>
            <p className="text-[14px] text-gray-400 max-w-xs">
              {isRTL
                ? 'اختر الدولة التي تريد السفر إليها من الشريط أعلاه لعرض أنواع التأشيرات المتاحة'
                : 'Pick a destination from the strip above to see available visa types'}
            </p>
          </div>
        )}

        {/* Country selected → show visas */}
        {selectedCountry && (
          <>
            {countryInfo ? (
              <>
                {/* Country header */}
                <div className="flex items-center gap-3 mb-6">
                  <EmojiFlag emoji={countryInfo.flag} className="text-4xl leading-none" />
                  <div>
                    <h2 className="text-[20px] font-bold text-gray-900">
                      {isRTL ? countryInfo.country_ar : countryInfo.country_en}
                    </h2>
                    <p className="text-[13px] text-gray-500">
                      {countryInfo.visa_types.length}{' '}
                      {isRTL
                        ? countryInfo.visa_types.length === 1 ? 'نوع تأشيرة متاح' : 'أنواع تأشيرة متاحة'
                        : countryInfo.visa_types.length === 1 ? 'visa type available' : 'visa types available'}
                    </p>
                  </div>

                  {countryInfo.gcc_free && (
                    <span className="ms-auto bg-green-100 text-green-700 text-[12px] font-medium px-3 py-1 rounded-full">
                      {isRTL ? '✅ دخول حر لمواطني دول الخليج' : '✅ Free entry for GCC nationals'}
                    </span>
                  )}
                </div>

                {/* Visa cards grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {countryInfo.visa_types.map((visa) => (
                    <VisaCard
                      key={visa.id}
                      visa={visa}
                      countryCode={selectedCountry}
                      nationalityCode={selectedNationality}
                      isRTL={isRTL}
                    />
                  ))}
                </div>

                {/* Bottom note */}
                <div className="mt-8 bg-white rounded-2xl border border-gray-100 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex-1">
                    <p className="text-[14px] font-semibold text-gray-800 mb-1">
                      {isRTL ? 'هل تحتاج مساعدة في اختيار التأشيرة؟' : 'Need help choosing the right visa?'}
                    </p>
                    <p className="text-[13px] text-gray-500">
                      {isRTL
                        ? 'تواصل مع فريق الاتحاد للسفر وسيرشدك خبراؤنا للنوع المناسب.'
                        : 'Contact the Etihad Tours team — our experts will guide you to the right option.'}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/contact')}
                    className="flex-shrink-0 bg-[#fd2452] text-white px-5 py-2.5 rounded-xl text-[13px] font-semibold hover:bg-[#e61b46] transition-colors"
                  >
                    {isRTL ? 'تواصل معنا' : 'Contact Us'}
                  </button>
                </div>
              </>
            ) : (
              <NoVisaData
                countryEn={selectedCountry}
                countryAr={selectedCountry}
                isRTL={isRTL}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}