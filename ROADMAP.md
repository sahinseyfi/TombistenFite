# FitCrew Focus GA Roadmap

## Assumptions
- Assumption: Start date 2025-10-13 with GA target 2025-11-03 (21 calendar days including the mandated 20% buffer).
- Assumption: Team capacity equals 4 full-stack engineers, 1 dedicated QA, and 1 Delivery Lead/PM (Tech Lead double-hats as one of the engineers).
- Assumption: Stripe is the sole payment processor for GA; Paddle is deferred beyond this window.
- Assumption: We ship as a PWA only (no native iOS push); real-time relies on browser SSE plus Web Push via service worker.
- Assumption: We continue to host on Vercel + Supabase/Postgres/Redis with no new infrastructure vendors introduced during this cycle.

## Inventory
### Features Matrix
| Domain | UI Routes | API Routes | Prisma Models | Status & Notes |
| --- | --- | --- | --- | --- |
| Auth & Session | *(UI gap – no `/login` page yet)* | `/api/auth/login`, `/api/auth/register`, `/api/auth/refresh` | `User` | JWT auth operational; email verification, password reset, and brute-force defence missing. |
| Feed & Posts | `/feed` | `/api/posts`, `/api/posts/[id]`, `/api/posts/[id]/like`, `/api/posts/[id]/comments`, `/api/posts/[id]/report`, `/api/posts/[id]/ai-comment/retry` | `Post`, `Comment`, `PostLike`, `PostReport`, `CoachNote`, `CoachNotePostLink` | Mobile feed live with fallback; AI comment queue active; moderation backlog pending. |
| Follows & Search | Feed actions | `/api/users/[id]/follow`, `/api/users/[id]/followers`, `/api/users/[id]/following`, `/api/search/users` | `Follow` | Core social graph complete; no dedicated follower list UI. |
| Measurements & Insights | `/measurements`, `/insights` | `/api/measurements`, `/api/insights/progress` | `Measurement`, `CoachNoteMeasurementLink` | Trend charts render; ingestion limited to manual entries; CSV import absent. |
| Treats & Gamification | `/treats`, feed challenge widget | `/api/treats/items`, `/api/treats/items/[id]`, `/api/treats/spins`, `/api/treats/spins/[id]`, `/api/treats/eligibility`, `/api/challenges`, `/api/challenges/[id]/join`, `/api/challenges/[id]/progress` | `TreatItem`, `TreatSpin`, `Challenge`, `ChallengeTask`, `ChallengeParticipation`, `ChallengeProgress` | Treat wheel and challenge flows functional; automation for reward bonuses pending. |
| Notifications | `/notifications` + header badge | `/api/notifications`, `/api/notifications/[id]/ack`, `/api/notifications/ack-all`, `/api/ai-comments/run` | `Notification`, `AiCommentStatus` enum | Poll-based; lacks SSE/WebSocket stream, push subscription, and SLA monitoring. |
| Profile & Referrals | `/profile` | `/api/users/me`, `/api/users/[id]`, `/api/referrals` | `ReferralInvite` | Referral dashboard active with analytics; profile editing minimal. |
| Uploads & Media | Feed composer | `/api/uploads/presign` | *(Object storage only)* | Presign helper in place; quota enforcement and virus scanning missing. |
| Membership & Premium | `/premium` (empty stub) | `/api/membership` (placeholder directory) | *(No dedicated models yet)* | Monetisation not implemented; no gating or entitlements. |
| Webhooks & Growth | *(Admin UI gap)* | `/api/webhooks/waitlist` | `ReferralInvite` (waitlist fields) | Waitlist webhook operational; analytics dashboards pending. |

### Known Gaps & Debt
- Payments: `src/app/premium` and `/api/membership` are unimplemented; no Stripe checkout, portal, or webhook handling.
- Real-time: Notifications rely on polling (`fetchUnreadCount`); SSE/WebSocket transport and push notifications are absent.
- Meal Planning: No `/api/meal-plans` routes or `MealPlan` models despite roadmap requirement.
- Health Integrations: Apple HealthKit/Google Fit ingestion and sync jobs unstarted; no cron or retry orchestration.
- Anti-abuse: Email verification, password reset, and CAPTCHA/rate limits missing on `/api/auth/*`.
- Observability: Lacks OpenTelemetry instrumentation, uptime dashboards, and alerting for SLO breaches.
- Admin/Analytics: No staff console for moderation or referral analytics deep dives.
- PWA compliance: Manifest exists but offline caching, install prompts, and lighthouse score validation unverified.

## GA Scope

### Must-have (GA Blockers)
1. **Authentication & Account Safety**
   - Scope: Build `/login`, `/register`, `/forgot-password` pages; add `/api/auth/verify` + `/api/auth/resend`; enforce rate limits and device fingerprinting; add hCaptcha fallback.
   - DoD: `/api/auth/register` sends verification email, `/api/auth/login` blocks unverified accounts, `/api/auth/password-reset` flow completes, rate-limit telemetry exported to logs.
   - Acceptance tests:
     - AT1: Register user -> verification email issued -> `/api/auth/verify` marks `emailVerifiedAt` and login succeeds.
     - AT2: Three failed `/api/auth/login` attempts from one IP return 429 and emit security audit log.
2. **Social Feed Reliability**
   - Scope: Stabilise `/feed` rendering, ensure `/api/posts` + `/api/posts/[id]/comments` respect privacy, add moderation hooks, guard AI comment fallbacks, verify follow flows.
   - DoD: Authenticated users never see fallback data; post/comment latency p95 < 400ms; moderation hides reported posts within 60s.
   - Acceptance tests:
     - AT1: Authenticated post with image appears at top of `/feed` and increments `posts` count.
     - AT2: Comment creation triggers `/api/notifications` entry and increments `commentsCount` atomically.
3. **Measurements & Insights Continuity**
   - Scope: Add CSV import, validation, and backfill; ensure `/api/measurements` transactions rollback on failure; extend `/api/insights/progress` smoothing.
   - DoD: Measurement imports maintain referential integrity; charts update within 1 minute; stale cache invalidated on delete.
   - Acceptance tests:
     - AT1: CSV import via new admin action populates `Measurement` rows and charts update automatically.
     - AT2: Deleting a measurement recalculates insights with no stale values returned from `/api/insights/progress`.
4. **Notifications & Real-time Delivery**
   - Scope: Introduce `/api/notifications/stream` SSE endpoint, service-worker push, badge sync, exponential backoff, and SSE publish for treats/challenges.
   - DoD: SSE stream auto-reconnects, offline push delivers, ack sync keeps `/notifications` consistent, latency p95 < 1s.
   - Acceptance tests:
     - AT1: Like event creates SSE payload consumed by NotificationProvider and updates header badge.
     - AT2: Offline notification queued by push arrives within 60s after reconnect and marks `readAt`.
5. **Stripe Monetisation**
   - Scope: Implement `/api/membership/checkout`, `/api/membership/portal`, `/api/membership/webhook`; create `Subscription` + `Invoice` models; gate `/premium`.
   - DoD: Non-subscribers redirected to `/premium`; active subscribers flagged in `Subscription` table; webhook retries logged.
   - Acceptance tests:
     - AT1: Completing Checkout session sets `subscriptionStatus=active` and unlocks premium UI.
     - AT2: Stripe cancel webhook transitions status to `canceled` and triggers retention email within 1 hour.
6. **PWA Quality**
   - Scope: Lift Lighthouse PWA score ≥ 90, add offline shell for `/feed`, background sync for drafts, install prompt UX, push subscription management UI.
   - DoD: `manifest.webmanifest` validated, offline page caches, add-to-home prompt available, background sync flushes drafts within 30s.
   - Acceptance tests:
     - AT1: Lighthouse CLI returns ≥ 90 PWA score on staging.
     - AT2: Offline-created draft post syncs within 30s of reconnect.

### Should-have
1. **Referral Funnel Analytics**
   - DoD: `/profile` surfaces cohort charts, weekly conversion, waitlist opt-ins using Supabase SQL materialised view.
   - Acceptance tests:
     - AT1: Referral acceptance updates analytics card in <5 minutes.
     - AT2: Waitlist webhook event propagates to dashboard table.
2. **Email Templates & Lifecycle**
   - DoD: Resend templates for verification, password reset, winback, cancellation flows with localisation.
   - Acceptance tests:
     - AT1: Password reset triggers template with correct dynamic fields.
     - AT2: Subscription cancellation sends winback email with unique offer code.
3. **Admin & Moderation Console**
   - DoD: Protected `/admin` area listing `PostReport` and referral stats with audit logs.
   - Acceptance tests:
     - AT1: Marking report resolved updates `PostReport.status` and hides content.
     - AT2: Admin actions append to audit log with actor metadata.

### Could-have
1. **Community Treat Automation**
   - DoD: Scheduled job awards spins based on `ChallengeParticipation` streaks.
   - Acceptance tests:
     - AT1: Cron run inserts `TreatSpin` entries for eligible users.
     - AT2: Notifications for bonus spins issued via SSE within SLA.
2. **Advanced Insights (AI Coach)**
   - DoD: Extend `/api/insights/progress` with anomaly detection and AI note suggestions.
   - Acceptance tests:
     - AT1: Outlier measurement triggers AI note creation.
     - AT2: False positive rate <5% on validation dataset.
3. **Social Sharing**
   - DoD: Export posts to Instagram stories with signed URLs and analytics tracking.
   - Acceptance tests:
     - AT1: Share action generates signed image URL valid for 5 minutes.
     - AT2: Share click updates analytics endpoint.

## Phases & Critical Path

### Phase Overview
| Phase | Window | Dependencies | Key Deliverables | DoD Summary | Risk (RAG) | Metric Focus |
| --- | --- | --- | --- | --- | --- | --- |
| R0 – Hardening (3 days) | 2025-10-13 → 2025-10-15 | None | CI stability, env parity, smoke tests, migration dry runs | `pnpm typecheck && lint && test && build` green in CI; migrations tested on staging | Amber (config drift) | Staging error rate <0.5% |
| R1 – GA Core (7 days) | 2025-10-16 → 2025-10-22 | R0 | Auth UI, measurement import, feed resiliency, SSE MVP | Must-have items 1–4 satisfy DoD | Amber-Green (SSE complexity) | p95 TTFB <400ms; coverage ≥65% |
| R2 – Monetisation & Growth (5 days) | 2025-10-23 → 2025-10-29 | R1 auth in place | Stripe checkout/portal/webhooks, referral analytics, email templates | Must-have item 5 + Should-have 1–2 | Red (Stripe certification) | 0 failed Stripe webhooks; funnel metrics live |
| R3 – Integrations & Meal Plan (4 days) | 2025-10-30 → 2025-11-02 | R1 measurements, R2 billing signals | Meal plan MVP, HealthKit/Google Fit ingestion, anomaly alerts, PWA polish | Must-have item 6 + selected Could-have | Amber (external API latency) | Lighthouse PWA ≥90; import lag <60s |

### Critical Path Analysis
- `T1 Hardening & env parity (3d)` → `T2 Auth safety (2d)` → `T3 Stripe checkout + webhook (4d)` → `T4 Real-time SSE + push (3d)` → `T5 Meal plan data model & API (4d)` → `T6 Health data normalisation (2d)` → `Buffer (2d)`.
- Baseline workload totals 18 days; applying the mandated 20% buffer adds 3.6 days, aligning delivery to the 2025-11-03 GA target.
- Parallelism:
  - Growth analytics and referral UX (2 engineers) run alongside Stripe once auth stabilises.
  - PWA/offline polish overlaps Health integrations with QA driving regression.
  - QA executes nightly regression packs post-R0; perf and load tests run during buffer.
- Risk focus: Stripe onboarding (T3) and SSE reliability (T4) are critical path items; contingency reserves applied first to these areas.

## Real-time & PWA Decision Note
- SSE pros: trivial deployment on Vercel, automatic retry, low overhead, perfect for notification fan-out; cons: one-way transport, background limitations.
- WebSocket pros: bidirectional for future live coaching; cons: needs stateful infra or third-party broker, longer certification path.
- Decision: Ship **SSE + Web Push hybrid** for GA (Assumption).
  1. Implement `/api/notifications/stream` with heartbeat keep-alives and Redis pub/sub fan-out.
  2. Add service worker in `public/sw.js` handling Push API, storing VAPID keys in Vercel secrets, subscription UI on `/notifications`.
  3. Update NotificationProvider to consume EventSource with exponential backoff, falling back to polling after 3 failures.
  4. Publish treat/challenge events into SSE bus; reuse for anomaly alerts.
  5. Encapsulate transport in a client hook to allow WebSocket upgrade post-GA without UI churn.

## Observability & Ops Readiness
- Instrument `/api/posts`, `/api/notifications`, `/api/membership/*`, and `/api/insights/progress` with OpenTelemetry spans exporting to Supabase Logflare; propagate `x-trace-id`.
- Provision uptime monitoring (Vercel checks + supabase heartbeat) with 60s cadence; alert to shared Slack channel and SMS fallback.
- Establish daily error triage (Delivery Lead + Tech Lead) reviewing high-severity incidents; maintain blameless incident template in `docs/`.
- Track Stripe webhook success, SSE disconnect rates, AI comment queue depth via scheduled jobs surfaced in Grafana (Supabase metrics).

## RACI
| Workstream | Delivery Lead (PM) | Tech Lead | FS Engineer A/B | FS Engineer C/D | QA | Data/Analytics |
| --- | --- | --- | --- | --- | --- | --- |
| R0 Hardening | A | R | C | C | R | I |
| Auth & Security | C | A | R | C | C | I |
| Feed & Notifications | C | R | R | R | C | I |
| Stripe Monetisation | C | A | R | C | C | C |
| Growth Analytics | C | C | C | R | I | A |
| Integrations & Meal Plan | I | A | R | R | C | C |
| Observability & Release | A | R | C | C | R | I |

Legend: R = Responsible, A = Accountable, C = Consulted, I = Informed.

## Metrics
- `Lighthouse PWA score ≥ 90` (Tech Lead; verified twice weekly).
- `Vitest coverage ≥ 70%` (QA owner; enforced via CI threshold).
- `p95 TTFB < 500ms` on `/api/posts`, `/api/notifications`, `/feed` (monitored via Vercel Analytics).
- `Critical error rate ≤ 0.1 / 1k requests` (tracked through Supabase Logflare; release gate).
- `Stripe webhook success = 100% per deploy` (alert if failure >0).
- `Notification delivery success ≥ 99%` (SSE reconnect ≤ 3 attempts).
- `Health data import freshness ≤ 15 minutes` post integration go-live.
