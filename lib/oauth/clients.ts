import "server-only";
import { hashSecret, hashesMatch } from "@/lib/oauth/crypto";

/**
 * OAuth clients allowed to obtain identities from this hub, defined via a single env var instead
 * of a database table — this app deliberately has no database (see auth.ts), and the handful of
 * clients here (Vault today, maybe Formation itself later) don't change often enough to need one.
 * HUB_OAUTH_CLIENTS is a JSON array: [{clientId, clientSecretHash, name, redirectUris}].
 * clientSecretHash is sha256(secret) hex (see lib/oauth/crypto.ts's hashSecret) — never the raw
 * secret itself.
 */
export type HubOAuthClient = {
  clientId: string;
  clientSecretHash: string;
  name: string;
  redirectUris: string[];
};

let cachedClients: HubOAuthClient[] | null = null;

function loadClients(): HubOAuthClient[] {
  if (cachedClients) return cachedClients;
  const raw = process.env.HUB_OAUTH_CLIENTS;
  if (!raw) {
    throw new Error("HUB_OAUTH_CLIENTS isn't configured for this deployment.");
  }
  cachedClients = JSON.parse(raw) as HubOAuthClient[];
  return cachedClients;
}

export function findClient(clientId: string): HubOAuthClient | null {
  return loadClients().find((c) => c.clientId === clientId) ?? null;
}

/** Every redirect_uri this client is allowed to send users back to — checked as an exact string
 *  match, never a prefix/pattern match, same reasoning as Formation's identical
 *  lib/oauth/clients.ts (a prefix match would let an attacker register a lookalike subdomain or
 *  ride an open redirect elsewhere on the real client's own domain). */
export function isAllowedRedirectUri(client: HubOAuthClient, redirectUri: string): boolean {
  return client.redirectUris.includes(redirectUri);
}

export function verifyClientSecret(client: HubOAuthClient, secret: string): boolean {
  return hashesMatch(client.clientSecretHash, hashSecret(secret));
}
