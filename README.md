# TombistenFite — Ortam Değişkenleri ve Otomasyon

Bu depoda gizli anahtarları repo dışında tutarak Vercel, Supabase ve GitHub ile hızlı entegrasyon için komut dosyaları eklendi.

## Hızlı Başlangıç

1) Ortam dosyasını oluşturun (gerçek değerleri doldurun):
- `webapp/.env.local` dosyasını `webapp/.env.local.example` temel alınarak oluşturun.
- Bu dosya Git tarafından zaten yok sayılıyor.

2) Opsiyonel: Supabase CLI oturumu açın
- `make supabase:login`

3) Vercel proje ortam değişkenlerini senkronize edin
- `make env:vercel:push`
- Not: `VERCEL_TOKEN` değişkeni çalışma zamanı ortama gönderilmez (CLI amaca yönelik; deploy için gerekli değil). Diğer anahtarlar `development/preview/production` için ayarlanır.

4) GitHub repository secrets ayarlayın
- `gh auth login` ile oturum açın (bir kez). Ardından:
- `make env:github:push`

## Kurulum ve Çalıştırma
- Bağımlılıklar: `make setup`
- Geliştirme: `make dev`
- Derleme: `make build`

## Güvenlik
- Gerçek tokenları kesinlikle commit etmeyin. `.env.local` Git’e dahil edilmez.
- Script’ler değerleri stdin ile geçirir; konsolda gizli değeri yazdırmaz.

## Notlar
- Supabase uygulama anahtarlarınız (URL/ANON KEY) yoksa, Supabase projesi oluşturup bunları `webapp/.env.local` dosyasına ekleyin.
- GitHub secrets için `gh` oturumu gerekli; tokenlar repo secrets olarak kaydedilir.
- Vercel proje linki `.vercel/project.json` ile zaten mevcut; script, aynı proje kapsamını kullanır.

