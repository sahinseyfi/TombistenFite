**Yapilanlar**
- Comments API icin `/api/posts/[id]/comments` GET/POST rotalarini gelistirdim; cursor bazli sayfalama, `ensurePostAccess` ile yetki kontrolu ve `commentsCount` artisini tek transaction icine aldım (`src/app/api/posts/[id]/comments/route.ts:1`).
- Yorum serilestiricisini ekledim ve author bilgisi ile ISO tarihleri donduren yardimciyi tanimladim (`src/server/serializers/comment.ts:1`).
- Comments API erisim, cursor ve olusturma senaryolarini kapsayan Vitest testlerini yazdim (`tests/app/api/posts/[id]/comments/route.test.ts:1`); mevcut testleri calistirdim (`pnpm test`).
- PLAN_STATUS ve ROADMAP dokumanlarini S06 ilerlemesi ve yeni backlog maddeleriyle guncelledim (`docs/PLAN_STATUS.md:1`, `docs/ROADMAP.md:1`).

**Testler**
- `pnpm test`
- `pnpm typecheck`
- `pnpm build`

**Sonraki Adimlar**
1. S07 Follow & Explore icin takip et/birak ve arama/keşfet senaryolarini teknik olarak detaylandir.
2. Begeni, rapor ve yorum silme/regresyon senaryolarini backlog'a netlestir ve onceliklendir.
3. Mobil UI baglantilari (S13) icin gerekebilecek ek API alanlarini belirleyip paydaslarla eslestir.
