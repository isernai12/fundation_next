import { getGroupMembers } from "@/features/groups/actions"
import { GroupMembersTable } from "@/features/groups/components/group-members-table"
import { GroupSelector } from "@/features/groups/components/group-selector"
import { Card, CardContent } from "@/components/ui/card"
import { Users, ChevronRight } from "lucide-react"
import { Trans } from "@/components/shared/trans"
import Link from "next/link"

export default async function GroupMembersPage({ searchParams }: { searchParams: Promise<{ groupId?: string }> }) {
  const resolvedParams = await searchParams
  const groupId = resolvedParams.groupId
  const members = groupId ? await getGroupMembers(groupId) : []

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/groups" className="hover:text-primary transition-colors">
          <Trans tKey="groups.manage.breadcrumb.home" /></Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-foreground"><Trans tKey="groups.members.pageTitle" /></span>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight"><Trans tKey="groups.members.pageTitle" /></h1>
          <p className="text-muted-foreground mt-1"><Trans tKey="groups.members.subtitle" /></p>
        </div>
        <GroupSelector />
      </div>

      {!groupId ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64 space-y-4">
            <Users className="h-12 w-12 text-muted-foreground" />
            <div className="text-xl font-semibold"><Trans tKey="groups.members.emptyTitle" /></div>
            <p className="text-muted-foreground"><Trans tKey="groups.members.emptySubtitle" /></p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold"><Trans tKey="groups.members.totalMembers" />: {members.length}</h2>
          </div>
          <GroupMembersTable data={members} />
        </div>
      )}
    </div>
  )
}
