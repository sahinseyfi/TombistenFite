**Durum**
- `fix(nav): bottom tab rotasini typed route ile uyumla` (4ed3870) ve `fix(api): error nedenini destekle ve node typings uyumla` (06b6b2b) commitleriyle Next.js typedRoutes derleme hatalarini giderdim.
- `BottomTabBar` icin `Route` tipini kullandim; `ApiError` sinifinda `cause` alanini elle saklayarak Node 18 typings uyumsuzlugunu duzelttim.

**Testler**
- `pnpm test`

**Dagitim**
- `env VERCEL_TOKEN=*** vercel --prod --yes` → Production: https://fitcrew-focus-9azcn14ze-sahin-seyfis-projects.vercel.app
