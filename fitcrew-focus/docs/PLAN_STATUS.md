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

## Devam Eden Adimlar

- **S13 - UI Wiring**  
  DaisyUI + Tailwind bilesenleriyle mobil oncelikli ekranlar (feed, olcum zaman cizelgesi, profil, Treat Wheel) baglanacak. `layout.tsx` uzerinden `BottomNav` ve bildirim rozet context'i saglanacak; safe area (`pt-safe`/`pb-safe`) yardimcilari ve Playwright/Vitest smoke testleri kritik akislari koruyacak.

- **S14 - ENV & Docs & Smoke Tests**  
  `.env.example` zorunlu/opsiyonel anahtar aciklamalariyla guncellenecek, README/TROUBLESHOOTING genisletilecek ve `scripts/smoke/` altinda `pnpm smoke:api` komutu CI'ya dahil edilecek; tamamlandiginda ROADMAP ve PLAN_STATUS yeniden senkronize edilecek.

## Orta Vadeli Basliklar

- **S15 - Progress Insights & Coach Panel**  
  `/api/insights/progress` ile haftalik/aylik trend serileri, `CoachNote` modeli ve post/olcum baglanti tablolari planlandi; AI comment kuyrugu ile entegrasyon ve hafif mobil grafik bilesen secimi degerlendirilecek.

- **S16 - Challenges & Routine Gamification**  
  Prisma modelleri ve `/api/challenges` uclariyla meydan okuma/rutin takibi saglanacak; Treat Wheel ve bildirim sistemiyle baglantili rozet/kredi odulleri tasarlanacak. Mobilde `Tasks` ve `Streak` kartlari `BottomNav` altinda konumlanacak.

- **S17 - Growth & Monetization**  
  Referral akisi (`/api/referrals`), odeme saglayici secimi (Stripe/Paddle) ve `BillingCustomer` + webhook altyapisi backlog'a alindi; premium paywall ve raporlar S13 UI katmani ile senkron ilerleyecek.

## Su Anki Riskler / Notlar

- **Test kapsami:** Posts, Comments, Follow/Search ve Measurements API'lari icin temel erisim ve cursor senaryolari kapsandi. Begenme/rapor sayaclari, yorum silme ve kesfet feed'i icin ek regresyon senaryolari backlog'da tutulmali.
- **Gercek zamanli bildirimler:** SSE/websocket yaklasimi icin teknoloji secimi ve backoff stratejisi netlestirilmedi; S13 oncesi PWA beklentileriyle birlikte degerlendirilmeli.
- **Build dogrulamasi:** `pnpm build` 10.10.2025 tarihinde yesil; yeni bagimlilik veya rota eklemelerinde tekrar calistirilmasi onerilir.

## Onerilen Hemen Sonraki Is

1. S13 icin DaisyUI bilesen prototiplerini ve safe-area yardimcilarinin uygulamasini degerlendir.
2. S13 bildirim rozet deneyimi icin `BottomNav` taslagi ve badge veri akisini planla.
3. `.env.example` ve `pnpm smoke:api` calisma planlarini (S14) detaylandir, belgelere taslak notlar ekle.
