import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const cycles = await prisma.studyCycle.findMany()
  console.log(JSON.stringify(cycles, null, 2))
}

main().catch(console.error).finally(() => prisma.$disconnect())
