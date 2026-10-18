import { useState, useEffect } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { Save, AlertCircle, CheckCircle, Phone, Mail, MapPin, Clock, Globe, BarChart3, Layout, Search, MessageCircle, Share2, Megaphone } from 'lucide-react';

const SETTINGS_TABS = [
  { id: 'business', label: 'Business Profile', description: 'Company, contact and office details' },
  { id: 'website', label: 'Website Experience', description: 'Homepage controls and announcements' },
  { id: 'channels', label: 'Channels & Measurement', description: 'WhatsApp, social links and Google' },
] as const;

function Section({ title, icon: Icon, children }: { title: string; icon?: any; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
        {Icon && <Icon size={18} className="text-[#D32F2F]" />}
        <h3 className="font-semibold text-gray-800">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', placeholder = '', dir = 'ltr', hint = '' }: any) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        dir={dir}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/20 focus:border-[#D32F2F] transition-all"
      />
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

function Toggle({ label, description, checked, onChange }: { label: string; description?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800">{label}</p>
        {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        dir="ltr"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${checked ? 'bg-[#D32F2F]' : 'bg-gray-200'}`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`}
        />
      </button>
    </div>
  );
}

export function AdminSettings() {
  const { adminFetch } = useAdminAuth();
  const [form, setForm] = useState<any>({
    whatsapp: '',
    phone: '',
    email: '',
    address_en: '',
    address_ar: '',
    address2_en: '',
    address2_ar: '',
    office_arar_label_ar: '',
    office_arar_label_en: '',
    office_arar_maps_url: '',
    office_riyadh_label_ar: '',
    office_riyadh_label_en: '',
    office_riyadh_phone: '',
    office_riyadh_maps_url: '',
    stats_verified: false,
    working_hours_en: '',
    working_hours_ar: '',
    stats_happy_clients: '',
    stats_trips_organized: '',
    stats_years_experience: '',
    stats_destinations: '',
    company_name_en: '',
    company_name_ar: '',
    tagline_en: '',
    tagline_ar: '',
    show_popular_destinations: true,
    search_tab_flights: false,
    search_tab_hotels: false,
    search_tab_chalets: false,
    search_tab_evisa: false,
    search_tab_destinations: false,
    search_tab_packages: true,
    show_whatsapp_button: true,
    google_tag_id: '',
    search_console_verification: '',
    social_instagram: '',
    social_instagram_enabled: false,
    social_twitter: '',
    social_twitter_enabled: false,
    social_facebook: '',
    social_facebook_enabled: false,
    social_tiktok: '',
    social_tiktok_enabled: false,
    social_snapchat: '',
    social_snapchat_enabled: false,
    banner_enabled: false,
    banner_message_en: '',
    banner_message_ar: '',
    banner_link: '',
    banner_link_label_en: 'Read More',
    banner_link_label_ar: 'اقرأ المزيد',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<(typeof SETTINGS_TABS)[number]['id']>('business');

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await adminFetch('/settings');
        const data = await res.json();
        if (data.settings) {
          setForm({
            whatsapp: data.settings.whatsapp || '',
            phone: data.settings.phone || data.settings.phone_ksa || '',
            email: data.settings.email || '',
            address_en: data.settings.address_en || data.settings.address_ksa_en || '',
            address_ar: data.settings.address_ar || data.settings.address_ksa_ar || '',
            address2_en: data.settings.address2_en || '',
            address2_ar: data.settings.address2_ar || '',
            office_arar_label_ar: data.settings.office_arar_label_ar || 'موقع عرعر',
            office_arar_label_en: data.settings.office_arar_label_en || 'Arar Office',
            office_arar_maps_url: data.settings.office_arar_maps_url || 'https://maps.app.goo.gl/Knh6hM25FxMR8CVm7',
            office_riyadh_label_ar: data.settings.office_riyadh_label_ar || 'موقع الرياض',
            office_riyadh_label_en: data.settings.office_riyadh_label_en || 'Riyadh Office',
            office_riyadh_phone: data.settings.office_riyadh_phone || '',
            office_riyadh_maps_url: data.settings.office_riyadh_maps_url || '',
            stats_verified: data.settings.stats_verified === true,
            working_hours_en: data.settings.working_hours_en || '',
            working_hours_ar: data.settings.working_hours_ar || '',
            stats_happy_clients: data.settings.stats_happy_clients?.toString() || '',
            stats_trips_organized: data.settings.stats_trips_organized?.toString() || '',
            stats_years_experience: data.settings.stats_years_experience?.toString() || '',
            stats_destinations: data.settings.stats_destinations?.toString() || '',
            company_name_en: data.settings.company_name_en || '',
            company_name_ar: data.settings.company_name_ar || '',
            tagline_en: data.settings.tagline_en || '',
            tagline_ar: data.settings.tagline_ar || '',
            show_popular_destinations: data.settings.show_popular_destinations !== false,
            search_tab_flights: !!data.settings.search_tab_flights,
            search_tab_hotels: !!data.settings.search_tab_hotels,
            search_tab_chalets: !!data.settings.search_tab_chalets,
            search_tab_evisa: !!data.settings.search_tab_evisa,
            search_tab_destinations: !!data.settings.search_tab_destinations,
            search_tab_packages: data.settings.search_tab_packages !== false,
            show_whatsapp_button: data.settings.show_whatsapp_button !== false,
            google_tag_id: data.settings.google_tag_id || '',
            search_console_verification: data.settings.search_console_verification || '',
            social_instagram: data.settings.social_instagram || '',
            social_instagram_enabled: !!data.settings.social_instagram_enabled,
            social_twitter: data.settings.social_twitter || '',
            social_twitter_enabled: !!data.settings.social_twitter_enabled,
            social_facebook: data.settings.social_facebook || '',
            social_facebook_enabled: !!data.settings.social_facebook_enabled,
            social_tiktok: data.settings.social_tiktok || '',
            social_tiktok_enabled: !!data.settings.social_tiktok_enabled,
            social_snapchat: data.settings.social_snapchat || '',
            social_snapchat_enabled: !!data.settings.social_snapchat_enabled,
            banner_enabled: !!data.settings.banner_enabled,
            banner_message_en: data.settings.banner_message_en || '',
            banner_message_ar: data.settings.banner_message_ar || '',
            banner_link: data.settings.banner_link || '',
            banner_link_label_en: data.settings.banner_link_label_en || 'Read More',
            banner_link_label_ar: data.settings.banner_link_label_ar || 'اقرأ المزيد',
          });
        }
      } catch (e) {
        console.log('Fetch settings error:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  function set(field: string, value: any) {
    setForm((prev: any) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      const payload = {
        ...form,
        stats_verified: form.stats_verified === true,
        stats_happy_clients: parseInt(form.stats_happy_clients) || 0,
        stats_trips_organized: parseInt(form.stats_trips_organized) || 0,
        stats_years_experience: parseInt(form.stats_years_experience) || 0,
        stats_destinations: parseInt(form.stats_destinations) || 0,
      };
      const res = await adminFetch('/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setSuccess('Settings saved successfully! Changes will appear on the site immediately.');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to save settings.');
      }
    } catch (e) {
      setError(`Network error: ${e}`);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <svg className="animate-spin h-6 w-6 text-[#D32F2F]" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h2 className="text-lg font-semibold text-gray-800">Site Settings</h2>
        <p className="text-sm text-gray-500">Manage the website from focused groups instead of one long form.</p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-2 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row" role="tablist" aria-label="Site settings groups">
          {SETTINGS_TABS.map((tab) => {
            const selected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 rounded-lg px-4 py-3 text-left transition-colors ${selected ? 'bg-[#D32F2F] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <span className="block text-sm font-semibold">{tab.label}</span>
                <span className={`mt-0.5 block text-xs ${selected ? 'text-white/80' : 'text-gray-400'}`}>{tab.description}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="sticky top-3 z-10 flex flex-col gap-3 rounded-xl border border-gray-200 bg-white/95 p-3 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <div className="min-h-5 text-sm" aria-live="polite">
          {error && <span className="flex items-center gap-2 text-red-700"><AlertCircle size={16} className="shrink-0" />{error}</span>}
          {success && <span className="flex items-center gap-2 text-green-700"><CheckCircle size={16} className="shrink-0" />{success}</span>}
          {!error && !success && <span className="text-gray-500">Changes are saved across all Settings groups</span>}
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex shrink-0 items-center justify-center gap-2 bg-[#D32F2F] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#B71C1C] disabled:opacity-50 rounded-lg"
        >
          <Save size={16} />
          {saving ? 'Saving...' : 'Save All Settings'}
        </button>
      </div>

      {activeTab === 'business' && (
        <div className="space-y-5" role="tabpanel">
      {/* Company */}
      <Section title="Company Information" icon={Globe}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Company Name (English)" value={form.company_name_en} onChange={(v: string) => set('company_name_en', v)} placeholder="Al-Etihad for Travel & Tourism" />
          <Field label="Company Name (Arabic)" value={form.company_name_ar} onChange={(v: string) => set('company_name_ar', v)} placeholder="الاتحاد للسفر والسياحة" dir="rtl" />
          <Field label="Tagline (English)" value={form.tagline_en} onChange={(v: string) => set('tagline_en', v)} placeholder="Your trusted travel partner..." />
          <Field label="Tagline (Arabic)" value={form.tagline_ar} onChange={(v: string) => set('tagline_ar', v)} placeholder="شريكك الموثوق..." dir="rtl" />
        </div>
      </Section>

      {/* Contact */}
      <Section title="Contact Details" icon={Phone}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="WhatsApp Number"
            value={form.whatsapp}
            onChange={(v: string) => set('whatsapp', v)}
            placeholder="966560074845"
            hint="Include country code, no + sign (e.g. 966501234567)"
          />
          <Field label="Email Address" value={form.email} onChange={(v: string) => set('email', v)} type="email" placeholder="info@etihadtours.com" />
          <Field label="Landline" value={form.phone} onChange={(v: string) => set('phone', v)} placeholder="+966 14 000 0000" hint="General landline number shown in footer & contact page" />
        </div>
      </Section>
      </div>
      )}

      {activeTab === 'channels' && (
        <div className="space-y-5" role="tabpanel">
      {/* Social Media */}
      <Section title="Social Media Links" icon={Share2}>
        <p className="text-xs text-gray-400 mb-4">Enter the full URL for each platform, then toggle it on to show it in the footer. You can save a URL but keep the toggle off to hide it temporarily.</p>
        <div className="space-y-4">
          {[
            { label: 'Instagram', urlKey: 'social_instagram', enabledKey: 'social_instagram_enabled', placeholder: 'https://instagram.com/etihadtours' },
            { label: 'X (Twitter)', urlKey: 'social_twitter', enabledKey: 'social_twitter_enabled', placeholder: 'https://x.com/etihadtours' },
            { label: 'Facebook', urlKey: 'social_facebook', enabledKey: 'social_facebook_enabled', placeholder: 'https://facebook.com/etihadtours' },
            { label: 'TikTok', urlKey: 'social_tiktok', enabledKey: 'social_tiktok_enabled', placeholder: 'https://tiktok.com/@etihadtours' },
            { label: 'Snapchat', urlKey: 'social_snapchat', enabledKey: 'social_snapchat_enabled', placeholder: 'https://snapchat.com/add/etihadtours' },
          ].map(({ label, urlKey, enabledKey, placeholder }) => (
            <div key={urlKey} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex-1 min-w-0">
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input
                  type="url"
                  value={form[urlKey]}
                  onChange={e => set(urlKey, e.target.value)}
                  placeholder={placeholder}
                  dir="ltr"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/20 focus:border-[#D32F2F] transition-all bg-white"
                />
              </div>
              <div className="flex flex-col items-center gap-1 shrink-0">
                <span className="text-xs text-gray-400">Show</span>
                <button
                  type="button"
                  dir="ltr"
                  onClick={() => set(enabledKey, !form[enabledKey])}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${form[enabledKey] ? 'bg-[#D32F2F]' : 'bg-gray-200'}`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out ${form[enabledKey] ? 'translate-x-5' : 'translate-x-0'}`}
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Section>
      </div>
      )}

      {activeTab === 'business' && (
        <div className="space-y-5" role="tabpanel">
      {/* Address */}
      <Section title="Office Address" icon={MapPin}>
        <p className="text-xs text-gray-400 mb-4">
          Locations belong to the company group. Set each office label independently; do not infer headquarters or branch status from the order.
        </p>
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Location 1 — Arar</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Address (English)" value={form.address_en} onChange={(v: string) => set('address_en', v)} placeholder="King Abdulaziz Road, Alkhalidiyah, Arar 73211, Saudi Arabia" />
              <Field label="Address (Arabic)" value={form.address_ar} onChange={(v: string) => set('address_ar', v)} placeholder="طريق الملك عبدالعزيز، الخالدية، عرعر 73211" dir="rtl" />
              <Field label="Office label (Arabic)" value={form.office_arar_label_ar} onChange={(v: string) => set('office_arar_label_ar', v)} />
              <Field label="Office label (English)" value={form.office_arar_label_en} onChange={(v: string) => set('office_arar_label_en', v)} />
              <Field label="Google Maps URL" value={form.office_arar_maps_url} onChange={(v: string) => set('office_arar_maps_url', v)} type="url" />
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Location 2 — Riyadh <span className="font-normal normal-case text-gray-400">(optional)</span></p>
            <p className="text-xs text-gray-400 mb-3">Leave empty to hide this location from the Contact Us page.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Address (English)" value={form.address2_en} onChange={(v: string) => set('address2_en', v)} placeholder="e.g. Al Olaya District, Riyadh 12333, Saudi Arabia" />
              <Field label="Address (Arabic)" value={form.address2_ar} onChange={(v: string) => set('address2_ar', v)} placeholder="مثال: حي العليا، الرياض 12333" dir="rtl" />
              <Field label="Office label (Arabic)" value={form.office_riyadh_label_ar} onChange={(v: string) => set('office_riyadh_label_ar', v)} />
              <Field label="Office label (English)" value={form.office_riyadh_label_en} onChange={(v: string) => set('office_riyadh_label_en', v)} />
              <Field label="Riyadh office phone" value={form.office_riyadh_phone} onChange={(v: string) => set('office_riyadh_phone', v)} />
              <Field label="Google Maps URL" value={form.office_riyadh_maps_url} onChange={(v: string) => set('office_riyadh_maps_url', v)} type="url" />
            </div>
          </div>
        </div>
      </Section>

      {/* Working Hours */}
      <Section title="Working Hours" icon={Clock}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Working Hours (English)" value={form.working_hours_en} onChange={(v: string) => set('working_hours_en', v)} placeholder="Sun–Thu: 9:00 AM – 6:00 PM" />
          <Field label="Working Hours (Arabic)" value={form.working_hours_ar} onChange={(v: string) => set('working_hours_ar', v)} placeholder="الأحد–الخميس: ٩ ص – ٦ م" dir="rtl" />
        </div>
      </Section>
      </div>
      )}

      {activeTab === 'website' && (
        <div className="space-y-5" role="tabpanel">
      {/* Stats */}
      <Section title="Statistics (Homepage Counter)" icon={BarChart3}>
        <label className="flex items-center gap-2 text-sm text-gray-700 mb-4"><input type="checkbox" checked={!!form.stats_verified} onChange={e => set('stats_verified', e.target.checked)} /> Show marketing statistics on website (currently provisional — verify all figures before final public release)</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Field label="Happy Clients" value={form.stats_happy_clients} onChange={(v: string) => set('stats_happy_clients', v)} type="number" placeholder="12500" />
          <Field label="Trips Organized" value={form.stats_trips_organized} onChange={(v: string) => set('stats_trips_organized', v)} type="number" placeholder="3800" />
          <Field label="Years Experience" value={form.stats_years_experience} onChange={(v: string) => set('stats_years_experience', v)} type="number" placeholder="15" />
          <Field label="Destinations" value={form.stats_destinations} onChange={(v: string) => set('stats_destinations', v)} type="number" placeholder="65" />
        </div>
      </Section>

      {/* Homepage Features */}
      <Section title="Homepage Features" icon={Layout}>
        <div className="divide-y divide-gray-50">
          <Toggle
            label="Popular Destinations Quick-Select"
            description="Show destination chip buttons below the hero search bar for faster browsing. Visitors can tap a chip to jump directly to that destination."
            checked={!!form.show_popular_destinations}
            onChange={(v) => set('show_popular_destinations', v as any)}
          />
        </div>
      </Section>
      </div>
      )}

      {activeTab === 'channels' && (
        <div className="space-y-5" role="tabpanel">
      {/* WhatsApp */}
      <Section title="WhatsApp Button" icon={MessageCircle}>
        <div className="divide-y divide-gray-50">
          <Toggle
            label="Show WhatsApp Floating Button"
            description="Display the green WhatsApp chat button on all pages of the site. Also controls the WhatsApp links inside the Contact Us page."
            checked={!!form.show_whatsapp_button}
            onChange={(v) => set('show_whatsapp_button', v as any)}
          />
        </div>
      </Section>

      {/* Google measurement and search ownership */}
      <Section title="Google Measurement & Search" icon={BarChart3}>
        <div className="space-y-4">
          <Field
            label="Google Tag ID"
            value={form.google_tag_id}
            onChange={(v: string) => set('google_tag_id', v)}
            placeholder="G-XXXXXXXXXX or GTM-XXXXXXX"
            hint="Paste your Google Analytics Measurement ID (G-...) or Google Tag Manager Container ID (GTM-...). Leave blank to disable Google tracking."
          />
          <Field
            label="Search Console Verification"
            value={form.search_console_verification}
            onChange={(v: string) => set('search_console_verification', v)}
            placeholder="Verification code only"
            hint="Optional. Paste only the verification code from Google Search Console's HTML tag method, not the full <meta> tag. DNS verification remains the preferred ownership method."
          />
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg p-3">
            The dashboard reports WhatsApp click signals. Google Analytics remains the source for traffic, users, and campaign reporting.
          </p>
        </div>
      </Section>
      </div>
      )}

      {activeTab === 'website' && (
        <div className="space-y-5" role="tabpanel">
      {/* Search Bar Tabs */}
      <Section title="Search Bar Tabs" icon={Search}>
        <p className="text-xs text-gray-400 mb-3">Enable or disable search tabs shown on the homepage. Services marked "Coming Soon" can be connected to providers later.</p>
        <div className="divide-y divide-gray-50">
          <Toggle
            label="Flights (الطيران)"
            description="Flight search tab — will be connected to an airline API/GDS when ready."
            checked={!!form.search_tab_flights}
            onChange={(v) => set('search_tab_flights', v as any)}
          />
          <Toggle
            label="Hotels (الفنادق)"
            description="Hotel booking search — will be connected to a hotel API when ready."
            checked={!!form.search_tab_hotels}
            onChange={(v) => set('search_tab_hotels', v as any)}
          />
          <Toggle
            label="Chalets (شاليهات)"
            description="Chalet/vacation rental search — will be connected to a provider when ready."
            checked={!!form.search_tab_chalets}
            onChange={(v) => set('search_tab_chalets', v as any)}
          />
          <Toggle
            label="e-Visa (تأشيرة إلكترونية)"
            description="Electronic visa application search — will be connected to a visa API when ready."
            checked={!!form.search_tab_evisa}
            onChange={(v) => set('search_tab_evisa', v as any)}
          />
          <Toggle
            label="Destinations (الوجهات)"
            description="Destination discovery search — will be connected to a content provider when ready."
            checked={!!form.search_tab_destinations}
            onChange={(v) => set('search_tab_destinations', v as any)}
          />
          <Toggle
            label="Offers / Packages (العروض)"
            description="Travel package search — connected to your packages database."
            checked={!!form.search_tab_packages}
            onChange={(v) => set('search_tab_packages', v as any)}
          />
        </div>
      </Section>

      {/* Top Banner */}
      <Section title="Top Banner" icon={Megaphone}>
        <p className="text-xs text-gray-400 mb-4">
          Display an announcement banner at the very top of the website. Use it for urgent updates, government notices, promotions, or important alerts.
        </p>
        <div className="divide-y divide-gray-50 mb-5">
          <Toggle
            label="Enable Top Banner"
            description="Show the banner across all pages of the website. Toggle off to hide it without deleting the content."
            checked={!!form.banner_enabled}
            onChange={(v) => set('banner_enabled', v as any)}
          />
        </div>
        <div className={`space-y-4 transition-opacity duration-200 ${form.banner_enabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message (English)</label>
              <textarea
                value={form.banner_message_en}
                onChange={e => set('banner_message_en', e.target.value)}
                placeholder="e.g. Hajj season packages now available — limited seats!"
                rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/20 focus:border-[#D32F2F] transition-all resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message (Arabic)</label>
              <textarea
                value={form.banner_message_ar}
                onChange={e => set('banner_message_ar', e.target.value)}
                dir="rtl"
                placeholder="مثال: باقات موسم الحج متاحة الآن — مقاعد محدودة!"
                rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/20 focus:border-[#D32F2F] transition-all resize-none"
              />
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Link / "Read More" Button <span className="font-normal normal-case text-gray-400">(optional)</span></p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-3">
                <Field
                  label="Link URL"
                  value={form.banner_link}
                  onChange={(v: string) => set('banner_link', v)}
                  placeholder="e.g. /packages or https://example.com/offer"
                  hint="Use a relative path like /packages for internal pages, or a full URL for external links. Leave empty to show no button."
                />
              </div>
              <Field label="Button Label (English)" value={form.banner_link_label_en} onChange={(v: string) => set('banner_link_label_en', v)} placeholder="Read More" />
              <Field label="Button Label (Arabic)" value={form.banner_link_label_ar} onChange={(v: string) => set('banner_link_label_ar', v)} placeholder="اقرأ المزيد" dir="rtl" />
            </div>
          </div>
          {/* Live preview */}
          {(form.banner_message_en || form.banner_message_ar) && (
            <div className="mt-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Preview</p>
              <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-[#D32F2F] rounded-lg text-white text-sm">
                <span className="flex-1 text-center font-medium">{form.banner_message_en || form.banner_message_ar}</span>
                {form.banner_link && (
                  <span className="shrink-0 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap">
                    {form.banner_link_label_en || 'Read More'} →
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </Section>
      </div>
      )}
    </div>
  );
}