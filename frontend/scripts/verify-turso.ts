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
  
  const models = Prisma.dmmf.datamodel.models.map(m => m.name)
  console.log('\n--- VERIFYING COUNTS ---')
  for (const model of models) {
    const res: any = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as c FROM "${model}"`)
    console.log(`${model}: ${Number(res[0].c)} records`)
  }

  await prisma.$disconnect()
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
