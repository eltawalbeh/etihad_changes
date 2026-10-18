import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../../..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const packageDetail = read('src/app/pages/PackageDetail.tsx');
const dataContext = read('src/app/context/DataContext.tsx');
const server = read('supabase/functions/server/index.tsx');
const settings = read('src/app/pages/admin/AdminSettings.tsx');
const dashboard = read('src/app/pages/admin/AdminDashboard.tsx');
const rootPage = read('src/app/pages/Root.tsx');

assert.match(packageDetail, /settings\.whatsapp/, 'Package Detail must use the saved WhatsApp setting');
assert.doesNotMatch(packageDetail, /wa\.me\/966560074845/, 'Package Detail must not hardcode a WhatsApp destination');
assert.match(packageDetail, /Adults|البالغين/, 'Booking message must include adults');
assert.match(packageDetail, /Children|الأطفال/, 'Booking message must include children');
assert.match(packageDetail, /Package URL|رابط الباقة/, 'Booking message must include the package URL');
assert.match(server, /public-events\/whatsapp/, 'Server must record WhatsApp click events');
assert.match(server, /admin\/insights\/whatsapp/, 'Dashboard must have a protected WhatsApp insights endpoint');
assert.match(server, /await c\.req\.text\(\)/, 'Public click endpoint must enforce a real body-size boundary before JSON parsing');
assert.match(server, /rawBody\.length > 512/, 'Public click endpoint must reject oversized bodies');
assert.match(server, /await kv\.get\(`pkg:\$\{packageId\}`\)/, 'Public click endpoint must resolve the package title only from the server record');
assert.match(server, /isPackagePublic\(packageRecord\)/, 'Public click endpoint must accept published public packages only');
assert.doesNotMatch(server, /const packageTitle = String\(body\.package_title/, 'Public click endpoint must not persist client-provided package titles');
assert.match(dashboard, /WhatsApp Enquiry Clicks/, 'Dashboard must label click intent accurately');
assert.match(dataContext, /google_tag_id/, 'Settings must support a Google Tag ID');
assert.match(dataContext, /search_console_verification/, 'Settings must support Search Console verification');
assert.match(settings, /Google Tag ID/, 'Site Settings must expose Google Tag configuration');
assert.match(settings, /Search Console Verification/, 'Site Settings must expose Search Console verification');
assert.match(rootPage, /GoogleTag/, 'Public root must install the configured Google Tag');

console.log('Website growth workflow contract: passed');
