import { z } from "zod"

export const memberSchema = z.object({
  groupId: z.string().min(1, "members.validation.group_required"),
  fullName: z.string().min(1, "members.validation.name_required").transform((v) => v.trim()),
  fatherName: z.string().optional().or(z.literal("")),
  motherName: z.string().optional().or(z.literal("")),
  dob: z.string().optional().or(z.literal("")),
  nationalId: z.string().optional().or(z.literal("")),
  occupation: z.string().optional().or(z.literal("")),
  education: z.string().optional().or(z.literal("")),
  presentAddress: z.string().optional().or(z.literal("")),
  permanentAddress: z.string().optional().or(z.literal("")),
  mobile: z.string().optional().or(z.literal("")),
  email: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((val) => !val || val === "" || z.string().email().safeParse(val).success, {
      message: "members.validation.invalid_email",
    }),
  bloodGroup: z.string().optional().or(z.literal("")),

  // Emergency Contact
  emergencyContactName: z.string().optional().or(z.literal("")),
  emergencyContactRelation: z.string().optional().or(z.literal("")),
  emergencyContactMobile: z.string().optional().or(z.literal("")),

  // Reference / Nominee
  referenceName: z.string().optional().or(z.literal("")),
  referenceMobile: z.string().optional().or(z.literal("")),
  referenceRelation: z.string().optional().or(z.literal("")),

  // Documents
  photoBase64: z.string().optional().or(z.literal("")),
  idDocumentType: z.enum(["NID", "BIRTH_CERTIFICATE"]).optional(),
  nidFrontBase64: z.string().optional().or(z.literal("")),
  nidBackBase64: z.string().optional().or(z.literal("")),
  birthCertificateBase64: z.string().optional().or(z.literal("")),
  signatureBase64: z.string().optional().or(z.literal("")),
})

export type MemberFormValues = z.infer<typeof memberSchema>
