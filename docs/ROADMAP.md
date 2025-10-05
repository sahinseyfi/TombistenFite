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

## 7. Topluluk ve Etkileşim
- Supabase Realtime ile akış yenilemeleri ve istemci aboneliği.
- Gönderi etkileşimleri (beğen, yorumla, bildir) ve listeler.
- Profil paylaşım bağlantıları, kart önizlemeleri ve avatar yedekleri.
- Moderasyon akışı: Supabase politikalarını sıkılaştır, raporlanan içeriği izole et.

## 8. Deneyim ve Özelleştirme
- Tema geçişi: ayarlar sayfasında kalıcı tercih ve sistem temasını algılama.
- Bildirimler: toast yığınını standartlaştır, e-posta uyarıları için Supabase tetikleyicisi hazırla.
- Onboarding ilerlemesi: Starter kartını tamamlayan kullanıcıya ilerleme göstergesi ve kutlama ekle.
- Görsel yükleme: boyut optimizasyonu, CDN cache kontrolleri ve hata mesajlarını standartlaştır.

## 9. Yayına Hazırlık ve Büyüme
- Kapalı beta yayını, geri bildirim formu ve Supabase aracılığıyla geri bildirim saklama.
- PWA hazırlığı: manifest, ikon setleri, Add to Home Screen testi.
- Landing sayfası/dokümantasyonla ürün hikayesini anlat, ekran görüntüleri ekle.
- Metrikler: aktif kullanıcı, gönderi hacmi ve retention için Supabase raporlama ve dashboard taslağı.

## 10. Performans ve Ölçeklenebilirlik
- Görsel optimizasyonu: `next/image` kullanımı, uygun `sizes` ve kalite ayarları.
- ISR/SSG/SSR stratejileri: kritik sayfalar için ISR; liste sayfalarında segment bazlı revalidate.
- Vercel Edge/Cache: yönlendirmeler ve statik varlıklar için cache başlıkları.
- Postgres indeksleri ve sorgu gözden geçirme; RLS kuralları altında performans testleri.

## 11. Güvenlik ve Uygunluk
- Güvenlik başlıkları: `Content-Security-Policy`, `X-Frame-Options`, `Strict-Transport-Security`.
- Oran sınırlama (rate limiting) ve basit bot koruması (middleware tabanlı).
- Denetim kayıtları (audit log): kritik eylemler için tablo ve tetikleyici.
- Gizlilik: veri saklama politikası ve silme talebi akışı (opsiyonel).

## 12. Arama ve Keşif
- Postgres tam metin arama (TSVector/TSQuery) veya `pg_trgm` benzerlik araması.
- Filtreleme ve sıralama: tarih, popülerlik, kullanıcı takiplerine göre.
- Etiket/konu sisteminin eklenmesi ve ilgili sayfa/akışlar.

## 13. Bildirimler ve Realtime Gelişimleri
- PWA push bildirimleri (Service Worker) ve izin akışı.
- Uygulama içi bildirim “gelen kutusu” ve okundu/okunmadı durumu.
- E-posta tetikleyicileri: önemli eylemler için (opsiyonel Supabase Functions/Webhooks).

## 14. Monetizasyon ve Faturalandırma (Opsiyonel)
- Paket/plan modeli (Ücretsiz, Pro vb.) ve yetkilendirme kontrolleri.
- Stripe ile test ortamında ödeme akışı ve webhook doğrulaması.
- Fatura geçmişi ve abonelik durumu sayfası.

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
- [x] Lint/format + temel unit tests (UI ve server actions).
- [x] GitHub Actions ile CI (lint/build/test) ve Vercel entegrasyonu.
- [x] Ayarlar: tema geçişi tercihlerini Supabase profiline kaydet ve arayüzü tamamla.
- [x] Supabase Realtime aboneliğiyle akış sayfasını otomatik güncelle.
- [x] Gönderiler için beğeni ve yorum sunucu eylemleri ile mobil odaklı arayüz ekle.
- [x] PWA manifesti ve ikon setlerini tamamla, mobil kısayol testlerini belgele.
- [ ] ISR ve revalidate stratejilerini sayfa bazında yapılandır (liste/ayrıntı).
- [ ] Postgres tam metin arama + filtre/sort UI’sı.
- [ ] Güvenlik başlıkları ve oran sınırlama middleware’i.
- [ ] Basit audit log şeması ve kritik eylem kaydı.
- [ ] PWA push bildirimi ve uygulama içi bildirim gelen kutusu.
- [ ] Stripe test entegrasyonu, webhook doğrulaması ve plan yetkilendirmeleri.

## Kabul Kriterleri (MVP)
- Mobilde akıcı çalışan temel UI (ana akış + profil + auth).
- Supabase ile kalıcı kimlik doğrulama ve temel veri işlemleri.
- Production deploy (Vercel) ve dokümante kurulabilirlik.
- Türkçe arayüz ve hata mesajları.

## Kabul Kriterleri (Beta)
- Ana akışta ISR + cache ile düşük TTFB ve istikrarlı yüklenme.
- Güvenlik başlıkları aktif, temel rate limiting çalışır durumda.
- En az bir arama/filtreleme senaryosu gerçek veride hızlı sonuç verir.
- Bildirimler: uygulama içi gelen kutusu ve en az bir push senaryosu doğrulanmış.

## Kabul Kriterleri (v1)
- Ödeme (opsiyonel) akışı uçtan uca test ortamında problemsiz çalışır.
- Analitik temel olaylar kaydediliyor; ürün sağlık metrikleri izlenebilir.
- Performans bütçeleri tanımlı; kritik sayfalarda LCP/FID hedefleri sağlanır.

## Notlar ve Kararlar
- Gizli bilgiler `.env.local`’da; repo’ya yazılmaz.
- Yeni metinler i18n anahtarı olarak eklenir, doğrudan string gömülmez.
- Tek PR tek konu; doküman ve değişen davranışlar güncellenir.
- Ana sayfaya mobil onboarding odaklı 'Starter Kartı' eklendi; oturum durumuna göre CTA yönlendiriliyor.
- Tema geçişi kullanıcı profiline kaydedilecek; ayarlar ekranı bu tercih üstünden çalışacak.
- Akış gerçek zamanlı yenilemeler Supabase Realtime ile sağlanacak; çevrimdışı fallback olarak manuel yenileme korunacak.
- Ödeme ve gelişmiş analitik opsiyoneldir; gizlilik ve güvenlik başlıkları zorunlu tutulacaktır.
- Prettier + Vitest altyapısı `npm run format` ve `npm run test` komutlarıyla devreye alındı.
- GitHub Actions CI hattı (`.github/workflows/ci.yml`) lint/test/build aşamalarını çalıştırır; Vercel dağıtımı için `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` secret'larının tanımlı olması gerekir.
- Tema tercihi ThemeProvider ile Supabase profiline yazılarak cihazlar arasında senkronlanıyor.
- Akış sayfası Supabase Realtime kanalından INSERT/UPDATE/DELETE olaylarını dinleyip en fazla 20 kaydı canlı güncelliyor.
- Realtime bağlantısı hata aldığında kullanıcıya uyarı gösterilip yeniden bağlanma seçeneği sunuluyor; yeni gönderiler rozetle vurgulanıyor.
- Akış kartları beğeni/yorum sayaçları ve mobil yorum paneli ile etkileşim odaklı hale getirildi.
- PWA manifesti ve maskable ikonlar eklendi; uygulama ana ekrana eklenmek için uygun hale getirildi.
