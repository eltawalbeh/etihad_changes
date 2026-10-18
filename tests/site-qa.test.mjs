import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
test('canonical navigation and legal pages are routed', () => {
  const routes = read('src/app/routes.ts');
  for (const route of ["'privacy'", "'terms'", "'inquiries'"]) assert.ok(routes.includes(route));
  assert.ok(existsSync(new URL('../src/app/pages/Legal.tsx', import.meta.url)));
});
test('verification gates promotional metrics', () => {
  const data = read('src/app/context/DataContext.tsx');
  const home = read('src/app/pages/Home.tsx');
  assert.ok(data.includes('stats_verified: false'));
  assert.ok(home.includes('settings.stats_verified === true'));
  assert.ok(!home.includes('Est. 2009'));
  assert.ok(!read('src/app/context/LanguageContext.tsx').includes('Over 15 years'));
  assert.ok(!data.includes('٠٥ عاماً'));
});
test('About page defines verified stats before referencing them', () => {
  const about = read('src/app/pages/About.tsx');
  assert.match(about, /const verifiedStatsData\s*=/);
  assert.ok(about.includes('settings.stats_verified === true'), 'Unverified promotional numbers should not display');
  assert.ok(about.includes('verifiedStatsData.length > 0'));
  assert.ok(about.includes('verifiedStatsData.map('));
});

test('About and CMS defaults match approved bilingual company narrative', () => {
  const about = read('src/app/pages/About.tsx');
  const adminAbout = read('src/app/pages/admin/AdminAbout.tsx');
  const context = read('src/app/context/DataContext.tsx');
  assert.ok(!about.includes('3,500 satisfied clients'));
  assert.ok(!about.includes('أكثر من 3,500'));
  for (const file of [adminAbout, context]) {
    assert.ok(file.includes('مؤسسة الاتحاد للسفر والسياحة'));
    assert.ok(file.includes('We aim to deliver a seamless travel experience'));
    assert.ok(!file.includes('Founded in Saudi Arabia with deep roots'));
  }
  const adminSettings = read('src/app/pages/admin/AdminSettings.tsx');
  for (const key of ['stats_happy_clients', 'stats_trips_organized', 'stats_years_experience', 'stats_destinations']) {
    assert.ok(adminSettings.includes(key));
  }
  assert.ok(adminSettings.includes('currently provisional'));
});
test('approved real team, no stock portrait seeding', () => {
  const seed = read('supabase/functions/server/seed.ts');
  for (const name of ['عبدالله الطوالبة','Nabeel Ahmad','Farhan Ishaq']) assert.ok(seed.includes(name));
  assert.ok(!seed.includes('photo-1507003211169'));
  const server = read('supabase/functions/server/index.tsx');
  assert.ok(server.includes("member.approval_status === 'approved'"));
  assert.ok(server.includes('Only superadmins can approve team members'));
  assert.ok(!server.includes('for (const pkg of SEED_PACKAGES)'));
  assert.ok(server.includes('site:approved-team-v1'));
  assert.ok(!read('src/app/context/LanguageContext.tsx').includes('٠٥ عاماً'));
});
test('production search uses live data, not demo imports', () => {
  assert.ok(!read('src/app/pages/Search.tsx').includes("from '../data/mockData'"));
});
test('no mock data fallback to live visitors', () => {
  const data = read('src/app/context/DataContext.tsx');
  assert.ok(data.includes('useState<Package[]>([])'));
  assert.ok(data.includes('useState<TeamMember[]>([])'));
  assert.ok(data.includes('Array.isArray(teamRes.value.team)'));
});
test('inquiry forms require server acceptance', () => {
  const helper = read('src/app/lib/inquiries.ts');
  assert.ok(helper.includes("method: 'POST'"));
  assert.ok(helper.includes('if (!response.ok'));
  for (const path of ['Contact','Services','PackageDetail']) {
    const content = read('src/app/pages/' + path + '.tsx');
    assert.ok(content.includes('await submitInquiry('), path);
    assert.ok(content.includes('set') && content.includes('Error'), path);
  }
});
test('private inquiry management and rate controls', () => {
  const server = read('supabase/functions/server/index.tsx');
  assert.ok(server.includes("app.post('/make-server-cf64f9a2/inquiries'"));
  assert.ok(server.includes('inquiry-rate:'));
  assert.ok(server.includes("app.get('/make-server-cf64f9a2/admin/inquiries', requireContentManagement"));
  assert.ok(server.includes("app.delete('/make-server-cf64f9a2/admin/inquiries/:id', requireSettingsManagement"));
});
test('consent-first analytics, no duplicate static tags', () => {
  const html = read('index.html');
  const tag = read('src/app/components/GoogleTag.tsx');
  assert.ok(!html.includes('googletagmanager.com'));
  assert.ok(!html.includes('clarity.ms'));
  assert.ok(tag.includes("!consent || !tagId"));
  assert.ok(tag.includes('etihad:consent-changed'));
});
test('Arabic metadata and sitemap cover informational routes', () => {
  const html = read('index.html');
  assert.ok(html.includes('lang="ar" dir="rtl"'));
  const sitemap = read('public/sitemap.xml');
  for (const p of ['/about','/contact','/services','/packages','/news','/evisa']) assert.ok(sitemap.includes(p));
});
