import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const root = new URL('../../..', import.meta.url);
const read = (path) => readFileSync(new URL(path, root), 'utf8');
const packageType = read('src/app/data/mockData.ts');
const card = read('src/app/components/PackageCard.tsx');
const detail = read('src/app/pages/PackageDetail.tsx');
const bulkImport = read('src/app/pages/admin/AdminBulkImport.tsx');

assert.match(packageType, /pricing_model\?: 'fixed' \| 'rate_matrix'/);
assert.match(card, /pkg\.pricing_model === 'rate_matrix'/);
assert.match(card, /Starting from/);
assert.match(card, /يبدأ من/);
assert.match(detail, /const isStartingFrom = pkg\.pricing_model === 'rate_matrix';/);
assert.match(detail, /isStartingFrom \? null :/);
assert.match(bulkImport, /'pricing_model', 'rate_matrix'/);
assert.match(bulkImport, /Starting from/);

console.log('Al Etihad package pricing UI contract passed');
