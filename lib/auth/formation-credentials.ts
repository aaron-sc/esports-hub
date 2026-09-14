import "server-only";
import { FORMATION_URL } from "@/lib/site-url";

/**
 * Server-to-server calls to Formation's /api/internal/* routes (see that folder in the Formation
 * repo) — this is how the hub checks a user's email/password/2FA code against Formation's real
 * User table without the browser ever visiting a Formation page. Reaches Formation at the same
 * public hostname everything else uses (FORMATION_URL) — in production this resolves via a Docker
 * network alias straight to Formation's own Caddy, so it never transits Cloudflare and keeps real
 * TLS end to end (see that repo's docker-compose.yml for why); do not point this at a different
 * hostname.
 */

type IdentityFields = { sub: string; email: string; name: string; picture: string | null; emailVerified: boolean };

export type VerifyCredentialsResult =
  | ({ ok: true } & IdentityFields)
  | { ok: false; reason: "invalid_credentials" | "rate_limited" }
  | { ok: false; reason: "totp_required"; pendingToken: string };

export async function verifyFormationCredentials(email: string, password: string): Promise<VerifyCredentialsResult> {
  const res = await fetch(`${FORMATION_URL}/api/internal/verify-credentials`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.INTERNAL_API_SECRET}` },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(`Formation credential check failed (${res.status}).`);
  return res.json();
}

export type VerifyTotpResult = ({ ok: true } & IdentityFields) | { ok: false; reason: string };

export async function verifyFormationTotp(pendingToken: string, code: string): Promise<VerifyTotpResult> {
  const res = await fetch(`${FORMATION_URL}/api/internal/verify-totp`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.INTERNAL_API_SECRET}` },
    body: JSON.stringify({ pendingToken, code }),
  });
  if (!res.ok) throw new Error(`Formation 2FA check failed (${res.status}).`);
  return res.json();
}
