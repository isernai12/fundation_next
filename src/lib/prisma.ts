import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: [
      { emit: 'event', level: 'query' },
      { emit: 'stdout', level: 'error' },
      { emit: 'stdout', level: 'warn' },
    ],
  })

// @ts-ignore
if (process.env.NODE_ENV !== 'production' && !globalForPrisma.prisma) {
  // @ts-ignore
  prisma.$on('query', (e: any) => {
    console.log(`[Prisma Query] ${e.duration}ms - ${e.query}`)
  })
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
