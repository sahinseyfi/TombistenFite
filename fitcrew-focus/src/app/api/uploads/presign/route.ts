import { NextRequest } from "next/server";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { jsonError, jsonSuccess } from "@/server/api/responses";
import { createUploadPresign, buildPublicUrl } from "@/server/upload/s3";
import { env } from "@/env";

const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"] as const;
const maxFileSize = 10 * 1024 * 1024; // 10 MB
const maxDimension = 4096;
const presignTTL = 10 * 60; // 10 dakika

const requestSchema = z.object({
  mime: z.enum(allowedMimeTypes, { errorMap: () => ({ message: "Desteklenmeyen MIME tipi" }) }),
  size: z.number().int().positive().max(maxFileSize, "Dosya boyutu çok büyük"),
  ext: z.string().regex(/^[a-z0-9]+$/i, "Dosya uzantısı sadece alfanümerik olmalı"),
  width: z.number().int().positive().max(maxDimension).optional(),
  height: z.number().int().positive().max(maxDimension).optional(),
});

function ensureStorageAvailable() {
  if (!env.S3_BUCKET || !env.S3_ACCESS_KEY || !env.S3_SECRET_KEY) {
    return false;
  }
  return true;
}

export async function POST(request: NextRequest) {
  if (!ensureStorageAvailable()) {
    return jsonError(
      {
        code: "service_unavailable",
        message: "Dosya yükleme altyapısı şu anda kullanılamıyor.",
      },
      503,
    );
  }

  const payload = await request.json().catch(() => null);
  if (!payload) {
    return jsonError({ code: "invalid_body", message: "Geçersiz JSON gövdesi" }, 400);
  }

  const parsed = requestSchema.safeParse(payload);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    if (firstError?.path[0] === "mime") {
      return jsonError({ code: "INVALID_MIME_TYPE", message: "Desteklenmeyen dosya tipi" }, 422);
    }
    if (firstError?.path[0] === "size") {
      return jsonError({ code: "FILE_TOO_LARGE", message: "Dosya boyutu 10 MB sınırını aşıyor" }, 422);
    }
    if (firstError?.path[0] === "width" || firstError?.path[0] === "height") {
      return jsonError(
        { code: "INVALID_DIMENSIONS", message: "Görsel çözünürlüğü 4096x4096 sınırını aşamaz" },
        422,
      );
    }

    return jsonError(
      {
        code: "validation_error",
        message: "Geçersiz alanlar mevcut",
        details: parsed.error.flatten(),
      },
      422,
    );
  }

  const { mime, size, ext, width, height } = parsed.data;
  const now = new Date();
  const key = [
    "uploads",
    now.getUTCFullYear(),
    String(now.getUTCMonth() + 1).padStart(2, "0"),
    `${randomUUID()}.${ext.toLowerCase()}`,
  ].join("/");

  try {
    const presign = await createUploadPresign({
      key,
      contentType: mime,
      maxSize: maxFileSize,
      expiresInSeconds: presignTTL,
    });

    return jsonSuccess({
      upload: {
        url: presign.url,
        fields: presign.fields,
        method: "POST",
        expiresIn: presignTTL,
        maxSize: maxFileSize,
        notes: {
          exif: "EXIF metadata yükleme sonrası sunucuda temizlenecek",
          autoRotate: "Sunucu tarafında EXIF orientation bilgisine göre döndürülür",
        },
      },
      asset: {
        key,
        url: buildPublicUrl(key),
        contentType: mime,
        size,
        width,
        height,
      },
    });
  } catch (error) {
    console.error("Presign üretimi başarısız", error);
    return jsonError(
      {
        code: "presign_failed",
        message: "Yükleme URL'si oluşturulamadı",
      },
      500,
    );
  }
}
