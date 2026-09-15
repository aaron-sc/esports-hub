import "server-only";
import { FORMATION_URL, VAULT_URL } from "@/lib/site-url";

/** The full (searchable, paginated) user list behind /admin/users — see lib/admin/stats.ts for
 *  the same fetch-with-try/catch, fail-soft pattern this mirrors. */

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  emailVerifiedAt: string | null;
};

export type FormationAdminUser = AdminUser & { totpEnabledAt: string | null };
export type VaultAdminUser = AdminUser & { ssoSub: string | null };

export type UserListResult<T> = { users: T[]; nextCursor: string | null } | null;

async function fetchUsers<T>(baseUrl: string, q: string, cursor: string | null): Promise<UserListResult<T>> {
  try {
    const url = new URL(`${baseUrl}/api/internal/admin-users`);
    if (q) url.searchParams.set("q", q);
    if (cursor) url.searchParams.set("cursor", cursor);
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${process.env.INTERNAL_API_SECRET}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as UserListResult<T>;
  } catch {
    return null;
  }
}

export function getFormationUsers(q: string, cursor: string | null): Promise<UserListResult<FormationAdminUser>> {
  return fetchUsers<FormationAdminUser>(FORMATION_URL, q, cursor);
}

export function getVaultUsers(q: string, cursor: string | null): Promise<UserListResult<VaultAdminUser>> {
  return fetchUsers<VaultAdminUser>(VAULT_URL, q, cursor);
}
