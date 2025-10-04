# Transcript 8 - Akış görsel paylaşımı

Tarih: 2025-10-04

**Değişiklikler**
- `supabase/migrations/20251004163000_add_post_images.sql`: Gönderiler için `image_url` kolonu ve herkese açık `post-images` bucket’ı ile RLS politikaları eklendi.
- `webapp/src/app/akis/page.tsx`: Akış ekranına görsel seçimi, 5 MB sınırı, önizleme ve Supabase Storage’a yükleme akışı entegre edildi; gönderi listesi görseli gösterecek şekilde güncellendi.
- `webapp/src/app/page.tsx`: Ana sayfadaki son gönderiler blokları, görsel içeren gönderileri de gösterecek şekilde genişletildi.
- `webapp/src/locales/tr/common.json`: Akış metinleri ve hata mesajları i18n sözlüğüne taşındı.
- `webapp/next.config.ts`: Supabase Storage alanı için `images.remotePatterns` tanımlandı.
- `docs/ROADMAP.md`: Akış sayfası backlog maddesi tamamlandı olarak işaretlendi.

**Komutlar**
- `npm run lint`
- `supabase db push --include-all --yes`

**Notlar**
- Gönderi oluştururken yalnızca görsel eklemek de mümkün; içerik boşsa `content` alanı `null` olarak kaydediliyor.
- Supabase Storage’daki görseller herkese açık URL üzerinden servis ediliyor; gerekirse kota için cache ayarları güncellenebilir.
