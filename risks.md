# FitCrew Focus GA Risk Register

| # | Risk | Probability | Impact | RAG | Preventive Actions | Corrective Actions |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Stripe account onboarding or compliance delay | Medium | High | Amber | Submit required compliance docs on day 0; open Stripe support ticket; prepare test-mode walkthrough video | Ship GA with invite-only toggle if Stripe slips; fall back to manual invoicing for beta cohort |
| 2 | SSE connections throttled on mobile background | Medium | High | Red | Implement heartbeat and exponential backoff; utilise Push API for high-priority alerts | Switch to polling fallback and extend push coverage; consider short-term Pusher channel |
| 3 | HealthKit review rejection (background ingestion) | Medium | High | Amber | Engage Apple review guidelines early; document privacy policy updates; test with TestFlight | Gate HealthKit behind feature flag; ship Google Fit-only integration until approval |
| 4 | Meal plan data migration corrupts `Measurement` history | Low | High | Amber | Create migration dry run with snapshot backup; add foreign key constraints and tests | Rollback migration via `prisma migrate resolve`, restore snapshot, rerun after fix |
| 5 | Email deliverability drops (Resend throttling) | Medium | Medium | Amber | Warm up sending domain; monitor bounce metrics; add DMARC/SPF alignment | Failover to backup SMTP provider; trigger SMS fallback for critical emails |
| 6 | PWA offline cache invalidation bug serving stale feed | Medium | Medium | Amber | Add SW versioning, automated Lighthouse checks, and integration tests in CI | Force cache bust via service worker version increment; instruct users to refresh; hotfix release |
| 7 | Redis queue saturation from AI comment backlog | Low | High | Amber | Monitor queue depth metric; throttle AI comment requests; add alert threshold | Temporarily disable AI comment feature flag; purge backlog with worker scaling |
| 8 | QA capacity insufficient for nightly regressions | Medium | Medium | Amber | Cross-train one engineer for backup QA; automate Vitest + smoke coverage | Prioritise critical paths only; enlist Delivery Lead for manual spot checks |
| 9 | Security incident (abuse via unverified accounts) | Low | High | Red | Enforce email verification, rate limits, and hCaptcha; add audit logging | Disable new registrations; rotate secrets; run incident response playbook |
| 10 | Feed p95 latency exceeds 500ms under load | Medium | Medium | Amber | Add caching, ensure DB indexes, run k6 perf tests during buffer | Scale database temporarily; add read replicas; defer heavy analytics until after GA |
| 11 | Third-party service outage (Resend, Stripe, Supabase) | Low | High | Amber | Configure status webhooks and fallbacks; document outage procedures | Switch to backup provider or queue events until service recovers; communicate status to users |
| 12 | Analytics instrumentation drifts from product reality | Medium | Low | Green | Review metrics weekly; align dashboard definitions with PM; add automated tests | Patch data pipeline; backfill missing metrics; document variance for stakeholders |
