Growth & Monetization yol haritasındaki ilerleme, premium paywall, challenges ve ilerleme ekranlarını devreye aldım.
**Değişiklikler**
- fitcrew-focus/prisma/schema.prisma:295 ve fitcrew-focus/prisma/migrations/20251012093000_add_membership_billing/migration.sql:1 koç notu, challenge ve faturalandırma modellerini ekleyip veri tabanını genişletti; seed güncellemeleri fitcrew-focus/prisma/seed.ts:173 üzerinden senaryoyu zenginleştirdi.
- fitcrew-focus/src/server/insights/progress.ts:1, fitcrew-focus/src/app/insights/page.tsx:1, fitcrew-focus/src/components/insights/TrendCharts.tsx:1 ve fitcrew-focus/src/components/insights/CoachNotesList.tsx:1 haftalık/aylık ilerleme servisini mobil grafikler ve koç notu listesini PremiumGate ile sunuyor.
- fitcrew-focus/src/server/challenges/service.ts:1, fitcrew-focus/src/app/api/challenges/route.ts:1 ve fitcrew-focus/src/components/challenges/ChallengeCard.tsx:1 challenge katılım ve ilerleme akışını API + UI tarafında yayına aldı.
- fitcrew-focus/src/server/emails/referrals.ts:1, fitcrew-focus/src/server/referrals/waitlist.ts:17, fitcrew-focus/src/app/api/webhooks/waitlist/route.ts:1 ve fitcrew-focus/tests/server/referrals/service.test.ts:1 Resend tabanlı davet ile bekleme listesi entegrasyonunu ve regresyon testlerini sağladı.
- fitcrew-focus/src/config/membership.ts:1, fitcrew-focus/src/server/membership/service.ts:1, fitcrew-focus/src/app/premium/page.tsx:1 ve fitcrew-focus/src/components/premium/PremiumGate.tsx:1 premium plan konfigürasyonunu ve uygulama genelindeki gate paylaşımını oluşturdu.
**Doğrulama**
- pnpm test
**Dağıtım**
- Commit: feat(growth): premium paywall ve ilerleme akışları
- vercel --prod --yes (fitcrew-focus) -> https://fitcrew-focus-c2rb1ow9b-sahin-seyfis-projects.vercel.app
- git push origin main
**Sonraki Adımlar**
1. Stripe/Paddle sağlayıcı entegrasyonu için webhook işleyicilerini ve billing senaryolarını planlayın.
