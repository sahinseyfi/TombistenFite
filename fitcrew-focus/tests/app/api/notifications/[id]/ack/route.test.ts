import { describe, expect, it, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";

const {
  authenticateMock,
  findUniqueMock,
  acknowledgeNotificationsMock,
  getUnreadCountMock,
} = vi.hoisted(() => ({
  authenticateMock: vi.fn(),
  findUniqueMock: vi.fn(),
  acknowledgeNotificationsMock: vi.fn(),
  getUnreadCountMock: vi.fn(),
}));

vi.mock("@/server/auth/session", () => ({
  authenticate: authenticateMock,
}));

vi.mock("@/server/db", () => ({
  prisma: {
    notification: {
      findUnique: findUniqueMock,
    },
  },
}));

vi.mock("@/server/notifications", () => ({
  acknowledgeNotifications: acknowledgeNotificationsMock,
  getUnreadCount: getUnreadCountMock,
}));

import { PATCH } from "@/app/api/notifications/[id]/ack/route";

function buildRequest(url: string, init?: ConstructorParameters<typeof NextRequest>[1]) {
  return new NextRequest(url, init);
}

const notificationId = "ckv1example000000000000000";

describe("PATCH /api/notifications/[id]/ack", () => {
  beforeEach(() => {
    authenticateMock.mockReset();
    findUniqueMock.mockReset();
    acknowledgeNotificationsMock.mockReset();
    getUnreadCountMock.mockReset();
  });

  it("oturum yoksa 401 dondurur", async () => {
    authenticateMock.mockReturnValueOnce(null);

    const response = await PATCH(buildRequest(`https://app.local/api/notifications/${notificationId}/ack`), {
      params: { id: notificationId },
    } as any);

    expect(response.status).toBe(401);
    expect(findUniqueMock).not.toHaveBeenCalled();
  });

  it("gecersiz id icin 400 dondurur", async () => {
    authenticateMock.mockReturnValueOnce({ sub: "user-1" });

    const response = await PATCH(buildRequest("https://app.local/api/notifications/abc/ack"), {
      params: { id: "abc" },
    } as any);

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error.code).toBe("validation_error");
  });

  it("bildirim bulunamazsa 404 dondurur", async () => {
    authenticateMock.mockReturnValueOnce({ sub: "user-1" });
    findUniqueMock.mockResolvedValueOnce(null);

    const response = await PATCH(buildRequest(`https://app.local/api/notifications/${notificationId}/ack`), {
      params: { id: notificationId },
    } as any);

    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body.error.code).toBe("not_found");
  });

  it("zaten okunmus bildirim icin mevcut tarihi dondurur", async () => {
    const readAt = new Date("2025-10-11T12:00:00.000Z");
    authenticateMock.mockReturnValueOnce({ sub: "user-1" });
    findUniqueMock.mockResolvedValueOnce({
      id: notificationId,
      userId: "user-1",
      readAt,
    });
    getUnreadCountMock.mockResolvedValueOnce(2);

    const response = await PATCH(buildRequest(`https://app.local/api/notifications/${notificationId}/ack`), {
      params: { id: notificationId },
    } as any);

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.alreadyRead).toBe(true);
    expect(body.readAt).toBe(readAt.toISOString());
    expect(body.unreadCount).toBe(2);
    expect(acknowledgeNotificationsMock).not.toHaveBeenCalled();
  });

  it("okunmamis bildirimi ack edip yeni tarihi dondurur", async () => {
    const readAt = new Date("2025-10-11T12:05:00.000Z");
    authenticateMock.mockReturnValueOnce({ sub: "user-1" });
    findUniqueMock
      .mockResolvedValueOnce({
        id: notificationId,
        userId: "user-1",
        readAt: null,
      })
      .mockResolvedValueOnce({
        id: notificationId,
        userId: "user-1",
        readAt,
      });
    acknowledgeNotificationsMock.mockResolvedValueOnce(1);
    getUnreadCountMock.mockResolvedValueOnce(1);

    const response = await PATCH(buildRequest(`https://app.local/api/notifications/${notificationId}/ack`), {
      params: { id: notificationId },
    } as any);

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.alreadyRead).toBe(false);
    expect(body.readAt).toBe(readAt.toISOString());
    expect(body.unreadCount).toBe(1);

    expect(acknowledgeNotificationsMock).toHaveBeenCalledWith("user-1", [notificationId]);
    expect(getUnreadCountMock).toHaveBeenCalledWith("user-1");
  });
});
