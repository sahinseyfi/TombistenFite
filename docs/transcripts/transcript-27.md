# Transcript 27 - 2025-10-10

**Durum**
- itcrew-focus/.env.example ve README'yi mevcut Supabase & Vercel altyapısına göre güncelledim; servis rolü Postgres bağlantısı ve erişim tokenları için açıklamalar ekledim.
- .vercel yapılandırmasıyla uyumlu olacak şekilde yol haritasına Supabase/Vercel entegrasyon notu yazıldı.

**Testler**
- pnpm --dir fitcrew-focus test

**Deploy**
- Deploy betikleri (make vercel:deploy) artık itcrew-focus/.env.local içindeki Vercel token'ını kullanacak şekilde hazır; gerçek dağıtım bu oturumda çalıştırılmadı.

**Sonraki Adımlar**
- 1. Supabase veritabanında Prisma migration'larını uygulayın (pnpm --dir fitcrew-focus prisma:migrate deploy).
- 2. S3 eşdeğeri depolama (ör. Supabase Storage veya MinIO) için S3_* env değişkenlerini üretim ortamına ekleyin.
