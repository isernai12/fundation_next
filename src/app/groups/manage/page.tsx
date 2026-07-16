import { getGroups } from "@/features/groups/actions"
import { GroupsTable } from "@/features/groups/components/groups-table"

export default async function ManageGroupsPage() {
  const groups = await getGroups()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Groups</h1>
          <p className="text-muted-foreground">Manage existing groups, edit details, and control status.</p>
        </div>
      </div>
      <GroupsTable data={groups} manageMode={true} />
    </div>
  )
}
