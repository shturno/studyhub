import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
  console.log(
    "✅ Seed completed! Database is ready for users to add their own contests.",
  );
}
try {
  // @ts-expect-error: Top-level await is fine for the seed script
  await main();
} catch (e) {
  console.error(e);
  process.exit(1);
} finally {
  // @ts-expect-error: Top-level await is fine for the seed script
  await prisma.$disconnect();
}
