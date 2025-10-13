import { NextRequest } from "next/server";
import { authenticate } from "@/server/auth/session";
import { jsonError } from "@/server/api/responses";
import { getUnreadCount } from "@/server/notifications";
import { subscribeNotifications } from "@/server/notifications/stream";

const encoder = new TextEncoder();

type StreamEvent =
  | { type: "connected"; unreadCount: number }
  | { type: "refresh" }
  | { type: "unread"; unreadCount: number }
  | { type: "ping"; ts: number };

function serialize(event: StreamEvent) {
  return `data: ${JSON.stringify(event)}\n\n`;
}

export async function GET(request: NextRequest) {
  const session = authenticate(request);
  if (!session) {
    return jsonError({ code: "unauthorized", message: "Bildirim akışına erişim için giriş yapmalısınız." }, 401);
  }

  const initialUnread = await getUnreadCount(session.sub);

  let cleanup: (() => void) | null = null;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(encoder.encode("retry: 5000\n\n"));
      controller.enqueue(encoder.encode(serialize({ type: "connected", unreadCount: initialUnread })));

      const pushEvent = (event: StreamEvent) => {
        controller.enqueue(encoder.encode(serialize(event)));
      };

      const unsubscribe = subscribeNotifications(session.sub, (event) => {
        if (event.type === "refresh") {
          pushEvent({ type: "refresh" });
        } else if (event.type === "unread") {
          pushEvent({ type: "unread", unreadCount: event.unreadCount });
        }
      });

      const pingInterval = setInterval(() => {
        pushEvent({ type: "ping", ts: Date.now() });
      }, 15_000);

      const abort = () => {
        clearInterval(pingInterval);
        unsubscribe();
        controller.close();
      };

      cleanup = abort;

      request.signal?.addEventListener("abort", abort, { once: true });
    },
    cancel() {
      if (cleanup) {
        cleanup();
      }
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
