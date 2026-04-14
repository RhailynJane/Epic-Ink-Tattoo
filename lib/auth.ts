import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "epicink_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8;

function getSecret(): Uint8Array {
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "ADMIN_JWT_SECRET is missing or too short (need ≥32 chars). Set it in .env.local and Convex env."
    );
  }
  return new TextEncoder().encode(secret);
}

export async function issueAdminToken(): Promise<string> {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .setIssuer("epicink")
    .setAudience("epicink-admin")
    .sign(getSecret());
}

export async function verifyAdminToken(token: string | undefined | null) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      issuer: "epicink",
      audience: "epicink-admin",
    });
    if (payload.role !== "admin") return null;
    return payload;
  } catch {
    return null;
  }
}

export function timingSafeEqual(a: string, b: string): boolean {
  const aBytes = new TextEncoder().encode(a);
  const bBytes = new TextEncoder().encode(b);
  if (aBytes.length !== bBytes.length) {
    let diff = 1;
    const len = Math.max(aBytes.length, bBytes.length);
    for (let i = 0; i < len; i++) {
      diff |= (aBytes[i] ?? 0) ^ (bBytes[i] ?? 0);
    }
    return false;
  }
  let diff = 0;
  for (let i = 0; i < aBytes.length; i++) {
    diff |= aBytes[i] ^ bBytes[i];
  }
  return diff === 0;
}

export const SESSION_TTL = SESSION_TTL_SECONDS;
