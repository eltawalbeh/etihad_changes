import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../../..');
const read = (relativePath) => readFileSync(resolve(root, relativePath), 'utf8');

const packagesPage = read('src/app/pages/admin/AdminPackages.tsx');
const packageForm = read('src/app/pages/admin/AdminPackageForm.tsx');
const packageCard = read('src/app/components/PackageCard.tsx');
const packageDetail = read('src/app/pages/PackageDetail.tsx');
const home = read('src/app/pages/Home.tsx');
const dataContext = read('src/app/context/DataContext.tsx');
const server = read('supabase/functions/server/index.tsx');

// Operators must be able to select the visible package rows and apply an explicit safe batch action.
assert.match(packagesPage, /selectedPackageIds/);
assert.match(packagesPage, /Select all visible packages/);
assert.match(packagesPage, /Bulk actions/);
assert.match(packagesPage, /\/admin\/packages\/bulk-actions/);
assert.match(server, /admin\/packages\/bulk-actions/);
assert.match(server, /publish|draft|feature|unfeature|archive/);
assert.match(server, /requirePackageLifecycleManagement/);
assert.match(server, /results/);
assert.match(server, /try \{\s*await persistPackageMutation\([\s\S]*?results\.push\(\{ id, title: mutation\.package\.title_en \|\| '', status: 'ok'/);
assert.match(server, /catch \(e\) \{\s*console\.log\('Bulk package action item error:'/);
assert.match(server, /status: 'error', error: 'Package mutation failed'/);
assert.match(packagesPage, /const failedIds = new Set\(/);
assert.match(packagesPage, /setSelectedPackageIds\(failedIds\)/);
assert.match(packagesPage, /await fetchPackages\(\)/);
assert.match(packagesPage, /if \(!packageResponse\.ok\) throw new Error\(/);
assert.match(packagesPage, /setPackages\(packageData\.packages \|\| \[\]\)/);
assert.match(packagesPage, /const canManageLifecycle = currentUser\?\.role === 'superadmin';/);
assert.match(packagesPage, /canManageLifecycle && selectedPackageIds\.size > 0/);
assert.match(packagesPage, /if \(!canManageLifecycle \|\| pkg\.status === 'archived'/);

// Edit must open in a side overlay and return a server-authoritative package to the existing list.
assert.match(packagesPage, /editingPackageId/);
assert.match(packagesPage, /Edit package side panel/);
assert.match(packagesPage, /onSaved/);
assert.match(packageForm, /packageId\?: string/);
assert.match(packageForm, /onClose\?:/);
assert.match(packageForm, /onSaved\?:/);
assert.match(packageForm, /const \[loadError, setLoadError\] = useState\(''\)/);
assert.match(packageForm, /const \[loadedPackageId, setLoadedPackageId\] = useState<string \| null>\(null\)/);
assert.match(packageForm, /if \(!response\.ok\) throw new Error/);
assert.match(packageForm, /if \(isEdit && loadedPackageId !== id\)/);
assert.match(packageForm, /if \(fetching \|\| loadError\) return;/);
assert.match(packageForm, /disabled=\{loading \|\| fetching \|\| Boolean\(loadError\)\}/);

// Public cards must have a full-card destination without nesting an interactive CTA in an interactive wrapper.
assert.match(packageCard, /onClick=\{openPackage\}/);
assert.match(packageCard, /onKeyDown=\{handleCardKeyDown\}/);
assert.match(packageCard, /role="link"/);
assert.doesNotMatch(packageCard, /<button/);
assert.match(packageCard, /<span[^>]*>\s*\{t\('packages\.details'\)\}/);

// Imported records may not carry optional lists; a working card route must render them as empty lists.
assert.match(packageDetail, /const includes = Array\.isArray/);
assert.match(packageDetail, /const galleryUrls = Array\.isArray/);

// Homepage hero slides must be package-backed and limited to three owner selections.
assert.match(dataContext, /hero_package_ids: string\[\]/);
assert.match(home, /settings\.hero_package_ids/);
assert.match(home, /slice\(0, 3\)/);
assert.match(server, /heroPackages\.some\(\(pkg: any\) => !isPackagePublic\(pkg\)\)/);
assert.match(server, /Hero packages must exist, be published, and be publicly available/);
assert.match(packagesPage, /const heroEligiblePackages = packages\.filter/);
assert.match(packagesPage, /Hero packages must be published and not expired/);
assert.match(home, /function isPublicHeroPackage\(pkg: any\)/);
assert.match(home, /packages\.filter\(pkg => pkg\.is_featured\)\.filter\(isPublicHeroPackage\)/);
assert.doesNotMatch(home, /const HERO_SLIDES/);

console.log('Admin package workflow contract: passed');
