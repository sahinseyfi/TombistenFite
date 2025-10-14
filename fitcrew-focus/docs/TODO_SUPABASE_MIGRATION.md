# Supabase Transition TODO

## Environment & Access
- [x] Update `fitcrew-focus/.env.local` with Supabase connection strings (`DATABASE_URL`, `DIRECT_URL`, `SUPABASE_ACCESS_TOKEN`) copied from the project dashboard.
- [x] Run `scripts/env/supabase_login.sh` to authenticate the Supabase CLI with the local token.
- [x] Authenticate the Vercel CLI with `vercel login --token $VERCEL_TOKEN` ve `vercel env pull .env.vercel`.
- [ ] Configure Vercel/GitHub secrets (`DATABASE_URL`, `DIRECT_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) so CI and deployments read from Supabase.

## Schema & Data Migration
- [ ] Point Prisma to Supabase by exporting `DATABASE_URL` and `DIRECT_URL`, then execute `pnpm prisma:migrate deploy`.
- [ ] Regenerate the client via `pnpm prisma:generate` (implicit in `pnpm build`) and verify `supabase/migrations` parity.
- [ ] Seed initial fixtures against Supabase with `pnpm prisma:seed`, ensuring idempotent inserts.

## Application Layer Updates
- [x] Remove legacy mock data modules (`src/services/mockData.ts`) and React legacy screens powered by them (`src/legacy_pages/**`).
- [x] Drop `src/lib/fallback-data.ts` usage; surface Supabase responses directly with auth/unavailable UI states across feed, treats, insights, measurements, notifications ve profil ekranları.
- [ ] Wire public unauthenticated loaders (feed, treats, referrals) to Supabase-resident API responses so that fallback checks become defensive only.
- [ ] Introduce a shared Supabase service (REST or RPC) for client-side needs (e.g., waitlist landing), reusing the existing Prisma session for server actions.
- [ ] Promote the new `/api/profile` endpoint to Supabase Edge Functions if direct database access becomes constrained.

## Verification
- [ ] Run `pnpm typecheck && pnpm lint && pnpm test && pnpm build` against the Supabase database.
- [ ] Execute `pnpm smoke:api` while connected to Supabase to ensure endpoints respect the new datasource.
- [ ] Back up Supabase before production rollout and document restore steps in `docs/TROUBLESHOOTING.md`.

## Follow-ups
- [ ] Audit CI workflows to ensure Supabase migrations run automatically before tests.
- [ ] Update product documentation (README, PLAN_STATUS) with Supabase-first guidance once the migration is complete.
