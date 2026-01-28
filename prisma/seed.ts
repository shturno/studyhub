import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Starting seed...')

    // 1. Clean legacy data
    await prisma.studySession.deleteMany()
    await prisma.topic.deleteMany()
    await prisma.subject.deleteMany()
    await prisma.contest.deleteMany()
    await prisma.user.deleteMany()

    // 2. Create Hero User
    const user = await prisma.user.create({
        data: {
            email: 'student@studyhub.com',
            name: 'Estudante Dedicado',
            password: 'hashed-password-123', // In real app, hash this
            xp: 1250,
            level: 5,
            settings: {
                pomodoroDefault: 25,
                breakDefault: 5,
                dailyGoalMinutes: 120
            }
        }
    })

    console.log(`👤 Created user: ${user.name}`)

    // 3. Create Contest: Banco do Brasil
    const contest = await prisma.contest.create({
        data: {
            userId: user.id,
            name: 'Banco do Brasil - Escriturário',
            institution: 'Banco do Brasil',
            role: 'Escriturário',
            isPrimary: true
        }
    })

    console.log(`🏆 Created contest: ${contest.name}`)

    // 4. Create Subjects & Topics
    const subjectsData = [
        {
            name: 'Matemática Financeira',
            topics: ['Juros Simples', 'Juros Compostos', 'Sistemas de Amortização', 'Análise de Investimentos']
        },
        {
            name: 'Conhecimentos Bancários',
            topics: ['Sistema Financeiro Nacional', 'Mercado de Capitais', 'Produtos Bancários', 'Garantias']
        },
        {
            name: 'Língua Portuguesa',
            topics: ['Interpretação de Texto', 'Crase', 'Concordância Verbal', 'Regência']
        },
        {
            name: 'Informática',
            topics: ['Segurança da Informação', 'Excel Avançado', 'Banco de Dados', 'Python Básico']
        }
    ]

    for (const s of subjectsData) {
        const subject = await prisma.subject.create({
            data: {
                contestId: contest.id,
                name: s.name,
                weight: 1, // Default weight
                userLevel: 1
            }
        })

        for (const tName of s.topics) {
            await prisma.topic.create({
                data: {
                    subjectId: subject.id,
                    name: tName
                }
            })
        }
        console.log(`📚 Created subject: ${s.name} with ${s.topics.length} topics`)
    }

    // 5. Create some fake history (Study Sessions)
    // Find a topic to add history to
    const mathSubject = await prisma.subject.findFirst({ where: { name: 'Matemática Financeira' } })
    const mathTopic = await prisma.topic.findFirst({ where: { subjectId: mathSubject?.id } })

    if (mathTopic) {
        await prisma.studySession.create({
            data: {
                userId: user.id,
                topicId: mathTopic.id,
                minutes: 25,
                xpEarned: 250,
                difficulty: 3,
                completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 day ago
            }
        })
        console.log('⏱️ Created sample study session')
    }

    console.log('✅ Seed completed!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
