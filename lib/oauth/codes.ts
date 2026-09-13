import "server-only";
import crypto from "node:crypto";
import { EncryptJWT, jwtDecrypt, base64url } from "jose";
import { verifyPkce } from "@/lib/oauth/crypto";
import { AUTH_CODE_TTL_MS } from "@/lib/oauth/constants";
import type { HubOAuthClient } from "@/lib/oauth/clients";

/**
 * Authorization codes as a self-contained encrypted JWT (JWE) rather than a DB row — this app has
 * no database (see auth.ts). Formation's own codes (lib/oauth/service.ts in that repo) are opaque
 * DB pointers where the actual claims never leave the server; these must carry identity inline
 * instead, and since the payload transits the user's own browser as a URL query param (visible in
 * browser history/Referer headers/proxy logs for as long as those are retained, well past this
 * code's 60-second TTL), it's encrypted (A256GCM), not just signed — a stolen/logged code
 * shouldn't leak an email address in plaintext.
 *
 * Single-use enforcement is a module-level in-memory Map of consumed jtis, swept periodically —
 * same in-memory-per-process pattern as lib/rate-limit.ts, for the same reason: this app runs as
 * a single container with no horizontal scaling. This means hub must never run more than one
 * replica at a time (already true of today's deployment) — two replicas could each accept the
 * same code once, since this Map isn't shared between them.
 */

const ALG = "dir";
const ENC = "A256GCM";

function getEncryptionKey(): Uint8Array {
  const raw = process.env.HUB_CODE_ENCRYPTION_KEY;
  if (!raw) throw new Error("HUB_CODE_ENCRYPTION_KEY isn't configured for this deployment.");
  return base64url.decode(raw);
}

export type CodePayload = {
  sub: string;
  email: string;
  name: string;
  picture: string | null;
  clientId: string;
  redirectUri: string;
  codeChallenge: string;
  scope: string;
  nonce: string | null;
};

const consumedJtis = new Map<string, number>(); // jti -> expiresAt, so entries self-clean

let lastSweep = Date.now();
function sweep() {
  const now = Date.now();
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [jti, expiresAt] of consumedJtis) {
    if (expiresAt <= now) consumedJtis.delete(jti);
  }
}

/** Mints a single-use authorization code and returns the raw (encrypted) value to embed in the
 *  redirect URL. */
export async function issueAuthorizationCode(payload: CodePayload): Promise<string> {
  const key = getEncryptionKey();
  return new EncryptJWT({ ...payload })
    .setProtectedHeader({ alg: ALG, enc: ENC })
    .setJti(crypto.randomUUID())
    .setIssuedAt()
    .setExpirationTime(`${AUTH_CODE_TTL_MS / 1000}s`)
    .encrypt(key);
}

export type ConsumeCodeResult =
  | { ok: true; sub: string; email: string; name: string; picture: string | null; scope: string; nonce: string | null }
  | { ok: false; error: "invalid_grant" };

/** Redeems a code at /oauth/token: decrypts it (which also enforces the embedded expiry), checks
 *  it hasn't already been consumed, and that it belongs to this client/redirect_uri/PKCE verifier
 *  — then marks it consumed regardless of whether the rest of validation passes, same rule as
 *  Formation's DB-backed codes (a code that failed validation once must not be retryable). */
export async function consumeAuthorizationCode(params: {
  code: string;
  client: HubOAuthClient;
  redirectUri: string;
  codeVerifier: string;
}): Promise<ConsumeCodeResult> {
  sweep();

  const key = getEncryptionKey();
  let payload: CodePayload;
  let jti: string;
  try {
    const result = await jwtDecrypt(params.code, key);
    if (typeof result.payload.jti !== "string") return { ok: false, error: "invalid_grant" };
    jti = result.payload.jti;
    payload = result.payload as unknown as CodePayload;
  } catch {
    return { ok: false, error: "invalid_grant" };
  }

  if (consumedJtis.has(jti)) return { ok: false, error: "invalid_grant" };
  consumedJtis.set(jti, Date.now() + AUTH_CODE_TTL_MS);

  if (payload.clientId !== params.client.clientId) return { ok: false, error: "invalid_grant" };
  if (payload.redirectUri !== params.redirectUri) return { ok: false, error: "invalid_grant" };
  if (!verifyPkce(params.codeVerifier, payload.codeChallenge)) return { ok: false, error: "invalid_grant" };

  return {
    ok: true,
    sub: payload.sub,
    email: payload.email,
    name: payload.name,
    picture: payload.picture,
    scope: payload.scope,
    nonce: payload.nonce,
  };
}
