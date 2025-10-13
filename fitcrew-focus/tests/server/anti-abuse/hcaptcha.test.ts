import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { verifyHCaptcha } from "@/server/anti-abuse/hcaptcha";

describe("verifyHCaptcha", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("returns error when response token missing", async () => {
    const result = await verifyHCaptcha("", { secretOverride: "secret" });
    expect(result.ok).toBe(false);
    expect(result.errorCode).toBe("missing_response");
  });

  it("skips verification when secret missing in non-production", async () => {
    const result = await verifyHCaptcha("token", {
      secretOverride: null,
      allowSkipIfSecretMissing: true,
    });
    expect(result.ok).toBe(true);
    expect(result.skipped).toBe(true);
  });

  it("verifies token against hCaptcha API", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    } as Response);
    global.fetch = mockFetch;

    const result = await verifyHCaptcha("token-123", { secretOverride: "secret" });

    expect(result.ok).toBe(true);
    expect(mockFetch).toHaveBeenCalledWith(
      "https://hcaptcha.com/siteverify",
      expect.objectContaining({
        method: "POST",
      }),
    );
  });
});
