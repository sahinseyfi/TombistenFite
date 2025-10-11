import { describe, expect, it, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";
import { TreatPortion } from "@prisma/client";

const { authenticateMock, treatItemFindManyMock, treatItemCreateMock } = vi.hoisted(() => ({
  authenticateMock: vi.fn(),
  treatItemFindManyMock: vi.fn(),
  treatItemCreateMock: vi.fn(),
}));

vi.mock("@/server/auth/session", () => ({
  authenticate: authenticateMock,
}));

vi.mock("@/server/db", () => ({
  prisma: {
    treatItem: {
      findMany: treatItemFindManyMock,
      create: treatItemCreateMock,
    },
  },
}));

import { GET, POST } from "@/app/api/treats/items/route";

function buildRequest(url: string, init?: ConstructorParameters<typeof NextRequest>[1]) {
  return new NextRequest(url, init);
}

type TreatItemRecord = {
  id: string;
  userId: string;
  name: string;
  photoUrl: string | null;
  kcalHint: string | null;
  portions: TreatPortion[];
  createdAt: Date;
  updatedAt: Date;
};

function createItem(overrides?: Partial<TreatItemRecord>): TreatItemRecord {
  const date = new Date("2025-10-10T10:00:00.000Z");
  return {
    id: "treat-1",
    userId: "user-1",
    name: "Baklava",
    photoUrl: "https://cdn.local/treats/baklava.jpg",
    kcalHint: "400 kcal",
    portions: [TreatPortion.SMALL, TreatPortion.MEDIUM, TreatPortion.FULL],
    createdAt: date,
    updatedAt: date,
    ...(overrides ?? {}),
  };
}

describe("/api/treats/items", () => {
  beforeEach(() => {
    authenticateMock.mockReset();
    treatItemFindManyMock.mockReset();
    treatItemCreateMock.mockReset();
  });

  it("oturum yoksa 401 dondurur", async () => {
    authenticateMock.mockReturnValueOnce(null);

    const response = await GET(buildRequest("https://app.local/api/treats/items"));

    expect(response.status).toBe(401);
    expect(treatItemFindManyMock).not.toHaveBeenCalled();
  });

  it("yeni kacamak olusturur", async () => {
    authenticateMock.mockReturnValueOnce({ sub: "user-1" });
    treatItemCreateMock.mockResolvedValueOnce(
      createItem({
        portions: [TreatPortion.SMALL, TreatPortion.MEDIUM],
      }),
    );

    const response = await POST(
      buildRequest("https://app.local/api/treats/items", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: "Baklava",
          photoUrl: "https://cdn.local/treats/baklava.jpg",
          kcalHint: "400 kcal",
          portions: ["small", "medium"],
        }),
      }),
    );

    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.item.name).toBe("Baklava");
    expect(body.item.portions).toEqual(["small", "medium"]);

    expect(treatItemCreateMock).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: "user-1",
        name: "Baklava",
      }),
    });
  });

  it("gecersiz veri icin 422 dondurur", async () => {
    authenticateMock.mockReturnValueOnce({ sub: "user-1" });

    const response = await POST(
      buildRequest("https://app.local/api/treats/items", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: "",
        }),
      }),
    );

    expect(response.status).toBe(422);
    const body = await response.json();
    expect(body.error.code).toBe("validation_error");
    expect(treatItemCreateMock).not.toHaveBeenCalled();
  });
});
