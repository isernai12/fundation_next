import { BackupClient } from "@/features/settings/components/backup-client"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function BackupRestorePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/settings">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Backup & Restore</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Securely backup your database and restore when necessary.
          </p>
        </div>
      </div>

      <BackupClient />
    </div>
  )
}
