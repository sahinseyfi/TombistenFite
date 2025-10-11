import { NextRequest } from "next/server";
import { z } from "zod";
import { authenticate } from "@/server/auth/session";
import { jsonError, jsonSuccess } from "@/server/api/responses";
import { getUnreadCount, listNotifications } from "@/server/notifications";
import { serializeNotification } from "@/server/serializers/notification";

const listQuerySchema = z.object({
  cursor: z
    .string()
    .trim()
    .cuid("Cursor parametresi gecerli bir kimlik olmalidir.")
    .optional(),
  limit: z
    .string()
    .optional()
    .refine(
      (value) => value === undefined || /^\d+$/.test(value.trim()),
      "limit parametresi pozitif bir sayi olmalidir.",
    )
    .transform((value) => (value === undefined ? undefined : Number.parseInt(value.trim(), 10))),
  unreadOnly: z
    .string()
    .optional()
    .transform((value) => value?.toLowerCase() === "true"),
});

export async function GET(request: NextRequest) {
  const session = authenticate(request);
  if (!session) {
    return jsonError({ code: "unauthorized", message: "Bildirimleri gormek icin giris yapmalisiniz." }, 401);
  }

  const params = request.nextUrl.searchParams;
  const parsed = listQuerySchema.safeParse({
    cursor: params.get("cursor") ?? undefined,
    limit: params.get("limit") ?? undefined,
    unreadOnly: params.get("unreadOnly") ?? undefined,
  });

  if (!parsed.success) {
    return jsonError(
      {
        code: "validation_error",
        message: "Bildirim listeleme parametreleri dogrulanamadi.",
        details: parsed.error.flatten(),
      },
      422,
    );
  }

  const query = parsed.data;

  try {
    const [result, unreadCount] = await Promise.all([
      listNotifications(session.sub, {
        cursor: query.cursor,
        limit: query.limit,
        unreadOnly: query.unreadOnly,
      }),
      getUnreadCount(session.sub),
    ]);

    return jsonSuccess(
      {
        notifications: result.notifications.map(serializeNotification),
        nextCursor: result.nextCursor ?? null,
        unreadCount,
      },
      { request },
    );
  } catch (error) {
    if (error && typeof error === "object" && (error as { code?: string }).code === "invalid_cursor") {
      return jsonError(
        {
          code: "invalid_cursor",
          message: "Gecersiz cursor parametresi belirtildi.",
        },
        400,
      );
    }
    throw error;
  }
}
