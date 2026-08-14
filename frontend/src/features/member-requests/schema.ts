import { z } from "zod";

export const memberRequestSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  fatherName: z.string().optional().nullable(),
  motherName: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
  dob: z.string().optional().nullable(),
  nationalId: z.string().optional().nullable(),
  idDocumentType: z.string().optional().nullable(),
  occupation: z.string().optional().nullable(),
  monthlyIncome: z.number().int().optional().nullable(),
  bloodGroup: z.string().optional().nullable(),
  education: z.string().optional().nullable(),
  maritalStatus: z.string().optional().nullable(),
  mobile: z.string().optional().nullable(),
  altMobile: z.string().optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal("")),
  phone: z.string().optional().nullable(),
  presentAddress: z.string().optional().nullable(),
  permanentAddress: z.string().optional().nullable(),
  emergencyContactName: z.string().optional().nullable(),
  emergencyContactMobile: z.string().optional().nullable(),
  emergencyContactRelation: z.string().optional().nullable(),
  referenceName: z.string().optional().nullable(),
  referenceMobile: z.string().optional().nullable(),
  referenceRelation: z.string().optional().nullable(),
  groupId: z.string().min(1, "Group is required"),
  reasonForJoining: z.string().optional().nullable(),
  
  // Document base64 uploads
  photoBase64: z.string().optional().nullable(),
  nidFrontBase64: z.string().optional().nullable(),
  nidBackBase64: z.string().optional().nullable(),
  birthCertificateBase64: z.string().optional().nullable(),
  signatureBase64: z.string().optional().nullable(),
});

export type MemberRequestInput = z.infer<typeof memberRequestSchema>;
