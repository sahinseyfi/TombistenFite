import { env } from "@/env";
import { getResendClient } from "@/server/emails/client";

export type ReferralInviteEmailContext = {
  to: string;
  inviteeName?: string | null;
  inviteCode: string;
  shareUrl: string;
  inviterName: string;
  inviterHandle?: string | null;
  waitlistOptIn?: boolean;
};

export type ReferralInviteEmailResult =
  | { sent: true; messageId?: string }
  | { sent: false; reason: "missing_configuration" | "send_error"; error?: unknown };

export async function sendReferralInviteEmail(
  context: ReferralInviteEmailContext,
): Promise<ReferralInviteEmailResult> {
  const resend = getResendClient();
  if (!resend || !env.RESEND_FROM_EMAIL) {
    return { sent: false, reason: "missing_configuration" };
  }

  try {
    const response = await resend.emails.send({
      from: env.RESEND_FROM_EMAIL,
      to: context.to,
      subject: `${context.inviterName}, FitCrew Focus ekibine seni davet ediyor`,
      html: renderReferralInviteHtml(context),
      text: renderReferralInviteText(context),
    });

    const messageId = typeof response === "object" && response && "id" in response ? (response as { id?: string }).id : undefined;
    return { sent: true, messageId };
  } catch (error) {
    console.error("Referral invite email could not be sent", error);
    return { sent: false, reason: "send_error", error };
  }
}

function renderReferralInviteHtml(context: ReferralInviteEmailContext) {
  const greeting = context.inviteeName ? `Merhaba ${context.inviteeName},` : "Merhaba,";
  const handleLine = context.inviterHandle
    ? `<p><strong>${context.inviterName}</strong> (@${context.inviterHandle}) FitCrew Focus toplulugunda seninle ilerlemek istiyor.</p>`
    : `<p><strong>${context.inviterName}</strong> FitCrew Focus toplulugunda seninle ilerlemek istiyor.</p>`;
  const waitlistLine = context.waitlistOptIn
    ? `<p>Bekleme listesine alinmak istedi\u011Fin icin tesekkurler. Daveti onayladiginda yeni ozellikler ve egitim oturumlarina oncelikli erisim kazanacaksin.</p>`
    : "";

  return `<!DOCTYPE html>
<html lang="tr">
  <head>
    <meta charset="UTF-8" />
    <title>FitCrew Focus Daveti</title>
  </head>
  <body style="font-family: Arial, sans-serif; color: #111827; background-color: #f8fafc; margin: 0; padding: 32px;">
    <table role="presentation" width="100%" style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; padding: 32px;">
      <tr>
        <td>
          <p style="font-size: 16px; margin: 0 0 16px 0;">${greeting}</p>
          ${handleLine}
          <p style="font-size: 16px; margin: 16px 0;">Davet kodun: <strong style="letter-spacing: 2px;">${context.inviteCode}</strong></p>
          <p style="font-size: 16px; margin: 16px 0;">Daveti kabul etmek ve FitCrew Focus uygulamasina katilmak icin asagidaki baglantiya tikla:</p>
          <p style="margin: 24px 0;">
            <a href="${context.shareUrl}" style="display: inline-block; background-color: #16a34a; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 999px; font-weight: bold;">
              Daveti Kullan
            </a>
          </p>
          ${waitlistLine}
          <p style="font-size: 14px; color: #4b5563; margin: 24px 0 0 0;">
            Bu e-postayi beklemiyorsan, gozardi edebilirsin. Herhangi bir sorunda <a href="mailto:support@fitcrew-focus.local">support@fitcrew-focus.local</a> adresinden bize ulasabilirsin.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function renderReferralInviteText(context: ReferralInviteEmailContext) {
  const lines = [
    context.inviteeName ? `Merhaba ${context.inviteeName},` : "Merhaba,",
    context.inviterHandle
      ? `${context.inviterName} (@${context.inviterHandle}) FitCrew Focus uygulamasinda seni davet ediyor.`
      : `${context.inviterName} FitCrew Focus uygulamasinda seni davet ediyor.`,
    "",
    `Davet kodun: ${context.inviteCode}`,
    `Daveti kullanmak icin baglanti: ${context.shareUrl}`,
  ];

  if (context.waitlistOptIn) {
    lines.push(
      "",
      "Bekleme listesine kaydolma istegini aldik. Daveti onayladiginda yeni ozelliklere erken erisim firsati yakalayacaksin.",
    );
  }

  lines.push(
    "",
    "Eger bu istegi sen yapmadiysan, bu e-postayi yok sayabilirsin.",
    "FitCrew Focus Destek",
  );

  return lines.join("\n");
}
