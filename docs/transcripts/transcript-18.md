# Transcript 18 - PWA manifest ve ikonlar

PWA manifestini ekleyip ikonları düzenledim, tema metadata'sını güncelledim.
- webapp/src/app/manifest.ts:1 Manifest yapılandırması (name, start_url, ikonlar).
- webapp/public/icons/icon.svg ve icon-maskable.svg: PWA için vektör ikon seti.
- webapp/src/app/akis/page.tsx:26 Sıkıştırma yardımcıları manifest çalışmasıyla birlikte eklendi, tema rengine uygun hale getirildi.
- webapp/src/app/layout.tsx:6 Metadata’ya manifest, themeColor ve appleWebApp desteği ekledim.
- docs/ROADMAP.md:105 PWA maddesini tamamladım, README.md:45’e PWA notu ekledim.

Testler:
- `npm run lint`
- `npm run test`

Sonraki adımlar:
1) PWA’yı gerçek cihazlarda “Ana ekrana ekle” ile deneyip splash/launch ekranlarını doğrula.
2) Maskable ikon için farklı arka plan varyasyonları üretip koyu/açık modlara göre optimize et.
3) Firebase Messaging veya benzeri bir servisle push bildirim yol haritasını başlat.
