import "server-only";
import crypto from "node:crypto";

/**
 * Same as Formation's identical lib/oauth/crypto.ts — client secrets are high-entropy random
 * values, not human passwords, so a fast collision-resistant hash (not bcrypt) is the standard
 * approach here.
 */
export function hashSecret(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

/** Constant-time comparison of two hex-encoded hashes — never use `===` on secret material. */
export function hashesMatch(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "hex");
  const bufB = Buffer.from(b, "hex");
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/** A random URL-safe token for authorization-code jtis. */
export function randomToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString("base64url");
}

/** PKCE (RFC 7636) S256 check: does `verifier`, once hashed, match the `challenge` presented at
 *  /oauth/authorize? Both sides are already base64url text, so this compares them as buffers via
 *  the same constant-time path as hashesMatch rather than a plain string `===`. */
export function verifyPkce(verifier: string, challenge: string): boolean {
  const computed = crypto.createHash("sha256").update(verifier).digest("base64url");
  const bufA = Buffer.from(computed);
  const bufB = Buffer.from(challenge);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}
