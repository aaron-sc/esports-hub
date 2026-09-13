import { NextResponse } from "next/server";
import { SITE_URL } from "@/lib/site-url";
import { SUPPORTED_SCOPES } from "@/lib/oauth/constants";

/**
 * OIDC discovery document — lets a client (Vault) configure its Auth.js OIDC provider with just
 * this hub's base URL and have every other endpoint auto-discovered. Same shape as Formation's
 * identical app/.well-known/openid-configuration/route.ts.
 */
export async function GET() {
  const issuer = SITE_URL;
  return NextResponse.json({
    issuer,
    authorization_endpoint: `${issuer}/oauth/authorize`,
    token_endpoint: `${issuer}/oauth/token`,
    userinfo_endpoint: `${issuer}/oauth/userinfo`,
    jwks_uri: `${issuer}/oauth/jwks`,
    response_types_supported: ["code"],
    subject_types_supported: ["public"],
    id_token_signing_alg_values_supported: ["RS256"],
    scopes_supported: [...SUPPORTED_SCOPES],
    token_endpoint_auth_methods_supported: ["client_secret_post"],
    code_challenge_methods_supported: ["S256"],
    grant_types_supported: ["authorization_code"],
  });
}
