import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Plus, Edit, Archive, History, Search, Eye, EyeOff, Star, Upload, CheckSquare, X, PanelRightOpen } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { EmojiFlag } from '../../components/EmojiFlag';
import { AdminPackageForm } from './AdminPackageForm';

const BULK_ACTIONS = [
  { value: 'publish', label: 'Publish selected' },
  { value: 'draft', label: 'Move selected to Draft' },
  { value: 'feature', label: 'Feature selected' },
  { value: 'unfeature', label: 'Remove from Featured' },
  { value: 'archive', label: 'Archive selected' },
] as const;

type BulkAction = typeof BULK_ACTIONS[number]['value'];

export function AdminPackages() {
  const { adminFetch, currentUser } = useAdminAuth();
  const canManageLifecycle = currentUser?.role === 'superadmin';
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pendingMutationIds, setPendingMutationIds] = useState<Set<string>>(new Set());
  const [selectedPackageIds, setSelectedPackageIds] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<BulkAction>('publish');
  const [bulkPending, setBulkPending] = useState(false);
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null);
  const [heroPackageIds, setHeroPackageIds] = useState<string[]>([]);
  const [heroSaving, setHeroSaving] = useState(false);
  const [toast, setToast] = useState('');

  function showToast(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(''), 3500);
  }

  function setPackageMutationPending(id: string, pending: boolean) {
    setPendingMutationIds(previous => {
      const next = new Set(previous);
      if (pending) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  async function fetchPackages() {
    setLoading(true);
    try {
      const [packageResponse, settingsResponse] = await Promise.all([adminFetch('/admin/packages'), adminFetch('/settings')]);
      if (!packageResponse.ok) throw new Error('Packages could not be refreshed.');
      const packageData = await packageResponse.json();
      setPackages(packageData.packages || []);
      if (settingsResponse.ok) {
        const settingsData = await settingsResponse.json();
        setHeroPackageIds(Array.isArray(settingsData.settings?.hero_package_ids) ? settingsData.settings.hero_package_ids.slice(0, 3) : []);
      }
    } catch (e) {
      console.log('Fetch packages error:', e);
      showToast('Packages could not be loaded. Please refresh and try again.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchPackages(); }, []);

  async function handleToggleActive(pkg: any) {
    if (!canManageLifecycle || pkg.status === 'archived' || pendingMutationIds.has(pkg.id)) return;
    const nextStatus = pkg.status === 'published' ? 'draft' : 'published';
    setPackageMutationPending(pkg.id, true);
    try {
      const res = await adminFetch(`/admin/packages/${pkg.id}`, { method: 'PUT', body: JSON.stringify({ status: nextStatus }) });
      const data = await res.json();
      if (res.ok) {
        setPackages(prev => prev.map(p => p.id === pkg.id ? data.package : p));
        showToast(nextStatus === 'published' ? 'Package published.' : 'Package moved to draft.');
      } else {
        const detail = Array.isArray(data.details) ? data.details.map((item: any) => item.message).join(' ') : '';
        showToast(detail || data.error || 'Package status could not be updated.');
      }
    } catch (e) {
      showToast(`Package status update failed: ${e instanceof Error ? e.message : 'Network error'}`);
    } finally {
      setPackageMutationPending(pkg.id, false);
    }
  }

  async function handleToggleFeatured(pkg: any) {
    if (!canManageLifecycle || pkg.status === 'archived' || pendingMutationIds.has(pkg.id)) return;
    setPackageMutationPending(pkg.id, true);
    try {
      const res = await adminFetch(`/admin/packages/${pkg.id}`, { method: 'PUT', body: JSON.stringify({ is_featured: !pkg.is_featured }) });
      const data = await res.json();
      if (res.ok) {
        setPackages(prev => prev.map(p => p.id === pkg.id ? data.package : p));
        showToast(`Package ${!pkg.is_featured ? 'featured' : 'removed from Featured'}.`);
      } else {
        const detail = Array.isArray(data.details) ? data.details.map((item: any) => item.message).join(' ') : '';
        showToast(detail || data.error || 'Featured status could not be updated.');
      }
    } catch (e) {
      showToast(`Featured update failed: ${e instanceof Error ? e.message : 'Network error'}`);
    } finally {
      setPackageMutationPending(pkg.id, false);
    }
  }

  async function handleArchive(id: string) {
    if (!canManageLifecycle) return;
    if (!window.confirm('Archive this package? It will be removed from the public website and kept in version history.')) return;
    setDeletingId(id);
    try {
      const res = await adminFetch(`/admin/packages/${id}/archive`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setPackages(prev => prev.map(p => p.id === id ? data.package : p));
        setSelectedPackageIds(prev => { const next = new Set(prev); next.delete(id); return next; });
        showToast('Package archived. It can be restored from version history.');
      } else {
        showToast(data.error || 'Package could not be archived.');
      }
    } catch (e) {
      showToast(`Archive failed: ${e instanceof Error ? e.message : 'Network error'}`);
    } finally {
      setDeletingId(null);
    }
  }

  const filtered = packages.filter(p =>
    p.title_en?.toLowerCase().includes(search.toLowerCase()) ||
    p.title_ar?.includes(search) ||
    p.destination_en?.toLowerCase().includes(search.toLowerCase())
  );
  const visibleIds = filtered.map(pkg => pkg.id);
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every(id => selectedPackageIds.has(id));
  const heroEligiblePackages = packages.filter(pkg => {
    if (pkg.status !== 'published' || pkg.is_active !== true) return false;
    if (!pkg.expiry_date) return true;
    return /^\d{4}-\d{2}-\d{2}$/.test(pkg.expiry_date) && pkg.expiry_date >= new Date().toISOString().slice(0, 10);
  });

  function toggleSelected(id: string) {
    setSelectedPackageIds(previous => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function toggleAllVisible() {
    setSelectedPackageIds(previous => {
      const next = new Set(previous);
      if (allVisibleSelected) visibleIds.forEach(id => next.delete(id));
      else visibleIds.forEach(id => next.add(id));
      return next;
    });
  }

  async function runBulkAction() {
    const ids = [...selectedPackageIds];
    if (!canManageLifecycle || !ids.length || bulkPending) return;
    const actionLabel = BULK_ACTIONS.find(item => item.value === bulkAction)?.label || 'Apply action';
    if (!window.confirm(`${actionLabel} for ${ids.length} selected package${ids.length === 1 ? '' : 's'}?`)) return;
    setBulkPending(true);
    try {
      const response = await adminFetch('/admin/packages/bulk-actions', { method: 'POST', body: JSON.stringify({ ids, action: bulkAction }) });
      const data = await response.json();
      if (!response.ok) {
        showToast(data.error || 'Bulk action failed.');
        return;
      }
      const failedIds = new Set((data.results || []).filter((result: any) => result.status === 'error').map((result: any) => result.id));
      setSelectedPackageIds(failedIds);
      await fetchPackages();
      const failedMessages = (data.results || []).filter((result: any) => result.status === 'error').slice(0, 2).map((result: any) => result.error).filter(Boolean);
      showToast(`${data.succeeded} package${data.succeeded === 1 ? '' : 's'} updated${data.failed ? `; ${data.failed} need review${failedMessages.length ? `: ${failedMessages.join(' · ')}` : ''}.` : '.'}`);
    } catch (e) {
      showToast(`Bulk action failed: ${e instanceof Error ? e.message : 'Network error'}`);
    } finally {
      setBulkPending(false);
    }
  }

  async function saveHeroPackages() {
    const cleanIds = heroPackageIds.filter(Boolean).slice(0, 3);
    if (new Set(cleanIds).size !== cleanIds.length) {
      showToast('Choose each hero package only once.');
      return;
    }
    if (cleanIds.some(id => !heroEligiblePackages.some(pkg => pkg.id === id))) {
      showToast('Hero packages must be published and not expired.');
      return;
    }
    setHeroSaving(true);
    try {
      const response = await adminFetch('/admin/settings', { method: 'PUT', body: JSON.stringify({ hero_package_ids: cleanIds }) });
      const data = await response.json();
      if (response.ok) {
        setHeroPackageIds(data.settings.hero_package_ids || cleanIds);
        showToast(`Hero updated with ${cleanIds.length} package${cleanIds.length === 1 ? '' : 's'}.`);
      } else {
        showToast(data.error || 'Hero packages could not be saved.');
      }
    } catch (e) {
      showToast(`Hero save failed: ${e instanceof Error ? e.message : 'Network error'}`);
    } finally {
      setHeroSaving(false);
    }
  }

  function updateHeroSlot(index: number, value: string) {
    setHeroPackageIds(previous => {
      const next = [...previous];
      next[index] = value;
      return next.slice(0, 3);
    });
  }

  function updatePackageInList(updated: any) {
    setPackages(previous => previous.map(pkg => pkg.id === updated.id ? updated : pkg));
  }

  return (
    <div className="space-y-5">
      {toast && <div role="status" className="fixed top-4 right-4 z-[70] bg-gray-800 text-white px-4 py-2 rounded-lg text-sm shadow-lg">{toast}</div>}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Travel Packages</h2>
          <p className="text-sm text-gray-500">{packages.length} packages total</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/admin/packages/bulk-import" className="flex items-center gap-2 border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"><Upload size={16} /> Bulk Import</Link>
          <Link to="/admin/packages/new" className="flex items-center gap-2 bg-[#D32F2F] hover:bg-[#B71C1C] text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"><Plus size={16} /> Add New Package</Link>
        </div>
      </div>

      {currentUser?.role === 'superadmin' && (
        <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-4" aria-label="Hero package selection">
          <div className="flex flex-col gap-1 mb-3">
            <h3 className="font-semibold text-gray-800">Homepage Hero Packages</h3>
            <p className="text-sm text-gray-500">Choose up to three published packages. Their cover image, destination, and package page become the homepage hero slides.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[0, 1, 2].map(index => (
              <label key={index} className="text-sm text-gray-700">
                Hero slot {index + 1}
                <select value={heroPackageIds[index] || ''} onChange={event => updateHeroSlot(index, event.target.value)} className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg bg-white">
                  <option value="">No package selected</option>
                  {heroEligiblePackages.map(pkg => <option key={pkg.id} value={pkg.id}>{pkg.title_en} — {pkg.destination_en}</option>)}
                </select>
              </label>
            ))}
          </div>
          <button type="button" onClick={saveHeroPackages} disabled={heroSaving} className="mt-3 px-4 py-2 bg-gray-800 hover:bg-black text-white rounded-lg text-sm font-medium disabled:opacity-50">
            {heroSaving ? 'Saving hero…' : 'Save Hero Packages'}
          </button>
        </section>
      )}

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search packages..." className="w-full sm:max-w-xs pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/20 focus:border-[#D32F2F]" />
      </div>

      {canManageLifecycle && selectedPackageIds.size > 0 && (
        <div className="sticky top-2 z-20 flex flex-col sm:flex-row gap-3 sm:items-center justify-between bg-gray-900 text-white rounded-xl px-4 py-3 shadow-lg">
          <div className="flex items-center gap-2 text-sm"><CheckSquare size={16} /> {selectedPackageIds.size} selected</div>
          <div className="flex flex-wrap gap-2 items-center">
            <label className="sr-only" htmlFor="bulk-package-action">Bulk actions</label>
            <select id="bulk-package-action" value={bulkAction} onChange={event => setBulkAction(event.target.value as BulkAction)} className="bg-white text-gray-800 px-3 py-2 rounded-lg text-sm">
              {BULK_ACTIONS.map(action => <option key={action.value} value={action.value}>{action.label}</option>)}
            </select>
            <button type="button" onClick={runBulkAction} disabled={bulkPending} className="px-3 py-2 bg-[#D32F2F] hover:bg-[#B71C1C] rounded-lg text-sm font-semibold disabled:opacity-50">{bulkPending ? 'Applying…' : 'Apply'}</button>
            <button type="button" onClick={() => setSelectedPackageIds(new Set())} className="p-2 hover:bg-white/10 rounded-lg" aria-label="Clear selection"><X size={16} /></button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-32"><svg className="animate-spin h-6 w-6 text-[#D32F2F]" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400"><p className="text-sm">{search ? 'No packages match your search.' : 'No packages yet. Add your first package!'}</p></div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100"><tr>
                  <th className="w-12 px-4 py-3">{canManageLifecycle && <input type="checkbox" checked={allVisibleSelected} onChange={toggleAllVisible} aria-label="Select all visible packages" />}</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Package</th><th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Destination</th><th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Price</th><th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Duration</th><th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th><th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Featured</th><th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(pkg => <tr key={pkg.id} className={`hover:bg-gray-50 transition-colors ${selectedPackageIds.has(pkg.id) ? 'bg-red-50/40' : ''}`}>
                    <td className="px-4 py-3 text-center">{canManageLifecycle && <input type="checkbox" checked={selectedPackageIds.has(pkg.id)} onChange={() => toggleSelected(pkg.id)} aria-label={`Select ${pkg.title_en}`} />}</td>
                    <td className="px-5 py-3"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-cover bg-center shrink-0" style={{ backgroundImage: `url(${pkg.cover_image_url})` }} /><div><p className="font-medium text-gray-800 line-clamp-1">{pkg.title_en}</p><p className="text-xs text-gray-400 line-clamp-1">{pkg.title_ar}</p></div></div></td>
                    <td className="px-4 py-3 text-gray-600"><EmojiFlag emoji={pkg.flag} className="me-1" />{pkg.destination_en}</td><td className="px-4 py-3 font-medium text-gray-800">{pkg.price?.toLocaleString()} SAR</td><td className="px-4 py-3 text-gray-600">{pkg.duration_days} days</td>
                    <td className="px-4 py-3 text-center">{!canManageLifecycle || pkg.status === 'archived' ? <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${pkg.status === 'archived' ? 'bg-amber-100 text-amber-800' : pkg.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{pkg.status === 'archived' ? <Archive size={12} /> : pkg.status === 'published' ? <Eye size={12} /> : <EyeOff size={12} />}{pkg.status === 'archived' ? 'Archived' : pkg.status === 'published' ? 'Published' : 'Draft'}</span> : <button onClick={() => handleToggleActive(pkg)} disabled={pendingMutationIds.has(pkg.id)} className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${pkg.status === 'published' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'} ${pendingMutationIds.has(pkg.id) ? 'opacity-50 cursor-wait' : ''}`}>{pkg.status === 'published' ? <Eye size={12} /> : <EyeOff size={12} />}{pkg.status === 'published' ? 'Published' : 'Draft'}</button>}</td>
                    <td className="px-4 py-3 text-center">{canManageLifecycle && pkg.status !== 'archived' && <button onClick={() => handleToggleFeatured(pkg)} disabled={pendingMutationIds.has(pkg.id)} className={`p-1.5 rounded-lg transition-colors ${pkg.is_featured ? 'text-amber-500 bg-amber-50 hover:bg-amber-100' : 'text-gray-300 hover:text-amber-400 hover:bg-amber-50'} ${pendingMutationIds.has(pkg.id) ? 'opacity-50 cursor-wait' : ''}`}><Star size={16} fill={pkg.is_featured ? 'currentColor' : 'none'} /></button>}</td>
                    <td className="px-5 py-3"><div className="flex items-center justify-end gap-1"><button type="button" onClick={() => setEditingPackageId(pkg.id)} className="p-2 text-gray-400 hover:text-[#D32F2F] hover:bg-red-50 rounded-lg transition-colors" title="Edit package" aria-label={`Edit ${pkg.title_en}`}><Edit size={16} /></button>{currentUser?.role === 'superadmin' && <Link to={`/admin/packages/${pkg.id}/history`} className="p-2 text-gray-400 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors" title="Version history"><History size={16} /></Link>}{currentUser?.role === 'superadmin' && pkg.status !== 'archived' && <button onClick={() => handleArchive(pkg.id)} disabled={deletingId === pkg.id} title="Archive package" className="p-2 text-gray-400 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors disabled:opacity-50"><Archive size={16} /></button>}</div></td>
                  </tr>)}
                </tbody>
              </table>
            </div>
            <div className="md:hidden divide-y divide-gray-100">
              {filtered.map(pkg => <div key={pkg.id} className={`p-4 ${selectedPackageIds.has(pkg.id) ? 'bg-red-50/40' : ''}`}><div className="flex items-start gap-3">{canManageLifecycle && <input type="checkbox" checked={selectedPackageIds.has(pkg.id)} onChange={() => toggleSelected(pkg.id)} aria-label={`Select ${pkg.title_en}`} className="mt-1" />}<div className="w-14 h-14 rounded-xl bg-cover bg-center shrink-0" style={{ backgroundImage: `url(${pkg.cover_image_url})` }} /><div className="flex-1 min-w-0"><p className="font-medium text-gray-800 truncate">{pkg.title_en}</p><p className="text-sm text-gray-500"><EmojiFlag emoji={pkg.flag} className="me-1" />{pkg.destination_en}</p><p className="text-sm font-semibold text-[#D32F2F] mt-1">{pkg.price?.toLocaleString()} SAR · {pkg.duration_days}d</p></div><button type="button" onClick={() => setEditingPackageId(pkg.id)} className="p-2 text-gray-400 hover:text-[#D32F2F] rounded-lg" title="Edit package"><Edit size={16} /></button></div></div>)}
            </div>
          </>
        )}
      </div>

      {editingPackageId && (
        <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Edit package side panel">
          <button type="button" className="absolute inset-0 bg-black/40" aria-label="Close package editor" onClick={() => setEditingPackageId(null)} />
          <aside className="absolute right-0 top-0 h-full w-full max-w-3xl bg-[#F8F9FA] shadow-2xl overflow-y-auto p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4"><span className="inline-flex items-center gap-2 text-sm text-gray-500"><PanelRightOpen size={16} /> Editing in place — package list remains open</span><button type="button" onClick={() => setEditingPackageId(null)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg" aria-label="Close package editor"><X size={18} /></button></div>
            <AdminPackageForm packageId={editingPackageId} onClose={() => setEditingPackageId(null)} onSaved={updatePackageInList} />
          </aside>
        </div>
      )}
    </div>
  );
}
