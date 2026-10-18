import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  canManageContent,
  canManagePackageLifecycle,
  canManageSettings,
  canManageUsers,
  isSupportedAdminRole,
  roleFromRecord,
} from "./auth-rbac.js";

assert.equal(isSupportedAdminRole("superadmin"), true);
assert.equal(isSupportedAdminRole("editor"), true);
assert.equal(isSupportedAdminRole("moderator"), false);

assert.equal(roleFromRecord({ role: "superadmin" }), "superadmin");
assert.equal(roleFromRecord({ role: "editor" }), "editor");
assert.equal(roleFromRecord({ role: "owner" }), null);
assert.equal(roleFromRecord(null), null);

assert.equal(canManageContent("superadmin"), true);
assert.equal(canManageContent("editor"), true);
assert.equal(canManageContent("unknown"), false);

// Archive, restore, and audit-history access remain Super Admin-only.
assert.equal(canManagePackageLifecycle("superadmin"), true);
assert.equal(canManagePackageLifecycle("editor"), false);

assert.equal(canManageSettings("superadmin"), true);
assert.equal(canManageSettings("editor"), false);

assert.equal(canManageUsers("superadmin"), true);
assert.equal(canManageUsers("editor"), false);

// Content editors may edit copy, but cannot publish, draft, or change Featured state.
const server = readFileSync(resolve(import.meta.dirname, 'index.tsx'), 'utf8');
assert.match(server, /function requiresPackageLifecycleAuthority\(body: any, existing: any = null\)/);
assert.match(server, /if \(requiresPackageLifecycleAuthority\(body, null\) && !canManagePackageLifecycle\(c\.get\('role'\)\)\)/);
assert.match(server, /if \(requiresPackageLifecycleAuthority\(body, existing\) && !canManagePackageLifecycle\(c\.get\('role'\)\)\)/);

console.log("Al Etihad Auth RBAC policy tests passed");
