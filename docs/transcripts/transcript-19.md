# Transcript 19 - Realtime etkileşim güncellemesi

Akış sayfasına Supabase Realtime ile beğeni ve yorum sayaçlarını canlı tutan yapıyı ekledim.
- webapp/src/hooks/useFeedRealtime.ts:1 Post, like ve comment tablolarını izleyen hook yazıldı.
- webapp/src/app/akis/page.tsx:5 Realtime hook entegrasyonu, sayaç güncellemeleri ve yorum çekmecesi eşlemesi.
- docs/ROADMAP.md:106 Realtime etkileşim notu eklendi.

Testler:
- `npm run lint`
- `npm run test`

Sonraki adımlar:
1) Realtime kanalında hata olduğunda exponent backoff ile tekrar bağlanmayı ekleyebilirsin.
2) Yorum çekmecesinde kullanıcı avatarı/adını göstermek için `profiles` join'i uygula.
3) Yorum girişine karakter sayacı ekleyerek kullanıcıya geri bildirim ver.
