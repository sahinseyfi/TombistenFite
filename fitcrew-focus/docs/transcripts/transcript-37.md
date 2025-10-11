**Ozet**
- `fitcrew-focus/src/app/feed/page.tsx#L1`, `fitcrew-focus/src/app/measurements/page.tsx#L1`, `fitcrew-focus/src/app/treats/page.tsx#L1` uzerinden mobil odakli misafir akisini fallback veri ve safe-area uyari metinleriyle hazirladim.
- `fitcrew-focus/src/lib/app-data.ts#L1`, `fitcrew-focus/src/lib/fallback-data.ts#L1` ve `fitcrew-focus/src/components/layout/notification-context.tsx#L1` ile API/fallback veri katmanini ve bildirim sayaci baglamini uygulayip alt gezinmeye aktardim.
- `.github/workflows/ci.yml#L1`, `fitcrew-focus/scripts/smoke/smoke-api.ts#L1`, `fitcrew-focus/package.json#L18` ve `fitcrew-focus/docs/ROADMAP.md#L1` sayesinde smoke testi CI'a baglandi ve yol haritasi guncellendi.

**Testler**
- `pnpm test`

**Dagitim**
- `git push origin main`
- `./scripts/vercel/deploy.sh fitcrew-focus/.env.local`

**Sonraki Adimlar**
1. Vercel kontrol panelinde prod dagitim loglarini smoke ciktisi ile karsilastirip dogrulayin.
