import { describe, expect, it, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";

const { authenticateMock, upsertMock, deleteManyMock, findUserMock } = vi.hoisted(() => ({
  authenticateMock: vi.fn(),
  upsertMock: vi.fn(),
  deleteManyMock: vi.fn(),
  findUserMock: vi.fn(),
}));

vi.mock("@/server/auth/session", () => ({
  authenticate: authenticateMock,
}));

vi.mock("@/server/db", () => ({
  prisma: {
    follow: {
      upsert: upsertMock,
      deleteMany: deleteManyMock,
    },
  },
}));

vi.mock("@/server/users/utils", () => ({
  findUserByIdentifier: findUserMock,
}));

import { POST, DELETE } from "@/app/api/users/[id]/follow/route";

type NextRequestCtorInit = ConstructorParameters<typeof NextRequest>[1];

function buildRequest(url: string, init?: NextRequestCtorInit) {
  return new NextRequest(url, init);
}

describe("POST /api/users/[id]/follow", () => {
  beforeEach(() => {
    authenticateMock.mockReset();
    upsertMock.mockReset();
    deleteManyMock.mockReset();
    findUserMock.mockReset();
  });

  it("oturum olmadan 401 dondurur", async () => {
    authenticateMock.mockReturnValueOnce(null);

    const response = await POST(buildRequest("https://app.local/api/users/u1/follow"), {
      params: { id: "u1" },
    } as any);

    expect(response.status).toBe(401);
    expect(upsertMock).not.toHaveBeenCalled();
  });

  it("kullanici bulunmadiginda 404 dondurur", async () => {
    authenticateMock.mockReturnValueOnce({ sub: "viewer-1" });
    findUserMock.mockResolvedValueOnce(null);

    const response = await POST(buildRequest("https://app.local/api/users/u1/follow"), {
      params: { id: "u1" },
    } as any);

    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body.error.code).toBe("not_found");
    expect(upsertMock).not.toHaveBeenCalled();
  });

  it("kendi kendini takip etmeye calisirsa 400 dondurur", async () => {
    authenticateMock.mockReturnValueOnce({ sub: "viewer-1" });
    findUserMock.mockResolvedValueOnce({ id: "viewer-1" });

    const response = await POST(buildRequest("https://app.local/api/users/viewer-1/follow"), {
      params: { id: "viewer-1" },
    } as any);

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error.code).toBe("validation_error");
    expect(upsertMock).not.toHaveBeenCalled();
  });

  it("takip kaydini olusturur veya gunceller", async () => {
    authenticateMock.mockReturnValueOnce({ sub: "viewer-2" });
    findUserMock.mockResolvedValueOnce({ id: "target-1" });
    upsertMock.mockResolvedValueOnce({ status: "ACCEPTED" });

    const response = await POST(buildRequest("https://app.local/api/users/target-1/follow"), {
      params: { id: "target-1" },
    } as any);

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.status).toBe("accepted");

    expect(upsertMock).toHaveBeenCalledWith({
      where: {
        followerId_followeeId: {
          followerId: "viewer-2",
          followeeId: "target-1",
        },
      },
      update: {
        status: "ACCEPTED",
        isCloseFriend: false,
      },
      create: {
        followerId: "viewer-2",
        followeeId: "target-1",
        status: "ACCEPTED",
      },
      select: { status: true },
    });
  });
});

describe("DELETE /api/users/[id]/follow", () => {
  beforeEach(() => {
    authenticateMock.mockReset();
    upsertMock.mockReset();
    deleteManyMock.mockReset();
    findUserMock.mockReset();
  });

  it("oturum olmadan 401 dondurur", async () => {
    authenticateMock.mockReturnValueOnce(null);

    const response = await DELETE(buildRequest("https://app.local/api/users/u1/follow"), {
      params: { id: "u1" },
    } as any);

    expect(response.status).toBe(401);
  });

  it("kullanici bulunmadiginda 404 dondurur", async () => {
    authenticateMock.mockReturnValueOnce({ sub: "viewer-1" });
    findUserMock.mockResolvedValueOnce(null);

    const response = await DELETE(buildRequest("https://app.local/api/users/u1/follow"), {
      params: { id: "u1" },
    } as any);

    expect(response.status).toBe(404);
    expect(deleteManyMock).not.toHaveBeenCalled();
  });

  it("takip kaydini siler", async () => {
    authenticateMock.mockReturnValueOnce({ sub: "viewer-3" });
    findUserMock.mockResolvedValueOnce({ id: "target-2" });
    deleteManyMock.mockResolvedValueOnce({ count: 1 });

    const response = await DELETE(buildRequest("https://app.local/api/users/target-2/follow"), {
      params: { id: "target-2" },
    } as any);

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(deleteManyMock).toHaveBeenCalledWith({
      where: { followerId: "viewer-3", followeeId: "target-2" },
    });
  });
});
