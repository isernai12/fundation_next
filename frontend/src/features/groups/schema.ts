import { z } from "zod"

export const groupSchema = z.object({
  name: z.string().min(1, "groups.validation.nameRequired").max(100, "groups.validation.nameMax"),
  code: z.string().min(1, "groups.validation.codeRequired").max(20, "groups.validation.codeMax").regex(/^[A-Z0-9-]+$/, "groups.validation.codeRegex"),
  shortName: z.string().max(20).optional(),
  description: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
  openingBalance: z.coerce.number().min(0, "groups.validation.openingBalanceMin").default(0),
  remarks: z.string().optional(),
  memberSignupEnabled: z.boolean().default(true),
  isFoundationGroup: z.boolean().default(false),
})

export type GroupFormValues = z.infer<typeof groupSchema>
