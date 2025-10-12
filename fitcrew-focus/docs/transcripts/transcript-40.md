Mobil ilerleme paneli tamamlandı: backend ve arayüz uçtan uca yayında.
- prisma/schema.prisma:249 CoachNote modeli, post/ölçüm bağlantıları ve CoachNoteOrigin enumu eklendi; prisma/migrations/20251011220000_add_coach_notes/migration.sql:1 veritabanını güncelledi, seed prisma/seed.ts:140 koç notu örneği oluşturdu.
- src/server/insights/progress.ts:213 haftalık/aylık trendleri ve Treat Wheel metriklerini toplayan servis; uç src/app/api/insights/progress/route.ts:13 oturum doğrulaması, parametre doğrulaması ve ETag desteğiyle client'lara veri sağlıyor.
- src/lib/app-data.ts:179 ile fetchProgressInsights ve src/lib/fallback-data.ts:227 fallback seti eklendi; UI katmanı src/app/insights/page.tsx:40, src/components/insights/TrendCharts.tsx:15 ve src/components/insights/CoachNotesList.tsx:5 mobil grafikleri/koç kartlarını hazırlıyor, src/components/layout/BottomTabBar.tsx:15 sekmeyi İlerleme olarak yeniledi.
- tests/server/insights/progress.test.ts:81, tests/app/api/insights/progress/route.test.ts:28 ve tests/lib/app-data.test.ts:8 yeni akışları doğruluyor.
- docs/ROADMAP.md:21 ve docs/PLAN_STATUS.md:49 S15 tamamlandı olarak revize edildi ve sıradaki iş listesi S16 odaklarına taşındı.

**Testler**
- pnpm test
- pnpm typecheck

**Sonraki Adımlar**
1. S16 için Challenge/Task + Progress modellerini tasarlayıp migrasyon taslağını çıkar.
2. Treat Wheel puan/rozet kurallarını Challenges ile uyumlu hale getir, bildirim tetiklerini backlog'a ekle.
3. Mobil Challenge kartları ve rutin ilerleme bileşenleri için UX_MOBILE_GUIDE referanslı prototipler hazırla.
