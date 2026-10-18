import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const history = await readFile(new URL('../../../src/app/pages/admin/AdminPackageHistory.tsx', import.meta.url), 'utf8');
const routes = await readFile(new URL('../../../src/app/routes.ts', import.meta.url), 'utf8');

assert.match(history, /Version History/);
assert.match(history, /\/versions/);
assert.match(history, /\/restore\//);
assert.match(routes, /packages\/:id\/history/);

console.log('Al Etihad package history UI contract passed');
