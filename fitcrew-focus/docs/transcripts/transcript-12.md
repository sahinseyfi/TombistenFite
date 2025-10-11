- Treat Wheel API'leri eklendi: `src/app/api/treats/items/route.ts:1`, `src/app/api/treats/items/[id]/route.ts:1`, `src/app/api/treats/spins/route.ts:1`, `src/app/api/treats/spins/[id]/route.ts:1` ve `src/app/api/treats/eligibility/route.ts:1` ile CRUD, spin ve hak sorgusu akışları mobil senaryolar için hazır hale getirildi.
- Eligibility ve RNG servisleri: `src/server/treats/config.ts:1`, `src/server/treats/rng.ts:1`, `src/server/treats/eligibility.ts:1` kilo ilerlemesi, cooldown ve dağılım kontrollerini sağlıyor; porsiyon dönüşümleri `src/server/treats/utils.ts:1` ile tek noktada toplandı.
- Yeni serileştirici ve testler: `src/server/serializers/treat.ts:1` API çıktısını normalize ediyor; regresyon `tests/server/treats/eligibility.test.ts:1`, `tests/app/api/treats/items/route.test.ts:1`, `tests/app/api/treats/items/[id]/route.test.ts:1`, `tests/app/api/treats/spins/route.test.ts:1`, `tests/app/api/treats/spins/[id]/route.test.ts:1` ve `tests/app/api/treats/eligibility/route.test.ts:1` ile güvence altına alındı.
- Dokümantasyon güncellendi: `docs/ROADMAP.md:1` ve `docs/PLAN_STATUS.md:1` S09'un tamamlandığını ve sonraki işleri yansıtıyor.
- Testler: `pnpm test`.
- Öneriler:
  1. S10 AI Comment için OpenAI entegrasyonu ve durum güncellemeleri akışını teknik taslak haline getirin.
  2. Post beğeni/rapor sayaçları ile yorum silme senaryoları için test backlog'unu genişletin.
