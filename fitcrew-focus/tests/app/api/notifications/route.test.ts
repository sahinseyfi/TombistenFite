import { describe, expect, it, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";

const {
  authenticateMock,
  listNotificationsMock,
  getUnreadCountMock,
  serializeNotificationMock,
} = vi.hoisted(() => ({
  authenticateMock: vi.fn(),
  listNotificationsMock: vi.fn(),
  getUnreadCountMock: vi.fn(),
  serializeNotificationMock: vi.fn(),
}));

vi.mock("@/server/auth/session", () => ({
  authenticate: authenticateMock,
}));

vi.mock("@/server/notifications", () => ({
  listNotifications: listNotificationsMock,
  getUnreadCount: getUnreadCountMock,
}));

vi.mock("@/server/serializers/notification", () => ({
  serializeNotification: serializeNotificationMock,
}));

import { GET } from "@/app/api/notifications/route";

function buildRequest(url: string) {
  return new NextRequest(url);
}

describe("GET /api/notifications", () => {
  beforeEach(() => {
    authenticateMock.mockReset();
    listNotificationsMock.mockReset();
    getUnreadCountMock.mockReset();
    serializeNotificationMock.mockReset();
  });

  it("oturum yoksa 401 dondurur", async () => {
    authenticateMock.mockReturnValueOnce(null);

    const response = await GET(buildRequest("https://app.local/api/notifications"));

    expect(response.status).toBe(401);
    expect(listNotificationsMock).not.toHaveBeenCalled();
  });

  it("gecersiz limit parametresinde 422 dondurur", async () => {
    authenticateMock.mockReturnValueOnce({ sub: "user-1" });

    const response = await GET(buildRequest("https://app.local/api/notifications?limit=abc"));

    expect(response.status).toBe(422);
    const body = await response.json();
    expect(body.error.code).toBe("validation_error");
    expect(listNotificationsMock).not.toHaveBeenCalled();
  });

  it("invalid cursor hatasini 400 olarak dondurur", async () => {
    authenticateMock.mockReturnValueOnce({ sub: "user-1" });

    const response = await GET(buildRequest("https://app.local/api/notifications?cursor=bad"));

    expect(response.status).toBe(422);
    const body = await response.json();
    expect(body.error.code).toBe("validation_error");
    expect(listNotificationsMock).not.toHaveBeenCalled();
  });

  it("bildirim listesini ve unread sayacini dondurur", async () => {
    authenticateMock.mockReturnValueOnce({ sub: "user-1" });
    listNotificationsMock.mockResolvedValueOnce({
      notifications: [{ id: "n1" }, { id: "n2" }],
      nextCursor: "n3",
    });
    serializeNotificationMock
      .mockReturnValueOnce({ id: "n1", type: "like" })
      .mockReturnValueOnce({ id: "n2", type: "comment" });
    getUnreadCountMock.mockResolvedValueOnce(5);

    const response = await GET(buildRequest("https://app.local/api/notifications?limit=25&unreadOnly=true"));

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.notifications).toEqual([
      { id: "n1", type: "like" },
      { id: "n2", type: "comment" },
    ]);
    expect(body.nextCursor).toBe("n3");
    expect(body.unreadCount).toBe(5);

    expect(listNotificationsMock).toHaveBeenCalledWith("user-1", {
      cursor: undefined,
      limit: 25,
      unreadOnly: true,
    });
    expect(getUnreadCountMock).toHaveBeenCalledWith("user-1");
  });
});
