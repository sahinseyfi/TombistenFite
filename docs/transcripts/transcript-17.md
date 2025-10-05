# Transcript 17 - Akışta beğeni ve yorum deneyimi

Akış kartlarına Supabase tabanlı beğeni/yorum altyapısını ekleyip mobil dostu yorum çekmecesi geliştirdim.
- supabase/migrations/20251005133000_add_post_engagement.sql: Like ve yorum tablolarını RLS politikalarıyla tanımladım, indeks ve benzersizlik kısıtlarını ekledim.
- webapp/src/app/akis/page.tsx:20 Akış bileşenini beğeni/yorum sayaçları, giriş gerektiren beğeni togglesı ve yorum çekmecesiyle genişlettim; Realtime hasar uyarısı ve yeniden bağlanma akışı korundu.
- webapp/src/locales/tr/common.json:72 Yeni beğeni/yorum/Realtime metinlerini i18n sözlüğüne ekledim.
- docs/ROADMAP.md:105 Backlog maddesini tamamlandı olarak işaretledim ve yeni etkileşim notunu ekledim.

Testler:
- `npm run lint`
- `npm run test`

Sonraki adımlar:
1) Yorum listesinde profil verilerini (display_name) göstermek için `profiles` join'i ekleyebilirsin.
2) Beğeni ve yorumlar için Realtime aboneliğini genişleterek sayaçları otomatik güncelle.
3) Kommentar çekmecesinde uzun listeler için sayfalama veya sonsuz kaydırma stratejisi uygula.
