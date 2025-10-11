import { describe, expect, it, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";

const { authenticateMock, acknowledgeAllMock, getUnreadCountMock } = vi.hoisted(() => ({
  authenticateMock: vi.fn(),
  acknowledgeAllMock: vi.fn(),
  getUnreadCountMock: vi.fn(),
}));

vi.mock("@/server/auth/session", () => ({
  authenticate: authenticateMock,
}));

vi.mock("@/server/notifications", () => ({
  acknowledgeAllNotifications: acknowledgeAllMock,
  getUnreadCount: getUnreadCountMock,
}));

import { POST } from "@/app/api/notifications/ack-all/route";

function buildRequest(url: string, init?: ConstructorParameters<typeof NextRequest>[1]) {
  return new NextRequest(url, init);
}

describe("POST /api/notifications/ack-all", () => {
  beforeEach(() => {
    authenticateMock.mockReset();
    acknowledgeAllMock.mockReset();
    getUnreadCountMock.mockReset();
  });

  it("oturum olmadan 401 dondurur", async () => {
    authenticateMock.mockReturnValueOnce(null);

    const response = await POST(buildRequest("https://app.local/api/notifications/ack-all"));

    expect(response.status).toBe(401);
    expect(acknowledgeAllMock).not.toHaveBeenCalled();
  });

  it("tumunu okundu isaretleyip kalan sayiyi dondurur", async () => {
    authenticateMock.mockReturnValueOnce({ sub: "user-1" });
    acknowledgeAllMock.mockResolvedValueOnce(4);
    getUnreadCountMock.mockResolvedValueOnce(0);

    const response = await POST(buildRequest("https://app.local/api/notifications/ack-all"));

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.updated).toBe(4);
    expect(body.unreadCount).toBe(0);

    expect(acknowledgeAllMock).toHaveBeenCalledWith("user-1");
    expect(getUnreadCountMock).toHaveBeenCalledWith("user-1");
  });
});
