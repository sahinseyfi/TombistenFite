# Codex İçin Ajan Rehberi

Bu dosya FitCrew Focus deposunda görev alacak ajanların tek referans kaynağıdır. Varsayılan ürün ve iletişim dili **Türkçe** olmalıdır.

## Genel İlkeler
- Kullanıcı tek oturumda tarif edilen planı (S01…S14) adım adım tamamlamayı bekler; her adım sonunda:
  1. Kod değişikliklerini kaydet.
  2. Adı spesifik commit mesajıyla (`chore:init`, `feat:prisma models`, …) `git commit` oluştur.
  3. `pnpm typecheck && pnpm build` veya ilgili smoke/test komutlarını çalıştır.
  4. “Durum & Sonraki Adım” metni paylaş.
- Harici dosya talimatları (örn. `docs/BACKEND_HANDOFF.md`) tek doğruluk kaynağıdır; çelişki varsa işlemlere başlamadan kullanıcıya bildir.
- Değişiklik limitini (~30 dosya/adım) aşmamak için büyük işleri parçala.
- Mobil öncelikli tasarım: 360–430px arası viewport, güvenli alanlara (`pt-safe`/`pb-safe`) dikkat et.

## Komutlar ve Araçlar
- Paket yöneticisi: **pnpm** (`pnpm install`, `pnpm typecheck`, `pnpm build`, `pnpm dev`, `pnpm prisma migrate dev`).
- ORM: Prisma + PostgreSQL. Redis rate limit ve S3 presign süreçleri gereklidir.
- UI: Next.js App Router + Tailwind + shadcn/ui + lucide-react + Recharts.
- Lint/format: `next lint`, `prettier --write .`. Tailwind sınıf sırası için `prettier-plugin-tailwindcss` aktiftir.
- Test çerçevesi: Vitest (gerekince `pnpm vitest`).

## Dosya ve Yapı
- Kaynak kodu `src/` altında, App Router sayfaları `src/app`.
- Geçici Vite sayfaları `src/legacy_pages/` klasöründe sadece referans içindir.
- Ortam değişkenleri `.env` dosyalarında tutulur; örnek değerler `.env.example` içerisinde güncel tutulmalıdır.
- Dokümantasyon: API kuralları `docs/BACKEND_HANDOFF.md`; mobil UX rehberi `docs/UX_MOBILE_GUIDE.md` (mevcut değilse kullanıcıdan doğrulama alın).
- Transkriptler: Her önemli yanıt `docs/transcripts/transcript-N.md` dosyalarına eklenmelidir (N artan).

## Çalışma Akışı
1. Adımı planla ve gerekiyorsa `update_plan` aracıyla paylaş.
2. Değişiklikleri yaparken `apply_patch` kullan; otomatik komutların ürettiği dosyaları olduğu gibi kaydet.
3. Testleri koş; hata alırsan düzeltip yeniden dene. Çözülemiyorsa `PAUSE_REQUIRED` ile durum raporla.
4. Kullanıcıdan manuel komut isteme; gerekirse yardım komutları için `scripts/` veya `Makefile` hedefi ekle.
5. Harici erişim gerektiren komutlar için (ör. ağ, yükseltilmiş izin) kullanıcı politikalarına göre hareket et; mevcut oturumda `approval_policy=never` olduğundan alternatif çözüm bul.

## İletişim ve Raporlama
- Mesajlar kısa, net ve iş odaklı olsun; gereksiz formatlama veya İngilizce terimler kullanma.
- Raporlarda dosya referansları `path:line` biçiminde tek satır olarak verilmeli; satır aralıkları kullanılmamalıdır.
- Tamamlanan adımlarda kısa özet + test sonuçları + sıradaki adım belirtilmelidir.

## Güvenlik ve Gizlilik
- Hiçbir gizli anahtarı commit etme; yeni değişken eklerken `.env.example` ve varsa `README` güncellenmeli.
- Kullanıcı verilerinde PII koruması, AI çıktılarında KVKK uyumluluğu ve spam/rate-limit kuralları gözetilmelidir.

Bu rehberde yer almayan konularda öncelikle `docs/BACKEND_HANDOFF.md` ve proje içi yönergeler esas alınmalıdır. Şüpheli durumlarda kullanıcıyla tekrar netleştirilmeden ilerleme.
