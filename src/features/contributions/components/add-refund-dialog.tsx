"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { contributionRefundSchema, type ContributionRefundFormValues } from "../schema"
import { createContributionRefund } from "../ledger-actions"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { RotateCcw } from "lucide-react"

type MemberOption = {
  id: string
  memberId: string
  fullName: string | null
}

interface AddRefundDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  members: MemberOption[]
  onSuccess?: () => void
}

export function AddRefundDialog({ open, onOpenChange, members, onSuccess }: AddRefundDialogProps) {
  const [loading, setLoading] = useState(false)
  const today = new Date().toISOString().split("T")[0]

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ContributionRefundFormValues>({
    resolver: zodResolver(contributionRefundSchema),
    defaultValues: {
      memberId: "",
      amount: 100,
      paymentDate: today,
      paymentMethod: "CASH",
      referenceNumber: "",
      notes: "",
    },
  })

  const onSubmit = async (data: ContributionRefundFormValues) => {
    setLoading(true)
    try {
      const res = await createContributionRefund(data)
      if (res.success) {
        toast.success("চাঁদা ফেরত সফলভাবে রেকর্ড করা হয়েছে")
        reset()
        onOpenChange(false)
        if (onSuccess) onSuccess()
      } else {
        toast.error((res as any).error || "ফেরত প্রক্রিয়া করতে ব্যর্থ হয়েছে")
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
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <RotateCcw className="h-5 w-5" />
            চাঁদা ফেরত রেকর্ড করুন (Contribution Refund)
          </DialogTitle>
          <DialogDescription>
            সদস্যকে চাঁদা ফেরত প্রদান করলে এখান থেকে রেকর্ড যুক্ত করুন। এটি লেজারে ডেবিট (Debit) হিসেবে অন্তর্ভুক্ত হবে।
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

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">ফেরতের পরিমাণ (টাকা) *</Label>
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
              placeholder="উদা: RFD-2026-001"
              {...register("referenceNumber")}
            />
          </div>

          {/* Notes / Reason */}
          <div className="space-y-2">
            <Label htmlFor="notes">ফেরতের কারণ / বিবরণ *</Label>
            <Input
              id="notes"
              placeholder="উদা: ভুল পরিশোধের জন্য ফেরত প্রদান"
              {...register("notes")}
            />
            {errors.notes && <p className="text-xs text-destructive">{errors.notes.message}</p>}
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              বাতিল
            </Button>
            <Button type="submit" variant="destructive" disabled={loading}>
              {loading ? "সংরক্ষণ হচ্ছে..." : "ফেরত সংরক্ষণ করুন"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
