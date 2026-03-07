import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { subMonths } from "date-fns";
import type { PlannerData, Lesson, Track } from "@/features/study-cycle/types";

export async function getPlannerData(): Promise<PlannerData> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  const contests = await prisma.contest.findMany({
    where: { userId },
    include: {
      subjects: {
        include: {
          topics: true,
        },
      },
    },
  });

  const [plannedSessionsDb, studySessions] = await Promise.all([
    prisma.plannedSession.findMany({
      where: {
        userId,
        scheduledDate: { gte: subMonths(new Date(), 1) },
      },
      include: { topic: { include: { subject: true } } },
    }),
    prisma.studySession.findMany({
      where: { userId },
      select: { topicId: true },
      distinct: ["topicId"],
    }),
  ]);

  const completedTopicIds = new Set(studySessions.map((s) => s.topicId));

  const tracks = [];
  const availableLessons = [];

  for (const contest of contests) {
    for (const subject of contest.subjects) {
      const track: Track = {
        id: subject.id,
        name: subject.name,
        lessons: [],
      };

      const trackLessons: Lesson[] = subject.topics.map((topic) => ({
        id: topic.id,
        title: topic.name,
        trackId: subject.id,
        track,
        status: completedTopicIds.has(topic.id)
          ? ("DONE" as const)
          : ("NOT_STARTED" as const),
        estimated: 30,
        studyLogs: [],
      }));

      track.lessons = trackLessons;

      tracks.push(track);
      availableLessons.push(...trackLessons);
    }
  }

  const plannedSessions = plannedSessionsDb.map((session) => ({
    id: session.id,
    lessonId: session.topicId,
    lessonTitle: session.topic.name,
    trackName: session.topic.subject.name,
    duration: session.durationMinutes,
    scheduledDate: session.scheduledDate.toISOString().split("T")[0],
    draft: false,
  }));

  const primaryContest = contests.find((c) => c.isPrimary) ?? contests[0];

  return {
    primaryContestId: primaryContest?.id,
    tracks,
    availableLessons,
    plannedSessions,
  };
}
