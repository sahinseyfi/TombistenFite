Kullanıcı: Yapışkan başlık istenmiyor; diğerlerini uygula.

Uygulananlar
- Dinamik alt boşluk: `globals.css` içine `.pb-btm-nav` eklendi; `--bottom-nav-h` + safe area ile hesaplanıyor.
- `layout.tsx` içerik sarmalayıcı `pb-btm-nav` kullanacak şekilde güncellendi.
- `BottomNav.tsx` yeniden yazıldı:
  - `ResizeObserver` ile yüksekliği ölçüp `--bottom-nav-h` değişkeni ayarlanıyor.
  - ARIA: `role="navigation"`, `aria-label="Alt gezinme"`, aktif linkte `aria-current="page"`.
  - İkonlar: inline SVG (home/feed/user/cog), aktif durumda `text-primary`.
  - Aktiflik: `/` tam eşleşir; diğerleri `startsWith` (alt yollar kapsanır).
- Testler çalıştırıldı ve geçti.

Not
- Sticky header önerisi uygulanmadı (istenmediği için). Alt navigasyon `pb-safe` ile gesture bar çakışmasını önlüyor.

