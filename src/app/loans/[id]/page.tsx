import { formatCurrency, formatDate } from "@/lib/format"
import { getLoan, approveLoan } from "@/features/loans/actions"
import { getDocumentsByEntity, getDocumentCategories } from "@/features/documents/actions"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, CheckCircle, Edit, CreditCard, Printer, BookOpen, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DocumentList } from "@/features/documents/components/document-list"
import { LoanProfileActions } from "@/features/loans/components/loan-profile-actions"
import { prisma } from "@/lib/prisma"
import { LoanDisbursementDialog } from "@/features/loans/components/loan-disbursement-dialog"

export default async function LoanDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const loan = await getLoan(resolvedParams.id)

  if (!loan) return notFound()

  const funds = await prisma.fund.findMany({ include: { group: true } })
  const documents = await getDocumentsByEntity("LOAN", loan.id)
  const categories = await getDocumentCategories()

  const totalRepaid = loan.repayments.reduce((sum, r) => sum + r.amount, 0)
  const outstanding = loan.amount - totalRepaid
  
  const installments = loan.installments || []
  const nextInstallment = installments.find((i) => i.status === "PENDING")
  const paidInstallments = installments.filter((i) => i.status === "PAID").length
  const remainingInstallments = installments.length - paidInstallments

  return (
    <div className="max-w-5xl mx-auto space-y-8 print:m-0 print:p-0 bg-white text-black p-6 rounded-md shadow-sm border print:border-none print:shadow-none">
      {/* Top Navigation & Actions */}
      <div className="flex items-center justify-between pb-4 border-b print:hidden">
        <div className="flex items-center gap-4">
          <Link href="/loans" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-bold">ঋণের বিস্তারিত তথ্য</h1>
        </div>
        <div className="flex items-center gap-2">
          {loan.status === "PENDING" && (
            <form action={async () => {
              "use server"
              await approveLoan(loan.id)
            }}>
              <Button type="submit"><CheckCircle className="mr-2 h-4 w-4" /> ঋণ অনুমোদন</Button>
            </form>
          )}
          {loan.status === "APPROVED" && (
            <LoanDisbursementDialog loanId={loan.id} loanAmount={loan.amount} funds={funds} />
          )}
          <LoanProfileActions loan={loan} outstanding={outstanding} />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1 space-y-6">
          
          <section>
            <h2 className="text-lg font-bold bg-muted/30 px-3 py-1.5 border-l-4 border-primary mb-3">১. ঋণের সারসংক্ষেপ</h2>
            <table className="w-full text-sm border-collapse">
              <tbody>
                <tr className="border-b"><td className="py-2 w-1/3 text-muted-foreground font-medium">ঋণ নম্বর</td><td className="py-2 font-medium">{loan.loanNumber}</td></tr>
                <tr className="border-b">
                  <td className="py-2 text-muted-foreground font-medium">অবস্থা</td>
                  <td className="py-2">
                    <Badge variant={loan.status === "ACTIVE" ? "default" : loan.status === "COMPLETED" ? "secondary" : loan.status === "PENDING" ? "outline" : "destructive"}>
                      {loan.status}
                    </Badge>
                  </td>
                </tr>
                <tr className="border-b"><td className="py-2 text-muted-foreground font-medium">আবেদন তারিখ</td><td className="py-2">{formatDate(loan.requestedDate)}</td></tr>
                <tr className="border-b"><td className="py-2 text-muted-foreground font-medium">অনুমোদন তারিখ</td><td className="py-2">{loan.dateApproved ? formatDate(loan.dateApproved) : 'N/A'}</td></tr>
                <tr className="border-b"><td className="py-2 text-muted-foreground font-medium">বিতরণের তারিখ</td><td className="py-2">{loan.disbursedDate ? formatDate(loan.disbursedDate) : 'N/A'}</td></tr>
              </tbody>
            </table>
          </section>

          <section>
            <h2 className="text-lg font-bold bg-muted/30 px-3 py-1.5 border-l-4 border-primary mb-3 mt-6">২. সুবিধাভোগীর তথ্য</h2>
            <table className="w-full text-sm border-collapse">
              <tbody>
                <tr className="border-b"><td className="py-2 w-1/3 text-muted-foreground font-medium">নাম</td><td className="py-2">{loan.beneficiary?.fullName || 'নাম পাওয়া যায়নি'}</td></tr>
                <tr className="border-b"><td className="py-2 text-muted-foreground font-medium">সুবিধাভোগী আইডি</td><td className="py-2">{loan.beneficiary?.beneficiaryId || '-'}</td></tr>
                <tr className="border-b"><td className="py-2 text-muted-foreground font-medium">মোবাইল নম্বর</td><td className="py-2">{loan.beneficiary?.phone || '-'}</td></tr>
                <tr className="border-b"><td className="py-2 text-muted-foreground font-medium">জাতীয় পরিচয়পত্র</td><td className="py-2">{loan.beneficiary?.nationalId || '-'}</td></tr>
                <tr className="border-b"><td className="py-2 text-muted-foreground font-medium">ঠিকানা</td><td className="py-2">{loan.beneficiary?.address || '-'}</td></tr>
                <tr className="border-b"><td className="py-2 text-muted-foreground font-medium">পেশা</td><td className="py-2">{loan.beneficiary?.occupation || '-'}</td></tr>
              </tbody>
            </table>
          </section>

          <section>
            <h2 className="text-lg font-bold bg-muted/30 px-3 py-1.5 border-l-4 border-primary mb-3 mt-6">৩. ঋণের বিবরণ</h2>
            <table className="w-full text-sm border-collapse">
              <tbody>
                {loan.loanType === "BUSINESS" ? (
                  <>
                    <tr className="border-b"><td className="py-2 w-1/3 text-muted-foreground font-medium">ব্যবসার ধরন</td><td className="py-2">{loan.businessType}</td></tr>
                    <tr className="border-b"><td className="py-2 text-muted-foreground font-medium">ঋণ গ্রহণের উদ্দেশ্য</td><td className="py-2">{loan.purpose}</td></tr>
                  </>
                ) : (
                  <tr className="border-b"><td className="py-2 w-1/3 text-muted-foreground font-medium">কারণ</td><td className="py-2">{loan.purpose}</td></tr>
                )}
                <tr className="border-b"><td className="py-2 text-muted-foreground font-medium">ঋণের পরিমাণ</td><td className="py-2 font-bold">৳{formatCurrency(loan.amount)}</td></tr>
              </tbody>
            </table>
          </section>

          <section>
            <h2 className="text-lg font-bold bg-muted/30 px-3 py-1.5 border-l-4 border-primary mb-3 mt-6">৪. বর্তমান অবস্থা</h2>
            <table className="w-full text-sm border-collapse">
              <tbody>
                <tr className="border-b"><td className="py-2 w-1/3 text-muted-foreground font-medium">মোট পরিশোধিত</td><td className="py-2 font-bold text-green-600">৳{formatCurrency(totalRepaid)}</td></tr>
                <tr className="border-b"><td className="py-2 text-muted-foreground font-medium">বাকি ঋণ</td><td className="py-2 font-bold text-red-500">৳{formatCurrency(outstanding)}</td></tr>
                <tr className="border-b"><td className="py-2 text-muted-foreground font-medium">পরিশোধিত কিস্তি</td><td className="py-2">{paidInstallments} টি</td></tr>
                <tr className="border-b"><td className="py-2 text-muted-foreground font-medium">বাকি কিস্তি</td><td className="py-2">{remainingInstallments} টি</td></tr>
                <tr className="border-b"><td className="py-2 text-muted-foreground font-medium">পরবর্তী কিস্তির তারিখ</td><td className="py-2">{nextInstallment ? formatDate(nextInstallment.dueDate) : 'N/A'}</td></tr>
              </tbody>
            </table>
          </section>

          <section>
            <h2 className="text-lg font-bold bg-muted/30 px-3 py-1.5 border-l-4 border-primary mb-3 mt-6">৫. উৎস তহবিল (Allocations)</h2>
            <table className="w-full text-sm border-collapse">
              <tbody>
                {loan.allocations.length === 0 ? (
                  <tr><td className="py-2 text-muted-foreground">কোনো তহবিল বরাদ্দ নেই।</td></tr>
                ) : (
                  loan.allocations.map(a => (
                    <tr key={a.id} className="border-b">
                      <td className="py-2 w-2/3">{a.fund.name} <span className="text-xs text-muted-foreground">({a.fund.group?.name || "Foundation"})</span></td>
                      <td className="py-2 font-medium">৳{formatCurrency(a.amount)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </section>

          <section id="history">
            <h2 className="text-lg font-bold bg-muted/30 px-3 py-1.5 border-l-4 border-primary mb-3 mt-6">৬. পরিশোধের ইতিহাস</h2>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b bg-muted/20">
                  <th className="py-2 text-left px-2 font-medium">তারিখ</th>
                  <th className="py-2 text-left px-2 font-medium">রেফারেন্স</th>
                  <th className="py-2 text-right px-2 font-medium">পরিমাণ</th>
                </tr>
              </thead>
              <tbody>
                {loan.repayments.length === 0 ? (
                  <tr><td colSpan={3} className="py-4 text-center text-muted-foreground">কোনো পরিশোধ পাওয়া যায়নি।</td></tr>
                ) : (
                  loan.repayments.map(r => (
                    <tr key={r.id} className="border-b">
                      <td className="py-2 px-2">{formatDate(r.date)}</td>
                      <td className="py-2 px-2 text-xs text-muted-foreground">{r.ledgerTransaction.id}</td>
                      <td className="py-2 px-2 text-right font-medium text-green-600">+৳{formatCurrency(r.amount)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </section>

          {loan.notes && (
            <section>
              <h2 className="text-lg font-bold bg-muted/30 px-3 py-1.5 border-l-4 border-primary mb-3 mt-6">মন্তব্য</h2>
              <div className="p-3 bg-muted/10 rounded-md border text-sm whitespace-pre-wrap">
                {loan.notes}
              </div>
            </section>
          )}

        </div>
      </div>

      <div className="print:hidden">
        <h2 className="text-lg font-bold bg-muted/30 px-3 py-1.5 border-l-4 border-primary mb-3 mt-8">ডকুমেন্টস</h2>
        <DocumentList targetType="LOAN" entityId={loan.id} documents={documents} categories={categories} />
      </div>
    </div>
  )
}
