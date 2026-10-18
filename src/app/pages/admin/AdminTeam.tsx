import { useState, useEffect } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { Plus, Trash2, Check, X, Edit2 } from 'lucide-react';
import { ImageUploadField } from '../../components/ImageUploadField';

const EMPTY_MEMBER = {
  name_en: '',
  name_ar: '',
  role_en: '',
  role_ar: '',
  photo_url: '',
  display_order: 1,
  approval_status: 'pending',
};

export function AdminTeam() {
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
    } catch (e) {
      console.log('Add member error:', e);
    }
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
    } catch (e) {
      console.log('Update member error:', e);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Remove this team member?')) return;
    try {
      const res = await adminFetch(`/admin/team/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setTeam(prev => prev.filter(m => m.id !== id));
        showToast('Team member removed.');
      }
    } catch (e) {
      console.log('Delete member error:', e);
    }
  }

  function startEdit(member: any) {
    setEditingId(member.id);
    setEditData({ ...member });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditData({});
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
              <option value="pending">Pending — hidden</option>
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
          <button
            type="button"
            onClick={onSave}
            className="flex items-center gap-1.5 bg-[#D32F2F] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#B71C1C] transition-colors"
          >
            <Check size={14} /> {saveLabel}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-1.5 border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <X size={14} /> Cancel
          </button>
        </div>
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
          <h2 className="text-lg font-semibold text-gray-800">Team Members</h2>
          <p className="text-sm text-gray-500">{team.length} members</p>
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

      {/* Add form */}
      {showAdd && (
        <MemberForm
          data={newMember}
          onChange={setNewMember}
          onSave={handleAdd}
          onCancel={() => { setShowAdd(false); setNewMember(EMPTY_MEMBER); }}
          saveLabel="Add Member"
        />
      )}

      {/* Team grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {team.map(member => (
          <div key={member.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {editingId === member.id ? (
              <div className="p-4">
                <MemberForm
                  data={editData}
                  onChange={setEditData}
                  onSave={() => handleUpdate(member.id)}
                  onCancel={cancelEdit}
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
                      onClick={() => startEdit(member)}
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
            <p className="text-sm">No team members yet. Add your first team member!</p>
          </div>
        )}
      </div>
    </div>
  );
}