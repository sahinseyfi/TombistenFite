**Durum**
- `git push origin main` ile `feat(app): mobil akis ekranlari ve fallback veri deneyimi` (2f12aca) ve `docs: transcript 37 kaydi` (cbf980a) commitlerini ana dali guncelledim.
- `bash -x ./scripts/vercel/deploy.sh fitcrew-focus/.env.local` denemesinde Vercel CLI, uzak projede tanimli `webapp` kok dizinini bekledigi icin `~\\Tombisten Fite\\TombistenFite\\webapp` yolunu bulamayip deployu reddetti.

**Testler**
- `pnpm test`

**Cozum Onerisi**
- Vercel kontrol panelinde `Project Settings → General → Root Directory` secenegini `fitcrew-focus` olarak guncelleyip ardindan `./scripts/vercel/deploy.sh fitcrew-focus/.env.local` komutunu yeniden calistirin.
