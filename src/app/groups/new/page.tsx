import { GroupForm } from "@/features/groups/components/group-form"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { Trans } from "@/components/shared/trans"

export default function AddGroupPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/groups" className="hover:text-primary transition-colors">
          <Trans tKey="groups.new.breadcrumb.home" /></Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-foreground"><Trans tKey="groups.new.breadcrumb.new" /></span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight"><Trans tKey="groups.new.pageTitle" /></h1>
          <p className="text-muted-foreground mt-1"><Trans tKey="groups.new.subtitle" /></p>
        </div>
      </div>

      <GroupForm />
    </div>
  )
}
