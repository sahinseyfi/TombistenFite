**Özet**
- `fitcrew-focus/src/app/profile/page.tsx:1` dosyasındaki Next.js `Link` importunu kaldırıp harici davet URL'sini standart `a` etiketiyle açacak şekilde güncelledim.
- `fitcrew-focus/src/app/profile/page.tsx:75` bloğunda `href` kullanımına `rel="noopener noreferrer"` ekledim; typedRoutes kısıtının sebep olduğu derleme hatası kalktı.

**Testler**
- pnpm --dir fitcrew-focus build

**Sonraki Adımlar**
1. Vercel üzerinde yeni bir build tetikleyip dağıtımın sorunsuz tamamlandığını doğrula.
