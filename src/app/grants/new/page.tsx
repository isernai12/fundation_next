import { GrantForm } from "@/features/grants/components/grant-form"
import { getBeneficiaries } from "@/features/beneficiaries/actions"
import { getGroups } from "@/features/groups/actions"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

export default async function AddGrantPage() {
  const beneficiaries = await getBeneficiaries()
  const groups = await getGroups()

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/grants" className="hover:text-primary transition-colors">
          অনুদান
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-foreground">নতুন অনুদান</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">নতুন অনুদান প্রদান</h1>
          <p className="text-muted-foreground mt-1">একটি নতুন আর্থিক বা উপাদানগত অনুদান প্রক্রিয়া করুন।</p>
        </div>
      </div>

      <GrantForm beneficiaries={beneficiaries} groups={groups} />
    </div>
  )
}
