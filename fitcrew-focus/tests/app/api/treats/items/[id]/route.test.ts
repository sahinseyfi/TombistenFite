import { describe, expect, it, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";
import { TreatPortion } from "@prisma/client";

const {
  authenticateMock,
  treatItemFindFirstMock,
  treatItemUpdateMock,
  treatItemDeleteManyMock,
} = vi.hoisted(() => ({
  authenticateMock: vi.fn(),
  treatItemFindFirstMock: vi.fn(),
  treatItemUpdateMock: vi.fn(),
  treatItemDeleteManyMock: vi.fn(),
}));

vi.mock("@/server/auth/session", () => ({
  authenticate: authenticateMock,
}));

vi.mock("@/server/db", () => ({
  prisma: {
    treatItem: {
      findFirst: treatItemFindFirstMock,
      update: treatItemUpdateMock,
      deleteMany: treatItemDeleteManyMock,
    },
  },
}));

import { PATCH, DELETE } from "@/app/api/treats/items/[id]/route";

function buildRequest(url: string, init?: ConstructorParameters<typeof NextRequest>[1]) {
  return new NextRequest(url, init);
}

const baseItem = {
  id: "treat-1",
  userId: "user-1",
  name: "Baklava",
  photoUrl: "https://cdn.local/treats/baklava.jpg",
  kcalHint: "400 kcal",
  portions: [TreatPortion.SMALL, TreatPortion.MEDIUM],
  createdAt: new Date("2025-10-10T10:00:00.000Z"),
  updatedAt: new Date("2025-10-10T10:00:00.000Z"),
};

describe("/api/treats/items/[id]", () => {
  beforeEach(() => {
    authenticateMock.mockReset();
    treatItemFindFirstMock.mockReset();
    treatItemUpdateMock.mockReset();
    treatItemDeleteManyMock.mockReset();
  });

  it("kacamak bulunamazsa 404 dondurur", async () => {
    authenticateMock.mockReturnValueOnce({ sub: "user-1" });
    treatItemFindFirstMock.mockResolvedValueOnce(null);

    const response = await PATCH(
      buildRequest("https://app.local/api/treats/items/treat-1", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: "Yeni Ad" }),
      }),
      { params: { id: "treat-1" } },
    );

    expect(response.status).toBe(404);
    expect(treatItemUpdateMock).not.toHaveBeenCalled();
  });

  it("kacamak gunceller", async () => {
    authenticateMock.mockReturnValueOnce({ sub: "user-1" });
    treatItemFindFirstMock.mockResolvedValueOnce(baseItem);
    treatItemUpdateMock.mockResolvedValueOnce({
      ...baseItem,
      name: "Yeni Ad",
      portions: [TreatPortion.SMALL],
      updatedAt: new Date("2025-10-11T10:00:00.000Z"),
    });

    const response = await PATCH(
      buildRequest("https://app.local/api/treats/items/treat-1", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: "Yeni Ad",
          portions: ["small"],
        }),
      }),
      { params: { id: "treat-1" } },
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.item.name).toBe("Yeni Ad");
    expect(body.item.portions).toEqual(["small"]);

    expect(treatItemUpdateMock).toHaveBeenCalledWith({
      where: { id: "treat-1" },
      data: expect.objectContaining({
        name: "Yeni Ad",
      }),
    });
  });

  it("kacamak siler", async () => {
    authenticateMock.mockReturnValueOnce({ sub: "user-1" });
    treatItemDeleteManyMock.mockResolvedValueOnce({ count: 1 });

    const response = await DELETE(
      buildRequest("https://app.local/api/treats/items/treat-1", {
        method: "DELETE",
      }),
      { params: { id: "treat-1" } },
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
  });
});
