import { PrismaClient, Prisma } from '@prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'

async function main() {
  const adapter = new PrismaLibSQL({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  })
  
  const prisma = new PrismaClient({ adapter })

  console.log('Connected to Turso via PrismaLibSQL')
  console.log('URL:', process.env.TURSO_DATABASE_URL)
  
  // Get all model names
  const models = Prisma.dmmf.datamodel.models.map(m => m.name)
  
  console.log(`Found ${models.length} tables to truncate.`)
  
  // Disable foreign keys temporarily
  try {
    await prisma.$executeRawUnsafe(`PRAGMA foreign_keys = OFF;`)
  } catch (e) {
    console.log('Could not disable PRAGMA, might not be needed.')
  }

  // We can just loop and delete. If FK constraints hit, we catch and retry.
  let remaining = [...models]
  let maxRetries = 10
  
  while (remaining.length > 0 && maxRetries > 0) {
    const failed = []
    for (const model of remaining) {
      try {
        await prisma.$executeRawUnsafe(`DELETE FROM "${model}";`)
        console.log(`✅ Emptied ${model}`)
      } catch (err) {
        failed.push(model)
      }
    }
    remaining = failed
    maxRetries--
  }

  if (remaining.length > 0) {
    console.error('Failed to empty tables:', remaining)
    process.exit(1)
  }

  // Verify counts
  console.log('\n--- VERIFYING COUNTS ---')
  for (const model of models) {
    const count = await (prisma as any)[model.toLowerCase()].count?.() ?? 
                  await prisma.$queryRawUnsafe(`SELECT COUNT(*) as c FROM "${model}"`).then((r:any) => Number(r[0].c))
    console.log(`${model}: ${count} records`)
  }

  await prisma.$disconnect()
  console.log('Done.')
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
