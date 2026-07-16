import { z } from "zod"

export const grantAllocationSchema = z.object({
  groupId: z.string().min(1, "Group is required"),
  amount: z.number().positive("Amount must be positive"),
})

export const grantSchema = z.object({
  beneficiaryId: z.string().min(1, "Beneficiary is required"),
  grantDate: z.string().min(1, "Grant Date is required"),
  category: z.string().min(1, "Category is required"),
  amount: z.number().positive("Grant amount must be positive"),
  reason: z.string().min(1, "Reason/Description is required"),
  approvedBy: z.string().min(1, "Approver name is required"),
  referenceNumber: z.string().optional(),
  remarks: z.string().optional(),
  allocations: z.array(grantAllocationSchema).min(1, "At least one funding group must be selected"),
}).refine(data => {
  const totalAllocated = data.allocations.reduce((sum, a) => sum + a.amount, 0)
  return totalAllocated === data.amount
}, {
  message: "Total allocated from groups must exactly equal the grant amount",
  path: ["allocations"]
})

export type GrantFormValues = z.infer<typeof grantSchema>
