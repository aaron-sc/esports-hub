import "server-only";
import crypto from "node:crypto";

const TTL_MS = 60 * 1000; // bridges loginAction -> the Credentials provider's authorize() within
// the same server-side request (Auth.js's signIn() calls Auth() in-process, never a real network
// round trip for this) — generous, not tight.

/**
 * A short-lived, HMAC-signed "Formation already checked this password/2FA code out" token —
 * mirrors the shape of Formation's own lib/auth/pending-2fa.ts, but carries a full identity
 * instead of just a userId, since the hub has no database to re-fetch profile data from. Never
 * touches the network or the browser: lib/actions/auth.ts's loginAction/verifyTwoFactorAction
 * create it right after a successful server-to-server check against Formation
 * (lib/auth/formation-credentials.ts), then immediately hand it to signIn("credentials", ...),
 * whose authorize() below is the only thing that ever verifies it.
 */
export type LoginProofPayload = { sub: string; email: string; name: string; picture: string | null };

export function createLoginProofToken(payload: LoginProofPayload): string {
  const data = JSON.stringify({ typ: "login-proof", ...payload, exp: Date.now() + TTL_MS });
  const dataB64 = Buffer.from(data, "utf8").toString("base64url");
  return `${dataB64}.${sign(dataB64)}`;
}

export function verifyLoginProofToken(token: string): LoginProofPayload | null {
  const [dataB64, sig] = token.split(".");
  if (!dataB64 || !sig) return null;
  if (!signaturesMatch(sign(dataB64), sig)) return null;

  try {
    const parsed = JSON.parse(Buffer.from(dataB64, "base64url").toString("utf8"));
    if (
      parsed.typ !== "login-proof" ||
      typeof parsed.sub !== "string" ||
      typeof parsed.email !== "string" ||
      typeof parsed.name !== "string" ||
      typeof parsed.exp !== "number" ||
      parsed.exp < Date.now()
    ) {
      return null;
    }
    return { sub: parsed.sub, email: parsed.email, name: parsed.name, picture: parsed.picture ?? null };
  } catch {
    return null;
  }
}

function sign(dataB64: string): string {
  const secret = process.env.AUTH_SECRET ?? "";
  return crypto.createHmac("sha256", secret).update(dataB64).digest("base64url");
}

function signaturesMatch(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}
