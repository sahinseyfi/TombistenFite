# Transcript 16 - Realtime dayanıklılık ve yeni gönderi vurgusu

Akış sayfasındaki Supabase Realtime bağlantısını hata toleranslı hale getirip gelen yeni gönderileri vurguladım.
- webapp/src/app/akis/page.tsx:34 Realtime durum rozetleri, yeniden bağlanma düğmesi ve hata uyarısı eklendi; 20 kayıt sınırı korunurken yeni kayıtlar için rozet animasyonu tanımlandı.
- webapp/src/locales/tr/common.json:59 Realtime uyarı/açıklama metinleri ve rozet etiketleri için i18n anahtarları eklendi.
- docs/ROADMAP.md:105 Realtime görevi tamamlandı notuna ek olarak bağlantı hatası uyarısı ve yeni gönderi vurgusu kararını kaydettim.

Testler:
- `npm run lint`
- `npm run test`

Sonraki adımlar:
1) Realtime kanal hata durumlarında otomatik tekrar deneme sayısını ölçüp gerekirse exponential backoff uygulayabilirsin.
2) Yeni gönderi rozetini birkaç saniye sonra kaydırmak yerine kullanıcı etkileşimine göre (scroll/top) temizleyecek bir strateji düşünebilirsin.
