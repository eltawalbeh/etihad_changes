import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { SEED_PACKAGES, SEED_ARTICLES, SEED_TEAM, DEFAULT_SETTINGS } from "./seed.ts";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";
import {
  canManageContent,
  canManagePackageLifecycle,
  canManageSettings,
  roleFromRecord,
} from "./auth-rbac.js";
import { PACKAGE_STATUS, buildPackageMutation, isPackagePublic } from "./package-lifecycle.js";

const app = new Hono();

app.use('*', logger(console.log));
app.use("/*", cors({
  origin: "*",
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  exposeHeaders: ["Content-Length"],
  maxAge: 600,
}));

// ─── Helpers ───────────────────────────────────────────────────────────────────

function generateId(): string {
  return crypto.randomUUID();
}

function slugify(text: string): string {
  return text.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function parseKvValue<T = any>(raw: any): T | null {
  if (!raw) return null;
  if (typeof raw === 'object') return raw as T;
  try { return JSON.parse(raw as string) as T; } catch { return null; }
}

function parseItems(raw: (string | null)[]): unknown[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(r => {
    if (!r) return null;
    if (typeof r === 'object') return r;
    try { return JSON.parse(r as string); } catch { return null; }
  }).filter(Boolean);
}

function asPackage(raw: any): any | null {
  const pkg = parseKvValue<any>(raw);
  if (!pkg || typeof pkg !== 'object') return null;
  const status = [PACKAGE_STATUS.draft, PACKAGE_STATUS.published, PACKAGE_STATUS.archived].includes(pkg.status)
    ? pkg.status
    : pkg.is_active ? PACKAGE_STATUS.published : PACKAGE_STATUS.draft;
  return {
    ...pkg,
    status,
    version: Math.max(1, Number(pkg.version) || 1),
    is_active: status === PACKAGE_STATUS.published,
    is_featured: status === PACKAGE_STATUS.published ? Boolean(pkg.is_featured) : false,
  };
}

function parsePackages(raw: any[]): any[] {
  return raw.map(asPackage).filter(Boolean);
}

async function persistPackageMutation({ previous, packageRecord, action, changes, actorId }: {
  previous: any | null;
  packageRecord: any;
  action: string;
  changes: Record<string, unknown>;
  actorId: string;
}) {
  const occurredAt = packageRecord.updated_at;
  const versionRecord = {
    package_id: packageRecord.id,
    version: packageRecord.version,
    action,
    snapshot: packageRecord,
    actor_user_id: actorId,
    created_at: occurredAt,
  };
  const auditRecord = {
    id: generateId(),
    package_id: packageRecord.id,
    version: packageRecord.version,
    action,
    actor_user_id: actorId,
    changed_fields: Object.keys(changes),
    changes,
    created_at: occurredAt,
    previous_version: previous?.version || null,
  };
  await kv.mset(
    [
      `pkg:${packageRecord.id}`,
      `pkgver:${packageRecord.id}:${packageRecord.version}`,
      `pkgaudit:${packageRecord.id}:${occurredAt}:${auditRecord.id}`,
    ],
    [JSON.stringify(packageRecord), JSON.stringify(versionRecord), JSON.stringify(auditRecord)],
  );
  return { versionRecord, auditRecord };
}

function requestedStatusFromBody(body: any): string | undefined {
  if ([PACKAGE_STATUS.draft, PACKAGE_STATUS.published, PACKAGE_STATUS.archived].includes(body?.status)) return body.status;
  if (typeof body?.is_active === 'boolean') return body.is_active ? PACKAGE_STATUS.published : PACKAGE_STATUS.draft;
  return undefined;
}

function requiresPackageLifecycleAuthority(body: any, existing: any = null) {
  const requestedStatus = requestedStatusFromBody(body);
  if (!existing) {
    return requestedStatus === PACKAGE_STATUS.published || requestedStatus === PACKAGE_STATUS.archived || body?.is_featured === true;
  }
  const currentStatus = existing.status || (existing.is_active ? PACKAGE_STATUS.published : PACKAGE_STATUS.draft);
  return (requestedStatus !== undefined && requestedStatus !== currentStatus)
    || (typeof body?.is_featured === 'boolean' && body.is_featured !== Boolean(existing.is_featured));
}

function contentOnlyPackageInput(body: any) {
  const { status: _status, is_active: _isActive, is_featured: _isFeatured, ...content } = body || {};
  return content;
}

function normalizeWhatsAppNumber(value: unknown): string | null {
  const digits = String(value ?? '').replace(/\D/g, '').replace(/^00/, '');
  return /^\d{8,15}$/.test(digits) ? digits : null;
}

function normalizeGoogleTagId(value: unknown): string | null {
  const tag = String(value ?? '').trim().toUpperCase();
  if (!tag) return '';
  return /^(G-[A-Z0-9]{6,}|GTM-[A-Z0-9]+)$/.test(tag) ? tag : null;
}

function normalizeSearchConsoleVerification(value: unknown): string | null {
  const token = String(value ?? '').trim();
  if (!token) return '';
  return /^[A-Za-z0-9_-]{10,256}$/.test(token) ? token : null;
}

function dateKey(value = new Date()) {
  return value.toISOString().slice(0, 10);
}

function getSupabase() {
  return createClient(
    Deno.env.get('SUPABASE_URL') || '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
  );
}

function authMiddleware() {
  return async (c: any, next: any) => {
    const authorization = c.req.header('Authorization');
    const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : '';
    if (!token) return c.json({ error: 'Unauthorized' }, 401);

    const { data: { user }, error } = await getSupabase().auth.getUser(token);
    if (error || !user) return c.json({ error: 'Unauthorized' }, 401);

    const { data: roleRecord, error: roleError } = await getSupabase()
      .from('admin_roles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle();
    if (roleError) {
      console.log('Admin role lookup failed:', roleError.message);
      return c.json({ error: 'Authorization service unavailable' }, 503);
    }

    const role = roleFromRecord(roleRecord);
    if (!role) return c.json({ error: 'Forbidden' }, 403);

    c.set('user', user);
    c.set('role', role);
    await next();
  };
}

function requireCapability(capability: (role: string) => boolean) {
  return async (c: any, next: any) => {
    const role = c.get('role') as string | undefined;
    if (!role || !capability(role)) return c.json({ error: 'Forbidden' }, 403);
    await next();
  };
}

const requireContentManagement = requireCapability(canManageContent);
const requirePackageLifecycleManagement = requireCapability(canManagePackageLifecycle);
const requireSettingsManagement = requireCapability(canManageSettings);

app.use('/make-server-cf64f9a2/admin/*', authMiddleware());

// ─── Seeding ──────────────────────────────────────────────────────────────────

async function seedIfNeeded() {
  // Migration is intentionally non-destructive: never reset real site settings or published records.
  try {
    // Run once per database: subsequent admin edits/deletions must remain authoritative.
    if (!(await kv.get('site:approved-team-v1'))) {
      for (const member of SEED_TEAM) {
        if (!(await kv.get(`tm:${member.id}`))) {
          await kv.set(`tm:${member.id}`, JSON.stringify(member));
        }
      }
      await kv.set('site:approved-team-v1', '1');
    }
    if (!(await kv.get('settings'))) await kv.set('settings', JSON.stringify(DEFAULT_SETTINGS));
    if (!(await kv.get('site:seeded'))) await kv.set('site:seeded', 'safe-v2');
  } catch (error) {
    console.error('Safe initialization failed', error);
    throw error;
  }
}

// ─── Health ───────────────────────────────────────────────────────────────────

app.get("/make-server-cf64f9a2/health", (c) => c.json({ status: "ok" }));

app.get("/make-server-cf64f9a2/admin/me", (c) => {
  const user = c.get('user') as { id: string; email?: string };
  const role = c.get('role') as string;
  return c.json({ user: { id: user.id, email: user.email || '', role } });
});


const clean = (input: unknown, max: number) => typeof input === 'string' ? input.trim().slice(0, max) : '';
app.post('/make-server-cf64f9a2/inquiries', async (c) => {
  try {
    const body = await c.req.json().catch(() => null);
    if (!body || typeof body !== 'object' || clean(body.website, 200)) return c.json({ error: 'Invalid request' }, 400);
    const source = clean(body.source, 40);
    if (!['contact', 'service', 'package_booking'].includes(source)) return c.json({ error: 'Invalid source' }, 400);
    const name = clean(body.name, 100), phone = clean(body.phone, 35), email = clean(body.email, 150);
    const message = clean(body.message, 2500), subject = clean(body.subject, 150);
    if (name.length < 2 || phone.length < 6 || message.length < 3) return c.json({ error: 'Name, phone, and message are required' }, 400);
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return c.json({ error: 'Invalid email' }, 400);
    if (JSON.stringify(body).length > 12000) return c.json({ error: 'Request too large' }, 413);
    // Best-effort burst control, use a gateway/WAF for stronger rate limiting.
    const requestIp = clean(c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || '', 90).split(',')[0];
    const hashBytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(requestIp || 'unidentified'));
    const hash = Array.from(new Uint8Array(hashBytes)).map(x => x.toString(16).padStart(2,'0')).join('').slice(0,24);
    const hour = new Date().toISOString().slice(0,13);
    const key = `inquiry-rate:${hour}:${hash}`;
    const count = Number(await kv.get(key) || 0);
    if (count >= 8) return c.json({ error: 'Too many requests; try later' }, 429);
    await kv.set(key, count + 1);
    const inquiry = {
      id: generateId(), source, name, phone, email, message, subject,
      package_id: clean(body.package_id, 100),
      created_at: new Date().toISOString(), status: 'new'
    };
    await kv.set(`inquiry:${inquiry.id}`, JSON.stringify(inquiry));
    return c.json({ success: true, reference: inquiry.id }, 201);
  } catch (error) {
    console.error('Inquiries submission failed', error);
    return c.json({ error: 'Could not save the inquiry. Please try WhatsApp.' }, 503);
  }
});
app.get('/make-server-cf64f9a2/admin/inquiries', requireContentManagement, async (c) => {
  try {
    const all = parseItems(await kv.getByPrefix('inquiry:') as any[]);
    return c.json({ inquiries: all.sort((a: any,b: any) => String(b.created_at).localeCompare(String(a.created_at))).slice(0, 200) });
  } catch { return c.json({ error: 'Unable to load inquiries' }, 503); }
});
app.delete('/make-server-cf64f9a2/admin/inquiries/:id', requireSettingsManagement, async (c) => {
  await kv.del(`inquiry:${c.req.param('id')}`);
  return c.json({ success: true });
});

// ─── Packages (Public) ───────────────────────────────────────────────────────

app.get("/make-server-cf64f9a2/packages", async (c) => {
  try {
    await seedIfNeeded();
    const raw = await kv.getByPrefix('pkg:');
    const packages = parsePackages(raw as any[])
      .filter((p: any) => isPackagePublic(p) && !['maldives-luxury-7','paris-europe-10','istanbul-heritage-5','bali-nature-8','japan-cherry-12','morocco-culture-6','dubai-weekend-3','saudi-al-ula-4'].includes(p.slug))
      .sort((a: any, b: any) => new Date(b.published_at || b.created_at).getTime() - new Date(a.published_at || a.created_at).getTime());
    return c.json({ packages });
  } catch (e) {
    console.log('Error fetching packages:', e);
    return c.json({ error: `Error fetching packages: ${e}` }, 500);
  }
});

// ─── Public WhatsApp click signals ────────────────────────────────────────────
// This records click intent only. It never stores customer names, phone numbers, or message contents.
app.post('/make-server-cf64f9a2/public-events/whatsapp', async (c) => {
  try {
    const rawBody = await c.req.text();
    if (rawBody.length > 512) return c.json({ error: 'Payload too large' }, 413);

    let body: any;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return c.json({ error: 'Invalid event payload' }, 400);
    }

    const allowedSources = new Set(['package_inquiry', 'package_booking', 'navbar', 'footer', 'floating_button', 'contact']);
    if (!allowedSources.has(body?.source)) return c.json({ error: 'Invalid event source' }, 400);

    const packageId = typeof body?.package_id === 'string' ? body.package_id.trim() : '';
    if (packageId && (!/^[A-Za-z0-9_-]{1,100}$/.test(packageId))) {
      return c.json({ error: 'Invalid package' }, 400);
    }

    let packageTitle = '';
    if (packageId) {
      const packageRecord = asPackage(await kv.get(`pkg:${packageId}`));
      if (!packageRecord || !isPackagePublic(packageRecord)) return c.json({ error: 'Package unavailable' }, 404);
      packageTitle = String(packageRecord.title_ar || packageRecord.title || '').slice(0, 180);
    }

    const occurredAt = new Date().toISOString();
    const event = { source: body.source, package_id: packageId, package_title: packageTitle, occurred_at: occurredAt };
    await kv.set(`analytics:wa:${dateKey()}:${generateId()}`, JSON.stringify(event));
    return c.json({ recorded: true }, 202);
  } catch {
    return c.json({ error: 'Invalid event payload' }, 400);
  }
});

// ─── Packages (Admin) ─────────────────────────────────────────────────────────

app.get("/make-server-cf64f9a2/admin/packages", requireContentManagement, async (c) => {
  try {
    await seedIfNeeded();
    const raw = await kv.getByPrefix('pkg:');
    const packages = parsePackages(raw as any[])
      .sort((a: any, b: any) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime());
    return c.json({ packages });
  } catch (e) {
    console.log('Admin packages fetch error:', e);
    return c.json({ error: `Error: ${e}` }, 500);
  }
});

// ─── WhatsApp click insights (Admin) ───────────────────────────────────────────
app.get('/make-server-cf64f9a2/admin/insights/whatsapp', requireContentManagement, async (c) => {
  try {
    const events = parseItems(await kv.getByPrefix('analytics:wa:') as any[])
      .filter((event: any) => event && typeof event.occurred_at === 'string');
    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
    const byPackage = new Map<string, { title: string; clicks: number }>();
    for (const event of events) {
      if (!event.package_id) continue;
      const current = byPackage.get(event.package_id) || { title: event.package_title || 'Package', clicks: 0 };
      current.clicks += 1;
      byPackage.set(event.package_id, current);
    }
    const topPackages = [...byPackage.entries()]
      .map(([package_id, value]) => ({ package_id, package_title: value.title, clicks: value.clicks }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 5);
    return c.json({
      total_clicks: events.length,
      last_30_days_clicks: events.filter((event: any) => new Date(event.occurred_at).getTime() >= thirtyDaysAgo).length,
      top_packages: topPackages,
    });
  } catch (e) {
    console.log('WhatsApp insights error:', e);
    return c.json({ error: 'Unable to load WhatsApp click insights' }, 500);
  }
});

app.post("/make-server-cf64f9a2/admin/packages", requireContentManagement, async (c) => {
  try {
    const body = await c.req.json();
    if (requiresPackageLifecycleAuthority(body, null) && !canManagePackageLifecycle(c.get('role'))) {
      return c.json({ error: 'Package lifecycle management requires Super Admin' }, 403);
    }
    const canManageLifecycle = canManagePackageLifecycle(c.get('role'));
    const input = canManageLifecycle ? body : contentOnlyPackageInput(body);
    const id = generateId();
    const mutation = buildPackageMutation({
      input: { ...input, slug: input.slug || slugify(input.title_en || id) },
      requestedStatus: canManageLifecycle ? (requestedStatusFromBody(body) || PACKAGE_STATUS.draft) : PACKAGE_STATUS.draft,
    });
    if (mutation.errors.length) return c.json({ error: 'Package validation failed', details: mutation.errors }, 400);
    const packageRecord = { ...mutation.package, id, slug: mutation.package.slug || slugify(mutation.package.title_en || id) };
    const user = c.get('user') as { id: string };
    await persistPackageMutation({ previous: null, packageRecord, action: mutation.action, changes: mutation.changes, actorId: user.id });
    return c.json({ package: packageRecord }, 201);
  } catch (e) {
    console.log('Create package error:', e);
    return c.json({ error: 'Error creating package' }, 500);
  }
});

app.put("/make-server-cf64f9a2/admin/packages/:id", requireContentManagement, async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const existing = asPackage(await kv.get(`pkg:${id}`));
    if (!existing) return c.json({ error: 'Package not found' }, 404);
    if (requiresPackageLifecycleAuthority(body, existing) && !canManagePackageLifecycle(c.get('role'))) {
      return c.json({ error: 'Package lifecycle management requires Super Admin' }, 403);
    }
    const canManageLifecycle = canManagePackageLifecycle(c.get('role'));
    const input = canManageLifecycle ? body : contentOnlyPackageInput(body);
    if (requestedStatusFromBody(input) === PACKAGE_STATUS.archived) return c.json({ error: 'Use the archive endpoint for this package' }, 400);
    const mutation = buildPackageMutation({ existing, input, requestedStatus: canManageLifecycle ? requestedStatusFromBody(body) : undefined });
    if (mutation.errors.length) return c.json({ error: 'Package validation failed', details: mutation.errors }, 400);
    const packageRecord = { ...mutation.package, id };
    const user = c.get('user') as { id: string };
    await persistPackageMutation({ previous: existing, packageRecord, action: mutation.action, changes: mutation.changes, actorId: user.id });
    return c.json({ package: packageRecord });
  } catch (e) {
    console.log('Update package error:', e);
    return c.json({ error: 'Error updating package' }, 500);
  }
});

app.post("/make-server-cf64f9a2/admin/packages/:id/archive", requirePackageLifecycleManagement, async (c) => {
  try {
    const id = c.req.param('id');
    const existing = asPackage(await kv.get(`pkg:${id}`));
    if (!existing) return c.json({ error: 'Package not found' }, 404);
    const mutation = buildPackageMutation({ existing, requestedStatus: PACKAGE_STATUS.archived });
    if (mutation.errors.length) return c.json({ error: 'Package validation failed', details: mutation.errors }, 400);
    const user = c.get('user') as { id: string };
    await persistPackageMutation({ previous: existing, packageRecord: mutation.package, action: 'archived', changes: mutation.changes, actorId: user.id });
    return c.json({ package: mutation.package });
  } catch (e) {
    console.log('Archive package error:', e);
    return c.json({ error: 'Error archiving package' }, 500);
  }
});

app.get("/make-server-cf64f9a2/admin/packages/:id/versions", requirePackageLifecycleManagement, async (c) => {
  try {
    const id = c.req.param('id');
    const versions = parseItems(await kv.getByPrefix(`pkgver:${id}:`) as any[])
      .sort((a: any, b: any) => Number(b.version) - Number(a.version))
      .map((record: any) => ({ package_id: record.package_id, version: record.version, action: record.action, actor_user_id: record.actor_user_id, created_at: record.created_at }));
    return c.json({ versions });
  } catch (e) {
    console.log('Package versions fetch error:', e);
    return c.json({ error: 'Error fetching package versions' }, 500);
  }
});

app.get("/make-server-cf64f9a2/admin/packages/:id/audit", requirePackageLifecycleManagement, async (c) => {
  try {
    const id = c.req.param('id');
    const audit = parseItems(await kv.getByPrefix(`pkgaudit:${id}:`) as any[])
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return c.json({ audit });
  } catch (e) {
    console.log('Package audit fetch error:', e);
    return c.json({ error: 'Error fetching package audit history' }, 500);
  }
});

app.post("/make-server-cf64f9a2/admin/packages/:id/restore/:version", requirePackageLifecycleManagement, async (c) => {
  try {
    const id = c.req.param('id');
    const version = Number(c.req.param('version'));
    if (!Number.isInteger(version) || version < 1) return c.json({ error: 'Invalid version' }, 400);
    const existing = asPackage(await kv.get(`pkg:${id}`));
    if (!existing) return c.json({ error: 'Package not found' }, 404);
    const versionRecord = parseKvValue<any>(await kv.get(`pkgver:${id}:${version}`));
    if (!versionRecord?.snapshot) return c.json({ error: 'Package version not found' }, 404);
    const restoredStatus = versionRecord.snapshot.status === PACKAGE_STATUS.archived ? PACKAGE_STATUS.draft : versionRecord.snapshot.status;
    const mutation = buildPackageMutation({ existing, input: versionRecord.snapshot, requestedStatus: restoredStatus });
    if (mutation.errors.length) return c.json({ error: 'Package validation failed', details: mutation.errors }, 400);
    const user = c.get('user') as { id: string };
    await persistPackageMutation({ previous: existing, packageRecord: mutation.package, action: 'restored', changes: mutation.changes, actorId: user.id });
    return c.json({ package: mutation.package, restored_from_version: version });
  } catch (e) {
    console.log('Restore package error:', e);
    return c.json({ error: 'Error restoring package version' }, 500);
  }
});

// Legacy DELETE is intentionally retained as a non-destructive archive operation.
app.delete("/make-server-cf64f9a2/admin/packages/:id", requirePackageLifecycleManagement, async (c) => {
  try {
    const id = c.req.param('id');
    const existing = asPackage(await kv.get(`pkg:${id}`));
    if (!existing) return c.json({ error: 'Package not found' }, 404);
    const mutation = buildPackageMutation({ existing, requestedStatus: PACKAGE_STATUS.archived });
    if (mutation.errors.length) return c.json({ error: 'Package validation failed', details: mutation.errors }, 400);
    const user = c.get('user') as { id: string };
    await persistPackageMutation({ previous: existing, packageRecord: mutation.package, action: 'archived', changes: mutation.changes, actorId: user.id });
    return c.json({ package: mutation.package, archived: true });
  } catch (e) {
    console.log('Archive package error:', e);
    return c.json({ error: 'Error archiving package' }, 500);
  }
});

// ─── Package Bulk Actions ────────────────────────────────────────────────────
// This is deliberately separate from bulk import: operators select existing IDs
// and each record gets its own lifecycle/version/audit mutation.
app.post("/make-server-cf64f9a2/admin/packages/bulk-actions", requirePackageLifecycleManagement, async (c) => {
  try {
    const body = await c.req.json();
    const ids = Array.isArray(body?.ids) ? [...new Set(body.ids.filter((id: unknown) => typeof id === 'string' && id.trim()))] : [];
    const action = body?.action;
    const validActions = new Set(['publish', 'draft', 'feature', 'unfeature', 'archive']);
    if (!validActions.has(action)) return c.json({ error: 'Invalid bulk action' }, 400);
    if (!ids.length) return c.json({ error: 'Select at least one package' }, 400);
    if (ids.length > 100) return c.json({ error: 'Bulk actions are limited to 100 packages at a time' }, 400);

    const records = parsePackages(await kv.mget(ids.map((id: string) => `pkg:${id}`)) as any[]);
    const byId = new Map(records.map((pkg: any) => [pkg.id, pkg]));
    const user = c.get('user') as { id: string };
    const results: { id: string; title: string; status: 'ok' | 'error'; package?: any; error?: string }[] = [];

    for (const id of ids) {
      const existing = byId.get(id);
      if (!existing) {
        results.push({ id, title: '', status: 'error', error: 'Package not found' });
        continue;
      }
      if (existing.status === PACKAGE_STATUS.archived && action !== 'archive') {
        results.push({ id, title: existing.title_en || '', status: 'error', error: 'Archived packages must be restored from version history first' });
        continue;
      }

      const input = action === 'feature' ? { is_featured: true } : action === 'unfeature' ? { is_featured: false } : {};
      const requestedStatus = action === 'publish' ? PACKAGE_STATUS.published
        : action === 'draft' ? PACKAGE_STATUS.draft
        : action === 'archive' ? PACKAGE_STATUS.archived
        : undefined;
      const mutation = buildPackageMutation({ existing, input, requestedStatus });
      if (mutation.errors.length) {
        results.push({ id, title: existing.title_en || '', status: 'error', error: mutation.errors.map(item => item.message).join('; ') });
        continue;
      }
      try {
        await persistPackageMutation({ previous: existing, packageRecord: mutation.package, action: action === 'archive' ? 'archived' : mutation.action, changes: mutation.changes, actorId: user.id });
        results.push({ id, title: mutation.package.title_en || '', status: 'ok', package: mutation.package });
      } catch (e) {
        console.log('Bulk package action item error:', id, e);
        results.push({ id, title: existing.title_en || '', status: 'error', error: 'Package mutation failed' });
      }
    }

    const succeeded = results.filter(result => result.status === 'ok').length;
    return c.json({ action, total: ids.length, succeeded, failed: ids.length - succeeded, results });
  } catch (e) {
    console.log('Bulk package action error:', e);
    return c.json({ error: 'Bulk package action failed' }, 500);
  }
});

// ─── Articles (Public) ────────────────────────────────────────────────────────

app.get("/make-server-cf64f9a2/articles", async (c) => {
  try {
    await seedIfNeeded();
    const raw = await kv.getByPrefix('art:');
    const articles = parseItems(raw as (string | null)[])
      .filter((a: any) => a.is_published && !['top-destinations-2026','schengen-visa-tips','family-travel-guide','japan-cherry-blossom-season'].includes(a.slug))
      .sort((a: any, b: any) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
    return c.json({ articles });
  } catch (e) {
    console.log('Error fetching articles:', e);
    return c.json({ error: `Error fetching articles: ${e}` }, 500);
  }
});

// ─── Articles (Admin) ─────────────────────────────────────────────────────────

app.get("/make-server-cf64f9a2/admin/articles", requireContentManagement, async (c) => {
  try {
    await seedIfNeeded();
    const raw = await kv.getByPrefix('art:');
    const articles = parseItems(raw as (string | null)[])
      .sort((a: any, b: any) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
    return c.json({ articles });
  } catch (e) {
    console.log('Admin articles fetch error:', e);
    return c.json({ error: `Error: ${e}` }, 500);
  }
});

app.post("/make-server-cf64f9a2/admin/articles", requireContentManagement, async (c) => {
  try {
    const body = await c.req.json();
    const id = generateId();
    const slug = body.slug || slugify(body.title_en || id);
    const article = {
      ...body,
      id,
      slug,
      published_at: body.published_at || new Date().toISOString(),
    };
    await kv.set(`art:${id}`, JSON.stringify(article));
    return c.json({ article }, 201);
  } catch (e) {
    console.log('Create article error:', e);
    return c.json({ error: `Error creating article: ${e}` }, 500);
  }
});

app.put("/make-server-cf64f9a2/admin/articles/:id", requireContentManagement, async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const existing = await kv.get(`art:${id}`);
    if (!existing) return c.json({ error: 'Article not found' }, 404);
    const allowedApproval = body.approval_status === 'approved' ? canManageSettings(c.get('role')) : true;
    if (!allowedApproval) return c.json({ error: 'Only superadmins can approve team members' }, 403);
    const updated = { ...parseKvValue(existing), ...body, id };
    await kv.set(`art:${id}`, JSON.stringify(updated));
    return c.json({ article: updated });
  } catch (e) {
    console.log('Update article error:', e);
    return c.json({ error: `Error updating article: ${e}` }, 500);
  }
});

app.delete("/make-server-cf64f9a2/admin/articles/:id", requireContentManagement, async (c) => {
  try {
    const id = c.req.param('id');
    await kv.del(`art:${id}`);
    return c.json({ success: true });
  } catch (e) {
    console.log('Delete article error:', e);
    return c.json({ error: `Error deleting article: ${e}` }, 500);
  }
});

// ─── Team (Public) ────────────────────────────────────────────────────────────

app.get("/make-server-cf64f9a2/team", async (c) => {
  try {
    await seedIfNeeded();
    const raw = await kv.getByPrefix('tm:');
    const team = parseItems(raw as (string | null)[])
      .filter((member: any) => member.approval_status === 'approved')
      .sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0));
    return c.json({ team });
  } catch (e) {
    console.log('Error fetching team:', e);
    return c.json({ error: `Error fetching team: ${e}` }, 500);
  }
});

// ─── Team (Admin) ─────────────────────────────────────────────────────────────

app.get("/make-server-cf64f9a2/admin/team", requireContentManagement, async (c) => {
  try {
    await seedIfNeeded();
    const raw = await kv.getByPrefix('tm:');
    const team = parseItems(raw as (string | null)[])
      .sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0));
    return c.json({ team });
  } catch (e) {
    console.log('Admin team fetch error:', e);
    return c.json({ error: `Error: ${e}` }, 500);
  }
});

app.post("/make-server-cf64f9a2/admin/team", requireContentManagement, async (c) => {
  try {
    const body = await c.req.json();
    const id = generateId();
    const member = { ...body, id, approval_status: body.approval_status === 'approved' && canManageSettings(c.get('role')) ? 'approved' : 'pending' };
    await kv.set(`tm:${id}`, JSON.stringify(member));
    return c.json({ member }, 201);
  } catch (e) {
    console.log('Create team member error:', e);
    return c.json({ error: `Error creating team member: ${e}` }, 500);
  }
});

app.put("/make-server-cf64f9a2/admin/team/:id", requireContentManagement, async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const existing = await kv.get(`tm:${id}`);
    if (!existing) return c.json({ error: 'Team member not found' }, 404);
    const updated = { ...parseKvValue(existing), ...body, id };
    await kv.set(`tm:${id}`, JSON.stringify(updated));
    return c.json({ member: updated });
  } catch (e) {
    console.log('Update team member error:', e);
    return c.json({ error: `Error updating team member: ${e}` }, 500);
  }
});

app.delete("/make-server-cf64f9a2/admin/team/:id", requireContentManagement, async (c) => {
  try {
    const id = c.req.param('id');
    await kv.del(`tm:${id}`);
    return c.json({ success: true });
  } catch (e) {
    console.log('Delete team member error:', e);
    return c.json({ error: `Error deleting team member: ${e}` }, 500);
  }
});

// ─── Settings (Public) ───────────────────────────────────────────────────────

app.get("/make-server-cf64f9a2/settings", async (c) => {
  try {
    await seedIfNeeded();
    const raw = await kv.get('settings');
    const settings = raw ? parseKvValue(raw) || DEFAULT_SETTINGS : DEFAULT_SETTINGS;
    return c.json({ settings });
  } catch (e) {
    console.log('Error fetching settings:', e);
    return c.json({ settings: DEFAULT_SETTINGS });
  }
});

// ─── Settings (Admin) ─────────────────────────────────────────────────────────

app.put("/make-server-cf64f9a2/admin/settings", requireSettingsManagement, async (c) => {
  try {
    const body = await c.req.json();
    const existing = await kv.get('settings');
    const current = existing ? parseKvValue(existing) || DEFAULT_SETTINGS : DEFAULT_SETTINGS;
    if (Object.prototype.hasOwnProperty.call(body, 'whatsapp')) {
      const whatsapp = normalizeWhatsAppNumber(body.whatsapp);
      if (!whatsapp) return c.json({ error: 'WhatsApp number must include a valid country code and number' }, 400);
      body.whatsapp = whatsapp;
    }
    if (Object.prototype.hasOwnProperty.call(body, 'google_tag_id')) {
      const tagId = normalizeGoogleTagId(body.google_tag_id);
      if (tagId === null) return c.json({ error: 'Google Tag ID must begin with G- or GTM-' }, 400);
      body.google_tag_id = tagId;
    }
    if (Object.prototype.hasOwnProperty.call(body, 'search_console_verification')) {
      const verification = normalizeSearchConsoleVerification(body.search_console_verification);
      if (verification === null) return c.json({ error: 'Search Console verification code format is invalid' }, 400);
      body.search_console_verification = verification;
    }
    if (Object.prototype.hasOwnProperty.call(body, 'hero_package_ids')) {
      const heroIds = Array.isArray(body.hero_package_ids)
        ? [...new Set(body.hero_package_ids.filter((id: unknown) => typeof id === 'string' && id.trim()))]
        : [];
      if (heroIds.length > 3) return c.json({ error: 'Choose a maximum of three hero packages' }, 400);
      const heroPackages = parsePackages(await kv.mget(heroIds.map((id: string) => `pkg:${id}`)) as any[]);
      if (heroPackages.length !== heroIds.length || heroPackages.some((pkg: any) => !isPackagePublic(pkg))) {
        return c.json({ error: 'Hero packages must exist, be published, and be publicly available' }, 400);
      }
      body.hero_package_ids = heroIds;
    }
    const updated = { ...current, ...body };
    await kv.set('settings', JSON.stringify(updated));
    return c.json({ settings: updated });
  } catch (e) {
    console.log('Update settings error:', e);
    return c.json({ error: `Error updating settings: ${e}` }, 500);
  }
});

// ─── Admin Re-seed ────────────────────────────────────────────────────────────

app.post("/make-server-cf64f9a2/admin/seed", requireSettingsManagement, async (c) => {
  return c.json({ error: 'Destructive re-seeding is disabled. Existing content is preserved.' }, 410);
});

// ─── Image Upload ─────────────────────────────────────────────────────────────

app.post('/make-server-cf64f9a2/admin/upload-image', requirePackageLifecycleManagement, async (c) => {
  try {
    const contentType = c.req.header('Content-Type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return c.json({ error: 'Content-Type must be multipart/form-data' }, 400);
    }

    const formData = await c.req.raw.formData();
    const file = formData.get('file') as File | null;
    if (!file) return c.json({ error: 'No file provided' }, 400);

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
    if (!allowedTypes.includes(file.type)) {
      return c.json({ error: `Invalid file type: ${file.type}. Allowed: ${allowedTypes.join(', ')}` }, 400);
    }

    // Max 5MB
    if (file.size > 5 * 1024 * 1024) {
      return c.json({ error: 'File too large. Maximum 5MB.' }, 400);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // The deployment creates this private bucket. Avoid a listBuckets round-trip on every upload.
    const bucketName = 'make-cf64f9a2-images';

    // Generate unique filename
    const ext = file.name.split('.').pop() || 'jpg';
    const fileName = `pkg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const filePath = `packages/${fileName}`;

    // Read file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, arrayBuffer, {
        contentType: file.type,
        cacheControl: '31536000',
        upsert: false,
      });

    if (uploadError) {
      console.log('Upload error:', uploadError);
      return c.json({ error: `Upload failed: ${uploadError.message}` }, 500);
    }

    // Create signed URL (valid for 1 year)
    const { data: signedUrlData, error: signError } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(filePath, 365 * 24 * 60 * 60); // 1 year

    if (signError || !signedUrlData) {
      console.log('Signed URL error:', signError);
      return c.json({ error: `Failed to create signed URL: ${signError?.message}` }, 500);
    }

    return c.json({ url: signedUrlData.signedUrl, path: filePath });
  } catch (e) {
    console.log('Image upload error:', e);
    return c.json({ error: `Image upload failed: ${e}` }, 500);
  }
});

// ─── Bulk Package Import ──────────────────────────────────────────────────────

app.post('/make-server-cf64f9a2/admin/packages/bulk', requirePackageLifecycleManagement, async (c) => {
  try {
    const { packages: pkgList } = await c.req.json();
    if (!Array.isArray(pkgList) || pkgList.length === 0) {
      return c.json({ error: 'No packages provided. Expected { packages: [...] }' }, 400);
    }

    const results: { index: number; id: string; title: string; status: 'ok' | 'error'; error?: string }[] = [];

    const user = c.get('user') as { id: string };
    for (let i = 0; i < pkgList.length; i++) {
      try {
        const pkg = pkgList[i];
        const id = generateId();
        const list = (value: unknown) => Array.isArray(value)
          ? value
          : typeof value === 'string' ? value.split('|').map(item => item.trim()).filter(Boolean) : [];
        const mutation = buildPackageMutation({
          input: {
            ...pkg,
            slug: pkg.slug || slugify(pkg.title_en || id),
            gallery_urls: list(pkg.gallery_urls),
            includes_en: list(pkg.includes_en),
            includes_ar: list(pkg.includes_ar),
            excludes_en: list(pkg.excludes_en),
            excludes_ar: list(pkg.excludes_ar),
            is_featured: pkg.is_featured === true || pkg.is_featured === 'true' || pkg.is_featured === 'yes' || pkg.is_featured === '1',
          },
          // Bulk import creates reviewable drafts only; publishing remains an explicit later action.
          requestedStatus: PACKAGE_STATUS.draft,
        });
        if (mutation.errors.length) {
          results.push({ index: i, id: '', title: pkg.title_en || '', status: 'error', error: mutation.errors.map(item => item.message).join('; ') });
          continue;
        }
        const packageRecord = { ...mutation.package, id, slug: mutation.package.slug || slugify(mutation.package.title_en || id) };
        await persistPackageMutation({ previous: null, packageRecord, action: 'bulk_imported', changes: mutation.changes, actorId: user.id });
        results.push({ index: i, id, title: packageRecord.title_en || '', status: 'ok' });
      } catch {
        results.push({ index: i, id: '', title: pkgList[i]?.title_en || '', status: 'error', error: 'Import failed' });
      }
    }

    const successCount = results.filter(r => r.status === 'ok').length;
    const errorCount = results.filter(r => r.status === 'error').length;
    console.log(`Bulk import: ${successCount} succeeded, ${errorCount} failed out of ${pkgList.length} total`);
    return c.json({ success: true, total: pkgList.length, imported: successCount, errors: errorCount, results });
  } catch (e) {
    console.log('Bulk import error:', e);
    return c.json({ error: `Bulk import failed: ${e}` }, 500);
  }
});


Deno.serve(app.fetch);