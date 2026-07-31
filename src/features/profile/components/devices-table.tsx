"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Monitor, Smartphone, Tablet, LogOut } from "lucide-react"
import { logoutDevice, logoutOtherDevices, logoutAllDevices } from "../actions"
import { useLanguage } from "@/i18n/LanguageProvider";

export function DevicesTable({ sessions, currentJti }: { sessions: any[], currentJti: string }) {
    const { t } = useLanguage();
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleLogout = async (jti: string) => {
    setIsProcessing(true)
    try {
      await logoutDevice(jti)
      toast.success(t("profile.k_b19441"))
      if (jti === currentJti) {
        signOut({ callbackUrl: window.location.origin + '/login' })
      } else {
        router.refresh()
      }
    } catch (err) {
      toast.error(t("profile.k_dc3aa0"))
    } finally {
      setIsProcessing(false)
    }
  }

  const handleLogoutOthers = async () => {
    setIsProcessing(true)
    try {
      await logoutOtherDevices()
      toast.success(t("profile.k_f34979"))
      router.refresh()
    } catch (err) {
      toast.error(t("profile.k_dc3aa0"))
    } finally {
      setIsProcessing(false)
    }
  }

  const handleLogoutAll = async () => {
    if (!confirm("আপনি কি নিশ্চিত যে সকল ডিভাইস থেকে লগআউট করতে চান?")) return
    setIsProcessing(true)
    try {
      const res = await logoutAllDevices()
      if (res.requireReauth) {
        toast.success(t("profile.k_12f44a"))
        signOut({ callbackUrl: window.location.origin + '/login' })
      }
    } catch (err) {
      toast.error(t("profile.k_dc3aa0"))
    } finally {
      setIsProcessing(false)
    }
  }

  const getDeviceIcon = (device: string) => {
    if (device === "Mobile") return <Smartphone className="w-5 h-5" />
    if (device === "Tablet") return <Tablet className="w-5 h-5" />
    return <Monitor className="w-5 h-5" />
  }

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <CardTitle>{t("profile.active_sessions_8f93e4")}</CardTitle>
          <CardDescription>{t("profile.k_b84c4f")}</CardDescription>
        </div>
        <div className="flex gap-2">
          {sessions.length > 1 && (
            <Button variant="outline" size="sm" onClick={handleLogoutOthers} disabled={isProcessing}>
              {t("profile.k_67bca8")}</Button>
          )}
          <Button variant="destructive" size="sm" onClick={handleLogoutAll} disabled={isProcessing}>
            {t("profile.k_7c2a7c")}</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sessions.map((session) => {
            const isCurrent = session.jti === currentJti
            return (
              <div key={session.id} className={`flex items-center justify-between p-4 border rounded-lg ${isCurrent ? 'bg-primary/5 border-primary/20' : ''}`}>
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-muted rounded-full">
                    {getDeviceIcon(session.device)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{session.os} - {session.browser}</h4>
                      {isCurrent && <Badge variant="default" className="text-xs">{t("profile.k_b24731")}</Badge>}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1 space-x-2">
                      <span>{t("profile.k_3901cd")}{session.ipAddress}</span>
                      <span>•</span>
                      <span>{t("profile.k_b95719")}{new Date(session.lastActive).toLocaleString('bn-BD')}</span>
                    </div>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={() => {
                    return (handleLogout(session.jti));
                  }}
                  disabled={isProcessing}
                  title={t("profile.k_c7b00c")}
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            )
          })}
          {sessions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {t("profile.k_e5da6e")}</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
