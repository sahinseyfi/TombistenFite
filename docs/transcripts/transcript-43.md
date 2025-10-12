**Özet**
- `fitcrew-focus/package.json:102` ESLint sürümünü `^8.57.1` olarak sabitleyip `eslint-config-next@14.2.33` peer gereksinimleriyle yeniden hizaladım, Vercel build sırasında oluşan ERESOLVE çatışmasını çözdüm.
- `pnpm-lock.yaml:1` kilit dosyasını depo köküne taşıyıp `pnpm install` ile güncelleyerek monorepo iş akışının geri kalanıyla eşitledim ve pnpm kullanımını CI/Vercel tarafında zorunlu hale getirdim.

**Testler**
- pnpm install

**Sonraki Adımlar**
1. Vercel üzerinde yeni build tetikleyip bağımlılık çözümünün sorunsuz tamamlandığını teyit et.
2. Depoda pnpm dışındaki paket yönetimi komutlarının kullanılmadığından emin olmak için proje dokümantasyonunu ve CI adımlarını gözden geçir.
