import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  fetchChallenges,
  fetchFeed,
  fetchNotifications,
  fetchProfileOverview,
  fetchProgressInsights,
  fetchReferrals,
  fetchTreats,
  fetchUnreadCount,
} from "@/lib/app-data";
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

describe("app-data error handling", () => {
  it("marks feed result as unauthorized on 401", async () => {
    apiFetchMock.mockRejectedValueOnce(new ApiError(401));
    const result = await fetchFeed("public", 5);
    expect(result.error).toBe("unauthorized");
    expect(result.posts).toEqual([]);
    expect(result.nextCursor).toBeNull();
  });

  it("marks treats as unavailable when API fails", async () => {
    apiFetchMock.mockRejectedValueOnce(new ApiError(503));
    const result = await fetchTreats(5);
    expect(result.error).toBe("unavailable");
    expect(result.items).toEqual([]);
    expect(result.spins).toEqual([]);
    expect(result.eligibility).toBeNull();
  });

  it("returns zero unread count on auth error", async () => {
    apiFetchMock.mockRejectedValueOnce(new ApiError(401));
    const count = await fetchUnreadCount();
    expect(count).toBe(0);
  });

  it("marks progress insights as unavailable on failure", async () => {
    apiFetchMock.mockRejectedValueOnce(new ApiError(500));
    const insights = await fetchProgressInsights();
    expect(insights.error).toBe("unavailable");
    expect(insights.summary).toBeNull();
    expect(insights.recentNotes).toEqual([]);
  });

  it("marks challenges as readonly when unauthorized", async () => {
    apiFetchMock.mockRejectedValueOnce(new ApiError(401));
    const challenges = await fetchChallenges();
    expect(challenges.error).toBe("unauthorized");
    expect(challenges.readOnly).toBe(true);
    expect(challenges.challenges).toEqual([]);
  });

  it("marks referrals as unauthorized", async () => {
    apiFetchMock.mockRejectedValueOnce(new ApiError(401));
    const referrals = await fetchReferrals();
    expect(referrals.error).toBe("unauthorized");
    expect(referrals.referral).toBeNull();
    expect(referrals.invites).toEqual([]);
  });

  it("marks notifications as unavailable when API fails", async () => {
    apiFetchMock.mockRejectedValueOnce(new ApiError(500));
    const notifications = await fetchNotifications(10);
    expect(notifications.error).toBe("unavailable");
    expect(notifications.live).toBe(false);
    expect(notifications.notifications).toEqual([]);
  });

  it("marks profile overview as unauthorized", async () => {
    apiFetchMock.mockRejectedValueOnce(new ApiError(401));
    const profile = await fetchProfileOverview();
    expect(profile.error).toBe("unauthorized");
    expect(profile.profile).toBeNull();
  });
});
