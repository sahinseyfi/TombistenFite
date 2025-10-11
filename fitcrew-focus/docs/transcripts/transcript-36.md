**Changes**
- `fitcrew-focus/.env.example:1` dosyasini zorunlu/opsiyonel anahtar aciklamalari, varsayilanlar ve hizli komut rehberiyle yeniden duzenledim.
- `fitcrew-focus/README.md:1` ve `fitcrew-focus/docs/TROUBLESHOOTING.md:1` icin mobil odakli kurulum/sorun giderme dokumantasyonunu ekledim.
- `fitcrew-focus/scripts/smoke/smoke-api.ts:1`, `fitcrew-focus/package.json:18`, `Makefile:32` ve `.github/workflows/ci.yml:1` uzerinden pnpm smoke:api betigini, Makefile hedefini ve GitHub Actions smoke adimini yayinladim.
- `fitcrew-focus/docs/ROADMAP.md:20` ile `fitcrew-focus/docs/PLAN_STATUS.md:1` dokumanlarini S14 tamamlandi bilgisi ve S15 odak maddeleriyle esitledim.

**Tests**
- `pnpm test --run --passWithNoTests`
- `pnpm lint` (Next.js ESLint kurulum istemi nedeniyle interaktif olarak durdu; mevcut sorunun otesine gecilmedi)

**Next Steps**
1. `pnpm lint` komutunun sorunsuz calismasi icin Next.js ESLint ayarlamasini tamamlayin veya lint scriptini guncelleyin.
2. S15 kapsaminda `/api/insights/progress` semasini ve CoachNote migrasyon taslagini hazirlayarak gelistirmenin ilk turunu planlayin.
