import { useState, useEffect } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import {
  Save, AlertCircle, CheckCircle, Image, BookOpen,
  Star, Plus, Trash2, Check, X, Edit2, Users
} from 'lucide-react';
import { ImageUploadField } from '../../components/ImageUploadField';

// ─── Shared UI primitives ─────────────────────────────────────────────────────

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

function Field({ label, value, onChange, placeholder = '', dir = 'ltr', hint = '', multiline = false }: any) {
  const cls = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/20 focus:border-[#D32F2F] transition-all";
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          dir={dir}
          rows={4}
          className={cls + ' resize-none'}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          dir={dir}
          className={cls}
        />
      )}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

// ─── Page Content Tab ──────────────────────────────────────────────────────────

const ABOUT_DEFAULTS = {
  about_image_url: 'https://images.unsplash.com/photo-1650784854945-264d5b0b6b07?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=900',
  about_story_label_en: 'Our Story',
  about_story_label_ar: 'قصتنا',
  about_title_en: 'Al-Etihad Travel & Tourism',
  about_title_ar: 'مؤسسة الاتحاد للسفر والسياحة',
  about_story_en: 'We aim to deliver a seamless travel experience built around thoughtful planning, quality service, and attention to detail.',
  about_story_ar: 'نسعى إلى تقديم تجربة سفر متكاملة تجمع بين سهولة التخطيط وجودة الخدمة والاهتمام بالتفاصيل.',
  about_story2_en: 'Our services include travel arrangements, visa assistance, and coordinated travel solutions tailored to individuals and groups.',
  about_story2_ar: 'تشمل خدماتنا تنظيم الرحلات السياحية والمساعدة في إجراءات التأشيرات وتنسيق الخدمات المرتبطة بالسفر، بما يلبي احتياجات المسافرين من الأفراد والمجموعات.',
  about_values_title_en: 'Our Values',
  about_values_title_ar: 'قيمنا',
  about_value1_title_en: 'Excellence',
  about_value1_title_ar: 'التميز',
  about_value1_desc_en: 'We deliver top-tier service in every aspect of travel.',
  about_value1_desc_ar: 'نقدم خدمة عالية المستوى في كل جانب من جوانب السفر.',
  about_value2_title_en: 'Trust',
  about_value2_title_ar: 'الثقة',
  about_value2_desc_en: 'Transparency and integrity are at the heart of everything we do.',
  about_value2_desc_ar: 'الشفافية والنزاهة في صميم كل ما نقوم به.',
  about_value3_title_en: 'Innovation',
  about_value3_title_ar: 'الابتكار',
  about_value3_desc_en: 'We continuously evolve to exceed your expectations.',
  about_value3_desc_ar: 'نتطور باستمرار لنتجاوز توقعاتك دائماً.',
};

function PageContentTab() {
  const { adminFetch } = useAdminAuth();
  const [form, setForm] = useState<any>(ABOUT_DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const res = await adminFetch('/settings');
        const data = await res.json();
        if (data.settings) {
          const s = data.settings;
          setForm({
            about_image_url:       s.about_image_url        || ABOUT_DEFAULTS.about_image_url,
            about_story_label_en:  s.about_story_label_en   || ABOUT_DEFAULTS.about_story_label_en,
            about_story_label_ar:  s.about_story_label_ar   || ABOUT_DEFAULTS.about_story_label_ar,
            about_title_en:        s.about_title_en          || ABOUT_DEFAULTS.about_title_en,
            about_title_ar:        s.about_title_ar          || ABOUT_DEFAULTS.about_title_ar,
            about_story_en:        s.about_story_en          || ABOUT_DEFAULTS.about_story_en,
            about_story_ar:        s.about_story_ar          || ABOUT_DEFAULTS.about_story_ar,
            about_story2_en:       s.about_story2_en         || ABOUT_DEFAULTS.about_story2_en,
            about_story2_ar:       s.about_story2_ar         || ABOUT_DEFAULTS.about_story2_ar,
            about_values_title_en: s.about_values_title_en   || ABOUT_DEFAULTS.about_values_title_en,
            about_values_title_ar: s.about_values_title_ar   || ABOUT_DEFAULTS.about_values_title_ar,
            about_value1_title_en: s.about_value1_title_en   || ABOUT_DEFAULTS.about_value1_title_en,
            about_value1_title_ar: s.about_value1_title_ar   || ABOUT_DEFAULTS.about_value1_title_ar,
            about_value1_desc_en:  s.about_value1_desc_en    || ABOUT_DEFAULTS.about_value1_desc_en,
            about_value1_desc_ar:  s.about_value1_desc_ar    || ABOUT_DEFAULTS.about_value1_desc_ar,
            about_value2_title_en: s.about_value2_title_en   || ABOUT_DEFAULTS.about_value2_title_en,
            about_value2_title_ar: s.about_value2_title_ar   || ABOUT_DEFAULTS.about_value2_title_ar,
            about_value2_desc_en:  s.about_value2_desc_en    || ABOUT_DEFAULTS.about_value2_desc_en,
            about_value2_desc_ar:  s.about_value2_desc_ar    || ABOUT_DEFAULTS.about_value2_desc_ar,
            about_value3_title_en: s.about_value3_title_en   || ABOUT_DEFAULTS.about_value3_title_en,
            about_value3_title_ar: s.about_value3_title_ar   || ABOUT_DEFAULTS.about_value3_title_ar,
            about_value3_desc_en:  s.about_value3_desc_en    || ABOUT_DEFAULTS.about_value3_desc_en,
            about_value3_desc_ar:  s.about_value3_desc_ar    || ABOUT_DEFAULTS.about_value3_desc_ar,
          });
        }
      } catch (e) {
        console.log('Load about settings error:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function set(field: string, value: string) {
    setForm((prev: any) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    setError(''); setSuccess(''); setSaving(true);
    try {
      const res = await adminFetch('/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSuccess('About page content saved. Changes are live on the site.');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to save.');
      }
    } catch (e) {
      setError(`Network error: ${e}`);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <svg className="animate-spin h-6 w-6 text-[#D32F2F]" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      </div>
    );
  }

  const valueGroups = [
    { num: 1, labelEn: 'Value 1', icon: '⭐' },
    { num: 2, labelEn: 'Value 2', icon: '🎯' },
    { num: 3, labelEn: 'Value 3', icon: '💡' },
  ];

  return (
    <div className="space-y-5">
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          <AlertCircle size={16} className="shrink-0" /> {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm">
          <CheckCircle size={16} className="shrink-0" /> {success}
        </div>
      )}

      {/* Hero Image */}
      <Section title="Hero Image" icon={Image}>
        <p className="text-xs text-gray-400 mb-4">
          Upload a file or paste a URL. The image appears on the left side of the About Us hero section.
        </p>
        <ImageUploadField
          value={form.about_image_url}
          onChange={(v: string) => set('about_image_url', v)}
          label="Hero Image"
          hint="Use a high-resolution landscape image (recommended: at least 900×600 px)."
        />
      </Section>

      {/* Our Story */}
      <Section title="Our Story Section" icon={BookOpen}>
        <p className="text-xs text-gray-400 mb-4">
          This appears next to the hero image — the label above the heading, the page title, and the two body paragraphs.
        </p>

        {/* Section label */}
        <div className="p-4 bg-gray-50 rounded-lg mb-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Section Label (small caption above the title)</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Label (English)" value={form.about_story_label_en} onChange={(v: string) => set('about_story_label_en', v)} placeholder="Our Story" />
            <Field label="Label (Arabic)" value={form.about_story_label_ar} onChange={(v: string) => set('about_story_label_ar', v)} placeholder="قصتنا" dir="rtl" />
          </div>
        </div>

        {/* Page title / heading */}
        <div className="p-4 bg-gray-50 rounded-lg mb-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Page Title / Main Heading</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Title (English)" value={form.about_title_en} onChange={(v: string) => set('about_title_en', v)} placeholder="Al-Etihad Travel & Tourism" />
            <Field label="Title (Arabic)" value={form.about_title_ar} onChange={(v: string) => set('about_title_ar', v)} placeholder="مؤسسة الاتحاد للسفر والسياحة" dir="rtl" />
          </div>
        </div>

        {/* First paragraph */}
        <div className="p-4 bg-gray-50 rounded-lg mb-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">First Paragraph</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Paragraph (English)" value={form.about_story_en} onChange={(v: string) => set('about_story_en', v)} placeholder="We aim to deliver a seamless travel experience…" multiline />
            <Field label="Paragraph (Arabic)" value={form.about_story_ar} onChange={(v: string) => set('about_story_ar', v)} placeholder="نسعى إلى تقديم تجربة سفر متكاملة…" dir="rtl" multiline />
          </div>
        </div>

        {/* Second paragraph */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Second Paragraph</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Paragraph (English)" value={form.about_story2_en} onChange={(v: string) => set('about_story2_en', v)} placeholder="Our services include travel arrangements…" multiline />
            <Field label="Paragraph (Arabic)" value={form.about_story2_ar} onChange={(v: string) => set('about_story2_ar', v)} placeholder="تشمل خدماتنا تنظيم الرحلات السياحية…" dir="rtl" multiline />
          </div>
        </div>
      </Section>

      {/* Our Values */}
      <Section title="Our Values" icon={Star}>
        <p className="text-xs text-gray-400 mb-4">
          Three value cards shown in the middle of the About Us page. Edit the section title and each card's title and description.
        </p>

        {/* Values section title */}
        <div className="p-4 bg-gray-50 rounded-lg mb-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Section Title</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Title (English)" value={form.about_values_title_en} onChange={(v: string) => set('about_values_title_en', v)} placeholder="Our Values" />
            <Field label="Title (Arabic)" value={form.about_values_title_ar} onChange={(v: string) => set('about_values_title_ar', v)} placeholder="قيمنا" dir="rtl" />
          </div>
        </div>

        {/* Individual value cards */}
        <div className="space-y-4">
          {valueGroups.map(({ num, labelEn, icon }) => (
            <div key={num} className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                {icon} {labelEn}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field
                  label="Title (English)"
                  value={form[`about_value${num}_title_en`]}
                  onChange={(v: string) => set(`about_value${num}_title_en`, v)}
                  placeholder={num === 1 ? 'Excellence' : num === 2 ? 'Trust' : 'Innovation'}
                />
                <Field
                  label="Title (Arabic)"
                  value={form[`about_value${num}_title_ar`]}
                  onChange={(v: string) => set(`about_value${num}_title_ar`, v)}
                  placeholder={num === 1 ? 'التميز' : num === 2 ? 'الثقة' : 'الابتكار'}
                  dir="rtl"
                />
                <Field
                  label="Description (English)"
                  value={form[`about_value${num}_desc_en`]}
                  onChange={(v: string) => set(`about_value${num}_desc_en`, v)}
                  placeholder="Short description…"
                  multiline
                />
                <Field
                  label="Description (Arabic)"
                  value={form[`about_value${num}_desc_ar`]}
                  onChange={(v: string) => set(`about_value${num}_desc_ar`, v)}
                  placeholder="وصف قصير…"
                  dir="rtl"
                  multiline
                />
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Save */}
      <div className="pb-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-[#D32F2F] hover:bg-[#B71C1C] text-white px-8 py-2.5 rounded-lg font-semibold text-sm transition-colors disabled:opacity-50"
        >
          <Save size={16} />
          {saving ? 'Saving…' : 'Save About Page'}
        </button>
      </div>
    </div>
  );
}

// ─── Team Members Tab (moved from AdminTeam) ───────────────────────────────────

const EMPTY_MEMBER = { name_en: '', name_ar: '', role_en: '', role_ar: '', photo_url: '', display_order: 1, approval_status: 'pending' };

function TeamTab() {
  const { adminFetch, currentUser } = useAdminAuth();
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [showAdd, setShowAdd] = useState(false);
  const [newMember, setNewMember] = useState(EMPTY_MEMBER);
  const [toast, setToast] = useState('');

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  async function fetchTeam() {
    setLoading(true);
    try {
      const res = await adminFetch('/admin/team');
      const data = await res.json();
      setTeam(data.team || []);
    } catch (e) {
      console.log('Fetch team error:', e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchTeam(); }, []);

  async function handleAdd() {
    if (!newMember.name_en) { showToast('Please enter at least the English name.'); return; }
    try {
      const res = await adminFetch('/admin/team', {
        method: 'POST',
        body: JSON.stringify({ ...newMember, display_order: team.length + 1 }),
      });
      if (res.ok) {
        const data = await res.json();
        setTeam(prev => [...prev, data.member]);
        setNewMember(EMPTY_MEMBER);
        setShowAdd(false);
        showToast('Team member added.');
      }
    } catch (e) { console.log('Add member error:', e); }
  }

  async function handleUpdate(id: string) {
    try {
      const res = await adminFetch(`/admin/team/${id}`, {
        method: 'PUT',
        body: JSON.stringify(editData),
      });
      if (res.ok) {
        const data = await res.json();
        setTeam(prev => prev.map(m => m.id === id ? data.member : m));
        setEditingId(null);
        showToast('Team member updated.');
      }
    } catch (e) { console.log('Update member error:', e); }
  }

  async function handleDelete(id: string) {
    if (!confirm('Remove this team member?')) return;
    try {
      const res = await adminFetch(`/admin/team/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setTeam(prev => prev.filter(m => m.id !== id));
        showToast('Team member removed.');
      }
    } catch (e) { console.log('Delete member error:', e); }
  }

  function MemberForm({ data, onChange, onSave, onCancel, saveLabel }: any) {
    return (
      <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { field: 'name_en', label: 'Name (English)', placeholder: 'Full name', dir: 'ltr' },
            { field: 'name_ar', label: 'Name (Arabic)', placeholder: 'الاسم بالعربية', dir: 'rtl' },
            { field: 'role_en', label: 'Role (English)', placeholder: 'e.g. CEO', dir: 'ltr' },
            { field: 'role_ar', label: 'Role (Arabic)', placeholder: 'المنصب بالعربية', dir: 'rtl' },
          ].map(({ field, label, placeholder, dir }) => (
            <div key={field}>
              <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
              <input
                type="text"
                value={data[field] || ''}
                onChange={e => onChange({ ...data, [field]: e.target.value })}
                placeholder={placeholder}
                dir={dir}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/20"
              />
            </div>
          ))}
          <div className="sm:col-span-2">
            <ImageUploadField
              value={data.photo_url || ''}
              onChange={(url: string) => onChange({ ...data, photo_url: url })}
              label="Photo"
              hint="Square photo recommended. Min 200×200 px."
              previewClass="w-full h-40 object-cover rounded-xl border border-gray-200"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Approval status</label>
            <select value={data.approval_status || 'pending'} onChange={e => onChange({ ...data, approval_status: e.target.value })} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm">
              <option value="draft">Draft — hidden</option>
              <option value="pending">Pending review — hidden</option>
              {currentUser?.role === 'superadmin' && <option value="approved">Approved — public</option>}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Display Order</label>
            <input
              type="number"
              value={data.display_order || 1}
              onChange={e => onChange({ ...data, display_order: parseInt(e.target.value) || 1 })}
              min={1}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/20"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={onSave} className="flex items-center gap-1.5 bg-[#D32F2F] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#B71C1C] transition-colors">
            <Check size={14} /> {saveLabel}
          </button>
          <button type="button" onClick={onCancel} className="flex items-center gap-1.5 border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
            <X size={14} /> Cancel
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <svg className="animate-spin h-6 w-6 text-[#D32F2F]" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-800 text-white px-4 py-2 rounded-lg text-sm shadow-lg">{toast}</div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-sm text-gray-500">{team.length} member{team.length !== 1 ? 's' : ''} — they appear on the About Us page when at least one is added.</p>
        </div>
        {!showAdd && (
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 bg-[#D32F2F] hover:bg-[#B71C1C] text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors w-fit"
          >
            <Plus size={16} /> Add Team Member
          </button>
        )}
      </div>

      {showAdd && (
        <MemberForm
          data={newMember}
          onChange={setNewMember}
          onSave={handleAdd}
          onCancel={() => { setShowAdd(false); setNewMember(EMPTY_MEMBER); }}
          saveLabel="Add Member"
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {team.map(member => (
          <div key={member.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {editingId === member.id ? (
              <div className="p-4">
                <MemberForm
                  data={editData}
                  onChange={setEditData}
                  onSave={() => handleUpdate(member.id)}
                  onCancel={() => { setEditingId(null); setEditData({}); }}
                  saveLabel="Save Changes"
                />
              </div>
            ) : (
              <>
                <div className="relative">
                  <div
                    className="h-40 bg-cover bg-center bg-gray-200"
                    style={{ backgroundImage: member.photo_url ? `url(${member.photo_url})` : undefined }}
                  >
                    {!member.photo_url && (
                      <div className="h-full flex items-center justify-center">
                        <span className="text-4xl text-gray-400">👤</span>
                      </div>
                    )}
                  </div>
                  <div className="absolute top-2 right-2 flex gap-1">
                    <button
                      onClick={() => { setEditingId(member.id); setEditData({ ...member }); }}
                      className="p-1.5 bg-white/90 text-gray-600 hover:text-[#D32F2F] rounded-lg shadow-sm"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(member.id)}
                      className="p-1.5 bg-white/90 text-gray-600 hover:text-red-600 rounded-lg shadow-sm"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="absolute bottom-2 left-2">
                    <span className="text-xs bg-white/90 text-gray-600 px-2 py-0.5 rounded-full">#{member.display_order}</span>
                  </div>
                </div>
                <div className="p-4">
                  <p className="font-semibold text-gray-800">{member.name_en}</p>
                  <p className="text-sm text-gray-500">{member.role_en}</p>
                  <p className="text-sm text-gray-500 mt-1" dir="rtl">{member.name_ar} · {member.role_ar}</p>
                </div>
              </>
            )}
          </div>
        ))}

        {team.length === 0 && !showAdd && (
          <div className="col-span-full text-center py-12 text-gray-400 bg-white rounded-xl border border-gray-100">
            <Users size={32} className="mx-auto mb-3 text-gray-300" />
            <p className="text-sm">No team members yet.</p>
            <p className="text-xs mt-1 text-gray-300">The team section is hidden on the About Us page until you add at least one member.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main AdminAbout component ────────────────────────────────────────────────

type Tab = 'content' | 'team';

export function AdminAbout() {
  const [activeTab, setActiveTab] = useState<Tab>('content');

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: 'content', label: 'Page Content', icon: BookOpen },
    { key: 'team',    label: 'Team Members', icon: Users },
  ];

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h2 className="text-lg font-semibold text-gray-800">About Us Page</h2>
        <p className="text-sm text-gray-500">Edit the hero image, story, values, and team members shown on the About Us page.</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === key
                ? 'bg-white text-[#D32F2F] shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'content' && <PageContentTab />}
      {activeTab === 'team' && <TeamTab />}
    </div>
  );
}