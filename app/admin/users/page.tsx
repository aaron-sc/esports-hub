import type { Metadata } from "next";
import { auth } from "@/auth";
import { AppHeader } from "@/components/app-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import {
  getFormationUsers,
  getVaultUsers,
  type FormationAdminUser,
  type VaultAdminUser,
} from "@/lib/admin/users";

export const metadata: Metadata = { title: "Admin — Users" };

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function UserTable<T extends { id: string; name: string; email: string; createdAt: string; emailVerifiedAt: string | null }>({
  title,
  result,
  q,
  cursorParam,
  extraColumn,
}: {
  title: string;
  result: { users: T[]; nextCursor: string | null } | null;
  q: string;
  cursorParam: string;
  extraColumn: (u: T) => React.ReactNode;
}) {
  if (!result) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Couldn&apos;t reach {title}&apos;s admin API.</p>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {title} <span className="font-normal text-muted-foreground">({result.users.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                <th className="pb-2 font-medium">Name</th>
                <th className="pb-2 font-medium">Email</th>
                <th className="pb-2 font-medium">Joined</th>
                <th className="pb-2 font-medium">Verified</th>
                <th className="pb-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {result.users.map((u) => (
                <tr key={u.id} className="border-b last:border-0">
                  <td className="py-2 pr-2">{u.name}</td>
                  <td className="py-2 pr-2 text-muted-foreground">{u.email}</td>
                  <td className="py-2 pr-2 whitespace-nowrap text-muted-foreground">{formatDate(u.createdAt)}</td>
                  <td className="py-2 pr-2">{u.emailVerifiedAt ? "Yes" : "No"}</td>
                  <td className="py-2">{extraColumn(u)}</td>
                </tr>
              ))}
              {result.users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-muted-foreground">
                    No matches.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        {result.nextCursor ? (
          <div className="mt-3">
            <Button variant="outline" size="sm" asChild>
              <a href={`/admin/users?q=${encodeURIComponent(q)}&${cursorParam}=${result.nextCursor}`}>Load more</a>
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; fCursor?: string; vCursor?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login?redirectTo=/admin/users");

  const { q = "", fCursor = null, vCursor = null } = await searchParams;

  const [formationResult, vaultResult] = await Promise.all([
    getFormationUsers(q, fCursor),
    getVaultUsers(q, vCursor),
  ]);

  return (
    <div className="flex flex-1 flex-col">
      <AppHeader user={session.user} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        <h1 className="mb-1 text-2xl font-semibold">Users</h1>
        <p className="mb-6 text-muted-foreground">Search by name or email across both products.</p>

        <form action="/admin/users" method="get" className="mb-6 flex gap-2">
          <Input name="q" defaultValue={q} placeholder="Search name or email…" className="max-w-sm" />
          <Button type="submit">Search</Button>
        </form>

        <div className="grid gap-6">
          <UserTable<FormationAdminUser>
            title="Formation"
            result={formationResult}
            q={q}
            cursorParam="fCursor"
            extraColumn={(u) => (u.totpEnabledAt ? "2FA" : "")}
          />
          <UserTable<VaultAdminUser>
            title="Vault"
            result={vaultResult}
            q={q}
            cursorParam="vCursor"
            extraColumn={(u) => (u.ssoSub ? "SSO" : "")}
          />
        </div>
      </main>
    </div>
  );
}
