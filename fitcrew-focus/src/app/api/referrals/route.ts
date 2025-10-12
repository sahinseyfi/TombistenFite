import { NextRequest } from "next/server";
import { z } from "zod";
import { authenticate } from "@/server/auth/session";
import { jsonError, jsonSuccess } from "@/server/api/responses";
import {
  buildReferralShareUrl,
  createReferralInvite,
  getReferralDashboard,
  ReferralDuplicateEmailError,
} from "@/server/referrals/service";
import { serializeReferralInvite } from "@/server/serializers/referral";

const createReferralSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "E-posta adresi zorunludur.")
    .email("Lutfen gecerli bir e-posta adresi girin."),
  name: z
    .string()
    .trim()
    .min(1, "Ad/soyad bilgisi en az 1 karakter olmalidir.")
    .max(120, "Ad/soyad en fazla 120 karakter olabilir.")
    .optional(),
  waitlistOptIn: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  const session = authenticate(request);
  if (!session) {
    return jsonError({ code: "unauthorized", message: "Davet akisinizi gormek icin giris yapmalisiniz." }, 401);
  }

  const dashboard = await getReferralDashboard(session.sub);

  return jsonSuccess(
    {
      referral: {
        code: dashboard.code,
        shareUrl: buildReferralShareUrl(dashboard.code),
      },
      invites: dashboard.invites.map(serializeReferralInvite),
      summary: dashboard.summary,
    },
    { request },
  );
}

export async function POST(request: NextRequest) {
  const session = authenticate(request);
  if (!session) {
    return jsonError({ code: "unauthorized", message: "Davet gondermek icin giris yapmalisiniz." }, 401);
  }

  const payload = await request.json().catch(() => null);
  if (!payload) {
    return jsonError({ code: "invalid_body", message: "Gecersiz JSON govdesi alindi." }, 400);
  }

  const parsed = createReferralSchema.safeParse(payload);
  if (!parsed.success) {
    return jsonError(
      {
        code: "validation_error",
        message: "Davet bilgileri dogrulanamadi.",
        details: parsed.error.flatten(),
      },
      422,
    );
  }

  try {
    const invite = await createReferralInvite({
      inviterId: session.sub,
      email: parsed.data.email,
      name: parsed.data.name,
      waitlistOptIn: parsed.data.waitlistOptIn,
    });

    return jsonSuccess(
      {
        invite: serializeReferralInvite(invite),
      },
      201,
    );
  } catch (error) {
    if (error instanceof ReferralDuplicateEmailError) {
      return jsonError(
        {
          code: "invite_exists",
          message: "Bu e-posta adresine zaten davet gonderilmis.",
        },
        409,
      );
    }
    throw error;
  }
}
