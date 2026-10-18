import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { ChevronLeft, Plus, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import { ImageUploadField } from '../../components/ImageUploadField';

interface ItineraryItem { day: number; title: string; description: string; }

const EMPTY_FORM = {
  title_en: '', title_ar: '',
  description_en: '', description_ar: '',
  destination_en: '', destination_ar: '',
  price: '',
  currency: 'SAR',
  duration_days: '',
  departure_city: '',
  max_travelers: '',
  travel_dates: '',
  availability: '',
  expiry_date: '',
  seo_title_en: '',
  seo_title_ar: '',
  seo_description_en: '',
  seo_description_ar: '',
  cover_image_url: '',
  gallery_urls: [''],
  includes_en: [''],
  includes_ar: [''],
  excludes_en: [''],
  excludes_ar: [''],
  trip_type: 'external',
  is_featured: false,
  status: 'draft',
  flag: '',
  slug: '',
  itinerary_en: [{ day: 1, title: '', description: '' }] as ItineraryItem[],
  itinerary_ar: [{ day: 1, title: '', description: '' }] as ItineraryItem[],
};

function InputField({ label, value, onChange, placeholder = '', type = 'text', required = false }: any) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/20 focus:border-[#D32F2F] transition-all"
      />
    </div>
  );
}

function TextareaField({ label, value, onChange, placeholder = '', rows = 3, dir = 'ltr' }: any) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        dir={dir}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/20 focus:border-[#D32F2F] transition-all resize-y"
      />
    </div>
  );
}

function ListField({ label, items, onChange, placeholder = '', dir = 'ltr' }: any) {
  function update(i: number, val: string) {
    const next = [...items];
    next[i] = val;
    onChange(next);
  }
  function add() { onChange([...items, '']); }
  function remove(i: number) {
    if (items.length <= 1) return;
    onChange(items.filter((_: any, idx: number) => idx !== i));
  }
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="space-y-2">
        {items.map((item: string, i: number) => (
          <div key={i} className="flex gap-2">
            <input
              type="text"
              value={item}
              onChange={e => update(i, e.target.value)}
              placeholder={placeholder}
              dir={dir}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/20 focus:border-[#D32F2F]"
            />
            <button
              type="button"
              onClick={() => remove(i)}
              className="p-2 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={add}
          className="flex items-center gap-1.5 text-xs text-[#D32F2F] hover:text-[#B71C1C] font-medium mt-1"
        >
          <Plus size={14} /> Add item
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sm:p-6">
      <h3 className="font-semibold text-gray-800 mb-4 pb-3 border-b border-gray-100">{title}</h3>
      {children}
    </div>
  );
}

export function AdminPackageForm({ packageId, onClose, onSaved }: {
  packageId?: string;
  onClose?: () => void;
  onSaved?: (pkg: any) => void;
} = {}) {
  const params = useParams();
  const id = packageId || params.id;
  const isEdit = !!id;
  const isOverlay = Boolean(onClose);
  const navigate = useNavigate();
  const { adminFetch } = useAdminAuth();
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [loadError, setLoadError] = useState('');
  const [loadedPackageId, setLoadedPackageId] = useState<string | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!isEdit) {
      setFetching(false);
      setLoadError('');
      setLoadedPackageId(null);
      return;
    }
    let active = true;
    setFetching(true);
    setLoadError('');
    setLoadedPackageId(null);
    setForm(EMPTY_FORM);
    adminFetch(`/admin/packages`)
      .then(async response => {
        if (!response.ok) throw new Error(`Package loading failed (${response.status})`);
        return response.json();
      })
      .then(data => {
        const pkg = (data.packages || []).find((p: any) => p.id === id);
        if (!pkg) throw new Error('Package not found or no longer accessible');
        if (!active) return;
        setForm({
          title_en: pkg.title_en || '',
          title_ar: pkg.title_ar || '',
          description_en: pkg.description_en || '',
          description_ar: pkg.description_ar || '',
          destination_en: pkg.destination_en || '',
          destination_ar: pkg.destination_ar || '',
          price: pkg.price?.toString() || '',
          currency: pkg.currency || 'SAR',
          duration_days: pkg.duration_days?.toString() || '',
          departure_city: pkg.departure_city || '',
          max_travelers: pkg.max_travelers?.toString() || '',
          travel_dates: pkg.travel_dates || '',
          availability: pkg.availability || '',
          expiry_date: pkg.expiry_date || '',
          seo_title_en: pkg.seo_title_en || '',
          seo_title_ar: pkg.seo_title_ar || '',
          seo_description_en: pkg.seo_description_en || '',
          seo_description_ar: pkg.seo_description_ar || '',
          cover_image_url: pkg.cover_image_url || '',
          gallery_urls: pkg.gallery_urls?.length ? pkg.gallery_urls : [''],
          includes_en: pkg.includes_en?.length ? pkg.includes_en : [''],
          includes_ar: pkg.includes_ar?.length ? pkg.includes_ar : [''],
          excludes_en: pkg.excludes_en?.length ? pkg.excludes_en : [''],
          excludes_ar: pkg.excludes_ar?.length ? pkg.excludes_ar : [''],
          trip_type: pkg.trip_type || 'external',
          is_featured: pkg.is_featured || false,
          status: pkg.status || (pkg.is_active ? 'published' : 'draft'),
          flag: pkg.flag || '',
          slug: pkg.slug || '',
          itinerary_en: pkg.itinerary_en?.length ? pkg.itinerary_en : [{ day: 1, title: '', description: '' }],
          itinerary_ar: pkg.itinerary_ar?.length ? pkg.itinerary_ar : [{ day: 1, title: '', description: '' }],
        });
        setLoadedPackageId(id || null);
      })
      .catch(e => {
        if (active) setLoadError(e instanceof Error ? e.message : 'Package could not be loaded');
      })
      .finally(() => { if (active) setFetching(false); });
    return () => { active = false; };
  }, [id, isEdit, loadAttempt]);

  function set(field: string, value: any) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function updateItinerary(lang: 'en' | 'ar', idx: number, field: 'title' | 'description', value: string) {
    const key = lang === 'en' ? 'itinerary_en' : 'itinerary_ar';
    const updated = [...form[key]];
    updated[idx] = { ...updated[idx], [field]: value };
    set(key, updated);
  }

  function addItinerary(lang: 'en' | 'ar') {
    const key = lang === 'en' ? 'itinerary_en' : 'itinerary_ar';
    const current = form[key];
    set(key, [...current, { day: current.length + 1, title: '', description: '' }]);
  }

  function removeItinerary(lang: 'en' | 'ar', idx: number) {
    const key = lang === 'en' ? 'itinerary_en' : 'itinerary_ar';
    if (form[key].length <= 1) return;
    const updated = form[key].filter((_: any, i: number) => i !== idx)
      .map((item: ItineraryItem, i: number) => ({ ...item, day: i + 1 }));
    set(key, updated);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (fetching || loadError) return;
    if (isEdit && loadedPackageId !== id) {
      setError('Package data is not ready. Reload the editor before saving.');
      return;
    }

    if (form.status === 'archived') {
      setError('Archived packages cannot be edited. Restore a previous version first.');
      return;
    }

    if (!form.title_en || !form.price || !form.duration_days) {
      setError('Please fill in all required fields (Title EN, Price, Duration).');
      return;
    }

    setLoading(true);
    const payload = {
      ...form,
      price: parseFloat(form.price) || 0,
      duration_days: parseInt(form.duration_days) || 1,
      max_travelers: parseInt(form.max_travelers) || 20,
      gallery_urls: form.gallery_urls.filter(Boolean),
      includes_en: form.includes_en.filter(Boolean),
      includes_ar: form.includes_ar.filter(Boolean),
      excludes_en: form.excludes_en.filter(Boolean),
      excludes_ar: form.excludes_ar.filter(Boolean),
      itinerary_en: form.itinerary_en.filter(i => i.title),
      itinerary_ar: form.itinerary_ar.filter(i => i.title),
    };

    try {
      const res = isEdit
        ? await adminFetch(`/admin/packages/${id}`, { method: 'PUT', body: JSON.stringify(payload) })
        : await adminFetch('/admin/packages', { method: 'POST', body: JSON.stringify(payload) });

      if (res.ok) {
        const data = await res.json();
        setSuccess(isEdit ? 'Package updated successfully!' : 'Package created successfully!');
        onSaved?.(data.package);
        if (onClose) {
          setTimeout(onClose, 450);
        } else {
          setTimeout(() => navigate('/admin/packages'), 1500);
        }
      } else {
        const data = await res.json();
        const detail = Array.isArray(data.details) ? data.details.map((item: any) => item.message).join(' ') : '';
        setError(detail || data.error || 'An error occurred. Please try again.');
      }
    } catch (err) {
      setError(`Network error: ${err}`);
    } finally {
      setLoading(false);
    }
  }

  if (fetching || loadError) return (
    <div className="flex flex-col items-center justify-center gap-4 min-h-64 p-6 text-center">
      {fetching ? (
        <svg className="animate-spin h-6 w-6 text-[#D32F2F]" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
      ) : (
        <>
          <div className="flex items-center gap-2 text-red-700"><AlertCircle size={18} /><span>{loadError}</span></div>
          <div className="flex items-center gap-2"><button type="button" onClick={() => { setLoadError(''); setLoadAttempt(value => value + 1); }} className="px-4 py-2 rounded-lg bg-gray-800 text-white text-sm font-medium">Retry</button>{onClose && <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium">Close</button>}</div>
        </>
      )}
    </div>
  );

  return (
    <form id="package-form" onSubmit={handleSubmit} className={`space-y-5 pb-24 ${isOverlay ? '' : 'max-w-4xl'}`}>
      {/* Header */}
      <div className="flex items-center gap-3">
        {isOverlay ? (
          <button type="button" onClick={onClose} aria-label="Close package editor" className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
            <ChevronLeft size={20} />
          </button>
        ) : (
          <Link to="/admin/packages" className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
            <ChevronLeft size={20} />
          </Link>
        )}
        <div>
          <h2 className="text-lg font-semibold text-gray-800">{isEdit ? 'Edit Package' : 'Add New Package'}</h2>
          <p className="text-sm text-gray-500">{isEdit ? 'Update package details' : 'Create a new travel package'}</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          <AlertCircle size={16} className="shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm">
          <CheckCircle size={16} className="shrink-0" />
          {success}
        </div>
      )}

      {/* Basic Info */}
      <Section title="Basic Information">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField label="Title (English)" value={form.title_en} onChange={(v: string) => set('title_en', v)} placeholder="e.g. Luxury Maldives Escape" required />
          <InputField label="Title (Arabic)" value={form.title_ar} onChange={(v: string) => set('title_ar', v)} placeholder="العنوان بالعربية" />
          <InputField label="Destination (English)" value={form.destination_en} onChange={(v: string) => set('destination_en', v)} placeholder="e.g. Maldives" required />
          <InputField label="Destination (Arabic)" value={form.destination_ar} onChange={(v: string) => set('destination_ar', v)} placeholder="الوجهة بالعربية" />
          <InputField label="Price (SAR)" value={form.price} onChange={(v: string) => set('price', v)} type="number" placeholder="e.g. 8500" required />
          <InputField label="Duration (Days)" value={form.duration_days} onChange={(v: string) => set('duration_days', v)} type="number" placeholder="e.g. 7" required />
          <InputField label="Departure City" value={form.departure_city} onChange={(v: string) => set('departure_city', v)} placeholder="e.g. Riyadh" />
          <InputField label="Max Travelers" value={form.max_travelers} onChange={(v: string) => set('max_travelers', v)} type="number" placeholder="e.g. 20" />
          <InputField label="Travel Dates" value={form.travel_dates} onChange={(v: string) => set('travel_dates', v)} placeholder="e.g. 12–16 October 2026" />
          <InputField label="Availability" value={form.availability} onChange={(v: string) => set('availability', v)} placeholder="e.g. 8 seats remaining" />
          <InputField label="Expiry Date" value={form.expiry_date} onChange={(v: string) => set('expiry_date', v)} type="date" />
          <InputField label="Flag Emoji" value={form.flag} onChange={(v: string) => set('flag', v)} placeholder="e.g. 🇲🇻" />
          <InputField label="Slug (URL)" value={form.slug} onChange={(v: string) => set('slug', v)} placeholder="auto-generated from title" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trip Type</label>
            <select
              value={form.trip_type}
              onChange={e => set('trip_type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/20"
            >
              <option value="external">International</option>
              <option value="internal">Domestic</option>
            </select>
          </div>
          <div className="flex flex-col gap-3 pt-1">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Publication status</label>
              <select
                value={form.status}
                onChange={e => set('status', e.target.value)}
                disabled={form.status === 'archived'}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/20 disabled:bg-gray-100"
              >
                <option value="draft">Draft — not public</option>
                <option value="published">Published — visible on site</option>
                {form.status === 'archived' && <option value="archived">Archived — restore from history</option>}
              </select>
              {form.status === 'archived' && <p className="mt-1 text-xs text-amber-700">Archived packages must be restored from version history before editing</p>}
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={e => set('is_featured', e.target.checked)}
                disabled={form.status === 'archived'}
                className="w-4 h-4 rounded accent-[#D32F2F] disabled:opacity-50"
              />
              <span className="text-sm text-gray-700">Featured on homepage</span>
            </label>
          </div>
        </div>
      </Section>

      {/* Descriptions */}
      <Section title="Descriptions">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextareaField label="Description (English)" value={form.description_en} onChange={(v: string) => set('description_en', v)} placeholder="Describe the package in English..." />
          <TextareaField label="Description (Arabic)" value={form.description_ar} onChange={(v: string) => set('description_ar', v)} placeholder="وصف الرحلة بالعربية..." dir="rtl" />
        </div>
      </Section>

      <Section title="SEO">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField label="SEO Title (English)" value={form.seo_title_en} onChange={(v: string) => set('seo_title_en', v)} placeholder="Optional page title" />
          <InputField label="SEO Title (Arabic)" value={form.seo_title_ar} onChange={(v: string) => set('seo_title_ar', v)} placeholder="عنوان الصفحة بالعربية" />
          <TextareaField label="SEO Description (English)" value={form.seo_description_en} onChange={(v: string) => set('seo_description_en', v)} placeholder="Optional search description" />
          <TextareaField label="SEO Description (Arabic)" value={form.seo_description_ar} onChange={(v: string) => set('seo_description_ar', v)} placeholder="وصف محرك البحث بالعربية" dir="rtl" />
        </div>
      </Section>

      {/* Images */}
      <Section title="Images">
        <ImageUploadField
          value={form.cover_image_url}
          onChange={(v: string) => set('cover_image_url', v)}
          label="Cover Image"
          hint="Recommended: 1200×800 px landscape. Auto-optimized on upload."
          previewClass="w-full h-32 object-cover rounded-lg border border-gray-200"
        />
        <div className="mt-4">
          <ListField label="Gallery Image URLs" items={form.gallery_urls} onChange={(v: string[]) => set('gallery_urls', v)} placeholder="https://..." />
        </div>
      </Section>

      {/* Includes / Excludes */}
      <Section title="Includes & Excludes">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <ListField label="Includes (English)" items={form.includes_en} onChange={(v: string[]) => set('includes_en', v)} placeholder="e.g. Round-trip flights" />
          <ListField label="Includes (Arabic)" items={form.includes_ar} onChange={(v: string[]) => set('includes_ar', v)} placeholder="مثال: رحلات جوية" dir="rtl" />
          <ListField label="Excludes (English)" items={form.excludes_en} onChange={(v: string[]) => set('excludes_en', v)} placeholder="e.g. Personal expenses" />
          <ListField label="Excludes (Arabic)" items={form.excludes_ar} onChange={(v: string[]) => set('excludes_ar', v)} placeholder="مثال: المصاريف الشخصية" dir="rtl" />
        </div>
      </Section>

      {/* Itinerary EN */}
      <Section title="Itinerary (English)">
        <div className="space-y-3">
          {form.itinerary_en.map((item, idx) => (
            <div key={idx} className="border border-gray-100 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-700">Day {item.day}</span>
                <button
                  type="button"
                  onClick={() => removeItinerary('en', idx)}
                  className="p-1 text-gray-400 hover:text-red-500"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="grid grid-cols-1 gap-2">
                <input
                  type="text"
                  value={item.title}
                  onChange={e => updateItinerary('en', idx, 'title', e.target.value)}
                  placeholder="Day title (e.g. Arrival & Welcome)"
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/20"
                />
                <textarea
                  value={item.description}
                  onChange={e => updateItinerary('en', idx, 'description', e.target.value)}
                  placeholder="Description of activities for this day..."
                  rows={2}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/20 resize-y"
                />
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => addItinerary('en')}
            className="flex items-center gap-2 text-sm text-[#D32F2F] hover:text-[#B71C1C] font-medium"
          >
            <Plus size={16} /> Add Day
          </button>
        </div>
      </Section>

      {/* Itinerary AR */}
      <Section title="Itinerary (Arabic)">
        <div className="space-y-3">
          {form.itinerary_ar.map((item, idx) => (
            <div key={idx} className="border border-gray-100 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-700">اليوم {item.day}</span>
                <button
                  type="button"
                  onClick={() => removeItinerary('ar', idx)}
                  className="p-1 text-gray-400 hover:text-red-500"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="grid grid-cols-1 gap-2">
                <input
                  type="text"
                  value={item.title}
                  onChange={e => updateItinerary('ar', idx, 'title', e.target.value)}
                  placeholder="عنوان اليوم"
                  dir="rtl"
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/20"
                />
                <textarea
                  value={item.description}
                  onChange={e => updateItinerary('ar', idx, 'description', e.target.value)}
                  placeholder="وصف نشاطات هذا اليوم..."
                  rows={2}
                  dir="rtl"
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/20 resize-y"
                />
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => addItinerary('ar')}
            className="flex items-center gap-2 text-sm text-[#D32F2F] hover:text-[#B71C1C] font-medium"
          >
            <Plus size={16} /> إضافة يوم
          </button>
        </div>
      </Section>

      <div className={`${isOverlay ? 'sticky bottom-0 z-30 -mx-1 border-t border-gray-200 bg-white/95 px-1 py-3' : 'fixed bottom-4 right-4 z-30 rounded-xl border border-gray-200 bg-white/95 p-3 shadow-lg backdrop-blur'} flex items-center gap-3`}>
        <button
          type="submit"
          disabled={loading || fetching || Boolean(loadError)}
          className="bg-[#D32F2F] hover:bg-[#B71C1C] text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition-colors disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save changes'}
        </button>
        {isOverlay ? (
          <button type="button" onClick={onClose} className="px-4 py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors">Cancel</button>
        ) : (
          <Link to="/admin/packages" className="px-4 py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors">
            Cancel
          </Link>
        )}
      </div>
    </form>
  );
}