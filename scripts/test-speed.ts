import { getDashboardStats } from "../src/features/dashboard/actions"
import { prisma } from "../src/lib/prisma"

async function run() {
  const start = Date.now()
  await getDashboardStats()
  console.log(`getDashboardStats took ${Date.now() - start}ms`)
  process.exit(0)
}
run()
