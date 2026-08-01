"use client"

import { useState } from "react"
import { useLanguage } from "@/i18n/LanguageProvider"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { approveMemberRequest, rejectMemberRequest, requestChangesMemberRequest } from "@/features/member-requests/actions"
import { toast } from "sonner"
import { Check, X, AlertCircle } from "lucide-react"

export function RequestActions({ requestId, status }: { requestId: string, status: string }) {
  const { t } = useLanguage()
  const [loading, setLoading] = useState(false)
  const [actionType, setActionType] = useState<"APPROVE" | "REJECT" | "CHANGES" | null>(null)
  
  const [reason, setReason] = useState("")

  if (status === "APPROVED" || status === "REJECTED") {
    return null
  }

  const handleAction = async () => {
    setLoading(true)
    try {
      if (actionType === "APPROVE") {
        const res = await approveMemberRequest(requestId)
        if (res.success) {
          toast.success(t("member-requests.messages.approve_success"))
          setActionType(null)
        } else {
          toast.error((res as any).error || t("common.error"))
        }
      } else if (actionType === "REJECT") {
        if (!reason.trim()) {
          toast.error(t("member-requests.messages.reason_required"))
          setLoading(false)
          return
        }
        const res = await rejectMemberRequest(requestId, reason)
        if (res.success) {
          toast.success(t("member-requests.messages.reject_success"))
          setActionType(null)
        } else {
          toast.error((res as any).error || t("common.error"))
        }
      } else if (actionType === "CHANGES") {
        if (!reason.trim()) {
          toast.error(t("member-requests.messages.reason_required"))
          setLoading(false)
          return
        }
        const res = await requestChangesMemberRequest(requestId, reason)
        if (res.success) {
          toast.success(t("member-requests.messages.changes_success"))
          setActionType(null)
        } else {
          toast.error((res as any).error || t("common.error"))
        }
      }
    } catch (err: any) {
      toast.error(err.message || t("common.error"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted">
            <span className="sr-only">{t("common.actions")}</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
            {t("common.actions")}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            className="cursor-pointer text-emerald-600 focus:text-emerald-600"
            onClick={() => setActionType("APPROVE")}
          >
            <Check className="mr-2 h-4 w-4" />
            <span>{t("common.approve")}</span>
          </DropdownMenuItem>

          <DropdownMenuItem 
            className="cursor-pointer text-amber-600 focus:text-amber-600"
            onClick={() => setActionType("CHANGES")}
          >
            <AlertCircle className="mr-2 h-4 w-4" />
            <span>{t("member-requests.actions.request_changes")}</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem 
            className="cursor-pointer text-destructive focus:text-destructive"
            onClick={() => setActionType("REJECT")}
          >
            <X className="mr-2 h-4 w-4" />
            <span>{t("common.reject")}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={!!actionType} onOpenChange={(open) => {
        if (!open) {
          setActionType(null)
          setReason("")
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "APPROVE" && t("member-requests.actions.approve_title")}
              {actionType === "REJECT" && t("member-requests.actions.reject_title")}
              {actionType === "CHANGES" && t("member-requests.actions.changes_title")}
            </DialogTitle>
            <DialogDescription>
              {actionType === "APPROVE" && t("member-requests.actions.approve_desc")}
              {actionType === "REJECT" && t("member-requests.actions.reject_desc")}
              {actionType === "CHANGES" && t("member-requests.actions.changes_desc")}
            </DialogDescription>
          </DialogHeader>

          {(actionType === "REJECT" || actionType === "CHANGES") && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="reason">{t("common.reason")}</Label>
                <Textarea 
                  id="reason" 
                  value={reason} 
                  onChange={(e) => setReason(e.target.value)} 
                  placeholder={t("member-requests.actions.reason_placeholder")}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setActionType(null)} disabled={loading}>
              {t("common.cancel")}
            </Button>
            <Button 
              onClick={handleAction} 
              disabled={loading}
              variant={actionType === "REJECT" ? "destructive" : "default"}
              className={actionType === "APPROVE" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
            >
              {loading ? t("common.loading") : t("common.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
