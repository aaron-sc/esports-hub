/** Single-use authorization codes live for 60 seconds — same rationale as Formation's identical
 *  constant: just long enough for the client's redirect + token exchange, short enough that a
 *  leaked code (browser history, a referrer header, a proxy log) is worthless almost immediately. */
export const AUTH_CODE_TTL_MS = 60_000;

/** Access tokens (used only against /oauth/userinfo) are short-lived by design — no refresh
 *  tokens, a client re-authenticates via a fresh /oauth/authorize round trip instead. */
export const ACCESS_TOKEN_TTL_SECONDS = 10 * 60;

export const SUPPORTED_SCOPES = ["openid", "profile", "email"] as const;
export type OAuthScope = (typeof SUPPORTED_SCOPES)[number];
