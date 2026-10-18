import { createBrowserRouter } from 'react-router';
import { Root } from './pages/Root';
import { AdminLayout } from './pages/admin/AdminLayout';

function HydrateFallback() { return null; }

const load = <T extends Record<string, unknown>>(loader: () => Promise<T>, component: string) => async () => ({
  Component: (await loader())[component] as React.ComponentType,
});

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Root,
    HydrateFallback,
    children: [
      { index: true, lazy: load(() => import('./pages/Home'), 'Home') },
      { path: 'packages', lazy: load(() => import('./pages/Packages'), 'Packages') },
      { path: 'packages/:slug', lazy: load(() => import('./pages/PackageDetail'), 'PackageDetail') },
      { path: 'services', lazy: load(() => import('./pages/Services'), 'Services') },
      { path: 'about', lazy: load(() => import('./pages/About'), 'About') },
      { path: 'news', lazy: load(() => import('./pages/News'), 'News') },
      { path: 'news/:slug', lazy: load(() => import('./pages/NewsDetail'), 'NewsDetail') },
      { path: 'contact', lazy: load(() => import('./pages/Contact'), 'Contact') },
      { path: 'privacy', lazy: load(() => import('./pages/Legal'), 'Privacy') },
      { path: 'terms', lazy: load(() => import('./pages/Legal'), 'Terms') },
      { path: 'search', lazy: load(() => import('./pages/Search'), 'Search') },
      { path: 'evisa', lazy: load(() => import('./pages/EVisaPage'), 'EVisaPage') },
      { path: '*', lazy: load(() => import('./pages/NotFound'), 'NotFound') },
    ],
  },
  { path: '/admin', lazy: load(() => import('./pages/admin/AdminLogin'), 'AdminLogin') },
  {
    path: '/admin',
    Component: AdminLayout,
    children: [
      { path: 'dashboard', lazy: load(() => import('./pages/admin/AdminDashboard'), 'AdminDashboard') },
      { path: 'inquiries', lazy: load(() => import('./pages/admin/AdminInquiries'), 'AdminInquiries') },
      { path: 'packages', lazy: load(() => import('./pages/admin/AdminPackages'), 'AdminPackages') },
      { path: 'packages/new', lazy: load(() => import('./pages/admin/AdminPackageForm'), 'AdminPackageForm') },
      { path: 'packages/bulk-import', lazy: load(() => import('./pages/admin/AdminBulkImport'), 'AdminBulkImport') },
      { path: 'packages/:id/edit', lazy: load(() => import('./pages/admin/AdminPackageForm'), 'AdminPackageForm') },
      { path: 'packages/:id/history', lazy: load(() => import('./pages/admin/AdminPackageHistory'), 'AdminPackageHistory') },
      { path: 'articles', lazy: load(() => import('./pages/admin/AdminArticles'), 'AdminArticles') },
      { path: 'articles/new', lazy: load(() => import('./pages/admin/AdminArticleForm'), 'AdminArticleForm') },
      { path: 'articles/:id/edit', lazy: load(() => import('./pages/admin/AdminArticleForm'), 'AdminArticleForm') },
      { path: 'about', lazy: load(() => import('./pages/admin/AdminAbout'), 'AdminAbout') },
      { path: 'team', lazy: load(() => import('./pages/admin/AdminTeam'), 'AdminTeam') },
      { path: 'settings', lazy: load(() => import('./pages/admin/AdminSettings'), 'AdminSettings') },
    ],
  },
]);
