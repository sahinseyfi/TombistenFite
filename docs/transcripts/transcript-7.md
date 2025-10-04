# Transcript 7 - Ana sayfa içerik güncellemesi

Tarih: 2025-10-04

**Değişiklikler**
- `webapp/src/app/page.tsx`: Ana sayfa artık Supabase oturum durumunu algılayıp hızlı aksiyon kartları ve son gönderiler listesini gösteriyor.
- `webapp/src/locales/tr/common.json`: Yeni ana sayfa metinleri ve uyarılar eklendi, mevcut ipucu metni temizlendi.

**Testler**
- `npm run lint` (webapp)

**Notlar**
- Son gönderiler bölümü Supabase `posts` tablosundan en güncel 3 kaydı çeker; hata durumunda kullanıcıya bilgi verilir.
