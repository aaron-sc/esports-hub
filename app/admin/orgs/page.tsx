import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AppHeader } from "@/components/app-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getFormationOrgs, getVaultOrgs, type AdminOrg, type OrgListResult } from "@/lib/admin/orgs";

export const metadata: Metadata = { title: "Admin — Organizations" };

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function OrgTable({
  title,
  result,
  q,
  cursorParam,
}: {
  title: string;
  result: OrgListResult;
  q: string;
  cursorParam: string;
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
          {title} <span className="font-normal text-muted-foreground">({result.orgs.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                <th className="pb-2 font-medium">Name</th>
                <th className="pb-2 font-medium">Slug</th>
                <th className="pb-2 font-medium">Members</th>
                <th className="pb-2 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {result.orgs.map((o: AdminOrg) => (
                <tr key={o.id} className="border-b last:border-0">
                  <td className="py-2 pr-2">{o.name}</td>
                  <td className="py-2 pr-2 text-muted-foreground">{o.slug}</td>
                  <td className="py-2 pr-2">{o.memberCount}</td>
                  <td className="py-2 pr-2 whitespace-nowrap text-muted-foreground">{formatDate(o.createdAt)}</td>
                </tr>
              ))}
              {result.orgs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-muted-foreground">
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
              <a href={`/admin/orgs?q=${encodeURIComponent(q)}&${cursorParam}=${result.nextCursor}`}>Load more</a>
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

export default async function AdminOrgsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; fCursor?: string; vCursor?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login?redirectTo=/admin/orgs");

  const { q = "", fCursor = null, vCursor = null } = await searchParams;

  const [formationResult, vaultResult] = await Promise.all([
    getFormationOrgs(q, fCursor),
    getVaultOrgs(q, vCursor),
  ]);

  return (
    <div className="flex flex-1 flex-col">
      <AppHeader user={session.user} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        <h1 className="mb-1 text-2xl font-semibold">Organizations</h1>
        <p className="mb-6 text-muted-foreground">Search by name or slug across both products.</p>

        <form action="/admin/orgs" method="get" className="mb-6 flex gap-2">
          <Input name="q" defaultValue={q} placeholder="Search name or slug…" className="max-w-sm" />
          <Button type="submit">Search</Button>
        </form>

        <div className="grid gap-6">
          <OrgTable title="Formation" result={formationResult} q={q} cursorParam="fCursor" />
          <OrgTable title="Vault" result={vaultResult} q={q} cursorParam="vCursor" />
        </div>
      </main>
    </div>
  );
}
