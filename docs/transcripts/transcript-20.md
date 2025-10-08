Mobil odaklı UX düzenlemeleri aşağıdaki alanlara yayıldı:
- `webapp/src/app/akis/page.tsx:150` küçük vektör ikonları ekledim; aksiyon düğmelerinde metin/emoji yerine tutarlı svg ikonları kullanarak durumlara göre renk geçişleri sağladım.
- `webapp/src/app/akis/page.tsx:917` sayfa kabuğunu ve gönderi oluşturma kartını mobil öncelikli hale getirdim; kısıtlı genişlik, yastıklı boşluklar, yapışkan benzeri kompoz yazımı ve görsel seçme/temizleme akışını iyileştirdim.
- `webapp/src/app/akis/page.tsx:1002` feed kartlarında tipografi, görsel çerçevesi ve eylem çubuğunu yeniden düzenledim; like/comment butonları artık geniş dokunmatik alanlar ve durum renkleriyle okunabilir.
- `webapp/src/app/akis/page.tsx:1103` yorum çekmecesini yarı saydam alt tabakayla mobil alt sayfa (sheet) hissine getirdim; kapatma ikonu, daha rahat textarea, avatar/başlık hizalaması ve boş durum mesajları eklendi.

Testler:
- `npm run lint`
- `npm run test`
- `npm run build` (daisyUI `@property` ve Next.js `themeColor` uyarıları devam ediyor)

Sonraki adımlar:
1. `themeColor` metadata uyarılarını `generateViewport` yapılandırmasına taşıyarak Next.js build mesajını temizlemek.
2. DaisyUI'nin `@property --radialprogress` uyarısı için uyumlu bir fallback veya postcss yapılandırması eklemek.
