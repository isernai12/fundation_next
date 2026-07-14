import { z } from "zod"
import { MemberStatus } from "@prisma/client"

export const memberSchema = z.object({
  groupId: z.string().min(1, "Group is required"),
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  
  fatherName: z.string().optional(),
  motherName: z.string().optional(),
  gender: z.string().optional(),
  dob: z.string().optional(), // Store as string from form, convert to Date in action
  nationalId: z.string().min(5, "National ID must be at least 5 characters"),
  occupation: z.string().optional(),
  monthlyIncome: z.any(),
  bloodGroup: z.string().optional(),
  
  mobile: z.string().min(10, "Valid mobile number is required"),
  altMobile: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  presentAddress: z.string().optional(),
  permanentAddress: z.string().optional(),
  
  emergencyContactName: z.string().optional(),
  emergencyContactMobile: z.string().optional(),
  emergencyContactRelation: z.string().optional(),

  joinDate: z.string().optional(), // Date string
  status: z.nativeEnum(MemberStatus),
  remarks: z.string().optional(),
})

export type MemberFormValues = z.infer<typeof memberSchema>
