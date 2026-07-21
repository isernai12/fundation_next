import { z } from "zod"
import { GroupStatus } from "@prisma/client"

export const groupSchema = z.object({
  name: z.string().min(1, "গ্রুপের নাম আবশ্যক").max(100, "নাম ১০০ অক্ষরের কম হতে হবে"),
  code: z.string().min(1, "গ্রুপ কোড আবশ্যক").max(20, "কোড ২০ অক্ষরের কম হতে হবে").regex(/^[A-Z0-9-]+$/, "শুধুমাত্র বড় হাতের অক্ষর, সংখ্যা এবং ড্যাশ অনুমোদিত"),
  shortName: z.string().max(20).optional(),
  description: z.string().optional(),
  status: z.nativeEnum(GroupStatus).default(GroupStatus.ACTIVE),
  openingBalance: z.coerce.number().min(0, "প্রারম্ভিক তহবিল নেতিবাচক হতে পারে না").default(0),
  remarks: z.string().optional(),
})

export type GroupFormValues = z.infer<typeof groupSchema>
