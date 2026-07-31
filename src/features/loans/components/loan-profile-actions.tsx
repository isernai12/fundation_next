"use client"

import { Button } from "@/components/ui/button"
import { Printer, Edit, CreditCard, BookOpen, FileText } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/i18n/LanguageProvider";

interface LoanProfileActionsProps {
  loan: any
  outstanding: number
}

export function LoanProfileActions({ loan, outstanding }: LoanProfileActionsProps) {
    const { t } = useLanguage();
  return (
    <div className="flex items-center gap-2 print:hidden">
      <Button variant="outline" size="sm" asChild>
        <Link href={`/loans/${loan.id}/edit`}>
          <Edit className="h-4 w-4 mr-2" />
          {t("loans.k_8452eb")}</Link>
      </Button>

      {loan.status === "ACTIVE" && loan.remainingBalance > 0 && (
        <Button variant="outline" size="sm" asChild>
          <Link href={`/loans/repayments?loanId=${loan.id}`}>
            <CreditCard className="h-4 w-4 mr-2" />
            {t("loans.k_aabdef")}</Link>
        </Button>
      )}

      <Button variant="outline" size="sm" asChild>
        <Link href={`/loans/ledger?loanId=${loan.id}`}>
          <BookOpen className="h-4 w-4 mr-2" />
          {t("loans.k_694b10")}</Link>
      </Button>
      
      <Button variant="outline" size="sm" asChild>
        <Link href={`/loans/${loan.id}#history`}>
          <FileText className="h-4 w-4 mr-2" />
          {t("loans.k_350e50")}</Link>
      </Button>

      <Button variant="outline" size="sm" onClick={() => {
            return (window.print());
          }}>
        <Printer className="h-4 w-4 mr-2" />
        {t("loans.k_a0b40f")}</Button>
    </div>
  )
}
