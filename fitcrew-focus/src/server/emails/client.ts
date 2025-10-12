import { Resend } from "resend";
import { env } from "@/env";

let client: Resend | null;

export function getResendClient(): Resend | null {
  if (!env.RESEND_API_KEY) {
    return null;
  }

  if (!client) {
    client = new Resend(env.RESEND_API_KEY);
  }

  return client;
}

export function __resetResendClientForTests() {
  client = null;
}
