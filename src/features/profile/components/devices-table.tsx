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

export function DevicesTable({ sessions, currentJti }: { sessions: any[], currentJti: string }) {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleLogout = async (jti: string) => {
    setIsProcessing(true)
    try {
      await logoutDevice(jti)
      toast.success("ডিভাইসটি সফলভাবে লগআউট করা হয়েছে")
      if (jti === currentJti) {
        signOut({ callbackUrl: window.location.origin + '/login' })
      } else {
        router.refresh()
      }
    } catch (err) {
      toast.error("লগআউট ব্যর্থ হয়েছে")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleLogoutOthers = async () => {
    setIsProcessing(true)
    try {
      await logoutOtherDevices()
      toast.success("অন্যান্য সকল ডিভাইস থেকে লগআউট করা হয়েছে")
      router.refresh()
    } catch (err) {
      toast.error("লগআউট ব্যর্থ হয়েছে")
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
        toast.success("সকল ডিভাইস থেকে লগআউট করা হয়েছে")
        signOut({ callbackUrl: window.location.origin + '/login' })
      }
    } catch (err) {
      toast.error("লগআউট ব্যর্থ হয়েছে")
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
          <CardTitle>সক্রিয় সেশন (Active Sessions)</CardTitle>
          <CardDescription>যে সকল ডিভাইস থেকে আপনি বর্তমানে লগইন আছেন।</CardDescription>
        </div>
        <div className="flex gap-2">
          {sessions.length > 1 && (
            <Button variant="outline" size="sm" onClick={handleLogoutOthers} disabled={isProcessing}>
              অন্যান্য ডিভাইস লগআউট করুন
            </Button>
          )}
          <Button variant="destructive" size="sm" onClick={handleLogoutAll} disabled={isProcessing}>
            সকল ডিভাইস লগআউট করুন
          </Button>
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
                      {isCurrent && <Badge variant="default" className="text-xs">বর্তমান ডিভাইস</Badge>}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1 space-x-2">
                      <span>IP: {session.ipAddress}</span>
                      <span>•</span>
                      <span>সর্বশেষ সক্রিয়: {new Date(session.lastActive).toLocaleString('bn-BD')}</span>
                    </div>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={() => handleLogout(session.jti)}
                  disabled={isProcessing}
                  title="এই ডিভাইস থেকে লগআউট করুন"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            )
          })}
          {sessions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              কোন সক্রিয় সেশন পাওয়া যায়নি।
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
