import assert from 'node:assert/strict';
import {
  PACKAGE_STATUS,
  applyPackageTransition,
  buildPackageMutation,
  diffPackage,
  getPackagePricePresentation,
  isPackagePublic,
  normalizePackageInput,
  validatePackageInput,
} from './package-lifecycle.js';

const basePackage = {
  id: 'istanbul-heritage-5',
  slug: 'istanbul-heritage-5',
  title_en: 'Istanbul Heritage Journey',
  title_ar: 'إسطنبول الحضارة والتاريخ',
  description_en: 'A verified Istanbul package.',
  description_ar: 'باقة إسطنبول موثقة.',
  destination_en: 'Turkey',
  destination_ar: 'تركيا',
  price: 3250,
  currency: 'SAR',
  duration_days: 5,
  max_travelers: 20,
  cover_image_url: 'https://example.com/istanbul.webp',
  includes_en: ['Flights'],
  includes_ar: ['رحلات جوية'],
  excludes_en: ['Personal expenses'],
  excludes_ar: ['المصاريف الشخصية'],
  itinerary_en: [{ day: 1, title: 'Arrival', description: 'Arrival details' }],
  itinerary_ar: [{ day: 1, title: 'الوصول', description: 'تفاصيل الوصول' }],
  status: 'draft',
  trip_type: 'external',
  is_active: false,
  is_featured: false,
  version: 1,
};

// A complete bilingual package may be saved as a draft.
{
  const result = validatePackageInput(basePackage, { forPublish: false });
  assert.deepEqual(result.errors, []);
}

// Publishing requires a complete, public-safe package and makes it publicly active.
{
  const next = applyPackageTransition(basePackage, PACKAGE_STATUS.published, '2026-09-01T10:00:00.000Z');
  assert.equal(next.status, PACKAGE_STATUS.published);
  assert.equal(next.is_active, true);
  assert.equal(next.published_at, '2026-09-01T10:00:00.000Z');
  assert.equal(next.archived_at, null);
}

// Archived packages must never remain visible or featured.
{
  const published = { ...basePackage, status: 'published', is_active: true, is_featured: true };
  const next = applyPackageTransition(published, PACKAGE_STATUS.archived, '2026-09-01T10:00:00.000Z');
  assert.equal(next.status, PACKAGE_STATUS.archived);
  assert.equal(next.is_active, false);
  assert.equal(next.is_featured, false);
  assert.equal(next.archived_at, '2026-09-01T10:00:00.000Z');
}

// An incomplete package cannot be published.
{
  const result = validatePackageInput({ ...basePackage, title_ar: '', cover_image_url: '' }, { forPublish: true });
  assert.ok(result.errors.some(error => error.field === 'title_ar'));
  assert.ok(result.errors.some(error => error.field === 'cover_image_url'));
}

// Imported option rows may use 0 to mean an unknown traveler limit; default the approved capacity to four.
{
  const normalized = normalizePackageInput({ ...basePackage, max_travelers: 0 });
  assert.equal(normalized.max_travelers, 4);
  assert.deepEqual(validatePackageInput(normalized, { forPublish: false }).errors, []);
}

// Server normalization strips caller-controlled audit and lifecycle fields.
{
  const normalized = normalizePackageInput({
    ...basePackage,
    id: 'attacker-controlled-id',
    version: 999,
    created_at: '2000-01-01T00:00:00.000Z',
    updated_at: '2000-01-01T00:00:00.000Z',
    archived_at: '2000-01-01T00:00:00.000Z',
    unexpected: 'discard me',
  });
  assert.equal(normalized.id, undefined);
  assert.equal(normalized.version, undefined);
  assert.equal(normalized.created_at, undefined);
  assert.equal(normalized.updated_at, undefined);
  assert.equal(normalized.archived_at, undefined);
  assert.equal(normalized.unexpected, undefined);
}

// Diffs identify material package edits without exposing unchanged data.
{
  const changes = diffPackage(basePackage, { ...basePackage, price: 3500, duration_days: 6 });
  assert.deepEqual(changes, {
    price: { before: 3250, after: 3500 },
    duration_days: { before: 5, after: 6 },
  });
}

// Every mutation advances an immutable version and produces a minimal audit diff.
{
  const result = buildPackageMutation({
    existing: { ...basePackage, status: 'published', is_active: true, version: 2 },
    input: { price: 3500 },
    requestedStatus: PACKAGE_STATUS.published,
    now: '2026-09-01T10:00:00.000Z',
  });
  assert.equal(result.package.version, 3);
  assert.equal(result.package.status, PACKAGE_STATUS.published);
  assert.deepEqual(result.changes, { price: { before: 3250, after: 3500 } });
  assert.equal(result.action, 'updated');
}

// An expired package is never public even if its saved lifecycle state is published.
{
  assert.equal(isPackagePublic({ ...basePackage, status: 'published', is_active: true, expiry_date: '2026-08-31' }, '2026-09-01T10:00:00.000Z'), false);
  assert.equal(isPackagePublic({ ...basePackage, status: 'published', is_active: true, expiry_date: '2026-09-01' }, '2026-09-01T10:00:00.000Z'), true);
}

// Kazakhstan rate-matrix offers retain their base rate but must be represented as a starting price.
{
  const normalized = normalizePackageInput({ ...basePackage, pricing_model: 'rate_matrix' });
  assert.equal(normalized.pricing_model, 'rate_matrix');
  assert.deepEqual(getPackagePricePresentation(normalized), { amount: 3250, isStartingFrom: true });
  assert.deepEqual(getPackagePricePresentation(basePackage), { amount: 3250, isStartingFrom: false });
  assert.equal(normalizePackageInput({ ...basePackage, title_en: 'Almaty 3-night Package — Rate Matrix' }).pricing_model, 'rate_matrix');
}

// A legacy stored value must not block non-destructive lifecycle actions.
{
  const legacyPackage = { ...basePackage, trip_type: 'International', status: 'published', is_active: true, version: 2 };
  const drafted = buildPackageMutation({
    existing: legacyPackage,
    input: {},
    requestedStatus: PACKAGE_STATUS.draft,
    now: '2026-09-02T10:00:00.000Z',
  });
  assert.deepEqual(drafted.errors, []);
  assert.equal(drafted.package.trip_type, 'external');
  assert.equal(drafted.package.status, PACKAGE_STATUS.draft);

  const archived = buildPackageMutation({
    existing: legacyPackage,
    input: {},
    requestedStatus: PACKAGE_STATUS.archived,
    now: '2026-09-02T10:00:00.000Z',
  });
  assert.deepEqual(archived.errors, []);
  assert.equal(archived.package.trip_type, 'external');
  assert.equal(archived.package.status, PACKAGE_STATUS.archived);
}

console.log('Al Etihad package lifecycle policy tests passed');
