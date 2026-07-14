import { z } from "zod"

export const beneficiarySchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  memberId: z.string().optional(),
  relationToMember: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  mobile: z.string().min(10, "Mobile number required"),
  address: z.string().min(5, "Address required"),
  nationalId: z.string().optional(),
  occupation: z.string().optional(),
  remarks: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]),
})

export type BeneficiaryFormValues = z.infer<typeof beneficiarySchema>
