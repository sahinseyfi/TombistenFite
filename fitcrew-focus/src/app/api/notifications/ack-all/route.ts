import { NextRequest } from "next/server";
import { authenticate } from "@/server/auth/session";
import { jsonError, jsonSuccess } from "@/server/api/responses";
import { acknowledgeAllNotifications, getUnreadCount } from "@/server/notifications";

export async function POST(request: NextRequest) {
  const session = authenticate(request);
  if (!session) {
    return jsonError({ code: "unauthorized", message: "Bildirimleri guncellemek icin giris yapmalisiniz." }, 401);
  }

  const updated = await acknowledgeAllNotifications(session.sub);
  const unreadCount = await getUnreadCount(session.sub);

  return jsonSuccess({
    success: true,
    updated,
    unreadCount,
  });
}
