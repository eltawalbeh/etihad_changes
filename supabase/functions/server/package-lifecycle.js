export const PACKAGE_STATUS = Object.freeze({
  draft: 'draft',
  published: 'published',
  archived: 'archived',
});

const STATUS_VALUES = new Set(Object.values(PACKAGE_STATUS));

const ALLOWED_FIELDS = new Set([
  'slug',
  'title_en', 'title_ar',
  'description_en', 'description_ar',
  'destination_en', 'destination_ar',
  'price', 'currency', 'duration_days', 'departure_city', 'max_travelers',
  'pricing_model', 'rate_matrix',
  'cover_image_url', 'gallery_urls',
  'includes_en', 'includes_ar', 'excludes_en', 'excludes_ar',
  'trip_type', 'is_featured', 'flag',
  'itinerary_en', 'itinerary_ar',
  'travel_dates', 'availability', 'expiry_date',
  'seo_title_en', 'seo_title_ar', 'seo_description_en', 'seo_description_ar',
  'status',
]);

const REQUIRED_FOR_PUBLICATION = [
  'title_en', 'title_ar',
  'description_en', 'description_ar',
  'destination_en', 'destination_ar',
  'cover_image_url',
];

function cleanText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeStoredTripType(value) {
  const legacyValue = cleanText(value).toLowerCase();
  if (['internal', 'domestic', 'local'].includes(legacyValue)) return 'internal';
  return 'external';
}

function cleanStringArray(value) {
  return Array.isArray(value)
    ? value.map(cleanText).filter(Boolean)
    : [];
}

function cleanRateMatrix(value) {
  if (Array.isArray(value)) return value;
  if (typeof value !== 'string' || !value.trim()) return undefined;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
}

function cleanItinerary(value) {
  return Array.isArray(value)
    ? value
      .map((item, index) => ({
        day: Number.isInteger(Number(item?.day)) && Number(item.day) > 0 ? Number(item.day) : index + 1,
        title: cleanText(item?.title),
        description: cleanText(item?.description),
      }))
      .filter(item => item.title || item.description)
    : [];
}

export function normalizePackageInput(input = {}) {
  const normalized = {};
  for (const key of ALLOWED_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(input, key)) normalized[key] = input[key];
  }

  for (const key of [
    'slug', 'title_en', 'title_ar', 'description_en', 'description_ar',
    'destination_en', 'destination_ar', 'currency', 'departure_city', 'pricing_model',
    'cover_image_url', 'trip_type', 'flag', 'travel_dates', 'availability',
    'expiry_date', 'seo_title_en', 'seo_title_ar', 'seo_description_en', 'seo_description_ar',
  ]) {
    if (key in normalized) normalized[key] = cleanText(normalized[key]);
  }

  for (const key of ['gallery_urls', 'includes_en', 'includes_ar', 'excludes_en', 'excludes_ar']) {
    if (key in normalized) normalized[key] = cleanStringArray(normalized[key]);
  }
  if ('rate_matrix' in normalized) {
    const rateMatrix = cleanRateMatrix(normalized.rate_matrix);
    if (rateMatrix) normalized.rate_matrix = rateMatrix;
    else delete normalized.rate_matrix;
  }
  for (const key of ['itinerary_en', 'itinerary_ar']) {
    if (key in normalized) normalized[key] = cleanItinerary(normalized[key]);
  }
  for (const key of ['price', 'duration_days', 'max_travelers']) {
    if (key in normalized) normalized[key] = Number(normalized[key]);
  }
  // The intake register uses 0 where a traveler cap is not supplied by the source.
  // The approved operational default is four travelers for those package options.
  if ('max_travelers' in normalized && (!Number.isFinite(normalized.max_travelers) || normalized.max_travelers < 1)) {
    normalized.max_travelers = 4;
  }
  for (const key of ['is_featured']) {
    if (key in normalized) normalized[key] = normalized[key] === true;
  }
  if ('status' in normalized && !STATUS_VALUES.has(normalized.status)) delete normalized.status;
  if ('pricing_model' in normalized && !['fixed', 'rate_matrix'].includes(normalized.pricing_model)) delete normalized.pricing_model;
  if (!normalized.pricing_model && /\brate matrix\b/i.test(normalized.title_en || '')) {
    normalized.pricing_model = 'rate_matrix';
  }

  return normalized;
}

export function validatePackageInput(pkg = {}, { forPublish = false } = {}) {
  const errors = [];
  if (forPublish) {
    for (const field of REQUIRED_FOR_PUBLICATION) {
      if (!cleanText(pkg[field])) errors.push({ field, message: `${field} is required before publishing` });
    }
    if (!Array.isArray(pkg.includes_en) || pkg.includes_en.length === 0) {
      errors.push({ field: 'includes_en', message: 'includes_en is required before publishing' });
    }
    if (!Array.isArray(pkg.includes_ar) || pkg.includes_ar.length === 0) {
      errors.push({ field: 'includes_ar', message: 'includes_ar is required before publishing' });
    }
  }
  if (pkg.price !== undefined && (!Number.isFinite(Number(pkg.price)) || Number(pkg.price) <= 0)) {
    errors.push({ field: 'price', message: 'price must be greater than zero' });
  }
  if (pkg.duration_days !== undefined && (!Number.isInteger(Number(pkg.duration_days)) || Number(pkg.duration_days) < 1)) {
    errors.push({ field: 'duration_days', message: 'duration_days must be a positive whole number' });
  }
  if (pkg.max_travelers !== undefined && (!Number.isInteger(Number(pkg.max_travelers)) || Number(pkg.max_travelers) < 1)) {
    errors.push({ field: 'max_travelers', message: 'max_travelers must be a positive whole number' });
  }
  if (pkg.trip_type && !['internal', 'external'].includes(pkg.trip_type)) {
    errors.push({ field: 'trip_type', message: 'trip_type must be internal or external' });
  }
  if (pkg.status && !STATUS_VALUES.has(pkg.status)) {
    errors.push({ field: 'status', message: 'status is invalid' });
  }
  if (pkg.pricing_model && !['fixed', 'rate_matrix'].includes(pkg.pricing_model)) {
    errors.push({ field: 'pricing_model', message: 'pricing_model must be fixed or rate_matrix' });
  }
  if (forPublish && pkg.pricing_model === 'rate_matrix' && !Array.isArray(pkg.rate_matrix)) {
    errors.push({ field: 'rate_matrix', message: 'rate_matrix is required before publishing a rate_matrix package' });
  }
  return { errors };
}

export function applyPackageTransition(existing, status, now) {
  if (!STATUS_VALUES.has(status)) throw new Error('Invalid package status');
  const timestamp = now || new Date().toISOString();
  const next = {
    ...existing,
    status,
    is_active: status === PACKAGE_STATUS.published,
    is_featured: status === PACKAGE_STATUS.published ? Boolean(existing.is_featured) : false,
    updated_at: timestamp,
  };
  if (status === PACKAGE_STATUS.published) {
    next.published_at = existing.published_at || timestamp;
    next.archived_at = null;
  } else if (status === PACKAGE_STATUS.archived) {
    next.archived_at = timestamp;
  } else {
    next.archived_at = null;
  }
  return next;
}

export function buildPackageMutation({ existing = null, input = {}, requestedStatus, now } = {}) {
  const timestamp = now || new Date().toISOString();
  const normalized = normalizePackageInput(input);
  const stored = existing ? { ...existing, trip_type: normalizeStoredTripType(existing.trip_type) } : null;
  const base = stored
    ? { ...stored, ...normalized }
    : { ...normalized, status: PACKAGE_STATUS.draft, is_active: false, is_featured: Boolean(normalized.is_featured) };
  const priorStatus = stored?.status || (stored?.is_active ? PACKAGE_STATUS.published : PACKAGE_STATUS.draft);
  const status = requestedStatus || normalized.status || priorStatus;
  if (!STATUS_VALUES.has(status)) throw new Error('Invalid package status');

  const transitioned = applyPackageTransition({ ...base, status: priorStatus }, status, timestamp);
  const validation = validatePackageInput(transitioned, { forPublish: status === PACKAGE_STATUS.published });
  if (validation.errors.length) return { errors: validation.errors };

  const version = existing ? Math.max(1, Number(existing.version) || 1) + 1 : 1;
  const packageRecord = {
    ...transitioned,
    version,
    created_at: existing?.created_at || timestamp,
    updated_at: timestamp,
  };
  const changes = existing ? diffPackage(existing, packageRecord) : diffPackage({}, packageRecord);
  const action = !existing
    ? (status === PACKAGE_STATUS.published ? 'published' : 'created')
    : status !== priorStatus
      ? (status === PACKAGE_STATUS.archived ? 'archived' : status === PACKAGE_STATUS.published ? 'published' : 'drafted')
      : 'updated';
  return { package: packageRecord, changes, action, errors: [] };
}

export function isPackagePublic(pkg = {}, now = new Date().toISOString()) {
  if (pkg.status !== PACKAGE_STATUS.published || pkg.is_active !== true) return false;
  const expiryDate = cleanText(pkg.expiry_date);
  if (!expiryDate) return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(expiryDate)) return false;
  const today = new Date(now).toISOString().slice(0, 10);
  return expiryDate >= today;
}

export function getPackagePricePresentation(pkg = {}) {
  return {
    amount: Number(pkg.price),
    isStartingFrom: pkg.pricing_model === 'rate_matrix',
  };
}

export function diffPackage(before = {}, after = {}) {
  const changes = {};
  const fields = new Set([...Object.keys(before), ...Object.keys(after)]);
  for (const field of fields) {
    if (['id', 'created_at', 'updated_at', 'version', 'published_at', 'archived_at'].includes(field)) continue;
    const previous = JSON.stringify(before[field]);
    const next = JSON.stringify(after[field]);
    if (previous !== next) changes[field] = { before: before[field], after: after[field] };
  }
  return changes;
}
