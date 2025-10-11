import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/server/db";
import { authenticate } from "@/server/auth/session";
import { jsonError, jsonSuccess } from "@/server/api/responses";
import { acknowledgeNotifications, getUnreadCount } from "@/server/notifications";

type RouteContext = {
  params: {
    id?: string | string[];
  };
};

const idSchema = z
  .string()
  .trim()
  .cuid("Bildirim kimligi gecerli bir cuid olmalidir.");

function parseId(raw: unknown) {
  if (typeof raw !== "string") {
    return null;
  }
  const parsed = idSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const session = authenticate(request);
  if (!session) {
    return jsonError({ code: "unauthorized", message: "Bildirimleri guncellemek icin giris yapmalisiniz." }, 401);
  }

  const notificationId = parseId(params.id);
  if (!notificationId) {
    return jsonError({ code: "validation_error", message: "Gecerli bir bildirim kimligi belirtmelisiniz." }, 400);
  }

  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
    select: { id: true, userId: true, readAt: true },
  });

  if (!notification || notification.userId !== session.sub) {
    return jsonError({ code: "not_found", message: "Bildirim bulunamadi." }, 404);
  }

  let readAt = notification.readAt;
  const alreadyRead = !!notification.readAt;

  if (!readAt) {
    await acknowledgeNotifications(session.sub, [notificationId]);
    const updated = await prisma.notification.findUnique({
      where: { id: notificationId },
      select: { readAt: true },
    });
    readAt = updated?.readAt ?? new Date();
  }

  const unreadCount = await getUnreadCount(session.sub);

  return jsonSuccess({
    success: true,
    readAt: readAt ? readAt.toISOString() : null,
    alreadyRead,
    unreadCount,
  });
}
