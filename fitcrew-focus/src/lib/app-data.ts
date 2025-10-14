import { apiFetch, ApiError } from "@/lib/api-client";
import type { SerializedPost } from "@/server/serializers/post";
import type { SerializedMeasurement } from "@/server/serializers/measurement";
import type { SerializedTreatItem, SerializedTreatSpin } from "@/server/serializers/treat";
import type { SerializedNotification } from "@/server/serializers/notification";
import type { EligibilityResult } from "@/server/treats/eligibility";
import type { ProgressInsights } from "@/server/insights/progress";
import type { SerializedCoachNote } from "@/server/serializers/coach-note";
import type { SerializedChallenge } from "@/server/serializers/challenge";
import type { SerializedReferralInvite } from "@/server/serializers/referral";
import type { SerializedUser } from "@/server/serializers/user";

type ApiListResponse<T> = {
  nextCursor: string | null | undefined;
} & T;

export type FeedScope = "public" | "following" | "me" | "close_friends";

export type DataError = "unauthorized" | "unavailable";

function resolveError(error: unknown): DataError {
  if (error instanceof ApiError && error.status === 401) {
    return "unauthorized";
  }
  return "unavailable";
}

export type FeedData = {
  posts: SerializedPost[];
  nextCursor: string | null;
  error?: DataError;
};

export async function fetchFeed(scope: FeedScope = "public", limit = 10): Promise<FeedData> {
  try {
    const response = await apiFetch<ApiListResponse<{ posts: SerializedPost[] }>>(
      `/api/posts?scope=${scope}&limit=${limit}`,
      { auth: true },
    );

    return {
      posts: response.posts,
      nextCursor: response.nextCursor ?? null,
    };
  } catch (error) {
    return {
      posts: [],
      nextCursor: null,
      error: resolveError(error),
    };
  }
}

export type MeasurementsData = {
  measurements: SerializedMeasurement[];
  nextCursor: string | null;
  error?: DataError;
};

export async function fetchMeasurements(limit = 30): Promise<MeasurementsData> {
  try {
    const response = await apiFetch<ApiListResponse<{ measurements: SerializedMeasurement[] }>>(
      `/api/measurements?limit=${limit}`,
      { auth: true },
    );

    return {
      measurements: response.measurements,
      nextCursor: response.nextCursor ?? null,
    };
  } catch (error) {
    return {
      measurements: [],
      nextCursor: null,
      error: resolveError(error),
    };
  }
}

export type NotificationData = {
  notifications: SerializedNotification[];
  nextCursor: string | null;
  unreadCount: number;
  live: boolean;
  error?: DataError;
};

export async function fetchNotifications(limit = 20): Promise<NotificationData> {
  try {
    const response = await apiFetch<
      ApiListResponse<{ notifications: SerializedNotification[]; unreadCount: number }>
    >(`/api/notifications?limit=${limit}`, { auth: true });

    return {
      notifications: response.notifications,
      nextCursor: response.nextCursor ?? null,
      unreadCount: response.unreadCount,
      live: true,
    };
  } catch (error) {
    return {
      notifications: [],
      nextCursor: null,
      unreadCount: 0,
      live: false,
      error: resolveError(error),
    };
  }
}

export async function fetchUnreadCount(): Promise<number> {
  try {
    const response = await apiFetch<{ unreadCount: number }>(
      "/api/notifications?limit=1",
      { auth: true },
    );
    return response.unreadCount ?? 0;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return 0;
    }
    return 0;
  }
}

export type TreatsData = {
  items: SerializedTreatItem[];
  spins: SerializedTreatSpin[];
  eligibility: EligibilityResult | null;
  nextCursor: string | null;
  error?: DataError;
};

export async function fetchTreats(limit = 20): Promise<TreatsData> {
  try {
    const [itemsResponse, spinsResponse, eligibility] = await Promise.all([
      apiFetch<{ items: SerializedTreatItem[] }>("/api/treats/items", { auth: true }),
      apiFetch<ApiListResponse<{ spins: SerializedTreatSpin[] }>>(`/api/treats/spins?limit=${limit}`, {
        auth: true,
      }),
      apiFetch<{ eligibility: EligibilityResult }>("/api/treats/eligibility", { auth: true }),
    ]);

    return {
      items: itemsResponse.items,
      spins: spinsResponse.spins,
      eligibility: eligibility.eligibility,
      nextCursor: spinsResponse.nextCursor ?? null,
    };
  } catch (error) {
    return {
      items: [],
      spins: [],
      eligibility: null,
      nextCursor: null,
      error: resolveError(error),
    };
  }
}

export type ReferralData = {
  referral: {
    code: string;
    shareUrl: string;
  } | null;
  invites: SerializedReferralInvite[];
  summary: {
    total: number;
    accepted: number;
    pending: number;
  } | null;
  analytics: {
    conversionRate: number;
    pendingRate: number;
    waitlistOptIns: number;
    sentThisWeek: number;
    acceptedThisWeek: number;
    lastInviteSentAt: string | null;
  } | null;
  error?: DataError;
};

export async function fetchReferrals(): Promise<ReferralData> {
  try {
    const response = await apiFetch<{
      referral: { code: string; shareUrl: string };
      invites: SerializedReferralInvite[];
      summary: { total: number; accepted: number; pending: number };
      analytics: ReferralData["analytics"];
    }>("/api/referrals", { auth: true });

    return {
      referral: response.referral,
      invites: response.invites,
      summary: response.summary,
      analytics: response.analytics,
    };
  } catch (error) {
    return {
      referral: null,
      invites: [],
      summary: null,
      analytics: null,
      error: resolveError(error),
    };
  }
}

export type ProgressSummary = ProgressInsights["summary"];
export type ProgressSeriesPoint =
  | ProgressInsights["weeklySeries"][number]
  | ProgressInsights["monthlySeries"][number];

export type ProgressInsightsData = {
  summary: ProgressSummary | null;
  weeklySeries: ProgressInsights["weeklySeries"];
  monthlySeries: ProgressInsights["monthlySeries"];
  recentNotes: SerializedCoachNote[];
  error?: DataError;
};

export async function fetchProgressInsights(): Promise<ProgressInsightsData> {
  try {
    const response = await apiFetch<ProgressInsights>("/api/insights/progress", { auth: true });
    return {
      summary: response.summary,
      weeklySeries: response.weeklySeries,
      monthlySeries: response.monthlySeries,
      recentNotes: response.recentNotes,
    };
  } catch (error) {
    return {
      summary: null,
      weeklySeries: [],
      monthlySeries: [],
      recentNotes: [],
      error: resolveError(error),
    };
  }
}

export type ChallengesData = {
  challenges: SerializedChallenge[];
  readOnly: boolean;
  error?: DataError;
};

export async function fetchChallenges(): Promise<ChallengesData> {
  try {
    const response = await apiFetch<{ challenges: SerializedChallenge[] }>("/api/challenges", { auth: true });
    return {
      challenges: response.challenges,
      readOnly: false,
    };
  } catch (error) {
    return {
      challenges: [],
      readOnly: true,
      error: resolveError(error),
    };
  }
}

export type ProfileOverview = {
  user: SerializedUser;
  latestMeasurement: SerializedMeasurement | null;
};

export type ProfileOverviewResult = {
  profile: ProfileOverview | null;
  error?: DataError;
};

export async function fetchProfileOverview(): Promise<ProfileOverviewResult> {
  try {
    const profile = await apiFetch<ProfileOverview>("/api/profile", { auth: true });
    return {
      profile,
    };
  } catch (error) {
    return {
      profile: null,
      error: resolveError(error),
    };
  }
}
