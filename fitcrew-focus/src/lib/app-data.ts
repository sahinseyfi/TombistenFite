import { apiFetch, ApiError } from "@/lib/api-client";
import {
  FALLBACK_MEASUREMENTS,
  FALLBACK_NOTIFICATIONS,
  FALLBACK_POSTS,
  FALLBACK_TREAT_ELIGIBILITY,
  FALLBACK_TREAT_ITEMS,
  FALLBACK_TREAT_SPINS,
  FALLBACK_UNREAD_COUNT,
} from "@/lib/fallback-data";
import type { SerializedPost } from "@/server/serializers/post";
import type { SerializedMeasurement } from "@/server/serializers/measurement";
import type { SerializedTreatItem, SerializedTreatSpin } from "@/server/serializers/treat";
import type { SerializedNotification } from "@/server/serializers/notification";
import type { EligibilityResult } from "@/server/treats/eligibility";

type ApiListResponse<T> = {
  nextCursor: string | null | undefined;
} & T;

export type FeedScope = "public" | "following" | "me" | "close_friends";

export type FeedData = {
  posts: SerializedPost[];
  nextCursor: string | null;
  source: "api" | "fallback";
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
      source: "api",
    };
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      // Session yoksa fallback verilerini g\u00F6ster
      return {
        posts: FALLBACK_POSTS,
        nextCursor: null,
        source: "fallback",
      };
    }

    return {
      posts: FALLBACK_POSTS,
      nextCursor: null,
      source: "fallback",
    };
  }
}

export type MeasurementsData = {
  measurements: SerializedMeasurement[];
  nextCursor: string | null;
  source: "api" | "fallback";
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
      source: "api",
    };
  } catch (error) {
    return {
      measurements: FALLBACK_MEASUREMENTS,
      nextCursor: null,
      source: "fallback",
    };
  }
}

export type NotificationData = {
  notifications: SerializedNotification[];
  nextCursor: string | null;
  unreadCount: number;
  source: "api" | "fallback";
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
      source: "api",
    };
  } catch (error) {
    return {
      notifications: FALLBACK_NOTIFICATIONS,
      nextCursor: null,
      unreadCount: FALLBACK_UNREAD_COUNT,
      source: "fallback",
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
  } catch {
    return FALLBACK_UNREAD_COUNT;
  }
}

export type TreatsData = {
  items: SerializedTreatItem[];
  spins: SerializedTreatSpin[];
  eligibility: EligibilityResult;
  nextCursor: string | null;
  source: "api" | "fallback";
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
      source: "api",
    };
  } catch (error) {
    return {
      items: FALLBACK_TREAT_ITEMS,
      spins: FALLBACK_TREAT_SPINS,
      eligibility: FALLBACK_TREAT_ELIGIBILITY,
      nextCursor: null,
      source: "fallback",
    };
  }
}
