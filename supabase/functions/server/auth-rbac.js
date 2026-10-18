const ADMIN_ROLES = new Set(["superadmin", "editor"]);

export function isSupportedAdminRole(role) {
  return typeof role === "string" && ADMIN_ROLES.has(role);
}

export function roleFromRecord(record) {
  return isSupportedAdminRole(record?.role) ? record.role : null;
}

export function canManageContent(role) {
  return role === "superadmin" || role === "editor";
}

export function canManagePackageLifecycle(role) {
  return role === "superadmin";
}

export function canManageSettings(role) {
  return role === "superadmin";
}

export function canManageUsers(role) {
  return role === "superadmin";
}
