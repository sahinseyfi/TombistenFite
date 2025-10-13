# FitCrew Focus Release Checklist

## Test Matrix
| Layer | Scope | Owner | Tooling | Cadence |
| --- | --- | --- | --- | --- |
| API | `/api/auth`, `/api/posts`, `/api/measurements`, `/api/notifications`, `/api/membership`, `/api/meal-plans` | FS Engineer B + QA | Vitest + supertest + k6 smoke | Per commit + nightly perf |
| UI | `/feed`, `/measurements`, `/insights`, `/treats`, `/notifications`, `/profile`, `/premium`, `/meal-plans` | QA | Playwright (mobile viewport) | Per release candidate |
| E2E | Auth signup/verify/login, post/comment, stripe checkout, SSE badge updates | QA + FS Engineer C | Playwright + Stripe CLI mocks | Pre-RC + GA dress rehearsal |
| Performance | p95 latency on `/api/posts`, `/api/notifications/stream`, `/api/membership/webhook` | Tech Lead | k6, Vercel Analytics | R1 exit + buffer window |
| Security | Auth rate limits, password reset abuse, webhook signature validation | Tech Lead + PM | OWASP ZAP, Stripe CLI, custom scripts | R0 exit + pre-GA |

## Release Stages
### Beta Entry Criteria
- [ ] R0 sign-off: `pnpm typecheck && pnpm lint && pnpm test && pnpm build` green in CI.
- [ ] Stripe test-mode checkout validated end-to-end.
- [ ] SSE stream functional in staging with reconnect telemetry.
- [ ] Error rate <0.5% over 24h in staging.

### Release Candidate (RC) Entry Criteria
- [ ] All Must-have DoD items verified in staging.
- [ ] Vitest coverage ≥70%; Playwright suite green twice consecutively.
- [ ] Performance run confirms p95 TTFB <500ms for `/feed` and `/api/posts`.
- [ ] Security review complete (auth, webhooks, PII audit).

### GA Go/No-Go Checklist
- [ ] GA briefing delivered to support + stakeholders.
- [ ] Stripe live-mode credentials validated; last webhook success timestamp <5m.
- [ ] SSE + Push telemetry reports ≥99% delivery; fallback polling disabled.
- [ ] Release notes + migration docs published; risk register reviewed.
- [ ] Rollback plan rehearsed during buffer window.

## Rollback Plan
- Snapshot production database and Redis before deploy.
- Retain previous Vercel build ready for instant revert.
- Feature flag new meal plan, SSE, and monetisation flows for rapid disable.
- Disable Stripe webhooks during rollback to prevent duplicate billing; reconcile invoices manually.
- Communicate status to stakeholders with timeline and next steps.

## Data Migration Rollback
- Store `prisma migrate status` output and SQL migration files for R2/R3 features.
- In rollback, run `prisma migrate resolve --rolled-back <migration>` then restore DB snapshot.
- Re-run automated migration tests after fix before reattempting deploy.

## Observability & Alerting
- Dashboards: Stripe webhook success, SSE disconnect rate, error budget burn-down, health import lag.
- Alerts: Pager duty (Slack + SMS) for SLO breach, webhook retry exhaustion, SSE disconnect >3 attempts, health job lag >15m.
- Incident response: follow docs/incident-template.md; Delivery Lead leads comms, Tech Lead leads mitigation.

## Release Artifacts
- [ ] ROADMAP.md tagged in release notes.
- [ ] issues.csv imported to GitHub Projects.
- [ ] schedule.md and risks.md shared with leadership.
- [ ] release-checklist.md reviewed and signed off by Delivery Lead + Tech Lead.
