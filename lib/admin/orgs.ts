import "server-only";
import { FORMATION_URL, VAULT_URL } from "@/lib/site-url";

/** The full (searchable, paginated) org list behind /admin/orgs — same fetch-with-try/catch,
 *  fail-soft pattern as lib/admin/stats.ts. */

export type AdminOrg = {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  memberCount: number;
};

export type OrgListResult = { orgs: AdminOrg[]; nextCursor: string | null } | null;

async function fetchOrgs(baseUrl: string, q: string, cursor: string | null): Promise<OrgListResult> {
  try {
    const url = new URL(`${baseUrl}/api/internal/admin-orgs`);
    if (q) url.searchParams.set("q", q);
    if (cursor) url.searchParams.set("cursor", cursor);
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${process.env.INTERNAL_API_SECRET}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as OrgListResult;
  } catch {
    return null;
  }
}

export function getFormationOrgs(q: string, cursor: string | null): Promise<OrgListResult> {
  return fetchOrgs(FORMATION_URL, q, cursor);
}

export function getVaultOrgs(q: string, cursor: string | null): Promise<OrgListResult> {
  return fetchOrgs(VAULT_URL, q, cursor);
}
