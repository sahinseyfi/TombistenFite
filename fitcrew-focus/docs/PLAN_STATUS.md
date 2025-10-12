# FitCrew Focus Plan Durumu

Bu dokuman, tek oturumluk calisma planindaki adimlarin mevcut durumunu ozetler ve siradaki isleri listeler.

## Tamamlanan Adimlar

- **S01 - Setup**  
  Next.js App Router kuruldu, PWA manifest ve ikonlar eklendi, temel tooling (eslint/prettier/env) guncellendi.

- **S02 - Prisma**  
  Kullanici, post, yorum, takip, olcum, treat ve bildirim modelleri tanimlandi; `20251009194409_init` migrasyonu olusturuldu; seed senaryosu temel verilerle guncellendi.

- **S03 - Auth / JWT**  
  `/auth/register`, `/auth/login`, `/auth/refresh`, `/users/me`, `/users/[id]` uclari tamamlandi; JWT uretimi ve dogrulanmasi icin yardimcilar eklendi; `env` dogrulamasi yapilandirildi.

- **S04 - Upload Presign**  
  `/uploads/presign` endpoint'i MIME/boyut/cozunurluk kontrolleri ile hazirlandi; S3 presign yardimcilari eklendi.

- **S05 - Posts API**  
  `/posts` scope akislari, tek transaction ile olcum yazimi ve `GET/PATCH/DELETE /posts/[id]`, `POST /posts/[id]/like`, `POST /posts/[id]/report` uclari tamamlandi. Erisim kontrolleri ve cursor sayfalama icin unit testleri (`tests/server/posts/utils.test.ts`, `tests/app/api/posts/route.test.ts`) eklendi; hata mesajlari Turkce dilbilgisine uygun hale getirildi; `vitest.config.ts` ile test ortaminda alias destegi saglandi.

- **S06 - Comments API**  
  `/posts/{id}/comments` GET/POST uclari saglandi; cursor bazli sayfalama, `ensurePostAccess` ile yetki kontrolu ve yorum olustururken `commentsCount` artisi tek transaction icinde tamamlandi. `serializeComment` serilestiricisi eklendi ve `tests/app/api/posts/[id]/comments/route.test.ts` ile erisim, cursor ve olusturma senaryolari kapsandi.

- **S07 - Follow & Explore**  
  `POST/DELETE /users/{id}/follow` ile takip et/birak akislari saglandi; `GET /users/{id}/followers` ve `/following` uclari cursor bazli liste sagliyor; `GET /search/users` basit arama destegi sunuyor. Yeni rotalar `tests/app/api/users/follow/route.test.ts`, `tests/app/api/users/followers/route.test.ts` ve `tests/app/api/search/users/route.test.ts` ile regresyon kapsaminda.

- **S08 - Measurements & Analytics (API cebi)**  
  `/measurements` GET/POST uclari tamamlandi; cursor bazli listeleme, tarih araligi filtresi ve tek transaction ile olcum ekleme saglandi. `serializeMeasurement` serilestiricisi eklendi, `tests/app/api/measurements/route.test.ts` ile yetki, cursor ve olusturma senaryolari dogrulandi.

- **S09 - Treats Wheel**  
  `/treats/items`, `/treats/spins` ve `/treats/eligibility` rotalari yayinda. Treat item CRUD'u, eligibility servisi (`computeEligibility`), bonus RNG dagilimlari ve bonus tamamlama akislari tamamlandi. Yeni kod yolu `tests/server/treats/eligibility.test.ts` ve `tests/app/api/treats/**/*.test.ts` ile regresyon altinda.

- **S10 - AI Comment**  
  OpenAI entegrasyonu, `processNextAiComment` kuyrugu ve cron tetikleyicisi (`POST /api/ai-comments/run`) devreye alindi. Kullanicilar icin yeniden deneme (`POST /api/posts/{id}/ai-comment/retry`) akisi ve basarisizlik durumlarinda ayrintili hata mesajlari saglandi; `tests/server/ai/comments.test.ts`, `tests/app/api/ai-comments/run/route.test.ts` ve `tests/app/api/posts/[id]/ai-comment/retry/route.test.ts` ile regresyon guvence altina alindi.

- **S11 - Rate Limit & Errors & ETag**  
  `jsonError`/`jsonSuccess` altyapisi standart hata govdesi, `X-Trace-Id` basligi ve GET yanitlari icin `ETag` destegi saglayacak sekilde genisletildi. Post olusturma, yorum ekleme ve Treat Wheel spin akislari Redis/LRU tabanli rate limit ile korunuyor; `X-RateLimit-*` ve `Retry-After` basliklari yayina alindi. `tests/app/api/posts/route.test.ts`, `tests/app/api/posts/[id]/comments/route.test.ts` ve `tests/app/api/treats/spins/route.test.ts` senaryolari yeni davranisi dogruluyor.

- **S12 - Notifications**  
  `GET /api/notifications`, `PATCH /api/notifications/{id}/ack` ve `POST /api/notifications/ack-all` uclari yayina alindi. `queueNotificationsForEvent` servisi post begenileri, yorumlar, takipler, AI yorum hazirlanmasi ve Treat Wheel bonuslari icin bildirim fan-out sagliyor; okunmamis sayac Redis cache + invalidation ile guncelleniyor. Yeni rotalar ve servis davranislari `tests/app/api/notifications/**/*.test.ts` ve `tests/server/notifications/index.test.ts` ile kapsama alindi.

- **S13 - UI Wiring (Mobil Katman)**  
  MobileLayout, safe-area yardimci siniflari ve NotificationProvider baglanti katmani tamamlandi; feed, measurements, treats, notifications ve profile sayfalari DaisyUI/Tailwind ile mobil oncelikli hale getirildi. Bildirim rozetleri paylasilan context ile guncelleniyor ve tests/lib/app-data.test.ts ile tests/components/notification-context.test.tsx regresyon sagliyor.

- **S14 - ENV & Docs & Smoke Tests**  
  .env.example zorunlu/opsiyonel anahtar aciklamalari ve ornek degerlerle guncellendi, README ile docs/TROUBLESHOOTING.md yeniden yazilarak make/pnpm akislari dokumante edildi. scripts/smoke/smoke-api.ts betigi ve pnpm smoke:api komutu olusturuldu; Makefile ile GitHub Actions pipeline'i smoke adimini calistiracak sekilde revize edildi.

- **S15 - Progress Insights & Coach Panel**  
  CoachNote modeli, post/olcum baglantilari ve seed verisi eklendi. `/api/insights/progress` ucu haftalik/aylik trend, Treat Wheel istatistikleri ve ko\u00E7 notu \u00F6zetleri d\u00F6nd\u00FCr\u00FCho; `serializeCoachNote` ile mobil katmana uygun JSON saglandi. Mobilde yeni \u0130lerleme ekran\u0131 Recharts tabanl\u0131 grafikler ve DaisyUI ko\u00E7 kartlar\u0131yla yayina alindi; BottomTabBar \u0130lerleme sekmesine guncellendi. `tests/server/insights/progress.test.ts`, `tests/app/api/insights/progress/route.test.ts` ve `tests/lib/app-data.test.ts` ile regresyon kapsam\u0131 genisledi.
- **S16 - Challenges & Routine Gamification**  
  Challenge/Task/Participation/Progress modelleri tanimlandi; `/api/challenges`, `/api/challenges/{id}/join` ve `/api/challenges/{id}/progress` uclari yayina alindi. serializeChallenge ile mobil katmanda streak, kalan adim ve odul durumu gosteriliyor. Feed sayfasina ChallengeCard bileseni eklenerek katilim/ilerleme butonlari API'lerle entegre edildi; tests/server/challenges/service.test.ts, tests/app/api/challenges/route.test.ts ve tests/lib/app-data.test.ts yeni akislari dogruladi.
- **S17 - Growth & Monetization (Referral v1)**  
  ReferralStatus enumu, ReferralInvite modeli ve kullanici bazli referralCode alani eklendi. `/api/referrals` GET/POST akislari davet kodu, ozet istatistik ve davet listesini donduruyor; fetchReferrals fonksiyonu fallback verisiyle birlikte yayinda. tests/app/api/referrals/route.test.ts ve tests/lib/app-data.test.ts yeni davranisi dogruluyor; seed senaryosuna ornek davetler eklendi.
- **S17 - Growth & Monetization (Transactional Email & Waitlist)**  
  Resend tabanli davet e-posta servisi entegre edildi; waitlist opt-in talepleri Resend audience API'si uzerinden kaydediliyor ve  `POST /api/webhooks/waitlist` imza dogrulamali olarak bekleme listesi olaylarini guncelliyor. Yeni Vitest senaryolari (`tests/server/referrals/service.test.ts`, `tests/server/referrals/waitlist.test.ts`, `tests/app/api/webhooks/waitlist/route.test.ts`) bu davranislari kapsiyor. 

## Devam Eden Adimlar
- **S17 - Growth & Monetization (Referral Analytics)**  
  Davet paneli kabul/bekleme/Waitlist kirilimlari, haftalik gonderim ve kabul sayilariyla zenginlestirildi;  `/api/referrals` yanitina analytics alani eklendi ve profil sayfasinda yeni metrik kartlari gosteriliyor. tests/app/api/referrals/route.test.ts ile tests/lib/app-data.test.ts guncellendi. 

- **S17 - Growth & Monetization**  
- **S17 - Growth & Monetization**  
- **S17 - Growth & Monetization**  

- **S18 - Nutrition & Meal Plans**  
  MealPlan/MealEntry modelleri, makro hedefleri ve haftalik raporlar icin API tasarimi backlog'da. Mobilde yemek plan kartlari ve hatirlatma akislari DaisyUI bilesenleriyle prototiplenecek.

- **S19 - Integrations & Automations**  
  Apple HealthKit / Google Fit baglantisi, webhook tuketimi ve cron job'lar icin altyapi calismalari planlaniyor. Anomali tespiti ve bildirim stratejileri Vitest/Playwright senaryolariyla desteklenecek.

## Su Anki Riskler / Notlar

- **Test kapsami:** Posts, Comments, Follow/Search ve Measurements API'lari icin temel erisim ve cursor senaryolari kapsandi. Begenme/rapor sayaclari, yorum silme ve kesfet feed'i icin ek regresyon senaryolari backlog'da tutulmali.
- **Gercek zamanli bildirimler:** SSE/websocket yaklasimi icin teknoloji secimi ve backoff stratejisi netlestirilmedi; S13 oncesi PWA beklentileriyle birlikte degerlendirilmeli.
- **Build dogrulamasi:** `pnpm build` 10.10.2025 tarihinde yesil; yeni bagimlilik veya rota eklemelerinde tekrar calistirilmasi onerilir.

## Onerilen Hemen Sonraki Is

1. Stripe veya Paddle PoC'ini hazirlayarak checkout, webhook ve iptal adimlarini kesinlestirin.
2. Referral funnel ile waitlist metriklerini dashboard'a tasimak icin veri modeli/ETL planini hazirlayin.
3. Challenges -> Treat Wheel bonus otomasyonuna dair kurallar ve test senaryolarini backlog'a alin.
