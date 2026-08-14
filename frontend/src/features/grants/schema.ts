import { z } from "zod"

export const grantAllocationSchema = z.object({
  groupId: z.string().min(1, "গ্রুপ নির্বাচন করুন"),
  amount: z.coerce.number().positive("পরিমাণ অবশ্যই ধনাত্মক হতে হবে"),
})

export const grantSchema = z.object({
  beneficiaryId: z.string().min(1, "সুবিধাভোগী নির্বাচন করুন"),
  grantDate: z.string().min(1, "তারিখ প্রদান করুন"),
  amount: z.coerce.number().positive("অনুদানের পরিমাণ অবশ্যই ধনাত্মক হতে হবে"),
  grantReason: z.string().min(1, "অনুদানের কারণ প্রদান করুন"),
  comment: z.string().optional(),
  allocations: z.array(grantAllocationSchema).min(1, "অন্তত একটি ফান্ডিং গ্রুপ নির্বাচন করুন"),
}).refine(data => {
  const totalAllocated = data.allocations.reduce((sum, a) => sum + a.amount, 0)
  return totalAllocated === data.amount
}, {
  message: "ফান্ডিং গ্রুপের মোট পরিমাণ অনুদানের পরিমাণের সমান হতে হবে",
  path: ["allocations"]
})

export type GrantFormValues = z.infer<typeof grantSchema>
