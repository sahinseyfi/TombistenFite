# Codex Ajan Kilavuzu (Token Optimize)

Bu depo **FitCrew Focus** otomasyon ajanlari icin optimize edilmistir. Varsayilan dil **Turkce**.

## 0) Ilke ve Hedef
- **Zero-Question**: Soru sorma; varsayilanlari sec ve devam et.
- **Token Verimliligi**: Minimal cikti; gereksiz log, diff ve kod tekrari yok.
- **Gizlilik**: Secrets **asla** dosyaya/commite/loga yazilmaz; sadece CI/Vercel/GitHub Secrets.
- **Kalite Kapilari**: `pnpm typecheck && pnpm lint && pnpm test && pnpm build` yesil olmadan merge yok.

## 1) Proje Yapisi
- Uygulama koku: `fitcrew-focus/` (`APP_DIR`).
- Next.js App Router + TypeScript + Tailwind + shadcn/ui, Prisma + PostgreSQL.
- Test: Vitest. Smoke: `pnpm smoke:api` (opsiyonel).

## 2) Komutlar
- `pnpm dev` - gelistirme
- `pnpm build` - `prisma generate` + `next build`
- `pnpm typecheck` - TS denetimi
- `pnpm lint` - ESLint
- `pnpm test` - Vitest
- `pnpm prisma:migrate` / `pnpm prisma:seed` / `pnpm prisma:studio`

## 3) Calisma Akisi (Ajan)
1. Plani kisa yaz ve baslat (tek blok).
2. Dosya degisikliklerini **tek patch** ile uygula (sadece degisen dosyalar).
3. `pnpm install --frozen-lockfile` (gerekirse) -> `pnpm typecheck && pnpm lint && pnpm test && pnpm build`.
4. Ozet ve bir sonraki adimi tek paragraf yaz. Uzun log basma.

## 4) Secrets ve Ortam
- `.env.example` **placeholder** icerir, gercek deger **yok**.
- Yerel icin `.env.local` kullanicida kalir; CI/Prod icin GitHub/Vercel Secrets kullan.
- Vercel: `DATABASE_URL`, `NEXT_PUBLIC_APP_URL`, gerekiyorsa `SUPABASE_URL`, `SUPABASE_ANON_KEY`.

## 5) CI/Deploy
- GitHub Actions: quality job -> Vercel preview; `main` -> prod.
- Vercel CLI'de token'i argumanla ver; ciktiyi minimal tut, secrets maskeli kalsin.

---
