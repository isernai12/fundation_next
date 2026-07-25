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

interface ViewDonationDialogProps {
  isOpen: boolean
  onClose: () => void
  donation: DonationTransactionItem | null
}

export function ViewDonationDialog({ isOpen, onClose, donation }: ViewDonationDialogProps) {
  if (!donation) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>অনুদান গ্রহণের বিস্তারিত (Donation Details)</DialogTitle>
          <DialogDescription>
            গৃহীত অনুদানের সম্পূর্ণ তথ্য ও লেজার রেফারেন্স।
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-y-4 gap-x-8 py-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">অনুদানদাতা (Donor)</p>
            <p className="font-semibold text-base text-foreground">{donation.donor?.fullName || "অজানা অনুদানদাতা"}</p>
            {donation.donor && (
              <>
                <p className="text-xs text-muted-foreground">আইডি: {donation.donor.donorId}</p>
                <p className="text-xs text-muted-foreground">মোবাইল: {donation.donor.mobile}</p>
              </>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">তহবিল গন্তব্য (Selected Group)</p>
            <p className="font-semibold text-base text-primary mt-0.5">{donation.groupName}</p>
          </div>

          <Separator className="col-span-2 my-1" />

          <div>
            <p className="text-sm font-medium text-muted-foreground">ভাউচার নম্বর (Voucher No)</p>
            <p className="font-mono text-sm font-bold mt-1 bg-muted px-2 py-1 rounded text-primary w-fit">
              {donation.voucherNo}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">পরিমাণ (Amount)</p>
            <p className="font-mono text-xl font-bold text-green-600 dark:text-green-400 mt-0.5">
              ৳{donation.amount}
            </p>
          </div>

          <Separator className="col-span-2 my-1" />

          <div>
            <p className="text-sm font-medium text-muted-foreground">তারিখ (Date)</p>
            <p className="font-medium text-sm mt-0.5">{formatDate(donation.date)}</p>
            <p className="text-xs text-muted-foreground">({new Date(donation.date).toLocaleDateString("bn-BD")})</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">এন্ট্রি করেছেন (Created By)</p>
            <p className="font-medium text-sm mt-0.5">{donation.createdBy}</p>
            <p className="text-xs text-muted-foreground">স্ট্যাটাস: <Badge variant="outline" className="text-[10px] ml-1">{donation.status}</Badge></p>
          </div>

          <Separator className="col-span-2 my-1" />

          <div className="col-span-2">
            <p className="text-sm font-medium text-muted-foreground">বিবরণ / মন্তব্য (Remarks)</p>
            <div className="mt-1 p-3 bg-muted/30 rounded border text-sm text-foreground">
              {donation.remarks || "কোন মন্তব্য নেই"}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
