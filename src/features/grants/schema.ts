import { z } from "zod"

export const grantSchema = z.object({
  beneficiaryId: z.string().min(1, "Beneficiary is required"),
  amount: z.number().min(1, "Amount must be strictly positive"),
  purpose: z.string().min(3, "Purpose required"),
  notes: z.string().optional(),
})

export type GrantFormValues = z.infer<typeof grantSchema>
