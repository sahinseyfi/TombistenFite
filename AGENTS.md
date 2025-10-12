# Repository Guidelines

## Proje Yapısı ve Modül Organizasyonu
- Monorepo kökü bu dizindir; uygulama kodu `fitcrew-focus/` altında tutulur.
- UI, servisler ve yardımcılar `fitcrew-focus/src/…` içinde, testler `fitcrew-focus/tests/` klasöründe bulunur. Test verileri gerektiğinde `tests/fixtures/` altına eklenir.
- Paylaşılan konfigürasyon dosyaları (`package.json`, `pnpm-workspace.yaml`, `.editorconfig`) repoda kök seviyededir. Dokümantasyon `docs/`, varlıklar `assets/` klasörüne yerleştirilmelidir.

## Build, Test ve Geliştirme Komutları
- `pnpm install` → bağımlılıkları kurar (monorepo kökünden çalıştırın).
- `pnpm dev` → Next.js geliştirme sunucusunu açar; `.env.local` bekler.
- `pnpm build` → `prisma generate` + `next build` zincirini çalıştırır, CI ve Vercel bu komutu kullanır.
- `pnpm test` → Vitest senaryolarını koşar; hızlı kontroller için `pnpm test --runInBand` kullanabilirsiniz.
- `pnpm lint` ve `pnpm format` → kod kalitesi ve format için zorunlu adımlar; hata varsa düzeltmeden PR açmayın.

## Kodlama Stili ve İsimlendirme
- TypeScript dosyalarında 2 boşluk indent ve LF satır sonu kullanın. Prettier + ESLint otomatik format için yapılandırılmıştır.
- UI bileşenleri Tailwind CSS + DaisyUI desenlerine uymalı; class isimlerini mümkün olduğunca yardımcı fonksiyonlarla gruplayın (`cn`, `cva`).
- Dosya ve klasör adlarında kebab-case, TypeScript sembolleri için PascalCase (bileşenler) ve camelCase (fonksiyon/değişken) tercih edin.
- Ortak API yüzeyleri için kısa JSDoc açıklamaları ekleyin; karmaşık mantıkları kapsülleyen yardımcılar yazın.

## Test Rehberi
- Vitest varsayılan test koşucusudur; değişen dosya bazında ≥%80 kapsam hedeflenir. Yeni özellikler için mutlaka olumlu ve olumsuz senaryolar ekleyin.
- Test dosyaları `*.test.ts` uzantısı ile kaynak dosya hiyerarşisini yansıtacak biçimde konumlandırılmalıdır.
- Regresyon hatalarında önce başarısız testi yazın, ardından düzeltmeyi uygulayın.

## Commit ve Pull Request Kuralları
- Conventional Commits formatı zorunlu: `feat: …`, `fix(api): …` gibi. Tek commit mümkünse tüm değişikliği kapsamalıdır.
- PR açıklamalarında değişikliğin amacı, etkilediği ekranlar/akışlar ve varsa log veya ekran görüntülerini paylaşın. Issue bağlantısını `Fixes #id` ile ekleyin.
- Davranış değişiklikleri veya yeni metinler için ilgili dokümanları (`docs/ROADMAP.md`, i18n dosyaları vb.) güncelleyin.

## Güvenlik ve Konfigürasyon
- Gizli bilgileri hiçbir koşulda repoya eklemeyin; `.env.local` yerine `.env.example`’ı güncel tutun.
- Prisma ve veritabanı işlemleri için üretimde `DATABASE_URL`, `DIRECT_URL` değerlerini Vercel ortam değişkenleri üzerinden yönetin.
- Harici servis anahtarlarında sürüm yükseltmeden önce lisans ve kullanım koşullarını doğrulayın.
