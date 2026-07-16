import { getBeneficiaries } from "@/features/beneficiaries/actions"
import { getMembers } from "@/features/members/actions"
import { BeneficiariesTable } from "@/features/beneficiaries/components/beneficiaries-table"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

export default async function BeneficiariesPage() {
  const beneficiaries = await getBeneficiaries()
  const members = await getMembers()

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/beneficiaries" className="hover:text-primary transition-colors">
          Beneficiaries
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-foreground">All Beneficiaries</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">All Beneficiaries</h1>
          <p className="text-muted-foreground text-sm mt-1">
            View and search all registered beneficiaries.
          </p>
        </div>
      </div>

      <BeneficiariesTable data={beneficiaries} members={members} />
    </div>
  )
}
