# Repository Guidelines

Bu belge, bu depoya katkıda bulunurken uyulacak kuralları özetler. Varsayılan ürün ve iletişim dili: Türkçe.

## Proje Yapısı ve Modül Organizasyonu
- Kaynak kodu: `src/` (örn. `src/<paket>/`, `src/<ProjeAdi>/`).
- Testler: `tests/` yapısı `src/` ile aynıdır (gerekirse `tests/fixtures/`).
- Komut dosyaları/araçlar: `scripts/` (Shell/PowerShell yardımcıları).
- Dokümanlar/varlıklar: `docs/`, `assets/`.
- Kök yapılandırmalar: `.editorconfig`, `.gitignore` ve dil/araç ayarları (`package.json`, `pyproject.toml`, `*.csproj`).

## Derleme, Test ve Geliştirme Komutları
- `make setup` — bağımlılıkları kurar. Örn: `npm ci`, `pip install -e .[dev]`, `dotnet restore`.
- `make dev` — yerel geliştirme/izleme. Örn: `npm run dev`, `dotnet watch run`.
- `make test` — birim testlerini çalıştırır. Örn: `npm test`, `pytest`, `dotnet test`.
- `make build` — üretim paketleri oluşturur. Örn: `npm run build`, `python -m build`, `dotnet build -c Release`.

## Kodlama Stili ve İsimlendirme
- `.editorconfig`e uyun. Varsayılanlar: JS/TS 2 boşluk; Python/C# 4 boşluk; UTF-8, LF.
- Biçimlendirme/denetim: `prettier` + `eslint` (JS/TS), `black` + `ruff` (Python), `dotnet format` (C#).
- İsimlendirme: dosya/fonksiyon `snake_case`, sınıf/tip `PascalCase`, CLI `kebab-case`.
- Fonksiyonları küçük ve yan etkisiz tutun; herkese açık API’leri kısaça belgelendirin (docstring/JSDoc/XML).

## Test Rehberi
- Çerçeveler: Jest/Vitest (JS/TS), Pytest (Python), xUnit/NUnit (C#).
- Testleri `tests/` altında `src/` ile aynı hiyerarşide konumlandırın; örn. `tests/foo/test_bar.py`, `tests/foo/bar.spec.ts`, veya `Project.Tests/`.
- Değişen kodda ≥%80 kapsama hedefleyin; hata düzeltmeleri için regresyon testi ekleyin.
- PR öncesi `make test` yeşil olmalıdır.

## Commit ve Pull Request Kuralları
- Conventional Commits kullanın: örn. `feat: skor tablosu eklendi`, `fix(ai): null hedef koruması`.
- Her PR tek bir mantıklı değişiklik içersin; açıklama, gerekçe ve gerekiyorsa ekran görüntüsü/log ekleyin.
- İlgili issue’ları bağlayın (`Fixes #123`) ve davranış değişince doküman/kayıtları güncelleyin.

## Güvenlik ve Yapılandırma
- Sırları commit etmeyin; `.env` kullanın ve varsayılanlar için `.env.example` sağlayın.
- Üçüncü parti lisansları gözden geçirin; mümkünse sürümleri sabitleyin.

## Dil ve Yerelleştirme
- Tüm UI metinleri, loglar ve hata mesajları Türkçe olmalıdır.
- Metinleri `i18n/` veya `locales/tr/` altında yönetin; anahtar tabanlı çeviri kullanın ve yeni metinleri burada ekleyin.

## Ajan Çalışma İlkeleri
- Kullanıcının kodlama bilgisi sınırlıdır; değişiklikler kullanıcıdan istenmez. Ajan, gerekli düzenlemeleri kendi token bütçesini kullanarak doğrudan uygular.
- Kısa bir plan paylaşın, onay gerektirmeyen işleri hemen uygulayın; yalnızca zorunlu politika/izin durumlarında onay isteyin.
- Komutları mümkün olduğunca ajan çalıştırsın; kullanıcıdan manuel komut/kurulum talep etmeyin. Gerekirse otomasyon için `scripts/` veya `Makefile` hedefleri ekleyin.
- Minimal ve odaklı diff üretin; mevcut stil ve dizin yapısına uyun.
- Her değişiklik sonrası ilgili dokümantasyonu (README, AGENTS.md, i18n) güncel tutun.

## UI ve Mobil Odak
- Hazır UI kütüphanesi kullanılacaktır. Tercih: Tailwind CSS + DaisyUI (mobil odaklı, hızlı prototipleme).
- Tasarım önceliği mobil cihazlar; masaüstü için yalnızca basit, akıcı genişleme yeterlidir.
- Bileşenler: mobil navigasyon (alt çubuk), kart tabanlı akış, form elemanları, diyalog/alt çekmece.

## Yol Haritası
- Güncel yol haritası: `docs/ROADMAP.md`
- Ajan, bu dosyayı tek doğruluk kaynağı olarak kabul eder ve yeni çalışmalarla birlikte günceller.
- Yeni özellik/karar sonrası ilgili maddeleri ROADMAP’e ve gerekli ise README/İş Listesi’ne işler.
