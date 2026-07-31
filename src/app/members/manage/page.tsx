import { getMembers } from "@/features/members/actions"
import { getGroups } from "@/features/groups/actions"
import { MembersTable } from "@/features/members/components/members-table"
import { authorizePage } from "@/lib/rbac"

export default async function ManageMembersPage() {
  await authorizePage("Members", "View")
  const members = await getMembers()
  const groups = await getGroups()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">সদস্য ব্যবস্থাপনা</h1>
          <p className="text-muted-foreground">প্রতিষ্ঠানের সদস্যদের ব্যবস্থাপনা করুন।</p>
        </div>
      </div>
      <MembersTable data={members} groups={groups} isManage={true} />
    </div>
  )
}
