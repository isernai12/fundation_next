import { z } from "zod"
import { GroupStatus } from "@prisma/client"

export const groupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name must be less than 100 characters"),
  code: z.string().min(2, "Code must be at least 2 characters").max(20, "Code must be less than 20 characters").regex(/^[A-Z0-9-]+$/, "Only uppercase letters, numbers, and dashes allowed"),
  description: z.string().optional(),
  status: z.nativeEnum(GroupStatus),
})

export type GroupFormValues = z.infer<typeof groupSchema>
