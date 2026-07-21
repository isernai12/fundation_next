"use client"

import { Button } from "@/components/ui/button"
import { Printer, Edit, CreditCard, BookOpen, FileText } from "lucide-react"
import Link from "next/link"
import { LoanRepaymentDialog } from "./loan-repayment-dialog"

interface LoanProfileActionsProps {
  loan: any
  outstanding: number
}

export function LoanProfileActions({ loan, outstanding }: LoanProfileActionsProps) {
  return (
    <div className="flex items-center gap-2 print:hidden">
      <Button variant="outline" size="sm" asChild>
        <Link href={`/loans/${loan.id}/edit`}>
          <Edit className="h-4 w-4 mr-2" />
          সংশোধন
        </Link>
      </Button>

      {loan.status === "ACTIVE" && outstanding > 0 && (
        <LoanRepaymentDialog 
          loanId={loan.id} 
          outstandingBalance={outstanding}
          trigger={
            <Button variant="outline" size="sm">
              <CreditCard className="h-4 w-4 mr-2" />
              কিস্তি গ্রহণ
            </Button>
          }
        />
      )}

      <Button variant="outline" size="sm" asChild>
        <Link href={`/loans/ledger?loanId=${loan.id}`}>
          <BookOpen className="h-4 w-4 mr-2" />
          খতিয়ান
        </Link>
      </Button>
      
      <Button variant="outline" size="sm" asChild>
        <Link href={`/loans/${loan.id}#history`}>
          <FileText className="h-4 w-4 mr-2" />
          ইতিহাস
        </Link>
      </Button>

      <Button variant="outline" size="sm" onClick={() => window.print()}>
        <Printer className="h-4 w-4 mr-2" />
        প্রিন্ট
      </Button>
    </div>
  )
}
