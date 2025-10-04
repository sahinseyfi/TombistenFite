# Proje Yol Haritası (TombistenFite)

Bu yol haritası; mobil odaklı Next.js (App Router) + Tailwind CSS + DaisyUI arayüzü, Supabase (Auth/DB/Storage) ve Vercel üzerinde CI/CD ile üretime açılacak bir MVP’yi hedefler. Varsayılan dil Türkçe’dir.

## 0. Hazırlık (Tamamlandı)
- Ortam değişkenleri akışı: `.env.local` + script’ler (`scripts/env/*`).
- Vercel link ve deploy akışı: `make vercel:deploy`.
- GitHub Secrets ve Vercel env senkronu: `make env:github:push`, `make env:vercel:push`.
- Supabase CLI login: `make supabase:login`.

## 1. Mimari ve Temel Altyapı
- UI/Kit: Tailwind CSS + DaisyUI kurulumu, tema ve mobil-first layout.
- Dosya yapısı: `src/app/(public)`, `src/app/(auth)`, `src/app/(app)` segmentleri.
- Ortak bileşenler: alt navigasyon, üst bar, kart, form kontrolleri, modal/drawer.
- i18n: Türkçe metin anahtarı altyapısı (`locales/tr/`), basit helper.
- Hata ve boş durum ekranları (Türkçe).

## 2. Supabase Entegrasyonu
- Auth: E-posta/şifreyle kayıt/giriş, magic link (opsiyonel), oturum durumu.
- DB Şeması (örnek):
  - `profiles(id, display_name, avatar_url, created_at)`
  - Uygulamaya özel 1–2 tablo (örn. `posts`, `likes`) ve RLS politikaları.
- Storage: avatar ve görsel yükleme (isteğe bağlı).
- API Katmanı: Sunucu eylemleri (server actions) ve `@supabase/supabase-js` ile uçlar.

## 3. Özellikler (MVP)
- Giriş/Kayıt akışı (validasyon, hata mesajları Türkçe).
- Ana akış/kart listesi (ör. gönderiler, etkileşimler placeholder ile başlayıp gerçek veriyle devam).
- Profil sayfası (profil düzenleme, avatar yükleme).
- Basit bildirim/toast ve yükleme iskeletleri.

## 4. Kalite, Test ve Erişilebilirlik
- Lint/format: ESLint, Prettier ayarlarını tamamla.
- Test: Component ve server action için temel testler (≥%80 hedef değişen kodda).
- Erişilebilirlik: DaisyUI bileşenlerinde ARIA ve kontrast gözden geçirme.

## 5. CI/CD ve Sürümleme
- GitHub Actions: Lint + Build, isteğe bağlı test job’ı.
- Vercel Preview → Production onay akışı.
- Sürüm notları ve Conventional Commits.

## 6. İzleme ve Geri Bildirim
- Basit log/telemetri (opsiyonel).
- Hata raporlama (opsiyonel: Sentry veya benzeri).

---

## Backlog (Örnek İşler)
- [x] Tailwind + DaisyUI kur, tema tanımları ve tipografi.
- [x] Alt navigasyon, app layout ve kart bileşenleri.
- [x] i18n anahtar sistemi ve örnek dil dosyası (`locales/tr/common.json`).
- [x] Supabase auth: sign up/in/out ekranları ve temel durum yönetimi (RequireAuth ile yönlendirme)
- [x] DB şeması: `profiles` tablosu ve RLS politikaları (migration + push)
- [x] DB şeması migration’ları ve RLS politikaları (profiles, posts, avatars storage).
- [x] Profil sayfası (oku/güncelle) + avatar yükleme.
- [x] Akış sayfası: liste + görsel paylaşımı, boş/hata durumları.
- [ ] Lint/format + temel unit tests (UI ve server actions).
- [ ] GitHub Actions ile CI (lint/build/test) ve Vercel entegrasyonu.

## Kabul Kriterleri (MVP)
- Mobilde akıcı çalışan temel UI (ana akış + profil + auth).
- Supabase ile kalıcı kimlik doğrulama ve temel veri işlemleri.
- Production deploy (Vercel) ve dokümante kurulabilirlik.
- Türkçe arayüz ve hata mesajları.

## Notlar ve Kararlar
- Gizli bilgiler `.env.local`’da; repo’ya yazılmaz.
- Yeni metinler i18n anahtarı olarak eklenir, doğrudan string gömülmez.
- Tek PR tek konu; doküman ve değişen davranışlar güncellenir.
- Ana sayfaya mobil onboarding odaklı 'Starter Kartı' eklendi; oturum durumuna göre CTA yönlendiriliyor.
