import { ContributionForm } from "@/features/contributions/components/contribution-form"
import { getMembers } from "@/features/members/actions"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

export default async function AddContributionPage() {
  const members = await getMembers()

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/contributions" className="hover:text-primary transition-colors">
          চাঁদা
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-foreground">চাঁদা গ্রহণ</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">চাঁদা গ্রহণ</h1>
          <p className="text-muted-foreground">সদস্যের নতুন চাঁদা রেকর্ড করুন।</p>
        </div>
      </div>

      <ContributionForm members={members} />
    </div>
  )
}
