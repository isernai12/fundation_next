"use client"
import { formatDateTime } from "@/lib/format"

import { useEffect, useState } from "react"
import { getFoundationSummaryReport } from "@/features/reports/actions"
import { ReportViewer } from "@/features/reports/components/report-viewer"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function FoundationSummaryReportPage() {
  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    getFoundationSummaryReport().then(setData)
  }, [])

  const columns = [
    { accessorKey: "fundName", header: "Fund Name" },
    { accessorKey: "groupName", header: "Group/Entity" },
    { accessorKey: "type", header: "Account Type" },
    {
      accessorKey: "balance",
      header: "Current Balance",
      cell: ({ row }: any) => {
        const val = row.getValue("balance") as number
        const formatted = (val).toFixed(2)
        return <span className={val < 0 ? "text-red-500 font-bold" : "font-semibold"}>৳{formatted}</span>
      }
    }
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
          <h1 className="text-3xl font-bold tracking-tight">Foundation Summary</h1>
          <p className="text-muted-foreground text-sm mt-1">Live overview of all foundation fund positions.</p>
        </div>
      </div>
      <div className="hidden print:block text-center mb-8">
        <h1 className="text-2xl font-bold">Foundation Summary Report</h1>
        <p className="text-sm text-gray-500">Generated on: {formatDateTime(new Date())}</p>
      </div>

      <ReportViewer title="Foundation_Summary_Report" columns={columns} data={data} />
    </div>
  )
}
