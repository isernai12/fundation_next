import { z } from "zod"

export const loanSchema = z.object({
  beneficiaryId: z.string().min(1, "সুবিধাভোগী নির্বাচন করুন"),
  loanType: z.enum(["BUSINESS", "OTHER"]),
  businessType: z.string().optional(),
  purpose: z.string().optional(),
  amount: z.coerce.number().min(1, "ঋণের পরিমাণ শূন্যের বেশি হতে হবে"),
  notes: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.loanType === "BUSINESS") {
    if (!data.businessType || data.businessType.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["businessType"],
        message: "ব্যবসার ধরন প্রদান করুন",
      });
    }
    if (!data.purpose || data.purpose.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["purpose"],
        message: "ঋণ গ্রহণের উদ্দেশ্য প্রদান করুন",
      });
    }
  } else if (data.loanType === "OTHER") {
    if (!data.purpose || data.purpose.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["purpose"],
        message: "কারণ প্রদান করুন",
      });
    }
  }
});

export type LoanFormValues = z.infer<typeof loanSchema>
