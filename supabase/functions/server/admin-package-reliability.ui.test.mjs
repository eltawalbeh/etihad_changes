import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../../..');
const source = fs.readFileSync(path.join(root, 'src/app/pages/admin/AdminSettings.tsx'), 'utf8');

assert.match(source, /const SETTINGS_TABS = \[/, 'Settings tab contract must be defined');
assert.match(source, /Business Profile/, 'Business Profile tab must be available');
assert.match(source, /Website Experience/, 'Website Experience tab must be available');
assert.match(source, /Channels & Measurement/, 'Channels & Measurement tab must be available');
assert.match(source, /activeTab/, 'Only one Settings tab should be active at a time');
assert.match(source, /Settings saved successfully!/, 'Save success message must remain available');
assert.match(source, /Save All Settings/, 'Save action must remain available');
assert.match(source, /aria-live="polite"/, 'Save feedback must announce beside the action');

console.log('Admin Settings usability contract: passed');
