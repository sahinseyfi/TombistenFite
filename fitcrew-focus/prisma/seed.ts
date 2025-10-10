import {
  PrismaClient,
  TreatPortion,
  MealType,
  NotificationType,
  PostVisibility,
  AiCommentStatus,
  FollowStatus,
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
