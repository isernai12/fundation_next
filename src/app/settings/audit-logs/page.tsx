import { getAuditLogs } from "@/features/audit-logs/actions"
import { AuditTable } from "@/features/audit-logs/components/audit-table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function AuditLogsPage() {
  const logs = await getAuditLogs()

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/settings">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Track and monitor all critical system actions.
          </p>
        </div>
      </div>

      <AuditTable data={logs} />
    </div>
  )
}
