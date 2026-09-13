import "server-only";
import { findClient, isAllowedRedirectUri, type HubOAuthClient } from "@/lib/oauth/clients";
import { SUPPORTED_SCOPES } from "@/lib/oauth/constants";

export type ValidAuthorizeRequest = {
  client: HubOAuthClient;
  redirectUri: string;
  codeChallenge: string;
  scope: string;
  state: string | null;
  nonce: string | null;
};

export type AuthorizeValidationResult =
  | { ok: true; request: ValidAuthorizeRequest }
  // redirect_uri itself couldn't be trusted — the caller must render an in-app error, never
  // redirect anywhere (that's exactly the open redirect this check exists to prevent).
  | { ok: false; redirectable: false }
  // redirect_uri IS trusted; the caller should send the browser back to it with this OAuth error.
  | { ok: false; redirectable: true; redirectUri: string; state: string | null; error: string };

/**
 * The one place /oauth/authorize's request is validated — same shape as Formation's identical
 * lib/oauth/validate.ts, just synchronous since the client registry here is an in-memory list
 * (lib/oauth/clients.ts), not a database lookup.
 */
export function validateAuthorizeParams(params: URLSearchParams): AuthorizeValidationResult {
  const clientId = params.get("client_id");
  const redirectUri = params.get("redirect_uri");
  if (!clientId || !redirectUri) return { ok: false, redirectable: false };

  const client = findClient(clientId);
  if (!client || !isAllowedRedirectUri(client, redirectUri)) return { ok: false, redirectable: false };

  const state = params.get("state");
  const fail = (error: string): AuthorizeValidationResult => ({ ok: false, redirectable: true, redirectUri, state, error });

  if (params.get("response_type") !== "code") return fail("unsupported_response_type");

  const codeChallenge = params.get("code_challenge");
  if (!codeChallenge || params.get("code_challenge_method") !== "S256") return fail("invalid_request");

  const requestedScopes = (params.get("scope") ?? "").split(" ").filter(Boolean);
  if (
    requestedScopes.length === 0 ||
    !requestedScopes.includes("openid") ||
    requestedScopes.some((s) => !(SUPPORTED_SCOPES as readonly string[]).includes(s))
  ) {
    return fail("invalid_scope");
  }

  return {
    ok: true,
    request: { client, redirectUri, codeChallenge, scope: requestedScopes.join(" "), state, nonce: params.get("nonce") },
  };
}
