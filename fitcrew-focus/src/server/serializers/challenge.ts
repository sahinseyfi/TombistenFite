import type {
  Challenge,
  ChallengeParticipation,
  ChallengeTask,
  ChallengeProgress,
  ChallengeFrequency,
  ChallengeStatus,
} from "@prisma/client";

type ChallengeWithRelations = Challenge & {
  tasks: ChallengeTask[];
};

type ParticipationWithProgress = ChallengeParticipation & {
  progress?: ChallengeProgress[];
};

export function serializeChallengeTask(task: ChallengeTask) {
  return {
    id: task.id,
    challengeId: task.challengeId,
    title: task.title,
    instructions: task.instructions,
    order: task.order,
    targetCount: task.targetCount,
    createdAt: task.createdAt.toISOString(),
  };
}

export function serializeChallengeParticipation(
  participation: ChallengeParticipation,
  progress: ChallengeProgress[] = [],
) {
  return {
    id: participation.id,
    challengeId: participation.challengeId,
    userId: participation.userId,
    status: participation.status as ChallengeStatus,
    progressCount: participation.progressCount,
    streakCount: participation.streakCount,
    rewardClaimed: participation.rewardClaimed,
    lastProgressAt: participation.lastProgressAt ? participation.lastProgressAt.toISOString() : null,
    joinedAt: participation.joinedAt.toISOString(),
    completedAt: participation.completedAt ? participation.completedAt.toISOString() : null,
    progress: progress
      .sort((a, b) => b.notedAt.getTime() - a.notedAt.getTime())
      .slice(0, 10)
      .map((entry) => ({
        id: entry.id,
        taskId: entry.taskId,
        quantity: entry.quantity,
        notedAt: entry.notedAt.toISOString(),
        bonusSpinGranted: entry.bonusSpinGranted,
        treatBonusMinutes: entry.treatBonusMinutes,
      })),
  };
}

export function serializeChallenge(
  challenge: ChallengeWithRelations,
  participation?: ParticipationWithProgress | null,
) {
  const participationSerialized = participation
    ? serializeChallengeParticipation(participation, participation.progress ?? [])
    : null;

  const progressCount = participationSerialized?.progressCount ?? 0;
  const targetCount = challenge.targetCount > 0 ? challenge.targetCount : 1;
  const completionRate = Math.min(1, progressCount / targetCount);
  const remainingCount = Math.max(0, targetCount - progressCount);

  return {
    id: challenge.id,
    slug: challenge.slug,
    title: challenge.title,
    summary: challenge.summary,
    description: challenge.description,
    frequency: challenge.frequency as ChallengeFrequency,
    targetCount: challenge.targetCount,
    rewardLabel: challenge.rewardLabel,
    rewardPoints: challenge.rewardPoints,
    rewardBonusMinutes: challenge.rewardBonusMinutes,
    startsAt: challenge.startsAt ? challenge.startsAt.toISOString() : null,
    endsAt: challenge.endsAt ? challenge.endsAt.toISOString() : null,
    isActive: challenge.isActive,
    createdAt: challenge.createdAt.toISOString(),
    updatedAt: challenge.updatedAt.toISOString(),
    tasks: challenge.tasks.sort((a, b) => a.order - b.order).map(serializeChallengeTask),
    participation: participationSerialized,
    progress: {
      completionRate,
      remainingCount,
      isCompleted: participationSerialized?.status === "COMPLETED",
    },
  };
}

export type SerializedChallenge = ReturnType<typeof serializeChallenge>;
export type SerializedChallengeParticipation = ReturnType<typeof serializeChallengeParticipation>;
