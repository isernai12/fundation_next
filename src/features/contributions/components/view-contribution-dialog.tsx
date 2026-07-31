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
          <DialogTitle>{t("contributions.contribution_details_b342ab")}</DialogTitle>
          <DialogDescription>
            {t("contributions.detailed_information_102690")}</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-y-4 gap-x-8 py-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{t("contributions.member_858ba4")}</p>
            <p className="font-medium">{contribution.member.fullName}</p>
            <p className="text-xs text-muted-foreground">{contribution.member.memberId}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{t("contributions.group_039371")}</p>
            <p className="font-medium">{contribution.member.group?.name}</p>
            <p className="text-xs text-muted-foreground">{contribution.member.group?.code}</p>
          </div>

          <Separator className="col-span-2 my-2" />

          <div>
            <p className="text-sm font-medium text-muted-foreground">{t("contributions.period_190160")}</p>
            <p className="font-medium">{formatShortMonth(contribution.month - 1)} {contribution.year}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{t("contributions.type_a1fa27")}</p>
            <p className="font-medium">{contribution.isAdditional ? "Additional Payment" : "Monthly Standard"}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">{t("contributions.expected_amount_fda64d")}</p>
            <p className="font-medium text-lg">৳{contribution.expectedAmount}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{t("contributions.status_ec53a8")}</p>
            <Badge variant={contribution.status === "PAID" ? "default" : "destructive"} className="mt-1">
              {contribution.status}
            </Badge>
          </div>

          <Separator className="col-span-2 my-2" />

          {payment ? (
            <>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t("contributions.payment_amount_5bbe29")}</p>
                <p className="font-medium text-lg text-green-600">৳{payment.amount}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t("contributions.payment_date_31738c")}</p>
                <p className="font-medium">{formatDate(payment.paymentDate)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t("contributions.payment_method_707436")}</p>
                <p className="font-medium">{payment.paymentMethod}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t("contributions.reference_trxid_5ca831")}</p>
                <p className="font-medium">{payment.referenceNumber || "N/A"}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm font-medium text-muted-foreground">{t("contributions.notes_remarks_4a7a61")}</p>
                <p className="font-medium text-sm mt-1 bg-muted p-3 rounded-md">{payment.notes || "No notes provided."}</p>
              </div>
              <div className="col-span-2 mt-2">
                <p className="text-sm font-medium text-muted-foreground">{t("contributions.ledger_transaction_i_141eb0")}</p>
                <p className="font-mono text-xs text-muted-foreground mt-1">{payment.ledgerTransactionId}</p>
              </div>
            </>
          ) : (
            <div className="col-span-2 text-center py-4 bg-muted/50 rounded-md">
              <p className="text-sm text-muted-foreground">{t("contributions.no_payments_recorded_b1d3c4")}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
