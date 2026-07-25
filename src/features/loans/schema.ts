import { z } from "zod"

export const loanSchema = z.object({
  beneficiaryId: z.string().min(1, "সুবিধাভোগী নির্বাচন করুন"),
  loanType: z.enum(["BUSINESS", "OTHER"]),
  businessType: z.string().optional(),
  purpose: z.string().optional(),
  amount: z.coerce.number().min(1, "ঋণের পরিমাণ শূন্যের বেশি হতে হবে"),
  notes: z.string().optional(),
  
  // Installment Details
  installmentType: z.enum(["DAILY", "WEEKLY", "MONTHLY", "CUSTOM"]).optional(),
  installmentAmount: z.coerce.number().optional(),
  totalInstallments: z.coerce.number().optional(),
  firstInstallmentDate: z.date().optional(),
  
  isMultiGroup: z.boolean().default(false),
  fundAllocations: z.array(z.object({
    groupId: z.string().min(1, "গ্রুপ নির্বাচন করুন"),
    amount: z.coerce.number().min(1, "পরিমাণ শূন্যের বেশি হতে হবে")
  })).min(1, "অন্তত একটি ফান্ডের উৎস নির্বাচন করতে হবে"),

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

  const totalAllocated = data.fundAllocations?.reduce((acc, curr) => acc + curr.amount, 0) || 0;
  if (totalAllocated !== data.amount) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["fundAllocations"],
      message: `মোট বরাদ্দকৃত পরিমাণ (৳${totalAllocated}) ঋণের পরিমাণের (৳${data.amount}) সমান হতে হবে`,
    });
  }
});

export type LoanFormValues = z.infer<typeof loanSchema>
