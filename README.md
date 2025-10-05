# TombistenFite - Ortam Degiskenleri ve Otomasyon

Bu depoda gizli anahtarlari repo disinda tutarak Vercel, Supabase ve GitHub ile hizli entegrasyon icin komut dosyalari eklendi.

## Hizli Baslangic

1) Ortam dosyasini olusturun (gercek degerleri doldurun):
- `webapp/.env.local` dosyasini `webapp/.env.local.example` temel alinerek olusturun.
- Bu dosya Git tarafindan zaten yok sayiliyor.

2) Opsiyonel: Supabase CLI oturumu acin
- `make supabase:login`

3) Vercel proje ortam degiskenlerini senkronize edin
- `make env:vercel:push`
- Not: `VERCEL_TOKEN` degiskeni calisma zamani ortama gonderilmez (CLI amaca yonelik; deploy icin gerekli degil). Diger anahtarlar `development/preview/production` icin ayarlanir.

4) GitHub repository secrets ayarlayin
- `gh auth login` ile oturum acin (bir kez). Ardindan:
- `make env:github:push`

## Kurulum ve Calistirma
- Bagimliliklar: `make setup`
- Gelistirme: `make dev`
- Derleme: `make build`
- Test: `make test` (Vitest + Testing Library)
- Format: `make format` (Prettier + Tailwind plugin)

## Guvenlik
- Gercek tokenlari kesinlikle commit etmeyin. `.env.local` Git'e dahil edilmez.
- Script'ler degerleri stdin ile gecirir; konsolda gizli degeri yazdirmaz.

## Notlar
- Supabase uygulama anahtarlari (URL/ANON KEY) yoksa, Supabase projesi olusturup bunlari `webapp/.env.local` dosyasina ekleyin.
- GitHub secrets icin `gh` oturumu gerekli; tokenlar repo secrets olarak kaydedilir.
- Vercel proje linki `.vercel/project.json` ile zaten mevcut; script ayni proje kapsaminda calisir.
- Kok dizindeki `npm run build`, `npm run dev` vb. komutlar `webapp/` altindaki Next.js uygulamasini tetikler; Vercel build/preview adimlari da bu komutlara dayanir.

## CI
- GitHub Actions hattı `.github/workflows/ci.yml` içinde tanımlıdır.
- Lint/Test/Build adımları Node 20 üzerinde çalışır.
- Vercel önizleme dağıtımı için repo secret'ları olarak `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` değerlerini tanımlayın.

## PWA
- Manifest ve ikonlar varsayılan olarak `/icons` altında tanımlıdır.
- Üretim dağıtımında uygulamayı ana ekrana ekleyerek kısayolu test edebilirsin.
