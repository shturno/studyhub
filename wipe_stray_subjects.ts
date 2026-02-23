import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.findFirst({ where: { email: 'iamkai.alvarenga@gmail.com' } })
  if (!user) return console.log('User not found')

  const contests = await prisma.contest.findMany({ where: { userId: user.id } })
  for (const contest of contests) {
      console.log(`Contest: ${contest.name}`)
      const subjects = await prisma.subject.findMany({ where: { contestId: contest.id } })
      console.log(`Subjects: ${subjects.map(s => s.name).join(', ')}`)
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
