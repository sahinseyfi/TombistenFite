-- Create CoachNoteOrigin enum
CREATE TYPE "CoachNoteOrigin" AS ENUM ('MANUAL', 'AI_COMMENT');

-- Create coach_notes table
CREATE TABLE "coach_notes" (
  "id" TEXT NOT NULL,
  "coach_id" TEXT NOT NULL,
  "member_id" TEXT NOT NULL,
  "origin" "CoachNoteOrigin" NOT NULL DEFAULT 'MANUAL',
  "title" VARCHAR(120),
  "body" VARCHAR(1000) NOT NULL,
  "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "archived_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "coach_notes_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "coach_notes"
  ADD CONSTRAINT "coach_notes_coach_id_fkey"
  FOREIGN KEY ("coach_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "coach_notes"
  ADD CONSTRAINT "coach_notes_member_id_fkey"
  FOREIGN KEY ("member_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "idx_coach_notes_member_created" ON "coach_notes" ("member_id", "created_at");
CREATE INDEX "idx_coach_notes_coach_created" ON "coach_notes" ("coach_id", "created_at");

-- Create coach_note_posts table
CREATE TABLE "coach_note_posts" (
  "note_id" TEXT NOT NULL,
  "post_id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "coach_note_posts_pkey" PRIMARY KEY ("note_id", "post_id")
);

ALTER TABLE "coach_note_posts"
  ADD CONSTRAINT "coach_note_posts_note_id_fkey"
  FOREIGN KEY ("note_id") REFERENCES "coach_notes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "coach_note_posts"
  ADD CONSTRAINT "coach_note_posts_post_id_fkey"
  FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "idx_coach_note_posts_post" ON "coach_note_posts" ("post_id");

-- Create coach_note_measurements table
CREATE TABLE "coach_note_measurements" (
  "note_id" TEXT NOT NULL,
  "measurement_id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "coach_note_measurements_pkey" PRIMARY KEY ("note_id", "measurement_id")
);

ALTER TABLE "coach_note_measurements"
  ADD CONSTRAINT "coach_note_measurements_note_id_fkey"
  FOREIGN KEY ("note_id") REFERENCES "coach_notes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "coach_note_measurements"
  ADD CONSTRAINT "coach_note_measurements_measurement_id_fkey"
  FOREIGN KEY ("measurement_id") REFERENCES "measurements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "idx_coach_note_measurements_measurement" ON "coach_note_measurements" ("measurement_id");
