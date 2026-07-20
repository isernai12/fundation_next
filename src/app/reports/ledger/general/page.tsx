"use client"
import { formatCurrency, formatDate, formatDateTime } from "@/lib/format"

import { useEffect, useState } from "react"
import { getGeneralLedgerReport } from "@/features/reports/actions"
import { ReportViewer } from "@/features/reports/components/report-viewer"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function GeneralLedgerReportPage() {
  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    getGeneralLedgerReport().then(setData)
  }, [])

  const columns = [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }: any) => formatDate(row.getValue("date"))
    },
    { accessorKey: "type", header: "Transaction Type" },
    { accessorKey: "referenceId", header: "Ref ID" },
    { accessorKey: "group", header: "Group" },
    { accessorKey: "fund", header: "Fund Account" },
    {
      accessorKey: "debit",
      header: "Debit (Dr)",
      cell: ({ row }: any) => {
        const val = row.getValue("debit") as number
        return val > 0 ? <span className="font-semibold text-red-500">৳{formatCurrency(val)}</span> : "-"
      }
    },
    {
      accessorKey: "credit",
      header: "Credit (Cr)",
      cell: ({ row }: any) => {
        const val = row.getValue("credit") as number
        return val > 0 ? <span className="font-semibold text-green-600">৳{formatCurrency(val)}</span> : "-"
      }
    },
    { accessorKey: "notes", header: "Notes" }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4 print:hidden">
        <Button variant="outline" size="icon" asChild>
          <Link href="/reports">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">General Ledger</h1>
          <p className="text-muted-foreground text-sm mt-1">Detailed view of all ledger transactions (Debit / Credit).</p>
        </div>
      </div>
      <div className="hidden print:block text-center mb-8">
        <h1 className="text-2xl font-bold">General Ledger Report</h1>
        <p className="text-sm text-gray-500">Generated on: {formatDateTime(new Date())}</p>
      </div>

      <ReportViewer title="General_Ledger_Report" columns={columns} data={data} />
    </div>
  )
}
