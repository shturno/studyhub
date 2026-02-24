import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.findFirst({ where: { email: 'iamkai.alvarenga@gmail.com' } })
  if (!user) return console.log('User not found')

  const sessions = await prisma.studySession.findMany({ 
      where: { userId: user.id },
      include: { topic: { include: { subject: true } } }
  })
  
  console.log(`User ${user.email} has ${sessions.length} sessions`)
  
  for (const session of sessions) {
      if (session.topic.subject.contestId !== 'cml8oveia0001vveg3o6rh6d6') { // The single UDESC form
          console.log(`Deleting dirty session for topic: ${session.topic.name} (Subject: ${session.topic.subject.name})`)
          await prisma.studySession.delete({ where: { id: session.id } })
      }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
