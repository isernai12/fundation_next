import { getLoans } from "@/features/loans/actions"
import { getBeneficiaries } from "@/features/beneficiaries/actions"
import { LoansTable } from "@/features/loans/components/loans-table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"
export default async function LoansPage() {
  const loans = await getLoans()
  const beneficiaries = await getBeneficiaries()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">ঋণ ব্যবস্থাপনা</h1>
          <p className="text-muted-foreground text-sm mt-1">
            বিনা সুদে ঋণ, তহবিল বরাদ্দ এবং পরিশোধ পরিচালনা করুন।
          </p>
        </div>
        <Button asChild>
          <Link href="/loans/new">
            <Plus className="mr-2 h-4 w-4" />
            নতুন ঋণ
          </Link>
        </Button>
      </div>

      <LoansTable data={loans} />
    </div>
  )
}
