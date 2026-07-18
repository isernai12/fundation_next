import { z } from "zod"
import { MemberStatus } from "@prisma/client"

export const memberSchema = z.object({
  groupId: z.string().min(1, "Every member must belong to a group."),
  firstName: z.string().min(1, "Name is required"),
  lastName: z.string().optional(),
  
  fatherName: z.string().optional(),
  motherName: z.string().optional(),
  gender: z.string().optional(),
  dob: z.string().optional(), // Store as string from form, convert to Date in action
  nationalId: z.string().optional(),
  birthCertificate: z.string().optional(),
  occupation: z.string().optional(),
  monthlyIncome: z.string().optional(),
  bloodGroup: z.string().optional(),
  
  mobile: z.string().optional(),
  altMobile: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  presentAddress: z.string().optional(),
  permanentAddress: z.string().optional(),
  
  emergencyContactName: z.string().optional(),
  emergencyContactMobile: z.string().optional(),
  emergencyContactRelation: z.string().optional(),

  joinDate: z.string().optional(), // Date string
  status: z.nativeEnum(MemberStatus).optional(),
  remarks: z.string().optional(),
  
  // Extended Information
  maritalStatus: z.string().optional(),
  education: z.string().optional(),
  workplace: z.string().optional(),
  designation: z.string().optional(),
  skills: z.array(z.string()).optional(),
  reference: z.string().optional(),
  reasonForJoining: z.string().optional(),
  participation: z.array(z.string()).optional(),
  declarationAccepted: z.boolean().default(true),
  memberType: z.string().optional(),
})

export type MemberFormValues = z.infer<typeof memberSchema>
