import { useEffect, useState } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
export function AdminInquiries() {
  const { adminFetch, currentUser } = useAdminAuth();
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(true);
  async function load() {
    setBusy(true); setError('');
    try {
      const response = await adminFetch('/admin/inquiries');
      if (!response.ok) throw new Error('Cannot load inquiries');
      const data = await response.json();
      setItems(data.inquiries || []);
    } catch(e) { setError(e instanceof Error ? e.message : 'Load failed'); }
    finally { setBusy(false); }
  }
  useEffect(() => { void load(); }, []);
  async function remove(id: string) {
    if (!confirm('Permanently delete this inquiry?')) return;
    const response = await adminFetch('/admin/inquiries/' + encodeURIComponent(id), { method: 'DELETE' });
    if (response.ok) setItems(prev => prev.filter(item => item.id !== id));
    else setError('Deletion failed');
  }
  return <main className="space-y-4">
    <div className="flex items-center justify-between">
      <h1 className="font-bold text-2xl">Website Inquiries</h1>
      <button type="button" onClick={load} className="rounded-lg border px-4 py-2">Refresh</button>
    </div>
    <p className="text-sm text-gray-500">Private customer inquiries, newest first. Replies must be handled by the team.</p>
    {error && <p role="alert" className="text-red-700">{error}</p>}
    {busy ? <p>Loading…</p> : items.length === 0 ? <p>No inquiries received.</p> :
      <div className="space-y-3">{items.map(item => <article key={item.id} className="rounded-xl border bg-white p-5 space-y-2">
        <div className="flex justify-between gap-4"><strong>{item.name} — {item.source}</strong><span className="text-xs text-gray-500">{item.created_at}</span></div>
        <p className="text-sm"><a className="underline" href={'tel:' + String(item.phone).replace(/[^+0-9]/g,'')}>{item.phone}</a> {item.email && <a className="underline ml-3" href={'mailto:' + item.email}>{item.email}</a>}</p>
        <p className="text-sm font-semibold">{item.subject}</p>
        <p className="text-sm whitespace-pre-wrap break-words">{item.message}</p>
        {currentUser?.role === 'superadmin' && <button className="text-red-700 text-sm underline" onClick={() => remove(item.id)}>Delete (after resolution)</button>}
      </article>)}</div>}
  </main>;
}
