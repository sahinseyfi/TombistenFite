# FitCrew Focus

## Genel Bakis
FitCrew Focus, mobil oncelikli bir aliskanlik ve antrenman takip platformudur. Next.js 14 App Router uzerinde calisir, Prisma ile Postgres veritabani kullanir ve DaisyUI + Tailwind ile mobil odakli arayuz sunar. Uygulamanin tum hata ve arayuz metinleri Turkce olarak tasarlanmistir.

## Gereksinimler
- Node.js >= 18.18
- pnpm >= 9
- Supabase CLI (opsiyonel, uzak veritabanina baglanmak icin)
- Redis ve S3 uyumlu storage (lokalde gelistirme icin MinIO kullanabilirsiniz)

## Kurulum
1. Depo kokunden `.env.example` dosyasini `.env.local` olarak kopyalayin ve zorunlu alanlari doldurun.
2. Bagimliligi kurmak icin `make setup` calistirin. (Alternatif: `pnpm install --frozen-lockfile`)
3. Cekirdek veritabani icin `pnpm prisma:migrate` ve gerekiyorsa `pnpm prisma:seed` calistirin.

## Komutlar
| Komut | Aciklama |
| ------ | -------- |
| `make dev` | Next.js gelistirme sunucusunu `http://localhost:3000` uzerinde baslatir. |
| `make test` | Vitest tabanli birim testlerini calistirir. |
| `make build` | Prisma client jenerasyonu ve production build olusturur. |
| `make lint` | ESLint ile kod standartlarini dogrular. |
| `pnpm prisma:studio` | Prisma Studio ile lokal veritabani kayitlarini gosterir. |
| `pnpm smoke:api` | Temel POST/GET akislari icin smoke testi (scripts/smoke/smoke-api.ts). |

Komutlari depo kokunden calistirin. `Makefile`, otomatik olarak `fitcrew-focus/` dizininde gerekli `pnpm` komutlarini isler.

## Ortam Degiskenleri
`.env.example` dosyasi zorunlu ve opsiyonel anahtarlar icin aciklama icerir. Production ortaminda:
- `NODE_ENV`, `DATABASE_URL` ve `JWT_SECRET` degerlerini guncelleyin.
- Redis ve S3 baglantilarini (`REDIS_URL`, `S3_*`) gercek servis bilgileri ile doldurun.
- OpenAI ozellikleri icin `OPENAI_API_KEY` ve `OPENAI_MODEL` belirleyin.
Dosyadaki varsayilanlar lokal gelisim senaryosu icin yeterlidir. Degisiklik yaptıktan sonra `pnpm prisma:generate` calistirmayi unutmayin.

## Test ve Kalite
- Birim testleri: `make test` veya `pnpm test`
- Lint: `pnpm lint`
- Tip kontrolu: `pnpm typecheck`
- Smoke testi: `pnpm smoke:api`
Degisiklik oncesi ve sonrasi tume bu kontrollerin yesil oldugundan emin olun.

## Mobil Gelistirme
- Mobil ekranlar icin safe-area yardimcilari (`pt-safe`, `pb-safe`) zorunludur.
- DaisyUI bileşenlerini kullanin; renk ve tipografi secimleri `docs/UX_MOBILE_GUIDE.md` dokumaninda belirtilmistir.
- Yeni ekranlar icin "Mobil UX Checklist" bolumunu takip edin ve PR aciklamasina ekleyin.

## Kaynaklar
- Teknik aktarim: `docs/BACKEND_HANDOFF.md`
- Yol haritasi: `docs/ROADMAP.md`
- Durum takip: `docs/PLAN_STATUS.md`
- Sorun giderme notlari: `docs/TROUBLESHOOTING.md`
- Mobil tasarim rehberi: `docs/UX_MOBILE_GUIDE.md`
