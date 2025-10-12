import crypto from "node:crypto";
import type { ReferralInvite } from "@prisma/client";
import { env } from "@/env";
import { prisma } from "@/server/db";

type RegisterContext = {
  inviterId: string;
  inviterHandle?: string | null;
  inviterName: string;
  referralCode: string;
};

type RegisterResult =
  | { registered: true; contactId?: string | null }
  | { registered: false; reason: "opt_in_disabled" | "missing_configuration" | "registration_error"; error?: unknown };

export async function registerWaitlistOptIn(
  invite: ReferralInvite,
  context: RegisterContext,
): Promise<RegisterResult> {
  if (!invite.waitlistOptIn) {
    return { registered: false, reason: "opt_in_disabled" };
  }

  if (!env.RESEND_API_KEY || !env.RESEND_WAITLIST_AUDIENCE_ID) {
    return { registered: false, reason: "missing_configuration" };
  }

  const [firstName, lastName] = splitName(invite.inviteeName ?? undefined);

  try {
    const response = await fetch("https://api.resend.com/contacts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        audienceId: env.RESEND_WAITLIST_AUDIENCE_ID,
        email: invite.inviteeEmail,
        firstName,
        lastName,
        unsubscribed: false,
        attributes: {
          inviterId: context.inviterId,
          inviterHandle: context.inviterHandle ?? undefined,
          inviterName: context.inviterName,
          referralCode: context.referralCode,
          inviteCode: invite.inviteCode,
        },
      }),
    });

    const payload = (await safeJson(response)) as { id?: string; data?: { id?: string } } | null;
    if (!response.ok) {
      console.error("Waitlist opt-in registration failed", {
        status: response.status,
        body: payload,
      });
      return { registered: false, reason: "registration_error" };
    }

    const contactId = payload?.id ?? payload?.data?.id ?? null;
    await prisma.referralInvite.update({
      where: { id: invite.id },
      data: {
        waitlistProvider: "resend",
        waitlistSubscriberId: contactId ?? undefined,
        waitlistSubscribedAt: new Date(),
      },
    });

    return { registered: true, contactId };
  } catch (error) {
    console.error("Waitlist opt-in registration encountered an unexpected error", error);
    return { registered: false, reason: "registration_error", error };
  }
}

function splitName(fullName?: string) {
  if (!fullName) {
    return [undefined, undefined] as const;
  }

  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0) {
    return [undefined, undefined] as const;
  }
  if (parts.length === 1) {
    return [parts[0], undefined] as const;
  }

  return [parts[0], parts.slice(1).join(" ")] as const;
}

async function safeJson(response: Response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export type WaitlistWebhookPayload = {
  id?: string | null;
  event: string;
  data?: {
    email?: string | null;
    audienceId?: string | null;
    subscribedAt?: string | null;
    unsubscribedAt?: string | null;
    subscriberId?: string | null;
  };
  meta?: Record<string, unknown>;
};

export type WaitlistWebhookResult =
  | { status: "updated"; action: "subscribed" | "unsubscribed"; updated: number }
  | { status: "not_found"; action: "subscribed" | "unsubscribed" }
  | { status: "ignored"; reason: "missing_email" | "unknown_event" };

export async function handleWaitlistWebhook(payload: WaitlistWebhookPayload): Promise<WaitlistWebhookResult> {
  const email = payload.data?.email;
  if (!email) {
    return { status: "ignored", reason: "missing_email" };
  }

  const normalizedEmail = normalizeEmail(email);
  const provider = typeof payload.meta?.provider === "string" ? payload.meta?.provider : "resend";

  if (payload.event === "contact.subscribed") {
    const subscribedAt = resolveDate(payload.data?.subscribedAt) ?? new Date();
    const result = await prisma.referralInvite.updateMany({
      where: { inviteeEmail: normalizedEmail },
      data: {
        waitlistOptIn: true,
        waitlistProvider: provider,
        waitlistSubscriberId: payload.data?.subscriberId ?? payload.id ?? null,
        waitlistSubscribedAt: subscribedAt,
      },
    });

    if (result.count === 0) {
      return { status: "not_found", action: "subscribed" };
    }
    return { status: "updated", action: "subscribed", updated: result.count };
  }

  if (payload.event === "contact.unsubscribed") {
    const result = await prisma.referralInvite.updateMany({
      where: { inviteeEmail: normalizedEmail },
      data: {
        waitlistOptIn: false,
        waitlistSubscriberId: null,
        waitlistSubscribedAt: payload.data?.unsubscribedAt ? resolveDate(payload.data.unsubscribedAt) : null,
      },
    });

    if (result.count === 0) {
      return { status: "not_found", action: "unsubscribed" };
    }
    return { status: "updated", action: "unsubscribed", updated: result.count };
  }

  return { status: "ignored", reason: "unknown_event" };
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function resolveDate(value?: string | null) {
  if (!value) {
    return null;
  }

  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) {
    return null;
  }

  return new Date(timestamp);
}

export function verifyWaitlistSignature(rawBody: string, signature: string | null): boolean {
  if (!signature || !env.WAITLIST_WEBHOOK_SECRET) {
    return false;
  }

  const hmac = crypto.createHmac("sha256", env.WAITLIST_WEBHOOK_SECRET);
  hmac.update(rawBody, "utf8");
  const digest = hmac.digest("hex");

  const signatureBuffer = Buffer.from(signature, "hex");
  const digestBuffer = Buffer.from(digest, "hex");

  if (signatureBuffer.length !== digestBuffer.length) {
    return false;
  }

  try {
    return crypto.timingSafeEqual(signatureBuffer, digestBuffer);
  } catch {
    return false;
  }
}
