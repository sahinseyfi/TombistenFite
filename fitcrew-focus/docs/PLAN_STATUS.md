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

## Devam Eden Adimlar

- **S09 - Treats Wheel**  
  Treat items CRUD, uygunluk, spins ve bonus akislari uygulanacak.

- **S10 - AI Comment**  
  Post olusturma sirasinda AI yorum kuyrugu, OpenAI entegrasyonu ve durum guncellemeleri gelistirilecek.

- **S11 - Rate Limit & Errors & ETag**  
  Rate limit (Redis veya memory), standart hata govdeleri, ETag/304 davranislari islenecek.

- **S12 - Notifications**  
  Bildirim listeleme/ack uclari, gerekirse gercek zamanli kanal planlanacak.

- **S13 - UI Wiring**  
  Mobil oncelikli UI sayfalari, alt navigasyon, akis, profil, grafikler, kesfet, bildirimler ve Treat Wheel ekranlari baglanacak.

- **S14 - ENV & Docs & Smoke Tests**  
  `.env.example` final, README guncelleme, curl smoke ornekleri ve basit testler tamamlanacak.

## Su Anki Riskler / Notlar

- **Test kapsami:** Posts, Comments, Follow/Search ve Measurements API'lari icin temel erisim ve cursor senaryolari kapsandi. Begenme/rapor sayaclari, yorum silme ve kesfet feed'i icin ek regresyon senaryolari backlog'da tutulmali.
- **Build dogrulamasi:** `pnpm build` 10.10.2025 tarihinde yesil; yeni bagimlilik veya rota eklemelerinde tekrar calistirilmasi onerilir.

## Onerilen Hemen Sonraki Is

1. S09 Treats Wheel icin eligibility kurallarini, transaction akisini ve API taslagini belirle.
2. Begeni/rapor sayaclari ile yorum silme/regresyon senaryolarini kapsayacak test backlog'unu onceliklendir.
3. Measurements verilerinin analitik serilere (EMA, trend) entegrasyonu icin veri gereksinimlerini dokumante et.
