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

export interface ContributionItem {
  id: string
  campaignId: string
  memberId: string | null
  donorId: string | null
  ledgerTransactionId: string
  amount: number
  date: string | Date
  remarks: string | null
  campaign?: {
    id: string
    campaignId: string
    name: string
  } | null
  member?: {
    memberId: string
    fullName: string | null
    group?: {
      name: string
      code: string
    } | null
  } | null
  donor?: {
    donorId: string
    fullName: string
    mobile: string
  } | null
}

interface ViewCampaignContributionDialogProps {
  isOpen: boolean
  onClose: () => void
  contribution: ContributionItem | null
}

export function ViewCampaignContributionDialog({ isOpen, onClose, contribution }: ViewCampaignContributionDialogProps) {
  if (!contribution) return null

  const contributorName = contribution.member 
    ? contribution.member.fullName 
    : contribution.donor 
      ? contribution.donor.fullName 
      : "অজানা"

  const contributorType = contribution.memberId ? "সদস্য (Member)" : "ডোনার / অ-সদস্য (Non-Member)"

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>তহবিল গ্রহণ বিস্তারিত (Transaction Details)</DialogTitle>
          <DialogDescription>
            তহবিলে অর্থ গ্রহণের বিস্তারিত তথ্য ও লেজার রেফারেন্স।
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-y-4 gap-x-8 py-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">প্রদানকারী (Contributor)</p>
            <p className="font-medium text-base">{contributorName}</p>
            {contribution.member && (
              <p className="text-xs text-muted-foreground">সদস্য আইডি: {contribution.member.memberId}</p>
            )}
            {contribution.donor && (
              <p className="text-xs text-muted-foreground">মোবাইল: {contribution.donor.mobile}</p>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">প্রদানকারী ধরন (Type)</p>
            <Badge variant={contribution.memberId ? "default" : "secondary"} className="mt-1">
              {contributorType}
            </Badge>
          </div>

          <Separator className="col-span-2 my-1" />

          <div>
            <p className="text-sm font-medium text-muted-foreground">তহবিলের নাম (Fund Name)</p>
            <p className="font-medium text-base text-primary">{contribution.campaign?.name || "N/A"}</p>
            <p className="text-xs text-muted-foreground">আইডি: {contribution.campaign?.campaignId}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">ভাউচার নম্বর (Voucher No)</p>
            <p className="font-mono text-sm font-bold mt-1 bg-muted px-2 py-1 rounded w-fit">
              VCH-{contribution.ledgerTransactionId.slice(0, 8).toUpperCase()}
            </p>
          </div>

          <Separator className="col-span-2 my-1" />

          <div>
            <p className="text-sm font-medium text-muted-foreground">পরিমাণ (Amount)</p>
            <p className="font-bold text-2xl text-green-600">৳{contribution.amount}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">তারিখ (Date)</p>
            <p className="font-medium text-base mt-1">{formatDate(contribution.date)}</p>
            <p className="text-xs text-muted-foreground">
              ({new Date(contribution.date).toLocaleDateString("bn-BD")})
            </p>
          </div>

          <div className="col-span-2">
            <p className="text-sm font-medium text-muted-foreground">মন্তব্য / বিবরণ (Remarks)</p>
            <p className="font-medium text-sm mt-1 bg-muted/60 p-3 rounded-md border border-border/40">
              {contribution.remarks || "কোনো মন্তব্য নেই"}
            </p>
          </div>

          {contribution.member?.group && (
            <div className="col-span-2">
              <p className="text-sm font-medium text-muted-foreground">গ্রুপ তথ্য (Group)</p>
              <p className="text-sm">
                {contribution.member.group.name} ({contribution.member.group.code})
              </p>
            </div>
          )}

          <Separator className="col-span-2 my-1" />

          <div className="col-span-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">লেজার লেনদেন আইডি (Ledger Transaction ID)</p>
            <p className="font-mono text-xs text-muted-foreground mt-1 bg-secondary/30 p-2 rounded border">
              {contribution.ledgerTransactionId}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
