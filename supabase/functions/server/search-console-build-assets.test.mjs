import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../../..');
const vite = fs.readFileSync(path.join(root, 'vite.config.ts'), 'utf8');

assert.match(vite, /name: 'emit-search-engine-files'/, 'Vite must emit Search Console files as build assets');
assert.match(vite, /\['robots\.txt', 'sitemap\.xml'\]/, 'Vite must emit both Search Console files');

console.log('Search Console build-assets contract: passed');
