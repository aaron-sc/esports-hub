import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { validateAuthorizeParams } from "@/lib/oauth/validate";
import { issueAuthorizationCode } from "@/lib/oauth/codes";
import { SITE_URL } from "@/lib/site-url";

/**
 * This hub's own OIDC authorization endpoint — the front door of esports-tools.com-as-identity-
 * provider for its sibling apps (Vault today). Same shape as Formation's identical
 * app/oauth/authorize/route.ts, minus the consent screen: every client registered here
 * (lib/oauth/clients.ts) is first-party under one operator, so there's nothing to ask the user to
 * approve — if they have a hub session, a code is issued immediately.
 */
export async function GET(request: NextRequest) {
  const result = validateAuthorizeParams(request.nextUrl.searchParams);
  if (!result.ok) {
    if (!result.redirectable) {
      return NextResponse.json({ error: "invalid_request", error_description: "Unknown client_id or redirect_uri." }, { status: 400 });
    }
    const url = new URL(result.redirectUri);
    url.searchParams.set("error", result.error);
    if (result.state) url.searchParams.set("state", result.state);
    return NextResponse.redirect(url);
  }

  const { client, redirectUri, codeChallenge, scope, state, nonce } = result.request;

  const session = await auth();
  if (!session?.user) {
    const signInUrl = new URL("/login", SITE_URL);
    signInUrl.searchParams.set("redirectTo", request.nextUrl.pathname + request.nextUrl.search);
    return NextResponse.redirect(signInUrl);
  }

  const code = await issueAuthorizationCode({
    sub: session.user.id,
    email: session.user.email ?? "",
    name: session.user.name ?? "",
    picture: session.user.image ?? null,
    clientId: client.clientId,
    redirectUri,
    codeChallenge,
    scope,
    nonce,
  });
  const url = new URL(redirectUri);
  url.searchParams.set("code", code);
  if (state) url.searchParams.set("state", state);
  return NextResponse.redirect(url);
}
