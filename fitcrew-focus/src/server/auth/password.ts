import { compare, hash } from "bcryptjs";

const SALT_ROUNDS = 12;

export async function hashPassword(raw: string): Promise<string> {
  return hash(raw, SALT_ROUNDS);
}

export async function verifyPassword(raw: string, hashed: string): Promise<boolean> {
  return compare(raw, hashed);
}
