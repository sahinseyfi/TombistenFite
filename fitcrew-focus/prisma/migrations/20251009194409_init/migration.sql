-- CreateEnum
CREATE TYPE "PostVisibility" AS ENUM ('PUBLIC', 'FOLLOWERS', 'PRIVATE');

-- CreateEnum
CREATE TYPE "MealType" AS ENUM ('BREAKFAST', 'LUNCH', 'DINNER', 'SNACK');

-- CreateEnum
CREATE TYPE "FollowStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "AiCommentStatus" AS ENUM ('IDLE', 'PENDING', 'READY', 'FAILED');

-- CreateEnum
CREATE TYPE "TreatPortion" AS ENUM ('SMALL', 'MEDIUM', 'FULL');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('LIKE', 'COMMENT', 'FOLLOW', 'AI_COMMENT_READY');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "handle" VARCHAR(32) NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "passwordHash" VARCHAR(255) NOT NULL,
    "avatarUrl" TEXT,
    "bio" VARCHAR(280),
    "defaultVisibility" "PostVisibility" NOT NULL DEFAULT 'PUBLIC',
    "aiCommentDefault" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "posts" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "measurementId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "photos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "caption" VARCHAR(500),
    "mealType" "MealType",
    "weightKg" DECIMAL(5,2),
    "visibility" "PostVisibility" NOT NULL DEFAULT 'PUBLIC',
    "aiCommentStatus" "AiCommentStatus" NOT NULL DEFAULT 'IDLE',
    "aiCommentSummary" VARCHAR(500),
    "aiCommentTips" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "aiCommentUpdatedAt" TIMESTAMP(3),
    "aiCommentError" VARCHAR(255),
    "likesCount" INTEGER NOT NULL DEFAULT 0,
    "commentsCount" INTEGER NOT NULL DEFAULT 0,
    "aiCommentRequested" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "body" VARCHAR(1000) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "follows" (
    "followerId" TEXT NOT NULL,
    "followeeId" TEXT NOT NULL,
    "status" "FollowStatus" NOT NULL DEFAULT 'ACCEPTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "follows_pkey" PRIMARY KEY ("followerId","followeeId")
);

-- CreateTable
CREATE TABLE "measurements" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "weightKg" DECIMAL(5,2),
    "waistCm" DECIMAL(5,2),
    "chestCm" DECIMAL(5,2),
    "hipCm" DECIMAL(5,2),
    "armCm" DECIMAL(5,2),
    "thighCm" DECIMAL(5,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "measurements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "treat_items" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "photoUrl" TEXT,
    "kcalHint" VARCHAR(120),
    "portions" "TreatPortion"[] DEFAULT ARRAY[]::"TreatPortion"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "treat_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "treat_spins" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "treatItemId" TEXT,
    "treatNameSnapshot" VARCHAR(120) NOT NULL,
    "photoUrlSnapshot" TEXT,
    "kcalHintSnapshot" VARCHAR(120),
    "spunAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "portion" "TreatPortion" NOT NULL,
    "bonusWalkMin" INTEGER NOT NULL,
    "bonusCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "treat_spins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "payload" JSONB NOT NULL,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_handle_key" ON "users"("handle");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "posts_measurementId_key" ON "posts"("measurementId");

-- CreateIndex
CREATE INDEX "idx_posts_author_created" ON "posts"("authorId", "createdAt");

-- CreateIndex
CREATE INDEX "idx_posts_visibility_created" ON "posts"("visibility", "createdAt");

-- CreateIndex
CREATE INDEX "comments_postId_createdAt_idx" ON "comments"("postId", "createdAt");

-- CreateIndex
CREATE INDEX "idx_follows_follower" ON "follows"("followerId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "idx_follows_unique" ON "follows"("followeeId", "followerId");

-- CreateIndex
CREATE INDEX "idx_measurements_user_date" ON "measurements"("userId", "date");

-- CreateIndex
CREATE INDEX "treat_items_userId_createdAt_idx" ON "treat_items"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "treat_spins_userId_spunAt_idx" ON "treat_spins"("userId", "spunAt");

-- CreateIndex
CREATE INDEX "idx_notifications_user_read" ON "notifications"("userId", "readAt");
CREATE INDEX "idx_notifications_user_unread" ON "notifications"("userId") WHERE "readAt" IS NULL;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_measurementId_fkey" FOREIGN KEY ("measurementId") REFERENCES "measurements"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follows" ADD CONSTRAINT "follows_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follows" ADD CONSTRAINT "follows_followeeId_fkey" FOREIGN KEY ("followeeId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "measurements" ADD CONSTRAINT "measurements_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treat_items" ADD CONSTRAINT "treat_items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treat_spins" ADD CONSTRAINT "treat_spins_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treat_spins" ADD CONSTRAINT "treat_spins_treatItemId_fkey" FOREIGN KEY ("treatItemId") REFERENCES "treat_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

