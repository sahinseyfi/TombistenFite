# Transcript 1 — Vercel Production Erişim Durumu ve Çözüm Önerileri

Tarih: 2025-10-04

Bu mesaj, üretim ortamında 404/401 hatalarının sebebini ve çözüm yollarını açıklar.

## Özet
- Proje Vercel’de `rootDirectory: webapp` olarak ayarlandı ve prod deploy yapıldı.
- Alias doğrulandı: `tombistenfite.vercel.app` son prod dağıtıma bağlı.
- Ancak Vercel’de “Protection/SSO” açık olduğu için vercel.app alanı anonim kullanıcılara 404/401 döndürür.

## Detaylar
- Ephemeral prod URL’ler (ör. `...-sahin-seyfis-projects.vercel.app`) 401 Unauthorized döndürüyor (koruma aktif).
- `tombistenfite.vercel.app` alias’ı, koruma modu nedeniyle dışarıdan 404 (NOT_FOUND) gösterebiliyor.
- API üzerinden `ssoProtection` kapatma denemesi, takım/politika nedeniyle etkisiz kaldı; panelden değiştirilebiliyor.

## Çözüm Seçenekleri
1) Protection’ı kapat (hızlı):
   - Vercel → Project → Settings → Protection → Production Protection: Off
   - Sonra `https://tombistenfite.vercel.app` herkese açık olur.
2) Özel domain ekle (koruma istisnası):
   - Project → Settings → Domains → Add domain
   - `all_except_custom_domains` modunda özel alan adı herkese açık olur.

## Durum ve Bağlantılar
- Kök dizin: `webapp` (kalıcı ayar)
- Son Inspect: https://vercel.com/sahin-seyfis-projects/tombistenfite/2j5V4mct3dDtSnEbpBiw3VUf2hAF
- Alias: https://tombistenfite.vercel.app

## Aksiyon İsteği
- Production’ı herkesin erişimine açmak için: Panelden Protection’ı kapat veya özel domain bildir; ayar/DNS kurulumunu ben yapayım.

