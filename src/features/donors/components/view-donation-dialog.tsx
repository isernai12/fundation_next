"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/format"
import { Separator } from "@/components/ui/separator"
import type { DonationTransactionItem } from "../actions"
import { useLanguage } from "@/i18n/LanguageProvider";
import { UserCheck, Users } from "lucide-react"

interface ViewDonationDialogProps {
  isOpen: boolean
  onClose: () => void
  donation: DonationTransactionItem | null
}

export function ViewDonationDialog({ isOpen, onClose, donation }: ViewDonationDialogProps) {
  const { t } = useLanguage();
  if (!donation) return null

  const isMember = donation.sourceType === "MEMBER"

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{t("donors.donation_details_4b77aa")}</DialogTitle>
          <DialogDescription>
            {t("donors.k_07c1b1")}</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-y-4 gap-x-8 py-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{t("donors.donation_source")}</p>
            <div className="mt-1 flex items-center gap-1.5">
              {isMember ? (
                <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>{t("donors.source_member")}</span>
                </Badge>
              ) : (
                <Badge variant="outline" className="border-primary text-primary flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  <span>{t("donors.source_donor")}</span>
                </Badge>
              )}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">
              {isMember ? t("donors.member_label") : t("donors.donor_9c2b8d")}
            </p>
            {isMember ? (
              <>
                <p className="font-semibold text-base text-foreground mt-0.5">{donation.member?.fullName || "Foundation Member"}</p>
                <p className="text-xs text-muted-foreground">{t("donors.k_e6f2eb")} {donation.member?.memberId || donation.memberId}</p>
              </>
            ) : (
              <>
                <p className="font-semibold text-base text-foreground mt-0.5">{donation.donor?.fullName || "External Donor"}</p>
                {donation.donor && (
                  <>
                    <p className="text-xs text-muted-foreground">{t("donors.k_e6f2eb")} {donation.donor.donorId}</p>
                    <p className="text-xs text-muted-foreground">{t("donors.k_9767a6")} {donation.donor.mobile}</p>
                  </>
                )}
              </>
            )}
          </div>

          <Separator className="col-span-2 my-1" />

          <div>
            <p className="text-sm font-medium text-muted-foreground">{t("donors.selected_group_a218b2")}</p>
            <p className="font-semibold text-base text-primary mt-0.5">{donation.groupName}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">{t("donors.voucher_no_69acba")}</p>
            <p className="font-mono text-sm font-bold mt-1 bg-muted px-2 py-1 rounded text-primary w-fit">
              {donation.voucherNo}
            </p>
          </div>

          <Separator className="col-span-2 my-1" />

          <div>
            <p className="text-sm font-medium text-muted-foreground">{t("donors.amount_261c82")}</p>
            <p className="font-mono text-xl font-bold text-green-600 dark:text-green-400 mt-0.5">
              ৳{donation.amount}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">{t("donors.date_806233")}</p>
            <p className="font-medium text-sm mt-0.5">{formatDate(donation.date)}</p>
            <p className="text-xs text-muted-foreground">({new Date(donation.date).toLocaleDateString("bn-BD")})</p>
          </div>

          <Separator className="col-span-2 my-1" />

          <div>
            <p className="text-sm font-medium text-muted-foreground">{t("donors.created_by_e33dc9")}</p>
            <p className="font-medium text-sm mt-0.5">{donation.createdBy}</p>
            <p className="text-xs text-muted-foreground">{t("donors.k_70cb19")}<Badge variant="outline" className="text-[10px] ml-1">{donation.status}</Badge></p>
          </div>

          <div className="col-span-2">
            <p className="text-sm font-medium text-muted-foreground">{t("donors.remarks_19ab1b")}</p>
            <div className="mt-1 p-3 bg-muted/30 rounded border text-sm text-foreground">
              {donation.remarks || "No remarks"}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
