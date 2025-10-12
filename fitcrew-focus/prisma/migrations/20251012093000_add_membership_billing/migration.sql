CREATE TYPE "MembershipPlan" AS ENUM ('FREE', 'PREMIUM');
CREATE TYPE "MembershipStatus" AS ENUM ('INACTIVE', 'ACTIVE', 'TRIALING', 'PAST_DUE', 'CANCELED');
CREATE TYPE "BillingProvider" AS ENUM ('UNKNOWN', 'STRIPE', 'PADDLE');

ALTER TABLE "users"
  ADD COLUMN "membership_plan" "MembershipPlan" NOT NULL DEFAULT 'FREE',
  ADD COLUMN "membership_status" "MembershipStatus" NOT NULL DEFAULT 'INACTIVE',
  ADD COLUMN "membership_renews_at" TIMESTAMP(3),
  ADD COLUMN "membership_trial_ends_at" TIMESTAMP(3);

CREATE INDEX "idx_users_membership_plan" ON "users" ("membership_plan");

CREATE TABLE "billing_customers" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "provider" "BillingProvider" NOT NULL DEFAULT 'UNKNOWN',
  "provider_customer_id" VARCHAR(191) NOT NULL,
  "subscription_id" VARCHAR(191),
  "status" "MembershipStatus" NOT NULL DEFAULT 'INACTIVE',
  "subscribed_at" TIMESTAMP(3),
  "canceled_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "billing_customers_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "billing_customers_user_id_key" ON "billing_customers" ("user_id");
CREATE INDEX "idx_billing_provider_customer" ON "billing_customers" ("provider", "provider_customer_id");

ALTER TABLE "billing_customers"
  ADD CONSTRAINT "billing_customers_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
