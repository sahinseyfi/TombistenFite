# Transcript 9 - Starter Kartı

Ana sayfaya onboarding odaklı Starter kartını ekledim; oturum durumuna göre yönlendirmeler güncellendi.

- `webapp/src/components/StarterCard.tsx#L1` yeni kart bileşeni üç adımlık kontrol listesi ve durum bazlı CTA'lar sağlıyor.
- `webapp/src/app/page.tsx#L6` Starter kartını ana sayfa akışına ekledim; var olan hızlı işlemler ve akış kartlarıyla aynı grid içinde çalışıyor.
- `webapp/src/locales/tr/common.json#L32` Starter kartı metinlerini i18n sözlüğüne ekledim, yeni CTA başlıklarıyla.
- `docs/ROADMAP.md#L66` yeni bileşeni yol haritası notlarına işledim.

Testler:
- `npm run lint`

1) Kartı gerçek cihazda test edip yoğun içerikli sayfalarda yerleşimi doğrulayabilirsin.

