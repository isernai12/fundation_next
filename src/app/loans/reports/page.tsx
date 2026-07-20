import { formatCurrency } from "@/lib/format"

import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default async function LoanReportsPage() {
  const loans = await prisma.loan.findMany({
    include: { repayments: true, installments: true }
  })

  const totalLoans = loans.length
  const activeLoans = loans.filter(l => l.status === "ACTIVE").length
  const completedLoans = loans.filter(l => l.status === "COMPLETED").length
  const defaultedLoans = loans.filter(l => l.status === "DEFAULTED").length

  const totalAmount = loans.reduce((s, l) => s + l.amount, 0)
  const totalRepaid = loans.reduce((s, l) => s + l.repayments.reduce((rs, r) => rs + r.amount, 0), 0)
  const totalOutstanding = totalAmount - totalRepaid

  const repaymentPercentage = totalAmount > 0 ? (totalRepaid / totalAmount) * 100 : 0

  return (
    <div className="flex flex-col h-full">

      <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-5xl space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Loan Reports</h1>
            <p className="text-muted-foreground">
              Overview of loan performance, outstanding balances, and completion rates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Loans</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalLoans}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Loans</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeLoans}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{completedLoans}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Defaulted</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{defaultedLoans}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Financial Summary</CardTitle>
                <CardDescription>Total disbursed vs repaid</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Disbursed</span>
                  <span className="text-lg font-semibold">৳{formatCurrency(totalAmount)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Repaid</span>
                  <span className="text-lg font-semibold text-green-600">৳{formatCurrency(totalRepaid)}</span>
                </div>
                <div className="flex justify-between items-center border-t pt-2">
                  <span className="font-semibold">Outstanding Balance</span>
                  <span className="text-lg font-bold text-destructive">৳{formatCurrency(totalOutstanding)}</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Repayment Rate</span>
                    <span>{repaymentPercentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5"><div className="bg-primary h-2.5 rounded-full" style={{ width: `${repaymentPercentage}%` }}></div></div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest loans and payments</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  View detailed activity in the Ledger and Repayments tabs.
                </p>
                {/* Could add a mini list of recent repayments here if needed */}
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  )
}
