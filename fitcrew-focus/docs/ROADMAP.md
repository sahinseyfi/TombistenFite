# FitCrew Focus Roadmap

Bu yol haritasi 11.10.2025 itibariyla backend calismalarinin durumunu ozetler.

## Tamamlanan Basliklar

- **S01 - Setup:** Next.js App Router, PWA manifest, eslint/prettier/env yapilandirmalari tamamlandi.
- **S02 - Prisma:** Cekirdek modeller tanimlandi, `20251009194409_init` migrasyonu ve seed senaryosu guncellendi.
- **S03 - Auth / JWT:** Auth ve kullanici uclari yayinda; JWT uretimi/dogrulamasi ve env kontrolleri aktif.
- **S04 - Upload Presign:** S3 presign yardimcilari ve MIME/limit kontrolleri hazir.
- **S05 - Posts API:** Post CRUD, scope bazli feed, begeni ve rapor uclari devrede. Erisim ve cursor senaryolari icin Vitest tabanli unit testler eklendi; hata mesajlari Turkce dilbilgisine gore revize edildi.
- **S06 - Comments API:** `/posts/{id}/comments` GET/POST uclari, cursor bazli sayfalama, `commentsCount` artisi ve `serializeComment` serilestiricisi tamamlandi; `tests/app/api/posts/[id]/comments/route.test.ts` ile erisim ve olusturma senaryolari kapsandi.
- **S07 - Follow & Explore:** `POST/DELETE /users/{id}/follow`, `GET /users/{id}/followers`, `GET /users/{id}/following` ve `GET /search/users` uclari hazirlandi; cursor bazli takibi listeleri ve arama regresyonlari `tests/app/api/users/follow/route.test.ts`, `tests/app/api/users/followers/route.test.ts`, `tests/app/api/search/users/route.test.ts` ile kapsandi.
- **S08 - Measurements & Analytics (API):** `/measurements` GET/POST uclari tamamlandi; cursor bazli listeleme, tarih filtresi ve tek transaction ile olcum ekleme destegi saglandi. `serializeMeasurement` eklendi ve `tests/app/api/measurements/route.test.ts` ile regresyon altina alindi.

## Siradaki Oncelikler

- **S09 - Treats Wheel:** Treat item CRUD, eligibility kurallari, spin/bonus akislari.
- **S10 - AI Comment:** AI yorum kuyrugu, OpenAI entegrasyonu, durum ve hata yonetimi.
- **S11 - Rate Limit & Errors & ETag:** Rate limit altyapisi, standart hata govdesi ve ETag yanitlari.
- **S12 - Notifications:** Bildirim listeleme/ack uclari ve gerekirse gercek zamanli kanal.
- **S13 - UI Wiring:** Mobil oncelikli ekran baglantilari, alt navigasyon, akis, profil, grafikler, kesfet ve Treat Wheel.
- **S14 - ENV & Docs & Smoke Tests:** `.env.example` son hali, README guncellemesi, curl smoke ornekleri ve temel testler.

## Teknik Notlar

- Test ortaminda path alias kullanimi icin `vitest.config.ts` eklendi.
- Posts, Comments, Follow/Search ve Measurements API'lari icin `tests/server/posts/utils.test.ts`, `tests/app/api/posts/route.test.ts`, `tests/app/api/posts/[id]/comments/route.test.ts`, `tests/app/api/users/follow/route.test.ts`, `tests/app/api/users/followers/route.test.ts`, `tests/app/api/search/users/route.test.ts` ve `tests/app/api/measurements/route.test.ts` ile temel erisim/sayfalama regresyonlari kapsaniyor. Begeni, rapor, kesfet ve yorum yonetimi icin ek senaryolar backlog'da tutulmali.
