# FitCrew Focus Troubleshooting

Bu dokuman, gelistirme ve test surecinde karsilasilan yaygin sorunlara hizli cozumler sunar. Tum komutlar depo kokunden calistirilmalidir.

## Ortam Degiskenleri
- `.env.local` eksikse Next.js baslatilmaz. `cp .env.example .env.local` ile sablonu kopyalayin.
- Deger guncelledikten sonra `pnpm prisma:generate` calistirarak Prisma client'ini yeniden olusturun.
- Production icin `JWT_SECRET` en az 32 karakter olmalidir; aksi halde uygulama acilisinda hata firlatir.
- Redis veya S3 baglantisi kullanilmiyorsa ilgili degiskenleri bos birakabilir ya da lokal servise yoneltebilirsiniz.

## Veritabani Baglantisi
- `pnpm prisma migrate dev` hatalari genelde veritabani erisiminin reddedilmesinden kaynaklanir. `DATABASE_URL` degerini tekrar kontrol edin.
- Hizli lokal kurulum icin `pnpm tsx scripts/run-local-postgres.ts` komutunu kullanabilirsiniz. Betik, gecici bir Postgres calistirir ve `migrate + seed` akisini tamamlar.
- Migrations takildiginda `pnpm prisma:migrate reset` ile tabloyu sifirlayip yeniden deneyin.

## Redis ve Rate Limit
- `ECONNREFUSED 127.0.0.1:6379` hatasi genelde Redis calismadiginda gorulur. Lokal icin Docker ile `docker run -p 6379:6379 redis:7` calistirabilirsiniz.
- Redis olmadan calismak istiyorsaniz `REDIS_URL` degiskenini bos birakin; rate limit servisi otomatik olarak in-memory moda gecer.

## Object Storage / S3
- MinIO kullanirken `S3_ENDPOINT`, `S3_ACCESS_KEY`, `S3_SECRET_KEY` ve `S3_BUCKET` degerlerini `.env.local` icinde tanimlayin.
- Sertifika sorunlari yasiyorsaniz development icin `http://localhost:9000` kullanarak TLS dogrulamasini devre disi birakin.

## OpenAI / AI Yorumu
- `OPENAI_API_KEY` olmadan AI yorum kuyrugu devreye girmez; API anahtari ekledikten sonra `pnpm smoke:api` ile `POST /api/ai-comments/run` akisinin basarili calistigini dogrulayin.
- OpenAI kota hatalarinda `AI_COMMENT_CRON_SECRET` degerinin production ortaminda gizli tutuldugundan emin olun.

## Test ve Smoke Senaryolari
- Tum birim testleri `make test` ile calismali; tek senaryoyu izole etmek icin `pnpm test --run tests/<dosya>` kullanabilirsiniz.
- Temel is akislari icin `pnpm smoke:api` komutunu calistirin. Hata ciktiginda komut ciktisini konsolda inceleyin.

## Next.js Calistirma Problemleri
- `Next.js failed to start` hatasinda oncelikle portun baska bir uygulama tarafindan kullanilip kullanilmadigini `netstat -ano | findstr 3000` ile kontrol edin.
- Hot reload gecikmelerinde `pnpm dev --turbo` bayragini deneyebilir ya da `node --max-old-space-size=4096` ile hafizayi arttirabilirsiniz.
