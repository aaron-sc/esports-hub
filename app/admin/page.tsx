import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AppHeader } from "@/components/app-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getFormationStats, getVaultStats, type FormationStats, type VaultStats } from "@/lib/admin/stats";
import { listClients } from "@/lib/oauth/clients";

export const metadata: Metadata = { title: "Admin" };

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-2xl font-semibold tabular-nums">{value.toLocaleString()}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function FormationCard({ stats }: { stats: FormationStats | null }) {
  if (!stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Formation</CardTitle>
          <CardDescription>Couldn&apos;t reach Formation&apos;s admin API.</CardDescription>
        </CardHeader>
      </Card>
    );
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Formation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <StatTile label="Organizations" value={stats.counts.organizations} />
          <StatTile label="Users" value={stats.counts.users} />
          <StatTile label="Teams" value={stats.counts.teams} />
        </div>
        <div>
          <p className="mb-1.5 text-xs font-medium text-muted-foreground">Recent signups</p>
          <ul className="space-y-1 text-sm">
            {stats.recentSignups.map((u) => (
              <li key={u.email} className="flex items-center justify-between gap-2">
                <span className="truncate">{u.name}</span>
                <span className="shrink-0 text-xs text-muted-foreground">{formatDate(u.createdAt)}</span>
              </li>
            ))}
            {stats.recentSignups.length === 0 ? <li className="text-muted-foreground">None yet.</li> : null}
          </ul>
        </div>
        <div>
          <p className="mb-1.5 text-xs font-medium text-muted-foreground">Recent sign-ins</p>
          <ul className="space-y-1 text-sm">
            {stats.recentLogins.map((l, i) => (
              <li key={i} className="flex items-center justify-between gap-2">
                <span className="truncate">{l.name}</span>
                <span className="shrink-0 text-xs text-muted-foreground">{formatDate(l.createdAt)}</span>
              </li>
            ))}
            {stats.recentLogins.length === 0 ? <li className="text-muted-foreground">None yet.</li> : null}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

function VaultCard({ stats }: { stats: VaultStats | null }) {
  if (!stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vault</CardTitle>
          <CardDescription>Couldn&apos;t reach Vault&apos;s admin API.</CardDescription>
        </CardHeader>
      </Card>
    );
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Vault</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <StatTile label="Organizations" value={stats.counts.organizations} />
          <StatTile label="Users" value={stats.counts.users} />
          <StatTile label="Sponsors" value={stats.counts.sponsors} />
          <StatTile label="Contracts" value={stats.counts.contracts} />
          <StatTile label="Invoices" value={stats.counts.invoices} />
        </div>
        <div>
          <p className="mb-1.5 text-xs font-medium text-muted-foreground">Recent signups</p>
          <ul className="space-y-1 text-sm">
            {stats.recentSignups.map((u) => (
              <li key={u.email} className="flex items-center justify-between gap-2">
                <span className="truncate">{u.name}</span>
                <span className="shrink-0 text-xs text-muted-foreground">{formatDate(u.createdAt)}</span>
              </li>
            ))}
            {stats.recentSignups.length === 0 ? <li className="text-muted-foreground">None yet.</li> : null}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function AdminPage() {
  const session = await auth();
  // AdminLayout already gates this — reached only with a valid admin session — but that check
  // lives in a separate component, so TypeScript can't narrow across the boundary.
  if (!session?.user) redirect("/login?redirectTo=/admin");
  const [formationStats, vaultStats] = await Promise.all([getFormationStats(), getVaultStats()]);
  const clients = listClients();

  return (
    <div className="flex flex-1 flex-col">
      <AppHeader user={session.user} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        <h1 className="mb-1 text-2xl font-semibold">Admin</h1>
        <p className="mb-8 text-muted-foreground">Counts and recent activity across the family.</p>

        <div className="grid gap-6 md:grid-cols-2">
          <FormationCard stats={formationStats} />
          <VaultCard stats={vaultStats} />
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Hub / SSO</CardTitle>
            <CardDescription>This app has no database of its own — just the registered OIDC clients.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1 text-sm">
              {clients.map((c) => (
                <li key={c.clientId} className="flex items-center justify-between gap-2">
                  <span>{c.name}</span>
                  <span className="text-xs text-muted-foreground">{c.clientId}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
