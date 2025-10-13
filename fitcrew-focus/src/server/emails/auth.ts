import { env } from "@/env";
import { getResendClient } from "@/server/emails/client";

type MailResult = {
  delivered: boolean;
  reason?: string;
};

type VerificationEmailParams = {
  email: string;
  name: string;
  token: string;
};

type PasswordResetEmailParams = VerificationEmailParams & {
  resetToken: string;
};

function buildVerificationUrl(token: string) {
  const baseUrl = env.APP_URL ?? "http://localhost:3000";
  return `${baseUrl.replace(/\/+$/, "")}/verify-email?token=${token}`;
}

function buildResetUrl(token: string) {
  const baseUrl = env.APP_URL ?? "http://localhost:3000";
  return `${baseUrl.replace(/\/+$/, "")}/reset-password?token=${token}`;
}

async function sendMail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<MailResult> {
  const from = env.RESEND_FROM_EMAIL;
  const client = getResendClient();

  if (!from || !client) {
    console.info("[mail] Skipping transactional email send", { subject, to });
    return { delivered: false, reason: "resend_not_configured" };
  }

  try {
    await client.emails.send({
      from,
      to,
      subject,
      html,
    });
    return { delivered: true };
  } catch (error) {
    console.error("[mail] Failed to send email", { error, subject, to });
    return { delivered: false, reason: "send_failed" };
  }
}

export async function sendVerificationEmail(params: VerificationEmailParams): Promise<MailResult> {
  const verificationUrl = buildVerificationUrl(params.token);
  const html = `
    <p>Merhaba ${params.name},</p>
    <p>FitCrew Focus hesabınızı doğrulamak için aşağıdaki bağlantıya tıklayın:</p>
    <p><a href="${verificationUrl}">${verificationUrl}</a></p>
    <p>Eğer bu isteği siz göndermediyseniz lütfen bu e-postayı dikkate almayın.</p>
  `;

  return sendMail({
    to: params.email,
    subject: "FitCrew Focus hesabınızı doğrulayın",
    html,
  });
}

export async function sendPasswordResetEmail(params: PasswordResetEmailParams): Promise<MailResult> {
  const resetUrl = buildResetUrl(params.resetToken);
  const html = `
    <p>Merhaba ${params.name},</p>
    <p>Şifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın:</p>
    <p><a href="${resetUrl}">${resetUrl}</a></p>
    <p>Eğer bu isteği siz yapmadıysanız lütfen hesabınızı korumak için destekle iletişime geçin.</p>
  `;

  return sendMail({
    to: params.email,
    subject: "FitCrew Focus şifrenizi sıfırlayın",
    html,
  });
}
