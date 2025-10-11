- Git: `feat(api): bildirim ve treat akislarini yayina al` commit'i `main` dalina push edildi (`e81a6cdf`).
- Test: `fitcrew-focus/` dizininde `pnpm test` yesil tamamlandi.
- Deploy: `vercel --prod --cwd fitcrew-focus --yes` calisti; build `fitcrew-focus/src/components/layout/BottomTabBar.tsx:1` dosyasindaki `\"` kullanimi nedeniyle TypeScript `"Invalid character"` hatasinda durdu. Vercel logu deploymenti hatali kaydetti (Inspect: https://vercel.com/sahin-seyfis-projects/fitcrew-focus/CsL5gPrmw6Ya1tBw7YCT3zkyy1Ci).

Onerilen adimlar:
1. `BottomTabBar.tsx` dosyasindaki kacmis tirnaklari duzeltip ayni sorun icin diger dosyalari tarayin (`rg '\\\"'`).
2. Duzeltme sonrasi `pnpm build` ve `vercel --prod --cwd fitcrew-focus --yes` komutlarini yeniden calistirin.
