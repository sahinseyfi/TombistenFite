# FitCrew Focus GA Schedule

Assumption: Start 2025-10-13, GA target 2025-11-03. Critical path workload is 18 days with a 20% buffer scheduled 2025-11-01 → 2025-11-02.

```mermaid
gantt
    title FitCrew Focus GA Schedule (Target 2025-11-03)
    dateFormat  YYYY-MM-DD
    axisFormat  %m/%d
    excludes    weekends
    section Hardening
    R0 Hardening readiness          :crit, r0, 2025-10-13, 3d
    section GA Core
    Auth & account safety           :crit, r1a, after r0, 2d
    Feed & notification stability   :r1b, 2025-10-16, 4d
    SSE + push enablement           :crit, r1c, after r1a, 3d
    section Monetization & Growth
    Stripe checkout & portal        :crit, r2a, 2025-10-23, 4d
    Referral analytics dashboard    :r2b, after r2a, 2d
    Email templates rollout         :r2c, 2025-10-24, 2d
    section Integrations
    Meal plan MVP                   :crit, r3a, 2025-10-28, 4d
    Health data ingestion           :crit, r3b, after r3a, 3d
    Buffer window (20%)             :buffer, 2025-11-01, 2d
```

- R0 establishes a green build and observability foundations before feature work begins.
- R1 overlaps feed hardening with SSE rollout; QA shadows nightly regressions once SSE stabilises.
- R2 runs Stripe monetisation on the critical path while growth analytics executes in parallel once webhook processing lands.
- R3 finalises meal plans and health integrations, with the buffer reserved for perf, security, and release rehearsal leading into GA.
