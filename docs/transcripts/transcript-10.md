# Transcript 10 - Ana sayfa kahraman güncellemesi

Ana sayfadaki kahraman içeriğini ürün odaklı hale getirdim ve son gönderiler başlığını güncelledim.

- `webapp/src/app/page.tsx#L78` oturum durumuna göre kahraman CTA'larını oluşturan yapı ve yeni kahraman yerleşimi.
- `webapp/src/app/page.tsx#L155` son gönderiler açıklamasını geliştirerek geliştirici notunu kaldırdım.
- `webapp/src/locales/tr/common.json#L41` yeni kahraman metinleri ve CTA anahtarlarını ekledim, eski Next.js talimatlarını kaldırdım.

Testler:
- `npm run lint`

1) Kahraman CTA'larının mobilde düğme genişliklerini gözlemleyip gerekirse `btn` varyantlarını inceleyebilirsin.

