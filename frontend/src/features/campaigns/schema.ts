import { z } from "zod"

export const campaignSchema = z.object({
  name: z.string().min(1, "কার্যক্রমের নাম আবশ্যক"),
  purpose: z.string().min(1, "উদ্দেশ্য আবশ্যক"),
  description: z.string().optional(),
  targetAmount: z.number().min(0).optional(),
  startDate: z.string().min(1, "শুরুর তারিখ আবশ্যক"),
  endDate: z.string().optional(),
  status: z.enum(["ACTIVE", "COMPLETED", "CANCELLED"]),
  remarks: z.string().optional(),
})

export type CampaignFormValues = z.infer<typeof campaignSchema>

export const campaignContributionSchema = z.object({
  campaignId: z.string().min(1, "তহবিল নির্বাচন করুন"),
  contributorType: z.enum(["MEMBER", "DONOR"]),
  memberId: z.string().optional(),
  donorName: z.string().optional(),
  donorMobile: z.string().optional(),
  donorAddress: z.string().optional(),
  amount: z.number().min(1, "পরিমাণ আবশ্যক"),
  date: z.string().min(1, "তারিখ আবশ্যক"),
  remarks: z.string().optional(),
}).refine(data => {
  if (data.contributorType === "MEMBER") return !!data.memberId;
  return !!data.donorName && !!data.donorMobile;
}, {
  message: "সদস্য নির্বাচন করুন অথবা অনুদানদাতার নাম ও মোবাইল নম্বর প্রদান করুন",
  path: ["donorName"]
})

export type CampaignContributionFormValues = z.infer<typeof campaignContributionSchema>

export const beneficiaryPaymentSchema = z.object({
  campaignId: z.string().min(1, "তহবিল নির্বাচন করুন (Financial Activity required)"),
  beneficiaryId: z.string().min(1, "সুবিধাভোগী নির্বাচন করুন (Beneficiary required)"),
  amount: z.number().min(1, "পরিমাণ ০ এর বেশি হতে হবে (Amount must be > 0)"),
  date: z.string().min(1, "তারিখ আবশ্যক"),
  reason: z.string().min(1, "কারণ আবশ্যক (Reason required)"),
  referenceNumber: z.string().optional(),
  comments: z.string().optional(),
})

export type BeneficiaryPaymentFormValues = z.infer<typeof beneficiaryPaymentSchema>
