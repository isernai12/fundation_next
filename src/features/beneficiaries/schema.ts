import { z } from "zod"

export const beneficiarySchema = z.object({
  // Section 1: ব্যক্তিগত তথ্য
  fullName: z.string().min(2, "পূর্ণ নাম আবশ্যক"),
  fatherOrHusbandName: z.string().optional(),
  nationalId: z.string().optional(),
  mobile: z.string().optional(),
  presentAddress: z.string().optional(),
  permanentAddress: z.string().optional(),

  // Internal overrides for compatibility
  address: z.string().optional(), // maps to presentAddress if needed


  // Section 4: জরুরি যোগাযোগ
  emergencyContactName: z.string().optional(),
  emergencyContactRelation: z.string().optional(),
  emergencyContactMobile: z.string().optional(),

  // Docs (Cloudinary URLs)
  photoUrl: z.string().optional(),
  documentUrl: z.string().optional(),
  
  beneficiaryPhoto: z.string().optional(),
  nidOrBirthCertificate: z.string().optional(),

  memberId: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  occupation: z.string().optional(),
  relationToMember: z.string().optional(),
  remarks: z.string().optional(),

  // Required for backend mapping
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
})

export type BeneficiaryFormValues = z.input<typeof beneficiarySchema>
