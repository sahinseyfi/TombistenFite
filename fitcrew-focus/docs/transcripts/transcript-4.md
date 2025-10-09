**S03 Auth/JWT**
- `src/app/api/auth/*` JWT tabanlı register, login, refresh, `users/me`, `users/[id]` uçlarını Prisma üzerinden kurdum; token üretimi `src/server/auth/jwt.ts:1`, şifre işlemleri `src/server/auth/password.ts:1`, kullanıcı serileştirme `src/server/serializers/user.ts:1`.
- `src/env.ts:1` ile `@t3-oss/env-nextjs` kullanarak sunucu env doğrulamasını yaptım; yerelde build için güvenli varsayılanlar ekledim. `src/server/api/responses.ts:1` hata/başarı yanıtlarını standartlaştırıyor, `src/server/db.ts:1` Prisma client singleton sağlıyor.
- `src/server/auth/session.ts:1` Authorization header’dan access token doğruluyor; `users/[id]` route’u hem id hem `@handle` ile sorgu destekliyor.

**Testler**
- `pnpm typecheck`
- `pnpm build`

**Durum & Sonraki Adım**
- S03 tamamlandı. S04’te upload presign akışına geçiyorum.
