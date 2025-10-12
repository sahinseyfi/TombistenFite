import { differenceInCalendarDays } from "date-fns";
import { ChallengeStatus, Prisma } from "@prisma/client";
import { prisma } from "@/server/db";
import {
  serializeChallenge,
  serializeChallengeParticipation,
  type SerializedChallenge,
  type SerializedChallengeParticipation,
} from "@/server/serializers/challenge";

export class ChallengeServiceError extends Error {
  status: number;
  code: string;
  details?: Record<string, unknown>;

  constructor(status: number, code: string, message: string, details?: Record<string, unknown>) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export async function getChallengesForUser(userId: string): Promise<SerializedChallenge[]> {
  const challenges = await prisma.challenge.findMany({
    where: { isActive: true },
    orderBy: [{ startsAt: "asc" }, { createdAt: "asc" }],
    include: {
      tasks: {
        orderBy: { order: "asc" },
      },
      participations: {
        where: { userId },
        include: {
          progress: {
            orderBy: { notedAt: "desc" },
            take: 5,
          },
        },
      },
    },
  });

  return challenges.map((challenge) => {
    const participation = challenge.participations[0] ?? null;
    return serializeChallenge(
      challenge,
      participation
        ? {
            ...participation,
            progress: participation.progress,
          }
        : null,
    );
  });
}

export async function joinChallenge(
  challengeId: string,
  userId: string,
): Promise<SerializedChallengeParticipation> {
  const challenge = await prisma.challenge.findUnique({
    where: { id: challengeId },
  });

  if (!challenge || !challenge.isActive) {
    throw new ChallengeServiceError(404, "challenge_not_found", "Challenge bulunamadi veya aktif degil.");
  }

  const existing = await prisma.challengeParticipation.findUnique({
    where: {
      challengeId_userId: {
        challengeId,
        userId,
      },
    },
  });

  if (existing) {
    return serializeChallengeParticipation(existing);
  }

  const participation = await prisma.challengeParticipation.create({
    data: {
      challengeId,
      userId,
      status: ChallengeStatus.ACTIVE,
      streakCount: 0,
      progressCount: 0,
    },
  });

  return serializeChallengeParticipation(participation);
}

type ProgressInput = {
  challengeId: string;
  userId: string;
  quantity?: number;
  taskId?: string | null;
  now?: Date;
};

export async function addChallengeProgress({
  challengeId,
  userId,
  quantity = 1,
  taskId,
  now = new Date(),
}: ProgressInput) {
  if (quantity <= 0) {
    throw new ChallengeServiceError(422, "validation_error", "Progress miktari 1 veya uzeri olmalidir.");
  }

  const challenge = await prisma.challenge.findUnique({
    where: { id: challengeId },
    include: { tasks: true },
  });

  if (!challenge) {
    throw new ChallengeServiceError(404, "challenge_not_found", "Challenge bulunamadi.");
  }

  const participation = await prisma.challengeParticipation.findUnique({
    where: {
      challengeId_userId: {
        challengeId,
        userId,
      },
    },
  });

  if (!participation) {
    throw new ChallengeServiceError(404, "participation_not_found", "Challenge katilimi bulunamadi.");
  }

  if (participation.status === ChallengeStatus.COMPLETED) {
    throw new ChallengeServiceError(409, "already_completed", "Challenge zaten tamamlandi.");
  }

  if (taskId) {
    const taskExists = challenge.tasks.some((task) => task.id === taskId);
    if (!taskExists) {
      throw new ChallengeServiceError(404, "task_not_found", "Challenge gorevi bulunamadi.");
    }
  }

  const reachedGoalBefore = participation.progressCount >= challenge.targetCount;
  const newProgressCount = participation.progressCount + quantity;
  const reachedGoalAfter =
    !reachedGoalBefore &&
    challenge.targetCount > 0 &&
    newProgressCount >= challenge.targetCount;

  const diffDays = participation.lastProgressAt
    ? differenceInCalendarDays(now, participation.lastProgressAt)
    : null;

  const shouldIncrementStreak = diffDays === 1 || participation.lastProgressAt === null;
  const shouldResetStreak = diffDays !== null && diffDays > 1;

  const rewardAvailable = challenge.rewardPoints > 0 || challenge.rewardBonusMinutes > 0;
  const shouldGrantReward = reachedGoalAfter && rewardAvailable && !participation.rewardClaimed;

  const data: Prisma.ChallengeParticipationUpdateInput = {
    progressCount: newProgressCount,
    lastProgressAt: now,
  };

  if (shouldResetStreak) {
    data.streakCount = 1;
  } else if (shouldIncrementStreak) {
    data.streakCount = participation.streakCount + 1;
  }

  if (reachedGoalAfter) {
    data.status = ChallengeStatus.COMPLETED;
    data.completedAt = now;
    if (shouldGrantReward) {
      data.rewardClaimed = true;
    }
  }

  const progressCreate: Prisma.ChallengeProgressCreateInput = {
    participation: {
      connect: { id: participation.id },
    },
    task: taskId
      ? {
          connect: { id: taskId },
        }
      : undefined,
    quantity,
    notedAt: now,
    bonusSpinGranted: shouldGrantReward,
    treatBonusMinutes: shouldGrantReward ? challenge.rewardBonusMinutes : 0,
  };

  const [updatedParticipation, progress] = await prisma.$transaction([
    prisma.challengeParticipation.update({
      where: { id: participation.id },
      data,
    }),
    prisma.challengeProgress.create({
      data: progressCreate,
    }),
  ]);

  return {
    participation: serializeChallengeParticipation(updatedParticipation),
    progress: {
      id: progress.id,
      quantity: progress.quantity,
      notedAt: progress.notedAt.toISOString(),
      bonusSpinGranted: progress.bonusSpinGranted,
      treatBonusMinutes: progress.treatBonusMinutes,
      reachedGoal: reachedGoalAfter,
      rewardGranted: shouldGrantReward,
    },
  };
}
