export function hasPermission(
  userPermissions: string[],
  module: string,
  action: string
): boolean {
  if (userPermissions.includes("*")) return true
  return userPermissions.includes(`${module}:${action}`)
}
