# Transcript 5 - Profil avatar yükleme

Tarih: 2025-10-04

**Değişiklikler**
- `supabase/migrations/20251004160000_add_avatar_storage.sql`: Supabase Storage'da herkese açık `avatars` bucket'ı ve RLS politikaları tanımlandı.
- `webapp/src/app/profil/page.tsx`: Profil ekranına dosya bazlı avatar yükleme, önizleme, boyut kontrolü ve Next.js `Image` bileşeni ile görsel gösterimi eklendi.
- `docs/ROADMAP.md`: Backlog'da Supabase migration/RLS ve profil avatar iş kalemleri tamamlandı olarak işaretlendi.

**Testler**
- `npm run lint` (webapp) — Uyarısız tamamlandı.

**Sonraki Adımlar**
1. Yeni Supabase migration'ını `supabase db push` veya pipeline üzerinden veritabanına uygulayın.
2. Vercel ortamında avatar yükleme akışını gerçek kullanıcıyla doğrulayın ve Storage dosyalarının erişilebilirliğini kontrol edin.
