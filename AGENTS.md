# Depo Rehberi

Bu belge, bu depoya katkı yaparken uyulacak kuralları özetler. Varsayılan ürün ve iletişim dili **Türkçe**’dir.

## Yapı ve Paket Yönetimi
- Uygulama kodu `fitcrew-focus/` altında; kökteki `package.json` ve `pnpm-workspace.yaml` Vercel/CI için monorepo kökünü işaret eder.
- Kaynak kodu: `fitcrew-focus/src/…`
- Testler: `fitcrew-focus/tests/…` (gerekirse `tests/fixtures/`)
- Dokümanlar/varlıklar: `docs/`, `assets/`
- Ortak yapılandırmalar: `.editorconfig`, `.gitignore`, `package.json`, `pnpm-workspace.yaml`

## Komutlar
Kök dizinden çalıştırılabilirler; komutlar otomatik olarak `fitcrew-focus/` modülünü kullanır.

| Komut | Açıklama |
| --- | --- |
| `pnpm install` | Bağımlılıkları kurar |
| `pnpm dev` | Geliştirme sunucusunu başlatır |
| `pnpm build` | Üretim derlemesi yapar (Next.js + Prisma) |
| `pnpm test` | Vitest paketini çalıştırır |
| `pnpm lint` | ESLint denetimi |

## Kodlama Stili
- JS/TS dosyalarında 2 boşluk; UTF-8 + LF
- `eslint` + `prettier` zorunlu
- Fonksiyonlar küçük, yan etkisiz; dış API’lerde kısa JSDoc yeterli

## Test İlkeleri
- Framework: **Vitest**
- Kapsama hedefi değişen dosya için ≥%80
- Regresyon/hata düzeltmesi için mutlaka test ekleyin
- PR öncesi `pnpm test` yeşil olmalı

## Git ve PR Kuralları
- Conventional Commits: `feat: …`, `fix(api): …`
- Her PR tek mantıklı değişiklik
- Açıklamalarda gerekçe + ekran görüntüsü/log (varsa)
- İlgili issue’ları `Fixes #id` ile bağlayın
- Davranış değişirse dokümantasyon/ROADMAP güncelleyin

## Güvenlik ve Yapılandırma
- Gizli anahtarları commit etmeyin; `.env` ve `.env.example` kullanın
- Bağımlılık lisanslarını gözden geçirin, versiyon sabitleyin

## Dil ve Yerelleştirme
- UI metinleri, loglar, hata mesajları Türkçe
- Yeni metinler `locales/` veya benzeri anahtar tabanlı yapıya eklenmeli

## Ajan Çalışma İlkeleri
- Kullanıcı manuel işlem yapmaz; gerektiğinde değişiklikleri ajan uygular
- Önce kısa plan, ardından uygulama; sadece zorunlu durumlarda onay iste
- Komutları ajan koşturur, kullanıcıdan terminal çıktısı beklenmez
- Diff’leri minimal ve odaklı tut; mevcut stile uy
- Her önemli aksiyondan sonra ilgili doküman (README, i18n, ROADMAP vs.) güncellensin
- Önemli mesajlar için `docs/transcripts/transcript-N.md` oluşturulmalı

## UI / Mobil Odak
- Tailwind CSS + DaisyUI tercih edilmeli
- Mobil öncelikli tasarım, masaüstü uyumlu genişleme
- Sistem bileşenleri: alt navigasyon, kart akışı, formlar, modal/bottom sheet
- Safe-area yardımları (`pt-safe`, `pb-safe`, `viewport-fit=cover`) zorunlu
- Mobil UX rehberi: `docs/UX_MOBILE_GUIDE.md` – yeni ekranlarda “Mobil UX Checklist” PR açıklamasına eklenmeli

## Yol Haritası & Gelişmiş Analitik
- Güncel roadmap: `docs/ROADMAP.md`
- Yeni özellik ve kararlar roadmap’e işlenmeli
- Referral analytics tamamlandı; `/api/referrals` funnel metriklerini döner, profil sayfası kartları güncel tut

## Transkriptler
- Uzun veya kritik yanıtlar `docs/transcripts/transcript-N.md` şeklinde kaydedilir (N artan tam sayı)
- Gerekirse önceki mesajlar transkript olarak eklenebilir
