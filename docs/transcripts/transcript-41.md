S16 - Challenges & Routine Gamification tamamlandı; API, seed ve mobil arayüz yayınlandı.
- prisma/schema.prisma:249 Challenge/Task/Participation/Progress modelleri, ChallengeFrequency/Status enumları eklendi; prisma/migrations/20251011224500_add_challenges/migration.sql veritabanını güncelledi, seed prisma/seed.ts:128 haftalık yürüyüş örneğini ve örnek progress loglarını oluşturdu.
- src/server/challenges/service.ts:17 challenge listeleme, katılım ve ilerleme servislerini sağladı; serializeChallenge/Participation (src/server/serializers/challenge.ts:1) yeni JSON yapısını mobil katmana aktarıyor.
- API uçları: src/app/api/challenges/route.ts:1, src/app/api/challenges/[id]/join/route.ts:1 ve src/app/api/challenges/[id]/progress/route.ts:1; doğrulama hatalarında ChallengeServiceError kullanıldı. tests/app/api/challenges/route.test.ts:1 ile regresyon sağlandı.
- Mobil entegrasyon: src/components/challenges/ChallengeCard.tsx:1 client bileşeni; feed sayfası src/app/feed/page.tsx:1 challenge verisini fetchChallenges ile yükleyip Flow’a ekledi. Fallback verileri src/lib/fallback-data.ts:10 güncellendi, fetchChallenges src/lib/app-data.ts:12 ile eklendi, tests/lib/app-data.test.ts:1 fallback senaryosunu doğruladı.
- Dokümanlar: docs/ROADMAP.md ve docs/PLAN_STATUS.md S16’yı tamamlandı olarak işledi; yeni öncelikler S17 (Growth & Monetization) için tanımlandı.

**Testler**
- pnpm test
- pnpm typecheck

**Sonraki Adımlar**
1. S17 için referral/davet ve bekleme listesi akışının veri modelini, API ve webhook gereksinimlerini belirle; ödeme sağlayıcı PoC planını çıkar.
2. Premium paywall & izinli özellik ekranlarını haritalandır, hangi modüllerin kilitleneceğini netleştir.
3. Challenge tamamlanınca Treat Wheel bonuslarını tetikleyecek puan/bildirim kural setini backlog’da ayrıntılandır.

