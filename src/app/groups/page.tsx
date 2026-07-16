import { getGroups } from "@/features/groups/actions"
import { GroupsTable } from "@/features/groups/components/groups-table"

export default async function GroupsPage() {
  const groups = await getGroups()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Groups</h1>
          <p className="text-muted-foreground">Manage organization groups and divisions.</p>
        </div>
      </div>
      <GroupsTable data={groups} />
    </div>
  )
}
