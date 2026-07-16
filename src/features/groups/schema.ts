import { z } from "zod"
import { GroupStatus } from "@prisma/client"

export const groupSchema = z.object({
  name: z.string().min(1, "Group Name is required").max(100, "Name must be less than 100 characters"),
  code: z.string().min(1, "Group Code is required").max(20, "Code must be less than 20 characters").regex(/^[A-Z0-9-]+$/, "Only uppercase letters, numbers, and dashes allowed"),
  shortName: z.string().max(20).optional(),
  description: z.string().optional(),
  status: z.nativeEnum(GroupStatus).default(GroupStatus.ACTIVE),
  openingBalance: z.coerce.number().min(0, "Opening Balance cannot be negative").default(0),
  groupLeader: z.string().optional(),
  remarks: z.string().optional(),
})

export type GroupFormValues = z.infer<typeof groupSchema>
