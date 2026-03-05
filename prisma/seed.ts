import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ACHIEVEMENTS = [
  {
    slug: "welcome",
    name: "Bem-vindo ao StudyHub!",
    description: "Criou sua conta e começou a jornada.",
    icon: "🎉",
    xpReward: 50,
  },
  {
    slug: "first_session",
    name: "Primeira Sessão",
    description: "Completou sua primeira sessão de estudo.",
    icon: "⏱️",
    xpReward: 100,
  },
  {
    slug: "sessions_10",
    name: "Veterano",
    description: "Completou 10 sessões de estudo.",
    icon: "📚",
    xpReward: 200,
  },
  {
    slug: "sessions_50",
    name: "Dedicado",
    description: "Completou 50 sessões de estudo.",
    icon: "💪",
    xpReward: 500,
  },
  {
    slug: "sessions_100",
    name: "Centurião",
    description: "Completou 100 sessões de estudo.",
    icon: "🏆",
    xpReward: 1000,
  },
  {
    slug: "hours_10",
    name: "10 Horas",
    description: "Acumulou 10 horas de estudo.",
    icon: "⏳",
    xpReward: 150,
  },
  {
    slug: "hours_50",
    name: "50 Horas",
    description: "Acumulou 50 horas de estudo.",
    icon: "🔥",
    xpReward: 400,
  },
  {
    slug: "hours_100",
    name: "Centenário de Horas",
    description: "Acumulou 100 horas de estudo.",
    icon: "💯",
    xpReward: 800,
  },
  {
    slug: "streak_3",
    name: "Sequência de 3 Dias",
    description: "Estudou por 3 dias consecutivos.",
    icon: "🔁",
    xpReward: 150,
  },
  {
    slug: "streak_7",
    name: "Semana Perfeita",
    description: "Estudou por 7 dias consecutivos.",
    icon: "📅",
    xpReward: 400,
  },
  {
    slug: "streak_30",
    name: "Mês de Ferro",
    description: "Estudou por 30 dias consecutivos.",
    icon: "🛡️",
    xpReward: 1500,
  },
  {
    slug: "level_5",
    name: "Nível 5",
    description: "Alcançou o nível 5.",
    icon: "⭐",
    xpReward: 200,
  },
  {
    slug: "level_10",
    name: "Nível 10",
    description: "Alcançou o nível 10.",
    icon: "🌟",
    xpReward: 500,
  },
  {
    slug: "first_contest",
    name: "Concurso na Mira",
    description: "Criou seu primeiro concurso.",
    icon: "🎯",
    xpReward: 100,
  },
];

async function main() {
  console.log("🌱 Starting seed...");

  // Clean all data to start fresh
  await prisma.studySession.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.contest.deleteMany();
  await prisma.editorialItem.deleteMany();
  await prisma.contentMapping.deleteMany();
  await prisma.plannedSession.deleteMany();
  console.log("✅ Database cleaned successfully");

  for (const ach of ACHIEVEMENTS) {
    await prisma.achievement.upsert({
      where: { slug: ach.slug },
      update: {
        name: ach.name,
        description: ach.description,
        icon: ach.icon,
        xpReward: ach.xpReward,
      },
      create: ach,
    });
  }

  console.log(
    "✅ Seed completed! Database is ready for users to add their own contests.",
  );
}
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
