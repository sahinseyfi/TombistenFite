Bu transkript, iPhone uyumlu safe-area ve viewport uygulamalarını kapsar.

---

Ne yaptım
- `webapp/src/app/layout.tsx`: `viewport` ayarına `width=device-width`, `initialScale=1`, `viewportFit='cover'` eklendi. İç sarmalayıcı `max-w-screen-sm/md` ve `pt-safe px-safe pb-24` ile güncellendi.
- `webapp/src/components/BottomNav.tsx`: Alt navigasyona `pb-safe` + `shadow-lg` eklendi (gesture bar çakışmasını önler).
- `webapp/src/app/globals.css`: Safe area CSS değişkenleri ve yardımcı sınıflar (`pt-safe`, `pb-safe`, `px-safe`) eklendi.
- Testler: `npm test` çalıştırıldı; tüm testler geçti.

Beklenen etki
- iPhone kenar/çentik ve alt gesture bar ile çakışma kalkar.
- İçerik mobilde tek sütunda daha okunaklı genişlikte görünür.

Not
- Alt çubuk sabit kaldığı için içerik altına `pb-24` bırakıldı; gerektiğinde yükseklik ayarı projeye özel ince ayarlanabilir.

