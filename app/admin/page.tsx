import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AppHeader } from "@/components/app-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  getFormationStats,
  getVaultStats,
  type FormationStats,
  type VaultStats,
  type WeeklyBucket,
} from "@/lib/admin/stats";
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

function MoneyTile({ label, cents }: { label: string; cents: number }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-2xl font-semibold tabular-nums">{formatCents(cents)}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function formatCents(cents: number) {
  return (cents / 100).toLocaleString(undefined, { style: "currency", currency: "USD" });
}

/** Plain-div bar chart — the data here (12 weekly buckets) doesn't justify a charting dependency. */
function WeeklyTrend({ label, weeks }: { label: string; weeks: WeeklyBucket[] }) {
  const max = Math.max(1, ...weeks.map((w) => w.count));
  return (
    <div>
      <p className="mb-1.5 text-xs font-medium text-muted-foreground">{label}</p>
      <div className="flex h-16 items-end gap-1">
        {weeks.map((w) => (
          <div key={w.weekStart} className="group relative flex-1">
            <div
              className="w-full rounded-sm bg-primary/70 transition-colors group-hover:bg-primary"
              style={{ height: `${Math.max(4, (w.count / max) * 100)}%` }}
            />
            <div className="pointer-events-none absolute bottom-full left-1/2 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded bg-foreground px-1.5 py-0.5 text-[10px] text-background group-hover:block">
              {w.count} · week of {w.weekStart}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
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
        <WeeklyTrend label="Signups per week" weeks={stats.signupsByWeek} />
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
        <div className="grid grid-cols-3 gap-3">
          <MoneyTile label="Invoiced" cents={stats.financials.totalInvoicedCents} />
          <MoneyTile label="Paid" cents={stats.financials.totalPaidCents} />
          <MoneyTile label="Outstanding" cents={stats.financials.outstandingCents} />
        </div>
        <WeeklyTrend label="Signups per week" weeks={stats.signupsByWeek} />
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
        <div className="mb-8 flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <h1 className="mb-1 text-2xl font-semibold">Admin</h1>
            <p className="text-muted-foreground">Counts and recent activity across the family.</p>
          </div>
          <nav className="flex gap-4 text-sm">
            <Link href="/admin/users" className="underline underline-offset-4 hover:text-foreground">
              Users
            </Link>
            <Link href="/admin/orgs" className="underline underline-offset-4 hover:text-foreground">
              Organizations
            </Link>
          </nav>
        </div>

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
