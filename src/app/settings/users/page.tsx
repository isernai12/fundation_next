import { authorizePage } from "@/lib/rbac"
import { getUsers, getRoles, getAllPermissions } from "@/features/settings/users/actions"
import UsersClient from "./users-client"
import { SectionHeader } from "@/components/ui/section-header"
import { Users as UsersIcon } from "lucide-react"

export default async function UsersPage() {
  await authorizePage("Users", "View")

  const [users, roles, permissions] = await Promise.all([
    getUsers(),
    getRoles(),
    getAllPermissions()
  ])

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Users Management"
        description="Manage system users, their roles, and individual permissions."
      />
      <UsersClient 
        initialUsers={users} 
        roles={roles} 
        allPermissions={permissions} 
      />
    </div>
  )
}
