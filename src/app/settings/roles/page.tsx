import { getRolesAndPermissions } from "@/features/settings/roles/actions"
import { RolesManager } from "@/features/settings/roles/roles-manager"
import { Metadata } from "next"
import { authorizePage } from "@/lib/rbac"

export const metadata: Metadata = {
  title: "Roles & Permissions - Foundation",
  description: "Manage system roles and permissions",
}

export default async function RolesPage() {
  await authorizePage("Roles & Permissions", "Manage")
  
  const { roles, permissions, rolePermissions } = await getRolesAndPermissions()

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <RolesManager 
        roles={roles} 
        permissions={permissions} 
        rolePermissions={rolePermissions} 
      />
    </div>
  )
}
