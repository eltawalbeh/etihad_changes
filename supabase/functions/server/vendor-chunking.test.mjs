import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../../..');
const source = fs.readFileSync(path.join(root, 'vite.config.ts'), 'utf8');

assert.match(source, /manualChunks/, 'Vite must define vendor chunk splitting');
assert.match(source, /vendor-xlsx/, 'Spreadsheet dependency should not load with the public entry chunk');
assert.match(source, /vendor-charts/, 'Chart dependency should not load with the public entry chunk');
console.log('Vendor chunking contract: passed');
