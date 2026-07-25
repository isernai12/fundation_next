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

interface ReceiptCampaignContributionModalProps {
  isOpen: boolean
  onClose: () => void
  contribution: ContributionItem | null
  mode?: "print" | "pdf"
}

export function ReceiptCampaignContributionModal({ isOpen, onClose, contribution, mode = "print" }: ReceiptCampaignContributionModalProps) {
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
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden bg-white dark:bg-zinc-950 text-black dark:text-white print:p-0 print:border-none print:shadow-none">
        {/* Header Action Bar (Hidden when printing) */}
        <div className="flex items-center justify-between px-6 py-4 bg-muted/50 border-b print:hidden">
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            {mode === "pdf" ? (
              <>
                <Download className="w-5 h-5 text-primary" />
                <span>তহবিল রিসিট এক্সপোর্ট (Export PDF Receipt)</span>
              </>
            ) : (
              <>
                <Printer className="w-5 h-5 text-primary" />
                <span>তহবিল রিসিট প্রিন্ট (Print Receipt)</span>
              </>
            )}
          </DialogTitle>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handlePrint} className="flex items-center gap-1">
              <Printer className="w-4 h-4" />
              <span>প্রিন্ট করুন</span>
            </Button>
            <Button size="sm" variant="default" onClick={handleExportPDF} className="flex items-center gap-1">
              <Download className="w-4 h-4" />
              <span>PDF ডাউনলোড</span>
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
              <span>FOUNDATION ERP</span>
            </div>
            <p className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
              অফিশিয়াল তহবিল গ্রহণ ভাউচার (Fund Receipt Voucher)
            </p>
            <div className="inline-flex items-center gap-1 bg-green-500/10 text-green-600 dark:text-green-400 px-3 py-1 rounded-full text-xs font-semibold mt-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>লেনদেন সফল ও লেজারে লিপিবদ্ধ</span>
            </div>
          </div>

          {/* Receipt Info Grid */}
          <div className="grid grid-cols-2 gap-4 text-sm bg-muted/30 p-4 rounded-lg border">
            <div>
              <p className="text-xs text-muted-foreground uppercase font-semibold">ভাউচার নম্বর (Voucher No)</p>
              <p className="font-mono text-base font-bold text-primary mt-0.5">{voucherNo}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground uppercase font-semibold">তারিখ (Date)</p>
              <p className="font-semibold mt-0.5">{formatDate(contribution.date)}</p>
              <p className="text-xs text-muted-foreground">({new Date(contribution.date).toLocaleDateString("bn-BD")})</p>
            </div>
          </div>

          {/* Details Table */}
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-muted text-xs uppercase font-semibold text-muted-foreground border-b">
                <tr>
                  <th className="py-3 px-4">বিবরণ (Description)</th>
                  <th className="py-3 px-4 text-right">পরিমাণ (Amount)</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm">
                <tr>
                  <td className="py-4 px-4 space-y-1">
                    <p className="font-bold text-base text-foreground">{contribution.campaign?.name || "তহবিল জমা"}</p>
                    <p className="text-xs text-muted-foreground">
                      প্রদানকারী: <span className="font-semibold text-foreground">{contributorName}</span> ({contributorType})
                    </p>
                    {contribution.member?.memberId && (
                      <p className="text-xs text-muted-foreground">সদস্য আইডি: {contribution.member.memberId}</p>
                    )}
                    {contribution.donor?.mobile && (
                      <p className="text-xs text-muted-foreground">মোবাইল: {contribution.donor.mobile}</p>
                    )}
                    {contribution.remarks && (
                      <p className="text-xs italic bg-muted/50 p-1.5 rounded mt-2 text-muted-foreground">
                        মন্তব্য: {contribution.remarks}
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
                  <td className="py-3 px-4 text-right">মোট জমাকৃত (Total Received):</td>
                  <td className="py-3 px-4 text-right text-xl text-primary font-mono">৳{contribution.amount}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Ledger Verification Footer */}
          <div className="pt-6 border-t text-xs text-muted-foreground flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-semibold">লেজার ট্র্যাকিং আইডি:</p>
              <p className="font-mono text-xs opacity-80">{contribution.ledgerTransactionId}</p>
            </div>
            <div className="text-center sm:text-right">
              <div className="inline-block border-t border-dashed border-foreground/40 px-6 pt-1 text-xs">
                অনুমোদিত স্বাক্ষর (Authorized Signature)
              </div>
            </div>
          </div>
          
          <div className="text-center text-[10px] text-muted-foreground pt-4 opacity-70">
            * এটি একটি কম্পিউটার জেনারেটেড রিসিট। লেজার ইঞ্জিন দ্বারা সুরক্ষিত (Single Source of Truth)।
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
