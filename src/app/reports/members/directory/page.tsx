"use client"
import { formatDate, formatDateTime } from "@/lib/format"

import { useEffect, useState } from "react"
import { getMemberDirectoryReport } from "@/features/reports/actions"
import { ReportViewer } from "@/features/reports/components/report-viewer"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function MemberDirectoryReportPage() {
  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    getMemberDirectoryReport().then(setData)
  }, [])

  const columns = [
    { accessorKey: "memberId", header: "Member ID" },
    { accessorKey: "name", header: "Full Name" },
    { accessorKey: "group", header: "Group" },
    { accessorKey: "mobile", header: "Mobile" },
    { accessorKey: "email", header: "Email" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => {
        const val = row.getValue("status") as string
        return <Badge variant={val === "ACTIVE" ? "default" : "secondary"}>{val}</Badge>
      }
    },
    {
      accessorKey: "joinDate",
      header: "Join Date",
      cell: ({ row }: any) => {
        const d = row.getValue("joinDate")
        return d ? formatDate(d) : 'N/A'
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
          <h1 className="text-3xl font-bold tracking-tight">Member Directory</h1>
          <p className="text-muted-foreground text-sm mt-1">Complete directory of all registered foundation members.</p>
        </div>
      </div>
      <div className="hidden print:block text-center mb-8">
        <h1 className="text-2xl font-bold">Member Directory Report</h1>
        <p className="text-sm text-gray-500">Generated on: {formatDateTime(new Date())}</p>
      </div>

      <ReportViewer title="Member_Directory_Report" columns={columns} data={data} />
    </div>
  )
}
