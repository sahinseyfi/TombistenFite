# TombistenFite · FitCrew Focus Uygulaması

Bu depo, Lovable üzerinden oluşturulan **FitCrew Focus** Next.js (App Router) + Prisma backend uygulamasının kaynak kodunu ve yardımcı otomasyon komutlarını barındırır. Varsayılan dil Türkçe'dir ve mobil öncelikli UX, `docs/UX_MOBILE_GUIDE.md` kılavuzuna göre ilerletilir.

## Hızlı Başlangıç

1. Ortam değişkenleri
   - `fitcrew-focus/.env.local` dosyasını `fitcrew-focus/.env.example` dosyasını referans alarak oluşturun.
   - Var olan Supabase projenizin servis rolü Postgres bağlantısını `DATABASE_URL` / `DIRECT_URL` alanlarında kullanın.
   - `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` değerlerini mevcut Vercel projesinden; `SUPABASE_ACCESS_TOKEN` değerini Supabase hesabınızdan alın.
   - Gizli anahtarları commit etmeyin; dosya `.gitignore` içinde yok sayılır.

2. Bağımlılık kurulumu
   - `make setup` (veya manuel olarak `pnpm install --dir fitcrew-focus`).

3. Geliştirme ve doğrulama
   - `make dev` → `pnpm dev` (Next.js local)
   - `make lint` → `pnpm lint`
   - `make typecheck` → `pnpm typecheck`
   - `make test` → `pnpm test` (Vitest)
   - `make format` → `pnpm format`

4. Dağıtım / otomasyon
   - `make vercel:deploy` → Vercel production deploy (`.vercel/project.json` kök dizinde). Mevcut TombistenFite projesi linklidir; deploy öncesi `fitcrew-focus/.env.local` içindeki Vercel token'ı doğrulayın.
   - `make env:vercel:push` → `.env.local` içeriğini Vercel envlerine senkronize eder.
   - `make env:github:push` → GitHub secrets senkronizasyonu (GitHub CLI gerektirir).
   - `make supabase:login` → Supabase CLI ile oturum açma, diğer Supabase yardımcıları için ön koşul.

## Proje Yapısı

- `fitcrew-focus/` → Lovable tarafından üretilen Next.js + Prisma tam yığın uygulama.
- `docs/` → Yol haritası, mobil UX kılavuzu ve transkriptler.
- `scripts/` → Vercel/GitHub/Supabase otomasyon komutları (env dosyasını `fitcrew-focus/.env.local` varsayar).
- `supabase/` → CLI yapılandırması ve ek araçlar.

> Not: Önceki `webapp/` tabanlı arayüz kaldırıldı; artık tüm geliştirme `fitcrew-focus/` dizini üzerinden yürütülür.

## Güvenlik ve İyileştirme Notları

- Supabase ve S3/Storage kimlik bilgilerini `.env.local` içinde tutun, paylaşımla veya commit ile dışarı taşımayın.
- Supabase Postgres şemasını güncellemek için `pnpm --dir fitcrew-focus prisma:migrate deploy` komutunu çalıştırın (önce veritabanı yedeği almayı unutmayın).
- Komut dosyaları, hassas değerleri stdout'a yazmadan stdin ile ilgili servislere aktarır.
- Prisma migration’larını çalıştırmadan önce `.env.local` içindeki veritabanı bağlantı ayarlarını güncellediğinizden emin olun.
- Mobil UX gereklilikleri için `docs/UX_MOBILE_GUIDE.md` ve `docs/ROADMAP.md` dosyalarındaki maddeler bağlayıcıdır.

## CI / CD

- `.github/workflows/ci.yml` lint + build adımlarını çalıştırır; `pnpm` kullanımı varsayılır.
- Vercel dağıtımı için gerekli secret'lar: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.
- Supabase entegrasyonları için CLI oturumunuzun güncel olduğundan emin olun (`make supabase:login`).

## Destekleyici Kaynaklar

- Mobil UX yönergeleri: `docs/UX_MOBILE_GUIDE.md`
- Yol haritası: `docs/ROADMAP.md`
- Ajan çalışma kuralları: `AGENTS.md`
