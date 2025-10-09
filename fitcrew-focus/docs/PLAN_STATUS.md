# FitCrew Focus Plan Durumu

Bu doküman, tek oturumluk çalışma planındaki adımların mevcut durumunu özetler ve sıradaki işleri listeler.

## Tamamlanan Adımlar

- **S01 - Setup**  
  Next.js App Router kuruldu, PWA manifest ve ikonlar eklendi, temel tooling (eslint/prettier/env) güncellendi.

- **S02 - Prisma**  
  Kullanıcı, post, yorum, takip, ölçüm, treat ve bildirim modelleri tanımlandı; `20251009194409_init` migrasyonu oluşturuldu; seed senaryosu temel verilerle güncellendi.

- **S03 - Auth / JWT**  
  `/auth/register`, `/auth/login`, `/auth/refresh`, `/users/me`, `/users/[id]` uçları tamamlandı; JWT üretimi ve doğrulaması için yardımcılar eklendi; `env` doğrulaması yapılandırıldı.

- **S04 - Upload Presign**  
  `/uploads/presign` endpoint'i MIME/size/dimension kontrolleri ile hazırlandı; S3 presign yardımcıları eklendi.

## Devam Eden Adımlar

- **S05 - Posts API** *(devam ediyor)*  
  `ensurePostAccess` akışı güvenceye alındı, `/posts/[id]`, `/posts/[id]/like`, `/posts/[id]/report` rota tipleri daraltıldı ve `pnpm typecheck` yeşile döndü.  
  Kalan iş: erişim kontrolleri için test senaryoları, detay uçlarında hata mesajlarının gözden geçirilmesi ve S05 kapanış raporu.

## Bekleyen Adımlar

- **S06 - Comments API**  
  `/posts/{id}/comments` uçları, cursor bazlı sayfalama ve sayım güncellemeleri uygulanacak.

- **S07 - Follow & Explore**  
  Takip et/bırak, follower/following listeleri ve arama/keşfet uçları beklemede.

- **S08 - Measurements & Analytics**  
  Ölçüm kaydı ve analitik serileri için API, transaction kuralları tamamlanacak.

- **S09 - Treats Wheel**  
  Treat items CRUD, eligibility, spins ve bonus akışı uygulanacak.

- **S10 - AI Comment**  
  Post oluşturma sırasında AI yorum kuyruğu, OpenAI entegrasyonu ve durum güncellemeleri geliştirilecek.

- **S11 - Rate Limit & Errors & ETag**  
  Rate limit (Redis veya memory), standart hata gövdeleri, ETag/304 davranışları işlenecek.

- **S12 - Notifications**  
  Bildirim listeleme/ack uçları, gerekli ise gerçek zamanlı kanal planlanacak.

- **S13 - UI Wiring**  
  Mobil öncelikli UI sayfaları, alt navigasyon, akış, profil, grafikler, keşfet, bildirimler ve Treat Wheel ekranları bağlanacak.

- **S14 - ENV & Docs & Smoke Tests**  
  `.env.example` final, README güncelleme, curl smoke örnekleri ve basit testler tamamlanacak.

## Şu Anki Riskler / Notlar

- **Test Eksikliği:** Posts API erişim kontrolü için henüz otomatik test bulunmuyor. Başlangıçta `ensurePostAccess` için ünite senaryoları eklenmeli.
- **Build Doğrulaması:** `pnpm build` halen çalıştırılmadı; S05 tamamlanmadan önce doğrulanmalı.

## Önerilen Hemen Sonraki İş

Posts API için smoke testleri yazıp `pnpm build`/`pnpm typecheck` ikilisini CI benzeri şekilde tekrar doğrulayın; ardından S05 kapsamındaki dökümantasyon ve kapanış notlarını hazırlayıp S06'ya geçiş planlayın.
