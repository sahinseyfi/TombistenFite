import { beforeEach, describe, expect, it, vi } from "vitest";
import { ChallengeStatus } from "@prisma/client";
import {
  getChallengesForUser,
  joinChallenge,
  addChallengeProgress,
  ChallengeServiceError,
} from "@/server/challenges/service";

const {
  challengeFindManyMock,
  challengeFindUniqueMock,
  participationFindUniqueMock,
  participationCreateMock,
  participationUpdateMock,
  progressCreateMock,
  transactionMock,
} = vi.hoisted(() => ({
  challengeFindManyMock: vi.fn(),
  challengeFindUniqueMock: vi.fn(),
  participationFindUniqueMock: vi.fn(),
  participationCreateMock: vi.fn(),
  participationUpdateMock: vi.fn(),
  progressCreateMock: vi.fn(),
  transactionMock: vi.fn(),
}));

vi.mock("@/server/db", () => ({
  prisma: {
    challenge: {
      findMany: challengeFindManyMock,
      findUnique: challengeFindUniqueMock,
    },
    challengeParticipation: {
      findUnique: participationFindUniqueMock,
      create: participationCreateMock,
      update: participationUpdateMock,
    },
    challengeProgress: {
      create: progressCreateMock,
    },
    $transaction: transactionMock,
  },
}));

const baseChallenge = {
  id: "challenge-1",
  slug: "slug1",
  title: "Haftada 3 Y\u00FCr\u00FCy\u00FC\u015F",
  summary: "Haftada 3 kez 30 dk y\u00FCr\u00FCy\u00FC\u015F yap.",
  description: "Stamina i\u00E7in y\u00FCr\u00FCy\u00FC\u015F planla.",
  frequency: "WEEKLY",
  targetCount: 3,
  rewardLabel: "25 puan",
  rewardPoints: 25,
  rewardBonusMinutes: 15,
  startsAt: new Date("2025-10-06T00:00:00.000Z"),
  endsAt: new Date("2025-10-13T00:00:00.000Z"),
  isActive: true,
  createdAt: new Date("2025-10-01T12:00:00.000Z"),
  updatedAt: new Date("2025-10-01T12:00:00.000Z"),
} as const;

const baseTask = {
  id: "task-1",
  challengeId: "challenge-1",
  title: "30 dk y\u00FCr\u00FCy\u00FC\u015F",
  instructions: "Is\u0131n ve tempolu y\u00FCr\u00FC.",
  order: 0,
  targetCount: 3,
  createdAt: new Date("2025-10-01T12:00:00.000Z"),
};

const participationEntity = {
  id: "participation-1",
  challengeId: "challenge-1",
  userId: "user-1",
  status: ChallengeStatus.ACTIVE,
  progressCount: 2,
  streakCount: 2,
  rewardClaimed: false,
  lastProgressAt: new Date("2025-10-09T12:00:00.000Z"),
  joinedAt: new Date("2025-10-01T12:00:00.000Z"),
  completedAt: null,
};

const progressEntity = {
  id: "progress-1",
  participationId: "participation-1",
  taskId: "task-1",
  quantity: 1,
  notedAt: new Date("2025-10-10T12:00:00.000Z"),
  bonusSpinGranted: false,
  treatBonusMinutes: 0,
};

beforeEach(() => {
  challengeFindManyMock.mockReset();
  challengeFindUniqueMock.mockReset();
  participationFindUniqueMock.mockReset();
  participationCreateMock.mockReset();
  participationUpdateMock.mockReset();
  progressCreateMock.mockReset();
  transactionMock.mockReset();

  transactionMock.mockImplementation(async (operations: Array<Promise<unknown>>) => {
    return Promise.all(operations);
  });
});

describe("getChallengesForUser", () => {
  it("serializes challenges with participation info", async () => {
    challengeFindManyMock.mockResolvedValueOnce([
      {
        ...baseChallenge,
        tasks: [baseTask],
        participations: [
          {
            ...participationEntity,
            progress: [progressEntity],
          },
        ],
      },
    ]);

    const result = await getChallengesForUser("user-1");
    expect(result).toHaveLength(1);
    expect(result[0].participation?.progressCount).toBe(2);
    expect(result[0].tasks[0].title).toContain("y\u00FCr\u00FCy\u00FC\u015F");
    expect(challengeFindManyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { isActive: true },
      }),
    );
  });
});

describe("joinChallenge", () => {
  it("creates participation when none exists", async () => {
    challengeFindUniqueMock.mockResolvedValueOnce({
      ...baseChallenge,
      tasks: [],
    });
    participationFindUniqueMock.mockResolvedValueOnce(null);
    participationCreateMock.mockResolvedValueOnce({
      ...participationEntity,
      progressCount: 0,
      streakCount: 0,
      lastProgressAt: null,
    });

    const result = await joinChallenge("challenge-1", "user-1");
    expect(result.challengeId).toBe("challenge-1");
    expect(participationCreateMock).toHaveBeenCalled();
  });

  it("throws when challenge is missing", async () => {
    challengeFindUniqueMock.mockResolvedValueOnce(null);
    await expect(joinChallenge("missing", "user-1")).rejects.toBeInstanceOf(ChallengeServiceError);
  });
});

describe("addChallengeProgress", () => {
  it("increments progress and grants reward on completion", async () => {
    const now = new Date("2025-10-10T13:00:00.000Z");
    challengeFindUniqueMock.mockResolvedValueOnce({
      ...baseChallenge,
      tasks: [baseTask],
    });
    participationFindUniqueMock.mockResolvedValueOnce({
      ...participationEntity,
      progressCount: 2,
      rewardClaimed: false,
    });

    participationUpdateMock.mockResolvedValueOnce({
      ...participationEntity,
      progressCount: 3,
      status: ChallengeStatus.COMPLETED,
      rewardClaimed: true,
      streakCount: 3,
      lastProgressAt: now,
      completedAt: now,
    });

    progressCreateMock.mockResolvedValueOnce({
      ...progressEntity,
      notedAt: now,
      bonusSpinGranted: true,
      treatBonusMinutes: 15,
    });

    const result = await addChallengeProgress({
      challengeId: "challenge-1",
      userId: "user-1",
      quantity: 1,
      taskId: "task-1",
      now,
    });

    expect(participationUpdateMock).toHaveBeenCalledWith({
      where: { id: participationEntity.id },
      data: expect.objectContaining({
        progressCount: 3,
      }),
    });
    expect(result.participation.progressCount).toBe(3);
    expect(result.progress.rewardGranted).toBe(true);
    expect(result.progress.treatBonusMinutes).toBe(15);
  });

  it("throws when participation missing", async () => {
    challengeFindUniqueMock.mockResolvedValueOnce({
      ...baseChallenge,
      tasks: [],
    });
    participationFindUniqueMock.mockResolvedValueOnce(null);

    await expect(
      addChallengeProgress({ challengeId: "challenge-1", userId: "user-1" }),
    ).rejects.toMatchObject({ code: "participation_not_found" });
  });
});
