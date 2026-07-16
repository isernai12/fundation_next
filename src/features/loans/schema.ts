import { z } from "zod"

export const loanAllocationSchema = z.object({
  fundId: z.string().min(1, "Fund is required"),
  amount: z.number().min(1, "Amount must be greater than zero"),
})

export const loanSchema = z.object({
  beneficiaryId: z.string().min(1, "Beneficiary is required"),
  amount: z.number().min(1, "Amount must be strictly positive"),
  purpose: z.string().min(3, "Purpose required"),
  installmentCount: z.number().min(1, "Must have at least 1 installment"),
  notes: z.string().optional(),
  allocations: z.array(loanAllocationSchema).min(1, "At least one funding source is required"),
  dateApproved: z.date().optional(),
})

export type LoanFormValues = z.infer<typeof loanSchema>
export type LoanAllocationFormValues = z.infer<typeof loanAllocationSchema>
