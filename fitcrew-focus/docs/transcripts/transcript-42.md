**Yapılanlar**
- Resend tabanlı davet e-postası altyapısını ekledim; `package.json:78` ile bağımlılık tanımlandı, `src/server/emails/referrals.ts:1` ve `src/server/emails/client.ts:1` gönderim yardımcılarını sağlıyor, `src/server/referrals/service.ts:48` davet oluştururken paylaşım URL'si üretip gönderim sonucunu kaydediyor; yeni alanlar `prisma/schema.prisma:405`, `prisma/migrations/20251012013000_referral_delivery_waitlist/migration.sql:1` ve `prisma/seed.ts:120` ile veri tabanına işlendi, `tests/server/referrals/service.test.ts:1` bu akışı doğruluyor.
- Waitlist opt-in kaydı ve imza doğrulamalı webhook katmanı eklendi; `src/server/referrals/waitlist.ts:17` Resend Audience API'sine kayıt açıp davetleri güncelliyor, `src/app/api/webhooks/waitlist/route.ts:10` dış bildirimleri doğruluyor, `tests/server/referrals/waitlist.test.ts:1` ve `tests/app/api/webhooks/waitlist/route.test.ts:1` yeni davranışı kapsıyor.
- Referral serileştirme/dokümantasyon güncellendi; `src/server/serializers/referral.ts:18` ve `src/lib/fallback-data.ts:516` yeni alanları dışa aktarıyor, `.env.example:71`, `README.md:34`, `docs/ROADMAP.md:24` ve `docs/PLAN_STATUS.md:55` Resend/waitlist yapılandırmasını anlatacak şekilde güncellendi.

**Testler**
- `pnpm test`

**Sonraki Adımlar**
1. Premium paywall ve izinli ekranlar için UI/state haritasını tamamlayıp kilitlenecek akışları netleştirin.
2. Stripe veya Paddle için PoC hazırlayarak BillingCustomer modeli ve webhook dinleyicileri backlog'unu çıkarın.
3. Referral → waitlist → aktif üyelik dönüşüm metriklerini dashboard'da gösterecek veri modelini ve alarm/pano kartlarını tasarlayın.

Not: Resend entegrasyonu için `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `RESEND_WAITLIST_AUDIENCE_ID` ve `WAITLIST_WEBHOOK_SECRET` değerlerini doldurup sağlayıcı tarafında `POST /api/webhooks/waitlist` ucunu tanımlamayı unutmayın.
