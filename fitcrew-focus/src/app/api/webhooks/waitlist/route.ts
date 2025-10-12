import { NextRequest } from "next/server";
import { env } from "@/env";
import { jsonError, jsonSuccess } from "@/server/api/responses";
import {
  handleWaitlistWebhook,
  verifyWaitlistSignature,
  type WaitlistWebhookPayload,
} from "@/server/referrals/waitlist";

export async function POST(request: NextRequest) {
  if (!env.WAITLIST_WEBHOOK_SECRET) {
    return jsonError(
      {
        code: "webhook_disabled",
        message: "Waitlist webhook gizli anahtari tanimlanmadigi icin entegrasyon devre disi.",
      },
      503,
    );
  }

  const signature = request.headers.get("x-waitlist-signature");
  const rawBody = await request.text();

  if (!verifyWaitlistSignature(rawBody, signature)) {
    return jsonError(
      {
        code: "invalid_signature",
        message: "Webhook imzasi dogrulanamadi.",
      },
      401,
    );
  }

  let payload: WaitlistWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as WaitlistWebhookPayload;
  } catch {
    return jsonError(
      {
        code: "invalid_body",
        message: "Webhook govdesi JSON olarak parse edilemedi.",
      },
      400,
    );
  }

  const result = await handleWaitlistWebhook(payload);

  const body = {
    status: result.status,
    action: "action" in result ? result.action : undefined,
    updated: "updated" in result ? result.updated : undefined,
    reason: "reason" in result ? result.reason : undefined,
  };

  const statusCode = result.status === "ignored" ? 202 : result.status === "not_found" ? 404 : 200;

  return jsonSuccess(body, { status: statusCode });
}
