import { env } from "@/env";

const VERIFY_ENDPOINT = "https://hcaptcha.com/siteverify";

export type HCaptchaVerificationResult = {
  ok: boolean;
  skipped?: boolean;
  errorCode?: string;
};

type VerifyOptions = {
  remoteIp?: string | null;
  secretOverride?: string | null;
  allowSkipIfSecretMissing?: boolean;
};

export async function verifyHCaptcha(
  responseToken: unknown,
  options: VerifyOptions = {},
): Promise<HCaptchaVerificationResult> {
  if (typeof responseToken !== "string" || responseToken.trim().length === 0) {
    return { ok: false, errorCode: "missing_response" };
  }

  const secret = options.secretOverride ?? env.HCAPTCHA_SECRET ?? null;
  const allowSkip =
    options.allowSkipIfSecretMissing ?? (env.NODE_ENV !== "production" && secret === null);

  if (!secret) {
    if (allowSkip) {
      return { ok: true, skipped: true, errorCode: "secret_missing" };
    }
    return { ok: false, errorCode: "secret_missing" };
  }

  const params = new URLSearchParams();
  params.set("secret", secret);
  params.set("response", responseToken.trim());

  if (options.remoteIp) {
    params.set("remoteip", options.remoteIp);
  }

  let verificationResponse: Response;
  try {
    verificationResponse = await fetch(VERIFY_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
      cache: "no-store",
    });
  } catch {
    return { ok: false, errorCode: "request_failed" };
  }

  if (!verificationResponse.ok) {
    return { ok: false, errorCode: "non_200_response" };
  }

  type HCaptchaPayload = {
    success?: boolean;
    "error-codes"?: string[];
  };

  let payload: HCaptchaPayload;
  try {
    payload = (await verificationResponse.json()) as HCaptchaPayload;
  } catch {
    return { ok: false, errorCode: "invalid_response" };
  }

  if (payload.success) {
    return { ok: true };
  }

  const code = Array.isArray(payload["error-codes"]) && payload["error-codes"].length > 0
    ? payload["error-codes"][0]
    : "verification_failed";

  return { ok: false, errorCode: code };
}
