import { z } from "zod"

export const memberSchema = z.object({
  groupId: z.string().min(1, "গ্রুপ নির্বাচন করা আবশ্যক"),
  fullName: z.string().min(1, "পূর্ণ নাম আবশ্যক"),
  fatherName: z.string().optional(),
  motherName: z.string().optional(),
  dob: z.string().optional(),
  nationalId: z.string().optional(),
  occupation: z.string().optional(),
  education: z.string().optional(),
  presentAddress: z.string().optional(),
  permanentAddress: z.string().optional(),
  mobile: z.string().optional(),
  email: z.string().email("সঠিক ইমেইল দিন").optional().or(z.literal("")),
  bloodGroup: z.string().optional(),
  
  // Emergency Contact
  emergencyContactName: z.string().optional(),
  emergencyContactRelation: z.string().optional(),
  emergencyContactMobile: z.string().optional(),

  // Reference
  referenceName: z.string().optional(),
  referenceMobile: z.string().optional(),
  referenceRelation: z.string().optional(),

  // Documents
  photoBase64: z.string().optional(), // Used for upload
  
  idDocumentType: z.enum(["NID", "BIRTH_CERTIFICATE"]).optional(),
  nidFrontBase64: z.string().optional(),
  nidBackBase64: z.string().optional(),
  birthCertificateBase64: z.string().optional(),
  signatureBase64: z.string().optional(),
})

export type MemberFormValues = z.infer<typeof memberSchema>
