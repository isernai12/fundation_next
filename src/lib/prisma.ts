import { PrismaClient } from '@prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const isDev = process.env.NODE_ENV !== 'production'

const createPrismaClient = () => {
  const adapter = new PrismaLibSQL({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  })
  
  return new PrismaClient({
    adapter,
    log: isDev
      ? [
          { emit: 'event', level: 'query' },
          { emit: 'stdout', level: 'error' },
          { emit: 'stdout', level: 'warn' },
        ]
      : [
          { emit: 'stdout', level: 'error' },
          { emit: 'stdout', level: 'warn' },
        ],
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

// Only log queries in development
// @ts-ignore
if (isDev && !globalForPrisma.prisma) {
  // @ts-ignore
  prisma.$on('query', (e: any) => {
    console.log(`[Prisma Query] ${e.duration}ms - ${e.query}`)
  })
}

// Cache globally in all environments to prevent connection leaks
if (!globalForPrisma.prisma) globalForPrisma.prisma = prisma
