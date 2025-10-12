ALTER TABLE "referral_invites"
  ADD COLUMN "invite_email_sent_at" TIMESTAMP(3),
  ADD COLUMN "invite_email_provider_id" VARCHAR(128),
  ADD COLUMN "waitlist_provider" VARCHAR(64),
  ADD COLUMN "waitlist_subscriber_id" VARCHAR(128),
  ADD COLUMN "waitlist_subscribed_at" TIMESTAMP(3);

CREATE INDEX "idx_referral_waitlist_subscriber"
  ON "referral_invites" ("waitlist_subscriber_id");
