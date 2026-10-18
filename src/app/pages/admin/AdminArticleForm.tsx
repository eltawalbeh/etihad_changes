import { useNavigate, useParams, Link } from 'react-router';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { ChevronLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { ImageUploadField } from '../../components/ImageUploadField';

const EMPTY_FORM = {
  title_en: '',
  title_ar: '',
  excerpt_en: '',
  excerpt_ar: '',
  content_en: '',
  content_ar: '',
  cover_image_url: '',
  category: 'destinations',
  author: '',
  is_published: true,
  slug: '',
  published_at: new Date().toISOString().split('T')[0],
};

function InputField({ label, value, onChange, placeholder = '', type = 'text', required = false, dir = 'ltr' }: any) {
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
        dir={dir}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/20 focus:border-[#D32F2F] transition-all"
      />
    </div>
  );
}

function TextareaField({ label, value, onChange, placeholder = '', rows = 4, dir = 'ltr', required = false }: any) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sm:p-6">
      <h3 className="font-semibold text-gray-800 mb-4 pb-3 border-b border-gray-100">{title}</h3>
      {children}
    </div>
  );
}

export function AdminArticleForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { adminFetch } = useAdminAuth();
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    setFetching(true);
    adminFetch('/admin/articles')
      .then(r => r.json())
      .then(data => {
        const art = (data.articles || []).find((a: any) => a.id === id);
        if (art) {
          setForm({
            title_en: art.title_en || '',
            title_ar: art.title_ar || '',
            excerpt_en: art.excerpt_en || '',
            excerpt_ar: art.excerpt_ar || '',
            content_en: art.content_en || '',
            content_ar: art.content_ar || '',
            cover_image_url: art.cover_image_url || '',
            category: art.category || 'destinations',
            author: art.author || '',
            is_published: art.is_published !== false,
            slug: art.slug || '',
            published_at: art.published_at ? art.published_at.split('T')[0] : new Date().toISOString().split('T')[0],
          });
        }
      })
      .catch(e => console.log('Fetch article error:', e))
      .finally(() => setFetching(false));
  }, [id, isEdit]);

  function set(field: string, value: any) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.title_en || !form.content_en) {
      setError('Please fill in all required fields (Title EN and Content EN).');
      return;
    }

    setLoading(true);
    const payload = {
      ...form,
      published_at: new Date(form.published_at).toISOString(),
    };

    try {
      const res = isEdit
        ? await adminFetch(`/admin/articles/${id}`, { method: 'PUT', body: JSON.stringify(payload) })
        : await adminFetch('/admin/articles', { method: 'POST', body: JSON.stringify(payload) });

      if (res.ok) {
        setSuccess(isEdit ? 'Article updated successfully!' : 'Article created successfully!');
        setTimeout(() => navigate('/admin/articles'), 1500);
      } else {
        const data = await res.json();
        setError(data.error || 'An error occurred. Please try again.');
      }
    } catch (err) {
      setError(`Network error: ${err}`);
    } finally {
      setLoading(false);
    }
  }

  if (fetching) {
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
    <form onSubmit={handleSubmit} className="space-y-5 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link to="/admin/articles" className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h2 className="text-lg font-semibold text-gray-800">{isEdit ? 'Edit Article' : 'Add New Article'}</h2>
          <p className="text-sm text-gray-500">{isEdit ? 'Update article content' : 'Create a new article or news post'}</p>
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

      {/* Meta */}
      <Section title="Article Details">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField label="Title (English)" value={form.title_en} onChange={(v: string) => set('title_en', v)} placeholder="Article title in English" required />
          <InputField label="Title (Arabic)" value={form.title_ar} onChange={(v: string) => set('title_ar', v)} placeholder="عنوان المقال" dir="rtl" />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={form.category}
              onChange={e => set('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/20"
            >
              <option value="destinations">Destinations</option>
              <option value="tips">Travel Tips</option>
              <option value="news">News</option>
              <option value="offers">Offers</option>
            </select>
          </div>
          <InputField label="Author" value={form.author} onChange={(v: string) => set('author', v)} placeholder="e.g. Editorial Team" />
          <InputField label="Publication Date" value={form.published_at} onChange={(v: string) => set('published_at', v)} type="date" />
          <InputField label="Slug (URL)" value={form.slug} onChange={(v: string) => set('slug', v)} placeholder="auto-generated from title" />
        </div>

        <div className="mt-4 flex items-center gap-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_published}
              onChange={e => set('is_published', e.target.checked)}
              className="w-4 h-4 rounded accent-[#D32F2F]"
            />
            <span className="text-sm text-gray-700">Published (visible on site)</span>
          </label>
        </div>
      </Section>

      {/* Cover */}
      <Section title="Cover Image">
        <ImageUploadField
          value={form.cover_image_url}
          onChange={(v: string) => set('cover_image_url', v)}
          label="Cover Image"
          hint="Recommended: 1200×630 px landscape image."
          previewClass="w-full h-40 object-cover rounded-xl border border-gray-200"
        />
      </Section>

      {/* Excerpts */}
      <Section title="Excerpts (Short Summary)">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextareaField label="Excerpt (English)" value={form.excerpt_en} onChange={(v: string) => set('excerpt_en', v)} placeholder="A short summary of the article..." rows={3} />
          <TextareaField label="Excerpt (Arabic)" value={form.excerpt_ar} onChange={(v: string) => set('excerpt_ar', v)} placeholder="ملخص قصير للمقال..." rows={3} dir="rtl" />
        </div>
      </Section>

      {/* Content */}
      <Section title="Full Content">
        <div className="grid grid-cols-1 gap-4">
          <TextareaField label="Content (English)" value={form.content_en} onChange={(v: string) => set('content_en', v)} placeholder="Full article content in English..." rows={8} required />
          <TextareaField label="Content (Arabic)" value={form.content_ar} onChange={(v: string) => set('content_ar', v)} placeholder="محتوى المقال الكامل بالعربية..." rows={8} dir="rtl" />
        </div>
      </Section>

      <div className="flex items-center gap-3 pb-6">
        <button
          type="submit"
          disabled={loading}
          className="bg-[#D32F2F] hover:bg-[#B71C1C] text-white px-8 py-2.5 rounded-lg font-semibold text-sm transition-colors disabled:opacity-50"
        >
          {loading ? 'Saving...' : (isEdit ? 'Update Article' : 'Create Article')}
        </button>
        <Link to="/admin/articles" className="px-6 py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors">
          Cancel
        </Link>
      </div>
    </form>
  );
}