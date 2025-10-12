import {
  PrismaClient,
  TreatPortion,
  MealType,
  NotificationType,
  PostVisibility,
  AiCommentStatus,
  FollowStatus,
  ChallengeFrequency,
  ChallengeStatus,
  ReferralStatus,
} from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const [ayseHash, mertHash] = await Promise.all([
    hash("Fitcrew123!", 10),
    hash("Fitcrew123!", 10),
  ]);

  const ayse = await prisma.user.upsert({
    where: { handle: "aysefit" },
    update: {},
    create: {
      handle: "aysefit",
      name: "Ayse Fit",
      email: "ayse@example.com",
      passwordHash: ayseHash,
      avatarUrl: "https://cdn.fitcrew.local/avatars/ayse.png",
      defaultVisibility: PostVisibility.FOLLOWERS,
      referralCode: "AYSEFIT1",
    },
  });

  const mert = await prisma.user.upsert({
    where: { handle: "mertpower" },
    update: {},
    create: {
      handle: "mertpower",
      name: "Mert Power",
      email: "mert@example.com",
      passwordHash: mertHash,
      avatarUrl: "https://cdn.fitcrew.local/avatars/mert.png",
      referralCode: "MERTPOWR",
    },
  });

  await prisma.follow.upsert({
    where: { followerId_followeeId: { followerId: mert.id, followeeId: ayse.id } },
    update: {
      status: FollowStatus.ACCEPTED,
      isCloseFriend: true,
    },
    create: {
      followerId: mert.id,
      followeeId: ayse.id,
      status: FollowStatus.ACCEPTED,
      isCloseFriend: true,
    },
  });

  const measurement = await prisma.measurement.create({
    data: {
      userId: ayse.id,
      date: new Date(),
      weightKg: "68.4",
      waistCm: "72.3",
      hipCm: "94.5",
    },
  });

  const post = await prisma.post.create({
    data: {
      authorId: ayse.id,
      measurementId: measurement.id,
      photos: ["https://cdn.fitcrew.local/posts/ayse-breakfast.jpg"],
      caption: "Gune enerjik bir kahvalti ile basladim!",
      mealType: MealType.BREAKFAST,
      weightKg: "68.4",
      visibility: PostVisibility.FOLLOWERS,
      aiCommentStatus: AiCommentStatus.READY,
      aiCommentRequested: true,
      aiCommentSummary: "Harika dengeli bir kahvalti, protein ve lif dengesi iyi gorunuyor.",
      aiCommentTips: ["Bol su icmeye devam et", "Protein kaynaklarini cesitlendirebilirsin"],
      likesCount: 1,
      commentsCount: 1,
    },
  });

  await prisma.comment.create({
    data: {
      postId: post.id,
      authorId: mert.id,
      body: "Super gozukuyor! Tarifini paylasir misin?",
    },
  });

  await prisma.postLike.create({
    data: {
      postId: post.id,
      userId: mert.id,
    },
  });

  const acai = await prisma.treatItem.upsert({
    where: { id: "seed-treat-acai" },
    update: {},
    create: {
      id: "seed-treat-acai",
      userId: ayse.id,
      name: "Acai Bowl",
      kcalHint: "350 kcal",
      portions: [TreatPortion.SMALL, TreatPortion.MEDIUM],
      photoUrl: "https://cdn.fitcrew.local/treats/acai.jpg",
    },
  });

  await prisma.treatSpin.create({
    data: {
      userId: ayse.id,
      treatItemId: acai.id,
      treatNameSnapshot: acai.name,
      photoUrlSnapshot: acai.photoUrl,
      kcalHintSnapshot: acai.kcalHint,
      portion: TreatPortion.MEDIUM,
      bonusWalkMin: 30,
      bonusCompleted: false,
    },
  });

  await prisma.notification.create({
    data: {
      userId: ayse.id,
      type: NotificationType.COMMENT,
      payload: {
        postId: post.id,
        commentPreview: "Super gozukuyor! Tarifini paylasir misin?",
        actorHandle: mert.handle,
      },
    },
  });

  await prisma.coachNote.create({
    data: {
      coachId: mert.id,
      memberId: ayse.id,
      origin: "MANUAL",
      title: "Haftalik ilerleme \u00F6zeti",
      body:
        "Bel \u00F6l\u00E7\u00FCnde istikrarl\u0131 azalma g\u00F6r\u00FCn\u00FCyor. Su t\u00FCketimini 2.5L seviyesinde tut ve haftal\u0131k 2 y\u00FCr\u00FCy\u00FC\u015F planla.",
      tags: ["trend", "motivasyon"],
      posts: {
        create: [
          {
            post: {
              connect: { id: post.id },
            },
          },
        ],
      },
      measurements: {
        create: [
          {
            measurement: {
              connect: { id: measurement.id },
            },
          },
        ],
      },
    },
  });

  const challenge = await prisma.challenge.upsert({
    where: { slug: "haftalik-yuruyus-3x" },
    update: {},
    create: {
      slug: "haftalik-yuruyus-3x",
      title: "Haftada 3 Y\u00FCr\u00FCy\u00FC\u015F",
      summary: "Enerji toplamak i\u00E7in haftada en az 3 kez 30 dakikal\u0131k y\u00FCr\u00FCy\u00FC\u015F yap.",
      description:
        "Ko\u00E7 tavsiyesi: En az 30 dakika h\u0131zl\u0131 tempo y\u00FCr\u00FCy\u00FC\u015F ile kardiyo sistemini aktif tut.",
      frequency: ChallengeFrequency.WEEKLY,
      targetCount: 3,
      rewardLabel: "25 Treat puan\u0131 + 15 dk bonus y\u00FCr\u00FCy\u00FC\u015F",
      rewardPoints: 25,
      rewardBonusMinutes: 15,
      startsAt: new Date(),
      tasks: {
        create: [
          {
            title: "30 dk y\u00FCr\u00FCy\u00FC\u015F",
            instructions: "H\u0131zl\u0131 tempo ile 30 dakika boyunca aktif kal.",
            order: 0,
            targetCount: 3,
          },
        ],
      },
    },
    include: { tasks: true },
  });

  const participation = await prisma.challengeParticipation.create({
    data: {
      challengeId: challenge.id,
      userId: ayse.id,
      status: ChallengeStatus.ACTIVE,
      progressCount: 2,
      streakCount: 4,
      rewardClaimed: false,
      lastProgressAt: new Date(),
      progress: {
        create: [
          {
            taskId: challenge.tasks[0]?.id,
            quantity: 1,
            notedAt: new Date(),
            treatBonusMinutes: 5,
          },
          {
            taskId: challenge.tasks[0]?.id,
            quantity: 1,
            notedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            treatBonusMinutes: 5,
          },
        ],
      },
    },
  });

  await prisma.challengeProgress.create({
    data: {
      participationId: participation.id,
      quantity: 1,
      notedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      treatBonusMinutes: 5,
    },
  });

  await prisma.referralInvite.create({
    data: {
      inviterId: ayse.id,
      inviteeEmail: "zeynep@example.com",
      inviteeName: "Zeynep Demir",
      inviteCode: "AYSEZNP1",
      status: ReferralStatus.PENDING,
      waitlistOptIn: true,
      inviteEmailSentAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      inviteEmailProviderId: "seed-msg-zeynep",
      waitlistProvider: "resend",
      waitlistSubscriberId: "seed-subscriber-zeynep",
      waitlistSubscribedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.referralInvite.create({
    data: {
      inviterId: ayse.id,
      inviteeEmail: "mehmet@example.com",
      inviteCode: "AYSEMHM2",
      status: ReferralStatus.ACCEPTED,
      inviteeUserId: mert.id,
      acceptedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      inviteEmailSentAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      inviteEmailProviderId: "seed-msg-mehmet",
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("Seed failed", error);
    await prisma.$disconnect();
    process.exit(1);
  });
