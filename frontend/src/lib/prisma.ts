import { PrismaClient } from '@prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const isDev = process.env.NODE_ENV !== 'production'

const createPrismaClient = () => {
  const tursoUrl = process.env.TURSO_DATABASE_URL?.trim()
  const tursoToken = process.env.TURSO_AUTH_TOKEN?.trim()

  if (!tursoUrl) {
    throw new Error(
      "CRITICAL DATABASE ERROR: TURSO_DATABASE_URL environment variable is missing or empty. " +
      "Application is strictly prohibited from using local SQLite fallbacks."
    )
  }

  if (tursoUrl.startsWith('file:') || tursoUrl.startsWith('sqlite:')) {
    throw new Error(
      `CRITICAL DATABASE ERROR: TURSO_DATABASE_URL is set to a local file (${tursoUrl}). ` +
      "Only production Turso remote database connection strings (libsql:// or https://) are allowed."
    )
  }

  if (!tursoToken) {
    throw new Error(
      "CRITICAL DATABASE ERROR: TURSO_AUTH_TOKEN environment variable is missing or empty. " +
      "Production Turso database requires a valid auth token."
    )
  }

  const adapter = new PrismaLibSQL({
    url: tursoUrl,
    authToken: tursoToken,
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

