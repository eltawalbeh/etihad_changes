import { Link } from 'react-router';
import { useLanguage } from '../context/LanguageContext';
function Layout({ titleAr, titleEn, children }: { titleAr: string; titleEn: string; children: React.ReactNode }) {
  const { isRTL } = useLanguage();
  return <main dir={isRTL ? 'rtl' : 'ltr'} className="bg-[#F5F0EB] pt-32 pb-20 min-h-screen">
    <div className="max-w-3xl mx-auto px-6 space-y-6">
      <Link to="/" className="text-[#D32F2F] underline">{isRTL ? 'الرئيسية' : 'Home'}</Link>
      <h1 className="text-3xl font-bold">{isRTL ? titleAr : titleEn}</h1>
      <div className="rounded-xl bg-white p-6 text-gray-700 leading-8 space-y-4">{children}</div>
    </div>
  </main>;
}
export function Privacy() {
  const { isRTL } = useLanguage();
  return <Layout titleAr="سياسة الخصوصية" titleEn="Privacy Policy">
    <p>{isRTL ? 'نجمع المعلومات التي تدخلها في نماذج التواصل وطلبات الرحلات (مثل الاسم ورقم الهاتف والبريد وتفاصيل الطلب) بغرض متابعة طلبك فقط.' : 'We collect details you submit via inquiry forms (such as name, phone, email and request details) to respond to your inquiry.'}</p>
    <p>{isRTL ? 'تُخزن الاستفسارات في نظام محمي بحسابات إدارة مخصصة. يمكن طلب الوصول إلى بياناتك أو حذفها عبر info@etihadtours.com. مدة الاحتفاظ النهائية تخضع لاعتماد سياسة المؤسسة وإجراءات الحذف.' : 'Inquiries are stored in an access-controlled management system. You can request access to or deletion of your information at info@etihadtours.com. A final retention period awaits approval by the business.'}</p>
    <p>{isRTL ? 'قد تُستخدم أدوات تحليل أداء الموقع بعد الموافقة على ملفات الارتباط غير الضرورية. روابط الخدمات الخارجية تخضع لسياساتها الخاصة.' : 'Non-essential analytics may be used after consent. Third-party websites have their own privacy practices.'}</p>
    <p className="font-semibold">{isRTL ? 'هذه مسودة سياسة تحتاج مراجعة قانونية قبل النشر.' : 'Draft policy — requires legal review before publication.'}</p>
  </Layout>;
}
export function Terms() {
  const { isRTL } = useLanguage();
  return <Layout titleAr="شروط وأحكام الاستخدام" titleEn="Terms of Use">
    <p>{isRTL ? 'المعلومات والباقات والأسعار المنشورة للاستعلام وقد تختلف بحسب التوفر وتاريخ السفر ومتطلبات الوجهة.' : 'Website descriptions and quotations are informational and subject to availability, travel dates, and destination requirements.'}</p>
    <p>{isRTL ? 'إرسال استفسار أو طلب حجز لا يعد تأكيدًا للحجز أو إصدارًا للتذاكر. لا يصبح الحجز ملزمًا إلا بعد تأكيد المؤسسة لشروط الخدمة والسعر.' : 'Submitting an inquiry or booking request does not confirm travel services or issue tickets. Reservations require explicit confirmation of terms and pricing.'}</p>
    <p>{isRTL ? 'يجب تقديم معلومات صحيحة عند الاستفسار، ولا يجوز إساءة استخدام النماذج.' : 'Please submit accurate information and do not misuse the inquiry forms.'}</p>
    <p className="font-semibold">{isRTL ? 'هذه الشروط مسودة تتطلب اعتمادًا قانونيًا وتجاريًا.' : 'Draft terms — commercial and legal approval is required.'}</p>
  </Layout>;
}
