import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const {
  authenticateMock,
  getChallengesMock,
  joinChallengeMock,
  addChallengeProgressMock,
} = vi.hoisted(() => ({
  authenticateMock: vi.fn(),
  getChallengesMock: vi.fn(),
  joinChallengeMock: vi.fn(),
  addChallengeProgressMock: vi.fn(),
}));

vi.mock("@/server/auth/session", () => ({
  authenticate: authenticateMock,
}));

vi.mock("@/server/challenges/service", async () => {
  const actual = await vi.importActual<typeof import("@/server/challenges/service")>(
    "@/server/challenges/service",
  );
  return {
    ...actual,
    getChallengesForUser: getChallengesMock,
    joinChallenge: joinChallengeMock,
    addChallengeProgress: addChallengeProgressMock,
  };
});

import { GET as listChallenges } from "@/app/api/challenges/route";
import { POST as joinChallengeRoute } from "@/app/api/challenges/[id]/join/route";
import { POST as progressRoute } from "@/app/api/challenges/[id]/progress/route";

const serializedChallenge = {
  id: "challenge-1",
  slug: "slug",
  title: "Haftada 3 Y\u00FCr\u00FCy\u00FC\u015F",
  summary: "Haftada 3 y\u00FCr\u00FC\u015F yap.",
  description: null,
  frequency: "WEEKLY",
  targetCount: 3,
  rewardLabel: "25 puan",
  rewardPoints: 25,
  rewardBonusMinutes: 15,
  startsAt: null,
  endsAt: null,
  isActive: true,
  createdAt: "2025-10-01T00:00:00.000Z",
  updatedAt: "2025-10-01T00:00:00.000Z",
  tasks: [],
  participation: null,
  progress: {
    completionRate: 0,
    remainingCount: 3,
    isCompleted: false,
  },
};

type NextRequestCtorInit = ConstructorParameters<typeof NextRequest>[1];

function buildRequest(url: string, init?: NextRequestCtorInit) {
  return new NextRequest(url, init);
}

beforeEach(() => {
  authenticateMock.mockReset();
  getChallengesMock.mockReset();
  joinChallengeMock.mockReset();
  addChallengeProgressMock.mockReset();
});

describe("GET /api/challenges", () => {
  it("returns 401 when session missing", async () => {
    authenticateMock.mockReturnValueOnce(null);
    const response = await listChallenges(buildRequest("https://app.local/api/challenges"));
    expect(response.status).toBe(401);
  });

  it("returns challenges for authenticated user", async () => {
    authenticateMock.mockReturnValueOnce({ sub: "user-1" });
    getChallengesMock.mockResolvedValueOnce([serializedChallenge]);

    const response = await listChallenges(buildRequest("https://app.local/api/challenges"));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.challenges).toHaveLength(1);
    expect(getChallengesMock).toHaveBeenCalledWith("user-1");
  });
});

describe("POST /api/challenges/[id]/join", () => {
  it("creates participation", async () => {
    authenticateMock.mockReturnValueOnce({ sub: "user-1" });
    joinChallengeMock.mockResolvedValueOnce({
      id: "participation-1",
      challengeId: "challenge-1",
      userId: "user-1",
      status: "ACTIVE",
      progressCount: 0,
      streakCount: 0,
      rewardClaimed: false,
      lastProgressAt: null,
      joinedAt: "2025-10-01T00:00:00.000Z",
      completedAt: null,
      progress: [],
    });

    const response = await joinChallengeRoute(
      buildRequest("https://app.local/api/challenges/challenge-1/join", { method: "POST" }),
      { params: { id: "challenge-1" } },
    );

    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.participation.challengeId).toBe("challenge-1");
    expect(joinChallengeMock).toHaveBeenCalledWith("challenge-1", "user-1");
  });
});

describe("POST /api/challenges/[id]/progress", () => {
  it("validates payload", async () => {
    authenticateMock.mockReturnValueOnce({ sub: "user-1" });
    const response = await progressRoute(
      buildRequest("https://app.local/api/challenges/challenge-1/progress", {
        method: "POST",
        body: JSON.stringify({ quantity: 0 }),
        headers: { "content-type": "application/json" },
      }),
      { params: { id: "challenge-1" } },
    );

    expect(response.status).toBe(422);
    expect(addChallengeProgressMock).not.toHaveBeenCalled();
  });

  it("records progress", async () => {
    authenticateMock.mockReturnValueOnce({ sub: "user-1" });
    addChallengeProgressMock.mockResolvedValueOnce({
      participation: {
        id: "participation-1",
        challengeId: "challenge-1",
        userId: "user-1",
        status: "ACTIVE",
        progressCount: 1,
        streakCount: 1,
        rewardClaimed: false,
        lastProgressAt: "2025-10-10T10:00:00.000Z",
        joinedAt: "2025-10-01T00:00:00.000Z",
        completedAt: null,
        progress: [],
      },
      progress: {
        id: "progress-1",
        quantity: 1,
        notedAt: "2025-10-10T10:00:00.000Z",
        bonusSpinGranted: false,
        treatBonusMinutes: 0,
        reachedGoal: false,
        rewardGranted: false,
      },
    });

    const response = await progressRoute(
      buildRequest("https://app.local/api/challenges/challenge-1/progress", {
        method: "POST",
        body: JSON.stringify({ quantity: 1 }),
        headers: { "content-type": "application/json" },
      }),
      { params: { id: "challenge-1" } },
    );

    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.participation.progressCount).toBe(1);
    expect(addChallengeProgressMock).toHaveBeenCalledWith({
      challengeId: "challenge-1",
      userId: "user-1",
      quantity: 1,
      taskId: undefined,
    });
  });
});
