import { describe, expect, it, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";
import { TreatPortion } from "@prisma/client";

const { authenticateMock, treatSpinFindFirstMock, treatSpinUpdateMock } = vi.hoisted(() => ({
  authenticateMock: vi.fn(),
  treatSpinFindFirstMock: vi.fn(),
  treatSpinUpdateMock: vi.fn(),
}));

vi.mock("@/server/auth/session", () => ({
  authenticate: authenticateMock,
}));

vi.mock("@/server/db", () => ({
  prisma: {
    treatSpin: {
      findFirst: treatSpinFindFirstMock,
      update: treatSpinUpdateMock,
    },
  },
}));

import { PATCH } from "@/app/api/treats/spins/[id]/route";

function buildRequest(url: string, init?: ConstructorParameters<typeof NextRequest>[1]) {
  return new NextRequest(url, init);
}

const baseSpin = {
  id: "spin-1",
  userId: "user-1",
  treatItemId: "treat-1",
  treatNameSnapshot: "Baklava",
  photoUrlSnapshot: null,
  kcalHintSnapshot: null,
  spunAt: new Date("2025-10-10T12:00:00.000Z"),
  portion: TreatPortion.MEDIUM,
  bonusWalkMin: 30,
  bonusCompleted: false,
  createdAt: new Date("2025-10-10T12:00:00.000Z"),
};

describe("/api/treats/spins/[id]", () => {
  beforeEach(() => {
    authenticateMock.mockReset();
    treatSpinFindFirstMock.mockReset();
    treatSpinUpdateMock.mockReset();
  });

  it("spin bulunamazsa 404 dondurur", async () => {
    authenticateMock.mockReturnValueOnce({ sub: "user-1" });
    treatSpinFindFirstMock.mockResolvedValueOnce(null);

    const response = await PATCH(
      buildRequest("https://app.local/api/treats/spins/spin-1", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ bonusCompleted: true }),
      }),
      { params: { id: "spin-1" } },
    );

    expect(response.status).toBe(404);
    expect(treatSpinUpdateMock).not.toHaveBeenCalled();
  });

  it("bonus durumunu gunceller", async () => {
    authenticateMock.mockReturnValueOnce({ sub: "user-1" });
    treatSpinFindFirstMock.mockResolvedValueOnce(baseSpin);
    treatSpinUpdateMock.mockResolvedValueOnce({
      ...baseSpin,
      bonusCompleted: true,
    });

    const response = await PATCH(
      buildRequest("https://app.local/api/treats/spins/spin-1", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ bonusCompleted: true }),
      }),
      { params: { id: "spin-1" } },
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.spin.bonusCompleted).toBe(true);
    expect(treatSpinUpdateMock).toHaveBeenCalledWith({
      where: { id: "spin-1" },
      data: { bonusCompleted: true },
    });
  });
});
