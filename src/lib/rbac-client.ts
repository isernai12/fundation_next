/**
 * Canonical helper to determine if a role string represents Super Admin
 */
export function isSuperAdminRole(roleName?: string | null): boolean {
  if (!roleName) return false;
  const cleaned = roleName.trim().toLowerCase().replace(/[\s_-]+/g, "");
  return (
    cleaned === "superadmin" ||
    cleaned === "adminsuper" ||
    roleName.trim() === "Super Admin" ||
    roleName.trim() === "SUPER_ADMIN"
  );
}

/**
 * Universal Permission Checker (Single Source of Truth for Client & Server)
 */
export function hasPermission(
  userPermissions: string[] | null | undefined,
  module: string,
  action: string,
  roleName?: string | null
): boolean {
  // CRITICAL REQUIREMENT 1: SUPER_ADMIN MUST ALWAYS BYPASS ALL PERMISSION CHECKS
  if (roleName && isSuperAdminRole(roleName)) {
    return true;
  }

  const permissions = userPermissions || [];

  // Wildcard permission ("*")
  if (permissions.includes("*")) {
    return true;
  }

  if (!module || !action) return false;

  const targetModule = module.trim().toLowerCase();
  const targetAction = action.trim().toLowerCase();

  for (const perm of permissions) {
    if (perm === "*") return true;

    const [permModule, permAction] = perm.split(":").map((s) => s.trim());
    if (!permModule || !permAction) continue;

    const pm = permModule.toLowerCase();
    const pa = permAction.toLowerCase();

    // Module matching
    if (pm === targetModule || pm === "*") {
      // Action matching with canonical synonyms (Add <-> Create, Manage -> All, etc.)
      if (
        pa === targetAction ||
        pa === "*" ||
        pa === "manage" ||
        (targetAction === "create" && pa === "add") ||
        (targetAction === "add" && pa === "create") ||
        (targetAction === "view" && pa.startsWith("view"))
      ) {
        return true;
      }
    }
  }

  return false;
}
