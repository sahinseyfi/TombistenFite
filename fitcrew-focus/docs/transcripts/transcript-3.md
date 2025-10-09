**S02 Prisma**
- `prisma/schema.prisma:1` ile User/Post/Comment/Follow/Measurement/TreatItem/TreatSpin/Notification modellerini, enumları ve ilişkisel indeksleri tanımladım; migration dosyası `prisma/migrations/20251009194409_init/migration.sql:1` kritik indekslerle birlikte üretildi.
- `prisma/seed.ts:1` başlangıç verisi (örnek kullanıcılar, takip, ölçüm, gönderi, yorum, kaçamak) ekleyecek senaryoyu oluşturdu; `package.json:1` Prisma seed komutu ve `tsx`/`embedded-postgres` bağımlılıklarını içeriyor.
- Yerel Postgres olmaması nedeniyle `scripts/run-local-postgres.ts:1` ile gömülü Postgres denemesi ekledim; `initdb` Windows dil ayarı çözülemeyen hata (exit code 0xC0000409) verdiği için gerçek `pnpm prisma migrate dev` ve `pnpm prisma db seed` çalıştırılamadı. SQL migrasyonu `prisma migrate diff` ile üretildi; komutlar dokümante edildi ve tekrar denemeniz için script bırakıldı.

**Testler**
- `pnpm typecheck`
- `pnpm build`

**Durum & Sonraki Adım**
- S02 tamamlandı; Postgres kurulumunun sağlanması halinde `scripts/run-local-postgres.ts` üzerinden migrate/seed çalıştırılabilir. S03 (JWT auth uçları) için veri katmanı hazır.
