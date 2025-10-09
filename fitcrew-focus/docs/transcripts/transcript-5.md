**S04 Upload Presign**
- `src/app/api/uploads/presign/route.ts:1` MIME türü (`image/jpeg|png|webp`), 10 MB boyut ve 4096x4096 çözünürlük sınırıyla presigned POST üretiyor; eksik depolama konfigürasyonunda 503, geçersiz girdilerde `INVALID_MIME_TYPE`, `FILE_TOO_LARGE`, `INVALID_DIMENSIONS` hata gövdesi dönüyor.
- `src/server/upload/s3.ts:1` AWS S3 istemcisi ve presign yardımcılarını kapsıyor; lokal endpoint için `forcePathStyle` ve genel URL hesaplama sağlandı.
- `src/env.ts:1` varsayılan S3/JWT değerlerini geliştirici ortamı için düzenledim; yeni bağımlılık `@aws-sdk/s3-presigned-post` `package.json:1` ve `pnpm-lock.yaml:1` ile eklendi.
- Yanıtta EXIF temizleme ve auto-rotate notları döndürülüyor; istemcinin yükleme sınırlarını anlaması için süre ve boyut bilgileri de mevcut.

**Testler**
- `pnpm typecheck`
- `pnpm build`

**Durum & Sonraki Adım**
- S04 tamamlandı. S05’te gönderi feed & CRUD uçlarına geçeceğim.
