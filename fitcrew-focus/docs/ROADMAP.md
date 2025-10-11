# FitCrew Focus Roadmap

Bu yol haritasi 11.10.2025 itibariyla backend calismalarinin durumunu ozetler.

## Tamamlanan Basliklar

- **S01 - Setup:** Next.js App Router, PWA manifest, eslint/prettier/env yapilandirmalari tamamlandi.
- **S02 - Prisma:** Cekirdek modeller tanimlandi, 20251009194409_init migrasyonu ve seed senaryosu guncellendi.
- **S03 - Auth / JWT:** Auth ve kullanici uclari yayinda; JWT uretimi/dogrulamasi ve env kontrolleri aktif.
- **S04 - Upload Presign:** S3 presign yardimcilari ve MIME/limit kontrolleri hazir.
- **S05 - Posts API:** Post CRUD, scope bazli feed, begeni ve rapor uclari devrede. Erisim ve cursor senaryolari icin Vitest tabanli unit testler eklendi; hata mesajlari Turkce dilbilgisine gore revize edildi.
- **S06 - Comments API:** /posts/{id}/comments GET/POST uclari, cursor bazli sayfalama, commentsCount artisi ve serializeComment serilestiricisi tamamlandi; tests/app/api/posts/[id]/comments/route.test.ts ile erisim ve olusturma senaryolari kapsandi.
- **S07 - Follow & Explore:** POST/DELETE /users/{id}/follow, GET /users/{id}/followers, GET /users/{id}/following ve GET /search/users uclari hazirlandi; cursor bazli takibi listeleri ve arama regresyonlari tests/app/api/users/follow/route.test.ts, tests/app/api/users/followers/route.test.ts, tests/app/api/search/users/route.test.ts ile kapsandi.
- **S08 - Measurements & Analytics (API):** /measurements GET/POST uclari tamamlandi; cursor bazli listeleme, tarih filtresi ve tek transaction ile olcum ekleme destegi saglandi. serializeMeasurement eklendi ve tests/app/api/measurements/route.test.ts ile regresyon altina alindi.
- **S09 - Treats Wheel:** Kacamak item CRUD'u, eligibility servisi ve bonus/spin akislari tamamlandi. /treats/items, /treats/spins, /treats/eligibility rotalari eklendi; RNG deterministik secim, kg/kullanim kisitlari ve bonus guncelleme akisi Vitest kapsaminda dogrulandi.
- **S10 - AI Comment:** OpenAI entegrasyonu, processNextAiComment kuyugu ve cron tetige POST /api/ai-comments/run rotasi eklendi. AI cevaplari icin JSON zorlamasi, hata durumlarinda FAILED geribildirimi ve kullanici bazli yeniden deneme (POST /api/posts/{id}/ai-comment/retry) saglandi; tum akislara unit testler eklendi.
- **S11 - Rate Limit & Errors & ETag:** jsonError/jsonSuccess altyapisi standart hata govdesi, X-Trace-Id basligi ve GET yanitlari icin ETag destegi saglayacak sekilde genisletildi. Post olusturma, yorum ekleme ve Treat Wheel spin akislari Redis/LRU tabanli rate limit ile korunuyor; X-RateLimit-* ve Retry-After basliklari yayina alindi. tests/app/api/posts/route.test.ts, tests/app/api/posts/[id]/comments/route.test.ts ve tests/app/api/treats/spins/route.test.ts senaryolari yeni davranisi dogruluyor.
- **S12 - Notifications:** Bildirim API'lari (GET /api/notifications, PATCH /api/notifications/{id}/ack, POST /api/notifications/ack-all) yayina alindi. Post begenisi, yorum, takip, AI yorum hazirlama ve Treat Wheel bonuslari icin queueNotificationsForEvent fan-out servisi eklendi; okunmamis sayac Redis cache + invalidation ile desteklendi. Vitest kapsaminda yeni rotalar ve servis davranislari icin testler yazildi.
- **S13 - UI Wiring (Mobil Katman):** Next.js App Router uzerinde MobileLayout, safe-area (pt-safe/pb-safe/px-safe) yardimcilari ve NotificationProvider baglanti katmani olusturuldu. feed, measurements, treats, notifications ve profile sayfalari DaisyUI/Tailwind bilesenleriyle mobil oncelikli sekilde hazirlandi; API erisimleri icin apiFetch yardimcisi ve fallback-data senaryolari eklendi. Bildirim rozeti Header ve BottomTabBar uzerinde paylasilan durum ile guncelleniyor; tests/lib/app-data.test.ts ve tests/components/notification-context.test.tsx ile yeni baglanti katmani regresyon altina alindi.
- **S14 - ENV & Docs & Smoke Tests:** .env.example dosyasi zorunlu/opsiyonel anahtar aciklamalari ve ornek degerlerle guncellendi; README ve docs/TROUBLESHOOTING.md gelistirilerek make/pnpm akislari, mobil kurulum ve sorun giderme rehberi derlendi. scripts/smoke/smoke-api.ts ile pnpm smoke:api komutu eklendi ve CI surecine dahil edildi; Makefile ve Github Actions pipeline'i yeni smoke adimini calistiracak sekilde revize edildi.

## Siradaki Oncelikler

- **S15 - Progress Insights & Coach Panel:** Olcum trendleri, gorev ilerlemeleri ve koc geri bildirimlerini birlestirecek analitik paneli hayata gecir.
  - /api/insights/progress ucu ile haftalik/aylik trend serileri (kilo, olcum, treat kullanimi) saglanacak.
  - Coach modulu icin CoachNote modeli ve post/olcum baglanti tablolari tanimlanacak; AI comment kuyrugu ile entegrasyon degerlendirilecek.
  - Mobilde grafik bilesenleri icin victory-native veya hafif bir chart kitapligi test edilerek karar verilecek; safe-area ve DaisyUI temasina uygun kartlar hazirlanacak.

## Teknik Notlar

- Test ortaminda path alias kullanimi icin vitest.config.ts eklendi.
- Posts, Comments, Follow/Search ve Measurements API'lari icin tests/server/posts/utils.test.ts, tests/app/api/posts/route.test.ts, tests/app/api/posts/[id]/comments/route.test.ts, tests/app/api/users/follow/route.test.ts, tests/app/api/users/followers/route.test.ts, tests/app/api/search/users/route.test.ts ve tests/app/api/measurements/route.test.ts ile temel erisim/sayfalama regresyonlari kapsaniyor. Begeni, rapor, kesfet ve yorum yonetimi icin ek senaryolar backlog'da tutulmali.
- Rate limit kararlarini kapsayan testler tests/app/api/posts/[id]/comments/route.test.ts ve tests/app/api/treats/spins/route.test.ts uzerinden izlenebilir; 304 yanitlarinda ETag davranisi tests/app/api/posts/route.test.ts ve tests/app/api/treats/spins/route.test.ts ile onaylaniyor.

## Orta Vadeli Basliklar

- **S16 - Challenges & Routine Gamification:** Haftalik meydan okuma ve rutin takip akislariyla motivasyon artirilacak.
  - Challenge tarifleri, katilim kaydi ve ilerleme takibi icin Prisma modelleri + REST uclari (/api/challenges) olusturulacak.
  - Treat Wheel ve bildirim sistemi ile entegre rozet/kredi odulleri kurgulanacak.
  - Mobil UI'da Tasks, Streak ve haftalik ilerleme kartlari BottomNav altina yerlesecek.
- **S17 - Growth & Monetization:** Growth denemeleri ve premium paket icin temel altyapi.
  - Arkadas davet/referral akisi (/api/referrals) ve bekleme listesi e-posta entegrasyonu planlanacak.
  - Stripe veya Paddle benzeri odeme saglayici secilecek; BillingCustomer modeli ve webhook dinleyicileri icin backlog olusacak.
  - Paywall ekranlari, izinli ozellikler ve premium metric raporlamasi S13 UI katmani ile senkron ilerleyecek.

## Uzun Vadeli Basliklar

- **S18 - Nutrition & Meal Plans:** Beslenme hedefleri ve yemek planlama akislari ile icerik genisletilecek.
  - MealPlan, MealEntry ve makro hedefleri icin Prisma modelleri tanimlanacak; API katmaninda GET/POST /api/meal-plans uclari planlanacak.
  - Kalori/makro hesaplamalari olcum verisi ile baglanarak haftalik raporlar olusturulacak; coach paneli icin beslenme yorumlari backlog'a alinacak.
  - Mobil arayuzde yemek plan kartlari, bildirimli hatirlatmalar ve plan sapma bildirimleri DaisyUI bilesenleri ile prototiplenecek.
- **S19 - Integrations & Automations:** Dis veri kaynaklari ve otomasyon akislari birlestirilecek.
  - Apple HealthKit / Google Fit baglanti servisleri icin OAuth flow'lari ve veri cekme job'lari tanimlanacak.
  - Webhook tuketimi icin syncExternalMeasurement kuyugu ve tekrar deneme stratejileri belirlenecek; cron tetikleyicileri scripts/scheduled/ altinda gruplanacak.
  - Veri importu sonrasi anomaly detection ve kullanici bildirimleri icin Vitest + Playwright senaryolari eklenerek regresyon surece dahil edilecek.
- **S20 - Observability & Compliance:** Sistem sagligi ve veri guvenligi cercevesi olgunlastirilacak.
  - OpenTelemetry tabanli tracing/logging, Redis/Postgres metrik panelleri ve uyarilar icin Grafana dashboard'lari olusturulacak.
  - Kisisel veri saklama sureleri, silme istekleri ve audit log gereksinimleri icin data-retention dokumani ve yonetim scriptleri hazirlanacak.
  - SOC2/GDPR kontrol listeleri, acik kaynak kitaplik lisans taramalari ve incident response rehberi docs/security/ altinda derlenecek.

## Onerilen Hemen Sonraki Is

1. S15 kapsaminda `/api/insights/progress` icin Prisma model taslagini hazirla ve olcum/treat baglantilarini krokilendir.
2. CoachNote icin API tasarimini (CRUD + bildirim entegrasyonu) netlestir ve gerekecek migrasyon adimlarini planla.
3. Mobil coach paneli icin chart kitapligi seceneklerini (victory-native vs. recharts) karsilastir, UX Mobile Guide ile uyumlu mock hazirla.

