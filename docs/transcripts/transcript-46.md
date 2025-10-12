# Transcript 46 — Vercel Linux Build Hatası Düzeltildi

**Özet**
- `fitcrew-focus/package.json` dosyasında `@embedded-postgres/windows-x64` bağımlılığını `devDependencies` listesinden kaldırarak Linux ortamında `npm install` aşamasında oluşan `EBADPLATFORM` hatasını giderdim.
- Aynı dosyada `packageManager` alanını `pnpm@10.14.0` olarak tanımlayarak Vercel'in doğru paket yöneticisini seçmesini garanti altına aldım.
- `pnpm install` ardından kilit dosyası güncellendi; yerel Next.js prod derlemesi (`pnpm build`) ve yeni Vercel production deploy'u hatasız tamamlandı.

**Komutlar / Testler**
- `pnpm install`
- `pnpm build`
- `vercel --prod --yes --cwd fitcrew-focus`

**Sonraki Adımlar**
1. Vercel proje ayarlarında `installCommand` alanının hâlihazırda `pnpm install` olduğundan emin olun; ileride paket yöneticisi değişirse tekrar kontrol edin.
2. Yerel gömülü Postgres senaryolarında Linux geliştirme ortamları için `@embedded-postgres/linux-x64` paketinin çalıştığını doğrulayın.
