import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/oauth/tokens";
import { SITE_URL } from "@/lib/site-url";

/**
 * This hub's own OIDC userinfo endpoint. Formation's identical app/oauth/userinfo/route.ts
 * re-fetches live profile data from its database by `sub` on every call; this hub has no
 * database (see auth.ts), so its access token itself carries the same profile snapshot as its
 * id_token (see lib/oauth/tokens.ts) and this just decodes that back out — consistent with this
 * app's existing "pure JWT, nothing persisted server-side" session philosophy. A stale name/
 * avatar here clears up the next time the user does a full sign-in (at most every 2 hours, this
 * hub's own session maxAge).
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : null;
  if (!token) {
    return NextResponse.json({ error: "invalid_token" }, { status: 401, headers: { "WWW-Authenticate": "Bearer" } });
  }

  let claims;
  try {
    ({ claims } = await verifyAccessToken(token, SITE_URL));
  } catch {
    return NextResponse.json({ error: "invalid_token" }, { status: 401, headers: { "WWW-Authenticate": "Bearer" } });
  }

  return NextResponse.json({
    sub: claims.sub,
    email: claims.email,
    email_verified: claims.emailVerified,
    name: claims.name,
    picture: claims.picture,
  });
}
