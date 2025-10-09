**S01 Setup**
- Next.js App Router kurulumu: Vite girişini kaldırdım, src/app/layout.tsx:1 ve src/app/page.tsx:1 ile mobil PWA iskeletini oluşturdum; eski sayfaları ileride uyarlamak üzere src/legacy_pages altına taşıdım.
- Tooling ve paketler: package.json:1 içinde pnpm komutları, Prisma/Next bağımlılıkları ve Prettier/Eslint yapılandırmaları; yeni slint.config.mjs:1, prettier.config.mjs:1 ve postcss.config.js:1 ile lint/format akışı Next uyumlu hale geldi.
- PWA & varlıklar: public/manifest.webmanifest:1 ile manifest, public/icons/icon-192x192.png/icon-512x512.png ikonları ve safe area yardımcıları src/app/globals.css:1 hazır.
- Ortam dosyaları: .env.example:1 temel değişkenleri sağlıyor, .gitignore:1 ve Prettier/Tailwind ayarları pnpm çıktıları için güncellendi.
- Eksik rehber: talimatta atıf yapılan docs/UX_MOBILE_GUIDE.md repoda yok; UI aşamasında kullanıcı doğrulaması gerekecek.

Testler: pnpm typecheck, pnpm build

Durum & Sonraki Adım: S01 tamam, sırada S02’de Prisma şema ve migrasyonlarını kuracağım.
