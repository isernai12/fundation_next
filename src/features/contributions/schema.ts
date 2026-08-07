import { z } from "zod"

export const contributionSchema = z.object({
  memberId: z.string().min(1, "সদস্য নির্বাচন করা আবশ্যক"),
  month: z.number().min(1).max(12),
  year: z.number().min(2000).max(2100),
  amount: z.number().min(1, "ন্যূনতম চাঁদার পরিমাণ ১"),
  paymentDate: z.string().min(1, "জমাদানের তারিখ আবশ্যক"), // YYYY-MM-DD
  paymentMethod: z.string().min(1, "পরিশোধের মাধ্যম আবশ্যক"),
  referenceNumber: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(["PENDING", "PAID", "CANCELLED"]),
  isAdditional: z.boolean(),
})

export type ContributionFormValues = z.infer<typeof contributionSchema>

export const bulkContributionSchema = z.object({
  memberId: z.string().min(1, "সদস্য নির্বাচন করা আবশ্যক"),
  fromMonth: z.number().min(1).max(12),
  fromYear: z.number().min(2000).max(2100),
  toMonth: z.number().min(1).max(12),
  toYear: z.number().min(2000).max(2100),
  monthlyAmount: z.number().min(1, "ন্যূনতম চাঁদার পরিমাণ ১"),
  paymentDate: z.string().min(1, "জমাদানের তারিখ আবশ্যক"),
  paymentMethod: z.string().min(1, "পরিশোধের মাধ্যম আবশ্যক"),
  referenceNumber: z.string().optional(),
  notes: z.string().optional(),
})

export type BulkContributionFormValues = z.infer<typeof bulkContributionSchema>

export const contributionRefundSchema = z.object({
  memberId: z.string().min(1, "সদস্য নির্বাচন করা আবশ্যক"),
  amount: z.number().min(1, "ফেরতের পরিমাণ ১ টাকার বেশি হতে হবে"),
  paymentDate: z.string().min(1, "তারিখ আবশ্যক"),
  paymentMethod: z.string().min(1, "পরিশোধের মাধ্যম আবশ্যক"),
  referenceNumber: z.string().optional(),
  notes: z.string().min(1, "ফেরতের কারণ/রেফারেন্স উল্লেখ করুন"),
})

export type ContributionRefundFormValues = z.infer<typeof contributionRefundSchema>

export const contributionAdjustmentSchema = z.object({
  memberId: z.string().min(1, "সদস্য নির্বাচন করা আবশ্যক"),
  adjustmentType: z.enum(["CREDIT", "DEBIT"]),
  amount: z.number().min(1, "সমন্বয় পরিমাণ ১ টাকার বেশি হতে হবে"),
  paymentDate: z.string().min(1, "তারিখ আবশ্যক"),
  paymentMethod: z.string().min(1, "পরিশোধের মাধ্যম আবশ্যক"),
  referenceNumber: z.string().optional(),
  notes: z.string().min(1, "সমন্বয়ের কারণ উল্লেখ করুন"),
})

export type ContributionAdjustmentFormValues = z.infer<typeof contributionAdjustmentSchema>


