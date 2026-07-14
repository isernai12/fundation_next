"use client"

import { useState } from "react"
import { createBackup } from "@/features/settings/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "sonner"
import { DatabaseBackup, Download, UploadCloud } from "lucide-react"

export function BackupClient() {
  const [isBackingUp, setIsBackingUp] = useState(false)

  const handleBackup = async () => {
    setIsBackingUp(true)
    try {
      const res = await createBackup()
      toast.success(res.message)
    } catch (err) {
      toast.error("Failed to create backup")
    } finally {
      setIsBackingUp(false)
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DatabaseBackup className="h-5 w-5" /> <span>Create Backup</span>
          </CardTitle>
          <CardDescription>Generate a secure snapshot of your entire database.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This will lock write operations momentarily to ensure data consistency, then create a complete SQLite database dump.
          </p>
          <Button onClick={handleBackup} disabled={isBackingUp} className="w-full">
            {isBackingUp ? "Generating Backup..." : "Generate Full Backup"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <UploadCloud className="h-5 w-5" /> <span>Restore Backup</span>
          </CardTitle>
          <CardDescription>Restore the database from an existing backup file.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-red-600 dark:text-red-400 font-semibold">
            Warning: Restoring a backup will overwrite all current data. This action cannot be undone.
          </p>
          <Button variant="destructive" className="w-full" onClick={() => toast.error("Restore functionality is disabled in production preview.")}>
            Upload & Restore
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
