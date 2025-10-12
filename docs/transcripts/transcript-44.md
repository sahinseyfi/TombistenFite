**Özet**
- `package.json:12` kök pakete `devDependencies.next` ekleyip Vercel’in framework tespiti sırasında Next.js sürümünü bulamamasını önledim; `install/build` komutları hâlâ workspace (`fitcrew-focus`) üzerinden koşturuluyor.
- `fitcrew-focus/package.json:121` `trustedDependencies` listesi oluşturarak pnpm’in Prisma ve gömülü PostgreSQL paketlerinin kurulum script’lerini engellemesini engelledim.
- `pnpm-lock.yaml:1` yeni bağımlılık değişiklikleriyle kilit dosyasını güncelledim; Next 14.2.33 ve güvenilir script bilgileri kaydedildi.

**Testler**
- pnpm install

**Sonraki Adımlar**
1. Vercel’de yeni bir deploy tetikleyip Next.js algılamasının düzeldiğini doğrula.
2. Eğer pnpm gelecekte başka script’leri engellerse ilgili paketleri `trustedDependencies` listesine ekle.
