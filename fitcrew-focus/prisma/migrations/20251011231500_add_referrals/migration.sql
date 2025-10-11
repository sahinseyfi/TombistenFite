-- Create enum for referral lifecycle
CREATE TYPE "ReferralStatus" AS ENUM ('PENDING', 'ACCEPTED', 'CANCELED');

-- Extend users with referral code
ALTER TABLE "users"
  ADD COLUMN "referral_code" VARCHAR(16);

UPDATE "users"
SET "referral_code" = upper(substr(md5(random()::text), 1, 10))
WHERE "referral_code" IS NULL;

ALTER TABLE "users"
  ALTER COLUMN "referral_code" SET NOT NULL;

ALTER TABLE "users"
  ADD CONSTRAINT "users_referral_code_key" UNIQUE ("referral_code");

-- Referral invites table
CREATE TABLE "referral_invites" (
  "id" TEXT NOT NULL,
  "inviter_id" TEXT NOT NULL,
  "invitee_email" VARCHAR(320) NOT NULL,
  "invitee_name" VARCHAR(120),
  "invite_code" VARCHAR(16) NOT NULL,
  "status" "ReferralStatus" NOT NULL DEFAULT 'PENDING',
  "invitee_user_id" TEXT,
  "waitlist_opt_in" BOOLEAN NOT NULL DEFAULT false,
  "accepted_at" TIMESTAMP(3),
  "canceled_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "referral_invites_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "referral_invites"
  ADD CONSTRAINT "referral_invites_inviter_id_fkey"
  FOREIGN KEY ("inviter_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "referral_invites"
  ADD CONSTRAINT "referral_invites_invitee_user_id_fkey"
  FOREIGN KEY ("invitee_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE UNIQUE INDEX "idx_referral_unique_email_per_inviter" ON "referral_invites" ("inviter_id", "invitee_email");
CREATE UNIQUE INDEX "idx_referral_code_lookup" ON "referral_invites" ("invite_code");
CREATE INDEX "idx_referral_inviter_created" ON "referral_invites" ("inviter_id", "created_at");
