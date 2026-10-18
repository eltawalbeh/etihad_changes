import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../../..');
const source = fs.readFileSync(path.join(root, 'src/app/routes.ts'), 'utf8');

assert.match(source, /lazy: load\(\(\) => import\('\.\/pages\/Home'\)/, 'Public routes must use route-level lazy loading');
assert.match(source, /lazy: load\(\(\) => import\('\.\/pages\/admin\/AdminDashboard'\)/, 'Admin routes must use route-level lazy loading');
assert.ok((source.match(/lazy: load/g) || []).length >= 10, 'Public and Admin pages must be split into lazy route chunks');
assert.doesNotMatch(source, /import \{ Home \} from '\.\/pages\/Home'/, 'Home must not be eagerly imported');
assert.doesNotMatch(source, /import \{ AdminDashboard \} from '\.\/pages\/admin\/AdminDashboard'/, 'AdminDashboard must not be eagerly imported');

console.log('Route code-splitting contract: passed');
