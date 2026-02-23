import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Starting seed...')

    // Clean all data to start fresh
    await prisma.studySession.deleteMany()
    await prisma.topic.deleteMany()
    await prisma.subject.deleteMany()
    await prisma.contest.deleteMany()
    await prisma.editorialItem.deleteMany()
    await prisma.contentMapping.deleteMany()
    await prisma.plannedSession.deleteMany()
    await prisma.user.deleteMany()

    console.log('✅ Database cleaned successfully')
    console.log('✅ Seed completed! Database is ready for users to add their own contests.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
