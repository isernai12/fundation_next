"use client"

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Printer, Download, X, Building, CheckCircle2 } from "lucide-react"
import { formatDate } from "@/lib/format"
import type { ContributionItem } from "./view-campaign-contribution-dialog"
import { useLanguage } from "@/i18n/LanguageProvider";

interface ReceiptCampaignContributionModalProps {
  isOpen: boolean
  onClose: () => void
  contribution: ContributionItem | null
  mode?: "print" | "pdf"
}

export function ReceiptCampaignContributionModal({ isOpen, onClose, contribution, mode = "print" }: ReceiptCampaignContributionModalProps) {
    const { t } = useLanguage();
  if (!contribution) return null

  const voucherNo = `VCH-${contribution.ledgerTransactionId.slice(0, 8).toUpperCase()}`
  const contributorName = contribution.member ? contribution.member.fullName : contribution.donor?.fullName || "অজানা"
  const contributorType = contribution.memberId ? "সদস্য (Member)" : "ডোনার / অ-সদস্য (Non-Member)"

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
                <span>{t("campaigns.export_pdf_receipt_2395d9")}</span>
              </>
            ) : (
              <>
                <Printer className="w-5 h-5 text-primary" />
                <span>{t("campaigns.print_receipt_561bc6")}</span>
              </>
            )}
          </DialogTitle>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handlePrint} className="flex items-center gap-1">
              <Printer className="w-4 h-4" />
              <span>{t("campaigns.k_d26d50")}</span>
            </Button>
            <Button size="sm" variant="default" onClick={handleExportPDF} className="flex items-center gap-1">
              <Download className="w-4 h-4" />
              <span>{t("campaigns.pdf_5dbe87")}</span>
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
              <span>{t("campaigns.foundation_erp_eca844")}</span>
            </div>
            <p className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
              {t("campaigns.fund_receipt_voucher_c9d68d")}</p>
            <div className="inline-flex items-center gap-1 bg-green-500/10 text-green-600 dark:text-green-400 px-3 py-1 rounded-full text-xs font-semibold mt-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{t("campaigns.k_86e090")}</span>
            </div>
          </div>

          {/* Receipt Info Grid */}
          <div className="grid grid-cols-2 gap-4 text-sm bg-muted/30 p-4 rounded-lg border">
            <div>
              <p className="text-xs text-muted-foreground uppercase font-semibold">{t("campaigns.voucher_no_69acba")}</p>
              <p className="font-mono text-base font-bold text-primary mt-0.5">{voucherNo}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground uppercase font-semibold">{t("campaigns.date_806233")}</p>
              <p className="font-semibold mt-0.5">{formatDate(contribution.date)}</p>
              <p className="text-xs text-muted-foreground">({new Date(contribution.date).toLocaleDateString("bn-BD")})</p>
            </div>
          </div>

          {/* Details Table */}
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-muted text-xs uppercase font-semibold text-muted-foreground border-b">
                <tr>
                  <th className="py-3 px-4">{t("campaigns.description_659020")}</th>
                  <th className="py-3 px-4 text-right">{t("campaigns.amount_261c82")}</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm">
                <tr>
                  <td className="py-4 px-4 space-y-1">
                    <p className="font-bold text-base text-foreground">{contribution.campaign?.name || "তহবিল জমা"}</p>
                    <p className="text-xs text-muted-foreground">
                      {t("campaigns.k_950098")}<span className="font-semibold text-foreground">{contributorName}</span> ({contributorType})
                    </p>
                    {contribution.member?.memberId && (
                      <p className="text-xs text-muted-foreground">{t("campaigns.k_6139db")}{contribution.member.memberId}</p>
                    )}
                    {contribution.donor?.mobile && (
                      <p className="text-xs text-muted-foreground">{t("campaigns.k_9767a6")}{contribution.donor.mobile}</p>
                    )}
                    {contribution.remarks && (
                      <p className="text-xs italic bg-muted/50 p-1.5 rounded mt-2 text-muted-foreground">
                        {t("campaigns.k_b6aa98")}{contribution.remarks}
                      </p>
                    )}
                  </td>
                  <td className="py-4 px-4 text-right font-bold text-lg text-green-600 font-mono align-top">
                    ৳{contribution.amount}
                  </td>
                </tr>
              </tbody>
              <tfoot className="bg-muted/40 font-bold border-t">
                <tr>
                  <td className="py-3 px-4 text-right">{t("campaigns.total_received_4633dc")}</td>
                  <td className="py-3 px-4 text-right text-xl text-primary font-mono">৳{contribution.amount}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Ledger Verification Footer */}
          <div className="pt-6 border-t text-xs text-muted-foreground flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-semibold">{t("campaigns.k_00b14c")}</p>
              <p className="font-mono text-xs opacity-80">{contribution.ledgerTransactionId}</p>
            </div>
            <div className="text-center sm:text-right">
              <div className="inline-block border-t border-dashed border-foreground/40 px-6 pt-1 text-xs">
                {t("campaigns.authorized_signature_d8428e")}</div>
            </div>
          </div>
          
          <div className="text-center text-[10px] text-muted-foreground pt-4 opacity-70">
            {t("campaigns.single_source_of_tru_0b0420")}</div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
