import { getLoan } from "@/features/loans/actions"
import { getDocumentsByEntity } from "@/features/documents/actions"
import { notFound } from "next/navigation"
import { formatDate } from "@/lib/format"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, FileText } from "lucide-react"
import Link from "next/link"
import { LoanProfileActions } from "@/features/loans/components/loan-profile-actions"

export default async function LoanDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const loan = await getLoan(resolvedParams.id)
  
  if (!loan) return notFound()

  const documents = await getDocumentsByEntity("LOAN", loan.id)

  const totalRepaid = loan.repayments.reduce((sum, r) => sum + r.amount, 0)
  const outstanding = loan.amount - totalRepaid

  // Due logic
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/loans" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">ঋণ বিস্তারিত (Loan Details)</h1>
        </div>
        <div className="flex items-center gap-2">
          <LoanProfileActions loan={loan} outstanding={outstanding} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>সাধারণ তথ্য (General Info)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b"><td className="py-2 w-1/3 text-muted-foreground font-medium">ঋণ নম্বর</td><td className="py-2 font-medium">{loan.loanNumber}</td></tr>
                  <tr className="border-b"><td className="py-2 text-muted-foreground font-medium">ঋণের পরিমাণ</td><td className="py-2 font-bold text-lg">৳{loan.amount}</td></tr>
                  <tr className="border-b"><td className="py-2 text-muted-foreground font-medium">অবস্থা (Status)</td>
                    <td className="py-2">
                      <Badge variant={loan.status === "ACTIVE" ? "default" : loan.status === "COMPLETED" ? "secondary" : "destructive"}>
                        {loan.status}
                      </Badge>
                    </td>
                  </tr>
                  <tr className="border-b"><td className="py-2 text-muted-foreground font-medium">আবেদন তারিখ</td><td className="py-2">{formatDate(loan.requestedDate)}</td></tr>
                  <tr className="border-b"><td className="py-2 text-muted-foreground font-medium">বিতরণের তারিখ</td><td className="py-2">{loan.disbursedDate ? formatDate(loan.disbursedDate) : 'N/A'}</td></tr>
                  <tr className="border-b"><td className="py-2 text-muted-foreground font-medium">ঋণের ধরন</td><td className="py-2">{loan.loanType === "BUSINESS" ? `ব্যবসা (${loan.businessType})` : "অন্যান্য"}</td></tr>
                  <tr><td className="py-2 text-muted-foreground font-medium">উদ্দেশ্য</td><td className="py-2">{loan.purpose}</td></tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>বকেয়া তথ্য (Due Info)</CardTitle>
          </CardHeader>
          <CardContent>
             <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b"><td className="py-2 w-1/3 text-muted-foreground font-medium">পরিশোধিত</td><td className="py-2 text-green-600 font-bold">৳{totalRepaid}</td></tr>
                  <tr className="border-b"><td className="py-2 text-muted-foreground font-medium">বাকি ঋণ (Remaining)</td><td className="py-2 text-red-600 font-bold">৳{outstanding}</td></tr>
                  <tr className="border-b"><td className="py-2 text-muted-foreground font-medium">পরবর্তী কিস্তি (Next Due)</td><td className="py-2">{nextDueDate ? formatDate(nextDueDate) : '-'}</td></tr>
                  <tr><td className="py-2 text-muted-foreground font-medium">বকেয়া অবস্থা</td>
                    <td className="py-2">
                      <Badge variant={dueStatus === "Due Today" ? "default" : dueStatus === "Overdue" ? "destructive" : dueStatus === "Completed" ? "secondary" : "outline"}>
                        {dueStatus}
                      </Badge>
                    </td>
                  </tr>
                </tbody>
             </table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>সুবিধাভোগীর তথ্য (Beneficiary)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b"><td className="py-2 w-1/3 text-muted-foreground font-medium">নাম</td><td className="py-2">{loan.beneficiary?.fullName || 'নাম পাওয়া যায়নি'}</td></tr>
                  <tr className="border-b"><td className="py-2 text-muted-foreground font-medium">সুবিধাভোগী আইডি</td><td className="py-2">{loan.beneficiary?.beneficiaryId || '-'}</td></tr>
                  <tr className="border-b"><td className="py-2 text-muted-foreground font-medium">মোবাইল নম্বর</td><td className="py-2">{loan.beneficiary?.phone || '-'}</td></tr>
                  <tr className="border-b"><td className="py-2 text-muted-foreground font-medium">জাতীয় পরিচয়পত্র</td><td className="py-2">{loan.beneficiary?.nationalId || '-'}</td></tr>
                  <tr className="border-b"><td className="py-2 text-muted-foreground font-medium">ঠিকানা</td><td className="py-2">{loan.beneficiary?.address || '-'}</td></tr>
                  <tr><td className="py-2 text-muted-foreground font-medium">পেশা</td><td className="py-2">{loan.beneficiary?.occupation || '-'}</td></tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        
        {loan.allocations && loan.allocations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>তহবিল বরাদ্দ (Fund Allocation)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                {loan.allocations.map(a => (
                  <div key={a.id} className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">{a.fund.group?.name || "General Fund"} ({a.fund.name})</span>
                    <span className="font-medium">৳{a.amount}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Card id="history">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>পরিশোধের ইতিহাস (Payment History)</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/loans/ledger?loanId=${loan.id}`}>
              <FileText className="mr-2 h-4 w-4" /> ঋণের খতিয়ান (Ledger)
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {loan.repayments.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-sm">
              এখনও কোনো কিস্তি পরিশোধ করা হয়নি।
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="pb-2 font-medium">তারিখ</th>
                  <th className="pb-2 font-medium">ট্রানজেকশন আইডি</th>
                  <th className="pb-2 font-medium text-right">পরিমাণ</th>
                </tr>
              </thead>
              <tbody>
                {loan.repayments.map(r => (
                  <tr key={r.id} className="border-b last:border-0">
                    <td className="py-3">{formatDate(r.date)}</td>
                    <td className="py-3 text-muted-foreground text-xs">{r.ledgerTransactionId}</td>
                    <td className="py-3 text-right font-medium text-green-600">+৳{r.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
