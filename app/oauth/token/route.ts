import { NextRequest, NextResponse } from "next/server";
import { findClient, verifyClientSecret } from "@/lib/oauth/clients";
import { consumeAuthorizationCode } from "@/lib/oauth/codes";
import { signIdToken, signAccessToken } from "@/lib/oauth/tokens";
import { ACCESS_TOKEN_TTL_SECONDS } from "@/lib/oauth/constants";
import { SITE_URL } from "@/lib/site-url";
import { checkRateLimit } from "@/lib/rate-limit";

/**
 * This hub's own OIDC token endpoint — same shape as Formation's identical app/oauth/token/
 * route.ts. Never touched by the user's browser: the client's own backend calls this directly
 * with the code it just received at /oauth/authorize.
 */
export async function POST(request: NextRequest) {
  const allowed = await checkRateLimit("oauth_token", 30, 5 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json({ error: "invalid_request", error_description: "Too many requests." }, { status: 429 });
  }

  const form = await request.formData();
  const grantType = form.get("grant_type");
  const code = form.get("code");
  const redirectUri = form.get("redirect_uri");
  const clientId = form.get("client_id");
  const clientSecret = form.get("client_secret");
  const codeVerifier = form.get("code_verifier");

  if (grantType !== "authorization_code") {
    return NextResponse.json({ error: "unsupported_grant_type" }, { status: 400 });
  }
  if (
    typeof code !== "string" ||
    typeof redirectUri !== "string" ||
    typeof clientId !== "string" ||
    typeof clientSecret !== "string" ||
    typeof codeVerifier !== "string"
  ) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const client = findClient(clientId);
  if (!client || !verifyClientSecret(client, clientSecret)) {
    return NextResponse.json({ error: "invalid_client" }, { status: 401 });
  }

  const consumed = await consumeAuthorizationCode({ code, client, redirectUri, codeVerifier });
  if (!consumed.ok) {
    return NextResponse.json({ error: consumed.error }, { status: 400 });
  }

  const claims = {
    sub: consumed.sub,
    // Formation only ever hands this hub an identity after its own login has succeeded — email
    // verification on that account is enforced there (requireVerifiedEmailPage), not re-checked
    // here, since this hub has no way to re-verify it independently (no DB of its own).
    emailVerified: true,
    email: consumed.email,
    name: consumed.name,
    picture: consumed.picture,
  };

  const [idToken, accessToken] = await Promise.all([
    signIdToken({ issuer: SITE_URL, audience: client.clientId, claims, nonce: consumed.nonce }),
    signAccessToken({ issuer: SITE_URL, audience: client.clientId, scope: consumed.scope, claims }),
  ]);

  return NextResponse.json(
    {
      access_token: accessToken,
      token_type: "Bearer",
      expires_in: ACCESS_TOKEN_TTL_SECONDS,
      id_token: idToken,
      scope: consumed.scope,
    },
    { headers: { "Cache-Control": "no-store", Pragma: "no-cache" } },
  );
}
