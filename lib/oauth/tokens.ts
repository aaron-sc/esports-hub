import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { getPrivateKey, getPublicKey, getKeyId } from "@/lib/oauth/keys";
import { ACCESS_TOKEN_TTL_SECONDS } from "@/lib/oauth/constants";

export type IdentityClaims = {
  sub: string;
  email: string;
  emailVerified: boolean;
  name: string;
  picture: string | null;
};

/** Signs the OIDC id_token returned from /oauth/token — same shape as Formation's identical
 *  lib/oauth/tokens.ts, just signed with this hub's own keypair. `nonce` is only present for a
 *  genuine OIDC request; per spec it must be echoed back exactly as the client sent it. */
export async function signIdToken(params: {
  issuer: string;
  audience: string;
  claims: IdentityClaims;
  nonce?: string | null;
}): Promise<string> {
  const key = await getPrivateKey();
  return new SignJWT({
    email: params.claims.email,
    email_verified: params.claims.emailVerified,
    name: params.claims.name,
    picture: params.claims.picture ?? undefined,
    ...(params.nonce ? { nonce: params.nonce } : {}),
  })
    .setProtectedHeader({ alg: "RS256", kid: getKeyId() })
    .setSubject(params.claims.sub)
    .setIssuer(params.issuer)
    .setAudience(params.audience)
    .setIssuedAt()
    .setExpirationTime(`${ACCESS_TOKEN_TTL_SECONDS}s`)
    .sign(key);
}

/**
 * The bearer token a client presents to /oauth/userinfo. Formation's identical access token is
 * deliberately minimal (just `scope`) because its userinfo route re-fetches live profile data
 * from its own database by `sub`. This hub has no database (see auth.ts) — there's nothing to
 * re-fetch from — so its access token carries the same profile snapshot as its id_token instead,
 * and userinfo just decodes it back out. Same "no live refresh, snapshot from sign-in time" trade-
 * off as this hub's own session already makes.
 */
export async function signAccessToken(params: {
  issuer: string;
  audience: string;
  scope: string;
  claims: IdentityClaims;
}): Promise<string> {
  const key = await getPrivateKey();
  return new SignJWT({
    scope: params.scope,
    email: params.claims.email,
    email_verified: params.claims.emailVerified,
    name: params.claims.name,
    picture: params.claims.picture ?? undefined,
  })
    .setProtectedHeader({ alg: "RS256", kid: getKeyId() })
    .setSubject(params.claims.sub)
    .setIssuer(params.issuer)
    .setAudience(params.audience)
    .setIssuedAt()
    .setExpirationTime(`${ACCESS_TOKEN_TTL_SECONDS}s`)
    .sign(key);
}

export type VerifiedAccessToken = { sub: string; scope: string; claims: IdentityClaims };

export async function verifyAccessToken(token: string, issuer: string): Promise<VerifiedAccessToken> {
  const key = await getPublicKey();
  const { payload } = await jwtVerify(token, key, { issuer, algorithms: ["RS256"] });
  if (typeof payload.sub !== "string") throw new Error("Access token missing subject.");
  return {
    sub: payload.sub,
    scope: typeof payload.scope === "string" ? payload.scope : "",
    claims: {
      sub: payload.sub,
      email: typeof payload.email === "string" ? payload.email : "",
      emailVerified: payload.email_verified === true,
      name: typeof payload.name === "string" ? payload.name : "",
      picture: typeof payload.picture === "string" ? payload.picture : null,
    },
  };
}
