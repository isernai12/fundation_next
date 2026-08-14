"use client"

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Printer, Download, X, Building, CheckCircle2, HeartHandshake, UserCheck, Users } from "lucide-react"
import { formatDate } from "@/lib/format"
import type { DonationTransactionItem } from "../actions"
import { useLanguage } from "@/i18n/LanguageProvider";

interface ReceiptDonationModalProps {
  isOpen: boolean
  onClose: () => void
  donation: DonationTransactionItem | null
  mode?: "print" | "pdf"
}

export function ReceiptDonationModal({ isOpen, onClose, donation, mode = "print" }: ReceiptDonationModalProps) {
  const { t } = useLanguage();
  if (!donation) return null

  const isMember = donation.sourceType === "MEMBER"

  const handlePrint = () => {
    window.print()
  }

  const handleExportPDF = () => {
    window.print()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden bg-background text-foreground print:p-0 print:border-none print:shadow-none">
        {/* Header Action Bar (Hidden when printing) */}
        <div className="flex items-center justify-between px-6 py-4 bg-muted/50 border-b print:hidden">
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            {mode === "pdf" ? (
              <>
                <Download className="w-5 h-5 text-primary" />
                <span>{t("donors.export_pdf_receipt_a6f536")}</span>
              </>
            ) : (
              <>
                <Printer className="w-5 h-5 text-primary" />
                <span>{t("donors.print_receipt_d08641")}</span>
              </>
            )}
          </DialogTitle>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handlePrint} className="flex items-center gap-1">
              <Printer className="w-4 h-4" />
              <span>{t("donors.k_d26d50")}</span>
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8 ml-2" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Receipt Document Container */}
        <div className="p-8 print:p-4 space-y-6" id="receipt-print-area">
          {/* Organization Header */}
          <div className="text-center pb-6 border-b-2 border-primary/20 space-y-2">
            <div className="flex items-center justify-center gap-2 text-primary font-bold text-2xl">
              <Building className="w-8 h-8" />
              <span>{t("donors.foundation_erp_eca844")}</span>
            </div>
            <p className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
              {t("donors.donation_receipt_vou_684094")}</p>
            <div className="inline-flex items-center gap-1.5 bg-green-500/10 text-green-600 dark:text-green-400 px-3 py-1 rounded-full text-xs font-semibold mt-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{t("donors.k_86e090")}</span>
            </div>
          </div>

          {/* Receipt Info Grid */}
          <div className="grid grid-cols-2 gap-4 text-sm bg-muted/30 p-4 rounded-lg border">
            <div>
              <p className="text-xs text-muted-foreground uppercase font-semibold">{t("donors.voucher_no_69acba")}</p>
              <p className="font-mono text-base font-bold text-primary mt-0.5">{donation.voucherNo}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground uppercase font-semibold">{t("donors.date_806233")}</p>
              <p className="font-semibold mt-0.5">{formatDate(donation.date)}</p>
              <p className="text-xs text-muted-foreground">({new Date(donation.date).toLocaleDateString("bn-BD")})</p>
            </div>
          </div>

          {/* Details Table */}
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-muted text-xs uppercase font-semibold text-muted-foreground border-b">
                <tr>
                  <th className="py-3 px-4">{t("donors.description_659020")}</th>
                  <th className="py-3 px-4 text-right">{t("donors.amount_261c82")}</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm">
                <tr>
                  <td className="py-4 px-4 space-y-2">
                    <div className="flex items-center gap-1.5 font-bold text-base text-foreground">
                      <HeartHandshake className="w-4 h-4 text-primary" />
                      <span>{t("donors.k_b76b08")}{donation.groupName}</span>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-xs text-muted-foreground uppercase font-semibold">{t("donors.donation_source")}:</span>
                      {isMember ? (
                        <Badge className="bg-emerald-600 text-white text-xs flex items-center gap-1">
                          <UserCheck className="w-3 h-3" />
                          <span>{t("donors.source_member")}</span>
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-primary text-primary text-xs flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>{t("donors.source_donor")}</span>
                        </Badge>
                      )}
                    </div>

                    {isMember ? (
                      <div className="text-xs text-muted-foreground space-y-0.5 border-l-2 border-emerald-500 pl-2 mt-1">
                        <p>{t("donors.k_4f08c3")} <span className="font-semibold text-foreground">{donation.member?.fullName || "Foundation Member"}</span></p>
                        <p>{t("donors.k_e6f2eb")} {donation.member?.memberId || donation.memberId}</p>
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground space-y-0.5 border-l-2 border-primary pl-2 mt-1">
                        <p>{t("donors.k_4f08c3")} <span className="font-semibold text-foreground">{donation.donor?.fullName || "External Donor"}</span></p>
                        {donation.donor && (
                          <>
                            <p>{t("donors.k_72629d")} {donation.donor.donorId}</p>
                            <p>{t("donors.k_9767a6")} {donation.donor.mobile}</p>
                            {donation.donor.address && <p>{t("donors.k_5f4a05")} {donation.donor.address}</p>}
                          </>
                        )}
                      </div>
                    )}

                    {donation.remarks && (
                      <p className="text-xs italic bg-muted/50 p-2 rounded mt-2 text-muted-foreground border">
                        {t("donors.k_b6aa98")}{donation.remarks}
                      </p>
                    )}
                  </td>
                  <td className="py-4 px-4 text-right font-bold text-lg text-green-600 dark:text-green-400 font-mono align-top">
                    ৳{donation.amount}
                  </td>
                </tr>
              </tbody>
              <tfoot className="bg-muted/40 font-bold border-t">
                <tr>
                  <td className="py-3 px-4 text-right">{t("donors.total_received_2deb37")}</td>
                  <td className="py-3 px-4 text-right text-xl text-primary font-mono">৳{donation.amount}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Ledger Verification Footer */}
          <div className="pt-6 border-t text-xs text-muted-foreground flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-semibold">{t("donors.k_00b14c")}</p>
              <p className="font-mono text-xs opacity-80">{donation.id}</p>
              <p className="text-[10px] mt-0.5">{t("donors.k_d6b11f")}{donation.createdBy}</p>
            </div>
            <div className="text-center sm:text-right">
              <div className="inline-block border-t border-dashed border-foreground/40 px-6 pt-1 text-xs font-semibold">
                {t("donors.authorized_signature_d8428e")}</div>
            </div>
          </div>
          
          <div className="text-center text-[10px] text-muted-foreground pt-4 opacity-70">
            {t("donors.single_source_of_tru_0b0420")}</div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
