import type { Group } from "@prisma/client"

export type GroupWithCount = Group & {
  _count: {
    members: number
  }
  currentFund?: number
}
