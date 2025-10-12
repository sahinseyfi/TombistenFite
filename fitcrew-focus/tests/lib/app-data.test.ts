import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  fetchFeed,
  fetchTreats,
  fetchUnreadCount,
  fetchProgressInsights,
  fetchChallenges,
  fetchReferrals,
  fetchMembership,
} from "@/lib/app-data";
import {
  FALLBACK_CHALLENGES,
  FALLBACK_POSTS,
  FALLBACK_TREAT_ELIGIBILITY,
  FALLBACK_TREAT_ITEMS,
  FALLBACK_TREAT_SPINS,
  FALLBACK_UNREAD_COUNT,
  FALLBACK_PROGRESS_INSIGHTS,
  FALLBACK_REFERRALS,
  FALLBACK_MEMBERSHIP,
} from "@/lib/fallback-data";
import { apiFetch, ApiError } from "@/lib/api-client";

vi.mock("@/lib/api-client", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api-client")>("@/lib/api-client");
  return {
    ...actual,
    apiFetch: vi.fn(),
  };
});

const apiFetchMock = vi.mocked(apiFetch);

beforeEach(() => {
  apiFetchMock.mockReset();
});

describe("app-data fallbacks", () => {
  it("returns fallback posts when API fails", async () => {
    apiFetchMock.mockRejectedValue(new ApiError(500));
    const result = await fetchFeed("public", 5);
    expect(result.source).toBe("fallback");
    expect(result.posts).toEqual(FALLBACK_POSTS);
  });

  it("returns fallback treats when API is unreachable", async () => {
    apiFetchMock.mockRejectedValue(new ApiError(503));
    const result = await fetchTreats(5);
    expect(result.source).toBe("fallback");
    expect(result.items).toEqual(FALLBACK_TREAT_ITEMS);
    expect(result.spins).toEqual(FALLBACK_TREAT_SPINS);
    expect(result.eligibility).toEqual(FALLBACK_TREAT_ELIGIBILITY);
  });

  it("falls back to cached unread count on auth error", async () => {
    apiFetchMock.mockRejectedValue(new ApiError(401));
    const count = await fetchUnreadCount();
    expect(count).toBe(FALLBACK_UNREAD_COUNT);
  });

  it("returns fallback insights when API fails", async () => {
    apiFetchMock.mockRejectedValue(new ApiError(500));
    const insights = await fetchProgressInsights();
    expect(insights.source).toBe("fallback");
    expect(insights.summary.latestWeightKg).toBe(FALLBACK_PROGRESS_INSIGHTS.summary.latestWeightKg);
    expect(insights.recentNotes).toEqual(FALLBACK_PROGRESS_INSIGHTS.recentNotes);
  });

  it("returns fallback challenges when API fails", async () => {
    apiFetchMock.mockRejectedValue(new ApiError(502));
    const challenges = await fetchChallenges();
    expect(challenges.source).toBe("fallback");
    expect(challenges.challenges).toEqual(FALLBACK_CHALLENGES);
  });

  it("returns fallback referrals when API fails", async () => {
    apiFetchMock.mockRejectedValue(new ApiError(500));
    const referrals = await fetchReferrals();
    expect(referrals.source).toBe("fallback");
    expect(referrals.referral.code).toBe(FALLBACK_REFERRALS.referral.code);
    expect(referrals.invites).toEqual(FALLBACK_REFERRALS.invites);
  });

  it("returns fallback membership when API fails", async () => {
    apiFetchMock.mockRejectedValue(new ApiError(500));
    const membership = await fetchMembership();
    expect(membership).toEqual(FALLBACK_MEMBERSHIP);
  });
});

