"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "sonner"
import { DatabaseBackup, UploadCloud } from "lucide-react"
import { useLanguage } from "@/i18n/LanguageProvider";

export function BackupClient() {
    const { t } = useLanguage();
  const [isBackingUp, setIsBackingUp] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleBackup = async () => {
    setIsBackingUp(true)
    try {
      window.location.href = "/api/backup";
      toast.success(t("settings.backup_download_star_db0141"))
    } catch (err) {
      toast.error(t("settings.failed_to_create_bac_6ea09c"))
    } finally {
      setIsBackingUp(false)
    }
  }

  const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!confirm("Are you sure? This will overwrite all data! This action cannot be undone.")) {
      e.target.value = ""
      return
    }

    setIsRestoring(true)
    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch("/api/backup", {
        method: "POST",
        body: formData,
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to restore backup")
      }
      
      toast.success(t("settings.database_restored_su_0f03ea"))
      window.location.reload()
    } catch (err: any) {
      toast.error(err.message || "Failed to restore backup")
    } finally {
      setIsRestoring(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DatabaseBackup className="h-5 w-5" /> <span>{t("settings.create_backup_c14ce8")}</span>
          </CardTitle>
          <CardDescription>{t("settings.generate_a_secure_sn_ba8dfb")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t("settings.this_will_lock_write_87c5da")}</p>
          <Button onClick={handleBackup} disabled={isBackingUp} className="w-full">
            {isBackingUp ? "Generating Backup..." : "Generate Full Backup"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <UploadCloud className="h-5 w-5" /> <span>{t("settings.restore_backup_6b57c8")}</span>
          </CardTitle>
          <CardDescription>{t("settings.restore_the_database_daef4b")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-red-600 dark:text-red-400 font-semibold">
            {t("settings.warning_restoring_a__1575f3")}</p>
          <div className="relative">
            <input 
              type="file" 
              accept=".zip" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" 
              onChange={handleRestore}
              disabled={isRestoring}
              ref={fileInputRef}
            />
            <Button variant="destructive" className="w-full" disabled={isRestoring}>
              {isRestoring ? "Restoring..." : "Upload & Restore"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
