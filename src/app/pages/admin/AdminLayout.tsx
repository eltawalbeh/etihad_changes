import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router';
import { useAdminAuth } from '../../context/AdminAuthContext';
import {
  LayoutDashboard, Package, FileText, Settings, Users,
  LogOut, Menu, X, ChevronRight, Globe, Info
} from 'lucide-react';
import { Logo } from '../../components/Logo';

const ADMIN_LANG_KEY = 'etihad_admin_lang';

const baseNavItems_en = [
  { path: '/admin/dashboard', label: 'Dashboard',    icon: LayoutDashboard },
  { path: '/admin/inquiries', label: 'Inquiries', icon: MessageCircle },
  { path: '/admin/packages',  label: 'Packages',     icon: Package },
  { path: '/admin/articles',  label: 'News & Blog',  icon: FileText },
  { path: '/admin/about',     label: 'About Us',     icon: Info },

];
const baseNavItems_ar = [
  { path: '/admin/dashboard', label: 'لوحة التحكم',   icon: LayoutDashboard },
  { path: '/admin/inquiries', label: 'الاستفسارات', icon: MessageCircle },
  { path: '/admin/packages',  label: 'الرحلات',       icon: Package },
  { path: '/admin/articles',  label: 'الأخبار والمدونة', icon: FileText },
  { path: '/admin/about',     label: 'من نحن',        icon: Info },

];

export function AdminLayout() {
  const { isAuthenticated, loading, logout, currentUser } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminLang, setAdminLang] = useState<'en' | 'ar'>(() => {
    const stored = localStorage.getItem(ADMIN_LANG_KEY);
    return stored === 'ar' ? 'ar' : 'en';
  });

  const isAdminRTL = adminLang === 'ar';

  function toggleAdminLang() {
    const next = adminLang === 'en' ? 'ar' : 'en';
    setAdminLang(next);
    localStorage.setItem(ADMIN_LANG_KEY, next);
  }

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/admin', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-[#D32F2F]" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const baseNav = isAdminRTL ? baseNavItems_ar : baseNavItems_en;
  const navItems = currentUser?.role === 'superadmin'
    ? [...baseNav, { path: '/admin/settings', label: isAdminRTL ? 'إعدادات الموقع' : 'Site Settings', icon: Settings }]
    : baseNav;

  async function handleLogout() {
    await logout();
    navigate('/admin', { replace: true });
  }

  const currentPage = navItems.find(item => location.pathname.startsWith(item.path))?.label || (isAdminRTL ? 'لوحة التحكم' : 'Admin');

  return (
    <div
      dir={isAdminRTL ? 'rtl' : 'ltr'}
      className="min-h-screen bg-gray-50 flex"
      style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
    >
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 ${isAdminRTL ? 'right-0' : 'left-0'} h-full w-64 bg-gray-900 flex flex-col z-50 transition-transform duration-300
        ${sidebarOpen
          ? 'translate-x-0'
          : isAdminRTL ? 'translate-x-full' : '-translate-x-full'
        }
        ${isAdminRTL ? 'lg:translate-x-0' : 'lg:translate-x-0'} lg:static lg:z-auto
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-gray-700">
          <Logo variant="white" height={42} />
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-gray-400 hover:text-white lg:hidden shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group
                ${isActive
                  ? 'bg-[#D32F2F] text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }
              `}
            >
              <Icon size={18} className="shrink-0" />
              <span>{label}</span>
              <ChevronRight size={14} className={`${isAdminRTL ? 'me-auto rotate-180' : 'ms-auto'} opacity-0 group-hover:opacity-100 transition-opacity`} />
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg text-sm font-medium transition-all"
          >
            <LogOut size={18} className="shrink-0" />
            <span>{isAdminRTL ? 'تسجيل الخروج' : 'Sign Out'}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 lg:ms-0">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center gap-4 sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-500 hover:text-gray-800 lg:hidden"
          >
            <Menu size={22} />
          </button>

          <div className="flex-1 min-w-0">
            <h1 className="text-base sm:text-lg font-semibold text-gray-800 truncate">{currentPage}</h1>
            <p className="text-xs text-gray-400 hidden sm:block">
              {isAdminRTL ? 'الاتحاد للسفر والسياحة — إدارة المحتوى' : 'Al-Etihad Tours — Content Management'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Language switcher */}
            <button
              onClick={toggleAdminLang}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-[#D32F2F] hover:bg-red-50 text-gray-600 hover:text-[#D32F2F] transition-all text-xs font-semibold"
              title={isAdminRTL ? 'Switch to English' : 'التبديل إلى العربية'}
            >
              <Globe size={14} />
              <span>{isAdminRTL ? 'EN' : 'عربي'}</span>
            </button>

            {/* View Site */}
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#D32F2F] hover:underline hidden sm:block whitespace-nowrap"
            >
              {isAdminRTL ? 'عرض الموقع ←' : 'View Site →'}
            </a>

            {/* User info */}
            <div className="flex items-center gap-2">
              <div className={`${isAdminRTL ? 'text-left' : 'text-right'} hidden sm:block`}>
                <p className="text-xs font-semibold text-gray-700 leading-tight">{currentUser?.displayName || currentUser?.username}</p>
                <p className="text-[10px] text-gray-400 capitalize">
                  {currentUser?.role === 'superadmin'
                    ? (isAdminRTL ? 'مدير عام' : 'Super Admin')
                    : (isAdminRTL ? 'محرر' : 'Editor')
                  }
                </p>
              </div>
              <div className="w-8 h-8 bg-[#D32F2F] rounded-full flex items-center justify-center shrink-0">
                <span className="text-white text-xs font-bold uppercase">
                  {(currentUser?.displayName || currentUser?.username || 'A').charAt(0)}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}