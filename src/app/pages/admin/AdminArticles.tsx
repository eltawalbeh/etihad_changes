import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { Plus, Edit, Trash2, Search } from 'lucide-react';

export function AdminArticles() {
  const { adminFetch } = useAdminAuth();
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState('');

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  async function fetchArticles() {
    setLoading(true);
    try {
      const res = await adminFetch('/admin/articles');
      const data = await res.json();
      setArticles(data.articles || []);
    } catch (e) {
      console.log('Fetch articles error:', e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchArticles(); }, []);

  async function handleTogglePublished(art: any) {
    try {
      const res = await adminFetch(`/admin/articles/${art.id}`, {
        method: 'PUT',
        body: JSON.stringify({ is_published: !art.is_published }),
      });
      if (res.ok) {
        setArticles(prev => prev.map(a => a.id === art.id ? { ...a, is_published: !a.is_published } : a));
        showToast(`Article ${!art.is_published ? 'published' : 'unpublished'}.`);
      }
    } catch (e) {
      console.log('Toggle published error:', e);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this article? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      const res = await adminFetch(`/admin/articles/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setArticles(prev => prev.filter(a => a.id !== id));
        showToast('Article deleted.');
      }
    } catch (e) {
      console.log('Delete error:', e);
    } finally {
      setDeletingId(null);
    }
  }

  const filtered = articles.filter(a =>
    a.title_en?.toLowerCase().includes(search.toLowerCase()) ||
    a.title_ar?.includes(search) ||
    a.category?.includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-800 text-white px-4 py-2 rounded-lg text-sm shadow-lg">{toast}</div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">News & Blog</h2>
          <p className="text-sm text-gray-500">{articles.length} articles total</p>
        </div>
        <Link
          to="/admin/articles/new"
          className="flex items-center gap-2 bg-[#D32F2F] hover:bg-[#B71C1C] text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors w-fit"
        >
          <Plus size={16} /> Add New Article
        </Link>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search articles..."
          className="w-full sm:max-w-xs pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/20 focus:border-[#D32F2F]"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <svg className="animate-spin h-6 w-6 text-[#D32F2F]" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            {search ? 'No articles match your search.' : 'No articles yet. Write your first article!'}
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Article</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Author</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(art => (
                    <tr key={art.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-lg bg-cover bg-center shrink-0"
                            style={{ backgroundImage: `url(${art.cover_image_url})` }}
                          />
                          <div>
                            <p className="font-medium text-gray-800 line-clamp-1">{art.title_en}</p>
                            <p className="text-xs text-gray-400 line-clamp-1" dir="rtl">{art.title_ar}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full capitalize">
                          {art.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{art.author}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{new Date(art.published_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleTogglePublished(art)}
                          className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                            art.is_published ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                          }`}
                        >
                          {art.is_published ? 'Published' : 'Draft'}
                        </button>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            to={`/admin/articles/${art.id}/edit`}
                            className="p-2 text-gray-400 hover:text-[#D32F2F] hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Edit size={16} />
                          </Link>
                          <button
                            onClick={() => handleDelete(art.id)}
                            disabled={deletingId === art.id}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="md:hidden divide-y divide-gray-100">
              {filtered.map(art => (
                <div key={art.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className="w-14 h-14 rounded-xl bg-cover bg-center shrink-0"
                      style={{ backgroundImage: `url(${art.cover_image_url})` }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate text-sm">{art.title_en}</p>
                      <p className="text-xs text-gray-500">{art.author} · {new Date(art.published_at).toLocaleDateString()}</p>
                      <div className="flex gap-2 mt-1.5">
                        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full capitalize">{art.category}</span>
                        <button
                          onClick={() => handleTogglePublished(art)}
                          className={`text-xs px-2 py-0.5 rounded-full ${art.is_published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}
                        >
                          {art.is_published ? 'Published' : 'Draft'}
                        </button>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Link to={`/admin/articles/${art.id}/edit`} className="p-2 text-gray-400 hover:text-[#D32F2F] rounded-lg">
                        <Edit size={16} />
                      </Link>
                      <button onClick={() => handleDelete(art.id)} className="p-2 text-gray-400 hover:text-red-600 rounded-lg">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
