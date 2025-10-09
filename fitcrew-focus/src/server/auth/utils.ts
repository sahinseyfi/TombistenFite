export function normalizeHandle(handle: string): string {
  const trimmed = handle.trim();
  const withPrefix = trimmed.startsWith("@") ? trimmed : `@${trimmed}`;
  return withPrefix.toLowerCase();
}

export function normalizeEmail(email?: string | null): string | undefined {
  return email ? email.trim().toLowerCase() : undefined;
}

export function normalizePhone(phone?: string | null): string | undefined {
  return phone ? phone.replace(/\s+/g, "") : undefined;
}
