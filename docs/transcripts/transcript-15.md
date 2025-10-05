# Transcript 15 - Akış Realtime güncellemesi

Akış sayfasını Supabase Realtime olayları ile canlı güncellemeye geçirdim ve listeyi 20 kayıtla sınırladım.
- webapp/src/app/akis/page.tsx:17 `mapRecordToPost` ve `MAX_POSTS` ile gelen kayıtları normalize edip sıralıyorum.
- webapp/src/app/akis/page.tsx:49 Başlangıç yüklemesi `normalizePosts` kullanarak sonucu sıralayıp hazır duruma getiriyor.
- webapp/src/app/akis/page.tsx:66 Realtime kanal INSERT/UPDATE/DELETE olaylarında listeyi güncelliyor, çevrimdışı fallback olarak load çağrısı korunuyor.
- docs/ROADMAP.md:103 Supabase Realtime backlog maddesini tamamlandı olarak işaretledim ve yeni not ekledim.

Testler:
- `npm run lint`
- `npm run test`

Sonraki adımlar:
1) Realtime kanalını hata durumlarında yeniden bağlamak için görünür bir uyarı/geri dön butonu ekle.
2) Akış boş olduğunda Realtime ile gelen ilk kaydı vurgulayan hafif animasyon/farkındalık düşün.
3) Server-side ISO tarih ile istemci saat dilimi farkı için `Intl.DateTimeFormat` konfigürasyonunu parametrize et.
