Bu transkript, mobil UX/UI referans çalışmasının çıkış mesajını içerir.

---

Ne yaptım
- `docs/UX_MOBILE_GUIDE.md` eklendi: iPhone safe area, alt navigasyon, tipografi/tap hedefleri, DaisyUI+Tailwind kalıpları, Next.js App Router meta/yardımcı sınıflar ve bağlayıcı “Mobil UX Checklist”.
- `AGENTS.md` güncellendi: kılavuz zorunlu; PR’larda “Mobil UX Checklist” doldurma şartı eklendi.
- `docs/ROADMAP.md` notlara kılavuz bağlantısı ve uygulanacak safe‑area adımları işlendi.

Nasıl kullanılır
- Yeni/yenilenen her ekran için kılavuzdaki “Mobil UX Checklist”i PR açıklamasına kopyalayıp işaretleyin.
- iPhone güvenli alanları için `viewport-fit=cover` + `pt-safe`/`pb-safe` yardımcılarını kullanın; alt çubuklarda `pb-safe` zorunlu.

Sonraki adım (öneri)
- `app/layout.tsx`’e viewport meta ve `pt-safe/pb-safe` sarmalı; alt navigasyonu `btm-nav pb-safe` ile güncelleme. İsterseniz bunu da uygulayabilirim.

