import { getLoan, approveLoan } from "@/features/loans/actions"
import { getDocumentsByEntity, getDocumentCategories } from "@/features/documents/actions"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, CheckCircle } from "lucide-react"
import { LoanDisbursementDialog } from "@/features/loans/components/loan-disbursement-dialog"
import { LoanRepaymentDialog } from "@/features/loans/components/loan-repayment-dialog"
import { DocumentList } from "@/features/documents/components/document-list"

export default async function LoanDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const loan = await getLoan(resolvedParams.id)

  if (!loan) return notFound()

  const funds = await prisma.fund.findMany({ include: { group: true } })
  const documents = await getDocumentsByEntity("LOAN", loan.id)
  const categories = await getDocumentCategories()

  const totalRepaid = loan.repayments.reduce((sum, r) => sum + r.amount, 0)
  const outstanding = loan.amount - totalRepaid

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/loans">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Loan {loan.loanNumber}</h1>
            <div className="flex items-center space-x-2 text-muted-foreground mt-1">
              <span>Beneficiary: {loan.beneficiary?.firstName} {loan.beneficiary?.lastName}</span>
              <span>&bull;</span>
              <Badge variant={
                loan.status === "ACTIVE" ? "default" :
                loan.status === "COMPLETED" ? "secondary" :
                loan.status === "PENDING" ? "outline" : "destructive"
              }>
                {loan.status}
              </Badge>
            </div>
          </div>
          <div className="space-x-2">
            {loan.status === "PENDING" && (
              <form action={async () => {
                "use server"
                await approveLoan(loan.id)
              }}>
                <Button type="submit"><CheckCircle className="mr-2 h-4 w-4" /> Approve Loan</Button>
              </form>
            )}
            {loan.status === "APPROVED" && (
              <LoanDisbursementDialog loanId={loan.id} loanAmount={loan.amount} funds={funds} />
            )}
            {loan.status === "ACTIVE" && outstanding > 0 && (
              <LoanRepaymentDialog loanId={loan.id} outstandingBalance={outstanding} />
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Principal Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">৳{Number((loan.amount / 100)).toLocaleString('en-BD', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Repaid Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">৳{Number((totalRepaid / 100)).toLocaleString('en-BD', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Outstanding Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">৳{Number((outstanding / 100)).toLocaleString('en-BD', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Loan Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><span className="text-sm font-semibold">Purpose</span><p className="text-muted-foreground">{loan.purpose}</p></div>
              <div><span className="text-sm font-semibold">Interest Rate</span><p className="text-muted-foreground">0% (Zero Interest)</p></div>
              <div><span className="text-sm font-semibold">Installments</span><p className="text-muted-foreground">{loan.installmentCount} months</p></div>
              <div><span className="text-sm font-semibold">Installment Amt</span><p className="text-muted-foreground">৳{Number((loan.installmentAmount / 100)).toLocaleString('en-BD', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p></div>
              <div><span className="text-sm font-semibold">Requested On</span><p className="text-muted-foreground">{new Date(loan.requestedDate).toLocaleDateString()}</p></div>
              <div><span className="text-sm font-semibold">Approved On</span><p className="text-muted-foreground">{loan.dateApproved ? new Date(loan.dateApproved).toLocaleDateString() : 'N/A'}</p></div>
              <div><span className="text-sm font-semibold">Disbursed On</span><p className="text-muted-foreground">{loan.disbursedDate ? new Date(loan.disbursedDate).toLocaleDateString() : 'N/A'}</p></div>
              <div><span className="text-sm font-semibold">Notes</span><p className="text-muted-foreground">{loan.notes || 'None'}</p></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Source Fund Allocations</CardTitle>
          </CardHeader>
          <CardContent>
            {loan.allocations.length === 0 ? (
              <p className="text-sm text-muted-foreground">No funds allocated yet.</p>
            ) : (
              <div className="space-y-4">
                {loan.allocations.map(a => (
                  <div key={a.id} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <p className="font-medium">{a.fund.name}</p>
                      <p className="text-xs text-muted-foreground">{a.fund.group?.name || "Foundation Fund"}</p>
                    </div>
                    <div className="font-bold">৳{Number((a.amount / 100)).toLocaleString('en-BD', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Repayment History</CardTitle>
        </CardHeader>
        <CardContent>
          {loan.repayments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No repayments recorded.</p>
          ) : (
            <div className="space-y-4">
              {loan.repayments.map(r => (
                <div key={r.id} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <p className="font-medium">{new Date(r.date).toLocaleDateString()}</p>
                    <p className="text-xs text-muted-foreground">Ledger Ref: {r.ledgerTransaction.id}</p>
                  </div>
                  <div className="font-bold text-green-600">+${(r.amount / 100).toFixed(2)}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      <DocumentList targetType="LOAN" entityId={loan.id} documents={documents} categories={categories} />
    </div>
  )
}
