# Transcript 13 - CI hattı ve Vercel entegrasyonu

GitHub Actions üzerinde lint/test/build çalıştıran ve Vercel önizleme dağıtımını hazırlayan CI hattını ekledim.
- .github/workflows/ci.yml:1 Ana iş kalite denetimini (lint/test/build) ve koşullu Vercel dağıtımını içerecek şekilde yapılandırıldı.
- docs/ROADMAP.md:102 Backlog maddesi tamamlandı olarak işaretlendi, docs/ROADMAP.md:140 Vercel secret gereksinimlerini not etttim.
- README.md:26 Yeni make komutları ve README.md:39 GitHub Actions/Vercel secret rehberi eklendi.

Testler:
- `npm run lint`
- `npm run test`

Sonraki adımlar:
1) Supabase Realtime akış yenilemesini ekleyerek topluluk fazına başla.
2) Ayarlar sayfasında tema tercihi kalıcılığını Supabase profiline kaydet.
3) Vercel secrets (`VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`) değerlerini repo ayarlarında tanımla.
