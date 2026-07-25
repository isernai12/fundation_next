import { getContributions } from "@/features/contributions/actions"
import Link from "next/link"
import { ChevronRight, Plus } from "lucide-react"
import { ContributionsTable } from "@/features/contributions/components/contributions-table"
import { Button } from "@/components/ui/button"

export default async function ContributionsPage() {
  const contributions = await getContributions()

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/contributions" className="hover:text-primary transition-colors">
          Contributions
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-foreground">মাসিক চাঁদা ব্যবস্থাপনা</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">মাসিক চাঁদা ব্যবস্থাপনা</h1>
          <p className="text-muted-foreground">সদস্যদের প্রদত্ত মাসিক চাঁদার রেকর্ড এবং অনুমোদন।</p>
        </div>
        <Link href="/contributions/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> মাসিক চাঁদা গ্রহণ
          </Button>
        </Link>
      </div>

      <ContributionsTable data={contributions} />
    </div>
  )
}
