import { z } from "zod"
import { ContributionStatus } from "@prisma/client"

export const contributionSchema = z.object({
  memberId: z.string().min(1, "Member is required"),
  month: z.number().min(1).max(12),
  year: z.number().min(2000).max(2100),
  amount: z.number().min(100, "Minimum payment amount is 100"),
  paymentDate: z.string().min(1, "Payment Date is required"), // YYYY-MM-DD
  paymentMethod: z.string().min(1, "Payment method is required"),
  referenceNumber: z.string().optional(),
  notes: z.string().optional(),
  status: z.nativeEnum(ContributionStatus),
  isAdditional: z.boolean(),
})

export type ContributionFormValues = z.infer<typeof contributionSchema>
