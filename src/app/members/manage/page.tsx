import { getMembers } from "@/features/members/actions"
import { getGroups } from "@/features/groups/actions"
import { MembersTable } from "@/features/members/components/members-table"
import { MemberFormDialog } from "@/features/members/components/member-form-dialog"

export default async function ManageMembersPage() {
  const members = await getMembers()
  const groups = await getGroups()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Members</h1>
          <p className="text-muted-foreground">Manage organization members.</p>
        </div>
        <MemberFormDialog groups={groups} />
      </div>
      <MembersTable data={members} groups={groups} />
    </div>
  )
}
