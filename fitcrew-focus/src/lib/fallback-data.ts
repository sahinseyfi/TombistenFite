import type { SerializedPost } from "@/server/serializers/post";
import type { SerializedMeasurement } from "@/server/serializers/measurement";
import type { EligibilityResult } from "@/server/treats/eligibility";
import type { SerializedTreatItem, SerializedTreatSpin } from "@/server/serializers/treat";
import type { SerializedNotification } from "@/server/serializers/notification";
import type { SerializedCoachNote } from "@/server/serializers/coach-note";
import type { SerializedChallenge } from "@/server/serializers/challenge";
import type { ProgressInsights } from "@/server/insights/progress";
import type { SerializedReferralInvite } from "@/server/serializers/referral";
import type { MembershipSnapshot } from "@/types/membership";
import { PLAN_CONFIG, resolveFeatureGates } from "@/config/membership";

const now = new Date();

function hoursAgo(hours: number) {
  return new Date(now.getTime() - hours * 60 * 60 * 1000).toISOString();
}

function daysAgo(days: number) {
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
}

const freePlan = PLAN_CONFIG.free;

export const FALLBACK_MEMBERSHIP: MembershipSnapshot = {
  tier: "free",
  status: "inactive",
  planHeadline: freePlan.headline,
  planPriceHint: freePlan.priceHint,
  renewsAt: null,
  trialEndsAt: null,
  perks: freePlan.perks,
  featureGates: resolveFeatureGates("free"),
  provider: {
    provider: "unknown",
    customerId: null,
    subscriptionId: null,
    status: "inactive",
  },
  source: "fallback",
};

export const FALLBACK_POSTS: SerializedPost[] = [
  {
    id: "post-fallback-1",
    author: {
      id: "user-fallback-1",
      handle: "ayse_fit",
      name: "Ay\u015Fe Y\u0131lmaz",
      avatarUrl: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=256&h=256&fit=facearea",
    },
    createdAt: hoursAgo(2),
    updatedAt: hoursAgo(2),
    photos: ["https://images.unsplash.com/photo-1525351484163-7529414344d8?w=1024"],
    caption: "G\u00FCne protein a\u011F\u0131rl\u0131kl\u0131 ve ferahlat\u0131c\u0131 bir kahvalt\u0131 ile ba\u015Flad\u0131m.",
    mealType: "breakfast",
    weightKg: 68.4,
    measurementId: undefined,
    measurements: { waistCm: 72, hipCm: 95 },
    visibility: "public",
    aiComment: {
      status: "ready",
      summary: "Protein ve lif dengesini koruyan harika bir se\u00E7im.",
      tips: [
        "Sabah su t\u00FCketimini 1 bardak daha art\u0131r",
        "\u00D6\u011Fle i\u00E7in sebze bazl\u0131 alternatifleri planla",
      ],
    },
    aiCommentRequested: true,
    likesCount: 48,
    commentsCount: 12,
    likedByViewer: false,
  },
  {
    id: "post-fallback-2",
    author: {
      id: "user-fallback-2",
      handle: "mehmet_gains",
      name: "Mehmet Kaya",
      avatarUrl: "https://images.unsplash.com/photo-1544723795-43253782e9e0?w=256&h=256&fit=facearea",
    },
    createdAt: hoursAgo(5),
    updatedAt: hoursAgo(5),
    photos: [
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800",
      "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800",
    ],
    caption: "Keto g\u00FCn\u00FCn\u00FCn 3. \u00F6\u011F\u00FCn\u00FC: izgara tavuk, kinoal\u0131 tabak ve ferah salata.",
    mealType: "lunch",
    weightKg: 82.1,
    measurementId: undefined,
    measurements: undefined,
    visibility: "public",
    aiComment: {
      status: "ready",
      summary: "Protein/ya\u011F da\u011F\u0131l\u0131m\u0131 keto hedefleriyle uyumlu.",
      tips: ["Ye\u015Fil yaprakl\u0131 sebzeleri ak\u015Fam \u00F6\u011F\u00FCn\u00FCne de ta\u015F\u0131"],
    },
    aiCommentRequested: true,
    likesCount: 91,
    commentsCount: 24,
    likedByViewer: false,
  },
  {
    id: "post-fallback-3",
    author: {
      id: "user-fallback-3",
      handle: "zeynep_health",
      name: "Zeynep Demir",
      avatarUrl: "https://images.unsplash.com/photo-1552058544-f2b08422138a?w=256&h=256&fit=facearea",
    },
    createdAt: hoursAgo(9),
    updatedAt: hoursAgo(9),
    photos: ["https://images.unsplash.com/photo-1504753793650-d4a2b783c15e?w=1024"],
    caption: "Yoga sonras\u0131 enerji toplamak i\u00E7in meyveli smoothie bowl.\nTaze ve hafif!",
    mealType: "snack",
    weightKg: 59.4,
    measurementId: undefined,
    measurements: { waistCm: 65 },
    visibility: "public",
    aiComment: undefined,
    aiCommentRequested: false,
    likesCount: 156,
    commentsCount: 31,
    likedByViewer: true,
  },
];

export const FALLBACK_MEASUREMENTS: SerializedMeasurement[] = [
  { id: "m-1", userId: "user-fallback-1", date: daysAgo(1), weightKg: 68.4, waistCm: 72, chestCm: 88, hipCm: 96, armCm: 30, thighCm: 54, createdAt: daysAgo(1) },
  { id: "m-2", userId: "user-fallback-1", date: daysAgo(8), weightKg: 68.9, waistCm: 73, chestCm: 89, hipCm: 97, armCm: 30.4, thighCm: 54.5, createdAt: daysAgo(8) },
  { id: "m-3", userId: "user-fallback-1", date: daysAgo(15), weightKg: 69.6, waistCm: 74, chestCm: 90, hipCm: 98, armCm: 31, thighCm: 55, createdAt: daysAgo(15) },
  { id: "m-4", userId: "user-fallback-1", date: daysAgo(22), weightKg: 70.2, waistCm: 75, chestCm: 91, hipCm: 99, armCm: 31.2, thighCm: 55.5, createdAt: daysAgo(22) },
];

export const FALLBACK_NOTIFICATIONS: SerializedNotification[] = [
  {
    id: "notification-fallback-1",
    type: "like",
    read: false,
    readAt: null,
    createdAt: hoursAgo(1),
    actor: {
      id: "user-fallback-2",
      handle: "mehmet_gains",
      name: "Mehmet Kaya",
      avatarUrl: "https://images.unsplash.com/photo-1544723795-43253782e9e0?w=256&h=256&fit=facearea",
    },
    post: { id: "post-fallback-1", previewPhotoUrl: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=320" },
    comment: undefined,
    aiComment: undefined,
    treatBonus: undefined,
  },
  {
    id: "notification-fallback-2",
    type: "comment",
    read: false,
    readAt: null,
    createdAt: hoursAgo(3),
    actor: {
      id: "user-fallback-3",
      handle: "zeynep_health",
      name: "Zeynep Demir",
      avatarUrl: "https://images.unsplash.com/photo-1552058544-f2b08422138a?w=256&h=256&fit=facearea",
    },
    post: { id: "post-fallback-1", previewPhotoUrl: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=320" },
    comment: { id: "comment-fallback-1", preview: "Motivasyon dolu bir tabak!" },
    aiComment: undefined,
    treatBonus: undefined,
  },
];

export const FALLBACK_TREAT_ITEMS: SerializedTreatItem[] = [
  {
    id: "treat-item-1",
    userId: "user-fallback-1",
    name: "F\u0131st\u0131kl\u0131 Protein Bar",
    photoUrl: "https://images.unsplash.com/photo-1589308078054-8329a01d1108?w=600",
    kcalHint: "~220 kcal",
    portions: ["small", "medium"],
    createdAt: daysAgo(10),
    updatedAt: daysAgo(4),
  },
  {
    id: "treat-item-2",
    userId: "user-fallback-1",
    name: "\u00C7ikolata Kapl\u0131 \u00C7ilek",
    photoUrl: "https://images.unsplash.com/photo-1499028344343-cd173ffc68a9?w=600",
    kcalHint: "~180 kcal",
    portions: ["small", "medium", "full"],
    createdAt: daysAgo(18),
    updatedAt: daysAgo(7),
  },
  {
    id: "treat-item-3",
    userId: "user-fallback-1",
    name: "Mini Cheesecake",
    photoUrl: "https://images.unsplash.com/photo-1505253468034-514d2507d914?w=600",
    kcalHint: "~320 kcal",
    portions: ["small"],
    createdAt: daysAgo(24),
    updatedAt: daysAgo(21),
  },
];

export const FALLBACK_TREAT_SPINS: SerializedTreatSpin[] = [
  {
    id: "treat-spin-1",
    userId: "user-fallback-1",
    treatItemId: "treat-item-2",
    treatNameSnapshot: "\u00C7ikolata Kapl\u0131 \u00C7ilek",
    photoUrlSnapshot: "https://images.unsplash.com/photo-1499028344343-cd173ffc68a9?w=320",
    kcalHintSnapshot: "~180 kcal",
    spunAt: daysAgo(6),
    portion: "medium",
    bonusWalkMin: 30,
    bonusCompleted: true,
    createdAt: daysAgo(6),
  },
  {
    id: "treat-spin-2",
    userId: "user-fallback-1",
    treatItemId: "treat-item-1",
    treatNameSnapshot: "F\u0131st\u0131kl\u0131 Protein Bar",
    photoUrlSnapshot: "https://images.unsplash.com/photo-1589308078054-8329a01d1108?w=320",
    kcalHintSnapshot: "~220 kcal",
    spunAt: daysAgo(13),
    portion: "small",
    bonusWalkMin: 20,
    bonusCompleted: true,
    createdAt: daysAgo(13),
  },
];

export const FALLBACK_TREAT_ELIGIBILITY: EligibilityResult = {
  userId: "user-fallback-1",
  eligible: true,
  progressDeltaKg: 0.9,
  lastSpinAt: daysAgo(6),
};

export const FALLBACK_UNREAD_COUNT = 2;

export const FALLBACK_CHALLENGES: SerializedChallenge[] = [
  {
    id: "challenge-fallback-1",
    slug: "haftalik-yuruyus-3x",
    title: "Haftada 3 Y\u00FCr\u00FCy\u00FC\u015F",
    summary: "Her biri en az 30 dk olacak \u015Fekilde haftada 3 kez y\u00FCr\u00FCy\u00FC\u015F yap.",
    description:
      "Cardio formunu korumak ve Treat Wheel bonusu kazanmak i\u00E7in haftal\u0131k 3 y\u00FCr\u00FCy\u00FC\u015F planla.",
    frequency: "WEEKLY",
    targetCount: 3,
    rewardLabel: "25 Treat puan\u0131 + 15 dk bonus",
    rewardPoints: 25,
    rewardBonusMinutes: 15,
    startsAt: daysAgo(3),
    endsAt: daysAgo(-4),
    isActive: true,
    createdAt: daysAgo(5),
    updatedAt: daysAgo(1),
    tasks: [
      {
        id: "challenge-task-fallback-1",
        challengeId: "challenge-fallback-1",
        title: "30 dk y\u00FCr\u00FCy\u00FC\u015F",
        instructions: "Is\u0131n, 30 dakika boyunca tempolu y\u00FCr\u00FC.",
        order: 0,
        targetCount: 3,
        createdAt: daysAgo(5),
      },
    ],
    participation: {
      id: "participation-fallback-1",
      challengeId: "challenge-fallback-1",
      userId: "user-fallback-1",
      status: "ACTIVE",
      progressCount: 2,
      streakCount: 4,
      rewardClaimed: false,
      lastProgressAt: daysAgo(1),
      joinedAt: daysAgo(5),
      completedAt: null,
      progress: [
        {
          id: "progress-fallback-1",
          taskId: "challenge-task-fallback-1",
          quantity: 1,
          notedAt: daysAgo(1),
          bonusSpinGranted: false,
          treatBonusMinutes: 0,
        },
        {
          id: "progress-fallback-2",
          taskId: "challenge-task-fallback-1",
          quantity: 1,
          notedAt: daysAgo(3),
          bonusSpinGranted: false,
          treatBonusMinutes: 0,
        },
      ],
    },
    progress: {
      completionRate: 0.6666666667,
      remainingCount: 1,
      isCompleted: false,
    },
  },
];

const fallbackCoach: SerializedCoachNote["coach"] = {
  id: "coach-fallback-1",
  name: "Ko\u00E7 Deniz",
  handle: "denizcoach",
  avatarUrl: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=128&h=128&fit=facearea",
};

export const FALLBACK_PROGRESS_INSIGHTS: Omit<ProgressInsights, "recentNotes"> & {
  recentNotes: SerializedCoachNote[];
} = {
  summary: {
    latestMeasurementAt: daysAgo(1),
    latestWeightKg: 68.4,
    previousWeightKg: 68.9,
    weightChangeKg: -0.5,
    measurementCount: 12,
    treatSpinsLast30Days: 3,
    treatBonusLast30Days: 85,
  },
  weeklySeries: [
    {
      period: "2025-W35",
      startDate: daysAgo(42),
      endDate: daysAgo(36),
      measurementCount: 2,
      averageWeightKg: 69.8,
      averageWaistCm: 74.5,
      averageHipCm: 97.5,
      treatSpinCount: 1,
      treatBonusMinutes: 20,
    },
    {
      period: "2025-W36",
      startDate: daysAgo(35),
      endDate: daysAgo(29),
      measurementCount: 1,
      averageWeightKg: 69.4,
      averageWaistCm: 74.1,
      averageHipCm: 97.2,
      treatSpinCount: 1,
      treatBonusMinutes: 30,
    },
    {
      period: "2025-W37",
      startDate: daysAgo(28),
      endDate: daysAgo(22),
      measurementCount: 2,
      averageWeightKg: 69.1,
      averageWaistCm: 73.6,
      averageHipCm: 96.9,
      treatSpinCount: 0,
      treatBonusMinutes: 0,
    },
    {
      period: "2025-W38",
      startDate: daysAgo(21),
      endDate: daysAgo(15),
      measurementCount: 2,
      averageWeightKg: 68.9,
      averageWaistCm: 73.1,
      averageHipCm: 96.4,
      treatSpinCount: 1,
      treatBonusMinutes: 25,
    },
    {
      period: "2025-W39",
      startDate: daysAgo(14),
      endDate: daysAgo(8),
      measurementCount: 2,
      averageWeightKg: 68.6,
      averageWaistCm: 72.8,
      averageHipCm: 96.1,
      treatSpinCount: 0,
      treatBonusMinutes: 0,
    },
    {
      period: "2025-W40",
      startDate: daysAgo(7),
      endDate: daysAgo(1),
      measurementCount: 3,
      averageWeightKg: 68.4,
      averageWaistCm: 72.5,
      averageHipCm: 95.9,
      treatSpinCount: 1,
      treatBonusMinutes: 30,
    },
    {
      period: "2025-W41",
      startDate: daysAgo(0),
      endDate: daysAgo(-6),
      measurementCount: 0,
      averageWeightKg: null,
      averageWaistCm: null,
      averageHipCm: null,
      treatSpinCount: 0,
      treatBonusMinutes: 0,
    },
    {
      period: "2025-W42",
      startDate: daysAgo(-7),
      endDate: daysAgo(-1),
      measurementCount: 0,
      averageWeightKg: null,
      averageWaistCm: null,
      averageHipCm: null,
      treatSpinCount: 0,
      treatBonusMinutes: 0,
    },
  ],
  monthlySeries: [
    {
      period: "2025-05",
      startDate: "2025-05-01T00:00:00.000Z",
      endDate: "2025-05-31T23:59:59.999Z",
      measurementCount: 3,
      averageWeightKg: 70.8,
      averageWaistCm: 76.1,
      averageHipCm: 99,
      treatSpinCount: 1,
      treatBonusMinutes: 20,
    },
    {
      period: "2025-06",
      startDate: "2025-06-01T00:00:00.000Z",
      endDate: "2025-06-30T23:59:59.999Z",
      measurementCount: 3,
      averageWeightKg: 70.2,
      averageWaistCm: 75.6,
      averageHipCm: 98.5,
      treatSpinCount: 1,
      treatBonusMinutes: 25,
    },
    {
      period: "2025-07",
      startDate: "2025-07-01T00:00:00.000Z",
      endDate: "2025-07-31T23:59:59.999Z",
      measurementCount: 2,
      averageWeightKg: 69.8,
      averageWaistCm: 74.9,
      averageHipCm: 97.8,
      treatSpinCount: 1,
      treatBonusMinutes: 30,
    },
    {
      period: "2025-08",
      startDate: "2025-08-01T00:00:00.000Z",
      endDate: "2025-08-31T23:59:59.999Z",
      measurementCount: 2,
      averageWeightKg: 69.1,
      averageWaistCm: 74.1,
      averageHipCm: 97.1,
      treatSpinCount: 1,
      treatBonusMinutes: 20,
    },
    {
      period: "2025-09",
      startDate: "2025-09-01T00:00:00.000Z",
      endDate: "2025-09-30T23:59:59.999Z",
      measurementCount: 1,
      averageWeightKg: 69,
      averageWaistCm: 73.4,
      averageHipCm: 96.5,
      treatSpinCount: 1,
      treatBonusMinutes: 30,
    },
    {
      period: "2025-10",
      startDate: "2025-10-01T00:00:00.000Z",
      endDate: "2025-10-31T23:59:59.999Z",
      measurementCount: 1,
      averageWeightKg: 68.4,
      averageWaistCm: 72.5,
      averageHipCm: 95.9,
      treatSpinCount: 0,
      treatBonusMinutes: 0,
    },
  ],
  recentNotes: [
    {
      id: "coach-note-fallback-1",
      coach: fallbackCoach,
      memberId: "user-fallback-1",
      origin: "MANUAL",
      title: "Haftal\u0131k ilerleme",
      body:
        "Bel \u00E7evresi ve kilo hedefinle uyumlu gidiyor. Bu hafta bir adet kuvvet antrenman\u0131 eklemeyi d\u00FC\u015F\u00FCn.",
      tags: ["trend", "motivasyon"],
      archivedAt: null,
      createdAt: daysAgo(2),
      updatedAt: daysAgo(2),
      postIds: ["post-fallback-1"],
      measurementIds: ["m-1", "m-2"],
    },
    {
      id: "coach-note-fallback-2",
      coach: fallbackCoach,
      memberId: "user-fallback-1",
      origin: "AI_COMMENT",
      title: "AI \u00F6nerisi \u00F6zeti",
      body:
        "AI yorumu hidrasyon ve lif vurgusu yap\u0131yor. Kahvalt\u0131na ye\u015Fil smoothie ekleyebilirsin.",
      tags: ["ai", "beslenme"],
      archivedAt: null,
      createdAt: daysAgo(6),
      updatedAt: daysAgo(6),
      postIds: ["post-fallback-3"],
      measurementIds: [],
    },
  ],
};

export const FALLBACK_REFERRALS: {
  referral: { code: string; shareUrl: string };
  invites: SerializedReferralInvite[];
  summary: { total: number; accepted: number; pending: number };
} = {
  referral: {
    code: "FITCREW20",
    shareUrl: "https://app.fitcrew.local/davet?ref=FITCREW20",
  },
  invites: [
    {
      id: "referral-fallback-1",
      inviterId: "user-fallback-1",
      inviteeEmail: "zeynep@example.com",
      inviteeName: "Zeynep Demir",
      inviteCode: "FITZNP20",
      status: "accepted",
      inviteeUserId: "user-fallback-3",
      waitlistOptIn: true,
      waitlistProvider: "resend",
      waitlistSubscriberId: "contact-zeynep",
      waitlistSubscribedAt: daysAgo(4),
      inviteEmailSentAt: daysAgo(6),
      inviteEmailProviderId: "msg-zeynep",
      acceptedAt: daysAgo(2),
      canceledAt: undefined,
      createdAt: daysAgo(6),
      updatedAt: daysAgo(2),
    },
    {
      id: "referral-fallback-2",
      inviterId: "user-fallback-1",
      inviteeEmail: "cem@example.com",
      inviteeName: "Cem Arslan",
      inviteCode: "FITCEM21",
      status: "pending",
      inviteeUserId: undefined,
      waitlistOptIn: false,
      waitlistProvider: undefined,
      waitlistSubscriberId: undefined,
      waitlistSubscribedAt: undefined,
      inviteEmailSentAt: daysAgo(12),
      inviteEmailProviderId: "msg-cem",
      acceptedAt: undefined,
      canceledAt: undefined,
      createdAt: daysAgo(1),
      updatedAt: daysAgo(1),
    },
  ],
  summary: {
    total: 2,
    accepted: 1,
    pending: 1,
  },
};
