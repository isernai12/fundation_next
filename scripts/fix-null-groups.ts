import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const membersWithoutGroup = await prisma.member.findMany({
    where: {
      groupId: null as any
    }
  })

  if (membersWithoutGroup.length > 0) {
    console.log(`Found ${membersWithoutGroup.length} members without a group.`)
    
    // Check if an "Unassigned" group exists
    let unassignedGroup = await prisma.group.findFirst({
      where: { name: 'Unassigned' }
    })
    
    if (!unassignedGroup) {
      unassignedGroup = await prisma.group.findFirst()
    }

    if (unassignedGroup) {
      // Update members
      await prisma.member.updateMany({
        where: { groupId: null as any },
        data: { groupId: unassignedGroup.id }
      })
      console.log('Updated members to ' + unassignedGroup.name)
    } else {
      console.log('Could not find any group to assign.')
    }
  } else {
    console.log('No members without a group found.')
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
