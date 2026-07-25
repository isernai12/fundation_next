import { getLoans } from "@/features/loans/actions"
import { getBeneficiaries } from "@/features/beneficiaries/actions"
import { LoansTable } from "@/features/loans/components/loans-table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"

export default async function LoansPage() {
  const rawLoans = await getLoans()
  const beneficiaries = await getBeneficiaries()

  // Augment loans with due logic
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const loans = rawLoans.map(loan => {
    const totalRepaid = loan.repayments.reduce((sum, r) => sum + r.amount, 0)
    const outstanding = loan.amount - totalRepaid
    
    let dueStatus = "No Due"
    let nextDueDate: Date | null = null
    
    if (loan.status === "COMPLETED" || outstanding <= 0) {
      dueStatus = "Completed"
    } else {
      const disbursedDate = loan.disbursedDate || loan.requestedDate
      const lastRepayment = loan.repayments.length > 0 ? loan.repayments[0].date : disbursedDate
      nextDueDate = new Date(lastRepayment)
      nextDueDate.setMonth(nextDueDate.getMonth() + 1)
      nextDueDate.setHours(0, 0, 0, 0)
      
      if (nextDueDate < today) {
        dueStatus = "Overdue"
      } else if (nextDueDate.getTime() === today.getTime()) {
        dueStatus = "Due Today"
      } else {
        dueStatus = "Upcoming Due"
      }
    }
    
    return {
      ...loan,
      totalRepaid,
      outstanding,
      dueStatus,
      nextDueDate
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">ঋণ ব্যবস্থাপনা (Manage Loans)</h1>
          <p className="text-muted-foreground text-sm mt-1">
            বিনা সুদে ঋণ, তহবিল বরাদ্দ, পরিশোধ এবং বকেয়া পরিচালনা করুন।
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
