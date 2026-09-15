import "server-only";
import { FORMATION_URL, VAULT_URL } from "@/lib/site-url";

/**
 * Server-to-server calls to Formation's and Vault's /api/internal/admin-stats — the same
 * INTERNAL_API_SECRET already used for the credential checks in lib/auth/formation-credentials.ts.
 * Each returns null on any failure (network error, non-200, malformed body) rather than throwing —
 * one product being down or misconfigured must not take the whole admin console with it, just
 * show that card as unavailable (see app/admin/page.tsx).
 */

export type FormationStats = {
  counts: { organizations: number; users: number; teams: number };
  recentSignups: { name: string; email: string; createdAt: string }[];
  recentLogins: { name: string; createdAt: string }[];
};

export type VaultStats = {
  counts: { organizations: number; users: number; sponsors: number; contracts: number; invoices: number };
  recentSignups: { name: string; email: string; createdAt: string }[];
};

async function fetchStats<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${process.env.INTERNAL_API_SECRET}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export function getFormationStats(): Promise<FormationStats | null> {
  return fetchStats<FormationStats>(`${FORMATION_URL}/api/internal/admin-stats`);
}

export function getVaultStats(): Promise<VaultStats | null> {
  return fetchStats<VaultStats>(`${VAULT_URL}/api/internal/admin-stats`);
}
