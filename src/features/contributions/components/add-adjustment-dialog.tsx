"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { contributionAdjustmentSchema, type ContributionAdjustmentFormValues } from "../schema"
import { createContributionAdjustment } from "../ledger-actions"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { SlidersHorizontal } from "lucide-react"

type MemberOption = {
  id: string
  memberId: string
  fullName: string | null
}

interface AddAdjustmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  members: MemberOption[]
  onSuccess?: () => void
}

export function AddAdjustmentDialog({ open, onOpenChange, members, onSuccess }: AddAdjustmentDialogProps) {
  const [loading, setLoading] = useState(false)
  const today = new Date().toISOString().split("T")[0]

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ContributionAdjustmentFormValues>({
    resolver: zodResolver(contributionAdjustmentSchema),
    defaultValues: {
      memberId: "",
      adjustmentType: "CREDIT",
      amount: 100,
      paymentDate: today,
      paymentMethod: "CASH",
      referenceNumber: "",
      notes: "",
    },
  })

  const onSubmit = async (data: ContributionAdjustmentFormValues) => {
    setLoading(true)
    try {
      const res = await createContributionAdjustment(data)
      if (res.success) {
        toast.success("চাঁদা সমন্বয় সফলভাবে রেকর্ড করা হয়েছে")
        reset()
        onOpenChange(false)
        if (onSuccess) onSuccess()
      } else {
        toast.error((res as any).error || "সমন্বয় প্রক্রিয়া করতে ব্যর্থ হয়েছে")
      }
    } catch (err: any) {
      toast.error(err.message || "ত্রুটি ঘটেছে")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary">
            <SlidersHorizontal className="h-5 w-5" />
            চাঁদা সমন্বয় রেকর্ড করুন (Contribution Adjustment)
          </DialogTitle>
          <DialogDescription>
            হিসাবের গরমিল বা পূর্ববর্তী চাঁদা সমন্বয় করতে এখান থেকে ক্রেডিট (জমা) অথবা ডেবিট (কর্তন) সমন্বয় যুক্ত করুন।
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Member Selection */}
          <div className="space-y-2">
            <Label htmlFor="memberId">সদস্য নির্বাচন করুন *</Label>
            <Select
              value={watch("memberId")}
              onValueChange={(val) => setValue("memberId", val, { shouldValidate: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder="সদস্য খুঁজুন/নির্বাচন করুন" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {members.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.memberId} - {m.fullName || "সদস্য"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.memberId && <p className="text-xs text-destructive">{errors.memberId.message}</p>}
          </div>

          {/* Adjustment Type */}
          <div className="space-y-2">
            <Label htmlFor="adjustmentType">সমন্বয়ের ধরন *</Label>
            <Select
              value={watch("adjustmentType")}
              onValueChange={(val: "CREDIT" | "DEBIT") => setValue("adjustmentType", val, { shouldValidate: true })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CREDIT">জমা সমন্বয় (CREDIT - বাড়াবে)</SelectItem>
                <SelectItem value="DEBIT">কর্তন সমন্বয় (DEBIT - কমাবে)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">পরিমাণ (টাকা) *</Label>
            <Input
              type="number"
              id="amount"
              min={1}
              {...register("amount", { valueAsNumber: true })}
            />
            {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
          </div>

          {/* Date & Payment Method */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="paymentDate">তারিখ *</Label>
              <Input type="date" id="paymentDate" {...register("paymentDate")} />
              {errors.paymentDate && <p className="text-xs text-destructive">{errors.paymentDate.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentMethod">মাধ্যম *</Label>
              <Select
                value={watch("paymentMethod")}
                onValueChange={(val) => setValue("paymentMethod", val, { shouldValidate: true })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">ক্যাশ (CASH)</SelectItem>
                  <SelectItem value="BANK">ব্যাংক স্থানান্তর (BANK)</SelectItem>
                  <SelectItem value="MOBILE_BANKING">মোবাইল ব্যাংকিং (bKash/Nagad)</SelectItem>
                  <SelectItem value="OTHER">অন্যান্য</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Reference Number */}
          <div className="space-y-2">
            <Label htmlFor="referenceNumber">রেফারেন্স/রসিদ নং (ঐচ্ছিক)</Label>
            <Input
              id="referenceNumber"
              placeholder="উদা: ADJ-2026-001"
              {...register("referenceNumber")}
            />
          </div>

          {/* Notes / Reason */}
          <div className="space-y-2">
            <Label htmlFor="notes">সমন্বয়ের কারণ *</Label>
            <Input
              id="notes"
              placeholder="উদা: পূর্বের হিসেব সমন্বয়"
              {...register("notes")}
            />
            {errors.notes && <p className="text-xs text-destructive">{errors.notes.message}</p>}
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              বাতিল
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "সংরক্ষণ হচ্ছে..." : "সমন্বয় সংরক্ষণ করুন"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
