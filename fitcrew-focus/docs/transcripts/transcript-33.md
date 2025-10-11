Bildirim altyapısını tamamladım:
- `src/server/notifications/index.ts:1` yeni event tabanlı bildirim servisi, Redis cache yönetimi ve ack yardımcılarını sağlıyor; `src/server/redis.ts:1` ve `src/server/rate-limit.ts:1` ortak Redis istemcisini paylaşıyor.
- `src/app/api/notifications/route.ts:1`, `src/app/api/notifications/[id]/ack/route.ts:1`, `src/app/api/notifications/ack-all/route.ts:1` uçları bildirim listeleme/ack senaryolarını tamamlıyor; yanıtlar `src/server/serializers/notification.ts:1` ile serileştiriliyor.
- Bildirim tetikleri `src/app/api/posts/[id]/comments/route.ts:181`, `src/app/api/posts/[id]/like/route.ts:113`, `src/app/api/users/[id]/follow/route.ts:79`, `src/app/api/treats/spins/route.ts:226` ve `src/server/ai/comments.ts:201` içinde kuyruklanıyor; `prisma/schema.prisma:43` ve `prisma/migrations/20251011160000_add_treat_bonus_notification/migration.sql:1` Treat bonus tipini ekledi.
- Yeni testler `tests/app/api/notifications/route.test.ts:1`, `tests/app/api/notifications/[id]/ack/route.test.ts:1`, `tests/app/api/notifications/ack-all/route.test.ts:1` ve `tests/server/notifications/index.test.ts:1` ile kapsama alındı; mevcut route testleri mock'larla güncellendi.
- Yol haritası ve plan dokümanları `docs/ROADMAP.md:19` ve `docs/PLAN_STATUS.md:40` üzerinden S12 tamamlandı olarak güncellendi.

Testler:
- `pnpm vitest --run`
- `pnpm prisma generate`

Sonraki adımlar:
- S13 için DaisyUI tabanlı `BottomNav`/badge bağlamını tasarlayıp SSE/pusher seçeneklerini değerlendirmek.
- `.env.example` ve `pnpm smoke:api` (S14) taslaklarını netleştirip dokümana taşımak.
