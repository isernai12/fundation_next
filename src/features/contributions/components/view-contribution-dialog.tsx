"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { formatDate, formatShortMonth } from "@/lib/format"
import { Separator } from "@/components/ui/separator"
import { useLanguage } from "@/i18n/LanguageProvider";

interface ViewContributionDialogProps {
  isOpen: boolean
  onClose: () => void
  contribution: any
}

export function ViewContributionDialog({ isOpen, onClose, contribution }: ViewContributionDialogProps) {
    const { t } = useLanguage();
  if (!contribution) return null

  const payment = contribution.payments?.[0]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{t("contributions.view.title")}</DialogTitle>
          <DialogDescription>
            {t("contributions.view.description")}</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-y-4 gap-x-8 py-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{t("contributions.view.member")}</p>
            <p className="font-medium">{contribution.member.fullName}</p>
            <p className="text-xs text-muted-foreground">{contribution.member.memberId}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{t("contributions.view.group")}</p>
            <p className="font-medium">{contribution.member.group?.name}</p>
            <p className="text-xs text-muted-foreground">{contribution.member.group?.code}</p>
          </div>

          <Separator className="col-span-2 my-2" />

          <div>
            <p className="text-sm font-medium text-muted-foreground">{t("contributions.view.period")}</p>
            <p className="font-medium">{formatShortMonth(contribution.month - 1)} {contribution.year}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{t("contributions.view.type")}</p>
            <p className="font-medium">{contribution.isAdditional ? t("contributions.view.types.additional") : t("contributions.view.types.standard")}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">{t("contributions.view.expectedAmount")}</p>
            <p className="font-medium text-lg">৳{contribution.expectedAmount}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{t("contributions.view.status")}</p>
            <Badge variant={contribution.status === "PAID" ? "default" : "destructive"} className="mt-1">
              {contribution.status === "PAID" ? t("contributions.form.statuses.paid") : contribution.status === "PENDING" ? t("contributions.form.statuses.pending") : t("contributions.form.statuses.cancelled")}
            </Badge>
          </div>

          <Separator className="col-span-2 my-2" />

          {payment ? (
            <>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t("contributions.view.paymentAmount")}</p>
                <p className="font-medium text-lg text-green-600">৳{payment.amount}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t("contributions.view.paymentDate")}</p>
                <p className="font-medium">{formatDate(payment.paymentDate)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t("contributions.view.paymentMethod")}</p>
                <p className="font-medium">{payment.paymentMethod === "CASH" ? t("contributions.form.methods.cash") : payment.paymentMethod === "BANK" ? t("contributions.form.methods.bank") : payment.paymentMethod === "BKASH" ? t("contributions.form.methods.bkash") : payment.paymentMethod === "NAGAD" ? t("contributions.form.methods.nagad") : t("contributions.form.methods.mobile")}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t("contributions.view.reference")}</p>
                <p className="font-medium">{payment.referenceNumber || "N/A"}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm font-medium text-muted-foreground">{t("contributions.view.notes")}</p>
                <p className="font-medium text-sm mt-1 bg-muted p-3 rounded-md">{payment.notes || t("contributions.view.noNotes")}</p>
              </div>
              <div className="col-span-2 mt-2">
                <p className="text-sm font-medium text-muted-foreground">{t("contributions.view.ledgerTransactionId")}</p>
                <p className="font-mono text-xs text-muted-foreground mt-1">{payment.ledgerTransactionId}</p>
              </div>
            </>
          ) : (
            <div className="col-span-2 text-center py-4 bg-muted/50 rounded-md">
              <p className="text-sm text-muted-foreground">{t("contributions.view.noPayments")}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
