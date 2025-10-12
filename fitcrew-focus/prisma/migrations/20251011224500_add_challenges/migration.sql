-- Enums for challenges
CREATE TYPE "ChallengeFrequency" AS ENUM ('DAILY', 'WEEKLY');
CREATE TYPE "ChallengeStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'DROPPED');

-- challenges table
CREATE TABLE "challenges" (
  "id" TEXT NOT NULL,
  "slug" VARCHAR(64) NOT NULL,
  "title" VARCHAR(120) NOT NULL,
  "summary" VARCHAR(280) NOT NULL,
  "description" VARCHAR(500),
  "frequency" "ChallengeFrequency" NOT NULL DEFAULT 'WEEKLY',
  "target_count" INTEGER NOT NULL DEFAULT 3,
  "reward_label" VARCHAR(120),
  "reward_points" INTEGER NOT NULL DEFAULT 0,
  "reward_bonus_minutes" INTEGER NOT NULL DEFAULT 0,
  "starts_at" TIMESTAMP(3),
  "ends_at" TIMESTAMP(3),
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "challenges_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "idx_challenges_slug" ON "challenges" ("slug");
CREATE INDEX "idx_challenges_active_frequency" ON "challenges" ("is_active", "frequency");
CREATE INDEX "idx_challenges_ends_at" ON "challenges" ("ends_at");

-- challenge_tasks table
CREATE TABLE "challenge_tasks" (
  "id" TEXT NOT NULL,
  "challenge_id" TEXT NOT NULL,
  "title" VARCHAR(120) NOT NULL,
  "instructions" VARCHAR(300),
  "order" INTEGER NOT NULL DEFAULT 0,
  "target_count" INTEGER NOT NULL DEFAULT 1,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "challenge_tasks_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "challenge_tasks"
  ADD CONSTRAINT "challenge_tasks_challenge_id_fkey"
  FOREIGN KEY ("challenge_id") REFERENCES "challenges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "idx_challenge_tasks_order" ON "challenge_tasks" ("challenge_id", "\"order\"");

-- challenge_participations table
CREATE TABLE "challenge_participations" (
  "id" TEXT NOT NULL,
  "challenge_id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "status" "ChallengeStatus" NOT NULL DEFAULT 'ACTIVE',
  "progress_count" INTEGER NOT NULL DEFAULT 0,
  "streak_count" INTEGER NOT NULL DEFAULT 0,
  "reward_claimed" BOOLEAN NOT NULL DEFAULT false,
  "last_progress_at" TIMESTAMP(3),
  "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completed_at" TIMESTAMP(3),
  CONSTRAINT "challenge_participations_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "challenge_participations"
  ADD CONSTRAINT "challenge_participations_challenge_id_fkey"
  FOREIGN KEY ("challenge_id") REFERENCES "challenges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "challenge_participations"
  ADD CONSTRAINT "challenge_participations_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE UNIQUE INDEX "idx_participations_unique" ON "challenge_participations" ("challenge_id", "user_id");
CREATE INDEX "idx_participations_user_status" ON "challenge_participations" ("user_id", "status");

-- challenge_progress table
CREATE TABLE "challenge_progress" (
  "id" TEXT NOT NULL,
  "participation_id" TEXT NOT NULL,
  "task_id" TEXT,
  "quantity" INTEGER NOT NULL DEFAULT 1,
  "noted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "bonus_spin_granted" BOOLEAN NOT NULL DEFAULT false,
  "treat_bonus_minutes" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "challenge_progress_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "challenge_progress"
  ADD CONSTRAINT "challenge_progress_participation_id_fkey"
  FOREIGN KEY ("participation_id") REFERENCES "challenge_participations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "challenge_progress"
  ADD CONSTRAINT "challenge_progress_task_id_fkey"
  FOREIGN KEY ("task_id") REFERENCES "challenge_tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "idx_progress_participation_noted" ON "challenge_progress" ("participation_id", "noted_at");
