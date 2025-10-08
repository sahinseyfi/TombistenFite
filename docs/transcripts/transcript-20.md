themeColor uyarısını viewport çıktısına taşıdım ve DaisyUI'nin @property kullanımı için postcss düzeyinde çözüm ekledim.
- webapp/src/app/layout.tsx:17 → Metadata'daki themeColor alanını kaldırıp yeni viewport tanımıyla değeri Next.js'in önerdiği akışa taşıdım.
- webapp/src/app/globals.css:1,4 → DaisyUI eklentisini include/exclude desteğiyle `properties` paketini dışlayacak şekilde konfigüre ettim ve `--radialprogress` için kök değişkenin varsayılanını ekledim.
- webapp/postcss/removeRadialProgress.mjs:1 → LightningCSS erken aşamada uyarı vermesin diye tüm @property tanımlarını yakalayıp başlangıç değerlerini :root bloğuna çeviren özel postcss eklentisini ekledim.
- webapp/postcss.config.mjs:1 → Yeni eklentiyi tailwind zincirine dahil ettim.

Testler: npm run lint, npm run test, npm run build (uyarı üretmeden tamamlandı).
