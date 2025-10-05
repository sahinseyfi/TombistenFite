# Transcript 14 - Tema tercihi ve profil ayarları

ThemeProvider ile tema tercihini Supabase profiline bağlayıp profil ekranından yönetilebilir hale getirdim.
- webapp/src/components/ThemeProvider.tsx:37 Uygulamayı sarmalayan sağlayıcı localStorage + Supabase üzerinden temayı senkronluyor.
- webapp/src/app/layout.tsx:6 Root layout ThemeProvider ile wrap edilerek tüm sayfalara tema durumu taşınıyor.
- webapp/src/app/profil/page.tsx:24 Profil ekranına tema toggle'ı, Supabase upsert ve yeni i18n metinleri eklendi.
- webapp/src/locales/tr/common.json:54 Tema ve profil metinleri için çeviri anahtarlarını genişlettim.
- supabase/migrations/20251005121500_add_theme_preference_to_profiles.sql:1 Profiles tablosuna theme_preference kolonu eklendi.
- docs/ROADMAP.md:103 Tema görevi tamamlandı olarak işaretlendi, ThemeProvider senkronu notlara işlendi.

Testler:
- `npm run lint`
- `npm run test`

Sonraki adımlar:
1) Supabase Realtime ile akış sayfasında canlı güncellemeyi etkinleştir.
2) Tema tercihinin oturum açmadan önce sistem/yerel ayardan okunması için preload script düşün.
3) Tema değişikliğini Ayarlar sayfasındaki diğer kontrollerle (ör. toggle, log out) entegre et.
