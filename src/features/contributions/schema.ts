import { z } from "zod"
import { ContributionStatus } from "@prisma/client"

export const contributionSchema = z.object({
  memberId: z.string().min(1, "সদস্য নির্বাচন করা আবশ্যক"),
  month: z.number().min(1).max(12),
  year: z.number().min(2000).max(2100),
  amount: z.number().min(100, "ন্যূনতম চাঁদার পরিমাণ ১০০"),
  paymentDate: z.string().min(1, "জমাদানের তারিখ আবশ্যক"), // YYYY-MM-DD
  paymentMethod: z.string().min(1, "পরিশোধের মাধ্যম আবশ্যক"),
  referenceNumber: z.string().optional(),
  notes: z.string().optional(),
  status: z.nativeEnum(ContributionStatus),
  isAdditional: z.boolean(),
})

export type ContributionFormValues = z.infer<typeof contributionSchema>
