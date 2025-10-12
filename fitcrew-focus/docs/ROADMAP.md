# FitCrew Focus Roadmap

Bu yol haritasi 12.10.2025 itibariyla backend calismalarinin durumunu ozetler.

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
- **S15 - Progress Insights & Coach Panel:** CoachNote modeli, post/olcum baglantilari ve fallback seed senaryosu eklendi. /api/insights/progress ucu haftalik/aylik trend serilerini, Treat Wheel istatistiklerini ve ko\u00E7 notu \u00F6zetlerini JSON olarak d\u00F6nd\u00FCr\u00FCho; serializeCoachNote ile mobil katmana uygun veri saglandi. Mobilde yeni \u0130lerleme ekran\u0131 Recharts tabanl\u0131 kartlarla kilo/bel grafigi ve Treat Wheel aktivitesini g\u00F6steriyor, ko\u00E7 notlar\u0131 DaisyUI kartlar\u0131nda listeleniyor. tests/server/insights/progress.test.ts ve tests/app/api/insights/progress/route.test.ts ile regresyon kapsam\u0131 genisletildi; BottomTabBar \u0130lerleme sekmesine guncellendi.
- **S16 - Challenges & Routine Gamification:** Challenge/Task/Participation/Progress modelleri tanimlandi, seed senaryosuna haftalik yuruyus ornegi eklendi. `/api/challenges` GET ucu aktif challenge listesini dondururken, `/api/challenges/{id}/join` ve `/api/challenges/{id}/progress` katilim ve ilerleme kaydini sagliyor. serializeChallenge ile mobil katmanda streak, kalan adim ve odul durumu gosteriliyor; Feed sayfasina ChallengeCard bileseni eklenerek katilim/ilerleme butonlari API'lerle entegre edildi. tests/server/challenges/service.test.ts, tests/app/api/challenges/route.test.ts ve tests/lib/app-data.test.ts yeni akislari dogruluyor.
- **S17 - Growth & Monetization (Referral v1):** ReferralStatus enumu ve ReferralInvite modeli eklendi; kullanici bazli referralCode olusturma, seed davetleri ve fallback verisi saglandi. `/api/referrals` GET/POST akislari davet kodu, istatistik ve davet listesini sunuyor; fetchReferrals fonksiyonu ile tests/app/api/referrals/route.test.ts ve tests/lib/app-data.test.ts yeni davranisi dogruluyor.
- **S17 - Growth & Monetization (Transactional Email & Waitlist):** Resend tabanli davet e-postalari otomasyona alindi, gonderim takibi icin ReferralInvite tablosuna yeni alanlar eklendi. Waitlist opt-in talepleri Resend audience API'si ile kaydediliyor, `POST /api/webhooks/waitlist` imza dogrulamali olarak bekleme listesi olaylarini Prisma uzerinden guncelliyor; yeni Vitest senaryolari bu akislari kapsiyor.
- **S17 - Growth & Monetization (Referral Analytics):** Davet paneli kabul/bekleme/Waitlist kirilimlari ile haftalik gonderim ve kabul sayilarini gosteriyor;  `/api/referrals` yanitina analytics alanini ekledik ve profil sayfasina yeni metrik kartlari yerlestirildi. tests/app/api/referrals/route.test.ts ile tests/lib/app-data.test.ts guncellendi. 

- **S17 - Growth & Monetization:** Growth denemeleri ve topluluk genislemesini destekleyecek altyapi.
  - Stripe veya Paddle benzeri odeme saglayici secilecek; faturalandirma PoC'i backlog'da.
  - Referral funnel performansini ve bekleme listesi donusumlerini izlemek icin raporlama modeli tasarlanacak.
  - Challenges -> Treat Wheel bonus entegrasyonu icin otomasyon ve bildirim kurallari backlog'a alinacak.
## Teknik Notlar

- Test ortaminda path alias kullanimi icin vitest.config.ts eklendi.
- Posts, Comments, Follow/Search ve Measurements API'lari icin tests/server/posts/utils.test.ts, tests/app/api/posts/route.test.ts, tests/app/api/posts/[id]/comments/route.test.ts, tests/app/api/users/follow/route.test.ts, tests/app/api/users/followers/route.test.ts, tests/app/api/search/users/route.test.ts ve tests/app/api/measurements/route.test.ts ile temel erisim/sayfalama regresyonlari kapsaniyor. Begeni, rapor, kesfet ve yorum yonetimi icin ek senaryolar backlog'da tutulmali.
- Rate limit kararlarini kapsayan testler tests/app/api/posts/[id]/comments/route.test.ts ve tests/app/api/treats/spins/route.test.ts uzerinden izlenebilir; 304 yanitlarinda ETag davranisi tests/app/api/posts/route.test.ts ve tests/app/api/treats/spins/route.test.ts ile onaylaniyor.

## Orta Vadeli Basliklar

- **S18 - Nutrition & Meal Plans:** Beslenme hedefleri ve yemek planlama akislari ile icerik genisletilecek.
  - MealPlan, MealEntry ve makro hedefleri icin Prisma modelleri tanimlanacak; API katmaninda GET/POST /api/meal-plans uclari planlanacak.
  - Kalori/makro hesaplamalari olcum verisi ile baglanarak haftalik raporlar olusturulacak; coach paneli icin beslenme yorumlari backlog'a alinacak.
  - Mobil arayuzde yemek plan kartlari, bildirimli hatirlatmalar ve plan sapma bildirimleri DaisyUI bilesenleri ile prototiplenecek.
- **S19 - Integrations & Automations:** Dis veri kaynaklari ve otomasyon akislari birlestirilecek.
  - Apple HealthKit / Google Fit baglanti servisleri icin OAuth flow'lari ve veri cekme job'lari tanimlanacak.
  - Webhook tuketimi icin syncExternalMeasurement kuyugu ve tekrar deneme stratejileri belirlenecek; cron tetikleyicileri scripts/scheduled/ altinda gruplanacak.
  - Veri importu sonrasi anomaly detection ve kullanici bildirimleri icin Vitest + Playwright senaryolari eklenerek regresyon surece dahil edilecek.

## Uzun Vadeli Basliklar

- **S20 - Observability & Compliance:** Sistem sagligi ve veri guvenligi cercevesi olgunlastirilacak.
  - OpenTelemetry tabanli tracing/logging, Redis/Postgres metrik panelleri ve uyarilar icin Grafana dashboard'lari olusturulacak.
  - Kisisel veri saklama sureleri, silme istekleri ve audit log gereksinimleri icin data-retention dokumani ve yonetim scriptleri hazirlanacak.
  - SOC2/GDPR kontrol listeleri, acik kaynak kitaplik lisans taramalari ve incident response rehberi docs/security/ altinda derlenecek.
1. Stripe veya Paddle PoC'ini hazirlayarak subscription lifecycle (checkout, webhook, iptal) gereksinimlerini kesinlestirin.

1. Stripe veya Paddle PoC'ini hazirlayarak subscription lifecycle (checkout, webhook, iptal) gereksinimlerini kesinlestirin.
2. Referral funnel ve waitlist metriklerini dashboard'a tasimak icin veri modeli ve entegrasyon adimlarini tasarlayin.
3. Challenges -> Treat Wheel bonus otomasyonunun kurallarini ve bildirim senaryolarini backlog'a alin.






