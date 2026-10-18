import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { Package, FileText, Users, Settings, TrendingUp, Eye, Edit, Plus, MessageCircle } from 'lucide-react';

interface Stats {
  totalPackages: number;
  activePackages: number;
  totalArticles: number;
  publishedArticles: number;
  teamCount: number;
}

interface WhatsAppInsights {
  total_clicks: number;
  last_30_days_clicks: number;
  top_packages: { package_id: string; package_title: string; clicks: number }[];
}

export function AdminDashboard() {
  const { adminFetch } = useAdminAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentPackages, setRecentPackages] = useState<any[]>([]);
  const [recentArticles, setRecentArticles] = useState<any[]>([]);
  const [whatsAppInsights, setWhatsAppInsights] = useState<WhatsAppInsights | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [pkgRes, artRes, teamRes, whatsAppRes] = await Promise.allSettled([
          adminFetch('/admin/packages').then(r => r.json()),
          adminFetch('/admin/articles').then(r => r.json()),
          adminFetch('/admin/team').then(r => r.json()),
          adminFetch('/admin/insights/whatsapp').then(r => r.json()),
        ]);

        const packages = pkgRes.status === 'fulfilled' ? (pkgRes.value.packages || []) : [];
        const articles = artRes.status === 'fulfilled' ? (artRes.value.articles || []) : [];
        const team = teamRes.status === 'fulfilled' ? (teamRes.value.team || []) : [];

        setStats({
          totalPackages: packages.length,
          activePackages: packages.filter((p: any) => p.is_active).length,
          totalArticles: articles.length,
          publishedArticles: articles.filter((a: any) => a.is_published).length,
          teamCount: team.length,
        });
        setRecentPackages(packages.slice(0, 5));
        setRecentArticles(articles.slice(0, 5));
        if (whatsAppRes.status === 'fulfilled' && typeof whatsAppRes.value.total_clicks === 'number') {
          setWhatsAppInsights(whatsAppRes.value);
        }
      } catch (e) {
        console.log('Dashboard load error:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [adminFetch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <svg className="animate-spin h-8 w-8 text-[#D32F2F]" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Packages', value: stats?.totalPackages ?? 0, sub: `${stats?.activePackages ?? 0} active`, icon: Package, color: 'bg-blue-500', link: '/admin/packages' },
    { label: 'Articles', value: stats?.totalArticles ?? 0, sub: `${stats?.publishedArticles ?? 0} published`, icon: FileText, color: 'bg-emerald-500', link: '/admin/articles' },
    { label: 'Team Members', value: stats?.teamCount ?? 0, sub: 'Active members', icon: Users, color: 'bg-purple-500', link: '/admin/team' },
    { label: 'Site Settings', value: '—', sub: 'Contact & info', icon: Settings, color: 'bg-amber-500', link: '/admin/settings' },
    { label: 'WhatsApp Enquiry Clicks', value: whatsAppInsights?.total_clicks ?? 0, sub: `${whatsAppInsights?.last_30_days_clicks ?? 0} in last 30 days`, icon: MessageCircle, color: 'bg-green-500', link: '/admin/dashboard' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#D32F2F] to-[#B71C1C] rounded-2xl p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold mb-1">Welcome to the CMS</h2>
            <p className="text-red-100 text-sm">Manage your travel packages, articles, team, and site settings from here.</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Link
              to="/admin/packages/new"
              className="flex items-center gap-2 bg-white text-[#D32F2F] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-50 transition-colors"
            >
              <Plus size={16} /> New Package
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, sub, icon: Icon, color, link }) => (
          <Link
            key={label}
            to={link}
            className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`${color} w-10 h-10 rounded-lg flex items-center justify-center`}>
                <Icon size={20} className="text-white" />
              </div>
              <TrendingUp size={14} className="text-gray-300 group-hover:text-[#D32F2F] transition-colors" />
            </div>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
            <p className="text-xs text-gray-400">{sub}</p>
          </Link>
        ))}
      </div>

      {/* Recent Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Packages */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800 text-sm">Recent Packages</h3>
            <Link to="/admin/packages" className="text-xs text-[#D32F2F] hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentPackages.length === 0 ? (
              <p className="px-5 py-4 text-sm text-gray-400">No packages yet.</p>
            ) : recentPackages.map(pkg => (
              <div key={pkg.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                <div
                  className="w-10 h-10 rounded-lg bg-cover bg-center shrink-0"
                  style={{ backgroundImage: `url(${pkg.cover_image_url})` }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{pkg.title_en}</p>
                  <p className="text-xs text-gray-400">{pkg.destination_en} · {pkg.duration_days}d · {pkg.price?.toLocaleString()} SAR</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${pkg.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {pkg.is_active ? 'Active' : 'Draft'}
                  </span>
                  <Link to={`/admin/packages/${pkg.id}/edit`} className="p-1.5 text-gray-400 hover:text-[#D32F2F] rounded">
                    <Edit size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Articles */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800 text-sm">Recent Articles</h3>
            <Link to="/admin/articles" className="text-xs text-[#D32F2F] hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentArticles.length === 0 ? (
              <p className="px-5 py-4 text-sm text-gray-400">No articles yet.</p>
            ) : recentArticles.map(art => (
              <div key={art.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                <div
                  className="w-10 h-10 rounded-lg bg-cover bg-center shrink-0"
                  style={{ backgroundImage: `url(${art.cover_image_url})` }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{art.title_en}</p>
                  <p className="text-xs text-gray-400">{art.category} · {new Date(art.published_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${art.is_published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {art.is_published ? 'Live' : 'Draft'}
                  </span>
                  <Link to={`/admin/articles/${art.id}/edit`} className="p-1.5 text-gray-400 hover:text-[#D32F2F] rounded">
                    <Edit size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-800 text-sm mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Add Package', icon: Package, path: '/admin/packages/new', color: 'text-blue-600 bg-blue-50 hover:bg-blue-100' },
            { label: 'Add Article', icon: FileText, path: '/admin/articles/new', color: 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100' },
            { label: 'Add Team Member', icon: Users, path: '/admin/team', color: 'text-purple-600 bg-purple-50 hover:bg-purple-100' },
            { label: 'Edit Settings', icon: Settings, path: '/admin/settings', color: 'text-amber-600 bg-amber-50 hover:bg-amber-100' },
          ].map(({ label, icon: Icon, path, color }) => (
            <Link
              key={label}
              to={path}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl text-sm font-medium transition-colors ${color}`}
            >
              <Icon size={20} />
              <span className="text-center text-xs">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
