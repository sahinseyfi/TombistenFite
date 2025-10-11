import type { SerializedPost } from "@/server/serializers/post";
import type { SerializedMeasurement } from "@/server/serializers/measurement";
import type { EligibilityResult } from "@/server/treats/eligibility";
import type { SerializedTreatItem, SerializedTreatSpin } from "@/server/serializers/treat";
import type { SerializedNotification } from "@/server/serializers/notification";

const now = new Date();

function hoursAgo(hours: number) {
  return new Date(now.getTime() - hours * 60 * 60 * 1000).toISOString();
}

function daysAgo(days: number) {
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
}

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
