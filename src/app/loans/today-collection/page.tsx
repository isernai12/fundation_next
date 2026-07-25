import { getLoans } from "@/features/loans/actions"
import { DueListTable } from "@/features/loans/components/due-list-table"
import { Card, CardContent } from "@/components/ui/card"

export default async function TodayCollectionPage() {
  const rawLoans = await getLoans()

  // Augment loans with due logic
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const loans = rawLoans
    .filter(loan => loan.remainingBalance > 0 && loan.status !== "COMPLETED")
    .map(loan => {
      let dueStatus = "No Due"
      
      if (loan.nextDueDate) {
        const nextDue = new Date(loan.nextDueDate)
        nextDue.setHours(0, 0, 0, 0)
        
        if (nextDue < today) {
          dueStatus = "Overdue"
        } else if (nextDue.getTime() === today.getTime()) {
          dueStatus = "Due Today"
        } else {
          dueStatus = "Upcoming Due"
        }
      }
      
      return {
        ...loan,
        dueStatus,
      }
    })
    .filter(loan => loan.dueStatus === "Due Today")

  const totalAmountDueToday = loans.reduce((sum, l) => sum + (l.installmentAmount || 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">আজকের সংগ্রহ (Today's Collection)</h1>
          <p className="text-muted-foreground text-sm mt-1">
            যে সকল ঋণের কিস্তি আজ আদায় করতে হবে তার তালিকা।
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground font-medium mb-2">Total Due Accounts Today</div>
            <div className="text-3xl font-bold text-orange-600">{loans.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground font-medium mb-2">Expected Collection (Approx.)</div>
            <div className="text-3xl font-bold text-green-600">৳{totalAmountDueToday}</div>
          </CardContent>
        </Card>
      </div>

      <DueListTable data={loans} initialDueStatusFilter="Due Today" />
    </div>
  )
}
