# Mobil-Öncelikli UX/UI Referansı (iPhone Uyumlu)

Bu kılavuz, TombistenFite arayüzlerini iPhone başta olmak üzere tüm mobil cihazlarda kusursuz ve kullanıcı dostu çalışacak şekilde tasarlamak için bağlayıcı standartları içerir. Tüm yeni ekranlar ve revizyonlar bu kurallara uymalıdır.

## Hedefler
- iPhone güvenli alanlarına (safe area) tam uyum
- Alt navigasyon odaklı, tek elle kullanım için optimize
- Net tipografi, yeterli kontrast, erişilebilir tap hedefleri (≥44×44 px)
- Akıcı performans ve yalın etkileşimler (gereksiz animasyon yok)

## Temel İlkeler
- Mobil‑öncelik: Tasarımı `base` (mobil) için yapın; yalnızca gerektiğinde `sm/md` ile genişletin.
- Güvenli alanlar: Notch/dynamic island ve alt gesture bar için boşluk bırakın.
- Tek sütun, kart akışı: İçeriği `max-w-screen-sm` veya `max-w-md` ile okunaklı tutun.
- Net hiyerarşi: Birincil işlemler belirgin, ikincil işlemler daha sönük olmalıdır.
- Durumlar: Yükleme iskeleti, boş durum, hata durumunu her ekranda tanımlayın.

## iPhone Güvenli Alan (Safe Area)
Safari/iOS’ta ekranın üst/altındaki alanlara taşmamak için:

1) `viewport` meta etiketi

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
```

2) Global CSS değişkenleri ve yardımcı sınıflar (Tailwind ile beraber)

```css
/* styles/globals.css veya app/globals.css */
:root {
  --safe-top: env(safe-area-inset-top);
  --safe-right: env(safe-area-inset-right);
  --safe-bottom: env(safe-area-inset-bottom);
  --safe-left: env(safe-area-inset-left);
}

.pt-safe { padding-top: max(var(--safe-top), 0px); }
.pb-safe { padding-bottom: max(var(--safe-bottom), 0px); }
.px-safe { padding-left: max(var(--safe-left), 0px); padding-right: max(var(--safe-right), 0px); }
```

3) Alt navigasyon ve sabit elemanlarda güvenli alanı kullanın

```html
<!-- DaisyUI btm-nav örneği -->
<nav class="btm-nav pb-safe shadow-lg bg-base-100">
  <!-- ... -->
  <a class="active">Ana Sayfa</a>
  <a>Akış</a>
  <a>Profil</a>
  <a>Ayarlar</a>
  <!-- ... -->
  <!-- pb-safe alt gesture bar ile çakışmayı önler -->
</nav>
```

Not: İsterseniz `tailwindcss-safe-area` eklentisi de kullanılabilir; ancak yukarıdaki basit yardımcılar çoğu senaryoya yeterlidir.

## Tipografi ve Dokunmatik Standartlar
- Temel yazı boyutu: `text-base` (≈16px). Başlık ve yardımcı metinleri buna göre katlayın.
- Satır yüksekliği: okuma akışı için `leading-relaxed` veya `leading-7`.
- Dokunmatik hedef: buton ve liste elemanlarında minimum yükseklik `h-11`/`h-12` (≥44px).
- Kenar boşlukları: `py-3 px-4` (buton/form) temel alın.

## Renk, Kontrast ve Durumlar
- Kontrast: WCAG AA (metin 4.5:1). DaisyUI tema tonlarını buna göre seçin.
- Durumlar: `hover:` yanında mutlaka `focus-visible:` ve `aria-*` durumlarını tanımlayın.
- Hata/metin mesajları Türkçe ve açık olmalı; mümkünse çözüm önerisi içermeli.

## Hareket ve Performans
- `prefers-reduced-motion` saygı: animasyonlarda alternatif kısa/none yolu sağlayın.
- Geçişler 150–250ms aralığında, büyük sıçramalar yerine küçük fade/scale.
- Görsel optimizasyonu: `next/image`, uygun `sizes` ve lazy yükleme.

## Düzen Kalıpları (Tailwind + DaisyUI)
- Kapsayıcı: `mx-auto max-w-screen-sm md:max-w-screen-md`
- Kart: `card bg-base-100 shadow-md rounded-2xl`
- Buton: `btn btn-primary h-11 min-h-11 px-4` (tap hedefi standardı)
- Alanlar: `form-control` + `input input-bordered` / `textarea textarea-bordered`
- Alt çubuk: `btm-nav pb-safe` (sabitlenmişse `fixed bottom-0 left-0 right-0`)

## App Router/Next.js Önerileri
- `app/layout.tsx` içinde meta/viewport tanımı ve kök sınıflar.
- Sayfa başları: `sticky top-0 z-30 backdrop-blur bg-base-100/80` + `.pt-safe`.
- Kaydırma çakışmalarına dikkat: yatay listelerde `snap-x` + `overscroll-x-contain`.

## PR “Mobil UX Checklist” (Zorunlu)
- [ ] iPhone güvenli alanları: üst/alt çakışma yok (`pt-safe`/`pb-safe`).
- [ ] Alt navigasyon veya sabit CTA, gesture bar ile çakışmıyor.
- [ ] Tap hedefleri ≥ 44×44px; `h-11`/`min-h-11` kullanıldı.
- [ ] Kontrast ve odak (focus-visible) durumları tanımlı.
- [ ] Yükleme/boş/hata durumları kurgulandı.
- [ ] Türkçe metinler, kısa ve anlaşılır.
- [ ] Yazı ve içerik max genişliği `max-w-screen-sm`/`md` ile sınırlı.
- [ ] Animasyonlar kısa; `prefers-reduced-motion` saygı var.
- [ ] Görsel/simge boyutları ve `next/image` kullanımı uygun.
- [ ] Gerçek cihaz/simülatörde 375×812, 390×844 ve 414×896 test edildi.

## Test Hedef Cihaz/Ölçüler
- iPhone X/XS/11 Pro: 375×812
- iPhone 12/13/14/15: 390×844
- iPhone 12/13/14/15 Pro Max: 428×926 veya 430×932

## Hızlı Başlangıç Örneği
```tsx
// app/layout.tsx (Next.js App Router)
export const metadata = { viewport: { width: 'device-width', initialScale: 1, viewportFit: 'cover' } };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" data-theme="light">
      <body className="min-h-dvh bg-base-200 text-base-content">
        <div className="min-h-dvh flex flex-col pt-safe pb-safe px-safe">
          {children}
        </div>
      </body>
    </html>
  );
}
```

Bu kılavuzdaki kurallar AGENTS.md tarafından zorunlu kılınır. PR açıklamasına “Mobil UX Checklist”i kopyalayın ve maddeleri işaretleyin.

